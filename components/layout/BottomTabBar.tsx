'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Radio, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/user';

const TABS: Record<UserRole, { label: string; href: string; icon: React.ElementType }[]> = {
  shipper: [
    { label: 'Home',      href: '/shipper',           icon: LayoutDashboard },
    { label: 'Shipments', href: '/shipper/shipments',  icon: Package },
    { label: 'Bids',      href: '/shipper/bids',       icon: Radio },
    { label: 'Account',   href: '/shipper/payments',   icon: User },
  ],
  carrier: [
    { label: 'Home',    href: '/carrier',          icon: LayoutDashboard },
    { label: 'Jobs',    href: '/carrier/jobs',      icon: Package },
    { label: 'My Jobs', href: '/carrier/my-jobs',   icon: Radio },
    { label: 'Account', href: '/carrier/profile',   icon: User },
  ],
  receiver: [
    { label: 'Home',      href: '/receiver',            icon: LayoutDashboard },
    { label: 'Deliveries',href: '/receiver/shipments',  icon: Package },
    { label: 'Account',   href: '/receiver',             icon: User },
    { label: '',          href: '/receiver',             icon: LayoutDashboard },
  ],
  admin: [
    { label: 'Home',     href: '/admin',           icon: LayoutDashboard },
    { label: 'Ships',    href: '/admin/shipments',  icon: Package },
    { label: 'Users',    href: '/admin/users',      icon: User },
    { label: 'Disputes', href: '/admin/disputes',   icon: Radio },
  ],
};

export function BottomTabBar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const tabs = TABS[role];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--color-cream-dark)] bg-[var(--color-white)]">
      {tabs.filter(t => t.label).map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== `/${role}` && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href + tab.label}
            href={tab.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
              isActive ? 'text-[var(--color-teal)]' : 'text-[var(--color-text-faint)]'
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
