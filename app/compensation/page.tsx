'use client'
// FILE: app/compensation/page.tsx
// Z2B Compensation Plan — Public Page
// Updated: TSC name fix, TPB removed, TLI fully defined, BFM rules, cycle lock

import { useState } from 'react'
import Link from 'next/link'

// ── CYCLE ─────────────────────────────────────────────────────────────────────
function getCurrentCycle() {
  const now = new Date()
  const day = now.getDate()
  let cycleStart: Date
  if (day >= 4) {
    cycleStart = new Date(now.getFullYear(), now.getMonth(), 4)
  } else {
    cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, 4)
  }
  const cycleEnd = new Date(cycleStart)
  cycleEnd.setMonth(cycleEnd.getMonth() + 1)
  cycleEnd.setDate(3)
  const fmt = (d: Date) => d.toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })
  return { start: fmt(cycleStart), end: fmt(cycleEnd) }
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const TIERS = [
  { key:'starter',  label:'Starter Pack', price:500,   bfm:850,   isp:10,  icon:'🚀', color:'#6B7280' },
  { key:'bronze',   label:'Bronze',       price:2500,  bfm:1050,  isp:18,  icon:'🥉', color:'#CD7F32' },
  { key:'copper',   label:'Copper',       price:5000,  bfm:1300,  isp:22,  icon:'🔶', color:'#B87333' },
  { key:'silver',   label:'Silver',       price:12000, bfm:2000,  isp:25,  icon:'⚙️', color:'#C0C0C0' },
  { key:'gold',     label:'Gold',         price:24000, bfm:3200,  isp:28,  icon:'⭐', color:'#D4AF37' },
  { key:'platinum', label:'Platinum',     price:50000, bfm:5800,  isp:30,  icon:'💎', color:'#E5E4E2' },
]

const TSC_GENS = [
  { gen:'Gen 2', rate:10, starter:false, bronze:true,  copper:true,  silver:true,  gold:true,  platinum:true  },
  { gen:'Gen 3', rate:5,  starter:false, bronze:true,  copper:true,  silver:true,  gold:true,  platinum:true  },
  { gen:'Gen 4', rate:3,  starter:false, bronze:false, copper:true,  silver:true,  gold:true,  platinum:true  },
  { gen:'Gen 5', rate:2,  starter:false, bronze:false, copper:false, silver:true,  gold:true,  platinum:true  },
  { gen:'Gen 6', rate:1,  starter:false, bronze:false, copper:false, silver:true,  gold:true,  platinum:true  },
  { gen:'Gen 7', rate:1,  starter:false, bronze:false, copper:false, silver:false, gold:true,  platinum:true  },
  { gen:'Gen 8', rate:1,  starter:false, bronze:false, copper:false, silver:false, gold:true,  platinum:true  },
  { gen:'Gen 9', rate:1,  starter:false, bronze:false, copper:false, silver:false, gold:false, platinum:true  },
  { gen:'Gen 10',rate:1,  starter:false, bronze:false, copper:false, silver:false, gold:false, platinum:true  },
]

