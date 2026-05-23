import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../lib/api';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { StatStrip } from '../../components/analytics/StatStrip';
import { TrendChart } from '../../components/analytics/TrendChart';
import { CountUp } from '../../components/ui/CountUp';
import { useIsMobile } from '../../lib/useIsMobile';

interface AdminStats {
  totalUsers: number;
  totalIssues: number;
  resolvedIssues: number;
  avgResolutionHours: number;
  issuesByStatus: Record<string, number>;
  issuesByCategory: Record<string, number>;
  trend: { date: string; reported: number; resolved: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  submitted:    'var(--ink-3)',
  acknowledged: 'var(--accent-2)',
  in_progress:  'var(--primary)',
  resolved:     'var(--civic)',
  rejected:     'var(--alert)',
};

export function AdminAnalytics() {
  const isMobile = useIsMobile();
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsApi.admin().then((r) => r.data),
  });

  if (isLoading || !data) {
    return (
      <div style={{ padding: 'clamp(24px,4vw,40px)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)' }}>
        Loading analytics…
      </div>
    );
  }

  const resolutionRate = data.totalIssues > 0
    ? Math.round((data.resolvedIssues / data.totalIssues) * 100)
    : 0;

  return (
    <div style={{ padding: isMobile ? '16px 16px 80px' : 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow="Admin · Analytics"
        title={<>Platform <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>overview</em></>}
        subtitle="Real-time platform-wide statistics"
      />

      <StatStrip stats={[
        { eyebrow: 'Total users',    value: data.totalUsers,         sub: 'registered accounts' },
        { eyebrow: 'Total issues',   value: data.totalIssues,        sub: 'all time' },
        { eyebrow: 'Resolved',       value: data.resolvedIssues,     sub: `${resolutionRate}% rate` },
        { eyebrow: 'Avg resolution', value: Math.round(data.avgResolutionHours), sub: 'hours' },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginTop: 20 }}>
        {/* Issues by status */}
        <div style={{
          background: 'var(--paper)', borderRadius: 'var(--radius-card)',
          padding: '22px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 20px' }}>
            Issues by status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(data.issuesByStatus).map(([status, count]) => {
              const pct = data.totalIssues > 0 ? Math.round((count / data.totalIssues) * 100) : 0;
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 500,
                      color: 'var(--ink-2)', textTransform: 'capitalize',
                    }}>
                      {status.replace('_', ' ')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: STATUS_COLORS[status] ?? 'var(--ink-3)' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: STATUS_COLORS[status] ?? 'var(--ink-3)',
                      borderRadius: 3, transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issues by category */}
        <div style={{
          background: 'var(--paper)', borderRadius: 'var(--radius-card)',
          padding: '22px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 20px' }}>
            Issues by category
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(data.issuesByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} style={{
                  background: 'var(--bg)',
                  borderRadius: 12, padding: '10px 14px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  minWidth: 80,
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', lineHeight: 1 }}>
                    <CountUp to={count} />
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {cat}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Trend chart */}
      {data.trend?.length > 0 && (
        <div style={{
          background: 'var(--paper)', borderRadius: 'var(--radius-card)',
          padding: '22px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)',
          marginTop: 20,
        }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 20px' }}>
            14-day trend
          </h3>
          <TrendChart data={data.trend} />
        </div>
      )}
    </div>
  );
}
