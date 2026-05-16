import type { ReactNode } from 'react';
import { useT } from '../../lib/useT';
import { useLangStore } from '../../store/langStore';
import { Eyebrow } from '../ui/Eyebrow';

interface Props {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}

export function CanvasHead({ eyebrow, title, subtitle }: Props) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';
  const now = new Date();
  const dateStr = now.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 32,
      paddingBottom: 24,
      borderBottom: '1px solid var(--line)',
    }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 style={{
          fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-display)',
          fontSize: isBn ? 'clamp(1.6rem, 3vw, 2.4rem)' : 'clamp(1.8rem, 3.5vw, 3rem)',
          margin: '8px 0 0',
          color: 'var(--bone)',
          fontWeight: isBn ? 700 : 400,
          lineHeight: 1.2,
          letterSpacing: isBn ? '0' : '-0.01em',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
            fontSize: '0.85rem',
            color: 'var(--muted)',
            marginTop: 8,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: 'var(--muted)',
        textAlign: 'right',
        lineHeight: 2,
        flexShrink: 0,
        marginLeft: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--civic)',
            animation: 'live-blink 1.4s ease-in-out infinite',
            display: 'inline-block',
          }} />
          {t('system_ok')}
        </div>
        <div>API v1.0 · {dateStr}</div>
      </div>
    </div>
  );
}
