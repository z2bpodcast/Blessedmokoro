'use client'
// FILE: app/compensation/page.tsx
// Z2B Public Compensation Plan — full transparency

import { useState } from 'react'
import Link from 'next/link'

const TIERS = [
  { key:'starter',  label:'Starter Pack', price:500,   bfm:850,   isp:10, color:'#6B7280', icon:'🚀', machine:'🚗 Manual' },
  { key:'bronze',   label:'Bronze',       price:2500,  bfm:1050,  isp:18, color:'#CD7F32', icon:'🥉', machine:'🚗 Manual' },
  { key:'copper',   label:'Copper',       price:5000,  bfm:1300,  isp:22, color:'#B87333', icon:'🔶', machine:'🚗 Manual' },
  { key:'silver',   label:'Silver',       price:12000, bfm:2000,  isp:25, color:'#C0C0C0', icon:'⚙️', machine:'⚙️ Automatic' },
  { key:'gold',     label:'Gold',         price:24000, bfm:3200,  isp:28, color:'#D4AF37', icon:'⭐', machine:'⚡ Electric' },
  { key:'platinum', label:'Platinum',     price:50000, bfm:5800,  isp:30, color:'#E5E4E2', icon:'💎', machine:'⚡ Electric' },
]

const TSC_GENERATIONS = [
  { gen:'Gen 2', rate:10, starter:false, bronze:true,  copper:true,  silver:true, gold:true, platinum:true },
  { gen:'Gen 3', rate:5,  starter:false, bronze:true,  copper:true,  silver:true, gold:true, platinum:true },
  { gen:'Gen 4', rate:3,  starter:false, bronze:false, copper:true,  silver:true, gold:true, platinum:true },
  { gen:'Gen 5', rate:2,  starter:false, bronze:false, copper:false, silver:true, gold:true, platinum:true },
  { gen:'Gen 6', rate:1,  starter:false, bronze:false, copper:false, silver:true, gold:true, platinum:true },
  { gen:'Gen 7', rate:1,  starter:false, bronze:false, copper:false, silver:false, gold:true, platinum:true },
  { gen:'Gen 8', rate:1,  starter:false, bronze:false, copper:false, silver:false, gold:true, platinum:true },
  { gen:'Gen 9', rate:1,  starter:false, bronze:false, copper:false, silver:false, gold:false, platinum:true },
  { gen:'Gen 10',rate:1,  starter:false, bronze:false, copper:false, silver:false, gold:false, platinum:true },
]

const INCOME_STREAMS = [
  {
    icon:'💰', code:'ISP', name:'Individual Sales Profit',
    color:'#059669', bg:'#D1FAE5',
    desc:'Earn on every direct sale you generate through your referral link.',
    details:[
      'Starter Pack: R200 flat on first sale, then 10% of BFM',
      'Bronze: 18% of sale value',
      'Copper: 22% · Silver: 25% · Gold: 28% · Platinum: 30%',
      'Paid monthly on all confirmed sales',
    ],
  },
  {
    icon:'⚡', code:'QPB', name:'Quick Pathfinder Bonus',
    color:'#D97706', bg:'#FEF3C7',
    desc:'Extra bonus on top of ISP for consistent daily outreach performance.',
    details:[
      'Standard: 7.5% per set of 4 qualified sales (first 90 days)',
      '5+ sales: 10% bonus rate',
      '🏅 Torch Bearer status: 7.5%–10% on every sale — no time limit, no minimum',
      'Bronze tier and above qualify',
    ],
  },
  {
    icon:'🌳', code:'TSC', name:'Table Structure Commission',
    color:'#1D4ED8', bg:'#DBEAFE',
    desc:'Earn on your entire team\'s sales. Unlimited width. Up to 10 generations deep.',
    details:[
      'Gen 2: 10% · Gen 3: 5% · Gen 4: 3% · Gen 5: 2%',
      'Gen 6–10: 1% each',
      'Bronze unlocks Gen 2–3 · Copper adds Gen 4 · Silver adds Gen 5–6',
      'Gold adds Gen 7–8 · Platinum unlocks all 10 generations',
    ],
  },
  {
    icon:'🏆', code:'TPB', name:'Team Performance Bonus',
    color:'#7C3AED', bg:'#EDE9FE',
    desc:'Bonus triggered when your team hits collective performance milestones.',
    details:[
      'Activated when your team collectively reaches volume targets',
      'Bronze and above qualify',
      'Amounts announced quarterly by the CEO',
      'Stacks on top of TSC earnings',
    ],
  },
  {
    icon:'💎', code:'TLI', name:'Team Leadership Incentives',
    color:'#D4AF37', bg:'#FFFBEB',
    desc:'Leadership bonuses for builders who develop strong, active teams.',
    details:[
      '10 levels of leadership rewards',
      'Silver and above qualify',
      'Includes rank progression bonuses',
      'Up to R5M in TLI across 10 levels at full duplication',
    ],
  },
  {
    icon:'🎯', code:'CEO Awards', name:'CEO Competitions & Awards',
    color:'#DC2626', bg:'#FEE2E2',
    desc:'Performance contests and awards personally set by the CEO.',
    details:[
      'Targets and amounts announced each quarter',
      'Open to all active builders',
      'Includes cash, products, and recognition awards',
      'Gold and Platinum priority consideration',
    ],
  },
]

