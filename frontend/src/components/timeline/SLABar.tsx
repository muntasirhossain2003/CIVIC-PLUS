import { Eyebrow } from '../ui/Eyebrow';

interface Props {
  slaDeadline: string;
  createdAt: string;
  status: string;
}

function fmt(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

export function SLABar({ slaDeadline, createdAt, status }: Props) {
  const created = new Date(createdAt).getTime();
  const deadline = new Date(slaDeadline).getTime();
  const now = Date.now();

  const totalMs = deadline - created;
  const usedMs  = Math.min(now - created, totalMs);
  const pct     = Math.min(Math.round((usedMs / totalMs) * 100), 100);

  const isOverdue = now > deadline && status !== 'resolved' && status !== 'rejected';
  const isResolved = status === 'resolved' || status === 'rejected';

  const barColor = isResolved ? 'var(--civic)'
    : isOverdue               ? 'var(--alert)'
    : pct > 75                ? 'oklch(0.72 0.18 50)'
    :                           'var(--pulse)';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <Eyebrow>SLA status</Eyebrow>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: isOverdue ? 'var(--alert)' : isResolved ? 'var(--civic)' : 'var(--muted)',
          letterSpacing: '0.08em',
        }}>
          {isResolved ? 'CLOSED'
            : isOverdue ? '● OVERDUE'
            : `${fmt(totalMs - usedMs)} remaining`}
        </span>
      </div>

      <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: barColor,
          borderRadius: 3,
          transition: 'width 0.6s ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-3)' }}>
          Reported {new Date(createdAt).toLocaleDateString()}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-3)' }}>
          SLA {new Date(slaDeadline).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
