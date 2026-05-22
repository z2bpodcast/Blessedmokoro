'use client'
// File: app/income-rivers/page.tsx
// Z2B — The 4 Income Rivers
// Genesis 2:10 — Kingdom Income Framework

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const BG   = '#050A18'
const SURF = '#0D1629'
const GOLD = '#D4AF37'
const W    = '#F0F9FF'
const MUTED= '#64748B'

// River colors
const R1 = '#D4AF37' // Pishon    — Gold
const R2 = '#06B6D4' // Gihon     — Cyan
const R3 = '#8B5CF6' // Hiddekel  — Purple
const R4 = '#10B981' // Euphrates — Green

const RIVERS = [
  {
    num:      1,
    name:     'PISHON',
    title:    '4M Machine',
    sub:      'Build & Sell Digital Products',
    color:    R1,
    icon:     '⚙️',
    verse:    '"The one that winds through the land of Havilah, where there is gold." — Genesis 2:11',
    desc:     'The 4M Machine is an AI-powered Digital Products Factory that transforms your knowledge into premium sellable digital products — eBooks, toolkits, courses, frameworks and more — in a single session.',
    items: [
      { label:'Ownership',        value:'100% yours — always. The 4M Machine builds YOUR product' },
      { label:'Sell yourself',     value:'WhatsApp · Your PWA Store → Keep 100%'                 },
      { label:'Z2B Marketplace',   value:'75% you · 20% affiliate · 5% Z2B platform fee'         },
      { label:'Other platforms',   value:'Selar · Gumroad · Payhip → their platform split applies' },
      { label:'Platform fee',     value:'5% to Z2B'                            },
      { label:'Affiliate cut',    value:'20% to your referrer'                 },
      { label:'Platforms',        value:'Z2B · Selar · Gumroad · Payhip · WhatsApp' },
      { label:'Formats',          value:'eBooks · Toolkits · Courses · Workbooks · Audio · Video' },
    ],
    gears: [
      { icon:'🔧', label:'Manual',    tier:'Starter – Bronze', desc:'Gears 1–5' },
      { icon:'⚙️', label:'Automatic', tier:'Copper',           desc:'Gears 1–6' },
      { icon:'⚡', label:'Electric',  tier:'Silver',           desc:'All 7 Gears' },
      { icon:'🚀', label:'Rocket',    tier:'Gold – Platinum',  desc:'All 7 · Full automation' },
    ],
  },
  {
    num:      2,
    name:     'GIHON',
    title:    'Affiliate Marketing',
    sub:      '3 Referral Links',
    color:    R2,
    icon:     '🔗',
    verse:    '"The one that winds through the entire land of Cush." — Genesis 2:13',
    desc:     'Every Z2B member receives 3 unique referral links pointing to 3 separate landing pages. Share them anywhere — WhatsApp, Instagram, TikTok, Facebook.',
    items: [
      { label:'Link 1 — Marketplace',  value:'/marketplace?ref=YOURCODE · 20% per product sale'       },
      { label:'Link 2 — Book Landing', value:'/book_landing?ref=YOURCODE · R40 per eBook · or River 3' },
      { label:'Link 3 — 4M Machine',   value:'/ai-income?ref=YOURCODE · Full comp plan on upgrades'    },
      { label:'Commission rate',        value:'20% flat · No upline sharing on marketplace sales'       },
      { label:'BFM required',          value:'No — pure referral performance'                          },
    ],
  },
  {
    num:      3,
    name:     'HIDDEKEL',
    title:    'Compensation Plan',
    sub:      '9 Income Streams',
    color:    R3,
    icon:     '💰',
    verse:    '"The one that runs along the east side of Ashur." — Genesis 2:14',
    desc:     'When your referrals upgrade their Z2B membership, a structured multi-stream compensation plan activates — rewarding personal performance AND team leadership.',
    streams: [
      { icon:'🎯', name:'NSB', full:'New Sale Bonus',           bfm:false, color:'#6EE7B7', detail:'R100 flat per new membership sale · All paid tiers · Paid immediately'                                                },
      { icon:'💰', name:'ISP', full:'Individual Sales Profit',  bfm:false, color:'#A78BFA', detail:'Starter 10% · Bronze 18% · Copper 22% · Silver 25% · Gold 28% · Platinum 30% · Personal sales + team BFM payments'   },
      { icon:'⭐', name:'QPB', full:'Quick Performance Bonus',  bfm:false, color:'#FCD34D', detail:'+7.5% on ALL NSB and ISP · First 90 days only · Auto-expires · Example: R500 ISP + R37.50 QPB = R537.50'             },
      { icon:'🔗', name:'TSC', full:'Team Sales Commission',    bfm:true,  color:'#38BDF8', detail:'Starter ❌ · Bronze 3 gen · Copper 5 gen · Silver 7 gen · Gold & Platinum 10 gen · Same % as your ISP rate'           },
      { icon:'🏆', name:'TLI', full:'Team Leadership Incentive',bfm:true,  color:'#D4AF37', detail:'Copper+ only · Fixed monthly milestone income · R3,000 to R3,500,000/month · 10 leadership levels · Paid monthly'    },
      { icon:'🏅', name:'CEO Comp', full:'CEO Competition',     bfm:false, color:'#F472B6', detail:'Seasonal · All paid tiers · No BFM required · Pure performance · Prizes vary per season · Check dashboard'           },
      { icon:'👑', name:'CEO Awards', full:'CEO Awards',        bfm:true,  color:'#E879F9', detail:'Permanent milestones · BFM required · Long-term achievements · Cash + elite status + special privileges'              },
      { icon:'🏪', name:'MKT', full:'Marketplace Income',       bfm:false, color:'#4ADE80', detail:'Organic sales of your products · 75% to you · No referral link needed · Buyers discover you on the marketplace'      },
      { icon:'🌐', name:'DIST', full:'Distribution Rights',     bfm:false, color:'#818CF8', detail:'Silver+ only · Multi-platform: Selar · Gumroad · Payhip · WhatsApp · Auto-listed via Gear 7'                        },
    ],
  },
  {
    num:      4,
    name:     'EUPHRATES',
    title:    'Builder PWA Store',
    sub:      'Your Own Digital Economy',
    color:    R4,
    icon:     '🏪',
    verse:    '"The fourth river is the Euphrates." — Genesis 2:14',
    desc:     'The great river. The largest. The most powerful. Every Copper and above builder receives their own installable PWA store — a complete digital business that belongs to them.',
    items: [
      { label:'Product Store',      value:'List and sell your own digital products · Your pricing · Your rules'         },
      { label:'Payment Gateway',    value:'Your own Yoco key · EFT · Nedbank ATM · Or use Z2B default'                 },
      { label:'Members Area',       value:'Your own paying community · Paywall on premium content'                     },
      { label:'Social Feed',        value:'Text · Images · Voice notes · Your own WhatsApp-style community'            },
      { label:'Affiliate System',   value:'Your members earn promoting YOUR products · You set the rules'              },
      { label:'Admin Dashboard',    value:'Products · Members · Sales · Affiliates · Settings'                         },
      { label:'PWA Install',        value:'Members install your store on their phones · Works offline'                 },
      { label:'Custom Domain',      value:'Buy via domains.co.za · Point to your store · Your brand · Your URL'       },
    ],
    pwaLevels: [
      { tier:'Copper',   count:'1 PWA',        desc:'Product Store'                                              },
      { tier:'Silver',   count:'3 PWAs',       desc:'Store + Community + Personal Brand'                        },
      { tier:'Gold',     count:'5 PWAs',       desc:'Store + Community + Brand + Academy + Affiliate Network'   },
      { tier:'Platinum', count:'Unlimited',    desc:'Full Digital Agency Suite'                                  },
    ],
  },
]

