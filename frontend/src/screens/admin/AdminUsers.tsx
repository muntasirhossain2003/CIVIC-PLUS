import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import type { User, UserRole } from '../../types';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { RolePill } from '../../components/ui/RolePill';
import { useIsMobile } from '../../lib/useIsMobile';
import { Search, UserCheck } from 'lucide-react';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AdminUsers() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | UserRole>('');

  const { data, isLoading } = useQuery<{ data: User[]; total: number }>({
    queryKey: ['admin-users', { search, role: roleFilter }],
    queryFn: () => adminApi.listUsers({ search: search || undefined, role: roleFilter || undefined }).then((r) => r.data),
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => adminApi.updateUser(id, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users: User[] = data?.data ?? [];

  const roleOptions: ('' | UserRole)[] = ['', 'citizen', 'staff', 'admin'];

  return (
    <div style={{ padding: isMobile ? '16px 16px 80px' : 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow="Admin · Users"
        title={<>User <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>management</em></>}
        subtitle={`${data?.total ?? 0} registered accounts`}
      />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--paper)', border: '1.5px solid var(--line)',
          borderRadius: 999, padding: '9px 16px', flex: '1', maxWidth: 360,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Search size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {roleOptions.map((r) => (
            <button
              key={r || 'all'}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '8px 16px', borderRadius: 999, border: '1.5px solid',
                borderColor: roleFilter === r ? 'var(--ink)' : 'var(--line)',
                background: roleFilter === r ? 'var(--ink)' : 'var(--paper)',
                color: roleFilter === r ? '#fff' : 'var(--ink-2)',
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.8rem',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              {r || 'All roles'}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Card list */}
      <div style={{
        background: 'var(--paper)', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)', overflow: 'hidden',
      }}>
        {!isMobile && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto',
            padding: '12px 22px', borderBottom: '1px solid var(--line)', background: 'var(--bg)',
          }}>
            {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
              <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 500, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {h}
              </span>
            ))}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '32px 22px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)' }}>Loading…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px 22px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)' }}>No users found</div>
        ) : users.map((u, idx) => (
          isMobile ? (
            /* Mobile: card row */
            <div key={u._id} style={{
              padding: '14px 16px',
              borderBottom: idx < users.length - 1 ? '1px solid var(--line)' : 'none',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--ink-3)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
              </div>
              <RolePill role={u.role} />
              {u.role !== 'staff' && (
                <button
                  onClick={() => updateRoleMut.mutate({ id: u._id, role: 'staff' })}
                  disabled={updateRoleMut.isPending}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--primary-soft)', border: 'none', borderRadius: 999, padding: '6px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                >
                  <UserCheck size={12} />
                </button>
              )}
            </div>
          ) : (
            /* Desktop: grid row */
            <div key={u._id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto',
              padding: '14px 22px', alignItems: 'center',
              borderBottom: idx < users.length - 1 ? '1px solid var(--line)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'oklch(0.48 0.09 220 / 0.03)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{u.name}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink-2)' }}>{u.email}</span>
              <RolePill role={u.role} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-3)' }}>{fmt(u.createdAt)}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {u.role !== 'staff' && (
                  <button
                    onClick={() => updateRoleMut.mutate({ id: u._id, role: 'staff' })}
                    disabled={updateRoleMut.isPending}
                    title="Promote to Staff"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--primary-soft)', border: 'none', borderRadius: 999, padding: '5px 10px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                  >
                    <UserCheck size={12} /> Staff
                  </button>
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
