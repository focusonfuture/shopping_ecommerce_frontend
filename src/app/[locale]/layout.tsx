import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Providers } from '@/components/Providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) notFound();

  let messages;
  try {
    messages = (await import(`@/locales/${locale}/common.json`)).default;
  } catch {
    notFound();
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
