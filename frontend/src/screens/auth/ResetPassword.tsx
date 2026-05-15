import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';
import { Eyebrow } from '../../components/ui/Eyebrow';

export function ResetPassword() {
  const { state } = useLocation() as { state: { email?: string } };
  const navigate = useNavigate();
  const [form, setForm] = useState({ code: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const email = state?.email ?? '';

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword({ email, code: form.code, password: form.password });
      navigate('/login', { state: { reset: true } });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Reset failed. Check your code and try again.');
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
          <Eyebrow>Set new password</Eyebrow>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted)', margin: '12px 0 24px' }}>
            Enter the 6-digit code sent to <strong style={{ color: 'var(--bone)' }}>{email}</strong> and choose a new password.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field
              label="Reset code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              placeholder="000000"
              style={{ letterSpacing: '0.3em', fontSize: '1.1rem', textAlign: 'center' }}
              required
            />
            <Field label="New password" type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" />
            <Field label="Confirm password" type="password" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--alert)', margin: 0 }}>{error}</p>
            )}

            <Btn type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Resetting…' : 'Reset password'}
            </Btn>
          </form>
        </div>
      </div>
    </div>
  );
}
