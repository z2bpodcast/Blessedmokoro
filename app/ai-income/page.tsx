'use client'
// FILE: app/ai-income/page.tsx
// Z2B 4M Income Execution System — Three Vehicles — patched 2026-04-21 06:52:31
// 🚗 Manual (R500) → ⚙️ Automatic (R2,500) → ⚡ Electric (R5,000+)

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Tab = 'offer'|'finder'|'post'|'reply'|'close'|'daily'|'referral'
type ReplyCategory = 'expensive'|'moreinfo'|'thinking'|'notinterested'|'howworks'
type Vehicle = 'manual'|'automatic'|'electric'

async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: any[] = [{ role: 'user', content: prompt }]
  const body: any = { model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages }
  if (systemPrompt) body.system = systemPrompt
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

const COACH_SYSTEM = `You are Coach Manlaw — The Executor. You are an AI business coach built for ONE purpose: ACTION → INCOME → EXECUTION.

Your personality:
- Execution-first. Never theory without action.
- Direct. No fluff. No motivation without a next step.
- South African context. Understand the market.
- Push back on excuses. Redirect to action.
- Sales conversion assistant AND mindset correction engine.

When someone hesitates about R500:
PRICE: R500 for 60 days of AI-powered income activation.
COST OF NOT JOINING: Working for someone else for life. No financial freedom. No purpose freedom. Missed opportunities daily.
REFRAME: "The PRICE is R500. The COST is your future lifestyle, freedom, and missed opportunity."

Always end with ONE specific action the person must take RIGHT NOW.`

const DAILY_TASKS = [
  { id:'post1',    icon:'📱', text:'Post on WhatsApp Status (morning)',        points:10 },
  { id:'post2',    icon:'📘', text:'Post in 2 Facebook Groups',                points:10 },
  { id:'contact1', icon:'💬', text:'Contact 10 people with your offer',        points:20 },
  { id:'follow',   icon:'🔄', text:'Follow up with yesterday\'s contacts',     points:15 },
  { id:'post3',    icon:'📱', text:'Post on WhatsApp Status (evening)',        points:10 },
  { id:'contact2', icon:'💬', text:'Contact 10 more people (new list)',        points:20 },
  { id:'close',    icon:'💰', text:'Attempt to close at least 1 client',      points:25 },
  { id:'refer',    icon:'🔗', text:'Share 4M referral link with 3 people',    points:10 },
]

// ── V2: AUTOMATIC — Product Multiplication Engine ─────────────────────────
const PRODUCT_SEEDS = [
  { icon:'💼', name:'WhatsApp Business Boost Pack',    price:'R150–R300' },
  { icon:'📄', name:'CV & Job Boost Kit',              price:'R100–R200' },
  { icon:'📱', name:'Social Media Content Pack',       price:'R200–R400' },
  { icon:'💬', name:'Customer Attraction Messages',    price:'R100–R200' },
  { icon:'🚀', name:'Side Hustle Starter Pack',        price:'R150–R300' },
]

// ── V3: ELECTRIC — Automation Templates ──────────────────────────────────
const AUTO_SEQUENCES = [
  {
    name: 'New Lead Welcome',
    trigger: 'Someone messages about your product',
    steps: [
      { delay:'0 min',  msg:'Thanks for reaching out! 🙌 I can help you with [product]. Let me send you the details right now.' },
      { delay:'2 min',  msg:'Here\'s exactly what you get: [product description + price]. Clients love this because it [key benefit].' },
      { delay:'5 min',  msg:'Quick question — are you available for me to set this up for you today or would tomorrow work better?' },
    ]
  },
  {
    name: '24-Hour Follow-Up',
    trigger: 'No response after initial message',
    steps: [
      { delay:'24 hrs', msg:'Hey [Name] 👋 Just checking if you saw my message about [product]. Happy to answer any questions!' },
      { delay:'48 hrs', msg:'[Name], last message from me — I\'m only taking 3 more clients this week. Would hate for you to miss out. Yes or no?' },
    ]
  },
  {
    name: 'Post-Sale Upsell',
    trigger: 'Client just paid',
    steps: [
      { delay:'0 min',  msg:'🎉 Welcome [Name]! Your [product] is being prepared. You\'ll receive it within [timeframe].' },
      { delay:'1 day',  msg:'How are you finding [product] so far? Many clients also upgrade to our [next product] — interested?' },
      { delay:'3 days', msg:'[Name], clients who add [bundle] usually earn R[amount] more per month. Want to see how?' },
    ]
  },
]

function AIIncomeInner() {
  const searchParams = useSearchParams()
  const ref          = searchParams.get('ref') || ''
  const activated    = searchParams.get('activated') === 'true'

  const [user,         setUser]         = useState<any>(null)
  const [profile,      setProfile]      = useState<any>(null)
  const [unlocked,     setUnlocked]     = useState(false)
  const [vehicle,      setVehicle]      = useState<Vehicle>('manual')
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState<Tab>('offer')
  const [aiLoading,    setAiLoading]    = useState(false)
  const [result,       setResult]       = useState('')

  // Manual (V1) states
  const [skill,        setSkill]        = useState('')
  const [location,     setLocation]     = useState('')
  const [offerDesc,    setOfferDesc]    = useState('')
  const [postType,     setPostType]     = useState<'whatsapp'|'facebook'|'dm'>('whatsapp')
  const [replyContext, setReplyContext] = useState('')
  const [replyCategory,setReplyCategory]= useState<ReplyCategory>('expensive')
  const [checked,      setChecked]      = useState<Record<string,boolean>>({})

  // Automatic (V2) states
  const [v2Product,    setV2Product]    = useState<number>(0)
  const [v2Mode,       setV2Mode]       = useState<'multiply'|'launch'|'sequence'>('multiply')
  const [v2Result,     setV2Result]     = useState('')
  const [v2Loading,    setV2Loading]    = useState(false)

  // Electric (V3) states
  const [v3Sequence,   setV3Sequence]   = useState<number>(0)
  const [v3Result,     setV3Result]     = useState('')
  const [v3Loading,    setV3Loading]    = useState(false)
  const [v3ProductName,setV3ProductName]= useState('')
  const [v3Price,      setV3Price]      = useState('')
  const [autoRunning,  setAutoRunning]  = useState(false)

  // 72-Hour Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardDay,    setOnboardDay]      = useState(1)
  const [onboardStep,   setOnboardStep]     = useState(0)
  const [onboardResult, setOnboardResult]   = useState('')
  const [onboardLoading,setOnboardLoading]  = useState(false)

  // Income Proof
  const [proofVisible,  setProofVisible]    = useState(false)

  // Coach Manlaw
  const [manlawOpen,   setManlawOpen]   = useState(false)
  const [manlawInput,  setManlawInput]  = useState('')
  const [manlawHist,   setManlawHist]   = useState<{role:string,text:string}[]>([])
  const [manlawLoading,setManlawLoading]= useState(false)

  // Payment
  const [paying,       setPaying]       = useState(false)
  const [payError,     setPayError]     = useState('')
  const [showReg,      setShowReg]      = useState(false)
  const [regName,      setRegName]      = useState('')
  const [regEmail,     setRegEmail]     = useState('')
  const [regWa,        setRegWa]        = useState('')
  const [regLoading,   setRegLoading]   = useState(false)

  // Referral
  const [refCopied,    setRefCopied]    = useState(false)
  const [myCommissions,setMyCommissions]= useState<any[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        const [{ data: prof }, { data: unlock }, { data: comms }] = await Promise.all([
          supabase.from('profiles').select('full_name,referral_code,paid_tier').eq('id', u.id).single(),
          supabase.from('ai_income_unlocks').select('*').eq('user_id', u.id).single(),
          supabase.from('ai_income_commissions').select('*').eq('referrer_id', u.id).order('created_at', { ascending: false }),
        ])
        setProfile(prof)
        if (unlock) setUnlocked(true)
        setMyCommissions(comms || [])
      }
      setLoading(false)
    })
  }, [])

  const refLink  = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/4m?ref=${profile?.referral_code || ''}`
  const totalEarned = myCommissions.filter(c => c.status === 'paid').reduce((s: number, c: any) => s + c.amount, 0)
  const pending     = myCommissions.filter(c => c.status === 'pending').reduce((s: number, c: any) => s + c.amount, 0)
  const totalPoints = DAILY_TASKS.reduce((sum, t) => checked[t.id] ? sum + t.points : sum, 0)

  // ── COACH MANLAW ──────────────────────────────────────
  const callManlaw = async (msg: string) => {
    if (!msg.trim()) return
    setManlawLoading(true)
    const history = manlawHist.map(h => ({ role: h.role === 'manlaw' ? 'assistant' : 'user', content: h.text }))
    history.push({ role: 'user', content: msg })
    const response = await callAI(msg, COACH_SYSTEM + '\n\nConversation so far:\n' + history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n'))
    setManlawHist(prev => [...prev, { role:'user', text:msg }, { role:'manlaw', text:response }])
    setManlawInput('')
    setManlawLoading(false)
  }

  // ── V1: MANUAL AI CALLS ───────────────────────────────
  const generateOffer = async () => {
    if (!skill.trim()) return
    setAiLoading(true); setResult('')
    const text = await callAI(`South African beginner wants to make money. Their skill: "${skill}". Location: "${location || 'South Africa'}".
