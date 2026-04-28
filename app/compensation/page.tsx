'use client'
// FILE: app/compensation/page.tsx
// Z2B 4M Compensation Plan — 9 Income Streams Interactive Explorer

import { useState } from 'react'
import Link from 'next/link'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const PURP = '#4C1D95'
const W    = '#F0EEF8'

const ISP_RATES: Record<string,number> = {
  free:5, starter:10, bronze:18, copper:22, silver:25, gold:28, platinum:30,
  silver_rocket:25, gold_rocket:28, platinum_rocket:30,
}
// Note: Free tier earns 5% on Bronze+ sales (half rate). Starter earns 10%.`
const BFM_AMOUNTS: Record<string,number> = {
  starter:850, bronze:1050, copper:1300, silver:2000, gold:3200, platinum:5800
}
const TIER_PRICES: Record<string,number> = {
  starter:500, bronze:2500, copper:5000, silver:12000, gold:24000, platinum:50000,
  silver_rocket:17000, gold_rocket:35000, platinum_rocket:70000,
}

const NEXT_TIER: Record<string,{name:string,price:number}> = {
  starter:      { name:'Bronze',           price:2500  },
  bronze:       { name:'Copper',           price:5000  },
  copper:       { name:'Silver',           price:12000 },
  silver:       { name:'Silver Rocket',    price:17000 },
  silver_rocket:{ name:'Gold',             price:24000 },
  gold:         { name:'Gold Rocket',      price:35000 },
  gold_rocket:  { name:'Platinum',         price:50000 },
  platinum:     { name:'Platinum Rocket',  price:70000 },
  platinum_rocket:{ name:'Max Tier Reached', price:0   },
}
const TLI_LEVELS = [
  { level:1,  name:'Table Starter',        amount:3000,      req:'30 builders · 4 Silver leaders' },
  { level:2,  name:'Table Builder',        amount:8000,      req:'80 builders · 4 Silver + 2 at L1' },
  { level:3,  name:'Team Activator',       amount:20000,     req:'200 builders · 4 Gold + 3 at L2' },
  { level:4,  name:'Legacy Builder',       amount:45000,     req:'500 builders · 4 Gold at L3' },
  { level:5,  name:'Income Architect',     amount:90000,     req:'1,200 builders · 4 Gold at L4' },
  { level:6,  name:'Wealth Multiplier',    amount:180000,    req:'3,000 builders · 4 Platinum at L5' },
  { level:7,  name:'Empire Maker',         amount:380000,    req:'7,500 builders · 4 Platinum at L6' },
  { level:8,  name:'Dynasty Leader',       amount:750000,    req:'20,000 builders · 4 Platinum at L7' },
  { level:9,  name:'Kingdom Architect',    amount:1500000,   req:'50,000 builders · 4 Platinum at L8' },
  { level:10, name:'Z2B Billionaire Table',amount:3500000,   req:'100,000 builders · 4 Platinum at L9' },
]

const STREAMS = [
  { id:'nsb',  name:'NSB',              full:'New Sale Bonus',              color:'#6EE7B7', icon:'🎯' },
  { id:'isp',  name:'ISP',              full:'Individual Sales Profit',     color:'#A78BFA', icon:'💰' },
  { id:'qpb',  name:'QPB',              full:'Quick Performance Bonus',     color:'#FCD34D', icon:'⭐' },
  { id:'tsc',  name:'TSC',              full:'Team Sales Commission',       color:'#38BDF8', icon:'🔗' },
  { id:'tli',  name:'TLI',              full:'Team Leadership Income',      color:GOLD,      icon:'🏆' },
  { id:'ceoC', name:'CEO Competition', full:'CEO Competition Income',      color:'#F472B6', icon:'🏅' },
  { id:'ceoA',  name:'CEO Awards',        full:'CEO Special Achievement',          color:'#E879F9', icon:'👑' },
  { id:'mkt',   name:'Marketplace',     full:'Marketplace Income (keep 90%)',    color:'#4ADE80', icon:'🏪' },
  { id:'dist',  name:'Distribution',    full:'Distribution Rights (Platinum+)',  color:'#818CF8', icon:'🌐' },
  { id:'safe',  name:'Safe',             full:'Tier Upgrade Safe (Savings)',      color:'#FCD34D', icon:'💰' },
]

// NSB — 3-tier logic:
// FREE:    Starter sale = R100 flat only. Bronze+ sale = 5% of tier price.
// STARTER: Starter sale = R100 + 10% of R500 = R150. Bronze+ sale = 10% of tier price.
// BRONZE+: Starter sale = R100 + ISP% of R500. Bronze+ sale = ISP% of tier price.
function calcNSB(builderTier: string, saleTier: string = 'starter'): number {
  const rate  = ISP_RATES[builderTier] || 10
  const price = TIER_PRICES[saleTier]  || 500

  if (builderTier === 'free') {
    if (saleTier === 'starter') return 100            // flat only
    return Math.round(0.05 * price)                   // 5% of tier price
  }
  if (saleTier === 'starter') {
    return Math.round(100 + (rate/100 * 500))         // R100 + ISP% of R500
  }
  return Math.round(rate/100 * price)                 // ISP% of tier price
}

// ISP on Bronze+ upgrades: ISP% of tier price — personal + accessible team generations
function calcISPUpgrade(builderTier: string, saleTier: string): number {
  if (['free','starter'].includes(builderTier)) return 0
  if (saleTier === 'starter') return 0
  const rate = ISP_RATES[builderTier] || 10
  return Math.round(rate/100 * (TIER_PRICES[saleTier] || 0))
}