const TLI_LEVELS = [
  { level:1,  name:'Table Starter',       tagline:'You lit the first four flames',                           tier:'Silver', team:30,    leaders:4,  prev:'—',              circle:'—',   quarterly:3000,    quarter:'Q' },
  { level:2,  name:'Table Builder',       tagline:'Your table is growing. Others are learning from you',     tier:'Silver', team:80,    leaders:4,  prev:'2 at TLI 1',     circle:'—',   quarterly:8000,    quarter:'Q' },
  { level:3,  name:'Team Activator',      tagline:'You do not just build. You activate others to build',     tier:'Gold',   team:200,   leaders:4,  prev:'3 at TLI 2',     circle:'—',   quarterly:20000,   quarter:'Q' },
  { level:4,  name:'Legacy Builder',      tagline:'You are no longer building a team. You are building builders', tier:'Gold',   team:500,   leaders:4,  prev:'All 4 at TLI 3', circle:'6 of 12', quarterly:45000, quarter:'Q' },
  { level:5,  name:'Income Architect',    tagline:'Your structure generates income whether you are present or not', tier:'Gold',   team:1200,  leaders:4,  prev:'All 4 at TLI 4', circle:'8 of 12', quarterly:90000, quarter:'Q' },
  { level:6,  name:'Wealth Multiplier',   tagline:'You have built a system inside the system',               tier:'Platinum',team:3000,  leaders:4,  prev:'All 4 at TLI 5', circle:'10 of 12',quarterly:180000, quarter:'Q' },
  { level:7,  name:'Empire Maker',        tagline:'You have built an empire, not just a team',               tier:'Platinum',team:7500,  leaders:4,  prev:'All 4 at TLI 6', circle:'12 of 12',quarterly:380000, quarter:'Q' },
  { level:8,  name:'Dynasty Leader',      tagline:'Generations will benefit from what you built today',      tier:'Platinum',team:20000, leaders:4,  prev:'All 4 at TLI 7', circle:'12 of 12',quarterly:750000, quarter:'Q' },
  { level:9,  name:'Kingdom Architect',   tagline:'You have built something that outlives effort',           tier:'Platinum',team:50000, leaders:4,  prev:'All 4 at TLI 8', circle:'12 of 12',quarterly:1500000, quarter:'Q' },
  { level:10, name:'Z2B Billionaire Table',tagline:'You have taken your seat at the Billionaire Table',     tier:'Platinum',team:100000,leaders:4,  prev:'All 4 at TLI 9', circle:'12 of 12 + each with 12',quarterly:3500000, quarter:'Q' },
]

const INCOME_STREAMS = [
  {
    icon:'💰', code:'ISP', name:'Individual Sales Profit',
    color:'#059669', bg:'#D1FAE5',
    bfm:'No BFM required — ISP is earned on personal effort always',
    cadence:'Monthly — credited on payment confirmation',
    desc:'Earn on every sale you generate personally through your referral link.',
    rows:[
      { tier:'Starter Pack', rate:'R200 flat', note:'First personal sale only. Thereafter R85/month per active Starter in your team.' },
      { tier:'Bronze',       rate:'18%',       note:'Of the sale amount' },
      { tier:'Copper',       rate:'22%',       note:'Of the sale amount' },
      { tier:'Silver',       rate:'25%',       note:'Of the sale amount' },
      { tier:'Gold',         rate:'28%',       note:'Of the sale amount' },
      { tier:'Platinum',     rate:'30%',       note:'Of the sale amount' },
    ],
  },
  {
    icon:'⚡', code:'QPB', name:'Quick Pathfinder Bonus',
    color:'#D97706', bg:'#FEF3C7',
    bfm:'Active BFM required — must have paid BFM or upgraded in this cycle',
    cadence:'Monthly — calculated at cycle end by admin',
    desc:'Bonus on top of ISP for consistent daily outreach. Bronze and above only.',
    rows:[
      { tier:'Bronze and above', rate:'7.5%',  note:'First set of 4 qualified sales (first 90 days)' },
      { tier:'Bronze and above', rate:'10%',   note:'When 5+ sales in a cycle' },
      { tier:'Torch Bearer',     rate:'7.5%–10%', note:'No time limit, no minimum — earned by consistent outreach track record' },
    ],
  },
  {
    icon:'🌳', code:'TSC', name:'Team Sales Commission',
    color:'#1D4ED8', bg:'#DBEAFE',
    bfm:'Active BFM required — must have paid BFM OR upgraded in this cycle',
    cadence:'Monthly — auto-calculated when team sales are confirmed',
    desc:'Earn on your entire team\'s sales. Unlimited width. Up to 10 generations deep. Starter earns ISP only — TSC begins at Bronze.',
    rows: TSC_GENS.map(g => ({
      tier: g.gen, rate: g.rate + '%',
      note: 'Bronze: Gen 2–3 · Copper: +Gen 4 · Silver: +Gen 5–6 · Gold: +Gen 7–8 · Platinum: all 10'
    })).slice(0,4),
  },
  {
    icon:'💎', code:'TLI', name:'Team Leadership Incentives',
    color:'#D4AF37', bg:'#FFFBEB',
    bfm:'FULL QUARTERLY BFM required — all 3 months of the quarter must be paid',
    cadence:'Quarterly — evaluated and awarded by CEO at quarter end',
    desc:'Quarterly recognition and payment for leaders who develop other leaders. Silver and above only. Paid in addition to all other income streams.',
    rows:[
      { tier:'TLI Level 1', rate:'R3,000/quarter',    note:'Table Starter — 4 Silver leaders, 30 team members' },
      { tier:'TLI Level 5', rate:'R90,000/quarter',   note:'Income Architect — 4 Gold leaders at TLI 4, 1,200 members' },
      { tier:'TLI Level 10',rate:'R3,500,000/quarter',note:'Z2B Billionaire Table — full Circle of Twelve duplication' },
    ],
  },
  {
    icon:'🎯', code:'CEO Awards', name:'CEO Competitions & Awards',
    color:'#DC2626', bg:'#FEE2E2',
    bfm:'Active quarterly BFM required for eligibility',
    cadence:'Quarterly — targets and amounts set by CEO',
    desc:'Performance contests and personal recognition from Rev. Open to all active BFM builders. Cash, products, and recognition.',
    rows:[
      { tier:'All tiers', rate:'Variable', note:'Quarterly targets announced by CEO' },
      { tier:'Gold and Platinum', rate:'Priority consideration', note:'Higher tier builders receive priority in tie-breaking' },
    ],
  },
]

