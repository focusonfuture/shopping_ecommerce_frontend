'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ShoppingBag, Search, Heart, User, Menu, X, ChevronDown,
  Globe, DollarSign, Bell, LogOut, Package, Settings, LayoutDashboard
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore, useUIStore } from '@/store/uiStore';
import { cmsApi } from '@/lib/api';

const CURRENCIES = ['INR', 'USD', 'EUR'];
const LOCALES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export function Navbar() {
  const t = useTranslations('nav');
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;

  const { cart, fetchCart, openCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { currency, setCurrency } = useCurrencyStore();
  const { toggleSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCart();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    import('@/lib/api').then(({ productsApi }) => {
      productsApi.categories().then(({ data }) => setCategories(data)).catch(() => {});
    });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { closeMobileMenu(); }, [pathname]);

  const itemCount = cart?.item_count || 0;

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/products`, label: t('products') },
    { href: `/${locale}/sale`, label: t('sale'), highlight: true },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)] shadow-sm'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="container-shop">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[var(--text-inverse)]" />
              </div>
              <span className="font-display text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                ShopElite
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    link.highlight
                      ? 'text-amber-600 hover:bg-amber-50'
                      : pathname === link.href
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 flex items-center gap-1 ${
                    pathname.includes('/categories')
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {t('categories')} <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-64 card shadow-xl p-2 z-50 grid grid-cols-1"
                    >
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/${locale}/categories/${cat.slug}`}
                            onClick={() => setCategoriesOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
                          >
                            {cat.image && <img src={cat.image} className="w-8 h-8 rounded-md object-cover" alt="" />}
                            <span className="font-medium">{cat.name}</span>
                          </Link>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-[var(--text-tertiary)]">Loading categories...</p>
                      )}
                      <div className="border-t border-[var(--border)] mt-1 pt-1">
                        <Link href={`/${locale}/categories`} onClick={() => setCategoriesOpen(false)}
                          className="block px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--bg-secondary)] rounded-lg text-center uppercase tracking-wider">
                          View All Categories
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {/* Currency Switcher */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }}
                  className="btn-ghost px-3 py-2 text-xs font-semibold gap-1"
                >
                  {currency} <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {currencyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-28 card shadow-lg py-1 z-50"
                    >
                      {CURRENCIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors ${
                            currency === c ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Switcher */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }}
                  className="btn-ghost p-2"
                >
                  <Globe className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-40 card shadow-lg py-1 z-50"
                    >
                      {LOCALES.map((l) => (
                        <Link
                          key={l.code}
                          href={pathname.replace(`/${locale}`, `/${l.code}`)}
                          onClick={() => setLangOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors ${
                            locale === l.code ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          <span>{l.flag}</span> {l.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <button onClick={toggleSearch} className="btn-ghost p-2">
                <Search className="w-4 h-4" />
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link href={`/${locale}/account/wishlist`} className="btn-ghost p-2 relative">
                  <Heart className="w-4 h-4" />
                </Link>
              )}

              {/* Cart */}
              <button onClick={openCart} className="btn-ghost p-2 relative">
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--accent)] text-[var(--text-inverse)] text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center ml-1 hover:ring-2 hover:ring-[var(--accent)] transition-all"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 card shadow-lg py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-[var(--border)]">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.full_name}</p>
                          <p className="text-xs text-[var(--text-tertiary)] truncate">{user?.email}</p>
                        </div>
                        {user?.role === 'admin' && (
                          <Link href={`/${locale}/admin`} onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <Link href={`/${locale}/account`} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        <Link href={`/${locale}/account/orders`} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                        <div className="border-t border-[var(--border)] mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href={`/${locale}/login`} className="hidden md:flex btn-primary btn-sm ml-2">
                  {t('login')}
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button onClick={toggleMobileMenu} className="btn-ghost p-2 lg:hidden ml-1">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)] overflow-hidden"
            >
              <div className="container-shop py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}
                    className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      link.highlight ? 'text-amber-600' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Categories */}
                <div className="px-4 py-2">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 ml-1">Categories</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 6).map((cat) => (
                      <Link key={cat.id} href={`/${locale}/categories/${cat.slug}`}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)]"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link href={`/${locale}/categories`} className="flex items-center justify-center p-2 rounded-lg bg-[var(--bg-tertiary)] text-[10px] font-bold text-[var(--text-primary)] uppercase">
                      All Categories
                    </Link>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex gap-2 overflow-x-auto pb-2 px-4 no-scrollbar">
                  {CURRENCIES.map((c) => (
                    <button key={c} onClick={() => setCurrency(c)}
                      className={`px-3 py-1.5 text-xs font-medium flex-shrink-0 rounded-lg border transition-colors ${
                        currency === c ? 'bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >{c}</button>
                  ))}
                </div>
                {!isAuthenticated && (
                  <div className="pt-2 flex gap-2 px-4">
                    <Link href={`/${locale}/login`} className="btn-primary flex-1 text-center py-3">Sign In</Link>
                    <Link href={`/${locale}/register`} className="btn-secondary flex-1 text-center py-3">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      <div className="h-16 lg:h-18" />
    </>
  );
}
