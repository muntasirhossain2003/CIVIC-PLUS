import type { IssueStatus } from '../../types';
import { useLangStore } from '../../store/langStore';

const labels: Record<IssueStatus, string> = {
  submitted:    'Submitted',
  acknowledged: 'Acknowledged',
  in_progress:  'In Progress',
  resolved:     'Resolved',
  rejected:     'Rejected',
};

const colors: Record<IssueStatus, { bg: string; fg: string; dot: string }> = {
  submitted:    { bg: 'oklch(0.95 0.01 220)',        fg: 'var(--ink-3)',   dot: 'var(--ink-3)' },
  acknowledged: { bg: 'oklch(0.92 0.07 75 / 0.5)',   fg: 'oklch(0.52 0.14 65)',  dot: 'var(--accent-2)' },
  in_progress:  { bg: 'oklch(0.92 0.05 220 / 0.5)',  fg: 'var(--primary)', dot: 'var(--primary)' },
  resolved:     { bg: 'oklch(0.92 0.06 155 / 0.5)',  fg: 'var(--civic)',   dot: 'var(--civic)' },
  rejected:     { bg: 'oklch(0.92 0.07 25 / 0.5)',   fg: 'var(--alert)',   dot: 'var(--alert)' },
};

interface Props { status: IssueStatus; }

export function StatusPill({ status }: Props) {
  const { bg, fg, dot } = colors[status];
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';

  return (
    <span
      data-status={status}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: bg,
        color: fg,
        fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: dot,
        flexShrink: 0,
      }} />
      {labels[status]}
    </span>
  );
}
