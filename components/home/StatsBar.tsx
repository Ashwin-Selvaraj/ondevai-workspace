'use client';
import { useEffect, useRef, useState } from 'react';

const STATS = [
  { num: 57,    suffix: '',       label: 'Tools' },
  { num: 11,    suffix: '',       label: 'Categories' },
  { num: 0,     suffix: ' Bytes', label: 'to Cloud' },
  { num: 100,   suffix: '%',      label: 'Offline' },
  { num: 0,     suffix: '',       label: 'Sign-ups' },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        if (target === 0) { setValue(0); return; }
        const duration = 1200;
        const startTime = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {target === 0 ? '0' : value}{suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section style={{
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      padding: '36px 24px',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '28px',
      }}>
        {STATS.map(({ num, suffix, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              <AnimatedNumber target={num} suffix={suffix} />
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
