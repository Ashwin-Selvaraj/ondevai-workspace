'use client';
import { useState } from 'react';
import { Copy } from 'lucide-react';

interface Props {
  onResult: (result: string) => void;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  const l1 = luminance(c1.r, c1.g, c1.b);
  const l2 = luminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function ColorStudio({ onResult }: Props) {
  const [color, setColor] = useState('#6d5df0');
  const [bgColor, setBgColor] = useState('#08080e');
  const [gradFrom, setGradFrom] = useState('#6d5df0');
  const [gradTo, setGradTo] = useState('#22d3a5');

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const fgRgb = hexToRgb(color);
  const bgRgb = hexToRgb(bgColor);
  const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null;
  const aa = ratio !== null && ratio >= 4.5;
  const aaa = ratio !== null && ratio >= 7;

  const gradient = `linear-gradient(135deg, ${gradFrom}, ${gradTo})`;

  function buildResult() {
    if (!rgb || !hsl) return;
    const r = `Color Analysis: ${color.toUpperCase()}\n\nHEX: ${color.toUpperCase()}\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\n\nWCAG Contrast vs ${bgColor.toUpperCase()}:\nRatio: ${ratio?.toFixed(2)}:1\nAA (4.5:1): ${aa ? '✅ Pass' : '❌ Fail'}\nAAA (7:1): ${aaa ? '✅ Pass' : '❌ Fail'}\n\nGradient:\n${gradient}`;
    onResult(r);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Color converter */}
      <section>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Color Converter</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '48px', height: '48px', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', background: 'none' }} />
          <input
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--font-mono)', padding: '10px', outline: 'none' }}
          />
        </div>
        {rgb && hsl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'HEX', value: color.toUpperCase() },
              { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
              { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '36px' }}>{row.label}</span>
                <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>{row.value}</span>
                <button onClick={() => navigator.clipboard.writeText(row.value)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                  <Copy size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WCAG contrast checker */}
      <section>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>WCAG Contrast Checker</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Foreground</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '36px', height: '36px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none' }} />
              <input value={color} onChange={e => setColor(e.target.value)} style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)', padding: '8px', outline: 'none' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Background</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '36px', height: '36px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none' }} />
              <input value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)', padding: '8px', outline: 'none' }} />
            </div>
          </div>
        </div>
        {ratio !== null && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{ratio.toFixed(2)}:1</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contrast ratio</div>
            </div>
            <div style={{ flex: 1, background: aa ? 'var(--green-muted)' : 'rgba(239,68,68,0.1)', border: `1px solid ${aa ? 'var(--green)' : 'var(--red)'}`, borderRadius: 'var(--radius)', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px' }}>{aa ? '✅' : '❌'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AA (4.5:1)</div>
            </div>
            <div style={{ flex: 1, background: aaa ? 'var(--green-muted)' : 'rgba(239,68,68,0.1)', border: `1px solid ${aaa ? 'var(--green)' : 'var(--red)'}`, borderRadius: 'var(--radius)', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px' }}>{aaa ? '✅' : '❌'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AAA (7:1)</div>
            </div>
          </div>
        )}
        {/* preview swatch */}
        {fgRgb && bgRgb && (
          <div style={{ marginTop: '10px', background: bgColor, borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center' }}>
            <span style={{ color: color, fontSize: '14px', fontWeight: 600 }}>Sample text on this background</span>
          </div>
        )}
      </section>

      {/* Gradient builder */}
      <section>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Gradient Builder</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          {[
            { label: 'From', val: gradFrom, set: setGradFrom },
            { label: 'To', val: gradTo, set: setGradTo },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={val} onChange={e => set(e.target.value)} style={{ width: '36px', height: '36px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none' }} />
                <input value={val} onChange={e => set(e.target.value)} style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)', padding: '8px', outline: 'none' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: '56px', borderRadius: 'var(--radius)', background: gradient, marginBottom: '8px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{gradient}</span>
          <button onClick={() => navigator.clipboard.writeText(`background: ${gradient};`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
            <Copy size={12} />
          </button>
        </div>
      </section>

      <button
        onClick={buildResult}
        style={{ padding: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
      >
        Copy Full Analysis
      </button>
    </div>
  );
}
