import { authApi, setStoredToken, clearStoredToken, getStoredToken } from './api';
import { getDemoUser, clearDemoUser } from './demo';
import type { User } from '@/types/user';

export async function getUser(): Promise<User | null> {
  // Demo mode bypass — no backend required
  const demoUser = getDemoUser();
  if (demoUser) return demoUser;

  // No token in storage → definitely not logged in
  if (!getStoredToken()) return null;

  try {
    const res = await authApi.me();
    return res.data.data as User;
  } catch {
    // Token invalid/expired — clear it
    clearStoredToken();
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  const res = await authApi.login({ email, password });
  const { token, data } = res.data as { token: string; data: User };
  setStoredToken(token);
  return data;
}

export async function logout(): Promise<void> {
  clearDemoUser();
  try { await authApi.logout(); } catch { /* ignore if no backend */ }
  clearStoredToken();
}

export function getRolePath(role: string): string {
  switch (role) {
    case 'carrier':  return '/carrier';
    case 'receiver': return '/receiver';
    case 'admin':    return '/admin';
    default:         return '/shipper';
  }
}
