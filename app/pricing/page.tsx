'use client'
// FILE: app/pricing/page.tsx
// Z2B Pricing — 4M Machine Power tiers
// 🚗 Manual Power · ⚙️ Automatic Power · ⚡ Electric Power

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Crown, Sparkles, Zap, CreditCard, Building2, Copy, CheckCircle, GraduationCap, TrendingUp, DollarSign, FileText } from 'lucide-react'
import { MEMBERSHIP_TIERS, YOCO_CONFIG, formatCurrency } from '@/lib/yoco'

declare global { interface Window { YocoSDK: any } }

const BANK = {
  accountName:   'Zero2billionaires Amavulandlela',
  accountNumber: '1318257727',
  bank:          'NEDBANK',
}

// ── MACHINE POWER GROUPS ─────────────────────────────────────────────────────
const MACHINE_POWERS = [
  {
    id:    'manual',
    icon:  '🚗',
    label: 'Manual Power',
    sub:   'You drive everything yourself',
    color: '#4C1D95',
    bg:    '#F3F0FF',
    border:'#7C3AED',
    tiers: ['fam','bronze','copper'],
    truth: 'This is where you build your first income foundation. Slower. Requires effort. Builds real understanding.',
    cta:   'Start Manual Power',
  },
  {
    id:    'automatic',
    icon:  '⚙️',
    label: 'Automatic Power',
    sub:   'The system starts helping you drive',
    color: '#0891B2',
    bg:    '#F0F9FF',
    border:'#0891B2',
    tiers: ['silver'],
    truth: 'From struggle to FLOW. Your 4M Machine starts working WITH you.',
    cta:   'Activate Automatic Power',
  },
  {
    id:    'electric',
    icon:  '⚡',
    label: 'Electric Power',
    sub:   'The system drives most of the journey',
    color: '#B8860B',
    bg:    '#FFFBEB',
    border:'#D4AF37',
    tiers: ['gold','platinum'],
    truth: 'Your income runs daily with minimal effort. Multiple streams. Platform leverage.',
    cta:   'Scale to Electric Power',
  },
]

// ── 4M OFFERS PER TIER (override/extend existing) ────────────────────────────
const FOUR_M_OFFERS: Record<string, string[]> = {
  fam: [
    '🤖 Z2B 4M Machine — Manual Mode (Free Preview)',
    '🧠 AI Offer Generator — 3 uses',
    '📲 AI Customer Finder — 3 uses',
    '🎓 Workshop Sessions 1–9 free forever',
    '🤖 Coach Manlaw AI — 3/session',
  ],
  bronze: [
    '🚗 Z2B 4M Machine — Manual Power FULL',
    '🧠 AI Offer Generator — unlimited',
    '📲 AI Customer Finder — unlimited',
    '✍️ AI Post Generator — unlimited',
    '💬 AI Reply System — unlimited',
    '💸 AI Closing Assistant — unlimited',
    '🔁 Daily R300/Day Engine — full',
    '📦 5 Plug-and-Play Digital Products',
    '🔗 Referral Income — R200/referral',
    '🎓 All 99 Workshop Sessions',
    '🤖 Coach Manlaw AI — unlimited',
    '🏗️ 1 PWA App Built for You',
  ],
  copper: [
    '🚗 Z2B 4M Machine — Manual Power FULL',
    '🧠 All AI tools — unlimited',
    '📦 5 Plug-and-Play Digital Products + 10 Bonus Products',
    '🔗 Referral Income — R200/referral',
    '🎓 All 99 Workshop Sessions',
    '🤖 Coach Manlaw AI — unlimited',
    '🏗️ 2 PWA Apps Built for You',
    '🏠 Household Expenses Programme',
    '📊 My Sales Funnel — Full Access',
  ],
  silver: [
    '⚙️ Z2B 4M Machine — Automatic Power FULL',
    '🧠 All AI tools — unlimited',
    '🔁 Product Multiplication Engine — 1 idea → 5 products',
    '🚀 1-Click Launch Pack — WhatsApp + Facebook + DM',
    '📅 5-Day Follow-Up Sequences — automated',
    '📦 5 Plug-and-Play Products + 15 Bonus Products',
    '🔗 Referral Income — R200/referral',
    '🎓 All 99 Workshop Sessions',
    '🤖 Coach Manlaw AI — unlimited',
    '🏗️ 2 PWA Apps Built for You',
    '📊 Full Sales Funnel System',
    '📧 9-Day Nurture Engine',
    '🎬 Content Studio + AI',
  ],
  gold: [
    '⚡ Z2B 4M Machine — Electric Power FULL',
    '🧠 All AI tools — unlimited',
    '🔁 Full Automation Blueprints',
    '🎥 AI Video Avatar for lead generation',
    '📅 Automated follow-up sequences — daily',
    '📦 5 Products + 20 Bonus Products',
    '🔗 Referral Income — R200/referral + Gold Pool',
    '🎓 All 99 Workshop Sessions',
    '🤖 Coach Manlaw AI — unlimited + Priority',
    '🏗️ 5 PWA Apps Built for You',
    '📊 Full Sales Funnel + Multiple Income Streams',
    '👤 1-on-1 Coaching',
    '🎪 1 Weekend Bootcamp',
    '💰 Gold Pool Profit Sharing',
  ],
  platinum: [
    '⚡ Z2B 4M Machine — Electric Power MAX',
    '🧠 All AI tools — unlimited',
    '🔁 Full automation — all systems active',
    '🎥 AI Video Avatar — full deployment',
    '📦 5 Products + 25 Bonus Products + White-Label Rights',
    '🔗 Referral Income — R200/referral + Platinum Pool',
    '🎓 All 99 Workshop Sessions',
    '🤖 Coach Manlaw AI — unlimited + CEO Priority',
    '🏗️ 7 PWA Apps Built for You',
    '📊 Full platform — multiple income streams',
    '👤 1-on-1 Coaching — 3 months monthly',
    '🎪 1 Weekend Bootcamp',
    '💰 Platinum Pool Profit Sharing',
    '🏷️ White-Label Platform License',
    '👑 CEO Mastermind Access',
  ],
}

