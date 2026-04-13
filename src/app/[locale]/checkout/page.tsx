'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronRight, MapPin, CreditCard, Package, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/uiStore';
import { ordersApi, authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const STEPS = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: Package },
];

export default function CheckoutPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { cart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { format } = useCurrencyStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [shippingAddr, setShippingAddr] = useState({
    full_name: '', phone: '', line1: '', line2: '',
    city: '', state: '', country: 'India', postal_code: '',
  });
  const [savedAddressId, setSavedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [notes, setNotes] = useState('');

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => authApi.getAddresses().then(r => r.data),
    enabled: isAuthenticated,
  });

  if (!cart?.items?.length) {
    return (
      <main>
        <Navbar />
        <div className="container-shop py-24 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-2xl font-semibold mb-4">Your cart is empty</h2>
          <Link href={`/${locale}/products`} className="btn-primary">Continue Shopping</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload: any = {
        payment_method: paymentMethod,
        notes,
        billing_same_as_shipping: true,
      };
      if (savedAddressId) {
        payload.shipping_address_id = savedAddressId;
      } else {
        payload.shipping_address = shippingAddr;
      }

      const { data } = await ordersApi.checkout(payload);
      setOrderId(data.order_id);

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        router.push(`/${locale}/account/orders?success=${data.order_number}`);
        return;
      }

      if (paymentMethod === 'razorpay') {
        const { data: rzData } = await ordersApi.createRazorpayOrder(data.order_id);
        const options = {
          key: rzData.key,
          amount: Math.round(parseFloat(cart.total) * 100),
          currency: 'INR',
          name: 'ShopElite',
          description: `Order ${data.order_number}`,
          order_id: rzData.razorpay_order_id,
          handler: async (response: any) => {
            try {
              await ordersApi.verifyRazorpay({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: data.order_id,
              });
              toast.success('Payment successful!');
              router.push(`/${locale}/account/orders?success=${data.order_number}`);
            } catch { toast.error('Payment verification failed'); }
          },
          prefill: { name: shippingAddr.full_name, contact: shippingAddr.phone },
          theme: { color: '#0a0a0f' },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

      if (paymentMethod === 'stripe') {
        router.push(`/${locale}/checkout/stripe?order_id=${data.order_id}`);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <main>
        <Navbar />
        <div className="container-shop py-10">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-8">Checkout</h1>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => step > s.id && setStep(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    step === s.id ? 'bg-[var(--accent)] text-[var(--text-inverse)]' :
                    step > s.id ? 'bg-green-100 text-green-700' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
                  }`}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Steps */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Shipping */}
                {step === 1 && (
                  <motion.div key="shipping"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="card p-6 space-y-5"
                  >
                    <h2 className="font-display text-xl font-semibold">Shipping Address</h2>

                    {/* Saved addresses */}
                    {Array.isArray(addresses) && addresses.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[var(--text-secondary)]">Saved Addresses</p>
                        {addresses.map((addr: any) => (
                          <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${savedAddressId === addr.id ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}>
                            <input type="radio" name="address" value={addr.id}
                              checked={savedAddressId === addr.id}
                              onChange={() => setSavedAddressId(addr.id)}
                              className="mt-1" />
                            <div className="text-sm">
                              <p className="font-medium">{addr.full_name}</p>
                              <p className="text-[var(--text-secondary)]">{addr.line1}, {addr.city}, {addr.state} {addr.postal_code}</p>
                              <p className="text-[var(--text-tertiary)]">{addr.phone}</p>
                            </div>
                          </label>
                        ))}
                        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${savedAddressId === null ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                          <input type="radio" name="address" checked={savedAddressId === null}
                            onChange={() => setSavedAddressId(null)} />
                          <span className="text-sm font-medium">Enter new address</span>
                        </label>
                      </div>
                    )}

                    {/* New address form */}
                    {savedAddressId === null && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="label">Full Name *</label>
                          <input value={shippingAddr.full_name} onChange={e => setShippingAddr(p => ({ ...p, full_name: e.target.value }))} className="input" required /></div>
                        <div className="col-span-2"><label className="label">Phone *</label>
                          <input value={shippingAddr.phone} onChange={e => setShippingAddr(p => ({ ...p, phone: e.target.value }))} className="input" required /></div>
                        <div className="col-span-2"><label className="label">Address Line 1 *</label>
                          <input value={shippingAddr.line1} onChange={e => setShippingAddr(p => ({ ...p, line1: e.target.value }))} className="input" required /></div>
                        <div className="col-span-2"><label className="label">Address Line 2</label>
                          <input value={shippingAddr.line2} onChange={e => setShippingAddr(p => ({ ...p, line2: e.target.value }))} className="input" /></div>
                        <div><label className="label">City *</label>
                          <input value={shippingAddr.city} onChange={e => setShippingAddr(p => ({ ...p, city: e.target.value }))} className="input" required /></div>
                        <div><label className="label">State *</label>
                          <input value={shippingAddr.state} onChange={e => setShippingAddr(p => ({ ...p, state: e.target.value }))} className="input" required /></div>
                        <div><label className="label">Country *</label>
                          <input value={shippingAddr.country} onChange={e => setShippingAddr(p => ({ ...p, country: e.target.value }))} className="input" /></div>
                        <div><label className="label">Postal Code *</label>
                          <input value={shippingAddr.postal_code} onChange={e => setShippingAddr(p => ({ ...p, postal_code: e.target.value }))} className="input" required /></div>
                      </div>
                    )}

                    <button onClick={() => setStep(2)} className="btn-primary py-3 px-8">
                      Continue to Payment <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <motion.div key="payment"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="card p-6 space-y-5"
                  >
                    <h2 className="font-display text-xl font-semibold">Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'razorpay', label: 'Razorpay', desc: 'UPI, NetBanking, Cards, Wallets', emoji: '💳' },
                        { id: 'stripe', label: 'Stripe', desc: 'International Credit/Debit Cards', emoji: '🌍' },
                        { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', emoji: '💵' },
                      ].map(({ id, label, desc, emoji }) => (
                        <label key={id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === id ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}>
                          <input type="radio" name="payment" value={id} checked={paymentMethod === id}
                            onChange={() => setPaymentMethod(id)} />
                          <span className="text-2xl">{emoji}</span>
                          <div>
                            <p className="font-semibold text-sm text-[var(--text-primary)]">{label}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className="label">Order Notes (Optional)</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        className="input h-20 resize-none" placeholder="Any special instructions..." />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-secondary py-3 px-6">Back</button>
                      <button onClick={() => setStep(3)} className="btn-primary py-3 px-8">
                        Review Order <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <motion.div key="review"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="card p-6 space-y-5"
                  >
                    <h2 className="font-display text-xl font-semibold">Review Your Order</h2>
                    {/* Items */}
                    <div className="space-y-3">
                      {cart.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] overflow-hidden">
                            {item.product?.primary_image && <img src={item.product.primary_image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product?.name}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold">{format(parseFloat(item.total_price))}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setStep(2)} className="btn-secondary py-3 px-6">Back</button>
                      <button onClick={handlePlaceOrder} disabled={loading}
                        className="btn-primary py-3 px-8 flex-1 justify-center text-base">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : '🔒 Place Order'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right - Summary */}
            <div className="space-y-4">
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-[var(--text-secondary)]">
                      <span className="truncate mr-2">{item.product?.name} ×{item.quantity}</span>
                      <span className="flex-shrink-0">{format(parseFloat(item.total_price))}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span><span>{format(parseFloat(cart.subtotal))}</span>
                  </div>
                  {parseFloat(cart.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span><span>-{format(parseFloat(cart.discount_amount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Shipping</span><span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
                    <span>Total</span><span>{format(parseFloat(cart.total))}</span>
                  </div>
                </div>
                {cart.coupon && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                    🎉 Coupon <strong>{cart.coupon.code}</strong> applied — saving {format(parseFloat(cart.discount_amount))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] justify-center">
                <span>🔒</span> SSL secured checkout
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
