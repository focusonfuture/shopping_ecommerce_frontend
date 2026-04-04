'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useCurrencyStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { productsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: string;
    compare_price?: string;
    primary_image?: string;
    avg_rating: number;
    review_count: number;
    category_name?: string;
    is_in_stock: boolean;
    is_featured: boolean;
    discount_percent: number;
  };
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const { addItem, isLoading } = useCartStore();
  const { format } = useCurrencyStore();
  const { isAuthenticated } = useAuthStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.is_in_stock) return;
    setAddingToCart(true);
    try {
      await addItem(product.id);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to add to wishlist'); return; }
    try {
      const { data } = await productsApi.toggleWishlist(product.id);
      setWishlisted(data.wishlisted);
      toast.success(data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link href={`/${locale}/products/${product.slug}`} className="product-card block">
        {/* Image Container */}
        <div className="product-card-img">
          {!imageLoaded && <div className="skeleton absolute inset-0" />}
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)]">
              <ShoppingBag className="w-12 h-12 text-[var(--text-tertiary)]" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.discount_percent > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                -{product.discount_percent}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                Featured
              </span>
            )}
            {!product.is_in_stock && (
              <span className="bg-gray-800/90 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                Out of Stock
              </span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                wishlisted ? 'bg-red-500 text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center justify-center shadow-md transition-colors"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Quick add button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={!product.is_in_stock || addingToCart}
              className="w-full btn-primary py-2.5 text-sm justify-center shadow-lg disabled:opacity-70"
            >
              <ShoppingBag className="w-4 h-4" />
              {addingToCart ? 'Adding...' : product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
            </motion.button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category_name && (
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              {product.category_name}
            </p>
          )}
          <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-3 h-3 ${s <= product.avg_rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">({product.review_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-semibold price text-[var(--text-primary)]">
              {format(parseFloat(product.base_price))}
            </span>
            {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.base_price) && (
              <span className="text-sm text-[var(--text-tertiary)] line-through price">
                {format(parseFloat(product.compare_price))}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
      </div>
    </div>
  );
}
