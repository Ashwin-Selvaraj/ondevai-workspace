'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, Download } from 'lucide-react';

interface Props {
  onResult: (result: string) => void;
}

type Operation = 'info' | 'split' | 'merge';

export default function PdfToolkit({ onResult }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [op, setOp] = useState<Operation>('info');
  const [splitRange, setSplitRange] = useState('1-3');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFiles(picked: FileList | null) {
    if (!picked) return;
    setFiles(Array.from(picked).filter(f => f.type === 'application/pdf'));
  }

  async function run() {
    if (!files.length) return;
    setLoading(true);
    setStatus('Loading pdf-lib…');
    try {
      const { PDFDocument } = await import('pdf-lib');

      if (op === 'info') {
        const bytes = await files[0].arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const info = `File: ${files[0].name}\nPages: ${doc.getPageCount()}\nSize: ${(files[0].size / 1024).toFixed(1)} KB\nTitle: ${doc.getTitle() ?? '—'}\nAuthor: ${doc.getAuthor() ?? '—'}\nCreated: ${doc.getCreationDate()?.toLocaleDateString() ?? '—'}`;
        setStatus('Done.');
        onResult(info);
      } else if (op === 'split') {
        const bytes = await files[0].arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const [fromStr, toStr] = splitRange.split('-');
        const from = Math.max(1, parseInt(fromStr)) - 1;
        const to = Math.min(src.getPageCount(), parseInt(toStr || fromStr));
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(src, Array.from({ length: to - from }, (_, i) => from + i));
        pages.forEach(p => newDoc.addPage(p));
        const pdfBytes = await newDoc.save();
        downloadBytes(pdfBytes, `split_p${from + 1}-${to}.pdf`);
        const msg = `Split pages ${from + 1}–${to} from "${files[0].name}" (${to - from} pages). Download started.`;
        setStatus(msg);
        onResult(msg);
      } else if (op === 'merge') {
        const merged = await PDFDocument.create();
        for (const file of files) {
          const bytes = await file.arrayBuffer();
          const doc = await PDFDocument.load(bytes);
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => merged.addPage(p));
        }
        const pdfBytes = await merged.save();
        downloadBytes(pdfBytes, 'merged.pdf');
        const msg = `Merged ${files.length} PDFs into merged.pdf. Download started.`;
        setStatus(msg);
        onResult(msg);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error processing PDF';
      setStatus('Error: ' + msg);
      onResult('Error: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  function downloadBytes(bytes: Uint8Array, filename: string) {
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  const ops: { id: Operation; label: string }[] = [
    { id: 'info', label: 'PDF Info' },
    { id: 'split', label: 'Split Pages' },
    { id: 'merge', label: 'Merge PDFs' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Operation selector */}
      <div style={{ display: 'flex', gap: '8px' }}>
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

      {/* File upload */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '13px',
          transition: 'border-color 150ms ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <Upload size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <div>{op === 'merge' ? 'Upload multiple PDFs' : 'Upload a PDF'}</div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>Click or drag & drop</div>
        <input ref={fileRef} type="file" accept=".pdf" multiple={op === 'merge'} style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
              <FileText size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(f.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}
        </div>
      )}

      {/* Split range */}
      {op === 'split' && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Page range (e.g. 1-3)</div>
          <input
            value={splitRange}
            onChange={e => setSplitRange(e.target.value)}
            placeholder="1-3"
            style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', padding: '8px 12px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      )}

      {status && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {status}
        </div>
      )}

      <button
        onClick={run}
        disabled={loading || !files.length}
        style={{
          padding: '10px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading || !files.length ? 'not-allowed' : 'pointer',
          opacity: loading || !files.length ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading ? 'Processing…' : <><Download size={16} /> Run Operation</>}
      </button>
    </div>
  );
}
