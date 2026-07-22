
-- 1) Balance column on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS balance_rub numeric(12,2) NOT NULL DEFAULT 0;

-- 2) Transactions table
CREATE TABLE IF NOT EXISTS public.balance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_rub numeric(12,2) NOT NULL,
  kind text NOT NULL CHECK (kind IN ('topup','spend','refund','adjust')),
  note text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.balance_transactions TO authenticated;
GRANT ALL ON public.balance_transactions TO service_role;

ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own transactions read"
  ON public.balance_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS balance_transactions_user_idx
  ON public.balance_transactions(user_id, created_at DESC);

-- 3) Admin top-up RPC
CREATE OR REPLACE FUNCTION public.admin_topup_balance(
  _user_id uuid, _amount numeric, _note text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _amount IS NULL OR _amount = 0 THEN
    RAISE EXCEPTION 'amount required';
  END IF;

  UPDATE public.profiles
    SET balance_rub = balance_rub + _amount
    WHERE id = _user_id;

  INSERT INTO public.balance_transactions (user_id, amount_rub, kind, note, created_by)
  VALUES (
    _user_id,
    _amount,
    CASE WHEN _amount >= 0 THEN 'topup' ELSE 'adjust' END,
    _note,
    auth.uid()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_topup_balance(uuid, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_topup_balance(uuid, numeric, text) TO authenticated;

-- 4) Pay order from balance
CREATE OR REPLACE FUNCTION public.pay_order_from_balance(_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o_price numeric;
  o_user uuid;
  o_status text;
  cur_balance numeric;
BEGIN
  SELECT price_rub, user_id, status INTO o_price, o_user, o_status
    FROM public.orders WHERE id = _order_id;

  IF o_user IS NULL THEN RAISE EXCEPTION 'order not found'; END IF;
  IF o_user <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF o_status NOT IN ('awaiting_payment','payment_reported') THEN
    RAISE EXCEPTION 'order already paid';
  END IF;

  SELECT balance_rub INTO cur_balance FROM public.profiles WHERE id = o_user FOR UPDATE;
  IF cur_balance < o_price THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  UPDATE public.profiles SET balance_rub = balance_rub - o_price WHERE id = o_user;
  UPDATE public.orders SET status = 'paid' WHERE id = _order_id;

  INSERT INTO public.balance_transactions (user_id, amount_rub, kind, note, order_id, created_by)
  VALUES (o_user, -o_price, 'spend', 'Оплата заказа', _order_id, auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.pay_order_from_balance(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pay_order_from_balance(uuid) TO authenticated;
