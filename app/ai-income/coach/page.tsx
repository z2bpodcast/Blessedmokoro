'use client' // rebuilt 20260429_090324
// FILE: app/ai-income/coach/page.tsx
// Coach Manlaw — World-Class AI Business Coach + Copywriter + Product Creator

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const PURP = '#7C3AED'
const W    = '#F0EEF8'


// ── Beautiful structured output renderer ─────────────────────────────────────
function MarkdownOutput({ text, accent = GOLD }: { text: string; accent?: string }) {
  if (!text) return null

  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let bulletBuffer: string[] = []

  const flushBullets = (key: string) => {
    if (bulletBuffer.length > 0) {
      elements.push(
        <ul key={key} style={{ margin:'6px 0 12px 0', paddingLeft:'0', listStyle:'none' }}>
          {bulletBuffer.map((b, i) => (
            <li key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'5px', fontSize:'12px', color:'rgba(255,255,255,0.8)', lineHeight:1.7 }}>
              <span style={{ color:accent, flexShrink:0, marginTop:'2px' }}>→</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )
      bulletBuffer = []
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushBullets(`flush-${i}`)
      return
    }

    // H2 headers: ## 🎯 OFFER TITLE
    if (trimmed.startsWith('## ')) {
      flushBullets(`flush-${i}`)
      const headerText = trimmed.replace(/^##\s*/, '')
      elements.push(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', margin:'16px 0 6px', padding:'8px 12px',
          background:`${accent}12`, border:`1px solid ${accent}30`, borderRadius:'10px',
          fontSize:'13px', fontWeight:900, color:accent, fontFamily:'Cinzel,Georgia,serif' }}>
          {headerText}
        </div>
      )
      return
    }

    // H3 headers: ### text
    if (trimmed.startsWith('### ')) {
      flushBullets(`flush-${i}`)
      elements.push(
        <div key={i} style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.6)', letterSpacing:'1px', textTransform:'uppercase', marginTop:'12px', marginBottom:'4px' }}>
          {trimmed.replace(/^###\s*/, '')}
        </div>
      )
      return
    }

    // Bullet points: - or * or →
    if (trimmed.match(/^[-*→•]\s/)) {
      bulletBuffer.push(trimmed.replace(/^[-*→•]\s/, ''))
      return
    }

    // Score line: contains X/25 or X/100
    if (trimmed.match(/\d+\s*\/\s*\d+/)) {
      flushBullets(`flush-${i}`)
      const score = trimmed.match(/(\d+)\s*\/\s*(\d+)/)?.[0] || ''
      const num   = parseInt(score.split('/')[0])
      const den   = parseInt(score.split('/')[1])
      const pct   = Math.round(num/den*100)
      const scoreColor = pct >= 80 ? '#6EE7B7' : pct >= 60 ? '#FCD34D' : '#EF4444'
      elements.push(
        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', background:'rgba(255,255,255,0.04)', borderRadius:'8px', marginBottom:'4px' }}>
          <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{trimmed.replace(/\d+\s*\/\s*\d+/, '').trim()}</span>
          <span style={{ fontSize:'13px', fontWeight:900, color:scoreColor }}>{score}</span>
        </div>
      )
      return
    }

    // Bold text: **text**
    if (trimmed.includes('**')) {
      flushBullets(`flush-${i}`)
      const parts = trimmed.split(/\*\*/)
      elements.push(
        <p key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)', lineHeight:1.8, margin:'4px 0' }}>
          {parts.map((p, j) => j % 2 === 1
            ? <strong key={j} style={{ color:W, fontWeight:700 }}>{p}</strong>
            : <span key={j}>{p}</span>
          )}
        </p>
      )
      return
    }

    // Horizontal rule
    if (trimmed.startsWith('---') || trimmed.startsWith('═══')) {
      flushBullets(`flush-${i}`)
      elements.push(<div key={i} style={{ height:'1px', background:'rgba(255,255,255,0.08)', margin:'12px 0' }} />)
      return
    }

    // Regular paragraph
    flushBullets(`flush-${i}`)
    elements.push(
      <p key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)', lineHeight:1.85, margin:'4px 0' }}>
        {trimmed}
      </p>
    )
  })

  flushBullets('final')

  return <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>{elements}</div>
}

