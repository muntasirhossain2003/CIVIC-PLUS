import type { IssueStatus } from '../../types';
import { Eyebrow } from '../ui/Eyebrow';

interface TimelineEntry {
  status: IssueStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

const STATUS_ORDER: IssueStatus[] = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected'];

const statusColors: Record<IssueStatus, string> = {
  submitted:    'var(--muted)',
  acknowledged: 'var(--pulse)',
  in_progress:  'var(--sky)',
  resolved:     'var(--civic)',
  rejected:     'var(--alert)',
};

const statusLabels: Record<IssueStatus, string> = {
  submitted:    'SUBMITTED',
  acknowledged: 'ACKNOWLEDGED',
  in_progress:  'IN PROGRESS',
  resolved:     'RESOLVED',
  rejected:     'REJECTED',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  history: TimelineEntry[];
  current: IssueStatus;
}

export function StatusTimeline({ history, current }: Props) {
  // Build ordered list: all statuses up to and including current
  const reached = new Set(history.map((h) => h.status));
  const historyMap = new Map<IssueStatus, TimelineEntry>(
    history.map((h) => [h.status, h]),
  );

  const isRejected = current === 'rejected';
  const displayStatuses = isRejected
    ? STATUS_ORDER
    : STATUS_ORDER.filter((s) => s !== 'rejected');

  return (
    <div>
      <Eyebrow>Status timeline</Eyebrow>
      <div style={{ marginTop: 16, position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: 9,
          top: 12,
          bottom: 12,
          width: 1,
          background: 'var(--line-2)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {displayStatuses.map((status) => {
            const isCurrent = status === current;
            const isPending = !reached.has(status);
            const entry = historyMap.get(status);
            const color = statusColors[status];

            return (
              <div key={status} style={{ display: 'flex', gap: 16, paddingBottom: 20, position: 'relative' }}>
                {/* Node */}
                <div style={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
                  <div style={{
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: isPending ? 'var(--ink-3)' : color,
                    border: `1.5px solid ${isPending ? 'var(--line-2)' : color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!isPending && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />
                    )}
                  </div>

                  {/* Pulse rings on current node */}
                  {isCurrent && (
                    <>
                      <span style={{
                        position: 'absolute', inset: -4,
                        borderRadius: '50%',
                        border: `1.5px solid ${color}`,
                        animation: 'pulse-ring 2s ease-out 0s infinite',
                        opacity: 0,
                      }} />
                      <span style={{
                        position: 'absolute', inset: -4,
                        borderRadius: '50%',
                        border: `1.5px solid ${color}`,
                        animation: 'pulse-ring 2s ease-out 0.8s infinite',
                        opacity: 0,
                      }} />
                    </>
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingTop: 1, flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.12em',
                      color: isPending ? 'var(--muted-2)' : color,
                      fontWeight: isCurrent ? 600 : 400,
                    }}>
                      {statusLabels[status]}
                    </span>
                    {isCurrent && (
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.55rem',
                        color: color,
                        border: `1px solid ${color}`,
                        borderRadius: 'var(--radius-card)',
                        padding: '1px 5px',
                        letterSpacing: '0.1em',
                      }}>
                        CURRENT
                      </span>
                    )}
                  </div>

                  {entry && (
                    <p style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.62rem',
                      color: 'var(--muted-2)',
                      margin: '4px 0 0',
                      letterSpacing: '0.04em',
                    }}>
                      {fmt(entry.changedAt)}
                      {entry.note && ` · ${entry.note}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
