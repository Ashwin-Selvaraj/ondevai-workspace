'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Download } from 'lucide-react';
import type { ToolDef } from '@/lib/toolbox/toolDefinitions';

interface Props {
  tool: ToolDef;
  onResult: (result: string) => void;
}

export default function ImageTools({ tool, onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [qrText, setQrText] = useState('https://ondevai.app');
  const [palette, setPalette] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setOutputUrl(null);
    setPalette([]);
    setStatus('');
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  const isImageTool = ['background-remover', 'image-compressor', 'color-extractor', 'format-converter-img', 'favicon-gen', 'vision-ocr', 'metadata-stripper', 'steganography'].includes(tool.id);
  const isQR = tool.id === 'qr-barcode';
  const isImageGen = tool.id === 'image-gen';

  async function run() {
    setLoading(true);
    setStatus('');
    setOutputUrl(null);
    try {
      if (isQR) {
        await runQR();
      } else if (tool.id === 'image-compressor') {
        await runCompressor();
      } else if (tool.id === 'color-extractor') {
        await runColorExtractor();
      } else if (tool.id === 'format-converter-img') {
        await runFormatConverter();
      } else if (tool.id === 'favicon-gen') {
        await runFaviconGen();
      } else if (tool.id === 'background-remover') {
        await runBgRemover();
      } else if (tool.id === 'metadata-stripper') {
        await runMetadataStripper();
      } else if (tool.id === 'vision-ocr') {
        await runOCR();
      } else if (isImageGen) {
        setStatus('Image generation requires a diffusion model (coming soon). For now, this is a placeholder.');
        onResult('Image generation via on-device diffusion models is coming in a future update. WebGPU-accelerated diffusion support is in development.');
      } else {
        setStatus('This tool is coming soon.');
        onResult('Coming soon.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error';
      setStatus('Error: ' + msg);
      onResult('Error: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  async function runQR() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Simple QR-like visual (real QR would need qrcode lib)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('QR: ' + qrText.slice(0, 30), 10, 128);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, size - 8, size - 8);

    // Note: For production QR codes, install `qrcode` npm package
    // and use: QRCode.toCanvas(canvas, qrText)

    const url = canvas.toDataURL('image/png');
    setOutputUrl(url);
    setStatus('QR code generated. Note: install "qrcode" package for real QR codes.');
    onResult(`QR code created for: ${qrText}`);
  }

  async function runCompressor() {
    if (!file || !preview) return;
    const img = await loadImage(preview);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const webpUrl = canvas.toDataURL('image/webp', 0.8);
    setOutputUrl(webpUrl);
    const origKB = (file.size / 1024).toFixed(1);
    const newKB = ((webpUrl.length * 0.75) / 1024).toFixed(1);
    const msg = `Compressed to WebP: ${origKB} KB → ~${newKB} KB (80% quality)`;
    setStatus(msg);
    onResult(msg);
    downloadDataUrl(webpUrl, file.name.replace(/\.[^.]+$/, '.webp'));
  }

  async function runColorExtractor() {
    if (!preview) return;
    const img = await loadImage(preview);
    const canvas = document.createElement('canvas');
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    const colorMap = new Map<string, number>();
    for (let i = 0; i < data.length; i += 16) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colorMap.set(hex, (colorMap.get(hex) ?? 0) + 1);
    }
    const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
    setPalette(sorted);
    const css = sorted.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
    const msg = `Extracted ${sorted.length} dominant colors:\n${sorted.join(', ')}\n\nCSS Variables:\n${css}`;
    setStatus('Palette extracted!');
    onResult(msg);
  }

  async function runFormatConverter() {
    if (!file || !preview) return;
    const img = await loadImage(preview);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const pngUrl = canvas.toDataURL('image/png');
    setOutputUrl(pngUrl);
    setStatus('Converted to PNG.');
    onResult(`Converted ${file.name} → PNG`);
    downloadDataUrl(pngUrl, file.name.replace(/\.[^.]+$/, '.png'));
  }

  async function runFaviconGen() {
    if (!file || !preview) return;
    const img = await loadImage(preview);
    const sizes = [16, 32, 48, 64, 128, 192, 512];
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const size of sizes) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      zip.file(`icon-${size}x${size}.png`, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicon-pack.zip';
    a.click();
    const msg = `Generated ${sizes.length} icon sizes: ${sizes.map(s => `${s}x${s}`).join(', ')}. Download started.`;
    setStatus(msg);
    onResult(msg);
  }

  async function runBgRemover() {
    if (!preview) return;
    setStatus('Loading RMBG-1.4 model (first load may take a few minutes)…');
    setProgress(0);
    try {
      const { getTransformersPipeline } = await import('@/lib/toolbox/transformersModels');
      const segmenter = await getTransformersPipeline(
        'image-segmentation',
        'Xenova/rmbg-1.4',
        (p, t) => { setProgress(p); setStatus(t || `Loading… ${p}%`); }
      ) as (input: string) => Promise<{ label: string; score: number; mask: ImageData }[]>;

      setStatus('Removing background…');
      const results = await segmenter(preview);
      if (!results || !results[0]?.mask) {
        setStatus('Background removal failed — mask not returned.');
        onResult('Background removal failed.');
        return;
      }

      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const mask = results[0].mask;

      for (let i = 0; i < imageData.data.length / 4; i++) {
        const maskVal = mask instanceof ImageData ? mask.data[i * 4] : 0;
        imageData.data[i * 4 + 3] = maskVal;
      }
      ctx.putImageData(imageData, 0, 0);
      const url = canvas.toDataURL('image/png');
      setOutputUrl(url);
      setStatus('Background removed!');
      onResult('Background removed successfully. Transparent PNG ready for download.');
      downloadDataUrl(url, 'no-bg.png');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed';
      setStatus('Error: ' + msg + ' (Make sure you have a stable connection for the first model download)');
      onResult('Error: ' + msg);
    }
  }

  async function runMetadataStripper() {
    if (!file || !preview) return;
    const img = await loadImage(preview);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const cleanUrl = canvas.toDataURL('image/jpeg', 0.95);
    setOutputUrl(cleanUrl);
    const msg = `Metadata stripped from ${file.name}.\nImage redrawn to canvas — all EXIF/GPS data removed.\nOriginal size: ${(file.size / 1024).toFixed(1)} KB`;
    setStatus(msg);
    onResult(msg);
    downloadDataUrl(cleanUrl, 'clean-' + file.name);
  }

  async function runOCR() {
    if (!preview) return;
    setStatus('OCR requires Tesseract.js or a vision model. Loading basic analysis…');
    onResult(`OCR / Vision analysis for: ${file?.name}\n\nFor full OCR, this tool integrates with Tesseract.js (coming soon).\n\nImage dimensions: analysing via canvas…`);
    const img = await loadImage(preview);
    setStatus(`Image loaded: ${img.naturalWidth}×${img.naturalHeight}px`);
    onResult(`Image: ${file?.name}\nDimensions: ${img.naturalWidth}×${img.naturalHeight}px\nSize: ${file ? (file.size / 1024).toFixed(1) + ' KB' : 'unknown'}\n\nFull OCR text extraction coming soon (Tesseract.js integration).`);
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function downloadDataUrl(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  if (isImageGen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          🎨 On-device image generation via WebGPU diffusion models is coming soon.
        </div>
        <button onClick={run} style={{ padding: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Learn More
        </button>
      </div>
    );
  }

  if (isQR) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Text or URL to encode</div>
          <input
            value={qrText}
            onChange={e => setQrText(e.target.value)}
            placeholder="https://example.com"
            style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', padding: '10px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        {outputUrl && (
          <div style={{ textAlign: 'center' }}>
            <img src={outputUrl} alt="QR" style={{ maxWidth: '256px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
          </div>
        )}
        <button onClick={run} disabled={loading} style={{ padding: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
          {loading ? 'Generating…' : 'Generate QR Code'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        style={{
          border: `2px dashed ${file ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '13px',
          transition: 'border-color 150ms ease',
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: 'var(--radius)', objectFit: 'contain' }} />
        ) : (
          <>
            <Upload size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div>Upload image</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Click or drag & drop · PNG, JPG, WebP</div>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      {file && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {file.name} · {(file.size / 1024).toFixed(1)} KB
        </div>
      )}

      {/* Progress */}
      {loading && progress > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>{status}</span><span>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 200ms ease' }} />
          </div>
        </div>
      )}

      {status && !loading && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {status}
        </div>
      )}

      {/* Color palette */}
      {palette.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {palette.map(c => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: c, border: '1px solid var(--border)' }} />
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Output preview */}
      {outputUrl && (
        <div style={{ textAlign: 'center' }}>
          <img src={outputUrl} alt="output" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)', objectFit: 'contain' }} />
        </div>
      )}

      <button
        onClick={run}
        disabled={loading || (!file && !isQR)}
        style={{
          padding: '10px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading || (!file && !isQR) ? 'not-allowed' : 'pointer',
          opacity: loading || (!file && !isQR) ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading ? (status || 'Processing…') : <><Download size={16} /> Run Tool</>}
      </button>
    </div>
  );
}
