'use client'
// FILE: app/invite/page.tsx
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const BG   = '#0D0820'
const PURP = '#4C1D95'
const GOLD = '#D4AF37'
const W    = '#F0EEF8'

// ── DATA ─────────────────────────────────────────────────────────────────────

const FOUR_M = [
  { m:'📱', t:'Mobile', d:'Everything runs from your smartphone. No office. No laptop required. Your phone is your business headquarters.' },
  { m:'💰', t:'Money', d:'Real income streams — from your first R200 NSB to R3.5M quarterly TLI bonuses. Every level is designed to pay.' },
  { m:'🔧', t:'Making', d:'AI tools that DO the work with you — generating offers, finding customers, writing pitches, closing sales.' },
  { m:'⚙️', t:'Machine', d:'A system that works even when you sleep. Digital Twins handle enquiries. Funnels run automatically. Teams duplicate.' },
]

const VEHICLES = [
  {
    icon:'🚗', name:'Manual Power', color:'#A78BFA',
    tiers:[
      { name:'Free', price:'R0', features:'Offer Generator · Customer Finder · Post Generator · Basic Coach Manlaw' },
      { name:'Starter Pack', price:'R500 once-off', features:'All Free + Reply System · Closing Assistant · Daily Engine · Referral Booster · BFM: R850/month (after 60 days)' },
      { name:'Bronze', price:'R2,500 once-off', features:'All Starter + 2-Product Engine · G2–G3 Team Commission · ISP 18% · BFM: R1,050/month' },
      { name:'Copper', price:'R5,000 once-off', features:'All Bronze + 5-Product Engine · Self-Discovery · G2–G4 Team Commission · ISP 22% · BFM: R1,300/month' },
    ],
  },
  {
    icon:'⚙️', name:'Automatic Power', color:'#38BDF8',
    tiers:[
      { name:'Silver', price:'R12,000 once-off', features:'All Copper + 7-Product Engine · Digital Twin (1) · Sales Funnel · Niche Blueprint · G2–G6 TSC · ISP 25% · TLI eligible · BFM: R2,000/month' },
    ],
  },
  {
    icon:'⚡', name:'Electric Power', color:GOLD,
    tiers:[
      { name:'Gold', price:'R24,000 once-off', features:'All Silver + Digital Twin (5 per PWA) · G2–G8 TSC · ISP 28% · Higher TLI · BFM: R3,200/month' },
      { name:'Platinum', price:'R50,000 once-off', features:'All Gold + Digital Twin (7) · Distribution License · G2–G10 TSC · ISP 30% · CEO Competition eligible · BFM: R5,800/month' },
    ],
  },
]

const AI_ENGINES = [
  {
    icon:'🤖', name:'Coach Manlaw',
    short:'Your AI execution coach — 24/7',
    detail:'Coach Manlaw is The Executor. Ask anything about your business and get 3–5 numbered action steps in South African context. Never vague motivation — always specific execution. Ends every response with YOUR NEXT ACTION.',
  },
  {
    icon:'🧠', name:'Offer Generator',
    short:'Turn your skill into a sellable product',
    detail:'Describe what you are good at — Coach Manlaw generates a complete offer: product name, price in ZAR, one-line pitch, and the exact WhatsApp message to send your first customer. From skill to product in 60 seconds.',
  },
  {
    icon:'📲', name:'Customer Finder',
    short:'Find your first 10 buyers',
    detail:'Tell it your product and location — it identifies exactly who your ideal customer is, where to find them (Facebook groups, WhatsApp communities, churches, taxi ranks etc.) and writes the opening message to send them.',
  },
  {
    icon:'✍️', name:'Post Generator',
    short:'Content that attracts buyers',
    detail:'Generate WhatsApp Status posts, Facebook posts and Instagram captions that attract paying customers. Includes hooks, value statements and clear calls to action. Optimised for the South African audience.',
  },
  {
    icon:'🔍', name:'Self-Discovery Engine',
    short:'Your income identity revealed',
    detail:'5 guided questions → your personal Income Blueprint: your Income Identity, #1 income path, your first product with price, your ideal customer profile, and the one action to take in the next 2 hours. Copper+ tier.',
  },
  {
    icon:'📦', name:'Product Engine',
    short:'One idea → multiple products',
    detail:'Enter one skill or idea → AI generates up to 7 distinct sellable digital products (eBook, mini-course, template, coaching, service, membership, audio training) with ZAR prices and pitches. Bronze = 2 products. Copper = 5. Silver+ = 7.',
  },
  {
    icon:'🎭', name:'Digital Twin',
    short:'Your AI business clone',
    detail:'Your Digital Twin handles WhatsApp enquiries, sends follow-ups, overcomes objections and qualifies leads — all in your exact voice and style. Runs 24/7 so you earn while you sleep. Silver = 1 Twin. Gold = 5. Platinum = 7.',
  },
]

