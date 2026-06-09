import Link from 'next/link';
import { Zap, Shield, Cpu, Lock, WifiOff, Package } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section className="dot-grid" style={{
        minHeight: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
            {['No subscription', 'No sign-up', 'No pay-per-use credits'].map(t => (
              <span key={t} style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-elevated)',
              }}>{t}</span>
            ))}
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '20px',
            letterSpacing: '-0.02em',
          }}>
            Private. Offline.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>On-device.</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            marginBottom: '36px',
            maxWidth: '560px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}>
            AI Tools That Never Touch the Cloud. Build full web apps and run 60+ tools — entirely in your browser via WebGPU.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '14px', padding: '10px 24px' }}>
              <Zap size={15} />
              Open Workspace →
            </Link>
            <Link href="/toolbox" className="btn btn-secondary" style={{ fontSize: '14px', padding: '10px 24px' }}>
              View Toolbox
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          {[
            { num: '62', label: 'Tools' },
            { num: '11', label: 'Categories' },
            { num: '0 Bytes', label: 'to Cloud' },
            { num: '100%', label: 'Offline' },
            { num: '0', label: 'Sign-ups' },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{num}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>Private by architecture</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '15px' }}>
          Not a privacy policy. An architectural guarantee.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { icon: Cpu, title: 'WebGPU Inference', body: 'LLM runs directly on your GPU inside the browser tab. Zero server calls, zero cloud latency.' },
            { icon: Lock, title: 'No API Keys Needed', body: 'No accounts, no keys, no tokens. Nothing to leak. Just open and use.' },
            { icon: WifiOff, title: 'Works Fully Offline', body: 'Download the model once, it\'s cached. No internet required after that.' },
            { icon: Shield, title: 'Your Data Stays Yours', body: 'Files, documents, sensitive data — processed locally by a local model. Never transmitted.' },
            { icon: Package, title: 'In-Browser PostgreSQL', body: 'PGlite runs a full PostgreSQL database in WASM. Generated apps get real SQL, no server needed.' },
            { icon: Zap, title: 'Five-Pass Build Pipeline', body: 'Research → Blueprint → Generate → Review → Fix. Each pass improves the output.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'var(--accent-muted)',
                borderRadius: 'var(--radius)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Icon size={18} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Ready to build?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>
            Open the Workspace and describe your app in plain English.
          </p>
          <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '14px', padding: '10px 28px' }}>
            Open Workspace →
          </Link>
          <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Verify it yourself: Open DevTools → Network tab → Build app → See zero outbound calls
          </p>
        </div>
      </section>
    </div>
  );
}
