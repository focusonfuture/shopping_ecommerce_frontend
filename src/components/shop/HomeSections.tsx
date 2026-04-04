'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Package, RotateCcw, Shield, Headphones, Mail } from 'lucide-react';
import { useState } from 'react';
import { productsApi } from '@/lib/api';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

// ─── Featured Products ───────────────────────────────────────────────────────
export function FeaturedProducts() {
  const params = useParams();
  const locale = params.locale as string;

  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.featured().then(r => r.data),
  });

  const products = Array.isArray(data) ? data : (data?.results || []);

  return (
    <section className="section">
      <div className="container-shop">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="section-title"
            >
              Bestsellers
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="section-subtitle"
            >
              Our most loved products this season
            </motion.p>
          </div>
          <Link href={`/${locale}/products`}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {isLoading
            ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.slice(0, 8).map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
          }
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href={`/${locale}/products`} className="btn-secondary">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Category Grid ───────────────────────────────────────────────────────────
export function CategoryGrid() {
  const params = useParams();
  const locale = params.locale as string;

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories().then(r => r.data),
  });

  const categories = Array.isArray(data) ? data : (data?.results || []);

  const categoryIcons: Record<string, string> = {
    electronics: '💻', fashion: '👗', 'home-living': '🏠',
    beauty: '💄', sports: '⚽', books: '📚',
  };
  const categoryColors: Record<string, string> = {
    electronics: 'from-blue-50 to-indigo-50',
    fashion: 'from-pink-50 to-rose-50',
    'home-living': 'from-amber-50 to-orange-50',
    beauty: 'from-purple-50 to-fuchsia-50',
    sports: 'from-green-50 to-emerald-50',
    books: 'from-cyan-50 to-teal-50',
  };

  return (
    <section className="section bg-[var(--bg-secondary)]">
      <div className="container-shop">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtitle"
          >
            Find exactly what you're looking for
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-2xl" />
              ))
            : categories.slice(0, 6).map((cat: any, i: number) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/${locale}/products?category=${cat.slug}`}
                    className={`block p-6 rounded-2xl bg-gradient-to-br ${categoryColors[cat.slug] || 'from-gray-50 to-gray-100'} border border-[var(--border)] hover:shadow-md transition-all duration-300 text-center group`}
                  >
                    <div className="text-4xl mb-3">{categoryIcons[cat.slug] || '🛍️'}</div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {cat.product_count} items
                    </p>
                  </Link>
                </motion.div>
              ))
          }
        </div>
      </div>
    </section>
  );
}

// ─── Trust Badges ────────────────────────────────────────────────────────────
export function TrustBadges() {
  const badges = [
    { icon: Package, title: 'Free Shipping', desc: 'On orders over ₹999' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
    { icon: Shield, title: 'Secure Payment', desc: '256-bit SSL encrypted' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer support' },
  ];

  return (
    <section className="py-10 border-y border-[var(--border)]">
      <div className="container-shop">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="section">
      <div className="container-shop">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-[var(--accent)] px-8 py-16 text-center"
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%), radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }}
          />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3">
              Stay in the Loop
            </h2>
            <p className="text-white/80 mb-8">
              Subscribe to get exclusive offers, early access to new arrivals, and 10% off your first order.
            </p>
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-4 text-white font-medium"
              >
                🎉 You're subscribed! Check your email for your 10% off code.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 outline-none focus:bg-white/25 focus:border-white/50 transition-all text-sm"
                />
                <button type="submit" className="btn bg-white text-[var(--accent)] hover:bg-white/90 px-6 py-3 font-semibold text-sm rounded-xl whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
            <p className="text-white/50 text-xs mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
