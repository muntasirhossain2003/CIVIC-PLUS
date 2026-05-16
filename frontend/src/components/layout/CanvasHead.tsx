import type { ReactNode } from 'react';
import { Eyebrow } from '../ui/Eyebrow';

interface Props {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}

export function CanvasHead({ eyebrow, title, subtitle }: Props) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 32,
      paddingBottom: 24,
      borderBottom: '1px solid var(--line)',
    }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          margin: '8px 0 0',
          color: 'var(--bone)',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--muted)',
            marginTop: 8,
            letterSpacing: '0.06em',
          }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        color: 'var(--muted-2)',
        textAlign: 'right',
        lineHeight: 2,
        flexShrink: 0,
        marginLeft: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--civic)',
            animation: 'live-blink 1.4s ease-in-out infinite',
            display: 'inline-block',
          }} />
          SYSTEM HEALTHY
        </div>
        <div>API v1.0 · {dateStr}</div>
      </div>
    </div>
  );
}
