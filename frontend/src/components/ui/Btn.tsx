import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Btn({ variant = 'primary', size = 'md', children, style, ...props }: BtnProps) {
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    borderRadius: 'var(--radius-card)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    fontSize: size === 'sm' ? '0.8rem' : '0.875rem',
    padding: size === 'sm' ? '5px 12px' : '9px 20px',
    border: 'none',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--pulse)', color: 'var(--ink)' },
    ghost:   { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line-2)' },
    danger:  { background: 'transparent', color: 'var(--alert)', border: '1px solid var(--alert)' },
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = variant === 'primary'
          ? '0 0 0 4px var(--pulse-soft)' : '0 2px 8px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = '';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
