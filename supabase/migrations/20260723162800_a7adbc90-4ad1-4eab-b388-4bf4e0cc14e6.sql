
CREATE OR REPLACE FUNCTION public.sync_guest_smm_status(
  _guest_token uuid,
  _external_status text,
  _local_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
     SET external_status = COALESCE(NULLIF(_external_status,''), external_status),
         status = COALESCE(NULLIF(_local_status,''), status)
   WHERE guest_token = _guest_token
     AND user_id IS NULL;
END;
$$;
