'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  const params = useParams();
  const locale = params.locale as string;

  const links = {
    shop: [
      { label: 'All Products', href: `/${locale}/products` },
      { label: 'New Arrivals', href: `/${locale}/products?sort=newest` },
      { label: 'Sale', href: `/${locale}/sale` },
      { label: 'Best Sellers', href: `/${locale}/products?filter=featured` },
    ],
    support: [
      { label: 'Help Centre', href: `/${locale}/help` },
      { label: 'Track Order', href: `/${locale}/account/orders` },
      { label: 'Returns', href: `/${locale}/pages/returns` },
      { label: 'Shipping Info', href: `/${locale}/pages/shipping` },
    ],
    company: [
      { label: 'About Us', href: `/${locale}/pages/about` },
      { label: 'Privacy Policy', href: `/${locale}/pages/privacy-policy` },
      { label: 'Terms & Conditions', href: `/${locale}/pages/terms` },
      { label: 'Contact Us', href: `/${locale}/contact` },
    ],
  };

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)] mt-20">
      <div className="container-shop py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[var(--text-inverse)]" />
              </div>
              <span className="font-display text-xl font-semibold">ShopElite</span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs">
              Premium online shopping experience. Discover the finest products from around the world, curated just for you.
            </p>
            <div className="mt-6 space-y-2">
              <a href="mailto:support@shopelite.com" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Mail className="w-4 h-4" /> support@shopelite.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Phone className="w-4 h-4" /> +91 98765 43210
              </a>
              <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin className="w-4 h-4" /> Mumbai, Maharashtra, India
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Facebook, href: '#', label: 'Facebook' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href}
                  className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:text-[var(--text-inverse)] hover:border-[var(--accent)] transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Shop', links: links.shop },
            { title: 'Support', links: links.support },
            { title: 'Company', links: links.company },
          ].map(({ title, links: sectionLinks }) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 tracking-wide uppercase">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {sectionLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} ShopElite. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {['Visa', 'Mastercard', 'UPI', 'Razorpay', 'Stripe'].map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded text-[var(--text-tertiary)] font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
