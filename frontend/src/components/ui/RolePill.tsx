import type { UserRole } from '../../types';

const labels: Record<UserRole, string> = {
  citizen: 'Citizen',
  staff:   'Staff',
  admin:   'Admin',
};

const colors: Record<UserRole, { bg: string; fg: string }> = {
  citizen: { bg: 'var(--primary-soft)',             fg: 'var(--primary)' },
  staff:   { bg: 'oklch(0.82 0.14 75 / 0.14)',      fg: 'oklch(0.52 0.14 65)' },
  admin:   { bg: 'oklch(0.64 0.19 25 / 0.12)',       fg: 'var(--alert)' },
};

export function RolePill({ role, pulse }: { role: UserRole; pulse?: boolean }) {
  const { bg, fg } = colors[role];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'var(--font-sans)',
      fontSize: '0.68rem',
      fontWeight: 700,
      color: fg,
      background: bg,
      borderRadius: 999,
      padding: '3px 9px',
      letterSpacing: '0.04em',
    }}>
      {pulse && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: fg,
          animation: 'blink 1.6s ease-in-out infinite',
          display: 'inline-block',
          flexShrink: 0,
        }} />
      )}
      {labels[role]}
    </span>
  );
}
