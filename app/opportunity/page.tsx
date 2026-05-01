'use client' // diagram-211326
// FILE: app/opportunity/page.tsx — Z2B Opportunity — AI Era Redesign

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Z2BLogo } from '@/components/Z2BLogo'
import Z2BPlatformDiagram from '@/components/Z2BPlatformDiagram'

const BG    = '#050A18'
const SURF  = '#0D1629'
const SURF2 = '#111D35'
const GOLD  = '#F59E0B'
const GOLD2 = '#FCD34D'
const BLUE  = '#3B82F6'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const VIO2  = '#A78BFA'
const W     = '#F0F9FF'
const MUTED = '#94A3B8'
const GREEN = '#10B981'
const BORDER= '#1E3A5F'
const PINK  = '#EC4899'

function GridBG({ color = CYAN, opacity = 0.04 }: { color?: string; opacity?: number }) {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', opacity }} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
      {Array.from({length:20}).map((_,i) => <line key={`v${i}`} x1={i*42} y1="0" x2={i*42} y2="500" stroke={color} strokeWidth="0.6"/>)}
      {Array.from({length:13}).map((_,j) => <line key={`h${j}`} x1="0" y1={j*42} x2="800" y2={j*42} stroke={color} strokeWidth="0.6"/>)}
    </svg>
  )
}

