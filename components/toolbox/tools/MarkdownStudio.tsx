'use client';
import { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';

interface Props {
  onResult: (result: string) => void;
}

function simpleMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|o|l|p])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

export default function MarkdownStudio({ onResult }: Props) {
  const [md, setMd] = useState('# Hello World\n\nWrite **Markdown** here and see a *live preview*.\n\n- Item one\n- Item two\n- Item three\n\n## Code\n\n`const x = 42;`');
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preview.current) {
      preview.current.innerHTML = simpleMarkdown(md);
    }
    onResult(simpleMarkdown(md));
  }, [md, onResult]);

  function downloadMd() {
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'document.md';
    a.click();
  }

  function downloadHtml() {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1a1a1a}h1,h2,h3{margin-top:1.5em}code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:.9em}ul{padding-left:1.5em}</style></head><body>${simpleMarkdown(md)}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'document.html';
    a.click();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={downloadMd} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
          <Download size={12} /> .md
        </button>
        <button onClick={downloadHtml} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
          <Download size={12} /> .html
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', minHeight: '300px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Markdown</div>
          <textarea
            value={md}
            onChange={e => setMd(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              padding: '10px',
              resize: 'none',
              outline: 'none',
              minHeight: '280px',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Preview</div>
          <div
            ref={preview}
            style={{
              flex: 1,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '12px',
              overflowY: 'auto',
              color: 'var(--text-primary)',
              fontSize: '13px',
              lineHeight: 1.6,
              minHeight: '280px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
