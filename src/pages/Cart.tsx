import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Cart = () => {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const deliveryFee = 500;
  const total = subtotal + (items.length > 0 ? deliveryFee : 0);

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth?redirect=/cart');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="font-heading text-2xl font-bold mt-4 text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground mt-2">Browse our menu and add some delicious items</p>
          <Link to="/menu">
            <Button className="rounded-full mt-6">Browse Menu</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground">Your Cart</h1>
        <p className="text-muted-foreground mt-1">{items.length} item{items.length > 1 ? 's' : ''}</p>
      </motion.div>

      <div className="mt-6 space-y-3">
        {items.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-card rounded-xl border p-4 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🍽️</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-card-foreground truncate">{item.name}</h3>
              <p className="text-sm text-primary font-bold">₦{item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-card rounded-xl border p-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-medium">₦{deliveryFee.toLocaleString()}</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-base">
            <span className="font-heading font-bold">Total</span>
            <span className="font-heading font-bold text-primary">₦{total.toLocaleString()}</span>
          </div>
        </div>
        <Button
          className="w-full rounded-full mt-6 text-base"
          size="lg"
          onClick={handleCheckout}
        >
          {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
        </Button>
      </div>
    </div>
  );
};

export default Cart;
