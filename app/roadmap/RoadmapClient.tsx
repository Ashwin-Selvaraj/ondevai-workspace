'use client';
import { useEffect, useRef, useState } from 'react';

const PHASES = [
  { n: 'Phase 0', title: 'Foundation',      status: 'done',    desc: 'Next.js 14 App Router, design system, COOP/COEP headers, Inter + JetBrains Mono fonts.' },
  { n: 'Phase 1', title: 'WebLLM Engine',   status: 'done',    desc: 'WebGPU model loading, engine singleton context, progress overlay, model tier system (Lightweight / Balanced / Powerful).' },
  { n: 'Phase 2', title: 'Core Workspace',  status: 'done',    desc: '5-pass pipeline (Research → Blueprint → Generate → Review → Fix), CodeMirror 6 editor, live preview sandbox, project persistence in IndexedDB, ZIP export.' },
  { n: 'Phase 3', title: 'Assistant',       status: 'done',    desc: 'Full streaming chat, multi-turn conversation, markdown rendering, copy-on-hover, stop button.' },
  { n: 'Phase 4', title: 'Toolbox',         status: 'done',    desc: '57 tools across 11 categories. ToolRunner slide-in panel. DiffViewer, JsonTools, MarkdownStudio, ColorStudio, PdfToolkit, ImageTools, AudioTools.' },
  { n: 'Phase 5', title: 'Marketing',       status: 'done',    desc: 'Landing page with pipeline viz, feature ticker, commitments. How It Works, Use Cases, Roadmap, Docs, Verify Privacy pages.' },
  { n: 'Phase 6', title: 'PWA + Offline',   status: 'done',    desc: 'Full service worker, offline shell caching, model weight caching with CacheFirst. Works with no network after first load.' },
  { n: 'Phase 7', title: 'Polish + Perf',   status: 'done',    desc: 'Mobile responsive workspace, Ctrl+K command palette, error boundaries, toast notifications, loading skeletons, URL param pre-fill, version history.' },
  { n: 'Phase 8', title: 'Image Gen',       status: 'next',    desc: 'WebGPU-accelerated diffusion models (SDXL-Turbo, LCM) running entirely in the browser. No external API.' },
  { n: 'Phase 9', title: 'Voice Assistant', status: 'planned', desc: 'Whisper transcription + local LLM + TTS pipeline for a fully on-device voice assistant. Record, transcribe, respond — offline.' },
  { n: 'Phase 10', title: 'Knowledge Base', status: 'planned', desc: 'Embed your documents in-browser with Transformers.js, store vectors in IndexedDB, retrieve with cosine similarity. Private RAG without a server.' },
];

const MILESTONES = [
  { icon: '🖼️', title: 'On-device image generation', eta: 'Q3 2025', desc: 'WebGPU diffusion (SDXL-Turbo, LCM) entirely in browser. No Stability AI account needed.' },
  { icon: '🗣️', title: 'Real-time voice assistant',  eta: 'Q3 2025', desc: 'Whisper + local LLM + TTS — fully on-device voice assistant. Record, transcribe, respond, offline.' },
  { icon: '📚', title: 'Vector knowledge base',       eta: 'Q4 2025', desc: 'Embed documents in-browser with Transformers.js, store vectors in IndexedDB. Private RAG without a server.' },
];

const STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  done:    { label: 'Done',    color: 'var(--green)',       bg: 'var(--green-muted)',   dot: 'var(--green)' },
  next:    { label: 'Next up', color: 'var(--accent)',      bg: 'var(--accent-muted)',  dot: 'var(--accent)' },
  planned: { label: 'Planned', color: 'var(--text-muted)',  bg: 'var(--bg-elevated)',   dot: 'var(--border)' },
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function PhaseRow({ phase, index }: { phase: typeof PHASES[0]; index: number }) {
  const { ref, visible } = useInView();
  const cfg = STATUS[phase.status];
  const isDone = phase.status === 'done';
  const isNext = phase.status === 'next';

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        gap: '0',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index * 60}ms, transform 0.5s ease ${index * 60}ms`,
      }}
    >
      {/* Timeline spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '24px', flexShrink: 0 }}>
        {/* Dot */}
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: cfg.dot,
          border: isDone ? 'none' : `2px solid ${cfg.dot}`,
          flexShrink: 0,
          marginTop: '4px',
          position: 'relative',
          boxShadow: isNext ? `0 0 0 4px var(--accent-muted)` : 'none',
        }}>
          {isNext && (
            <span style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '2px solid var(--accent)',
              animation: 'pulse-ring 1.6s ease-out infinite',
            }} />
          )}
        </div>
        {/* Vertical line */}
        {index < PHASES.length - 1 && (
          <div style={{
            width: '2px',
            flex: 1,
            minHeight: '32px',
            background: isDone ? 'var(--green-muted)' : 'var(--border)',
            marginTop: '6px',
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: index < PHASES.length - 1 ? '32px' : 0 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{phase.n}</span>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{phase.title}</h3>
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: cfg.bg,
            color: cfg.color,
            fontWeight: 600,
          }}>{cfg.label}</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{phase.desc}</p>
      </div>
    </div>
  );
}

function MilestoneCard({ m, index }: { m: typeof MILESTONES[0]; index: number }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms`,
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '14px' }}>{m.icon}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{m.title}</h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{m.eta}</span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
    </div>
  );
}

export default function RoadmapClient() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="dot-grid" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '14px' }}>Roadmap</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            What's built. What's next.
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Built in public. Every phase ships real, working functionality — no vaporware.
          </p>
        </div>
      </section>

      {/* Animated phase timeline */}
      <section style={{ padding: '0 24px 96px', maxWidth: '760px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '40px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Build phases</h2>
        <div>
          {PHASES.map((phase, i) => (
            <PhaseRow key={phase.n} phase={phase} index={i} />
          ))}
        </div>
      </section>

      {/* Next milestones */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '32px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Upcoming milestones</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {MILESTONES.map((m, i) => (
              <MilestoneCard key={m.title} m={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
