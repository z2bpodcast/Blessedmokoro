'use client'
// FILE: app/ai-income/page.tsx
// Z2B AI Income Execution System
// AI-Powered Smartphone Income System: R500 · 60-Day AI Income Activation Program Online Income System

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FOURM_BRAND as FOURM, THEME as T } from './fourm-brand'

// ── TYPES ─────────────────────────────────────────────────
type Tab = 'offer'|'finder'|'post'|'reply'|'close'|'daily'|'referral'
const FREE_TABS: readonly Tab[] = ['offer', 'finder', 'post']
const isPremiumTab = (t: Tab) => !FREE_TABS.includes(t)
type ReplyCategory = 'expensive'|'moreinfo'|'thinking'|'notinterested'|'howworks'

// ── AI API CALL ───────────────────────────────────────────
async function callAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// ── DAILY CHECKLIST ITEMS ─────────────────────────────────
const DAILY_TASKS = [
  { id:'post1',    icon:'📱', text:'Post on WhatsApp Status (morning)',           points:10 },
  { id:'post2',    icon:'📘', text:'Post in 2 Facebook Groups',                   points:10 },
  { id:'contact1', icon:'💬', text:'Contact 10 people with your offer',           points:20 },
  { id:'follow',   icon:'🔄', text:'Follow up with yesterday\'s contacts',        points:15 },
  { id:'post3',    icon:'📱', text:'Post on WhatsApp Status (evening)',           points:10 },
  { id:'contact2', icon:'💬', text:'Contact 10 more people (new list)',           points:20 },
  { id:'close',    icon:'💰', text:'Attempt to close at least 1 client',         points:25 },
  { id:'refer',    icon:'🔗', text:'Share referral link with 3 people',          points:10 },
]

function AIIncomeInner() {
  const searchParams  = useSearchParams()
  const ref           = searchParams.get('ref') || ''
  const activated     = searchParams.get('activated') === 'true'

  const [user,         setUser]         = useState<any>(null)
  const [profile,      setProfile]      = useState<any>(null)
  const [unlocked,     setUnlocked]     = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState<Tab>('offer')
  const [aiLoading,    setAiLoading]    = useState(false)
  const [result,       setResult]       = useState('')

  // Offer Generator
  const [skill,        setSkill]        = useState('')
  const [location,     setLocation]     = useState('')

  // Post Generator
  const [offerDesc,    setOfferDesc]    = useState('')
  const [postType,     setPostType]     = useState<'whatsapp'|'facebook'|'dm'>('whatsapp')

  // Reply Helper
  const [replyContext, setReplyContext] = useState('')
  const [replyCategory,setReplyCategory]= useState<ReplyCategory>('expensive')

  // Daily tracker
  const [checked,      setChecked]      = useState<Record<string,boolean>>({})
  const totalPoints = DAILY_TASKS.reduce((sum, t) => checked[t.id] ? sum + t.points : sum, 0)

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
  const [sponsorName,  setSponsorName]  = useState('')
  const [showDeployWelcome, setShowDeployWelcome] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        const [{ data: prof }, { data: unlock }, { data: comms }] = await Promise.all([
          supabase.from('profiles').select('full_name, referral_code, paid_tier').eq('id', u.id).single(),
          supabase.from('ai_income_unlocks').select('*').eq('user_id', u.id).single(),
          supabase.from('ai_income_commissions').select('*').eq('referrer_id', u.id).order('created_at', { ascending: false }),
        ])
        setProfile(prof)
        if (unlock) setUnlocked(true)
        setMyCommissions(comms || [])
      }
      setLoading(false)
    })
    // Get sponsor name if ref present
    if (ref) {
      fetch(`/api/sponsor?ref=${encodeURIComponent(ref)}`)
        .then(r => r.json()).then(d => { if (d?.name) setSponsorName(d.name) })
        .catch(() => {})
    }
  }, [ref])

  useEffect(() => {
    if (loading || !user || typeof window === 'undefined') return
    try {
      if (!localStorage.getItem(FOURM.storageKey)) setShowDeployWelcome(true)
    } catch { /* ignore */ }
  }, [loading, user])

  const dismissDeployWelcome = () => {
    try { localStorage.setItem(FOURM.storageKey, '1') } catch { /* ignore */ }
    setShowDeployWelcome(false)
  }

  const refLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/ai-income?ref=${profile?.referral_code || ''}`
  const totalEarned = myCommissions.filter(c => c.status === 'paid').reduce((s:number, c:any) => s + c.amount, 0)
  const pending     = myCommissions.filter(c => c.status === 'pending').reduce((s:number, c:any) => s + c.amount, 0)

  // ── AI CALLS ───────────────────────────────────────────
  const generateOffer = async () => {
    if (!skill.trim()) return
    setAiLoading(true); setResult('')
    const text = await callAI(`You are a business coach helping a South African beginner make money using their smartphone.

The person has this skill/resource: "${skill}"
Their location/context: "${location || 'South Africa'}"

Create a simple sellable offer they can start TODAY. Format your response exactly like this:

🎯 YOUR OFFER:
[One clear sentence describing what they sell]

👥 TARGET CUSTOMER:
[Who will pay for this - be specific]

