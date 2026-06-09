'use client';
import { useRef, useState } from 'react';
import { Send, Square } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isGenerating, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function adjustHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }

  function handleSend() {
    const msg = value.trim();
    if (!msg || isGenerating || disabled) return;
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSend(msg);
  }

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-end',
      padding: '12px 16px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-surface)',
    }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => { setValue(e.target.value); adjustHeight(); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={isGenerating ? 'Generating…' : 'Message OnDevAI… (Enter to send, Shift+Enter for newline)'}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          padding: '10px 12px',
          borderRadius: 'var(--radius)',
          fontSize: '14px',
          lineHeight: 1.5,
          minHeight: '42px',
          maxHeight: '200px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 0.15s',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />

      {isGenerating ? (
        <button
          onClick={onStop}
          title="Stop generating"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius)',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--red)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Square size={16} fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          title="Send"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius)',
            background: value.trim() && !disabled ? 'var(--accent)' : 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: value.trim() && !disabled ? 'white' : 'var(--text-disabled)',
            cursor: value.trim() && !disabled ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <Send size={16} />
        </button>
      )}
    </div>
  );
}
