'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingCart, Users, Package, ArrowUpRight,
  ArrowDownRight, DollarSign, RefreshCw, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { financeApi } from '@/lib/api';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

function StatCard({ title, value, sub, icon: Icon, trend, color }: any) {
  const positive = trend >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] font-display">{value}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-0.5">{title}</p>
      {sub && <p className="text-xs text-[var(--text-tertiary)] mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => financeApi.dashboard().then(r => r.data),
    refetchInterval: 60_000,
  });

  const { data: chartData } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => financeApi.revenueChart({ period: 'monthly' }).then(r => r.data),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => financeApi.topProducts({ limit: 5 }).then(r => r.data),
  });

  const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const statCards = [
    {
      title: 'Total Revenue',
      value: fmt(stats?.revenue?.total || 0),
      sub: `₹${(stats?.revenue?.last_30_days || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} last 30 days`,
      icon: DollarSign,
      trend: 12,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Total Orders',
      value: (stats?.orders?.total || 0).toLocaleString(),
      sub: `${stats?.orders?.pending || 0} pending`,
      icon: ShoppingCart,
      trend: 8,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Total Customers',
      value: (stats?.users?.total || 0).toLocaleString(),
      sub: `+${stats?.users?.new_30_days || 0} this month`,
      icon: Users,
      trend: 5,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Net Profit',
      value: fmt(stats?.profit?.total || 0),
      sub: `${fmt(stats?.profit?.total_refunds || 0)} refunded`,
      icon: TrendingUp,
      trend: -2,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const revenueChartData = Array.isArray(chartData)
    ? chartData.map((d: any) => ({
        month: new Date(d.period).toLocaleString('default', { month: 'short' }),
        revenue: parseFloat(d.revenue || 0),
        orders: d.orders,
      }))
    : [];

  const pieData = [
    { name: 'Electronics', value: 40 },
    { name: 'Fashion', value: 25 },
    { name: 'Home', value: 20 },
    { name: 'Others', value: 15 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="btn-secondary py-2 px-4 text-sm gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Low stock alert */}
        {(stats?.inventory?.low_stock_count || 0) > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span className="text-amber-800">
              <strong>{stats.inventory.low_stock_count}</strong> products are running low on stock.
            </span>
            <a href="products?low_stock=true" className="ml-auto text-amber-700 underline font-medium text-xs">View All</a>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
            : statCards.map((s, i) => <StatCard key={i} {...s} />)
          }
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Revenue Overview</h3>
                <p className="text-xs text-[var(--text-tertiary)]">Monthly revenue trend</p>
              </div>
              <select className="input py-1.5 px-3 text-xs w-32">
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Daily</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: 12 }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
                  fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Sales by Category</h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">Revenue distribution</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`]} contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid var(--border)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[var(--text-secondary)]">{d.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Top Products</h3>
            {Array.isArray(topProducts) && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--text-tertiary)] w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {p.product_name || p.product__name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">{p.total_sold} sold</p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      ₹{Number(p.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-10 rounded-lg" />
                ))}
              </div>
            )}
          </div>

          {/* Orders by status */}
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Orders Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Pending', value: stats?.orders?.pending || 0, color: 'bg-amber-400', pct: 25 },
                { label: 'Processing', value: Math.round((stats?.orders?.total || 0) * 0.15), color: 'bg-blue-400', pct: 15 },
                { label: 'Shipped', value: Math.round((stats?.orders?.total || 0) * 0.30), color: 'bg-indigo-400', pct: 30 },
                { label: 'Delivered', value: Math.round((stats?.orders?.total || 0) * 0.25), color: 'bg-green-400', pct: 25 },
                { label: 'Cancelled', value: Math.round((stats?.orders?.total || 0) * 0.05), color: 'bg-red-400', pct: 5 },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">{label}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{value}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
