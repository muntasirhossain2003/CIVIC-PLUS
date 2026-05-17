import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fade-up 0.5s ease both' }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 400,
            color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.015em',
          }}>
            Civic<em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Pulse</em>
          </h1>
        </div>

        <div style={{
          background: 'var(--paper)',
          borderRadius: 'var(--radius-card)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--line)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)', fontSize: '1.1rem',
            fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px',
          }}>
            Reset password
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
            color: 'var(--ink-3)', margin: '0 0 24px', lineHeight: 1.55,
          }}>
            Enter your email and we'll send a reset code.
          </p>

          {sent ? (
            <div style={{
              background: 'oklch(0.68 0.13 155 / 0.1)',
              border: '1px solid oklch(0.68 0.13 155 / 0.4)',
              borderRadius: 12, padding: '14px 16px',
              fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
              color: 'var(--civic)', fontWeight: 600,
            }}>
              ✓ Reset code sent — redirecting…
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
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
              <Btn type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending…' : 'Send reset code'}
              </Btn>
            </form>
          )}

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 24, paddingTop: 20 }}>
            <Link to="/login" style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
              color: 'var(--ink-2)', textDecoration: 'none',
            }}>
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
