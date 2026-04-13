'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, List } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard, ProductCardSkeleton } from '@/components/shop/ProductCard';
import { productsApi } from '@/lib/api';

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'base_price', label: 'Price: Low to High' },
  { value: '-base_price', label: 'Price: High to Low' },
  { value: '-views_count', label: 'Most Popular' },
];

export default function ProductsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  // Build query params
  const queryParams: Record<string, any> = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    ordering: searchParams.get('sort') || '-created_at',
    min_price: searchParams.get('min_price') || undefined,
    max_price: searchParams.get('max_price') || undefined,
    in_stock: searchParams.get('in_stock') || undefined,
    page: searchParams.get('page') || 1,
    page_size: 24,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsApi.list(queryParams).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories().then(r => r.data),
  });

  const products = data?.results || [];
  const totalCount = data?.count || 0;
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const updateParam = (key: string, value: string | null) => {
    const current = new URLSearchParams(searchParams.toString());
    if (value) current.set(key, value); else current.delete(key);
    current.delete('page');
    router.push(`${pathname}?${current.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
    setPriceRange([0, 200000]);
  };

  const activeFiltersCount = ['category', 'min_price', 'max_price', 'in_stock', 'search']
    .filter((k) => searchParams.get(k)).length;

  return (
    <main>
      <Navbar />
      <div className="container-shop py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold text-[var(--text-primary)]">
              {searchParams.get('search') ? `Results for "${searchParams.get('search')}"` :
               searchParams.get('category') ? categories.find((c: any) => c.slug === searchParams.get('category'))?.name || 'Products' :
               'All Products'}
            </h1>
            {!isLoading && (
              <p className="text-sm text-[var(--text-tertiary)] mt-1">{totalCount} products found</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View mode */}
            <div className="hidden md:flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
              {(['grid', 'list'] as const).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-2 transition-colors ${viewMode === mode ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}>
                  {mode === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={searchParams.get('sort') || '-created_at'}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input py-2 px-3 text-sm w-48"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="btn-secondary py-2 px-4 text-sm gap-2 relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--accent)] text-[var(--text-inverse)] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchParams.get('search') && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full text-xs text-[var(--text-secondary)]">
                Search: {searchParams.get('search')}
                <button onClick={() => updateParam('search', null)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchParams.get('category') && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full text-xs text-[var(--text-secondary)]">
                Category: {categories.find((c: any) => c.slug === searchParams.get('category'))?.name}
                <button onClick={() => updateParam('category', null)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.aside
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 256 }}
                exit={{ opacity: 0, x: -20, width: 0 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div className="w-64 space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Categories</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => updateParam('category', null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!searchParams.get('category') ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat: any) => (
                        <button key={cat.id}
                          onClick={() => updateParam('category', cat.slug)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${searchParams.get('category') === cat.slug ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs opacity-60">{cat.product_count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Price Range</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={priceRange[0] || ''}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="input py-2 text-sm" />
                        <input type="number" placeholder="Max" value={priceRange[1] || ''}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 200000])}
                          className="input py-2 text-sm" />
                      </div>
                      <button
                        onClick={() => {
                          updateParam('min_price', priceRange[0].toString());
                          updateParam('max_price', priceRange[1].toString());
                        }}
                        className="btn-secondary w-full text-sm py-2"
                      >
                        Apply Price Filter
                      </button>
                    </div>
                  </div>

                  {/* In Stock */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Availability</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={searchParams.get('in_stock') === 'true'}
                        onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-[var(--text-secondary)]">In Stock Only</span>
                    </label>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">No products found</h3>
                <p className="text-[var(--text-secondary)] mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' + (filtersOpen ? '' : ' lg:grid-cols-4') : 'grid-cols-1'}`}>
                  {products.map((product: any, i: number) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {totalCount > 24 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: Math.ceil(totalCount / 24) }, (_, i) => i + 1).slice(0, 5).map((p) => (
                      <button key={p}
                        onClick={() => updateParam('page', p.toString())}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          parseInt(searchParams.get('page') || '1') === p
                            ? 'bg-[var(--accent)] text-[var(--text-inverse)]'
                            : 'btn-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
