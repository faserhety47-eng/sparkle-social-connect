
-- 1) Catalog table
CREATE TABLE IF NOT EXISTS public.smm_services (
  id bigint PRIMARY KEY,                       -- service_id из API
  platform text NOT NULL,                      -- код нашей платформы (max, vk, telegram, ok, instagram, rutube, youtube, tiktok)
  api_platform text NOT NULL,                  -- исходный ключ платформы в API
  category text NOT NULL,                      -- ключ категории в API
  name text NOT NULL,
  description text,
  price_api numeric(12,4) NOT NULL,            -- цена API за единицу
  price_rub numeric(12,4) NOT NULL,            -- цена клиенту = price_api + 0.50
  min_qty integer NOT NULL DEFAULT 10,
  max_qty integer NOT NULL DEFAULT 1000000,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.smm_services TO anon, authenticated;
GRANT ALL ON public.smm_services TO service_role;

ALTER TABLE public.smm_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smm_services public read active"
  ON public.smm_services FOR SELECT
  USING (active = true);

CREATE POLICY "smm_services admin all"
  ON public.smm_services FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS smm_services_platform_idx ON public.smm_services (platform, active);
CREATE INDEX IF NOT EXISTS smm_services_category_idx ON public.smm_services (platform, category, active);

CREATE TRIGGER smm_services_updated_at BEFORE UPDATE ON public.smm_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) Orders extension
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS external_service_id bigint,
  ADD COLUMN IF NOT EXISTS external_order_id bigint,
  ADD COLUMN IF NOT EXISTS external_status text,
  ADD COLUMN IF NOT EXISTS refunded boolean NOT NULL DEFAULT false;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status = ANY (ARRAY[
    'awaiting_payment','payment_reported','paid','processing',
    'in_progress','partial','completed','cancelled','refunded','error'
  ]));

-- 3) Charge and create SMM order (only signed-in users)
CREATE OR REPLACE FUNCTION public.charge_and_create_smm_order(
  _service_id bigint,
  _link text,
  _quantity integer
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  svc public.smm_services;
  total numeric(12,2);
  uid uuid := auth.uid();
  cur_balance numeric;
  new_order_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  SELECT * INTO svc FROM public.smm_services WHERE id = _service_id AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'service not found';
  END IF;

  IF _quantity < svc.min_qty OR _quantity > svc.max_qty THEN
    RAISE EXCEPTION 'quantity out of range (% .. %)', svc.min_qty, svc.max_qty;
  END IF;

  IF _link IS NULL OR length(trim(_link)) < 4 THEN
    RAISE EXCEPTION 'invalid link';
  END IF;

  total := round(svc.price_rub * _quantity, 2);

  SELECT balance_rub INTO cur_balance FROM public.profiles WHERE id = uid FOR UPDATE;
  IF cur_balance IS NULL THEN
    RAISE EXCEPTION 'profile not found';
  END IF;
  IF cur_balance < total THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  UPDATE public.profiles SET balance_rub = balance_rub - total WHERE id = uid;

  INSERT INTO public.orders (
    user_id, platform, service_type, link, quantity, price_rub,
    status, external_service_id
  ) VALUES (
    uid, svc.platform, svc.category, _link, _quantity, total,
    'processing', svc.id
  ) RETURNING id INTO new_order_id;

  INSERT INTO public.balance_transactions (user_id, amount_rub, kind, note, order_id, created_by)
  VALUES (uid, -total, 'spend', 'Оплата заказа smm.media', new_order_id, uid);

  RETURN new_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.charge_and_create_smm_order(bigint, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.charge_and_create_smm_order(bigint, text, integer) TO authenticated;

-- 4) Refund helper (server-only)
CREATE OR REPLACE FUNCTION public.refund_smm_order(_order_id uuid, _reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o public.orders;
BEGIN
  SELECT * INTO o FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;
  IF o.refunded THEN RETURN; END IF;
  IF o.user_id IS NOT NULL THEN
    UPDATE public.profiles SET balance_rub = balance_rub + o.price_rub WHERE id = o.user_id;
    INSERT INTO public.balance_transactions (user_id, amount_rub, kind, note, order_id, created_by)
    VALUES (o.user_id, o.price_rub, 'refund', COALESCE(_reason,'Возврат по заказу'), o.id, o.user_id);
  END IF;
  UPDATE public.orders
    SET status = 'refunded', refunded = true, payment_note = COALESCE(_reason, payment_note)
    WHERE id = o.id;
END;
$$;

REVOKE ALL ON FUNCTION public.refund_smm_order(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.refund_smm_order(uuid, text) TO service_role;

-- 5) Admin upsert helper (server-only via admin client)
CREATE OR REPLACE FUNCTION public.admin_upsert_smm_service(
  _id bigint, _platform text, _api_platform text, _category text,
  _name text, _description text, _price_api numeric, _price_rub numeric,
  _min integer, _max integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.smm_services AS s
    (id, platform, api_platform, category, name, description, price_api, price_rub, min_qty, max_qty, active)
  VALUES
    (_id, _platform, _api_platform, _category, _name, _description, _price_api, _price_rub, _min, _max, true)
  ON CONFLICT (id) DO UPDATE SET
    platform = EXCLUDED.platform,
    api_platform = EXCLUDED.api_platform,
    category = EXCLUDED.category,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_api = EXCLUDED.price_api,
    price_rub = EXCLUDED.price_rub,
    min_qty = EXCLUDED.min_qty,
    max_qty = EXCLUDED.max_qty,
    active = true,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_smm_service(bigint,text,text,text,text,text,numeric,numeric,integer,integer) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_upsert_smm_service(bigint,text,text,text,text,text,numeric,numeric,integer,integer) TO service_role;
