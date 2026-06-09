'use client';
import { useState, useCallback, useEffect } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { type ToolDef } from '@/lib/toolbox/toolDefinitions';
import { streamChat } from '@/lib/engine/webllm';
import { useEngine } from '@/lib/engine/EngineContext';
import dynamic from 'next/dynamic';

const DiffViewer = dynamic(() => import('./tools/DiffViewer'), { ssr: false });
const JsonTools = dynamic(() => import('./tools/JsonTools'), { ssr: false });
const MarkdownStudio = dynamic(() => import('./tools/MarkdownStudio'), { ssr: false });
const ColorStudio = dynamic(() => import('./tools/ColorStudio'), { ssr: false });
const PdfToolkit = dynamic(() => import('./tools/PdfToolkit'), { ssr: false });
const ImageTools = dynamic(() => import('./tools/ImageTools'), { ssr: false });
const AudioTools = dynamic(() => import('./tools/AudioTools'), { ssr: false });

interface Props {
  tool: ToolDef | null;
  onClose: () => void;
}

const CUSTOM_COMPONENT_MAP: Record<string, string> = {
  DiffViewer: 'DiffViewer',
  JsonTools: 'JsonTools',
  MarkdownStudio: 'MarkdownStudio',
  ColorStudio: 'ColorStudio',
  PdfToolkit: 'PdfToolkit',
  ImageTools: 'ImageTools',
  AudioTools: 'AudioTools',
  KnowledgeTools: 'KnowledgeTools',
  EncryptionVault: 'EncryptionVault',
};

