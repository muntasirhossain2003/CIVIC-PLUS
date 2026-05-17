import type { ReactNode } from 'react';
import { useLangStore } from '../../store/langStore';

export function Eyebrow({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';
  return (
    <p style={{
      fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-mono)',
      fontSize: '0.7rem',
      fontWeight: isBn ? 600 : 500,
      letterSpacing: isBn ? '0' : '0.10em',
      textTransform: isBn ? 'none' : 'uppercase',
      color: muted ? 'var(--ink-3)' : 'var(--ink-2)',
      margin: 0,
    }}>
      {children}
    </p>
  );
}