export default function OpportunityPage() {
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const VEHICLES = [
    { icon:'🚗', mode:'Manual',    color:VIO,   tier:'Free → Copper',
      headline:'Start with what you have.',
      body:'Your phone. Your contacts. Your story. No investment. No quitting. Just your first R500 in 14 days using WhatsApp and the 4M tools.',
      tools:['Offer Generator','Customer Finder','Post Creator','Closing Scripts','Team Builder Script','ISP Calculator','Self-Discovery','Advanced Targeting'] },
    { icon:'⚙️', mode:'Automatic', color:BLUE,  tier:'Silver',
      headline:'Let the system work with you.',
      body:'7 AI tools automate your content, follow-ups and income tracking. You build momentum while the system keeps selling.',
      tools:['7-Product Engine','Auto Follow-Up System','Content Machine','Digital Twin','Income Stream Mapper','7-Day Launch System','Objection Destroyer'] },
    { icon:'⚡', mode:'Electric',  color:GOLD,  tier:'Gold → Platinum',
      headline:'Create once. Sell forever.',
      body:'AI builds complete digital products in 90 seconds. List them on the Z2B Marketplace. Sell to anyone, anywhere. You keep 90%.',
      tools:['20 Product Types','eBook to Masterclass','AI Software Builder','Z2B Marketplace Listing','Influencer Partnership','Global Distribution'] },
    { icon:'🚀', mode:'Rocket',    color:CYAN,  tier:'Rocket Tiers',
      headline:'Your income needs no permission.',
      body:'Unlimited product creation. AI creates in bulk. Marketplace distributes globally. Influencer partnerships multiply your reach without a marketing budget.',
      tools:['Unlimited Products','Bulk Creation','Own Marketplace','AI Website Builder','Sell Anywhere','CEO Competition'] },
  ]

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes glow{0%,100%{opacity:0.7}50%{opacity:1}}*{box-sizing:border-box}a{text-decoration:none}`}</style>

      {/* Nav */}
      <nav style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'10px', borderBottom:`1px solid ${BORDER}`, background:`${BG}EE`, backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <Link href="/" style={{ fontSize:'13px', color:MUTED }}>← Home</Link>
        <span style={{ color:BORDER }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          The Z2B Opportunity
        </span>
        <div style={{ marginLeft:'auto' }}>
          <Link href={user ? '/ai-income/choose-plan' : '/signup'} style={{ padding:'8px 20px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'10px', color:'#050A18', fontSize:'12px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif' }}>
            {user ? 'Upgrade Now →' : 'Deploy Yourself →'}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position:'relative', overflow:'hidden', padding:'80px 20px 60px', textAlign:'center' }}>
        <GridBG />
        <div style={{ position:'absolute', top:0, left:'20%', width:'400px', height:'400px', background:`radial-gradient(circle,${GOLD + '10'} 0%,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'700px', margin:'0 auto' }}>
          <div style={{ marginBottom:'24px', display:'flex', justifyContent:'center' }}>
            <Z2BLogo size='lg' showText={true} href='/' center={true} />
          </div>
          <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'16px' }}>⚡ The Opportunity</div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(28px,5vw,52px)', fontWeight:900, lineHeight:1.2, marginBottom:'20px' }}>
            <span style={{ color:W }}>If they underpay you<br/>and do not want to employ you,</span><br/>
            <span style={{ background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'glow 3s ease-in-out infinite' }}>
              deploy yourself.
            </span>
          </div>
          <p style={{ fontSize:'16px', color:MUTED, lineHeight:1.8, marginBottom:'32px' }}>
            Z2B Legacy Builders gives every ambitious employee the AI tools, digital products platform and income community they need to build income alongside their job — and eventually beyond it.
          </p>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href={user ? '/ai-income' : '/signup'} style={{ padding:'14px 32px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', color:'#050A18', fontSize:'15px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 0 30px ${GOLD + '40'}` }}>
              🚀 Start for Free →
            </Link>
            <Link href="/marketplace" style={{ padding:'14px 24px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'14px', color:W, fontSize:'14px', fontWeight:700 }}>
              🏪 Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section style={{ padding:'60px 20px', background:SURF }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(20px,3.5vw,32px)', fontWeight:900, color:W, marginBottom:'32px' }}>
            The Employee Trap
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'14px' }}>
            {[
              { icon:'📉', label:'Underpaid',     desc:'Working harder each year for raises that barely cover inflation' },
              { icon:'⏰', label:'Time trapped',   desc:'Trading time for money — the moment you stop working, income stops' },
              { icon:'🔒', label:'Job insecure',   desc:'One retrenchment away from financial crisis' },
              { icon:'🌍', label:'Market-limited',  desc:'Your income capped by geography and one employer' },
            ].map(p => (
              <div key={p.label} style={{ background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'14px', padding:'20px' }}>
                <div style={{ fontSize:'28px', marginBottom:'8px' }}>{p.icon}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'6px' }}>{p.label}</div>
                <div style={{ fontSize:'12px', color:MUTED, lineHeight:1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'32px', padding:'20px 28px', background:`${GOLD + '10'}`, border:`1px solid ${GOLD + '30'}`, borderRadius:'16px' }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:GOLD }}>
              The Z2B answer: Deploy yourself.
            </div>
            <div style={{ fontSize:'13px', color:MUTED, marginTop:'8px', lineHeight:1.7 }}>
              You do not need their permission to build income. You need the right tools. We built them.
            </div>
          </div>
        </div>
      </section>

      {/* 4M Machine */}
      <section style={{ padding:'80px 20px', position:'relative', overflow:'hidden' }}>
        <GridBG color={VIO} />
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>⚡ Your Deployment Engine</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,4vw,40px)', fontWeight:900, color:W, marginBottom:'12px' }}>The 4M Machine</div>
            <p style={{ fontSize:'15px', color:MUTED, maxWidth:'560px', margin:'0 auto' }}>Four stages. One journey. From your first R500 to unlimited income.</p>
          </div>

          {/* Vehicle tabs */}
          <div style={{ display:'flex', gap:'6px', justifyContent:'center', marginBottom:'32px', flexWrap:'wrap' }}>
            {VEHICLES.map((v, i) => (
              <button key={v.mode} onClick={() => setStep(i)}
                style={{ padding:'9px 20px', borderRadius:'30px', cursor:'pointer', fontSize:'13px', fontWeight:700,
                  background: step===i ? v.color : 'transparent',
                  border: `1px solid ${step===i ? v.color : BORDER}`,
                  color: step===i ? (v.mode==='Electric'?'#050A18':'#fff') : MUTED,
                  transition:'all 0.2s' }}>
                {v.icon} {v.mode}
              </button>
            ))}
          </div>

          {/* Active vehicle */}
          {VEHICLES.map((v, i) => i === step && (
            <div key={v.mode} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px', alignItems:'start' }}>
              <div style={{ background:`linear-gradient(145deg,${SURF},${SURF2})`, border:`1px solid ${v.color + '40'}`, borderRadius:'20px', padding:'32px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:`radial-gradient(circle,${v.color + '20'} 0%,transparent 70%)` }} />
                <div style={{ fontSize:'11px', color:v.color, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>{v.tier}</div>
                <div style={{ fontSize:'48px', marginBottom:'12px', animation:'float 3s ease-in-out infinite' }}>{v.icon}</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'24px', fontWeight:900, color:W, marginBottom:'8px' }}>{v.mode} Mode</div>
                <div style={{ fontSize:'15px', fontWeight:700, color:v.color, marginBottom:'12px' }}>{v.headline}</div>
                <p style={{ fontSize:'13px', color:MUTED, lineHeight:1.8, marginBottom:'20px' }}>{v.body}</p>
                <Link href={user ? '/ai-income' : '/signup'} style={{ display:'inline-block', padding:'11px 24px', background:`linear-gradient(135deg,${v.color},${v.color + 'AA'})`, borderRadius:'12px', color: v.mode==='Electric'?'#050A18':'#fff', fontSize:'13px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif' }}>
                  {user ? `Open ${v.mode} Mode →` : 'Get Started Free →'}
                </Link>
              </div>
              <div>
                <div style={{ fontSize:'12px', fontWeight:700, color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>Tools Included</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {v.tools.map(t => (
                    <div key={t} style={{ display:'flex', gap:'10px', alignItems:'center', padding:'10px 14px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'10px' }}>
                      <span style={{ color:v.color, fontWeight:900, fontSize:'14px' }}>✦</span>
                      <span style={{ fontSize:'13px', color:W }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Digital Products + Marketplace */}
      <section style={{ padding:'80px 20px', background:SURF }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>🌐 Z2B Marketplace</div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,3.5vw,36px)', fontWeight:900, color:W, marginBottom:'16px' }}>
            Your knowledge is a product.<br/>
            <span style={{ background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI helps you sell it globally.</span>
          </div>
          <p style={{ fontSize:'15px', color:MUTED, lineHeight:1.8, marginBottom:'40px', maxWidth:'600px', margin:'0 auto 40px' }}>
            Coach Manlaw creates complete digital products from your skills — eBooks, courses, templates, toolkits and more. List them. Earn 90% of every sale. No upline takes a cut from your product sales.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'14px', marginBottom:'32px' }}>
            {[
              { icon:'📖', label:'20 Product Formats', desc:'eBook to Masterclass to Interactive Software', color:BLUE },
              { icon:'🌍', label:'Global Marketplace',  desc:'Sell in ZAR, USD, GBP, NGN and more', color:CYAN },
              { icon:'💰', label:'Keep 90%',            desc:'You keep 90% direct · 70% via affiliate', color:GOLD },
              { icon:'🤝', label:'Influencer Partners', desc:'Copper+ builders can partner with creators', color:PINK },
              { icon:'✦',  label:'20% Affiliate Rate',  desc:'Anyone can earn 20% promoting your product', color:VIO2 },
              { icon:'◈',  label:'No Upline Cut',       desc:'Marketplace sales never cascade to upline', color:GREEN },
            ].map(f => (
              <div key={f.label} style={{ background:`linear-gradient(145deg,${SURF2},${BG})`, border:`1px solid ${BORDER}`, borderRadius:'14px', padding:'20px', textAlign:'left' }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>{f.icon}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:f.color, marginBottom:'4px' }}>{f.label}</div>
                <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
            <Link href="/marketplace" style={{ padding:'13px 28px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'12px', color:'#050A18', fontSize:'14px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif' }}>
              🏪 Browse Marketplace
            </Link>
            <Link href={user ? '/ai-income' : '/signup'} style={{ padding:'13px 24px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'12px', color:W, fontSize:'13px', fontWeight:700 }}>
              Create My First Product →
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Diagram */}
      <section style={{ padding:'60px 20px' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'8px' }}>⚡ The Full Picture</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, color:W }}>Everything in one view</div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'20px' }}>
            <Z2BPlatformDiagram />
          </div>
        </div>
      </section>

      {/* 9 Income Streams */}
      <section style={{ padding:'80px 20px' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>💰 9 Income Streams</div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,3.5vw,36px)', fontWeight:900, color:W, marginBottom:'12px' }}>One platform. Nine ways to earn.</div>
          <p style={{ fontSize:'14px', color:MUTED, marginBottom:'40px' }}>NSB · ISP · QPB · TSC · TLI · CEO Competition · CEO Awards · Marketplace Income · Distribution Rights</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'12px', marginBottom:'32px' }}>
            {[
              { n:'NSB',        l:'New Sale Bonus',        c:GREEN,     d:'Every new member you bring in — Starter+' },
              { n:'ISP',        l:'Individual Sales Profit',c:BLUE,      d:'Monthly recurring from your team — Bronze+' },
              { n:'QPB',        l:'Quick Performance',     c:VIO2,      d:'First 90 days accelerator bonus' },
              { n:'TSC',        l:'Team Commission',       c:GOLD,      d:'6 generations deep — Bronze+' },
              { n:'TLI',        l:'Leadership Income',     c:CYAN,      d:'10 levels — up to R3.5M' },
              { n:'CEO Comp',   l:'CEO Competition',       c:'#F97316', d:'Quarterly challenge prizes' },
              { n:'CEO Awards', l:'CEO Awards',            c:VIO,       d:'Discretionary excellence awards' },
              { n:'Marketplace',l:'Marketplace Income',    c:GREEN,     d:'90% of your digital product sales — no cascade' },
              { n:'Distribution',l:'Distribution Rights',  c:GOLD,      d:'Platinum — build your own sub-network' },
            ].map(s => (
              <div key={s.n} style={{ background:`linear-gradient(145deg,${SURF2},${BG})`, border:`1px solid ${BORDER}`, borderRadius:'14px', padding:'16px 12px' }}>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:s.c, marginBottom:'4px' }}>{s.n}</div>
                <div style={{ fontSize:'11px', fontWeight:700, color:W, marginBottom:'4px' }}>{s.l}</div>
                <div style={{ fontSize:'10px', color:MUTED, lineHeight:1.5 }}>{s.d}</div>
              </div>
            ))}
          </div>
          <Link href="/compensation" style={{ display:'inline-block', padding:'12px 28px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'12px', color:MUTED, fontSize:'13px', fontWeight:700 }}>
            View Full Compensation Plan →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding:'100px 20px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at center,${GOLD + '08'} 0%,transparent 70%)`, pointerEvents:'none' }} />
        <GridBG color={GOLD} opacity={0.04} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'600px', margin:'0 auto' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(26px,4.5vw,48px)', fontWeight:900, lineHeight:1.2, marginBottom:'16px' }}>
            <span style={{ color:W }}>You do not need<br/>their permission</span><br/>
            <span style={{ background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>to build income.</span>
          </div>
          <p style={{ fontSize:'16px', color:MUTED, marginBottom:'8px' }}>You need the right tools.</p>
          <p style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', color:W, fontWeight:700, marginBottom:'36px' }}>We built them.</p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href={user ? '/ai-income' : '/signup'} style={{ padding:'16px 40px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', color:'#050A18', fontSize:'16px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 0 40px ${GOLD + '40'}` }}>
              {user ? '⚡ Open 4M Machine →' : '🚀 Deploy Yourself — Free →'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
