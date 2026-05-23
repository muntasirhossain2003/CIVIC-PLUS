import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { issueApi } from '../../lib/api';
import type { Issue } from '../../types';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { PulseMap } from '../../components/map/PulseMap';
import { LiveTicker } from '../../components/feed/LiveTicker';
import { StatusPill } from '../../components/ui/StatusPill';
import { Btn } from '../../components/ui/Btn';
import { useAuthStore } from '../../store/authStore';
import { useLangStore } from '../../store/langStore';
import { useT } from '../../lib/useT';
import { useIsMobile } from '../../lib/useIsMobile';
import { MapPin, Plus, TrendingUp } from 'lucide-react';

const STATUS_FILTERS = ['', 'submitted', 'acknowledged', 'in_progress', 'resolved'] as const;

const STATUS_LABELS: Record<string, { en: string; bn: string }> = {
  '':            { en: 'All',         bn: 'সব' },
  submitted:     { en: 'Submitted',   bn: 'জমা' },
  acknowledged:  { en: 'Acknowledged',bn: 'গৃহীত' },
  in_progress:   { en: 'In Progress', bn: 'চলছে' },
  resolved:      { en: 'Resolved',    bn: 'সমাধান' },
};

export function CitizenHome() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [picked, setPicked]       = useState<Issue | null>(null);
  const [statusFilter, setFilter] = useState('');
  const lang = useLangStore((s) => s.lang);
  const t    = useT();
  const isBn = lang === 'bn';
  const isMobile = useIsMobile();

  const { data, isLoading } = useQuery({
    queryKey: ['issues', { status: statusFilter }],
    queryFn: () => issueApi.list(statusFilter ? { status: statusFilter } : {}).then((r) => r.data),
  });

  const issues: Issue[] = data?.data ?? [];

  /* ── Filter chip row (shared, horizontal scroll on mobile) ── */
  const FilterChips = (
    <div style={{
      display: 'flex',
      gap: 8,
      flexWrap: isMobile ? 'nowrap' : 'wrap',
      overflowX: isMobile ? 'auto' : 'visible',
      scrollbarWidth: 'none',
      padding: isMobile ? '0 16px 4px' : undefined,
      WebkitOverflowScrolling: 'touch',
    }}>
      {STATUS_FILTERS.map((s) => {
        const active = statusFilter === s;
        const lbl = isBn ? STATUS_LABELS[s].bn : STATUS_LABELS[s].en;
        return (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px',
              borderRadius: 999,
              border: active ? '1.5px solid var(--ink)' : '1.5px solid var(--line)',
              background: active ? 'var(--ink)' : 'rgba(255,255,255,0.7)',
              color: active ? '#fff' : 'var(--ink-2)',
              fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
              fontSize: isBn ? '0.85rem' : '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: active ? 'var(--shadow-btn)' : 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );

  /* ── MOBILE layout ───────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Sticky mobile header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(246,241,231,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--line)',
          padding: '14px 16px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {isBn ? 'লাইভ ম্যাপ' : 'Live Map'}
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 400, color: 'var(--ink)', margin: '2px 0 0', letterSpacing: '-0.01em' }}>
                {isBn ? 'সমস্যার মানচিত্র' : <><em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Live</em> map</>}
              </h1>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-3)', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 999, padding: '4px 10px' }}>
              {issues.length}
            </span>
          </div>
          {FilterChips}
        </div>

        {/* Full-viewport map */}
        <div style={{ flex: 1, position: 'relative', minHeight: 'calc(100vh - 280px)' }}>
          {isLoading ? (
            <div style={{
              height: '100%', minHeight: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg)', color: 'var(--ink-3)',
              fontFamily: 'var(--font-sans)', fontSize: '0.875rem', gap: 8,
            }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
              {isBn ? 'লোড হচ্ছে…' : 'Loading map…'}
            </div>
          ) : (
            <PulseMap issues={issues} height="100%" onPick={setPicked} picked={picked?._id} />
          )}

          {/* Floating picked card */}
          {picked && (
            <div style={{
              position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 10,
              background: 'var(--paper)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 18px',
              boxShadow: '0 8px 32px rgba(26,31,46,0.2)',
              animation: 'fade-up 0.25s ease both',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {picked.category}
                  </p>
                  <h3 style={{ fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {picked.title}
                  </h3>
                  <StatusPill status={picked.status} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                  <Link to={`/issues/${picked._id}`}>
                    <Btn size="sm">{isBn ? 'দেখুন →' : 'View →'}</Btn>
                  </Link>
                  <button onClick={() => setPicked(null)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live feed strip */}
        <div style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
          <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={14} style={{ color: 'var(--ink-3)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--ink)' }}>
              {isBn ? 'লাইভ ফিড' : 'Live feed'}
            </span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--civic)', animation: 'blink 1.6s ease-in-out infinite', display: 'inline-block' }} />
          </div>
          <LiveTicker initial={issues.slice(0, 10).map((i) => ({
            _id: i._id, title: i.title, category: i.category,
            status: i.status, address: i.address, createdAt: i.createdAt,
          }))} />
        </div>

        {/* Bottom padding for MobileNav */}
        <div style={{ height: 8 }} />
      </div>
    );
  }

  /* ── DESKTOP layout ──────────────────────────────────────── */
  return (
    <div style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow={isBn ? 'লাইভ ম্যাপ' : 'Live Map'}
        title={isBn
          ? 'সমস্যার মানচিত্র'
          : <><em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Live</em> issue map</>
        }
        subtitle={isBn
          ? `${issues.length}টি সমস্যা দেখানো হচ্ছে`
          : `${issues.length} issues in your area`
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* Left — map column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FilterChips}

          {isLoading ? (
            <div style={{
              height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-card)',
              border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)',
              fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)', gap: 10,
            }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
              {isBn ? 'লোড হচ্ছে…' : 'Loading map…'}
            </div>
          ) : (
            <PulseMap issues={issues} height={500} onPick={setPicked} picked={picked?._id} />
          )}

          {picked && (
            <div style={{
              background: 'var(--paper)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius-card)', padding: '20px 22px',
              animation: 'fade-up 0.3s ease both', boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-3)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {picked.category} · {picked.severity}
                  </p>
                  <h3 style={{ fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                    {picked.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--ink-3)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={11} />
                    {picked.address}
                  </p>
                  <StatusPill status={picked.status} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <Link to={`/issues/${picked._id}`}>
                    <Btn size="sm">{isBn ? 'দেখুন →' : 'View →'}</Btn>
                  </Link>
                  <button onClick={() => setPicked(null)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>
                    {isBn ? 'বন্ধ করুন' : 'Close'} ✕
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
              <div
                style={{ background: 'var(--ink)', borderRadius: 'var(--radius-card)', padding: '22px', cursor: 'pointer', boxShadow: 'var(--shadow-lg)', transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 12px 32px rgba(26,31,46,0.2)'; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.boxShadow = 'var(--shadow-lg)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: '0 6px 16px oklch(0.82 0.14 75 / 0.5)' }}>
                  <Plus size={22} strokeWidth={2.5} style={{ color: 'var(--ink)' }} />
                </div>
                <h3 style={{ fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)', fontWeight: 700, color: '#fff', fontSize: '1rem', margin: '0 0 6px' }}>
                  {isBn ? 'সমস্যা রিপোর্ট করুন' : 'Report an issue'}
                </h3>
                <p style={{ fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                  {isBn ? 'GPS ও ছবিসহ জমা দিন' : 'Photo + GPS captured automatically.'}
                </p>
              </div>
            </Link>
          ) : (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius-card)', padding: '22px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <MapPin size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <p style={{ fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-2)', margin: '0 0 16px', lineHeight: 1.55 }}>
                {isBn ? 'সমস্যা রিপোর্ট করতে সাইন ইন করুন।' : 'Sign in to report civic issues in your area.'}
              </p>
              <Link to="/login">
                <Btn size="sm" style={{ width: '100%' }}>{t('sign_in')}</Btn>
              </Link>
            </div>
          )}

          <div style={{ background: 'var(--paper)', borderRadius: 'var(--radius-card)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={15} style={{ color: 'var(--ink-3)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>
                {isBn ? 'লাইভ ফিড' : 'Live feed'}
              </span>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--civic)', animation: 'blink 1.6s ease-in-out infinite', display: 'inline-block', marginLeft: 2 }} />
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
