'use client';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { SearchModal } from '@/components/shop/SearchModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function AuthInitializer() {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) fetchProfile();
  }, []);
  return null;
}

export function Providers({ children, messages, locale }: {
  children: React.ReactNode;
  messages: any;
  locale: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        {children}
        <CartDrawer />
        <SearchModal />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '14px',
              boxShadow: 'var(--shadow)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
