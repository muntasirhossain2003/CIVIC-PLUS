import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';

export function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div style={{
        width: '100%',
        maxWidth: 400,
        animation: 'fade-up 0.5s ease both',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 400,
            color: 'var(--bone)',
            margin: '0 0 6px',
          }}>
            Civic<em>Pulse</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.14em' }}>
            MUNICIPAL ISSUE TRACKER
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--ink-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--radius-card)',
          padding: '32px',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.14em', margin: '0 0 24px' }}>
            SIGN IN TO YOUR ACCOUNT
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
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--alert)', margin: 0 }}>
                {error}
              </p>
            )}

            <Btn type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Btn>
          </form>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 24, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/forgot-password" style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
              color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.08em',
            }}>
              Forgot password?
            </Link>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', margin: 0, letterSpacing: '0.06em' }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--pulse)', textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
