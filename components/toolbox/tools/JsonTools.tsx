'use client';
import { useState } from 'react';

type Operation = 'format' | 'validate' | 'typescript' | 'schema';

interface Props {
  onResult: (result: string) => void;
}

export default function JsonTools({ onResult }: Props) {
  const [input, setInput] = useState('');
  const [op, setOp] = useState<Operation>('format');
  const [error, setError] = useState('');

  function run() {
    setError('');
    try {
      const parsed = JSON.parse(input);
      if (op === 'format') {
        onResult(JSON.stringify(parsed, null, 2));
      } else if (op === 'validate') {
        onResult('✅ Valid JSON\n\nParsed successfully. No syntax errors found.\n\nKeys at root level: ' + Object.keys(parsed).join(', '));
      } else if (op === 'typescript') {
        onResult(jsonToTypeScript(parsed, 'Root'));
      } else if (op === 'schema') {
        onResult(JSON.stringify(jsonToSchema(parsed), null, 2));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setError(msg);
      onResult('❌ Invalid JSON: ' + msg);
    }
  }

  const ops: { id: Operation; label: string }[] = [
    { id: 'format', label: 'Format' },
    { id: 'validate', label: 'Validate' },
    { id: 'typescript', label: 'TypeScript Types' },
    { id: 'schema', label: 'JSON Schema' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {ops.map(o => (
          <button
            key={o.id}
            onClick={() => setOp(o.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius)',
              border: op === o.id ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: op === o.id ? 'var(--accent-muted)' : 'var(--bg-elevated)',
              color: op === o.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={'{"name": "Alice", "age": 30}'}
        rows={8}
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          padding: '10px',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
      <button
        onClick={run}
        disabled={!input.trim()}
        style={{
          padding: '10px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: input.trim() ? 'pointer' : 'not-allowed',
          opacity: input.trim() ? 1 : 0.5,
        }}
      >
        Run
      </button>
    </div>
  );
}

function jsonToTypeScript(obj: unknown, name: string, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `interface ${name} {}\n`;
    const itemType = jsonToTypeScript(obj[0], `${name}Item`, indent);
    return `type ${name} = ${itemType}[];\n`;
  }
  if (typeof obj === 'object') {
    const lines = [`interface ${name} {`];
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const childName = k.charAt(0).toUpperCase() + k.slice(1);
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        lines.push(`  ${k}: ${childName};`);
      } else {
        lines.push(`  ${k}: ${inferType(v, childName)};`);
      }
    }
    lines.push('}');
    return lines.join('\n');
  }
  return inferType(obj, name);
}

function inferType(v: unknown, name: string): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `${inferType(v[0], name)}[]`;
  return typeof v;
}

function jsonToSchema(obj: unknown): unknown {
  if (obj === null) return { type: 'null' };
  if (Array.isArray(obj)) return { type: 'array', items: obj.length ? jsonToSchema(obj[0]) : {} };
  if (typeof obj === 'object') {
    const props: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      props[k] = jsonToSchema(v);
    }
    return { type: 'object', properties: props, required: Object.keys(obj as object) };
  }
  return { type: typeof obj };
}
