import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import StatusBadge from '@/components/order/StatusBadge';
import { toast } from 'sonner';
import type { MenuItem, Order } from '@/lib/types';

const ADMIN_EMAILS = ['admin@trenchesmeals.com'];

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'items' | 'orders' | 'settings'>('items');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      navigate('/');
      return;
    }

    const fetch = async () => {
      const [itemsRes, ordersRes, settingsRes] = await Promise.all([
        supabase.from('menu_items').select('*').order('category'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('admin_settings').select('*'),
      ]);

      if (itemsRes.data) setItems(itemsRes.data.map(i => ({ ...i, price: Number(i.price) })));
      if (ordersRes.data) setOrders(ordersRes.data.map(o => ({ ...o, subtotal: Number(o.subtotal), delivery_fee: Number(o.delivery_fee), total: Number(o.total) })));
      if (settingsRes.data) {
        const s: Record<string, string> = {};
        settingsRes.data.forEach(r => { s[r.key] = r.value; });
        setSettings(s);
      }
      setLoading(false);
    };
    fetch();
  }, [user, navigate]);

  const toggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);
    if (!error) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
      toast.success(`${item.name} ${!item.is_available ? 'enabled' : 'disabled'}`);
    }
  };

  const updatePrice = async (id: string, price: number) => {
    const { error } = await supabase.from('menu_items').update({ price }).eq('id', id);
    if (!error) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, price } : i));
      toast.success('Price updated');
    }
  };

  const updateSetting = async (key: string, value: string) => {
    await supabase.from('admin_settings').update({ value }).eq('key', key);
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Setting saved');
  };

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
      </motion.div>

      <div className="flex gap-2 mt-6">
        {(['items', 'orders', 'settings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        <div className="mt-6 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-card-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{item.category}</span>
                </div>
              </div>
              <Input
                type="number"
                defaultValue={item.price}
                className="w-24 text-right"
                onBlur={e => {
                  const val = Number(e.target.value);
                  if (val > 0 && val !== item.price) updatePrice(item.id, val);
                }}
              />
              <Switch
                checked={item.is_available}
                onCheckedChange={() => toggleAvailability(item)}
              />
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="mt-6 space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-card rounded-xl border p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-card-foreground">{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span className="font-bold text-primary">₦{order.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="mt-6 bg-card rounded-xl border p-6 space-y-6 max-w-lg">
          {[
            { key: 'payment_account_number', label: 'Account Number' },
            { key: 'payment_bank', label: 'Bank Name' },
            { key: 'payment_account_name', label: 'Account Name' },
            { key: 'whatsapp_number', label: 'WhatsApp Number' },
            { key: 'delivery_fee', label: 'Delivery Fee (₦)' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                defaultValue={settings[key] || ''}
                onBlur={e => updateSetting(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
