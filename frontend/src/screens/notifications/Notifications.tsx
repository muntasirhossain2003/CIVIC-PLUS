import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useLangStore } from '../../store/langStore';
import type { Notification } from '../../types';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { Btn } from '../../components/ui/Btn';
import { useIsMobile } from '../../lib/useIsMobile';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';

function fmt(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_ICONS: Record<string, string> = {
  status_change: '🔄', comment: '💬', upvote: '👍', follow: '🔔', assignment: '📋',
};

export function Notifications() {
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';
  const qc   = useQueryClient();
  const isMobile = useIsMobile();

  const { data = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const markAllMut = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMut = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = data.filter((n) => !n.read).length;

  return (
    <div style={{ padding: isMobile ? '16px 16px 80px' : 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow={isBn ? 'বিজ্ঞপ্তি' : 'Notifications'}
        title={isBn
          ? <>আপনার <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>বিজ্ঞপ্তি</em></>
          : <>Your <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>notifications</em></>
        }
        subtitle={isBn ? `${unread}টি অপঠিত` : `${unread} unread`}
        action={unread > 0 ? (
          <Btn
            variant="ghost" size="sm"
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
          >
            <CheckCheck size={14} />
            {isBn ? 'সব পড়া হয়েছে' : 'Mark all read'}
          </Btn>
        ) : undefined}
      />

      <div style={{
        background: 'var(--paper)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--line)',
        overflow: 'hidden',
        maxWidth: 720,
      }}>
        {isLoading ? (
          <div style={{
            padding: '40px 22px', textAlign: 'center',
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)',
          }}>
            {isBn ? 'লোড হচ্ছে…' : 'Loading…'}
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '56px 22px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--primary-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Bell size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <p style={{
              fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
              fontSize: '0.9rem', color: 'var(--ink-2)', margin: 0,
            }}>
              {isBn ? 'কোনো বিজ্ঞপ্তি নেই।' : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          data.map((n, idx) => (
            <div
              key={n._id}
              style={{
                padding: isMobile ? '14px 16px' : '16px 22px',
                borderBottom: idx < data.length - 1 ? '1px solid var(--line)' : 'none',
                background: n.read ? 'transparent' : 'oklch(0.48 0.09 220 / 0.04)',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                transition: 'background 0.15s',
                cursor: 'pointer',
              }}
              onClick={() => { if (!n.read) markOneMut.mutate(n._id); }}
            >
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: n.read ? 'var(--bg)' : 'var(--primary-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
              }}>
                {TYPE_ICONS[n.type] ?? '🔔'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: n.read ? 400 : 600,
                  color: 'var(--ink)',
                  margin: '0 0 4px', lineHeight: 1.4,
                }}>
                  {n.message}
                </p>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem', color: 'var(--ink-3)',
                  margin: 0, letterSpacing: '0.04em',
                }}>
                  {fmt(n.createdAt)}
                </p>
              </div>

              {n.issueId && (
                <Link
                  to={`/issues/${n.issueId}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 2 }}
                >
                  <ExternalLink size={14} />
                </Link>
              )}

              {!n.read && (
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--primary)',
                  flexShrink: 0, marginTop: 5,
                }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
