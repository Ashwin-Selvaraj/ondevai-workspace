'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Download } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',           label: 'Home' },
  { href: '/workspace',  label: 'Workspace' },
  { href: '/toolbox',    label: 'Toolbox' },
  { href: '/assistant',  label: 'Assistant' },
  { href: '/local',      label: 'How It Works' },
  { href: '/use-cases',  label: 'Use Cases' },
  { href: '/docs',       label: 'Docs' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as BeforeInstallPromptEvent).prompt();
    const { outcome } = await (deferredPrompt as BeforeInstallPromptEvent).userChoice;
    if (outcome === 'accepted') setCanInstall(false);
  };

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
        marginRight: '12px',
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

      {/* Desktop nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }} className="hidden-mobile">
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

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        {canInstall && (
          <button onClick={handleInstall} className="btn btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
            <Download size={13} />
            Install App
          </button>
        )}
        <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }}>
          Open Workspace
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </nav>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
