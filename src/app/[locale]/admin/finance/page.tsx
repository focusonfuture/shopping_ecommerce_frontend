'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { financeApi } from '@/lib/api';

export default function AdminFinancePage() {
  const [period, setPeriod] = useState('monthly');
  const [currency, setCurrency] = useState('INR');

  const { data: pl } = useQuery({
    queryKey: ['profit-loss'],
    queryFn: () => financeApi.profitLoss().then(r => r.data),
  });

  const { data: chartData } = useQuery({
    queryKey: ['revenue-chart', period],
    queryFn: () => financeApi.revenueChart({ period }).then(r => r.data),
  });

  const { data: rates, refetch: refetchRates } = useQuery({
    queryKey: ['currency-rates'],
    queryFn: () => financeApi.currencyRates().then(r => r.data),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['top-products-finance'],
    queryFn: () => financeApi.topProducts({ limit: 10 }).then(r => r.data),
  });

  const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const pct = (n: number) => `${(n || 0).toFixed(1)}%`;

  const revenueData = Array.isArray(chartData)
    ? chartData.map((d: any) => ({
        label: new Date(d.period).toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: parseFloat(d.revenue || 0),
        orders: d.orders || 0,
      }))
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Finance</h1>
            <p className="text-sm text-[var(--text-secondary)]">Revenue, profit & loss overview</p>
          </div>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="input py-2 px-3 text-sm w-36">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* P&L Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: fmt(pl?.revenue), icon: DollarSign, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Total Cost', value: fmt(pl?.cost), icon: TrendingDown, color: 'text-amber-600 bg-amber-50' },
            { label: 'Gross Profit', value: fmt(pl?.gross_profit), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
            { label: 'Net Profit', value: fmt(pl?.net_profit), icon: TrendingUp, color: (pl?.net_profit || 0) >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-display">{value || '—'}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Margin */}
        {pl && (
          <div className="card p-5 flex items-center gap-6">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Profit Margin</p>
              <p className="text-3xl font-bold font-display text-[var(--text-primary)]">{pct(pl.margin_percent)}</p>
            </div>
            <div className="flex-1 h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(Math.max(pl.margin_percent, 0), 100)}%` }} />
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-tertiary)]">Refunds</p>
              <p className="text-sm font-semibold text-red-500">{fmt(pl.total_refunds)}</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: 12 }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Orders per Period</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: 12 }} />
                <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Currency Rates */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Currency Exchange Rates</h3>
            <button onClick={() => refetchRates()} className="btn-ghost p-2">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.isArray(rates) && rates.map((r: any) => (
              <div key={r.id} className="bg-[var(--bg-secondary)] rounded-xl p-3 text-center">
                <p className="text-xs text-[var(--text-tertiary)]">{r.from_currency} → {r.to_currency}</p>
                <p className="text-lg font-bold text-[var(--text-primary)] font-display mt-0.5">
                  {parseFloat(r.rate).toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        {Array.isArray(topProducts) && topProducts.length > 0 && (
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Top Products by Revenue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {['#', 'Product', 'Units Sold', 'Revenue'].map(h => (
                      <th key={h} className="text-left pb-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {topProducts.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="py-3 text-[var(--text-tertiary)] font-bold">{i + 1}</td>
                      <td className="py-3 font-medium text-[var(--text-primary)]">{p.product_name || p.product__name}</td>
                      <td className="py-3 text-[var(--text-secondary)]">{p.total_sold}</td>
                      <td className="py-3 font-semibold text-[var(--text-primary)]">
                        ₹{Number(p.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
