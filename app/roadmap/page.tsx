import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Roadmap — OnDevAI',
  description: 'What we\'ve built and what\'s coming next to OnDevAI.',
};

const PHASES = [
  { n: 'Phase 0', title: 'Foundation', status: 'done', desc: 'Next.js 14 App Router, design system, COOP/COEP headers, Tailwind CSS, Inter + JetBrains Mono fonts.' },
  { n: 'Phase 1', title: 'WebLLM Engine', status: 'done', desc: 'WebGPU model loading, engine singleton context, progress overlay, model tier system (Lightweight / Balanced / Powerful).' },
  { n: 'Phase 2', title: 'Core Workspace', status: 'done', desc: '5-pass pipeline (Research → Blueprint → Generate → Review → Fix), CodeMirror 6 editor, live preview sandbox, project persistence in IndexedDB, ZIP export.' },
  { n: 'Phase 3', title: 'Assistant Page', status: 'done', desc: 'Full streaming chat, multi-turn conversation, markdown rendering, copy-on-hover, stop button.' },
  { n: 'Phase 4', title: 'Toolbox', status: 'done', desc: '57 tools across 11 categories. ToolRunner slide-in panel. Custom components: DiffViewer, JsonTools, MarkdownStudio, ColorStudio, PdfToolkit, ImageTools, AudioTools.' },
  { n: 'Phase 5', title: 'Marketing Pages', status: 'done', desc: 'Landing page with pipeline viz, feature ticker, 6 commitments. How It Works, Use Cases, Roadmap, Docs, Verify Privacy pages.' },
  { n: 'Phase 6', title: 'PWA + Offline', status: 'next', desc: 'Full service worker, offline shell caching, model weight caching with CacheFirst, install banner in navbar.' },
  { n: 'Phase 7', title: 'Polish + Perf', status: 'planned', desc: 'Mobile responsive workspace tab bar, Ctrl+K command palette, error boundaries, toast notifications, URL param pre-fill, version history UI.' },
];

const MILESTONES = [
  {
    icon: '🖼️',
    title: 'On-device image generation',
    eta: 'Q3 2025',
    desc: 'WebGPU-accelerated diffusion models (SDXL-Turbo, LCM) running entirely in the browser. No Stability AI account needed.',
  },
  {
    icon: '🗣️',
    title: 'Real-time voice assistant',
    eta: 'Q3 2025',
    desc: 'Whisper (transcription) + local LLM + TTS pipeline for a fully on-device voice assistant. Record, transcribe, respond — offline.',
  },
  {
    icon: '📚',
    title: 'Vector knowledge base',
    eta: 'Q4 2025',
    desc: 'Embed your documents in-browser with Transformers.js, store vectors in IndexedDB, retrieve with cosine similarity. Private RAG without a server.',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  done:    { label: 'Done',      color: 'var(--green)',  bg: 'var(--green-muted)' },
  next:    { label: 'Next up',   color: 'var(--accent)', bg: 'var(--accent-muted)' },
  planned: { label: 'Planned',   color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
};

export default function RoadmapPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="dot-grid" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '14px' }}>Roadmap</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            What's built. What's next.
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            OnDevAI is built in public. Every phase ships real, working functionality — no vaporware.
          </p>
        </div>
      </section>

      {/* Upcoming milestones */}
      <section style={{ padding: '0 24px 80px', maxWidth: '960px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '28px', color: 'var(--text-primary)' }}>Next milestones</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {MILESTONES.map(m => (
            <div key={m.title} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{m.icon}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.eta}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Phase list */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '32px', color: 'var(--text-primary)' }}>Build phases</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {PHASES.map((phase, i) => {
              const cfg = STATUS_CONFIG[phase.status];
              return (
                <div key={phase.n} style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '24px 0',
                  borderBottom: i < PHASES.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  alignItems: 'flex-start',
                }}>
                  {/* Status pill */}
                  <div style={{ flexShrink: 0, width: '80px', paddingTop: '2px' }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      background: cfg.bg,
                      color: cfg.color,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}>{cfg.label}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{phase.n}</span>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{phase.title}</h3>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{phase.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em' }}>Phases 0–5 are live now</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>Try the Workspace, Toolbox, and Assistant — all running on your device.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '14px', padding: '10px 24px' }}>Open Workspace →</Link>
          <Link href="/toolbox" className="btn btn-secondary" style={{ fontSize: '14px', padding: '10px 24px' }}>Browse Toolbox</Link>
        </div>
      </section>
    </div>
  );
}
