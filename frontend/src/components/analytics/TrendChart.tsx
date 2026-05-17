import {
  ResponsiveContainer, AreaChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Eyebrow } from '../ui/Eyebrow';

interface TrendPoint {
  _id: string;
  reported: number;
  resolved: number;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const fmt = (v: string) => v.slice(5); // "2024-05-16" → "05-16"

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-card)',
      padding: '24px',
    }}>
      <div style={{ marginBottom: 20 }}>
        <Eyebrow>14-day trend</Eyebrow>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink)', margin: '6px 0 0', fontWeight: 400 }}>
          Reported <em>vs</em> Resolved
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--pulse)', letterSpacing: '0.1em' }}>
          ▬ REPORTED
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--civic)', letterSpacing: '0.1em' }}>
          ╌ RESOLVED
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="reportedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--pulse)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--pulse)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="_id"
            tickFormatter={fmt}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--muted-2)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--muted-2)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid var(--line)',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--ink)',
            }}
            labelFormatter={(v) => fmt(String(v))}
          />
          <Area
            type="monotone"
            dataKey="reported"
            stroke="var(--pulse)"
            strokeWidth={2}
            fill="url(#reportedGrad)"
          />
          <Line
            type="monotone"
            dataKey="resolved"
            stroke="var(--civic)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CategoryPoint {
  _id: string;
  count: number;
  resolved: number;
}

export function CategoryChart({ data }: { data: CategoryPoint[] }) {
  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-card)',
      padding: '24px',
    }}>
      <div style={{ marginBottom: 20 }}>
        <Eyebrow>By category</Eyebrow>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink)', margin: '6px 0 0', fontWeight: 400 }}>
          Issue <em>distribution</em>
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d) => {
          const pct = d.count ? Math.round((d.resolved / d.count) * 100) : 0;
          return (
            <div key={d._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--ink)', textTransform: 'capitalize' }}>
                  {d._id}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-2)' }}>
                  {d.count} · {pct}% resolved
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.5)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: 'var(--civic)',
                  borderRadius: 2,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