export default function ToolRunner({ tool, onClose }: Props) {
  const { isReady } = useEngine();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset state when tool changes
  useEffect(() => {
    setInput('');
    setOutput('');
    setRunning(false);
  }, [tool?.id]);

  const handleResult = useCallback((result: string) => {
    setOutput(result);
  }, []);

  async function runTextTool() {
    if (!tool || !input.trim() || !isReady) return;
    setRunning(true);
    setOutput('');

    const userContent = tool.userPromptTemplate.replace('{input}', input);

    try {
      for await (const chunk of streamChat([
        { role: 'system', content: tool.systemPrompt },
        { role: 'user', content: userContent },
      ], { temperature: 0.4, max_tokens: 2000 })) {
        setOutput(chunk);
      }
    } catch (e) {
      setOutput('Error: ' + (e instanceof Error ? e.message : 'Failed'));
    } finally {
      setRunning(false);
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!tool) return null;

  const isVisible = !!tool;

  function renderCustom() {
    if (!tool) return null;
    const comp = tool.customComponent;
    switch (comp) {
      case 'DiffViewer': return <DiffViewer onResult={handleResult} />;
      case 'JsonTools': return <JsonTools onResult={handleResult} />;
      case 'MarkdownStudio': return <MarkdownStudio onResult={handleResult} />;
      case 'ColorStudio': return <ColorStudio onResult={handleResult} />;
      case 'PdfToolkit': return <PdfToolkit onResult={handleResult} />;
      case 'ImageTools': return <ImageTools tool={tool} onResult={handleResult} />;
      case 'AudioTools': return <AudioTools tool={tool} onResult={handleResult} />;
      case 'KnowledgeTools': return <KnowledgeToolsPlaceholder onResult={handleResult} />;
      case 'EncryptionVault': return <EncryptionVaultComponent onResult={handleResult} />;
      default: return (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px' }}>
          Custom component &quot;{comp}&quot; coming soon.
        </div>
      );
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
          animation: 'fadeIn 150ms ease',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: '48px',
        right: 0,
        height: 'calc(100% - 48px)',
        width: '480px',
        maxWidth: '100vw',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 150ms ease',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '24px' }}>{tool.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{tool.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tool.description}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: 'var(--radius-sm)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isReady && tool.inputType === 'text' && (
            <div style={{ background: 'var(--accent-muted)', border: '1px solid rgba(109,93,240,0.3)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '12px', color: 'var(--accent)' }}>
              ⚠ AI model not loaded. Go to /workspace or /assistant to load the model first, then return here.
            </div>
          )}

          {/* Text input */}
          {tool.inputType === 'text' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{tool.inputLabel}</label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={tool.inputPlaceholder}
                  rows={6}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    padding: '10px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <button
                onClick={runTextTool}
                disabled={running || !input.trim() || !isReady}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: running || !input.trim() || !isReady ? 'not-allowed' : 'pointer',
                  opacity: running || !input.trim() || !isReady ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {running ? <><Loader2 size={16} className="spin" /> Running…</> : 'Run Tool'}
              </button>

              {/* Output */}
              {(output || running) && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tool.outputLabel}</label>
                    {output && (
                      <button onClick={copyOutput} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', padding: '2px 6px' }}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '12px',
                    minHeight: '120px',
                    maxHeight: '360px',
                    overflowY: 'auto',
                    fontSize: '13px',
                    color: running && !output ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontFamily: output.includes('```') || output.includes('SELECT') || output.includes('interface') ? 'var(--font-mono)' : 'inherit',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}>
                    {running && !output ? 'Running…' : output}
                    {running && <span style={{ display: 'inline-block', width: '2px', height: '14px', background: 'var(--accent)', marginLeft: '2px', animation: 'blink 1s steps(1) infinite', verticalAlign: 'text-bottom' }} />}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Custom component */}
          {tool.inputType === 'custom' && (
            <>
              {renderCustom()}
              {/* Show output area for custom tools that set output via handleResult */}
              {output && tool.customComponent !== 'MarkdownStudio' && tool.customComponent !== 'ColorStudio' && tool.customComponent !== 'DiffViewer' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tool.outputLabel}</label>
                    <button onClick={copyOutput} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', padding: '2px 6px' }}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '12px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}>
                    {output}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// Inline placeholder components for KnowledgeTools and EncryptionVault
function KnowledgeToolsPlaceholder({ onResult }: { onResult: (r: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const { isReady } = useEngine();
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function run() {
    if (!file || !question.trim() || !isReady) return;
    setLoading(true);
    const text = await file.text();
    const ctx = text.slice(0, 4000);
    let answer = '';
    for await (const chunk of streamChat([
      { role: 'system', content: 'You are a document Q&A tool. Answer questions accurately based ONLY on the provided document content.' },
      { role: 'user', content: `Document:\n${ctx}\n\nQuestion: ${question}` },
    ], { temperature: 0.2, max_tokens: 1000 })) {
      answer = chunk;
      onResult(answer);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}>
        {file ? file.name : 'Upload a text/PDF file'}
        <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
      </div>
      <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question about the document…" rows={3} style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', padding: '10px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
      <button onClick={run} disabled={loading || !file || !question.trim() || !isReady} style={{ padding: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: loading || !file || !question.trim() ? 0.5 : 1 }}>
        {loading ? 'Answering…' : 'Ask'}
      </button>
    </div>
  );
}

import { useRef } from 'react';

function EncryptionVaultComponent({ onResult }: { onResult: (r: string) => void }) {
  const [passphrase, setPassphrase] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function run() {
    if (!file || !passphrase) return;
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      if (mode === 'encrypt') {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
        const combined = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.byteLength);
        combined.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);
        const blob = new Blob([combined]);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = file.name + '.enc';
        a.click();
        onResult(`Encrypted "${file.name}" with AES-256-GCM.\nOutput: ${file.name}.enc`);
      } else {
        const buf = new Uint8Array(data);
        const saltIn = buf.slice(0, 16);
        const iv = buf.slice(16, 28);
        const ciphertext = buf.slice(28);
        const keyMat2 = await crypto.subtle.importKey('raw', encoder.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
        const key2 = await crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: saltIn, iterations: 100000, hash: 'SHA-256' },
          keyMat2,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        );
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key2, ciphertext);
        const outName = file.name.replace(/\.enc$/, '') || 'decrypted';
        const blob = new Blob([decrypted]);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = outName;
        a.click();
        onResult(`Decrypted "${file.name}" successfully.\nOutput: ${outName}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error';
      onResult('Error: ' + msg + ' (Wrong passphrase?)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['encrypt', 'decrypt'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius)', border: mode === m ? '1px solid var(--accent)' : '1px solid var(--border)', background: mode === m ? 'var(--accent-muted)' : 'var(--bg-elevated)', color: mode === m ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: mode === m ? 600 : 400 }}>
            {m === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'}
          </button>
        ))}
      </div>
      <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}>
        {file ? file.name : 'Upload file to ' + mode}
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
      </div>
      <input value={passphrase} onChange={e => setPassphrase(e.target.value)} type="password" placeholder="Passphrase" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', padding: '10px', outline: 'none' }} />
      <button onClick={run} disabled={loading || !file || !passphrase} style={{ padding: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: loading || !file || !passphrase ? 0.5 : 1 }}>
        {loading ? 'Processing…' : mode === 'encrypt' ? '🔒 Encrypt & Download' : '🔓 Decrypt & Download'}
      </button>
    </div>
  );
}
