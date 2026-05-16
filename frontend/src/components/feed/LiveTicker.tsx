import { useEffect, useState } from 'react';
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

export function LiveTicker({ initial = [] }: { initial?: TickerEntry[] }) {
  const [entries, setEntries] = useState<TickerEntry[]>(initial);

  useEffect(() => {
    const socket = getSocket();
    const handler = (issue: TickerEntry) => {
      setEntries((prev) => [{ ...issue, isNew: true }, ...prev].slice(0, 20));
      // Clear the flash after animation
      setTimeout(() => {
        setEntries((prev) => prev.map((e) => e._id === issue._id ? { ...e, isNew: false } : e));
      }, 900);
    };
    socket.on('issue:new', handler);
    return () => { socket.off('issue:new', handler); };
  }, []);

  return (
    <div style={{
      background: 'var(--ink-2)',
      border: '1px solid var(--line-2)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
    }}>
      {entries.length === 0 ? (
        <div style={{
          padding: '20px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--muted-2)',
          textAlign: 'center',
        }}>
          No recent activity
        </div>
      ) : (
        entries.map((e) => (
          <div
            key={e._id}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--line)',
              animation: e.isNew ? 'ticker-bump 0.8s ease forwards, fade-up 0.3s ease both' : undefined,
              transition: 'background 0.3s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                color: 'var(--bone)',
                margin: '0 0 4px',
                lineHeight: 1.3,
                flex: 1,
              }}>
                {e.title}
              </p>
              <StatusPill status={e.status} />
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              color: 'var(--muted-2)',
              margin: 0,
              letterSpacing: '0.04em',
            }}>
              {e.category.toUpperCase()} · {e.address}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