const BFM_TIERS = [
  { tier:'Starter',  amount:'R750',   bfm:750   },
  { tier:'Bronze',   amount:'R1,050', bfm:1050  },
  { tier:'Copper',   amount:'R1,500', bfm:1500  },
  { tier:'Silver',   amount:'R3,000', bfm:3000  },
  { tier:'Gold',     amount:'R7,000', bfm:7000  },
  { tier:'Platinum', amount:'R12,000',bfm:12000 },
]

export default function IncomeRiversPage() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') ?? ''
  const [copied, setCopied] = useState(false)
  const [openRiver, setOpenRiver] = useState<number | null>(null)
  const [openStream, setOpenStream] = useState<number | null>(null)

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }
        .river-card { transition: all 0.3s; }
        .river-card:hover { transform: translateY(-3px); }
        .stream-row { transition: all 0.2s; cursor: pointer; }
        .stream-row:hover { background: rgba(255,255,255,0.04) !important; }
        .item-row:hover { background: rgba(255,255,255,0.03) !important; }
        @keyframes flow {
          0%   { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0);     opacity: 1; }
        }
        @keyframes ripple {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(2.5);  opacity: 0;   }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.6; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${GOLD}40; border-radius: 2px; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ padding:'12px 20px', background:`${SURF}f0`, backdropFilter:'blur(12px)', borderBottom:`1px solid ${GOLD}20`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/" style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:GOLD, textDecoration:'none' }}>← Z2B Home</Link>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:W, fontWeight:700 }}>The 4 Income Rivers</span>
        <Link href="/register" style={{ padding:'7px 16px', borderRadius:8, background:GOLD, color:BG, fontSize:12, fontWeight:900, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
          Start Now →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <div style={{ textAlign:'center', padding:'80px 20px 60px', position:'relative', overflow:'hidden' }}>
        {/* Animated river lines */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          {[R1,R2,R3,R4].map((color, i) => (
            <div key={i} style={{ position:'absolute', height:2, width:'60%', left:'-60%', top:`${20+i*20}%`, background:`linear-gradient(90deg,transparent,${color}40,transparent)`, animation:`flow ${3+i*0.5}s ease-out ${i*0.3}s both` }} />
          ))}
        </div>

        <div style={{ position:'relative', zIndex:1, maxWidth:700, margin:'0 auto' }}>
          <div style={{ fontFamily:'Lato,sans-serif', fontSize:10, letterSpacing:6, textTransform:'uppercase', color:GOLD, marginBottom:20 }}>
            Genesis 2:10
          </div>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(32px,6vw,64px)', fontWeight:900, color:W, lineHeight:1.1, marginBottom:20 }}>
            The 4 Income<br/>
            <span style={{ background:`linear-gradient(135deg,${R1},${R2},${R3},${R4})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Rivers
            </span>
          </h1>
          <blockquote style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontStyle:'italic', fontSize:'clamp(15px,2.5vw,20px)', color:`${W}99`, lineHeight:1.8, marginBottom:32, maxWidth:560, margin:'0 auto 32px' }}>
            "A river watering the garden flowed from Eden;<br/>
            from there it was separated into four headwaters."<br/>
            <span style={{ fontSize:'0.8em', color:GOLD }}>— Genesis 2:10</span>
          </blockquote>
          <p style={{ fontSize:15, color:MUTED, lineHeight:1.8, maxWidth:540, margin:'0 auto 40px' }}>
            Just as four rivers flowed from the Garden of Eden to water the whole earth,
            Z2B gives every builder four income rivers that flow simultaneously —
            watering your financial garden day and night.
          </p>

          {/* 4 River badges */}
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {RIVERS.map(r => (
              <a key={r.num} href={`#river${r.num}`}
                style={{ padding:'10px 18px', borderRadius:10, border:`1px solid ${r.color}40`, background:`${r.color}10`, color:r.color, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                <span>{r.icon}</span>
                <span>{r.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── ILLUSTRATION ── */}
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 20px 32px', textAlign:'center' }}>
          <img
            src="/income-rivers-illustration.svg"
            alt="The 4 Income Rivers — Garden of Eden"
            style={{ width:'100%', maxWidth:900, borderRadius:16, border:'1px solid rgba(212,175,55,0.2)', display:'block', margin:'0 auto' }}
          />
        </div>

      {/* ── RIVERS ── */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 20px 80px' }}>

        {RIVERS.map((river, ri) => (
          <div key={river.num} id={`river${river.num}`} className="river-card"
            style={{ marginBottom:32, borderRadius:20, border:`1px solid ${river.color}25`, background:SURF, overflow:'hidden', boxShadow:`0 0 40px ${river.color}08` }}>

            {/* River header */}
            <div style={{ padding:'32px 28px 24px', background:`linear-gradient(135deg,${river.color}12,transparent)`, borderBottom:`1px solid ${river.color}20`, position:'relative' }}>
              {/* Top accent */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${river.color},${river.color}80,transparent)` }} />

              <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:`${river.color}18`, border:`2px solid ${river.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                  {river.icon}
                </div>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontFamily:'Lato,sans-serif', fontSize:9, letterSpacing:5, textTransform:'uppercase', color:`${river.color}80`, marginBottom:4 }}>
                    River {river.num} — {river.name}
                  </div>
                  <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:W, marginBottom:4, lineHeight:1.2 }}>
                    {river.title}
                  </h2>
                  <div style={{ fontSize:13, color:river.color, fontStyle:'italic', marginBottom:12 }}>{river.sub}</div>
                  <div style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontStyle:'italic', fontSize:13, color:`${W}50`, lineHeight:1.7, marginBottom:14 }}>
                    {river.verse}
                  </div>
                  <p style={{ fontSize:14, color:`${W}80`, lineHeight:1.8 }}>{river.desc}</p>
                </div>
              </div>
            </div>

            <div style={{ padding:'24px 28px' }}>

              {/* River 1 — 4M Machine gears */}
              {river.gears && (
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:14 }}>The 4 Machine Modes</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
                    {river.gears.map(g => (
                      <div key={g.label} style={{ padding:'14px 16px', borderRadius:12, background:`${river.color}08`, border:`1px solid ${river.color}20` }}>
                        <div style={{ fontSize:22, marginBottom:8 }}>{g.icon}</div>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, fontWeight:900, color:river.color, marginBottom:3 }}>{g.label}</div>
                        <div style={{ fontSize:11, color:MUTED, marginBottom:2 }}>{g.tier}</div>
                        <div style={{ fontSize:11, color:`${W}60` }}>{g.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* River 3 — 9 Streams */}
              {river.streams && (
                <div>
                  <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:14 }}>9 Compensation Streams</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {river.streams.map((s, si) => (
                      <div key={s.name}>
                        <div className="stream-row"
                          onClick={() => setOpenStream(openStream === si ? null : si)}
                          style={{ padding:'12px 16px', borderRadius:10, background: openStream===si ? `${s.color}10` : 'rgba(255,255,255,0.02)', border:`1px solid ${openStream===si ? s.color+'30' : 'rgba(255,255,255,0.06)'}`, display:'flex', alignItems:'center', gap:14 }}>
                          <span style={{ fontSize:20, flexShrink:0 }}>{s.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                              <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, fontWeight:900, color:s.color }}>{s.name}</span>
                              <span style={{ fontSize:12, color:`${W}70` }}>{s.full}</span>
                              {s.bfm && (
                                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:10, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', color:'#FCA5A5', letterSpacing:1 }}>
                                  ⛽ BFM REQUIRED
                                </span>
                              )}
                              {!s.bfm && (
                                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:10, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', color:'#6EE7B7', letterSpacing:1 }}>
                                  ✓ NO BFM
                                </span>
                              )}
                            </div>
                          </div>
                          <span style={{ color:MUTED, fontSize:12, flexShrink:0 }}>{openStream===si ? '▲' : '▼'}</span>
                        </div>
                        {openStream === si && (
                          <div style={{ padding:'14px 16px', background:`${s.color}06`, border:`1px solid ${s.color}20`, borderTop:'none', borderRadius:'0 0 10px 10px', fontSize:13, color:`${W}80`, lineHeight:1.8 }}>
                            {s.detail}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* River 4 — PWA levels */}
              {river.pwaLevels && (
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:14 }}>PWA Tiers</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10, marginBottom:24 }}>
                    {river.pwaLevels.map(p => (
                      <div key={p.tier} style={{ padding:'16px', borderRadius:12, background:`${river.color}08`, border:`1px solid ${river.color}20` }}>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:river.color, marginBottom:4 }}>{p.tier}</div>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:8 }}>{p.count}</div>
                        <div style={{ fontSize:11, color:MUTED, lineHeight:1.6 }}>{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items list (Rivers 1, 2, 4) */}
              {river.items && (
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {river.items.map(item => (
                    <div key={item.label} className="item-row"
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.02)', gap:16, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, color:MUTED, flexShrink:0, minWidth:120 }}>{item.label}</span>
                      <span style={{ fontSize:12, color:`${W}cc`, textAlign:'right', flex:1 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ── BFM SECTION ── */}
        <div style={{ borderRadius:20, border:`1px solid ${GOLD}25`, background:SURF, overflow:'hidden', marginBottom:32 }}>
          <div style={{ height:3, background:`linear-gradient(90deg,${R1},${R2},${R3},${R4})` }} />
          <div style={{ padding:'32px 28px' }}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:4, textTransform:'uppercase', marginBottom:8 }}>What Fuels the Rivers</div>
            <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:W, marginBottom:8 }}>
              ⛽ Business Fuel Maintenance
            </h2>
            <p style={{ fontSize:14, color:`${W}70`, lineHeight:1.8, marginBottom:24, maxWidth:640 }}>
              The 4M Machine runs on the Vehicle and Gear system — Manual, Automatic, Electric and Rocket.
              Every vehicle needs fuel. <strong style={{ color:GOLD }}>BFM is your monthly Business Fuel</strong> — what others call "credits,"
              we call fuel because the 4M Machine is a vehicle, not a chatbot.
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:24 }}>
              {BFM_TIERS.map(t => (
                <div key={t.tier} style={{ padding:'14px', borderRadius:12, background:`${GOLD}08`, border:`1px solid ${GOLD}20`, textAlign:'center' }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:12, color:MUTED, marginBottom:6 }}>{t.tier}</div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:GOLD }}>{t.amount}</div>
                  <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>per month · day 61+</div>
                </div>
              ))}
            </div>

            <div style={{ padding:'20px 24px', borderRadius:14, background:`${GOLD}06`, border:`1px solid ${GOLD}20` }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:GOLD, marginBottom:12 }}>⚡ The Grace Rule</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                {[
                  { label:'Every tier upgrade',    value:'60-day fuel grace activates'              },
                  { label:'Day 1–60',              value:'No BFM charged'                           },
                  { label:'Day 61+',               value:'BFM activates at new tier rate'           },
                  { label:'Upgrade again',         value:'New 60-day grace restarts'                },
                ].map(g => (
                  <div key={g.label} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={{ fontSize:11, color:MUTED }}>{g.label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:W }}>{g.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ padding:'16px', borderRadius:12, background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize:11, color:'#6EE7B7', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Without BFM — Always Yours</div>
                {['NSB','ISP','QPB','CEO Competition','Marketplace Income','Distribution Rights'].map(s => (
                  <div key={s} style={{ fontSize:12, color:`${W}80`, padding:'4px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>✓ {s}</div>
                ))}
              </div>
              <div style={{ padding:'16px', borderRadius:12, background:`${GOLD}06`, border:`1px solid ${GOLD}25` }}>
                <div style={{ fontSize:11, color:GOLD, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>With BFM (active or grace)</div>
                {['TSC — Team Sales Commission','TLI — Team Leadership Incentive','CEO Awards'].map(s => (
                  <div key={s} style={{ fontSize:12, color:`${W}80`, padding:'4px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>⛽ {s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SHARE SECTION ── */}
        <div style={{ borderRadius:16, border:`1px solid ${GOLD}25`, background:SURF, overflow:'hidden', marginBottom:32 }}>
          <div style={{ height:3, background:`linear-gradient(90deg,${R1},${R2},${R3},${R4})` }} />
          <div style={{ padding:'28px' }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:8 }}>
              🔗 Share This Page
            </div>
            <div style={{ fontSize:13, color:MUTED, marginBottom:20, lineHeight:1.7 }}>
              Share the 4 Income Rivers with your prospects. Your referral code is automatically embedded — anyone who joins through your link credits you.
            </div>
            {/* Link display */}
            <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${GOLD}20`, fontSize:12, color:MUTED, marginBottom:14, wordBreak:'break-all' }}>
              {typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/income-rivers{refCode ? `?ref=${refCode}` : ''}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {/* WhatsApp */}
              
                href={'https://wa.me/?text=' + encodeURIComponent('4 Income Rivers — Zero2Billionaires\n\nRiver 1: 4M Machine\nRiver 2: Affiliate Marketing\nRiver 3: Compensation Plan\nRiver 4: Builder PWA Store\n\nhttps://app.z2blegacybuilders.co.za/income-rivers' + (refCode ? '?ref=' + refCode : ''))}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:10, background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.3)', color:'#25D166', textDecoration:'none', fontSize:13, fontWeight:700, fontFamily:'Cinzel,Georgia,serif' }}>
                {'💬 WhatsApp'}
              </a>
              {/* Copy Link */}
              <button
                onClick={() => {
                  const link = (typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za') + '/income-rivers' + (refCode ? `?ref=${refCode}` : '')
                  navigator.clipboard.writeText(link)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2500)
                }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:10, background:`${GOLD}10`, border:`1px solid ${GOLD}30`, color: copied ? '#10B981' : GOLD, fontSize:13, fontWeight:700, fontFamily:'Cinzel,Georgia,serif', cursor:'pointer' }}>
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
            </div>
            {!refCode && (
              <div style={{ marginTop:12, fontSize:11, color:MUTED, textAlign:'center', fontStyle:'italic' }}>
                Log in to embed your referral code and earn commissions from this page →{' '}
                <a href="/login" style={{ color:GOLD, textDecoration:'none' }}>Sign in</a>
              </div>
            )}
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ textAlign:'center', padding:'48px 24px', borderRadius:20, background:`linear-gradient(135deg,rgba(212,175,55,0.08),rgba(45,27,105,0.2))`, border:`1px solid ${GOLD}25`, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            {[R1,R2,R3,R4].map((c,i) => (
              <div key={i} style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:`${c}08`, left:`${10+i*22}%`, top:'50%', transform:'translateY(-50%)', filter:'blur(40px)' }} />
            ))}
          </div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontStyle:'italic', fontSize:'clamp(14px,2vw,18px)', color:`${W}60`, marginBottom:16, lineHeight:1.8 }}>
              "If they underpay you or don't want to employ you —
            </div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(20px,4vw,36px)', fontWeight:900, color:W, marginBottom:8 }}>
              Deploy Yourself.
            </div>
            <div style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontStyle:'italic', fontSize:'clamp(14px,2vw,18px)', color:`${W}60`, marginBottom:32 }}>
              4 Income Rivers. 9 Compensation Streams. One Kingdom Platform."
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/register"
                style={{ padding:'14px 32px', borderRadius:12, background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:BG, fontWeight:900, fontSize:15, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 8px 28px ${GOLD}30` }}>
                Open Your Rivers →
              </Link>
              <Link href="/compensation"
                style={{ padding:'14px 24px', borderRadius:12, border:`1px solid ${GOLD}30`, color:GOLD, fontSize:14, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                Full Comp Plan →
              </Link>
            </div>
            <div style={{ marginTop:16, fontSize:11, color:MUTED }}>
              Zero2Billionaires Legacy Builders · app.z2blegacybuilders.co.za
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
