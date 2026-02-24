import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import MenuItemCard from '@/components/menu/MenuItemCard';
import ComboCard from '@/components/menu/ComboCard';
import type { MenuItem, Combo } from '@/lib/types';

const Menu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [tab, setTab] = useState<'items' | 'combos'>('items');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [itemsRes, combosRes] = await Promise.all([
        supabase.from('menu_items').select('*').eq('is_available', true),
        supabase.from('combos').select('*').eq('is_available', true),
      ]);
      if (itemsRes.data) setItems(itemsRes.data.map(i => ({ ...i, price: Number(i.price) })));
      if (combosRes.data) setCombos(combosRes.data.map(c => ({ ...c, fixed_price: Number(c.fixed_price) })));
      setLoading(false);
    };
    fetchData();
  }, []);

  const categories = ['All', ...new Set(items.map(i => i.category))];

  const filteredItems = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || i.category === category;
    return matchSearch && matchCategory;
  });

  const filteredCombos = combos.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground">Our Menu</h1>
        <p className="text-muted-foreground mt-1">Fresh meals & curated combos</p>
      </motion.div>

      {/* Search + Tabs */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-secondary border-0"
          />
        </div>
        <div className="flex gap-2">
          {(['items', 'combos'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {t === 'items' ? 'Items' : 'Combos'}
            </button>
          ))}
        </div>
      </div>

      {/* Category filters for items */}
      {tab === 'items' && categories.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === c
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-secondary rounded-xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : tab === 'items' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
          {filteredItems.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">No items found</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredCombos.map(combo => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
          {filteredCombos.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">No combos found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
