'use client'
// FILE: app/ai-income/coach/page.tsx — Coach Manlaw — Clean Turbopack-safe build

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ── Colors ───────────────────────────────────────────────────────
const BG    = '#0D0820'
const GOLD  = '#D4AF37'
const W     = '#F0F9FF'
const MUTED = 'rgba(255,255,255,0.45)'
const PURP  = '#7C3AED'

const GRAD_GOLD = 'linear-gradient(135deg,#D4AF37,#B8860B)'
const GRAD_PURP = 'linear-gradient(135deg,#7C3AED,#4C1D95)'

// ── Boldify: splits on ** and returns React nodes ─────────────────
function boldify(text: string): React.ReactNode[] {
  const parts = text.split('**')
  return parts.map((p, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: W }}>{p}</strong>
      : <span key={i}>{p}</span>
  )
}

// ── MarkdownOutput ────────────────────────────────────────────────
function MarkdownOutput({ text, accent }: { text: string; accent: string }) {
  if (!text) return null
  const rows = text.split('\n')
  const els: React.ReactNode[] = []
  const bullets: string[] = []

  const flushBullets = (key: string) => {
    if (!bullets.length) return
    const copy = [...bullets]
    bullets.length = 0
    els.push(
      <ul key={key} style={{ margin: '6px 0', paddingLeft: 0, listStyle: 'none' }}>
        {copy.map((b, bi) => (
          <li key={bi} style={{ display: 'flex', gap: '8px', marginBottom: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>
            <span style={{ color: accent, flexShrink: 0 }}>{'→'}</span>
            <span>{boldify(b)}</span>
          </li>
        ))}
      </ul>
    )
  }

  rows.forEach((row, i) => {
    const t = row.trim()

    if (!t) {
      flushBullets('f' + String(i))
      return
    }

    if (t.startsWith('## ')) {
      flushBullets('f' + String(i))
      els.push(
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          margin: '16px 0 6px', padding: '10px 14px',
          background: accent + '14',
          border: '1px solid ' + accent + '35',
          borderRadius: '10px', fontSize: '13px', fontWeight: 900,
          color: accent, fontFamily: 'Cinzel,Georgia,serif'
        }}>
          {t.slice(3)}
        </div>
      )
      return
    }

    if (t.startsWith('### ')) {
      flushBullets('f' + String(i))
      els.push(
        <div key={i} style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', margin: '12px 0 4px' }}>
          {t.slice(4)}
        </div>
      )
      return
    }

    if (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ')) {
      bullets.push(t.slice(2))
      return
    }

    if (t.startsWith('---') || t.startsWith('===')) {
      flushBullets('f' + String(i))
      els.push(<div key={i} style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />)
      return
    }

    flushBullets('f' + String(i))
    els.push(
      <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '3px 0' }}>
        {boldify(t)}
      </p>
    )
  })

  flushBullets('final')
  return <div style={{ lineHeight: 1.8 }}>{els}</div>
}

// ── Types ─────────────────────────────────────────────────────────
type Mode = 'chat' | 'offer' | 'product' | 'research' | 'objections' | 'system' | 'audit' | 'formula' | 'brutal' | 'iterate'

const MODES: { id: Mode; icon: string; label: string }[] = [
  { id: 'chat',       icon: '💬', label: 'Coach' },
  { id: 'offer',      icon: '✍️', label: 'Write Offer' },
  { id: 'product',    icon: '📦', label: 'Create Product' },
  { id: 'research',   icon: '🔍', label: 'Research' },
  { id: 'objections', icon: '💪', label: 'Objections' },
  { id: 'system',     icon: '📢', label: 'Sales System' },
  { id: 'audit',      icon: '📊', label: 'Audit' },
  { id: 'formula',    icon: '🔥', label: 'Formula Builder' },
  { id: 'brutal',     icon: '🔴', label: 'Brutal Audit' },
  { id: 'iterate',    icon: '🔁', label: 'Iterate' },
]

const MARKETS = ['South Africa','Nigeria','Kenya','Ghana','Zimbabwe','UK','USA','Canada','Australia','India','Global']
const DEMOGRAPHICS = ['General Adults','Women 25-45','Men 25-45','Employees','Parents','Students','Entrepreneurs','Seniors','Youth 18-25']
const PLATFORMS = ['WhatsApp','Facebook','Instagram','TikTok','LinkedIn','Email','Twitter/X','SMS','Telegram']
const INDUSTRIES = ['Business & Finance','Education & Learning','Health & Wellness','Parenting','Career','Food & Cooking','Faith','Technology','Beauty','Sports & Fitness']

