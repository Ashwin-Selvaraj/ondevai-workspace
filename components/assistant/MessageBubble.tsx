'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

function renderMarkdown(text: string): string {
  return text
    // Code blocks (``` ... ```)
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre style="background:var(--bg-base);border:1px solid var(--border);border-radius:6px;padding:12px;overflow-x:auto;margin:8px 0;"><code style="font-family:var(--font-mono);font-size:12px;color:var(--text-primary);">${escHtml(code.trim())}</code></pre>`
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-family:var(--font-mono);font-size:12px;">$1</code>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Bullet lists
    .replace(/^[-•]\s(.+)$/gm, '<li style="margin-left:16px;list-style:disc;">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, s => `<ul style="margin:6px 0;">${s}</ul>`)
    // Numbered lists
    .replace(/^\d+\.\s(.+)$/gm, '<li style="margin-left:16px;list-style:decimal;">$1</li>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:600;margin:10px 0 4px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:600;margin:12px 0 6px;">$2</h2>'.replace('$2', '$1'))
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;font-weight:700;margin:14px 0 6px;">$1</h1>')
    // Line breaks
    .replace(/\n\n/g, '</p><p style="margin:6px 0;">')
    .replace(/\n/g, '<br/>');
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function MessageBubble({ role, content, isStreaming }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      gap: '8px',
      alignItems: 'flex-start',
    }}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          flexShrink: 0,
          marginTop: '2px',
        }}>
          ⚡
        </div>
      )}

      <div style={{
        position: 'relative',
        maxWidth: '80%',
      }} className="bubble-group">
        <div style={{
          padding: isUser ? '10px 14px' : '12px 14px',
          borderRadius: isUser ? '12px 12px 4px 12px' : '4px 12px 12px 12px',
          background: isUser ? 'var(--accent)' : 'var(--bg-elevated)',
          border: isUser ? 'none' : '1px solid var(--border)',
          color: isUser ? 'white' : 'var(--text-primary)',
          fontSize: '14px',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}>
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{content}</p>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              style={{ margin: 0 }}
            />
          )}
          {/* Streaming cursor */}
          {isStreaming && (
            <span style={{
              display: 'inline-block',
              width: '2px',
              height: '14px',
              background: 'var(--accent)',
              marginLeft: '2px',
              verticalAlign: 'middle',
              animation: 'pulse-dot 0.8s ease-in-out infinite',
            }} />
          )}
        </div>

        {/* Copy button (assistant only, on hover) */}
        {!isUser && !isStreaming && content && (
          <button
            onClick={handleCopy}
            className="copy-btn"
            title="Copy"
            style={{
              position: 'absolute',
              top: '6px',
              right: '-32px',
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.15s',
              color: copied ? 'var(--green)' : 'var(--text-muted)',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>

      <style>{`
        .bubble-group:hover .copy-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
