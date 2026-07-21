
CREATE TABLE public.service_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  service_type text NOT NULL,
  price_per_unit numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, service_type)
);

GRANT SELECT ON public.service_prices TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_prices TO authenticated;
GRANT ALL ON public.service_prices TO service_role;

ALTER TABLE public.service_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read prices" ON public.service_prices FOR SELECT USING (true);
CREATE POLICY "Admins insert prices" ON public.service_prices FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update prices" ON public.service_prices FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete prices" ON public.service_prices FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER service_prices_set_updated_at BEFORE UPDATE ON public.service_prices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.service_prices (platform, service_type, price_per_unit) VALUES
  ('max','followers',0.5),('max','likes',0.2),('max','views',0.05),('max','comments',2),
  ('vk','followers',0.5),('vk','likes',0.2),('vk','views',0.05),('vk','comments',2),
  ('telegram','followers',0.5),('telegram','likes',0.2),('telegram','views',0.05),('telegram','comments',2),
  ('ok','followers',0.5),('ok','likes',0.2),('ok','views',0.05),('ok','comments',2),
  ('instagram','followers',0.5),('instagram','likes',0.2),('instagram','views',0.05),('instagram','comments',2),
  ('rutube','followers',0.5),('rutube','likes',0.2),('rutube','views',0.05),('rutube','comments',2),
  ('youtube','followers',0.5),('youtube','likes',0.2),('youtube','views',0.05),('youtube','comments',2);
