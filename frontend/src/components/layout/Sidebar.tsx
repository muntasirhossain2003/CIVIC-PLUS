import { NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin, BarChart3, Plus, LayoutDashboard, Bell,
  ClipboardList, TrendingUp, Users, Building2, Tag,
  ScrollText, LogOut, LogIn, Sun, Moon, Languages,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useLangStore } from '../../store/langStore';
import { useT } from '../../lib/useT';
import { authApi } from '../../lib/api';
import { RolePill } from '../ui/RolePill';

function navItems(t: ReturnType<typeof useT>) {
  return [
    { index: '01', portal: 'PUBLIC',  label: t('nav_map'),           to: '/',                  icon: MapPin,         roles: [] },
    { index: '02', portal: 'PUBLIC',  label: t('nav_transparency'),  to: '/transparency',       icon: BarChart3,      roles: [] },
    { index: '03', portal: 'CITIZEN', label: t('nav_report'),        to: '/report',             icon: Plus,           roles: ['citizen','staff','admin'] },
    { index: '04', portal: 'CITIZEN', label: t('nav_dashboard'),     to: '/dashboard',          icon: LayoutDashboard,roles: ['citizen','staff','admin'] },
    { index: '05', portal: 'CITIZEN', label: t('nav_notifications'), to: '/notifications',      icon: Bell,           roles: ['citizen','staff','admin'] },
    { index: '06', portal: 'STAFF',   label: t('nav_staff_queue'),   to: '/staff/queue',        icon: ClipboardList,  roles: ['staff','admin'] },
    { index: '07', portal: 'ADMIN',   label: t('nav_analytics'),     to: '/admin/analytics',    icon: TrendingUp,     roles: ['admin'] },
    { index: '08', portal: 'ADMIN',   label: t('nav_users'),         to: '/admin/users',        icon: Users,          roles: ['admin'] },
    { index: '09', portal: 'ADMIN',   label: t('nav_departments'),   to: '/admin/departments',  icon: Building2,      roles: ['admin'] },
    { index: '10', portal: 'ADMIN',   label: t('nav_categories'),    to: '/admin/categories',   icon: Tag,            roles: ['admin'] },
    { index: '11', portal: 'ADMIN',   label: t('nav_audit_logs'),    to: '/admin/audit-logs',   icon: ScrollText,     roles: ['admin'] },
  ] as const;
}

export function Sidebar() {
  const { user, clearUser } = useAuthStore();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const { lang, toggle: toggleLang } = useLangStore();
  const navigate = useNavigate();
  const t = useT();

  const items = navItems(t);
  const visible = items.filter((item) => {
    if (item.roles.length === 0) return true;
    return user && (item.roles as readonly string[]).includes(user.role);
  });

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearUser();
    navigate('/login');
  }

  const isBn = lang === 'bn';

  return (
    <aside style={{
      width: 272,
      background: 'var(--ink-2)',
      borderRight: '1px solid var(--line-2)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      boxShadow: '2px 0 16px rgba(0,0,0,0.2)',
    }}>

      {/* Brand */}
      <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
            <span style={{ position: 'absolute', inset: '25%', borderRadius: '50%', background: 'var(--pulse)' }} />
            {[0, 1].map((i) => (
              <span key={i} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '1.5px solid var(--pulse)',
                animation: `pulse-ring 1.2s ease-out ${i * 0.6}s infinite`,
                opacity: 0,
              }} />
            ))}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            margin: 0,
            color: 'var(--bone)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}>
            Civic<em>Pulse</em>
          </h1>
        </div>
        <p style={{
          fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
          fontSize: '0.68rem',
          color: 'var(--muted)',
          margin: 0,
          letterSpacing: isBn ? '0' : '0.08em',
          textTransform: isBn ? 'none' : 'uppercase',
          fontWeight: 500,
        }}>
          {t('tagline')}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {visible.map((item) => {
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
                padding: '11px 18px',
                textDecoration: 'none',
                borderLeft: isActive ? '3px solid var(--pulse)' : '3px solid transparent',
                background: isActive ? 'var(--pulse-soft)' : 'transparent',
                color: isActive ? 'var(--bone)' : 'var(--muted)',
                transition: 'all 0.15s ease',
                margin: '1px 0',
                borderRadius: '0 6px 6px 0',
                marginRight: 8,
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.classList.contains('active')) {
                  el.style.background = 'var(--ink-3)';
                  el.style.color = 'var(--bone)';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.classList.contains('active')) {
                  el.style.background = 'transparent';
                  el.style.color = 'var(--muted)';
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    color: isActive ? 'var(--pulse)' : 'var(--muted-2)',
                    minWidth: 18,
                    letterSpacing: '0.04em',
                  }}>
                    {item.index}
                  </span>
                  <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                  <span style={{
                    fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                    fontSize: isBn ? '0.95rem' : '0.88rem',
                    fontWeight: isActive ? 600 : 400,
                    flex: 1,
                    letterSpacing: isBn ? '0' : '0.01em',
                  }}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Utility buttons */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--line)', display: 'flex', gap: 6 }}>
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          title={lang === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'var(--ink-3)',
            border: '1px solid var(--line-2)',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--muted)',
            fontFamily: lang === 'en' ? 'var(--font-bangla)' : 'var(--font-sans)',
            fontSize: lang === 'en' ? '0.9rem' : '0.75rem',
            fontWeight: 500,
            padding: '7px 10px',
            transition: 'all 0.15s',
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
          <Languages size={13} />
          {t('language')}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'var(--ink-3)',
            border: '1px solid var(--line-2)',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--muted)',
            fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
            fontSize: '0.75rem',
            padding: '7px 12px',
            transition: 'all 0.15s',
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
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {theme === 'dark' ? t('light_mode') : t('dark_mode')}
        </button>
      </div>

      {/* User footer */}
      <div style={{ borderTop: '1px solid var(--line)', padding: '14px 16px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'var(--pulse-soft)',
              border: '2px solid var(--pulse)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--pulse)',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                fontSize: '0.88rem',
                color: 'var(--bone)',
                margin: '0 0 2px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user.name}
              </p>
              <RolePill role={user.role} pulse />
            </div>
            <button
              onClick={handleLogout}
              title={t('sign_out')}
              style={{
                background: 'none',
                border: '1px solid var(--line-2)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '6px 8px',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--alert)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--alert)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line-2)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: 'var(--pulse)',
              textDecoration: 'none',
              padding: '8px 12px',
              background: 'var(--pulse-soft)',
              border: '1px solid var(--pulse)',
              borderRadius: 6,
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <LogIn size={15} />
            {t('sign_in')}
          </NavLink>
        )}
      </div>
    </aside>
  );
}
