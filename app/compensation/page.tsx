'use client'
// FILE: app/compensation/page.tsx
// Z2B 4M Compensation Plan — 9 Income Streams

import { useState } from 'react'
import Link from 'next/link'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const W    = '#F0EEF8'

const ISP_RATES: Record<string,number> = {
  free:5, starter:10, bronze:18, copper:22, silver:25, gold:28, platinum:30,
  silver_rocket:25, gold_rocket:28, platinum_rocket:30,
}
const BFM: Record<string,number> = {
  starter:850, bronze:1050, copper:1300, silver:2000, gold:3200, platinum:5800,
  silver_rocket:2550, gold_rocket:5250, platinum_rocket:10500,
}
const TIER_PRICES: Record<string,number> = {
  starter:500, bronze:2500, copper:5000, silver:12000, gold:24000, platinum:50000,
  silver_rocket:17000, gold_rocket:35000, platinum_rocket:70000,
}
const TLI = [
  {l:1,  n:'Table Starter',        a:3000,      r:'30 builders · 4 Silver leaders'},
  {l:2,  n:'Table Builder',        a:8000,      r:'80 builders · 4 Silver + 2 at L1'},
  {l:3,  n:'Team Activator',       a:20000,     r:'200 builders · 4 Gold + 3 at L2'},
  {l:4,  n:'Legacy Builder',       a:45000,     r:'500 builders · 4 Gold at L3'},
  {l:5,  n:'Income Architect',     a:90000,     r:'1,200 builders · 4 Gold at L4'},
  {l:6,  n:'Wealth Multiplier',    a:180000,    r:'3,000 builders · 4 Platinum at L5'},
  {l:7,  n:'Empire Maker',         a:380000,    r:'7,500 builders · 4 Platinum at L6'},
  {l:8,  n:'Dynasty Leader',       a:750000,    r:'20,000 builders · 4 Platinum at L7'},
  {l:9,  n:'Kingdom Architect',    a:1500000,   r:'50,000 builders · 4 Platinum at L8'},
  {l:10, n:'Z2B Billionaire Table',a:3500000,   r:'100,000 builders · 4 Platinum at L9'},
]
const STREAMS = [
  {id:'nsb',  n:'NSB',          f:'New Sale Bonus',              c:'#6EE7B7', i:'🎯'},
  {id:'isp',  n:'ISP',          f:'Individual Sales Profit',      c:'#A78BFA', i:'💰'},
  {id:'qpb',  n:'QPB',          f:'Quick Performance Bonus',      c:'#FCD34D', i:'⭐'},
  {id:'tsc',  n:'TSC',          f:'Team Sales Commission',         c:'#38BDF8', i:'🔗'},
  {id:'tli',  n:'TLI',          f:'Team Leadership Income',        c:GOLD,      i:'🏆'},
  {id:'ceoC', n:'CEO Comp',     f:'CEO Competition Income',        c:'#F472B6', i:'🏅'},
  {id:'ceoA', n:'CEO Awards',   f:'CEO Special Achievement',      c:'#E879F9', i:'👑'},
  {id:'mkt',  n:'Marketplace',  f:'Marketplace Income (keep 90%)', c:'#4ADE80', i:'🏪'},
  {id:'dist', n:'Distribution', f:'Distribution Rights',           c:'#818CF8', i:'🌐'},
  {id:'safe', n:'Safe',         f:'Tier Upgrade Safe (Savings)',   c:'#FCD34D', i:'💰'},
]

function calcNSB(builder: string, sale: string): number {
  const rate  = ISP_RATES[builder] || 10
  const price = TIER_PRICES[sale]  || 500
  if (builder === 'free') {
    return sale === 'starter' ? 100 : Math.round(0.05 * price)
  }
  return sale === 'starter'
    ? Math.round(100 + rate/100 * 500)
    : Math.round(rate/100 * price)
}

