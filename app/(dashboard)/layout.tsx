'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { getUser, logout } from '@/lib/auth';
import { api } from '@/lib/api';
import type { User } from '@/types/user';

interface TenantBranding {
  brand_name: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url_dark: string | null;
  favicon_url: string | null;
  hide_powered_by: boolean;
}

function applyBranding(b: TenantBranding) {
  const root = document.documentElement;
  if (b.primary_color)   root.style.setProperty('--primary', b.primary_color);
  if (b.secondary_color) root.style.setProperty('--navy',    b.secondary_color);
  if (b.favicon_url) {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (link) link.href = b.favicon_url;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const router = useRouter();

  useEffect(() => {
    getUser().then((u) => {
      if (!u) { router.replace('/login'); return; }
      setUser(u);

      // If the org is a white-label tenant, fetch and apply its branding
      if (u.org?.is_platform_tenant) {
        api.get('/api/v1/tenant/branding').then((res) => {
          const b: TenantBranding | null = res.data?.data ?? null;
          if (b) { applyBranding(b); setBranding(b); }
        }).catch(() => { /* ignore — branding is non-critical */ });
      }
    });
  }, [router]);

  async function handleLogout() {
    // Reset any applied branding back to defaults
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--navy');
    await logout();
    router.replace('/login');
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const brandName = branding?.brand_name ?? undefined;
  const logoUrl   = branding?.logo_url_dark ?? undefined;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar
        role={user.role}
        userName={user.name}
        orgName={user.org?.name}
        isPlatformTenant={user.org?.is_platform_tenant ?? false}
        brandName={brandName}
        logoUrl={logoUrl}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar role={user.role} userName={user.name} onLogout={handleLogout} />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <BottomTabBar role={user.role} />
    </div>
  );
}
