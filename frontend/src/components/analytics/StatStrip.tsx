import type { ReactNode } from 'react';
import { CountUp } from '../ui/CountUp';
import { Eyebrow } from '../ui/Eyebrow';

interface Stat {
  eyebrow: string;
  value: number;
  unit?: string;
  sub?: string;
}

export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      gap: 1,
      background: 'var(--line)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: 'var(--paper)',
          padding: '24px 28px',
          animation: `fade-up 0.5s ${i * 0.08}s ease both`,
        }}>
          <Eyebrow>{s.eyebrow}</Eyebrow>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            color: 'var(--ink)',
            lineHeight: 1,
            margin: '10px 0 6px',
            fontWeight: 400,
          }}>
            <CountUp to={s.value} />
            {s.unit && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--ink-2)', marginLeft: 4 }}>
                {s.unit}
              </span>
            )}
          </div>
          {s.sub && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-2)', margin: 0, letterSpacing: '0.08em' }}>
              {s.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function StatCard({ eyebrow, value, unit, sub, color }: Stat & { color?: string }) {
  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-card)',
      padding: '20px 24px',
    }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.4rem',
        color: color ?? 'var(--ink)',
        lineHeight: 1,
        margin: '8px 0 4px',
        fontWeight: 400,
      }}>
        <CountUp to={value} />
        {unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ink-2)', marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-2)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

// Re-export as a named composite for convenience
export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
      {children}
    </div>
  );
}