const TRIGGERS = [
  { id: 'fear',         label: '😨 Fear of Loss' },
  { id: 'proof',        label: '✅ Proof & Results' },
  { id: 'urgency',      label: '⏰ Urgency' },
  { id: 'identity',     label: '👤 Identity' },
  { id: 'specificity',  label: '🎯 Specificity' },
  { id: 'story',        label: '📖 Story' },
  { id: 'contrast',     label: '⚖️ Contrast' },
  { id: 'mechanism',    label: '⚙️ Mechanism' },
  { id: 'objection',    label: '🛡️ Pre-empt Objections' },
  { id: 'curiosity',    label: '🤔 Curiosity Gap' },
  { id: 'authority',    label: '🏆 Authority' },
  { id: 'scarcity',     label: '💎 Scarcity' },
  { id: 'transformation', label: '🦋 Transformation' },
]

const FORMATS = [
  { id: 'ebook',        icon: '📖', label: 'eBook',          brain: 'GPT-4o' },
  { id: 'guide',        icon: '🗺️', label: 'Step-by-Step Guide', brain: 'GPT-4o' },
  { id: 'checklist',    icon: '✅', label: 'Checklist',      brain: 'GPT-4o' },
  { id: 'template',     icon: '📋', label: 'Template Pack',  brain: 'GPT-4o' },
  { id: 'mini_course',  icon: '⚡', label: 'Mini-Course',    brain: 'GPT-4o' },
  { id: 'course',       icon: '🎓', label: 'Full Course',    brain: 'GPT-4o' },
  { id: 'masterclass',  icon: '🏆', label: 'Masterclass',    brain: 'GPT-4o' },
  { id: 'toolkit',      icon: '🧰', label: 'Toolkit',        brain: 'GPT-4o' },
  { id: 'swipe_file',   icon: '📂', label: 'Swipe File',     brain: 'GPT-4o' },
  { id: 'planner',      icon: '📅', label: 'Planner',        brain: 'GPT-4o' },
  { id: 'workbook',     icon: '📓', label: 'Workbook',       brain: 'GPT-4o' },
  { id: 'software',     icon: '💻', label: 'Interactive Tool', brain: 'Claude Sonnet' },
]

// ── Shared style helpers ──────────────────────────────────────────
const INP: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '10px', color: W, fontSize: '13px',
  fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box',
}

function SubmitBtn({ label, onClick, disabled, bg, col }: { label: string; onClick: () => void; disabled: boolean; bg: string; col?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px 18px', borderRadius: '10px', border: 'none',
        background: disabled ? 'rgba(255,255,255,0.1)' : bg,
        color: disabled ? 'rgba(255,255,255,0.3)' : (col || '#fff'),
        fontWeight: 700, fontSize: '13px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: '14px', fontFamily: 'Georgia,serif',
      }}
    >
      {label}
    </button>
  )
}

function Lbl({ children }: { children: string }) {
  return <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>{children}</label>
}

