import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Server } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Use Cases — OnDevAI',
  description: 'See how developers, writers, researchers, and privacy-conscious users are using OnDevAI.',
};

const USE_CASES = [
  {
    icon: '👨‍💻',
    title: 'Solo Developer',
    subtitle: 'Ship faster without leaving the terminal',
    desc: 'Generate boilerplate, write unit tests, explain unfamiliar code, scan for secrets — all without pasting your private code into a cloud API.',
    tools: ['Raw Code Zone', 'Unit Test Generator', 'Secret Scanner', 'Code Explainer'],
    href: '/toolbox',
  },
  {
    icon: '✍️',
    title: 'Content Creator',
    subtitle: 'Write, refine, and repurpose offline',
    desc: 'Draft, rewrite for different tones, translate into 100+ languages, build slide decks from a topic — no subscription, no AI watermarks.',
    tools: ['Writing Tools', 'Offline Translator', 'Deck Builder', 'Grammar & Style'],
    href: '/toolbox',
  },
  {
    icon: '🔬',
    title: 'Data Analyst',
    subtitle: 'Query and clean data without uploading it',
    desc: 'Ask plain-English questions about your CSV, clean messy data, convert between formats, categorize rows — sensitive data stays on your machine.',
    tools: ['Chat With Your Data', 'Data Cleaner', 'Format Converter', 'Sentiment Analyzer'],
    href: '/toolbox',
  },
  {
    icon: '⚖️',
    title: 'Legal & Compliance',
    subtitle: 'Analyse contracts without cloud exposure',
    desc: 'Summarise lengthy contracts, redact PII before sharing, extract structured data from invoices — client confidentiality preserved by default.',
    tools: ['Document Assistant', 'Private Redactor', 'Structured Extractor', 'Receipts to CSV'],
    href: '/toolbox',
  },
  {
    icon: '🎨',
    title: 'Designer',
    subtitle: 'Color tools and image processing locally',
    desc: 'Convert colors, check WCAG contrast, remove image backgrounds, generate favicon packs — no Photoshop, no subscriptions, no uploading assets.',
    tools: ['Color & CSS Studio', 'Background Remover', 'Favicon Generator', 'Color Palette Extractor'],
    href: '/toolbox',
  },
  {
    icon: '📋',
    title: 'Meeting Lead',
    subtitle: 'Turn recordings into action items offline',
    desc: 'Upload a meeting recording and get a transcript plus extracted decisions and action items — Whisper runs locally, your conversations stay private.',
    tools: ['Meeting Assistant', 'Audio Transcription', 'Document Assistant', 'Flashcards & Quiz'],
    href: '/toolbox',
  },
  {
    icon: '🎓',
    title: 'Student / Researcher',
    subtitle: 'Study tools that never phone home',
    desc: 'Create flashcards from lecture notes, chat with your research papers, translate source material, summarise long documents.',
    tools: ['Flashcards & Quiz', 'Chat With Your Files', 'Offline Translator', 'Document Assistant'],
    href: '/toolbox',
  },
  {
    icon: '🔐',
    title: 'Security Engineer',
    subtitle: 'Privacy-first security tools',
    desc: 'Scan code for leaked secrets, verify file hashes, encrypt files with AES-256, redact PII from logs before sharing with colleagues.',
    tools: ['Secret Scanner', 'Hash Checker', 'Encryption Vault', 'Private Redactor'],
    href: '/toolbox',
  },
  {
    icon: '🚀',
    title: 'Indie Hacker',
    subtitle: 'Build full apps from a single prompt',
    desc: 'Describe your product idea. The 5-pass pipeline generates a complete, functional single-file web app with local storage, auth, and UI — no backend needed.',
    tools: ['AI App Builder', 'Quick / Standard / Deep', 'Live Preview', 'ZIP Export'],
    href: '/workspace',
  },
];

const ARCHITECTURE_PROMISES = [
  { icon: <Server size={18} color="var(--accent)" />, title: 'Zero server inference', body: 'Every LLM completion runs on your device GPU via WebGPU. There is no server.' },
  { icon: <Lock size={18} color="var(--accent)" />, title: 'Zero data transmission', body: 'Your prompts, files, and outputs never leave the browser tab. Watch Network DevTools.' },
  { icon: <Shield size={18} color="var(--accent)" />, title: 'No accounts, no tracking', body: 'No login flow. No analytics. No cookies. Nothing to associate you with your queries.' },
];

export default function UseCasesPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="dot-grid" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '14px' }}>Use Cases</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Built for people who value privacy
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Whether you're a developer, writer, analyst, or researcher — if your work involves sensitive data, OnDevAI keeps it on your device.
          </p>
        </div>
      </section>

      {/* Use case grid */}
      <section style={{ padding: '0 24px 96px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {USE_CASES.map(uc => (
            <div key={uc.title} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>{uc.icon}</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{uc.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>{uc.subtitle}</p>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>{uc.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {uc.tools.map(t => (
                  <span key={t} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    {t}
                  </span>
                ))}
              </div>
              <Link href={uc.href} style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                Try it →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture promises */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Why trust is built-in, not bolted-on</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              These aren't policies. They're architectural constraints that can't be overridden.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {ARCHITECTURE_PROMISES.map(p => (
              <div key={p.title} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-muted)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>{p.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em' }}>Ready to try it?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>No account. No credit card. Just open and use.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/workspace" className="btn btn-primary" style={{ fontSize: '14px', padding: '10px 24px' }}>Open Workspace →</Link>
          <Link href="/toolbox" className="btn btn-secondary" style={{ fontSize: '14px', padding: '10px 24px' }}>Browse Toolbox</Link>
        </div>
      </section>
    </div>
  );
}
