import { authApi, setStoredToken, clearStoredToken, getStoredToken } from './api';
import { getDemoUser, clearDemoUser } from './demo';
import type { User } from '@/types/user';

export async function getUser(): Promise<User | null> {
  const demoUser = getDemoUser();
  if (demoUser) {
    console.log('[auth] demo mode – user:', demoUser.email);
    return demoUser;
  }

  const token = getStoredToken();
  console.log('[auth] getUser – token in storage:', token ? `${token.slice(0, 30)}…` : 'NONE');
  if (!token) return null;

  try {
    const res = await authApi.me();
    const user = res.data.data as User;
    console.log('[auth] me() OK – user:', user?.email, 'role:', user?.role);
    return user;
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status;
    console.error('[auth] me() FAILED – status:', status, e);
    clearStoredToken();
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  console.log('[auth] login attempt for', email);
  const res = await authApi.login({ email, password });
  console.log('[auth] login raw response:', res.data);
  const { token, data } = res.data as { token: string; data: User };
  console.log('[auth] token received:', token ? `${token.slice(0, 30)}…` : 'MISSING');
  setStoredToken(token);
  console.log('[auth] token stored. Reading back:', getStoredToken()?.slice(0, 30));
  return data;
}

export async function logout(): Promise<void> {
  clearDemoUser();
  try { await authApi.logout(); } catch { /* ignore */ }
  clearStoredToken();
  console.log('[auth] logged out – token cleared');
}

export function getRolePath(role: string): string {
  switch (role) {
    case 'carrier':  return '/carrier';
    case 'receiver': return '/receiver';
    case 'admin':    return '/admin';
    default:         return '/shipper';
  }
}
