'use client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tag } from 'lucide-react';
export default function AdminCouponsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Coupons</h1>
          <button className="btn-primary py-2 px-4 text-sm gap-2"><Tag className="w-4 h-4"/> Add Coupon</button>
        </div>
        <div className="card p-8 text-center text-[var(--text-secondary)]">
          <Tag className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)]"/>
          <p className="text-sm">Coupon management coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}
