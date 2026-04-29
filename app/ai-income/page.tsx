'use client'
// FILE: app/ai-income/page.tsx
// 4M Machine — Fully unique experience per tier, step-by-step focused UX

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG      = '#0D0820'
const GOLD    = '#D4AF37'
const W       = '#F0EEF8'
const PURP    = '#7C3AED'
const ROCKET  = '#FF6B35'

const TIER_RANK: Record<string,number> = {
  free:0, starter:1, bronze:2, copper:3, silver:4, gold:5, platinum:6,
  silver_rocket:4, gold_rocket:5, platinum_rocket:6,
}

const TIER_VEHICLE: Record<string,string> = {
  free:'manual', starter:'manual', bronze:'manual', copper:'manual',
  silver:'automatic',
  gold:'electric', platinum:'electric',
  silver_rocket:'rocket', gold_rocket:'rocket', platinum_rocket:'rocket',
}

// ── Shared API caller ─────────────────────────────────────────────────────────
async function callManlaw(action: string, body: Record<string,unknown>): Promise<string> {
  const res = await fetch('/api/coach-manlaw', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ action, ...body }),
  })
  const data = await res.json()
  return data.copy || data.productContent || data.handlers || data.reply || data.error || ''
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ steps, current, color }: { steps: string[]; current: number; color: string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'24px', position:'relative' }}>
      <div style={{ position:'absolute', top:'14px', left:0, right:0, height:'2px', background:'rgba(255,255,255,0.08)', zIndex:0 }} />
      {steps.map((s, i) => (
        <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', zIndex:1, flex:1 }}>
          <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900,
            background: i < current ? color : i === current ? color : 'rgba(255,255,255,0.08)',
            color: i <= current ? (color===GOLD?'#1E1245':'#fff') : 'rgba(255,255,255,0.3)' }}>
            {i < current ? '✓' : i+1}
          </div>
          <div style={{ fontSize:'9px', color: i <= current ? color : 'rgba(255,255,255,0.3)', fontWeight: i===current?700:400, textAlign:'center', lineHeight:1.3, maxWidth:'60px' }}>
            {s}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Shared input style ────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.07)',
  border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px',
  color:W, fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box',
}

