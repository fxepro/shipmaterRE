'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { getUser, logout, getRolePath } from '@/lib/auth';
import type { User } from '@/types/user';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    getUser().then((u) => {
      if (!u) { router.replace('/login'); return; }
      setUser(u);
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-cream)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-teal)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-cream)]">
      <Sidebar role={user.role} userName={user.name} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar role={user.role} userName={user.name} />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <BottomTabBar role={user.role} />
    </div>
  );
}
