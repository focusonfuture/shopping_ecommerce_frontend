'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, MoreVertical, Package, Upload, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

function ProductFormModal({ product, onClose }: { product?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: product?.name || '',
    base_price: product?.base_price || '',
    compare_price: product?.compare_price || '',
    cost_price: product?.cost_price || '',
    stock_quantity: product?.stock_quantity || 0,
    description: product?.description || '',
    short_description: product?.short_description || '',
    status: product?.status || 'draft',
    is_featured: product?.is_featured || false,
    track_inventory: product?.track_inventory ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product?.id) {
        await adminApi.updateProduct(product.id, form);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(form);
        toast.success('Product created');
      }
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-display text-lg font-semibold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input" placeholder="Enter product name" required />
          </div>
          <div>
            <label className="label">Short Description</label>
            <input value={form.short_description} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
              className="input" placeholder="Brief description" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="input h-28 resize-none" placeholder="Full product description" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Price (₹) *</label>
              <input type="number" step="0.01" value={form.base_price}
                onChange={e => setForm(p => ({ ...p, base_price: e.target.value }))}
                className="input" placeholder="0.00" required />
            </div>
            <div>
              <label className="label">Compare Price</label>
              <input type="number" step="0.01" value={form.compare_price}
                onChange={e => setForm(p => ({ ...p, compare_price: e.target.value }))}
                className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Cost Price</label>
              <input type="number" step="0.01" value={form.cost_price}
                onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))}
                className="input" placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stock Quantity</label>
              <input type="number" value={form.stock_quantity}
                onChange={e => setForm(p => ({ ...p, stock_quantity: parseInt(e.target.value) || 0 }))}
                className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="input">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured}
                onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                className="w-4 h-4 rounded" />
              <span className="text-sm text-[var(--text-secondary)]">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.track_inventory}
                onChange={e => setForm(p => ({ ...p, track_inventory: e.target.checked }))}
                className="w-4 h-4 rounded" />
              <span className="text-sm text-[var(--text-secondary)]">Track Inventory</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-success',
  draft: 'badge-gray',
  archived: 'badge-warning',
};

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, statusFilter, page],
    queryFn: () => adminApi.products({ search, status: statusFilter || undefined, page }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const products = data?.results || [];
  const total = data?.count || 0;

  const handleEdit = (p: any) => { setEditProduct(p); setShowModal(true); };
  const handleAdd = () => { setEditProduct(null); setShowModal(true); };
  const handleDelete = (p: any) => {
    if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Products</h1>
            <p className="text-sm text-[var(--text-secondary)]">{total} total products</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary py-2 px-4 text-sm gap-2">
              <Upload className="w-4 h-4" /> Import
            </button>
            <button onClick={handleAdd} className="btn-primary py-2 px-4 text-sm gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..." className="input pl-9 py-2 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input py-2 px-3 text-sm w-36">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                  {['Product', 'Price', 'Stock', 'Status', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading
                  ? Array(8).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(6).fill(0).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="skeleton h-5 rounded" style={{ width: `${60 + j * 10}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : products.map((p: any) => (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="hover:bg-[var(--bg-secondary)] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] overflow-hidden flex-shrink-0">
                              {p.primary_image ? (
                                <img src={p.primary_image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-[var(--text-tertiary)]" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">{p.name}</p>
                              <p className="text-xs text-[var(--text-tertiary)]">{p.category_name || 'Uncategorized'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                          ₹{parseFloat(p.base_price).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${p.stock_quantity <= 5 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_COLORS[p.status] || 'badge-gray'}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${p.is_featured ? 'text-amber-600' : 'text-[var(--text-tertiary)]'}`}>
                            {p.is_featured ? '★ Yes' : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(p)} className="btn-ghost p-1.5 text-[var(--text-secondary)]">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(p)} className="btn-ghost p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-tertiary)]">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <ProductFormModal product={editProduct} onClose={() => { setShowModal(false); setEditProduct(null); }} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
