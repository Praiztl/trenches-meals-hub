import { motion } from 'framer-motion';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { Combo } from '@/lib/types';
import { toast } from 'sonner';

const ComboCard = ({ combo }: { combo: Combo }) => {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: combo.id,
      type: 'COMBO',
      name: combo.name,
      price: combo.fixed_price,
      image_url: combo.image_url,
    });
    toast.success(`${combo.name} combo added to cart`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {combo.image_url ? (
        <div className="aspect-[4/3] bg-secondary overflow-hidden">
          <img src={combo.image_url} alt={combo.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Combo</span>
        </div>
        <h3 className="font-heading font-semibold text-card-foreground">{combo.name}</h3>
        {combo.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{combo.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <p className="text-lg font-bold text-primary">₦{combo.fixed_price.toLocaleString()}</p>
          <Button size="sm" className="rounded-full gap-1" onClick={handleAdd}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ComboCard;
