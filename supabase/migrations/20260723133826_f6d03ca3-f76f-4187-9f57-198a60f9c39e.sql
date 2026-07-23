
ALTER TABLE public.topup_payments
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'topup';

CREATE OR REPLACE FUNCTION public.create_guest_smm_order(
  _service_id bigint,
  _link text,
  _quantity integer,
  _email text,
  _contact text
) RETURNS TABLE(order_id uuid, guest_token uuid, amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  svc public.smm_services;
  total numeric(12,2);
  new_id uuid;
  new_token uuid := gen_random_uuid();
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
    'awaiting_payment', svc.id, new_token, _email, _contact
  ) RETURNING id INTO new_id;

  RETURN QUERY SELECT new_id, new_token, total;
END;
$$;

REVOKE ALL ON FUNCTION public.create_guest_smm_order(bigint, text, integer, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_guest_smm_order(bigint, text, integer, text, text) TO anon, authenticated, service_role;
