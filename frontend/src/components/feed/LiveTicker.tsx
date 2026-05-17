import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSocket } from '../../lib/socket';
import { StatusPill } from '../ui/StatusPill';
import type { Issue } from '../../types';

interface TickerEntry {
  _id: string;
  title: string;
  category: string;
  status: Issue['status'];
  address: string;
  createdAt: string;
  isNew?: boolean;
}

const CAT_ICONS: Record<string, string> = {
  pothole: '🕳', streetlight: '💡', garbage: '🗑',
  water: '💧', drainage: '🌊', power: '⚡', other: '📌',
};

export function LiveTicker({ initial = [] }: { initial?: TickerEntry[] }) {
  const [entries, setEntries] = useState<TickerEntry[]>(initial);

  useEffect(() => {
    const socket = getSocket();
    const handler = (issue: TickerEntry) => {
      setEntries((prev) => [{ ...issue, isNew: true }, ...prev].slice(0, 20));
      setTimeout(() => {
        setEntries((prev) => prev.map((e) => e._id === issue._id ? { ...e, isNew: false } : e));
      }, 900);
    };
    socket.on('issue:new', handler);
    return () => { socket.off('issue:new', handler); };
  }, []);

  if (entries.length === 0) {
    return (
      <div style={{
        padding: '24px 18px',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.82rem',
        color: 'var(--ink-3)',
      }}>
        No recent activity
      </div>
    );
  }

  return (
    <div>
      {entries.map((e, idx) => (
        <Link
          key={e._id}
          to={`/issues/${e._id}`}
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div style={{
            padding: '12px 18px',
            borderBottom: idx < entries.length - 1 ? '1px solid var(--line)' : 'none',
            background: e.isNew ? 'oklch(0.82 0.14 75 / 0.10)' : 'transparent',
            transition: 'background 0.4s ease',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'oklch(0.48 0.09 220 / 0.05)'; }}
            onMouseLeave={(el) => { (el.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                fontSize: '1.1rem',
                lineHeight: 1,
                marginTop: 1,
                flexShrink: 0,
              }}>
                {CAT_ICONS[e.category] ?? '📌'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  margin: '0 0 4px',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {e.title}
                </p>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  color: 'var(--ink-3)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {e.address}
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <StatusPill status={e.status} />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
