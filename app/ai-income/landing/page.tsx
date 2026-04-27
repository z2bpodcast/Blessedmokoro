'use client'
// FILE: app/ai-income/landing/page.tsx
// Z2B 4M Income Execution System — Landing Page
// Light Purple dominant · Smartphone-first · Outcome language · No API exposure

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const INCOME_PROOFS = [
  { name:'Thabo M.', location:'Soweto', product:'CV Writing', earned:'R300', time:'Day 2', quote:'I sent 8 messages on Day 1. By Day 2 I had R300 in my SnapScan.' },
  { name:'Naledi S.', location:'Pretoria', product:'WhatsApp Content Pack', earned:'R450', time:'Day 3', quote:'I charged R150 per pack. Sold 3 in one day from my Facebook group post.' },
  { name:'Gift K.', location:'Durban', product:'Side Hustle Starter Pack', earned:'R100', time:'Day 1', quote:'One WhatsApp status. One reply. R100. I was shocked it was that simple.' },
]

const DIGITAL_PRODUCTS = [
  { icon:'💼', name:'WhatsApp Business Boost Pack', price:'R150–R300',
    outcome:'Help a local business get more customers using WhatsApp',
    script:'I help small businesses get more customers using WhatsApp. Let me set up your profile and write 10 messages that bring paying clients — done in 24 hours. R100.' },
  { icon:'📄', name:'CV & Job Boost Kit', price:'R100–R100',
    outcome:'Write CVs that actually get people interviews',
    script:'I write professional CVs that get callbacks. Most CVs are rejected in 10 seconds. R150 — delivered same day via WhatsApp.' },
  { icon:'📱', name:'Social Media Content Pack', price:'R100–R400',
    outcome:'Create 30 days of content for a business in one sitting',
    script:'I create 30 days of social media posts for your business. R250 — WhatsApp me your business name and I start today.' },
  { icon:'💬', name:'Customer Attraction Messages', price:'R100–R100',
    outcome:'Write messages that make people want to buy',
    script:'I write WhatsApp messages that make people want to buy from you. 10 messages written for YOUR product. R120.' },
  { icon:'🚀', name:'Side Hustle Starter Pack', price:'R150–R300',
    outcome:'Help someone start earning in 48 hours using what they already have',
    script:'I help people start earning online in 48 hours using their existing skills. No quitting your job. R100 for the complete starter system.' },
]

