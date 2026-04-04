'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, CheckCircle, Truck, X, ChevronDown } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  processing: 'badge-info',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'badge-success',
  cancelled: 'badge-error',
  refunded: 'badge-gray',
};
const PAYMENT_COLORS: Record<string, string> = {
  pending: 'badge-warning',
  paid: 'badge-success',
  failed: 'badge-error',
  refunded: 'badge-gray',
};

function OrderDetailModal({ order, onClose }: { order: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number || '');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(order.id, { status: newStatus, tracking_number: tracking, note });
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      onClose();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="font-display text-lg font-semibold">Order #{order.order_number}</h2>
            <p className="text-xs text-[var(--text-tertiary)]">{format(new Date(order.created_at), 'PPP')}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status badges */}
          <div className="flex gap-3">
            <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
            <span className={`badge ${PAYMENT_COLORS[order.payment_status]}`}>{order.payment_status}</span>
            <span className="badge badge-gray">{order.payment_method}</span>
          </div>

          {/* Shipping */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
            {order.shipping_address && (
              <div className="text-sm text-[var(--text-secondary)] space-y-0.5">
                <p className="font-medium text-[var(--text-primary)]">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.line1}</p>
                {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                <p>{order.shipping_address.country}</p>
                <p>{order.shipping_address.phone}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.product_name}</p>
                    {item.variant_info && <p className="text-xs text-[var(--text-tertiary)]">{item.variant_info}</p>}
                    <p className="text-xs text-[var(--text-tertiary)]">Qty: {item.quantity} × ₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{parseFloat(item.total_price).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span><span>₹{parseFloat(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-₹{parseFloat(order.discount_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Tax</span><span>₹{parseFloat(order.tax_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-[var(--border)]">
                <span>Total</span><span>₹{parseFloat(order.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Update status */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold">Update Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input py-2 text-sm">
                  {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Tracking Number</label>
                <input value={tracking} onChange={e => setTracking(e.target.value)}
                  className="input py-2 text-sm" placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="label text-xs">Note</label>
              <input value={note} onChange={e => setNote(e.target.value)}
                className="input py-2 text-sm" placeholder="Optional note" />
            </div>
            <button onClick={updateStatus} disabled={updating} className="btn-primary py-2 px-4 text-sm">
              {updating ? 'Updating...' : 'Update Order'}
            </button>
          </div>

          {/* History */}
          {order.status_history?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Status History</h3>
              <div className="relative">
                <div className="absolute left-2.5 top-0 bottom-0 w-px bg-[var(--border)]" />
                <div className="space-y-3">
                  {order.status_history.map((h: any, i: number) => (
                    <div key={i} className="flex gap-4 pl-8 relative">
                      <div className="absolute left-0 w-5 h-5 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{h.status}</p>
                        {h.note && <p className="text-xs text-[var(--text-tertiary)]">{h.note}</p>}
                        <p className="text-xs text-[var(--text-tertiary)]">{format(new Date(h.created_at), 'PPp')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter, page],
    queryFn: () => adminApi.orders({ search, status: statusFilter || undefined, page }).then(r => r.data),
  });

  const orders = data?.results || [];
  const total = data?.count || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Orders</h1>
            <p className="text-sm text-[var(--text-secondary)]">{total} total orders</p>
          </div>
        </div>

        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search order number or email..." className="input pl-9 py-2 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input py-2 px-3 text-sm w-36">
            <option value="">All Status</option>
            {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading
                  ? Array(8).fill(0).map((_, i) => (
                      <tr key={i}>{Array(8).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="skeleton h-5 rounded w-full" /></td>
                      ))}</tr>
                    ))
                  : orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-[var(--text-primary)]">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                          {order.user?.email || 'Guest'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-[var(--text-secondary)]">
                          {order.item_count}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
                          ₹{parseFloat(order.total).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`}>{order.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${PAYMENT_COLORS[order.payment_status] || 'badge-gray'}`}>{order.payment_status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
                          {format(new Date(order.created_at), 'dd MMM yy')}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedOrder(order)} className="btn-ghost p-1.5">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-tertiary)]">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </AnimatePresence>
    </AdminLayout>
  );
}
