import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Registration failed. Please try again.');
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--bone)', margin: '0 0 6px' }}>
            Civic<em>Pulse</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.14em' }}>
            CREATE YOUR ACCOUNT
          </p>
        </div>

        <div style={{
          background: 'var(--ink-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--radius-card)',
          padding: '32px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Full name" type="text" value={form.name} onChange={set('name')} required autoComplete="name" />
            <Field label="Email address" type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete="new-password"
            />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted)', margin: '-8px 0 0' }}>
              Min 8 chars · uppercase · lowercase · number · special character (e.g. @, #, !)
            </p>
            <Field label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />

            {error && (
              <div style={{
                background: 'oklch(0.66 0.21 25 / 0.12)',
                border: '1px solid var(--alert)',
                borderRadius: 'var(--radius-card)',
                padding: '10px 14px',
              }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--alert)', margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            <Btn type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </Btn>
          </form>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 24, paddingTop: 20 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--pulse)', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
