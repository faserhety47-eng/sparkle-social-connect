
-- promo codes
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read promo" ON public.promo_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage promo" ON public.promo_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER promo_codes_updated BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- promo redemptions
CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid,
  discount_rub numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin read redemptions" ON public.promo_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own redemption" ON public.promo_redemptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- admin actions log
CREATE TABLE public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_actions TO authenticated;
GRANT ALL ON public.admin_actions TO service_role;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read actions" ON public.admin_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert actions" ON public.admin_actions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') AND admin_id = auth.uid());

-- site settings (key/value)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admin manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- extend admin_topup_balance to log
CREATE OR REPLACE FUNCTION public.admin_topup_balance(_user_id uuid, _amount numeric, _note text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _amount IS NULL OR _amount = 0 THEN
    RAISE EXCEPTION 'amount required';
  END IF;

  UPDATE public.profiles SET balance_rub = balance_rub + _amount WHERE id = _user_id;

  INSERT INTO public.balance_transactions (user_id, amount_rub, kind, note, created_by)
  VALUES (_user_id, _amount,
    CASE WHEN _amount >= 0 THEN 'topup' ELSE 'adjust' END, _note, auth.uid());

  INSERT INTO public.admin_actions (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'balance_topup', 'user', _user_id::text,
    jsonb_build_object('amount', _amount, 'note', _note));
END;
$function$;

-- redeem promo (atomic)
CREATE OR REPLACE FUNCTION public.redeem_promo(_code text, _order_price numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  p public.promo_codes;
  discount numeric;
BEGIN
  SELECT * INTO p FROM public.promo_codes WHERE lower(code) = lower(_code) AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'promo not found'; END IF;
  IF p.expires_at IS NOT NULL AND p.expires_at < now() THEN RAISE EXCEPTION 'promo expired'; END IF;
  IF p.max_uses IS NOT NULL AND p.uses >= p.max_uses THEN RAISE EXCEPTION 'promo limit reached'; END IF;

  IF p.discount_type = 'percent' THEN
    discount := round(_order_price * p.discount_value / 100.0);
  ELSE
    discount := p.discount_value;
  END IF;
  IF discount > _order_price THEN discount := _order_price; END IF;

  RETURN jsonb_build_object('id', p.id, 'code', p.code, 'discount', discount);
END;
$$;
