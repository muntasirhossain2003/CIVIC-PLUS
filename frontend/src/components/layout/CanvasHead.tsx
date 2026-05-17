import type { ReactNode } from 'react';
import { useLangStore } from '../../store/langStore';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export function CanvasHead({ eyebrow, title, subtitle, action }: Props) {
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 32,
    }}>
      <div>
        {eyebrow && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            margin: '0 0 8px',
          }}>
            {eyebrow}
          </p>
        )}
        <h1 style={{
          fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-display)',
          fontSize: isBn ? 'clamp(1.6rem, 3vw, 2.4rem)' : 'clamp(1.8rem, 3vw, 2.8rem)',
          fontWeight: isBn ? 700 : 400,
          color: 'var(--ink)',
          margin: 0,
          letterSpacing: isBn ? '0' : '-0.01em',
          lineHeight: 1.15,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
            fontSize: '0.875rem',
            color: 'var(--ink-3)',
            margin: '8px 0 0',
            lineHeight: 1.5,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div style={{ flexShrink: 0, marginTop: 4 }}>
          {action}
        </div>
      )}
    </div>
  );
}
