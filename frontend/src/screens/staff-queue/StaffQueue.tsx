import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { issueApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Issue, IssueStatus } from '../../types';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { StatusPill } from '../../components/ui/StatusPill';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { Btn } from '../../components/ui/Btn';
import { SLABar } from '../../components/timeline/SLABar';
import { MapPin, Clock } from 'lucide-react';

const COLUMNS: { status: IssueStatus; label: string }[] = [
  { status: 'submitted',    label: 'SUBMITTED' },
  { status: 'acknowledged', label: 'ACKNOWLEDGED' },
  { status: 'in_progress',  label: 'IN PROGRESS' },
  { status: 'resolved',     label: 'RESOLVED' },
];

const statusColors: Record<IssueStatus, string> = {
  submitted:    'var(--muted)',
  acknowledged: 'var(--pulse)',
  in_progress:  'var(--sky)',
  resolved:     'var(--civic)',
  rejected:     'var(--alert)',
};

const nextStatus: Partial<Record<IssueStatus, IssueStatus>> = {
  submitted:    'acknowledged',
  acknowledged: 'in_progress',
  in_progress:  'resolved',
};

function isOverdue(issue: Issue) {
  if (!issue.slaDeadline) return false;
  return new Date(issue.slaDeadline) < new Date()
    && !['resolved', 'rejected'].includes(issue.status);
}

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface StatusModalProps {
  issue: Issue;
  onClose: () => void;
}

function StatusModal({ issue, onClose }: StatusModalProps) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [note, setNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allStatuses: IssueStatus[] = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected'];

  async function handleSave() {
    setError('');
    setLoading(true);
    try {
      await issueApi.updateStatus(issue._id, {
        status,
        note: note || undefined,
        resolutionNotes: status === 'resolved' ? resolutionNotes : undefined,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      });
      qc.invalidateQueries({ queryKey: ['staff-issues'] });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Update failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(11,18,32,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 24,
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--ink-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--radius-card)',
          padding: '28px 32px',
          width: '100%',
          maxWidth: 480,
          animation: 'fade-up 0.25s ease both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Eyebrow>Update status</Eyebrow>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--bone)', margin: '8px 0 20px', fontWeight: 400 }}>
          {issue.title}
        </h3>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                background: status === s ? 'color-mix(in srgb, var(--status-col) 18%, transparent)' : 'transparent',
                border: `1px solid ${status === s ? statusColors[s] : 'var(--line-2)'}`,
                borderRadius: 'var(--radius-card)',
                color: status === s ? statusColors[s] : 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                padding: '5px 10px',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Eyebrow>Note (optional)</Eyebrow>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief note about this status change…"
              style={{
                background: 'var(--ink-3)', border: '1px solid var(--line-2)', borderRadius: 'var(--radius-card)',
                color: 'var(--bone)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                padding: '10px 12px', resize: 'vertical', outline: 'none',
              }}
            />
          </div>

          {status === 'resolved' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Eyebrow>Resolution notes (required)</Eyebrow>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the issue was resolved…"
                required
                style={{
                  background: 'var(--ink-3)', border: '1px solid var(--civic)', borderRadius: 'var(--radius-card)',
                  color: 'var(--bone)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                  padding: '10px 12px', resize: 'vertical', outline: 'none',
                }}
              />
            </div>
          )}

          {status === 'rejected' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Eyebrow>Rejection reason (required)</Eyebrow>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Duplicate / out-of-scope / invalid…"
                required
                style={{
                  background: 'var(--ink-3)', border: '1px solid var(--alert)', borderRadius: 'var(--radius-card)',
                  color: 'var(--bone)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                  padding: '10px 12px', resize: 'vertical', outline: 'none',
                }}
              />
            </div>
          )}
        </div>

        {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--alert)', margin: '12px 0 0' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn size="sm" disabled={loading} onClick={handleSave}>
            {loading ? 'Saving…' : 'Save'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ issue, onUpdateStatus }: { issue: Issue; onUpdateStatus: (i: Issue) => void }) {
  const overdue = isOverdue(issue);

  return (
    <div style={{
      background: 'var(--ink-2)',
      border: `1px solid ${overdue ? 'var(--alert)' : 'var(--line-2)'}`,
      borderRadius: 'var(--radius-card)',
      padding: '14px 16px',
      animation: 'fade-up 0.4s ease both',
      cursor: 'pointer',
    }}>
      {overdue && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
          color: 'var(--alert)', letterSpacing: '0.1em',
          marginBottom: 8,
        }}>
          ● OVERDUE
        </div>
      )}

      <Link to={`/issues/${issue._id}`} style={{ textDecoration: 'none' }}>
        <h4 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.82rem',
          color: 'var(--bone)',
          margin: '0 0 6px',
          lineHeight: 1.4,
          fontWeight: 500,
        }}>
          {issue.title}
        </h4>
      </Link>

      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
        color: 'var(--muted-2)', margin: '0 0 10px', letterSpacing: '0.04em',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <MapPin size={9} /> {issue.address}
      </p>

      {issue.slaDeadline && (
        <div style={{ marginBottom: 10 }}>
          <SLABar slaDeadline={issue.slaDeadline} createdAt={issue.createdAt} status={issue.status} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={9} /> {timeSince(issue.createdAt)}
        </span>
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => onUpdateStatus(issue)}
          style={{ fontSize: '0.65rem', padding: '3px 8px' }}
        >
          Update →
        </Btn>
      </div>
    </div>
  );
}

