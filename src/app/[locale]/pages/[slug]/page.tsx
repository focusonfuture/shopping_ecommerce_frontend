'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Home, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { cmsApi } from '@/lib/api';

export default function CMSPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['cms-page', slug, locale],
    queryFn: () => cmsApi.page(slug).then(r => r.data),
    retry: 1,
  });

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="container-shop py-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">
            <Link href={`/${locale}`} className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--text-secondary)] capitalize">{slug.replace(/-/g, ' ')}</span>
          </nav>
        </div>
      </div>

      <div className="container-shop py-16 lg:py-24">
        {isLoading ? (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="skeleton h-12 w-3/4 rounded-lg" />
              <div className="skeleton h-4 w-1/4 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton h-4 w-full rounded" />
              ))}
            </div>
          </div>
        ) : error || !page ? (
          <div className="max-w-3xl mx-auto text-center py-20">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Page Not Found</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link href={`/${locale}`} className="btn-primary">
              Back to Home
            </Link>
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-3xl mx-auto"
          >
            <header className="mb-12">
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-4">
                {page.title}
              </h1>
              {page.updated_at && (
                <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-2">
                  Last updated: {new Date(page.updated_at).toLocaleDateString(locale, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              )}
            </header>

            <div
              className="prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-semibold prose-a:text-[var(--accent)] prose-img:rounded-2xl max-w-none text-[var(--text-secondary)] leading-[1.8]"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </motion.article>
        )}
      </div>

      <Footer />
    </main>
  );
}

