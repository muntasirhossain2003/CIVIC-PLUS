import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error,   setError]   = useState('');
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
      padding: 'clamp(16px, 5vw, 24px)',
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
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0,
          }}>
            Create your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--paper)',
          borderRadius: 'var(--radius-card)',
          padding: 'clamp(20px, 5vw, 32px)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--line)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)', fontSize: '1.1rem',
            fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px',
          }}>
            Join CivicPulse
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
            color: 'var(--ink-3)', margin: '0 0 24px',
          }}>
            Report issues and help improve your city
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Full name"     type="text"     value={form.name}     onChange={set('name')}     required autoComplete="name" />
            <Field label="Email address" type="email"    value={form.email}    onChange={set('email')}    required autoComplete="email" />
            <div>
              <Field label="Password"   type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" />
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                color: 'var(--ink-3)', margin: '6px 0 0', lineHeight: 1.5,
              }}>
                Min 8 chars · uppercase · lowercase · number · special char (@, #, !)
              </p>
            </div>
            <Field label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />

            {error && (
              <div style={{
                background: 'oklch(0.64 0.19 25 / 0.08)',
                border: '1px solid oklch(0.64 0.19 25 / 0.3)',
                borderRadius: 12, padding: '10px 14px',
                fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--alert)',
              }}>
                {error}
              </div>
            )}

            <Btn type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </Btn>
          </form>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 24, paddingTop: 20 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink-3)', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
