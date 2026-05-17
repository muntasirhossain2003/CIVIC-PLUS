import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';

export function VerifyEmail() {
  const { state } = useLocation() as { state: { email?: string } };
  const navigate  = useNavigate();
  const [code, setCode]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const email = state?.email ?? '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.confirmEmail({ email, code });
      navigate('/login', { state: { verified: true } });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await authApi.resendCode(email);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch { /* ignore */ }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fade-up 0.5s ease both' }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px oklch(0.82 0.14 75 / 0.45)',
          }}>
            <span style={{ fontSize: '1.4rem' }}>✉️</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 400,
            color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.015em',
          }}>
            Check your email
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
            color: 'var(--ink-3)', margin: 0, lineHeight: 1.55,
          }}>
            We sent a 6-digit code to{' '}
            <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>{email || 'your email'}</strong>
          </p>
        </div>

        <div style={{
          background: 'var(--paper)',
          borderRadius: 'var(--radius-card)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--line)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field
              label="Verification code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              style={{ letterSpacing: '0.4em', fontSize: '1.4rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
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

            <Btn type="submit" disabled={loading || code.length < 6} style={{ width: '100%' }}>
              {loading ? 'Verifying…' : 'Verify email'}
            </Btn>
          </form>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 24, paddingTop: 20 }}>
            {resent ? (
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
                color: 'var(--civic)', margin: 0, fontWeight: 600,
              }}>
                ✓ New code sent to your email.
              </p>
            ) : (
              <button
                onClick={handleResend}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
                  color: 'var(--ink-2)', padding: 0,
                }}
              >
                Didn't receive it?{' '}
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Resend code →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
