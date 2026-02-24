import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { MenuItem } from '@/lib/types';
import { toast } from 'sonner';

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: item.id,
      type: 'ITEM',
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {item.image_url && (
        <div className="aspect-square bg-secondary overflow-hidden">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}
      {!item.image_url && (
        <div className="aspect-square bg-secondary flex items-center justify-center text-4xl">
          🍽️
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading font-semibold text-card-foreground">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
            )}
            <p className="text-sm font-bold text-primary mt-2">₦{item.price.toLocaleString()}</p>
          </div>
          <Button
            size="icon"
            className="rounded-full shrink-0 h-9 w-9"
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