Create a simple sellable offer. Format:
🎯 YOUR OFFER: [one sentence]
👥 TARGET CUSTOMER: [specific]
💰 PRICING: [R50–R500 range]
📱 HOW TO DELIVER: [3 steps max]
⚡ YOUR ONE-LINE PITCH: [copy-paste ready]`)
    setResult(text); setAiLoading(false)
  }

  const generateFinder = async () => {
    if (!skill.trim()) return
    setAiLoading(true); setResult('')
    const text = await callAI(`South African beginner. Offer: "${skill}". Give exact customer-finding plan:
📍 WHERE TO FIND CUSTOMERS:
1. WhatsApp: [specific action]
2. Facebook Groups: [which groups + what to post]
3. Local Network: [who to contact first]
📋 TODAY'S ACTION PLAN (next 2 hours): [5 numbered steps]
⚠️ AVOID: [2 common mistakes]`)
    setResult(text); setAiLoading(false)
  }

  const generatePost = async () => {
    if (!offerDesc.trim()) return
    setAiLoading(true); setResult('')
    const platforms: Record<string,string> = {
      whatsapp: 'WhatsApp Status (max 700 chars, casual, emoji-friendly)',
      facebook: 'Facebook Group post (slightly longer, includes call to action)',
      dm: 'Direct message to specific person (personal, not salesy)',
    }
    const text = await callAI(`Create a ${platforms[postType]} for: "${offerDesc}". South African audience. Simple language. Creates curiosity. Clear call to action. No hashtag spam. Feels human. Generate VERSION A and VERSION B.`)
    setResult(text); setAiLoading(false)
  }

  const generateReply = async () => {
    setAiLoading(true); setResult('')
    const cats: Record<ReplyCategory,string> = {
      expensive:'Customer said too expensive',
      moreinfo:'Customer asked for more info',
      thinking:'Customer said thinking about it',
      notinterested:'Customer said not interested',
      howworks:'Customer asked how it works',
    }
    const text = await callAI(`Sales coach. South African beginner. Situation: ${cats[replyCategory]}. ${replyContext ? `Context: "${replyContext}"` : ''}
💬 READY-TO-SEND REPLY: [exact copy-paste — natural, friendly]
🎯 CLOSING MOVE: [one sentence to keep conversation alive]
🔄 IF NO RESPONSE IN 24 HOURS: [follow-up message]`)
    setResult(text); setAiLoading(false)
  }

  const generateClose = async () => {
    if (!offerDesc.trim()) return
    setAiLoading(true); setResult('')
    const text = await callAI(`Help South African beginner close sale for: "${offerDesc}"
💰 CLOSING SCRIPT: [exact words to ask for payment]
⏰ URGENCY MESSAGE: [genuine reason to act now]
💳 PAYMENT INSTRUCTIONS: [how to ask naturally — SnapScan/EFT/cash]
🎉 AFTER THEY SAY YES: [exactly what to do next]`)
    setResult(text); setAiLoading(false)
  }

  // ── V2: AUTOMATIC AI CALLS ────────────────────────────
  const v2Multiply = async () => {
    setV2Loading(true); setV2Result('')
    const seed = PRODUCT_SEEDS[v2Product]
    const text = await callAI(`You are a digital product multiplication engine.
Seed product: "${seed.name}" (${seed.price})

Generate 5 NEW digital products derived from this one. Each must be:
- Sellable on WhatsApp/Facebook
- Deliverable digitally
- Targetted at South Africans
- Priced between R100–R500

For each product:
📦 PRODUCT NAME: 
💰 PRICE: 
👥 TARGET: 
📱 DELIVERY: 
⚡ LAUNCH MESSAGE (ready to send):
---`)
    setV2Result(text); setV2Loading(false)
  }

  const v2Launch = async () => {
    setV2Loading(true); setV2Result('')
    const seed = PRODUCT_SEEDS[v2Product]
    const text = await callAI(`1-Click Product Launch System for: "${seed.name}"

Generate ALL THREE:

📱 1. WHATSAPP STATUS POST:
[Ready to post — under 700 chars — creates curiosity]

💬 2. DIRECT MESSAGE SCRIPT:
[Personal message to send to 10 specific people]

📢 3. FACEBOOK GROUP POST:
[Slightly longer — includes price and call to action]

Then add:
👉 SEND THIS TO 10 PEOPLE NOW — [exact list of who to contact]

🤖 COACH MANLAW SAYS: "Tell me when you get replies. I will help you close."`)
    setV2Result(text); setV2Loading(false)
  }

  const v2Sequence = async () => {
    setV2Loading(true); setV2Result('')
    const seed = PRODUCT_SEEDS[v2Product]
    const text = await callAI(`Create a 5-day WhatsApp follow-up sequence for: "${seed.name}"

Each day: one message, clear purpose, specific timing.

Day 1 — Initial offer
Day 2 — Value/social proof
Day 3 — Overcome objection
Day 4 — Urgency/scarcity
Day 5 — Final close

Format each as:
📅 DAY [N] — [Purpose]
⏰ Send at: [time]
💬 Message: [exact copy-paste]`)
    setV2Result(text); setV2Loading(false)
  }

  // ── V3: ELECTRIC AI CALLS ─────────────────────────────
  const v3PersonalizeSequence = async () => {
    if (!v3ProductName.trim()) return
    setV3Loading(true); setV3Result('')
    const seq = AUTO_SEQUENCES[v3Sequence]
    const text = await callAI(`Personalize this automation sequence for my product.

My product: "${v3ProductName}"
My price: "${v3Price || 'see product'}"
Sequence type: "${seq.name}"
Trigger: "${seq.trigger}"

Rewrite each message template with MY specific product details. Keep the timing. Make it feel personal and South African. Add WhatsApp-friendly formatting.

${seq.steps.map((s, i) => `Step ${i+1} (${s.delay}): "${s.msg}"`).join('\n')}`)
    setV3Result(text); setV3Loading(false)
  }

  const v3BuildAutomation = async () => {
    if (!v3ProductName.trim()) return
    setV3Loading(true); setV3Result('')
    const text = await callAI(`Build a complete WhatsApp automation blueprint for:
Product: "${v3ProductName}"
Price: "${v3Price || 'R100–R300'}"

Create:

