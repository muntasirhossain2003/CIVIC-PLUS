import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useLangStore } from '../../store/langStore';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Btn({ variant = 'primary', size = 'md', children, style, ...props }: BtnProps) {
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';

  const base: React.CSSProperties = {
    fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
    fontWeight: 600,
    borderRadius: 8,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    transition: 'transform 0.1s ease, box-shadow 0.15s ease, opacity 0.15s ease',
    fontSize: size === 'sm' ? '0.82rem' : '0.9rem',
    padding: size === 'sm' ? '6px 14px' : '10px 22px',
    letterSpacing: isBn ? '0' : '0.01em',
    border: 'none',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--pulse)',
      color: '#0E1726',
      boxShadow: '0 2px 8px oklch(0.78 0.16 65 / 0.35)',
    },
    ghost: {
      background: 'var(--ink-3)',
      color: 'var(--muted)',
      border: '1px solid var(--line-2)',
      boxShadow: 'none',
    },
    danger: {
      background: 'transparent',
      color: 'var(--alert)',
      border: '1px solid var(--alert)',
      boxShadow: 'none',
    },
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translateY(-1px)';
        if (variant === 'primary') el.style.boxShadow = '0 4px 16px oklch(0.78 0.16 65 / 0.5)';
        else el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = '';
        if (variant === 'primary') el.style.boxShadow = '0 2px 8px oklch(0.78 0.16 65 / 0.35)';
        else el.style.boxShadow = 'none';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