const PURP = '#4C1D95'
const GOLD = '#D4AF37'
const DARK = '#1E1245'
const BG   = '#F3F0FF'

export default function CompensationPlanPage() {
  const [activeStream, setActiveStream] = useState<string|null>(null)
  const [simTier,      setSimTier]      = useState('bronze')
  const [simSales,     setSimSales]     = useState(4)
  const [simPrice,     setSimPrice]     = useState(2500)

  const tier = TIERS.find(t => t.key === simTier)!
  const simISP = simSales * simPrice * (tier.isp / 100)
  const simTeamSales = simSales * 4
  const simTSCG2 = simTeamSales * simPrice * 0.10
  const simTotal = simISP + (tier.key !== 'starter' ? simTSCG2 : 0)

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:'Georgia,serif', color:DARK }}>

      {/* Header */}
      <header style={{ background:`linear-gradient(135deg,${DARK},${PURP})`, borderBottom:`4px solid ${GOLD}`, padding:'16px 24px' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:GOLD }}>Z2B TABLE BANQUET</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>Compensation Plan — Full Transparency</div>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <Link href="/pricing" style={{ padding:'8px 16px', background:'rgba(255,255,255,0.1)', border:`1px solid ${GOLD}50`, borderRadius:'8px', color:GOLD, fontSize:'13px', fontWeight:700, textDecoration:'none' }}>View Pricing</Link>
            <Link href="/dashboard" style={{ padding:'8px 16px', background:GOLD, borderRadius:'8px', color:DARK, fontSize:'13px', fontWeight:700, textDecoration:'none' }}>Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background:`linear-gradient(135deg,${DARK},${PURP})`, padding:'48px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:`${GOLD}90`, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>COMPLETE EARNING SYSTEM</div>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(26px,5vw,40px)', fontWeight:900, color:'#fff', margin:'0 0 12px' }}>
            Z2B Compensation Plan
          </h1>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.7)', margin:'0 0 20px', lineHeight:1.8 }}>
            6 income streams. Up to 10 generations deep. Built for builders who want to earn while they build.
          </p>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/pricing" style={{ padding:'12px 28px', background:GOLD, border:'none', borderRadius:'12px', color:DARK, fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
              🚀 View All Tiers & Prices →
            </Link>
            <Link href="/opportunity" style={{ padding:'12px 24px', background:'rgba(255,255,255,0.1)', border:`2px solid rgba(255,255,255,0.25)`, borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'14px', textDecoration:'none' }}>
              📊 Full Opportunity Presentation
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'40px 20px' }}>

        {/* ── BFM EXPLAINED ── */}
        <div style={{ background:'#fff', border:`2px solid ${GOLD}40`, borderRadius:'20px', padding:'28px', marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', flexWrap:'wrap' }}>
            <div style={{ fontSize:'36px', flexShrink:0 }}>⛽</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:DARK, marginBottom:'6px' }}>BFM — Business Fuel Maintenance</div>
              <p style={{ fontSize:'14px', color:'#475569', lineHeight:1.8, margin:'0 0 16px' }}>
                Every tier starts with a once-off activation payment. After the initial 60-day access period, BFM keeps your account active and your income streams running. BFM = R800 base + 10% of your tier's once-off price.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
                {TIERS.map(t => (
                  <div key={t.key} style={{ background:BG, borderRadius:'12px', padding:'14px', border:`1.5px solid ${t.color}30`, textAlign:'center' }}>
                    <div style={{ fontSize:'18px', marginBottom:'4px' }}>{t.icon}</div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:t.color, marginBottom:'2px' }}>{t.label}</div>
                    <div style={{ fontSize:'11px', color:'#9CA3AF', marginBottom:'4px' }}>Once-off: R{t.price.toLocaleString()}</div>
                    <div style={{ fontSize:'14px', fontWeight:900, color:DARK }}>R{t.bfm.toLocaleString()}/month</div>
                    <div style={{ fontSize:'10px', color:'#9CA3AF' }}>BFM after 60 days</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'14px', padding:'12px 16px', background:'#FFFBEB', border:`1.5px solid ${GOLD}50`, borderRadius:'10px', fontSize:'13px', color:'#92400E' }}>
                💡 <strong>Starter Pack example:</strong> R800 base + 10% of R500 = R50 → <strong>R850/month BFM</strong> after 60-day access period.
              </div>
            </div>
          </div>
        </div>

        {/* ── TIER PRICING + ISP TABLE ── */}
        <div style={{ marginBottom:'32px' }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, marginBottom:'6px' }}>Tier Pricing & ISP Rates</h2>
          <p style={{ fontSize:'14px', color:'#64748B', marginBottom:'16px' }}>Your ISP rate grows as your tier grows. Higher tiers earn more on every sale.</p>
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E5E7EB', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:`linear-gradient(135deg,${DARK},${PURP})` }}>
                  {['Tier','4M Machine Power','Once-Off Price','ISP Rate','BFM/month','First Sale Bonus'].map(h => (
                    <th key={h} style={{ padding:'12px 14px', textAlign:'left', color:'rgba(255,255,255,0.7)', fontSize:'11px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIERS.map((t, i) => (
                  <tr key={t.key} style={{ background: i%2===0?'#F9FAFB':'#fff', borderBottom:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'14px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'18px' }}>{t.icon}</span>
                        <span style={{ fontWeight:700, color:t.color }}>{t.label}</span>
                      </div>
                    </td>
                    <td style={{ padding:'14px', fontSize:'13px', color:'#374151' }}>{t.machine}</td>
                    <td style={{ padding:'14px', fontWeight:700, color:DARK }}>R{t.price.toLocaleString()}</td>
                    <td style={{ padding:'14px' }}>
                      <span style={{ fontWeight:900, fontSize:'16px', color:t.color }}>{t.isp}%</span>
                    </td>
                    <td style={{ padding:'14px', fontWeight:700, color:'#374151' }}>R{t.bfm.toLocaleString()}</td>
                    <td style={{ padding:'14px', fontSize:'12px', color:'#6B7280' }}>
                      {t.key==='starter' ? 'R200 flat, then 10% of BFM' : `${t.isp}% of sale value`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:'10px', padding:'12px 16px', background:'rgba(76,29,149,0.06)', border:`1px solid ${PURP}20`, borderRadius:'10px', fontSize:'13px', color:'#374151' }}>
            📌 <strong>Starter Pack ISP:</strong> R200 flat commission on your first sale. Thereafter, 10% of the buyer's BFM (R850/month) = R85/month recurring per active Starter Pack in your team.
          </div>
        </div>

        {/* ── 6 INCOME STREAMS ── */}
        <div style={{ marginBottom:'32px' }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, marginBottom:'6px' }}>6 Income Streams</h2>
          <p style={{ fontSize:'14px', color:'#64748B', marginBottom:'16px' }}>Click any stream to see full details.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
            {INCOME_STREAMS.map(stream => (
              <div key={stream.code}
                onClick={() => setActiveStream(activeStream===stream.code?null:stream.code)}
                style={{ background:'#fff', borderRadius:'16px', border:`2px solid ${activeStream===stream.code?stream.color:'#E5E7EB'}`, padding:'20px', cursor:'pointer', transition:'all 0.2s', boxShadow:activeStream===stream.code?`0 4px 20px ${stream.color}20`:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:stream.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{stream.icon}</div>
                  <div>
                    <div style={{ fontWeight:900, color:stream.color, fontFamily:'Cinzel,Georgia,serif', fontSize:'15px' }}>{stream.code}</div>
                    <div style={{ fontSize:'12px', color:'#6B7280' }}>{stream.name}</div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:'18px', color:'#9CA3AF' }}>{activeStream===stream.code?'−':'+'}</div>
                </div>
                <p style={{ fontSize:'13px', color:'#374151', margin:0, lineHeight:1.6 }}>{stream.desc}</p>
                {activeStream === stream.code && (
                  <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:`1px solid ${stream.color}20` }}>
                    {stream.details.map((d, i) => (
                      <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'6px' }}>
                        <span style={{ color:stream.color, fontSize:'12px', flexShrink:0, marginTop:'2px' }}>✦</span>
                        <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.6 }}>{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── TSC GENERATION TABLE ── */}
        <div style={{ marginBottom:'32px' }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, marginBottom:'6px' }}>TSC — Team Generations Unlocked</h2>
          <p style={{ fontSize:'14px', color:'#64748B', marginBottom:'16px' }}>Each tier unlocks more generations. More generations = exponentially more income.</p>
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E5E7EB', overflow:'hidden', overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'600px' }}>
              <thead>
                <tr style={{ background:`linear-gradient(135deg,${DARK},${PURP})` }}>
                  <th style={{ padding:'12px 14px', textAlign:'left', color:'rgba(255,255,255,0.7)', fontSize:'11px', width:'100px' }}>GENERATION</th>
                  <th style={{ padding:'12px', textAlign:'center', color:'rgba(255,255,255,0.7)', fontSize:'11px' }}>RATE</th>
                  {TIERS.map(t => (
                    <th key={t.key} style={{ padding:'12px 8px', textAlign:'center', color:t.color, fontSize:'11px', fontWeight:700 }}>{t.icon} {t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TSC_GENERATIONS.map((row, i) => (
                  <tr key={i} style={{ background:i%2===0?'#F9FAFB':'#fff', borderBottom:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'12px 14px', fontWeight:700, color:DARK, fontSize:'13px' }}>{row.gen}</td>
                    <td style={{ padding:'12px', textAlign:'center', fontWeight:700, color:PURP, fontSize:'14px' }}>{row.rate}%</td>
                    {TIERS.map(t => {
                      const key = t.key as keyof typeof row
                      const unlocked = row[key] as boolean
                      return (
                        <td key={t.key} style={{ padding:'12px 8px', textAlign:'center', fontSize:'14px' }}>
                          {unlocked
                            ? <span style={{ color:'#059669', fontWeight:700 }}>✓</span>
                            : <span style={{ color:'#E5E7EB' }}>✗</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── INCOME SIMULATOR ── */}
        <div style={{ background:`linear-gradient(135deg,${DARK},${PURP})`, borderRadius:'20px', padding:'28px', marginBottom:'32px', border:`2px solid ${GOLD}40` }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:'#fff', marginBottom:'16px' }}>💡 Income Simulator</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>Your Tier</label>
              <select value={simTier} onChange={e => setSimTier(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none' }}>
                {TIERS.map(t => <option key={t.key} value={t.key} style={{ background:'#1E1245' }}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>Direct Sales/Month</label>
              <input type="number" value={simSales} onChange={e => setSimSales(Number(e.target.value))} min={1} max={50}
                style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' as const }} />
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>Sale Price (R)</label>
              <select value={simPrice} onChange={e => setSimPrice(Number(e.target.value))}
                style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none' }}>
                {TIERS.filter(t => t.price > 0).map(t => <option key={t.key} value={t.price} style={{ background:'#1E1245' }}>R{t.price.toLocaleString()} ({t.label})</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
            {[
              { label:`ISP (${tier.isp}%)`, value:`R${simISP.toLocaleString('en-ZA',{maximumFractionDigits:0})}`, color:'#6EE7B7' },
              { label:'TSC Gen 2 (10%)', value: tier.key==='starter'?'Not eligible':`R${simTSCG2.toLocaleString('en-ZA',{maximumFractionDigits:0})}`, color:'#93C5FD' },
              { label:'Total Estimate', value:`R${simTotal.toLocaleString('en-ZA',{maximumFractionDigits:0})}`, color:GOLD },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.08)', borderRadius:'14px', padding:'18px', textAlign:'center' as const }}>
                <div style={{ fontSize:'24px', fontWeight:900, color, marginBottom:'4px' }}>{value}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', textTransform:'uppercase' as const, letterSpacing:'1px' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'12px', fontSize:'12px', color:'rgba(255,255,255,0.3)', textAlign:'center' as const }}>
            Estimates based on {simSales} direct sales + team of {simSales*4} builders at Gen 2. Actual earnings may vary based on performance and activity.
          </div>
        </div>

        {/* ── IMPORTANT NOTES ── */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E5E7EB', padding:'24px', marginBottom:'32px' }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:DARK, marginBottom:'16px' }}>📋 Important Notes</h2>
          {[
            'All commissions are calculated on confirmed and cleared payments only.',
            'ISP is paid monthly on all personal referral sales that have cleared payment.',
            'TSC requires that both you AND your team members maintain active BFM for commissions to flow.',
            'QPB Torch Bearer status is earned through consistent daily outreach activity — tracked in-app.',
            'Z2B is a legal direct sales and education platform operating under the Consumer Protection Act.',
            'Builder Rules and full Terms & Conditions apply to all compensation. View via your Dashboard.',
            'CEO Competitions and Awards are discretionary and announced quarterly.',
            'Starter Pack earns ISP only (no TSC). Upgrade to Bronze to unlock team earnings.',
          ].map((note, i) => (
            <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'10px', alignItems:'flex-start' }}>
              <span style={{ color:PURP, fontSize:'12px', flexShrink:0, marginTop:'2px' }}>•</span>
              <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.7 }}>{note}</span>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{ background:`linear-gradient(135deg,${PURP},#7C3AED)`, borderRadius:'20px', padding:'36px 28px', textAlign:'center' as const }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'24px', fontWeight:900, color:'#fff', margin:'0 0 10px' }}>Ready to Start Earning?</h2>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.7)', margin:'0 0 24px' }}>Choose your Machine Power level and activate your income streams today.</p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/pricing" style={{ padding:'14px 32px', background:GOLD, border:'none', borderRadius:'12px', color:DARK, fontWeight:700, fontSize:'15px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
              🚀 View All Tiers & Start →
            </Link>
            <Link href="/opportunity" style={{ padding:'14px 28px', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.3)', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'15px', textDecoration:'none' }}>
              📊 Full Opportunity
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background:DARK, padding:'24px', textAlign:'center', borderTop:`4px solid ${GOLD}` }}>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:GOLD, marginBottom:'4px' }}>Z2B TABLE BANQUET</div>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', margin:0 }}>© {new Date().getFullYear()} Zero2Billionaires Amavulandlela PTY Ltd · All rights reserved</p>
      </footer>
    </div>
  )
}
