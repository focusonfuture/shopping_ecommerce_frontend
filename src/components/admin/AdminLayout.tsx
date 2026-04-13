'use client';
import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  FileText, Settings, Menu, X, ShoppingBag, Bell, ChevronRight,
  TrendingUp, Tag, Globe, LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: 'products', icon: Package, label: 'Products' },
  { href: 'orders', icon: ShoppingCart, label: 'Orders' },
  { href: 'customers', icon: Users, label: 'Customers' },
  { href: 'finance', icon: BarChart3, label: 'Finance' },
  { href: 'cms', icon: FileText, label: 'CMS' },
  { href: 'coupons', icon: Tag, label: 'Coupons' },
  { href: 'settings', icon: Settings, label: 'Settings' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = params.locale as string;
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace(`/${locale}/login`);
    }
  }, [isAuthenticated, user]);

  const getActive = (href: string) => pathname.includes(`/admin/${href}`);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  const Sidebar = () => (
    <div className={`flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)]">
        <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-[var(--text-inverse)]" />
        </div>
        {sidebarOpen && <span className="font-display text-lg font-semibold text-[var(--text-primary)]">ShopElite</span>}
      </div>

      {/* Admin badge */}
      {sidebarOpen && (
        <div className="mx-3 mt-4 px-3 py-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">Admin Panel</p>
          <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 mt-2 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = getActive(href);
          return (
            <Link key={href} href={`/${locale}/admin/${href}`}
              className={`admin-nav-item ${active ? 'active' : ''}`}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="flex-1">{label}</span>}
              {sidebarOpen && active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--border)] space-y-0.5">
        <Link href={`/${locale}`}
          className="admin-nav-item" title={!sidebarOpen ? 'View Store' : undefined}>
          <Globe className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>View Store</span>}
        </Link>
        <button onClick={handleLogout}
          className="admin-nav-item w-full text-red-500 hover:bg-red-50" title={!sidebarOpen ? 'Logout' : undefined}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-4 flex items-center justify-center border-t border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--bg-secondary)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
            <motion.div initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden w-60">
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2 lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            {navItems.find(n => getActive(n.href)) ? (
              <>
                <span>Admin</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[var(--text-primary)] font-medium capitalize">
                  {navItems.find(n => getActive(n.href))?.label}
                </span>
              </>
            ) : <span className="text-[var(--text-primary)] font-medium">Dashboard</span>}
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost p-2 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
