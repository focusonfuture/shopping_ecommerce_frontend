'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { useCurrencyStore } from '@/store/uiStore';
import { useDebounce } from '@/hooks/useDebounce';

export function SearchModal() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { searchOpen, toggleSearch } = useUIStore();
  const { format } = useCurrencyStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const trending = ['iPhone 15', 'Sony Headphones', 'Yoga Mat', 'Linen Shirt'];
  const recent = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('recent_searches') || '[]') : [];

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    productsApi.list({ search: debouncedQuery, page_size: 6 }).then(({ data }) => {
      setResults(data.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const searches = [query, ...recent.filter((s: string) => s !== query)].slice(0, 5);
    localStorage.setItem('recent_searches', JSON.stringify(searches));
    router.push(`/${locale}/products?search=${encodeURIComponent(query)}`);
    toggleSearch();
    setQuery('');
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleSearch}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="card shadow-2xl overflow-hidden">
              {/* Search Input */}
              <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)]">
                <Search className="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, brands..."
                  className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none text-base"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="btn-ghost p-1">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
              </form>

              <div className="px-4 py-3 max-h-[60vh] overflow-y-auto">
                {/* Results */}
                {loading && (
                  <div className="space-y-3 py-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex gap-3">
                        <div className="skeleton w-12 h-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-4 w-3/4 rounded" />
                          <div className="skeleton h-3 w-1/3 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Products</p>
                    <div className="space-y-1">
                      {results.map((product) => (
                        <Link key={product.id} href={`/${locale}/products/${product.slug}`}
                          onClick={() => { toggleSearch(); setQuery(''); }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] overflow-hidden flex-shrink-0">
                            {product.primary_image && (
                              <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{product.name}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{product.category_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{format(parseFloat(product.base_price))}</p>
                            {product.discount_percent > 0 && (
                              <span className="text-xs text-green-600 font-medium">{product.discount_percent}% off</span>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                    <Link href={`/${locale}/products?search=${encodeURIComponent(query)}`}
                      onClick={() => { toggleSearch(); setQuery(''); }}
                      className="flex items-center justify-center gap-2 mt-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-t border-[var(--border)] transition-colors"
                    >
                      View all results for "{query}" <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Trending */}
                {!query && (
                  <div className="space-y-4">
                    {recent.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Recent
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recent.map((s: string) => (
                            <button key={s} onClick={() => setQuery(s)}
                              className="px-3 py-1.5 text-sm bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Trending
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trending.map((s) => (
                          <button key={s} onClick={() => setQuery(s)}
                            className="px-3 py-1.5 text-sm bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
