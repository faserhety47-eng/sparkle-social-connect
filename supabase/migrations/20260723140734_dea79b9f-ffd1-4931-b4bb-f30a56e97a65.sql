CREATE OR REPLACE FUNCTION public.process_yookassa_verified(
  _payment_id text,
  _status text,
  _paid boolean
) RETURNS TABLE(
  payment_kind text,
  related_order_id uuid,
  smm_service_id bigint,
  smm_link text,
  smm_quantity integer,
  needs_smm boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.topup_payments;
  o public.orders;
BEGIN
  SELECT * INTO p FROM public.topup_payments
    WHERE yookassa_payment_id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'topup not found'; END IF;

  IF _status = 'succeeded' AND _paid THEN
    IF p.kind = 'guest_order' AND p.order_id IS NOT NULL THEN
      SELECT * INTO o FROM public.orders WHERE id = p.order_id FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;

      IF NOT p.credited THEN
        UPDATE public.orders SET status = 'paid' WHERE id = o.id;
        UPDATE public.topup_payments SET credited = true, status = 'succeeded' WHERE id = p.id;
      END IF;

      RETURN QUERY SELECT
        p.kind,
        o.id,
        o.external_service_id,
        o.link,
        o.quantity,
        (o.external_order_id IS NULL AND o.external_service_id IS NOT NULL);
      RETURN;
    END IF;

    IF p.user_id IS NOT NULL AND NOT p.credited THEN
      UPDATE public.profiles SET balance_rub = balance_rub + p.amount_rub WHERE id = p.user_id;
      INSERT INTO public.balance_transactions (user_id, amount_rub, kind, note, created_by)
      VALUES (p.user_id, p.amount_rub, 'topup', 'Пополнение через ЮKassa · ' || _payment_id, p.user_id);
      UPDATE public.topup_payments SET credited = true, status = 'succeeded' WHERE id = p.id;
    ELSE
      UPDATE public.topup_payments SET status = 'succeeded' WHERE id = p.id;
    END IF;
  ELSIF _status = 'canceled' THEN
    UPDATE public.topup_payments SET status = 'canceled' WHERE id = p.id;
    IF p.kind = 'guest_order' AND p.order_id IS NOT NULL AND NOT p.credited THEN
      UPDATE public.orders SET status = 'cancelled' WHERE id = p.order_id;
    END IF;
  ELSE
    UPDATE public.topup_payments SET status = COALESCE(NULLIF(_status, ''), status) WHERE id = p.id;
  END IF;

  RETURN QUERY SELECT p.kind, p.order_id, NULL::bigint, NULL::text, NULL::integer, false;
END;
$$;

REVOKE ALL ON FUNCTION public.process_yookassa_verified(text, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.process_yookassa_verified(text, text, boolean) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_guest_smm_order_started(
  _order_id uuid,
  _external_order_id bigint
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
    SET external_order_id = _external_order_id,
        external_status = 'queued',
        status = 'processing'
    WHERE id = _order_id
      AND user_id IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_guest_smm_order_started(uuid, bigint) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_guest_smm_order_started(uuid, bigint) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_guest_smm_order_error(
  _order_id uuid,
  _message text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
    SET status = 'error',
        payment_note = COALESCE(NULLIF(_message, ''), 'Оплачено, но не удалось запустить заказ')
    WHERE id = _order_id
      AND user_id IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_guest_smm_order_error(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_guest_smm_order_error(uuid, text) TO anon, authenticated;