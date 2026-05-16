import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Eyebrow } from './Eyebrow';

interface BaseProps {
  label: string;
  error?: string;
}

type InputProps = BaseProps & { textarea?: false } & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & { textarea: true } & TextareaHTMLAttributes<HTMLTextAreaElement>;

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--ink-3)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--radius-card)',
  color: 'var(--bone)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.875rem',
  padding: '10px 12px',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export function Field(props: InputProps | TextareaProps) {
  const { label, error, textarea, ...rest } = props as TextareaProps;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Eyebrow>{label}</Eyebrow>
      {textarea ? (
        <textarea
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pulse)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; }}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pulse)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; }}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--alert)', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
