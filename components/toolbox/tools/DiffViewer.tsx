'use client';
import { useState } from 'react';

interface Props {
  onResult: (result: string) => void;
}

function computeDiff(a: string, b: string): { type: 'same' | 'removed' | 'added'; text: string }[] {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const result: { type: 'same' | 'removed' | 'added'; text: string }[] = [];

  const maxLen = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLen; i++) {
    const la = linesA[i];
    const lb = linesB[i];
    if (la === lb) {
      result.push({ type: 'same', text: la ?? '' });
    } else {
      if (la !== undefined) result.push({ type: 'removed', text: la });
      if (lb !== undefined) result.push({ type: 'added', text: lb });
    }
  }
  return result;
}

export default function DiffViewer({ onResult }: Props) {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diff, setDiff] = useState<{ type: 'same' | 'removed' | 'added'; text: string }[] | null>(null);

  function runDiff() {
    const d = computeDiff(left, right);
    setDiff(d);
    const added = d.filter(l => l.type === 'added').length;
    const removed = d.filter(l => l.type === 'removed').length;
    onResult(`Diff complete: +${added} lines added, -${removed} lines removed`);
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    padding: '10px',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '140px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Original</div>
          <textarea value={left} onChange={e => setLeft(e.target.value)} placeholder="Paste original text…" style={textareaStyle} />
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Modified</div>
          <textarea value={right} onChange={e => setRight(e.target.value)} placeholder="Paste modified text…" style={textareaStyle} />
        </div>
      </div>
      <button
        onClick={runDiff}
        disabled={!left && !right}
        style={{
          padding: '10px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: left || right ? 'pointer' : 'not-allowed',
          opacity: left || right ? 1 : 0.5,
        }}
      >
        Compare
      </button>

      {diff && (
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'auto',
          maxHeight: '300px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}>
          {diff.map((line, i) => (
            <div
              key={i}
              style={{
                padding: '2px 12px',
                background: line.type === 'added' ? 'rgba(34,211,165,0.1)' : line.type === 'removed' ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: line.type === 'added' ? 'var(--green)' : line.type === 'removed' ? 'var(--red)' : 'var(--text-secondary)',
                whiteSpace: 'pre',
              }}
            >
              {line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}{line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
