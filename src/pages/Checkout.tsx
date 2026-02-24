import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const deliveryFee = 500;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: 'PENDING_PAYMENT',
        })
        .select()
        .single();

      if (orderErr || !order) throw orderErr;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        item_type: item.type,
        ref_id: item.id,
        name_snapshot: item.name,
        unit_price_snapshot: item.price,
        quantity: item.quantity,
        line_total: item.price * item.quantity,
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      // For now, simulate payment success (mark as PAID)
      await supabase
        .from('orders')
        .update({ status: 'PAID' })
        .eq('id', order.id);

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground mt-1">Review and confirm your order</p>
      </motion.div>

      <div className="mt-6 bg-card rounded-xl border p-6">
        <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Order Summary</h2>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>₦{deliveryFee.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base">
              <span className="font-heading">Total</span>
              <span className="text-primary font-heading">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <p className="text-sm text-secondary-foreground">
            <strong>Payment:</strong> Transfer ₦{total.toLocaleString()} to complete your order. 
            Payment details will be provided after confirmation.
          </p>
        </div>

        <Button
          className="w-full rounded-full mt-6 text-base"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? 'Placing Order...' : `Pay ₦${total.toLocaleString()}`}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
