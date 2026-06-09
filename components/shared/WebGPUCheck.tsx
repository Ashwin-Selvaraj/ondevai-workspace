'use client';
import { useEffect, useState } from 'react';
import { Cpu, AlertTriangle, CheckCircle } from 'lucide-react';

type GPUStatus = 'checking' | 'supported' | 'unsupported';

export default function WebGPUCheck() {
  const [status, setStatus] = useState<GPUStatus>('checking');

  useEffect(() => {
    async function check() {
      if (!navigator.gpu) {
        setStatus('unsupported');
        return;
      }
      try {
        const adapter = await navigator.gpu.requestAdapter();
        setStatus(adapter ? 'supported' : 'unsupported');
      } catch {
        setStatus('unsupported');
      }
    }
    check();
  }, []);

  if (status === 'checking') return null;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      background: status === 'supported' ? 'var(--green-muted)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${status === 'supported' ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`,
      fontSize: '12px',
      color: status === 'supported' ? 'var(--green)' : 'var(--red)',
    }}>
      {status === 'supported'
        ? <><CheckCircle size={12} /> WebGPU Ready</>
        : <><AlertTriangle size={12} /> WebGPU Unavailable</>
      }
    </div>
  );
}