⚡ DAILY AUTOMATION SCHEDULE:
[What runs automatically each day — morning, afternoon, evening]

📊 WEEKLY INCOME TRACKER:
[Simple system to track leads, conversations, closes, income]

🔁 MULTIPLICATION TRIGGER:
[When to create the next product and what it should be]

📈 30-DAY INCOME PROJECTION:
[Conservative estimate based on 10-20 daily contacts]

This is the Electric Mode — the 4M Machine running with minimal effort.`)
    setV3Result(text); setV3Loading(false)
  }

  // ── PAYMENT ──────────────────────────────────────────
  const handlePay = async () => {
    if (!user) { setShowReg(true); return }
    setPaying(true); setPayError('')
    try {
      const res = await fetch('/api/yoco', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action:'create_checkout', user_id:user.id, ref_code:ref, tier:'ai_income' }),
      })
      const data = await res.json()
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
      else { setPayError(data.error || 'Payment failed'); setPaying(false) }
    } catch (e: any) { setPayError(e.message); setPaying(false) }
  }

  const handleRegPay = async () => {
    if (!regName.trim() || !regEmail.trim() || !regWa.trim()) return
    setRegLoading(true)
    const pwd = `Z2B${Math.random().toString(36).slice(2,10).toUpperCase()}!`
    const { data: authData, error } = await supabase.auth.signUp({
      email: regEmail.trim().toLowerCase(), password: pwd,
      options: { data: { full_name: regName.trim(), whatsapp: regWa.trim(), referred_by: ref||null } },
    })
    if (error && !error.message.toLowerCase().includes('already')) { setPayError(error.message); setRegLoading(false); return }
    const uid = authData?.user?.id
    if (!uid) { setPayError('Registration failed'); setRegLoading(false); return }
    const res = await fetch('/api/yoco', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'create_checkout', user_id:uid, ref_code:ref, tier:'ai_income' }),
    })
    const data = await res.json()
    if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
    else { setPayError(data.error||'Payment failed'); setRegLoading(false) }
  }

  // ── STYLES ────────────────────────────────────────────
  const BG   = '#09060F'
  const GOLD = '#D4AF37'
  const PURP = '#4C1D95'
  const GRN  = '#10B981'

  const tabBtn = (id: Tab, icon: string, label: string) => (
    <button key={id} onClick={() => { setTab(id); setResult('') }}
      style={{ padding:'9px 13px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, whiteSpace:'nowrap' as const,
        background: tab===id ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
        border: tab===id ? `1.5px solid ${GOLD}` : '1.5px solid rgba(255,255,255,0.08)',
        color: tab===id ? GOLD : 'rgba(255,255,255,0.5)' }}>
      {icon} {label}
    </button>
  )

  const inp = { width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', color:'#fff', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const }
  const primaryBtn = (loading=false, disabled=false) => ({ padding:'14px 28px', background: loading||disabled ? 'rgba(76,29,149,0.4)' : `linear-gradient(135deg,${PURP},#7C3AED)`, border:`2px solid ${GOLD}`, borderRadius:'12px', color:'#FDE68A', fontWeight:700, fontSize:'15px', cursor: loading||disabled ? 'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', width:'100%' as const })

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontFamily:'Georgia,serif' }}>Loading...</div>
  )

  // ── LANDING (not unlocked) ────────────────────────────
  if (!unlocked) return (
    <div style={{ minHeight:'100vh', background:BG, color:'#F0EEF8', fontFamily:'Georgia,serif' }}>
      <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" style={{ fontSize:'14px', fontWeight:700, color:GOLD, textDecoration:'none' }}>Z2B 4M</Link>
        {user ? <Link href="/dashboard" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Dashboard →</Link>
               : <Link href="/login?redirect=/ai-income" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Sign In</Link>}
      </div>
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'48px 20px 80px', textAlign:'center' }}>
        <div style={{ fontSize:'11px', letterSpacing:'4px', color:'rgba(212,175,55,0.5)', marginBottom:'16px', textTransform:'uppercase' }}>Z2B 4M Income Execution System</div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(28px,5vw,40px)', fontWeight:900, color:'#fff', margin:'0 0 12px' }}>
          Start Manual.<br/><span style={{ color:GOLD }}>Upgrade to Electric.</span>
        </h1>
        <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.6)', marginBottom:'32px', lineHeight:1.8 }}>
          R500 unlocks your 4M Machine. Drive it manually to your first income. Upgrade when you are ready for automation.
        </p>
        {payError && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'10px', marginBottom:'16px', fontSize:'13px', color:'#FCA5A5' }}>⚠️ {payError}</div>}
        <button onClick={handlePay} disabled={paying} style={primaryBtn(paying)}>
          {paying ? 'Setting up...' : '🚀 Start 4M Machine — R500'}
        </button>
        <div style={{ marginTop:'12px', fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>
          60-day access · R500/month after · <Link href="/4m" style={{ color:GOLD, textDecoration:'none' }}>See full details →</Link>
        </div>
      </div>

      {/* Registration modal */}
      {showReg && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'linear-gradient(160deg,#0F0820,#1E1245)', border:'2px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'32px', maxWidth:'420px', width:'100%', position:'relative' }}>
            <button onClick={() => setShowReg(false)} style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'20px', cursor:'pointer' }}>×</button>
            <h2 style={{ fontSize:'18px', fontWeight:700, color:'#fff', margin:'0 0 20px', textAlign:'center' }}>Create Your Account</h2>
            {payError && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'10px', marginBottom:'14px', fontSize:'13px', color:'#FCA5A5' }}>⚠️ {payError}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
              {[{l:'Full Name',v:regName,s:setRegName,p:'Your full name',t:'text'},{l:'Email',v:regEmail,s:setRegEmail,p:'your@email.com',t:'email'},{l:'WhatsApp',v:regWa,s:setRegWa,p:'+27 or 0XX XXX XXXX',t:'tel'}].map(({l,v,s,p,t}) => (
                <div key={l}>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', letterSpacing:'1px', textTransform:'uppercase' }}>{l} *</label>
                  <input type={t} value={v} onChange={e => s(e.target.value)} placeholder={p} style={inp} />
                </div>
              ))}
            </div>
            <button onClick={handleRegPay} disabled={regLoading} style={primaryBtn(regLoading)}>
              {regLoading ? 'Processing...' : 'Register & Pay R500 →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // ── MAIN APP (unlocked) ───────────────────────────────
  const VEHICLES = [
    { id:'manual',    icon:'🚗', label:'Manual Mode',    sub:'You drive everything yourself', color:'#7C3AED', tier:'Starter · Bronze · Copper',
      truth:'This is where you LEARN how to make money. Slower. Requires effort. But builds real understanding.', upgrade:'Tired of doing everything manually? Upgrade to Automatic Mode →' },
    { id:'automatic', icon:'⚙️', label:'Automatic Mode', sub:'The system starts helping you drive', color:'#0891B2', tier:'Silver ⭐ — MOST IMPORTANT',
      truth:'From struggle to FLOW. Your 4M Machine starts working WITH you. Faster creation. Assisted messaging. Follow-ups begin.', upgrade:'Ready for the system to run while you sleep? Upgrade to Electric Mode →' },
    { id:'electric',  icon:'⚡', label:'Electric Mode',  sub:'The system drives most of the journey', color:GOLD, tier:'Gold · Platinum',
      truth:'Your 4M Machine runs with MINIMAL EFFORT. Multiple income streams. Daily automation. Platform-level leverage.', upgrade:'You have built a self-sustaining income system. Scale with Z2B Table Banquet →' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:BG, color:'#F0EEF8', fontFamily:'Georgia,serif' }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(9,6,15,0.95)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>← Dashboard</Link>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:GOLD }}>🤖 Z2B 4M Income System</div>
        <button onClick={() => setManlawOpen(true)}
          style={{ padding:'7px 14px', background:'rgba(76,29,149,0.2)', border:'1px solid rgba(76,29,149,0.4)', borderRadius:'20px', color:'#C4B5FD', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
          🤖 Coach
        </button>
      </div>

      {/* Activation banner */}
      {activated && (
        <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'12px', padding:'14px 20px', margin:'16px 16px 0', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'20px' }}>🎉</span>
          <div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#6EE7B7' }}>Payment successful — your 4M Machine is activated!</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>Start with the Manual Vehicle. Use the Offer Generator to create your first sellable offer today.</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:'820px', margin:'0 auto', padding:'20px 16px 80px' }}>

        {/* ── VEHICLE SELECTOR ── */}
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px', textAlign:'center' }}>Choose Your 4M Machine Level</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
            {VEHICLES.map(v => (
              <button key={v.id} onClick={() => setVehicle(v.id as Vehicle)}
                style={{ padding:'16px 10px', borderRadius:'14px', cursor:'pointer', fontFamily:'Georgia,serif', textAlign:'center' as const, transition:'all 0.2s',
                  background: vehicle===v.id ? `${v.color}18` : 'rgba(255,255,255,0.03)',
                  border: vehicle===v.id ? `2px solid ${v.color}` : '2px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:'24px', marginBottom:'6px' }}>{v.icon}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color: vehicle===v.id ? v.color : '#fff', marginBottom:'2px' }}>{v.label} Mode</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'4px' }}>{v.sub}</div>
                <div style={{ fontSize:'10px', color: vehicle===v.id ? v.color : 'rgba(255,255,255,0.25)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>{v.tier}</div>
              </button>
            ))}
          </div>
          {/* Description strip */}
          {VEHICLES.filter(v => v.id === vehicle).map(v => (
            <div key={v.id} style={{ marginTop:'12px', background:'rgba(255,255,255,0.03)', border:`1px solid ${v.color}22`, borderRadius:'12px', padding:'14px 18px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:v.color, marginBottom:'4px' }}>{v.icon} {v.label}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:'8px' }}>{v.truth}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', fontStyle:'italic', cursor:'pointer' }}
                onClick={() => { const next = vehicle==='manual'?'automatic':vehicle==='automatic'?'electric':'manual'; setVehicle(next as Vehicle) }}>
                {v.upgrade}
              </div>
            </div>
          ))}
        </div>

        {/* ── 72-HOUR ONBOARDING PROMPT ── */}
        {!showOnboarding && (
          <div style={{ marginBottom:'20px', background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.06))', border:'2px solid rgba(16,185,129,0.3)', borderRadius:'16px', padding:'18px 20px', display:'flex', alignItems:'center', gap:'16px', cursor:'pointer' }}
            onClick={() => setShowOnboarding(true)}>
            <div style={{ fontSize:'32px', flexShrink:0, animation:'pulse 2s infinite' }}>🎯</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>Start Here — Your First R300 in 72 Hours</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>3-day guided action plan · No guessing · Just follow the steps</div>
            </div>
            <div style={{ fontSize:'20px', color:'#6EE7B7' }}>→</div>
          </div>
        )}

        {/* ── 72-HOUR ONBOARDING MODAL ── */}
        {showOnboarding && (
          <div style={{ marginBottom:'24px', background:'rgba(9,6,15,0.95)', border:'2px solid rgba(16,185,129,0.4)', borderRadius:'20px', padding:'24px', position:'relative' }}>
            <button onClick={() => setShowOnboarding(false)} style={{ position:'absolute', top:'14px', right:'16px', background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'20px', cursor:'pointer' }}>×</button>

            {/* Day tabs */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              {[{d:1,icon:'🏗️',label:'Day 1 — Build'},{d:2,icon:'📣',label:'Day 2 — Market'},{d:3,icon:'💰',label:'Day 3 — Close'}].map(({d,icon,label}) => (
                <button key={d} onClick={() => { setOnboardDay(d); setOnboardStep(0); setOnboardResult('') }}
                  style={{ flex:1, padding:'10px 8px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, textAlign:'center' as const,
                    background: onboardDay===d ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                    border: onboardDay===d ? '1.5px solid #10B981' : '1.5px solid rgba(255,255,255,0.08)',
                    color: onboardDay===d ? '#6EE7B7' : 'rgba(255,255,255,0.5)' }}>
                  {icon}<br/>{label}
                </button>
              ))}
            </div>

            {/* Day 1 — Setup & Creation */}
            {onboardDay === 1 && (
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>🏗️ Day 1 — Setup & Create Your First Product</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>Goal: Have ONE sellable product ready by tonight</div>
                {[
                  { step:1, icon:'🧠', title:'Choose what to sell', action:'Tell me 3 things you are good at — I will pick the best one to turn into money', btn:'Generate My Product', prompt:'The user needs to choose their first digital product to sell. Ask them: "Tell me 3 things you are good at or have access to." Then immediately give them ONE specific product they can sell tomorrow, with a price, a one-line pitch, and who to sell it to. Be direct. South African context. Max 4 lines total.' },
                  { step:2, icon:'💰', title:'Set your price', action:'Pricing made simple: R100 = beginners · R200 = most products · R300 = time-intensive', btn:null, prompt:null },
                  { step:3, icon:'📋', title:'Write your offer in one sentence', action:'Example: "I write WhatsApp messages that bring you customers — R150, done same day"', btn:'Write My Offer Line', prompt:'Write ONE selling sentence for a beginner South African. Format: "I [do something] that [solves a problem] — R[price], [delivery timeframe]". Give 3 variations they can choose from. Maximum 4 lines total. No preamble.' },
                ].map(({step, icon, title, action, btn, prompt}) => (
                  <div key={step} style={{ display:'flex', gap:'12px', marginBottom:'14px', padding:'14px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#6EE7B7', flexShrink:0 }}>{step}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                        <span style={{ fontSize:'16px' }}>{icon}</span>
                        <span style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{title}</span>
                      </div>
                      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom: btn ? '10px' : '0' }}>{action}</div>
                      {btn && prompt && (
                        <>
                          {onboardStep === step && onboardResult && (
                            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', padding:'12px', fontSize:'13px', color:'rgba(255,255,255,0.85)', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:'8px' }}>
                              {onboardResult}
                              <button onClick={() => navigator.clipboard.writeText(onboardResult)} style={{ marginTop:'8px', padding:'6px 14px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px', color:'#6EE7B7', fontSize:'11px', fontWeight:700, cursor:'pointer', display:'block' }}>📋 Copy</button>
                            </div>
                          )}
                          <button onClick={async () => { setOnboardStep(step); setOnboardLoading(true); setOnboardResult(''); const r = await callAI(prompt); setOnboardResult(r); setOnboardLoading(false) }} disabled={onboardLoading}
                            style={{ padding:'8px 16px', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px', color:'#6EE7B7', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                            {onboardLoading && onboardStep===step ? '🤖 Generating...' : `✨ ${btn}`}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Day 2 — Marketing */}
            {onboardDay === 2 && (
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>📣 Day 2 — Get Your First Leads</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>Goal: 10 people have heard about your offer by tonight</div>
                {[
                  { step:1, icon:'📱', title:'Post on WhatsApp Status', action:'Your status is your free billboard — 200+ people see it daily', btn:'Generate My Status Post', prompt:'Write a WhatsApp Status post for a South African beginner selling a digital service. It must create curiosity without revealing the price. Under 100 words. No hashtags. Ends with "Message me to find out more." Give 2 versions: VERSION A and VERSION B.' },
                  { step:2, icon:'💬', title:'Message 10 people directly', action:'Not random strangers — people who know you. Family, friends, colleagues, neighbours', btn:'Write My DM Script', prompt:'Write a direct WhatsApp message for a South African beginner. To someone they know (friend, family, colleague). Offering a simple digital service. Must feel personal, not salesy. Under 60 words. Give ONE message they can personalise with the name at the start.' },
                  { step:3, icon:'📘', title:'Post in 2 Facebook Groups', action:'Join local community groups, business groups, or buy-and-sell groups near you', btn:'Write My Facebook Post', prompt:'Write a Facebook Group post for a South African beginner. Offering a simple digital service. Must generate comments and enquiries. Under 120 words. Ends with a clear call to action.' },
                ].map(({step, icon, title, action, btn, prompt}) => (
                  <div key={step} style={{ display:'flex', gap:'12px', marginBottom:'14px', padding:'14px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(8,145,178,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#38BDF8', flexShrink:0 }}>{step}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                        <span style={{ fontSize:'16px' }}>{icon}</span>
                        <span style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{title}</span>
                      </div>
                      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'10px' }}>{action}</div>
                      {onboardStep === step+10 && onboardResult && (
                        <div style={{ background:'rgba(8,145,178,0.08)', border:'1px solid rgba(8,145,178,0.2)', borderRadius:'10px', padding:'12px', fontSize:'13px', color:'rgba(255,255,255,0.85)', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:'8px' }}>
                          {onboardResult}
                          <button onClick={() => navigator.clipboard.writeText(onboardResult)} style={{ marginTop:'8px', padding:'6px 14px', background:'rgba(8,145,178,0.1)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'11px', fontWeight:700, cursor:'pointer', display:'block' }}>📋 Copy</button>
                        </div>
                      )}
                      <button onClick={async () => { setOnboardStep(step+10); setOnboardLoading(true); setOnboardResult(''); const r = await callAI(prompt); setOnboardResult(r); setOnboardLoading(false) }} disabled={onboardLoading}
                        style={{ padding:'8px 16px', background:'rgba(8,145,178,0.15)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                        {onboardLoading && onboardStep===step+10 ? '🤖 Generating...' : `✨ ${btn}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Day 3 — Close */}
            {onboardDay === 3 && (
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>💰 Day 3 — Close Your First Sale</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>Goal: At least ONE person pays you today</div>
                {[
                  { step:1, icon:'🔄', title:"Follow up with yesterday's leads", action:'Anyone who did not reply gets one more message — warm, not pushy', btn:'Write My Follow-Up', prompt:'Write a WhatsApp follow-up message for a South African beginner. The recipient showed interest yesterday but did not respond. Must be warm, short, and create light urgency. Under 40 words. One message only.' },
                  { step:2, icon:'💸', title:'Handle the "too expensive" reply', action:'This is the most common objection — handle it right and you close the sale', btn:'Handle Objection', prompt:'Write a reply to a South African customer who said "too expensive" about a R150 digital service. The reply must reframe value, not drop the price. Under 50 words. Ends with a question that reopens the conversation.' },
                  { step:3, icon:'✅', title:'Ask for the sale directly', action:'Most beginners wait to be asked — you must ask. Here is how.', btn:'Write My Closing Message', prompt:'Write a closing WhatsApp message for a South African beginner. The customer is interested but has not committed. The message must ask for the sale directly, make it easy to say yes, and include a simple payment instruction (SnapScan/EFT). Under 60 words.' },
                ].map(({step, icon, title, action, btn, prompt}) => (
                  <div key={step} style={{ display:'flex', gap:'12px', marginBottom:'14px', padding:'14px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(212,175,55,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>{step}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                        <span style={{ fontSize:'16px' }}>{icon}</span>
                        <span style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{title}</span>
                      </div>
                      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'10px' }}>{action}</div>
                      {onboardStep === step+20 && onboardResult && (
                        <div style={{ background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'10px', padding:'12px', fontSize:'13px', color:'rgba(255,255,255,0.85)', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:'8px' }}>
                          {onboardResult}
                          <button onClick={() => navigator.clipboard.writeText(onboardResult)} style={{ marginTop:'8px', padding:'6px 14px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'8px', color:'#D4AF37', fontSize:'11px', fontWeight:700, cursor:'pointer', display:'block' }}>📋 Copy</button>
                        </div>
                      )}
                      <button onClick={async () => { setOnboardStep(step+20); setOnboardLoading(true); setOnboardResult(''); const r = await callAI(prompt); setOnboardResult(r); setOnboardLoading(false) }} disabled={onboardLoading}
                        style={{ padding:'8px 16px', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'8px', color:'#D4AF37', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                        {onboardLoading && onboardStep===step+20 ? '🤖 Generating...' : `✨ ${btn}`}
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop:'8px', padding:'14px', background:'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.06))', border:'2px solid rgba(212,175,55,0.3)', borderRadius:'12px', textAlign:'center' }}>
                  <div style={{ fontSize:'20px', marginBottom:'4px' }}>🏆</div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#D4AF37' }}>If you followed all 3 days — you earned today.</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginTop:'4px' }}>Repeat tomorrow. The system compounds.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ VEHICLE 1: MANUAL ══ */}
        {vehicle === 'manual' && (
          <div>
            {/* API Power Banner */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px', padding:'12px 14px', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.15)', borderRadius:'12px', alignItems:'center' }}>
              <span style={{ fontSize:'11px', color:'rgba(124,58,237,0.6)', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginRight:'4px' }}>Powered by:</span>
              {[['🤖','Claude AI','#7C3AED'],['🎙️','ElevenLabs','#E11D48'],['📧','Resend','#0891B2']].map(([icon,name,color]) => (
                <span key={name as string} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px', background:`${color as string}12`, border:`1px solid ${color as string}30`, borderRadius:'20px', fontSize:'11px', color:color as string, fontWeight:700 }}>
                  {icon} {name}
                </span>
              ))}
            </div>
            <div style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'4px', marginBottom:'20px' }}>
              {tabBtn('offer',    '🧠', 'Offer')}
              {tabBtn('finder',   '📲', 'Finder')}
              {tabBtn('post',     '✍️', 'Posts')}
              {tabBtn('reply',    '💬', 'Replies')}
              {tabBtn('close',    '💸', 'Close')}
              {tabBtn('daily',    '🔁', 'Daily')}
              {tabBtn('referral', '🔗', 'Referral')}
            </div>

            {/* Offer Generator */}
            {tab === 'offer' && (
              <div>
                <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>🧠 AI Offer Generator</h2>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Tell the AI what you can do — it creates your sellable offer.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
                  <div>
                    <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your Skill or Resource *</label>
                    <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="e.g. I can cook, I have a car, I know Excel, I can do hair..." style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your Area / Context</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Soweto, online, Pretoria CBD..." style={inp} />
                  </div>
                </div>
                <button onClick={generateOffer} disabled={aiLoading||!skill.trim()} style={{ ...primaryBtn(aiLoading, !skill.trim()), marginBottom:'16px' }}>
                  {aiLoading ? '🤖 Generating your offer...' : '🧠 Generate My Offer'}
                </button>
                {result && (
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'14px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>
                    {result}
                    <button onClick={() => { navigator.clipboard.writeText(result); setOfferDesc(result.split('\n')[1]||result) }}
                      style={{ marginTop:'12px', padding:'8px 18px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'8px', color:GOLD, fontSize:'12px', fontWeight:700, cursor:'pointer', display:'block' }}>
                      📋 Copy & Use in Posts
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Customer Finder */}
            {tab === 'finder' && (
              <div>
                <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>📲 AI Customer Finder</h2>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Tell AI your offer — get an exact plan to find your first customers today.</p>
                <div style={{ marginBottom:'12px' }}>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your Offer</label>
                  <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="e.g. I do home cleaning for R200 in Soweto" style={inp} />
                </div>
                <button onClick={generateFinder} disabled={aiLoading||!skill.trim()} style={{ ...primaryBtn(aiLoading,!skill.trim()), marginBottom:'16px' }}>
                  {aiLoading ? '🤖 Finding your customers...' : '📲 Find My Customers'}
                </button>
                {result && <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'14px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>{result}</div>}
              </div>
            )}

            {/* Post Generator */}
            {tab === 'post' && (
              <div>
                <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>✍️ AI Post & Message Generator</h2>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Generate ready-to-post content for WhatsApp, Facebook or direct messages.</p>
                <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
                  {[['whatsapp','📱 WhatsApp'],['facebook','📘 Facebook'],['dm','💬 Direct Message']].map(([val,lbl]) => (
                    <button key={val} onClick={() => setPostType(val as any)}
                      style={{ flex:1, padding:'10px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700,
                        background: postType===val?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)',
                        border: postType===val?`1.5px solid ${GOLD}`:'1.5px solid rgba(255,255,255,0.08)',
                        color: postType===val?GOLD:'rgba(255,255,255,0.5)' }}>{lbl}</button>
                  ))}
                </div>
                <div style={{ marginBottom:'12px' }}>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Describe Your Offer</label>
                  <textarea value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="e.g. CV writing for R150. Done same day via WhatsApp." rows={3} style={{ ...inp, resize:'vertical' as const }} />
                </div>
                <button onClick={generatePost} disabled={aiLoading||!offerDesc.trim()} style={{ ...primaryBtn(aiLoading,!offerDesc.trim()), marginBottom:'16px' }}>
                  {aiLoading ? '🤖 Writing your post...' : '✍️ Generate Post'}
                </button>
                {result && (
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(76,29,149,0.35)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'14px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>
                    {result}
                    <button onClick={() => navigator.clipboard.writeText(result)}
                      style={{ marginTop:'12px', padding:'8px 18px', background:'rgba(76,29,149,0.15)', border:'1px solid rgba(76,29,149,0.3)', borderRadius:'8px', color:'#C4B5FD', fontSize:'12px', fontWeight:700, cursor:'pointer', display:'block' }}>
                      📋 Copy Post
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reply Helper */}
            {tab === 'reply' && (
              <div>
                <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>💬 AI Sales Reply System</h2>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Customer responded? Select their reaction — get your perfect reply.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
                  {([['expensive','💸','Too Expensive'],['moreinfo','📋','Send More Info'],['thinking','🤔','Thinking About It'],['notinterested','❌','Not Interested'],['howworks','❓','How Does It Work']] as [ReplyCategory,string,string][]).map(([val,icon,lbl]) => (
                    <button key={val} onClick={() => setReplyCategory(val)}
                      style={{ padding:'12px 16px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'14px', fontWeight:700, textAlign:'left' as const,
                        background: replyCategory===val?'rgba(212,175,55,0.1)':'rgba(255,255,255,0.03)',
                        border: replyCategory===val?`1.5px solid ${GOLD}`:'1.5px solid rgba(255,255,255,0.07)',
                        color: replyCategory===val?GOLD:'rgba(255,255,255,0.6)' }}>
                      {icon} {lbl}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom:'12px' }}>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Extra Context (optional)</label>
                  <input value={replyContext} onChange={e => setReplyContext(e.target.value)} placeholder="e.g. I am selling CV writing at R150" style={inp} />
                </div>
                <button onClick={generateReply} disabled={aiLoading} style={{ ...primaryBtn(aiLoading), marginBottom:'16px' }}>
                  {aiLoading ? '🤖 Generating reply...' : '💬 Get My Reply'}
                </button>
                {result && (
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'14px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>
                    {result}
                    <button onClick={() => navigator.clipboard.writeText(result)}
                      style={{ marginTop:'12px', padding:'8px 18px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px', color:'#6EE7B7', fontSize:'12px', fontWeight:700, cursor:'pointer', display:'block' }}>
                      📋 Copy Reply
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Closing Assistant */}
            {tab === 'close' && (
              <div>
                <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>💸 AI Closing Assistant</h2>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Get the exact words to close the sale and collect payment confidently.</p>
                <div style={{ marginBottom:'12px' }}>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your Offer</label>
                  <input value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="e.g. Logo design for R300, delivered in 24 hours" style={inp} />
                </div>
                <button onClick={generateClose} disabled={aiLoading||!offerDesc.trim()} style={{ ...primaryBtn(aiLoading,!offerDesc.trim()), marginBottom:'16px' }}>
                  {aiLoading ? '🤖 Writing closing script...' : '💸 Get Closing Script'}
                </button>
                {result && <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'14px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>{result}</div>}
              </div>
            )}

            {/* Daily Engine */}
            {tab === 'daily' && (
              <div>
                <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>🔁 Daily R300/Day Engine</h2>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>Complete today's checklist. Consistency is the only secret.</p>
                <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                    <span style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>Today Points</span>
                    <span style={{ fontSize:'20px', fontWeight:900, color: totalPoints>=80?'#6EE7B7':totalPoints>=40?GOLD:'rgba(255,255,255,0.5)' }}>{totalPoints}/120</span>
                  </div>
                  <div style={{ height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(totalPoints/120)*100}%`, background:`linear-gradient(90deg,${PURP},${GRN})`, borderRadius:'4px', transition:'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'6px' }}>
                    {totalPoints>=100?'🏆 Excellent! You are on track for R300+':totalPoints>=60?'💪 Good progress — keep going!':'⚡ Get started — your R300 day begins now'}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {DAILY_TASKS.map(task => (
                    <div key={task.id} onClick={() => setChecked(prev => ({...prev,[task.id]:!prev[task.id]}))}
                      style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', background:checked[task.id]?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.03)', border:`1px solid ${checked[task.id]?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.07)'}`, borderRadius:'12px', cursor:'pointer' }}>
                      <div style={{ width:'24px', height:'24px', borderRadius:'6px', border:`2px solid ${checked[task.id]?GRN:'rgba(255,255,255,0.2)'}`, background:checked[task.id]?GRN:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {checked[task.id] && <span style={{ color:'#fff', fontSize:'14px' }}>✓</span>}
                      </div>
                      <span style={{ fontSize:'18px', flexShrink:0 }}>{task.icon}</span>
                      <span style={{ flex:1, fontSize:'14px', color:checked[task.id]?'rgba(255,255,255,0.5)':'#fff', textDecoration:checked[task.id]?'line-through':'none' }}>{task.text}</span>
                      <span style={{ fontSize:'12px', fontWeight:700, color:checked[task.id]?GRN:'rgba(255,255,255,0.3)' }}>+{task.points}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referral */}
            {tab === 'referral' && (
              <div>
                <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>🔗 Referral Booster System</h2>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Earn R200 for every person you refer to the 4M system.</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'20px' }}>
                  {[{l:'Total Referrals',v:myCommissions.length,c:'#7C3AED'},{l:'Earned (paid)',v:`R${totalEarned}`,c:GRN},{l:'Pending',v:`R${pending}`,c:GOLD}].map(({l,v,c}) => (
                    <div key={l} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${c}22`, borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                      <div style={{ fontSize:'22px', fontWeight:900, color:c }}>{v}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', marginTop:'2px', textTransform:'uppercase', letterSpacing:'1px' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'rgba(212,175,55,0.06)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'14px', padding:'18px', marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.6)', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your 4M Referral Link</div>
                  <div style={{ fontSize:'13px', color:'rgba(212,175,55,0.8)', fontFamily:'monospace', wordBreak:'break-all', marginBottom:'12px' }}>{refLink}</div>
                  <button onClick={() => { navigator.clipboard.writeText(refLink); setRefCopied(true); setTimeout(()=>setRefCopied(false),2500) }}
                    style={{ padding:'10px 20px', background:refCopied?'rgba(16,185,129,0.1)':'rgba(212,175,55,0.1)', border:`1px solid ${refCopied?'rgba(16,185,129,0.3)':'rgba(212,175,55,0.3)'}`, borderRadius:'10px', color:refCopied?'#6EE7B7':GOLD, fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                    {refCopied?'✅ Link Copied!':'📋 Copy Link'}
                  </button>
                </div>
                {/* Upgrade nudge */}
                <div style={{ background:'linear-gradient(135deg,rgba(8,145,178,0.1),rgba(8,145,178,0.06))', border:'2px solid rgba(8,145,178,0.3)', borderRadius:'14px', padding:'20px 20px' }}>
                  <div style={{ fontSize:'11px', color:'rgba(8,145,178,0.6)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>NEXT LEVEL AWAITS</div>
                  <div style={{ fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>⚙️ Tired of doing everything manually?</div>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:1.7, margin:'0 0 14px' }}>
                    Upgrade to Silver — your 4M Machine starts working WITH you. Product multiplication, 1-click launch packs, 5-day follow-up sequences, and Buffer auto-posting. From struggle to FLOW.
                  </p>
                  <Link href="/pricing?power=automatic" style={{ display:'inline-block', padding:'11px 26px', background:'linear-gradient(135deg,#0891B2,#0284C7)', border:'2px solid #38BDF8', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                    ⚙️ Upgrade to Automatic Mode (Silver) →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ VEHICLE 2: AUTOMATIC ══ */}
        {vehicle === 'automatic' && (
          <div>
            {/* API Power Banner */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px', padding:'12px 14px', background:'rgba(8,145,178,0.06)', border:'1px solid rgba(8,145,178,0.15)', borderRadius:'12px', alignItems:'center' }}>
              <span style={{ fontSize:'11px', color:'rgba(8,145,178,0.6)', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginRight:'4px' }}>Powered by:</span>
              {[['🤖','Claude AI','#0891B2'],['📅','Buffer','#0891B2'],['🔗','Make.com','#6D28D9'],['🎨','Canva API','#00C4CC'],['📧','Resend','#059669']].map(([icon,name,color]) => (
                <span key={name as string} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px', background:`${color as string}12`, border:`1px solid ${color as string}30`, borderRadius:'20px', fontSize:'11px', color:color as string, fontWeight:700 }}>
                  {icon} {name}
                </span>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px', overflowX:'auto' }}>
              {[['multiply','🔁 Multiply Products'],['launch','🚀 1-Click Launch'],['sequence','📅 Follow-Up Sequence']].map(([val,lbl]) => (
                <button key={val} onClick={() => { setV2Mode(val as any); setV2Result('') }}
                  style={{ padding:'10px 16px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, whiteSpace:'nowrap' as const,
                    background: v2Mode===val?'rgba(8,145,178,0.15)':'rgba(255,255,255,0.04)',
                    border: v2Mode===val?'1.5px solid #0891B2':'1.5px solid rgba(255,255,255,0.08)',
                    color: v2Mode===val?'#38BDF8':'rgba(255,255,255,0.5)' }}>{lbl}</button>
              ))}
            </div>

            {/* Product Selector */}
            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', letterSpacing:'1px', textTransform:'uppercase' }}>Select Seed Product</label>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {PRODUCT_SEEDS.map((p, i) => (
                  <button key={i} onClick={() => setV2Product(i)}
                    style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', textAlign:'left' as const,
                      background: v2Product===i?'rgba(8,145,178,0.1)':'rgba(255,255,255,0.03)',
                      border: v2Product===i?'1.5px solid #0891B2':'1.5px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize:'20px' }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color: v2Product===i?'#38BDF8':'#fff' }}>{p.name}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{p.price}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {v2Mode === 'multiply' && (
              <div>
                <h2 style={{ fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>🔁 Product Multiplication Engine</h2>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>Turn ONE product into 5 new sellable variations. This is how you build a product catalogue.</p>
                <button onClick={v2Multiply} disabled={v2Loading}
                  style={{ padding:'14px 28px', background:v2Loading?'rgba(8,145,178,0.3)':'linear-gradient(135deg,#0891B2,#0284C7)', border:'2px solid #38BDF8', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'15px', cursor:v2Loading?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', width:'100%', marginBottom:'16px' }}>
                  {v2Loading?'🤖 Multiplying products...':'🔁 Multiply This Product × 5'}
                </button>
                {v2Result && <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>{v2Result}<button onClick={()=>navigator.clipboard.writeText(v2Result)} style={{ marginTop:'12px', padding:'8px 18px', background:'rgba(8,145,178,0.1)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'12px', fontWeight:700, cursor:'pointer', display:'block' }}>📋 Copy All Products</button></div>}
              </div>
            )}

            {v2Mode === 'launch' && (
              <div>
                <h2 style={{ fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>🚀 1-Click Product Launch</h2>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>Generate WhatsApp post + DM script + Facebook post + send list. All at once.</p>
                <button onClick={v2Launch} disabled={v2Loading}
                  style={{ padding:'14px 28px', background:v2Loading?'rgba(8,145,178,0.3)':'linear-gradient(135deg,#0891B2,#0284C7)', border:'2px solid #38BDF8', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'15px', cursor:v2Loading?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', width:'100%', marginBottom:'16px' }}>
                  {v2Loading?'🤖 Building launch pack...':'🚀 Generate Full Launch Pack'}
                </button>
                {v2Result && <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>{v2Result}<button onClick={()=>navigator.clipboard.writeText(v2Result)} style={{ marginTop:'12px', padding:'8px 18px', background:'rgba(8,145,178,0.1)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'12px', fontWeight:700, cursor:'pointer', display:'block' }}>📋 Copy Launch Pack</button></div>}
              </div>
            )}

            {v2Mode === 'sequence' && (
              <div>
                <h2 style={{ fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>📅 5-Day Follow-Up Sequence</h2>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>Generate a 5-day WhatsApp message sequence for any product. Never lose a lead again.</p>
                <button onClick={v2Sequence} disabled={v2Loading}
                  style={{ padding:'14px 28px', background:v2Loading?'rgba(8,145,178,0.3)':'linear-gradient(135deg,#0891B2,#0284C7)', border:'2px solid #38BDF8', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'15px', cursor:v2Loading?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', width:'100%', marginBottom:'16px' }}>
                  {v2Loading?'🤖 Building sequence...':'📅 Build 5-Day Sequence'}
                </button>
                {v2Result && <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>{v2Result}<button onClick={()=>navigator.clipboard.writeText(v2Result)} style={{ marginTop:'12px', padding:'8px 18px', background:'rgba(8,145,178,0.1)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'12px', fontWeight:700, cursor:'pointer', display:'block' }}>📋 Copy Sequence</button></div>}
              </div>
            )}

            {/* Upgrade nudge to V3 */}
            <div style={{ marginTop:'24px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'14px', padding:'16px 18px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:GOLD, marginBottom:'6px' }}>⚡ Ready for Electric Mode?</div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, margin:'0 0 12px' }}>
                Upgrade to Gold and the 4M Machine runs daily automation, tracks your income, and builds passive income streams while you focus on what matters.
              </p>
              <Link href="/invite" style={{ display:'inline-block', padding:'9px 22px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, border:`2px solid ${GOLD}`, borderRadius:'10px', color:'#FDE68A', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                ⚡ Upgrade to Gold →
              </Link>
            </div>
          </div>
        )}

        {/* ══ VEHICLE 3: ELECTRIC ══ */}
        {vehicle === 'electric' && (
          <div>
            {/* API Power Banner */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px', padding:'12px 14px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'12px', alignItems:'center' }}>
              <span style={{ fontSize:'11px', color:'rgba(212,175,55,0.6)', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginRight:'4px' }}>Powered by:</span>
              {[['🤖','Claude AI',GOLD],['🎥','D-ID Avatars','#EC4899'],['🖼️','Replicate','#7C3AED'],['🎙️','ElevenLabs','#E11D48'],['⚡','n8n Workflows','#FF6D00'],['📅','Buffer','#0891B2']].map(([icon,name,color]) => (
                <span key={name as string} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px', background:`${color as string}12`, border:`1px solid ${color as string}30`, borderRadius:'20px', fontSize:'11px', color:color as string, fontWeight:700 }}>
                  {icon} {name}
                </span>
              ))}
            </div>
            <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.05))', border:'2px solid rgba(212,175,55,0.3)', borderRadius:'16px', padding:'20px', marginBottom:'24px', textAlign:'center' }}>
              <div style={{ fontSize:'32px', marginBottom:'8px' }}>⚡</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:700, color:GOLD, marginBottom:'4px' }}>Electric Mode — The Machine Drives For You</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>Automation blueprints · Daily income engines · Passive scaling · Multiple income streams</div>
            </div>

            {/* Product input */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your Product Name</label>
                <input value={v3ProductName} onChange={e => setV3ProductName(e.target.value)} placeholder="e.g. CV Writing Service" style={inp} />
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Price</label>
                <input value={v3Price} onChange={e => setV3Price(e.target.value)} placeholder="e.g. R150" style={inp} />
              </div>
            </div>

            {/* Automation sequences */}
            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'8px', letterSpacing:'1px', textTransform:'uppercase' }}>Automation Sequence Templates</label>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {AUTO_SEQUENCES.map((seq, i) => (
                  <div key={i} onClick={() => setV3Sequence(i)}
                    style={{ background: v3Sequence===i?'rgba(212,175,55,0.08)':'rgba(255,255,255,0.03)', border:`1px solid ${v3Sequence===i?'rgba(212,175,55,0.3)':'rgba(255,255,255,0.07)'}`, borderRadius:'12px', padding:'14px', cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                      <span style={{ fontSize:'13px', fontWeight:700, color: v3Sequence===i?GOLD:'#fff' }}>{seq.name}</span>
                      <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:'10px' }}>{seq.steps.length} steps</span>
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Trigger: {seq.trigger}</div>
                    {v3Sequence===i && (
                      <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'6px' }}>
                        {seq.steps.map((step, j) => (
                          <div key={j} style={{ display:'flex', gap:'10px', padding:'8px 10px', background:'rgba(255,255,255,0.04)', borderRadius:'8px' }}>
                            <span style={{ fontSize:'10px', color:GOLD, fontWeight:700, whiteSpace:'nowrap' as const, flexShrink:0 }}>{step.delay}</span>
                            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{step.msg}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'24px' }}>
              <button onClick={v3PersonalizeSequence} disabled={v3Loading||!v3ProductName.trim()}
                style={{ padding:'14px', background:v3Loading||!v3ProductName.trim()?'rgba(212,175,55,0.2)':`linear-gradient(135deg,${GOLD},#B8860B)`, border:'none', borderRadius:'12px', color: v3Loading||!v3ProductName.trim()?'rgba(255,255,255,0.4)':'#000', fontWeight:700, fontSize:'13px', cursor:v3Loading||!v3ProductName.trim()?'not-allowed':'pointer', fontFamily:'Georgia,serif' }}>
                {v3Loading?'Building...':'⚡ Personalise Sequence'}
              </button>
              <button onClick={v3BuildAutomation} disabled={v3Loading||!v3ProductName.trim()}
                style={{ padding:'14px', background:v3Loading||!v3ProductName.trim()?'rgba(212,175,55,0.2)':`linear-gradient(135deg,${GOLD},#B8860B)`, border:'none', borderRadius:'12px', color: v3Loading||!v3ProductName.trim()?'rgba(255,255,255,0.4)':'#000', fontWeight:700, fontSize:'13px', cursor:v3Loading||!v3ProductName.trim()?'not-allowed':'pointer', fontFamily:'Georgia,serif' }}>
                {v3Loading?'Building...':'🏭 Full Automation Blueprint'}
              </button>
            </div>

            {v3Result && <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:1.8, color:'rgba(255,255,255,0.85)', marginBottom:'16px' }}>{v3Result}<button onClick={()=>navigator.clipboard.writeText(v3Result)} style={{ marginTop:'12px', padding:'8px 18px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'8px', color:GOLD, fontSize:'12px', fontWeight:700, cursor:'pointer', display:'block' }}>📋 Copy Blueprint</button></div>}

            {/* Upgrade to Z2B Table */}
            <div style={{ background:'rgba(76,29,149,0.08)', border:'1px solid rgba(76,29,149,0.25)', borderRadius:'14px', padding:'18px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#C4B5FD', marginBottom:'8px' }}>🍽️ Ready to Scale Beyond R300/Day?</div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, margin:'0 0 14px' }}>
                Upgrade to Z2B Table Banquet Platinum and own your own white-label platform, 7 apps built for you, and 1-on-1 strategic business consultation for 3 months.
              </p>
              <Link href="/pricing?power=electric" style={{ display:'inline-block', padding:'10px 24px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, border:`2px solid ${GOLD}`, borderRadius:'10px', color:'#FDE68A', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                🍽️ Explore Z2B Table Banquet →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── COACH MANLAW DRAWER ── */}
      {manlawOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', flexDirection:'column', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setManlawOpen(false) }}>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, maxWidth:'560px', margin:'0 auto', background:'linear-gradient(160deg,#0D0820,#1A1245)', border:'1px solid rgba(76,29,149,0.4)', borderRadius:'20px 20px 0 0', padding:'20px', maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexShrink:0 }}>
              <div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:700, color:GOLD }}>🤖 Coach Manlaw</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>The Executor — Action · Income · Execution</div>
              </div>
              <button onClick={() => setManlawOpen(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'20px', cursor:'pointer' }}>×</button>
            </div>

            {/* Intro if no history */}
            {manlawHist.length === 0 && (
              <div style={{ background:'rgba(76,29,149,0.1)', border:'1px solid rgba(76,29,149,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'12px', fontSize:'13px', color:'rgba(255,255,255,0.7)', lineHeight:1.7, flexShrink:0 }}>
                I am not here to motivate you. I am here to make you execute. Tell me where you are stuck — I will tell you exactly what to do next.
              </div>
            )}

            {/* Chat history */}
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
              {manlawHist.map((msg, i) => (
                <div key={i} style={{ display:'flex', justifyContent: msg.role==='user'?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'85%', padding:'10px 14px', borderRadius:'14px', fontSize:'13px', lineHeight:1.7,
                    background: msg.role==='user'?`rgba(76,29,149,0.4)`:'rgba(255,255,255,0.06)',
                    color: msg.role==='user'?'#C4B5FD':'rgba(255,255,255,0.85)' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {manlawLoading && (
                <div style={{ display:'flex', gap:'6px', padding:'12px 14px' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:GOLD, animation:`pulse 1s ${i*0.2}s infinite` }} />)}
                </div>
              )}
            </div>

            {/* Quick prompts */}
            {manlawHist.length === 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px', flexShrink:0 }}>
                {["I don't know what to sell", "Customer said too expensive", "I'm scared to send messages", "How do I make R300 today?"].map(q => (
                  <button key={q} onClick={() => callManlaw(q)}
                    style={{ padding:'6px 12px', background:'rgba(76,29,149,0.15)', border:'1px solid rgba(76,29,149,0.3)', borderRadius:'20px', color:'#C4B5FD', fontSize:'11px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
              <input value={manlawInput} onChange={e => setManlawInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); callManlaw(manlawInput) } }}
                placeholder="Ask Coach Manlaw anything..." style={{ ...inp, flex:1 }} />
              <button onClick={() => callManlaw(manlawInput)} disabled={manlawLoading||!manlawInput.trim()}
                style={{ padding:'12px 20px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AIIncomeWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#09060F', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <AIIncomeInner />
    </Suspense>
  )
}
