'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useCurrencyStore } from '@/store/uiStore';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const params = useParams();
  const locale = params.locale as string;
  const { cart, isOpen, closeCart, updateItem, removeItem, applyCoupon, removeCoupon, isLoading } = useCartStore();
  const { format } = useCurrencyStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      await applyCoupon(couponCode.trim());
      toast.success('Coupon applied!');
      setCouponCode('');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--surface)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="font-display text-lg font-semibold">Your Cart</h2>
                {cart?.item_count ? (
                  <span className="badge badge-gray">{cart.item_count}</span>
                ) : null}
              </div>
              <button onClick={closeCart} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!cart?.items?.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-[var(--text-tertiary)]" />
                  </div>
                  <p className="font-display text-lg font-medium text-[var(--text-primary)]">Your cart is empty</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">Start shopping to fill it up</p>
                  <button onClick={closeCart} className="btn-primary mt-6">Continue Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {cart.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="flex gap-4 p-3 rounded-xl bg-[var(--bg-secondary)] group"
                      >
                        {/* Image */}
                        <div className="w-18 h-18 rounded-lg bg-[var(--bg-tertiary)] overflow-hidden flex-shrink-0">
                          {item.product?.primary_image ? (
                            <img src={item.product.primary_image} alt={item.product.name}
                              className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-[var(--text-tertiary)]" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
                            {item.product?.name}
                          </h4>
                          {item.variant && (
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                              {item.variant.attributes?.map((a: any) => `${a.attribute_name}: ${a.value}`).join(', ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity */}
                            <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5">
                              <button
                                onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-secondary)] transition-colors"
                                disabled={isLoading}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-secondary)] transition-colors"
                                disabled={isLoading}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                              {format(parseFloat(item.total_price))}
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart?.items?.length ? (
              <div className="border-t border-[var(--border)] px-6 py-4 space-y-4">
                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="input pl-9 py-2.5 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                  </div>
                  <button onClick={handleApplyCoupon} disabled={couponLoading}
                    className="btn-secondary px-4 py-2.5 text-sm whitespace-nowrap">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>

                {cart.coupon && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <Tag className="w-3.5 h-3.5" /> {cart.coupon.code}
                    </span>
                    <button onClick={removeCoupon} className="text-[var(--text-tertiary)] hover:text-red-500 text-xs">
                      Remove
                    </button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span>
                    <span>{format(parseFloat(cart.subtotal))}</span>
                  </div>
                  {parseFloat(cart.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{format(parseFloat(cart.discount_amount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-1.5 border-t border-[var(--border)]">
                    <span>Total</span>
                    <span>{format(parseFloat(cart.total))}</span>
                  </div>
                </div>

                <Link
                  href={`/${locale}/checkout`}
                  onClick={closeCart}
                  className="btn-primary w-full justify-center py-3.5 text-base"
                >
                  Proceed to Checkout
                </Link>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
