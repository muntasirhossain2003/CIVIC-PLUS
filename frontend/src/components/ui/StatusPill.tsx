import type { IssueStatus } from '../../types';

const labels: Record<IssueStatus, string> = {
  submitted:    'SUBMITTED',
  acknowledged: 'ACKNOWLEDGED',
  in_progress:  'IN PROGRESS',
  resolved:     'RESOLVED',
  rejected:     'REJECTED',
};

interface Props { status: IssueStatus; }

export function StatusPill({ status }: Props) {
  return (
    <span
      data-status={status}
      style={{ color: 'var(--status-color)', borderColor: 'var(--status-color)' }}
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] border px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] font-mono"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: 'var(--status-color)' }}
      />
      {labels[status]}
    </span>
  );
}
