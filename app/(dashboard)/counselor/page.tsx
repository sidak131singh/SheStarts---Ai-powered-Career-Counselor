'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { getUserId } from '@/store/userStore';
import { getProfileLocally } from '@/lib/localStorage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'What should I focus on this week?',
  'Help me explain my career gap in an interview',
  'Which skills should I learn first for my target role?',
  'How do I negotiate salary after a career break?',
  'Write my LinkedIn summary section',
  'Help me prepare for my target role interviews',
  'Review my elevator pitch',
  "I'm feeling discouraged — help me stay motivated",
];

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm Prerna, your personal AI career counselor at SheStarts.\n\nI'm here to help you navigate your career restart with personalised guidance, interview prep, and honest advice specific to your goals.\n\nWhat's on your mind today? Ask me anything — from which skills to learn first, to how to talk about your career break in interviews.",
  timestamp: new Date(),
};

function formatMessage(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

export default function CounselorPage() {
  const [messages, setMessages]           = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput]                 = useState('');
  const [isStreaming, setIsStreaming]     = useState(false);
  const [userProfile, setUserProfile]    = useState<Record<string, unknown> | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const textareaRef       = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const userId = getUserId();
    // Try localStorage first for Vercel compatibility
    const local = getProfileLocally(userId) as Record<string, unknown> | null;
    if (local) { setUserProfile(local); return; }
    fetch(`/api/assessment?userId=${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.profile) setUserProfile(data.profile); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isStreaming) return;
    const userId = getUserId();
    setShowSuggestions(false);

    const userMsg: Message     = { id: Date.now().toString(), role: 'user', content: messageText.trim(), timestamp: new Date() };
    const assistantId          = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', timestamp: new Date() };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/counselor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          userProfile,
        }),
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) throw new Error('Stream failed');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (!data) continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'text' && parsed.content) {
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + parsed.content } : m));
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch (error: unknown) {
      if ((error as Error).name !== 'AbortError') {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content || 'I had trouble connecting. Please try again.' } : m));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };
  const handleStop = () => { abortControllerRef.current?.abort(); setIsStreaming(false); };

  const pref = (userProfile?.preferences as Record<string, unknown>) ?? {};
  const targetPaths = ((pref.targetCareerPaths as string[]) ?? []).join(', ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#F0F4F4', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }} className="lg:h-screen">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: '#0B3540', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 40, height: 40, background: '#E2D400', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.1rem', color: '#0B3540', flexShrink: 0 }}>P</div>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.04em' }}>Prerna</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, background: '#22C55E', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.72rem', color: '#7EC8C4', fontWeight: 600 }}>AI Career Counselor · Always available</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {userProfile && (
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 12px', fontSize: '0.75rem', color: '#7EC8C4', fontWeight: 700, display: 'none' }} className="sm:block">
              {(userProfile.name as string) || 'User'}
              {targetPaths && <span style={{ color: '#E2D400' }}> · {targetPaths}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(message => (
            <div key={message.id} className="animate-fadeInUp" style={{ display: 'flex', gap: 10, flexDirection: message.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: message.role === 'assistant' ? '#0B3540' : '#E2D400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '0.9rem', color: message.role === 'assistant' ? '#E2D400' : '#0B3540', flexShrink: 0 }}>
                {message.role === 'assistant' ? 'P' : 'U'}
              </div>
              <div style={{ flex: 1, maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ padding: '12px 16px', borderRadius: message.role === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px', background: message.role === 'user' ? '#0B3540' : '#fff', color: message.role === 'user' ? '#E2D400' : '#0B3540', boxShadow: '0 1px 6px rgba(11,53,64,0.1)', border: message.role === 'assistant' ? '1px solid #D4E5E5' : 'none' }}>
                  {message.content ? (
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.7, fontWeight: 600 }}
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' }}>
                      <div style={{ width: 8, height: 8, background: '#00C4BA', borderRadius: '50%' }} className="typing-dot" />
                      <div style={{ width: 8, height: 8, background: '#00C4BA', borderRadius: '50%' }} className="typing-dot" />
                      <div style={{ width: 8, height: 8, background: '#00C4BA', borderRadius: '50%' }} className="typing-dot" />
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '0.68rem', color: '#5A9E9E', fontWeight: 600, marginTop: 4 }}>
                  {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Suggested Questions */}
          {showSuggestions && messages.length === 1 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: '0.72rem', color: '#5A9E9E', fontWeight: 700, textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Suggested questions</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {SUGGESTED_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    style={{ fontSize: '0.78rem', background: '#fff', border: '1.5px solid #D4E5E5', color: '#0B3540', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#00C4BA'; (e.currentTarget as HTMLButtonElement).style.color = '#0D6B7A'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4E5E5'; (e.currentTarget as HTMLButtonElement).style.color = '#0B3540'; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ background: '#fff', borderTop: '1px solid #D4E5E5', padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Prerna anything about your career restart..."
                disabled={isStreaming}
                rows={1}
                style={{ width: '100%', borderRadius: 8, border: '1.5px solid #D4E5E5', padding: '10px 16px', color: '#0B3540', resize: 'none', outline: 'none', fontSize: '0.875rem', fontWeight: 600, fontFamily: "'Barlow', sans-serif", background: isStreaming ? '#F8FAFA' : '#fff', maxHeight: 120, overflowY: 'auto' }}
              />
            </div>
            {isStreaming ? (
              <button type="button" onClick={handleStop} style={{ width: 44, height: 44, background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} style={{ width: 44, height: 44, background: '#0B3540', color: '#E2D400', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', opacity: input.trim() ? 1 : 0.4, flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            )}
          </form>
          <p style={{ fontSize: '0.68rem', color: '#5A9E9E', fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
            Prerna knows your profile and career goals. All conversations are private.
          </p>
        </div>
      </div>
    </div>
  );
}
