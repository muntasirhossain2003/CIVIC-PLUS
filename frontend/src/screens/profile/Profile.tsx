import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useLangStore } from '../../store/langStore';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { Field } from '../../components/ui/Field';
import { Btn } from '../../components/ui/Btn';
import { RolePill } from '../../components/ui/RolePill';
import { useIsMobile } from '../../lib/useIsMobile';
import { Bell, MessageSquare } from 'lucide-react';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--primary)' : 'var(--line-2)',
        position: 'relative', flexShrink: 0, transition: 'background 0.18s ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.18s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export function Profile() {
  const { user, accessToken, setUser } = useAuthStore();
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';
  const isMobile = useIsMobile();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [emailPrefs, setEmailPrefs] = useState(user?.notificationPrefs?.email ?? true);
  const [inAppPrefs, setInAppPrefs] = useState(user?.notificationPrefs?.inApp ?? true);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      authApi.updateMe({
        name,
        phone: phone || undefined,
        notificationPrefs: { email: emailPrefs, inApp: inAppPrefs },
      }),
    onSuccess: (res) => {
      if (accessToken) setUser(res.data.user, accessToken);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (!user) return null;

  return (
    <div style={{ padding: isMobile ? '16px 16px 80px' : 'clamp(24px, 4vw, 40px)', maxWidth: 560 }}>
      <CanvasHead
        eyebrow={isBn ? 'অ্যাকাউন্ট' : 'Account'}
        title={isBn ? <>আমার <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>প্রোফাইল</em></> : <>My <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>profile</em></>}
        subtitle={isBn ? 'আপনার তথ্য এবং বিজ্ঞপ্তি পছন্দ পরিচালনা করুন' : 'Manage your details and notification preferences'}
      />

      <div style={{
        background: 'var(--paper)', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)',
        padding: isMobile ? '20px' : '28px 32px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-sans)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)',
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', margin: '0 0 4px' }}>{user.email}</p>
            <RolePill role={user.role} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label={isBn ? 'পুরো নাম' : 'Full name'} value={name} onChange={(e) => setName(e.target.value)} />
          <Field label={isBn ? 'ফোন (ঐচ্ছিক)' : 'Phone (optional)'} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div style={{
        background: 'var(--paper)', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)',
        padding: isMobile ? '20px' : '28px 32px', marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 18px' }}>
          {isBn ? 'বিজ্ঞপ্তি পছন্দ' : 'Notification preferences'}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={16} style={{ color: 'var(--ink-3)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-2)' }}>
              {isBn ? 'ইমেইল বিজ্ঞপ্তি' : 'Email notifications'}
            </span>
          </div>
          <Toggle checked={emailPrefs} onChange={setEmailPrefs} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={16} style={{ color: 'var(--ink-3)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-2)' }}>
              {isBn ? 'ইন-অ্যাপ বিজ্ঞপ্তি' : 'In-app notifications'}
            </span>
          </div>
          <Toggle checked={inAppPrefs} onChange={setInAppPrefs} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Btn disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving…') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save changes')}
        </Btn>
        {saved && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--civic)' }}>
            {isBn ? '✓ সংরক্ষিত হয়েছে' : '✓ Saved'}
          </span>
        )}
        {mutation.isError && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--alert)' }}>
            {isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Save failed'}
          </span>
        )}
      </div>
    </div>
  );
}
