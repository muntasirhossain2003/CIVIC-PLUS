import { NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin, BarChart3, Plus, LayoutDashboard, Bell,
  ClipboardList, TrendingUp, Users, Building2, Tag,
  ScrollText, LogOut, LogIn, Sun, Moon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { authApi } from '../../lib/api';
import { RolePill } from '../ui/RolePill';

const allItems = [
  { index: '01', portal: 'PUBLIC',  label: 'Live Map',      to: '/',                  icon: MapPin,        roles: [] },
  { index: '02', portal: 'PUBLIC',  label: 'Transparency',  to: '/transparency',       icon: BarChart3,     roles: [] },
  { index: '03', portal: 'CITIZEN', label: 'Report Issue',  to: '/report',             icon: Plus,          roles: ['citizen', 'staff', 'admin'] },
  { index: '04', portal: 'CITIZEN', label: 'My Dashboard',  to: '/dashboard',          icon: LayoutDashboard, roles: ['citizen', 'staff', 'admin'] },
  { index: '05', portal: 'CITIZEN', label: 'Notifications', to: '/notifications',      icon: Bell,          roles: ['citizen', 'staff', 'admin'] },
  { index: '06', portal: 'STAFF',   label: 'Staff Queue',   to: '/staff/queue',        icon: ClipboardList, roles: ['staff', 'admin'] },
  { index: '07', portal: 'ADMIN',   label: 'Analytics',     to: '/admin/analytics',    icon: TrendingUp,    roles: ['admin'] },
  { index: '08', portal: 'ADMIN',   label: 'Users',         to: '/admin/users',        icon: Users,         roles: ['admin'] },
  { index: '09', portal: 'ADMIN',   label: 'Departments',   to: '/admin/departments',  icon: Building2,     roles: ['admin'] },
  { index: '10', portal: 'ADMIN',   label: 'Categories',    to: '/admin/categories',   icon: Tag,           roles: ['admin'] },
  { index: '11', portal: 'ADMIN',   label: 'Audit Logs',    to: '/admin/audit-logs',   icon: ScrollText,    roles: ['admin'] },
] as const;

export function Sidebar() {
  const { user, clearUser } = useAuthStore();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const visibleItems = allItems.filter((item) => {
    if (item.roles.length === 0) return true;
    return user && (item.roles as readonly string[]).includes(user.role);
  });

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearUser();
    navigate('/login');
  }

  return (
    <aside style={{
      width: 280,
      background: 'var(--ink-2)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Brand pulse mark */}
          <div style={{ position: 'relative', width: 22, height: 22, flexShrink: 0 }}>
            <span style={{
              position: 'absolute', inset: '25%',
              borderRadius: '50%',
              background: 'var(--pulse)',
            }} />
            {[0, 1].map((i) => (
              <span key={i} style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: '1.5px solid var(--pulse)',
                animation: `pulse-ring 1.2s ease-out ${i * 0.6}s infinite`,
                opacity: 0,
              }} />
            ))}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            margin: 0,
            color: 'var(--bone)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}>
            Civic<em>Pulse</em>
          </h1>
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.68rem',
          color: 'var(--muted)',
          margin: '6px 0 0',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          Municipal Issue Tracker
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                textDecoration: 'none',
                borderLeft: isActive ? '2px solid var(--pulse)' : '2px solid transparent',
                background: isActive ? 'var(--pulse-soft)' : 'transparent',
                color: isActive ? 'var(--bone)' : 'var(--muted)',
                transition: 'all 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: isActive ? 'var(--pulse)' : 'var(--muted-2)',
                    minWidth: 20,
                    letterSpacing: '0.05em',
                  }}>
                    {item.index}
                  </span>
                  <Icon size={15} strokeWidth={1.5} />
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 500 : 400,
                    flex: 1,
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'var(--muted-2)',
                    letterSpacing: '0.1em',
                  }}>
                    {item.portal}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div style={{ padding: '8px 20px', borderTop: '1px solid var(--line)' }}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            background: 'none',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius-card)',
            cursor: 'pointer',
            color: 'var(--muted)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            padding: '7px 10px',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--pulse)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--pulse)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line-2)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
          }}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--line)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {user ? (
          <>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--bone)', margin: '0 0 2px', fontWeight: 500 }}>
                {user.name}
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
                {user.email}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <RolePill role={user.role} pulse />
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.04em',
                  padding: 0,
                }}
              >
                <LogOut size={13} />
                Log out
              </button>
            </div>
          </>
        ) : (
          <NavLink
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--pulse)',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            <LogIn size={14} />
            Sign in
          </NavLink>
        )}
      </div>
    </aside>
  );
}
