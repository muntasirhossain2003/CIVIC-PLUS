import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Issue, Comment } from '../../types';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { StatusPill } from '../../components/ui/StatusPill';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';
import { StatusTimeline } from '../../components/timeline/StatusTimeline';
import { SLABar } from '../../components/timeline/SLABar';
import { ThumbsUp, Bell, MapPin, Calendar, User } from 'lucide-react';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const { data: issue, isLoading, error } = useQuery<Issue>({
    queryKey: ['issue', id],
    queryFn: () => issueApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', id],
    queryFn: () => issueApi.getComments(id!).then((r) => r.data),
    enabled: !!id,
  });

  const upvoteMut = useMutation({
    mutationFn: () => issueApi.upvote(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', id] }),
  });

  const followMut = useMutation({
    mutationFn: () => issueApi.follow(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', id] }),
  });

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      await issueApi.addComment(id!, comment.trim());
      setComment('');
      qc.invalidateQueries({ queryKey: ['comments', id] });
    } finally {
      setCommenting(false);
    }
  }

  if (isLoading) {
    return <div style={{ padding: 48, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)' }}>Loading…</div>;
  }

  if (error || !issue) {
    return (
      <div style={{ padding: 48 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--alert)' }}>Issue not found.</p>
        <Link to="/" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--primary)' }}>← Back to map</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow={`${issue.category} · ${issue.severity} severity`}
        title={<><em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{issue.title.split(' ')[0]}</em> {issue.title.split(' ').slice(1).join(' ')}</>}
        subtitle={`Reported ${fmt(issue.createdAt)}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Header card */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-card)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
              <StatusPill status={issue.status} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn
                  variant="ghost" size="sm"
                  onClick={() => upvoteMut.mutate()}
                  disabled={!isAuthenticated}
                  style={{ gap: 6 }}
                >
                  <ThumbsUp size={12} />
                  {issue.upvoteCount}
                </Btn>
                <Btn
                  variant="ghost" size="sm"
                  onClick={() => followMut.mutate()}
                  disabled={!isAuthenticated}
                  style={{ gap: 6 }}
                >
                  <Bell size={12} />
                  {issue.followerCount}
                </Btn>
              </div>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.7, margin: '0 0 16px' }}>
              {issue.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={10} /> {issue.address}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={10} /> {fmt(issue.createdAt)}
              </span>
              {issue.assignedDepartmentId && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <User size={10} /> Dept assigned
                </span>
              )}
            </div>
          </div>

          {/* Photos */}
          {issue.photos.length > 0 && (
            <div>
              <Eyebrow>Evidence photos</Eyebrow>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {issue.photos.map((key, i) => (
                  <div key={i} style={{
                    width: 100, height: 100,
                    background: 'var(--bg)',
                    border: '1px solid var(--line-2)',
                    borderRadius: 'var(--radius-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-3)',
                  }}>
                    {key.split('/').pop()?.slice(0, 8)}…
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution / rejection notes */}
          {issue.resolutionNotes && (
            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--civic)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 20px',
            }}>
              <Eyebrow>Resolution notes</Eyebrow>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-2)', margin: '8px 0 0', lineHeight: 1.6 }}>
                {issue.resolutionNotes}
              </p>
            </div>
          )}

          {issue.rejectionReason && (
            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--alert)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 20px',
            }}>
              <Eyebrow>Rejection reason</Eyebrow>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-2)', margin: '8px 0 0', lineHeight: 1.6 }}>
                {issue.rejectionReason}
              </p>
            </div>
          )}

          {/* Comments */}
          <div>
            <Eyebrow>Comments ({comments.length})</Eyebrow>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.map((c) => (
                <div key={c._id} style={{
                  background: 'var(--ink-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-card)',
                  padding: '14px 16px',
                  animation: 'fade-up 0.3s ease both',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '0.06em' }}>
                      {(c.authorId as unknown as { name: string })?.name ?? 'Anonymous'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-2)' }}>
                      {fmt(c.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
                    {c.text}
                  </p>
                </div>
              ))}

              {isAuthenticated && (
                <form onSubmit={submitComment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Field
                    label="Add a comment"
                    textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share an update or additional information…"
                    maxLength={500}
                  />
                  <Btn
                    type="submit"
                    size="sm"
                    disabled={commenting || !comment.trim()}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    {commenting ? 'Posting…' : 'Post comment'}
                  </Btn>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* SLA Bar */}
          {issue.slaDeadline && (
            <div style={{
              background: 'var(--ink-2)',
              border: '1px solid var(--line-2)',
              borderRadius: 'var(--radius-card)',
              padding: '18px 20px',
            }}>
              <SLABar
                slaDeadline={issue.slaDeadline}
                createdAt={issue.createdAt}
                status={issue.status}
              />
            </div>
          )}

          {/* Status timeline */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-card)',
            padding: '18px 20px',
          }}>
            <StatusTimeline history={issue.statusHistory} current={issue.status} />
          </div>

          {/* Meta */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-card)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {[
              ['ID', issue._id.toString().slice(-8).toUpperCase()],
              ['Category', issue.category],
              ['Severity', issue.severity],
              ['Upvotes', String(issue.upvoteCount)],
              ['Followers', String(issue.followerCount)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink)', textTransform: 'capitalize' }}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <Btn variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
              ← Back to map
            </Btn>
          </Link>
        </div>
      </div>
    </div>
  );
}