const TRIGGERS = [
  { id:'fomo',      label:'FOMO',            desc:'Fear of Missing Out' },
  { id:'social',    label:'Social Proof',    desc:'Others are winning' },
  { id:'authority', label:'Authority',       desc:'Establish credibility' },
  { id:'scarcity',  label:'Scarcity',        desc:'Limited time/spots' },
  { id:'recip',     label:'Reciprocity',     desc:'Give first' },
  { id:'curiosity', label:'Curiosity Gap',   desc:'Open irresistible loops' },
  { id:'pain',      label:'Pain Agitation',  desc:'Go deep on the problem' },
  { id:'transform', label:'Transformation',  desc:'Before → After promise' },
  { id:'specific',  label:'Specificity',     desc:'Exact numbers & facts' },
  { id:'relate',    label:'Relatability',    desc:'"I was like you"' },
  { id:'risk',      label:'Risk Reversal',   desc:'Eliminate fear of buying' },
  { id:'anchor',    label:'Anchoring',       desc:'Price comparison' },
  { id:'identity',  label:'Identity',        desc:'Belonging & status' },
]

const PLATFORMS = ['WhatsApp','Facebook','TikTok','Email','DM','Sales Page','Instagram','LinkedIn']
const FORMATS: {id:string,icon:string,label:string,brain:string}[] = [
  {id:'ebook',      icon:'📖', label:'eBook',                brain:'GPT-4o'},
  {id:'course',     icon:'🎓', label:'Online Course',         brain:'GPT-4o'},
  {id:'community',  icon:'👥', label:'Community Blueprint',   brain:'GPT-4o'},
  {id:'guide',      icon:'🗺️', label:'Step-by-Step Guide',    brain:'GPT-4o'},
  {id:'software',   icon:'💻', label:'Software / App',        brain:'Claude Sonnet 🧠'},
  {id:'planner',    icon:'📅', label:'Planner / Journal',     brain:'GPT-4o'},
  {id:'template',   icon:'📋', label:'Printable Template',    brain:'GPT-4o'},
  {id:'card',       icon:'🃏', label:'Card Deck',             brain:'GPT-4o'},
  {id:'curriculum', icon:'🏫', label:'Academic Curriculum',   brain:'GPT-4o'},
  {id:'lesson',     icon:'📚', label:'Lesson Plan',           brain:'GPT-4o'},
  {id:'toolkit',    icon:'🧰', label:'Toolkit Bundle',        brain:'GPT-4o'},
  {id:'checklist',  icon:'✅', label:'Checklist System',      brain:'GPT-4o'},
  {id:'workbook',   icon:'📓', label:'Workbook',              brain:'GPT-4o'},
  {id:'mini_course',icon:'⚡', label:'Mini-Course (5 days)',  brain:'GPT-4o'},
  {id:'swipe_file', icon:'📂', label:'Swipe File',            brain:'GPT-4o'},
  {id:'script',     icon:'🎬', label:'Video/Podcast Scripts', brain:'GPT-4o'},
  {id:'blueprint',  icon:'🏗️', label:'Business Blueprint',   brain:'GPT-4o'},
  {id:'masterclass',icon:'🏆', label:'Masterclass',           brain:'GPT-4o'},
  {id:'printable',  icon:'🖨️', label:'Printable Pack',        brain:'GPT-4o'},
]
const MARKETS   = ['South Africa','Nigeria','Kenya','Global','Africa','United Kingdom','United States']

type Mode = 'chat' | 'offer' | 'product' | 'objections' | 'research' | 'system' | 'audit' | 'formula' | 'brutal' | 'iterate'

