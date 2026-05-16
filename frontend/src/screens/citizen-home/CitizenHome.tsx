import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { issueApi } from '../../lib/api';
import type { Issue } from '../../types';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { PulseMap } from '../../components/map/PulseMap';
import { LiveTicker } from '../../components/feed/LiveTicker';
import { StatusPill } from '../../components/ui/StatusPill';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { Btn } from '../../components/ui/Btn';
import { useAuthStore } from '../../store/authStore';
import { useLangStore } from '../../store/langStore';
import { useT } from '../../lib/useT';
import { MapPin, Plus } from 'lucide-react';

const STATUS_FILTERS = ['', 'submitted', 'acknowledged', 'in_progress', 'resolved'];

export function CitizenHome() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [picked, setPicked]         = useState<Issue | null>(null);
  const [statusFilter, setFilter]   = useState('');
  const t    = useT();
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';

  const { data, isLoading } = useQuery({
    queryKey: ['issues', { status: statusFilter }],
    queryFn: () => issueApi.list(statusFilter ? { status: statusFilter } : {}).then((r) => r.data),
  });

  const issues: Issue[] = data?.data ?? [];

  const statusLabel: Record<string, string> = {
    '':            t('all'),
    submitted:     t('status_submitted'),
    acknowledged:  t('status_acknowledged'),
    in_progress:   t('status_in_progress'),
    resolved:      t('status_resolved'),
  };

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 48px)' }}>
      <CanvasHead
        eyebrow={t('home_eyebrow')}
        title={isBn
          ? t('home_title')
          : <>{t('home_title').split(' ').slice(0,1).join(' ')} <em>{t('home_title').split(' ').slice(1).join(' ')}</em></>
        }
        subtitle={`${issues.length} ${t('home_subtitle')}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Map column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Eyebrow>{t('filter')}</Eyebrow>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setFilter(s)}
                style={{
                  background: statusFilter === s ? 'var(--pulse-soft)' : 'var(--ink-3)',
                  border: `1px solid ${statusFilter === s ? 'var(--pulse)' : 'var(--line-2)'}`,
                  borderRadius: 6,
                  color: statusFilter === s ? 'var(--pulse)' : 'var(--muted)',
                  fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                  fontSize: isBn ? '0.82rem' : '0.75rem',
                  fontWeight: 500,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {statusLabel[s]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div style={{
              height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--ink-3)', borderRadius: 8,
              fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--muted)',
            }}>
              {t('loading')}
            </div>
          ) : (
            <PulseMap issues={issues} height={500} onPick={setPicked} picked={picked?._id} />
          )}

          {/* Picked issue card */}
          {picked && (
            <div style={{
              background: 'var(--ink-2)',
              border: '1px solid var(--line-2)',
              borderRadius: 10,
              padding: '18px 20px',
              animation: 'fade-up 0.3s ease both',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Eyebrow>{picked.category} · {picked.severity}</Eyebrow>
                  <h3 style={{
                    fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-display)',
                    fontSize: '1.2rem', color: 'var(--bone)',
                    margin: '6px 0 4px', fontWeight: isBn ? 700 : 400,
                  }}>
                    {picked.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-2)', margin: '0 0 10px' }}>
                    <MapPin size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {picked.address}
                  </p>
                  <StatusPill status={picked.status} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <Link to={`/issues/${picked._id}`}>
                    <Btn variant="ghost" size="sm">View →</Btn>
                  </Link>
                  <button onClick={() => setPicked(null)} style={{
                    background: 'none', border: 'none', color: 'var(--muted-2)',
                    cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-sans)',
                  }}>
                    {t('close')} ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isAuthenticated ? (
            <Link to="/report" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--pulse-soft)',
                border: '1px solid var(--pulse)',
                borderRadius: 10,
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: '0 2px 12px oklch(0.78 0.16 65 / 0.2)',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                  <Plus size={16} style={{ color: 'var(--pulse)', flexShrink: 0 }} />
                  <span style={{
                    fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                    fontWeight: 600, color: 'var(--pulse)', fontSize: '0.9rem',
                  }}>
                    {t('nav_report')}
                  </span>
                </div>
                <p style={{
                  fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                  fontSize: '0.8rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5,
                }}>
                  {isBn ? 'GPS ও ছবিসহ সমস্যা রিপোর্ট করুন' : 'Photo + GPS location captured automatically.'}
                </p>
              </div>
            </Link>
          ) : (
            <div style={{
              background: 'var(--ink-2)',
              border: '1px solid var(--line-2)',
              borderRadius: 10,
              padding: '18px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
            }}>
              <p style={{ fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
                {isBn ? 'সমস্যা রিপোর্ট করতে সাইন ইন করুন।' : 'Sign in to report civic issues in your area.'}
              </p>
              <Link to="/login"><Btn size="sm">{t('sign_in')}</Btn></Link>
            </div>
          )}

          {/* Live ticker */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Eyebrow>{isBn ? 'লাইভ ফিড' : 'Live feed'}</Eyebrow>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--pulse)',
                animation: 'live-blink 1.4s ease-in-out infinite',
                display: 'inline-block',
              }} />
            </div>
            <LiveTicker initial={issues.slice(0, 10).map((i) => ({
              _id: i._id, title: i.title, category: i.category,
              status: i.status, address: i.address, createdAt: i.createdAt,
            }))} />
          </div>
        </div>
      </div>
    </div>
  );
}
