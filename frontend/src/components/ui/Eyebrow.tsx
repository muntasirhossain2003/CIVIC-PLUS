import type { ReactNode } from 'react';
import { useLangStore } from '../../store/langStore';

export function Eyebrow({ children }: { children: ReactNode }) {
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';
  return (
    <p style={{
      fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: isBn ? '0' : '0.12em',
      textTransform: isBn ? 'none' : 'uppercase',
      color: 'var(--pulse)',
      margin: 0,
    }}>
      {children}
    </p>
  );
}
