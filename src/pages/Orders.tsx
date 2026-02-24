import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, RotateCcw, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import StatusBadge from '@/components/order/StatusBadge';
import type { Order, OrderItem } from '@/lib/types';
import { toast } from 'sonner';

const Orders = () => {
  const { user, signOut } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const ordersWithItems = await Promise.all(
          data.map(async (order) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);
            return {
              ...order,
              subtotal: Number(order.subtotal),
              delivery_fee: Number(order.delivery_fee),
              total: Number(order.total),
              items: items?.map(i => ({
                ...i,
                unit_price_snapshot: Number(i.unit_price_snapshot),
                line_total: Number(i.line_total),
              })) || [],
            };
          })
        );
        setOrders(ordersWithItems);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user, navigate]);

  const handleReorder = (order: Order & { items?: OrderItem[] }) => {
    if (!order.items) return;
    order.items.forEach(item => {
      addItem({
        id: item.ref_id,
        type: item.item_type as 'ITEM' | 'COMBO',
        name: item.name_snapshot,
        price: item.unit_price_snapshot,
      }, item.quantity);
    });
    toast.success('Items added to cart!');
    navigate('/cart');
  };

  if (!user) return null;

  return (
    <div className="container py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-secondary rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="font-heading text-xl font-bold mt-4 text-foreground">No orders yet</h2>
          <p className="text-muted-foreground mt-2">Your order history will appear here</p>
          <Link to="/menu">
            <Button className="rounded-full mt-4">Browse Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map(order => (
            <motion.div
              key={order.id}
              layout
              className="bg-card rounded-xl border overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-card-foreground">
                      {order.order_number}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">₦{order.total.toLocaleString()}</span>
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedId === order.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedId === order.id && order.items && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="border-t px-4 pb-4"
                >
                  <div className="pt-3 space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name_snapshot}
                        </span>
                        <span>₦{item.line_total.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>₦{order.delivery_fee.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full mt-4 gap-2"
                    onClick={() => handleReorder(order)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Re-order
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
