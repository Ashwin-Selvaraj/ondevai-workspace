'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';

const NAV_LINKS = [
  { href: '/workspace',  label: 'Workspace' },
  { href: '/toolbox',    label: 'Toolbox' },
  { href: '/assistant',  label: 'AI Chat' },
  { href: '/local',      label: 'How It Works' },
  { href: '/docs',       label: 'Docs' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '48px',
      background: 'rgba(8,8,14,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '8px',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        textDecoration: 'none',
        color: 'var(--text-primary)',
        fontWeight: 600,
        fontSize: '14px',
        flexShrink: 0,
      }}>
        <span style={{
          width: '24px',
          height: '24px',
          background: 'var(--accent)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Zap size={14} color="white" />
        </span>
        OnDevAI
      </Link>

      {/* Bounty badge */}
      <a
        href="https://vibesterz.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          padding: '2px 8px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'color 0.15s, border-color 0.15s',
        }}
        className="bounty-badge"
      >
        Vibesterz replication · Pump.fun Bounty
      </a>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, marginLeft: '8px' }} className="hidden-mobile">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius)',
              fontSize: '13px',
              fontWeight: active ? 500 : 400,
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: active ? 'var(--bg-hover)' : 'transparent',
              textDecoration: 'none',
              transition: 'color 0.15s, background 0.15s',
            }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }}>
          Open Workspace
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
        .bounty-badge:hover { color: var(--accent) !important; border-color: var(--accent) !important; }
      `}</style>
    </nav>
  );
}