const BONUS_OFFERS: Record<string, string[]> = {
  fam: [],
  bronze: ['📊 My Sales Funnel — View only', '🌱 GroundBreaker Dashboard', '🎯 Vision Board — full'],
  copper: ['🌱 GroundBreaker Dashboard', '🎯 Vision Board — full', '🏛️ TableBuilder Dashboard', '📧 9-Day Nurture Engine'],
  silver: ['🌱 GroundBreaker Dashboard', '🎯 Vision Board — full', '🏛️ TableBuilder Dashboard', '💬 WhatsApp Launcher', '📅 Content Calendar', '🔔 Prospect Notifications'],
  gold: ['🌱 GroundBreaker Dashboard', '🏛️ TableBuilder Dashboard', '📅 Content Calendar', '🔔 Prospect Notifications', '📱 Content Studio+', '🏪 Marketplace Access'],
  platinum: ['🌱 GroundBreaker Dashboard', '🏛️ TableBuilder Dashboard', '📅 Content Calendar', '🔔 Prospect Notifications', '📱 Content Studio+', '🏪 Marketplace Access', '🛡️ CEO Admin Access'],
}

const TIER_COLORS: Record<string,string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2',
}

const TIER_PRICES: Record<string,number> = {
  fam:0, bronze:2500, copper:5000, silver:12000, gold:24000, platinum:50000
}

const TIER_LABELS: Record<string,string> = {
  fam:'4M Free Preview', bronze:'Bronze', copper:'Copper', silver:'Silver', gold:'Gold', platinum:'Platinum'
}

