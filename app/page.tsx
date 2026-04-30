'use client'
// FILE: app/page.tsx — Z2B Homepage — AI Era Redesign

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

// ── AI Era Colors ─────────────────────────────────────────────────
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

type Profile = {
  user_role: string
  full_name: string
  referral_code: string
  is_paid_member: boolean
  paid_tier: string
}

function GridPattern({ color = CYAN, opacity = 0.05 }: { color?: string; opacity?: number }) {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', opacity }} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      {Array.from({length:20}).map((_,i) => <line key={`v${i}`} x1={i*42} y1="0" x2={i*42} y2="600" stroke={color} strokeWidth="0.6"/>)}
      {Array.from({length:16}).map((_,j) => <line key={`h${j}`} x1="0" y1={j*42} x2="800" y2={j*42} stroke={color} strokeWidth="0.6"/>)}
      {Array.from({length:8}).map((_,i) => Array.from({length:6}).map((_,j) => (
        <circle key={`d${i}${j}`} cx={i*100+50} cy={j*100+50} r="1.5" fill={color} />
      )))}
    </svg>
  )
}

export default function Home() {
  const [user,    setUser]    = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen,setMenuOpen]= useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles')
          .select('user_role, full_name, referral_code, is_paid_member, paid_tier')
          .eq('id', user.id).single()
        setProfile(data)
      }
    })
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] || ''
  const tier      = profile?.paid_tier || 'free'
  const TIER_LABEL: Record<string,string> = {
    free:'Free', starter:'Starter', bronze:'Bronze', copper:'Copper',
    silver:'Silver', gold:'Gold', platinum:'Platinum',
    silver_rocket:'Silver Rocket', gold_rocket:'Gold Rocket', platinum_rocket:'Platinum Rocket'
  }
  const TIER_COLOR: Record<string,string> = {
    free:MUTED, starter:GREEN, bronze:'#CD7F32', copper:'#B87333',
    silver:'#C0C0C0', gold:GOLD, platinum:CYAN,
    silver_rocket:'#C0C0C0', gold_rocket:GOLD, platinum_rocket:CYAN
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes glow  { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes slide { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        a { text-decoration:none; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:`${BG}EE`, backdropFilter:'blur(12px)', borderBottom:`1px solid ${BORDER}`, padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900,
          background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          Z2B Legacy Builders
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center' }}>
          {user ? (
            <>
              {profile && (
                <span style={{ fontSize:'11px', padding:'3px 10px', background:`${TIER_COLOR[tier]}15`, border:`1px solid ${TIER_COLOR[tier]}40`, borderRadius:'20px', color:TIER_COLOR[tier], fontWeight:700 }}>
                  {TIER_LABEL[tier]}
                </span>
              )}
              <Link href="/dashboard" style={{ padding:'8px 16px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'10px', color:W, fontSize:'12px', fontWeight:700 }}>
                Dashboard →
              </Link>
              <Link href="/ai-income" style={{ padding:'8px 16px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'10px', color:'#050A18', fontSize:'12px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif' }}>
                4M Machine
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding:'8px 14px', border:`1px solid ${BORDER}`, borderRadius:'10px', color:MUTED, fontSize:'12px', fontWeight:700 }}>
                Sign In
              </Link>
              <Link href="/register" style={{ padding:'8px 16px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'10px', color:'#050A18', fontSize:'12px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif' }}>
                Deploy Yourself →
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:'relative', overflow:'hidden', minHeight:'90vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <GridPattern />

        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'10%', left:'5%', width:'400px', height:'400px', background:`radial-gradient(circle,${BLUE}12 0%,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:'350px', height:'350px', background:`radial-gradient(circle,${VIO}10 0%,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'300px', background:`radial-gradient(ellipse,${GOLD}06 0%,transparent 70%)`, pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:'800px', padding:'40px 20px', animation:'slide 0.8s ease' }}>

          {/* Welcome badge for logged-in users */}
          {user && firstName && (
            <div style={{ display:'inline-block', marginBottom:'20px', padding:'6px 20px', background:`${GOLD}15`, border:`1px solid ${GOLD}40`, borderRadius:'30px', fontSize:'13px', color:GOLD, fontWeight:700 }}>
              ⚡ Welcome back, {firstName} — Builder
            </div>
          )}

          {/* Main slogan */}
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(28px,5vw,54px)', fontWeight:900, lineHeight:1.2, marginBottom:'24px' }}>
            <span style={{ color:W }}>If they underpay you</span>
            <br />
            <span style={{ color:W }}>and do not want to employ you,</span>
            <br />
            <span style={{
              background:`linear-gradient(135deg,${GOLD},${CYAN},${VIO2})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              display:'inline-block', animation:'glow 3s ease-in-out infinite'
            }}>
              deploy yourself.
            </span>
          </div>

          {/* Vision */}
          <p style={{ fontSize:'clamp(14px,2.5vw,18px)', color:MUTED, lineHeight:1.8, marginBottom:'32px', maxWidth:'600px', margin:'0 auto 32px' }}>
            AI-powered tools to build digital products, earn recurring income and transition from employment to entrepreneurship — <strong style={{ color:W }}>without quitting your job first.</strong>
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'40px' }}>
            {user ? (
              <>
                <Link href="/ai-income" style={{ padding:'14px 32px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', color:'#050A18', fontSize:'15px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 0 30px ${GOLD}40` }}>
                  ⚡ Open 4M Machine →
                </Link>
                <Link href="/marketplace" style={{ padding:'14px 28px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'14px', color:W, fontSize:'14px', fontWeight:700 }}>
                  🏪 Browse Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" style={{ padding:'14px 32px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', color:'#050A18', fontSize:'15px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 0 30px ${GOLD}40` }}>
                  🚀 Deploy Yourself — Free →
                </Link>
                <Link href="/marketplace" style={{ padding:'14px 28px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'14px', color:W, fontSize:'14px', fontWeight:700 }}>
                  🏪 Browse Marketplace
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:'32px', justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { icon:'⚡', val:'AI-Powered', label:'4M Machine' },
              { icon:'🌍', val:'Global',     label:'Marketplace' },
              { icon:'💰', val:'9',          label:'Income Streams' },
              { icon:'✦',  val:'20%',        label:'Affiliate Rate' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'12px', color:CYAN, marginBottom:'2px' }}>{s.icon}</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:GOLD }}>{s.val}</div>
                <div style={{ fontSize:'10px', color:MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4M MACHINE SECTION ── */}
      <section style={{ padding:'80px 20px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg,${BG} 0%,${SURF}50 50%,${BG} 100%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative', zIndex:1 }}>

          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>⚡ Your Deployment Engine</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,4vw,40px)', fontWeight:900, color:W, marginBottom:'12px' }}>
              The 4M Machine
            </div>
            <p style={{ fontSize:'15px', color:MUTED, maxWidth:'560px', margin:'0 auto', lineHeight:1.8 }}>
              Every builder starts at Manual and moves to Rocket. Each stage is a step in your deployment journey — not just a feature.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px' }}>
            {[
              { icon:'🚗', mode:'Manual',    color:VIO,   tier:'Free → Copper',
                headline:'Start with what you have.',
                body:'Your phone. Your contacts. Your story. Make your first income in 14 days without quitting your job.',
                promise:'First R500 in 14 days' },
              { icon:'⚙️', mode:'Automatic', color:BLUE,  tier:'Silver',
                headline:'Let the system work.',
                body:'AI automates your content, follow-ups and income tracking. Your income grows while you sleep.',
                promise:'7 automated income tools' },
              { icon:'⚡', mode:'Electric',  color:GOLD,  tier:'Gold → Platinum',
                headline:'Create once. Sell forever.',
                body:'AI builds your complete digital products. List them on the Z2B Marketplace. Sell to anyone, anywhere.',
                promise:'AI-created products in 90 seconds' },
              { icon:'🚀', mode:'Rocket',    color:CYAN,  tier:'Rocket Tiers',
                headline:'Your income needs no permission.',
                body:'AI creates in bulk. Marketplace distributes globally. Influencer partnerships multiply your reach.',
                promise:'Unlimited. Unstoppable.' },
            ].map(m => (
              <div key={m.mode} style={{ background:`linear-gradient(145deg,${SURF},${SURF2})`, border:`1px solid ${BORDER}`, borderRadius:'20px', padding:'24px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, right:0, width:'120px', height:'120px', background:`radial-gradient(circle,${m.color}12 0%,transparent 70%)`, pointerEvents:'none' }} />
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${m.color},transparent)` }} />

                <div style={{ fontSize:'36px', marginBottom:'12px', animation:'float 3s ease-in-out infinite' }}>{m.icon}</div>
                <div style={{ fontSize:'10px', color:m.color, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px' }}>{m.tier}</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'8px' }}>{m.mode} Mode</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:m.color, marginBottom:'8px' }}>{m.headline}</div>
                <div style={{ fontSize:'12px', color:MUTED, lineHeight:1.7, marginBottom:'14px' }}>{m.body}</div>
                <div style={{ fontSize:'11px', padding:'5px 12px', background:`${m.color}15`, border:`1px solid ${m.color}30`, borderRadius:'20px', color:m.color, display:'inline-block', fontWeight:700 }}>
                  ✦ {m.promise}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:'32px' }}>
            <Link href={user ? '/ai-income' : '/register'} style={{ display:'inline-block', padding:'14px 36px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', color:'#050A18', fontSize:'15px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 0 30px ${GOLD}30` }}>
              {user ? '⚡ Open My 4M Machine →' : '⚡ Start Your Deployment →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIGITAL PRODUCTS SECTION ── */}
      <section style={{ padding:'80px 20px', background:SURF }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center' }}>

            <div>
              <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>🌐 Z2B Marketplace</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,3.5vw,36px)', fontWeight:900, color:W, marginBottom:'16px', lineHeight:1.3 }}>
                Your knowledge is a product.<br/>
                <span style={{ background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  We help you sell it globally.
                </span>
              </div>
              <p style={{ fontSize:'14px', color:MUTED, lineHeight:1.8, marginBottom:'24px' }}>
                Coach Manlaw creates complete digital products from your skills — eBooks, courses, templates, toolkits and more. List them on the Z2B Marketplace. Earn 90% of every sale. Your upline earns nothing from your product sales — you keep what you make.
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
                {[
                  { icon:'📖', text:'eBooks, Guides, Courses, Templates, Toolkits — 20 formats' },
                  { icon:'🌍', text:'Sell globally — South Africa, Nigeria, UK, USA and beyond' },
                  { icon:'💰', text:'You keep 90% direct · 70% if affiliate drives the sale' },
                  { icon:'🤝', text:'Partner with influencers — they promote, you both earn' },
                  { icon:'✦',  text:'Affiliates earn 20% — anyone can promote your product' },
                ].map(item => (
                  <div key={item.text} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'16px', flexShrink:0 }}>{item.icon}</span>
                    <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', lineHeight:1.6 }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'10px' }}>
                <Link href="/marketplace" style={{ padding:'12px 24px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'12px', color:'#050A18', fontSize:'13px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif' }}>
                  🏪 Browse Marketplace
                </Link>
                <Link href={user ? '/ai-income' : '/register'} style={{ padding:'12px 20px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'12px', color:W, fontSize:'13px', fontWeight:700 }}>
                  Create a Product →
                </Link>
              </div>
            </div>

            {/* Product types visual */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                { icon:'📖', label:'eBook',         color:BLUE },
                { icon:'🎓', label:'Course',         color:VIO },
                { icon:'📋', label:'Template',       color:GOLD },
                { icon:'🧰', label:'Toolkit',        color:'#F97316' },
                { icon:'🎬', label:'Masterclass',    color:CYAN },
                { icon:'✅', label:'Checklist',      color:GREEN },
                { icon:'💻', label:'Interactive Tool',color:'#10B981' },
                { icon:'🃏', label:'Card Deck',      color:VIO2 },
              ].map(t => (
                <div key={t.label} style={{ background:`linear-gradient(135deg,${SURF2},${BG})`, border:`1px solid ${BORDER}`, borderRadius:'12px', padding:'14px', display:'flex', gap:'10px', alignItems:'center' }}>
                  <span style={{ fontSize:'20px' }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize:'12px', fontWeight:700, color:t.color }}>{t.label}</div>
                    <div style={{ fontSize:'10px', color:MUTED }}>AI-created</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION + MISSION ── */}
      <section style={{ padding:'80px 20px', position:'relative', overflow:'hidden' }}>
        <GridPattern color={VIO} opacity={0.04} />
        <div style={{ maxWidth:'900px', margin:'0 auto', position:'relative', zIndex:1 }}>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'48px' }}>
            <div style={{ background:`linear-gradient(145deg,${SURF},${SURF2})`, border:`1px solid ${BORDER}`, borderRadius:'20px', padding:'28px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, right:0, width:'100px', height:'100px', background:`radial-gradient(circle,${GOLD}15 0%,transparent 70%)` }} />
              <div style={{ fontSize:'11px', color:GOLD, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>👁️ Vision</div>
              <div style={{ fontSize:'15px', color:W, lineHeight:1.8, fontStyle:'italic' }}>
                "A world where every employee has the tools, knowledge and income streams to deploy themselves — on their own terms, in any market, on any continent."
              </div>
            </div>
            <div style={{ background:`linear-gradient(145deg,${SURF},${SURF2})`, border:`1px solid ${BORDER}`, borderRadius:'20px', padding:'28px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, right:0, width:'100px', height:'100px', background:`radial-gradient(circle,${CYAN}12 0%,transparent 70%)` }} />
              <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>🎯 Mission</div>
              <div style={{ fontSize:'15px', color:W, lineHeight:1.8, fontStyle:'italic' }}>
                "We equip ambitious employees with AI-powered tools to build digital products, earn recurring income and transition from employment to entrepreneurship — without quitting their job first."
              </div>
            </div>
          </div>

          {/* Values */}
          <div style={{ textAlign:'center', marginBottom:'24px' }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:W }}>Core Values</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { icon:'✦', val:'Prove before you promote', desc:'Every income claim on this platform must be earned, not invented', color:GOLD },
              { icon:'✝', val:'Kingdom business',          desc:'Faith, purpose and profit aligned — we build businesses that honour God and serve people', color:VIO2 },
              { icon:'→', val:'Deploy, do not wait',        desc:'The employee mindset waits for permission. The Builder mindset acts', color:CYAN },
              { icon:'◈', val:'Build in public',            desc:'Every commission rand is tracked. Every split is transparent', color:BLUE },
              { icon:'∞', val:'Every builder wins',         desc:'Your success is tied to those around you — 9 income streams, no ceiling', color:GREEN },
            ].map(v => (
              <div key={v.val} style={{ background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'12px', padding:'14px 18px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'18px', color:v.color, fontWeight:900, flexShrink:0, marginTop:'2px' }}>{v.icon}</span>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'2px' }}>{v.val}</div>
                  <div style={{ fontSize:'12px', color:MUTED }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INCOME STREAMS ── */}
      <section style={{ padding:'80px 20px', background:SURF }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>💰 9 Income Streams</div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,3.5vw,36px)', fontWeight:900, color:W, marginBottom:'12px' }}>
            One platform. Nine ways to earn.
          </div>
          <p style={{ fontSize:'14px', color:MUTED, marginBottom:'40px', lineHeight:1.8 }}>
            Most platforms give you one way to earn. Z2B gives you nine — stacked, recurring and growing.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'12px' }}>
            {[
              { n:'NSB',   l:'New Sale Bonus',          c:GREEN, d:'Every new member you bring in' },
              { n:'ISP',   l:'Individual Sales Profit',  c:BLUE,  d:'Monthly from your team — Bronze+' },
              { n:'QPB',   l:'Quick Performance Bonus',  c:VIO2,  d:'First 90 days accelerator' },
              { n:'TSC',   l:'Team Sales Commission',    c:GOLD,  d:'6 generations deep — Bronze+' },
              { n:'TLI',   l:'Team Leadership Income',   c:CYAN,  d:'10 levels — up to R3.5M' },
              { n:'CEO',   l:'CEO Competition',          c:'#F97316', d:'Quarterly challenge prizes' },
              { n:'Awards',l:'CEO Awards',               c:VIO,   d:'Discretionary excellence awards' },
              { n:'Market',l:'Marketplace Income',       c:GREEN, d:'90% of your digital product sales' },
              { n:'Distrib',l:'Distribution Rights',     c:GOLD,  d:'Platinum tier — build your sub-network' },
            ].map(s => (
              <div key={s.n} style={{ background:`linear-gradient(145deg,${SURF2},${BG})`, border:`1px solid ${BORDER}`, borderRadius:'14px', padding:'16px 12px' }}>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:s.c, marginBottom:'4px' }}>{s.n}</div>
                <div style={{ fontSize:'11px', fontWeight:700, color:W, marginBottom:'4px' }}>{s.l}</div>
                <div style={{ fontSize:'10px', color:MUTED, lineHeight:1.5 }}>{s.d}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'32px' }}>
            <Link href="/compensation" style={{ display:'inline-block', padding:'12px 28px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'12px', color:MUTED, fontSize:'13px', fontWeight:700 }}>
              View Full Compensation Plan →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:'100px 20px', position:'relative', overflow:'hidden', textAlign:'center' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at center,${GOLD}08 0%,transparent 70%)`, pointerEvents:'none' }} />
        <GridPattern color={GOLD} opacity={0.04} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'700px', margin:'0 auto' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(28px,5vw,52px)', fontWeight:900, lineHeight:1.2, marginBottom:'20px' }}>
            <span style={{ color:W }}>You do not need</span><br />
            <span style={{ color:W }}>their permission</span><br />
            <span style={{ background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              to build income.
            </span>
          </div>
          <p style={{ fontSize:'16px', color:MUTED, marginBottom:'12px', lineHeight:1.8 }}>
            You need the right tools.
          </p>
          <p style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', color:W, fontWeight:700, marginBottom:'36px' }}>
            We built them.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href={user ? '/ai-income' : '/register'} style={{ padding:'16px 40px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', color:'#050A18', fontSize:'16px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 0 40px ${GOLD}40` }}>
              {user ? '⚡ Open 4M Machine →' : '🚀 Deploy Yourself — Free →'}
            </Link>
            <Link href="/marketplace" style={{ padding:'16px 28px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'14px', color:W, fontSize:'15px', fontWeight:700 }}>
              🏪 Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${BORDER}`, padding:'32px 20px', background:SURF }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'24px', marginBottom:'24px' }}>
            <div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'10px' }}>Z2B Legacy Builders</div>
              <div style={{ fontSize:'12px', color:MUTED, lineHeight:1.8 }}>
                Transforming Employees to Entrepreneurs — Globally
              </div>
            </div>
            <div>
              <div style={{ fontSize:'12px', fontWeight:700, color:W, marginBottom:'10px' }}>Platform</div>
              {[['4M Machine','/ai-income'],['Marketplace','/marketplace'],['Compensation','/compensation'],['Coach Manlaw','/ai-income/coach']].map(([l,h])=>(
                <div key={l} style={{ marginBottom:'6px' }}><Link href={h} style={{ fontSize:'12px', color:MUTED }}>{l}</Link></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:'12px', fontWeight:700, color:W, marginBottom:'10px' }}>Builders</div>
              {[['Sign Up Free','/register'],['Sign In','/login'],['Dashboard','/dashboard'],['My Products','/marketplace/my-products']].map(([l,h])=>(
                <div key={l} style={{ marginBottom:'6px' }}><Link href={h} style={{ fontSize:'12px', color:MUTED }}>{l}</Link></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:'12px', fontWeight:700, color:W, marginBottom:'10px' }}>Earn</div>
              {[['Become Affiliate','/marketplace/become-affiliate'],['Influencer Engine','/influencer'],['List a Product','/marketplace/list'],['View Tiers','/ai-income/choose-plan']].map(([l,h])=>(
                <div key={l} style={{ marginBottom:'6px' }}><Link href={h} style={{ fontSize:'12px', color:MUTED }}>{l}</Link></div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:'20px', textAlign:'center', fontSize:'11px', color:MUTED }}>
            ⚡ Z2B Legacy Builders · "If they underpay you and do not want to employ you, deploy yourself." · Built with Kingdom Purpose
          </div>
        </div>
      </footer>

      <PWAInstallPrompt />
    </div>
  )
}