const primaryBtn = (color: string, textColor = '#fff', disabled = false): React.CSSProperties => ({
  width:'100%', padding:'14px', borderRadius:'12px', border:'none', fontFamily:'Cinzel,Georgia,serif',
  fontWeight:900, fontSize:'14px', cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg,${color},${color}CC)`,
  color: disabled ? 'rgba(255,255,255,0.3)' : textColor,
  marginBottom:'12px',
})

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ result, color, label }: { result: string; color: string; label: string }) {
  const [copied, setCopied] = useState(false)
  if (!result) return null
  return (
    <div style={{ background:`${color}08`, border:`1px solid ${color}30`, borderRadius:'14px', padding:'16px', marginBottom:'12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color }}>{label}</div>
        <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
          style={{ padding:'4px 10px', background:`${color}20`, border:`1px solid ${color}40`, borderRadius:'8px', color, fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
          {copied ? '✅' : '📋 Copy'}
        </button>
      </div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.8)', lineHeight:1.85, whiteSpace:'pre-wrap' }}>{result}</div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// 🚗 MANUAL MODE
// ════════════════════════════════════════════════════════════════════
function ManualMode({ tier }: { tier: string }) {
  const [tool,    setTool]    = useState<string|null>(null)
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState('')
  const [f1,      setF1]      = useState('')
  const [f2,      setF2]      = useState('')
  const [f3,      setF3]      = useState('')

  const run = async (action: string, body: Record<string,unknown>) => {
    setLoading(true); setResult('')
    const r = await callManlaw(action, body)
    setResult(r); setStep(s => s+1); setLoading(false)
  }

  const back = () => { setTool(null); setStep(0); setResult(''); setF1(''); setF2(''); setF3('') }

  // FREE tier — preview wall
  if (tier === 'free') return (
    <div>
      <div style={{ textAlign:'center', padding:'20px', marginBottom:'20px', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'16px' }}>
        <div style={{ fontSize:'36px', marginBottom:'8px' }}>🚗</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'6px' }}>Manual Mode Preview</div>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>You are on the Free tier. See what is possible, then upgrade to start earning.</div>
      </div>
      {/* NSB Preview */}
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7', marginBottom:'10px' }}>💰 What you earn as a Free builder (NSB only):</div>
        {[{t:'Starter sale',p:500},{t:'Bronze sale',p:2500},{t:'Silver sale',p:12000}].map(x => (
          <div key={x.t} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{x.t}</span>
            <span style={{ fontSize:'13px', fontWeight:700, color:'#6EE7B7' }}>
              {x.t==='Starter sale' ? 'R100 flat' : `5% = R${Math.round(x.p*0.05).toLocaleString()}`}
            </span>
          </div>
        ))}
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'8px' }}>First R500 NSB → auto-upgraded to Starter Pack</div>
      </div>
      <div style={{ textAlign:'center', padding:'20px', background:'rgba(212,175,55,0.06)', border:`1px solid ${GOLD}30`, borderRadius:'12px' }}>
        <div style={{ fontSize:'13px', color:GOLD, fontWeight:700, marginBottom:'8px' }}>Upgrade to Starter — Unlock all Manual tools</div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>Offer Generator · Customer Finder · Post Creator · Closing Scripts</div>
        <Link href="/ai-income/choose-plan" style={{ display:'inline-block', padding:'11px 28px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'12px', color:'#1E1245', fontWeight:900, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
          Get Starter Pack — R500 →
        </Link>
      </div>
    </div>
  )

  // STARTER / BRONZE / COPPER — tool menu
  const TOOLS: Record<string,{icon:string,name:string,desc:string,tiers:string[],steps:string[]}> = {
    offer:     { icon:'✍️', name:'Offer Generator',     desc:'Create a converting offer for any product',  tiers:['starter','bronze','copper'], steps:['Your product','Your buyer','Generate'] },
    finder:    { icon:'🔍', name:'Customer Finder',      desc:'Find exactly where your buyers are online',   tiers:['starter','bronze','copper'], steps:['Your niche','Platform','Find buyers'] },
    post:      { icon:'📱', name:'Post Creator',         desc:'WhatsApp, Facebook and TikTok posts ready',   tiers:['starter','bronze','copper'], steps:['Product','Platform','Generate'] },
    closing:   { icon:'💬', name:'Closing Script',       desc:'Scripts to turn "maybe" into "yes"',          tiers:['starter','bronze','copper'], steps:['Product','Price','Generate'] },
    team:      { icon:'👥', name:'Team Builder Script',  desc:'Recruit new builders with confidence',         tiers:['bronze','copper'], steps:['Your story','Target person','Generate'] },
    isp_calc:  { icon:'💰', name:'ISP Calculator',       desc:'See exactly what you earn on every sale',     tiers:['bronze','copper'], steps:['Your tier','Sale type','Calculate'] },
    product:   { icon:'📦', name:'Product Idea Generator',desc:'Find a profitable digital product idea',     tiers:['bronze','copper'], steps:['Your skill','Audience','Generate'] },
    discovery: { icon:'🧭', name:'Self-Discovery',       desc:'Find your unique value proposition',           tiers:['copper'], steps:['Your skills','Your market','Your edge'] },
    targeting: { icon:'🎯', name:'Advanced Targeting',   desc:'Precision audience targeting strategy',        tiers:['copper'], steps:['Your product','Demographics','Strategy'] },
  }

  const availableTools = Object.entries(TOOLS).filter(([,v]) => v.tiers.includes(tier))

  if (!tool) return (
    <div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:W, marginBottom:'4px' }}>
        🚗 Manual Mode — {tier.charAt(0).toUpperCase()+tier.slice(1)} Tools
      </div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'16px' }}>
        {tier === 'starter' ? 'Your 4 core tools. Master these first.' : tier === 'bronze' ? 'Starter tools + Team building + ISP tracking' : 'All Bronze tools + Self-discovery + Advanced targeting'}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {availableTools.map(([key, t]) => (
          <button key={key} onClick={() => { setTool(key); setStep(0); setResult('') }}
            style={{ padding:'14px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)',
              cursor:'pointer', textAlign:'left', display:'flex', gap:'12px', alignItems:'center' }}>
            <span style={{ fontSize:'22px', flexShrink:0 }}>{t.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:W }}>{t.name}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', marginTop:'2px' }}>{t.desc}</div>
            </div>
            <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'16px' }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )

  const t = TOOLS[tool]

  return (
    <div>
      <button onClick={back} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'13px', padding:0, marginBottom:'16px' }}>← Back to tools</button>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:W, marginBottom:'4px' }}>
        {t.icon} {t.name}
      </div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'16px' }}>{t.desc}</div>
      <StepBar steps={t.steps} current={step} color={PURP} />

      {/* Offer Generator */}
      {tool==='offer' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>What are you selling?</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Grade 12 Maths Study Guide — R199" style={inp} />
          <button onClick={()=>setStep(1)} disabled={!f1.trim()} style={primaryBtn(PURP,'#fff',!f1.trim())}>Next →</button></div>
      )}
      {tool==='offer' && step===1 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Who is your ONE buyer?</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Parent of Grade 12 learner, child failing maths, exams in 8 weeks" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Their biggest pain:</label>
          <input value={f3} onChange={e=>setF3(e.target.value)} placeholder="e.g. Child failed 3 tests, tutors too expensive, terrified of failing matric" style={inp} />
          <button onClick={()=>run('write_offer',{product:f1,audience:f2,painPoints:f3,price:'',platform:'WhatsApp',format:'full offer'})} disabled={!f2.trim()||loading} style={primaryBtn(PURP,'#fff',!f2.trim()||loading)}>
            {loading?'✍️ Writing your offer...':'✍️ Generate My Offer →'}</button></div>
      )}
      {tool==='offer' && step===2 && <ResultCard result={result} color={PURP} label="Your Offer — Ready to post" />}

      {/* Customer Finder */}
      {tool==='finder' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your niche / product:</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Study guides for Grade 12 learners" style={inp} />
          <button onClick={()=>setStep(1)} disabled={!f1.trim()} style={primaryBtn(PURP,'#fff',!f1.trim())}>Next →</button></div>
      )}
      {tool==='finder' && step===1 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Target market:</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. South Africa, parents aged 35-50" style={inp} />
          <button onClick={()=>run('research_pain_points',{market:f2,category:f1,demographic:'Anyone'})} disabled={!f2.trim()||loading} style={primaryBtn(PURP,'#fff',!f2.trim()||loading)}>
            {loading?'🔍 Finding your buyers...':'🔍 Find My Buyers →'}</button></div>
      )}
      {tool==='finder' && step===2 && <ResultCard result={result} color={PURP} label="Where Your Buyers Are" />}

      {/* Post Creator */}
      {tool==='post' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>What are you posting about?</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. My R199 Grade 12 Maths Guide" style={inp} />
          <button onClick={()=>setStep(1)} disabled={!f1.trim()} style={primaryBtn(PURP,'#fff',!f1.trim())}>Next →</button></div>
      )}
      {tool==='post' && step===1 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Platform:</label>
          <div style={{ display:'flex', gap:'8px' }}>
            {['WhatsApp','Facebook','TikTok','Instagram'].map(p => (
              <button key={p} onClick={()=>{setF2(p);run('write_offer',{product:f1,audience:'',painPoints:'',price:'',platform:p,format:'social post'})}}
                style={{ flex:1, padding:'10px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', background:f2===p?`${PURP}30`:'transparent', color:f2===p?W:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'12px', fontWeight:700 }}>
                {p}
              </button>
            ))}
          </div>
          {loading && <div style={{ textAlign:'center', padding:'20px', color:PURP }}>📱 Writing your post...</div>}
        </div>
      )}
      {tool==='post' && step===2 && <ResultCard result={result} color={PURP} label="Your Post — Copy and paste" />}

      {/* Closing Script */}
      {tool==='closing' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your product and price:</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Maths Study Guide — R199" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Who is your buyer?</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Parents of failing Grade 12 learners" style={inp} />
          <button onClick={()=>run('objection_handlers',{product:f1,price:'',audience:f2})} disabled={!f1.trim()||loading} style={primaryBtn(PURP,'#fff',!f1.trim()||loading)}>
            {loading?'💬 Building your scripts...':'💬 Generate Closing Scripts →'}</button></div>
      )}
      {tool==='closing' && step===1 && <ResultCard result={result} color={PURP} label="Your Closing Scripts — 8 objections handled" />}

      {/* Team Builder */}
      {tool==='team' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your story (how you started / why Z2B):</label>
          <textarea value={f1} onChange={e=>setF1(e.target.value)} rows={3} placeholder="e.g. I was working at Woolworths for 6 years, no raises, decided to try Z2B..." style={{...inp,resize:'none'}} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Who are you trying to recruit?</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Friends who complain about money, colleagues..." style={inp} />
          <button onClick={()=>run('chat',{messages:[{role:'user',content:`Write a compelling, non-salesy team builder recruitment script for Z2B Legacy Builders. 
Builder story: ${f1}
Target person: ${f2}
Include: WhatsApp opener, follow-up message, objection handlers for "is this MLM?", and a closing line.
Use the Builder identity. No hype. No fake income claims. Real and grounded.`}]})} disabled={!f1.trim()||loading} style={primaryBtn(PURP,'#fff',!f1.trim()||loading)}>
            {loading?'👥 Building your script...':'👥 Generate Team Builder Script →'}</button></div>
      )}
      {tool==='team' && step===1 && <ResultCard result={result} color={PURP} label="Team Builder Script" />}

      {/* ISP Calculator */}
      {tool==='isp_calc' && step===0 && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
            <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your tier</label>
              <select value={f1} onChange={e=>setF1(e.target.value)} style={inp}>
                {['bronze','copper','silver','gold','platinum','silver_rocket','gold_rocket','platinum_rocket'].map(t=><option key={t}>{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Member tier (BFM)</label>
              <select value={f2} onChange={e=>setF2(e.target.value)} style={inp}>
                {['starter','bronze','copper','silver','gold','platinum','silver_rocket','gold_rocket','platinum_rocket'].map(t=><option key={t}>{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </div>
          {(() => {
            const ISP: Record<string,number> = {bronze:18,copper:22,silver:25,gold:28,platinum:30,silver_rocket:25,gold_rocket:28,platinum_rocket:30}
            const BFM: Record<string,number> = {starter:850,bronze:1050,copper:1300,silver:2000,gold:3200,platinum:5800,silver_rocket:2550,gold_rocket:5250,platinum_rocket:10500}
            const rate = ISP[f1||'bronze']||0
            const bfm  = BFM[f2||'starter']||0
            const earn = Math.round(rate/100*bfm)
            return (
              <div style={{ textAlign:'center', padding:'16px', background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'12px' }}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'4px' }}>{(f1||'bronze').replace(/_/g,' ')} builder · {(f2||'starter').replace(/_/g,' ')} member BFM</div>
                <div style={{ fontSize:'32px', fontWeight:900, color:'#A78BFA' }}>R{earn.toLocaleString()}/mo</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'4px' }}>{rate}% × R{bfm.toLocaleString()} BFM = R{earn.toLocaleString()} ISP per member per month</div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Product Idea */}
      {tool==='product' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>What skill or knowledge do you have?</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. I know how to do hair braiding / I know Excel / I am a good cook" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Who could benefit from your knowledge?</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Women who want to start a home salon" style={inp} />
          <button onClick={()=>run('chat',{messages:[{role:'user',content:`I have this skill/knowledge: ${f1}. My potential audience: ${f2}.
Generate 5 specific profitable digital product ideas I can create and sell. For each:
- Product name
- Format (ebook/guide/template/course/toolkit)
- Recommended price in ZAR
- What problem it solves
- First step to create it today`}]})} disabled={!f1.trim()||loading} style={primaryBtn(PURP,'#fff',!f1.trim()||loading)}>
            {loading?'📦 Generating ideas...':'📦 Generate Product Ideas →'}</button></div>
      )}
      {tool==='product' && step===1 && <ResultCard result={result} color={PURP} label="Your 5 Product Ideas" />}

      {/* Self-Discovery */}
      {tool==='discovery' && step===0 && (
        <div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:1.8 }}>Answer these 3 questions honestly. Coach Manlaw will identify your unique value proposition — the thing you can sell that no one else can.</div>
          </div>
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>What do people always ask you for help with?</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. People always ask me how to save money / how to cook / how to deal with difficult people" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>What have you figured out that others struggle with?</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. I figured out how to grow vegetables in a small flat balcony" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>What transformation have you personally been through?</label>
          <input value={f3} onChange={e=>setF3(e.target.value)} placeholder="e.g. I went from R0 savings to saving R2,000/month in 6 months" style={inp} />
          <button onClick={()=>run('chat',{messages:[{role:'user',content:`Do a deep self-discovery analysis for this builder:
What people ask them: ${f1}
What they figured out: ${f2}
Their transformation: ${f3}

Identify:
1. Their UNIQUE VALUE PROPOSITION (what they have that no one else does)
2. Their IDEAL CUSTOMER (who needs exactly this)
3. Their BEST PRODUCT FORMAT (what to create first)
4. Their POSITIONING STATEMENT ("I help [who] to [what] using [how]")
5. Their FIRST INCOME ACTION (what to do in the next 48 hours)`}]})} disabled={!f1.trim()||loading} style={primaryBtn(PURP,'#fff',!f1.trim()||loading)}>
            {loading?'🧭 Analysing your unique value...':'🧭 Discover My Unique Value →'}</button></div>
      )}
      {tool==='discovery' && step===1 && <ResultCard result={result} color="#B45309" label="Your Unique Value Proposition" />}

      {/* Advanced Targeting */}
      {tool==='targeting' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your product:</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Budget meal planning guide for R199" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Who you think your buyer is:</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. People who want to save money on food" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Your target market:</label>
          <input value={f3} onChange={e=>setF3(e.target.value)} placeholder="e.g. South Africa" style={inp} />
          <button onClick={()=>run('chat',{messages:[{role:'user',content:`Create an advanced targeting strategy for:
Product: ${f1}
Assumed audience: ${f2}
Market: ${f3}

Deliver:
1. REFINED AVATAR (more specific than what they gave me — name, age, situation, fears, desires)
2. WHERE THEY ARE ONLINE (specific groups, pages, hashtags, communities)
3. TRIGGER MOMENTS (when they are most ready to buy)
4. MESSAGING ANGLE (what headline makes them stop scrolling)
5. PLATFORM PRIORITY (ranked by where to find most buyers for this product)`}]})} disabled={!f1.trim()||loading} style={primaryBtn(PURP,'#fff',!f1.trim()||loading)}>
            {loading?'🎯 Building targeting strategy...':'🎯 Build Targeting Strategy →'}</button></div>
      )}
      {tool==='targeting' && step===1 && <ResultCard result={result} color={PURP} label="Advanced Targeting Strategy" />}

      {result && (
        <button onClick={back} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:`1px solid ${PURP}40`, background:'transparent', color:PURP, fontWeight:700, cursor:'pointer', fontSize:'13px' }}>
          ← Use Another Tool
        </button>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⚙️ AUTOMATIC MODE (Silver)
// ════════════════════════════════════════════════════════════════════
function AutomaticMode({ tier }: { tier: string }) {
  const [tool,    setTool]    = useState<string|null>(null)
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState('')
  const [f1,setF1]=useState(''); const [f2,setF2]=useState(''); const [f3,setF3]=useState('')

  const run = async (action: string, body: Record<string,unknown>) => {
    setLoading(true); setResult('')
    const r = await callManlaw(action, body)
    setResult(r); setStep(s => s+1); setLoading(false)
  }
  const back = () => { setTool(null); setStep(0); setResult(''); setF1(''); setF2(''); setF3('') }

  const TOOLS = [
    { key:'product_engine', icon:'🔄', name:'7-Product Engine',    desc:'Turn 1 product into 7 formats automatically',          steps:['Your product','Formats','Generate'] },
    { key:'auto_followup',  icon:'📩', name:'Auto Follow-Up System',desc:'Follow-up sequences that close without you',           steps:['Product','Buyer type','Generate'] },
    { key:'content_machine',icon:'📅', name:'Content Machine',      desc:'30 days of content created in one click',              steps:['Your niche','Platforms','Generate'] },
    { key:'digital_twin',   icon:'🤖', name:'Digital Twin Setup',   desc:'Your AI persona that represents you online',           steps:['Your story','Your style','Generate'] },
    { key:'income_map',     icon:'💰', name:'Income Stream Mapper',  desc:'See all 9 income streams activated for your tier',     steps:['View streams'] },
    { key:'launch_system',  icon:'🚀', name:'7-Day Launch System',   desc:'Full launch plan for any product',                     steps:['Product','Market','Generate'] },
    { key:'objections',     icon:'💬', name:'Objection Destroyer',   desc:'Handle every objection your buyers throw at you',      steps:['Product','Price','Generate'] },
  ]

  if (!tool) return (
    <div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:W, marginBottom:'4px' }}>⚙️ Automatic Mode — Silver</div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'16px' }}>The system works with you. Choose your tool.</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {TOOLS.map(t => (
          <button key={t.key} onClick={()=>{setTool(t.key);setStep(0);setResult('')}}
            style={{ padding:'14px 16px', borderRadius:'12px', border:'1px solid rgba(8,145,178,0.2)', background:'rgba(8,145,178,0.04)',
              cursor:'pointer', textAlign:'left', display:'flex', gap:'12px', alignItems:'center' }}>
            <span style={{ fontSize:'22px', flexShrink:0 }}>{t.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:W }}>{t.name}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', marginTop:'2px' }}>{t.desc}</div>
            </div>
            <span style={{ color:'rgba(8,145,178,0.6)', fontSize:'16px' }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )

  const t = TOOLS.find(x=>x.key===tool)!

  return (
    <div>
      <button onClick={back} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'13px', padding:0, marginBottom:'16px' }}>← Back to tools</button>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:W, marginBottom:'4px' }}>{t.icon} {t.name}</div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'16px' }}>{t.desc}</div>
      <StepBar steps={t.steps} current={step} color="#0891B2" />

      {/* 7-Product Engine */}
      {tool==='product_engine' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your existing product or content idea:</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. How to budget on R3,000/month" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Target audience:</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Young adults in South Africa" style={inp} />
          <button onClick={()=>run('chat',{messages:[{role:'user',content:`Take this product idea and expand it into 7 different formats: "${f1}" for ${f2}

For each format deliver:
1. 📖 eBook — full title, 8-chapter outline, what each chapter covers
2. ✅ Checklist — 20-item actionable checklist based on the topic
3. 📋 Template — what template to create, all fields included
4. 🎬 Video Script — 5-minute teaching video full script
5. 📱 WhatsApp Mini-Course — 5-day WhatsApp message sequence (full messages)
6. 🎙️ Podcast Episode Outline — 30-min episode structure with talking points
7. 📊 Swipe File — 10 social media posts ready to publish

Each must be COMPLETE. No placeholders.`}]})} disabled={!f1.trim()||loading} style={primaryBtn('#0891B2','#fff',!f1.trim()||loading)}>
            {loading?'🔄 Creating 7 formats...':'🔄 Create 7 Formats →'}</button></div>
      )}
      {tool==='product_engine' && step===1 && <ResultCard result={result} color="#0891B2" label="Your 7 Product Formats" />}

      {/* Auto Follow-Up */}
      {tool==='auto_followup' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your product:</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Budget planning guide — R199" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Buyer type:</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Person who asked about the product but did not buy" style={inp} />
          <button onClick={()=>run('chat',{messages:[{role:'user',content:`Build a 7-message follow-up sequence for: ${f1}. Buyer: ${f2}.

Messages for: Day 1, Day 2, Day 4, Day 7, Day 10, Day 14, Day 21.
Each message: Full text ready to send on WhatsApp. Include the psychological trigger used. Vary the angle (value, social proof, urgency, story, objection handle). No repetition.`}]})} disabled={!f1.trim()||loading} style={primaryBtn('#0891B2','#fff',!f1.trim()||loading)}>
            {loading?'📩 Building sequences...':'📩 Build Follow-Up System →'}</button></div>
      )}
      {tool==='auto_followup' && step===1 && <ResultCard result={result} color="#0891B2" label="Your 7-Message Follow-Up System" />}

      {/* Content Machine */}
      {tool==='content_machine' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your niche / what you sell:</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Personal finance and budgeting tools" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Primary platforms:</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. WhatsApp, Facebook, TikTok" style={inp} />
          <button onClick={()=>run('build_sales_system',{product:f1,audience:'general audience',price:'varies',market:f2})} disabled={!f1.trim()||loading} style={primaryBtn('#0891B2','#fff',!f1.trim()||loading)}>
            {loading?'📅 Creating 30-day plan...':'📅 Generate 30-Day Content Machine →'}</button></div>
      )}
      {tool==='content_machine' && step===1 && <ResultCard result={result} color="#0891B2" label="Your 30-Day Content Machine" />}

      {/* Digital Twin Setup */}
      {tool==='digital_twin' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your story (who you are, what you overcame):</label>
          <textarea value={f1} onChange={e=>setF1(e.target.value)} rows={3} placeholder="e.g. I was a nurse for 8 years, always broke, discovered Z2B in 2024 and made my first R2,000 online in 14 days..." style={{...inp,resize:'none'}} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Your communication style:</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Warm, direct, no hype, uses real examples" style={inp} />
          <button onClick={()=>run('chat',{messages:[{role:'user',content:`Create a complete Digital Twin profile for this builder:

Story: ${f1}
Style: ${f2}

Deliver:
1. BIO (150 words — WhatsApp profile version)
2. SHORT BIO (50 words — Instagram/Facebook)
3. BRAND VOICE GUIDE (5 rules for how this person writes)
4. 5 SIGNATURE PHRASES (unique expressions they use consistently)
5. CONTENT PILLARS (5 topics they always talk about)
6. ENGAGEMENT SCRIPTS (3 ways to start conversations authentically)
7. AUTOMATED DM OPENER (first message when someone follows them)`}]})} disabled={!f1.trim()||loading} style={primaryBtn('#0891B2','#fff',!f1.trim()||loading)}>
            {loading?'🤖 Creating your digital twin...':'🤖 Create My Digital Twin →'}</button></div>
      )}
      {tool==='digital_twin' && step===1 && <ResultCard result={result} color="#0891B2" label="Your Digital Twin Profile" />}

      {/* Income Map */}
      {tool==='income_map' && step===0 && (
        <div>
          <div style={{ background:'rgba(8,145,178,0.06)', border:'1px solid rgba(8,145,178,0.2)', borderRadius:'12px', padding:'16px' }}>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#38BDF8', marginBottom:'12px' }}>💰 Your 9 Income Streams — Silver Tier</div>
            {[
              {n:'NSB',stream:'New Sale Bonus',     earn:'R100 + 25% of R500 = R225 per Starter sale'},
              {n:'ISP',stream:'Individual Sales Profit',earn:'25% of every BFM payment from your team'},
              {n:'QPB',stream:'Quick Performance Bonus',earn:'+7.5% on all NSB+ISP (first 90 days)'},
              {n:'TSC',stream:'Team Sales Commission',earn:'25% on team sales — Generations 2 to 6'},
              {n:'TLI',stream:'Team Leadership Income',earn:'Once per rank — L1: R3,000 to L10: R3.5M'},
              {n:'CEO Comp',stream:'CEO Competition',earn:'Challenge prizes — announced by CEO'},
              {n:'CEO Awards',stream:'CEO Awards',  earn:'Discretionary — special achievement'},
              {n:'Marketplace',stream:'Marketplace Income',earn:'90% of every product you sell'},
              {n:'Distribution',stream:'Distribution Rights',earn:'❌ Unlocked at Platinum only'},
            ].map((s,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', gap:'10px' }}>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:700, color:W }}>{s.n} — {s.stream}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', marginTop:'2px' }}>{s.earn}</div>
                </div>
                <span style={{ fontSize:'16px', flexShrink:0 }}>{s.n==='Distribution' ? '🔒' : '✅'}</span>
              </div>
            ))}
          </div>
          <Link href="/compensation" style={{ display:'block', marginTop:'12px', padding:'12px', borderRadius:'10px', border:'1px solid rgba(8,145,178,0.3)', background:'rgba(8,145,178,0.06)', color:'#38BDF8', fontWeight:700, fontSize:'13px', textAlign:'center', textDecoration:'none' }}>
            📊 Full Compensation Plan →
          </Link>
        </div>
      )}

      {/* 7-Day Launch */}
      {tool==='launch_system' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Product to launch:</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Budget Planner PDF — R199" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Target market:</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Young professionals in Nigeria" style={inp} />
          <button onClick={()=>run('chat',{messages:[{role:'user',content:`Build a complete 7-day product launch plan for: ${f1}. Market: ${f2}.

For each day, deliver:
- Primary action for the day
- WhatsApp message to send (full text)
- Social post (full text)
- Who to target that day
- Income goal for the day

Day 1: Tease / Announce
Day 2: Value content (educate)
Day 3: Social proof
Day 4: Behind the scenes
Day 5: Objection buster
Day 6: Urgency / scarcity
Day 7: Final close

Total 7-day income target based on realistic conversion rates.`}]})} disabled={!f1.trim()||loading} style={primaryBtn('#0891B2','#fff',!f1.trim()||loading)}>
            {loading?'🚀 Building launch plan...':'🚀 Build 7-Day Launch Plan →'}</button></div>
      )}
      {tool==='launch_system' && step===1 && <ResultCard result={result} color="#0891B2" label="Your 7-Day Launch Plan" />}

      {/* Objections */}
      {tool==='objections' && step===0 && (
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your product:</label>
          <input value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Z2B Starter Pack — R500" style={inp} />
          <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', marginTop:'10px' }}>Your buyer:</label>
          <input value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. Employed person, skeptical of online income" style={inp} />
          <button onClick={()=>run('objection_handlers',{product:f1,price:'',audience:f2})} disabled={!f1.trim()||loading} style={primaryBtn('#0891B2','#fff',!f1.trim()||loading)}>
            {loading?'💬 Destroying objections...':'💬 Destroy All Objections →'}</button></div>
      )}
      {tool==='objections' && step===1 && <ResultCard result={result} color="#0891B2" label="Objection Destroyer — 8 Scripts" />}

      {result && <button onClick={back} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid rgba(8,145,178,0.3)', background:'transparent', color:'#0891B2', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>← Use Another Tool</button>}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⚡ ELECTRIC MODE (Gold + Platinum)
// ════════════════════════════════════════════════════════════════════
function ElectricMode({ tier }: { tier: string }) {
  const [step,        setStep]        = useState(0)
  const [productType, setProductType] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [product,     setProduct]     = useState('')
  const [launchKit,   setLaunchKit]   = useState('')
  const [topic,       setTopic]       = useState('')
  const [audience,    setAudience]    = useState('')
  const [price,       setPrice]       = useState('R299')
  const [market,      setMarket]      = useState('Global (All Markets)')

  const TYPES = [
    { icon:'📖', type:'eBook / Guide',           fmt:'ebook',       example:'e.g. How to invest R500/month · Hair care guide for natural hair' },
    { icon:'🎓', type:'Online Course',            fmt:'course',      example:'e.g. Social media marketing course · Home cooking masterclass' },
    { icon:'📋', type:'Template / Planner',        fmt:'template',    example:'e.g. Business plan template · 90-day income planner' },
    { icon:'🧰', type:'Toolkit / Swipe File',      fmt:'toolkit',     example:'e.g. Sales scripts toolkit · Content creation kit' },
    { icon:'🎬', type:'Masterclass / Video Course',fmt:'masterclass', example:'e.g. Property investment masterclass · Fitness coaching program' },
    { icon:'💻', type:'Software / Tool (Claude)',  fmt:'software',    example:'e.g. Budget calculator app · Business proposal generator' },
    { icon:'🃏', type:'Card Deck',                fmt:'card',        example:'e.g. Daily affirmation cards · Business strategy cards' },
    { icon:'🏫', type:'Academic Curriculum',       fmt:'curriculum',  example:'e.g. Grade 10 Maths curriculum · English literacy program' },
    { icon:'🔁', type:'Mini-Course (5 days)',       fmt:'mini_course', example:'e.g. 5-day money reset · 5-day productivity sprint' },
    ...(tier === 'platinum' ? [
      { icon:'📦', type:'Bulk Product Bundle (Platinum)',fmt:'toolkit', example:'e.g. 5-product business starter bundle' },
    ] : []),
  ]

  if (step === 0) return (
    <div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:GOLD, marginBottom:'4px' }}>
        ⚡ {tier==='platinum'?'Platinum':'Gold'} Electric Mode
      </div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'16px' }}>
        {tier==='platinum' ? 'Unlimited creation · Distribution Rights · CEO Competition eligible' : 'AI creates complete products · Website builder · Promotion strategy'}
      </div>
      {tier==='platinum' && (
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'14px' }}>
          {['💎 Distribution Rights','👑 CEO Competition','🌐 Own Marketplace','📦 Bulk Creation'].map(badge => (
            <span key={badge} style={{ fontSize:'10px', fontWeight:700, padding:'3px 10px', background:`${GOLD}15`, border:`1px solid ${GOLD}30`, borderRadius:'20px', color:GOLD }}>{badge}</span>
          ))}
        </div>
      )}
      <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:'10px' }}>What do you want to create?</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {TYPES.map(p => (
          <button key={p.type} onClick={() => { setProductType(p.fmt); setStep(1) }}
            style={{ padding:'14px 16px', borderRadius:'12px', border:`1px solid ${GOLD}20`, background:`${GOLD}04`,
              cursor:'pointer', textAlign:'left', display:'flex', gap:'14px', alignItems:'flex-start' }}>
            <span style={{ fontSize:'24px', flexShrink:0 }}>{p.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:W }}>{p.type}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>{p.example}</div>
            </div>
            <span style={{ color:GOLD, fontSize:'16px', flexShrink:0 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )

  if (step === 1) return (
    <div>
      <button onClick={()=>setStep(0)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'13px', padding:0, marginBottom:'16px' }}>← Back</button>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:GOLD, marginBottom:'16px' }}>Describe your product</div>
      <StepBar steps={['Product type','Details','Create']} current={1} color={GOLD} />
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Topic / title idea:</label>
          <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. How to start a food business with R2,000" style={inp} /></div>
        <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Who is it for?</label>
          <input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="e.g. Unemployed person wanting to start a township food business" style={inp} /></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Price</label>
            <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="R299" style={inp} /></div>
          <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Market</label>
            <input value={market} onChange={e=>setMarket(e.target.value)} placeholder="e.g. Nigeria, Global, UK" style={inp} /></div>
        </div>
      </div>
      <button onClick={async () => {
        if (!topic.trim()) return
        setStep(2); setLoading(true)
        const r = await callManlaw('create_product', { topic, audience, format:productType, market, price, builderTier:tier })
        setProduct(r); setLoading(false)
      }} disabled={!topic.trim()} style={primaryBtn(GOLD,'#1E1245',!topic.trim())}>
        ⚡ Create My Complete Product →
      </button>
    </div>
  )

  if (step === 2) return (
    <div>
      {loading ? (
        <div style={{ textAlign:'center', padding:'48px 20px' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚡</div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:GOLD, marginBottom:'8px' }}>Creating Your Product</div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'24px' }}>AI is writing your complete product... 60-90 seconds</div>
          <div style={{ display:'flex', justifyContent:'center', gap:'6px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:GOLD, animation:`pulse 1.2s ${i*0.3}s infinite` }} />)}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
            <button onClick={()=>{setStep(1);setProduct('')}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'13px', padding:0 }}>← Edit</button>
          </div>
          <ResultCard result={product} color={GOLD} label={`✅ Your ${productType} — Complete`} />
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={()=>{setStep(0);setProduct('');setTopic('');setAudience('')}}
              style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1px solid ${GOLD}40`, background:`${GOLD}10`, color:GOLD, fontWeight:700, cursor:'pointer', fontSize:'13px' }}>
              ⚡ Create Another
            </button>
            <button onClick={()=>window.open('/marketplace','_blank')}
              style={{ flex:1, padding:'12px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:'#1E1245', fontWeight:900, cursor:'pointer', fontSize:'13px', fontFamily:'Cinzel,Georgia,serif' }}>
              🏪 List on Marketplace
            </button>
          </div>
          {tier==='platinum' && (
            <div style={{ marginTop:'12px', padding:'14px', background:'rgba(229,231,235,0.06)', border:'1px solid rgba(229,231,235,0.15)', borderRadius:'12px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#E2E8F0', marginBottom:'6px' }}>💎 Platinum — Additional Tools</div>
              <div style={{ display:'flex', gap:'8px' }}>
                <Link href="/ai-income/rocket" style={{ flex:1, padding:'10px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:'11px', fontWeight:700, textAlign:'center', textDecoration:'none' }}>
                  🌐 Open Rocket Mode
                </Link>
                <Link href="/compensation" style={{ flex:1, padding:'10px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:'11px', fontWeight:700, textAlign:'center', textDecoration:'none' }}>
                  🌍 Distribution Rights
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return null
}

// ════════════════════════════════════════════════════════════════════
// 🚀 ROCKET MODE (links to dedicated page)
// ════════════════════════════════════════════════════════════════════
function RocketMode({ tier }: { tier: string }) {
  const CONFIG: Record<string,{limit:string,extras:string[]}> = {
    silver_rocket:   { limit:'12 products/month',  extras:['AI market research','All product formats','Z2B Marketplace'] },
    gold_rocket:     { limit:'30 products/month',  extras:['Live global research','AI website builder','Sell anywhere + Marketplace','Demographic targeting'] },
    platinum_rocket: { limit:'Unlimited products', extras:['Bulk creation','Own branded marketplace','Full promotion strategy','Distribution Rights'] },
  }
  const c = CONFIG[tier] || CONFIG['silver_rocket']
  return (
    <div>
      <div style={{ textAlign:'center', padding:'24px 16px', marginBottom:'20px', background:'rgba(255,107,53,0.08)', border:'2px solid rgba(255,107,53,0.3)', borderRadius:'20px' }}>
        <div style={{ fontSize:'48px', marginBottom:'10px' }}>🚀</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:ROCKET, marginBottom:'4px' }}>Rocket Mode — {tier.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginBottom:'10px' }}>AI does everything. You just press Publish.</div>
        <div style={{ display:'inline-block', padding:'5px 16px', background:`${ROCKET}20`, border:`1px solid ${ROCKET}40`, borderRadius:'20px', fontSize:'12px', fontWeight:700, color:ROCKET }}>
          {c.limit}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'20px' }}>
        {c.extras.map((e,i) => (
          <div key={i} style={{ display:'flex', gap:'8px', alignItems:'center', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px' }}>
            <span style={{ color:ROCKET, fontWeight:700 }}>✓</span>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>{e}</span>
          </div>
        ))}
      </div>
      <Link href="/ai-income/rocket" style={{ display:'block', padding:'16px', borderRadius:'14px', border:'none', background:`linear-gradient(135deg,${ROCKET},#E55A2B)`, color:'#fff', fontWeight:900, fontSize:'15px', textAlign:'center', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
        🚀 Enter Rocket Mode →
      </Link>
      <Link href="/marketplace" style={{ display:'block', marginTop:'8px', padding:'12px', borderRadius:'10px', border:`1px solid ${ROCKET}30`, background:'transparent', color:ROCKET, fontWeight:700, fontSize:'13px', textAlign:'center', textDecoration:'none' }}>
        🏪 View Marketplace →
      </Link>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
function AIIncomeInner() {
  const [builderTier, setBuilderTier] = useState('free')
  const [loading,     setLoading]     = useState(true)
  const [vehicle,     setVehicle]     = useState('manual')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', user.id).single()
        const t = prof?.paid_tier || 'free'
        setBuilderTier(t)
        setVehicle(TIER_VEHICLE[t] || 'manual')
      }
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontFamily:'Georgia,serif', fontSize:'18px' }}>
      Loading your 4M Machine...
    </div>
  )

  const VEHICLE_CONFIG = [
    { id:'manual',    icon:'🚗', label:'Manual',    color:PURP,    tiers:['free','starter','bronze','copper'] },
    { id:'automatic', icon:'⚙️', label:'Automatic', color:'#0891B2', tiers:['silver'] },
    { id:'electric',  icon:'⚡', label:'Electric',  color:GOLD,    tiers:['gold','platinum'] },
    { id:'rocket',    icon:'🚀', label:'Rocket',    color:ROCKET,  tiers:['silver_rocket','gold_rocket','platinum_rocket'] },
  ]

  const activeVehicle = VEHICLE_CONFIG.find(v => v.id === vehicle) || VEHICLE_CONFIG[0]
  const rank = TIER_RANK[builderTier] || 0

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}`}</style>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Home</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:activeVehicle.color }}>
          {activeVehicle.icon} {activeVehicle.label} Mode
        </span>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:'10px', textTransform:'capitalize' }}>
            {builderTier.replace(/_/g,' ')}
          </span>
          <Link href="/ai-income/choose-plan" style={{ fontSize:'11px', color:GOLD, textDecoration:'none', fontWeight:700 }}>Upgrade →</Link>
        </div>
      </div>

      {/* Vehicle pill switcher */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:'6px', justifyContent:'center', flexWrap:'wrap' }}>
        {VEHICLE_CONFIG.map(v => {
          const maxTier = Math.max(...v.tiers.map(t => TIER_RANK[t] || 0))
          const locked  = rank < Math.min(...v.tiers.map(t => TIER_RANK[t] || 0))
          return (
            <button key={v.id} onClick={() => !locked && setVehicle(v.id)}
              style={{ padding:'7px 16px', borderRadius:'30px', cursor: locked ? 'default' : 'pointer',
                background: vehicle===v.id ? v.color : 'rgba(255,255,255,0.04)',
                border: vehicle===v.id ? `2px solid ${v.color}` : '1px solid rgba(255,255,255,0.1)',
                color: vehicle===v.id ? (v.id==='electric'?'#1E1245':'#fff') : locked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)',
                fontSize:'12px', fontWeight: vehicle===v.id ? 900 : 400, transition:'all 0.2s' }}>
              {v.icon} {v.label} {locked ? '🔒' : ''}
            </button>
          )
        })}
      </div>

      {/* Main content — full focus on selected mode */}
      <div style={{ maxWidth:'560px', margin:'0 auto', padding:'20px 16px 80px' }}>
        {vehicle === 'manual'    && <ManualMode    tier={builderTier} />}
        {vehicle === 'automatic' && <AutomaticMode tier={builderTier} />}
        {vehicle === 'electric'  && <ElectricMode  tier={builderTier} />}
        {vehicle === 'rocket'    && <RocketMode    tier={builderTier} />}
      </div>

      {/* Upgrade bar for lower tiers */}
      {rank < 4 && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'12px 16px', background:'linear-gradient(135deg,#1E1245,#0D0820)', borderTop:`1px solid ${GOLD}30`, display:'flex', alignItems:'center', gap:'12px', justifyContent:'center' }}>
          <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)' }}>
            {rank===0?'Upgrade to Starter to unlock all tools':rank===1?'Upgrade to Bronze for team tools + ISP':rank===2?'Upgrade to Silver for Automatic Mode':'Upgrade to Gold for Electric Mode'}
          </span>
          <Link href="/ai-income/choose-plan" style={{ padding:'8px 20px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'20px', color:'#1E1245', fontWeight:900, fontSize:'12px', textDecoration:'none', flexShrink:0 }}>
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  )
}

export default function AIIncomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading your 4M Machine...</div>}>
      <AIIncomeInner />
    </Suspense>
  )
}