💰 PRICING:
[Suggested price - between R50 and R500]

📱 HOW TO DELIVER:
[Simple step-by-step - maximum 3 steps]

⚡ YOUR ONE-LINE PITCH:
[One sentence they can copy-paste right now]

Keep everything simple. No jargon. Beginner-friendly. South African context.`)
    setResult(text); setAiLoading(false)
  }

  const generateFinder = async () => {
    if (!skill.trim()) return
    setAiLoading(true); setResult('')
    const text = await callAI(`You are helping a South African beginner find their first customers using a smartphone.

Their offer: "${skill}"

Give them an exact customer-finding action plan. Format:

📍 WHERE TO FIND CUSTOMERS:

1. WhatsApp:
[Specific action]

2. Facebook Groups:
[Specific groups to join and what to post]

3. Local Network:
[Who in their life to contact first]

📋 TODAY'S ACTION PLAN (do this in the next 2 hours):
[5 specific numbered steps]

⚠️ AVOID:
[2 common mistakes beginners make]

Keep it actionable. No fluff. South African context.`)
    setResult(text); setAiLoading(false)
  }

  const generatePost = async () => {
    if (!offerDesc.trim()) return
    setAiLoading(true); setResult('')
    const platforms: Record<string, string> = {
      whatsapp: 'WhatsApp Status (max 700 characters, casual, emoji-friendly)',
      facebook: 'Facebook Group post (slightly longer, includes call to action)',
      dm:       'Direct message to a specific person (personal, not salesy)',
    }
    const text = await callAI(`Create a ${platforms[postType]} for this offer:

"${offerDesc}"

Rules:
- Written for a South African audience
- Simple language — Grade 8 reading level
- Creates curiosity, not desperation
- Ends with a clear call to action
- No hashtag spam
- Feels human, not robotic

Generate 2 versions so the user can choose. Label them VERSION A and VERSION B.`)
    setResult(text); setAiLoading(false)
  }

  const generateReply = async () => {
    setAiLoading(true); setResult('')
    const categories: Record<ReplyCategory, string> = {
      expensive:      'The customer said it is too expensive or they cannot afford it',
      moreinfo:       'The customer asked for more information',
      thinking:       'The customer said they are thinking about it or need time',
      notinterested:  'The customer said they are not interested',
      howworks:       'The customer asked how it works or how they will get the product/service',
    }
    const text = await callAI(`You are a sales coach helping a South African beginner respond to a customer.

Situation: ${categories[replyCategory]}
${replyContext ? `Additional context: "${replyContext}"` : ''}

Provide:

💬 READY-TO-SEND REPLY:
[Exact message they can copy-paste — natural, friendly, not pushy]

🎯 CLOSING MOVE:
[One sentence to keep the conversation alive]

🔄 IF THEY DON'T RESPOND IN 24 HOURS:
[A follow-up message]

Keep it conversational. South African tone. No corporate language.`)
    setResult(text); setAiLoading(false)
  }

  const generateClose = async () => {
    if (!offerDesc.trim()) return
    setAiLoading(true); setResult('')
    const text = await callAI(`Help a South African beginner close a sale for this offer: "${offerDesc}"

Provide:

💰 CLOSING SCRIPT:
[Exact words to say when asking for payment]

⏰ URGENCY MESSAGE:
[A genuine reason to act now — no fake scarcity]

💳 PAYMENT INSTRUCTIONS:
[How to ask for payment naturally — SnapScan, EFT, cash]

🎉 AFTER THEY SAY YES:
[Exactly what to say and do next]

