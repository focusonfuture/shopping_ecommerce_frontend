'use client';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cmsApi } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, Layout, Image } from 'lucide-react';

export default function AdminCMSPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { data: pages } = useQuery({ queryKey: ['admin-pages'], queryFn: () => cmsApi.pages().then(r => r.data) });
  const { data: sections } = useQuery({ queryKey: ['admin-sections'], queryFn: () => cmsApi.homepageSections().then(r => r.data) });
  const allPages = Array.isArray(pages) ? pages : (pages?.results || []);
  const allSections = Array.isArray(sections) ? sections : [];
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">CMS Management</h1>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-indigo-600" /><h3 className="font-semibold">Pages</h3></div>
            <div className="space-y-2">
              {allPages.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--text-primary)]">{p.title}</span>
                  <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-gray'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><Layout className="w-5 h-5 text-amber-600" /><h3 className="font-semibold">Homepage Sections</h3></div>
            <div className="space-y-2">
              {allSections.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm capitalize text-[var(--text-primary)]">{s.title || s.type}</span>
                  <span className={`badge ${s.is_active ? 'badge-success' : 'badge-gray'}`}>{s.is_active ? 'Active' : 'Hidden'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4"><Image className="w-5 h-5 text-green-600" /><h3 className="font-semibold">Quick Actions</h3></div>
            <div className="space-y-2">
              {[['Add Page','/cms/pages/new'],['Add Banner','/cms/banners/new'],['Edit Menu','/cms/menus'],['Site Settings','/admin/settings']].map(([label, href]) => (
                <button key={label} className="w-full btn-secondary text-sm py-2 text-left">{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
