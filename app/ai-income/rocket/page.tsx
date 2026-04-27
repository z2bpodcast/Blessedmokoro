'use client'
// FILE: app/ai-income/rocket/page.tsx
// 🚀 4M Rocket Mode — Coming Soon
// AI does everything. Builder just publishes.

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const PURP = '#4C1D95'
const W    = '#F0EEF8'
const ROCKET_COLOR = '#FF6B35'

// ── Tier config ───────────────────────────────────────────────────────────────
const TIER_RANK: Record<string,number> = {
  guest:0, free:0, starter:1, bronze:2, copper:3, silver:4, gold:5, platinum:6
}

const TIER_CONFIG: Record<string, {
  mode: 'preview' | 'create'
  painPoints: number
  products: number | 'unlimited'
  label: string
  markets: string
  features: string[]
}> = {
  free: {
    mode: 'preview', painPoints: 3, products: 0,
    label: 'Free Preview',
    markets: 'View only',
    features: ['See top 3 global pain points this week', 'Preview potential income estimates', 'Upgrade to unlock creation'],
  },
  starter: {
    mode: 'preview', painPoints: 8, products: 0,
    label: 'Starter Preview',
    markets: 'View only',
    features: ['See top 8 global pain points this week', 'Preview product concepts', 'See income estimates', 'Upgrade to Silver to create products'],
  },
  bronze: {
    mode: 'preview', painPoints: 12, products: 0,
    label: 'Bronze Preview',
    markets: 'View only',
    features: ['See top 12 global pain points this week', 'Preview full product briefs', 'See market research summaries', 'Upgrade to Silver to start publishing'],
  },
  copper: {
    mode: 'preview', painPoints: 20, products: 0,
    label: 'Copper Preview',
    markets: 'View only',
    features: ['See top 20 global pain points this week', 'Preview complete product blueprints', 'See demographic + geographic breakdown', 'Upgrade to Silver to publish'],
  },
  silver: {
    mode: 'create', painPoints: 20, products: 12,
    label: 'Silver Publisher',
    markets: 'SA + Africa + Global',
    features: [
      '12 products/month — AI creates everything',
      'SA · Africa · Global market scanner',
      'All product formats (PDF, guide, template, course outline, checklist, workbook, script, swipe file, planner, audio script, video script, eBook)',
      'Full launch kit per product',
      'Z2B Marketplace listing',
      'Weekly-refreshed market intelligence',
      'AI selects language for target market',
    ],
  },
  gold: {
    mode: 'create', painPoints: 20, products: 30,
    label: 'Gold Publisher',
    markets: 'Global + Demographic targeting + Live research',
    features: [
      '30 products/month — AI creates everything',
      'Global market scanner with demographic precision',
      'Live research mode for specific markets',
      'All product formats',
      'Full launch kit per product',
      'Sell on Z2B Marketplace + anywhere externally',
      'AI selects language for target market',
      'Buyer journey scripts per product',
    ],
  },
  platinum: {
    mode: 'create', painPoints: 20, products: 'unlimited',
    label: 'Platinum Publisher',
    markets: 'Unlimited — Full Rocket Mode',
    features: [
      'UNLIMITED products — no cap',
      'Bulk creation — create 10 products at once',
      'Own branded marketplace (your domain)',
      'Full global + live research + demographic targeting',
      'All product formats',
      'AI selects language for target market',
      'Buyer journey + seasonal alerts',
      'Resell rights on created products',
    ],
  },
}

