import type { Metadata } from 'next';
import Link from 'next/link';
import { Cpu, Download, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works — OnDevAI',
  description: 'Learn how OnDevAI runs entirely on your device with WebGPU and in-browser LLMs.',
};

const MODEL_TIERS = [
  {
    tier: 'Lightweight',
    color: 'var(--green)',
    models: [
      { name: 'Qwen2.5-Coder 0.5B', params: '0.5B', vram: '~1.5 GB', desc: 'Fastest. Good for simple scripts and short apps.' },
      { name: 'Phi-3.5 Mini', params: '3.8B', vram: '~2.5 GB', desc: 'Compact but capable for basic apps.' },
    ],
  },
  {
    tier: 'Balanced',
    color: 'var(--accent)',
    badge: 'Recommended',
    models: [
      { name: 'Qwen2.5-Coder 1.5B', params: '1.5B', vram: '~3 GB', desc: 'Best balance of speed and quality. Default pick.' },
      { name: 'Llama 3.2 3B', params: '3B', vram: '~4 GB', desc: 'Strong general capability for complex apps.' },
    ],
  },
  {
    tier: 'Powerful',
    color: '#a78bfa',
    models: [
      { name: 'Qwen2.5-Coder 7B', params: '7B', vram: '~8 GB', desc: 'Best quality. Full-stack apps with deep logic.' },
    ],
  },
];

const HOW_STEPS = [
  { n: '01', icon: '🌐', title: 'Open in Chrome', body: 'Navigate to OnDevAI in Chrome 113+ or Edge 113+. No install, no extension, just a URL.' },
  { n: '02', icon: '📥', title: 'Model downloads once', body: 'On first visit, the model weights download from HuggingFace CDN into your browser cache. This takes a few minutes but only happens once.' },
  { n: '03', icon: '🔒', title: 'Everything stays local', body: 'Once loaded, the model runs entirely in your browser via WebGPU. No network calls. No servers. Open DevTools Network — watch zero outbound requests.' },
  { n: '04', icon: '⚡', title: 'Build or use tools', body: 'Describe an app in the Workspace, or run one of 57 tools in the Toolbox. All AI inference is local.' },
  { n: '05', icon: '📱', title: 'Install as PWA (optional)', body: 'Install OnDevAI as a Progressive Web App. It launches standalone, caches everything, and works fully offline.' },
];

export default function LocalPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="dot-grid" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            <Cpu size={13} color="var(--accent)" /> WebGPU on-device inference
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            How it works
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            OnDevAI uses WebGPU to run large language models directly in your browser tab — no server, no API, no data leaving your device.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: '0 24px 80px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {HOW_STEPS.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', gap: '24px', padding: '32px 0', borderBottom: i < HOW_STEPS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--accent-muted)', border: '1px solid rgba(109,93,240,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '6px' }}>{step.n}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Model tiers */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '10px' }}>Model Tiers</p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Choose your model</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Pick based on your GPU VRAM. Models are downloaded once and cached in the browser.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {MODEL_TIERS.map(tier => (
              <div key={tier.tier} style={{ background: 'var(--bg-elevated)', border: `1px solid ${tier.color}33`, borderRadius: 'var(--radius-lg)', padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: tier.color }}>{tier.tier}</span>
                  {tier.badge && (
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--accent-muted)', color: tier.color, fontWeight: 600 }}>{tier.badge}</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {tier.models.map(m => (
                    <div key={m.name} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.params}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: tier.color, marginBottom: '4px', fontWeight: 500 }}>VRAM: {m.vram}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install PWA */}
      <section style={{ padding: '80px 24px', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: 'var(--accent-muted)', border: '1px solid rgba(109,93,240,0.3)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Download size={24} color="var(--accent)" />
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.02em' }}>Install as a PWA</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
          Click the install icon in your browser address bar (or Browser Menu → Install App). OnDevAI launches standalone, works fully offline, and loads instantly from cache.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', textAlign: 'left', maxWidth: '600px', margin: '0 auto 40px' }}>
          {['Launches standalone — no browser chrome', 'Fully offline after first model load', 'Cached model weights — no re-download', 'Fast launch from dock or home screen'].map(f => (
            <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0, marginTop: '2px' }} />
              {f}
            </div>
          ))}
        </div>
        <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '15px', padding: '12px 32px' }}>
          Open Workspace →
        </Link>
        <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>Requires Chrome 113+ or Edge 113+ (WebGPU)</p>
      </section>
    </div>
  );
}
