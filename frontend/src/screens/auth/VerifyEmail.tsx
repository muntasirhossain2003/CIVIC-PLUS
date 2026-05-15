import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';
import { Eyebrow } from '../../components/ui/Eyebrow';

export function VerifyEmail() {
  const { state } = useLocation() as { state: { email?: string } };
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
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
          <Eyebrow>Verify your email</Eyebrow>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted)', margin: '12px 0 24px' }}>
            We sent a 6-digit code to <strong style={{ color: 'var(--bone)' }}>{email || 'your email'}</strong>.
            Enter it below to activate your account.
          </p>

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
              style={{ letterSpacing: '0.3em', fontSize: '1.2rem', textAlign: 'center' }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--alert)', margin: 0 }}>{error}</p>
            )}

            <Btn type="submit" disabled={loading || code.length < 6} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Verifying…' : 'Verify email'}
            </Btn>
          </form>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 24, paddingTop: 20 }}>
            {resent ? (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--civic)', margin: 0 }}>
                ✓ New code sent.
              </p>
            ) : (
              <button
                onClick={handleResend}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  color: 'var(--muted)', letterSpacing: '0.06em', padding: 0,
                }}
              >
                Didn't receive it? Resend code →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
