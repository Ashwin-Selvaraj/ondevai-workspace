'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useEngine } from '@/lib/engine/EngineContext';
import { streamChat } from '@/lib/engine/webllm';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import StatusBadge from '@/components/shared/StatusBadge';
import { DEFAULT_MODEL } from '@/lib/engine/models';
import { Zap, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are OnDevAI Assistant — a helpful, knowledgeable AI running entirely in the user's browser via WebGPU. You never touch the cloud.

Be concise, accurate, and helpful. For code: use markdown code blocks. For lists: use bullet points. Keep responses focused.`;

const EXAMPLE_PROMPTS = [
  'Explain how WebGPU works',
  'Write a React hook for debounce',
  'What is a closure in JavaScript?',
  'How do I center a div in CSS?',
];

let msgId = 0;
function newId() { return String(msgId++); }

export default function ChatInterface() {
  const { isReady, isLoading, loadModel, selectedModel } = useEngine();
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const stopRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-load model
  useEffect(() => {
    if (!isReady && !isLoading) loadModel(selectedModel ?? DEFAULT_MODEL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (userText: string) => {
    if (!isReady) return;
    stopRef.current = false;

    const userMsg: Message = { id: newId(), role: 'user', content: userText };
    const assistantId = newId();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setStreamingId(assistantId);
    setIsGenerating(true);

    try {
      const history = messages.slice(-10); // last 10 for context
      const chatMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: userText },
      ];

      for await (const partial of streamChat(chatMessages, { temperature: 0.6, max_tokens: 2000 })) {
        if (stopRef.current) break;
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: partial } : m)
        );
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Generation failed';
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: `Error: ${errorMsg}` } : m)
      );
    } finally {
      setStreamingId(null);
      setIsGenerating(false);
    }
  }, [isReady, messages]);

  function handleStop() {
    stopRef.current = true;
    setStreamingId(null);
    setIsGenerating(false);
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 48px)',
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'var(--accent)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1 }}>OnDevAI Assistant</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {selectedModel.name} · 100% private
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatusBadge
            status={isLoading ? 'loading' : isReady ? 'ready' : 'idle'}
            label={isLoading ? 'Loading…' : isReady ? 'Ready' : 'No model'}
          />
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '4px 8px' }}
              title="Clear chat"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.length === 0 ? (
          // Empty state
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '40px 0' }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'var(--accent-muted)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(109,93,240,0.3)',
            }}>
              <Zap size={24} color="var(--accent)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>Ask me anything</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Private AI chat — runs entirely in your browser
              </p>
            </div>
            {/* Example prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '500px' }}>
              {EXAMPLE_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => isReady && sendMessage(p)}
                  disabled={!isReady}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: isReady ? 'pointer' : 'not-allowed',
                    transition: 'border-color 0.15s, color 0.15s',
                    opacity: isReady ? 1 : 0.5,
                  }}
                  onMouseEnter={e => { if (isReady) { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.color = 'var(--text-primary)'; }}}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={msg.id === streamingId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={handleStop}
        isGenerating={isGenerating}
        disabled={!isReady}
      />
    </div>
  );
}
