'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, ExternalLink, RotateCcw, Terminal, X } from 'lucide-react';

interface Props {
  code: string;
  onAutoFix?: (error: string) => void;
}

export default function PreviewPanel({ code, onAutoFix }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback((src: string) => {
    if (!iframeRef.current || !src) return;
    setRuntimeError(null);
    setConsoleLogs([]);

    // Inject console capture + error capture before running
    const consoleScript = `
<script>
(function() {
  var _log = console.log, _err = console.error, _warn = console.warn;
  function post(type, args) {
    try { window.parent.postMessage({ type: 'console', level: type, msg: Array.from(args).join(' ') }, '*'); } catch(e){}
  }
  console.log   = function() { post('log',  arguments); _log.apply(console, arguments); };
  console.error = function() { post('error',arguments); _err.apply(console, arguments); };
  console.warn  = function() { post('warn', arguments); _warn.apply(console, arguments); };
  window.onerror = function(msg, src, line) {
    window.parent.postMessage({ type: 'runtime-error', msg: msg + ' (line ' + line + ')' }, '*');
    return false;
  };
})();
</script>`;

    const injected = src.includes('<head>')
      ? src.replace('<head>', '<head>' + consoleScript)
      : consoleScript + src;

    const blob = new Blob([injected], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, []);

  // Auto-refresh on code change (800ms debounce)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => run(code), 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [code, run]);

  // Listen for console messages from iframe
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.type === 'console') {
        setConsoleLogs(prev => [...prev.slice(-49), `[${e.data.level}] ${e.data.msg}`]);
      }
      if (e.data?.type === 'runtime-error') {
        setRuntimeError(e.data.msg);
        setConsoleLogs(prev => [...prev.slice(-49), `[error] ${e.data.msg}`]);
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  function openInTab() {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0 10px',
        height: '36px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        {/* Fake URL bar */}
        <div style={{
          flex: 1,
          padding: '4px 10px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          preview://app
        </div>
        <button onClick={() => run(code)} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}>
          <Play size={11} /> Run
        </button>
        <button onClick={openInTab} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }} title="Open in new tab">
          <ExternalLink size={11} />
        </button>
        <button onClick={() => { run(''); setTimeout(() => run(code), 50); }} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }} title="Reset">
          <RotateCcw size={11} />
        </button>
        <button
          onClick={() => setShowConsole(s => !s)}
          className="btn btn-ghost"
          style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', color: consoleLogs.some(l => l.startsWith('[error]')) ? 'var(--red)' : 'var(--text-muted)' }}
        >
          <Terminal size={11} />
          {consoleLogs.length > 0 && <span style={{ fontSize: '10px' }}>{consoleLogs.length}</span>}
        </button>
      </div>

      {/* Error banner */}
      {runtimeError && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(239,68,68,0.12)',
          borderBottom: '1px solid rgba(239,68,68,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '8px',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--red)', flex: 1, fontFamily: 'var(--font-mono)' }}>
            ⚠ {runtimeError}
          </span>
          {onAutoFix && (
            <button
              onClick={() => onAutoFix(runtimeError)}
              className="btn btn-danger"
              style={{ fontSize: '11px', padding: '3px 10px', flexShrink: 0 }}
            >
              Auto-fix
            </button>
          )}
          <button onClick={() => setRuntimeError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* iframe */}
      <iframe
        ref={iframeRef}
        style={{ flex: 1, border: 'none', background: '#fff' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        title="App Preview"
      />

      {/* Console */}
      {showConsole && (
        <div style={{
          height: '160px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-base)',
          overflow: 'auto',
          flexShrink: 0,
          padding: '6px 10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Console</span>
            <button onClick={() => setConsoleLogs([])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: 'var(--text-muted)' }}>Clear</button>
          </div>
          {consoleLogs.length === 0
            ? <p style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>No output</p>
            : consoleLogs.map((log, i) => (
              <p key={i} style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: log.startsWith('[error]') ? 'var(--red)' : log.startsWith('[warn]') ? 'var(--yellow)' : 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>{log}</p>
            ))
          }
        </div>
      )}
    </div>
  );
}
