'use client'
// FILE: app/invite/page.tsx
// Z2B 4M Machine — Public Invite Page
// Flow: /invite?ref=REVMOK2B → view page → CTA → /ai-income/landing?ref=REVMOK2B → /ai-income/choose-plan

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const BG   = '#0D0820'
const PURP = '#4C1D95'
const GOLD = '#D4AF37'
const W    = '#F0EEF8'

const VEHICLES = [
  { icon:'🚗', name:'Manual Power', tiers:'Free → Starter → Bronze → Copper', desc:'Launch your first digital product and earn your first R200–R2,000/month from your phone.' },
  { icon:'⚙️', name:'Automatic Power', tiers:'Silver (R12,000)', desc:'Build a niche business, create 7 products, launch sales funnels and earn your first R10,000–R30,000/month.' },
  { icon:'⚡', name:'Electric Power', tiers:'Gold → Platinum', desc:'Run a full digital business empire with 7 Digital Twins, 10-generation team commissions and leadership bonuses up to R3.5M quarterly.' },
]

const FEATURES = [
  { icon:'🤖', name:'Coach Manlaw', desc:'AI business execution coach — gives numbered action steps, not motivation. Available 24/7.' },
  { icon:'🧠', name:'Offer Generator', desc:'Describe your skill → AI creates your first sellable product with pricing and pitch.' },
  { icon:'📲', name:'Customer Finder', desc:'AI finds your first 10 buyers and writes the exact message to send them.' },
  { icon:'🔍', name:'Self-Discovery Engine', desc:'5 questions → your Income Identity, #1 income path, first product and first action.' },
  { icon:'📦', name:'Product Engine', desc:'One idea → up to 7 sellable digital products with prices, formats and pitches.' },
  { icon:'📊', name:'Sales Funnel Builder', desc:'Your product → complete 5-step WhatsApp sales funnel, copy-paste ready.' },
  { icon:'🎭', name:'Digital Twin', desc:'AI version of you that handles enquiries, follows up and qualifies leads while you sleep.' },
]

const INCOME_STREAMS = [
  { name:'ISP', full:'Income Share Profit', desc:'18–30% on every sale you make (by tier)' },
  { name:'QPB', full:'Qualified Performance Bonus', desc:'+7.5% bonus when you qualify monthly targets' },
  { name:'TSC', full:'Team Sales Commission', desc:'Earn on up to 10 generations of your team' },
  { name:'TLI', full:'Team Leadership Income', desc:'Quarterly bonuses from R3,000 to R3.5M' },
  { name:'CEO', full:'CEO Awards', desc:'Top performers recognised with special rewards' },
]

