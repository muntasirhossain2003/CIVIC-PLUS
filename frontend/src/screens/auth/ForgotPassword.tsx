import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';
import { Eyebrow } from '../../components/ui/Eyebrow';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

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
      <div style={{ width: '100%', maxWidth: 400, animation: 'fade-up 0.5s ease both' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--bone)', margin: '0 0 6px' }}>
            Civic<em>Pulse</em>
          </h1>
        </div>

        <div style={{
          background: 'var(--ink-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--radius-card)',
          padding: 32,
        }}>
          <Eyebrow>Reset password</Eyebrow>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted)', margin: '12px 0 24px' }}>
            Enter your email and we'll send a reset code via AWS Cognito.
          </p>

          {sent ? (
            <div style={{
              background: 'var(--ink-3)',
              border: '1px solid var(--civic)',
              borderRadius: 'var(--radius-card)',
              padding: 16,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--civic)',
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
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--alert)', margin: 0 }}>{error}</p>
              )}
              <Btn type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Sending…' : 'Send reset code'}
              </Btn>
            </form>
          )}

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 24, paddingTop: 20 }}>
            <Link to="/login" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