export function StaffQueue() {
  const [modalIssue, setModalIssue] = useState<Issue | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['staff-issues', search],
    queryFn: () => issueApi.list({ search: search || undefined, limit: 100 } as Record<string, unknown>).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const allIssues: Issue[] = data?.data ?? [];

  const byStatus = (status: IssueStatus) =>
    allIssues.filter((i) => i.status === status);

  const overdueCount = allIssues.filter(isOverdue).length;

  return (
    <>
      {modalIssue && (
        <StatusModal issue={modalIssue} onClose={() => setModalIssue(null)} />
      )}

      <div style={{ padding: 'clamp(20px, 4vw, 48px)' }}>
        <CanvasHead
          eyebrow="Staff portal"
          title={<>Issue <em>triage</em> queue</>}
          subtitle={`${allIssues.length} total · ${overdueCount} overdue`}
        />

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues…"
            style={{
              background: 'var(--ink-3)',
              border: '1px solid var(--line-2)',
              borderRadius: 'var(--radius-card)',
              color: 'var(--bone)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              padding: '9px 14px',
              width: '100%',
              maxWidth: 360,
              outline: 'none',
            }}
          />
        </div>

        {isLoading ? (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>Loading queue…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'start' }}>
            {COLUMNS.map(({ status, label }) => {
              const cards = byStatus(status);
              const color = statusColors[status];
              return (
                <div key={status}>
                  {/* Column header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--ink-2)',
                    border: `1px solid ${color}`,
                    borderRadius: 'var(--radius-card)',
                    marginBottom: 10,
                    borderBottom: `3px solid ${color}`,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color, letterSpacing: '0.1em' }}>
                      {label}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                      background: color, color: 'var(--ink)',
                      borderRadius: 10, padding: '1px 7px', fontWeight: 600,
                    }}>
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cards.length === 0 ? (
                      <div style={{
                        padding: '20px 12px',
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                        color: 'var(--muted-2)', textAlign: 'center',
                        border: '1px dashed var(--line)', borderRadius: 'var(--radius-card)',
                      }}>
                        No issues
                      </div>
                    ) : (
                      cards.map((issue) => (
                        <IssueCard
                          key={issue._id}
                          issue={issue}
                          onUpdateStatus={setModalIssue}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
