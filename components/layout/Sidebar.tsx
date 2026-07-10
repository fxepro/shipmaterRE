'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, DollarSign, User,
  Truck, BarChart2, Users, AlertTriangle, Route, MapPin, Building2, FileText,
  Briefcase, PlusCircle, Radio, ClipboardList, BookOpen, Warehouse, Palette,
  TrendingUp,
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
      items: [{ label: 'Reports', href: '/shipper/reports', icon: BarChart2 }],
    },
    {
      section: 'Resources',
      items: [{ label: 'Resources', href: '/shipper/resources', icon: BookOpen }],
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
      items: [{ label: 'Reports', href: '/carrier/reports', icon: BarChart2 }],
    },
    {
      section: 'Resources',
      items: [{ label: 'Resources', href: '/carrier/resources', icon: BookOpen }],
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
        { label: 'Live Tracking', href: '/receiver/tracking',  icon: MapPin  },
      ],
    },
  ],
  admin: [
    {
      section: 'Console',
      items: [{ label: 'Dashboard', href: '/admin', icon: BarChart2 }],
    },
    {
      section: 'Manage',
      items: [
        { label: 'Shipments',     href: '/admin/shipments', icon: Package       },
        { label: 'Users',         href: '/admin/users',     icon: Users         },
        { label: 'Disputes',      href: '/admin/disputes',  icon: AlertTriangle },
        { label: 'Carrier Queue', href: '/admin/carriers',  icon: Truck         },
        { label: 'Shipper Queue', href: '/admin/shippers',  icon: Building2     },
      ],
    },
    {
      section: 'Platform',
      items: [
        { label: 'Organizations', href: '/admin/orgs',        icon: Building2  },
        { label: 'Financials',    href: '/admin/financials',   icon: TrendingUp },
        { label: 'Blog',          href: '/admin/blog',         icon: BookOpen   },
      ],
    },
    {
      section: 'Shipper View',
      items: [
        { label: 'Dashboard',        href: '/shipper',                     icon: LayoutDashboard },
        { label: 'My Shipments',     href: '/shipper/shipments',           icon: Package         },
        { label: 'Create Job',       href: '/shipper/jobs/contracted/new', icon: PlusCircle      },
        { label: 'My Jobs',          href: '/shipper/jobs',                icon: ClipboardList   },
        { label: 'Offers',           href: '/shipper/jobs/offers',         icon: Radio           },
        { label: 'Contracted',       href: '/shipper/jobs/contracted',     icon: Briefcase       },
        { label: 'Carriers',         href: '/shipper/carriers',            icon: Truck           },
        { label: 'Contracts',        href: '/shipper/contracts',           icon: FileText        },
        { label: 'Locations',        href: '/shipper/locations',           icon: Warehouse       },
        { label: 'Route Planner',    href: '/shipper/route-planner',       icon: Route           },
        { label: 'Live Tracking',    href: '/shipper/tracking',            icon: MapPin          },
        { label: 'Reports',          href: '/shipper/reports',             icon: BarChart2       },
        { label: 'Payments',         href: '/shipper/payments',            icon: DollarSign      },
        { label: 'Profile',          href: '/shipper/profile',             icon: User            },
      ],
    },
    {
      section: 'Carrier View',
      items: [
        { label: 'Dashboard',   href: '/carrier',          icon: LayoutDashboard },
        { label: 'Available',   href: '/carrier/jobs',     icon: Briefcase       },
        { label: 'My Jobs',     href: '/carrier/my-jobs',  icon: ClipboardList   },
        { label: 'Offers',      href: '/carrier/offers',   icon: Radio           },
        { label: 'Earnings',    href: '/carrier/earnings', icon: DollarSign      },
        { label: 'Profile',     href: '/carrier/profile',  icon: User            },
      ],
    },
  ],
};

interface SidebarProps {
  role: UserRole;
  userName: string;
  orgName?: string;
  /** True when the user's org is a white-label platform tenant */
  isPlatformTenant?: boolean;
  /** Tenant's custom brand name — replaces "Shipmater" in the wordmark */
  brandName?: string;
  /** Tenant's logo URL for dark backgrounds */
  logoUrl?: string;
}

export function Sidebar({ role, userName, orgName, isPlatformTenant, brandName, logoUrl }: SidebarProps) {
  const pathname = usePathname();

  const baseSections = NAV[role] ?? [];
  // For platform tenants, inject Branding into the Account section
  const sections = isPlatformTenant && role === 'shipper'
    ? baseSections.map((s) =>
        s.section === 'Account'
          ? { ...s, items: [...s.items, { label: 'Branding', href: '/shipper/branding', icon: Palette }] }
          : s
      )
    : baseSections;

  const allItems = sections.flatMap((s) => s.items);

  return (
    <aside
      className="hidden md:flex flex-col w-[224px] shrink-0 h-screen sticky top-0 overflow-y-auto"
      style={{ background: 'var(--primary)', fontFamily: 'var(--font-sans)' }}
    >
      {/* Brand header */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={brandName ?? 'Logo'} className="h-8 object-contain" />
        ) : (
          <div className="flex items-center gap-2.5">
            {/* Icon placeholder when no logo */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--on-dark)' }}
            >
              {(brandName ?? 'S').charAt(0).toUpperCase()}
            </div>
            <span
              style={{
                fontSize: 15, fontWeight: 700, color: 'var(--on-dark)',
                letterSpacing: '0.04em',
              }}
            >
              {brandName ?? 'Shipmater'}
            </span>
          </div>
        )}
        {/* Company / org name shown under brand when set */}
        {orgName && (
          <p className="mt-1.5 truncate text-[11px]" style={{ color: 'rgba(255,255,255,0.50)' }}>
            {orgName}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <p
              className="mb-1.5 px-2 text-[11px] font-medium uppercase"
              style={{ letterSpacing: '0.08em', color: 'var(--on-dark-muted)', opacity: 0.75 }}
            >
              {section}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
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
                        'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors',
                        isActive ? 'shadow-sm' : 'hover:bg-white/12'
                      )}
                      style={{
                        background: isActive ? 'var(--navy)' : 'transparent',
                        color:      isActive ? 'var(--on-dark)' : 'var(--on-dark-muted)',
                      }}
                    >
                      <item.icon
                        size={16}
                        style={{ color: isActive ? '#FFFFFF' : 'var(--on-dark-muted)', opacity: isActive ? 1 : 0.85 }}
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

    </aside>
  );
}
