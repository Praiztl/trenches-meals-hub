
-- Admin helper function (must be created first)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('admin@trenchesmeals.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Menu items
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Sides',
  image_url TEXT DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert items" ON public.menu_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update items" ON public.menu_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete items" ON public.menu_items FOR DELETE USING (public.is_admin());

-- Combos
CREATE TABLE public.combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  fixed_price NUMERIC(10,2) NOT NULL,
  image_url TEXT DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available combos" ON public.combos FOR SELECT USING (true);
CREATE POLICY "Admins can insert combos" ON public.combos FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update combos" ON public.combos FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete combos" ON public.combos FOR DELETE USING (public.is_admin());

-- Combo items junction
CREATE TABLE public.combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1
);

ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view combo items" ON public.combo_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert combo items" ON public.combo_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update combo items" ON public.combo_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete combo items" ON public.combo_items FOR DELETE USING (public.is_admin());

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL DEFAULT 'TM-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Order items with snapshots
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  ref_id UUID NOT NULL,
  name_snapshot TEXT NOT NULL,
  unit_price_snapshot NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  line_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'paystack',
  reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'INITIATED',
  raw_payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (public.is_admin());

-- Admin settings
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert settings" ON public.admin_settings FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update settings" ON public.admin_settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete settings" ON public.admin_settings FOR DELETE USING (public.is_admin());

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default admin settings
INSERT INTO public.admin_settings (key, value) VALUES 
  ('payment_account_number', '0239799403'),
  ('payment_bank', 'Wema'),
  ('payment_account_name', 'Trenches Meals'),
  ('whatsapp_number', ''),
  ('delivery_fee', '500');