const INCOME_STREAMS = [
  {
    icon:'🎯', name:'NSB', full:'New Sale Bonus',
    color:'#6EE7B7',
    short:'R100 + ISP% on personal Starter Pack sales — you only, not team',
    detail:`NSB is a once-off bonus paid when you introduce a Builder who purchases ANY tier vehicle. Your NSB amount depends on YOUR tier level AND the tier they purchased.

STARTER PACK SALES (R500):
Your tier → NSB earned
Free/Starter → R100 + 10% of R500 = R150
Bronze       → R100 + 18% of R500 = R190
Copper       → R100 + 22% of R500 = R210
Silver       → R100 + 25% of R500 = R225
Gold         → R100 + 28% of R500 = R240
Platinum     → R100 + 30% of R500 = R250

BRONZE+ SALES (no R200 flat — just your ISP %):
Free/Starter → 10% of tier price
Bronze       → 18% of tier price
Copper       → 22% of tier price
Silver       → 25% of tier price
Gold         → 28% of tier price
Platinum     → 30% of tier price

Example: You are Bronze. Your builder buys Silver (R12,000) → you earn 18% = R2,160 NSB.
Example: You are Copper. Your builder buys Starter (R500) → R100 + 22% of R500 = R210 NSB.

Note: Tier vehicle price is once-off. NSB is also once-off per new purchase.`,
  },
  {
    icon:'💰', name:'ISP', full:'Individual Sales Profit',
    color:'#A78BFA',
    short:'ISP% on BFM payments AND on Bronze+ tier upgrades (personal + team)',
    detail:`ISP is your monthly recurring income earned on BFM (Builder Monthly Fee) payments from your personally introduced Builders. BFM activates 60 days after each tier purchase or upgrade.

ISP Rates by YOUR tier:
• Free/Starter: 10% of BFM paid
• Bronze:       18%
• Copper:       22%
• Silver:       25%
• Gold:         28%
• Platinum:     30%

BFM amounts by builder tier:
• Starter:  R850/month
• Bronze:   R1,050/month
• Copper:   R1,300/month
• Silver:   R2,000/month
• Gold:     R3,200/month
• Platinum: R5,800/month

Example: You are Copper (22%). Your Silver Builder pays R2,000 BFM → you earn R440/month ISP.
This is MONTHLY and RECURRING — it grows as your team grows.`,
  },
  {
    icon:'⭐', name:'QPB', full:'Quick Performance Bonus',
    color:'#FCD34D',
    short:'+7.5% on ALL earnings in your first 90 days only',
    detail:`QPB is a launch bonus for new Builders — designed to reward fast starters.

ELIGIBILITY: Only in your FIRST 90 DAYS from registration (whether you registered as Free or Starter).

BONUS: +7.5% on top of ALL your NSB and ISP earnings during this 90-day window.

Example: You earn R2,000 NSB in week 3 → QPB adds R150 = R2,150 total.
Example: You earn R500 ISP in month 2 → QPB adds R37.50 = R537.50 total.

EXPIRES: Automatically after 90 days from your registration date. No extensions.

This rewards Builders who hit the ground running. Your first 90 days matter most.`,
  },
  {
    icon:'🔗', name:'TSC', full:'Team Sales Commission',
    color:'#38BDF8',
    short:'Earn across up to 10 generations of your team',
    detail:`TSC pays you a percentage on sales made by your downline team — not just your personal sales.

Generations accessible by tier:
• Starter: 0 (personal sales only)
• Bronze: G2–G3
• Copper: G2–G4
• Silver: G2–G6
• Gold: G2–G8
• Platinum: G2–G10

This is how team income scales exponentially as your network grows.`,
  },
  {
    icon:'🏆', name:'TLI', full:'Team Leadership Income',
    color:GOLD,
    short:'Once-off rank achievement bonuses from R3,000 to R3.5M',
    detail:`TLI is a leadership achievement bonus paid ONCE when a Builder first qualifies for each rank level. Evaluations happen quarterly — but the payment is made once per rank, not every quarter.

Silver tier and above only. Requires full BFM compliance at time of evaluation.

10 Rank Levels (paid ONCE on first achievement):
L1  Table Starter        R3,000
L2  Table Builder        R8,000
L3  Team Activator       R20,000
L4  Legacy Builder       R45,000
L5  Income Architect     R90,000
L6  Wealth Multiplier    R180,000
L7  Empire Maker         R380,000
L8  Dynasty Leader       R750,000
L9  Kingdom Architect    R1,500,000
L10 Z2B Billionaire Table R3,500,000

Total potential across all 10 levels: R6,475,000`,
  },
  {
    icon:'🏅', name:'CEO Competition', full:'CEO Competition Income',
    color:'#F472B6',
    short:'Compete in structured challenges with cash prizes',
    detail:`CEO Competitions are structured challenges run by Z2B with specific rules, targets and qualification criteria. These are time-bound competitions announced by the CEO.

Format: Various — team building races, sales sprints, recruitment targets
Prizes: Cash, trips, recognition, tier upgrades
Eligibility: Varies per competition — some open to all, some tier-restricted
Frequency: Announced by CEO — not permanent`,
  },
  {
    icon:'👑', name:'CEO Awards', full:'CEO Special Achievement Awards',
    color:'#E879F9',
    short:'Special recognition for extraordinary team building',
    detail:`CEO Awards are discretionary awards given by the CEO for extraordinary team building achievements, community impact, or outstanding leadership demonstrated over time.

Unlike CEO Competition (rules-based), CEO Awards are given at the CEO's discretion for:
• Exceptional community development
• Outstanding mentorship
• Significant team culture building
• Milestone achievements

These are special, meaningful recognitions — not guaranteed.`,
  },
]

