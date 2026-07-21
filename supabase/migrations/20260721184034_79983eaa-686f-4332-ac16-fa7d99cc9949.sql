
-- payment methods
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text,
  details text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active payment methods" ON public.payment_methods FOR SELECT USING (is_active = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert payment methods" ON public.payment_methods FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update payment methods" ON public.payment_methods FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete payment methods" ON public.payment_methods FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER payment_methods_updated BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- platforms
CREATE TABLE public.platforms (
  id text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platforms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platforms TO authenticated;
GRANT ALL ON public.platforms TO service_role;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read platforms" ON public.platforms FOR SELECT USING (is_active = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert platforms" ON public.platforms FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update platforms" ON public.platforms FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete platforms" ON public.platforms FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER platforms_updated BEFORE UPDATE ON public.platforms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- service types
CREATE TABLE public.service_types (
  id text PRIMARY KEY,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_types TO authenticated;
GRANT ALL ON public.service_types TO service_role;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service types" ON public.service_types FOR SELECT USING (is_active = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert service types" ON public.service_types FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update service types" ON public.service_types FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete service types" ON public.service_types FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER service_types_updated BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- seed platforms
INSERT INTO public.platforms (id, name, sort_order) VALUES
  ('max','Max',10),
  ('vk','ВКонтакте',20),
  ('telegram','Telegram',30),
  ('ok','Одноклассники',40),
  ('instagram','Instagram',50),
  ('rutube','Rutube',60),
  ('youtube','YouTube',70)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.service_types (id, label, sort_order) VALUES
  ('followers','Подписчики',10),
  ('likes','Лайки',20),
  ('views','Просмотры',30),
  ('comments','Комментарии',40)
ON CONFLICT (id) DO NOTHING;

-- order messages
CREATE TABLE public.order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('admin','user')),
  author_id uuid NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_messages TO authenticated;
GRANT ALL ON public.order_messages TO service_role;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read order messages" ON public.order_messages FOR SELECT TO authenticated
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Participants insert order messages" ON public.order_messages FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid() AND (
    (sender = 'admin' AND has_role(auth.uid(),'admin'))
    OR (sender = 'user' AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()))
  )
);
CREATE POLICY "Participants update read state" ON public.order_messages FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
) WITH CHECK (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

CREATE INDEX order_messages_order_created ON public.order_messages(order_id, created_at);
