'use client' // clean-171548 // market-fix-113323
// FILE: app/ai-income/coach/page.tsx // global-v20260429_101933

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const PURP = '#7C3AED'
const W    = '#F0EEF8'

// ── Structured output renderer ────────────────────────────────────────────────
function MarkdownOutput({ text, accent = GOLD }: { text: string; accent?: string }) {
  if (!text) return null
  const lines = text.split('\n')
  const els: React.ReactNode[] = []
  let bullets: string[] = []

  const flush = (k: string) => {
    if (!bullets.length) return
    els.push(
      <ul key={k} style={{ margin:'6px 0 12px', padding:0, listStyle:'none' }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'5px' }}>
            <span style={{ color:accent, flexShrink:0, fontWeight:700, fontSize:'13px' }}>→</span>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.82)', lineHeight:1.75 }}>{b}</span>
          </li>
        ))}
      </ul>
    )
    bullets = []
  }

  lines.forEach((line, i) => {
    const t = line.trim()
    if (!t) { flush(`f${i}`); return }

    if (t.startsWith('## ')) {
      flush(`f${i}`)
      els.push(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', margin:'16px 0 6px',
          padding:'10px 14px', background:`${accent}14`, border:`1px solid ${accent}35`,
          borderRadius:'10px', fontSize:'13px', fontWeight:900, color:accent, fontFamily:'Cinzel,Georgia,serif' }}>
          {t.replace(/^##\s*/, '')}
        </div>
      )
      return
    }

    if (t.startsWith('### ')) {
      flush(`f${i}`)
      els.push(<div key={i} style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'1px', textTransform:'uppercase', marginTop:'12px', marginBottom:'3px' }}>
        {t.replace(/^###\s*/, '')}</div>)
      return
    }

    if (t.match(/^[-*•]\s/)) {
      bullets.push(t.replace(/^[-*•]\s/, ''))
      return
    }

    if (t.match(/\d+\s*\/\s*\d+/) && t.length < 80) {
      flush(`f${i}`)
      const score = t.match(/(\d+)\s*\/\s*(\d+)/)?.[0] || ''
      const [n, d] = score.split('/').map(Number)
      const col = Math.round(n/d*100) >= 80 ? '#6EE7B7' : Math.round(n/d*100) >= 60 ? '#FCD34D' : '#EF4444'
      els.push(
        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', background:'rgba(255,255,255,0.04)', borderRadius:'8px', marginBottom:'4px' }}>
          <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{t.replace(/\d+\s*\/\s*\d+/, '').trim()}</span>
          <span style={{ fontSize:'13px', fontWeight:900, color:col }}>{score}</span>
        </div>
      )
      return
    }

    if (t.startsWith('---') || t.startsWith('═══')) {
      flush(`f${i}`)
      els.push(<div key={i} style={{ height:'1px', background:'rgba(255,255,255,0.08)', margin:'12px 0' }} />)
      return
    }

    flush(`f${i}`)
    if (t.includes('**')) {
      const parts = t.split(/\*\*/)
      els.push(
        <p key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.78)', lineHeight:1.85, margin:'3px 0' }}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color:W }}>{p}</strong> : <span key={j}>{p}</span>)}
        </p>
      )
    } else {
      els.push(<p key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)', lineHeight:1.85, margin:'3px 0' }}>{t}</p>)
    }
  })
  flush('final')
  return <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>{els}</div>
}

// ── Constants ─────────────────────────────────────────────────────────────────
const TRIGGERS = [
  { id:'fomo',      label:'FOMO' },
  { id:'social',    label:'Social Proof' },
  { id:'authority', label:'Authority' },
  { id:'scarcity',  label:'Scarcity' },
  { id:'recip',     label:'Reciprocity' },
  { id:'curiosity', label:'Curiosity Gap' },
  { id:'pain',      label:'Pain Agitation' },
  { id:'transform', label:'Transformation' },
  { id:'specific',  label:'Specificity' },
  { id:'relate',    label:'Relatability' },
  { id:'risk',      label:'Risk Reversal' },
  { id:'anchor',    label:'Anchoring' },
  { id:'identity',  label:'Identity' },
]

