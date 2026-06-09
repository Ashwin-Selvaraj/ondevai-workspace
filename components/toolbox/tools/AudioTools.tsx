'use client';
import { useState, useRef } from 'react';
import { Upload, Mic, FileAudio } from 'lucide-react';
import type { ToolDef } from '@/lib/toolbox/toolDefinitions';
import { streamChat } from '@/lib/engine/webllm';

interface Props {
  tool: ToolDef;
  onResult: (result: string) => void;
}

export default function AudioTools({ tool, onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setTranscript('');
    setStatus('');
  }

  async function run() {
    if (!file) return;
    setLoading(true);
    setTranscript('');
    setStatus('Loading Whisper model (first load may take several minutes)…');
    setProgress(0);

    try {
      const { getTransformersPipeline } = await import('@/lib/toolbox/transformersModels');

      const transcriber = await getTransformersPipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        (p, t) => { setProgress(p); setStatus(t || `Loading… ${p}%`); }
      ) as (input: string | ArrayBuffer, opts?: Record<string, unknown>) => Promise<{ text: string }>;

      setStatus('Transcribing audio…');
      const arrayBuf = await file.arrayBuffer();
      const result = await transcriber(arrayBuf, { return_timestamps: false });
      const text = result.text.trim();
      setTranscript(text);

      if (tool.id === 'meeting-assistant') {
        setStatus('Extracting action items…');
        let summary = '';
        for await (const chunk of streamChat([
          { role: 'system', content: 'You are a meeting assistant. Given a transcript, extract: 1) Key decisions made 2) Action items (with owner if mentioned) 3) A 3-sentence summary.' },
          { role: 'user', content: `Meeting transcript:\n\n${text}` },
        ], { temperature: 0.2, max_tokens: 800 })) {
          summary = chunk;
        }
        const full = `TRANSCRIPT:\n${text}\n\n---\n\nMEETING SUMMARY:\n${summary}`;
        setTranscript(full);
        onResult(full);
        setStatus('Done!');
      } else {
        onResult(text);
        setStatus('Transcription complete.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error';
      setStatus('Error: ' + msg);
      onResult('Error: ' + msg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        style={{
          border: `2px dashed ${file ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '13px',
          transition: 'border-color 150ms ease',
        }}
      >
        <FileAudio size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <div>{file ? file.name : 'Upload audio file'}</div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'MP3, WAV, M4A, OGG · Click or drag'}</div>
        <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      {/* Model info banner */}
      <div style={{ background: 'var(--accent-muted)', border: '1px solid rgba(109,93,240,0.3)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--accent)' }}>Whisper Tiny (39M params)</strong> — runs 100% in your browser via WebAssembly. First load downloads ~80MB.
      </div>

      {/* Progress */}
      {loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>{status}</span>
            {progress > 0 && <span>{progress}%</span>}
          </div>
          {progress > 0 && (
            <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 200ms ease' }} />
            </div>
          )}
        </div>
      )}

      {!loading && status && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {status}
        </div>
      )}

      {/* Transcript output */}
      {transcript && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {tool.id === 'meeting-assistant' ? 'Transcript + Summary' : 'Transcript'}
          </div>
          <textarea
            readOnly
            value={transcript}
            rows={8}
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
          />
        </div>
      )}

      <button
        onClick={run}
        disabled={loading || !file}
        style={{
          padding: '10px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading || !file ? 'not-allowed' : 'pointer',
          opacity: loading || !file ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Mic size={16} />
        {loading ? 'Transcribing…' : tool.id === 'meeting-assistant' ? 'Transcribe + Extract Actions' : 'Transcribe Audio'}
      </button>
    </div>
  );
}
