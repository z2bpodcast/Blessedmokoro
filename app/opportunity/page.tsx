'use client'
// FILE: app/opportunity/page.tsx
// Z2B Table Banquet — Opportunity Presentation
// Aligned to 4M Income Machine · 3 Vehicle Powers · BFM model

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function OpportunityPage() {
  const [refCode,       setRefCode]       = useState('Z2BREF')
  const [activeIncome,  setActiveIncome]  = useState<number|null>(null)
  const [activeSection, setActiveSection] = useState<string>('problem')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) { setRefCode(ref); return }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('referral_code').eq('id', user.id).single()
        .then(({ data }) => { if (data?.referral_code) setRefCode(data.referral_code) })
    })
  }, [])

  const inviteUrl = `https://app.z2blegacybuilders.co.za/ai-income/choose-plan?ref=${refCode}`
  const pricingUrl = `https://app.z2blegacybuilders.co.za/pricing`

  const PURP = '#4C1D95'
  const GOLD = '#D4AF37'
  const DARK = '#1E1245'
  const BG   = '#F3F0FF'
  const W    = '#ffffff'

  const INCOME_STREAMS = [
    { icon:'💰', code:'ISP', name:'Individual Sales Profit', color:'#059669',
      desc:'Earn 10%–30% on every sale you generate. Your rate grows with your tier.',
      detail:'Starter Pack: R200 flat on first sale then 10% of BFM · Bronze 18% · Copper 22% · Silver 25% · Gold 28% · Platinum 30%' },
    { icon:'⚡', code:'QPB', name:'Quick Pathfinder Bonus', color:'#D97706',
      desc:'Extra bonus for consistent daily outreach. Torch Bearer status = no time limit.',
      detail:'7.5% per set of 4 qualified sales · 5+ sales = 10% · Torch Bearer: 7.5%–10% on every sale forever' },
    { icon:'🌳', code:'TSC', name:'Table Structure Commission', color:'#1D4ED8',
      desc:'Earn on your entire team. Unlimited width. Up to 10 generations deep.',
      detail:'Gen 2: 10% · Gen 3: 5% · Gen 4: 3% · Gen 5: 2% · Gen 6–10: 1% · Bronze unlocks Gen 2–3 · Platinum unlocks all 10' },
    { icon:'🏆', code:'TPB', name:'Team Performance Bonus', color:'#7C3AED',
      desc:'Bonus when your team hits collective targets. Stacks on TSC.',
      detail:'Bronze and above qualify · Amounts set quarterly by CEO · Rewards consistent team activity' },
    { icon:'💎', code:'TLI', name:'Team Leadership Incentives', color:GOLD,
      desc:'10 levels of leadership rewards up to R5M for top builders.',
      detail:'Silver and above qualify · Rank progression bonuses · Built for builders who develop strong teams' },
    { icon:'🎯', code:'CEO Awards', name:'CEO Competitions & Awards', color:'#DC2626',
      desc:'Quarterly performance contests and personal recognition from the CEO.',
      detail:'Open to all active builders · Cash, products, recognition · Gold and Platinum priority' },
  ]

  const TIERS = [
    { key:'starter',  name:'Starter Pack', price:500,   bfm:850,   isp:10, icon:'🚀', color:'#6B7280', machine:'🚗 Manual', sessions:'3 features free, upgrade to unlock all 7' },
    { key:'bronze',   name:'Bronze',       price:2500,  bfm:1050,  isp:18, icon:'🥉', color:'#CD7F32', machine:'🚗 Manual', sessions:'All 99 sessions + 1 PWA App built' },
    { key:'copper',   name:'Copper',       price:5000,  bfm:1300,  isp:22, icon:'🔶', color:'#B87333', machine:'🚗 Manual', sessions:'All 99 sessions + 2 PWA Apps built' },
    { key:'silver',   name:'Silver',       price:12000, bfm:2000,  isp:25, icon:'⚙️', color:'#C0C0C0', machine:'⚙️ Automatic', sessions:'All 99 sessions + Automation begins + 2 Apps' },
    { key:'gold',     name:'Gold',         price:24000, bfm:3200,  isp:28, icon:'⭐', color:'#D4AF37', machine:'⚡ Electric', sessions:'All 99 sessions + Full automation + 5 Apps' },
    { key:'platinum', name:'Platinum',     price:50000, bfm:5800,  isp:30, icon:'💎', color:'#E5E4E2', machine:'⚡ Electric', sessions:'All 99 sessions + Full automation + 7 Apps + Distribution License' },
  ]

  const s = {
    section: { padding:'56px 24px', maxWidth:'900px', margin:'0 auto' } as React.CSSProperties,
    h2: { fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,4vw,32px)', fontWeight:900, color:DARK, marginBottom:'10px' } as React.CSSProperties,
    lead: { fontSize:'15px', color:'#475569', lineHeight:1.8, marginBottom:'20px' } as React.CSSProperties,
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:'Georgia,serif', color:DARK }}>

      {/* Header */}
      <header style={{ background:`linear-gradient(135deg,${DARK},${PURP})`, borderBottom:`4px solid ${GOLD}`, padding:'16px 24px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:GOLD }}>Z2B TABLE BANQUET</div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer"
              style={{ padding:'8px 16px', background:GOLD, borderRadius:'8px', color:DARK, fontSize:'12px', fontWeight:700, textDecoration:'none' }}>
              🚀 Share My 4M Link
            </a>
            <button onClick={() => navigator.clipboard.writeText(inviteUrl)}
              style={{ padding:'8px 14px', background:'rgba(255,255,255,0.1)', border:`1px solid ${GOLD}50`, borderRadius:'8px', color:GOLD, fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
              📋 Copy Link
            </button>
          </div>
        </div>
      </header>

      
      {/* Back to Home */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.3)' }}>
        <a href="/" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px' }}>← Home</a>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>The 4M Opportunity</span>
      </div>
{/* Hero */}
      <section style={{ background:`linear-gradient(160deg,${DARK},${PURP},#5B21B6)`, padding:'72px 24px', textAlign:'center', borderBottom:`4px solid ${GOLD}` }}>
        <div style={{ maxWidth:'700px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:`${GOLD}90`, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'16px' }}>Z2B INCOME OPPORTUNITY</div>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(30px,5vw,50px)', fontWeight:900, color:W, margin:'0 0 14px', lineHeight:1.1 }}>
            Your Smartphone.<br/>
            <span style={{ color:GOLD }}>Your Business.<br/>Your Income.</span>
          </h1>
          <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.8)', maxWidth:'540px', margin:'0 auto 24px', lineHeight:1.8 }}>
            The Z2B 4M Income Machine is a structured, AI-powered system that helps you earn your first R100 today — and scale to multiple income streams without quitting your job.
          </p>
          <div style={{ display:'inline-block', background:'rgba(255,255,255,0.1)', border:`1px solid ${GOLD}40`, borderRadius:'14px', padding:'14px 24px', marginBottom:'28px', maxWidth:'480px' }}>
            <p style={{ fontSize:'15px', fontStyle:'italic', color:W, margin:'0 0 6px' }}>
              "If they underpay you or fail to employ you, deploy yourself."
            </p>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', margin:0, fontWeight:700 }}>— Rev Mokoro Manana, Founder Z2B</p>
          </div>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer"
              style={{ padding:'16px 36px', background:GOLD, border:'none', borderRadius:'14px', color:DARK, fontWeight:700, fontSize:'16px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 8px 32px ${GOLD}40` }}>
              🚀 Join the 4M Machine
            </a>
            <Link href="/compensation" style={{ padding:'16px 28px', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.25)', borderRadius:'14px', color:W, fontWeight:700, fontSize:'15px', textDecoration:'none' }}>
              💰 See Full Compensation Plan
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section style={{ ...s.section, paddingTop:'64px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'11px', fontWeight:700, color:PURP, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>THE PROBLEM</div>
            <h2 style={s.h2}>Why Most People Stay Stuck</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {['They wait for better-paying jobs that never come','They resign too early and run out of money','They learn for months but never earn anything','They have motivation — but no system','They do not know what to sell or who to sell to'].map(item => (
                <div key={item} style={{ display:'flex', gap:'10px', padding:'12px 14px', background:W, borderRadius:'12px', border:'1px solid rgba(76,29,149,0.1)', alignItems:'flex-start' }}>
                  <span style={{ color:'#DC2626', fontSize:'14px', flexShrink:0, marginTop:'1px' }}>✗</span>
                  <span style={{ fontSize:'14px', color:'#374151', lineHeight:1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:`linear-gradient(135deg,${PURP},${PURP}CC)`, borderRadius:'20px', padding:'32px 28px', color:W }}>
            <div style={{ fontSize:'13px', fontWeight:700, color:GOLD, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px' }}>THE TRUTH</div>
            <p style={{ fontSize:'19px', fontWeight:700, lineHeight:1.5, margin:'0 0 14px' }}>
              Information alone does NOT create income.
            </p>
            <p style={{ fontSize:'24px', fontWeight:900, color:GOLD, lineHeight:1.3, margin:'0 0 20px' }}>
              Information + Execution does.
            </p>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)', lineHeight:1.7, margin:0 }}>
              Z2B 4M activates income FIRST — so you have real motivation to keep learning and keep growing.
            </p>
          </div>
        </div>
      </section>

      {/* The 4M Solution */}
      <section style={{ background:`linear-gradient(135deg,${PURP},#7C3AED)`, padding:'64px 24px' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' as const }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:`${GOLD}90`, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'14px' }}>THE SOLUTION</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,4vw,36px)', fontWeight:900, color:W, margin:'0 0 12px' }}>The Z2B 4M Income Machine</h2>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.7)', margin:'0 auto 36px', maxWidth:'560px', lineHeight:1.8 }}>Mobile · Money · Making · Machine</p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' }}>
            {[
              { icon:'🚗', power:'Manual Power', tiers:'Starter · Bronze · Copper', color:'rgba(255,255,255,0.15)', border:'rgba(255,255,255,0.2)',
                items:['AI creates your offers','AI writes your posts','AI handles objections','AI scripts to close sales','Earn your first R100 today'] },
              { icon:'⚙️', power:'Automatic Power', tiers:'Silver ⭐ CORE', color:'rgba(8,145,178,0.2)', border:'#0891B2',
                items:['1 product becomes 5 automatically','1-click launch to all platforms','Follow-ups send themselves','Schedule content while you sleep','From struggle to FLOW'] },
              { icon:'⚡', power:'Electric Power', tiers:'Gold · Platinum', color:'rgba(212,175,55,0.15)', border:GOLD,
                items:['AI avatar talks to leads 24/7','Full daily automation running','Multiple income streams active','5–7 PWA apps built for you','Self-sustaining income machine'] },
            ].map(({ icon, power, tiers, color, border, items }) => (
              <div key={power} style={{ background:color, border:`2px solid ${border}`, borderRadius:'18px', padding:'24px 18px', textAlign:'center' as const }}>
                <div style={{ fontSize:'32px', marginBottom:'10px' }}>{icon}</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'4px' }}>{power}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginBottom:'14px', fontWeight:700 }}>{tiers}</div>
                {items.map(item => (
                  <div key={item} style={{ display:'flex', gap:'8px', marginBottom:'7px', textAlign:'left' as const }}>
                    <span style={{ color:GOLD, fontSize:'12px', flexShrink:0, marginTop:'2px' }}>✦</span>
                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.8)', lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'14px', padding:'20px', display:'inline-block' }}>
            <p style={{ fontSize:'18px', fontWeight:700, color:GOLD, fontStyle:'italic', margin:0 }}>
              "Start manual. Upgrade to automatic. Scale to electric."
            </p>
          </div>
        </div>
      </section>

      {/* Income Streams */}
      <section style={s.section}>
        <div style={{ fontSize:'11px', fontWeight:700, color:PURP, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>YOUR EARNING POTENTIAL</div>
        <h2 style={s.h2}>6 Income Streams — All Active</h2>
        <p style={s.lead}>Every builder accesses multiple income streams simultaneously. Your earnings compound as your team grows.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px', marginBottom:'24px' }}>
          {INCOME_STREAMS.map((stream, i) => (
            <div key={stream.code} onClick={() => setActiveIncome(activeIncome===i?null:i)}
              style={{ background:W, borderRadius:'16px', border:`2px solid ${activeIncome===i?stream.color:'#E5E7EB'}`, padding:'18px', cursor:'pointer', transition:'all 0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'6px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:stream.color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{stream.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900, color:stream.color, fontSize:'14px' }}>{stream.code}</div>
                  <div style={{ fontSize:'11px', color:'#6B7280' }}>{stream.name}</div>
                </div>
                <span style={{ color:'#9CA3AF', fontSize:'16px' }}>{activeIncome===i?'−':'+'}</span>
              </div>
              <p style={{ fontSize:'13px', color:'#374151', margin:0, lineHeight:1.6 }}>{stream.desc}</p>
              {activeIncome===i && <div style={{ marginTop:'10px', paddingTop:'10px', borderTop:`1px solid ${stream.color}20`, fontSize:'12px', color:'#6B7280', lineHeight:1.7 }}>{stream.detail}</div>}
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center' as const }}>
          <Link href="/compensation" style={{ display:'inline-block', padding:'13px 32px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, border:`2px solid ${GOLD}`, borderRadius:'12px', color:GOLD, fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            💰 View Full Compensation Plan →
          </Link>
        </div>
      </section>

      {/* Tier Pricing */}
      <section style={{ background:W, padding:'64px 24px', borderTop:'1px solid #F1F5F9' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'36px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:PURP, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>YOUR INVESTMENT</div>
            <h2 style={{ ...s.h2, textAlign:'center', marginBottom:'8px' }}>Choose Your Machine Power</h2>
            <p style={{ fontSize:'14px', color:'#64748B' }}>Once-off activation. Then BFM (Business Fuel Maintenance) keeps your income streams running.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
            {TIERS.map(t => (
              <div key={t.key} style={{ background:BG, borderRadius:'18px', padding:'22px 16px', border:`2px solid ${t.color}40`, textAlign:'center' as const }}>
                <div style={{ fontSize:'28px', marginBottom:'8px' }}>{t.icon}</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:t.color, marginBottom:'4px' }}>{t.name}</div>
                <div style={{ fontSize:'11px', color:'#64748B', marginBottom:'8px' }}>{t.machine}</div>
                <div style={{ fontSize:'24px', fontWeight:900, color:DARK, marginBottom:'2px' }}>R{t.price.toLocaleString()}</div>
                <div style={{ fontSize:'10px', color:'#9CA3AF', marginBottom:'6px' }}>Once-off · 60-day access</div>
                <div style={{ fontSize:'11px', fontWeight:700, color:t.color, marginBottom:'10px' }}>R{t.bfm.toLocaleString()}/month BFM</div>
                <div style={{ fontSize:'11px', color:'#64748B', marginBottom:'12px', lineHeight:1.6 }}>{t.sessions}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#374151' }}>ISP Rate: <span style={{ color:t.color }}>{t.isp}%</span></div>
              </div>
            ))}
          </div>
          <div style={{ padding:'16px 20px', background:'rgba(76,29,149,0.06)', border:`1px solid ${PURP}20`, borderRadius:'12px', fontSize:'13px', color:'#374151', lineHeight:1.7, marginBottom:'24px' }}>
            ⛽ <strong>BFM Formula:</strong> R800 base + 10% of tier price. Example — Starter Pack: R800 + R50 = <strong>R850/month</strong>. Bronze: R800 + R250 = <strong>R1,050/month</strong>. BFM keeps your AI tools, income streams and platform access active.
          </div>
          <div style={{ textAlign:'center' as const }}>
            <Link href={pricingUrl} style={{ display:'inline-block', padding:'14px 36px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, border:`2px solid ${GOLD}`, borderRadius:'14px', color:GOLD, fontWeight:700, fontSize:'15px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
              🚀 Choose My Machine Power →
            </Link>
          </div>
        </div>
      </section>

      {/* How to join */}
      <section style={s.section}>
        <div style={{ fontSize:'11px', fontWeight:700, color:PURP, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>HOW IT WORKS</div>
        <h2 style={s.h2}>4 Steps to Your First Income</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px', marginBottom:'28px' }}>
          {[
            { n:'01', icon:'📱', title:'Join the Z2B Community', desc:'Name · Email · WhatsApp. You get your unique referral link, dashboard access, and instant 4M Machine activation.' },
            { n:'02', icon:'🤖', title:'Use the AI Tools', desc:'Your AI creates your first offer, writes your posts, finds your customers, and handles every objection for you.' },
            { n:'03', icon:'💬', title:'Send Offers — Get Sales', desc:'Contact 10 people. Post on WhatsApp Status. Use the AI reply system. Close your first sale. Repeat daily.' },
            { n:'04', icon:'💰', title:'Earn — Then Upgrade', desc:'Your ISP commission activates on your first sale. As you earn, upgrade your machine power for higher rates and automation.' },
          ].map(({ n, icon, title, desc }) => (
            <div key={n} style={{ background:W, borderRadius:'16px', padding:'22px', border:'1px solid #E2E8F0' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:900, color:W, fontFamily:'Cinzel,Georgia,serif', marginBottom:'10px' }}>{n}</div>
              <div style={{ fontSize:'22px', marginBottom:'8px' }}>{icon}</div>
              <div style={{ fontSize:'15px', fontWeight:700, color:DARK, marginBottom:'6px' }}>{title}</div>
              <div style={{ fontSize:'13px', color:'#64748B', lineHeight:1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', padding:'20px', background:DARK, borderRadius:'16px' }}>
          <p style={{ fontSize:'15px', fontWeight:700, color:W, margin:'0 0 4px' }}>You do not study business first.</p>
          <p style={{ fontSize:'18px', fontWeight:900, color:GOLD, margin:0 }}>You build income habits from Day 1.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background:`linear-gradient(135deg,${DARK},${PURP})`, padding:'64px 24px', textAlign:'center', borderTop:`4px solid ${GOLD}` }}>
        <div style={{ maxWidth:'600px', margin:'0 auto' }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(26px,5vw,40px)', fontWeight:900, color:W, margin:'0 0 12px' }}>
            Deploy Yourself Today.
          </h2>
          <p style={{ fontSize:'28px', fontWeight:900, fontStyle:'italic', color:GOLD, margin:'16px 0 28px', lineHeight:1.3 }}>
            "If they underpay you or fail to employ you, deploy yourself."
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer"
              style={{ padding:'16px 36px', background:GOLD, border:'none', borderRadius:'14px', color:DARK, fontWeight:700, fontSize:'16px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 8px 32px ${GOLD}50` }}>
              🚀 Join via My Link →
            </a>
            <Link href="/compensation" style={{ padding:'16px 28px', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.3)', borderRadius:'14px', color:W, fontWeight:700, fontSize:'15px', textDecoration:'none' }}>
              💰 Full Compensation Plan
            </Link>
          </div>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'16px' }}>
            Share your link: {inviteUrl}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#0D0820', padding:'24px', textAlign:'center', borderTop:`4px solid ${GOLD}` }}>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:GOLD, marginBottom:'4px' }}>Z2B TABLE BANQUET</div>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', margin:0 }}>© {new Date().getFullYear()} Zero2Billionaires Amavulandlela PTY Ltd</p>
      </footer>
    </div>
  )
}