const PLATFORMS = ['WhatsApp','Facebook','TikTok','Email','DM','Sales Page','Instagram','LinkedIn']

const FORMATS = [
  { id:'ebook',       icon:'📖', label:'eBook',             brain:'Z2B AI' },
  { id:'course',      icon:'🎓', label:'Online Course',      brain:'Z2B AI' },
  { id:'community',   icon:'👥', label:'Community Blueprint',brain:'Z2B AI' },
  { id:'guide',       icon:'🗺️', label:'Step-by-Step Guide', brain:'Z2B AI' },
  { id:'software',    icon:'💻', label:'Software / App',     brain:'Z2B AI Engine' },
  { id:'planner',     icon:'📅', label:'Planner / Journal',  brain:'Z2B AI' },
  { id:'template',    icon:'📋', label:'Printable Template', brain:'Z2B AI' },
  { id:'card',        icon:'🃏', label:'Card Deck',          brain:'Z2B AI' },
  { id:'curriculum',  icon:'🏫', label:'Curriculum',         brain:'Z2B AI' },
  { id:'lesson',      icon:'📚', label:'Lesson Plan',        brain:'Z2B AI' },
  { id:'toolkit',     icon:'🧰', label:'Toolkit Bundle',     brain:'Z2B AI' },
  { id:'checklist',   icon:'✅', label:'Checklist',          brain:'Z2B AI' },
  { id:'workbook',    icon:'📓', label:'Workbook',           brain:'Z2B AI' },
  { id:'mini_course', icon:'⚡', label:'Mini-Course',        brain:'Z2B AI' },
  { id:'swipe_file',  icon:'📂', label:'Swipe File',         brain:'Z2B AI' },
  { id:'script',      icon:'🎬', label:'Video Scripts',      brain:'Z2B AI' },
  { id:'blueprint',   icon:'🏗️', label:'Blueprint',          brain:'Z2B AI' },
  { id:'masterclass', icon:'🏆', label:'Masterclass',        brain:'Z2B AI' },
  { id:'printable',   icon:'🖨️', label:'Printable Pack',     brain:'Z2B AI' },
]

const MARKETS = [
  // 🌍 Global
  'Global (All Markets)',
  // 🌍 Africa
  'South Africa','Nigeria','Kenya','Ghana','Ethiopia','Tanzania','Uganda','Zambia',
  'Zimbabwe','Senegal','Cameroon','Ivory Coast','Rwanda','Botswana','Namibia',
  // 🇬🇧 Europe
  'United Kingdom','Germany','Netherlands','France','Spain','Italy','Sweden','Portugal',
  // 🇺🇸 Americas
  'United States','Canada','Brazil','Mexico','Jamaica','Trinidad and Tobago',
  // 🌏 Asia Pacific
  'India','Philippines','Australia','New Zealand','Singapore','Malaysia',
  // 🌍 Middle East
  'UAE','Saudi Arabia','Qatar',
]

const DEMOGRAPHICS = [
  'All demographics',
  // Employment
  'Employees (any sector)','Corporate employees','Government employees','Healthcare workers',
  'Teachers and educators','Nurses and doctors','Engineers','Accountants and finance',
  // Business
  'Small business owners','Solopreneurs','Freelancers','Side-hustlers',
  // Life stage
  'Young adults (18-30)','Parents','Single mothers','Single fathers','Couples',
  'University students','Recent graduates','Retirees (50+)',
  // Income
  'Low-income earners','Middle-income earners','High-income earners',
  // Gender
  'Women','Men',
  // Aspiration
  'First-time entrepreneurs','Network marketers','Digital creators','Coaches',
]

const INDUSTRIES = [
  'All industries','Education','Healthcare','Finance and banking','Real estate',
  'Food and hospitality','Retail and e-commerce','Technology','Creative arts',
  'Sports and fitness','Faith and ministry','Legal','Agriculture','Construction',
  'Beauty and fashion','Automotive','Travel and tourism',
]

