'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, DollarSign, User,
  Truck, BarChart2, Users, AlertTriangle, Route, MapPin, Building2, FileText,
  Briefcase, PlusCircle, Radio, ClipboardList, BookOpen, Warehouse, Palette,
  TrendingUp, Shield,
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
      section: 'Financials',
      items: [{ label: 'Payments', href: '/shipper/payments', icon: DollarSign }],
    },
    {
      section: 'Reports',
      items: [{ label: 'Reports', href: '/shipper/reports', icon: BarChart2 }],
    },
    {
      section: 'Account',
      items: [{ label: 'Profile', href: '/shipper/profile', icon: User }],
    },
    {
      section: 'Resources',
      items: [{ label: 'Resources', href: '/shipper/resources', icon: BookOpen }],
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
      section: 'Financials',
      items: [{ label: 'Earnings', href: '/carrier/earnings', icon: DollarSign }],
    },
    {
      section: 'Reports',
      items: [{ label: 'Reports', href: '/carrier/reports', icon: BarChart2 }],
    },
    {
      section: 'Account',
      items: [{ label: 'Profile', href: '/carrier/profile', icon: User }],
    },
    {
      section: 'Resources',
      items: [{ label: 'Resources', href: '/carrier/resources', icon: BookOpen }],
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
      section: 'Resources',
      items: [
        { label: 'Resources', href: '/shipper/resources',  icon: BookOpen },
        { label: 'Admin',     href: '/admin/resources',    icon: Shield  },
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
        { label: 'Payments',         href: '/shipper/payments',            icon: DollarSign      },
        { label: 'Reports',          href: '/shipper/reports',             icon: BarChart2       },
        { label: 'Profile',          href: '/shipper/profile',             icon: User            },
        { label: 'Resources',        href: '/shipper/resources',           icon: BookOpen        },
      ],
    },
    {
      section: 'Carrier View',
      items: [
        { label: 'Dashboard',   href: '/carrier',           icon: LayoutDashboard },
        { label: 'Available',   href: '/carrier/jobs',      icon: Briefcase       },
        { label: 'My Jobs',     href: '/carrier/my-jobs',   icon: ClipboardList   },
        { label: 'Offers',      href: '/carrier/offers',    icon: Radio           },
        { label: 'Earnings',    href: '/carrier/earnings',  icon: DollarSign      },
        { label: 'Profile',     href: '/carrier/profile',   icon: User            },
        { label: 'Resources',   href: '/carrier/resources', icon: BookOpen        },
      ],
    },
  ],
};

interface SidebarProps {
  role: UserRole;
  /** True when the user's org is a white-label platform tenant */
  isPlatformTenant?: boolean;
  /** Tenant's custom brand name — replaces "Shipmater" in the wordmark */
  brandName?: string;
  /** Tenant's logo URL for dark backgrounds */
  logoUrl?: string;
}

export function Sidebar({ role, isPlatformTenant, brandName, logoUrl }: SidebarProps) {
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
      className="sidebar-scroll hidden md:flex flex-col w-[224px] shrink-0 h-screen sticky top-0 overflow-y-auto"
      style={{ background: 'var(--primary)', fontFamily: 'var(--font-sans)' }}
    >
      {/* Brand header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={brandName ?? 'Logo'} className="h-7 object-contain" />
        ) : (
          <div className="flex items-center gap-2">
            {/* Icon placeholder when no logo */}
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--on-dark)' }}
            >
              {(brandName ?? 'S').charAt(0).toUpperCase()}
            </div>
            <span
              style={{
                fontSize: 'var(--text-nav)', fontWeight: 500, color: 'var(--on-dark)',
                letterSpacing: '0.04em', lineHeight: 1.3,
              }}
            >
              {brandName ?? 'Shipmater'}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2.5 space-y-2.5">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <p
              className="mb-0.5 px-2 text-caption font-medium uppercase"
              style={{ letterSpacing: '0.08em', color: 'var(--on-dark-muted)', opacity: 0.75 }}
            >
              {section}
            </p>
            <ul className="space-y-0">
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
                        'group flex items-center gap-2 rounded-md px-2 py-1.5 font-medium transition-colors',
                        isActive ? 'shadow-sm' : 'hover:bg-white/12'
                      )}
                      style={{
                        background: isActive ? 'var(--navy)' : 'transparent',
                        color:      isActive ? 'var(--on-dark)' : 'var(--on-dark-muted)',
                        fontSize: 'var(--text-nav)',
                        fontWeight: 500,
                      }}
                    >
                      <item.icon
                        size={15}
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
