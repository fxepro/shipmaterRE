'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, DollarSign, User,
  Truck, BarChart2, Users, AlertTriangle, LogOut, Route, MapPin, Building2, FileText,
  Briefcase, PlusCircle, Radio, ClipboardList, BookOpen, Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/user';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV: Record<UserRole, { section: string; items: NavItem[] }[]> = {
  shipper: [
    {
      section: 'Overview',
      items: [{ label: 'Dashboard', href: '/shipper', icon: LayoutDashboard }],
    },
    {
      section: 'Shipments',
      items: [
        { label: 'My Shipments',  href: '/shipper/shipments',     icon: Package },
        { label: 'Route Planner', href: '/shipper/route-planner', icon: Route   },
        { label: 'Live Tracking', href: '/shipper/tracking',      icon: MapPin  },
      ],
    },
    {
      section: 'Jobs',
      items: [
        { label: 'Create Job',  href: '/shipper/jobs/contracted/new', icon: PlusCircle    },
        { label: 'My Jobs',     href: '/shipper/jobs',              icon: ClipboardList },
        { label: 'Offers',      href: '/shipper/jobs/offers',       icon: Radio         },
        { label: 'Contracted',  href: '/shipper/jobs/contracted',   icon: Briefcase     },
      ],
    },
    {
      section: 'Network',
      items: [
        { label: 'Carriers',            href: '/shipper/carriers',              icon: Truck     },
        { label: 'Contracts',           href: '/shipper/contracts',             icon: FileText  },
        { label: 'Pickup Addresses',    href: '/shipper/locations?type=pickup', icon: Warehouse },
        { label: 'Delivery Addresses',  href: '/shipper/locations',             icon: Users     },
      ],
    },
    {
      section: 'Reports',
      items: [
        { label: 'Reports', href: '/shipper/reports', icon: BarChart2 },
      ],
    },
    {
      section: 'Resources',
      items: [
        { label: 'Resources', href: '/shipper/resources', icon: BookOpen },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Payments', href: '/shipper/payments', icon: DollarSign },
        { label: 'Profile',  href: '/shipper/profile',  icon: User       },
      ],
    },
  ],
  carrier: [
    {
      section: 'Overview',
      items: [{ label: 'Dashboard', href: '/carrier', icon: LayoutDashboard }],
    },
    {
      section: 'Jobs',
      items: [
        { label: 'Available', href: '/carrier/jobs',    icon: Briefcase     },
        { label: 'My Jobs',   href: '/carrier/my-jobs', icon: ClipboardList },
        { label: 'Offers',    href: '/carrier/offers',  icon: Radio         },
      ],
    },
    {
      section: 'Reports',
      items: [
        { label: 'Reports', href: '/carrier/reports', icon: BarChart2 },
      ],
    },
    {
      section: 'Resources',
      items: [
        { label: 'Resources', href: '/carrier/resources', icon: BookOpen },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Earnings', href: '/carrier/earnings', icon: DollarSign },
        { label: 'Profile',  href: '/carrier/profile',  icon: User       },
      ],
    },
  ],
  receiver: [
    {
      section: 'Overview',
      items: [{ label: 'Dashboard', href: '/receiver', icon: LayoutDashboard }],
    },
    {
      section: 'Deliveries',
      items: [
        { label: 'My Deliveries', href: '/receiver/shipments', icon: Package },
        { label: 'Live Tracking', href: '/receiver/tracking', icon: MapPin },
      ],
    },
  ],
  admin: [
    {
      section: 'Overview',
      items: [{ label: 'Dashboard', href: '/admin', icon: BarChart2 }],
    },
    {
      section: 'Manage',
      items: [
        { label: 'Shipments', href: '/admin/shipments', icon: Package },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
      ],
    },
  ],
};

interface SidebarProps {
  role: UserRole;
  userName: string;
  /** Organization / company name. Shown above the user name.
   *  Populated when the Dispatcher layer is built (a dispatcher acts on
   *  behalf of a shipper org). Leave undefined for direct shipper/carrier users. */
  orgName?: string;
  onLogout: () => void;
}

export function Sidebar({ role, userName, orgName, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const sections = NAV[role] ?? [];

  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-[var(--color-slate)] h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-6">
        <span className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Shipmater
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-5">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <p className="mb-1.5 px-2 text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-sage-light)] opacity-60">
              {section}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const allItems = sections.flatMap((s) => s.items);
                const isActive =
                  pathname === item.href ||
                  (item.href !== `/${role}` &&
                    pathname.startsWith(item.href + '/') &&
                    !allItems.some(
                      (other) =>
                        other.href !== item.href &&
                        other.href.length > item.href.length &&
                        (pathname === other.href || pathname.startsWith(other.href + '/'))
                    ));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-[var(--color-white)] text-[var(--color-slate)] shadow-sm'
                          : 'text-[var(--color-sage-light)] hover:bg-[var(--color-slate-60)] hover:text-white'
                      )}
                    >
                      <item.icon
                        size={15}
                        className={cn(isActive ? 'text-[var(--color-teal)]' : 'opacity-70')}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer — org name slot reserved for Dispatcher layer */}
      <div className="border-t border-[var(--color-slate-60)] px-3 py-4">
        <div className="flex items-center justify-between rounded-lg px-2.5 py-2">
          <div className="min-w-0">
            {orgName && (
              <div className="mb-1 flex items-center gap-1.5">
                <Building2 size={11} className="shrink-0 text-[var(--color-teal-light)]" />
                <p className="truncate text-xs font-medium text-[var(--color-teal-light)]">{orgName}</p>
              </div>
            )}
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="text-xs capitalize text-[var(--color-text-faint)]">{role}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-faint)] hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={13} />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
