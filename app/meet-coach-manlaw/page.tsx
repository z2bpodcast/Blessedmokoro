'use client'
// ============================================================
// Z2B 4M V3 — MEET COACH MANLAW (UPGRADED)
// File: app/meet-coach-manlaw/page.tsx
// Laws: Same URL/buttons as existing · AI-powered intelligence
//       Context-aware · Genuine conversation · No programmed answers
// ============================================================

import { useState, useEffect, useRef, Suspense, memo } from 'react'
import { useRouter }                                     from 'next/navigation'
import { supabase }                                      from '@/lib/supabase'
import Link                                              from 'next/link'
import type { CoachMessage }                             from '@/lib/v3/coach-engine'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

// ── COACH AVATAR ──────────────────────────────────────────────
const CoachAvatar = memo(function CoachAvatar({ size = 40, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#7C3AED,#4C1D95)',
      border: '2px solid rgba(139,92,246,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45 + 'px',
      position: 'relative',
      animation: pulse ? 'coachPulse 2s ease-in-out infinite' : 'none',
    }}>
      ⚡
      {pulse && (
        <div style={{
          position: 'absolute', inset: -3, borderRadius: '50%',
          border: '2px solid rgba(139,92,246,0.3)',
          animation: 'coachRing 2s ease-in-out infinite',
        }} />
      )}
      <style>{`
        @keyframes coachPulse { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.4)} 50%{box-shadow:0 0 0 8px rgba(139,92,246,0)} }
        @keyframes coachRing  { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.15);opacity:0} }
      `}</style>
    </div>
  )
})