export default function CompensationPage() {
  const [tab,     setTab]     = useState('nsb')
  const [simT,    setSimT]    = useState('bronze')
  const [simS,    setSimS]    = useState('starter')

  const card = (border = 'rgba(255,255,255,0.08)') => ({
    background:'rgba(255,255,255,0.03)', border:`1px solid ${border}`,
    borderRadius:'16px', padding:'20px', marginBottom:'8px',
  })
  const sel: React.CSSProperties = {
    width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.07)',
    border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px',
    color:W, fontSize:'13px', fontFamily:'Georgia,serif',
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Home</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:GOLD }}>Compensation Plan</span>
      </div>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'24px 16px 60px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:W, margin:'0 0 4px' }}>9 Income Streams</h1>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', margin:0 }}>Tap any stream to explore full details</p>
        </div>

        {/* Stream tabs */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'20px', justifyContent:'center' }}>
          {STREAMS.map(s => (
            <button key={s.id} onClick={() => setTab(s.id)}
              style={{ padding:'7px 12px', borderRadius:'20px', cursor:'pointer', fontSize:'11px', fontWeight:700,
                border:`1px solid ${tab===s.id ? s.c : 'rgba(255,255,255,0.1)'}`,
                background: tab===s.id ? `${s.c}18` : 'transparent',
                color: tab===s.id ? s.c : 'rgba(255,255,255,0.5)' }}>
              {s.i} {s.n}
            </button>
          ))}
        </div>

        {/* NSB */}
        {tab === 'nsb' && (
          <div style={card('#6EE7B730')}>
            <h2 style={{ color:'#6EE7B7', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🎯 NSB — New Sale Bonus</h2>
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'10px 14px', marginBottom:'12px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#FCA5A5', marginBottom:'2px' }}>⚠️ Free Builder Special Rules</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>
                Free tier: Starter sale = <strong>R100 flat only</strong> · Bronze+ sale = <strong>5% of tier price</strong><br/>
                First R500 NSB accumulated → <strong>auto-upgrade to Starter Pack</strong><br/>
                Free builders earn NSB only — no ISP, TSC, TLI or other streams.
              </div>
            </div>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Starter+: Starter sale = R100 + ISP% of R500. Bronze+ sale = ISP% of tier price. Personal sales only.
            </p>

            {/* Calculator */}
            <div style={{ background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'14px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7', marginBottom:'10px' }}>💡 NSB Calculator</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>YOUR tier</label>
                  <select value={simT} onChange={e => setSimT(e.target.value)} style={sel}>
                    {Object.keys(ISP_RATES).map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Builder buys</label>
                  <select value={simS} onChange={e => setSimS(e.target.value)} style={sel}>
                    {Object.keys(TIER_PRICES).map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ textAlign:'center', padding:'12px', background:'rgba(110,231,183,0.1)', borderRadius:'10px' }}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' }}>
                  {simT === 'free'
                    ? simS === 'starter' ? 'R100 flat (Free + Starter sale)' : `5% of R${(TIER_PRICES[simS]||0).toLocaleString()}`
                    : simS === 'starter' ? `R100 + ${ISP_RATES[simT]}% of R500` : `${ISP_RATES[simT]}% of R${(TIER_PRICES[simS]||0).toLocaleString()}`
                  }
                </div>
                <div style={{ fontSize:'28px', fontWeight:900, color:'#6EE7B7' }}>R{calcNSB(simT, simS).toLocaleString()}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>NSB earned · once-off · personal sale only</div>
              </div>
            </div>

            {/* Rate table */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>All builder tiers (Starter sale / Bronze sale):</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'4px', marginBottom:'6px' }}>
              {['Builder','Starter sale','Bronze sale'].map(h => (
                <div key={h} style={{ fontSize:'10px', color:GOLD, fontWeight:700, padding:'4px 6px' }}>{h}</div>
              ))}
            </div>
            {Object.keys(ISP_RATES).map(builder => (
              <div key={builder} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'4px', marginBottom:'3px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, padding:'5px 6px', textTransform:'capitalize',
                  background: builder==='free' ? 'rgba(110,231,183,0.08)' : 'rgba(255,255,255,0.03)',
                  border:`1px solid ${builder==='free' ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius:'6px', color: builder==='free' ? '#6EE7B7' : '#A78BFA' }}>
                  {builder.replace(/_/g,' ')}
                </div>
                <div style={{ fontSize:'11px', fontWeight:700, padding:'5px 6px', textAlign:'center',
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', color:'#6EE7B7' }}>
                  R{calcNSB(builder,'starter').toLocaleString()}
                </div>
                <div style={{ fontSize:'11px', fontWeight:700, padding:'5px 6px', textAlign:'center',
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', color:'#A78BFA' }}>
                  R{calcNSB(builder,'bronze').toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ISP */}
        {tab === 'isp' && (
          <div style={card('#A78BFA30')}>
            <h2 style={{ color:'#A78BFA', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>💰 ISP — Individual Sales Profit</h2>
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'10px 14px', marginBottom:'12px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#FCA5A5', marginBottom:'2px' }}>⚠️ Bronze to Platinum Rocket ONLY</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>Free and Starter builders earn R0 ISP. ISP starts at Bronze (18%).</div>
            </div>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              ISP applies on: (1) monthly BFM (Business Fuel Maintenance) payments after 60 days, and (2) Bronze+ tier upgrade purchases by yourself and your team.
            </p>
            {Object.entries(ISP_RATES).map(([tier, rate]) => {
              const noISP = tier === 'free' || tier === 'starter'
              return (
                <div key={tier} style={{ background: noISP ? 'rgba(255,255,255,0.02)' : 'rgba(167,139,250,0.05)',
                  border:`1px solid ${noISP ? 'rgba(255,255,255,0.06)' : 'rgba(167,139,250,0.12)'}`,
                  borderRadius:'10px', padding:'12px 14px', marginBottom:'8px', opacity: noISP ? 0.6 : 1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom: noISP ? 0 : '8px' }}>
                    <span style={{ fontSize:'13px', fontWeight:700, textTransform:'capitalize', color: noISP ? 'rgba(255,255,255,0.4)' : W }}>{tier.replace(/_/g,' ')}</span>
                    <span style={{ fontSize:'15px', fontWeight:900, color: noISP ? 'rgba(255,0,0,0.6)' : '#A78BFA' }}>{noISP ? 'R0 — No ISP' : `${rate}% ISP`}</span>
                  </div>
                  {!noISP && (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'5px' }}>
                      {Object.entries(BFM).map(([t, bfm]) => (
                        <div key={t} style={{ textAlign:'center', background:'rgba(167,139,250,0.08)', borderRadius:'8px', padding:'5px' }}>
                          <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.35)', textTransform:'capitalize' }}>{t.replace(/_/g,' ')}</div>
                          <div style={{ fontSize:'11px', fontWeight:700, color:'#A78BFA' }}>R{Math.round(rate/100*bfm).toLocaleString()}/mo</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* QPB */}
        {tab === 'qpb' && (
          <div style={card('#FCD34D30')}>
            <h2 style={{ color:'#FCD34D', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>⭐ QPB — Quick Performance Bonus</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              +7.5% on ALL NSB and ISP earnings — but ONLY in your first 90 days from registration. Auto-expires after 90 days.
            </p>
            <div style={{ textAlign:'center', padding:'20px', background:'rgba(252,211,77,0.08)', border:'1px solid rgba(252,211,77,0.2)', borderRadius:'12px', marginBottom:'14px' }}>
              <div style={{ fontSize:'32px', fontWeight:900, color:'#FCD34D' }}>+7.5%</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>on all earnings · first 90 days only</div>
            </div>
            {[
              {s:'R2,000 NSB in week 3',        b:'R150',   t:'R2,150'},
              {s:'R500 ISP in month 2',          b:'R37.50', t:'R537.50'},
              {s:'R4,320 NSB (Bronze→Silver)',   b:'R324',   t:'R4,644'},
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

        {/* TSC */}
        {tab === 'tsc' && (
          <div style={card('#38BDF830')}>
            <h2 style={{ color:'#38BDF8', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🔗 TSC — Team Sales Commission</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Earn on new tier purchases by your downline team. Same rate as your ISP. Free and Starter = personal sales only.
            </p>
            {[
              {t:'Free / Starter', g:'Personal sales only', c:'rgba(255,255,255,0.3)'},
              {t:'Bronze',         g:'G2 – G3',  c:'#38BDF8'},
              {t:'Copper',         g:'G2 – G4',  c:'#38BDF8'},
              {t:'Silver / Silver Rocket', g:'G2 – G6', c:'#38BDF8'},
              {t:'Gold / Gold Rocket',     g:'G2 – G8', c:GOLD},
              {t:'Platinum / Platinum Rocket', g:'G2 – G10', c:GOLD},
            ].map(row => (
              <div key={row.t} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px',
                background:'rgba(56,189,248,0.04)', border:'1px solid rgba(56,189,248,0.1)', borderRadius:'10px', marginBottom:'6px' }}>
                <span style={{ fontSize:'13px', fontWeight:700, color:W }}>{row.t}</span>
                <span style={{ fontSize:'13px', fontWeight:700, color:row.c }}>{row.g}</span>
              </div>
            ))}
          </div>
        )}

        {/* TLI */}
        {tab === 'tli' && (
          <div style={card(`${GOLD}30`)}>
            <h2 style={{ color:GOLD, fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏆 TLI — Team Leadership Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'4px', lineHeight:1.8 }}>
              Once-off rank achievement bonus paid when you FIRST qualify for each level. Evaluated quarterly. Silver+ only.
            </p>
            {TLI.map(t => (
              <div key={t.l} style={{ background:`${GOLD}06`, border:`1px solid ${GOLD}20`, borderRadius:'10px', padding:'10px 14px', marginBottom:'5px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'2px' }}>
                  <span style={{ fontSize:'13px', fontWeight:700, color:W }}>L{t.l} · {t.n}</span>
                  <span style={{ fontSize:'13px', fontWeight:900, color:GOLD }}>R{t.a.toLocaleString()}</span>
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{t.r}</div>
              </div>
            ))}
            <div style={{ marginTop:'10px', padding:'12px', background:`${GOLD}10`, borderRadius:'10px', textAlign:'center' }}>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>Total across all 10 ranks</div>
              <div style={{ fontSize:'20px', fontWeight:900, color:GOLD }}>R6,475,000</div>
            </div>
          </div>
        )}

        {/* CEO Competition */}
        {tab === 'ceoC' && (
          <div style={card('#F472B630')}>
            <h2 style={{ color:'#F472B6', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏅 CEO Competition Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Structured competitions with specific rules, targets and prizes. Announced by the CEO. Time-bound challenges.
            </p>
            {[
              {label:'Format',      value:'Team building races, sales sprints, recruitment targets'},
              {label:'Prizes',      value:'Cash, trips, recognition, tier upgrades'},
              {label:'Eligibility', value:'Varies — some open to all, some tier-restricted'},
              {label:'Frequency',   value:'Announced by CEO — not a permanent stream'},
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* CEO Awards */}
        {tab === 'ceoA' && (
          <div style={card('#E879F930')}>
            <h2 style={{ color:'#E879F9', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>👑 CEO Awards</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Discretionary awards given by the CEO for extraordinary achievement. No fixed rules — personal recognition for exceptional contribution.
            </p>
            {[
              {label:'Who decides', value:'The CEO — no fixed formula'},
              {label:'Criteria',    value:'Exceptional mentorship, community building, culture, milestones'},
              {label:'Frequency',   value:'As the CEO decides — special and meaningful'},
              {label:'Format',      value:'Cash, recognition, gifts, platform features'},
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Marketplace */}
        {tab === 'mkt' && (
          <div style={card('#4ADE8030')}>
            <h2 style={{ color:'#4ADE80', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🏪 Marketplace Income</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              ALL builders from <strong style={{color:'#4ADE80'}}>Starter and above</strong> can list digital products on the Z2B Marketplace. Set your own retail price. Keep <strong style={{color:'#4ADE80'}}>90%</strong> — Z2B takes 10% only.
            </p>
            {[
              {t:'Starter+',          a:'List own products · Z2B Marketplace · Keep 90%', c:'#A78BFA'},
              {t:'Bronze – Copper',   a:'List products · Z2B Marketplace · Keep 90%', c:'#CD7F32'},
              {t:'Silver – Gold',     a:'List products · Z2B Marketplace · Keep 90%', c:'#C0C0C0'},
              {t:'Silver Rocket',     a:'AI creates products (12/month) + list', c:'#FF6B35'},
              {t:'Gold Rocket',       a:'AI creates products (30/month) · Sell anywhere', c:'#FF6B35'},
              {t:'Platinum Rocket',   a:'Unlimited AI products · Own branded marketplace', c:'#E2E8F0'},
            ].map(row => (
              <div key={row.t} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px',
                background:'rgba(74,222,128,0.04)', border:'1px solid rgba(74,222,128,0.1)', borderRadius:'10px', marginBottom:'6px' }}>
                <span style={{ fontSize:'13px', fontWeight:700, color:row.c }}>{row.t}</span>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', textAlign:'right', maxWidth:'55%' }}>{row.a}</span>
              </div>
            ))}
          </div>
        )}

        {/* Distribution */}
        {tab === 'dist' && (
          <div style={card('#818CF830')}>
            <h2 style={{ color:'#818CF8', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>🌐 Distribution Rights</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Exclusive to <strong style={{color:'#818CF8'}}>Platinum</strong> and <strong style={{color:'#818CF8'}}>Platinum Rocket</strong> builders.
            </p>
            {[
              {label:'Who qualifies', value:'Platinum (R50,000) and Platinum Rocket (R70,000)'},
              {label:'What you get',  value:'Right to distribute Z2B 4M system under your own brand'},
              {label:'Own marketplace', value:'Own branded product marketplace under your domain'},
              {label:'Revenue',       value:'Full TSC G2-G10 + Marketplace income + all other streams'},
              {label:'Platinum Rocket', value:'Unlimited Rocket Mode + website builder + bulk creation'},
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:'12px' }}>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:'12px', color:W, textAlign:'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Safe */}
        {tab === 'safe' && (
          <div style={card('#FCD34D30')}>
            <h2 style={{ color:'#FCD34D', fontSize:'17px', fontWeight:900, marginBottom:'6px' }}>💰 Tier Upgrade Safe</h2>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'16px', lineHeight:1.8 }}>
              Available to <strong style={{color:'#FCD34D'}}>Starter+ builders</strong>. Automatically save a % of your earnings toward your next tier upgrade. The money is always yours.
            </p>
            {[
              {step:'1', text:'Choose your save % (20%, 30% or custom)'},
              {step:'2', text:'Z2B auto-deducts your chosen % from every earning'},
              {step:'3', text:'Safe balance grows until it reaches next tier price'},
              {step:'4', text:'You get notified — one tap to activate your upgrade'},
            ].map(s => (
              <div key={s.step} style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'rgba(252,211,77,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900, color:'#FCD34D', flexShrink:0 }}>{s.step}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.6, paddingTop:'2px' }}>{s.text}</div>
              </div>
            ))}
            <div style={{ marginTop:'10px', padding:'12px', background:'rgba(252,211,77,0.06)', border:'1px solid rgba(252,211,77,0.15)', borderRadius:'10px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#FCD34D', marginBottom:'6px' }}>📋 Rules</div>
              {['Saved money belongs to you — always','Opt out anytime for full refund · Tier unchanged','Top up manually anytime','Applies to all earnings: NSB, ISP, QPB, TSC, Marketplace'].map((r,i) => (
                <div key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', padding:'3px 0', display:'flex', gap:'6px' }}>
                  <span style={{color:'#FCD34D'}}>✓</span>{r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign:'center', marginTop:'28px', padding:'22px', background:'rgba(76,29,149,0.15)', border:`1px solid ${GOLD}30`, borderRadius:'16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'8px' }}>Ready to Start Earning?</div>
          <Link href="/ai-income/landing" style={{ display:'inline-block', padding:'12px 32px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'12px', color:'#1E1245', fontWeight:900, fontSize:'14px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            🚀 Start My 4M Machine →
          </Link>
        </div>

      </div>
    </div>
  )
}
