ALTER TABLE public.topup_payments
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'topup';

CREATE OR REPLACE FUNCTION public.create_account_yookassa_topup(_amount numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_topup_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _amount IS NULL OR _amount < 100 OR _amount > 300000 THEN
    RAISE EXCEPTION 'invalid amount';
  END IF;

  INSERT INTO public.topup_payments (user_id, amount_rub, status, kind)
  VALUES (uid, round(_amount, 2), 'pending', 'topup')
  RETURNING id INTO new_topup_id;

  RETURN new_topup_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_account_yookassa_topup(numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.create_account_yookassa_topup(numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_guest_yookassa_payment(
  _service_id bigint,
  _link text,
  _quantity integer,
  _email text,
  _contact text
) RETURNS TABLE(order_id uuid, guest_token uuid, amount numeric, topup_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  svc public.smm_services;
  total numeric(12,2);
  new_order_id uuid;
  new_guest_token uuid := gen_random_uuid();
  new_topup_id uuid;
BEGIN
  SELECT * INTO svc FROM public.smm_services WHERE id = _service_id AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'service not found'; END IF;
  IF _quantity < svc.min_qty OR _quantity > svc.max_qty THEN
    RAISE EXCEPTION 'quantity out of range (% .. %)', svc.min_qty, svc.max_qty;
  END IF;
  IF _link IS NULL OR length(trim(_link)) < 4 THEN RAISE EXCEPTION 'invalid link'; END IF;
  IF _email IS NULL OR position('@' in _email) < 2 THEN RAISE EXCEPTION 'invalid email'; END IF;

  total := round(svc.price_rub * _quantity, 2);
  IF total < 100 THEN RAISE EXCEPTION 'minimum 100 RUB for guest orders'; END IF;

  INSERT INTO public.orders (
    platform, service_type, link, quantity, price_rub,
    status, external_service_id, guest_token, guest_email, guest_contact
  ) VALUES (
    svc.platform, svc.category, _link, _quantity, total,
    'awaiting_payment', svc.id, new_guest_token, _email, _contact
  ) RETURNING id INTO new_order_id;

  INSERT INTO public.topup_payments (user_id, amount_rub, status, order_id, kind)
  VALUES (NULL, total, 'pending', new_order_id, 'guest_order')
  RETURNING id INTO new_topup_id;

  RETURN QUERY SELECT new_order_id, new_guest_token, total, new_topup_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_guest_yookassa_payment(bigint, text, integer, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_guest_yookassa_payment(bigint, text, integer, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.attach_yookassa_payment(
  _topup_id uuid,
  _payment_id text,
  _status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.topup_payments
    SET yookassa_payment_id = _payment_id,
        status = COALESCE(NULLIF(_status, ''), status)
    WHERE id = _topup_id
      AND yookassa_payment_id IS NULL;

  IF NOT FOUND THEN RAISE EXCEPTION 'payment row not found'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.attach_yookassa_payment(uuid, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.attach_yookassa_payment(uuid, text, text) TO anon, authenticated;