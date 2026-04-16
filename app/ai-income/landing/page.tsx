'use client'
// FILE: app/ai-income/landing/page.tsx
// Z2B AI Income Execution System — Public Landing Page
// Bright · Beautiful · AI Era · New Dawn aesthetic
// Two share links: /ai-income/landing?ref=CODE (AI Income) vs /invite?ref=CODE (Z2B Table)

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const DIGITAL_PRODUCTS = [
  {
    icon: '💼', name: 'WhatsApp Business Boost Pack',
    target: 'Small business owners, spaza shops, freelancers',
    problem: 'No customers, no digital presence, silent WhatsApp',
    price: 'R150–R300',
    script: 'I help small businesses get more customers using WhatsApp. Your competitors are already doing this. Let me set up your WhatsApp business profile and write 10 messages that attract paying clients — in 24 hours.',
    delivery: 'WhatsApp profile setup + 10 message templates delivered via WhatsApp',
  },
  {
    icon: '📄', name: 'CV & Job Boost Kit',
    target: 'Job seekers, school leavers, career changers',
    problem: 'Not getting interviews, weak CV, no cover letter',
    price: 'R100–R200',
    script: 'I write professional CVs that get interviews. Most CVs are rejected in 10 seconds. Mine get callbacks. R150 — delivered same day via WhatsApp.',
    delivery: 'PDF CV + cover letter + LinkedIn tips sent via WhatsApp',
  },
  {
    icon: '📱', name: 'Social Media Content Pack',
    target: 'Small businesses, coaches, beauty industry',
    problem: 'No time to post, blank page syndrome, inconsistent presence',
    price: 'R200–R400',
    script: 'I create 30 days of social media posts for your business. You never run out of content again. R250 — WhatsApp me your business name and I start today.',
    delivery: '30 posts (text + captions) delivered as PDF or WhatsApp messages',
  },
  {
    icon: '💬', name: 'Customer Attraction Message Pack',
    target: 'Anyone selling anything — products or services',
    problem: 'Don't know what to say, messages get ignored',
    price: 'R100–R200',
    script: 'I write WhatsApp messages that make people want to buy from you. 10 proven sales messages written for YOUR product. R120 — results guaranteed or I rewrite for free.',
    delivery: '10 customised sales messages + follow-up scripts via WhatsApp',
  },
  {
    icon: '🚀', name: 'Side Hustle Starter Pack',
    target: 'Employed people wanting extra income, beginners',
    problem: 'Don't know where to start, no idea what to sell',
    price: 'R150–R300',
    script: 'I help people start earning online in 48 hours using their existing skills. No quitting your job needed. R200 for the complete starter system.',
    delivery: 'Personalised offer + 5 customer scripts + daily action plan via WhatsApp',
  },
]