// ── OutCard ───────────────────────────────────────────────────────
function OutCard({ output, accent, label, onCopy, copied }: { output: string; accent: string; label: string; onCopy: () => void; copied: boolean }) {
  if (!output) return null
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid ' + accent + '25', borderRadius: '14px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: accent }}>{label}</div>
        <button onClick={onCopy} style={{ padding: '4px 10px', background: accent + '20', border: '1px solid ' + accent + '40', borderRadius: '8px', color: accent, fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}>
          {copied ? '✅ Copied' : '📋 Copy All'}
        </button>
      </div>
      <MarkdownOutput text={output} accent={accent} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
function ManLawInner() {
  const [mode,         setMode]         = useState<Mode>('chat')
  const [messages,     setMessages]     = useState<{ role: string; content: string }[]>([])
  const [input,        setInput]        = useState('')
  const [output,       setOutput]       = useState('')
  const [loading,      setLoading]      = useState(false)
  const [copied,       setCopied]       = useState(false)
  const [builderTier,  setBuilderTier]  = useState('free')
  const [market,       setMarket]       = useState('South Africa')
  const [audience,     setAudience]     = useState('General Adults')
  const [product,      setProduct]      = useState('')
  const [topic,        setTopic]        = useState('')
  const [price,        setPrice]        = useState('')
  const [platform,     setPlatform]     = useState('WhatsApp')
  const [painPoints,   setPainPoints]   = useState('')
  const [format,       setFormat]       = useState('ebook')
  const [auditCopy,    setAuditCopy]    = useState('')
  const [iterRounds,   setIterRounds]   = useState(1)
  const [resCategory,  setResCategory]  = useState('')
  const [selTriggers,  setSelTriggers]  = useState<string[]>([])
  const [wsPerson,     setWsPerson]     = useState('')
  const [wsProblem,    setWsProblem]    = useState('')
  const [wsPromise,    setWsPromise]    = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', user.id).single()
        setBuilderTier(prof?.paid_tier || 'free')
      }
    })
    setMessages([{
      role: 'assistant',
      content: 'You do not need their permission to build income.\n\nI am Coach Manlaw — your AI business coach for Z2B Legacy Builders.\n\n**Choose a mode above. Set your market. Tell me what you are building.**\n\nThe world is waiting for what you know.',
    }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, output])

  const callAPI = async (action: string, extra?: Record<string, unknown>) => {
    setLoading(true)
    setOutput('')
    try {
      const body = { action, builderTier, market, audience, ...extra }
      if (action === 'chat') {
        const newMsgs = [...messages, { role: 'user', content: input }]
        setMessages(newMsgs)
        setInput('')
        const res  = await fetch('/api/coach-manlaw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, messages: newMsgs }) })
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error || 'Error. Try again.' }])
      } else {
        const res  = await fetch('/api/coach-manlaw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await res.json()
        const result = data.copy || data.productContent || data.handlers || data.research || data.system || data.audit || data.built || data.finalOffer || data.error || ''
        const extra2 = data.launchCopy ? '\n\n---\n\n## LAUNCH COPY\n\n' + data.launchCopy : ''
        setOutput(result + extra2)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error'
      if (action === 'chat') setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.' }])
      else setOutput('Error: ' + msg)
    }
    setLoading(false)
  }

  const copyText = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const modeColor = (m: Mode) => {
    if (m === 'brutal') return '#EF4444'
    if (m === 'iterate') return '#A78BFA'
    if (m === 'product') return '#A78BFA'
    return GOLD
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <Link href="/ai-income" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← 4M</Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize: '14px', fontWeight: 900, color: GOLD, fontFamily: 'Cinzel,Georgia,serif' }}>Coach Manlaw</span>
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '10px' }}>
          Z2B AI · Enforcement Engine
        </span>
      </div>

      {/* Mode tabs */}
      <div style={{ padding: '10px 12px', display: 'flex', gap: '5px', overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setOutput('') }}
            style={{
              padding: '6px 11px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
              border: '1px solid ' + (mode === m.id ? GOLD : 'rgba(255,255,255,0.1)'),
              background: mode === m.id ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: mode === m.id ? GOLD : MUTED,
              fontSize: '11px', fontWeight: 700,
            }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Market selector */}
      <div style={{ padding: '10px 14px', background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.15)', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: GOLD, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '7px' }}>
          🌍 Target Market — adapts everything to your selection
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px' }}>
            <div style={{ fontSize: '10px', color: MUTED, marginBottom: '3px' }}>Market</div>
            <select value={market} onChange={e => setMarket(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', color: W, fontSize: '12px', fontFamily: 'Georgia,serif', outline: 'none' }}>
              {MARKETS.map(mk => <option key={mk} style={{ background: '#1E1245' }}>{mk}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <div style={{ fontSize: '10px', color: MUTED, marginBottom: '3px' }}>Demographic</div>
            <select value={audience} onChange={e => setAudience(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', color: W, fontSize: '12px', fontFamily: 'Georgia,serif', outline: 'none' }}>
              {DEMOGRAPHICS.map(d => <option key={d} style={{ background: '#1E1245' }}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── CHAT ── */}
      {mode === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '14px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: GRAD_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginRight: '8px', color: '#1E1245', fontWeight: 900 }}>M</div>
                )}
                <div style={{
                  maxWidth: '85%', padding: '12px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  background: msg.role === 'user' ? GRAD_PURP : 'rgba(255,255,255,0.06)',
                }}>
                  {msg.role === 'user'
                    ? <div style={{ fontSize: '13px', lineHeight: 1.8, color: W, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    : <MarkdownOutput text={msg.content} accent={GOLD} />
                  }
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', width: 'fit-content' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: GRAD_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E1245', fontWeight: 900 }}>M</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, opacity: 1 }} />
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, opacity: 0.6 }} />
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, opacity: 0.3 }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '8px', flexShrink: 0 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (input.trim()) callAPI('chat')
                }
              }}
              placeholder="Ask Coach Manlaw anything... (Enter to send)"
              rows={2} style={{ ...INP, resize: 'none', flex: 1 }}
            />
            <button onClick={() => input.trim() && callAPI('chat')} disabled={loading || !input.trim()}
              style={{ padding: '0 16px', borderRadius: '10px', border: 'none', background: GRAD_GOLD, color: '#1E1245', fontWeight: 700, cursor: 'pointer', opacity: loading || !input.trim() ? 0.5 : 1 }}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* ── OFFER WRITER ── */}
      {mode === 'offer' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '4px' }}>✍️ Offer Writer</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '16px' }}>13 triggers · Enforcement active · Banned phrases rejected</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <div><Lbl>What are you selling?</Lbl><input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Grade 12 Maths Exam Prep Guide — R199 PDF" style={INP} /></div>
            <div><Lbl>Your ONE buyer (be specific):</Lbl><input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Parent of Grade 12 learner in Gauteng, child failing maths" style={INP} /></div>
            <div><Lbl>Their exact pain:</Lbl>
              <textarea value={painPoints} onChange={e => setPainPoints(e.target.value)} rows={3}
                placeholder="e.g. Child failed 3 tests. Tutors cost R800/session." style={{ ...INP, resize: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={INP} /></div>
              <div><Lbl>Platform</Lbl>
                <select value={platform} onChange={e => setPlatform(e.target.value)} style={INP}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '7px' }}>Triggers (leave empty for all 13):</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {TRIGGERS.map(t => {
                const sel = selTriggers.includes(t.id)
                return (
                  <button key={t.id} onClick={() => setSelTriggers(prev => sel ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                    style={{
                      padding: '5px 10px', borderRadius: '16px', fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                      border: '1px solid ' + (sel ? GOLD : 'rgba(255,255,255,0.12)'),
                      background: sel ? 'rgba(212,175,55,0.2)' : 'transparent',
                      color: sel ? GOLD : MUTED,
                    }}>
                    {t.label}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '5px' }}>
              {selTriggers.length === 0 ? '🔥 All 13 active — maximum power' : String(selTriggers.length) + ' selected'}
            </div>
          </div>
          <SubmitBtn label={loading ? '✍️ Writing...' : '🔥 Write My Offer →'} onClick={() => callAPI('write_offer', { product, price, platform, painPoints, triggers: selTriggers.length ? selTriggers : undefined })} disabled={loading || !product.trim()} bg={GRAD_GOLD} col="#1E1245" />
          <OutCard output={output} accent={GOLD} label="Your Offer" onCopy={copyText} copied={copied} />
        </div>
      )}

      {/* ── PRODUCT CREATOR ── */}
      {mode === 'product' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '4px' }}>📦 Digital Product Creator</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '14px' }}>20 product types · Complete content · Launch copy included</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <div><Lbl>Product topic</Lbl><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. How to start a spaza shop and make R8,000/month" style={INP} /></div>
            <div><Lbl>Who is it for?</Lbl><input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Unemployed person in a township" style={INP} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R299" style={INP} /></div>
              <div><Lbl>Market</Lbl>
                <select value={market} onChange={e => setMarket(e.target.value)} style={INP}>
                  {MARKETS.map(mk => <option key={mk}>{mk}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Lbl>Product Type</Lbl>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    style={{
                      padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: '6px', alignItems: 'center',
                      border: '1px solid ' + (format === f.id ? GOLD : 'rgba(255,255,255,0.1)'),
                      background: format === f.id ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                      color: format === f.id ? GOLD : MUTED,
                    }}>
                    <span>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700 }}>{f.label}</div>
                      <div style={{ fontSize: '9px', color: f.brain.includes('Claude') ? '#A78BFA' : 'rgba(255,255,255,0.3)' }}>{f.brain}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <SubmitBtn label={loading ? '🧠 Creating — 60-90 seconds...' : '📦 Create Complete Product →'} onClick={() => callAPI('create_product', { topic, format, price })} disabled={loading || !topic.trim()} bg={GRAD_PURP} />
          <OutCard output={output} accent="#A78BFA" label="Your Complete Product" onCopy={copyText} copied={copied} />
        </div>
      )}

      {/* ── RESEARCH ── */}
      {mode === 'research' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '4px' }}>🔍 Market Research</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '14px' }}>Top 10 profitable pain points in any market</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><Lbl>Market</Lbl>
                <select value={market} onChange={e => setMarket(e.target.value)} style={INP}>
                  {MARKETS.map(mk => <option key={mk}>{mk}</option>)}
                </select>
              </div>
              <div><Lbl>Category</Lbl><input value={resCategory} onChange={e => setResCategory(e.target.value)} placeholder="Education, Health, Business..." style={INP} /></div>
            </div>
            <div><Lbl>Industry</Lbl>
              <select value={resCategory} onChange={e => setResCategory(e.target.value)} style={INP}>
                {INDUSTRIES.map(ind => <option key={ind}>{ind}</option>)}
              </select>
            </div>
          </div>
          <SubmitBtn label={loading ? '🔍 Scanning market...' : '🔍 Find Top 10 Pain Points →'} onClick={() => callAPI('research_pain_points', { category: resCategory })} disabled={loading} bg="linear-gradient(135deg,#38BDF8,#0891B2)" />
          <OutCard output={output} accent="#38BDF8" label="Market Research Results" onCopy={copyText} copied={copied} />
        </div>
      )}

      {/* ── OBJECTIONS ── */}
      {mode === 'objections' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '4px' }}>💪 Objection Handlers</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '14px' }}>8 complete scripts — turn no into yes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <div><Lbl>Your product</Lbl><input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Z2B Starter Pack, digital guide..." style={INP} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={INP} /></div>
              <div><Lbl>Buyer</Lbl><input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who are you selling to?" style={INP} /></div>
            </div>
          </div>
          <SubmitBtn label={loading ? '💪 Building...' : '💪 Generate 8 Objection Handlers →'} onClick={() => callAPI('objection_handlers', { product, price })} disabled={loading || !product.trim()} bg="linear-gradient(135deg,#6EE7B7,#059669)" col="#1E1245" />
          <OutCard output={output} accent="#6EE7B7" label="Your Closing Arsenal" onCopy={copyText} copied={copied} />
        </div>
      )}

      {/* ── SALES SYSTEM ── */}
      {mode === 'system' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '4px' }}>📢 30-Day Sales System</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '14px' }}>Complete month-long plan — copy-paste ready</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <div><Lbl>Your product</Lbl><input value={product} onChange={e => setProduct(e.target.value)} placeholder="What are you selling?" style={INP} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={INP} /></div>
              <div><Lbl>Market</Lbl>
                <select value={market} onChange={e => setMarket(e.target.value)} style={INP}>
                  {MARKETS.map(mk => <option key={mk}>{mk}</option>)}
                </select>
              </div>
            </div>
          </div>
          <SubmitBtn label={loading ? '📢 Building your system...' : '📢 Build My 30-Day System →'} onClick={() => callAPI('build_sales_system', { product, price })} disabled={loading || !product.trim()} bg="linear-gradient(135deg,#FF6B35,#E55A2B)" />
          <OutCard output={output} accent="#FF6B35" label="Your 30-Day Sales System" onCopy={copyText} copied={copied} />
        </div>
      )}

      {/* ── AUDIT ── */}
      {mode === 'audit' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '4px' }}>📊 What Sells Audit</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '14px' }}>Score your offer: Specific Person + Problem + Promise + Path</div>
          <div style={{ marginBottom: '10px' }}>
            <Lbl>Paste your offer:</Lbl>
            <textarea value={auditCopy} onChange={e => setAuditCopy(e.target.value)} rows={6}
              placeholder="Paste any offer, post, description or sales copy..." style={{ ...INP, resize: 'none' }} />
          </div>
          <SubmitBtn label={loading ? '📊 Auditing...' : '📊 Audit My Offer →'} onClick={() => callAPI('what_sells_audit', { copy: auditCopy })} disabled={loading || !auditCopy.trim()} bg="linear-gradient(135deg,#FF6B35,#E55A2B)" />
          <OutCard output={output} accent="#FF6B35" label="What Sells Audit Report" onCopy={copyText} copied={copied} />
        </div>
      )}

      {/* ── FORMULA ── */}
      {mode === 'formula' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '4px' }}>🔥 Build from the Formula</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '14px' }}>Person + Problem + Promise + Path = Irresistible Offer</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: GOLD, marginBottom: '5px' }}>1. WHO FEELS SEEN?</div>
              <input value={wsPerson} onChange={e => setWsPerson(e.target.value)} placeholder="Single mother in Johannesburg struggling to make rent" style={INP} />
            </div>
            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#FCA5A5', marginBottom: '5px' }}>2. THEIR EXACT PAIN</div>
              <textarea value={wsProblem} onChange={e => setWsProblem(e.target.value)} rows={2}
                placeholder="She works 2 jobs but cannot save because she has no system" style={{ ...INP, resize: 'none' }} />
            </div>
            <div style={{ padding: '12px', background: 'rgba(110,231,183,0.06)', border: '1px solid rgba(110,231,183,0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6EE7B7', marginBottom: '5px' }}>3. THE TRANSFORMATION PROMISE</div>
              <input value={wsPromise} onChange={e => setWsPromise(e.target.value)} placeholder="Save R500 per month in 30 days — guaranteed" style={INP} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><Lbl>Market</Lbl>
                <select value={market} onChange={e => setMarket(e.target.value)} style={INP}>
                  {MARKETS.map(mk => <option key={mk}>{mk}</option>)}
                </select>
              </div>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={INP} /></div>
            </div>
          </div>
          <SubmitBtn label={loading ? '🔥 Building from formula...' : '🔥 Build My Complete Offer →'} onClick={() => callAPI('what_sells_build', { person: wsPerson, problem: wsProblem, promise: wsPromise, price })} disabled={loading || !wsPerson.trim() || !wsProblem.trim() || !wsPromise.trim()} bg={GRAD_GOLD} col="#1E1245" />
          <OutCard output={output} accent={GOLD} label="Your Offer — Built from the Formula" onCopy={copyText} copied={copied} />
        </div>
      )}

      {/* ── BRUTAL AUDIT ── */}
      {mode === 'brutal' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: '#EF4444', marginBottom: '4px' }}>🔴 Brutal Audit — No Filter</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '12px' }}>Score → Expose weaknesses → Rebuild at elite level</div>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            🔴 Brutal score → 🔍 Every banned phrase exposed → 🔧 Failure diagnosed → 🔥 Elite rebuild → ✅ SA skeptic test
          </div>
          <div style={{ marginBottom: '10px' }}>
            <Lbl>Paste any offer — nothing is safe:</Lbl>
            <textarea value={auditCopy} onChange={e => setAuditCopy(e.target.value)} rows={8}
              placeholder="Paste any offer here. Coach Manlaw will expose every weakness and rebuild it." style={{ ...INP, resize: 'none' }} />
          </div>
          <SubmitBtn label={loading ? '🔴 Destroying and rebuilding...' : '🔴 Brutally Audit This Offer →'} onClick={() => callAPI('brutal_audit', { offer: auditCopy })} disabled={loading || !auditCopy.trim()} bg="linear-gradient(135deg,#EF4444,#B91C1C)" />
          <OutCard output={output} accent="#EF4444" label="Brutal Audit + Elite Rebuild" onCopy={copyText} copied={copied} />
        </div>
      )}

      {/* ── ITERATE ── */}
      {mode === 'iterate' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: '#A78BFA', marginBottom: '4px' }}>🔁 Iterate Until It Converts</div>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '14px' }}>Rewrites until 85+ out of 100. Enforcement active on every pass.</div>
          <div style={{ marginBottom: '10px' }}>
            <Lbl>Offer to iterate:</Lbl>
            <textarea value={auditCopy} onChange={e => setAuditCopy(e.target.value)} rows={6}
              placeholder="Paste the offer you want iterated to perfection..." style={{ ...INP, resize: 'none' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '6px' }}>Iterations: {iterRounds}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setIterRounds(n)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                    border: '1px solid ' + (iterRounds === n ? '#A78BFA' : 'rgba(255,255,255,0.1)'),
                    background: iterRounds === n ? 'rgba(167,139,250,0.2)' : 'transparent',
                    color: iterRounds === n ? '#A78BFA' : MUTED,
                  }}>
                  {n}x
                </button>
              ))}
            </div>
          </div>
          <SubmitBtn label={loading ? '🔁 Iterating ' + String(iterRounds) + 'x...' : '🔁 Iterate ' + String(iterRounds) + 'x — Force 85+ →'} onClick={() => callAPI('iterate', { offer: auditCopy, rounds: iterRounds })} disabled={loading || !auditCopy.trim()} bg="linear-gradient(135deg,#7C3AED,#4C1D95)" />
          <OutCard output={output} accent="#A78BFA" label={'Final Offer — ' + String(iterRounds) + 'x Iterated'} onCopy={copyText} copied={copied} />
        </div>
      )}

    </div>
  )
}

export default function CoachManlaw() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0D0820', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif' }}>Loading Coach Manlaw...</div>}>
      <ManLawInner />
    </Suspense>
  )
}
