
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_contact text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_token uuid UNIQUE DEFAULT gen_random_uuid();

GRANT SELECT, INSERT, UPDATE ON public.orders TO anon;

DROP POLICY IF EXISTS "Own orders insert" ON public.orders;
CREATE POLICY "Own orders insert" ON public.orders
  FOR INSERT TO public
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (user_id IS NULL AND guest_token IS NOT NULL)
  );

CREATE POLICY "Guest orders select by token" ON public.orders
  FOR SELECT TO anon
  USING (user_id IS NULL AND guest_token IS NOT NULL);

CREATE POLICY "Guest orders update by token" ON public.orders
  FOR UPDATE TO anon
  USING (user_id IS NULL AND guest_token IS NOT NULL)
  WITH CHECK (user_id IS NULL AND guest_token IS NOT NULL);

GRANT SELECT, INSERT ON public.order_messages TO anon;

CREATE POLICY "Guest order messages select" ON public.order_messages
  FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_messages.order_id AND o.user_id IS NULL));

CREATE POLICY "Guest order messages insert" ON public.order_messages
  FOR INSERT TO anon
  WITH CHECK (
    sender = 'client'
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_messages.order_id AND o.user_id IS NULL)
  );