// ── Sample pain points (preview data) ─────────────────────────────────────────
const SAMPLE_PAIN_POINTS = [
  { rank:1,  category:'Education',    title:'Grade 12 Maths Exam Prep',         market:'South Africa',  searches:'427K/mo', price:'R199',   gap:'HIGH',   income:'R800–R4,000' },
  { rank:2,  category:'Income',       title:'Side Income Ideas for Lagos',       market:'Nigeria',       searches:'312K/mo', price:'₦5,000', gap:'HIGH',   income:'₦12K–₦60K' },
  { rank:3,  category:'Career',       title:'UK Visa Application Guide',         market:'Global',        searches:'289K/mo', price:'£12',    gap:'HIGH',   income:'£200–£800' },
  { rank:4,  category:'Health',       title:'30-Day Budget Meal Plan SA',        market:'South Africa',  searches:'198K/mo', price:'R149',   gap:'MED',    income:'R500–R2,000' },
  { rank:5,  category:'Sports',       title:'Youth Football Coaching Manual',    market:'Africa',        searches:'176K/mo', price:'$15',    gap:'HIGH',   income:'$200–$900' },
  { rank:6,  category:'Business',     title:'Spaza Shop Profit System',         market:'South Africa',  searches:'165K/mo', price:'R299',   gap:'HIGH',   income:'R1,000–R5,000' },
  { rank:7,  category:'Faith',        title:'30-Day Prayer Journal',            market:'Global',        searches:'154K/mo', price:'$9',     gap:'MED',    income:'$150–$600' },
  { rank:8,  category:'Parenting',    title:'Teen Digital Safety Guide',        market:'Global',        searches:'143K/mo', price:'$12',    gap:'HIGH',   income:'$180–$700' },
  { rank:9,  category:'Finance',      title:'Stokvel Setup and Rules Kit',       market:'South Africa',  searches:'132K/mo', price:'R179',   gap:'HIGH',   income:'R600–R2,500' },
  { rank:10, category:'Sports',       title:'Fantasy EPL Strategy Guide',       market:'Global',        searches:'121K/mo', price:'£8',     gap:'MED',    income:'£120–£500' },
  { rank:11, category:'Legal',        title:'NSFAS Application Step-by-Step',   market:'South Africa',  searches:'118K/mo', price:'R99',    gap:'HIGH',   income:'R400–R1,800' },
  { rank:12, category:'Health',       title:'Diabetes Meal Plan (African Diet)', market:'Africa',        searches:'109K/mo', price:'$18',    gap:'HIGH',   income:'$250–$1,000' },
  { rank:13, category:'Income',       title:'AI Side Hustle Starter Kit',       market:'Global',        searches:'98K/mo',  price:'$24',    gap:'HIGH',   income:'$350–$1,500' },
  { rank:14, category:'Career',       title:'LinkedIn Profile Makeover Guide',  market:'Global',        searches:'94K/mo',  price:'$19',    gap:'MED',    income:'$250–$1,000' },
  { rank:15, category:'Sports',       title:'Home Workout 90-Day Plan',         market:'Global',        searches:'89K/mo',  price:'$14',    gap:'MED',    income:'$180–$750' },
  { rank:16, category:'Business',     title:'Hair Salon Starter Kit Kenya',     market:'Kenya',         searches:'84K/mo',  price:'KSh 800',gap:'HIGH',   income:'KSh 8K–40K' },
  { rank:17, category:'Education',    title:'IELTS Exam Preparation Guide',     market:'Global',        searches:'81K/mo',  price:'$22',    gap:'MED',    income:'$300–$1,200' },
  { rank:18, category:'Relationships','title':'Communication in Marriage Guide', market:'Global',        searches:'76K/mo',  price:'$16',    gap:'MED',    income:'$200–$800' },
  { rank:19, category:'Recreation',   title:'Camping Beginners Guide SA',       market:'South Africa',  searches:'71K/mo',  price:'R159',   gap:'HIGH',   income:'R500–R2,000' },
  { rank:20, category:'Finance',      title:'Debt-Free in 12 Months Plan',      market:'Global',        searches:'68K/mo',  price:'$21',    gap:'MED',    income:'$280–$1,100' },
]

const CAT_COLORS: Record<string,string> = {
  Education:'#A78BFA', Income:'#6EE7B7', Career:'#38BDF8',
  Health:'#F472B6', Sports:'#FF6B35', Business:GOLD,
  Faith:'#FCD34D', Parenting:'#C084FC', Finance:'#34D399',
  Legal:'#FB923C', Relationships:'#F9A8D4', Recreation:'#4ADE80',
}

