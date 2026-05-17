import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { issueApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useLangStore } from '../../store/langStore';
import type { Issue } from '../../types';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { StatusPill } from '../../components/ui/StatusPill';
import { Btn } from '../../components/ui/Btn';
import { Plus, MapPin, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';

  const { data, isLoading } = useQuery({
    queryKey: ['my-issues'],
    queryFn: () => issueApi.list({ reporterId: user?._id, limit: 20 }).then((r) => r.data),
    enabled: !!user,
  });

  const issues: Issue[] = data?.data ?? [];
  const total      = issues.length;
  const resolved   = issues.filter((i) => i.status === 'resolved').length;
  const inProgress = issues.filter((i) => i.status === 'in_progress' || i.status === 'acknowledged').length;
  const submitted  = issues.filter((i) => i.status === 'submitted').length;

  const stats = [
    { icon: TrendingUp,   label: isBn ? 'মোট রিপোর্ট'    : 'Total reported', value: total,      color: 'var(--primary)' },
    { icon: CheckCircle,  label: isBn ? 'সমাধান হয়েছে'  : 'Resolved',       value: resolved,    color: 'var(--civic)' },
    { icon: Clock,        label: isBn ? 'প্রক্রিয়ায়'     : 'In progress',    value: inProgress,  color: 'var(--accent-2)' },
    { icon: AlertCircle,  label: isBn ? 'পর্যালোচনায়'   : 'Pending review', value: submitted,   color: 'var(--ink-3)' },
  ];

  return (
    <div style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow={isBn ? 'আমার ড্যাশবোর্ড' : 'My Dashboard'}
        title={isBn
          ? <>হ্যালো, <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{user?.name?.split(' ')[0]}</em></>
          : <>Hello, <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{user?.name?.split(' ')[0]}</em></>
        }
        subtitle={isBn ? 'আপনার সমস্যা রিপোর্টের সারসংক্ষেপ' : 'A summary of your civic issue reports'}
        action={
          <Link to="/report" style={{ textDecoration: 'none' }}>
            <Btn variant="sunny" size="sm">
              <Plus size={14} />
              {isBn ? 'নতুন রিপোর্ট' : 'New report'}
            </Btn>
          </Link>
        }
      />

      {/* Stat strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 32,
      }}>
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{
            background: 'var(--paper)',
            borderRadius: 'var(--radius-card)',
            padding: '20px 22px',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--line)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: `${color}1A`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem', color: 'var(--ink-3)',
              textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px',
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem', color: 'var(--ink)',
              margin: 0, lineHeight: 1,
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* My issues */}
      <div style={{
        background: 'var(--paper)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--line)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', margin: 0,
          }}>
            {isBn ? 'আমার রিপোর্টসমূহ' : 'My reports'}
          </h2>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem', color: 'var(--ink-3)',
          }}>
            {total} {isBn ? 'টি মোট' : 'total'}
          </span>
        </div>

        {isLoading ? (
          <div style={{
            padding: '40px 22px', textAlign: 'center',
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)',
          }}>
            {isBn ? 'লোড হচ্ছে…' : 'Loading…'}
          </div>
        ) : issues.length === 0 ? (
          <div style={{
            padding: '56px 22px', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--primary-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <MapPin size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <p style={{
              fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
              fontSize: '0.9rem', color: 'var(--ink-2)', margin: '0 0 18px',
            }}>
              {isBn ? 'আপনি এখনো কোনো সমস্যা রিপোর্ট করেননি।' : "You haven't reported any issues yet."}
            </p>
            <Link to="/report" style={{ textDecoration: 'none' }}>
              <Btn size="sm">
                <Plus size={14} />
                {isBn ? 'প্রথম রিপোর্ট করুন' : 'Report your first issue'}
              </Btn>
            </Link>
          </div>
        ) : (
          issues.map((issue, idx) => (
            <Link key={issue._id} to={`/issues/${issue._id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                padding: '16px 22px',
                borderBottom: idx < issues.length - 1 ? '1px solid var(--line)' : 'none',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'oklch(0.48 0.09 220 / 0.04)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <p style={{
                      fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                      fontSize: '0.875rem', fontWeight: 600,
                      color: 'var(--ink)', margin: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {issue.title}
                    </p>
                    <StatusPill status={issue.status} />
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.75rem', color: 'var(--ink-3)',
                    margin: 0, display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <MapPin size={10} />
                    {issue.address}
                    <span style={{ color: 'var(--line-2)', margin: '0 2px' }}>·</span>
                    {fmt(issue.createdAt)}
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  background: 'var(--bg)',
                  padding: '3px 8px', borderRadius: 999,
                  flexShrink: 0,
                }}>
                  {issue.category}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
