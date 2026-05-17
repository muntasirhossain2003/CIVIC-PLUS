import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { ScrollText } from 'lucide-react';

interface AuditLog {
  _id: string;
  action: string;
  actorId: { name: string; email: string } | string;
  targetId?: string;
  targetModel?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  login: 'var(--civic)',
  logout: 'var(--ink-3)',
  register: 'var(--primary)',
  status_change: 'var(--accent-2)',
  role_change: 'var(--alert)',
  issue_created: 'var(--primary)',
  issue_deleted: 'var(--alert)',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function AdminAuditLogs() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ data: AuditLog[]; totalPages: number; total: number }>({
    queryKey: ['audit-logs', page],
    queryFn: () => adminApi.listAuditLogs({ page, limit: 25 }).then((r) => r.data),
  });

  const logs: AuditLog[] = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const actorName = (log: AuditLog) =>
    typeof log.actorId === 'object' ? log.actorId.name : log.actorId;

  return (
    <div style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow="Admin · Audit"
        title={<>Audit <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>logs</em></>}
        subtitle={`${data?.total ?? 0} total events`}
      />

      <div style={{
        background: 'var(--paper)', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto',
          padding: '12px 22px', background: 'var(--bg)',
          borderBottom: '1px solid var(--line)',
        }}>
          {['Action', 'Actor', 'Target', 'Time'].map((h) => (
            <span key={h} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 500,
              color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {h}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: '32px 22px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)' }}>
            Loading…
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '56px 22px', textAlign: 'center' }}>
            <ScrollText size={32} style={{ color: 'var(--ink-3)', marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-3)', margin: 0 }}>
              No audit logs yet.
            </p>
          </div>
        ) : logs.map((log, idx) => {
          const color = ACTION_COLORS[log.action] ?? 'var(--ink-3)';
          return (
            <div key={log._id} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto',
              padding: '12px 22px', alignItems: 'center', gap: 16,
              borderBottom: idx < logs.length - 1 ? '1px solid var(--line)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'oklch(0.48 0.09 220 / 0.03)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                color, background: `${color}18`, borderRadius: 999,
                padding: '3px 10px', whiteSpace: 'nowrap',
              }}>
                {log.action.replace(/_/g, ' ')}
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink)' }}>
                {actorName(log)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-3)' }}>
                {log.targetModel ? `${log.targetModel}:${String(log.targetId ?? '').slice(-6)}` : '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                {fmt(log.createdAt)}
              </span>
            </div>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '14px 22px', borderTop: '1px solid var(--line)',
            display: 'flex', gap: 8, justifyContent: 'center',
          }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 999,
                padding: '6px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                color: 'var(--ink-2)', cursor: 'pointer', fontWeight: 600,
              }}
            >
              ← Prev
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-3)', alignSelf: 'center', padding: '0 8px' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 999,
                padding: '6px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                color: 'var(--ink-2)', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