function ManLawInner() {
  const [mode,       setMode]       = useState<Mode>('chat')
  const [messages,   setMessages]   = useState<{role:string,content:string}[]>([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [output,     setOutput]     = useState('')
  const [copied,     setCopied]     = useState(false)
  const [builderTier,setBuilderTier]= useState('starter')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Offer state
  const [product,    setProduct]    = useState('')
  const [audience,   setAudience]   = useState('')
  const [price,      setPrice]      = useState('R199')
  const [platform,   setPlatform]   = useState('WhatsApp')
  const [painPoints, setPainPoints] = useState('')
  const [selTriggers,setSelTriggers]= useState<string[]>([])

  // Product state
  const [topic,      setTopic]      = useState('')
  const [format,     setFormat]     = useState('guide')
  const [market,     setMarket]     = useState('South Africa')

  // Research state
  const [resCategory,setResCategory]= useState('')
  // What Sells state
  const [auditCopy,  setAuditCopy]  = useState('')
  const [wsPerson,   setWsPerson]   = useState('')
  const [wsProblem,  setWsProblem]  = useState('')
  const [wsPromise,  setWsPromise]  = useState('')
  const [brutalOffer,setBrutalOffer]= useState('')
  const [iterRounds, setIterRounds] = useState(2)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', user.id).single()
        setBuilderTier(prof?.paid_tier || 'starter')
      }
    })
    // Welcome message
    setMessages([{ role:'assistant', content:`🔥 Builder! I'm Coach Manlaw.

I'm not your average AI. I'm your unfair advantage.

I can help you:
💬 **Coach you** through any business challenge
✍️ **Write offers** that convert using 13 psychological triggers
📦 **Create digital products** from scratch — complete content
🔍 **Research markets** to find what people are paying to solve
📢 **Build your 30-day sales system**
💪 **Handle objections** like a world-class closer

What do you want to build today?` }])
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, output])

  const call = async (action: string, extra?: any) => {
    setLoading(true)
    setOutput('')
    try {
      const body: any = { action, userId: undefined, builderTier, ...extra }

      if (action === 'chat') {
        const newMessages = [...messages, { role:'user', content: input }]
        setMessages(newMessages)
        setInput('')
        body.messages = newMessages
        const res  = await fetch('/api/coach-manlaw', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
        const data = await res.json()
        setMessages(prev => [...prev, { role:'assistant', content: data.reply || data.error }])
      } else {
        const res  = await fetch('/api/coach-manlaw', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
        const data = await res.json()
        const result = data.copy || data.productContent || data.handlers || data.research || data.system || data.audit || data.built || data.finalOffer || data.error || ''
        setOutput(result)
        if (data.launchCopy) setOutput(result + '\n\n---\n\n## 🚀 LAUNCH COPY\n\n' + data.launchCopy)
      }
    } catch (e: any) {
      if (action === 'chat') setMessages(prev => [...prev, { role:'assistant', content:'Something went wrong. Try again.' }])
      else setOutput('Error: ' + e.message)
    }
    setLoading(false)
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.07)',
    border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px',
    color:W, fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box',
  }

  const btn = (bg: string, col = '#fff'): React.CSSProperties => ({
    padding:'11px 18px', borderRadius:'10px', border:'none', background:bg,
    color:col, fontWeight:700, fontSize:'13px', cursor:'pointer', width:'100%',
    fontFamily:'Georgia,serif',
  })

  const MODES: {id:Mode,icon:string,label:string,desc:string}[] = [
    {id:'chat',      icon:'💬', label:'Coach',       desc:'Business coaching & advice'},
    {id:'offer',     icon:'✍️', label:'Write Offer',  desc:'13 psychological triggers'},
    {id:'product',   icon:'📦', label:'Create Product', desc:'Complete digital product'},
    {id:'research',  icon:'🔍', label:'Research',    desc:'Market pain points'},
    {id:'objections',icon:'💪', label:'Objections',  desc:'Close resistant buyers'},
    {id:'system',    icon:'📢', label:'Sales System', desc:'30-day launch plan'},
  {id:'audit',     icon:'🔍', label:'Audit My Offer', desc:'What Sells framework score'},
  {id:'formula',   icon:'🔥', label:'Build from Formula', desc:'Specific Person + Problem + Promise + Path'},
  {id:'brutal',    icon:'🔴', label:'Brutal Audit',      desc:'No filter — expose & rebuild weak offers'},
  {id:'iterate',   icon:'🔁', label:'Iterate & Enforce', desc:'Rewrite until it scores 85+/100'},
  ]

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', flexDirection:'column' }}>

      {/* Nav */}
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
        <Link href="/ai-income" style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← 4M</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize:'14px', fontWeight:900, color:GOLD, fontFamily:'Cinzel,Georgia,serif' }}>Coach Manlaw</span>
        <span style={{ marginLeft:'auto', fontSize:'10px', color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.06)', padding:'3px 8px', borderRadius:'10px' }}>
          GPT-4o + 13 Triggers
        </span>
      </div>

      {/* Mode tabs */}
      <div style={{ padding:'10px 12px', display:'flex', gap:'6px', overflowX:'auto', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setOutput('') }}
            style={{ padding:'7px 12px', borderRadius:'20px', border:`1px solid ${mode===m.id ? GOLD : 'rgba(255,255,255,0.1)'}`,
              background: mode===m.id ? `${GOLD}18` : 'transparent',
              color: mode===m.id ? GOLD : 'rgba(255,255,255,0.5)',
              fontSize:'11px', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' as const }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ── CHAT MODE ── */}
      {mode === 'chat' && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom:'14px', display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`linear-gradient(135deg,${GOLD},#B8860B)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0, marginRight:'8px' }}>M</div>
                )}
                <div style={{ maxWidth:'85%', padding:'12px 14px', borderRadius: msg.role==='user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
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
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`linear-gradient(135deg,${GOLD},#B8860B)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>M</div>
                <div style={{ display:'flex', gap:'4px' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:'7px', height:'7px', borderRadius:'50%', background:GOLD, animation:`pulse 1.2s ${i*0.3}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:'8px', flexShrink:0 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); if(input.trim()) call('chat') } }}
              placeholder="Ask Coach Manlaw anything... (Enter to send)"
              rows={2}
              style={{ ...inp, resize:'none', flex:1 }} />
            <button onClick={() => input.trim() && call('chat')} disabled={loading || !input.trim()}
              style={{ ...btn(`linear-gradient(135deg,${GOLD},#B8860B)`,'#1E1245'), width:'auto', padding:'0 16px', opacity: loading||!input.trim() ? 0.5 : 1, fontFamily:'Cinzel,Georgia,serif' }}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* ── OFFER WRITER ── */}
      {mode === 'offer' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>✍️ World-Class Offer Writer</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>Using all 13 psychological buying triggers</div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>What are you selling?</label>
              <input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Grade 12 Maths Exam Prep Guide" style={inp} />
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Who is your buyer?</label>
              <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Parents of Grade 12 learners in South Africa" style={inp} />
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Their biggest pain points</label>
              <textarea value={painPoints} onChange={e => setPainPoints(e.target.value)} rows={2} placeholder="e.g. Child is failing, matric exams in 3 months, tried tutors but too expensive..." style={{ ...inp, resize:'none' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Price</label>
                <input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={inp} />
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Platform</label>
                <select value={platform} onChange={e => setPlatform(e.target.value)} style={inp}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Trigger selector */}
          <div style={{ marginBottom:'14px' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>
              Select triggers (or leave all for maximum power):
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
              {TRIGGERS.map(t => {
                const sel = selTriggers.includes(t.id)
                return (
                  <button key={t.id} onClick={() => setSelTriggers(prev => sel ? prev.filter(x=>x!==t.id) : [...prev, t.id])}
                    style={{ padding:'5px 10px', borderRadius:'16px', border:`1px solid ${sel ? GOLD : 'rgba(255,255,255,0.15)'}`,
                      background: sel ? `${GOLD}20` : 'transparent', color: sel ? GOLD : 'rgba(255,255,255,0.45)',
                      fontSize:'10px', fontWeight:700, cursor:'pointer' }}>
                    {t.label}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', marginTop:'5px' }}>
              {selTriggers.length === 0 ? '🔥 All 13 triggers active — maximum conversion power' : `${selTriggers.length} triggers selected`}
            </div>
          </div>

          <button onClick={() => call('write_offer', { product, audience, price, platform, painPoints, format:'full offer', triggers: selTriggers.length ? selTriggers : undefined })}
            disabled={loading || !product.trim()}
            style={{ ...btn(`linear-gradient(135deg,${GOLD},#B8860B)`,'#1E1245'), fontFamily:'Cinzel,Georgia,serif', opacity: loading||!product.trim() ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? '✍️ Coach Manlaw is writing...' : '🔥 Write My World-Class Offer →'}
          </button>

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD }}>Your Copy — Ready to Post</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:`${GOLD}20`, border:`1px solid ${GOLD}40`, borderRadius:'8px', color:GOLD, fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅ Copied!' : '📋 Copy All'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCT CREATOR ── */}
      {mode === 'product' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>📦 Digital Product Creator</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>Complete expert product + launch copy. Ready to sell.</div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Product topic / pain point</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. How to start a spaza shop and make R15,000/month" style={inp} />
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Who is it for?</label>
              <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Unemployed township residents aged 25-45" style={inp} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
              <div style={{ gridColumn:'1 / -1' }}>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px' }}>Product Type — AI Brain used</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
                  {FORMATS.map(f => (
                    <button key={f.id} onClick={() => setFormat(f.id)}
                      style={{ padding:'7px 10px', borderRadius:'8px', border:`1px solid ${format===f.id ? GOLD : 'rgba(255,255,255,0.1)'}`,
                        background: format===f.id ? `${GOLD}18` : 'rgba(255,255,255,0.03)',
                        color: format===f.id ? GOLD : 'rgba(255,255,255,0.5)',
                        fontSize:'11px', fontWeight:700, cursor:'pointer', textAlign:'left' as const, display:'flex', gap:'6px', alignItems:'center' }}>
                      <span>{f.icon}</span>
                      <div>
                        <div style={{fontSize:'11px'}}>{f.label}</div>
                        <div style={{fontSize:'9px', color: f.brain.includes('Claude') ? '#A78BFA' : 'rgba(255,255,255,0.3)', fontWeight:400}}>{f.brain}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Market</label>
                <select value={market} onChange={e => setMarket(e.target.value)} style={inp}>
                  {MARKETS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Price</label>
                <input value={price} onChange={e => setPrice(e.target.value)} placeholder="R299" style={inp} />
              </div>
            </div>
          </div>

          <button onClick={() => call('create_product', { topic, audience, format, market, price })}
            disabled={loading || !topic.trim()}
            style={{ ...btn(`linear-gradient(135deg,#7C3AED,${PURP})`), fontFamily:'Cinzel,Georgia,serif', opacity: loading||!topic.trim() ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? '🧠 Coach Manlaw is creating your product...' : '📦 Create Complete Digital Product →'}
          </button>

          {loading && (
            <div style={{ textAlign:'center', padding:'20px', color:'rgba(255,255,255,0.4)', fontSize:'12px', lineHeight:1.8 }}>
              🧠 Researching · Writing · Structuring · Packaging<br/>
              Creating a complete expert product takes 60-90 seconds...
            </div>
          )}

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#A78BFA' }}>Your Complete Product</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:'rgba(167,139,250,0.2)', border:'1px solid rgba(167,139,250,0.3)', borderRadius:'8px', color:'#A78BFA', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅ Copied!' : '📋 Copy All'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      {/* ── MARKET RESEARCH ── */}
      {mode === 'research' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>🔍 Market Pain Point Research</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>Find what people are desperate to pay for in any market</div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Market / Geography</label>
                <select value={market} onChange={e => setMarket(e.target.value)} style={inp}>
                  {MARKETS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Category</label>
                <input value={resCategory} onChange={e => setResCategory(e.target.value)} placeholder="e.g. Education, Health, Business..." style={inp} />
              </div>
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Target demographic</label>
              <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Women aged 30-50, township residents, students..." style={inp} />
            </div>
          </div>

          <button onClick={() => call('research_pain_points', { market, category:resCategory, demographic:audience })}
            disabled={loading || !market}
            style={{ ...btn(`linear-gradient(135deg,#38BDF8,#0891B2)`), fontFamily:'Cinzel,Georgia,serif', opacity: loading ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? '🔍 Scanning global market...' : '🔍 Find Top 10 Pain Points →'}
          </button>

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(56,189,248,0.2)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#38BDF8' }}>Market Research Results</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:'rgba(56,189,248,0.2)', border:'1px solid rgba(56,189,248,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      {/* ── OBJECTION HANDLERS ── */}
      {mode === 'objections' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>💪 Objection Handler</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>Turn "no" and "maybe" into "yes" — every time</div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Your product</label>
              <input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Digital product, Z2B membership, coaching..." style={inp} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Price</label>
                <input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={inp} />
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Target buyer</label>
                <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who are you selling to?" style={inp} />
              </div>
            </div>
          </div>

          <button onClick={() => call('objection_handlers', { product, price, audience })}
            disabled={loading || !product.trim()}
            style={{ ...btn(`linear-gradient(135deg,#6EE7B7,#059669)`,'#1E1245'), fontFamily:'Cinzel,Georgia,serif', opacity: loading||!product.trim() ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? '💪 Building your closing arsenal...' : '💪 Generate Objection Handlers →'}
          </button>

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7' }}>Your Closing Arsenal — 8 Objections</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:'rgba(110,231,183,0.2)', border:'1px solid rgba(110,231,183,0.3)', borderRadius:'8px', color:'#6EE7B7', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      {/* ── SALES SYSTEM ── */}
      {mode === 'system' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>📢 30-Day Sales System Builder</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>Complete month-long sales plan — copy-paste ready</div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Your product</label>
              <input value={product} onChange={e => setProduct(e.target.value)} placeholder="What are you selling?" style={inp} />
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Target audience</label>
              <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who is your buyer?" style={inp} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Price</label>
                <input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={inp} />
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Market</label>
                <select value={market} onChange={e => setMarket(e.target.value)} style={inp}>
                  {MARKETS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button onClick={() => call('build_sales_system', { product, audience, price, market })}
            disabled={loading || !product.trim()}
            style={{ ...btn(`linear-gradient(135deg,#FF6B35,#E55A2B)`), fontFamily:'Cinzel,Georgia,serif', opacity: loading||!product.trim() ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? '📢 Building your 30-day system...' : '📢 Build My 30-Day Sales System →'}
          </button>

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,107,53,0.2)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#FF6B35' }}>Your 30-Day Sales System</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:'rgba(255,107,53,0.2)', border:'1px solid rgba(255,107,53,0.3)', borderRadius:'8px', color:'#FF6B35', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      {/* ── AUDIT MODE ── */}
      {mode === 'audit' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>🔍 What Sells Audit</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'12px' }}>Score your offer against the What Sells formula</div>

          {/* Formula reminder */}
          <div style={{ background:'rgba(255,107,53,0.08)', border:'1px solid rgba(255,107,53,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#FF6B35', marginBottom:'6px' }}>🔥 The Formula</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              {[
                {e:'✅','l':'Specific Person',   d:'Who feels SEEN'},
                {e:'✅','l':'Specific Problem',  d:'Their exact pain'},
                {e:'✅','l':'Clear Promise',     d:'Named transformation'},
                {e:'✅','l':'Clear Path',        d:'Product = the bridge'},
              ].map(x => (
                <div key={x.l} style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.04)', padding:'6px 8px', borderRadius:'8px' }}>
                  {x.e} <strong>{x.l}</strong><br/><span style={{color:'rgba(255,255,255,0.4)',fontSize:'10px'}}>{x.d}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:'10px' }}>
            <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Paste your offer / copy / product description</label>
            <textarea value={auditCopy} onChange={e => setAuditCopy(e.target.value)} rows={6}
              placeholder="Paste your WhatsApp message, Facebook post, product description, sales page — anything you want audited..."
              style={{ ...inp, resize:'none' }} />
          </div>

          <button onClick={() => call('what_sells_audit', { copy:auditCopy })}
            disabled={loading || !auditCopy.trim()}
            style={{ ...btn(`linear-gradient(135deg,#FF6B35,#E55A2B)`), fontFamily:'Cinzel,Georgia,serif', opacity: loading||!auditCopy.trim() ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? '🔍 Auditing with the What Sells formula...' : '🔍 Audit My Offer — Score It →'}
          </button>

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,107,53,0.2)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#FF6B35' }}>Audit Report</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:'rgba(255,107,53,0.2)', border:'1px solid rgba(255,107,53,0.3)', borderRadius:'8px', color:'#FF6B35', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅' : '📋 Copy'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      {/* ── FORMULA BUILDER MODE ── */}
      {mode === 'formula' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>🔥 Build from the Formula</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'12px' }}>
            Specific Person + Specific Problem + Clear Promise + Clear Path
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
            <div style={{ padding:'12px', background:'rgba(212,175,55,0.06)', border:`1px solid ${GOLD}20`, borderRadius:'10px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:GOLD, marginBottom:'4px' }}>1. SPECIFIC PERSON — Who feels seen?</div>
              <input value={wsPerson} onChange={e => setWsPerson(e.target.value)}
                placeholder='e.g. "Single mothers in Johannesburg struggling to make rent every month"'
                style={inp} />
            </div>
            <div style={{ padding:'12px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#FCA5A5', marginBottom:'4px' }}>2. SPECIFIC PROBLEM — Their exact pain</div>
              <textarea value={wsProblem} onChange={e => setWsProblem(e.target.value)} rows={2}
                placeholder="e.g. She works 2 jobs but cannot save money - no system for managing her income"
                style={{ ...inp, resize:'none' }} />
            </div>
            <div style={{ padding:'12px', background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'10px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#6EE7B7', marginBottom:'4px' }}>3. CLEAR PROMISE — The transformation</div>
              <input value={wsPromise} onChange={e => setWsPromise(e.target.value)}
                placeholder='e.g. "Save R500/month guaranteed within 30 days using her current income"'
                style={inp} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Market</label>
                <select value={market} onChange={e => setMarket(e.target.value)} style={inp}>
                  {MARKETS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Price</label>
                <input value={price} onChange={e => setPrice(e.target.value)} placeholder="R199" style={inp} />
              </div>
            </div>
          </div>

          <button onClick={() => call('what_sells_build', { person:wsPerson, problem:wsProblem, promise:wsPromise, market, price })}
            disabled={loading || !wsPerson.trim() || !wsProblem.trim() || !wsPromise.trim()}
            style={{ ...btn(`linear-gradient(135deg,${GOLD},#B8860B)`,'#1E1245'), fontFamily:'Cinzel,Georgia,serif', opacity: loading||(!wsPerson||!wsProblem||!wsPromise) ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? '🔥 Building complete offer from formula...' : '🔥 Build My Complete Offer →'}
          </button>

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${GOLD}30`, borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD }}>Your Complete Offer — Built from the Formula</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:`${GOLD}20`, border:`1px solid ${GOLD}40`, borderRadius:'8px', color:GOLD, fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅' : '📋 Copy'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      {/* ── BRUTAL AUDIT MODE ── */}
      {mode === 'brutal' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:'#EF4444', marginBottom:'4px' }}>🔴 Brutal Audit — No Filter</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'12px' }}>Expose every weakness. Rebuild at elite level. No politeness.</div>

          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#FCA5A5', marginBottom:'6px' }}>What this does:</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.8 }}>
              1. 🔴 Scores your offer brutally (no mercy)<br/>
              2. 🔍 Exposes every banned phrase + generic claim<br/>
              3. 🔧 Diagnoses WHY Coach Manlaw failed you<br/>
              4. 🔥 Rebuilds the offer at elite level (85+/100)<br/>
              5. ✅ Tests it against the SA skeptical buyer
            </div>
          </div>

          <div style={{ marginBottom:'10px' }}>
            <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Paste the weak offer to destroy and rebuild:</label>
            <textarea value={brutalOffer} onChange={e => setBrutalOffer(e.target.value)} rows={8}
              placeholder="Paste any offer — yours, Coach Manlaw's output, or a competitor's. Nothing is safe here."
              style={{ ...inp, resize:'none' }} />
          </div>

          <button onClick={() => call('brutal_audit', { offer:brutalOffer })}
            disabled={loading || !brutalOffer.trim()}
            style={{ ...btn('linear-gradient(135deg,#EF4444,#B91C1C)'), fontFamily:'Cinzel,Georgia,serif', opacity: loading||!brutalOffer.trim() ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? '🔴 Destroying and rebuilding...' : '🔴 Brutally Audit This Offer →'}
          </button>

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#EF4444' }}>Brutal Audit Report + Elite Rebuild</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', color:'#FCA5A5', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅' : '📋 Copy'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      {/* ── ITERATE MODE ── */}
      {mode === 'iterate' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:'#A78BFA', marginBottom:'4px' }}>🔁 Iterate Until It Converts</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'12px' }}>Coach Manlaw rewrites your offer up to 3 times until it scores 85+/100</div>

          <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.8 }}>
              Each iteration: score internally → detect banned phrases → rewrite with enforcement → score again → submit only if 85+
            </div>
          </div>

          <div style={{ marginBottom:'10px' }}>
            <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Offer to iterate:</label>
            <textarea value={brutalOffer} onChange={e => setBrutalOffer(e.target.value)} rows={6}
              placeholder="Paste the offer you want iterated to perfection..."
              style={{ ...inp, resize:'none' }} />
          </div>

          <div style={{ marginBottom:'12px' }}>
            <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px' }}>Iterations: {iterRounds}</label>
            <div style={{ display:'flex', gap:'6px' }}>
              {[1,2,3].map(n => (
                <button key={n} onClick={() => setIterRounds(n)}
                  style={{ flex:1, padding:'8px', borderRadius:'8px', border:`1px solid ${iterRounds===n ? '#A78BFA' : 'rgba(255,255,255,0.1)'}`,
                    background: iterRounds===n ? 'rgba(167,139,250,0.2)' : 'transparent',
                    color: iterRounds===n ? '#A78BFA' : 'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'12px', fontWeight:700 }}>
                  {n}x
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => call('iterate', { offer:brutalOffer, rounds:iterRounds })}
            disabled={loading || !brutalOffer.trim()}
            style={{ ...btn('linear-gradient(135deg,#7C3AED,#4C1D95)'), fontFamily:'Cinzel,Georgia,serif', opacity: loading||!brutalOffer.trim() ? 0.6 : 1, marginBottom:'14px' }}>
            {loading ? `🔁 Iterating ${iterRounds}x...` : `🔁 Iterate ${iterRounds}x — Force 85+ Score →`}
          </button>

          {output && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#A78BFA' }}>Final Iterated Offer ({iterRounds}x refined)</div>
                <button onClick={() => copy(output)} style={{ padding:'5px 12px', background:'rgba(167,139,250,0.2)', border:'1px solid rgba(167,139,250,0.3)', borderRadius:'8px', color:'#A78BFA', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                  {copied ? '✅' : '📋 Copy'}
                </button>
              </div>
              <MarkdownOutput text={output} />
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}`}</style>
    </div>
  )
}

export default function CoachManlaw() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
        Loading Coach Manlaw...
      </div>
    }>
      <ManLawInner />
    </Suspense>
  )
}