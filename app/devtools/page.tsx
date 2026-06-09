import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Verify Privacy — OnDevAI',
  description: 'Step-by-step guide to verifying that OnDevAI makes zero outbound requests during AI inference.',
};

const STEPS = [
  {
    n: '01',
    title: 'Open OnDevAI in Chrome',
    detail: 'Navigate to the Workspace page.',
    code: null,
  },
  {
    n: '02',
    title: 'Open Chrome DevTools',
    detail: 'Press F12 (or ⌘+Option+I on Mac). The DevTools panel opens.',
    code: 'Keyboard: F12  |  Mac: ⌘ + Option + I',
  },
  {
    n: '03',
    title: 'Click the Network tab',
    detail: 'Select the Network tab at the top of the DevTools panel. Make sure recording is active (the red circle should be filled).',
    code: null,
  },
  {
    n: '04',
    title: 'Clear existing requests',
    detail: 'Click the 🚫 clear button to remove any pre-existing network requests so the list is empty.',
    code: null,
  },
  {
    n: '05',
    title: 'Wait for the model to load',
    detail: 'You\'ll see requests to HuggingFace CDN as the model weights download. This is the one-time download. These are model weight files, not your data.',
    code: null,
  },
  {
    n: '06',
    title: 'Clear the network log again',
    detail: 'Once the model is loaded and the status badge shows ● Ready, clear the network log one more time.',
    code: null,
  },
  {
    n: '07',
    title: 'Type a prompt and build an app',
    detail: 'Enter any prompt in the Workspace textarea and click Build App. Watch the Network tab as the pipeline runs.',
    code: 'e.g. "A todo app with dark mode and local storage"',
  },
  {
    n: '08',
    title: 'Observe: zero outbound requests',
    detail: 'The Network log stays empty (or shows only browser-internal requests). No requests to any AI API, no POST to any server. The inference runs entirely on your GPU.',
    code: null,
  },
];

const WHAT_TO_EXPECT = [
  { item: 'Requests to huggingface.co or cdn.jsdelivr.net', expected: 'Only during initial model download (one-time)' },
  { item: 'Requests to any AI API (OpenAI, Anthropic, etc.)', expected: 'None. Zero. Never.' },
  { item: 'Requests during inference (Build App, Run Tool)', expected: 'None — inference is local' },
  { item: 'Requests when you type in the chat', expected: 'None — no keylogging, no telemetry' },
  { item: 'Cookies or analytics pings', expected: 'None — no tracking scripts loaded' },
];

export default function DevtoolsPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="dot-grid" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '14px' }}>Verify Privacy</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Don't take our word for it
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Open DevTools. Watch the Network tab. Build an app. See zero outbound requests to any AI API. Here's the exact steps.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: '0 24px 80px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((step, i) => (
            <div key={step.n} style={{
              display: 'flex',
              gap: '24px',
              padding: '28px 0',
              borderBottom: i < STEPS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{
                flexShrink: 0,
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius)',
                background: 'var(--accent-muted)',
                border: '1px solid rgba(109,93,240,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent)',
                fontFamily: 'var(--font-mono)',
              }}>
                {step.n}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{step.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: step.code ? '10px' : '0' }}>{step.detail}</p>
                {step.code && (
                  <code style={{
                    display: 'block',
                    padding: '10px 14px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--accent)',
                  }}>{step.code}</code>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What to expect table */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '28px', letterSpacing: '-0.01em' }}>What you'll see in the Network tab</h2>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-elevated)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Network request type</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expected result</span>
            </div>
            {WHAT_TO_EXPECT.map((row, i) => (
              <div key={row.item} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                padding: '16px 20px',
                borderBottom: i < WHAT_TO_EXPECT.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                gap: '16px',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{row.item}</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: row.expected.includes('None') || row.expected.includes('Zero') ? 'var(--green)' : 'var(--text-secondary)',
                }}>{row.expected}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical note */}
      <section style={{ padding: '80px 24px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Why this is architecturally guaranteed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'No API keys in the codebase', body: 'There are no API keys, secrets, or endpoints for cloud AI services in the codebase. There is no code path that calls OpenAI, Anthropic, or any other cloud provider.' },
              { label: 'WebLLM runs entirely in WebAssembly + WebGPU', body: 'The @mlc-ai/web-llm library compiles the model to run on your GPU via WebGPU. The compute never leaves the browser tab.' },
              { label: 'COOP + COEP headers prevent cross-origin leakage', body: 'The Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp headers prevent the page from communicating with cross-origin resources that could leak data.' },
              { label: 'Open source and auditable', body: 'All source code is on GitHub. You can read it, fork it, audit it, and run your own instance. Nothing is hidden.' },
            ].map(item => (
              <div key={item.label} style={{ paddingLeft: '16px', borderLeft: '2px solid var(--accent)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em' }}>Ready to verify it yourself?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>Open the Workspace, then follow the steps above.</p>
        <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '15px', padding: '12px 32px' }}>
          Open Workspace →
        </Link>
      </section>
    </div>
  );
}