function LandingInner() {
  const searchParams = useSearchParams()
  const ref          = searchParams.get('ref') || ''
  const [sponsorName, setSponsorName] = useState('')
  const [activeProduct, setActiveProduct] = useState<number|null>(null)
  const [user, setUser] = useState<any>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [showReg, setShowReg] = useState(false)
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regWa, setRegWa] = useState('')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        const { data: unlock } = await supabase.from('ai_income_unlocks').select('*').eq('user_id', u.id).single()
        if (unlock) setUnlocked(true)
      }
    })
    if (ref) {
      fetch(`/api/sponsor?ref=${encodeURIComponent(ref)}`)
        .then(r => r.json()).then(d => { if (d?.name) setSponsorName(d.name) }).catch(() => {})
    }
  }, [ref])

  const aiIncomeLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/ai-income/landing?ref=${ref}`

  const handlePay = async () => {
    if (!user) { setShowReg(true); return }
    setPaying(true); setPayError('')
    try {
      const res = await fetch('/api/yoco', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_checkout', user_id: user.id, ref_code: ref, tier: 'ai_income' }),
      })
      const raw = await res.text()
      const data = raw ? JSON.parse(raw) : {}
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
      else { setPayError(data.error || 'Payment failed'); setPaying(false) }
    } catch (e: any) { setPayError(e.message); setPaying(false) }
  }

  const handleRegPay = async () => {
    if (!regName.trim() || !regEmail.trim() || !regWa.trim()) return
    setRegLoading(true)
    const pwd = `Z2B${Math.random().toString(36).slice(2,10).toUpperCase()}!`
    const { data: authData, error } = await supabase.auth.signUp({
      email: regEmail.trim().toLowerCase(), password: pwd,
      options: { data: { full_name: regName.trim(), whatsapp: regWa.trim(), referred_by: ref || null } },
    })
    if (error && !error.message.toLowerCase().includes('already')) { setPayError(error.message); setRegLoading(false); return }
    const uid = authData?.user?.id
    if (!uid) { setPayError('Registration failed'); setRegLoading(false); return }
    const res = await fetch('/api/yoco', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_checkout', user_id: uid, ref_code: ref, tier: 'ai_income' }),
    })
    const data = await res.json()
    if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
    else { setPayError(data.error || 'Payment failed'); setRegLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#FAFBFF', color:'#0F172A', fontFamily:'Georgia,serif', overflowX:'hidden' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .glow-btn:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(99,102,241,0.4)!important; }
        .product-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(99,102,241,0.15)!important; }
      `}</style>

      {/* ── GRADIENT BACKGROUND ── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'linear-gradient(135deg, #F0F4FF 0%, #FAFBFF 30%, #F0FDF4 60%, #FFFBEB 100%)' }} />

      {/* ── DECORATIVE CIRCLES ── */}
      <div style={{ position:'fixed', top:'-100px', right:'-100px', width:'400px', height:'400px',
        borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-80px', left:'-80px', width:'300px', height:'300px',
        borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(99,102,241,0.1)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ fontSize:'15px', fontWeight:700, color:'#4F46E5', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
          Z2B Table Banquet
        </Link>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          {unlocked
            ? <Link href="/ai-income" style={{ fontSize:'13px', padding:'8px 18px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:'20px', color:'#fff', fontWeight:700, textDecoration:'none' }}>Enter System →</Link>
            : <>
                <Link href="/login?redirect=/ai-income" style={{ fontSize:'13px', color:'#6B7280', textDecoration:'none' }}>Sign In</Link>
                <button onClick={handlePay} style={{ fontSize:'13px', padding:'8px 18px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', border:'none', borderRadius:'20px', color:'#fff', fontWeight:700, cursor:'pointer' }}>
                  Start R500 →
                </button>
              </>
          }
        </div>
      </nav>

      <div style={{ position:'relative', zIndex:1 }}>

        {/* ── HERO ── */}
        <section style={{ textAlign:'center', padding:'72px 24px 56px', maxWidth:'760px', margin:'0 auto', animation:'fadeUp 0.8s ease' }}>

          {/* Sponsor badge */}
          {sponsorName && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'40px', padding:'8px 20px', marginBottom:'24px' }}>
              <span style={{ fontSize:'16px' }}>🏆</span>
              <span style={{ fontSize:'13px', fontWeight:700, color:'#059669' }}>Invited by {sponsorName}</span>
            </div>
          )}

          {/* AI badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,rgba(79,70,229,0.1),rgba(124,58,237,0.1))', border:'1px solid rgba(79,70,229,0.2)', borderRadius:'40px', padding:'8px 20px', marginBottom:'24px' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4F46E5', animation:'pulse 1.5s infinite' }} />
            <span style={{ fontSize:'12px', fontWeight:700, color:'#4F46E5', letterSpacing:'1px', textTransform:'uppercase' }}>60-Day AI Income Activation Program</span>
          </div>

          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(32px,6vw,56px)', fontWeight:900, color:'#0F172A', margin:'0 0 16px', lineHeight:1.1 }}>
            AI Income<br/>
            <span style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Execution System
            </span>
          </h1>

          <p style={{ fontSize:'18px', fontWeight:700, color:'#4F46E5', marginBottom:'10px' }}>
            AI-Powered Smartphone Income System: R500 · 60-Day AI Income Activation Program
          </p>

          <p style={{ fontSize:'16px', color:'#475569', maxWidth:'560px', margin:'0 auto 36px', lineHeight:1.8 }}>
            Use AI to generate offers, find customers, write sales messages and close deals —
            all from your smartphone. Make your first R100 today. Scale to R300/day in 60 days.
          </p>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={handlePay} disabled={paying}
              className="glow-btn"
              style={{ padding:'18px 40px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', border:'none', borderRadius:'14px', color:'#fff', fontWeight:700, fontSize:'17px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', boxShadow:'0 8px 32px rgba(79,70,229,0.35)', opacity:paying?0.7:1, transition:'all 0.2s' }}>
              {paying ? 'Setting up...' : '🚀 Start for R500 — 60 Days'}
            </button>
            <Link href="/invite" style={{ padding:'18px 32px', background:'#fff', border:'2px solid #E2E8F0', borderRadius:'14px', color:'#475569', fontWeight:700, fontSize:'15px', textDecoration:'none', fontFamily:'Georgia,serif', transition:'all 0.2s' }}>
              🍽️ Z2B Table Banquet →
            </Link>
          </div>
          <div style={{ marginTop:'14px', fontSize:'13px', color:'#94A3B8' }}>
            60-day access · R500/month to continue · Cancel anytime
          </div>
        </section>

        {/* ── FLOATING STATS ── */}
        <section style={{ maxWidth:'900px', margin:'0 auto', padding:'0 24px 56px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {[
              { icon:'🤖', val:'7', label:'AI Modules', sub:'All included', color:'#4F46E5' },
              { icon:'💰', val:'R300', label:'Daily Target', sub:'Achievable in 60 days', color:'#059669' },
              { icon:'🔗', val:'R200', label:'Per Referral', sub:'You earn for sharing', color:'#D97706' },
            ].map(({icon,val,label,sub,color}) => (
              <div key={label} style={{ background:'#fff', borderRadius:'20px', padding:'28px 20px', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(226,232,240,0.8)', animation:'float 4s ease-in-out infinite' }}>
                <div style={{ fontSize:'32px', marginBottom:'8px' }}>{icon}</div>
                <div style={{ fontSize:'30px', fontWeight:900, color, fontFamily:'Cinzel,Georgia,serif', marginBottom:'4px' }}>{val}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', marginBottom:'2px' }}>{label}</div>
                <div style={{ fontSize:'11px', color:'#94A3B8' }}>{sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section style={{ background:'#fff', borderTop:'1px solid #F1F5F9', borderBottom:'1px solid #F1F5F9', padding:'64px 24px' }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'40px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#4F46E5', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>COMPLETE SYSTEM</div>
              <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,4vw,36px)', fontWeight:900, color:'#0F172A', margin:0 }}>Everything You Need to Earn Today</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px' }}>
              {[
                { icon:'🧠', title:'AI Offer Generator', desc:'Creates your personalised sellable offer from your existing skills', color:'#4F46E5' },
                { icon:'📲', title:'AI Customer Finder', desc:'Exact strategy to find paying customers on WhatsApp and Facebook', color:'#7C3AED' },
                { icon:'✍️', title:'AI Post Generator', desc:'WhatsApp statuses, Facebook posts, and direct messages — ready to send', color:'#EC4899' },
                { icon:'💬', title:'AI Reply System', desc:'Handles "too expensive", "thinking about it", and every objection', color:'#059669' },
                { icon:'💸', title:'AI Closing Assistant', desc:'Scripts to close confidently and collect payment from any customer', color:'#D97706' },
                { icon:'🔁', title:'Daily R300/Day Engine', desc:'Daily checklist: contact 20 people, post 3 times, close 1-3 clients', color:'#0891B2' },
                { icon:'🤖', title:'Coach Manlaw — The Executor', desc:'AI coach that pushes you to act, not just think. Execution first always.', color:'#4F46E5' },
                { icon:'🔗', title:'Referral Booster System', desc:'Earn R200 per referral. Share your link and turn sharing into income.', color:'#059669' },
              ].map(({icon,title,desc,color}) => (
                <div key={title} style={{ display:'flex', gap:'14px', padding:'20px', background:'#FAFBFF', borderRadius:'16px', border:'1px solid #F1F5F9', alignItems:'flex-start' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A', marginBottom:'4px' }}>{title}</div>
                    <div style={{ fontSize:'13px', color:'#64748B', lineHeight:1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COACH MANLAW SECTION ── */}
        <section style={{ maxWidth:'900px', margin:'0 auto', padding:'64px 24px' }}>
          <div style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:'24px', padding:'48px 40px', color:'#fff', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'3px', color:'rgba(255,255,255,0.6)', marginBottom:'12px', textTransform:'uppercase' }}>AI COACH</div>
              <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, margin:'0 0 16px', lineHeight:1.2 }}>🤖 Coach Manlaw<br/>The Executor</h2>
              <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.8)', lineHeight:1.8, margin:'0 0 20px' }}>
                Not a chatbot. Not a theory teacher. Coach Manlaw is your AI execution partner — built to push you from ideas into income. Every day.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {['ACTION → INCOME → EXECUTION', 'Sales objection handler', 'Daily accountability partner', 'Mindset correction engine'].map(item => (
                  <div key={item} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ color:'#A5B4FC', fontSize:'14px' }}>✦</span>
                    <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.85)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'20px', padding:'28px', border:'1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'1px' }}>Coach Manlaw Says:</div>
              {[
                { q:'I don't know what to sell', a:'Tell me 3 things you are good at. I will turn one into a R150 offer you can launch today.' },
                { q:'The customer said it's too expensive', a:'That means you haven't shown value yet. Say this: "What would it be worth if I solved [problem] for you?"' },
                { q:'I'm scared to message people', a:'Fear is not the problem. Inaction is. Send 5 messages right now. Come back and tell me the responses.' },
              ].map(({q,a}, i) => (
                <div key={i} style={{ marginBottom:i<2?'16px':'0', paddingBottom:i<2?'16px':'0', borderBottom:i<2?'1px solid rgba(255,255,255,0.1)':'none' }}>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' }}>👤 "{q}"</div>
                  <div style={{ fontSize:'13px', color:'#fff', lineHeight:1.6 }}>🤖 {a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5 DIGITAL PRODUCTS ── */}
        <section style={{ background:'#F8FAFF', borderTop:'1px solid #F1F5F9', borderBottom:'1px solid #F1F5F9', padding:'64px 24px' }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'40px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#4F46E5', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>READY-TO-SELL</div>
              <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,4vw,32px)', fontWeight:900, color:'#0F172A', margin:0 }}>5 Digital Products — Built-In</h2>
              <p style={{ fontSize:'14px', color:'#64748B', marginTop:'10px' }}>Click any product to see the selling script and launch plan</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {DIGITAL_PRODUCTS.map((p, i) => (
                <div key={i} className="product-card"
                  onClick={() => setActiveProduct(activeProduct===i ? null : i)}
                  style={{ background:'#fff', borderRadius:'16px', border:`1px solid ${activeProduct===i?'#4F46E5':'#E2E8F0'}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:activeProduct===i?'0 8px 32px rgba(79,70,229,0.15)':'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:'16px' }}>
                    <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'linear-gradient(135deg,#EEF2FF,#F5F3FF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{p.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'15px', fontWeight:700, color:'#0F172A' }}>{p.name}</div>
                      <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>Price: {p.price} · {p.target}</div>
                    </div>
                    <div style={{ fontSize:'20px', color:'#94A3B8', transition:'transform 0.2s', transform:activeProduct===i?'rotate(180deg)':'none' }}>⌄</div>
                  </div>
                  {activeProduct === i && (
                    <div style={{ padding:'0 24px 24px', borderTop:'1px solid #F1F5F9' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'16px' }}>
                        <div style={{ background:'#F8FAFF', borderRadius:'12px', padding:'16px' }}>
                          <div style={{ fontSize:'11px', fontWeight:700, color:'#4F46E5', letterSpacing:'1px', marginBottom:'8px', textTransform:'uppercase' }}>Problem You Solve</div>
                          <div style={{ fontSize:'13px', color:'#475569' }}>{p.problem}</div>
                        </div>
                        <div style={{ background:'#F0FDF4', borderRadius:'12px', padding:'16px' }}>
                          <div style={{ fontSize:'11px', fontWeight:700, color:'#059669', letterSpacing:'1px', marginBottom:'8px', textTransform:'uppercase' }}>Delivery</div>
                          <div style={{ fontSize:'13px', color:'#475569' }}>{p.delivery}</div>
                        </div>
                      </div>
                      <div style={{ marginTop:'16px', background:'#F8FAFF', borderRadius:'12px', padding:'16px', border:'1px solid #E0E7FF' }}>
                        <div style={{ fontSize:'11px', fontWeight:700, color:'#4F46E5', letterSpacing:'1px', marginBottom:'8px', textTransform:'uppercase' }}>📋 Selling Script (Copy & Send)</div>
                        <div style={{ fontSize:'13px', color:'#0F172A', lineHeight:1.8, fontStyle:'italic' }}>"{p.script}"</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.script) }}
                        style={{ marginTop:'12px', padding:'10px 20px', background:'#4F46E5', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                        📋 Copy Script & Launch
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICE vs COST ── */}
        <section style={{ maxWidth:'900px', margin:'0 auto', padding:'64px 24px' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,4vw,36px)', fontWeight:900, color:'#0F172A', margin:0 }}>Price vs Cost</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
            <div style={{ background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)', borderRadius:'20px', padding:'32px', border:'2px solid #86EFAC' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#059669', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px' }}>💵 THE PRICE</div>
              <div style={{ fontSize:'40px', fontWeight:900, color:'#059669', fontFamily:'Cinzel,Georgia,serif', marginBottom:'8px' }}>R500</div>
              <div style={{ fontSize:'14px', color:'#166534', marginBottom:'20px' }}>60-Day AI Income Activation Program</div>
              {['Full AI execution system','5 ready-to-sell digital products','Coach Manlaw guidance','Referral income (R200/referral)','Daily income tools'].map(item => (
                <div key={item} style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' }}>
                  <span style={{ color:'#059669', fontSize:'14px' }}>✅</span>
                  <span style={{ fontSize:'14px', color:'#166534' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'linear-gradient(135deg,#FFF1F2,#FFE4E6)', borderRadius:'20px', padding:'32px', border:'2px solid #FCA5A5' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#DC2626', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px' }}>❗ THE COST OF NOT JOINING</div>
              <div style={{ fontSize:'40px', fontWeight:900, color:'#DC2626', fontFamily:'Cinzel,Georgia,serif', marginBottom:'8px' }}>∞</div>
              <div style={{ fontSize:'14px', color:'#991B1B', marginBottom:'20px' }}>Paid in freedom, time and purpose</div>
              {['Working for someone else for life','No financial freedom','No time freedom','No purpose or fulfilment','Stuck in the income cycle','Missed opportunities daily','No legacy to leave behind'].map(item => (
                <div key={item} style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' }}>
                  <span style={{ color:'#DC2626', fontSize:'14px' }}>❌</span>
                  <span style={{ fontSize:'14px', color:'#991B1B' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop:'24px', textAlign:'center', padding:'24px', background:'#0F172A', borderRadius:'16px' }}>
            <div style={{ fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'8px', fontStyle:'italic' }}>
              "The PRICE is R500. The COST is your future lifestyle, freedom, and missed opportunity."
            </div>
            <div style={{ display:'flex', gap:'24px', justifyContent:'center', flexWrap:'wrap', marginTop:'16px' }}>
              {['R500 is the cost of starting.','You are choosing direction, not buying access.','Delay is more expensive than action.'].map(line => (
                <span key={line} style={{ fontSize:'13px', color:'#94A3B8', fontStyle:'italic' }}>✦ {line}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ background:'linear-gradient(135deg,#0F172A,#1E1B4B)', padding:'72px 24px', textAlign:'center' }}>
          <div style={{ maxWidth:'600px', margin:'0 auto' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(165,180,252,0.7)', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'16px' }}>START TODAY</div>
            <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(28px,5vw,44px)', fontWeight:900, color:'#fff', margin:'0 0 14px', lineHeight:1.1 }}>
              Your First R100<br/>
              <span style={{ background:'linear-gradient(135deg,#A5B4FC,#C084FC)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Starts Today
              </span>
            </h2>
            <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.6)', lineHeight:1.8, marginBottom:'36px' }}>
              60 days. AI-powered. Execution-first. R300/day is not a dream — it is a daily system.
            </p>
            {payError && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'12px', marginBottom:'16px', color:'#FCA5A5', fontSize:'13px' }}>⚠️ {payError}</div>}
            <button onClick={handlePay} disabled={paying} className="glow-btn"
              style={{ padding:'20px 52px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', border:'none', borderRadius:'16px', color:'#fff', fontWeight:700, fontSize:'18px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', boxShadow:'0 12px 48px rgba(79,70,229,0.5)', opacity:paying?0.7:1, transition:'all 0.2s', display:'block', width:'100%', maxWidth:'400px', margin:'0 auto 16px' }}>
              {paying ? 'Setting up payment...' : '🚀 Start 60-Day Program — R500'}
            </button>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>
              Already a member? <Link href="/login?redirect=/ai-income" style={{ color:'#A5B4FC', textDecoration:'none', fontWeight:700 }}>Sign in →</Link>
            </div>
          </div>
        </section>

      </div>

      {/* ── REGISTRATION MODAL ── */}
      {showReg && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#fff', borderRadius:'24px', padding:'36px 32px', maxWidth:'440px', width:'100%', position:'relative', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
            <button onClick={() => setShowReg(false)} style={{ position:'absolute', top:'16px', right:'16px', background:'#F1F5F9', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'16px', color:'#64748B' }}>×</button>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>🚀</div>
              <h2 style={{ fontSize:'20px', fontWeight:700, color:'#0F172A', margin:'0 0 6px' }}>Create Your Account</h2>
              <p style={{ fontSize:'13px', color:'#64748B', margin:0 }}>Then proceed to R500 payment</p>
            </div>
            {payError && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'10px', padding:'10px', marginBottom:'14px', fontSize:'13px', color:'#991B1B' }}>⚠️ {payError}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
              {[
                { label:'Full Name', val:regName, set:setRegName, ph:'Your full name', type:'text' },
                { label:'Email', val:regEmail, set:setRegEmail, ph:'your@email.com', type:'email' },
                { label:'WhatsApp', val:regWa, set:setRegWa, ph:'+27 or 0XX XXX XXXX', type:'tel' },
              ].map(({ label, val, set, ph, type }) => (
                <div key={label}>
                  <label style={{ fontSize:'11px', color:'#64748B', display:'block', marginBottom:'5px', letterSpacing:'1px', textTransform:'uppercase', fontWeight:700 }}>{label} *</label>
                  <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                    style={{ width:'100%', padding:'12px 14px', border:'2px solid #E2E8F0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Georgia,serif', color:'#0F172A' }} />
                </div>
              ))}
            </div>
            <button onClick={handleRegPay} disabled={regLoading}
              style={{ width:'100%', padding:'15px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'16px', cursor:regLoading?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', opacity:regLoading?0.7:1 }}>
              {regLoading ? 'Processing...' : 'Register & Pay R500 →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AIIncomeLandingWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#FAFBFF', display:'flex', alignItems:'center', justifyContent:'center', color:'#4F46E5', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <LandingInner />
    </Suspense>
  )
}
