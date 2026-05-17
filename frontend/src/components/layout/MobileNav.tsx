import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin, BarChart3, Plus, LayoutDashboard, MoreHorizontal,
  Bell, ClipboardList, TrendingUp, Users, Building2, Tag,
  ScrollText, LogOut, LogIn, Languages, X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useLangStore } from '../../store/langStore';
import { useT } from '../../lib/useT';
import { authApi } from '../../lib/api';

const TAB_H = 72;

export function MobileNav() {
  const { user, clearUser } = useAuthStore();
  const unread = useNotifStore((s) => s.unread);
  const { lang, toggle: toggleLang } = useLangStore();
  const navigate = useNavigate();
  const t = useT();
  const isBn = lang === 'bn';
  const [moreOpen, setMoreOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearUser();
    navigate('/login');
    setMoreOpen(false);
  }

  const primaryTabs = [
    { to: '/',             icon: MapPin,         label: isBn ? 'ম্যাপ'    : 'Map',    end: true },
    { to: '/transparency', icon: BarChart3,       label: isBn ? 'স্বচ্ছতা' : 'Public', end: false },
  ];

  const rightTabs = user
    ? [
        { to: '/dashboard',     icon: LayoutDashboard, label: isBn ? 'ড্যাশবোর্ড' : 'Mine',  end: false },
        { to: 'more' as const,  icon: MoreHorizontal,  label: isBn ? 'আরো'        : 'More',   end: false },
      ]
    : [
        { to: '/login',         icon: LogIn,           label: isBn ? 'লগইন'       : 'Sign in', end: false },
        { to: 'more' as const,  icon: MoreHorizontal,  label: isBn ? 'আরো'        : 'More',    end: false },
      ];

  const moreSections = user
    ? [
        {
          items: [
            { to: '/notifications', icon: Bell, label: isBn ? 'বিজ্ঞপ্তি' : 'Notifications', badge: unread > 0 ? unread : undefined },
          ],
        },
        ...(user.role === 'staff' || user.role === 'admin' ? [{
          label: 'Staff',
          items: [
            { to: '/staff/queue', icon: ClipboardList, label: isBn ? 'কিউ' : 'Staff Queue' },
          ],
        }] : []),
        ...(user.role === 'admin' ? [{
          label: 'Admin',
          items: [
            { to: '/admin/analytics',   icon: TrendingUp, label: isBn ? 'বিশ্লেষণ'  : 'Analytics' },
            { to: '/admin/users',       icon: Users,      label: isBn ? 'ব্যবহারকারী' : 'Users' },
            { to: '/admin/departments', icon: Building2,  label: isBn ? 'বিভাগ'      : 'Departments' },
            { to: '/admin/categories',  icon: Tag,        label: isBn ? 'ক্যাটাগরি'  : 'Categories' },
            { to: '/admin/audit-logs',  icon: ScrollText, label: isBn ? 'অডিট লগ'   : 'Audit Logs' },
          ],
        }] : []),
      ]
    : [];

  const tabStyle = (active: boolean) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '10px 4px 14px',
    border: 'none',
    background: 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-3)',
    fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.18s ease',
    WebkitTapHighlightColor: 'transparent',
  });

  return (
    <>
      {/* Spacer so content isn't hidden behind the nav */}
      <div style={{ height: TAB_H }} />

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: TAB_H,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--line)',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>

        {/* Left tabs */}
        {primaryTabs.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} style={{ flex: 1, textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={tabStyle(isActive)}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}

        {/* Center FAB — Report */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {user ? (
            <button
              onClick={() => navigate('/report')}
              style={{
                width: 56, height: 56,
                borderRadius: 999,
                background: 'var(--ink)',
                border: 'none',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: -22,
                boxShadow: '0 10px 24px rgba(26,31,46,0.35)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.04)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
              }}
            >
              <Plus size={24} />
            </button>
          ) : (
            <div style={{ width: 56, height: 56 }} />
          )}
        </div>

        {/* Right tabs */}
        {rightTabs.map(({ to, icon: Icon, label, end }) => {
          if (to === 'more') {
            return (
              <button
                key="more"
                onClick={() => setMoreOpen(true)}
                style={tabStyle(false)}
              >
                <Icon size={22} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            );
          }
          return (
            <NavLink key={to} to={to} end={end} style={{ flex: 1, textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={tabStyle(isActive)}>
                  <div style={{ position: 'relative' }}>
                    <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                    {to === '/notifications' && unread > 0 && (
                      <span style={{
                        position: 'absolute', top: -4, right: -4,
                        minWidth: 14, height: 14,
                        background: 'var(--accent)',
                        borderRadius: 999,
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 3px',
                      }}>{unread}</span>
                    )}
                  </div>
                  <span>{label}</span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* "More" sheet overlay */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMoreOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 110,
              background: 'rgba(26,31,46,0.35)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
          {/* Sheet */}
          <div style={{
            position: 'fixed',
            bottom: TAB_H,
            left: 0,
            right: 0,
            zIndex: 120,
            background: 'var(--paper)',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -8px 40px rgba(26,31,46,0.18)',
            padding: '20px 20px 24px',
            maxHeight: '75vh',
            overflowY: 'auto',
            animation: 'fade-up 0.25s ease both',
          }}>
            {/* Handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: 'var(--line-2)',
              margin: '0 auto 20px',
            }} />

            {/* Close button */}
            <button
              onClick={() => setMoreOpen(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'var(--bg)',
                border: 'none',
                borderRadius: 999,
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink-3)',
              }}
            >
              <X size={16} />
            </button>

            {/* User info */}
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                background: 'var(--bg)',
                borderRadius: 16,
                marginBottom: 16,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-sans)', fontWeight: 700,
                  fontSize: '1rem', color: 'var(--ink)',
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '0.95rem' }}>
                    {user.name}
                  </p>
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            {/* More menu items */}
            {moreSections.map((section, si) => (
              <div key={si} style={{ marginBottom: 12 }}>
                {section.label && (
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                    color: 'var(--ink-3)', textTransform: 'uppercase',
                    letterSpacing: '0.1em', margin: '0 0 6px 4px',
                  }}>
                    {section.label}
                  </p>
                )}
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 16px',
                      textDecoration: 'none',
                      borderRadius: 14,
                      background: isActive ? 'var(--ink)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--ink-2)',
                      fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                      fontWeight: 500, fontSize: '0.9rem',
                      marginBottom: 2,
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={18} strokeWidth={isActive ? 2 : 1.8} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {'badge' in item && item.badge !== undefined && (
                          <span style={{
                            minWidth: 20, height: 20,
                            background: 'var(--accent)', borderRadius: 999,
                            fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                          }}>{item.badge}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', borderRadius: 14,
                background: 'transparent', border: 'none',
                color: 'var(--ink-2)',
                fontFamily: lang === 'en' ? 'var(--font-bangla)' : 'var(--font-sans)',
                fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer',
                marginBottom: 2,
              }}
            >
              <Languages size={18} strokeWidth={1.8} />
              {lang === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
            </button>

            {/* Logout */}
            {user ? (
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', borderRadius: 14,
                  background: 'transparent', border: 'none',
                  color: 'var(--alert)',
                  fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                  fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                <LogOut size={18} strokeWidth={1.8} />
                {t('sign_out')}
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMoreOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', borderRadius: 14,
                  textDecoration: 'none',
                  background: 'var(--ink)', color: '#fff',
                  fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
                  fontWeight: 600, fontSize: '0.9rem',
                }}
              >
                <LogIn size={18} strokeWidth={1.8} />
                {t('sign_in')}
              </NavLink>
            )}
          </div>
        </>
      )}
    </>
  );
}