function LandingInner() {
  const searchParams  = useSearchParams()
  const ref           = searchParams.get('ref') || ''
  const [sponsorName, setSponsorName]   = useState('')
  const [user,        setUser]          = useState<any>(null)
  const [unlocked,    setUnlocked]      = useState(false)
  const [activeProduct, setActiveProduct] = useState<number|null>(null)
  const [activeProof,   setActiveProof]   = useState(0)
  const [showReg,     setShowReg]       = useState(false)
  const [regName,     setRegName]       = useState('')
  const [regEmail,    setRegEmail]      = useState('')
  const [regWa,       setRegWa]         = useState('')
  const [paying,      setPaying]        = useState(false)
  const [payError,    setPayError]      = useState('')
  const [regLoading,  setRegLoading]    = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        const { data: unlock } = await supabase.from('ai_income_unlocks').select('*').eq('user_id', u.id).single()
        if (unlock) setUnlocked(true)
      }
    })
    if (ref) {
      fetch('/api/sponsor?ref=' + encodeURIComponent(ref))
        .then(r => r.json()).then(d => { if (d?.name) setSponsorName(d.name) }).catch(() => {})
    }
    // Rotate income proofs
    const t = setInterval(() => setActiveProof(p => (p + 1) % INCOME_PROOFS.length), 4000)
    return () => clearInterval(t)
  }, [ref])

  const handlePay = () => {
    if (user) {
      // Already logged in — go straight to choose-plan
      window.location.href = ref ? `/ai-income/choose-plan?ref=${ref}` : '/ai-income/choose-plan'
    } else {
      // Show light registration modal first
      setShowReg(true)
    }
  }

  const handleRegPay = async () => {
    if (!regName.trim() || !regEmail.trim() || !regWa.trim()) return
    setRegLoading(true)
    const pwd = 'Z2B' + Math.random().toString(36).slice(2, 10).toUpperCase() + '!'
    const { data: authData, error } = await supabase.auth.signUp({
      email: regEmail.trim().toLowerCase(), password: pwd,
      options: { data: { full_name: regName.trim(), whatsapp: regWa.trim(), referred_by: ref || null } },
    })
    if (error && !error.message.toLowerCase().includes('already')) {
      setPayError(error.message); setRegLoading(false); return
    }
    // Light registration done — go to choose-plan
    setShowReg(false)
    window.location.href = ref ? `/ai-income/choose-plan?ref=${ref}` : '/ai-income/choose-plan'
  }

  // Colour tokens
  const BG    = '#F3F0FF'   // Light purple — main background
  const BG2   = '#EDE9FE'   // Slightly darker light purple
  const PURP  = '#4C1D95'   // Deep purple — primary
  const PURPL = '#7C3AED'   // Purple light — accents
  const GOLD  = '#B8860B'   // Gold dark
  const GOLDL = '#D4AF37'   // Gold light
  const WHITE = '#FFFFFF'
  const DARK  = '#1E1245'

  return (
    <div style={{ minHeight:'100vh', background:BG, color:DARK, fontFamily:'Georgia, serif', overflowX:'hidden' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .cta-main { transition:all 0.2s!important; }
        .cta-main:hover { transform:translateY(-3px)!important; box-shadow:0 16px 48px rgba(76,29,149,0.5)!important; }
        .product-card { transition:all 0.2s!important; }
        .product-card:hover { transform:translateY(-2px)!important; box-shadow:0 8px 24px rgba(76,29,149,0.15)!important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(76,29,149,0.95)', backdropFilter:'blur(20px)', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:GOLDL }}>Z2B 4M</div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {unlocked
            ? <Link href={ref ? `/ai-income/choose-plan?ref=${ref}` : `/ai-income/choose-plan`} style={{ padding:'8px 18px', background:GOLDL, borderRadius:'20px', color:DARK, fontWeight:700, fontSize:'13px', textDecoration:'none' }}>Enter System →</Link>
            : <>
                <Link href="/login?redirect=/ai-income" style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', textDecoration:'none' }}>Sign In</Link>
                <button onClick={handlePay} style={{ padding:'9px 20px', background:GOLDL, border:'none', borderRadius:'20px', color:DARK, fontWeight:700, fontSize:'13px', cursor:'pointer' }}>Choose My Plan →</button>
              </>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background:`linear-gradient(160deg,${PURP} 0%,${PURPL} 60%,#5B21B6 100%)`, padding:'56px 20px 48px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-60px', right:'-40px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(212,175,55,0.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-40px', left:'-30px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />

        <div style={{ maxWidth:'480px', margin:'0 auto', position:'relative', zIndex:1, animation:'fadeIn 0.8s ease' }}>

          {/* Sponsor */}
          {sponsorName && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'40px', padding:'6px 16px', marginBottom:'20px' }}>
              <span>🏆</span>
              <span style={{ fontSize:'13px', fontWeight:700, color:WHITE }}>Invited by {sponsorName}</span>
            </div>
          )}

          {/* Live indicator */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', borderRadius:'40px', padding:'6px 16px', marginBottom:'20px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#10B981', animation:'pulse 1.5s infinite' }} />
            <span style={{ fontSize:'11px', fontWeight:700, color:'#6EE7B7', letterSpacing:'2px', textTransform:'uppercase' }}>60-Day AI Income Activation</span>
          </div>

          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(30px,7vw,48px)', fontWeight:900, color:WHITE, margin:'0 0 12px', lineHeight:1.1 }}>
            Z2B 4M:<br/>
            <span style={{ color:GOLDL }}>60-Day Mobile<br/>Money Machine</span>
          </h1>

          <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.9)', margin:'0 0 8px', fontWeight:700 }}>
            AI-Powered Smartphone Income System
          </p>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.65)', margin:'0 0 24px', lineHeight:1.7 }}>
            Use AI to generate offers, find customers and close sales — all from your smartphone. Make your first R100 today. Scale to R300/day.
          </p>

          {/* Rev quote */}
          <div style={{ background:'rgba(255,255,255,0.1)', border:`1px solid ${GOLDL}40`, borderRadius:'14px', padding:'14px 20px', marginBottom:'28px' }}>
            <p style={{ fontSize:'14px', fontStyle:'italic', color:WHITE, margin:'0 0 6px', lineHeight:1.6 }}>
              "If they underpay you or fail to employ you, deploy yourself."
            </p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', margin:0, fontWeight:700 }}>— Rev Mokoro Manana, Founder Z2B</p>
          </div>

          {/* CTA */}
          {payError && <div style={{ background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'10px', padding:'10px', marginBottom:'14px', fontSize:'13px', color:'#FCA5A5' }}>⚠️ {payError}</div>}
          <button onClick={handlePay} disabled={paying} className="cta-main"
            style={{ display:'block', width:'100%', padding:'18px', background:GOLDL, border:'none', borderRadius:'16px', color:DARK, fontWeight:700, fontSize:'17px', cursor:paying?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 8px 32px ${GOLDL}40`, opacity:paying?0.7:1, marginBottom:'12px' }}>
            {paying ? 'Setting up...' : '🚀 Start 4M Machine — R500'}
          </button>

          {/* Upgrade tiers link */}
          <Link href="/pricing?compare=true" style={{ display:'block', width:'100%', padding:'14px', background:'rgba(255,255,255,0.12)', border:`1.5px solid rgba(255,255,255,0.25)`, borderRadius:'14px', color:WHITE, fontWeight:700, fontSize:'14px', textDecoration:'none', textAlign:'center' as const, boxSizing:'border-box' as const }}>
            🍽️ View All Membership Tiers →
          </Link>

          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'10px' }}>60-day access · R500/month after · Cancel anytime</p>
        </div>
      </section>

      {/* ── INCOME PROOF TICKER ── */}
      <section style={{ background:PURP, padding:'20px' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px', textAlign:'center' }}>REAL RESULTS FROM REAL PEOPLE</div>
          <div key={activeProof} style={{ background:'rgba(255,255,255,0.08)', border:`1px solid ${GOLDL}30`, borderRadius:'14px', padding:'16px 18px', animation:'slideIn 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <div>
                <span style={{ fontSize:'13px', fontWeight:700, color:WHITE }}>{INCOME_PROOFS[activeProof].name}</span>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginLeft:'6px' }}>· {INCOME_PROOFS[activeProof].location}</span>
              </div>
              <div style={{ textAlign:'right' as const }}>
                <div style={{ fontSize:'18px', fontWeight:900, color:GOLDL }}>{INCOME_PROOFS[activeProof].earned}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)' }}>{INCOME_PROOFS[activeProof].time}</div>
              </div>
            </div>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', fontStyle:'italic', margin:'0 0 6px', lineHeight:1.6 }}>"{INCOME_PROOFS[activeProof].quote}"</p>
            <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.7)', fontWeight:700 }}>Sold: {INCOME_PROOFS[activeProof].product}</div>
          </div>
          <div style={{ display:'flex', gap:'6px', justifyContent:'center', marginTop:'10px' }}>
            {INCOME_PROOFS.map((_, i) => (
              <div key={i} onClick={() => setActiveProof(i)}
                style={{ width:'28px', height:'4px', borderRadius:'2px', cursor:'pointer', background:i===activeProof?GOLDL:'rgba(255,255,255,0.2)', transition:'background 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT HOLDS PEOPLE BACK ── */}
      <section style={{ background:BG2, padding:'48px 20px' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:PURPL, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px', textAlign:'center' }}>WHY MOST PEOPLE STAY STUCK</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, margin:'0 0 20px', textAlign:'center' as const, lineHeight:1.3 }}>You Are Not Stuck Because You Are Lazy</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
            {['They wait for better-paying jobs that never come','They resign too early and run out of money','They learn for months but never earn anything','They have no system — only motivation','They do not know what to sell or who to sell to'].map(item => (
              <div key={item} style={{ display:'flex', gap:'10px', padding:'12px 14px', background:WHITE, borderRadius:'12px', border:'1px solid rgba(76,29,149,0.1)', alignItems:'flex-start' }}>
                <span style={{ color:'#DC2626', fontSize:'14px', flexShrink:0, marginTop:'1px' }}>✗</span>
                <span style={{ fontSize:'14px', color:'#374151', lineHeight:1.6 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background:`linear-gradient(135deg,${PURP},${PURPL})`, borderRadius:'16px', padding:'20px 18px', textAlign:'center' as const }}>
            <p style={{ fontSize:'16px', fontWeight:700, color:WHITE, margin:'0 0 8px', lineHeight:1.5 }}>
              Information alone does NOT create income.
            </p>
            <p style={{ fontSize:'19px', fontWeight:900, color:GOLDL, margin:0, lineHeight:1.4 }}>
              Information + Execution does.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3 VEHICLE MODES ── */}
      <section style={{ background:BG, padding:'48px 20px' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:PURPL, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px', textAlign:'center' }}>YOUR 4M MACHINE LEVELS</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, margin:'0 0 6px', textAlign:'center' as const }}>Start Manual. Scale to Electric.</h2>
          <p style={{ fontSize:'14px', color:'#64748B', textAlign:'center' as const, margin:'0 0 24px' }}>Every level builds on the previous. No skipping required.</p>

          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {/* Manual */}
            <div style={{ background:WHITE, borderRadius:'20px', padding:'24px 20px', border:`2px solid ${PURPL}30`, boxShadow:'0 4px 20px rgba(76,29,149,0.08)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:`${PURP}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0 }}>🚗</div>
                <div>
                  <div style={{ fontSize:'16px', fontWeight:900, color:PURP, fontFamily:'Cinzel,Georgia,serif' }}>Manual Mode</div>
                  <div style={{ fontSize:'11px', color:'#64748B', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'1px' }}>Starter · Bronze · Copper</div>
                </div>
                <div style={{ marginLeft:'auto', background:`${PURP}10`, borderRadius:'8px', padding:'4px 10px', fontSize:'10px', fontWeight:700, color:PURP }}>LEARN & EARN</div>
              </div>
              <div style={{ fontSize:'14px', fontStyle:'italic', color:DARK, fontWeight:700, marginBottom:'4px' }}>You drive everything yourself.</div>
              <div style={{ fontSize:'13px', color:PURPL, fontWeight:700, marginBottom:'12px' }}>This is where you build your first income foundation.</div>
              <div style={{ height:'1px', background:`${PURP}15`, marginBottom:'12px' }} />
              {['Your AI creates your first sellable offer today','Exactly who to contact and what to say','Posts ready to copy-paste to WhatsApp and Facebook','AI handles every customer objection for you','Scripts to close sales and collect payment'].map(pt => (
                <div key={pt} style={{ display:'flex', gap:'8px', marginBottom:'7px', alignItems:'flex-start' }}>
                  <span style={{ color:PURPL, fontSize:'12px', flexShrink:0, marginTop:'2px' }}>✦</span>
                  <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>{pt}</span>
                </div>
              ))}
              <div style={{ marginTop:'14px', padding:'10px 14px', background:`${PURP}06`, borderRadius:'10px', fontSize:'12px', color:'#64748B', fontStyle:'italic' }}>
                Slower. Requires effort. But builds real understanding — and real income habits.
              </div>
            </div>

            {/* Upgrade nudge */}
            <div style={{ textAlign:'center' as const, padding:'8px', color:PURPL, fontSize:'13px', fontWeight:700 }}>
              ↓ Tired of doing everything yourself? Upgrade to Automatic Mode ↓
            </div>

            {/* Automatic */}
            <div style={{ background:WHITE, borderRadius:'20px', padding:'24px 20px', border:`2px solid #0891B2`, boxShadow:'0 4px 20px rgba(8,145,178,0.12)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'rgba(8,145,178,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0 }}>⚙️</div>
                <div>
                  <div style={{ fontSize:'16px', fontWeight:900, color:'#0891B2', fontFamily:'Cinzel,Georgia,serif' }}>Automatic Mode</div>
                  <div style={{ fontSize:'11px', color:'#64748B', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'1px' }}>Silver ⭐ — MOST IMPORTANT</div>
                </div>
                <div style={{ marginLeft:'auto', background:'rgba(8,145,178,0.1)', borderRadius:'8px', padding:'4px 10px', fontSize:'10px', fontWeight:700, color:'#0891B2' }}>AUTOMATION</div>
              </div>
              <div style={{ fontSize:'14px', fontStyle:'italic', color:DARK, fontWeight:700, marginBottom:'4px' }}>The system starts helping you drive.</div>
              <div style={{ fontSize:'13px', color:'#0891B2', fontWeight:700, marginBottom:'12px' }}>From struggle to FLOW — your 4M Machine works WITH you.</div>
              <div style={{ height:'1px', background:'rgba(8,145,178,0.15)', marginBottom:'12px' }} />
              {['Turn one product idea into five — automatically','Launch to all platforms in one click','Your follow-up messages send themselves','Schedule content while you sleep','Connect your business to any tool or app'].map(pt => (
                <div key={pt} style={{ display:'flex', gap:'8px', marginBottom:'7px', alignItems:'flex-start' }}>
                  <span style={{ color:'#0891B2', fontSize:'12px', flexShrink:0, marginTop:'2px' }}>✦</span>
                  <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>{pt}</span>
                </div>
              ))}
            </div>

            {/* Upgrade nudge */}
            <div style={{ textAlign:'center' as const, padding:'8px', color:GOLD, fontSize:'13px', fontWeight:700 }}>
              ↓ Ready for the machine to run on its own? Upgrade to Electric ↓
            </div>

            {/* Electric */}
            <div style={{ background:'linear-gradient(160deg,#1E1245,#2D1B69)', borderRadius:'20px', padding:'24px 20px', border:`2px solid ${GOLDL}50` }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:`${GOLDL}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0 }}>⚡</div>
                <div>
                  <div style={{ fontSize:'16px', fontWeight:900, color:GOLDL, fontFamily:'Cinzel,Georgia,serif' }}>Electric Mode</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'1px' }}>Gold · Platinum</div>
                </div>
                <div style={{ marginLeft:'auto', background:`${GOLDL}20`, borderRadius:'8px', padding:'4px 10px', fontSize:'10px', fontWeight:700, color:GOLDL }}>SELF-SUSTAINING</div>
              </div>
              <div style={{ fontSize:'14px', fontStyle:'italic', color:WHITE, fontWeight:700, marginBottom:'4px' }}>The system drives most of the journey.</div>
              <div style={{ fontSize:'13px', color:GOLDL, fontWeight:700, marginBottom:'12px' }}>Your income runs daily with minimal effort.</div>
              <div style={{ height:'1px', background:`${GOLDL}20`, marginBottom:'12px' }} />
              {['An AI avatar talks to leads for you — 24/7','Your follow-ups run automatically even when offline','Multiple 7 income streams active simultaneously','AI generates product images and marketing visuals','Your own white-label platform (Platinum)'].map(pt => (
                <div key={pt} style={{ display:'flex', gap:'8px', marginBottom:'7px', alignItems:'flex-start' }}>
                  <span style={{ color:GOLDL, fontSize:'12px', flexShrink:0, marginTop:'2px' }}>✦</span>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.8)', lineHeight:1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Killer line */}
          <div style={{ marginTop:'20px', padding:'20px', background:DARK, borderRadius:'16px', textAlign:'center' as const }}>
            <p style={{ fontSize:'18px', fontWeight:700, color:GOLDL, fontStyle:'italic', margin:'0 0 6px' }}>
              "Start manual. Upgrade to automatic. Scale to electric."
            </p>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', margin:0 }}>Your pace. Your income. Your machine.</p>
          </div>
        </div>
      </section>

      {/* ── 72-HOUR PLAN ── */}
      <section style={{ background:`linear-gradient(135deg,${PURP},${PURPL})`, padding:'48px 20px' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px', textAlign:'center' }}>YOUR ACTION PLAN</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:WHITE, margin:'0 0 6px', textAlign:'center' as const }}>First R300 in 72 Hours</h2>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.65)', textAlign:'center' as const, margin:'0 0 24px' }}>Three days. Three actions. Real income.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[
              { day:'Day 1', icon:'🏗️', title:'Build', color:'rgba(255,255,255,0.15)', steps:['AI creates your first sellable offer','Set your price (R100–R300)','Write your one-sentence pitch'] },
              { day:'Day 2', icon:'📣', title:'Market', color:'rgba(255,255,255,0.15)', steps:['Post on WhatsApp Status (morning)','Message 10 people directly','Post in 2 Facebook groups'] },
              { day:'Day 3', icon:'💰', title:'Close', color:'rgba(255,255,255,0.15)', steps:['Follow up with everyone who replied','Handle objections with AI scripts','Ask for the sale. Collect payment.'] },
            ].map(({ day, icon, title, color, steps }) => (
              <div key={day} style={{ background:color, border:'1px solid rgba(255,255,255,0.2)', borderRadius:'16px', padding:'18px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                  <span style={{ fontSize:'22px' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'1px' }}>{day}</div>
                    <div style={{ fontSize:'16px', fontWeight:700, color:WHITE }}>{title}</div>
                  </div>
                </div>
                {steps.map(step => (
                  <div key={step} style={{ display:'flex', gap:'8px', marginBottom:'6px' }}>
                    <span style={{ color:GOLDL, fontSize:'12px', flexShrink:0, marginTop:'2px' }}>→</span>
                    <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.85)' }}>{step}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop:'20px', textAlign:'center' as const, padding:'16px', background:'rgba(255,255,255,0.1)', borderRadius:'12px' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color:WHITE }}>You do not study business.</div>
            <div style={{ fontSize:'16px', fontWeight:900, color:GOLDL, marginTop:'4px' }}>You build income habits.</div>
          </div>
        </div>
      </section>

      {/* ── 5 DIGITAL PRODUCTS ── */}
      <section style={{ background:BG2, padding:'48px 20px' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:PURPL, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px', textAlign:'center' }}>READY TO SELL TODAY</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, margin:'0 0 6px', textAlign:'center' as const }}>5 Products. No Experience Needed.</h2>
          <p style={{ fontSize:'13px', color:'#64748B', textAlign:'center' as const, margin:'0 0 20px' }}>Tap any product to see the selling script</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {DIGITAL_PRODUCTS.map((p, i) => (
              <div key={i} className="product-card"
                onClick={() => setActiveProduct(activeProduct === i ? null : i)}
                style={{ background:WHITE, borderRadius:'16px', border:`1.5px solid ${activeProduct===i?PURP:'rgba(76,29,149,0.12)'}`, overflow:'hidden', cursor:'pointer', boxShadow:activeProduct===i?`0 8px 24px rgba(76,29,149,0.15)`:'none' }}>
                <div style={{ padding:'16px 18px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:`${PURP}10`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{p.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'14px', fontWeight:700, color:DARK }}>{p.name}</div>
                    <div style={{ fontSize:'12px', color:'#64748B', marginTop:'1px' }}>{p.outcome}</div>
                  </div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:PURP }}>{p.price}</div>
                  <div style={{ fontSize:'16px', color:'#94A3B8', transition:'transform 0.2s', transform:activeProduct===i?'rotate(180deg)':'none' }}>⌄</div>
                </div>
                {activeProduct === i && (
                  <div style={{ padding:'0 18px 18px', borderTop:'1px solid rgba(76,29,149,0.08)' }}>
                    <div style={{ background:`${PURP}06`, borderRadius:'12px', padding:'14px', border:`1px solid ${PURP}15`, marginTop:'12px', marginBottom:'10px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:PURP, letterSpacing:'1px', textTransform:'uppercase' as const, marginBottom:'6px' }}>📋 Copy This Selling Script</div>
                      <div style={{ fontSize:'13px', color:DARK, lineHeight:1.8, fontStyle:'italic' }}>"{p.script}"</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(p.script) }}
                      style={{ width:'100%', padding:'10px', background:PURP, border:'none', borderRadius:'10px', color:WHITE, fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                      📋 Copy Script
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT THE SYSTEM DOES FOR YOU ── */}
      <section style={{ background:BG, padding:'48px 20px' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:PURPL, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px', textAlign:'center' }}>THE MACHINE WORKS FOR YOU</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, margin:'0 0 20px', textAlign:'center' as const }}>What the 4M System Does</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { icon:'🧠', outcome:'Tells you exactly what to sell based on your skills', when:'Immediately' },
              { icon:'👥', outcome:'Finds your customers and tells you exactly who to contact', when:'Day 1' },
              { icon:'✍️', outcome:'Writes your WhatsApp messages and social posts for you', when:'Day 1' },
              { icon:'💬', outcome:'Responds to every customer reply with the perfect message', when:'When needed' },
              { icon:'💸', outcome:'Scripts to close sales and collect payment confidently', when:'Day 1-3' },
              { icon:'🔄', outcome:'Sends follow-up messages automatically — even when you are offline', when:'Automatic' },
              { icon:'🎥', outcome:'An AI version of you talks to new leads while you focus on closing', when:'Electric Mode' },
              { icon:'🔗', outcome:'Earn R100 every time someone you refer joins the system', when:'Always' },
            ].map(({ icon, outcome, when }) => (
              <div key={outcome} style={{ display:'flex', gap:'12px', padding:'14px 16px', background:WHITE, borderRadius:'14px', border:'1px solid rgba(76,29,149,0.1)', alignItems:'flex-start' }}>
                <span style={{ fontSize:'20px', flexShrink:0 }}>{icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', color:DARK, lineHeight:1.6 }}>{outcome}</div>
                </div>
                <div style={{ fontSize:'11px', fontWeight:700, color:PURPL, background:`${PURP}08`, padding:'3px 8px', borderRadius:'8px', flexShrink:0, whiteSpace:'nowrap' as const }}>{when}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICE vs COST ── */}
      <section style={{ background:DARK, padding:'48px 20px' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:GOLDL, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px', textAlign:'center' }}>AN HONEST COMPARISON</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:WHITE, margin:'0 0 20px', textAlign:'center' as const }}>Price vs Cost</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'20px' }}>
            <div style={{ background:'rgba(16,185,129,0.1)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'18px', padding:'22px 20px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#6EE7B7', letterSpacing:'2px', textTransform:'uppercase' as const, marginBottom:'8px' }}>💵 THE PRICE</div>
              <div style={{ fontSize:'36px', fontWeight:900, color:'#6EE7B7', fontFamily:'Cinzel,Georgia,serif', marginBottom:'4px' }}>R500</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'14px' }}>60-Day AI Income Activation Program</div>
              {['Full 4M Machine — 3 vehicle modes','AI creates your offers, posts and messages','5 ready-to-sell digital products','Referral income — R100 per person you refer','60-day guided execution plan'].map(item => (
                <div key={item} style={{ display:'flex', gap:'8px', marginBottom:'7px' }}>
                  <span style={{ color:'#6EE7B7', fontSize:'13px' }}>✅</span>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.8)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1.5px solid rgba(239,68,68,0.25)', borderRadius:'18px', padding:'22px 20px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#FCA5A5', letterSpacing:'2px', textTransform:'uppercase' as const, marginBottom:'8px' }}>❗ COST OF NOT STARTING</div>
              <div style={{ fontSize:'36px', fontWeight:900, color:'#FCA5A5', fontFamily:'Cinzel,Georgia,serif', marginBottom:'4px' }}>∞</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'14px' }}>Paid in freedom, time and purpose</div>
              {['Working for someone else forever','No financial freedom','No time for what matters','No legacy to leave your children','Missed opportunities every single day'].map(item => (
                <div key={item} style={{ display:'flex', gap:'8px', marginBottom:'7px' }}>
                  <span style={{ color:'#FCA5A5', fontSize:'13px' }}>❌</span>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding:'20px', background:'rgba(212,175,55,0.1)', border:`1.5px solid ${GOLDL}40`, borderRadius:'16px', textAlign:'center' as const }}>
            <p style={{ fontSize:'16px', fontWeight:700, color:GOLDL, fontStyle:'italic', margin:'0 0 12px', lineHeight:1.6 }}>
              "The PRICE is R500.<br/>The COST is your future lifestyle, freedom, and missed opportunity."
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {['R500 is the cost of starting.','You are choosing direction, not buying access.','Delay is more expensive than action.'].map(line => (
                <div key={line} style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', fontStyle:'italic' }}>✦ {line}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background:`linear-gradient(160deg,${PURP},${PURPL})`, padding:'56px 20px', textAlign:'center' as const }}>
        <div style={{ maxWidth:'420px', margin:'0 auto' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'14px' }}>DEPLOY YOURSELF</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,6vw,36px)', fontWeight:900, color:WHITE, margin:'0 0 10px', lineHeight:1.2 }}>
            Your First Income<br/>
            <span style={{ color:GOLDL }}>Starts Today</span>
          </h2>
          <p style={{ fontSize:'28px', fontWeight:900, fontStyle:'italic', color:GOLDL, margin:'16px 0 20px', lineHeight:1.3 }}>
            "If they underpay you<br/>or fail to employ you,<br/>deploy yourself."
          </p>
          {payError && <div style={{ background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'10px', padding:'10px', marginBottom:'14px', fontSize:'13px', color:'#FCA5A5' }}>⚠️ {payError}</div>}
          <button onClick={handlePay} disabled={paying} className="cta-main"
            style={{ display:'block', width:'100%', padding:'20px', background:GOLDL, border:'none', borderRadius:'16px', color:DARK, fontWeight:700, fontSize:'18px', cursor:paying?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 12px 48px ${GOLDL}50`, opacity:paying?0.7:1, marginBottom:'12px' }}>
            {paying ? 'Setting up payment...' : '🚀 Join Z2B 4M Community — R500'}
          </button>
          <Link href="/pricing?compare=true" style={{ display:'block', width:'100%', padding:'14px', background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:'14px', color:WHITE, fontWeight:700, fontSize:'14px', textDecoration:'none', textAlign:'center' as const, boxSizing:'border-box' as const }}>
            🍽️ View All Membership Tiers & Prices →
          </Link>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'12px' }}>
            Already a member? <Link href="/login?redirect=/ai-income" style={{ color:GOLDL, textDecoration:'none', fontWeight:700 }}>Sign in →</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:DARK, padding:'32px 20px', textAlign:'center' as const }}>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:GOLDL, marginBottom:'6px' }}>Z2B 4M</div>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'12px' }}>Mobile · Money · Making · Machine</div>
        <div style={{ height:'1px', background:`${GOLDL}30`, maxWidth:'120px', margin:'0 auto 12px' }} />
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', margin:0 }}>
          Built for execution. Powered by AI. Designed for income.<br/>
          © {new Date().getFullYear()} Zero2Billionaires Amavulandlela PTY Ltd
        </p>
      </footer>
      {/* ── LIGHT REGISTRATION MODAL ── */}
      {showReg && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'linear-gradient(160deg,#1E1245,#0D0820)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'20px', padding:'28px 24px', width:'100%', maxWidth:'400px', position:'relative' }}>
            
            {/* Close */}
            <button onClick={() => setShowReg(false)}
              style={{ position:'absolute', top:'14px', right:'14px', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'30px', height:'30px', color:'#fff', fontSize:'16px', cursor:'pointer' }}>×</button>

            {/* Header */}
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:'#fff', marginBottom:'4px' }}>
                Create Your Free Account
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>
                Quick setup · Then choose your power level
              </div>
            </div>

            {/* Fields */}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
              <input value={regName} onChange={e => setRegName(e.target.value)}
                placeholder="Full Name *" autoFocus
                style={{ padding:'12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none', fontFamily:'Georgia,serif' }} />
              <input value={regEmail} onChange={e => setRegEmail(e.target.value)}
                placeholder="Email Address *" type="email"
                style={{ padding:'12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none', fontFamily:'Georgia,serif' }} />
              <input value={regWa} onChange={e => setRegWa(e.target.value)}
                placeholder="WhatsApp Number *"
                style={{ padding:'12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none', fontFamily:'Georgia,serif' }} />
            </div>

            {payError && <div style={{ color:'#FCA5A5', fontSize:'12px', marginBottom:'10px', textAlign:'center' }}>{payError}</div>}

            {/* CTA */}
            <button onClick={handleRegPay} disabled={regLoading || !regName.trim() || !regEmail.trim() || !regWa.trim()}
              style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#D4AF37,#B8860B)', border:'none', borderRadius:'12px', color:'#1E1245', fontWeight:900, fontSize:'15px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', opacity: regLoading ? 0.7 : 1 }}>
              {regLoading ? 'Setting up your account...' : '🚀 Continue to Choose Plan →'}
            </button>

            <div style={{ textAlign:'center', marginTop:'12px', fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>
              Free to start · No payment required yet · Cancel anytime
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function AIIncomeLandingWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#F3F0FF', display:'flex', alignItems:'center', justifyContent:'center', color:'#4C1D95', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <LandingInner />
    </Suspense>

  )
}
