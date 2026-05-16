import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../lib/api';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { StatStrip } from '../../components/analytics/StatStrip';
import { TrendChart, CategoryChart } from '../../components/analytics/TrendChart';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { StatusPill } from '../../components/ui/StatusPill';

interface PublicStats {
  total: number;
  resolved: number;
  pending: number;
  avgResolutionHours: number | null;
  byCategory: { _id: string; count: number; resolved: number }[];
  recentTrend: { _id: string; reported: number; resolved: number }[];
}

export function Transparency() {
  const { data, isLoading, error } = useQuery<PublicStats>({
    queryKey: ['analytics', 'public'],
    queryFn: () => analyticsApi.public().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div style={{ padding: 48, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
        Loading analytics…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: 48, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--alert)' }}>
        Failed to load analytics.
      </div>
    );
  }

  const resolutionRate = data.total ? Math.round((data.resolved / data.total) * 100) : 0;

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 48px)' }}>
      <CanvasHead
        eyebrow="Public transparency ledger"
        title={<>Live <em>performance</em> data</>}
        subtitle="All figures reflect the last 30 days · Refreshes every 30 seconds"
      />

      {/* Stat strip */}
      <div style={{ marginBottom: 24 }}>
        <StatStrip stats={[
          { eyebrow: 'Issues reported', value: data.total, sub: 'last 30 days' },
          { eyebrow: 'Resolved', value: data.resolved, sub: `${resolutionRate}% resolution rate` },
          { eyebrow: 'Pending', value: data.pending, sub: 'awaiting action' },
          {
            eyebrow: 'Avg resolution',
            value: data.avgResolutionHours ?? 0,
            unit: 'hrs',
            sub: data.avgResolutionHours ? 'median response time' : 'no data yet',
          },
        ]} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <TrendChart data={data.recentTrend} />
        <CategoryChart data={data.byCategory} />
      </div>

      {/* Status legend */}
      <div style={{
        background: 'var(--ink-2)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-card)',
        padding: '20px 24px',
      }}>
        <Eyebrow>Status reference</Eyebrow>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14 }}>
          {(['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected'] as const).map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--muted-2)', margin: '14px 0 0', lineHeight: 1.8 }}>
          SUBMITTED — received, awaiting triage&emsp;
          ACKNOWLEDGED — triaged and queued&emsp;
          IN PROGRESS — crew dispatched&emsp;
          RESOLVED — closed successfully&emsp;
          REJECTED — duplicate or out-of-scope
        </p>
      </div>
    </div>
  );
}
