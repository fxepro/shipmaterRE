'use client';

import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import type { User } from '@/types/user';

export default function AdminUsersPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/v1/admin/users'),
  });

  const users: User[] = res?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="page-title">User Management</h1>

      {isLoading ? (
        <div className="skeleton h-64 rounded-xl" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-cream-dark)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-cream-dark)] bg-[var(--color-slate)]">
                {['Name', 'Email', 'Role', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-sage-light)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={`border-b border-[var(--color-cream-dark)] bg-[var(--color-white)] hover:bg-[var(--color-cream)] transition-colors ${i === users.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{u.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-[var(--color-text-muted)]">{u.role}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
