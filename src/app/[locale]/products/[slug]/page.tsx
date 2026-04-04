'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Shield, Truck, RotateCcw, Share2, Minus, Plus, Check } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/shop/ProductCard';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useCurrencyStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;

  const { addItem } = useCartStore();
  const { format } = useCurrencyStore();
  const { isAuthenticated } = useAuthStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.detail(slug).then(r => r.data),
  });

  const { data: recommendedData } = useQuery({
    queryKey: ['recommended', slug],
    queryFn: () => productsApi.recommended(slug).then(r => r.data),
    enabled: !!product,
  });

  if (isLoading) return (
    <main>
      <Navbar />
      <div className="container-shop py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-1/2 rounded" />
            <div className="skeleton h-24 rounded" />
            <div className="skeleton h-12 rounded" />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );

  if (!product) return (
    <main>
      <Navbar />
      <div className="container-shop py-24 text-center">
        <h1 className="font-display text-2xl font-semibold mb-4">Product not found</h1>
        <Link href={`/${locale}/products`} className="btn-primary">Back to Products</Link>
      </div>
      <Footer />
    </main>
  );

  const images = product.images || [];
  const currentImage = images[selectedImage];
  const price = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(product.base_price);
  const comparePrice = selectedVariant?.compare_price
    ? parseFloat(selectedVariant.compare_price)
    : product.compare_price ? parseFloat(product.compare_price) : null;

  const recommended = Array.isArray(recommendedData) ? recommendedData : (recommendedData?.results || []);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addItem(product.id, quantity, selectedVariant?.id);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    const { data } = await productsApi.toggleWishlist(product.id);
    setWishlisted(data.wishlisted);
    toast.success(data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  // Group attributes for variant selection
  const attrGroups: Record<string, { name: string; values: any[] }> = {};
  product.variants?.forEach((v: any) => {
    v.attributes?.forEach((a: any) => {
      if (!attrGroups[a.attribute]) {
        attrGroups[a.attribute] = { name: a.attribute_name, values: [] };
      }
      if (!attrGroups[a.attribute].values.find((av: any) => av.id === a.id)) {
        attrGroups[a.attribute].values.push(a);
      }
    });
  });

  return (
    <main>
      <Navbar />
      <div className="container-shop py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] mb-8">
          <Link href={`/${locale}`} className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${locale}/products`} className="hover:text-[var(--text-primary)] transition-colors">Products</Link>
          {product.category && <>
            <span>/</span>
            <Link href={`/${locale}/products?category=${product.category.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
              {product.category.name}
            </Link>
          </>}
          <span>/</span>
          <span className="text-[var(--text-primary)] truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--bg-secondary)]"
              layoutId={`product-image-${slug}`}
            >
              {currentImage ? (
                <img src={currentImage.image} alt={currentImage.alt_text || product.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-[var(--text-tertiary)]" />
                </div>
              )}
              {/* Nav arrows */}
              {images.length > 1 && <>
                <button onClick={() => setSelectedImage(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center shadow hover:bg-[var(--surface)] transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedImage(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center shadow hover:bg-[var(--surface)] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>}
              {product.discount_percent > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">
                  -{product.discount_percent}% OFF
                </span>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button key={img.id} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-[var(--accent)]' : 'border-[var(--border)] opacity-60 hover:opacity-100'}`}>
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.category && (
              <Link href={`/${locale}/products?category=${product.category.slug}`}
                className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display text-3xl xl:text-4xl font-bold text-[var(--text-primary)] leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= product.avg_rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-[var(--text-secondary)]">
                {product.avg_rating} ({product.review_count} reviews)
              </span>
              <span className="text-sm text-[var(--text-tertiary)]">SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-[var(--text-primary)] price">
                {format(price)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-xl text-[var(--text-tertiary)] line-through price">
                  {format(comparePrice)}
                </span>
              )}
            </div>

            {product.short_description && (
              <p className="text-[var(--text-secondary)] leading-relaxed">{product.short_description}</p>
            )}

            {/* Variants */}
            {Object.entries(attrGroups).map(([attrId, group]) => (
              <div key={attrId}>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2.5">
                  {group.name}:
                  {selectedAttrs[attrId] && <span className="font-normal text-[var(--text-secondary)] ml-1">{selectedAttrs[attrId]}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.values.map((av: any) => {
                    const isSelected = selectedAttrs[attrId] === av.value;
                    return av.color_hex ? (
                      <button key={av.id} onClick={() => setSelectedAttrs(p => ({ ...p, [attrId]: av.value }))}
                        title={av.value}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${isSelected ? 'border-[var(--accent)] scale-110' : 'border-[var(--border)]'}`}
                        style={{ backgroundColor: av.color_hex }}
                      />
                    ) : (
                      <button key={av.id} onClick={() => setSelectedAttrs(p => ({ ...p, [attrId]: av.value }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isSelected ? 'bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'}`}>
                        {av.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-2.5">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl p-1">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className={`text-sm font-medium ${product.is_in_stock ? 'text-green-600' : 'text-red-500'}`}>
                  {product.is_in_stock ? `✓ In Stock` : '✗ Out of Stock'}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!product.is_in_stock || addingToCart}
                className="btn-primary flex-1 py-4 text-base justify-center disabled:opacity-60"
              >
                <ShoppingBag className="w-5 h-5" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleWishlist}
                className={`btn-secondary p-4 ${wishlisted ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </motion.button>
              <button className="btn-secondary p-4">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
              {[
                { icon: Truck, text: 'Free Shipping', sub: 'Above ₹999' },
                { icon: RotateCcw, text: 'Easy Returns', sub: '30-day policy' },
                { icon: Shield, text: 'Secure Checkout', sub: 'SSL encrypted' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="text-center">
                  <Icon className="w-5 h-5 text-[var(--text-tertiary)] mx-auto mb-1" />
                  <p className="text-xs font-medium text-[var(--text-primary)]">{text}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-[var(--border)] gap-1">
            {[
              { id: 'description', label: 'Description' },
              { id: 'reviews', label: `Reviews (${product.review_count})` },
              { id: 'shipping', label: 'Shipping' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-[var(--text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }} />
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-6 max-w-2xl">
                {product.reviews?.length === 0 ? (
                  <p className="text-[var(--text-secondary)]">No reviews yet. Be the first to review!</p>
                ) : (
                  product.reviews?.map((review: any) => (
                    <div key={review.id} className="card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{review.user_name}</p>
                          {review.is_verified_purchase && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="font-semibold text-[var(--text-primary)] mt-2">{review.title}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{review.body}</p>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="space-y-4 text-[var(--text-secondary)] max-w-xl">
                <p>• Free shipping on orders above ₹999</p>
                <p>• Standard delivery: 3-5 business days</p>
                <p>• Express delivery available at checkout</p>
                <p>• Easy 30-day returns on all items</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)] mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {recommended.slice(0, 4).map((p: any, i: number) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
