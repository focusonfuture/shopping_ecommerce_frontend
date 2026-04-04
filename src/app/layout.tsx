import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: { default: 'ShopElite - Premium Online Shopping', template: '%s | ShopElite' },
  description: 'Shop the latest fashion, electronics, home & lifestyle products online at the best prices.',
  keywords: ['shopping', 'ecommerce', 'fashion', 'electronics', 'india'],
  authors: [{ name: 'ShopElite' }],
  openGraph: {
    type: 'website',
    siteName: 'ShopElite',
    title: 'ShopElite - Premium Online Shopping',
    description: 'Shop the latest products at the best prices.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
