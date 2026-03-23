'use client'
// FILE: app/opportunity/page.tsx
// Z2B Table Banquet — Digital Presentation
// Full prospect presentation at /opportunity

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function OpportunityPage() {
  const [refCode, setRefCode] = useState('Z2BREF')
  const [activeIncome, setActiveIncome] = useState<number|null>(null)

  useEffect(() => {
    // Get ref from URL or logged-in user
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) { setRefCode(ref); return }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('referral_code').eq('id', user.id).single()
        .then(({ data }) => { if (data?.referral_code) setRefCode(data.referral_code) })
    })
  }, [])

  const signupUrl = `https://app.z2blegacybuilders.co.za/signup?ref=${refCode}`

  const INCOME_STREAMS = [
    {
      icon: '💰', name: 'ISP', full: 'Individual Sales Profit',
      rate: '18% – 30%', cycle: 'Monthly',
      color: '#D4AF37',
      desc: 'Earn on every personal upgrade through your referral link.',
      detail: 'Your rate grows with your tier — FAM 10% · Bronze 18% · Copper 22% · Silver 25% · Gold 28% · Platinum 30%',
    },
    {
      icon: '⚡', name: 'QPB', full: 'Quick Pathfinder Bonus',
      rate: '7.5% – 10%', cycle: 'Monthly',
      color: '#F59E0B',
      desc: 'Extra commission on top of ISP for consistent daily outreach.',
      detail: 'Standard: 7.5% per set of 4 (first 90 days) · Sales 5+: 10% · 🏅 Torch Bearer: 7.5%–10% on every sale — no time limit, no minimum',
    },
    {
      icon: '🌳', name: 'TSC', full: 'Table Structure Commission',
      rate: '1% – 10%', cycle: 'Monthly',
      color: '#10B981',
      desc: "Earn on your entire team's sales. Unlimited width. 10 generations deep. Includes all table performance bonuses.",
      detail: 'G2: 10% · G3: 5% · G4: 3% · G5: 2% · G6–G10: 1% each · Paid on every complete generation layer as your table grows and duplicates',
    },
    {
      icon: '🏅', name: 'CEO Competitions', full: 'CEO Competitions',
      rate: 'Variable', cycle: 'Quarterly',
      color: '#EF4444',
      desc: 'Performance contests for builders who hit specific targets.',
      detail: 'Targets and amounts personally announced by the CEO each quarter',
    },
    {
      icon: '👑', name: 'CEO Awards', full: 'CEO Awards',
      rate: 'Variable', cycle: 'Quarterly',
      color: '#D4AF37',
      desc: 'Special recognition for extraordinary legacy builders.',
      detail: 'Criteria and amounts announced by the CEO · Includes the 🌟 Founding 100 — lifetime profit sharing for builders who meet special qualifications set by the CEO',
    },
    {
      icon: '🏪', name: 'Marketplace', full: 'Marketplace Income',
      rate: '95%', cycle: 'Per Sale',
      color: '#0EA5E9',
      desc: 'Gold and Platinum builders can sell their own approved digital products and services on the Z2B Marketplace.',
      detail: 'Earn 95% of your asking price · Z2B sets the final retail price · Subject to CEO approval and Terms and Conditions · Gold and Platinum tier only',
    },
  ]

  const TIERS = [
    { name:'FAM',      price:'Free',    isp:'10%', emoji:'🌱', color:'#6B7280',  sessions:'9 free' },
    { name:'Bronze',   price:'R480',    isp:'18%', emoji:'🥉', color:'#CD7F32',  sessions:'All 99' },
    { name:'Copper',   price:'R1,200',  isp:'22%', emoji:'🪙', color:'#B87333',  sessions:'All 99' },
    { name:'Silver',   price:'R2,500',  isp:'25%', emoji:'🥈', color:'#C0C0C0',  sessions:'All 99' },
    { name:'Gold',     price:'R5,000',  isp:'28%', emoji:'🥇', color:'#D4AF37',  sessions:'All 99' },
    { name:'Platinum', price:'R12,000', isp:'30%', emoji:'💎', color:'#E5E4E2',  sessions:'All 99' },
  ]

  const PRODUCTS = [
    { icon:'📚', name:'EC Workshop',        color:'#7C3AED', desc:'The education that changes who you are before it changes what you earn. 99 sessions of transformation.' },
    { icon:'🤖', name:'Coach Manlaw AI',    color:'#D4AF37', desc:'Your personal AI business coach — available 24/7, knows your name, tier and progress.' },
    { icon:'✍️', name:'Type As You Feel',   color:'#10B981', desc:'Write in any African language. AI fixes grammar, spelling and tone instantly. Dedicated to Steve Biko.' },
    { icon:'🎨', name:'EC Poster Studio',   color:'#7C3AED', desc:'Turn workshop insights into branded social media content with one click.' },
    { icon:'🤖', name:'Content Studio+',    color:'#0EA5E9', desc:'Your AI content team — generates posts, image prompts and video scripts in batches. From R297/mo.' },
    { icon:'🎴', name:'Invitation Cards',   color:'#FB923C', desc:'Send beautiful personalised digital invitations — not a plain link.' },
    { icon:'🍽️', name:'Open Table',         color:'#6D28D9', desc:'Live Sunday 8pm group sessions facilitated by Coach Manlaw. Rev joins when available.' },
    { icon:'📜', name:'CEO Letters',        color:'#D4AF37', desc:'Weekly personal letter from the CEO — faith, personal journey and business wisdom.' },
  ]

  const JOURNEY = [
    { icon:'🎴', color:'#D4AF37', title:'You receive a personalised invitation', body:'Not a plain link. A beautiful branded card from someone who knows you — with their name, your name, and a reserved seat.' },
    { icon:'👆', color:'#7C3AED', title:'You click — your journey is registered', body:'The moment you click, your sponsor\'s referral is recorded. You land on the signup page. Name, WhatsApp and email — that is all we need.' },
    { icon:'🚀', color:'#0EA5E9', title:'Welcome onboarding — 5 steps in 3 minutes', body:'A guided welcome explains what Z2B is, how the Torch Challenge works, what unlocks when you invite someone, and your first 3 actions.' },
    { icon:'📚', color:'#7C3AED', title:'Session 1 — Coach Manlaw meets you personally', body:'You open the workshop. Coach Manlaw greets you by name. At the end of each session there are 5 questions. Your progress is saved automatically.' },
    { icon:'⚡', color:'#F59E0B', title:'6am — your Daily Spark arrives', body:'One powerful sentence from the workshop lands in your notification every morning. One tap takes you straight to that session.' },
    { icon:'🎴', color:'#10B981', title:'Invite one person — Coach Manlaw upgrades', body:'One registration through your link activates Coach Manlaw personal mode. Four people at Session 1 unlocks all social features.' },
    { icon:'💎', color:'#CD7F32', title:'Upgrade to Bronze — R480 once-off', body:'All 99 sessions unlock. Your ISP commission activates at 18%. Every upgrade through your link earns you automatically.' },
    { icon:'🔥', color:'#D4AF37', title:'Your Bonfire begins to burn', body:'Track your 4 inner circle on your Bonfire dashboard. Watch commissions grow. One day your name is written permanently on the Founders Wall.' },
  ]

  const s: Record<string, React.CSSProperties> = {
    page:    { minHeight:'100vh', background:'linear-gradient(160deg,#0A0818 0%,#0D0A1E 50%,#0A0818 100%)', color:'#F5F3FF', fontFamily:'Georgia,serif', overflowX:'hidden' },
    tag:     { fontFamily:'Cinzel,serif', fontSize:'10px', letterSpacing:'3px', color:'rgba(212,175,55,0.65)', marginBottom:'10px', display:'block' },
    h2:      { fontFamily:'Cinzel,serif', fontSize:'clamp(22px,4vw,40px)', fontWeight:900, color:'#fff', lineHeight:1.15, marginBottom:'14px' },
    gold:    { color:'#D4AF37' },
    lead:    { fontSize:'clamp(14px,1.8vw,18px)', color:'rgba(255,255,255,0.6)', lineHeight:1.8, marginBottom:'20px', maxWidth:'680px' },
    section: { maxWidth:'960px', margin:'0 auto', padding:'80px 24px' },
    divider: { borderTop:'1px solid rgba(212,175,55,0.12)', margin:'0' },
  }

  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={{ padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(212,175,55,0.1)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100, background:'rgba(10,8,24,0.85)' }}>
        <Link href="/" style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'#D4AF37', textDecoration:'none' }}>Z2B Table Banquet</Link>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <Link href="/workshop" style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', textDecoration:'none' }}>Workshop</Link>
          <Link href={signupUrl} style={{ padding:'8px 20px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1px solid #D4AF37', borderRadius:'20px', color:'#F5D060', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
            Join Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ minHeight:'92vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 24px', position:'relative', overflow:'hidden', background:'radial-gradient(ellipse at 50% 0%,rgba(212,175,55,0.1) 0%,transparent 55%)' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents:'none' }} />
        <span style={{ fontSize:'56px', marginBottom:'20px', display:'block', animation:'flicker 2.5s ease-in-out infinite' }}>🔥</span>
        <span style={s.tag}>AN INVITATION TO THE BANQUET TABLE</span>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(36px,9vw,88px)', fontWeight:900, color:'#fff', lineHeight:1.05, marginBottom:'18px', animation:'fadeUp 0.7s ease both' }}>
          Z2B<br/><span style={s.gold}>Table Banquet</span>
        </h1>
        <p style={{ ...s.lead, textAlign:'center', fontStyle:'italic', animation:'fadeUp 0.7s 0.1s ease both' }}>
          Where employees with extraordinary dreams make the transition from employment to entrepreneurship — responsibly, strategically and on their own terms.
        </p>
        <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', justifyContent:'center', animation:'fadeUp 0.7s 0.2s ease both' }}>
          <Link href={signupUrl} style={{ padding:'16px 40px', background:'linear-gradient(135deg,#B8860B,#D4AF37)', border:'none', borderRadius:'50px', color:'#000', fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'14px', letterSpacing:'1px', textDecoration:'none', boxShadow:'0 0 40px rgba(212,175,55,0.3)', transition:'all 0.2s' }}>
            🔥 Claim Your Free Seat
          </Link>
          <a href="#how-it-works" style={{ padding:'16px 40px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(212,175,55,0.4)', borderRadius:'50px', color:'#F5D060', fontFamily:'Cinzel,serif', fontWeight:600, fontSize:'14px', letterSpacing:'1px', textDecoration:'none' }}>
            See How It Works
          </a>
        </div>
      </div>

      <div style={s.divider} />

      {/* THE PROBLEM */}
      <section style={s.section}>
        <span style={s.tag}>THE HONEST TRUTH</span>
        <h2 style={s.h2}>You are not failing.<br/><span style={s.gold}>The system around you is.</span></h2>
        <p style={s.lead}>You studied hard. You got the job. You show up every day. Anywhere in the world — London, Lagos, Johannesburg, Manila, Nairobi or New York — the story is the same. The ceiling is real. The frustration is real. And the dream you had did not disappear — it just got buried under a salary.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'18px', marginTop:'36px' }}>
          {[
            { icon:'📊', title:'The Salary Ceiling', text:'Employment gives you security without freedom. You trade your time for income — and the income has a cap. Every year. Every promotion. Still capped.' },
            { icon:'😔', title:'The Network Marketing Shame', text:'You tried it. Maybe it did not work. You blamed yourself. You should not have. What was missing was the right system, the right mindset, the right community.' },
            { icon:'⏳', title:'The Waiting Trap', text:'Waiting for the right time. Waiting to save enough. Waiting to feel ready. The right time to build is always while you still have stability — not after you have lost it.' },
          ].map(c => (
            <div key={c.title} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'18px', padding:'26px 22px', transition:'border-color 0.2s' }}>
              <div style={{ fontSize:'32px', marginBottom:'12px' }}>{c.icon}</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>{c.title}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.52)', lineHeight:1.75 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* THE SOLUTION */}
      <section style={s.section}>
        <span style={s.tag}>THE ENTREPRENEURIAL CONSUMER</span>
        <h2 style={s.h2}>A safe path to build<br/><span style={s.gold}>freedom while employed.</span></h2>
        <p style={s.lead}>The Entrepreneurial Consumer is not a business owner. Not a traditional network marketer. It is a third identity — available to any employed person, anywhere in the world — who builds leverage through their consumption and connections while still receiving a salary.</p>
        <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(124,58,237,0.05))', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'24px', padding:'48px 40px', marginTop:'36px', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'12px', left:'24px', fontSize:'100px', color:'rgba(212,175,55,0.05)', fontFamily:'Georgia,serif', lineHeight:1, pointerEvents:'none' }}>"</div>
          <p style={{ fontSize:'clamp(17px,2.8vw,26px)', fontStyle:'italic', color:'#fff', lineHeight:1.65, marginBottom:'16px', position:'relative', zIndex:1 }}>
            "The plans of the diligent lead surely to abundance. You do not have to leap. You have to build — methodically, faithfully, consistently — until the leap becomes unnecessary."
          </p>
          <span style={{ fontSize:'13px', color:'rgba(212,175,55,0.6)' }}>— Rev Mokoro Manana, Founder</span>
        </div>
      </section>

      <div style={s.divider} />

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={s.section}>
        <span style={s.tag}>FOUR STEPS</span>
        <h2 style={s.h2}>How to claim your<br/><span style={s.gold}>Banquet Seat.</span></h2>
        <div style={{ display:'flex', flexDirection:'column', gap:'0', marginTop:'40px' }}>
          {[
            { n:'1', title:'Join the Workshop — Free', body:'18 sessions of the Entrepreneurial Consumer Workshop are completely free. No card required. Coach Manlaw guides you personally through every session.' },
            { n:'2', title:'Transform Your Mindset', body:'99 sessions covering Mindset Mystery, Money Moves, Legacy Mission and Momentum Movement. You will never see your salary, your time or your relationships the same way again.' },
            { n:'3', title:'Upgrade and Activate Your Income', body:'When you are ready — upgrade to Bronze for a once-off R480. This activates your earning commissions. Every person who upgrades through your referral link earns you ISP commission.' },
            { n:'4', title:'Build Your Banquet Table', body:'Invite people to pull up a chair. Your table grows. Your commissions multiply across generations. Your legacy builds — one builder at a time.' },
          ].map((step, i) => (
            <div key={i} style={{ display:'flex', gap:'22px', padding:'28px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', alignItems:'flex-start' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(212,175,55,0.1)', border:'1.5px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'16px', color:'#D4AF37', flexShrink:0 }}>{step.n}</div>
              <div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'16px', color:'#fff', marginBottom:'6px' }}>{step.title}</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.58)', lineHeight:1.75 }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background:'linear-gradient(135deg,rgba(13,10,30,0.9),rgba(30,27,75,0.8))', borderTop:'1px solid rgba(212,175,55,0.12)', borderBottom:'1px solid rgba(212,175,55,0.12)', padding:'80px 24px' }}>
        <div style={{ maxWidth:'960px', margin:'0 auto' }}>
          <span style={s.tag}>HOW YOU MAKE MONEY</span>
          <h2 style={s.h2}>Six income streams.<br/><span style={s.gold}>One platform.</span></h2>
          <p style={s.lead}>This is not about one commission. Z2B has six distinct ways your table earns for you — simultaneously.</p>

          {/* Income streams */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'16px', marginBottom:'48px' }}>
            {INCOME_STREAMS.map((inc, i) => (
              <div key={i} onClick={() => setActiveIncome(activeIncome === i ? null : i)} style={{ background: activeIncome === i ? `${inc.color}12` : 'rgba(0,0,0,0.25)', border:`1.5px solid ${activeIncome === i ? inc.color+'55' : 'rgba(255,255,255,0.08)'}`, borderRadius:'16px', padding:'22px', cursor:'pointer', transition:'all 0.2s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
                  <span style={{ fontSize:'26px' }}>{inc.icon}</span>
                  <div>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:inc.color }}>{inc.rate}</div>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', color:'rgba(255,255,255,0.5)', letterSpacing:'1px' }}>{inc.name}</div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:'11px', background:`${inc.color}15`, border:`1px solid ${inc.color}33`, borderRadius:'20px', padding:'3px 10px', color:inc.color, fontWeight:700 }}>📅 {inc.cycle}</div>
                </div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', lineHeight:1.6, marginBottom:'6px' }}><strong style={{ color:'#fff' }}>{inc.full}</strong></div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{inc.desc}</div>
                {activeIncome === i && (
                  <div style={{ marginTop:'12px', padding:'12px 14px', background:'rgba(0,0,0,0.3)', borderRadius:'10px', fontSize:'12px', color:`${inc.color}cc`, lineHeight:1.7, borderLeft:`3px solid ${inc.color}` }}>
                    {inc.detail}
                  </div>
                )}
                <div style={{ marginTop:'8px', fontSize:'10px', color:'rgba(255,255,255,0.25)', textAlign:'right' }}>Tap to {activeIncome === i ? 'close' : 'learn more'}</div>
              </div>
            ))}
          </div>

          {/* COMPARISON TABLE */}
          <span style={s.tag}>THE POWER OF REFERRAL MARKETING</span>
          <h2 style={{ ...s.h2, fontSize:'clamp(20px,3vw,32px)' }}>What happens when<br/><span style={s.gold}>your table duplicates.</span></h2>
          <p style={{ ...s.lead, fontSize:'14px' }}>Every builder brings 4 people. Each of those 4 brings 4 more. Product price = R480. See what Bronze earns versus Silver when the table fills:</p>

          <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'20px', overflow:'hidden', marginTop:'24px' }}>

            {/* Structure row */}
            <div style={{ padding:'20px 28px', background:'rgba(212,175,55,0.05)', borderBottom:'1px solid rgba(212,175,55,0.12)' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', marginBottom:'12px' }}>DUPLICATION STRUCTURE — EACH PERSON BRINGS 4</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'6px', textAlign:'center' }}>
                {['Gen 1','Gen 2','Gen 3','Gen 4','Gen 5','Gen 6','Total'].map((g, i) => (
                  <div key={i}>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginBottom:'4px' }}>{g}</div>
                    <div style={{ fontSize:'13px', fontWeight:700, color: i === 6 ? '#D4AF37' : '#fff' }}>
                      {['4','16','64','256','1,024','4,096','5,460'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table header */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr' }}>
              <div style={{ padding:'16px 20px', background:'rgba(255,255,255,0.02)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', letterSpacing:'1px' }}>GENERATION</div>
              </div>
              <div style={{ padding:'16px 20px', background:'rgba(205,127,50,0.08)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:'11px', color:'#CD7F32', letterSpacing:'1px', marginBottom:'3px' }}>🥉 BRONZE — 3 GENERATIONS</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#CD7F32' }}>R480 once-off · ISP 18%</div>
                <div style={{ fontSize:'10px', color:'rgba(205,127,50,0.55)' }}>G2: 10% · G3: 5%</div>
              </div>
              <div style={{ padding:'16px 20px', background:'rgba(192,192,192,0.06)' }}>
                <div style={{ fontSize:'11px', color:'#C0C0C0', letterSpacing:'1px', marginBottom:'3px' }}>🥈 SILVER — 6 GENERATIONS</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#C0C0C0' }}>R2,500 once-off · ISP 25%</div>
                <div style={{ fontSize:'10px', color:'rgba(192,192,192,0.5)' }}>G2: 10% · G3: 5% · G4: 3% · G5: 2% · G6: 1%</div>
              </div>
            </div>

            {/* Generation rows */}
            {[
              { gen:'Gen 1 — 4 people', sale:'4 × R480 = R1,920',    bronze:'18% = R345.60',   silver:'25% = R480.00',    blocked:false },
              { gen:'Gen 2 — 16 people', sale:'16 × R480 = R7,680',  bronze:'10% = R768.00',   silver:'10% = R768.00',    blocked:false },
              { gen:'Gen 3 — 64 people', sale:'64 × R480 = R30,720', bronze:'5% = R1,536.00',  silver:'5% = R1,536.00',   blocked:false },
              { gen:'Gen 4 — 256 people', sale:'256 × R480 = R122,880', bronze:'❌ Blocked',   silver:'3% = R3,686.40',   blocked:true },
              { gen:'Gen 5 — 1,024 people', sale:'1,024 × R480 = R491,520', bronze:'❌ Blocked', silver:'2% = R9,830.40', blocked:true },
              { gen:'Gen 6 — 4,096 people', sale:'4,096 × R480 = R1,966,080', bronze:'❌ Blocked', silver:'1% = R19,660.80', blocked:true },
            ].map((row, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <div style={{ padding:'12px 20px', borderRight:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>{row.gen}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', marginTop:'2px' }}>{row.sale}</div>
                </div>
                <div style={{ padding:'12px 20px', borderRight:'1px solid rgba(255,255,255,0.05)', background: row.blocked ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color: row.blocked ? 'rgba(239,68,68,0.5)' : '#CD7F32' }}>{row.bronze}</div>
                  {row.blocked && <div style={{ fontSize:'10px', color:'rgba(239,68,68,0.35)' }}>Bronze stops at Gen 3</div>}
                </div>
                <div style={{ padding:'12px 20px' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#C0C0C0' }}>{row.silver}</div>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'2px solid rgba(212,175,55,0.3)' }}>
              <div style={{ padding:'18px 20px', background:'rgba(212,175,55,0.05)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>TOTAL INCOME</div>
              </div>
              <div style={{ padding:'18px 20px', background:'rgba(205,127,50,0.1)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:'24px', fontWeight:700, color:'#CD7F32' }}>R2,649.60</div>
                <div style={{ fontSize:'11px', color:'rgba(205,127,50,0.55)' }}>Bronze · 3 Generations</div>
              </div>
              <div style={{ padding:'18px 20px', background:'rgba(16,185,129,0.08)' }}>
                <div style={{ fontSize:'24px', fontWeight:700, color:'#6EE7B7' }}>R35,961.60</div>
                <div style={{ fontSize:'11px', color:'rgba(110,231,183,0.55)' }}>Silver · 6 Generations</div>
              </div>
            </div>

            {/* Key insight */}
            <div style={{ padding:'20px 28px', background:'linear-gradient(135deg,rgba(16,185,129,0.07),rgba(212,175,55,0.05))', borderTop:'1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'14px' }}>
                <div style={{ textAlign:'center', padding:'14px', background:'rgba(0,0,0,0.2)', borderRadius:'12px' }}>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginBottom:'4px' }}>SILVER EARNS MORE THAN BRONZE BY</div>
                  <div style={{ fontSize:'30px', fontWeight:700, color:'#6EE7B7', fontFamily:'Cinzel,serif' }}>13.6×</div>
                </div>
                <div style={{ textAlign:'center', padding:'14px', background:'rgba(0,0,0,0.2)', borderRadius:'12px' }}>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginBottom:'4px' }}>EXTRA INCOME FROM GEN 4–6</div>
                  <div style={{ fontSize:'30px', fontWeight:700, color:'#D4AF37', fontFamily:'Cinzel,serif' }}>R33,177.60</div>
                </div>
              </div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, margin:'0 0 6px' }}>
                <strong style={{ color:'#D4AF37' }}>The real power comes from generations 4, 5 and 6.</strong> Bronze cannot access them. Silver does. That gap of R33,177.60 is what upgrading buys you — not once, but every cycle your table duplicates.
              </p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.22)', margin:0 }}>For illustration purposes only. Subject to individual builder and sales team performance. Excludes QPB, TSC and CEO Award income streams.</p>
            </div>
          </div>
        </div>
      </div>

      <div style={s.divider} />

      {/* TIERS */}
      <section style={s.section}>
        <span style={s.tag}>MEMBERSHIP TIERS</span>
        <h2 style={s.h2}>Start free.<br/><span style={s.gold}>Upgrade when ready.</span></h2>
        <p style={s.lead}>Every builder starts at FAM — free forever. Your first upgrade to Bronze is R480 once-off. No monthly fees. No recurring charges. Your seat at the table is permanent.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))', gap:'12px', marginTop:'32px' }}>
          {TIERS.map((t, i) => (
            <div key={i} style={{ background:`${t.color}10`, border:`1.5px solid ${t.color}44`, borderRadius:'16px', padding:'20px 14px', textAlign:'center', transition:'transform 0.2s' }}>
              <div style={{ fontSize:'26px', marginBottom:'8px' }}>{t.emoji}</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:t.color, marginBottom:'4px' }}>{t.name}</div>
              <div style={{ fontSize:'20px', fontWeight:700, color:t.color, marginBottom:'4px' }}>{t.price}</div>
              <div style={{ fontSize:'12px', color:`${t.color}99`, marginBottom:'3px' }}>ISP {t.isp}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{t.sessions}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* PRODUCTS */}
      <section style={s.section}>
        <span style={s.tag}>WHAT WE SELL</span>
        <h2 style={s.h2}>Digital products built<br/><span style={s.gold}>for builders everywhere.</span></h2>
        <p style={s.lead}>Z2B is not just a compensation plan. It is a growing ecosystem of digital tools that empower any builder — anywhere in the world — to learn, create and earn from any device.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'16px', marginTop:'32px' }}>
          {PRODUCTS.map((p, i) => (
            <div key={i} style={{ background:`${p.color}0D`, border:`1.5px solid ${p.color}33`, borderRadius:'16px', padding:'22px', transition:'border-color 0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
                <span style={{ fontSize:'26px' }}>{p.icon}</span>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:p.color }}>{p.name}</div>
              </div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.56)', lineHeight:1.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* JOURNEY */}
      <section style={s.section}>
        <span style={s.tag}>FROM CLICK TO BUILDER</span>
        <h2 style={s.h2}>What happens when<br/><span style={s.gold}>you click the link.</span></h2>
        <p style={s.lead}>From the moment you receive an invitation to the moment you are earning — here is exactly what your journey looks like.</p>
        <div style={{ position:'relative', marginTop:'48px' }}>
          <div style={{ position:'absolute', left:'27px', top:0, bottom:0, width:'2px', background:'linear-gradient(to bottom,rgba(212,175,55,0.5),rgba(124,58,237,0.3),rgba(16,185,129,0.2))', borderRadius:'1px' }} />
          <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
            {JOURNEY.map((j, i) => (
              <div key={i} style={{ display:'flex', gap:'22px', alignItems:'flex-start' }}>
                <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:`${j.color}15`, border:`2px solid ${j.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0, zIndex:1, position:'relative' }}>{j.icon}</div>
                <div style={{ flex:1, paddingTop:'8px' }}>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:j.color, marginBottom:'6px' }}>{j.title}</div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.75 }}>{j.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={s.divider} />

      {/* FOUNDER */}
      <section style={s.section}>
        <span style={s.tag}>FROM THE FOUNDER</span>
        <h2 style={s.h2}>Built from<br/><span style={s.gold}>preparation not desperation.</span></h2>
        <div style={{ display:'flex', gap:'36px', alignItems:'flex-start', flexWrap:'wrap', marginTop:'36px' }}>
          <div style={{ width:'100px', height:'100px', borderRadius:'50%', background:'rgba(212,175,55,0.15)', border:'3px solid rgba(212,175,55,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cinzel,serif', fontSize:'36px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>RM</div>
          <div style={{ flex:1, minWidth:'240px' }}>
            <p style={{ fontSize:'clamp(14px,1.8vw,19px)', fontStyle:'italic', color:'rgba(255,255,255,0.75)', lineHeight:1.85, margin:'0 0 16px' }}>
              "I did not quit my job in frustration. I worked two more years after discovering the Entrepreneurial Consumer — fixing my mindset, building systems, deepening relationships. By the time I resigned in January 2026, I did not leave from desperation. I left from a position of preparation. And I built Z2B for every employed person in the world who is ready to do the same.
              <br/><br/>Z2B is my open hand. Everything I learned — every system, every lesson, every tool — I am releasing it into the hands of people who deserve it. You are one of those people."
            </p>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#D4AF37' }}>Rev Mokoro Manana</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'3px' }}>Founder & CEO · Zero2Billionaires / Z2B Legacy Builders</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div style={{ textAlign:'center', padding:'100px 24px', background:'radial-gradient(ellipse at 50% 100%,rgba(212,175,55,0.1) 0%,transparent 55%)' }}>
        <span style={s.tag}>YOUR SEAT IS WAITING</span>
        <h2 style={{ ...s.h2, textAlign:'center' }}>The Banquet Table<br/><span style={s.gold}>is set.</span></h2>
        <p style={{ ...s.lead, textAlign:'center', margin:'0 auto 36px' }}>18 free sessions. No card. No commitment. Just pull up a chair and begin your transformation today.</p>
        <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href={signupUrl} style={{ padding:'18px 48px', background:'linear-gradient(135deg,#B8860B,#D4AF37)', border:'none', borderRadius:'50px', color:'#000', fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'15px', letterSpacing:'1px', textDecoration:'none', boxShadow:'0 0 40px rgba(212,175,55,0.25)' }}>
            🔥 Join Free Now
          </Link>
          <Link href="/workshop" style={{ padding:'18px 48px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(212,175,55,0.4)', borderRadius:'50px', color:'#F5D060', fontFamily:'Cinzel,serif', fontWeight:600, fontSize:'15px', letterSpacing:'1px', textDecoration:'none' }}>
            📚 See the Workshop
          </Link>
        </div>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.22)', marginTop:'16px' }}>Free forever · No spam · Unsubscribe anytime</p>
      </div>

      {/* SCRIPTURE + HASHTAGS */}
      <div style={{ textAlign:'center', padding:'40px 24px 28px', borderTop:'1px solid rgba(212,175,55,0.1)' }}>
        <p style={{ fontStyle:'italic', fontSize:'15px', color:'rgba(212,175,55,0.55)', marginBottom:'6px' }}>"The plans of the diligent lead surely to abundance."</p>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.2)', marginBottom:'12px' }}>— Proverbs 21:5</p>
        <p style={{ fontSize:'12px', color:'rgba(212,175,55,0.35)', letterSpacing:'1px' }}>#Reka_Obesa_Okatuka · #Entrepreneurial_Consumer · app.z2blegacybuilders.co.za</p>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flicker { 0%,100%{transform:scale(1) rotate(-1deg)} 50%{transform:scale(1.06) rotate(1deg)} }
      `}</style>
    </div>
  )
}
