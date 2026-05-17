import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useLangStore } from '../../store/langStore';

interface BaseProps {
  label: string;
  error?: string;
}

type InputProps    = BaseProps & { textarea?: false } & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & { textarea: true }  & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Field(props: InputProps | TextareaProps) {
  const { label, error, textarea, ...rest } = props as TextareaProps;
  const lang = useLangStore((s) => s.lang);
  const isBn = lang === 'bn';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.7)',
    border: '1.5px solid var(--line)',
    borderRadius: 14,
    color: 'var(--ink)',
    fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
    fontSize: '0.9rem',
    padding: '12px 16px',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    boxShadow: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: isBn ? 'var(--font-bangla)' : 'var(--font-sans)',
        fontSize: '0.82rem',
        fontWeight: 600,
        color: 'var(--ink-2)',
      }}>
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--ink)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,31,46,0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--line)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--ink)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,31,46,0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--line)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--alert)',
          margin: 0,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