export default function CompensationPage() {
  const [active,   setActive]   = useState<string>('nsb')
  const [simTier,  setSimTier]  = useState('bronze')
  const [simSale,  setSimSale]  = useState('bronze')

  const card = (border = 'rgba(255,255,255,0.08)') => ({
    background:'rgba(255,255,255,0.03)', border:`1px solid ${border}`,
    borderRadius:'16px', padding:'20px', marginBottom:'8px',
  })

  const sel: React.CSSProperties = {
    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)',
    borderRadius:'8px', color:W, fontSize:'13px', padding:'8px 12px',
    fontFamily:'Georgia,serif', width:'100%',
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Home</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:GOLD }}>Compensation Plan</span>
      </div>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'28px 16px 60px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:W, margin:'0 0 6px' }}>
            9 Income Streams
          </h1>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', margin:0 }}>
            Tap any stream to explore the full details
          </p>
        </div>

        {/* Stream tabs */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'20px', justifyContent:'center' }}>
          {STREAMS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              style={{ padding:'8px 14px', borderRadius:'20px', border:`1px solid ${active===s.id ? s.color : 'rgba(255,255,255,0.1)'}`,
                background: active===s.id ? `${s.color}18` : 'transparent',
                color: active===s.id ? s.color : 'rgba(255,255,255,0.5)',
                fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        {/* ── NSB ── */}
        {active === 'nsb' && (
          <div style={card('#6EE7B730')}>
            <h2 style={{ color:'#6EE7B7', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🎯 NSB — New Sale Bonus</h2>
            {/* Free Builder Special Rules */}
            <div style={{ background:'rgba(110,231,183,0.08)', border:'1px solid rgba(110,231,183,0.25)', borderRadius:'12px', padding:'14px', marginBottom:'12px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7', marginBottom:'6px' }}>🆓 Free Builder — Special Rules</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>
                Free builders earn <strong style={{color:'#6EE7B7'}}>ONLY NSB</strong> (R100 + 10%) on their personal sales — from Starter to Platinum Rocket. No ISP, TSC, QPB, TLI, CEO or Marketplace income.
              </div>
              <div style={{ marginTop:'8px', padding:'8px 12px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'8px', fontSize:'12px', color:'#FCD34D', lineHeight:1.7 }}>
                🚀 <strong>Auto-Upgrade:</strong> When a Free builder accumulates R500 in NSB earnings, the system automatically uses that R500 to upgrade them to Starter Pack. They instantly unlock all 9 income streams.
              </div>
            </div>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              <strong style={{color:'#6EE7B7'}}>For Starter+ builders:</strong> NSB is paid to the builder who personally generated the sale. R100 flat + your ISP% of the sale tier price.
            </p>
            <div style={{ background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7', marginBottom:'10px' }}>💡 NSB Calculator</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>YOUR tier</label>
                  <select value={simTier} onChange={e => setSimTier(e.target.value)} style={sel}>
                    {Object.keys(ISP_RATES).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Builder buys</label>
                  <select value={simSale} onChange={e => setSimSale(e.target.value)} style={sel}>
                    {Object.keys(TIER_PRICES).map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ textAlign:'center', padding:'14px', background:'rgba(110,231,183,0.1)', borderRadius:'10px' }}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' }}>
                  {simTier === 'free'
                    ? simSale === 'starter'
                      ? 'R100 flat (Free tier, Starter sale)'
                      : `5% of R${(TIER_PRICES[simSale]||0).toLocaleString()} = R${calcNSB('free', simSale).toLocaleString()}`
                    : simSale === 'starter'
                      ? `R100 + ${ISP_RATES[simTier]}% of R500 = R${calcNSB(simTier,'starter').toLocaleString()}`
                      : `${ISP_RATES[simTier]}% of R${(TIER_PRICES[simSale]||0).toLocaleString()} = R${calcNSB(simTier,simSale).toLocaleString()}`
                  }
                </div>
                <div style={{ fontSize:'30px', fontWeight:900, color:'#6EE7B7' }}>R{calcNSB(simTier, simSale).toLocaleString()}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>NSB earned · once-off</div>
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
                <thead>
                  <tr>
                    <th style={{ padding:'6px 4px', textAlign:'left', color:GOLD }}>You ↓ / Sale →</th>
                    {Object.keys(TIER_PRICES).map(s => <th key={s} style={{ padding:'6px 4px', textAlign:'center', color:'rgba(255,255,255,0.5)', textTransform:'capitalize' }}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(ISP_RATES).map(builder => (
                    <tr key={builder} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'6px 4px', fontWeight:700, textTransform:'capitalize', color:'#A78BFA' }}>{builder}</td>
                      {Object.keys(TIER_PRICES).map(sale => (
                        <td key={sale} style={{ padding:'6px 4px', textAlign:'center', color:'#6EE7B7', fontWeight:700 }}>
                          R{calcNSB(builder, 'starter').toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ISP ── */}
        {active === 'isp' && (
          <div style={card('#A78BFA30')}>
            <h2 style={{ color:'#A78BFA', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>💰 ISP — Individual Sales Profit</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'8px', lineHeight:1.8 }}>
              ISP applies in TWO ways: (1) on monthly BFM payments after 60 days, and (2) on Bronze+ tier purchases/upgrades by yourself and your accessible team generations.
            </p>
            <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'10px', padding:'12px', marginBottom:'16px', fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>
              Example: You are <strong style={{color:'#A78BFA'}}>Bronze (18%)</strong>.<br/>
              • Team member upgrades to Silver (R12,000) → you earn <strong style={{color:'#A78BFA'}}>18% = R2,160 ISP</strong><br/>
              • Team member pays Bronze BFM R1,050/month → you earn <strong style={{color:'#A78BFA'}}>18% = R189/month ISP</strong>
            </div>
            {Object.entries(ISP_RATES).map(([tier, rate]) => (
              <div key={tier} style={{ background:'rgba(167,139,250,0.05)', border:'1px solid rgba(167,139,250,0.12)', borderRadius:'10px', padding:'12px 14px', marginBottom:'8px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontSize:'14px', fontWeight:700, textTransform:'capitalize', color:W }}>{tier}</span>
                  <span style={{ fontSize:'16px', fontWeight:900, color:'#A78BFA' }}>{rate}% ISP</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
                  {Object.entries(BFM_AMOUNTS).map(([t, bfm]) => (
                    <div key={t} style={{ textAlign:'center', background:'rgba(167,139,250,0.08)', borderRadius:'8px', padding:'6px' }}>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', textTransform:'capitalize' }}>{t}</div>
                      <div style={{ fontSize:'12px', fontWeight:700, color:'#A78BFA' }}>R{Math.round(rate/100*bfm)}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── QPB ── */}
        {active === 'qpb' && (
          <div style={card('#FCD34D30')}>
            <h2 style={{ color:'#FCD34D', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>⭐ QPB — Quick Performance Bonus</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              +7.5% on ALL your NSB and ISP earnings — but ONLY in your first 90 days from registration. Applies to Free and Starter registrations. Auto-expires after 90 days.
            </p>
            <div style={{ textAlign:'center', padding:'20px', background:'rgba(252,211,77,0.08)', border:'1px solid rgba(252,211,77,0.2)', borderRadius:'12px', marginBottom:'16px' }}>
              <div style={{ fontSize:'32px', fontWeight:900, color:'#FCD34D' }}>+7.5%</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>on all earnings · first 90 days only</div>
            </div>
            {[
              { s:'R2,000 NSB in week 3', b:'R150', t:'R2,150' },
              { s:'R500 ISP in month 2', b:'R37.50', t:'R537.50' },
              { s:'R4,320 NSB (Bronze→Silver)', b:'R324', t:'R4,644' },
            ].map(ex => (
              <div key={ex.s} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{ex.s}</span>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'11px', color:'#FCD34D' }}>+{ex.b} QPB</div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:W }}>{ex.t}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TSC ── */}
        {active === 'tsc' && (
          <div style={card('#38BDF830')}>
            <h2 style={{ color:'#38BDF8', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🔗 TSC — Team Sales Commission</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Earn on new tier purchases by your downline team. Same rate as your ISP. The more generations you can access, the more powerful your network income.
            </p>
            {[
              { tier:'Free/Starter', gen:'Personal sales only', color:'rgba(255,255,255,0.3)' },
              { tier:'Bronze',  gen:'G2 – G3',  color:'#38BDF8' },
              { tier:'Copper',  gen:'G2 – G4',  color:'#38BDF8' },
              { tier:'Silver',  gen:'G2 – G6',  color:'#38BDF8' },
              { tier:'Gold',    gen:'G2 – G8',  color:GOLD },
              { tier:'Platinum',gen:'G2 – G10', color:GOLD },
            ].map(row => (
              <div key={row.tier} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'rgba(56,189,248,0.04)', border:'1px solid rgba(56,189,248,0.1)', borderRadius:'10px', marginBottom:'6px' }}>
                <span style={{ fontSize:'13px', fontWeight:700, color:W }}>{row.tier}</span>
                <span style={{ fontSize:'13px', fontWeight:700, color:row.color }}>{row.gen}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── TLI ── */}
        {active === 'tli' && (
          <div style={card(`${GOLD}30`)}>
            <h2 style={{ color:GOLD, fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏆 TLI — Team Leadership Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'4px', lineHeight:1.8 }}>
              A once-off rank achievement bonus paid when you FIRST qualify for each level. Evaluated quarterly — paid ONCE per Builder per rank.
            </p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginBottom:'16px' }}>Silver+ only · Full BFM required</p>
            {TLI_LEVELS.map(t => (
              <div key={t.level} style={{ background:`${GOLD}06`, border:`1px solid ${GOLD}20`, borderRadius:'10px', padding:'10px 14px', marginBottom:'6px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                  <span style={{ fontSize:'13px', fontWeight:700, color:W }}>L{t.level} · {t.name}</span>
                  <span style={{ fontSize:'14px', fontWeight:900, color:GOLD }}>R{t.amount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{t.req}</div>
              </div>
            ))}
            <div style={{ marginTop:'12px', padding:'12px', background:`${GOLD}10`, borderRadius:'10px', textAlign:'center' }}>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>Total across all 10 ranks</div>
              <div style={{ fontSize:'22px', fontWeight:900, color:GOLD }}>R6,475,000</div>
            </div>
          </div>
        )}

        {/* ── CEO Competition ── */}
        {active === 'ceoC' && (
          <div style={card('#F472B630')}>
            <h2 style={{ color:'#F472B6', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏅 CEO Competition Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Structured competitions announced by the CEO with specific rules, targets and qualification criteria.
            </p>
            {[
              { label:'Format', value:'Team building races, sales sprints, recruitment targets' },
              { label:'Prizes', value:'Cash, trips, recognition, tier upgrades' },
              { label:'Eligibility', value:'Varies — some open to all, some tier-restricted' },
              { label:'Frequency', value:'Announced by CEO — not a permanent stream' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── CEO Awards ── */}
        {active === 'ceoA' && (
          <div style={card('#E879F930')}>
            <h2 style={{ color:'#E879F9', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>👑 CEO Awards</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Discretionary awards given by the CEO for extraordinary achievement. Unlike CEO Competition, these have no fixed rules — they are personal recognitions.
            </p>
            {[
              { label:'Who decides', value:'The CEO — no fixed formula' },
              { label:'Criteria', value:'Exceptional mentorship, community building, culture, milestones' },
              { label:'Frequency', value:'As the CEO decides — special and meaningful' },
              { label:'Format', value:'Cash, recognition, gifts, platform features' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── MARKETPLACE ── */}
        {active === 'mkt' && (
          <div style={card('#4ADE8030')}>
            <h2 style={{ color:'#4ADE80', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏪 Marketplace Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              ALL builders from Starter tier and above can list digital products on the Z2B Marketplace. Set your own retail price. Builders keep <strong style={{color:'#4ADE80'}}>90%</strong> — Z2B takes 10% marketplace service fee only.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
              {[
                { tier:'Silver (Rocket)', access:'List on Z2B Marketplace · Keep 90% of every sale', color:'#C0C0C0' },
                { tier:'Gold (Rocket)',   access:'Z2B Marketplace + sell externally · 30 products/month', color:'#D4AF37' },
                { tier:'Platinum (Rocket)', access:'Z2B Marketplace + own branded marketplace · Unlimited', color:'#E2E8F0' },
              ].map(row => (
                <div key={row.tier} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'rgba(74,222,128,0.04)', border:'1px solid rgba(74,222,128,0.12)', borderRadius:'10px' }}>
                  <span style={{ fontSize:'13px', fontWeight:700, color:row.color }}>{row.tier}</span>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', textAlign:'right' as const, maxWidth:'60%' }}>{row.access}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'12px', padding:'14px', textAlign:'center' as const }}>
              <div style={{ fontSize:'24px', fontWeight:900, color:'#4ADE80' }}>90%</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>of every sale goes to you</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'4px' }}>Z2B takes 10% marketplace service fee · No listing fee · No monthly fee</div>
            </div>
          </div>
        )}

        {/* ── DISTRIBUTION RIGHTS ── */}
        {active === 'dist' && (
          <div style={card('#818CF830')}>
            <h2 style={{ color:'#818CF8', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🌐 Distribution Rights</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Exclusive to <strong style={{color:'#818CF8'}}>Platinum</strong> and <strong style={{color:'#818CF8'}}>Platinum Rocket</strong> builders. Distribution Rights allow you to licence and distribute the Z2B 4M system — creating your own sub-network with full branding rights.
            </p>
            {[
              { label:'Who qualifies', value:'Platinum (R50,000) and Platinum Rocket (R70,000) only' },
              { label:'What you get', value:'Right to distribute Z2B membership in your own branded environment' },
              { label:'Your own marketplace', value:'Own branded product marketplace under your domain' },
              { label:'Revenue', value:'Full TSC G2–G10 on your distribution network + Marketplace income + all other streams' },
              { label:'Platinum Rocket bonus', value:'Unlimited Rocket Mode products + website builder + bulk creation for your entire network' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' as const }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── TIER UPGRADE SAFE ── */}
        {active === 'safe' && (
          <div style={card('#FCD34D30')}>
            <h2 style={{ color:'#FCD34D', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>💰 Tier Upgrade Safe</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Available to <strong style={{color:'#FCD34D'}}>Starter+ builders</strong>. Give Z2B permission to automatically save a percentage of your earnings toward your next tier upgrade. The saved money belongs to you — always.
            </p>

            {/* How it works */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
              {[
                { step:'1', text:'Choose your save percentage (20%, 30% or custom %)', color:'#FCD34D' },
                { step:'2', text:'Z2B automatically deducts your chosen % from every earning', color:'#FCD34D' },
                { step:'3', text:'Your Safe balance grows until it reaches your next tier price', color:'#FCD34D' },
                { step:'4', text:'You get notified — one tap to activate your upgrade', color:'#FCD34D' },
              ].map(s => (
                <div key={s.step} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:`${s.color}20`, border:`1px solid ${s.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900, color:s.color, flexShrink:0 }}>{s.step}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.6 }}>{s.text}</div>
                </div>
              ))}
            </div>

            {/* Example calculations */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#FCD34D', marginBottom:'8px' }}>📊 Example Savings Scenarios</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
                <thead>
                  <tr>
                    <th style={{ padding:'6px 4px', textAlign:'left', color:GOLD }}>Current → Next</th>
                    <th style={{ padding:'6px 4px', textAlign:'center', color:GOLD }}>Monthly Earn</th>
                    <th style={{ padding:'6px 4px', textAlign:'center', color:GOLD }}>Save 20%</th>
                    <th style={{ padding:'6px 4px', textAlign:'center', color:GOLD }}>Save 30%</th>
                    <th style={{ padding:'6px 4px', textAlign:'center', color:GOLD }}>Months (20%)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cur:'Starter', nxt:'Bronze', target:2500, monthly:500 },
                    { cur:'Bronze', nxt:'Copper', target:5000, monthly:1000 },
                    { cur:'Copper', nxt:'Silver', target:12000, monthly:2000 },
                    { cur:'Silver', nxt:'S.Rocket', target:17000, monthly:3000 },
                    { cur:'Gold', nxt:'G.Rocket', target:35000, monthly:5000 },
                  ].map(row => (
                    <tr key={row.cur} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'6px 4px', color:W, fontWeight:700 }}>{row.cur} → {row.nxt}</td>
                      <td style={{ padding:'6px 4px', textAlign:'center', color:'rgba(255,255,255,0.6)' }}>R{row.monthly.toLocaleString()}</td>
                      <td style={{ padding:'6px 4px', textAlign:'center', color:'#6EE7B7' }}>R{(row.monthly*0.2).toLocaleString()}/mo</td>
                      <td style={{ padding:'6px 4px', textAlign:'center', color:'#6EE7B7' }}>R{(row.monthly*0.3).toLocaleString()}/mo</td>
                      <td style={{ padding:'6px 4px', textAlign:'center', color:'#FCD34D', fontWeight:700 }}>~{Math.ceil(row.target/(row.monthly*0.2))} mo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rules */}
            <div style={{ marginTop:'14px', padding:'12px', background:'rgba(252,211,77,0.06)', border:'1px solid rgba(252,211,77,0.15)', borderRadius:'10px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#FCD34D', marginBottom:'6px' }}>📋 Safe Rules</div>
              {[
                'The saved money belongs to you — always',
                'You can opt out at any time and receive a full refund of your saved balance',
                'Opting out does NOT change your current tier — you stay where you are',
                'You can top up your Safe balance manually at any time',
                'Save % applies to all earnings: NSB, ISP, QPB, TSC, Marketplace income',
                'When target is reached, you receive a notification to approve the upgrade',
              ].map((rule, i) => (
                <div key={i} style={{ display:'flex', gap:'6px', fontSize:'12px', color:'rgba(255,255,255,0.65)', padding:'3px 0', lineHeight:1.6 }}>
                  <span style={{ color:'#FCD34D', flexShrink:0 }}>✓</span>{rule}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign:'center', marginTop:'32px', padding:'24px', background:`rgba(76,29,149,0.15)`, border:`1px solid ${GOLD}30`, borderRadius:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'8px' }}>
            Ready to Start Earning?
          </div>
          <Link href="/ai-income/landing" style={{ display:'inline-block', padding:'12px 32px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'12px', color:'#1E1245', fontWeight:900, fontSize:'14px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            🚀 Start My 4M Machine →
          </Link>
        </div>
      </div>
    </div>
  )
}<div style={{ marginTop:'16px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>
                NSB = R100 + your ISP% × R500 — same regardless of which tier was sold
              </div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'10px', lineHeight:1.7 }}>
                2 examples: Free builder sells Platinum Rocket (R70,000) → still earns R150 NSB. Gold builder sells Starter (R500) → still earns R240 NSB.
              </div>
              {/* Starter sale column */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'4px', marginBottom:'8px' }}>
                <div style={{ fontSize:'10px', color:GOLD, fontWeight:700, padding:'4px 8px' }}>Builder tier</div>
                <div style={{ fontSize:'10px', color:GOLD, fontWeight:700, padding:'4px 8px', textAlign:'center' as const }}>Starter sale</div>
                <div style={{ fontSize:'10px', color:GOLD, fontWeight:700, padding:'4px 8px', textAlign:'center' as const }}>Bronze sale</div>
              </div>
              {Object.keys(ISP_RATES).map(builder => (
                <div key={builder} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'4px', marginBottom:'3px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, textTransform:'capitalize' as const, padding:'5px 8px',
                    background: builder === 'free' ? 'rgba(110,231,183,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${builder === 'free' ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius:'6px', color: builder === 'free' ? '#6EE7B7' : '#A78BFA' }}>
                    {builder.replace(/_/g,' ')}
                  </div>
                  <div style={{ fontSize:'11px', fontWeight:700, padding:'5px 8px', textAlign:'center' as const,
                    background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', color:'#6EE7B7' }}>
                    R{calcNSB(builder,'starter').toLocaleString()}
                  </div>
                  <div style={{ fontSize:'11px', fontWeight:700, padding:'5px 8px', textAlign:'center' as const,
                    background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', color:'#A78BFA' }}>
                    R{calcNSB(builder,'bronze').toLocaleString()}
                  </div>
                </div>
              ))}
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'8px' }}>
                ⚡ Free builder: first R500 accumulated → auto-upgrade to Starter · Free builders earn NSB only
              </div>
            </div>/compensation/page.tsx
// Z2B 4M Compensation Plan — 9 Income Streams Interactive Explorer

import { useState } from 'react'
import Link from 'next/link'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const PURP = '#4C1D95'
const W    = '#F0EEF8'

const ISP_RATES: Record<string,number> = {
  free:10, starter:10, bronze:18, copper:22, silver:25, gold:28, platinum:30,
  silver_rocket:25, gold_rocket:28, platinum_rocket:30,
}
const BFM_AMOUNTS: Record<string,number> = {
  starter:850, bronze:1050, copper:1300, silver:2000, gold:3200, platinum:5800
}
const TIER_PRICES: Record<string,number> = {
  starter:500, bronze:2500, copper:5000, silver:12000, gold:24000, platinum:50000,
  silver_rocket:17000, gold_rocket:35000, platinum_rocket:70000,
}

const NEXT_TIER: Record<string,{name:string,price:number}> = {
  starter:      { name:'Bronze',           price:2500  },
  bronze:       { name:'Copper',           price:5000  },
  copper:       { name:'Silver',           price:12000 },
  silver:       { name:'Silver Rocket',    price:17000 },
  silver_rocket:{ name:'Gold',             price:24000 },
  gold:         { name:'Gold Rocket',      price:35000 },
  gold_rocket:  { name:'Platinum',         price:50000 },
  platinum:     { name:'Platinum Rocket',  price:70000 },
  platinum_rocket:{ name:'Max Tier Reached', price:0   },
}
const TLI_LEVELS = [
  { level:1,  name:'Table Starter',        amount:3000,      req:'30 builders · 4 Silver leaders' },
  { level:2,  name:'Table Builder',        amount:8000,      req:'80 builders · 4 Silver + 2 at L1' },
  { level:3,  name:'Team Activator',       amount:20000,     req:'200 builders · 4 Gold + 3 at L2' },
  { level:4,  name:'Legacy Builder',       amount:45000,     req:'500 builders · 4 Gold at L3' },
  { level:5,  name:'Income Architect',     amount:90000,     req:'1,200 builders · 4 Gold at L4' },
  { level:6,  name:'Wealth Multiplier',    amount:180000,    req:'3,000 builders · 4 Platinum at L5' },
  { level:7,  name:'Empire Maker',         amount:380000,    req:'7,500 builders · 4 Platinum at L6' },
  { level:8,  name:'Dynasty Leader',       amount:750000,    req:'20,000 builders · 4 Platinum at L7' },
  { level:9,  name:'Kingdom Architect',    amount:1500000,   req:'50,000 builders · 4 Platinum at L8' },
  { level:10, name:'Z2B Billionaire Table',amount:3500000,   req:'100,000 builders · 4 Platinum at L9' },
]

const STREAMS = [
  { id:'nsb',  name:'NSB',              full:'New Sale Bonus',              color:'#6EE7B7', icon:'🎯' },
  { id:'isp',  name:'ISP',              full:'Individual Sales Profit',     color:'#A78BFA', icon:'💰' },
  { id:'qpb',  name:'QPB',              full:'Quick Performance Bonus',     color:'#FCD34D', icon:'⭐' },
  { id:'tsc',  name:'TSC',              full:'Team Sales Commission',       color:'#38BDF8', icon:'🔗' },
  { id:'tli',  name:'TLI',              full:'Team Leadership Income',      color:GOLD,      icon:'🏆' },
  { id:'ceoC', name:'CEO Competition', full:'CEO Competition Income',      color:'#F472B6', icon:'🏅' },
  { id:'ceoA',  name:'CEO Awards',        full:'CEO Special Achievement',          color:'#E879F9', icon:'👑' },
  { id:'mkt',   name:'Marketplace',     full:'Marketplace Income (keep 90%)',    color:'#4ADE80', icon:'🏪' },
  { id:'dist',  name:'Distribution',    full:'Distribution Rights (Platinum+)',  color:'#818CF8', icon:'🌐' },
  { id:'safe',  name:'Safe',             full:'Tier Upgrade Safe (Savings)',      color:'#FCD34D', icon:'💰' },
]

// NSB: R100 + ISP% of R500 — ALWAYS calculated on R500 regardless of sale tier
// NSB applies on personal sales only. Same amount no matter what tier the buyer purchased.
function calcNSB(builderTier: string, _saleTier?: string): number {
  const rate = ISP_RATES[builderTier] || 10
  return Math.round(100 + (rate/100 * 500))
}

// ISP on Bronze+ upgrades: ISP% of tier price — personal + accessible team generations
function calcISPUpgrade(builderTier: string, saleTier: string): number {
  if (['free','starter'].includes(builderTier)) return 0
  if (saleTier === 'starter') return 0
  const rate = ISP_RATES[builderTier] || 10
  return Math.round(rate/100 * (TIER_PRICES[saleTier] || 0))
}

export default function CompensationPage() {
  const [active,   setActive]   = useState<string>('nsb')
  const [simTier,  setSimTier]  = useState('bronze')
  const [simSale,  setSimSale]  = useState('bronze')

  const card = (border = 'rgba(255,255,255,0.08)') => ({
    background:'rgba(255,255,255,0.03)', border:`1px solid ${border}`,
    borderRadius:'16px', padding:'20px', marginBottom:'8px',
  })

  const sel: React.CSSProperties = {
    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)',
    borderRadius:'8px', color:W, fontSize:'13px', padding:'8px 12px',
    fontFamily:'Georgia,serif', width:'100%',
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Home</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:GOLD }}>Compensation Plan</span>
      </div>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'28px 16px 60px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:W, margin:'0 0 6px' }}>
            9 Income Streams
          </h1>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', margin:0 }}>
            Tap any stream to explore the full details
          </p>
        </div>

        {/* Stream tabs */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'20px', justifyContent:'center' }}>
          {STREAMS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              style={{ padding:'8px 14px', borderRadius:'20px', border:`1px solid ${active===s.id ? s.color : 'rgba(255,255,255,0.1)'}`,
                background: active===s.id ? `${s.color}18` : 'transparent',
                color: active===s.id ? s.color : 'rgba(255,255,255,0.5)',
                fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        {/* ── NSB ── */}
        {active === 'nsb' && (
          <div style={card('#6EE7B730')}>
            <h2 style={{ color:'#6EE7B7', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🎯 NSB — New Sale Bonus</h2>
            {/* Free Builder Special Rules */}
            <div style={{ background:'rgba(110,231,183,0.08)', border:'1px solid rgba(110,231,183,0.25)', borderRadius:'12px', padding:'14px', marginBottom:'12px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7', marginBottom:'6px' }}>🆓 Free Builder — Special Rules</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>
                Free builders earn <strong style={{color:'#6EE7B7'}}>ONLY NSB</strong> (R100 + 10%) on their personal sales — from Starter to Platinum Rocket. No ISP, TSC, QPB, TLI, CEO or Marketplace income.
              </div>
              <div style={{ marginTop:'8px', padding:'8px 12px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'8px', fontSize:'12px', color:'#FCD34D', lineHeight:1.7 }}>
                🚀 <strong>Auto-Upgrade:</strong> When a Free builder accumulates R500 in NSB earnings, the system automatically uses that R500 to upgrade them to Starter Pack. They instantly unlock all 9 income streams.
              </div>
            </div>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              <strong style={{color:'#6EE7B7'}}>For Starter+ builders:</strong> NSB is paid to the builder who personally generated the sale. R100 flat + your ISP% of the sale tier price.
            </p>
            <div style={{ background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7', marginBottom:'10px' }}>💡 NSB Calculator</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>YOUR tier</label>
                  <select value={simTier} onChange={e => setSimTier(e.target.value)} style={sel}>
                    {Object.keys(ISP_RATES).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.15)', borderRadius:'8px', padding:'8px 12px', display:'flex', alignItems:'center' }}>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>
                    💡 NSB is the same regardless of which tier the buyer purchases
                  </div>
                </div>
              </div>
              <div style={{ textAlign:'center', padding:'14px', background:'rgba(110,231,183,0.1)', borderRadius:'10px' }}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' }}>
                  {`R100 + ${ISP_RATES[simTier]}% of R500 = R${calcNSB(simTier).toLocaleString()}`}
                </div>
                <div style={{ fontSize:'30px', fontWeight:900, color:'#6EE7B7' }}>R{calcNSB(simTier, simSale).toLocaleString()}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>NSB earned · once-off</div>
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
                <thead>
                  <tr>
                    <th style={{ padding:'6px 4px', textAlign:'left', color:GOLD }}>You ↓ / Sale →</th>
                    {Object.keys(TIER_PRICES).map(s => <th key={s} style={{ padding:'6px 4px', textAlign:'center', color:'rgba(255,255,255,0.5)', textTransform:'capitalize' }}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(ISP_RATES).map(builder => (
                    <tr key={builder} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'6px 4px', fontWeight:700, textTransform:'capitalize', color:'#A78BFA' }}>{builder}</td>
                      {Object.keys(TIER_PRICES).map(sale => (
                        <td key={sale} style={{ padding:'6px 4px', textAlign:'center', color:'#6EE7B7', fontWeight:700 }}>
                          R{calcNSB(builder, 'starter').toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ISP ── */}
        {active === 'isp' && (
          <div style={card('#A78BFA30')}>
            <h2 style={{ color:'#A78BFA', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>💰 ISP — Individual Sales Profit</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'8px', lineHeight:1.8 }}>
              ISP applies in TWO ways: (1) on monthly BFM payments after 60 days, and (2) on Bronze+ tier purchases/upgrades by yourself and your accessible team generations.
            </p>
            <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'10px', padding:'12px', marginBottom:'16px', fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>
              Example: You are <strong style={{color:'#A78BFA'}}>Bronze (18%)</strong>.<br/>
              • Team member upgrades to Silver (R12,000) → you earn <strong style={{color:'#A78BFA'}}>18% = R2,160 ISP</strong><br/>
              • Team member pays Bronze BFM R1,050/month → you earn <strong style={{color:'#A78BFA'}}>18% = R189/month ISP</strong>
            </div>
            {Object.entries(ISP_RATES).map(([tier, rate]) => (
              <div key={tier} style={{ background:'rgba(167,139,250,0.05)', border:'1px solid rgba(167,139,250,0.12)', borderRadius:'10px', padding:'12px 14px', marginBottom:'8px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontSize:'14px', fontWeight:700, textTransform:'capitalize', color:W }}>{tier}</span>
                  <span style={{ fontSize:'16px', fontWeight:900, color:'#A78BFA' }}>{rate}% ISP</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
                  {Object.entries(BFM_AMOUNTS).map(([t, bfm]) => (
                    <div key={t} style={{ textAlign:'center', background:'rgba(167,139,250,0.08)', borderRadius:'8px', padding:'6px' }}>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', textTransform:'capitalize' }}>{t}</div>
                      <div style={{ fontSize:'12px', fontWeight:700, color:'#A78BFA' }}>R{Math.round(rate/100*bfm)}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── QPB ── */}
        {active === 'qpb' && (
          <div style={card('#FCD34D30')}>
            <h2 style={{ color:'#FCD34D', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>⭐ QPB — Quick Performance Bonus</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              +7.5% on ALL your NSB and ISP earnings — but ONLY in your first 90 days from registration. Applies to Free and Starter registrations. Auto-expires after 90 days.
            </p>
            <div style={{ textAlign:'center', padding:'20px', background:'rgba(252,211,77,0.08)', border:'1px solid rgba(252,211,77,0.2)', borderRadius:'12px', marginBottom:'16px' }}>
              <div style={{ fontSize:'32px', fontWeight:900, color:'#FCD34D' }}>+7.5%</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>on all earnings · first 90 days only</div>
            </div>
            {[
              { s:'R2,000 NSB in week 3', b:'R150', t:'R2,150' },
              { s:'R500 ISP in month 2', b:'R37.50', t:'R537.50' },
              { s:'R4,320 NSB (Bronze→Silver)', b:'R324', t:'R4,644' },
            ].map(ex => (
              <div key={ex.s} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{ex.s}</span>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'11px', color:'#FCD34D' }}>+{ex.b} QPB</div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:W }}>{ex.t}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TSC ── */}
        {active === 'tsc' && (
          <div style={card('#38BDF830')}>
            <h2 style={{ color:'#38BDF8', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🔗 TSC — Team Sales Commission</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Earn on new tier purchases by your downline team. Same rate as your ISP. The more generations you can access, the more powerful your network income.
            </p>
            {[
              { tier:'Free/Starter', gen:'Personal sales only', color:'rgba(255,255,255,0.3)' },
              { tier:'Bronze',  gen:'G2 – G3',  color:'#38BDF8' },
              { tier:'Copper',  gen:'G2 – G4',  color:'#38BDF8' },
              { tier:'Silver',  gen:'G2 – G6',  color:'#38BDF8' },
              { tier:'Gold',    gen:'G2 – G8',  color:GOLD },
              { tier:'Platinum',gen:'G2 – G10', color:GOLD },
            ].map(row => (
              <div key={row.tier} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'rgba(56,189,248,0.04)', border:'1px solid rgba(56,189,248,0.1)', borderRadius:'10px', marginBottom:'6px' }}>
                <span style={{ fontSize:'13px', fontWeight:700, color:W }}>{row.tier}</span>
                <span style={{ fontSize:'13px', fontWeight:700, color:row.color }}>{row.gen}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── TLI ── */}
        {active === 'tli' && (
          <div style={card(`${GOLD}30`)}>
            <h2 style={{ color:GOLD, fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏆 TLI — Team Leadership Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'4px', lineHeight:1.8 }}>
              A once-off rank achievement bonus paid when you FIRST qualify for each level. Evaluated quarterly — paid ONCE per Builder per rank.
            </p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginBottom:'16px' }}>Silver+ only · Full BFM required</p>
            {TLI_LEVELS.map(t => (
              <div key={t.level} style={{ background:`${GOLD}06`, border:`1px solid ${GOLD}20`, borderRadius:'10px', padding:'10px 14px', marginBottom:'6px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                  <span style={{ fontSize:'13px', fontWeight:700, color:W }}>L{t.level} · {t.name}</span>
                  <span style={{ fontSize:'14px', fontWeight:900, color:GOLD }}>R{t.amount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{t.req}</div>
              </div>
            ))}
            <div style={{ marginTop:'12px', padding:'12px', background:`${GOLD}10`, borderRadius:'10px', textAlign:'center' }}>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>Total across all 10 ranks</div>
              <div style={{ fontSize:'22px', fontWeight:900, color:GOLD }}>R6,475,000</div>
            </div>
          </div>
        )}

        {/* ── CEO Competition ── */}
        {active === 'ceoC' && (
          <div style={card('#F472B630')}>
            <h2 style={{ color:'#F472B6', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏅 CEO Competition Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Structured competitions announced by the CEO with specific rules, targets and qualification criteria.
            </p>
            {[
              { label:'Format', value:'Team building races, sales sprints, recruitment targets' },
              { label:'Prizes', value:'Cash, trips, recognition, tier upgrades' },
              { label:'Eligibility', value:'Varies — some open to all, some tier-restricted' },
              { label:'Frequency', value:'Announced by CEO — not a permanent stream' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── CEO Awards ── */}
        {active === 'ceoA' && (
          <div style={card('#E879F930')}>
            <h2 style={{ color:'#E879F9', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>👑 CEO Awards</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Discretionary awards given by the CEO for extraordinary achievement. Unlike CEO Competition, these have no fixed rules — they are personal recognitions.
            </p>
            {[
              { label:'Who decides', value:'The CEO — no fixed formula' },
              { label:'Criteria', value:'Exceptional mentorship, community building, culture, milestones' },
              { label:'Frequency', value:'As the CEO decides — special and meaningful' },
              { label:'Format', value:'Cash, recognition, gifts, platform features' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── MARKETPLACE ── */}
        {active === 'mkt' && (
          <div style={card('#4ADE8030')}>
            <h2 style={{ color:'#4ADE80', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏪 Marketplace Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              ALL builders from Starter tier and above can list digital products on the Z2B Marketplace. Set your own retail price. Builders keep <strong style={{color:'#4ADE80'}}>90%</strong> — Z2B takes 10% marketplace service fee only.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
              {[
                { tier:'Silver (Rocket)', access:'List on Z2B Marketplace · Keep 90% of every sale', color:'#C0C0C0' },
                { tier:'Gold (Rocket)',   access:'Z2B Marketplace + sell externally · 30 products/month', color:'#D4AF37' },
                { tier:'Platinum (Rocket)', access:'Z2B Marketplace + own branded marketplace · Unlimited', color:'#E2E8F0' },
              ].map(row => (
                <div key={row.tier} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'rgba(74,222,128,0.04)', border:'1px solid rgba(74,222,128,0.12)', borderRadius:'10px' }}>
                  <span style={{ fontSize:'13px', fontWeight:700, color:row.color }}>{row.tier}</span>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', textAlign:'right' as const, maxWidth:'60%' }}>{row.access}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'12px', padding:'14px', textAlign:'center' as const }}>
              <div style={{ fontSize:'24px', fontWeight:900, color:'#4ADE80' }}>90%</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>of every sale goes to you</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'4px' }}>Z2B takes 10% marketplace service fee · No listing fee · No monthly fee</div>
            </div>
          </div>
        )}

        {/* ── DISTRIBUTION RIGHTS ── */}
        {active === 'dist' && (
          <div style={card('#818CF830')}>
            <h2 style={{ color:'#818CF8', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🌐 Distribution Rights</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Exclusive to <strong style={{color:'#818CF8'}}>Platinum</strong> and <strong style={{color:'#818CF8'}}>Platinum Rocket</strong> builders. Distribution Rights allow you to licence and distribute the Z2B 4M system — creating your own sub-network with full branding rights.
            </p>
            {[
              { label:'Who qualifies', value:'Platinum (R50,000) and Platinum Rocket (R70,000) only' },
              { label:'What you get', value:'Right to distribute Z2B membership in your own branded environment' },
              { label:'Your own marketplace', value:'Own branded product marketplace under your domain' },
              { label:'Revenue', value:'Full TSC G2–G10 on your distribution network + Marketplace income + all other streams' },
              { label:'Platinum Rocket bonus', value:'Unlimited Rocket Mode products + website builder + bulk creation for your entire network' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' as const }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── TIER UPGRADE SAFE ── */}
        {active === 'safe' && (
          <div style={card('#FCD34D30')}>
            <h2 style={{ color:'#FCD34D', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>💰 Tier Upgrade Safe</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Available to <strong style={{color:'#FCD34D'}}>Starter+ builders</strong>. Give Z2B permission to automatically save a percentage of your earnings toward your next tier upgrade. The saved money belongs to you — always.
            </p>

            {/* How it works */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
              {[
                { step:'1', text:'Choose your save percentage (20%, 30% or custom %)', color:'#FCD34D' },
                { step:'2', text:'Z2B automatically deducts your chosen % from every earning', color:'#FCD34D' },
                { step:'3', text:'Your Safe balance grows until it reaches your next tier price', color:'#FCD34D' },
                { step:'4', text:'You get notified — one tap to activate your upgrade', color:'#FCD34D' },
              ].map(s => (
                <div key={s.step} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:`${s.color}20`, border:`1px solid ${s.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900, color:s.color, flexShrink:0 }}>{s.step}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.6 }}>{s.text}</div>
                </div>
              ))}
            </div>

            {/* Example calculations */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#FCD34D', marginBottom:'8px' }}>📊 Example Savings Scenarios</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
                <thead>
                  <tr>
                    <th style={{ padding:'6px 4px', textAlign:'left', color:GOLD }}>Current → Next</th>
                    <th style={{ padding:'6px 4px', textAlign:'center', color:GOLD }}>Monthly Earn</th>
                    <th style={{ padding:'6px 4px', textAlign:'center', color:GOLD }}>Save 20%</th>
                    <th style={{ padding:'6px 4px', textAlign:'center', color:GOLD }}>Save 30%</th>
                    <th style={{ padding:'6px 4px', textAlign:'center', color:GOLD }}>Months (20%)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cur:'Starter', nxt:'Bronze', target:2500, monthly:500 },
                    { cur:'Bronze', nxt:'Copper', target:5000, monthly:1000 },
                    { cur:'Copper', nxt:'Silver', target:12000, monthly:2000 },
                    { cur:'Silver', nxt:'S.Rocket', target:17000, monthly:3000 },
                    { cur:'Gold', nxt:'G.Rocket', target:35000, monthly:5000 },
                  ].map(row => (
                    <tr key={row.cur} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'6px 4px', color:W, fontWeight:700 }}>{row.cur} → {row.nxt}</td>
                      <td style={{ padding:'6px 4px', textAlign:'center', color:'rgba(255,255,255,0.6)' }}>R{row.monthly.toLocaleString()}</td>
                      <td style={{ padding:'6px 4px', textAlign:'center', color:'#6EE7B7' }}>R{(row.monthly*0.2).toLocaleString()}/mo</td>
                      <td style={{ padding:'6px 4px', textAlign:'center', color:'#6EE7B7' }}>R{(row.monthly*0.3).toLocaleString()}/mo</td>
                      <td style={{ padding:'6px 4px', textAlign:'center', color:'#FCD34D', fontWeight:700 }}>~{Math.ceil(row.target/(row.monthly*0.2))} mo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rules */}
            <div style={{ marginTop:'14px', padding:'12px', background:'rgba(252,211,77,0.06)', border:'1px solid rgba(252,211,77,0.15)', borderRadius:'10px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#FCD34D', marginBottom:'6px' }}>📋 Safe Rules</div>
              {[
                'The saved money belongs to you — always',
                'You can opt out at any time and receive a full refund of your saved balance',
                'Opting out does NOT change your current tier — you stay where you are',
                'You can top up your Safe balance manually at any time',
                'Save % applies to all earnings: NSB, ISP, QPB, TSC, Marketplace income',
                'When target is reached, you receive a notification to approve the upgrade',
              ].map((rule, i) => (
                <div key={i} style={{ display:'flex', gap:'6px', fontSize:'12px', color:'rgba(255,255,255,0.65)', padding:'3px 0', lineHeight:1.6 }}>
                  <span style={{ color:'#FCD34D', flexShrink:0 }}>✓</span>{rule}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign:'center', marginTop:'32px', padding:'24px', background:`rgba(76,29,149,0.15)`, border:`1px solid ${GOLD}30`, borderRadius:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'8px' }}>
            Ready to Start Earning?
          </div>
          <Link href="/ai-income/landing" style={{ display:'inline-block', padding:'12px 32px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'12px', color:'#1E1245', fontWeight:900, fontSize:'14px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            🚀 Start My 4M Machine →
          </Link>
        </div>
      </div>
    </div>
  )
}
