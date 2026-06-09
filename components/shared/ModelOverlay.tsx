'use client';
import { useEffect, useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, Cpu } from 'lucide-react';
import { useEngine } from '@/lib/engine/EngineContext';
import ProgressBar from './ProgressBar';

type GPUStatus = 'checking' | 'ok' | 'fail';

interface ModelOverlayProps {
  /** Only show on these route prefixes */
  routePrefixes?: string[];
}

export default function ModelOverlay({ routePrefixes = ['/workspace', '/toolbox', '/assistant'] }: ModelOverlayProps) {
  const { isReady, isLoading, progress, progressText, error, selectedModel } = useEngine();
  const [gpuStatus, setGpuStatus] = useState<GPUStatus>('checking');
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Detect route on client
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Check WebGPU once
  useEffect(() => {
    async function check() {
      const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
      if (!gpu) { setGpuStatus('fail'); return; }
      try {
        const adapter = await gpu.requestAdapter();
        setGpuStatus(adapter ? 'ok' : 'fail');
      } catch {
        setGpuStatus('fail');
      }
    }
    check();
  }, []);

  // Show overlay when on a relevant route and model isn't ready
  useEffect(() => {
    const onRoute = routePrefixes.some(p => currentPath.startsWith(p));
    if (onRoute && (isLoading || (!isReady && !error))) {
      setVisible(true);
      setFadeOut(false);
    }
    if (isReady && visible) {
      // Fade out after model loads
      setTimeout(() => setFadeOut(true), 400);
      setTimeout(() => setVisible(false), 750);
    }
  }, [isReady, isLoading, currentPath, visible, error, routePrefixes]);

  if (!visible) return null;

  const TIER_COLORS: Record<string, string> = {
    lightweight: 'var(--green)',
    balanced: 'var(--accent)',
    powerful: 'var(--yellow)',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(8,8,14,0.96)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      {/* Logo */}
      <div style={{
        width: '48px',
        height: '48px',
        background: 'var(--accent)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--accent-glow)',
      }}>
        <Zap size={24} color="white" />
      </div>

      {gpuStatus === 'fail' ? (
        // WebGPU not available
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={20} color="var(--red)" />
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--red)' }}>WebGPU Required</p>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This app requires WebGPU to run AI models in your browser.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Use Chrome 113+ or Edge 113+ on a desktop device.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '8px 20px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            ← Back to Home
          </a>
        </div>
      ) : error ? (
        // Load error
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={20} color="var(--red)" />
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--red)' }}>Load Failed</p>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', wordBreak: 'break-all' }}>
            {error}
          </p>
        </div>
      ) : (
        // Loading
        <div style={{ textAlign: 'center', width: '380px' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
            Loading model…
          </p>

          {/* Model name + tier badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <Cpu size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedModel.name}</span>
            <span style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 600,
              background: 'var(--bg-elevated)',
              border: `1px solid ${TIER_COLORS[selectedModel.tier]}`,
              color: TIER_COLORS[selectedModel.tier],
              textTransform: 'capitalize',
            }}>
              {selectedModel.tier}
            </span>
          </div>

          {/* Progress bar */}
          <ProgressBar progress={progress} height={6} />

          {/* Progress text */}
          <p style={{
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            minHeight: '18px',
          }}>
            {progressText || 'Initialising…'}
          </p>

          {/* First load hint */}
          {progress < 5 && (
            <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-disabled)', lineHeight: 1.6 }}>
              First load downloads the model weights ({selectedModel.vram}).<br />
              Subsequent loads use the browser cache.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
