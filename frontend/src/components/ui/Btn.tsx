import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useLangStore } from '../../store/langStore';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'sunny' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Btn({ variant = 'primary', size = 'md', children, style, ...props }: BtnProps) {
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';

  const base: React.CSSProperties = {
    fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
    fontWeight: 600,
    borderRadius: 999,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'transform 0.15s ease, box-shadow 0.18s ease, background 0.18s ease',
    border: 'none',
    letterSpacing: isBn ? '0' : '-0.01em',
    fontSize: size === 'sm' ? '0.82rem' : size === 'lg' ? '1rem' : '0.9rem',
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 28px' : '12px 22px',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--ink)',
      color: '#fff',
      boxShadow: 'var(--shadow-btn)',
    },
    sunny: {
      background: 'var(--accent)',
      color: 'var(--ink)',
      boxShadow: '0 6px 18px oklch(0.82 0.14 75 / 0.45)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-2)',
      border: '1.5px solid var(--line-2)',
      boxShadow: 'none',
    },
    danger: {
      background: 'transparent',
      color: 'var(--alert)',
      border: '1.5px solid var(--alert)',
      boxShadow: 'none',
    },
  };

  function hoverShadow() {
    if (variant === 'primary') return '0 8px 24px rgba(26,31,46,0.32)';
    if (variant === 'sunny') return '0 8px 24px oklch(0.82 0.14 75 / 0.55)';
    return '0 2px 8px rgba(26,31,46,0.12)';
  }

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translateY(-1px)';
        el.style.boxShadow = hoverShadow();
        if (variant === 'primary') el.style.background = 'var(--primary-2)';
        if (variant === 'ghost') el.style.borderColor = 'var(--ink)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = '';
        el.style.boxShadow = variants[variant].boxShadow as string ?? 'none';
        if (variant === 'primary') el.style.background = 'var(--ink)';
        if (variant === 'ghost') el.style.borderColor = 'var(--line-2)';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
