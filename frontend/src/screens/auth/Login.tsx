import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';

export function Login() {
  const navigate  = useNavigate();
  const setUser   = useAuthStore((s) => s.setUser);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { accessToken, user } = res.data as { accessToken: string; user: User };
      setUser(user, accessToken);
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fade-up 0.5s ease both' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px oklch(0.82 0.14 75 / 0.45)',
            position: 'relative',
          }}>
            <span style={{
              width: 12, height: 12, borderRadius: '50%', background: 'white',
              animation: 'blink 1.6s ease-in-out infinite',
            }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 400,
            color: 'var(--ink)', margin: '0 0 4px',
            letterSpacing: '-0.015em',
          }}>
            Civic<em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Pulse</em>
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem', color: 'var(--ink-3)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            margin: 0,
          }}>
            Municipal Issue Tracker
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--paper)',
          borderRadius: 'var(--radius-card)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--line)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.1rem', fontWeight: 700,
            color: 'var(--ink)', margin: '0 0 6px',
          }}>
            Welcome back
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem', color: 'var(--ink-3)',
            margin: '0 0 24px',
          }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div style={{
                background: 'oklch(0.64 0.19 25 / 0.08)',
                border: '1px solid oklch(0.64 0.19 25 / 0.3)',
                borderRadius: 12,
                padding: '10px 14px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                color: 'var(--alert)',
              }}>
                {error}
              </div>
            )}

            <Btn type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Btn>
          </form>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 24, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/forgot-password" style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
              color: 'var(--ink-2)', textDecoration: 'none',
            }}>
              Forgot password?
            </Link>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink-3)', margin: 0 }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Create one →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
