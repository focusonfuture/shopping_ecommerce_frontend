import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/shop/HeroSection';
import { FeaturedProducts } from '@/components/shop/FeaturedProducts';
import { CategoryGrid } from '@/components/shop/CategoryGrid';
import { TrustBadges } from '@/components/shop/TrustBadges';
import { NewsletterSection } from '@/components/shop/NewsletterSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ShopElite - Premium Online Shopping',
  description: 'Discover the latest trends in fashion, electronics, and lifestyle.',
};

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <TrustBadges />
      <FeaturedProducts />
      <CategoryGrid />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
