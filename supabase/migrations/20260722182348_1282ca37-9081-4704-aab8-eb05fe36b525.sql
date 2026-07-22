REVOKE ALL ON FUNCTION public.redeem_promo(text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_promo(text, numeric) TO authenticated;
