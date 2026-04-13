'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { productsApi } from '@/lib/api';

const ICONS: Record<string,string> = {electronics:'💻',fashion:'👗','home-living':'🏠',beauty:'💄',sports:'⚽',books:'📚'};
const COLORS: Record<string,string> = {electronics:'from-blue-50 to-indigo-100',fashion:'from-pink-50 to-rose-100','home-living':'from-amber-50 to-orange-100',beauty:'from-purple-50 to-fuchsia-100',sports:'from-green-50 to-emerald-100',books:'from-cyan-50 to-teal-100'};

export default function CategoriesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => productsApi.categories().then(r => r.data) });
  const cats = Array.isArray(data) ? data : (data?.results || []);
  return (
    <main>
      <Navbar />
      <div className="container-shop py-12">
        <h1 className="font-display text-3xl font-bold mb-2">All Categories</h1>
        <p className="text-[var(--text-secondary)] mb-10">Find exactly what you're looking for</p>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_,i) => <div key={i} className="skeleton aspect-square rounded-2xl"/>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {cats.map((cat: any, i: number) => (
              <motion.div key={cat.id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}} whileHover={{y:-4}}>
                <Link href={`/${locale}/products?category=${cat.slug}`}
                  className={`block p-8 rounded-2xl bg-gradient-to-br ${COLORS[cat.slug]||'from-gray-50 to-gray-100'} border border-[var(--border)] hover:shadow-md transition-all text-center group`}>
                  <div className="text-5xl mb-4">{ICONS[cat.slug]||'🛍️'}</div>
                  <h3 className="font-semibold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{cat.name}</h3>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">{cat.product_count} products</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