// ── MESSAGE BUBBLE ────────────────────────────────────────────
function MessageBubble({ msg }: { msg: CoachMessage }) {
  const isCoach = msg.role === 'coach'
  return (
    <div style={{
      display: 'flex', gap: '10px', marginBottom: '16px',
      flexDirection: isCoach ? 'row' : 'row-reverse',
    }}>
      {isCoach && <CoachAvatar size={32} />}
      <div style={{
        maxWidth: '80%',
        padding: '12px 16px', borderRadius: isCoach ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isCoach
          ? 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(139,92,246,0.08))'
          : 'rgba(255,255,255,0.07)',
        border: '1px solid ' + (isCoach ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.12)'),
        fontSize: '14px', color: W, lineHeight: 1.8,
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

// ── TYPING INDICATOR ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
      <CoachAvatar size={32} pulse />
      <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: VIO, animation: `dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
        <style>{`@keyframes dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
      </div>
    </div>
  )
}

// ── SUGGESTED QUESTIONS ───────────────────────────────────────
const QUICK_QUESTIONS = [
  "What should I focus on right now?",
  "How do I price my product?",
  "I'm stuck. What do I do?",
  "How do I get my first sale?",
  "Explain my compensation plan",
  "What's the fastest path to R10,000?",
]

// ── MAIN PAGE ─────────────────────────────────────────────────
function CoachManlaw() {
  const router    = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const [messages,   setMessages]   = useState<CoachMessage[]>([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [sending,    setSending]    = useState(false)
  const [authToken,  setAuthToken]  = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [coachCtx,   setCoachCtx]  = useState<{ firstName: string; tierLabel: string; hasActiveSession: boolean; productsLive: number } | null>(null)
  const [showQuick,  setShowQuick]  = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }
      setIsLoggedIn(true)
      setAuthToken(session.access_token)
      await initCoach(session.access_token)
    })
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function initCoach(token: string) {
    setLoading(true)
    try {
      const res  = await fetch('/api/coach-manlaw', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({ action: 'init' }),
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages([data.message])
        setCoachCtx(data.context)
      }
    } catch (_) {}
    setLoading(false)
  }

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || sending) return

    const userMsg: CoachMessage = {
      id:        crypto.randomUUID?.() ?? Date.now().toString(),
      role:      'user',
      content:   msg,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setShowQuick(false)
    setSending(true)

    try {
      const res  = await fetch('/api/coach-manlaw', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
        body:    JSON.stringify({
          action:  'message',
          message: msg,
          history: messages.slice(-8),
        }),
      })
      const data = await res.json()

      if (res.ok && data.message) {
        setMessages(prev => [...prev, data.message])
      } else {
        setMessages(prev => [...prev, {
          id:        Date.now().toString(),
          role:      'coach' as const,
          content:   data.error ?? 'Something went wrong. Try again.',
          timestamp: new Date().toISOString(),
        }])
      }
    } catch (_) {
      setMessages(prev => [...prev, {
        id:        Date.now().toString(),
        role:      'coach' as const,
        content:   'Connection issue. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    }

    setSending(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── NOT LOGGED IN VIEW ────────────────────────────────────
  if (!isLoggedIn && !loading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <CoachAvatar size={80} pulse />
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: W, margin: '0 0 10px' }}>
            Meet Coach Manlaw
          </h1>
          <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.8, marginBottom: '28px', maxWidth: '360px' }}>
            Your AI Business Developer. Context-aware. Kingdom-driven. Ready to coach you to your first R10,000 in digital product income.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
            <Link href="/login?redirect=/meet-coach-manlaw"
              style={{ display: 'block', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', color: W, fontWeight: 900, fontSize: '14px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
              Login to Meet Coach →
            </Link>
            <Link href="/register"
              style={{ display: 'block', padding: '12px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.4)', color: VIO, fontSize: '13px', textAlign: 'center', textDecoration: 'none' }}>
              Create Free Account
            </Link>
            <Link href="/"
              style={{ display: 'block', padding: '10px', color: MUTED, fontSize: '12px', textAlign: 'center', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── COACH CHAT UI ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <CoachAvatar size={38} pulse={sending} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: W }}>Coach Manlaw</div>
          <div style={{ fontSize: '11px', color: sending ? VIO : GREEN }}>
            {sending ? 'Thinking...' : coachCtx ? `Coaching ${coachCtx.firstName} · ${coachCtx.tierLabel}` : 'Online'}
          </div>
        </div>
        <Link href="/dashboard"
          style={{ fontSize: '11px', color: MUTED, textDecoration: 'none', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          Dashboard
        </Link>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', maxWidth: '700px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <CoachAvatar size={56} pulse />
            <div style={{ marginTop: '16px', fontSize: '13px', color: MUTED }}>Coach Manlaw is reading your profile...</div>
          </div>
        )}

        {/* Messages */}
        {!loading && messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

        {/* Typing */}
        {sending && <TypingIndicator />}

        {/* Quick questions */}
        {!loading && !sending && showQuick && messages.length <= 1 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '10px', textAlign: 'center' }}>Ask Coach Manlaw anything:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)', color: VIO, fontSize: '12px', cursor: 'pointer', fontFamily: 'Georgia,serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(139,92,246,0.18)' }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'rgba(139,92,246,0.08)' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', background: SURF, borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: '700px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask Coach Manlaw anything about your business..."
            rows={1}
            disabled={sending || loading}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: '12px', resize: 'none',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none',
              lineHeight: 1.5, maxHeight: '120px', overflow: 'auto',
              opacity: sending ? 0.6 : 1,
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || sending || loading}
            style={{
              width: '44px', height: '44px', borderRadius: '12px', border: 'none',
              background: input.trim() && !sending ? 'linear-gradient(135deg,#7C3AED,#4C1D95)' : 'rgba(255,255,255,0.06)',
              color: W, cursor: input.trim() && !sending ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0, transition: 'all 0.2s',
            }}>
            {sending ? '⟳' : '↑'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>

    </div>
  )
}

export default function CoachManLawPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#8B5CF6', fontFamily: 'Georgia,serif' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
          Loading Coach Manlaw...
        </div>
      </div>
    }>
      <CoachManlaw />
    </Suspense>
  )
}
