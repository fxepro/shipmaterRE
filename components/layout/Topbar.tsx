'use client';

import { Bell } from 'lucide-react';
import type { UserRole } from '@/types/user';

const ROLE_TITLE: Record<UserRole, string> = {
  shipper:  'Shipper Portal',
  carrier:  'Carrier Portal',
  receiver: 'My Deliveries',
  admin:    'Admin Console',
};

interface TopbarProps {
  role: UserRole;
  userName: string;
}

export function Topbar({ role, userName }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-cream-dark)] bg-[var(--color-white)] px-6">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">{ROLE_TITLE[role]}</p>
      <div className="flex items-center gap-4">
        <button className="relative text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors">
          <Bell size={16} />
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-slate)] text-xs font-medium text-white">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
