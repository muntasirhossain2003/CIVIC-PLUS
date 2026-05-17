import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useLangStore } from '../../store/langStore';
import { useT } from '../../lib/useT';

export function TopBar() {
  const { user } = useAuthStore();
  const unread = useNotifStore((s) => s.unread);
  const lang = useLangStore((s) => s.lang);
  const t = useT();
  const isBn = lang === 'bn';
  const [query, setQuery] = useState('');

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      padding: '18px 36px',
      borderBottom: '1px solid var(--line)',
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid var(--line)',
        borderRadius: 999,
        padding: '10px 18px',
        width: 360,
        maxWidth: '100%',
        transition: 'border-color 0.18s',
      }}
        onFocus={() => {}}
      >
        <Search size={15} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isBn ? 'সমস্যা খুঁজুন…' : 'Search issues…'}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
            fontSize: '0.875rem',
            color: 'var(--ink)',
          }}
        />
        <kbd style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--ink-3)',
          padding: '2px 6px',
          border: '1px solid var(--line-2)',
          borderRadius: 6,
          background: 'white',
        }}>
          /
        </kbd>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Report button — only for logged-in users */}
        {user && (
          <Link to="/report" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 999,
              padding: '9px 18px',
              fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'var(--ink)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px oklch(0.82 0.14 75 / 0.4)',
              transition: 'all 0.18s ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
            >
              <Plus size={14} />
              {isBn ? 'রিপোর্ট করুন' : 'Report issue'}
            </button>
          </Link>
        )}

        {/* Notification bell */}
        {user && (
          <Link to="/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              cursor: 'pointer',
              color: 'var(--ink-2)',
              transition: 'all 0.18s ease',
              position: 'relative',
            }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = 'var(--ink)';
                el.style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = 'var(--line)';
                el.style.color = 'var(--ink-2)';
              }}
            >
              <Bell size={16} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -2, right: -2,
                  minWidth: 16, height: 16,
                  background: 'var(--accent)',
                  borderRadius: 999,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {unread}
                </span>
              )}
            </button>
          </Link>
        )}

        {/* Avatar / Sign in */}
        {user ? (
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--ink)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px oklch(0.82 0.14 75 / 0.3)',
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--ink)',
              border: 'none',
              borderRadius: 999,
              padding: '9px 18px',
              fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-btn)',
              transition: 'all 0.18s ease',
            }}>
              {t('sign_in')}
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