Natural. Confident. Not pushy. South African context.`)
    setResult(text); setAiLoading(false)
  }

  // ── PAYMENT ────────────────────────────────────────────
  const handlePay = async () => {
    if (!user) { setShowReg(true); return }
    setPaying(true); setPayError('')
    try {
      const res = await fetch('/api/yoco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:   'create_checkout',
          user_id:  user.id,
          ref_code: ref || profile?.referral_code || '',
          tier:     'ai_income',
        }),
      })
      const rawText = await res.text()
      const data = rawText ? JSON.parse(rawText) : {}
      if (!res.ok || !data.checkoutUrl) {
        setPayError(data.error || 'Payment setup failed. Please try again.')
        setPaying(false); return
      }
      window.location.href = data.checkoutUrl
    } catch (e: any) {
      setPayError(e.message); setPaying(false)
    }
  }

  const handleRegisterAndPay = async () => {
    if (!regName.trim() || !regEmail.trim() || !regWa.trim()) return
    setRegLoading(true)
    const tempPwd = `Z2B${Math.random().toString(36).slice(2,10).toUpperCase()}!`
    const { data: authData, error } = await supabase.auth.signUp({
      email: regEmail.trim().toLowerCase(),
      password: tempPwd,
      options: { data: { full_name: regName.trim(), whatsapp: regWa.trim(), referred_by: ref || null } },
    })
    if (error && !error.message.toLowerCase().includes('already')) {
      setPayError(error.message); setRegLoading(false); return
    }
    const uid = authData?.user?.id
    if (!uid) { setPayError('Registration failed'); setRegLoading(false); return }
    setUser(authData.user)
    setShowReg(false)
    // Now pay
    const res = await fetch('/api/yoco', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action:'create_checkout', user_id:uid, ref_code:ref||'', tier:'ai_income' }),
    })
    const data = await res.json()
    if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
    else { setPayError(data.error || 'Payment failed'); setRegLoading(false) }
  }

  // ── STYLES ─────────────────────────────────────────────
  const BG    = T.appBg
  const GOLD  = T.gold
  const PURP  = T.violet
  const GREEN = T.emerald

  const tabBtn = (id: Tab, icon: string, label: string) => {
    const locked = isPremiumTab(id) && !unlocked
    const active = tab === id
    return (
      <button key={id} type="button" onClick={() => { setTab(id); setResult('') }}
        style={{ padding:'10px 14px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, whiteSpace:'nowrap' as const,
          background: active ? (locked ? 'rgba(148,163,184,0.14)' : 'rgba(234,179,8,0.14)') : 'rgba(255,255,255,0.04)',
          border: active ? `1.5px solid ${locked ? 'rgba(148,163,184,0.45)' : GOLD}` : '1.5px solid rgba(255,255,255,0.08)',
          color: active ? (locked ? 'rgba(226,232,240,0.95)' : GOLD) : 'rgba(255,255,255,0.48)' }}>
        {locked ? '🔒 ' : ''}{icon} {label}
      </button>
    )
  }

  const inp = { width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.07)', border:`1px solid ${T.appBorder}`, borderRadius:'10px', color:'#fff', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const }
  const btn = (color=PURP, border=GOLD) => ({ padding:'14px 28px', background:`linear-gradient(135deg,${color},#4C1D95)`, border:`2px solid ${border}`, borderRadius:'12px', color: border===GOLD ? '#FFFBEB':'#fff', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', width:'100%' as const })

  const inpLight = { width:'100%', padding:'12px 14px', background:T.regInputBg, border:`2px solid ${T.regBorder}`, borderRadius:'10px', color:T.regText, fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const }
  const btnLight = { padding:'14px 28px', background:`linear-gradient(135deg,${T.regAccent},${T.guestViolet})`, border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', width:'100%' as const }

  const renderUpgradeGate = () => (
    <div style={{ textAlign:'center', padding:'40px 20px', background:T.appSurface, borderRadius:'16px', border:`1px solid ${T.appBorder}` }}>
      <div style={{ fontSize:'52px', marginBottom:'12px' }}>🔒</div>
      <h2 style={{ fontSize:'20px', fontWeight:800, color:T.text, marginBottom:'10px', fontFamily:'Cinzel,Georgia,serif' }}>Upgrade to unlock</h2>
      <p style={{ fontSize:'14px', color:T.textMuted, lineHeight:1.75, marginBottom:'8px' }}>
        <strong style={{ color:GOLD }}>First 3 tools are free:</strong> Offer, Finder &amp; Posts.
      </p>
      <p style={{ fontSize:'14px', color:T.textMuted, lineHeight:1.75, marginBottom:'22px' }}>
        Replies, Closing, Daily Engine &amp; Referral Booster require the full <strong style={{ color:T.indigo }}>60-Day 4M program</strong> (R500).
      </p>
      {payError && (
        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'10px', marginBottom:'14px', fontSize:'13px', color:'#FCA5A5' }}>⚠️ {payError}</div>
      )}
      <button type="button" onClick={handlePay} disabled={paying} style={{ ...btn(), maxWidth:'340px', margin:'0 auto', opacity: paying ? 0.7 : 1 }}>
        {paying ? 'Opening checkout…' : '⚡ Upgrade — unlock full system'}
      </button>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontFamily:'Georgia,serif' }}>
      Loading...
    </div>
  )

  // ── GUEST MARKETING (not logged in — light funnel; registration modal only here) ──
  if (!user) return (
    <div style={{ minHeight:'100vh', background:T.guestBg, color:T.guestText, fontFamily:'Georgia,serif' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      {/* Nav — light premium bar */}
      <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${T.guestBorder}`, background:'rgba(255,255,255,0.75)', backdropFilter:'blur(16px)' }}>
        <Link href="/" style={{ textDecoration:'none', display:'flex', flexDirection:'column', gap:'2px', lineHeight:1.15 }}>
          <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:T.guestAccent, letterSpacing:'0.02em' }}>{FOURM.lockupTitle}</span>
          <span style={{ fontSize:'11px', fontWeight:600, color:T.guestViolet, fontStyle:'italic' }}>{FOURM.lockupTagline}</span>
        </Link>
        <Link href="/login" style={{ fontSize:'13px', color:T.guestMuted, textDecoration:'none', fontWeight:600 }}>Sign In</Link>
      </div>

      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'0 20px 80px' }}>

        {/* Sponsor banner */}
        {sponsorName && (
          <div style={{ background:'rgba(16,185,129,0.1)', border:'1.5px solid rgba(16,185,129,0.35)', borderRadius:'14px', padding:'14px 18px', margin:'24px 0', display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'20px' }}>🏆</span>
            <div>
              <div style={{ fontSize:'12px', color:T.guestMuted, textTransform:'uppercase', letterSpacing:'1px' }}>Invited by</div>
              <div style={{ fontSize:'16px', fontWeight:700, color:'#059669' }}>{sponsorName}</div>
            </div>
          </div>
        )}

        {/* Hero — “Deploy Yourself.” conversion layout + hook quote */}
        <div style={{ textAlign:'center', padding:'48px 0 36px' }}>
          <div style={{ fontSize:'11px', letterSpacing:'3px', color:T.guestViolet, marginBottom:'18px', textTransform:'uppercase', fontWeight:700 }}>4M · AI-Powered Money Machine</div>
          <p style={{ fontSize:'14px', color:T.guestSub, fontStyle:'italic', maxWidth:'520px', margin:'0 auto 22px', lineHeight:1.65, textAlign:'center', borderLeft:`3px solid ${T.guestAccent}`, borderRight:`3px solid ${T.guestAccent}`, padding:'0 16px' }}>
            &ldquo;{FOURM.hookLine}&rdquo;
          </p>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(32px,6vw,52px)', fontWeight:900, color:T.guestText, margin:'0 0 16px', lineHeight:1.05 }}>
            <span style={{ color:T.guestAccent }}>{FOURM.heroHeadline}</span>
          </h1>
          <p style={{ fontSize:'17px', color:T.guestText, maxWidth:'560px', margin:'0 auto 14px', lineHeight:1.75, fontWeight:600 }}>
            {FOURM.heroSub}
          </p>
          <p style={{ fontSize:'15px', color:T.guestViolet, maxWidth:'540px', margin:'0 auto 18px', lineHeight:1.75, fontWeight:600 }}>
            {FOURM.heroSupport}
          </p>
          <p style={{ fontSize:'13px', color:T.guestMuted, margin:0 }}>
            — {FOURM.author} · {FOURM.authorCred}
          </p>
        </div>

        {/* What you will learn */}
        <div style={{ background:T.guestCard, border:`1px solid ${T.guestBorder}`, borderRadius:'16px', padding:'24px', marginBottom:'28px', boxShadow:T.guestShadow }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:T.guestAccent, marginBottom:'16px', letterSpacing:'1px', textTransform:'uppercase' }}>🔓 What You Unlock — 60-Day AI Income Activation</div>
          {[
            ['🧠', 'AI Offer Generator',         'AI creates your personalised sellable offer today'],
            ['📲', 'AI Customer Finder',          'Exactly where to find customers + step-by-step plan'],
            ['✍️', 'AI Post & Message Generator', 'WhatsApp statuses, Facebook posts, direct messages'],
            ['💬', 'AI Sales Reply System',       'AI-generated replies for every customer response'],
            ['💸', 'AI Closing Assistant',        'Scripts to close confidently and collect payment'],
            ['🔁', 'Daily R300/Day Engine',       'Daily checklist to contact 10-20 people and close 1-3'],
            ['🔗', 'Referral Booster',            'Earn R50 per person you refer — your own mini income'],
          ].map(([icon, title, desc]) => (
            <div key={title as string} style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'14px' }}>
              <span style={{ fontSize:'20px', flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:'14px', fontWeight:700, color:T.guestText, marginBottom:'2px' }}>{title}</div>
                <div style={{ fontSize:'13px', color:T.guestMuted }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Income potential */}
        <div style={{ background:'rgba(16,185,129,0.08)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'16px', padding:'20px', marginBottom:'28px' }}>
          <div style={{ fontSize:'13px', color:'#047857', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px', fontWeight:700 }}>📊 Income Potential</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', textAlign:'center' }}>
            {[['1 client/day','R100–R200/day','Beginner'],['2 clients/day','R200–R400/day','Building'],['3+ clients/day','R300–R600/day','R300/day achieved']].map(([label,amount,stage]) => (
              <div key={stage as string} style={{ background:'rgba(255,255,255,0.85)', borderRadius:'10px', padding:'12px', border:`1px solid ${T.guestBorder}` }}>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#059669', marginBottom:'4px' }}>{amount}</div>
                <div style={{ fontSize:'11px', color:T.guestMuted }}>{label}</div>
                <div style={{ fontSize:'10px', color:'#059669', marginTop:'2px', opacity:0.85 }}>{stage}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'14px', fontSize:'12px', color:T.guestMuted, textAlign:'center', fontStyle:'italic' }}>
            Results depend on consistency. The system works when you work it.
          </div>
        </div>

        {/* Upsell path */}
        <div style={{ background:'rgba(79,70,229,0.06)', border:`1px solid ${T.guestBorder}`, borderRadius:'14px', padding:'16px 20px', marginBottom:'28px' }}>
          <div style={{ fontSize:'12px', color:T.guestViolet, marginBottom:'8px', fontWeight:700 }}>🚀 WHERE THIS LEADS</div>
          <p style={{ fontSize:'13px', color:T.guestSub, margin:0, lineHeight:1.7 }}>
            Once you make your first income with this system — you are ready for the full Z2B Table Banquet ecosystem. Bronze membership (R480) unlocks 99 workshop sessions, network marketing income, and business systems that work while you sleep.
          </p>
        </div>

        {/* CTA */}
        <div style={{ background:T.guestCard, border:`2px solid ${T.guestAccent}`, borderRadius:'20px', padding:'32px 24px', textAlign:'center', boxShadow:T.guestShadow }}>
          <div style={{ fontSize:'32px', fontWeight:900, color:T.guestAccent, marginBottom:'4px' }}>R500</div>
          <div style={{ fontSize:'14px', color:T.guestMuted, marginBottom:'20px' }}>60-Day Access · R500/month after · Cancel anytime</div>

          {payError && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'10px', padding:'10px', marginBottom:'16px', fontSize:'13px', color:'#991B1B' }}>⚠️ {payError}</div>
          )}

          <button onClick={handlePay} disabled={paying}
            style={{ ...btnLight, opacity: paying ? 0.7 : 1 }}>
            {paying ? 'Setting up payment...' : '⚡ Deploy Myself — Start for R500'}
          </button>
          <div style={{ marginTop:'10px', fontSize:'12px', color:T.guestViolet, fontWeight:600, letterSpacing:'0.04em' }}>
            Execute Now · Launch Income · 60-Day Activation
          </div>
          <div style={{ marginTop:'12px', fontSize:'13px', color:T.guestMuted }}>
            Already have an account? <Link href="/login?redirect=/ai-income" style={{ color:T.guestAccent, textDecoration:'none', fontWeight:700 }}>Sign in →</Link>
          </div>
        </div>

        {/* Light registration — new users only (opens from CTA when not logged in) */}
        {showReg && (
          <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(8px)' }}>
            <div style={{ background:T.regBg, border:`1px solid ${T.guestBorder}`, borderRadius:'20px', padding:'32px', maxWidth:'420px', width:'100%', position:'relative', boxShadow:'0 24px 60px rgba(79,70,229,0.15)' }}>
              <button onClick={() => setShowReg(false)} style={{ position:'absolute', top:'14px', right:'14px', background:'#F1F5F9', border:'none', color:T.guestMuted, fontSize:'20px', cursor:'pointer', width:'32px', height:'32px', borderRadius:'50%' }}>×</button>
              <div style={{ textAlign:'center', marginBottom:'20px' }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>🚀</div>
                <h2 style={{ fontSize:'18px', fontWeight:700, color:T.regText, margin:'0 0 6px' }}>Join 4M — Create Your Account</h2>
                <p style={{ fontSize:'13px', color:T.regMuted, margin:0 }}>Light registration — then proceed to R500 payment</p>
              </div>
              {payError && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'10px', padding:'10px', marginBottom:'14px', fontSize:'13px', color:'#991B1B' }}>⚠️ {payError}</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
                {[
                  { label:'Full Name', val:regName, set:setRegName, ph:'Your full name', type:'text' },
                  { label:'Email', val:regEmail, set:setRegEmail, ph:'your@email.com', type:'email' },
                  { label:'WhatsApp', val:regWa, set:setRegWa, ph:'+27 or 0XX XXX XXXX', type:'tel' },
                ].map(({ label, val, set, ph, type }) => (
                  <div key={label}>
                    <label style={{ fontSize:'11px', color:T.regMuted, display:'block', marginBottom:'5px', letterSpacing:'1px', textTransform:'uppercase', fontWeight:700 }}>{label} *</label>
                    <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inpLight} />
                  </div>
                ))}
              </div>
              <button onClick={handleRegisterAndPay} disabled={regLoading}
                style={{ ...btnLight, opacity: regLoading ? 0.7 : 1 }}>
                {regLoading ? 'Processing...' : 'Register & Pay R500 →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── MAIN APP (logged in — 3 free tools; full unlock optional) ─────────────────
  return (
    <div style={{ minHeight:'100vh', background:BG, color:T.text, fontFamily:'Georgia,serif' }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* First-visit onboarding — “Deploy Yourself.” */}
      {showDeployWelcome && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(15,23,42,0.92)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}
          role="dialog" aria-modal="true" aria-labelledby="fourm-welcome-title">
          <div style={{ maxWidth:'440px', width:'100%', background:'linear-gradient(165deg,#1E1B4B,#312E81)', border:`2px solid ${GOLD}`, borderRadius:'22px', padding:'32px 28px', boxShadow:'0 24px 80px rgba(0,0,0,0.45)' }}>
            <div style={{ fontSize:'36px', textAlign:'center', marginBottom:'12px' }}>👋</div>
            <h2 id="fourm-welcome-title" style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:'#fff', textAlign:'center', margin:'0 0 8px', lineHeight:1.25 }}>
              {FOURM.onboardTitle}
            </h2>
            <p style={{ fontSize:'15px', color:'rgba(212,175,55,0.95)', textAlign:'center', margin:'0 0 6px', fontWeight:700 }}>
              {FOURM.onboardCoach}
            </p>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textAlign:'center', margin:'0 0 18px' }}>
              {FOURM.onboardBefore}
            </p>
            <blockquote style={{ margin:'0 0 22px', padding:'14px 16px', background:'rgba(212,175,55,0.08)', borderRadius:'12px', borderLeft:`4px solid ${GOLD}`, fontSize:'15px', fontStyle:'italic', color:'rgba(255,255,255,0.9)', lineHeight:1.65 }}>
              &ldquo;{FOURM.onboardQuote}&rdquo;
              <footer style={{ marginTop:'10px', fontSize:'12px', fontStyle:'normal', color:'rgba(212,175,55,0.75)' }}>
                — {FOURM.author}
              </footer>
            </blockquote>
            <div style={{ fontSize:'12px', fontWeight:800, color:GOLD, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px' }}>⚡ System introduction</div>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.75)', margin:'0 0 12px' }}>{FOURM.onboardIntro}</p>
            <ul style={{ margin:'0 0 24px', paddingLeft:'20px', color:'rgba(255,255,255,0.82)', fontSize:'14px', lineHeight:1.85 }}>
              {FOURM.onboardSteps.map(s => <li key={s}>{s}</li>)}
            </ul>
            <button type="button" onClick={dismissDeployWelcome}
              style={{ ...btn(), marginBottom:'10px', fontSize:'16px', padding:'16px 24px' }}>
              👉 {FOURM.startCta}
            </button>
            <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.35)', margin:0 }}>
              {`Start Making Money · Send & Earn · ${FOURM.lockupTagline}`}
            </p>
          </div>
        </div>
      )}

      {/* Nav — same 4M lockup inside app */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${T.appBorder}`, background:T.appNavBg, backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ fontSize:'13px', color:T.textMuted, textDecoration:'none' }}>← Dashboard</Link>
        <div style={{ textAlign:'center', lineHeight:1.15 }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'13px', fontWeight:700, color:GOLD }}>{FOURM.lockupTitle}</div>
          <div style={{ fontSize:'10px', fontWeight:600, color:T.goldDim, fontStyle:'italic' }}>{FOURM.lockupTagline}</div>
        </div>
        <div style={{ fontSize:'11px', color: unlocked ? 'rgba(16,185,129,0.95)' : T.indigo, fontWeight:700, textAlign:'right', maxWidth:'100px' }}>
          {unlocked ? '✅ Full' : 'Free · 3'}
        </div>
      </div>

      {!unlocked && (
        <div style={{ margin:'14px 16px 0', padding:'14px 18px', borderRadius:'14px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.35)' }}>
          <span style={{ fontSize:'13px', color:T.text, lineHeight:1.55 }}>
            <strong style={{ color:GOLD }}>Free tier:</strong> Offer, Finder &amp; Posts — no upgrade needed. Tap 🔒 tabs to unlock Replies, Close, Daily &amp; Referrals (paid program).
          </span>
        </div>
      )}

      {/* Welcome banner on activation */}
      {activated && (
        <div style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.08))', border:'1.5px solid rgba(16,185,129,0.4)', borderRadius:'14px', padding:'16px 20px', margin:'20px 20px 0', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'24px' }}>🎉</span>
          <div>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#6EE7B7' }}>Payment successful — you are unlocked!</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>{FOURM.lockupTagline} Start with the AI Offer Generator — Execute Now and launch income today.</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'20px 16px 80px' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'4px', marginBottom:'20px' }}>
          {tabBtn('offer',    '🧠', 'Offer')}
          {tabBtn('finder',   '📲', 'Finder')}
          {tabBtn('post',     '✍️', 'Posts')}
          {tabBtn('reply',    '💬', 'Replies')}
          {tabBtn('close',    '💸', 'Close')}
          {tabBtn('daily',    '🔁', 'Daily')}
          {tabBtn('referral', '🔗', 'Referral')}
        </div>

        {/* ── OFFER GENERATOR ── */}
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
            <button onClick={generateOffer} disabled={aiLoading || !skill.trim()} style={{ ...btn(), marginBottom:'16px', opacity: aiLoading||!skill.trim() ? 0.6:1 }}>
              {aiLoading ? '🤖 Generating your offer...' : '🧠 Generate My Offer · Execute Now'}
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

        {/* ── CUSTOMER FINDER ── */}
        {tab === 'finder' && (
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>📲 AI Customer Finder</h2>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Tell AI your offer — get an exact plan to find your first customers today.</p>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your Offer</label>
              <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="e.g. I do home cleaning for R200 in Soweto" style={inp} />
            </div>
            <button onClick={generateFinder} disabled={aiLoading||!skill.trim()} style={{ ...btn(), marginBottom:'16px', opacity:aiLoading||!skill.trim()?0.6:1 }}>
              {aiLoading ? '🤖 Finding your customers...' : '📲 Find My Customers · Execute Now'}
            </button>
            {result && (
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'14px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>
                {result}
              </div>
            )}
          </div>
        )}

        {/* ── POST GENERATOR ── */}
        {tab === 'post' && (
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>✍️ AI Post & Message Generator</h2>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Generate ready-to-post content for WhatsApp, Facebook or direct messages.</p>
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
              {[['whatsapp','📱 WhatsApp Status'],['facebook','📘 Facebook Post'],['dm','💬 Direct Message']].map(([val,lbl]) => (
                <button key={val} onClick={() => setPostType(val as any)}
                  style={{ flex:1, padding:'10px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700,
                    background: postType===val ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                    border: postType===val ? `1.5px solid ${GOLD}` : '1.5px solid rgba(255,255,255,0.08)',
                    color: postType===val ? GOLD : 'rgba(255,255,255,0.5)' }}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Describe Your Offer</label>
              <textarea value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="e.g. I do CV writing for R150. Done same day via WhatsApp." rows={3}
                style={{ ...inp, resize:'vertical' as const }} />
            </div>
            <button onClick={generatePost} disabled={aiLoading||!offerDesc.trim()} style={{ ...btn(), marginBottom:'16px', opacity:aiLoading||!offerDesc.trim()?0.6:1 }}>
              {aiLoading ? '🤖 Writing your post...' : '✍️ Generate Post · Send & Earn'}
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

        {/* ── REPLY HELPER (premium) ── */}
        {tab === 'reply' && (unlocked ? (
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>💬 AI Sales Reply System</h2>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Customer responded? Select their reaction — get your perfect reply.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
              {([
                ['expensive',     '💸', 'Too Expensive'],
                ['moreinfo',      '📋', 'Send More Info'],
                ['thinking',      '🤔', 'Thinking About It'],
                ['notinterested', '❌', 'Not Interested'],
                ['howworks',      '❓', 'How Does It Work'],
              ] as [ReplyCategory,string,string][]).map(([val,icon,lbl]) => (
                <button key={val} onClick={() => setReplyCategory(val)}
                  style={{ padding:'12px 16px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'14px', fontWeight:700, textAlign:'left' as const,
                    background: replyCategory===val ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                    border: replyCategory===val ? `1.5px solid ${GOLD}` : '1.5px solid rgba(255,255,255,0.07)',
                    color: replyCategory===val ? GOLD : 'rgba(255,255,255,0.6)' }}>
                  {icon} {lbl}
                </button>
              ))}
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Extra Context (optional)</label>
              <input value={replyContext} onChange={e => setReplyContext(e.target.value)} placeholder="e.g. I'm selling CV writing at R150" style={inp} />
            </div>
            <button onClick={generateReply} disabled={aiLoading} style={{ ...btn(), marginBottom:'16px', opacity:aiLoading?0.6:1 }}>
              {aiLoading ? '🤖 Generating reply...' : '💬 Get My Reply · Send & Earn'}
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
        ) : renderUpgradeGate())}

        {/* ── CLOSING ASSISTANT (premium) ── */}
        {tab === 'close' && (unlocked ? (
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>💸 AI Closing Assistant</h2>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Get the exact words to close the sale and collect payment confidently.</p>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your Offer</label>
              <input value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="e.g. Logo design for R300, delivered in 24 hours" style={inp} />
            </div>
            <button onClick={generateClose} disabled={aiLoading||!offerDesc.trim()} style={{ ...btn(), marginBottom:'16px', opacity:aiLoading||!offerDesc.trim()?0.6:1 }}>
              {aiLoading ? '🤖 Writing closing script...' : '💸 Get Closing Script · Launch Income'}
            </button>
            {result && (
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'14px', padding:'20px', whiteSpace:'pre-wrap', fontSize:'14px', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>
                {result}
              </div>
            )}
          </div>
        ) : renderUpgradeGate())}

        {/* ── DAILY ENGINE (premium) ── */}
        {tab === 'daily' && (unlocked ? (
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>🔁 Daily R300/Day Engine</h2>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>Complete today's checklist. Consistency is the only secret.</p>

            {/* Progress */}
            <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>Today's Points</span>
                <span style={{ fontSize:'20px', fontWeight:900, color:totalPoints>=80?'#6EE7B7':totalPoints>=40?GOLD:'rgba(255,255,255,0.5)' }}>{totalPoints}/120</span>
              </div>
              <div style={{ height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(totalPoints/120)*100}%`, background:`linear-gradient(90deg,${PURP},${GREEN})`, borderRadius:'4px', transition:'width 0.4s' }} />
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'6px' }}>
                {totalPoints >= 100 ? '🏆 Excellent day! Start Making Money — on track for R300+' : totalPoints >= 60 ? '💪 Good progress — Execute Now!' : '⚡ Deploy Yourself — your R300 day begins now'}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {DAILY_TASKS.map(task => (
                <div key={task.id} onClick={() => setChecked(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                  style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', background: checked[task.id] ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border:`1px solid ${checked[task.id] ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius:'12px', cursor:'pointer', transition:'all 0.2s' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'6px', border:`2px solid ${checked[task.id] ? GREEN : 'rgba(255,255,255,0.2)'}`, background: checked[task.id] ? GREEN : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {checked[task.id] && <span style={{ color:'#fff', fontSize:'14px' }}>✓</span>}
                  </div>
                  <span style={{ fontSize:'18px', flexShrink:0 }}>{task.icon}</span>
                  <span style={{ flex:1, fontSize:'14px', color: checked[task.id] ? 'rgba(255,255,255,0.5)' : '#fff', textDecoration: checked[task.id] ? 'line-through' : 'none' }}>{task.text}</span>
                  <span style={{ fontSize:'12px', fontWeight:700, color: checked[task.id] ? GREEN : 'rgba(255,255,255,0.3)' }}>+{task.points}pts</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop:'20px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'12px', padding:'16px', fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:1.8 }}>
              💡 <strong style={{ color:GOLD }}>The R300/Day Formula:</strong> Contact 20 people × 15% conversion = 3 clients × R100 average = R300/day. Repeat 5 days = R1,500/week.
            </div>
          </div>
        ) : renderUpgradeGate())}

        {/* ── REFERRAL BOOSTER (premium) ── */}
        {tab === 'referral' && (unlocked ? (
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>🔗 Referral Booster System</h2>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'20px' }}>Earn R200 for every person you refer who joins the 60-Day Program.</p>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'20px' }}>
              {[
                { label:'Total Referrals', value:myCommissions.length, color:'#7C3AED' },
                { label:'Earned (paid)',    value:`R${totalEarned}`,    color:GREEN },
                { label:'Pending',          value:`R${pending}`,        color:GOLD },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${color}22`, borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:900, color }}>{value}</div>
                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', marginTop:'2px', textTransform:'uppercase', letterSpacing:'1px' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Referral link */}
            <div style={{ background:'rgba(212,175,55,0.06)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'14px', padding:'18px', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.6)', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Your Referral Link</div>
              <div style={{ fontSize:'13px', color:'rgba(212,175,55,0.8)', fontFamily:'monospace', wordBreak:'break-all', marginBottom:'12px' }}>{refLink}</div>
              <button onClick={() => { navigator.clipboard.writeText(refLink); setRefCopied(true); setTimeout(()=>setRefCopied(false),2500) }}
                style={{ padding:'10px 20px', background: refCopied?'rgba(16,185,129,0.1)':'rgba(212,175,55,0.1)', border:`1px solid ${refCopied?'rgba(16,185,129,0.3)':'rgba(212,175,55,0.3)'}`, borderRadius:'10px', color:refCopied?'#6EE7B7':GOLD, fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                {refCopied ? '✅ Link Copied!' : '📋 Copy Link'}
              </button>
            </div>

            {/* Ready-made referral messages */}
            <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:'10px', letterSpacing:'1px', textTransform:'uppercase' }}>Ready-Made Referral Messages</div>
            {[
              {
                label: '📱 WhatsApp Status',
                msg: `🤖 I just unlocked something powerful!\n\nAI helped me create my offer, find customers and write my sales messages — all from my phone.\n\nR100 once-off and you're in.\n\n👉 ${refLink}\n\n#AIIncome #SmartphoneIncome`,
              },
              {
                label: '💬 Direct Message',
                msg: `Hi [Name], I know you've been looking for ways to earn extra income.\n\nI found this AI system that helps you make R100-R300/day using your phone — CV writing, cleaning, anything you're good at.\n\nIt's R500 for 60 days. Here's my link:\n${refLink}\n\nLet me know if you want more info.`,
              },
              {
                label: '📘 Facebook Post',
                msg: `Have you ever wished you had a personal business coach available 24/7?\n\nI found one. It's AI — and it helped me:\n✅ Create a sellable offer\n✅ Find customers on WhatsApp & Facebook\n✅ Write messages that convert\n\nR100 once-off. No monthly fees.\n\nLink in comments 👇\n${refLink}`,
              },
            ].map(({ label, msg }) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px', marginBottom:'10px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:GOLD, marginBottom:'8px' }}>{label}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', whiteSpace:'pre-wrap', lineHeight:1.7, marginBottom:'10px' }}>{msg}</div>
                <button onClick={() => navigator.clipboard.writeText(msg)}
                  style={{ padding:'7px 16px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'8px', color:GOLD, fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  📋 Copy
                </button>
              </div>
            ))}

            {/* Commission history */}
            {myCommissions.length > 0 && (
              <div style={{ marginTop:'20px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px' }}>Commission History</div>
                {myCommissions.map((c: any, i: number) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', marginBottom:'6px' }}>
                    <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>
                      {new Date(c.created_at).toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                    <span style={{ fontSize:'13px', fontWeight:700, color: c.status==='paid'?GREEN:GOLD }}>
                      R{c.amount} — {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Upsell */}
            <div style={{ marginTop:'24px', background:'rgba(76,29,149,0.08)', border:'1px solid rgba(76,29,149,0.25)', borderRadius:'14px', padding:'18px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#C4B5FD', marginBottom:'8px' }}>🚀 Ready to Scale Beyond R300/Day?</div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, margin:'0 0 14px' }}>
                Upgrade to Z2B Table Banquet Bronze membership and unlock 99 workshop sessions, network marketing income, and business systems that work while you sleep.
              </p>
              <Link href="/invite" style={{ display:'inline-block', padding:'10px 24px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'2px solid #D4AF37', borderRadius:'10px', color:'#FDE68A', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                🍽️ Explore Z2B Table Banquet →
              </Link>
            </div>
          </div>
        ) : renderUpgradeGate())}

      </div>
    </div>
  )
}

export default function AIIncomeWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0F172A', display:'flex', alignItems:'center', justifyContent:'center', color:'#EAB308', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <AIIncomeInner />
    </Suspense>
  )
}
