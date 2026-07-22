CREATE OR REPLACE FUNCTION public.client_guest_token()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(current_setting('request.headers.x-guest-token', true), '');
$$;

REVOKE ALL ON FUNCTION public.client_guest_token() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.client_guest_token() TO anon;
GRANT EXECUTE ON FUNCTION public.client_guest_token() TO authenticated;

DROP POLICY IF EXISTS "Guest orders select by token" ON public.orders;
DROP POLICY IF EXISTS "Guest orders update by token" ON public.orders;

CREATE POLICY "Guest orders select by token" ON public.orders
  FOR SELECT TO anon
  USING (
    user_id IS NULL
    AND guest_token IS NOT NULL
    AND guest_token::text = public.client_guest_token()
  );

CREATE POLICY "Guest orders update by token" ON public.orders
  FOR UPDATE TO anon
  USING (
    user_id IS NULL
    AND guest_token IS NOT NULL
    AND guest_token::text = public.client_guest_token()
  )
  WITH CHECK (
    user_id IS NULL
    AND guest_token IS NOT NULL
    AND guest_token::text = public.client_guest_token()
  );

DROP POLICY IF EXISTS "Guest order messages select" ON public.order_messages;
DROP POLICY IF EXISTS "Guest order messages insert" ON public.order_messages;

CREATE POLICY "Guest order messages select" ON public.order_messages
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_messages.order_id
        AND o.user_id IS NULL
        AND o.guest_token IS NOT NULL
        AND o.guest_token::text = public.client_guest_token()
    )
  );

CREATE POLICY "Guest order messages insert" ON public.order_messages
  FOR INSERT TO anon
  WITH CHECK (
    sender = 'client'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_messages.order_id
        AND o.user_id IS NULL
        AND o.guest_token IS NOT NULL
        AND o.guest_token::text = public.client_guest_token()
    )
  );
