'use client';
import { AdminLayout } from '@/components/admin/AdminLayout';
export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <div className="grid lg:grid-cols-2 gap-6">
          {[{title:'General',fields:[['Site Name','text','ShopElite'],['Site Tagline','text','Premium Shopping'],['Support Email','email','support@shopelite.com'],['Support Phone','text','+91 98765 43210']]},
            {title:'Currency & Tax',fields:[['Base Currency','text','INR'],['Free Shipping Threshold','number','999']]},
          ].map(({title, fields}) => (
            <div key={title} className="card p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">{title}</h3>
              <div className="space-y-3">
                {fields.map(([label, type, placeholder]) => (
                  <div key={label as string}><label className="label">{label as string}</label>
                    <input type={type as string} placeholder={placeholder as string} className="input" /></div>
                ))}
              </div>
              <button className="btn-primary mt-4 py-2 px-6 text-sm">Save {title}</button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
