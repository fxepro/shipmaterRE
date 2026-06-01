'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            background: 'var(--color-white)',
            border: '1px solid var(--color-cream-dark)',
            color: 'var(--color-text)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
