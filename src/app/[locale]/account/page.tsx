'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Package, MapPin, Heart, Bell, Settings, LogOut, ChevronRight, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
import { ordersApi } from '@/lib/api';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'bg-purple-100 text-purple-700', delivered: 'badge-success',
  cancelled: 'badge-error', refunded: 'badge-gray',
};

const TABS = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function AccountPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [profileForm, setProfileForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) {
    router.push(`/${locale}/login`);
    return null;
  }

  const { data: ordersData } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.list().then(r => r.data),
    enabled: activeTab === 'orders',
  });

  const orders = ordersData?.results || [];

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(profileForm);
    } catch {}
    setSaving(false);
  };

  return (
    <main>
      <Navbar />
      <div className="container-shop py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-lg font-semibold text-[var(--text-secondary)]">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{user?.full_name}</p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate max-w-[150px]">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}>
                    <Icon className="w-4 h-4" />{label}
                    {activeTab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
                <button onClick={() => logout().then(() => router.push(`/${locale}`))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">My Orders</h2>
                {orders.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Package className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                    <p className="font-semibold text-[var(--text-primary)]">No orders yet</p>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">Start shopping to see your orders here</p>
                    <Link href={`/${locale}/products`} className="btn-primary">Shop Now</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="card p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-mono font-semibold text-[var(--text-primary)]">{order.order_number}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{format(new Date(order.created_at), 'PPP')}</p>
                          </div>
                          <div className="text-right">
                            <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`}>{order.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[var(--text-secondary)]">{order.item_count} item{order.item_count !== 1 ? 's' : ''}</p>
                            <p className="font-semibold text-[var(--text-primary)]">₹{parseFloat(order.total).toLocaleString('en-IN')}</p>
                          </div>
                          <Link href={`/${locale}/account/orders/${order.id}`} className="btn-secondary py-2 px-4 text-xs">
                            View Details
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-6">Personal Information</h2>
                <div className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">First Name</label>
                      <input value={profileForm.first_name} onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))} className="input" /></div>
                    <div><label className="label">Last Name</label>
                      <input value={profileForm.last_name} onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))} className="input" /></div>
                  </div>
                  <div><label className="label">Email Address</label>
                    <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" /></div>
                  <div><label className="label">Phone</label>
                    <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="input" placeholder="+91 00000 00000" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Preferred Language</label>
                      <select className="input">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                    <div><label className="label">Preferred Currency</label>
                      <select className="input">
                        <option>INR</option><option>USD</option><option>EUR</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handleSaveProfile} disabled={saving} className="btn-primary py-3 px-8">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Saved Addresses</h2>
                  <button className="btn-primary py-2 px-4 text-sm">+ Add Address</button>
                </div>
                <div className="card p-8 text-center text-[var(--text-secondary)]">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)]" />
                  <p className="text-sm">No saved addresses yet</p>
                </div>
              </div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">My Wishlist</h2>
                <div className="card p-8 text-center text-[var(--text-secondary)]">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)]" />
                  <p className="text-sm">Your wishlist is empty</p>
                  <Link href={`/${locale}/products`} className="btn-primary mt-4 inline-flex">Explore Products</Link>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">Notifications</h2>
                <div className="card p-8 text-center text-[var(--text-secondary)]">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)]" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
