import type { ReactNode } from 'react';

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '0.7rem',
      fontWeight: 500,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      margin: 0,
    }}>
      {children}
    </p>
  );
}
