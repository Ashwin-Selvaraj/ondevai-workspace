'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = String(toastCounter++);
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: { bg: 'rgba(34,211,165,0.12)', border: 'rgba(34,211,165,0.3)', icon: '#22d3a5' },
  error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: '#ef4444' },
  info:    { bg: 'rgba(109,93,240,0.12)', border: 'rgba(109,93,240,0.3)', icon: '#6d5df0' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '#f59e0b' },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[toast.type];
  const colors = COLORS[toast.type];

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(8px)',
        minWidth: '280px',
        maxWidth: '380px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(24px)',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        pointerEvents: 'all',
      }}
    >
      <Icon size={16} color={colors.icon} style={{ flexShrink: 0, marginTop: '1px' }} />
      <span style={{
        flex: 1,
        fontSize: '13px',
        lineHeight: 1.5,
        color: 'var(--text-primary)',
      }}>
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          color: 'var(--text-muted)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
