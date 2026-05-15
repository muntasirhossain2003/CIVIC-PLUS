import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { issueApi } from '../../lib/api';
import { Issue } from '../../types';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { PulseMap } from '../../components/map/PulseMap';
import { LiveTicker } from '../../components/feed/LiveTicker';
import { StatusPill } from '../../components/ui/StatusPill';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { Btn } from '../../components/ui/Btn';
import { useAuthStore } from '../../store/authStore';
import { MapPin, Plus } from 'lucide-react';

export function CitizenHome() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [picked, setPicked] = useState<Issue | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['issues', { status: statusFilter }],
    queryFn: () => issueApi.list(statusFilter ? { status: statusFilter } : {}).then((r) => r.data),
  });

  const issues: Issue[] = data?.data ?? [];

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 48px)' }}>
      <CanvasHead
        eyebrow="Citizen portal"
        title={<>Community <em>issue</em> map</>}
        subtitle={`${issues.length} issues on map · Live updates via WebSocket`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        {/* Map column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Eyebrow>Filter</Eyebrow>
            {['', 'submitted', 'acknowledged', 'in_progress', 'resolved'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  background: statusFilter === s ? 'var(--pulse-soft)' : 'transparent',
                  border: `1px solid ${statusFilter === s ? 'var(--pulse)' : 'var(--line-2)'}`,
                  borderRadius: 'var(--radius-card)',
                  color: statusFilter === s ? 'var(--pulse)' : 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {s || 'ALL'}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink-3)', borderRadius: 'var(--radius-card)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
              Loading map…
            </div>
          ) : (
            <PulseMap
              issues={issues}
              height={500}
              onPick={(issue) => setPicked(issue)}
              picked={picked?._id}
            />
          )}

          {/* Picked issue card */}
          {picked && (
            <div style={{
              background: 'var(--ink-2)',
              border: '1px solid var(--line-2)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 20px',
              animation: 'fade-up 0.3s ease both',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Eyebrow>{picked.category} · {picked.severity} severity</Eyebrow>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--bone)', margin: '6px 0 4px', fontWeight: 400 }}>
                    {picked.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-2)', margin: '0 0 8px', letterSpacing: '0.04em' }}>
                    <MapPin size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {picked.address}
                  </p>
                  <StatusPill status={picked.status} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <Link to={`/issues/${picked._id}`}>
                    <Btn variant="ghost" size="sm">View details →</Btn>
                  </Link>
                  <button
                    onClick={() => setPicked(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted-2)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}
                  >
                    ✕ dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Report CTA */}
          {isAuthenticated ? (
            <Link to="/report" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--pulse-soft)',
                border: '1px solid var(--pulse)',
                borderRadius: 'var(--radius-card)',
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                  <Plus size={16} style={{ color: 'var(--pulse)' }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--pulse)', fontSize: '0.875rem' }}>
                    Report an issue
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  Photo + GPS location captured automatically.
                </p>
              </div>
            </Link>
          ) : (
            <div style={{
              background: 'var(--ink-2)',
              border: '1px solid var(--line-2)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 20px',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--muted)', margin: '0 0 12px' }}>
                Sign in to report civic issues in your area.
              </p>
              <Link to="/login">
                <Btn size="sm">Sign in</Btn>
              </Link>
            </div>
          )}

          {/* Live ticker */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Eyebrow>Live feed</Eyebrow>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--pulse)',
                animation: 'live-blink 1.4s ease-in-out infinite',
                display: 'inline-block',
              }} />
            </div>
            <LiveTicker initial={issues.slice(0, 10).map((i) => ({
              _id: i._id,
              title: i.title,
              category: i.category,
              status: i.status,
              address: i.address,
              createdAt: i.createdAt,
            }))} />
          </div>
        </div>
      </div>
    </div>
  );
}