export default function PricingPage() {
  const [user,          setUser]          = useState<any>(null)
  const [currentTier,   setCurrentTier]   = useState<string>('fam')
  const [loading,       setLoading]       = useState(false)
  const [selectedTier,  setSelectedTier]  = useState<string|null>(null)
  const [showModal,     setShowModal]     = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card'|'bank'|'atm'|null>(null)
  const [copied,        setCopied]        = useState<string|null>(null)
  const [openFaq,       setOpenFaq]       = useState<number|null>(null)
  const [showCompare,   setShowCompare]   = useState(false)
  const [activePower,   setActivePower]   = useState<string|null>(null)
  const [refCode,       setRefCode]       = useState('')
  const [email,         setEmail]         = useState('')
  const router = useRouter()

  useEffect(() => {
    const savedEmail = localStorage.getItem('z2b_workshop_email') || ''
    const savedRef   = localStorage.getItem('z2b_ref') || ''
    setEmail(savedEmail)
    setRefCode(savedRef)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('user_role, paid_tier').eq('id', user.id).single()
          .then(({ data }) => { if (data) setCurrentTier(data.paid_tier || data.user_role || 'fam') })
        const params = new URLSearchParams(window.location.search)
        const autoOpen = params.get('autoopen')
        if (autoOpen) { setTimeout(() => { setSelectedTier(autoOpen); setShowModal(true) }, 600) }
      }
    })
    // Check if coming from ?compare=true or ?power=manual|automatic|electric
    const params = new URLSearchParams(window.location.search)
    if (params.get('compare') === 'true') setShowCompare(true)
    const power = params.get('power')
    if (power) setActivePower(power)
    if (!document.getElementById('yoco-sdk')) {
      const s = document.createElement('script')
      s.id = 'yoco-sdk'; s.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'; s.async = true
      document.body.appendChild(s)
    }
  }, [])

  const reference = user?.id?.slice(0,8) || email?.slice(0,8) || 'Z2BMEMBER'

  const openPayment = (tierKey: string) => {
    if (TIER_PRICES[tierKey] === 0) { router.push('/workshop'); return }
    if (!user) { router.push(`/login?redirect=/pricing?autoopen=${tierKey}`); return }
    setSelectedTier(tierKey)
    setPaymentMethod(null)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setSelectedTier(null); setPaymentMethod(null) }

  const payByCard = async () => {
    if (!selectedTier) return
    const price = TIER_PRICES[selectedTier]
    setLoading(true)
    try {
      const res = await fetch('/api/yoco', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'create_checkout', user_id:user.id, tier:selectedTier }),
      })
      const data = await res.json()
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
      else { alert('Card payment setup failed. Please try EFT.'); setLoading(false) }
    } catch { alert('Card payment unavailable. Please try EFT.'); setLoading(false) }
  }

  const recordManualPayment = async (method: 'bank'|'atm') => {
    if (!selectedTier) return
    const provider = method === 'atm' ? 'atm_deposit' : 'bank_transfer'
    const { data: payRec } = await supabase.from('payments').insert({
      user_id: user?.id || null, email: email || user?.email || null,
      tier: selectedTier, amount: TIER_PRICES[selectedTier], currency: 'ZAR',
      payment_provider: provider, payment_id: `${provider.toUpperCase()}_${reference}_${Date.now()}`,
      status: 'pending', payment_type: 'tier_upgrade', metadata: { referred_by: refCode, reference },
    }).select().single()
    closeModal()
    if (user) {
      await supabase.from('profiles').update({ paid_tier: selectedTier, payment_status: 'pending' }).eq('id', user.id)
      router.push(`/dashboard?upgrade=${selectedTier}&pending=true`)
    } else {
      router.push(`/register/complete?payment_id=${(payRec as any)?.id || 'pending'}&tier=${selectedTier}&method=pending`)
    }
  }

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text); setCopied(field); setTimeout(() => setCopied(null), 2000)
  }

  // ── COMPARISON DATA ───────────────────────────────────────────────────────
  const COMPARE_ROWS = [
    { label:'Price',               manual:['Free','R2,500','R5,000'],       auto:['R12,000'],          electric:['R24,000','R50,000'] },
    { label:'4M Machine Mode',     manual:['Free Preview','Manual Full','Manual Full'], auto:['Automatic Full'], electric:['Electric Full','Electric MAX'] },
    { label:'AI Tools',            manual:['3 uses','Unlimited','Unlimited'], auto:['Unlimited'],        electric:['Unlimited','Unlimited'] },
    { label:'Digital Products',    manual:['0','5 Products','5+10 Bonus'],  auto:['5+15 Bonus'],       electric:['5+20 Bonus','5+25 Bonus'] },
    { label:'Referral Income',     manual:['—','R200','R200'],              auto:['R200'],             electric:['R200 + Gold Pool','R200 + Plat Pool'] },
    { label:'Workshop Sessions',   manual:['1–9','All 99','All 99'],        auto:['All 99'],           electric:['All 99','All 99'] },
    { label:'Coach Manlaw',        manual:['3/sess','Unlimited','Unlimited'], auto:['Unlimited'],      electric:['Priority','CEO Priority'] },
    { label:'PWA Apps Built',      manual:['0','1','2'],                    auto:['2'],                electric:['5','7'] },
    { label:'Automation',          manual:['—','—','—'],                    auto:['Begins here ⚙️'],   electric:['Full ⚡','Full MAX ⚡'] },
    { label:'1-on-1 Coaching',     manual:['—','—','—'],                    auto:['—'],                electric:['✓','3 months'] },
    { label:'Bootcamp',            manual:['—','—','—'],                    auto:['—'],                electric:['1 Weekend','1 Weekend'] },
    { label:'Profit Sharing',      manual:['—','—','—'],                    auto:['—'],                electric:['Gold Pool','Platinum Pool'] },
    { label:'White-Label License', manual:['—','—','—'],                    auto:['—'],                electric:['—','✓'] },
  ]

  const FAQS = [
    { q:'Is this really lifetime access?',      a:'Yes. Pay once, access forever. No monthly fees, ever.' },
    { q:'Can I pay via bank transfer?',         a:'Yes. We accept card (instant activation), bank EFT and ATM cash deposit (both activated within 24 hours after verification).' },
    { q:'Can I pay cash at an ATM?',            a:'Yes. Choose ATM Cash Deposit, deposit at any Nedbank ATM using the account number and your reference code. Activates within 24 hours.' },
    { q:'What is the 4M Machine?',              a:'The 4M Machine (Mobile · Money · Making · Machine) is our AI-powered income system. Manual Power teaches you to earn. Automatic Power helps your system work with you. Electric Power runs income automatically.' },
    { q:'Is my payment secure?',                a:'100%. Card payments use Yoco, PCI-DSS compliant and trusted by 400,000+ SA businesses. EFT and ATM go directly to our verified Nedbank account.' },
    { q:'Do I need to quit my job?',            a:'Never. Z2B was built for employed people. Build alongside your job in 30-minute daily windows.' },
    { q:'What are the PWA Apps?',               a:'We build a custom Progressive Web App (PWA) — a smartphone-first digital business — for your specific goals. Bronze includes 1 app, up to 7 apps for Platinum.' },
    { q:'When does my sponsor get credited?',   a:'Your sponsor is credited automatically the moment your payment is confirmed — instantly for card, within 24 hours for EFT and ATM.' },
  ]

  // Determine which power a tier belongs to
  const getTierPower = (tierKey: string) => MACHINE_POWERS.find(p => p.tiers.includes(tierKey))

  return (
    <div style={{ minHeight:'100vh', background:'#F3F0FF', fontFamily:'Georgia,serif', color:'#1E1245' }}>

      {/* ── HEADER ── */}
      <header style={{ background:'linear-gradient(135deg,#1E1245,#4C1D95)', borderBottom:'4px solid #D4AF37', padding:'16px 24px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:'12px', textDecoration:'none' }}>
            <img src="/logo.jpg" alt="Z2B" style={{ height:'52px', width:'52px', borderRadius:'10px', border:'2px solid #D4AF37' }} />
            <div>
              <div style={{ fontSize:'18px', fontWeight:900, color:'#D4AF37', fontFamily:'Cinzel,Georgia,serif' }}>Z2B TABLE BANQUET</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>4M Machine Power Tiers</div>
            </div>
          </Link>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            <Link href="/" style={{ padding:'8px 16px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(212,175,55,0.4)', borderRadius:'8px', color:'#D4AF37', fontSize:'13px', fontWeight:700, textDecoration:'none' }}>Home</Link>
            <Link href="/ai-income/landing" style={{ padding:'8px 16px', background:'rgba(212,175,55,0.2)', border:'1px solid #D4AF37', borderRadius:'8px', color:'#D4AF37', fontSize:'13px', fontWeight:700, textDecoration:'none' }}>🤖 4M System</Link>
            {user
              ? <Link href="/dashboard" style={{ padding:'8px 16px', background:'#D4AF37', borderRadius:'8px', color:'#1E1245', fontSize:'13px', fontWeight:700, textDecoration:'none' }}>Dashboard</Link>
              : <Link href="/login"     style={{ padding:'8px 16px', background:'#D4AF37', borderRadius:'8px', color:'#1E1245', fontSize:'13px', fontWeight:700, textDecoration:'none' }}>Sign In</Link>
            }
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ background:'linear-gradient(135deg,#1E1245,#4C1D95,#5B21B6)', padding:'56px 24px 48px', textAlign:'center', borderBottom:'4px solid #D4AF37' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'14px' }}>CHOOSE YOUR 4M MACHINE POWER</div>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(28px,5vw,44px)', fontWeight:900, color:'#fff', margin:'0 0 12px', lineHeight:1.2 }}>
            Start Manual.<br/>
            <span style={{ color:'#D4AF37' }}>Scale to Electric.</span>
          </h1>
          <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.7)', marginBottom:'8px' }}>One-time payment. Lifetime access. Build your empire forever.</p>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'28px' }}>💳 Card &nbsp;·&nbsp; 🏦 Bank EFT &nbsp;·&nbsp; 💵 ATM Cash Deposit &nbsp;·&nbsp; No monthly fees</p>

          {/* 3 machine power pills */}
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap', marginBottom:'24px' }}>
            {MACHINE_POWERS.map(p => (
              <button key={p.id} onClick={() => { setActivePower(activePower===p.id?null:p.id); setShowCompare(false) }}
                style={{ padding:'10px 20px', borderRadius:'40px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700,
                  background: activePower===p.id ? p.color : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${activePower===p.id ? p.color : 'rgba(255,255,255,0.2)'}`,
                  color: activePower===p.id ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          <button onClick={() => { setShowCompare(!showCompare); setActivePower(null) }}
            style={{ padding:'10px 24px', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(212,175,55,0.5)', borderRadius:'10px', color:'#D4AF37', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
            {showCompare ? '← Back to Tier Cards' : '📊 Compare All Tiers Side by Side'}
          </button>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      {showCompare && (
        <section style={{ padding:'48px 20px', background:'#fff' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'32px' }}>
              <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, color:'#1E1245', margin:'0 0 8px' }}>All Tiers Compared</h2>
              <p style={{ fontSize:'14px', color:'#6B7280' }}>Three powers. Six tiers. One path.</p>
            </div>
            <div style={{ overflowX:'auto', borderRadius:'16px', border:'2px solid #E5E7EB', boxShadow:'0 8px 32px rgba(76,29,149,0.1)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'780px' }}>
                <thead>
                  <tr>
                    <th style={{ padding:'14px 16px', textAlign:'left', background:'#1E1245', color:'rgba(255,255,255,0.4)', fontSize:'11px', width:'160px', fontWeight:700 }}>FEATURE</th>
                    {/* Manual group */}
                    <th colSpan={3} style={{ padding:'12px', textAlign:'center', background:'rgba(76,29,149,0.9)', color:'#fff', fontSize:'12px', fontWeight:700, borderLeft:'3px solid #7C3AED' }}>
                      🚗 MANUAL POWER
                    </th>
                    {/* Automatic group */}
                    <th colSpan={1} style={{ padding:'12px', textAlign:'center', background:'rgba(8,145,178,0.9)', color:'#fff', fontSize:'12px', fontWeight:700, borderLeft:'3px solid #0891B2' }}>
                      ⚙️ AUTOMATIC POWER
                    </th>
                    {/* Electric group */}
                    <th colSpan={2} style={{ padding:'12px', textAlign:'center', background:'rgba(180,134,11,0.9)', color:'#fff', fontSize:'12px', fontWeight:700, borderLeft:'3px solid #D4AF37' }}>
                      ⚡ ELECTRIC POWER
                    </th>
                  </tr>
                  <tr>
                    <th style={{ padding:'10px 16px', background:'#1E1245', fontSize:'11px', color:'rgba(255,255,255,0.3)' }}></th>
                    {['4M Free\nR0','Bronze\nR2,500','Copper\nR5,000'].map(t => (
                      <th key={t} style={{ padding:'10px 8px', background:'rgba(76,29,149,0.1)', textAlign:'center', fontSize:'11px', fontWeight:700, color:'#4C1D95', borderLeft:'1px solid #E5E7EB', whiteSpace:'pre-line' as const }}>{t}</th>
                    ))}
                    {['Silver\nR12,000'].map(t => (
                      <th key={t} style={{ padding:'10px 8px', background:'rgba(8,145,178,0.08)', textAlign:'center', fontSize:'11px', fontWeight:700, color:'#0891B2', borderLeft:'3px solid #0891B2', whiteSpace:'pre-line' as const }}>{t}</th>
                    ))}
                    {['Gold\nR24,000','Platinum\nR50,000'].map(t => (
                      <th key={t} style={{ padding:'10px 8px', background:'rgba(180,134,11,0.08)', textAlign:'center', fontSize:'11px', fontWeight:700, color:'#B8860B', borderLeft:'1px solid #E5E7EB', whiteSpace:'pre-line' as const }}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, ri) => (
                    <tr key={ri} style={{ background: ri%2===0 ? '#F9FAFB' : '#fff' }}>
                      <td style={{ padding:'10px 16px', fontSize:'12px', color:'#374151', fontWeight:700, borderBottom:'1px solid #F3F4F6' }}>{row.label}</td>
                      {row.manual.map((v, vi) => (
                        <td key={vi} style={{ padding:'10px 8px', textAlign:'center', fontSize:'12px', borderBottom:'1px solid #F3F4F6', borderLeft:'1px solid #F3F4F6',
                          color: v==='—'?'#D1D5DB':v.includes('✓')?'#059669':'#4C1D95', fontWeight: v==='—'?400:600 }}>{v}</td>
                      ))}
                      {row.auto.map((v, vi) => (
                        <td key={vi} style={{ padding:'10px 8px', textAlign:'center', fontSize:'12px', borderBottom:'1px solid #F3F4F6', borderLeft:'3px solid rgba(8,145,178,0.2)',
                          color: v==='—'?'#D1D5DB':v.includes('✓')||v.includes('⚙️')?'#0891B2':'#0891B2', fontWeight: v==='—'?400:700, background:'rgba(8,145,178,0.04)' }}>{v}</td>
                      ))}
                      {row.electric.map((v, vi) => (
                        <td key={vi} style={{ padding:'10px 8px', textAlign:'center', fontSize:'12px', borderBottom:'1px solid #F3F4F6', borderLeft: vi===0?'3px solid rgba(212,175,55,0.3)':'1px solid #F3F4F6',
                          color: v==='—'?'#D1D5DB':v.includes('✓')||v.includes('⚡')?'#B8860B':'#B8860B', fontWeight: v==='—'?400:700, background:'rgba(180,134,11,0.04)' }}>{v}</td>
                      ))}
                    </tr>
                  ))}
                  {/* CTA row */}
                  <tr style={{ background:'#1E1245' }}>
                    <td style={{ padding:'16px', fontSize:'12px', color:'rgba(255,255,255,0.5)', fontWeight:700 }}>Get Started</td>
                    {['fam','bronze','copper'].map(k => (
                      <td key={k} style={{ padding:'12px 8px', textAlign:'center', borderLeft:'1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => openPayment(k)} style={{ padding:'8px 14px', background:k==='fam'?'rgba(255,255,255,0.1)':'#7C3AED', border:`1px solid ${k==='fam'?'rgba(255,255,255,0.2)':'#7C3AED'}`, borderRadius:'8px', color:'#fff', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                          {k==='fam'?'Free':'Get '+(TIER_LABELS[k])}
                        </button>
                      </td>
                    ))}
                    <td style={{ padding:'12px 8px', textAlign:'center', borderLeft:'3px solid rgba(8,145,178,0.3)' }}>
                      <button onClick={() => openPayment('silver')} style={{ padding:'8px 14px', background:'#0891B2', border:'1px solid #0891B2', borderRadius:'8px', color:'#fff', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                        Get Silver
                      </button>
                    </td>
                    {['gold','platinum'].map(k => (
                      <td key={k} style={{ padding:'12px 8px', textAlign:'center', borderLeft: k==='gold'?'3px solid rgba(212,175,55,0.3)':'1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => openPayment(k)} style={{ padding:'8px 14px', background:'#B8860B', border:'1px solid #D4AF37', borderRadius:'8px', color:'#fff', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                          Get {TIER_LABELS[k]}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── MACHINE POWER SECTIONS ── */}
      {!showCompare && (
        <section style={{ padding:'48px 20px' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
            {MACHINE_POWERS.map(power => {
              const isActive = !activePower || activePower === power.id
              return (
                <div key={power.id} style={{ marginBottom:'40px', opacity: isActive ? 1 : 0.4, transition:'opacity 0.3s' }}>
                  {/* Power group header */}
                  <div style={{ background:`linear-gradient(135deg,${power.color},${power.border})`, borderRadius:'20px 20px 0 0', padding:'24px 28px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
                    <div style={{ fontSize:'40px' }}>{power.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:'#fff' }}>{power.label}</div>
                      <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', fontStyle:'italic', margin:'3px 0' }}>{power.sub}</div>
                      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', maxWidth:'600px' }}>{power.truth}</div>
                    </div>
                    <button onClick={() => openPayment(power.tiers[0])}
                      style={{ padding:'12px 24px', background:'rgba(255,255,255,0.2)', border:'2px solid rgba(255,255,255,0.4)', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', flexShrink:0 }}>
                      {power.cta} →
                    </button>
                  </div>

                  {/* Tier cards in this power */}
                  <div style={{ background:power.bg, border:`2px solid ${power.border}30`, borderRadius:'0 0 20px 20px', padding:'24px', display:'grid', gridTemplateColumns:`repeat(${power.tiers.length},1fr)`, gap:'16px' }}>
                    {power.tiers.map(tierKey => {
                      const price = TIER_PRICES[tierKey]
                      const isCurrentTier = currentTier === tierKey
                      const isBest = tierKey === 'gold'
                      const tierColor = TIER_COLORS[tierKey]
                      return (
                        <div key={tierKey} style={{ background:'#fff', borderRadius:'16px', border:`2px solid ${isBest?tierColor:isCurrentTier?'#059669':tierColor+'40'}`, padding:'24px 20px', position:'relative', boxShadow: isBest?`0 8px 32px ${tierColor}30`:'none' }}>
                          {isBest && <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:`linear-gradient(135deg,#D4AF37,#B8860B)`, borderRadius:'20px', padding:'4px 14px', fontSize:'11px', fontWeight:700, color:'#fff', whiteSpace:'nowrap' as const }}>⭐ BEST VALUE</div>}
                          {isCurrentTier && <div style={{ position:'absolute', top:'-12px', right:'14px', background:'#059669', borderRadius:'20px', padding:'4px 10px', fontSize:'10px', fontWeight:700, color:'#fff' }}>✓ ACTIVE</div>}

                          {/* Tier header */}
                          <div style={{ textAlign:'center', marginBottom:'16px', paddingBottom:'16px', borderBottom:`2px solid ${tierColor}20` }}>
                            <div style={{ fontSize:'28px', marginBottom:'6px' }}>
                              {tierKey==='platinum'?'👑':tierKey==='gold'?'⭐':tierKey==='silver'?'⚡':tierKey==='copper'?'🔶':tierKey==='bronze'?'🥉':'🆓'}
                            </div>
                            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:'#1E1245', marginBottom:'4px' }}>{TIER_LABELS[tierKey]}</div>
                            <div style={{ fontSize:'28px', fontWeight:900, color:tierColor }}>{price===0?'Free':`R${price.toLocaleString()}`}</div>
                            {price > 0 && <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'2px' }}>Once-off · Lifetime Access</div>}
                          </div>

                          {/* 4M Offers — PRIMARY */}
                          <div style={{ marginBottom:'14px' }}>
                            <div style={{ fontSize:'10px', fontWeight:700, color:power.color, letterSpacing:'1px', textTransform:'uppercase' as const, marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
                              <span>{power.icon}</span> 4M MACHINE OFFERS
                            </div>
                            {FOUR_M_OFFERS[tierKey]?.map((item, i) => (
                              <div key={i} style={{ display:'flex', gap:'7px', marginBottom:'6px', alignItems:'flex-start' }}>
                                <span style={{ color:'#059669', fontSize:'12px', flexShrink:0, marginTop:'1px' }}>✓</span>
                                <span style={{ fontSize:'12px', color:'#374151', lineHeight:1.5 }}>{item}</span>
                              </div>
                            ))}
                          </div>

                          {/* Bonus Offers */}
                          {BONUS_OFFERS[tierKey]?.length > 0 && (
                            <div style={{ marginBottom:'16px', padding:'12px', background:'rgba(76,29,149,0.04)', borderRadius:'10px', border:'1px solid rgba(76,29,149,0.1)' }}>
                              <div style={{ fontSize:'10px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase' as const, marginBottom:'8px' }}>🎁 BONUS OFFERS</div>
                              {BONUS_OFFERS[tierKey].map((item, i) => (
                                <div key={i} style={{ display:'flex', gap:'7px', marginBottom:'5px', alignItems:'flex-start' }}>
                                  <span style={{ color:'#9CA3AF', fontSize:'11px', flexShrink:0, marginTop:'1px' }}>+</span>
                                  <span style={{ fontSize:'11px', color:'#6B7280', lineHeight:1.5 }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <button onClick={() => openPayment(tierKey)} disabled={isCurrentTier}
                            style={{ width:'100%', padding:'13px', background: isCurrentTier?'#F3F4F6':isBest?`linear-gradient(135deg,${tierColor},#B8860B)`:`linear-gradient(135deg,${power.color},${power.border})`,
                              border:'none', borderRadius:'12px', color: isCurrentTier?'#9CA3AF':'#fff', fontWeight:700, fontSize:'13px', cursor: isCurrentTier?'not-allowed':'pointer',
                              fontFamily:'Cinzel,Georgia,serif' }}>
                            {isCurrentTier ? '✓ Current Tier' : price===0 ? 'Start Free' : `Get ${TIER_LABELS[tierKey]} — R${price.toLocaleString()}`}
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Upgrade nudge between powers */}
                  {power.id !== 'electric' && (
                    <div style={{ textAlign:'center', padding:'16px', margin:'8px 0' }}>
                      <span style={{ fontSize:'13px', color:power.id==='manual'?'#0891B2':'#B8860B', fontWeight:700, fontStyle:'italic' }}>
                        {power.id==='manual' ? '⚙️ Tired of doing everything yourself? Upgrade to Automatic Power →' : '⚡ Ready for the machine to run on its own? Scale to Electric Power →'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showModal && selectedTier && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'20px', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff', borderRadius:'24px', maxWidth:'520px', width:'100%', maxHeight:'90vh', overflowY:'auto', padding:'32px', position:'relative', boxShadow:'0 24px 80px rgba(0,0,0,0.4)' }}>
            <button onClick={closeModal} style={{ position:'absolute', top:'16px', right:'16px', background:'#F1F5F9', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'16px', color:'#64748B' }}>×</button>

            {/* Tier header */}
            {(() => {
              const power = getTierPower(selectedTier)
              const price = TIER_PRICES[selectedTier]
              return (
                <div style={{ textAlign:'center', marginBottom:'24px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:power?.color, letterSpacing:'2px', textTransform:'uppercase' as const, marginBottom:'8px' }}>{power?.icon} {power?.label}</div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:'#1E1245', marginBottom:'4px' }}>{TIER_LABELS[selectedTier]} Membership</div>
                  <div style={{ fontSize:'32px', fontWeight:900, color:TIER_COLORS[selectedTier] }}>R{price.toLocaleString()}</div>
                  <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Once-off · Lifetime Access</div>
                </div>
              )
            })()}

            {/* Payment options */}
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
              <button onClick={payByCard} disabled={loading}
                style={{ display:'flex', alignItems:'center', gap:'14px', padding:'16px', border:'2px solid #E2E8F0', borderRadius:'14px', cursor:'pointer', background:'#fff', textAlign:'left' as const, width:'100%' }}>
                <span style={{ fontSize:'28px' }}>💳</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#1E1245', fontSize:'15px' }}>Pay by Card</div>
                  <div style={{ fontSize:'12px', color:'#6B7280' }}>Credit/Debit card via Yoco — instant & secure</div>
                </div>
                <div style={{ background:'#D1FAE5', border:'2px solid #6EE7B7', borderRadius:'8px', padding:'4px 10px', fontSize:'11px', fontWeight:700, color:'#065F46', flexShrink:0 }}>✅ INSTANT</div>
              </button>

              {[{m:'bank',icon:'🏦',title:'Bank EFT / Transfer',sub:'Internet banking to our Nedbank account',badge:'⏳ 24hrs',bc:'#BFDBFE',tc:'#1E40AF'},
                {m:'atm', icon:'💵',title:'ATM Cash Deposit',   sub:'Cash at any Nedbank ATM nationwide',    badge:'⏳ 24hrs',bc:'#FED7AA',tc:'#92400E'}].map(({m,icon,title,sub,badge,bc,tc}) => (
                <button key={m} onClick={() => setPaymentMethod(paymentMethod===m?null:m as any)}
                  style={{ display:'flex', alignItems:'center', gap:'14px', padding:'16px', border:`2px solid ${paymentMethod===m?'#D4AF37':'#E2E8F0'}`, borderRadius:'14px', cursor:'pointer', background: paymentMethod===m?'#FFFBEB':'#fff', textAlign:'left' as const, width:'100%' }}>
                  <span style={{ fontSize:'28px' }}>{icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#1E1245', fontSize:'15px' }}>{title}</div>
                    <div style={{ fontSize:'12px', color:'#6B7280' }}>{sub}</div>
                  </div>
                  <div style={{ background:bc, border:`2px solid ${bc}`, borderRadius:'8px', padding:'4px 10px', fontSize:'11px', fontWeight:700, color:tc, flexShrink:0 }}>{badge}</div>
                </button>
              ))}
            </div>

            {/* Bank details */}
            {(paymentMethod==='bank' || paymentMethod==='atm') && (
              <div style={{ background:'#F8F5FF', border:'2px solid #4C1D95', borderRadius:'16px', padding:'20px', marginBottom:'14px' }}>
                <h3 style={{ fontWeight:700, color:'#1E1245', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px', fontSize:'15px' }}>
                  🏦 {paymentMethod==='atm' ? 'ATM Cash Deposit Details' : 'Bank Transfer Details'}
                </h3>
                {[{l:'Account Name',v:BANK.accountName,f:'name',hi:false},{l:'Account Number',v:BANK.accountNumber,f:'number',hi:false},{l:'Bank',v:BANK.bank,f:'bank',hi:false},{l:'Your Reference (IMPORTANT)',v:reference,f:'ref',hi:true}].map(row => (
                  <div key={row.f} style={{ background:'#fff', borderRadius:'10px', padding:'12px 14px', marginBottom:'8px', border:`2px solid ${row.hi?'#D4AF37':'#E2E8F0'}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:'11px', color:'#9CA3AF', marginBottom:'2px' }}>{row.l}</div>
                      <div style={{ fontWeight:700, color: row.hi?'#B8860B':'#1E1245', fontSize: row.hi?'17px':'14px' }}>{row.v}</div>
                    </div>
                    <button onClick={() => copy(row.v, row.f)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'18px', color: copied===row.f?'#059669':'#9CA3AF' }}>
                      {copied===row.f ? '✅' : '📋'}
                    </button>
                  </div>
                ))}
                <div style={{ background:'#FFFBEB', border:'2px solid #D4AF37', borderRadius:'10px', padding:'12px', marginBottom:'12px' }}>
                  <div style={{ fontSize:'11px', color:'#9CA3AF', marginBottom:'2px' }}>Amount to Deposit</div>
                  <div style={{ fontSize:'24px', fontWeight:900, color:'#B8860B' }}>R{TIER_PRICES[selectedTier].toLocaleString()}</div>
                </div>
                <div style={{ background:'#FFFBEB', border:'2px solid #FCD34D', borderRadius:'10px', padding:'10px', marginBottom:'12px', fontSize:'12px', color:'#92400E' }}>
                  ⚠️ Use YOUR reference code above. We activate within 24 hours after verifying receipt.
                </div>
                <button onClick={() => recordManualPayment(paymentMethod)}
                  style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#1E1245,#4C1D95)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  I&apos;ve Noted the Details — Complete Registration →
                </button>
              </div>
            )}

            <div style={{ textAlign:'center', fontSize:'12px', color:'#9CA3AF' }}>🔒 Secure · No monthly fees · Sponsor credited automatically</div>
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      <section style={{ maxWidth:'760px', margin:'0 auto', padding:'48px 20px' }}>
        <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, color:'#1E1245', textAlign:'center', marginBottom:'32px' }}>Frequently Asked Questions</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {FAQS.map((f, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq===i?null:i)}
              style={{ background:'#fff', border:`2px solid ${openFaq===i?'#4C1D95':'#E5E7EB'}`, borderRadius:'14px', padding:'18px 20px', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
                <div style={{ fontWeight:700, color:'#1E1245', fontSize:'14px', flex:1 }}>{f.q}</div>
                <span style={{ fontSize:'20px', color:'#D4AF37', flexShrink:0 }}>{openFaq===i?'−':'+'}</span>
              </div>
              {openFaq===i && <div style={{ marginTop:'10px', fontSize:'13px', color:'#475569', lineHeight:1.7 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ background:'linear-gradient(135deg,#1E1245,#4C1D95)', padding:'56px 20px', textAlign:'center', borderTop:'4px solid #D4AF37' }}>
        <div style={{ maxWidth:'600px', margin:'0 auto' }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, color:'#fff', marginBottom:'10px' }}>Ready to Transform Your Life?</h3>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.6)', marginBottom:'24px' }}>Start with Manual Power. Scale when you are ready. Your legacy awaits.</p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => openPayment('bronze')} style={{ padding:'14px 32px', background:'#D4AF37', border:'none', borderRadius:'12px', color:'#1E1245', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
              🚗 Start Manual — Bronze R2,500
            </button>
            <button onClick={() => { setShowCompare(true); window.scrollTo({top:0,behavior:'smooth'}) }}
              style={{ padding:'14px 28px', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.3)', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
              📊 Compare All Tiers
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#0D0820', padding:'28px 20px', textAlign:'center', borderTop:'4px solid #D4AF37' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'10px' }}>
          <img src="/logo.jpg" alt="Z2B" style={{ height:'40px', width:'40px', borderRadius:'8px', border:'2px solid #D4AF37' }} />
          <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:'#D4AF37' }}>Z2B TABLE BANQUET</span>
        </div>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', margin:0 }}>© {new Date().getFullYear()} Z2B Table Banquet. All rights reserved.</p>
      </footer>
    </div>
  )
}
