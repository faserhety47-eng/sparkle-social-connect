
CREATE TABLE public.topup_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_rub numeric(12,2) NOT NULL CHECK (amount_rub > 0),
  yookassa_payment_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  credited boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.topup_payments TO authenticated;
GRANT ALL ON public.topup_payments TO service_role;

ALTER TABLE public.topup_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own topups" ON public.topup_payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all topups" ON public.topup_payments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER topup_payments_updated_at
  BEFORE UPDATE ON public.topup_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.credit_yookassa_topup(_payment_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.topup_payments;
BEGIN
  SELECT * INTO p FROM public.topup_payments
    WHERE yookassa_payment_id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'topup not found'; END IF;
  IF p.credited THEN RETURN; END IF;

  UPDATE public.profiles SET balance_rub = balance_rub + p.amount_rub WHERE id = p.user_id;

  INSERT INTO public.balance_transactions (user_id, amount_rub, kind, note, created_by)
  VALUES (p.user_id, p.amount_rub, 'topup',
    'Пополнение через ЮKassa · ' || _payment_id, p.user_id);

  UPDATE public.topup_payments
    SET credited = true, status = 'succeeded'
    WHERE id = p.id;
END;
$$;
