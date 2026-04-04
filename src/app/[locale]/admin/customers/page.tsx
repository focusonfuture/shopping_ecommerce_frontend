'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminApi.users({ search, page }).then(r => r.data),
  });
  const users = data?.results || [];
  const total = data?.count || 0;
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Customers</h1>
          <p className="text-sm text-[var(--text-secondary)]">{total} total customers</p></div>
        <div className="card p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input pl-9 py-2 text-sm" /></div>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              {['Name','Email','Role','Verified','Joined'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">{h}</th>
              ))}</tr></thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? Array(8).fill(0).map((_,i) => <tr key={i}>{Array(5).fill(0).map((_,j) => <td key={j} className="px-4 py-3"><div className="skeleton h-5 rounded" /></td>)}</tr>) :
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{u.full_name || `${u.first_name} ${u.last_name}`}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{u.email}</td>
                    <td className="px-4 py-3"><span className="badge badge-gray capitalize">{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${u.is_email_verified ? 'badge-success' : 'badge-warning'}`}>{u.is_email_verified ? 'Yes' : 'No'}</span></td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">{format(new Date(u.created_at), 'dd MMM yyyy')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {total > 20 && (
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--border)]">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p+1)} disabled={page*20>=total} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
