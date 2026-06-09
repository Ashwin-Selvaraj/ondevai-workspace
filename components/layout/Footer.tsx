import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      padding: '40px 24px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <span style={{
                width: '24px', height: '24px',
                background: 'var(--accent)',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={14} color="white" />
              </span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>OnDevAI</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Private. Offline. On-device.<br />
              Zero cloud inference.
            </p>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Product</p>
            {[
              { href: '/workspace', label: 'Workspace' },
              { href: '/toolbox', label: 'Toolbox' },
              { href: '/assistant', label: 'Assistant' },
              { href: '/local', label: 'How It Works' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '6px' }}>
                {label}
              </Link>
            ))}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Learn</p>
            {[
              { href: '/use-cases', label: 'Use Cases' },
              { href: '/roadmap', label: 'Roadmap' },
              { href: '/docs', label: 'Documentation' },
              { href: '/devtools', label: 'Verify Privacy' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '6px' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2024 OnDevAI. Your data never leaves your device.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Powered by WebGPU · WebLLM · PGlite
          </p>
        </div>
      </div>
    </footer>
  );
}
