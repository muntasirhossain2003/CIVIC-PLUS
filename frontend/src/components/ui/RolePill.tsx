import { UserRole } from '../../types';

const labels: Record<UserRole, string> = {
  citizen: 'CITIZEN',
  staff:   'STAFF',
  admin:   'ADMIN',
};

export function RolePill({ role, pulse }: { role: UserRole; pulse?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.14em',
      color: 'var(--pulse)',
      border: '1px solid var(--pulse)',
      borderRadius: 'var(--radius-card)',
      padding: '3px 8px',
    }}>
      {pulse && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--pulse)',
          animation: 'live-blink 1.4s ease-in-out infinite',
          display: 'inline-block',
        }} />
      )}
      {labels[role]}
    </span>
  );
}