type Mode = 'chat'|'offer'|'product'|'objections'|'research'|'system'|'audit'|'formula'|'brutal'|'iterate'

const MODES: { id: Mode; icon: string; label: string }[] = [
  { id:'chat',       icon:'💬', label:'Coach' },
  { id:'offer',      icon:'✍️', label:'Write Offer' },
  { id:'product',    icon:'📦', label:'Create Product' },
  { id:'research',   icon:'🔍', label:'Research' },
  { id:'objections', icon:'💪', label:'Objections' },
  { id:'system',     icon:'📢', label:'Sales System' },
  { id:'audit',      icon:'📊', label:'Audit Offer' },
  { id:'formula',    icon:'🔥', label:'Formula Builder' },
  { id:'brutal',     icon:'🔴', label:'Brutal Audit' },
  { id:'iterate',    icon:'🔁', label:'Iterate' },
]

function ManLawInner() {
  const [mode,        setMode]        = useState<Mode>('chat')
  const [messages,    setMessages]    = useState<{ role: string; content: string }[]>([])
  const [input,       setInput]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [output,      setOutput]      = useState('')
  const [copied,      setCopied]      = useState(false)
  const [builderTier, setBuilderTier] = useState('starter')
  const bottomRef = useRef<HTMLDivElement>(null)

  const [product,     setProduct]     = useState('')
  const [audience,    setAudience]    = useState('All demographics')
  const [price,       setPrice]       = useState('R199')
  const [platform,    setPlatform]    = useState('WhatsApp')
  const [painPoints,  setPainPoints]  = useState('')
  const [selTriggers, setSelTriggers] = useState<string[]>([])
  const [topic,       setTopic]       = useState('')
  const [format,      setFormat]      = useState('guide')
  const [market,      setMarket]      = useState('Global (All Markets)')
  const [resCategory, setResCategory] = useState('All industries')
  const [auditCopy,   setAuditCopy]   = useState('')
  const [wsPerson,    setWsPerson]    = useState('')
  const [wsProblem,   setWsProblem]   = useState('')
  const [wsPromise,   setWsPromise]   = useState('')
  const [iterRounds,  setIterRounds]  = useState(2)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', user.id).single()
        setBuilderTier(prof?.paid_tier || 'starter')
      }
    })
    setMessages([{ role:'assistant', content:`## Welcome, Builder

I am Coach Manlaw — the AI business coach for Z2B Legacy Builders.

**Z2B is a global platform.** I work with builders across South Africa, Nigeria, Kenya, the UK, USA, Canada, Australia and beyond. Tell me your market and I adapt everything — currency, payment methods, cultural references, platform strategy.

**My enforcement engine is active:**
- Banned generic phrases auto-rejected
- Every offer scores 80+/100 before reaching you
- Copy adapts to YOUR specific market and demographic
- No American internet marketing templates

**Set your market first, then choose a mode.** What are we building today?` }])
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, output])

  const callAPI = async (action: string, extra?: Record<string, unknown>) => {
    setLoading(true)
    setOutput('')
    try {
      const body = { action, builderTier, ...extra }
      if (action === 'chat') {
        const newMsgs = [...messages, { role:'user', content: input }]
        setMessages(newMsgs)
        setInput('')
        const res  = await fetch('/api/coach-manlaw', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ ...body, messages: newMsgs }) })
        const data = await res.json()
        setMessages(prev => [...prev, { role:'assistant', content: data.reply || data.error || 'Error. Try again.' }])
      } else {
        const res  = await fetch('/api/coach-manlaw', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
        const data = await res.json()
        const result = data.copy || data.productContent || data.handlers || data.research || data.system || data.audit || data.built || data.finalOffer || data.error || ''
        const extra2 = data.launchCopy ? '\n\n---\n\n## LAUNCH COPY\n\n' + data.launchCopy : ''
        setOutput(result + extra2)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error'
      if (action === 'chat') setMessages(prev => [...prev, { role:'assistant', content:'Something went wrong. Try again.' }])
      else setOutput('Error: ' + msg)
    }
    setLoading(false)
  }

  const copyText = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const inp: React.CSSProperties = {
    width:'100%', padding:'10px 12px',
    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)',
    borderRadius:'10px', color:W, fontSize:'13px', fontFamily:'Georgia,serif',
    outline:'none', boxSizing:'border-box',
  }

  const submitBtn = (bg: string, col = '#fff', disabled = false): React.CSSProperties => ({
    padding:'12px 18px', borderRadius:'10px', border:'none', background: disabled ? 'rgba(255,255,255,0.1)' : bg,
    color: disabled ? 'rgba(255,255,255,0.3)' : col, fontWeight:700, fontSize:'13px',
    cursor: disabled ? 'not-allowed' : 'pointer', width:'100%', fontFamily:'Georgia,serif',
    marginBottom:'14px',
  })

  const Lbl = ({ children }: { children: string }) => (
    <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>{children}</label>
  )

  const OutCard = ({ accent = GOLD, label }: { accent?: string; label: string }) => !output ? null : (
    <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}25`, borderRadius:'14px', padding:'16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:accent }}>{label}</div>
        <button onClick={() => copyText(output)}
          style={{ padding:'5px 12px', background:`${accent}20`, border:`1px solid ${accent}40`, borderRadius:'8px', color:accent, fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
          {copied ? '✅ Copied' : '📋 Copy All'}
        </button>
      </div>
      <MarkdownOutput text={output} accent={accent} />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', flexDirection:'column' }}>

      {/* Nav */}
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
        <Link href="/ai-income" style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← 4M</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize:'14px', fontWeight:900, color:GOLD, fontFamily:'Cinzel,Georgia,serif' }}>Coach Manlaw</span>
        <span style={{ marginLeft:'auto', fontSize:'10px', color:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:'10px' }}>
          Z2B AI · Enforcement Engine
        </span>
      </div>

      {/* Mode tabs */}
      <div style={{ padding:'10px 12px', display:'flex', gap:'5px', overflowX:'auto', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setOutput('') }}
            style={{ padding:'6px 11px', borderRadius:'20px', cursor:'pointer', whiteSpace:'nowrap',
              border:`1px solid ${mode===m.id ? GOLD : 'rgba(255,255,255,0.1)'}`,
              background: mode===m.id ? `${GOLD}18` : 'transparent',
              color: mode===m.id ? GOLD : 'rgba(255,255,255,0.5)',
              fontSize:'11px', fontWeight:700 }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ── Global Market + Demographic Selector — always visible ── */}
      <div style={{ padding:'10px 14px', background:'rgba(212,175,55,0.06)', borderBottom:'1px solid rgba(212,175,55,0.15)', flexShrink:0 }}>
        <div style={{ fontSize:'10px', fontWeight:700, color:GOLD, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'7px' }}>
          🌍 Target Market — Coach Manlaw adapts everything to your selection
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <div style={{ flex:'1 1 160px' }}>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', marginBottom:'3px' }}>🌍 Market / Country</div>
            <select value={market} onChange={e => setMarket(e.target.value)}
              style={{ width:'100%', padding:'7px 10px', background:'rgba(255,255,255,0.08)', border:`1px solid ${GOLD}40`, borderRadius:'8px', color:W, fontSize:'12px', fontFamily:'Georgia,serif', outline:'none' }}>
              {MARKETS.map(m => <option key={m} style={{ background:'#1E1245' }}>{m}</option>)}
            </select>
          </div>
          <div style={{ flex:'1 1 160px' }}>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', marginBottom:'3px' }}>👥 Demographic</div>
            <select value={audience} onChange={e => setAudience(e.target.value)}
              style={{ width:'100%', padding:'7px 10px', background:'rgba(255,255,255,0.08)', border:`1px solid ${GOLD}40`, borderRadius:'8px', color:W, fontSize:'12px', fontFamily:'Georgia,serif', outline:'none' }}>
              {DEMOGRAPHICS.map(d => <option key={d} style={{ background:'#1E1245' }}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── CHAT ── */}
      {mode === 'chat' && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom:'14px', display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`linear-gradient(135deg,${GOLD},#B8860B)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0, marginRight:'8px' }}>M</div>
                )}
                <div style={{ maxWidth:'85%', padding:'12px 14px',
                  borderRadius: msg.role==='user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  background: msg.role==='user' ? `linear-gradient(135deg,${PURP},#4C1D95)` : 'rgba(255,255,255,0.06)' }}>
                  {msg.role === 'user'
                    ? <div style={{ fontSize:'13px', lineHeight:1.8, color:W, whiteSpace:'pre-wrap' }}>{msg.content}</div>
                    : <MarkdownOutput text={msg.content} accent={GOLD} />
                  }
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:'8px', alignItems:'center', padding:'10px 14px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', width:'fit-content' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`linear-gradient(135deg,${GOLD},#B8860B)`, display:'flex', alignItems:'center', justifyContent:'center' }}>M</div>
                <div style={{ display:'flex', gap:'4px' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:'7px', height:'7px', borderRadius:'50%', background:GOLD, animation:`pulse 1.2s ${i*0.3}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:'8px', flexShrink:0 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); if(input.trim()) callAPI('chat') } }}
              placeholder="Ask Coach Manlaw anything... (Enter to send)"
              rows={2} style={{ ...inp, resize:'none', flex:1 }} />
            <button onClick={() => input.trim() && callAPI('chat')} disabled={loading || !input.trim()}
              style={{ padding:'0 16px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:'#1E1245', fontWeight:700, cursor:'pointer', opacity: loading||!input.trim() ? 0.5 : 1 }}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* ── OFFER WRITER ── */}
      {mode === 'offer' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>✍️ World-Class Offer Writer</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>13 triggers · Enforcement active · Banned phrases rejected</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div><Lbl>What are you selling?</Lbl><input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Grade 12 Maths Exam Prep Guide — R199 PDF" style={inp} /></div>
            <div><Lbl>Your ONE buyer (be specific):</Lbl><input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Parent of Grade 12 learner in Gauteng, child failing maths, exams in 8 weeks" style={inp} /></div>
            <div><Lbl>Their exact pain (be brutal):</Lbl>
              <textarea value={painPoints} onChange={e => setPainPoints(e.target.value)} rows={3}
                placeholder="e.g. Child failed 3 tests. Tutors cost R800/session. Matric results affect university entrance. Parent feels like a failure." style={{ ...inp, resize:'none' }} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={inp} /></div>
              <div><Lbl>Platform</Lbl>
                <select value={platform} onChange={e => setPlatform(e.target.value)} style={inp}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{ marginBottom:'14px' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'7px' }}>Triggers (leave empty for all 13):</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
              {TRIGGERS.map(t => {
                const sel = selTriggers.includes(t.id)
                return (
                  <button key={t.id} onClick={() => setSelTriggers(prev => sel ? prev.filter(x=>x!==t.id) : [...prev, t.id])}
                    style={{ padding:'5px 10px', borderRadius:'16px', fontSize:'10px', fontWeight:700, cursor:'pointer',
                      border:`1px solid ${sel ? GOLD : 'rgba(255,255,255,0.12)'}`,
                      background: sel ? `${GOLD}20` : 'transparent', color: sel ? GOLD : 'rgba(255,255,255,0.45)' }}>
                    {t.label}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', marginTop:'5px' }}>
              {selTriggers.length === 0 ? '🔥 All 13 active — maximum power' : `${selTriggers.length} selected`}
            </div>
          </div>
          <button onClick={() => callAPI('write_offer', { product, audience, price, platform, painPoints, format:'full offer', triggers: selTriggers.length ? selTriggers : undefined })}
            disabled={loading || !product.trim()}
            style={submitBtn(`linear-gradient(135deg,${GOLD},#B8860B)`, '#1E1245', loading || !product.trim())}>
            {loading ? '✍️ Writing — enforcement running...' : '🔥 Write My Offer →'}
          </button>
          <OutCard label="Your Offer — Structured Output" accent={GOLD} />
        </div>
      )}

      {/* ── PRODUCT CREATOR ── */}
      {mode === 'product' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>📦 Digital Product Creator</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>20 product types · Complete content · Launch copy included</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div><Lbl>Product topic / pain point</Lbl><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. How to start a spaza shop and make R8,000/month" style={inp} /></div>
            <div><Lbl>Who is it for?</Lbl><input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Unemployed person in a community, no business experience" style={inp} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              <div><Lbl>Market</Lbl><select value={market} onChange={e => setMarket(e.target.value)} style={inp}>{MARKETS.map(m => <option key={m}>{m}</option>)}</select></div>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R299" style={inp} /></div>
            </div>
            <div>
              <Lbl>Product Type</Lbl>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    style={{ padding:'8px 10px', borderRadius:'8px', cursor:'pointer', textAlign:'left', display:'flex', gap:'6px', alignItems:'center',
                      border:`1px solid ${format===f.id ? GOLD : 'rgba(255,255,255,0.1)'}`,
                      background: format===f.id ? `${GOLD}18` : 'rgba(255,255,255,0.03)',
                      color: format===f.id ? GOLD : 'rgba(255,255,255,0.5)' }}>
                    <span>{f.icon}</span>
                    <div>
                      <div style={{ fontSize:'11px', fontWeight:700 }}>{f.label}</div>
                      <div style={{ fontSize:'9px', color: f.brain.includes('Claude') ? '#A78BFA' : 'rgba(255,255,255,0.3)', fontWeight:400 }}>{f.brain}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => callAPI('create_product', { topic, audience, format, market, price })}
            disabled={loading || !topic.trim()}
            style={submitBtn(`linear-gradient(135deg,#7C3AED,${PURP})`, '#fff', loading || !topic.trim())}>
            {loading ? '🧠 Creating — 60-90 seconds...' : '📦 Create Complete Product →'}
          </button>
          <OutCard label="Your Complete Product" accent="#A78BFA" />
        </div>
      )}

      {/* ── RESEARCH ── */}
      {mode === 'research' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>🔍 Market Research</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>Top 10 profitable pain points in any market</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div><Lbl>Market</Lbl><select value={market} onChange={e => setMarket(e.target.value)} style={inp}>{MARKETS.map(m => <option key={m}>{m}</option>)}</select></div>
              <div><Lbl>Category</Lbl><input value={resCategory} onChange={e => setResCategory(e.target.value)} placeholder="Education, Health, Business..." style={inp} /></div>
            </div>
            <div>
              <Lbl>Demographic (already set above or customise here)</Lbl>
              <select value={audience} onChange={e => setAudience(e.target.value)} style={inp}>
                {DEMOGRAPHICS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <Lbl>Industry / Category</Lbl>
              <select value={resCategory} onChange={e => setResCategory(e.target.value)} style={inp}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => callAPI('research_pain_points', { market, category:resCategory, demographic:audience })}
            disabled={loading}
            style={submitBtn('linear-gradient(135deg,#38BDF8,#0891B2)', '#fff', loading)}>
            {loading ? '🔍 Scanning market...' : '🔍 Find Top 10 Pain Points →'}
          </button>
          <OutCard label="Market Research Results" accent="#38BDF8" />
        </div>
      )}

      {/* ── OBJECTIONS ── */}
      {mode === 'objections' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>💪 Objection Handlers</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>8 complete scripts — turn no into yes</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div><Lbl>Your product</Lbl><input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Z2B Starter Pack, digital guide, coaching..." style={inp} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={inp} /></div>
              <div><Lbl>Buyer</Lbl><input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who are you selling to?" style={inp} /></div>
            </div>
          </div>
          <button onClick={() => callAPI('objection_handlers', { product, price, audience })}
            disabled={loading || !product.trim()}
            style={submitBtn('linear-gradient(135deg,#6EE7B7,#059669)', '#1E1245', loading || !product.trim())}>
            {loading ? '💪 Building...' : '💪 Generate 8 Objection Handlers →'}
          </button>
          <OutCard label="Your Closing Arsenal — 8 Objections" accent="#6EE7B7" />
        </div>
      )}

      {/* ── SALES SYSTEM ── */}
      {mode === 'system' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>📢 30-Day Sales System</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>Complete month-long plan — copy-paste ready</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div><Lbl>Your product</Lbl><input value={product} onChange={e => setProduct(e.target.value)} placeholder="What are you selling?" style={inp} /></div>
            <div><Lbl>Target audience</Lbl><input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who is your buyer?" style={inp} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={inp} /></div>
              <div><Lbl>Market</Lbl><select value={market} onChange={e => setMarket(e.target.value)} style={inp}>{MARKETS.map(m => <option key={m}>{m}</option>)}</select></div>
            </div>
          </div>
          <button onClick={() => callAPI('build_sales_system', { product, audience, price, market })}
            disabled={loading || !product.trim()}
            style={submitBtn('linear-gradient(135deg,#FF6B35,#E55A2B)', '#fff', loading || !product.trim())}>
            {loading ? '📢 Building your system...' : '📢 Build My 30-Day System →'}
          </button>
          <OutCard label="Your 30-Day Sales System" accent="#FF6B35" />
        </div>
      )}

      {/* ── AUDIT ── */}
      {mode === 'audit' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>📊 What Sells Audit</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>Score: Specific Person + Problem + Promise + Path (out of 100)</div>
          <div style={{ marginBottom:'10px' }}>
            <Lbl>Paste your offer:</Lbl>
            <textarea value={auditCopy} onChange={e => setAuditCopy(e.target.value)} rows={6}
              placeholder="Paste any offer, post, description or sales copy..." style={{ ...inp, resize:'none' }} />
          </div>
          <button onClick={() => callAPI('what_sells_audit', { copy:auditCopy })}
            disabled={loading || !auditCopy.trim()}
            style={submitBtn('linear-gradient(135deg,#FF6B35,#E55A2B)', '#fff', loading || !auditCopy.trim())}>
            {loading ? '📊 Auditing...' : '📊 Audit My Offer →'}
          </button>
          <OutCard label="What Sells Audit Report" accent="#FF6B35" />
        </div>
      )}

      {/* ── FORMULA ── */}
      {mode === 'formula' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>🔥 Build from the Formula</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>Person + Problem + Promise + Path = Irresistible Offer</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div style={{ padding:'12px', background:`${GOLD}08`, border:`1px solid ${GOLD}20`, borderRadius:'10px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:GOLD, marginBottom:'5px' }}>1. WHO FEELS SEEN?</div>
              <input value={wsPerson} onChange={e => setWsPerson(e.target.value)}
                placeholder="Single mother in Johannesburg struggling to make rent every month" style={inp} />
            </div>
            <div style={{ padding:'12px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#FCA5A5', marginBottom:'5px' }}>2. THEIR EXACT PAIN</div>
              <textarea value={wsProblem} onChange={e => setWsProblem(e.target.value)} rows={2}
                placeholder="She works 2 jobs but cannot save because she has no system for managing her income"
                style={{ ...inp, resize:'none' }} />
            </div>
            <div style={{ padding:'12px', background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'10px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#6EE7B7', marginBottom:'5px' }}>3. THE TRANSFORMATION PROMISE</div>
              <input value={wsPromise} onChange={e => setWsPromise(e.target.value)}
                placeholder="Save R500 per month in 30 days on her current income — guaranteed" style={inp} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div><Lbl>Market</Lbl><select value={market} onChange={e => setMarket(e.target.value)} style={inp}>{MARKETS.map(m => <option key={m}>{m}</option>)}</select></div>
              <div><Lbl>Price</Lbl><input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={inp} /></div>
            </div>
          </div>
          <button onClick={() => callAPI('what_sells_build', { person:wsPerson, problem:wsProblem, promise:wsPromise, market, price })}
            disabled={loading || !wsPerson.trim() || !wsProblem.trim() || !wsPromise.trim()}
            style={submitBtn(`linear-gradient(135deg,${GOLD},#B8860B)`, '#1E1245', loading || !wsPerson.trim())}>
            {loading ? '🔥 Building from the formula...' : '🔥 Build My Complete Offer →'}
          </button>
          <OutCard label="Your Offer — Built from the Formula" accent={GOLD} />
        </div>
      )}

      {/* ── BRUTAL AUDIT ── */}
      {mode === 'brutal' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:'#EF4444', marginBottom:'4px' }}>🔴 Brutal Audit — No Filter</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'12px' }}>Score → Expose weaknesses → Rebuild at elite level</div>
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'12px', marginBottom:'14px', fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.8 }}>
            🔴 Brutal score → 🔍 Every banned phrase exposed → 🔧 Failure diagnosed → 🔥 Elite rebuild → ✅ SA skeptic test
          </div>
          <div style={{ marginBottom:'10px' }}>
            <Lbl>Paste any offer — nothing is safe:</Lbl>
            <textarea value={auditCopy} onChange={e => setAuditCopy(e.target.value)} rows={8}
              placeholder="Paste any offer here. Coach Manlaw will expose every weakness and rebuild it." style={{ ...inp, resize:'none' }} />
          </div>
          <button onClick={() => callAPI('brutal_audit', { offer:auditCopy })}
            disabled={loading || !auditCopy.trim()}
            style={submitBtn('linear-gradient(135deg,#EF4444,#B91C1C)', '#fff', loading || !auditCopy.trim())}>
            {loading ? '🔴 Destroying and rebuilding...' : '🔴 Brutally Audit This Offer →'}
          </button>
          <OutCard label="Brutal Audit + Elite Rebuild" accent="#EF4444" />
        </div>
      )}

      {/* ── ITERATE ── */}
      {mode === 'iterate' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:'#A78BFA', marginBottom:'4px' }}>🔁 Iterate Until It Converts</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>Rewrites until 85+ out of 100. Enforcement active on every pass.</div>
          <div style={{ marginBottom:'10px' }}>
            <Lbl>Offer to iterate:</Lbl>
            <textarea value={auditCopy} onChange={e => setAuditCopy(e.target.value)} rows={6}
              placeholder="Paste the offer you want iterated to perfection..." style={{ ...inp, resize:'none' }} />
          </div>
          <div style={{ marginBottom:'12px' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}>Iterations: {iterRounds}</div>
            <div style={{ display:'flex', gap:'6px' }}>
              {[1,2,3].map(n => (
                <button key={n} onClick={() => setIterRounds(n)}
                  style={{ flex:1, padding:'8px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:700,
                    border:`1px solid ${iterRounds===n ? '#A78BFA' : 'rgba(255,255,255,0.1)'}`,
                    background: iterRounds===n ? 'rgba(167,139,250,0.2)' : 'transparent',
                    color: iterRounds===n ? '#A78BFA' : 'rgba(255,255,255,0.4)' }}>
                  {n}x
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => callAPI('iterate', { offer:auditCopy, rounds:iterRounds })}
            disabled={loading || !auditCopy.trim()}
            style={submitBtn('linear-gradient(135deg,#7C3AED,#4C1D95)', '#fff', loading || !auditCopy.trim())}>
            {loading ? `🔁 Iterating ${iterRounds}x...` : `🔁 Iterate ${iterRounds}x — Force 85+ →`}
          </button>
          <OutCard label={`Final Offer — ${iterRounds}x Iterated`} accent="#A78BFA" />
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}`}</style>
    </div>
  )
}

export default function CoachManlaw() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading Coach Manlaw...</div>}>
      <ManLawInner />
    </Suspense>
  )
}
