import { NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin, BarChart3, Plus, LayoutDashboard, Bell,
  ClipboardList, TrendingUp, Users, Building2, Tag,
  ScrollText, LogOut, LogIn, Languages, UserCog,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLangStore } from '../../store/langStore';
import { useT } from '../../lib/useT';
import { authApi } from '../../lib/api';

function navItems(t: ReturnType<typeof useT>) {
  return [
    { label: t('nav_map'),           to: '/',               icon: MapPin,          roles: [] },
    { label: t('nav_transparency'),  to: '/transparency',    icon: BarChart3,       roles: [] },
    { label: t('nav_report'),        to: '/report',          icon: Plus,            roles: ['citizen','staff','admin'] },
    { label: t('nav_dashboard'),     to: '/dashboard',       icon: LayoutDashboard, roles: ['citizen','staff','admin'] },
    { label: t('nav_notifications'), to: '/notifications',   icon: Bell,            roles: ['citizen','staff','admin'] },
    { label: t('nav_profile'),       to: '/profile',         icon: UserCog,         roles: ['citizen','staff','admin'] },
    { label: t('nav_staff_queue'),   to: '/staff/queue',     icon: ClipboardList,   roles: ['staff','admin'] },
    { label: t('nav_analytics'),     to: '/admin/analytics', icon: TrendingUp,      roles: ['admin'] },
    { label: t('nav_users'),         to: '/admin/users',     icon: Users,           roles: ['admin'] },
    { label: t('nav_departments'),   to: '/admin/departments',icon: Building2,      roles: ['admin'] },
    { label: t('nav_categories'),    to: '/admin/categories', icon: Tag,            roles: ['admin'] },
    { label: t('nav_audit_logs'),    to: '/admin/audit-logs', icon: ScrollText,     roles: ['admin'] },
  ] as const;
}

export function Sidebar() {
  const { user, clearUser } = useAuthStore();
  const { lang, toggle: toggleLang } = useLangStore();
  const navigate = useNavigate();
  const t = useT();
  const isBn = lang === 'bn';

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

  return (
    <aside style={{
      width: 264,
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRight: '1px solid var(--line)',
      overflowY: 'auto',
    }}>

      {/* Brand */}
      <div style={{ padding: '24px 18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Brand mark */}
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px oklch(0.82 0.14 75 / 0.45)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%', background: 'white',
              animation: 'blink 1.6s ease-in-out infinite',
              position: 'relative', zIndex: 1,
            }} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 400,
              color: 'var(--ink)',
              margin: 0,
              letterSpacing: '-0.015em',
              lineHeight: 1,
            }}>
              Civic<em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Pulse</em>
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              color: 'var(--ink-3)',
              margin: '3px 0 0',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {isBn ? 'সিভিক রিপোর্টিং' : 'Civic Reporting'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                padding: '11px 14px',
                textDecoration: 'none',
                borderRadius: 14,
                background: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? '#fff' : 'var(--ink-2)',
                fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                fontWeight: isActive ? 600 : 500,
                fontSize: isBn ? '0.92rem' : '0.875rem',
                transition: 'all 0.18s ease',
                boxShadow: isActive ? '0 6px 18px rgba(26,31,46,0.18)' : 'none',
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.style.background.includes('var(--ink)') && el.style.background !== 'var(--ink)') {
                  el.style.background = 'rgba(255,255,255,0.5)';
                  el.style.color = 'var(--ink)';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                const active = el.getAttribute('aria-current') === 'page';
                if (!active) {
                  el.style.background = 'transparent';
                  el.style.color = 'var(--ink-2)';
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <span style={{
                    display: 'flex', flexShrink: 0,
                    color: isActive ? '#fff' : 'var(--ink-3)',
                  }}>
                    <Icon size={17} strokeWidth={isActive ? 2 : 1.8} />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Language toggle */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--line)' }}>
        <button
          onClick={toggleLang}
          title={lang === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'transparent',
            border: '1.5px solid var(--line-2)',
            borderRadius: 999,
            cursor: 'pointer',
            color: 'var(--ink-2)',
            fontFamily: lang === 'en' ? 'var(--font-bangla)' : 'var(--font-sans)',
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '9px 14px',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = 'var(--ink)';
            el.style.color = 'var(--ink)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = 'var(--line-2)';
            el.style.color = 'var(--ink-2)';
          }}
        >
          <Languages size={14} />
          {lang === 'en' ? 'বাংলা' : 'English'}
        </button>
      </div>

      {/* User footer */}
      <div style={{ padding: '10px 10px 16px', borderTop: '1px solid var(--line)' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--ink)',
              boxShadow: '0 4px 12px oklch(0.82 0.14 75 / 0.35)',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                fontSize: '0.875rem',
                color: 'var(--ink)',
                margin: 0,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user.name}
              </p>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--ink-3)',
                margin: '1px 0 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title={t('sign_out')}
              style={{
                background: 'transparent',
                border: '1.5px solid var(--line-2)',
                borderRadius: 999,
                cursor: 'pointer',
                color: 'var(--ink-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                transition: 'all 0.18s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = 'var(--alert)';
                el.style.color = 'var(--alert)';
                el.style.background = 'oklch(0.64 0.19 25 / 0.08)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = 'var(--line-2)';
                el.style.color = 'var(--ink-3)';
                el.style.background = 'transparent';
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#fff',
              textDecoration: 'none',
              padding: '12px 18px',
              background: 'var(--ink)',
              borderRadius: 999,
              boxShadow: 'var(--shadow-btn)',
              transition: 'all 0.18s ease',
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
