import Link from 'next/link';
import { Zap, Shield, Cpu, Lock, WifiOff, Package, ArrowRight, CheckCircle } from 'lucide-react';
import StatsBar from '@/components/home/StatsBar';

const TICKER_ITEMS = [
  'Plain-English prompts', 'Five-pass pipeline', 'WebGPU on-device', 'Zero cloud calls',
  'In-browser PostgreSQL', 'Whisper transcription', 'PDF Toolkit', 'Background Remover',
  'CodeMirror 6 editor', 'Live preview sandbox', 'Offline-first PWA', 'No API keys',
  'AES-256 encryption', 'Color & WCAG tools', 'Markdown Studio', 'Regex Generator',
];

const COMMITMENTS = [
  { n: '01', title: 'No cloud inference', body: 'Every LLM call runs on your GPU via WebGPU. Zero server-side inference.' },
  { n: '02', title: 'No accounts', body: 'No sign-up flow, no email, no OAuth. Open the URL and use it.' },
  { n: '03', title: 'No data collection', body: 'Your prompts, files, and outputs never leave your device.' },
  { n: '04', title: 'No subscriptions', body: 'No monthly fee, no pay-per-token, no credit card required.' },
  { n: '05', title: 'Works offline', body: 'After the first model download, disable WiFi. Everything still works.' },
  { n: '06', title: 'Open & verifiable', body: 'Open DevTools → Network. Build an app. Watch zero outbound requests.' },
];

const PIPELINE_STEPS = [
  { n: '01', icon: '🔍', label: 'Research', desc: 'Analyse requirements' },
  { n: '02', icon: '🗺️', label: 'Blueprint', desc: 'Architect the solution' },
  { n: '03', icon: '⚡', label: 'Generate', desc: 'Write complete code' },
  { n: '04', icon: '🔬', label: 'Review', desc: 'Audit for issues' },
  { n: '05', icon: '🔧', label: 'Fix', desc: 'Apply all corrections' },
];

