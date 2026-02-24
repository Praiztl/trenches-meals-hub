import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Utensils, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ComboCard from '@/components/menu/ComboCard';
import type { Combo } from '@/lib/types';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const Index = () => {
  const [combos, setCombos] = useState<Combo[]>([]);

  useEffect(() => {
    supabase
      .from('combos')
      .select('*')
      .eq('is_available', true)
      .limit(4)
      .then(({ data }) => {
        if (data) setCombos(data.map(c => ({ ...c, fixed_price: Number(c.fixed_price) })));
      });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container py-20 md:py-32">
          <motion.div {...fadeUp} className="max-w-2xl">
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              🔥 Fresh & affordable
            </span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mt-6 leading-tight text-foreground">
              Good food,<br />
              <span className="text-primary">no wahala.</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-4 max-w-md font-body">
              Delicious Nigerian meals delivered fast. From plantain to jollof, we've got your cravings covered.
            </p>
            <div className="flex gap-3 mt-8">
              <Link to="/menu">
                <Button size="lg" className="rounded-full gap-2 font-body text-base px-6">
                  Order Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/menu">
                <Button variant="outline" size="lg" className="rounded-full font-body text-base px-6">
                  View Menu
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Utensils, title: 'Fresh Daily', desc: 'Every meal made fresh from local ingredients' },
            { icon: Clock, title: 'Quick Delivery', desc: 'From kitchen to your door in minutes' },
            { icon: Smartphone, title: 'Easy Ordering', desc: 'Browse, tap, pay — that simple' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-start gap-4 p-6 rounded-xl bg-card border"
            >
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Combos */}
      {combos.length > 0 && (
        <section className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">Popular Combos</h2>
              <p className="text-muted-foreground mt-1">Curated combos at unbeatable prices</p>
            </div>
            <Link to="/menu" className="text-sm text-primary font-medium hover:underline hidden md:block">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {combos.map(combo => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-16">
        <div className="bg-primary rounded-2xl p-10 md:p-16 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
            Hungry? Let's fix that.
          </h2>
          <p className="text-primary-foreground/80 mt-3 max-w-md mx-auto">
            Browse our menu and get your order delivered in no time.
          </p>
          <Link to="/menu">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full mt-6 font-body text-base px-8"
            >
              Start Ordering
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
