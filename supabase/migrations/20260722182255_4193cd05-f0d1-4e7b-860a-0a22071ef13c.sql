REVOKE ALL ON FUNCTION public.admin_topup_balance(uuid, numeric, text) FROM anon;
REVOKE ALL ON FUNCTION public.pay_order_from_balance(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.redeem_promo(text, numeric) FROM anon;

GRANT EXECUTE ON FUNCTION public.admin_topup_balance(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pay_order_from_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_promo(text, numeric) TO authenticated;

-- Ensure has_role is callable by roles that use it in RLS policies
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