const WORKSPACE_FEATURES = [
  'Multi-file editor with CodeMirror 6 syntax highlighting',
  'Live preview sandbox with console log capture',
  'In-browser PostgreSQL via PGlite WASM',
  'Quick / Standard / Deep strategy selector',
  'Project persistence in IndexedDB',
  'One-click ZIP export of generated apps',
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="dot-grid" style={{
        minHeight: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
            {['No subscription', 'No sign-up', 'No pay-per-use credits'].map(t => (
              <span key={t} style={{
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-elevated)',
              }}>{t}</span>
            ))}
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
          }}>
            Private. Offline.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>On-device.</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            marginBottom: '40px',
            maxWidth: '580px',
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            AI tools that never touch the cloud. Build full web apps and run 60+ tools — entirely in your browser via WebGPU.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '15px', padding: '12px 28px', gap: '8px' }}>
              <Zap size={16} />
              Open Workspace →
            </Link>
            <Link href="/toolbox" className="btn btn-secondary" style={{ fontSize: '15px', padding: '12px 28px' }}>
              View Toolbox
            </Link>
          </div>

          <p style={{ marginTop: '32px', fontSize: '12px', color: 'var(--text-muted)' }}>
            No download. No install. Works in Chrome 113+ and Edge 113+.
          </p>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <StatsBar />

      {/* ── FEATURE TICKER ───────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', overflow: 'hidden', padding: '14px 0' }}>
        <div className="marquee-track" style={{ display: 'flex', gap: '0', whiteSpace: 'nowrap' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', paddingRight: '0' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '0 32px' }}>{item}</span>
              <span style={{ color: 'var(--accent)', fontSize: '10px' }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PRIVATE BY ARCHITECTURE ──────────────────────── */}
      <section style={{ padding: '96px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 600 }}>Architecture</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, marginBottom: '14px', letterSpacing: '-0.02em' }}>Private by architecture</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
            Not a privacy policy. An architectural guarantee.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { icon: Cpu, title: 'WebGPU Inference', body: 'LLM runs directly on your GPU inside the browser tab. Zero server calls, zero cloud latency.' },
            { icon: Lock, title: 'No API Keys Needed', body: 'No accounts, no keys, no tokens. Nothing to leak. Just open and use.' },
            { icon: WifiOff, title: 'Works Fully Offline', body: "Download the model once, it's cached. No internet required after that." },
            { icon: Shield, title: 'Your Data Stays Yours', body: 'Files, documents, sensitive data — processed locally by a local model. Never transmitted.' },
            { icon: Package, title: 'In-Browser PostgreSQL', body: 'PGlite runs a full PostgreSQL database in WASM. Generated apps get real SQL, no server needed.' },
            { icon: Zap, title: 'Five-Pass Build Pipeline', body: 'Research → Blueprint → Generate → Review → Fix. Each pass improves the output.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              transition: 'border-color 150ms ease',
            }}>
              <div style={{
                width: '40px', height: '40px',
                background: 'var(--accent-muted)',
                borderRadius: 'var(--radius)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon size={20} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIX COMMITMENTS ──────────────────────────────── */}
      <section style={{ padding: '0 24px 96px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 600 }}>Commitments</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em' }}>Six promises we keep</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {COMMITMENTS.map(({ n, title, body }) => (
            <div key={n} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              display: 'flex',
              gap: '20px',
            }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, flexShrink: 0, opacity: 0.6 }}>{n}</span>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE VISUALIZATION ───────────────────────── */}
      <section style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 600 }}>Build Pipeline</p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em' }}>Five passes. One polished app.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '12px' }}>
              Not a single-shot prompt. A structured multi-pass pipeline that refines until it's right.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  textAlign: 'center',
                  minWidth: '130px',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '8px' }}>{step.n}</div>
                  <div style={{ fontSize: '22px', marginBottom: '8px' }}>{step.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{step.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKSPACE SECTION ────────────────────────────── */}
      <section style={{ padding: '96px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 600 }}>Workspace</p>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              A full IDE in your browser tab
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8, marginBottom: '28px' }}>
              Describe what you want to build. The pipeline researches, architects, generates, reviews, and fixes — then drops the complete app into your editor.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {WORKSPACE_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={15} style={{ color: 'var(--green)', flexShrink: 0, marginTop: '1px' }} />
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '32px' }}>
              <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '14px', padding: '10px 24px' }}>
                Open Workspace →
              </Link>
            </div>
          </div>

          {/* Workspace mockup */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            aspectRatio: '4/3',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Mock toolbar */}
            <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-elevated)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22d3a5' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>OnDevAI Workspace</span>
            </div>
            {/* Mock content */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '140px 1fr', overflow: 'hidden' }}>
              <div style={{ borderRight: '1px solid var(--border)', padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['Research ✓', 'Blueprint ✓', 'Generate ✓', 'Review ✓', 'Fix ✓'].map((s, i) => (
                  <div key={s} style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', background: i < 4 ? 'var(--green-muted)' : 'var(--accent-muted)', color: i < 4 ? 'var(--green)' : 'var(--accent)', fontWeight: 500 }}>{s}</div>
                ))}
              </div>
              <div style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', overflowY: 'auto', background: 'var(--bg-base)' }}>
                <div style={{ color: '#7dd3fc' }}>{'<!DOCTYPE html>'}</div>
                <div style={{ color: '#7dd3fc' }}>{'<html lang="en">'}</div>
                <div style={{ color: '#86efac', paddingLeft: '8px' }}>{'<head>'}</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>{'<meta charset="UTF-8">'}</div>
                <div style={{ color: '#fca5a5', paddingLeft: '16px' }}>{'<title>My App</title>'}</div>
                <div style={{ color: '#86efac', paddingLeft: '8px' }}>{'</head>'}</div>
                <div style={{ color: '#86efac', paddingLeft: '8px' }}>{'<body>'}</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>{'<div id="app">'}</div>
                <div style={{ color: '#fde68a', paddingLeft: '24px' }}>{'<!-- Generated app -->'}</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>{'</div>'}</div>
                <div style={{ color: '#86efac', paddingLeft: '8px' }}>{'</body>'}</div>
                <div style={{ color: '#7dd3fc' }}>{'</html>'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 96px' }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '56px 48px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, marginBottom: '14px', letterSpacing: '-0.02em' }}>Ready to build?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px', lineHeight: 1.7 }}>
            Open the Workspace and describe your app in plain English.<br />
            No account. No credit card. Runs on your device.
          </p>
          <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '15px', padding: '12px 32px' }}>
            Open Workspace →
          </Link>
          <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Verify it yourself: Open DevTools → Network tab → Build an app → See zero outbound calls
          </p>
        </div>
      </section>
    </div>
  );
}
