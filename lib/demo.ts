import type { User } from '@/types/user';

const DEMO_USERS: Record<string, User> = {
  shipper: {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex@demo.com',
    role: 'shipper',
    created_at: '2025-01-01',
  },
  carrier: {
    id: 2,
    name: 'Jordan Reyes',
    email: 'jordan@demo.com',
    role: 'carrier',
    created_at: '2025-01-01',
  },
  receiver: {
    id: 3,
    name: 'Sam Chen',
    email: 'sam@demo.com',
    role: 'receiver',
    created_at: '2025-01-01',
  },
  admin: {
    id: 4,
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'admin',
    created_at: '2025-01-01',
  },
};

const KEY = 'shipmater_demo_user';

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(KEY);
}

export function getDemoUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
}

export function setDemoUser(role: string): User {
  const user = DEMO_USERS[role] ?? DEMO_USERS.shipper;
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function clearDemoUser(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY);
}