// ── COLOURS ──────────────────────────────────────────────────────────────────
const PURP = '#4C1D95'; const GOLD = '#D4AF37'; const DARK = '#1E1245'; const BG = '#F3F0FF'

export default function CompensationPlanPage() {
  const [activeStream, setActiveStream] = useState<string|null>(null)
  const [activeTLI,    setActiveTLI]    = useState<number|null>(null)
  const [simTier,      setSimTier]      = useState('bronze')
  const [simSales,     setSimSales]     = useState(4)
  const [simPrice,     setSimPrice]     = useState(2500)
  const cycle = getCurrentCycle()

  const tier = TIERS.find(t => t.key === simTier)!
  const simISP  = simTier === 'starter' ? 200 : simSales * simPrice * (tier.isp / 100)
  const simTSCG2 = simTier !== 'starter' ? simSales * 4 * simPrice * 0.10 : 0
  const simTotal = simISP + simTSCG2

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
            <Link href="/pricing" style={{ padding:'8px 16px', background:`rgba(212,175,55,0.2)`, border:`1px solid ${GOLD}`, borderRadius:'8px', color:GOLD, fontSize:'13px', fontWeight:700, textDecoration:'none' }}>View Pricing</Link>
            <Link href="/opportunity" style={{ padding:'8px 16px', background:`rgba(255,255,255,0.1)`, border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', color:'#fff', fontSize:'13px', fontWeight:700, textDecoration:'none' }}>Opportunity</Link>
            <Link href="/dashboard" style={{ padding:'8px 16px', background:GOLD, borderRadius:'8px', color:DARK, fontSize:'13px', fontWeight:700, textDecoration:'none' }}>Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Hero + Cycle Banner */}
      <section style={{ background:`linear-gradient(135deg,${DARK},${PURP})`, padding:'40px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto' }}>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,5vw,38px)', fontWeight:900, color:'#fff', margin:'0 0 10px' }}>Z2B Compensation Plan</h1>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.7)', marginBottom:'20px' }}>5 income streams · BFM-powered · Cycle-locked · CEO-transparent</p>
          {/* Current Cycle Banner */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'rgba(212,175,55,0.15)', border:`1.5px solid ${GOLD}50`, borderRadius:'12px', padding:'12px 20px' }}>
            <span style={{ fontSize:'18px' }}>📅</span>
            <div style={{ textAlign:'left' as const }}>
              <div style={{ fontSize:'10px', color:`${GOLD}80`, letterSpacing:'2px', textTransform:'uppercase', fontWeight:700 }}>Current Z2B Month Cycle</div>
              <div style={{ fontSize:'14px', fontWeight:700, color:GOLD }}>{cycle.start} → {cycle.end}</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'36px 20px' }}>

        {/* ── BFM RULES ── */}
        <div style={{ background:'#fff', borderRadius:'20px', padding:'28px', marginBottom:'28px', border:`2px solid ${GOLD}40` }}>
          <div style={{ display:'flex', gap:'14px', alignItems:'flex-start', marginBottom:'20px' }}>
            <span style={{ fontSize:'32px', flexShrink:0 }}>⛽</span>
            <div>
              <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:DARK, margin:'0 0 6px' }}>BFM — Business Fuel Maintenance</h2>
              <p style={{ fontSize:'14px', color:'#475569', margin:0, lineHeight:1.8 }}>
                BFM = R800 base + 10% of your tier's once-off price. Paid monthly to keep your income streams active. Without BFM, your TSC, CEO Awards eligibility and TLI pause until you refuel.
              </p>
            </div>
          </div>

          {/* BFM Rules — clear box */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px' }}>
            {[
              { icon:'✅', title:'ISP — Always Active', body:'No BFM required. You made the sale with your own effort. ISP is always yours.', color:'#059669' },
              { icon:'📅', title:'TSC — Monthly BFM', body:'Qualify for this month\'s TSC if you have paid BFM OR upgraded your tier this cycle (04th to 03rd).', color:'#1D4ED8' },
              { icon:'🏆', title:'TLI + CEO Awards — Full Quarter', body:'Must have paid BFM all 3 months of the quarter. One missed month = no TLI or CEO Awards that quarter.', color:GOLD },
            ].map(({ icon, title, body, color }) => (
              <div key={title} style={{ padding:'16px', background:`${color}08`, borderRadius:'14px', border:`1.5px solid ${color}25` }}>
                <div style={{ fontSize:'22px', marginBottom:'8px' }}>{icon}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color, marginBottom:'6px' }}>{title}</div>
                <div style={{ fontSize:'12px', color:'#475569', lineHeight:1.7 }}>{body}</div>
              </div>
            ))}
          </div>

          {/* BFM Table */}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ background:`${PURP}10` }}>
                  {['Tier','Once-Off Price','BFM Formula','Monthly BFM'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:700, color:PURP, fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIERS.map((t, i) => (
                  <tr key={t.key} style={{ borderBottom:'1px solid #F3F4F6', background:i%2===0?'#F9FAFB':'#fff' }}>
                    <td style={{ padding:'12px 14px' }}>
                      <span style={{ fontSize:'16px', marginRight:'8px' }}>{t.icon}</span>
                      <span style={{ fontWeight:700, color:t.color }}>{t.label}</span>
                    </td>
                    <td style={{ padding:'12px 14px', color:'#374151' }}>R{t.price.toLocaleString()}</td>
                    <td style={{ padding:'12px 14px', color:'#64748B', fontSize:'12px' }}>R800 + 10% of R{t.price.toLocaleString()} = R{(t.price*0.1).toLocaleString()}</td>
                    <td style={{ padding:'12px 14px', fontWeight:900, color:t.color, fontSize:'15px' }}>R{t.bfm.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:'12px', padding:'10px 14px', background:'#FFFBEB', border:`1px solid ${GOLD}50`, borderRadius:'10px', fontSize:'12px', color:'#92400E' }}>
            💡 <strong>New upgrade counts as BFM:</strong> If you upgraded your tier this cycle, that counts as your BFM payment for that cycle — for monthly streams (TSC). For quarterly streams (TLI, CEO Awards), you still need all 3 months paid.
          </div>
        </div>

        {/* ── 5 INCOME STREAMS ── */}
        <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, marginBottom:'6px' }}>5 Income Streams</h2>
        <p style={{ fontSize:'14px', color:'#64748B', marginBottom:'18px' }}>Click any stream to expand full rules.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'32px' }}>
          {INCOME_STREAMS.map(stream => (
            <div key={stream.code} style={{ background:'#fff', borderRadius:'16px', border:`2px solid ${activeStream===stream.code?stream.color:'#E5E7EB'}`, overflow:'hidden', cursor:'pointer' }}
              onClick={() => setActiveStream(activeStream===stream.code?null:stream.code)}>
              <div style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:stream.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{stream.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:stream.color }}>{stream.code}</span>
                    <span style={{ fontSize:'13px', color:'#6B7280' }}>{stream.name}</span>
                    <span style={{ fontSize:'11px', padding:'2px 10px', background:`${stream.color}15`, borderRadius:'20px', color:stream.color, fontWeight:700 }}>{stream.cadence}</span>
                  </div>
                  <p style={{ fontSize:'13px', color:'#374151', margin:'4px 0 0', lineHeight:1.6 }}>{stream.desc}</p>
                </div>
                <span style={{ fontSize:'20px', color:'#9CA3AF', flexShrink:0 }}>{activeStream===stream.code?'−':'+'}</span>
              </div>
              {activeStream === stream.code && (
                <div style={{ padding:'0 22px 22px', borderTop:`1px solid ${stream.color}20` }}>
                  {/* BFM Requirement */}
                  <div style={{ marginTop:'14px', marginBottom:'14px', padding:'10px 14px', background:`${stream.color}08`, borderRadius:'10px', border:`1px solid ${stream.color}25`, fontSize:'13px' }}>
                    <strong style={{ color:stream.color }}>⛽ BFM Requirement:</strong> <span style={{ color:'#374151' }}>{stream.bfm}</span>
                  </div>
                  {/* Rates table */}
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                    <thead>
                      <tr style={{ background:`${stream.color}10` }}>
                        <th style={{ padding:'8px 12px', textAlign:'left', color:stream.color, fontSize:'11px', fontWeight:700, textTransform:'uppercase' }}>Tier / Level</th>
                        <th style={{ padding:'8px 12px', textAlign:'left', color:stream.color, fontSize:'11px', fontWeight:700, textTransform:'uppercase' }}>Rate / Amount</th>
                        <th style={{ padding:'8px 12px', textAlign:'left', color:stream.color, fontSize:'11px', fontWeight:700, textTransform:'uppercase' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stream.rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom:'1px solid #F3F4F6', background:i%2===0?'#F9FAFB':'#fff' }}>
                          <td style={{ padding:'10px 12px', fontWeight:700, color:'#374151' }}>{row.tier}</td>
                          <td style={{ padding:'10px 12px', fontWeight:900, color:stream.color }}>{row.rate}</td>
                          <td style={{ padding:'10px 12px', color:'#6B7280', fontSize:'12px' }}>{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── TSC GENERATION TABLE ── */}
        <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, marginBottom:'6px' }}>TSC Generation Unlock Table</h2>
        <p style={{ fontSize:'14px', color:'#64748B', marginBottom:'16px' }}>Unlimited width · Up to 10 generations · BFM active = TSC flows</p>
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E5E7EB', overflow:'hidden', overflowX:'auto', marginBottom:'32px' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'600px' }}>
            <thead>
              <tr style={{ background:`linear-gradient(135deg,${DARK},${PURP})` }}>
                <th style={{ padding:'12px 16px', textAlign:'left', color:'rgba(255,255,255,0.6)', fontSize:'11px', fontWeight:700 }}>GENERATION</th>
                <th style={{ padding:'12px 8px', textAlign:'center', color:'rgba(255,255,255,0.6)', fontSize:'11px', fontWeight:700 }}>RATE</th>
                {TIERS.map(t => <th key={t.key} style={{ padding:'12px 8px', textAlign:'center', color:t.color, fontSize:'11px', fontWeight:700 }}>{t.icon} {t.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {TSC_GENS.map((row, i) => (
                <tr key={i} style={{ background:i%2===0?'#F9FAFB':'#fff', borderBottom:'1px solid #F3F4F6' }}>
                  <td style={{ padding:'11px 16px', fontWeight:700, color:DARK }}>{row.gen}</td>
                  <td style={{ padding:'11px', textAlign:'center', fontWeight:900, color:'#1D4ED8', fontSize:'15px' }}>{row.rate}%</td>
                  {TIERS.map(t => (
                    <td key={t.key} style={{ padding:'11px', textAlign:'center', fontSize:'16px' }}>
                      {(row as any)[t.key] ? <span style={{ color:'#059669', fontWeight:700 }}>✓</span> : <span style={{ color:'#E5E7EB' }}>✗</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TLI LEVELS ── */}
        <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:DARK, marginBottom:'4px' }}>Team Leadership Incentives — 10 Levels</h2>
        <p style={{ fontSize:'14px', color:'#64748B', marginBottom:'6px' }}>Silver and above · Paid quarterly · Full 3-month BFM required · Develop 12 personal leaders</p>
        <div style={{ padding:'10px 14px', background:'rgba(212,175,55,0.08)', border:`1px solid ${GOLD}30`, borderRadius:'10px', fontSize:'13px', color:'#92400E', marginBottom:'18px' }}>
          🎯 <strong>The 12-Leader Goal:</strong> Every builder should aim to personally invite and develop 12 leaders — the Circle of Twelve. TLI qualification requires a minimum of 4 same-tier leaders, but your north star is always 12.
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'32px' }}>
          {TLI_LEVELS.map(tli => (
            <div key={tli.level} style={{ background:'#fff', borderRadius:'16px', border:`2px solid ${activeTLI===tli.level?GOLD:'#E5E7EB'}`, overflow:'hidden', cursor:'pointer' }}
              onClick={() => setActiveTLI(activeTLI===tli.level?null:tli.level)}>
              <div style={{ padding:'16px 22px', display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`linear-gradient(135deg,${PURP},#7C3AED)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:GOLD, flexShrink:0 }}>L{tli.level}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'2px' }}>
                    <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:DARK }}>{tli.name}</span>
                    <span style={{ fontSize:'11px', padding:'2px 10px', background:`${GOLD}15`, border:`1px solid ${GOLD}40`, borderRadius:'20px', color:GOLD, fontWeight:700 }}>Requires {tli.tier}+</span>
                    <span style={{ fontSize:'11px', padding:'2px 10px', background:'rgba(76,29,149,0.08)', borderRadius:'20px', color:PURP, fontWeight:700 }}>Team: {tli.team.toLocaleString()}+</span>
                  </div>
                  <div style={{ fontSize:'12px', color:'#6B7280', fontStyle:'italic' }}>{tli.tagline}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:GOLD }}>R{tli.quarterly.toLocaleString()}</div>
                  <div style={{ fontSize:'10px', color:'#9CA3AF' }}>per quarter</div>
                </div>
                <span style={{ fontSize:'18px', color:'#9CA3AF', marginLeft:'8px' }}>{activeTLI===tli.level?'−':'+'}</span>
              </div>
              {activeTLI === tli.level && (
                <div style={{ padding:'0 22px 22px', borderTop:`1px solid ${GOLD}20` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px', marginTop:'14px' }}>
                    {[
                      { label:'Minimum Tier', value:tli.tier + ' or above' },
                      { label:'Active Paid Team', value:tli.team.toLocaleString() + '+ members' },
                      { label:'Personal Leaders Required', value:tli.leaders + ' same-tier leaders' },
                      { label:'Previous TLI Proof', value:tli.prev },
                      { label:'Circle of Twelve', value:tli.circle || '—' },
                      { label:'Quarterly Payment', value:'R' + tli.quarterly.toLocaleString() },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding:'12px', background:BG, borderRadius:'10px' }}>
                        <div style={{ fontSize:'10px', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700, marginBottom:'4px' }}>{label}</div>
                        <div style={{ fontSize:'14px', fontWeight:700, color:DARK }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:'12px', padding:'12px 14px', background:'rgba(212,175,55,0.08)', border:`1px solid ${GOLD}30`, borderRadius:'10px', fontSize:'12px', color:'#92400E' }}>
                    ⛽ <strong>BFM Requirement:</strong> All 3 months of the quarter must have confirmed BFM payments. One missed month disqualifies TLI for that quarter regardless of team performance.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── INCOME SIMULATOR ── */}
        <div style={{ background:`linear-gradient(135deg,${DARK},${PURP})`, borderRadius:'20px', padding:'28px', marginBottom:'32px', border:`2px solid ${GOLD}40` }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:'#fff', marginBottom:'16px' }}>💡 Income Simulator</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
            {[
              { label:'Your Tier', type:'select', opts:TIERS.map(t=>({v:t.key,l:t.icon+' '+t.label})), val:simTier, set:(v:string)=>setSimTier(v) },
              { label:'Direct Sales This Month', type:'number', val:simSales.toString(), set:(v:string)=>setSimSales(Number(v)) },
              { label:'Average Sale Price (R)', type:'select', opts:TIERS.filter(t=>t.price>0).map(t=>({v:t.price.toString(),l:'R'+t.price.toLocaleString()+' ('+t.label+')'})), val:simPrice.toString(), set:(v:string)=>setSimPrice(Number(v)) },
            ].map(field => (
              <div key={field.label}>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>{field.label}</label>
                {field.type === 'select' ? (
                  <select value={field.val} onChange={e=>field.set(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none' }}>
                    {field.opts?.map(o => <option key={o.v} value={o.v} style={{ background:'#1E1245' }}>{o.l}</option>)}
                  </select>
                ) : (
                  <input type="number" value={field.val} onChange={e=>field.set(e.target.value)} min={1}
                    style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' as const }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
            {[
              { label:`ISP (${simTier==='starter'?'R200 flat':tier.isp+'%'})`, value:`R${simISP.toLocaleString('en-ZA',{maximumFractionDigits:0})}`, color:'#6EE7B7' },
              { label:'TSC Gen 2 (team of '+(simSales*4)+')', value: simTier==='starter'?'Not eligible':`R${simTSCG2.toLocaleString('en-ZA',{maximumFractionDigits:0})}`, color:'#93C5FD' },
              { label:'Monthly Total', value:`R${simTotal.toLocaleString('en-ZA',{maximumFractionDigits:0})}`, color:GOLD },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.08)', borderRadius:'14px', padding:'18px', textAlign:'center' as const }}>
                <div style={{ fontSize:'22px', fontWeight:900, color, marginBottom:'4px' }}>{value}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', lineHeight:1.4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'10px', fontSize:'11px', color:'rgba(255,255,255,0.3)', textAlign:'center' as const }}>
            Estimates only. Assumes BFM active. Actual earnings depend on confirmed payments and activity.
          </div>
        </div>

        {/* ── NOTES ── */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E5E7EB', padding:'24px', marginBottom:'28px' }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:DARK, marginBottom:'14px' }}>📋 Important Rules</h2>
          {[
            'Z2B month cycle runs from the 4th of each month to the 3rd of the following month.',
            'ISP is the only income stream with no BFM requirement — personal effort always earns.',
            'TSC qualifies for the month if you have paid BFM OR upgraded your tier in that cycle.',
            'TLI and CEO Awards require full quarterly BFM — all 3 months paid — no exceptions.',
            'Starter Pack earns ISP only. TSC begins at Bronze and above.',
            'QPB Torch Bearer status is earned by consistent daily outreach — tracked in-app.',
            'TPB (Team Performance Bonus) has been removed from the compensation plan.',
            'All income streams operate on confirmed and cleared payments only.',
            'Builder Rules and full Terms & Conditions apply. View via your Dashboard.',
          ].map((note, i) => (
            <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'10px', alignItems:'flex-start' }}>
              <span style={{ color:PURP, fontSize:'12px', flexShrink:0, marginTop:'3px' }}>•</span>
              <span style={{ fontSize:'13px', color:'#374151', lineHeight:1.7 }}>{note}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background:`linear-gradient(135deg,${PURP},#7C3AED)`, borderRadius:'20px', padding:'32px', textAlign:'center' as const }}>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:'#fff', margin:'0 0 8px' }}>Ready to Activate Your Income?</h2>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)', margin:'0 0 20px' }}>Choose your tier. Pay once. Earn across 5 income streams.</p>
          <Link href="/pricing" style={{ display:'inline-block', padding:'14px 36px', background:GOLD, borderRadius:'12px', color:DARK, fontWeight:700, fontSize:'15px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            🚀 Choose My Tier & Start Earning →
          </Link>
        </div>
      </div>

      <footer style={{ background:DARK, padding:'24px', textAlign:'center', borderTop:`4px solid ${GOLD}` }}>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:GOLD, marginBottom:'4px' }}>Z2B TABLE BANQUET</div>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', margin:0 }}>© {new Date().getFullYear()} Zero2Billionaires Amavulandlela PTY Ltd</p>
      </footer>
    </div>
  )
}