function RocketInner() {
  const router = useRouter()
  const [builderTier, setBuilderTier] = useState('guest')
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [waitlisted, setWaitlisted] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: prof } = await supabase
          .from('profiles').select('paid_tier').eq('id', user.id).single()
        setBuilderTier(prof?.paid_tier || 'free')
      }
      setLoading(false)
    })
  }, [])

  const config = TIER_CONFIG[builderTier] || TIER_CONFIG['free']
  const isCreator = config.mode === 'create'
  const visiblePoints = SAMPLE_PAIN_POINTS.slice(0, config.painPoints)

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '16px',
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontFamily:'Georgia,serif' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/ai-income" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← 4M Machine</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize:'13px', color:ROCKET_COLOR, fontWeight:700 }}>🚀 Rocket Mode</span>
        <div style={{ marginLeft:'auto', padding:'3px 10px', background:`${ROCKET_COLOR}20`, border:`1px solid ${ROCKET_COLOR}40`, borderRadius:'20px', fontSize:'10px', fontWeight:700, color:ROCKET_COLOR, letterSpacing:'1px' }}>
          COMING SOON
        </div>
      </div>

      <div style={{ maxWidth:'560px', margin:'0 auto', padding:'24px 16px 60px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'56px', marginBottom:'12px' }}>🚀</div>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'26px', fontWeight:900, color:W, margin:'0 0 8px' }}>
            4M Rocket Mode
          </h1>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', lineHeight:1.8, margin:'0 0 8px' }}>
            AI does <strong style={{color:ROCKET_COLOR}}>everything.</strong> You just press <strong style={{color:ROCKET_COLOR}}>Publish.</strong>
          </p>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>
            No skill required. No writing. No research. No design.<br/>
            The AI scans the world for what people are paying to fix — then builds the complete product, prices it, packages it and hands it to you ready to sell.
          </p>
        </div>

        {/* Tier status banner */}
        <div style={{ background: isCreator ? `rgba(255,107,53,0.1)` : 'rgba(255,255,255,0.04)',
          border: `2px solid ${isCreator ? ROCKET_COLOR : 'rgba(255,255,255,0.1)'}`,
          borderRadius:'16px', padding:'16px', marginBottom:'24px', textAlign:'center' }}>
          {isCreator ? (
            <>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' }}>Your Access Level</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:ROCKET_COLOR, marginBottom:'4px' }}>
                {config.label}
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>{config.markets}</div>
              <div style={{ display:'inline-block', padding:'6px 20px', background:ROCKET_COLOR, borderRadius:'20px', fontSize:'12px', fontWeight:700, color:'#fff' }}>
                🚀 {config.products === 'unlimited' ? 'Unlimited' : config.products} Products/Month · Coming Soon
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' }}>Your Access Level</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:'rgba(255,255,255,0.7)', marginBottom:'4px' }}>
                {config.label} — View Only
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'12px' }}>
                Showing top {config.painPoints} pain points · Upgrade to Silver to start publishing
              </div>
              <Link href="/ai-income/choose-plan" style={{ display:'inline-block', padding:'8px 24px', background:`linear-gradient(135deg,${ROCKET_COLOR},#E55A2B)`, borderRadius:'20px', fontSize:'12px', fontWeight:700, color:'#fff', textDecoration:'none' }}>
                Upgrade to Publish →
              </Link>
            </>
          )}
        </div>

        {/* Your access features */}
        <div style={{ ...cardStyle, marginBottom:'24px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:ROCKET_COLOR, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>
            What you get with {config.label}
          </div>
          {config.features.map((f, i) => (
            <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'8px' }}>
              <span style={{ color: isCreator ? ROCKET_COLOR : 'rgba(255,255,255,0.3)', fontSize:'13px', flexShrink:0 }}>
                {isCreator ? '✓' : '○'}
              </span>
              <span style={{ fontSize:'12px', color: isCreator ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', lineHeight:1.6 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Live Pain Points Preview */}
        <div style={{ marginBottom:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'2px' }}>
                🔥 Market Intelligence Preview
              </div>
              <div style={{ fontSize:'15px', fontWeight:700, color:W }}>
                Top {config.painPoints} Pain Points This Week
              </div>
            </div>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', textAlign:'right' }}>
              Updated<br/>weekly
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {visiblePoints.map(p => (
              <div key={p.rank} style={{ ...cardStyle,
                opacity: isCreator ? 1 : 0.85,
                border: `1px solid ${CAT_COLORS[p.category] || GOLD}25`,
              }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:`${CAT_COLORS[p.category] || GOLD}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900, color:CAT_COLORS[p.category] || GOLD, flexShrink:0 }}>
                    {p.rank}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color:W, lineHeight:1.4 }}>{p.title}</div>
                      <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', background:`${CAT_COLORS[p.category] || GOLD}15`, borderRadius:'10px', color:CAT_COLORS[p.category] || GOLD, flexShrink:0, marginLeft:'8px' }}>
                        {p.category}
                      </span>
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', marginBottom:'8px' }}>
                      📍 {p.market}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'6px' }}>
                      {[
                        { label:'Searches', value:p.searches },
                        { label:'Avg Price', value:p.price },
                        { label:'Gap', value:p.gap, highlight: p.gap === 'HIGH' },
                        { label:'Est. Income', value:p.income },
                      ].map(stat => (
                        <div key={stat.label} style={{ textAlign:'center', background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'5px 3px' }}>
                          <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.35)', marginBottom:'2px' }}>{stat.label}</div>
                          <div style={{ fontSize:'11px', fontWeight:700, color: stat.highlight ? '#6EE7B7' : 'rgba(255,255,255,0.75)' }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {isCreator && (
                  <button
                    disabled
                    style={{ width:'100%', marginTop:'10px', padding:'8px', background:`rgba(255,107,53,0.15)`, border:`1px solid ${ROCKET_COLOR}40`, borderRadius:'8px', color:ROCKET_COLOR, fontSize:'12px', fontWeight:700, cursor:'not-allowed', opacity:0.7 }}>
                    🚀 Create This Product — Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Blurred preview for locked tiers */}
          {!isCreator && builderTier !== 'platinum' && (
            <div style={{ textAlign:'center', padding:'20px', background:'rgba(255,107,53,0.05)', border:'1px solid rgba(255,107,53,0.15)', borderRadius:'14px', marginTop:'8px' }}>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>
                🔒 {20 - config.painPoints} more pain points unlocked at Silver+
              </div>
              <Link href="/ai-income/choose-plan" style={{ fontSize:'12px', color:ROCKET_COLOR, textDecoration:'underline' }}>
                Upgrade to see all + start publishing →
              </Link>
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{ ...cardStyle, marginBottom:'24px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:ROCKET_COLOR, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
            🚀 How Rocket Mode Works
          </div>
          {[
            { step:'1', title:'Choose Your Market', desc:'Global, continent, country, city — any market on earth. AI adjusts research accordingly.' },
            { step:'2', title:'AI Scans the World', desc:'Market intelligence engine finds what people are searching and paying for right now.' },
            { step:'3', title:'Pick a Pain Point', desc:'Select from ranked opportunities — AI shows searches, price, gap and income estimates.' },
            { step:'4', title:'AI Creates Everything', desc:'Full expert-level product written. Multiple formats. SA/local context. Your language. 90 seconds.' },
            { step:'5', title:'AI Builds Your Launch Kit', desc:'WhatsApp messages, Facebook posts, TikTok scripts, objection handlers, buyer journey — all ready.' },
            { step:'6', title:'You Press Publish', desc:'List on Z2B Marketplace or sell externally (Gold+). You set the price. Z2B takes 5% only.' },
          ].map(item => (
            <div key={item.step} style={{ display:'flex', gap:'12px', marginBottom:'12px' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`${ROCKET_COLOR}20`, border:`1px solid ${ROCKET_COLOR}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:900, color:ROCKET_COLOR, flexShrink:0 }}>
                {item.step}
              </div>
              <div>
                <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'2px' }}>{item.title}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist */}
        {!waitlisted ? (
          <div style={{ background:`rgba(255,107,53,0.08)`, border:`2px solid ${ROCKET_COLOR}40`, borderRadius:'16px', padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'20px', marginBottom:'8px' }}>🔔</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W, marginBottom:'6px' }}>
              Be First to Launch
            </div>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginBottom:'14px', lineHeight:1.7 }}>
              Rocket Mode launches soon. Join the waitlist and get notified the moment it goes live — plus early access before the general release.
            </p>
            <div style={{ display:'flex', gap:'8px' }}>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                style={{ flex:1, padding:'10px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:W, fontSize:'13px', outline:'none', fontFamily:'Georgia,serif' }}
              />
              <button
                onClick={async () => {
                  if (!email.trim() || !email.includes('@')) return
                  await supabase.from('rocket_waitlist').insert({ email: email.trim(), tier: builderTier, created_at: new Date().toISOString() }).then(() => setWaitlisted(true))
                }}
                style={{ padding:'10px 16px', background:`linear-gradient(135deg,${ROCKET_COLOR},#E55A2B)`, border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', whiteSpace:'nowrap' }}>
                Notify Me →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'24px', background:'rgba(110,231,183,0.08)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'16px' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>✅</div>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#6EE7B7' }}>You are on the waitlist!</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginTop:'6px' }}>We will notify you the moment Rocket Mode launches.</div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function RocketModePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#FF6B35', fontFamily:'Georgia,serif', fontSize:'18px' }}>
        🚀 Loading Rocket Mode...
      </div>
    }>
      <RocketInner />
    </Suspense>
  )
}