function InviteInner() {
  const params      = useSearchParams()
  const ref         = params.get('ref') || 'REVMOK2B'
  const [sponsor, setSponsor] = useState('')

  useEffect(() => {
    fetch(`/api/sponsor?ref=${encodeURIComponent(ref)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setSponsor(d.name) })
      .catch(() => {})
  }, [ref])

  const landingUrl   = `/ai-income/landing?ref=${ref}`
  const choosePlanUrl = `/ai-income/choose-plan?ref=${ref}`

  const cardStyle = {
    background:'rgba(255,255,255,0.03)',
    border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:'16px',
    padding:'18px',
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(160deg,${PURP},#1E1245,${BG})`, padding:'48px 20px 40px', textAlign:'center' }}>
        <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'3px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:'12px' }}>
          Zero2Billionaires · 4M Machine
        </div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,6vw,40px)', fontWeight:900, color:W, margin:'0 0 12px', lineHeight:1.2 }}>
          If They Won't Employ You —<br/>
          <span style={{ color:GOLD }}>Deploy Yourself.</span>
        </h1>
        <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.65)', maxWidth:'480px', margin:'0 auto 24px', lineHeight:1.8 }}>
          The 4M Mobile Money Machine turns your smartphone into a full income-generating business — using AI, digital products and a community compensation plan.
        </p>

        {sponsor && (
          <div style={{ display:'inline-block', padding:'8px 20px', background:'rgba(212,175,55,0.1)', border:`1px solid ${GOLD}40`, borderRadius:'20px', fontSize:'12px', color:GOLD, marginBottom:'20px' }}>
            🤝 You were invited by <strong>{sponsor}</strong>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'10px', alignItems:'center' }}>
          <Link href={landingUrl} style={{ display:'inline-block', padding:'16px 40px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'14px', color:'#1E1245', fontWeight:900, fontSize:'16px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 8px 32px ${GOLD}40` }}>
            🚀 Start My 4M Machine →
          </Link>
          <Link href={choosePlanUrl} style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', textDecoration:'underline' }}>
            Already know your tier? Choose a plan →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:'560px', margin:'0 auto', padding:'32px 16px 60px' }}>

        {/* The 4M Framework */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>The Framework</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, margin:'0 0 16px' }}>The 4 Legs of the Billionaire Table</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {[
              { m:'🧠', t:'Mindset Mystery', d:'Reprogram your relationship with money and opportunity' },
              { m:'💰', t:'Money Moves', d:'AI tools that generate income from your existing skills' },
              { m:'🏆', t:'Legacy Mission', d:'Build a team that earns for you across 10 generations' },
              { m:'⚡', t:'Momentum Movement', d:'Daily execution system that keeps you moving forward' },
            ].map(item => (
              <div key={item.t} style={{ ...cardStyle, textAlign:'center' }}>
                <div style={{ fontSize:'24px', marginBottom:'6px' }}>{item.m}</div>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD, marginBottom:'4px' }}>{item.t}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Vehicle Powers */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>Your Vehicle</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, margin:'0 0 16px' }}>3 Power Levels — You Choose</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {VEHICLES.map(v => (
              <div key={v.name} style={{ ...cardStyle, display:'flex', gap:'14px', alignItems:'flex-start' }}>
                <div style={{ fontSize:'28px', flexShrink:0 }}>{v.icon}</div>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:W, marginBottom:'2px' }}>{v.name}</div>
                  <div style={{ fontSize:'11px', color:GOLD, marginBottom:'6px' }}>{v.tiers}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Features */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>AI Tools</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, margin:'0 0 16px' }}>7 AI Engines In Your Pocket</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {FEATURES.map(f => (
              <div key={f.name} style={{ ...cardStyle, display:'flex', gap:'12px', alignItems:'flex-start' }}>
                <div style={{ fontSize:'20px', flexShrink:0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'2px' }}>{f.name}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Streams */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>Compensation</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, margin:'0 0 16px' }}>5 Income Streams</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {INCOME_STREAMS.map(s => (
              <div key={s.name} style={{ ...cardStyle, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:GOLD }}>{s.name} <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px', fontWeight:400 }}>· {s.full}</span></div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginTop:'2px' }}>{s.desc}</div>
                </div>
                <div style={{ fontSize:'18px', marginLeft:'12px', flexShrink:0 }}>💰</div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div style={{ background:`rgba(212,175,55,0.06)`, border:`1px solid ${GOLD}30`, borderRadius:'16px', padding:'20px', marginBottom:'32px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:GOLD, marginBottom:'12px' }}>💬 What Builders Say</div>
          {[
            { quote:'"I made R600 in my first week just using the Offer Generator and sending WhatsApp messages."', name:'Builder Thabo · Bronze' },
            { quote:'"Coach Manlaw told me exactly what to do. Not motivation — actual steps. That changed everything."', name:'Builder Nomsa · Silver' },
            { quote:'"The Digital Twin handles my enquiries at night. I wake up to new sales."', name:'Builder Sipho · Gold' },
          ].map(t => (
            <div key={t.name} style={{ marginBottom:'12px', paddingBottom:'12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', fontStyle:'italic', lineHeight:1.7, marginBottom:'4px' }}>{t.quote}</div>
              <div style={{ fontSize:'11px', color:GOLD }}>{t.name}</div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div style={{ textAlign:'center', background:`linear-gradient(135deg,rgba(76,29,149,0.3),rgba(212,175,55,0.1))`, border:`2px solid ${GOLD}40`, borderRadius:'20px', padding:'32px 20px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'8px' }}>
            Ready to Deploy Yourself?
          </div>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'20px', lineHeight:1.7 }}>
            Start free today. Upgrade when you're ready.<br/>
            Your first income step is just 72 hours away.
          </p>
          <Link href={landingUrl}
            style={{ display:'inline-block', padding:'16px 40px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'14px', color:'#1E1245', fontWeight:900, fontSize:'15px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 8px 32px ${GOLD}40`, marginBottom:'12px' }}>
            🚀 Start My 4M Machine →
          </Link>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'8px' }}>
            Free to start · No credit card required · Cancel anytime
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <InviteInner />
    </Suspense>
  )
}
