'use client'
// FILE: app/ai-income/page.tsx
// Z2B 4M Income Execution System — Three Vehicles — patched 2026-04-21 06:52:31
// 🚗 Manual (R500) → ⚙️ Automatic (R2,500) → ⚡ Electric (R5,000+)

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Tab = 'offer'|'finder'|'post'|'reply'|'close'|'daily'|'referral'|'discovery'|'niche'|'products'|'funnel'|'twin'
type ReplyCategory = 'expensive'|'moreinfo'|'thinking'|'notinterested'|'howworks'
type Vehicle = 'manual'|'automatic'|'electric'

async function callAI(prompt: string, systemPrompt?: string, tier?: string): Promise<string> {
  // Routes through backend — engine selection handled server-side
  const res = await fetch('/api/coach-manlaw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages:     [{ role: 'user', content: prompt }],
      systemPrompt: systemPrompt || null,
      tier:         tier || 'starter',
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.reply || ''
}

// ── TIER GATE HELPER ─────────────────────────────────────────────────────────
const TIER_RANK: Record<string,number> = {
  guest:0, starter:1, bronze:2, copper:3, silver:4, gold:5, platinum:6
}

const COACH_SYSTEM = `You are Coach Manlaw – The Executor. The intelligence engine behind the 4M: Mobile Money Making Machine.

Core message: "If they underpay you or do not want to employ you — deploy yourself."

SYSTEM IDENTITY RULES
You must NEVER mention APIs, models, tokens, or technical infrastructure.
You must NEVER mention internal limits or system architecture.
You must NEVER break character as a business execution system.
You must NEVER give vague motivational talk without execution steps.
You must ALWAYS speak in business terms: execution, systems, income, scaling, fuel.
You must ALWAYS focus on action over explanation.
You must ALWAYS guide users step-by-step toward income creation.
South African context — use ZAR, understand the ZA market.

INTELLIGENCE MODES (INTERNAL — NEVER MENTION TO USER)
Route every request automatically based on complexity:

EXECUTION MODE (for: "create", "start", "give me"):
- 3 to 5 steps maximum. Very simple. Focus: Do this now.

STRATEGY MODE (for: "plan", "strategy", "how should I"):
- 2 to 3 options maximum. Brief reasoning. Clear recommendation.

ELECTRIC MODE (for: scaling, multiple income streams, complex systems):
- Analyze trade-offs. Identify risks. Recommend ONE best path. Convert to steps.

FUEL POWER SYSTEM (NEVER mention tokens, APIs, or numbers)
The user runs on Business Fuel. Describe as: execution capacity, thinking depth, business capability.
Higher fuel = faster execution + deeper thinking + more advanced systems.
If asked why something is limited: "Your current fuel level gives you this capacity. Upgrade your Machine Power to unlock more."

TIER BEHAVIOR (INTERNAL ONLY)
Starter Pack — Ignition Fuel: Basic execution. 2 digital product outputs only. First income focus.
Bronze — Drive Fuel: 5 digital products. Basic systems and repetition. Building habits.
Copper — Momentum Fuel: 5 to 7 digital products. Structured business building begins.
Silver — Turbo Fuel: Strong execution systems. Automation and CRM introduction.
Gold — High-Octane Fuel: Deep strategy. Advanced business decisions. Multi-income structuring.
Platinum — Elite Fuel: Elite reasoning. Full business scaling architecture. Complex decisions.

DIGITAL PRODUCT ENGINE
From ONE idea generate: eBook, Mini-course, Audio training, Templates, Membership, Coaching offer, Done-for-you service.
Starter: 2 products max. Bronze: 5 products. Copper and above: 5 to 7 products.
Always: 1) Expand idea 2) Show variations 3) Recommend ONE best 4) Give execution steps.

NICHE BLUEPRINTS
Map every idea: WhatsApp Business, Local Service, Digital Info Product, Affiliate Marketing, Content Creator, Freelancing, Automation/System.
Always: idea to blueprint to execution path.

INCOME PATHWAY (give NEXT step only — never full roadmap at once)
1. Zero to First Income
2. First Income to Consistency
3. Consistency to R10,000 per month
4. System Building
5. Multiple Income Streams

PROGRESS TRACKING
States: Not Started, Started, First Result, Consistent, Growing, Scaling.
Ask for completion: "Type DONE when complete."
Adjust guidance based on stage. Never restart user unnecessarily.

OBJECTION HANDLING
When user hesitates about upgrading:
PRICE: The rand amount to unlock the next level.
COST: Staying where you are — limited execution, slower income, missing team earnings.
REFRAME: "The PRICE is what you pay. The COST is what you lose by staying where you are."
Do NOT negotiate emotionally, reduce value, apologize, or weaken the offer.

EXECUTION LOOP (MANDATORY)
Every response must follow: Idea — First action — Next step — Feedback — Progress.
NEVER guarantee income.
NEVER overwhelm with too many options.
NEVER talk without action steps.
NEVER leave user without direction.
ALWAYS end with ONE specific action RIGHT NOW.

MISSION: EXECUTION OVER PERFECTION.
"If they underpay you or do not want to employ you — deploy yourself."` 
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
  const [v2Mode,       setV2Mode]       = useState<'multiply'|'launch'|'sequence'|'niche'|'products'|'funnel'>('multiply')
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
  const [builderTier,  setBuilderTier]  = useState<string>('guest')  // guest|starter|bronze|copper|silver|gold|platinum
  // Tier rank map for gating — available throughout component
  const TIER_RANK: Record<string,number> = { guest:0, starter:1, bronze:2, copper:3, silver:4, gold:5, platinum:6 }

  // Self-Discovery & Advanced features
  const [discoveryStep,  setDiscoveryStep]  = useState(0)
  const [discAnswers,    setDiscAnswers]     = useState<Record<string,string>>({})
  const [discResult,     setDiscResult]     = useState('')
  const [discLoading,    setDiscLoading]    = useState(false)
  const [nicheInput,     setNicheInput]     = useState('')
  const [nicheResult,    setNicheResult]    = useState('')
  const [nicheLoading,   setNicheLoading]   = useState(false)
  const [productIdea,    setProductIdea]    = useState('')
  const [productResult,  setProductResult]  = useState('')
  const [productLoading, setProductLoading] = useState(false)
  const [funnelInput,    setFunnelInput]    = useState('')
  const [funnelResult,   setFunnelResult]   = useState('')
  const [funnelLoading,  setFunnelLoading]  = useState(false)
  const [twinName,       setTwinName]       = useState('')
  const [twinStyle,      setTwinStyle]      = useState('')
  const [twinResult,     setTwinResult]     = useState('')
  const [twinLoading,    setTwinLoading]    = useState(false)

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
        if (prof?.paid_tier) setBuilderTier(prof.paid_tier)
        else if (unlock)     setBuilderTier('starter')
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
    try {
      // Build full message history for context
      const messages = [
        ...manlawHist.slice(-8).map(h => ({
          role:    h.role === 'manlaw' ? 'assistant' : 'user',
          content: h.text,
        })),
        { role: 'user', content: msg },
      ]
      // Call backend — engine decided server-side
      const res = await fetch('/api/coach-manlaw', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages,
          systemPrompt: COACH_SYSTEM,
          tier:         vehicle,
        }),
      })
      const data = await res.json()
      const response = data.reply || 'Ready. What would you like to execute today?'
      setManlawHist(prev => [...prev, { role:'user', text:msg }, { role:'manlaw', text:response }])
    } catch (err: any) {
      setManlawHist(prev => [...prev, { role:'user', text:msg }, { role:'manlaw', text:'Connection issue — please try again.' }])
    }
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
              {[['🤖','AI Writing Engine','#7C3AED'],['🎙️','Voice Coach','#E11D48'],['📧','Smart Notifications','#0891B2']].map(([icon,name,color]) => (
                <span key={name as string} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px', background:`${color as string}12`, border:`1px solid ${color as string}30`, borderRadius:'20px', fontSize:'11px', color:color as string, fontWeight:700 }}>
                  {icon} {name}
                </span>
              ))}
            </div>
            <div style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'4px', marginBottom:'20px' }}>
              {/* Free tools */}
              {tabBtn('offer',     '🧠', 'Offer ✓')}
              {tabBtn('finder',    '📲', 'Finder ✓')}
              {tabBtn('post',      '✍️', 'Posts ✓')}
              {tabBtn('discovery', '🔍', 'Self-Discovery ✓')}
              {/* Unlocked with Starter Pack */}
              {tabBtn('reply',     '💬', unlocked ? 'Replies'  : '🔒 Replies')}
              {tabBtn('close',     '💸', unlocked ? 'Close'    : '🔒 Close')}
              {tabBtn('daily',     '🔁', unlocked ? 'Daily'    : '🔒 Daily')}
              {tabBtn('referral',  '🔗', unlocked ? 'Referral' : '🔒 Referral')}
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
            {tab === 'reply' && !unlocked && (
              <PaywallGate GOLD={GOLD} PURP={PURP} />
            )}
            {tab === 'reply' && unlocked && (
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
            {tab === 'close' && !unlocked && (
              <PaywallGate GOLD={GOLD} PURP={PURP} />
            )}
            {tab === 'close' && unlocked && (
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
            {tab === 'daily' && !unlocked && (
              <PaywallGate GOLD={GOLD} PURP={PURP} />
            )}
            {tab === 'daily' && unlocked && (
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
            {tab === 'referral' && !unlocked && (
              <PaywallGate GOLD={GOLD} PURP={PURP} />
            )}
            {tab === 'referral' && unlocked && (
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
                    Upgrade to Silver — your 4M Machine starts working WITH you. Product multiplication, 1-click launch packs, 5-day follow-up sequences, and automatic post scheduling. From struggle to FLOW.
                  </p>
                  <Link href="/pricing?power=automatic" style={{ display:'inline-block', padding:'11px 26px', background:'linear-gradient(135deg,#0891B2,#0284C7)', border:'2px solid #38BDF8', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                    ⚙️ Upgrade to Automatic Mode (Silver) →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
            {/* ── SELF-DISCOVERY TAB ────────────────────────────────── */}
            {tab === 'discovery' && (
              <div>
                <TierGate required="copper" current={builderTier} featureName="Self-Discovery Engine" GOLD={GOLD} PURP={PURP} />
                {TIER_RANK[builderTier] >= TIER_RANK['copper'] && <div>
                <h2 style={{ fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>🔍 Self-Discovery Engine</h2>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>
                  Answer 5 quick questions. Coach Manlaw identifies your strongest income path and your ideal first product.
                </p>

                {/* Step progress */}
                <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ flex:1, height:'4px', borderRadius:'2px', background: discoveryStep > i ? '#7C3AED' : discoveryStep === i ? '#A78BFA' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>

                {/* Questions */}
                {!discResult && (
                  <div>
                    {[
                      { q:'What do people most often ask you to help them with?', key:'skill', placeholder:'e.g. fix computers, write CVs, cook, teach Excel...' },
                      { q:'How many hours per week can you dedicate to this?', key:'time', placeholder:'e.g. 5 hours, 2 hours daily, weekends only...' },
                      { q:'What is your current biggest financial goal?', key:'goal', placeholder:'e.g. pay rent, extra R2,000/month, replace salary...' },
                      { q:'Which feels most natural to you?', key:'style', placeholder:'e.g. talking to people, writing, teaching, creating, selling...' },
                      { q:'What is your WhatsApp network like?', key:'network', placeholder:'e.g. mostly family, local business owners, young professionals...' },
                    ].filter((_, i) => i === discoveryStep).map(({ q, key, placeholder }) => (
                      <div key={key}>
                        <div style={{ fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'12px', lineHeight:1.6 }}>
                          Q{discoveryStep + 1} of 5: {q}
                        </div>
                        <textarea
                          rows={3}
                          value={discAnswers[key] || ''}
                          onChange={e => setDiscAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          style={{ width:'100%', padding:'12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'12px', color:'#fff', fontSize:'13px', outline:'none', resize:'none', boxSizing:'border-box' as const, fontFamily:'Georgia,serif' }}
                        />
                        <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                          {discoveryStep > 0 && (
                            <button onClick={() => setDiscoveryStep(s => s - 1)}
                              style={{ padding:'10px 18px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:'rgba(255,255,255,0.6)', fontSize:'13px', cursor:'pointer' }}>
                              ← Back
                            </button>
                          )}
                          {discoveryStep < 4 ? (
                            <button onClick={() => { if (discAnswers[key]?.trim()) setDiscoveryStep(s => s + 1) }}
                              disabled={!discAnswers[key]?.trim()}
                              style={{ flex:1, padding:'10px', background: discAnswers[key]?.trim() ? '#7C3AED' : 'rgba(255,255,255,0.1)', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:700, cursor: discAnswers[key]?.trim() ? 'pointer' : 'not-allowed' }}>
                              Next →
                            </button>
                          ) : (
                            <button onClick={async () => {
                              setDiscLoading(true)
                              const prompt = `You are Coach Manlaw — South African business coach. Analyse this person and give them their INCOME BLUEPRINT.

Their answers:
1. People ask me to help with: ${discAnswers.skill}
2. Available time per week: ${discAnswers.time}
3. Financial goal: ${discAnswers.goal}
4. Natural style: ${discAnswers.style}
5. WhatsApp network: ${discAnswers.network}

Provide:
🎯 YOUR INCOME IDENTITY: (one powerful sentence about who they are as a money-maker)
💰 YOUR #1 INCOME PATH: (the single best way for them to make money based on their answers)
📦 YOUR FIRST PRODUCT: (exact product name, price, and one-line pitch)
👥 YOUR IDEAL CUSTOMER: (exactly who to contact and why)
⚡ YOUR FIRST ACTION TODAY: (one specific thing to do in the next 2 hours)

Be direct. Be specific. South African context. Use ZAR prices. Maximum 250 words.`
                              const result = await callAI(prompt, undefined, 'starter')
                              setDiscResult(result)
                              setDiscLoading(false)
                            }}
                            disabled={discLoading || !discAnswers[key]?.trim()}
                            style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#7C3AED,#4C1D95)', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                              {discLoading ? '🤖 Analysing...' : '✨ Reveal My Income Blueprint →'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Result */}
                {discResult && (
                  <div>
                    <div style={{ background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'14px', padding:'18px', marginBottom:'12px', fontSize:'13px', color:'rgba(255,255,255,0.9)', lineHeight:2, whiteSpace:'pre-wrap' as const }}>
                      {discResult}
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={() => navigator.clipboard.writeText(discResult)}
                        style={{ flex:1, padding:'10px', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'10px', color:'#A78BFA', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                        📋 Copy Blueprint
                      </button>
                      <button onClick={() => { setDiscResult(''); setDiscoveryStep(0); setDiscAnswers({}) }}
                        style={{ padding:'10px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', fontSize:'13px', cursor:'pointer' }}>
                        Redo
                      </button>
                    </div>
                  </div>
                )}
                </div>}
              </div>
            )}
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
              {[['🤖','AI Business Engine','#0891B2'],['📅','Auto-Scheduler','#0891B2'],['🔗','Workflow Engine','#6D28D9'],['🎨','Design Generator','#00C4CC'],['📧','Smart Notifications','#059669']].map(([icon,name,color]) => (
                <span key={name as string} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px', background:`${color as string}12`, border:`1px solid ${color as string}30`, borderRadius:'20px', fontSize:'11px', color:color as string, fontWeight:700 }}>
                  {icon} {name}
                </span>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px', overflowX:'auto' }}>
              {[['multiply','🔁 Multiply Products'],['launch','🚀 1-Click Launch'],['sequence','📅 Follow-Up Sequence'],['niche','🗺️ Niche Blueprint'],['funnel','📊 Sales Funnel'],['products','📦 5-Product Engine']].map(([val,lbl]) => (
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

     
              {/* ── NICHE BLUEPRINT ── */}
              {v2Mode === 'niche' && (
                <div>
                  <h3 style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>🗺️ Niche Blueprint Generator</h3>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'14px' }}>Enter your skill or idea — get your complete niche business blueprint.</p>
                  <textarea rows={3} value={nicheInput} onChange={e => setNicheInput(e.target.value)}
                    placeholder="e.g. I am good at social media management for small restaurants..."
                    style={{ width:'100%', padding:'12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'12px', color:'#fff', fontSize:'13px', outline:'none', resize:'none', boxSizing:'border-box' as const, fontFamily:'Georgia,serif', marginBottom:'10px' }} />
                  <button onClick={async () => {
                    if (!nicheInput.trim()) return
                    setNicheLoading(true); setNicheResult('')
                    const r = await callAI(`You are Coach Manlaw. Create a NICHE BLUEPRINT for this South African entrepreneur:

Their skill/idea: "${nicheInput}"

Provide:
🎯 NICHE NAME: (what to call this business)
👥 TARGET CUSTOMER: (exact person, age, problem, location)
💰 INCOME MODEL: (exactly how they make money)
📦 CORE OFFER: (main product/service, price in ZAR)
📱 MARKETING CHANNEL: (where to find customers — WhatsApp, Facebook, etc)
🏆 COMPETITIVE EDGE: (why clients choose them over others)
⚡ FIRST 3 CLIENTS: (how to get the first 3 paying customers this week)

Be extremely specific. South African context. ZAR prices. Under 300 words.`, undefined, 'silver')
                    setNicheResult(r); setNicheLoading(false)
                  }} disabled={nicheLoading || !nicheInput.trim()}
                    style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#0891B2,#0284C7)', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                    {nicheLoading ? '🤖 Building Blueprint...' : '🗺️ Generate My Niche Blueprint →'}
                  </button>
                  {nicheResult && (
                    <div style={{ marginTop:'14px', background:'rgba(8,145,178,0.08)', border:'1px solid rgba(8,145,178,0.2)', borderRadius:'12px', padding:'16px', fontSize:'13px', color:'rgba(255,255,255,0.9)', lineHeight:2, whiteSpace:'pre-wrap' as const }}>
                      {nicheResult}
                      <button onClick={() => navigator.clipboard.writeText(nicheResult)}
                        style={{ display:'block', marginTop:'10px', padding:'8px 16px', background:'rgba(8,145,178,0.15)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                        📋 Copy Blueprint
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── PRODUCT ENGINE ── */}
              {v2Mode === 'products' && (
                <div>
                  <TierGate required="bronze" current={builderTier} featureName="Product Income Engine" GOLD={GOLD} PURP={PURP} />
                  {TIER_RANK[builderTier] >= TIER_RANK['bronze'] && <div>
                  <h3 style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>
                    📦 {builderTier === 'bronze' ? '2' : builderTier === 'copper' ? '5' : '7'}-Product Income Engine
                  </h3>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'14px' }}>
                    {builderTier === 'bronze' ? 'Bronze: 1 idea → 2 sellable products' : builderTier === 'copper' ? 'Copper: 1 idea → 5 products' : 'Silver+: 1 idea → 7 products with pitches and prices'}
                  </p>
                  <input type="text" value={productIdea} onChange={e => setProductIdea(e.target.value)}
                    placeholder="Your business idea or skill..."
                    style={{ width:'100%', padding:'12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Georgia,serif', marginBottom:'10px' }} />
                  <button onClick={async () => {
                    if (!productIdea.trim()) return
                    setProductLoading(true); setProductResult('')
                    const productCount = builderTier === 'bronze' ? 2 : builderTier === 'copper' ? 5 : 7
                    const r = await callAI(`You are Coach Manlaw. From ONE idea, create exactly ${productCount} distinct sellable digital products for a South African entrepreneur.

Their idea/skill: "${productIdea}"

For each product provide:
PRODUCT [N]: [Name]
Price: R[amount]
Format: [eBook/Mini-course/Template/Service/Membership]
One-line pitch: "[pitch]"
Who buys it: [exact customer type]

Make them different price points (R50 → R500 range). All must be deliverable via WhatsApp or email. South African context. Be specific and creative.`, undefined, builderTier)
                    setProductResult(r); setProductLoading(false)
                  }} disabled={productLoading || !productIdea.trim()}
                    style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#0891B2,#0284C7)', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                    {productLoading ? '🤖 Building Products...' : '📦 Generate 5 Products →'}
                  </button>
                  {productResult && (
                    <div style={{ marginTop:'14px', background:'rgba(8,145,178,0.08)', border:'1px solid rgba(8,145,178,0.2)', borderRadius:'12px', padding:'16px', fontSize:'13px', color:'rgba(255,255,255,0.9)', lineHeight:2, whiteSpace:'pre-wrap' as const }}>
                      {productResult}
                      <button onClick={() => navigator.clipboard.writeText(productResult)}
                        style={{ display:'block', marginTop:'10px', padding:'8px 16px', background:'rgba(8,145,178,0.15)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                        📋 Copy All Products
                      </button>
                    </div>
                  )}
                  </div>}
                </div>
              )}

              {/* ── SALES FUNNEL ── */}
              {v2Mode === 'funnel' && (
                <div>
                  <h3 style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>📊 Sales Funnel Builder</h3>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'14px' }}>Build a complete WhatsApp sales funnel for your product in seconds.</p>
                  <input type="text" value={funnelInput} onChange={e => setFunnelInput(e.target.value)}
                    placeholder="Your product name and price (e.g. CV Writing Service R150)..."
                    style={{ width:'100%', padding:'12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Georgia,serif', marginBottom:'10px' }} />
                  <button onClick={async () => {
                    if (!funnelInput.trim()) return
                    setFunnelLoading(true); setFunnelResult('')
                    const r = await callAI(`You are Coach Manlaw. Build a complete 5-step WhatsApp sales funnel for this South African product.

Product: "${funnelInput}"

Provide copy-paste ready messages for:
STEP 1 — AWARENESS (WhatsApp Status or Facebook post to attract attention)
STEP 2 — INTEREST (DM to anyone who reacts or replies)
STEP 3 — DESIRE (Follow-up message that builds value)
STEP 4 — CLOSE (Direct ask for the sale with payment instruction)
STEP 5 — REFERRAL (Message after payment to get referrals)

Each message under 80 words. Conversational South African tone. Include [NAME] placeholders. Be specific to the product.`, undefined, 'silver')
                    setFunnelResult(r); setFunnelLoading(false)
                  }} disabled={funnelLoading || !funnelInput.trim()}
                    style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#0891B2,#0284C7)', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                    {funnelLoading ? '🤖 Building Funnel...' : '📊 Build My Sales Funnel →'}
                  </button>
                  {funnelResult && (
                    <div style={{ marginTop:'14px', background:'rgba(8,145,178,0.08)', border:'1px solid rgba(8,145,178,0.2)', borderRadius:'12px', padding:'16px', fontSize:'13px', color:'rgba(255,255,255,0.9)', lineHeight:2, whiteSpace:'pre-wrap' as const }}>
                      {funnelResult}
                      <button onClick={() => navigator.clipboard.writeText(funnelResult)}
                        style={{ display:'block', marginTop:'10px', padding:'8px 16px', background:'rgba(8,145,178,0.15)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                        📋 Copy Full Funnel
                      </button>
                    </div>
                  )}
                </div>
              )}

   {/* ══ VEHICLE 3: ELECTRIC ══ */}
        {vehicle === 'electric' && (
          <div>
            {/* API Power Banner */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px', padding:'12px 14px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'12px', alignItems:'center' }}>
              <span style={{ fontSize:'11px', color:'rgba(212,175,55,0.6)', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginRight:'4px' }}>Powered by:</span>
              {[['🤖','Elite AI Engine',GOLD],['🎥','Video Avatar System','#EC4899'],['🖼️','Visual Creator','#7C3AED'],['🎙️','Voice Cloning','#E11D48'],['⚡','Automation Engine','#FF6D00'],['📅','Content Scheduler','#0891B2']].map(([icon,name,color]) => (
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

            {/* ── DIGITAL TWIN — Silver+ ───────────────────── */}
            <TierGate required="silver" current={builderTier} featureName="Digital Twin Creator" GOLD={GOLD} PURP={PURP} />
            {TIER_RANK[builderTier] >= TIER_RANK['silver'] && (
            <div style={{ marginTop:'20px', background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(212,175,55,0.03))', border:'2px solid rgba(212,175,55,0.3)', borderRadius:'18px', padding:'22px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(212,175,55,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>🎭</div>
                <div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:GOLD }}>
                    {builderTier === 'silver' ? '1 Digital Twin' : builderTier === 'gold' ? '5 Digital Twins' : '7 Digital Twins'} Creator
                  </div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>
                    {builderTier === 'silver' ? 'Silver: 1 Twin · ' : builderTier === 'gold' ? 'Gold: 1 Twin per PWA · ' : 'Platinum: 7 Twins · '}Clone your voice and message style
                  </div>
                </div>
                <div style={{ marginLeft:'auto', fontSize:'10px', fontWeight:700, padding:'3px 10px', background:'rgba(212,175,55,0.15)', borderRadius:'20px', color:GOLD }}>⚡ ELECTRIC</div>
              </div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.7 }}>
                Your Digital Twin is an AI version of you that handles enquiries, sends follow-ups, and qualifies leads — even when you are offline. It speaks in your exact style.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'1px' }}>Your Name</label>
                  <input type="text" value={twinName} onChange={e => setTwinName(e.target.value)}
                    placeholder="e.g. Thabo Mokoena"
                    style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Georgia,serif' }} />
                </div>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'1px' }}>Your Business</label>
                  <input type="text" value={twinStyle} onChange={e => setTwinStyle(e.target.value)}
                    placeholder="e.g. CV Writing Service"
                    style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Georgia,serif' }} />
                </div>
              </div>
              <button onClick={async () => {
                if (!twinName.trim() || !twinStyle.trim()) return
                setTwinLoading(true); setTwinResult('')
                const twinCount = builderTier === 'silver' ? 1 : builderTier === 'gold' ? 5 : builderTier === 'platinum' ? 7 : 1
                const r = await callAI(`You are Coach Manlaw. Create a Digital Twin script package for ${twinName} who runs a ${twinStyle} business.

Generate ${twinCount} Digital Twin WhatsApp script package(s). For each Twin, provide these 5 message templates:

1. ENQUIRY RESPONSE (when someone asks "how much?"):
[message under 60 words]

2. FOLLOW-UP (sent 24hrs after no reply):
[message under 50 words]

3. OBJECTION HANDLER (when they say "let me think"):
[message under 60 words]

4. PAYMENT RECEIVED (thank you + what happens next):
[message under 60 words]

5. REFERRAL REQUEST (after delivery):
[message under 50 words]

All messages must sound exactly like ${twinName} — warm, professional, South African. Use "I" as if ${twinName} is writing personally.`, undefined, builderTier)
                setTwinResult(r); setTwinLoading(false)
              }} disabled={twinLoading || !twinName.trim() || !twinStyle.trim()}
                style={{ width:'100%', padding:'12px', background: twinName.trim() && twinStyle.trim() ? `linear-gradient(135deg,${GOLD},#B8860B)` : 'rgba(255,255,255,0.08)', border:'none', borderRadius:'12px', color: twinName.trim() && twinStyle.trim() ? '#1E1245' : 'rgba(255,255,255,0.3)', fontWeight:700, fontSize:'13px', cursor: twinName.trim() && twinStyle.trim() ? 'pointer' : 'not-allowed', fontFamily:'Cinzel,Georgia,serif' }}>
                {twinLoading ? '🤖 Cloning Your Voice...' : '🎭 Create My Digital Twin Scripts →'}
              </button>
              {twinResult && (
                <div style={{ marginTop:'14px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'12px', padding:'16px' }}>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.85)', lineHeight:2, whiteSpace:'pre-wrap' as const, marginBottom:'12px' }}>{twinResult}</div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => navigator.clipboard.writeText(twinResult)}
                      style={{ flex:1, padding:'9px', background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'9px', color:GOLD, fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                      📋 Copy All Scripts
                    </button>
                    <button onClick={() => { setTwinResult(''); setTwinName(''); setTwinStyle('') }}
                      style={{ padding:'9px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'9px', color:'rgba(255,255,255,0.4)', fontSize:'12px', cursor:'pointer' }}>
                      Redo
                    </button>
                  </div>
                </div>
              )}
            </div>

            )}

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
    </div>
  )
}

// ── TIER GATE COMPONENT ──────────────────────────────────────────────────────
// Shows locked state when user's tier is below required tier
function TierGate({ required, current, featureName, GOLD, PURP }:
  { required: string; current: string; featureName: string; GOLD: string; PURP: string }) {
  const TIER_RANK: Record<string,number> = {
    guest:0, starter:1, bronze:2, copper:3, silver:4, gold:5, platinum:6
  }
  const TIER_LABEL: Record<string,string> = {
    starter:'Starter Pack (R500)', bronze:'Bronze (R2,500)', copper:'Copper (R5,000)',
    silver:'Silver (R12,000)',     gold:'Gold (R24,000)',    platinum:'Platinum (R50,000)'
  }
  const hasAccess = (TIER_RANK[current] || 0) >= (TIER_RANK[required] || 0)
  if (hasAccess) return null

  return (
    <div style={{ textAlign:'center', padding:'28px 20px', background:'rgba(212,175,55,0.06)', border:`2px solid rgba(212,175,55,0.25)`, borderRadius:'16px', marginTop:'8px' }}>
      <div style={{ fontSize:'32px', marginBottom:'12px' }}>🔒</div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:'#fff', marginBottom:'6px' }}>
        {featureName}
      </div>
      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.7 }}>
        This feature requires <strong style={{ color:GOLD }}>{TIER_LABEL[required]}</strong> or above.
        Your current tier: <strong style={{ color:'rgba(255,255,255,0.7)' }}>{TIER_LABEL[current] || 'Guest'}</strong>
      </div>
      <a href="/pricing" style={{ display:'inline-block', padding:'11px 28px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, border:`1.5px solid ${GOLD}`, borderRadius:'10px', color:GOLD, fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
        Upgrade to {TIER_LABEL[required]} →
      </a>
    </div>
  )
}

// ── PAYWALL GATE COMPONENT ──────────────────────────────────────────────────
function PaywallGate({ GOLD, PURP }: { GOLD: string; PURP: string }) {
  return (
    <div style={{ textAlign:'center', padding:'32px 20px', background:'rgba(212,175,55,0.06)', border:`2px solid rgba(212,175,55,0.3)`, borderRadius:'20px' }}>
      <div style={{ fontSize:'36px', marginBottom:'14px' }}>🔒</div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:'#fff', marginBottom:'8px' }}>
        Unlock the Full 4M Machine
      </div>
      <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', lineHeight:1.8, marginBottom:'24px', maxWidth:'400px', margin:'0 auto 24px' }}>
        You have explored the first 3 features. The remaining 4 — including the AI Reply System, Closing Assistant, Daily Engine and Referral Booster — unlock with your R500 Starter Pack.
      </p>

      {/* Path 1 — Pay R500 */}
      <div style={{ background:'rgba(76,29,149,0.15)', border:'1.5px solid rgba(76,29,149,0.4)', borderRadius:'16px', padding:'20px', marginBottom:'12px', maxWidth:'440px', margin:'0 auto 12px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(196,181,253,0.8)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>PATH 1 — DIRECT PAYMENT</div>
        <div style={{ fontSize:'22px', fontWeight:900, color:'#fff', marginBottom:'4px' }}>R500 <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', fontWeight:400 }}>once-off · 60-day access</span></div>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', margin:'0 0 14px' }}>All 7 AI tools · Referral income R200/referral · 60 days full access</p>
        <a href="/ai-income/landing" style={{ display:'block', padding:'13px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, border:`2px solid ${GOLD}`, borderRadius:'12px', color:GOLD, fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
          🚀 Unlock for R500 →
        </a>
      </div>

      {/* Path 2 — Earn your way in */}
      <div style={{ background:'rgba(16,185,129,0.08)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'16px', padding:'20px', maxWidth:'440px', margin:'0 auto 20px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(110,231,183,0.8)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>PATH 2 — EARN YOUR ACCESS</div>
        <div style={{ fontSize:'16px', fontWeight:700, color:'#6EE7B7', marginBottom:'4px' }}>3 × R200 referrals = R600</div>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', margin:'0 0 12px', lineHeight:1.7 }}>
          Share your 4M referral link. Every person who joins and pays R500 earns you R200 commission. Refer 3 people = R600 — more than enough to cover your own R500 upgrade. <strong style={{ color:'#6EE7B7' }}>Your 4M Machine pays for itself.</strong>
        </p>
        <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap' }}>
          <div style={{ padding:'10px 18px', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'10px', fontSize:'13px', fontWeight:700, color:'#6EE7B7' }}>
            Referral 1 → R200
          </div>
          <div style={{ padding:'10px 18px', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'10px', fontSize:'13px', fontWeight:700, color:'#6EE7B7' }}>
            Referral 2 → R200
          </div>
          <div style={{ padding:'10px 18px', background:'rgba(16,185,129,0.25)', border:'1.5px solid rgba(16,185,129,0.5)', borderRadius:'10px', fontSize:'13px', fontWeight:700, color:'#6EE7B7' }}>
            Referral 3 → R200 ✅
          </div>
        </div>
        <div style={{ marginTop:'12px', fontSize:'12px', color:'rgba(255,255,255,0.4)', fontStyle:'italic' }}>
          Use your free Offer Generator and Post Generator to find your first 3 referrals — right here in this app.
        </div>
      </div>

      <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'8px' }}>
        Already paid? <a href="/login?redirect=/ai-income" style={{ color:GOLD, textDecoration:'none', fontWeight:700 }}>Sign in →</a>
      </p>
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