// ── HOVER CARD ────────────────────────────────────────────────────────────────
function HoverCard({ children, detail }: { children: React.ReactNode, detail: string }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position:'relative' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(!show)}>
      {children}
      {show && (
        <div style={{
          position:'absolute', top:'105%', left:0, right:0, zIndex:100,
          background:'linear-gradient(160deg,#1E1245,#0D0820)',
          border:`1px solid ${GOLD}50`,
          borderRadius:'14px', padding:'16px',
          fontSize:'12px', color:'rgba(255,255,255,0.85)',
          lineHeight:1.8, whiteSpace:'pre-line' as const,
          boxShadow:'0 20px 60px rgba(0,0,0,0.8)',
          minWidth:'280px',
        }}>
          {detail}
        </div>
      )}
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
function InviteInner() {
  const params  = useSearchParams()
  const ref     = params.get('ref') || 'REVMOK2B'
  const [sponsor, setSponsor] = useState('')

  useEffect(() => {
    fetch(`/api/sponsor?ref=${encodeURIComponent(ref)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setSponsor(d.name) })
      .catch(() => {})
  }, [ref])

  const landingUrl    = `/ai-income/landing?ref=${ref}`
  const choosePlanUrl = `/ai-income/choose-plan?ref=${ref}`

  const card = {
    background:'rgba(255,255,255,0.03)',
    border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:'16px', padding:'18px',
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* ── HERO ── */}
      <div style={{ background:`linear-gradient(160deg,${PURP},#1E1245,${BG})`, padding:'48px 20px 40px', textAlign:'center' }}>
        <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'3px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase' as const, marginBottom:'12px' }}>
          Zero2Billionaires · 4M Machine
        </div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,6vw,38px)', fontWeight:900, color:W, margin:'0 0 8px', lineHeight:1.2 }}>
          The <span style={{ color:GOLD }}>4M Machine</span>
        </h1>
        <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.7)', marginBottom:'12px' }}>
          Mobile · Money · Making · Machine
        </div>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', maxWidth:'460px', margin:'0 auto 20px', lineHeight:1.8 }}>
          Your smartphone becomes a full income-generating business — powered by AI, digital products and a 7-stream compensation plan.
        </p>
        {sponsor && (
          <div style={{ display:'inline-block', padding:'7px 18px', background:`rgba(212,175,55,0.1)`, border:`1px solid ${GOLD}40`, borderRadius:'20px', fontSize:'12px', color:GOLD, marginBottom:'16px' }}>
            🤝 Invited by <strong>{sponsor}</strong>
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', alignItems:'center' }}>
          <Link href={landingUrl} style={{ display:'inline-block', padding:'15px 36px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'14px', color:'#1E1245', fontWeight:900, fontSize:'15px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            🚀 Start My 4M Machine — Free →
          </Link>
          <Link href={choosePlanUrl} style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', textDecoration:'underline' }}>
            Already know your tier? Choose a plan →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:'560px', margin:'0 auto', padding:'32px 16px 60px' }}>

        {/* ── 4M FRAMEWORK ── */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase' as const, marginBottom:'6px' }}>The Framework</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, margin:'0 0 14px' }}>The 4M — What Each Letter Means</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {FOUR_M.map(item => (
              <div key={item.t} style={{ ...card, textAlign:'center' as const }}>
                <div style={{ fontSize:'26px', marginBottom:'6px' }}>{item.m}</div>
                <div style={{ fontSize:'15px', fontWeight:900, color:GOLD, marginBottom:'4px', fontFamily:'Cinzel,Georgia,serif' }}>{item.t}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', lineHeight:1.7 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3 VEHICLES ── */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase' as const, marginBottom:'6px' }}>Your Vehicle</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, margin:'0 0 14px' }}>3 Power Levels — You Choose Your Speed</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {VEHICLES.map(v => (
              <div key={v.name} style={{ ...card, border:`1px solid ${v.color}30` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                  <span style={{ fontSize:'26px' }}>{v.icon}</span>
                  <div style={{ fontSize:'15px', fontWeight:900, color:v.color, fontFamily:'Cinzel,Georgia,serif' }}>{v.name}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {v.tiers.map(t => (
                    <div key={t.name} style={{ background:`${v.color}08`, border:`1px solid ${v.color}20`, borderRadius:'10px', padding:'10px 12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                        <span style={{ fontSize:'13px', fontWeight:700, color:W }}>{t.name}</span>
                        <span style={{ fontSize:'12px', fontWeight:700, color:v.color }}>{t.price}</span>
                      </div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>{t.features}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7 AI ENGINES (hover) ── */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase' as const, marginBottom:'6px' }}>AI Tools</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, margin:'0 0 6px' }}>7 AI Engines In Your Pocket</h2>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>👆 Tap/hover any engine to see what it does</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {AI_ENGINES.map(e => (
              <HoverCard key={e.name} detail={e.detail}>
                <div style={{ ...card, display:'flex', gap:'12px', alignItems:'center', cursor:'pointer' }}>
                  <span style={{ fontSize:'22px', flexShrink:0 }}>{e.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'13px', fontWeight:700, color:W }}>{e.name}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>{e.short}</div>
                  </div>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>ℹ️</span>
                </div>
              </HoverCard>
            ))}
          </div>
        </div>

        {/* ── 7 INCOME STREAMS (hover) ── */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase' as const, marginBottom:'6px' }}>Compensation</div>
          <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, margin:'0 0 6px' }}>7 Income Streams</h2>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>👆 Tap/hover any stream to see full details</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {INCOME_STREAMS.map(s => (
              <HoverCard key={s.name} detail={s.detail}>
                <div style={{ ...card, display:'flex', gap:'12px', alignItems:'center', cursor:'pointer', border:`1px solid ${s.color}25` }}>
                  <span style={{ fontSize:'22px', flexShrink:0 }}>{s.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:'8px', alignItems:'baseline' }}>
                      <span style={{ fontSize:'14px', fontWeight:900, color:s.color }}>{s.name}</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{s.full}</span>
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', marginTop:'2px' }}>{s.short}</div>
                  </div>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>ℹ️</span>
                </div>
              </HoverCard>
            ))}
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ textAlign:'center' as const, background:`linear-gradient(135deg,rgba(76,29,149,0.3),rgba(212,175,55,0.08))`, border:`2px solid ${GOLD}40`, borderRadius:'20px', padding:'28px 20px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'8px' }}>Ready to Deploy Yourself?</div>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginBottom:'20px', lineHeight:1.8 }}>
            Start free today. Upgrade when you're ready.<br/>7 AI engines + 7 income streams waiting for you.
          </p>
          <Link href={landingUrl}
            style={{ display:'inline-block', padding:'15px 36px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, borderRadius:'14px', color:'#1E1245', fontWeight:900, fontSize:'15px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            🚀 Start My 4M Machine →
          </Link>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'10px' }}>
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
