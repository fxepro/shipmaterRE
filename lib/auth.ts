import { authApi } from './api';
import { getDemoUser, clearDemoUser } from './demo';
import type { User } from '@/types/user';

export async function getUser(): Promise<User | null> {
  // Demo mode bypass — no backend required
  const demoUser = getDemoUser();
  if (demoUser) return demoUser;

  try {
    const res = await authApi.me();
    return res.data.data as User;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  await authApi.login({ email, password });
  const user = await getUser();
  if (!user) throw new Error('Login failed');
  return user;
}

export async function logout(): Promise<void> {
  clearDemoUser();
  try { await authApi.logout(); } catch { /* ignore if no backend */ }
}

export function getRolePath(role: string): string {
  switch (role) {
    case 'carrier':  return '/carrier';
    case 'receiver': return '/receiver';
    case 'admin':    return '/admin';
    default:         return '/shipper';
  }
}
