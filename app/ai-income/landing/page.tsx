'use client'
// FILE: app/ai-income/landing/page.tsx
// Z2B 4M Income Execution System — Landing Page
// White dominant · Purple splashes · Gold accents · AI era aesthetic

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const DIGITAL_PRODUCTS = [
  {
    icon: '💼',
    name: 'WhatsApp Business Boost Pack',
    target: 'Small business owners, spaza shops, freelancers',
    problem: 'No customers, no digital presence, silent WhatsApp',
    price: 'R150–R300',
    script: 'I help small businesses get more customers using WhatsApp. Your competitors are already doing this. Let me set up your WhatsApp business profile and write 10 messages that attract paying clients in 24 hours.',
    delivery: 'WhatsApp profile setup + 10 message templates delivered via WhatsApp',
  },
  {
    icon: '📄',
    name: 'CV & Job Boost Kit',
    target: 'Job seekers, school leavers, career changers',
    problem: 'Not getting interviews, weak CV, no cover letter',
    price: 'R100–R200',
    script: 'I write professional CVs that get interviews. Most CVs are rejected in 10 seconds. Mine get callbacks. R150 delivered same day via WhatsApp.',
    delivery: 'PDF CV + cover letter + LinkedIn tips sent via WhatsApp',
  },
  {
    icon: '📱',
    name: 'Social Media Content Pack',
    target: 'Small businesses, coaches, beauty industry',
    problem: 'No time to post, blank page syndrome, inconsistent presence',
    price: 'R200–R400',
    script: 'I create 30 days of social media posts for your business. You never run out of content again. R250 WhatsApp me your business name and I start today.',
    delivery: '30 posts delivered as PDF or WhatsApp messages',
  },
  {
    icon: '💬',
    name: 'Customer Attraction Message Pack',
    target: 'Anyone selling anything — products or services',
    problem: 'Not knowing what to say, messages get ignored',
    price: 'R100–R200',
    script: 'I write WhatsApp messages that make people want to buy from you. 10 proven sales messages written for YOUR product. R120 results guaranteed or I rewrite for free.',
    delivery: '10 customised sales messages + follow-up scripts via WhatsApp',
  },
  {
    icon: '🚀',
    name: 'Side Hustle Starter Pack',
    target: 'Employed people wanting extra income, beginners',
    problem: 'Not knowing where to start, no idea what to sell',
    price: 'R150–R300',
    script: 'I help people start earning online in 48 hours using their existing skills. No quitting your job needed. R200 for the complete starter system.',
    delivery: 'Personalised offer + 5 customer scripts + daily action plan via WhatsApp',
  },
]

function LandingInner() {
  const searchParams  = useSearchParams()
  const ref           = searchParams.get('ref') || ''
  const [sponsorName, setSponsorName]   = useState('')
  const [activeProduct, setActiveProduct] = useState<number|null>(null)
  const [user,          setUser]          = useState<any>(null)
  const [unlocked,      setUnlocked]      = useState(false)
  const [showReg,       setShowReg]       = useState(false)
  const [regName,       setRegName]       = useState('')
  const [regEmail,      setRegEmail]      = useState('')
  const [regWa,         setRegWa]         = useState('')
  const [paying,        setPaying]        = useState(false)
  const [payError,      setPayError]      = useState('')
  const [regLoading,    setRegLoading]    = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        const { data: unlock } = await supabase.from('ai_income_unlocks').select('*').eq('user_id', u.id).single()
        if (unlock) setUnlocked(true)
      }
    })
    if (ref) {
      fetch('/api/sponsor?ref=' + encodeURIComponent(ref))
        .then(r => r.json()).then(d => { if (d?.name) setSponsorName(d.name) }).catch(() => {})
    }
  }, [ref])

  const handlePay = async () => {
    if (!user) { setShowReg(true); return }
    setPaying(true); setPayError('')
    try {
      const res = await fetch('/api/yoco', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_checkout', user_id: user.id, ref_code: ref, tier: 'ai_income' }),
      })
      const data = await res.json()
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl }
      else { setPayError(data.error || 'Payment failed'); setPaying(false) }
    } catch (e: any) { setPayError(e.message); setPaying(false) }
  }

  const handleRegPay = async () => {
    if (!regName.trim() || !regEmail.trim() || !regWa.trim()) return
    setRegLoading(true)
    const pwd = 'Z2B' + Math.random().toString(36).slice(2, 10).toUpperCase() + '!'
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

  const P = '#4C1D95'  // purple
  const PL = '#7C3AED' // purple light
  const G = '#B8860B'  // gold dark
  const GL = '#D4AF37' // gold light
  const W = '#ffffff'
  const DARK = '#0F0A1E'

  return (
    <div style={{ minHeight: '100vh', background: W, color: DARK, fontFamily: 'Georgia, serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
        .cta-btn { transition: all 0.2s !important; }
        .cta-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 16px 48px rgba(76,29,149,0.4) !important; }
        .product-row { transition: all 0.2s !important; }
        .product-row:hover { box-shadow: 0 8px 32px rgba(76,29,149,0.1) !important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(76,29,149,0.1)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '16px', fontWeight: 900, color: P }}>Z2B 4M</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {unlocked
            ? <Link href="/ai-income" style={{ padding: '8px 20px', background: P, borderRadius: '20px', color: W, fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Enter System →</Link>
            : <>
                <Link href="/login?redirect=/ai-income" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none' }}>Sign In</Link>
                <button onClick={handlePay} style={{ padding: '8px 20px', background: `linear-gradient(135deg,${P},${PL})`, border: 'none', borderRadius: '20px', color: W, fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Start R500 →</button>
              </>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg, #F8F5FF 0%, #FFFFFF 50%, #FFF8E7 100%)`, padding: '80px 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* BG decoration */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, rgba(76,29,149,0.08), transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, rgba(212,175,55,0.1), transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeUp 0.8s ease' }}>

          {/* Sponsor badge */}
          {sponsorName && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '40px', padding: '8px 20px', marginBottom: '24px' }}>
              <span>🏆</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>Invited by {sponsorName}</span>
            </div>
          )}

          {/* AI pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `rgba(76,29,149,0.06)`, border: `1px solid rgba(76,29,149,0.15)`, borderRadius: '40px', padding: '8px 20px', marginBottom: '28px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: P, animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: P, letterSpacing: '2px', textTransform: 'uppercase' }}>60-Day AI Income Activation Program</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 'clamp(34px,6vw,58px)', fontWeight: 900, color: DARK, margin: '0 0 16px', lineHeight: 1.1 }}>
            Z2B 4M:<br />
            <span style={{ background: `linear-gradient(135deg,${P},${PL},#9333EA)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              60-Day Mobile<br />Money Machine
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '17px', fontWeight: 700, color: P, marginBottom: '8px' }}>
            AI-Powered Smartphone Income System: R500 · 60-Day AI Income Activation Program
          </p>
          <p style={{ fontSize: '16px', color: '#475569', maxWidth: '540px', margin: '0 auto 16px', lineHeight: 1.8 }}>
            Turn your smartphone into an AI-powered income system — using WhatsApp, simple tools, and execution-based steps.
          </p>

          {/* Rev quote */}
          <div style={{ display: 'inline-block', background: `linear-gradient(135deg,${P},${PL})`, borderRadius: '16px', padding: '16px 28px', marginBottom: '36px', maxWidth: '480px' }}>
            <p style={{ fontSize: '15px', fontStyle: 'italic', color: W, margin: '0 0 6px', lineHeight: 1.6 }}>
              "If they underpay you or fail to employ you, deploy yourself."
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 700 }}>— Rev Mokoro Manana, Founder Z2B</p>
          </div>

          {/* Core promise */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', margin: '0 auto 36px', textAlign: 'left' }}>
            {[
              'You do NOT need to resign from employment prematurely',
              'You do NOT need experience or a laptop',
              'You need to start EARNING first — fast',
            ].map(line => (
              <div key={line} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#059669', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>✓</span>
                <span style={{ fontSize: '14px', color: '#374151' }}>{line}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {payError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px', marginBottom: '16px', fontSize: '13px', color: '#991B1B' }}>⚠️ {payError}</div>}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handlePay} disabled={paying} className="cta-btn"
              style={{ padding: '18px 44px', background: `linear-gradient(135deg,${P},${PL})`, border: 'none', borderRadius: '14px', color: W, fontWeight: 700, fontSize: '17px', cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'Cinzel,Georgia,serif', boxShadow: '0 8px 32px rgba(76,29,149,0.3)', opacity: paying ? 0.7 : 1 }}>
              {paying ? 'Setting up...' : '🚀 Start 4M Machine — R500'}
            </button>
            <Link href="/invite" style={{ padding: '18px 28px', background: W, border: '2px solid #E2E8F0', borderRadius: '14px', color: '#475569', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
              🍽️ Z2B Table Banquet →
            </Link>
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '12px' }}>60-day access · R500/month after · Cancel anytime</p>
        </div>
      </section>

      {/* ── TRUTH SECTION ── */}
      <section style={{ background: W, padding: '56px 24px', borderTop: `3px solid ${GL}` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: P, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>WHY MOST PEOPLE STAY STUCK</div>
              {[
                'They wait for jobs that pay enough',
                'They resign prematurely from employment',
                'They are stuck in a learning loop that never converts to income',
                'They overthink online business',
                'They have motivation — but no system',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ color: '#DC2626', fontSize: '14px', flexShrink: 0 }}>✗</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: `linear-gradient(135deg,${P},${PL})`, borderRadius: '20px', padding: '32px 28px', color: W }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>THE TRUTH</div>
              <p style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.6, margin: '0 0 16px' }}>
                Information alone does NOT create income.
              </p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: GL, lineHeight: 1.4, margin: 0 }}>
                Information + Execution does.
              </p>
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                Z2B 4M activates income first — so motivation becomes self-sustaining.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4M FRAMEWORK — THE CAR ANALOGY ── */}
      <section style={{ background: '#F8F5FF', padding: '72px 24px', borderTop: '1px solid #EDE9FE' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: P, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>THE 4M FRAMEWORK</div>
            <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, color: DARK, margin: '0 0 12px' }}>
              Choose Your 4M Machine Level
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '480px', margin: '0 auto' }}>
              Start manual. Upgrade to automatic. Scale to electric.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '40px' }}>
            {[
              { icon:'🚗', mode:'Manual Mode', tier:'Starter · Bronze · Copper',
                headline:"You drive everything yourself.",
                sub:"This is where you LEARN how to make money.",
                color:P, bg:'#F3F0FF',
                points:['AI Offer Generator — your first sellable product','AI Customer Finder — exactly who to contact','AI Post Generator — copy-paste ready content','AI Reply System — handle every objection','AI Closing Assistant — collect payment confidently'],
                badge:'LEARN & EARN',
              },
              { icon:'⚙️', mode:'Automatic Mode', tier:'Silver ⭐ — MOST IMPORTANT',
                headline:"The system starts helping you drive.",
                sub:"From struggle to FLOW — your 4M Machine works WITH you.",
                color:'#0891B2', bg:'#F0F9FF',
                points:['Product Multiplication — 1 idea becomes 5 products','1-Click Launch Pack — WhatsApp + Facebook + DM together','5-Day Follow-Up Sequences — never lose a lead','Buffer Auto-Scheduling — post while you sleep','Make.com Automation — connect to any app'],
                badge:'AUTOMATION BEGINS',
              },
              { icon:'⚡', mode:'Electric Mode', tier:'Gold · Platinum',
                headline:"The system drives most of the journey.",
                sub:"Your 4M Machine runs with MINIMAL EFFORT.",
                color:G, bg:'#FFFBEB',
                points:['D-ID Video Avatars — AI talks for you','n8n Workflows — full daily automation engine','Twilio WhatsApp API — bulk sequences at scale','Replicate Image AI — auto-generate product visuals','Multiple income streams running simultaneously'],
                badge:'SELF-SUSTAINING',
              },
            ].map(({ icon, mode, tier, headline, color, bg, points, badge }) => (
              <div key={mode} style={{ background: bg, borderRadius: '20px', padding: '28px 20px', border: `2px solid ${color}25`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '14px', right: '14px', background: color, borderRadius: '6px', padding: '3px 8px', fontSize: '9px', fontWeight: 700, color: W, letterSpacing: '1px' }}>{badge}</div>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{icon}</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color, fontFamily: 'Cinzel,Georgia,serif', marginBottom: '4px' }}>{mode}</div>
                <div style={{ fontSize: '11px', color, fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{tier}</div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: DARK, fontWeight: 700, marginBottom: '4px' }}>{headline}</div>
                <div style={{ fontSize: '12px', color, fontWeight: 700, marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${color}20` }}>{(v as any).sub || ''}</div>
                {points.map(pt => (
                  <div key={pt} style={{ display: 'flex', gap: '8px', marginBottom: '7px' }}>
                    <span style={{ color, fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>✦</span>
                    <span style={{ fontSize: '12px', color: '#374151' }}>{pt}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Killer line */}
          <div style={{ textAlign: 'center', padding: '24px', background: DARK, borderRadius: '16px' }}>
            <p style={{ fontSize: '20px', fontWeight: 700, color: GL, fontStyle: 'italic', margin: '0 0 8px' }}>
              "Start manual. Upgrade to automatic. Scale to electric."
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Your 4M Machine. Your pace. Your income.</p>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section style={{ background: W, padding: '72px 24px', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: P, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>COMPLETE SYSTEM</div>
            <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: DARK, margin: 0 }}>Everything Inside the 4M Machine</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
            {[
              { icon: '🧠', title: 'AI Offer Generator', desc: 'Creates your personalised sellable offer from your existing skills', color: P },
              { icon: '📲', title: 'AI Customer Finder', desc: 'Exact strategy to find paying customers on WhatsApp and Facebook today', color: PL },
              { icon: '✍️', title: 'AI Post Generator', desc: 'WhatsApp statuses, Facebook posts, and direct messages ready to send', color: '#EC4899' },
              { icon: '💬', title: 'AI Reply System', desc: 'Handles every customer objection with ready-to-send replies', color: '#059669' },
              { icon: '💸', title: 'AI Closing Assistant', desc: 'Scripts to close confidently and collect payment from any customer', color: '#D97706' },
              { icon: '🔁', title: 'Daily R300/Day Engine', desc: 'Daily checklist to contact 20 people, post 3 times, close 1-3 clients', color: '#0891B2' },
              { icon: '🔁', title: 'Product Multiplication Engine', desc: 'Turn ONE digital product into 5 new variations automatically', color: P },
              { icon: '🚀', title: '1-Click Launch System', desc: 'WhatsApp post + DM script + Facebook post generated in one click', color: PL },
              { icon: '📅', title: '5-Day Follow-Up Sequences', desc: 'Never lose a lead again with automated follow-up message sequences', color: '#0891B2' },
              { icon: '⚡', title: 'Full Automation Blueprints', desc: 'Daily automation schedule, income tracker, and 30-day projections', color: G },
              { icon: '🤖', title: 'Coach Manlaw — The Executor', desc: 'AI coach that pushes ACTION over theory. Execution first, always.', color: P },
              { icon: '🔗', title: 'Referral Booster System', desc: 'Earn R200 per referral. Turn sharing into a second income stream.', color: '#059669' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} style={{ display: 'flex', gap: '14px', padding: '18px', background: '#FAFBFF', borderRadius: '14px', border: '1px solid #F1F5F9', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: DARK, marginBottom: '3px' }}>{title}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COACH MANLAW ── */}
      <section style={{ background: `linear-gradient(135deg,${P},${PL})`, padding: '72px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>YOUR AI COACH</div>
            <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '30px', fontWeight: 900, color: W, margin: '0 0 16px', lineHeight: 1.2 }}>🤖 Coach Manlaw<br />The Executor</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, margin: '0 0 20px' }}>
              Not a chatbot. Not a theory teacher. Coach Manlaw is your AI execution partner — built to push you from ideas into income. Every single day.
            </p>
            <div style={{ fontSize: '13px', fontWeight: 700, color: GL, letterSpacing: '1px', marginBottom: '12px' }}>PRIORITY: ACTION → INCOME → EXECUTION</div>
            {['Sales objection handler', 'Income accountability partner', 'Mindset correction engine', 'Price vs Cost educator'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: GL, fontSize: '12px' }}>✦</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Coach Manlaw in Action:</div>
            {[
              { q: 'I do not know what to sell', a: 'Tell me 3 things you are good at. I will turn one into a R150 offer you can launch today.' },
              { q: 'The customer said it is too expensive', a: 'That means you have not shown enough value yet. Say this: "What would it be worth if I solved [problem] for you?"' },
              { q: 'I am scared to message people', a: 'Fear is not the problem. Inaction is. Send 5 messages right now. Come back and tell me the responses.' },
            ].map(({ q, a }, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? '16px' : 0, paddingBottom: i < 2 ? '16px' : 0, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>👤 "{q}"</div>
                <div style={{ fontSize: '13px', color: W, lineHeight: 1.6 }}>🤖 {a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 DIGITAL PRODUCTS ── */}
      <section style={{ background: '#F8F5FF', padding: '72px 24px', borderTop: '1px solid #EDE9FE' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: P, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>READY-TO-SELL</div>
            <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: DARK, margin: '0 0 10px' }}>5 Digital Products — Built In</h2>
            <p style={{ fontSize: '14px', color: '#64748B' }}>Click any product to see the selling script. Copy. Send. Earn.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DIGITAL_PRODUCTS.map((p, i) => (
              <div key={i} className="product-row"
                onClick={() => setActiveProduct(activeProduct === i ? null : i)}
                style={{ background: W, borderRadius: '16px', border: `1.5px solid ${activeProduct === i ? P : '#E2E8F0'}`, overflow: 'hidden', cursor: 'pointer', boxShadow: activeProduct === i ? '0 8px 32px rgba(76,29,149,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: DARK }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Price: {p.price} · {p.target}</div>
                  </div>
                  <div style={{ fontSize: '18px', color: '#94A3B8', transition: 'transform 0.2s', transform: activeProduct === i ? 'rotate(180deg)' : 'none' }}>⌄</div>
                </div>
                {activeProduct === i && (
                  <div style={{ padding: '0 22px 22px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0' }}>
                      <div style={{ background: '#F8F5FF', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: P, letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Problem You Solve</div>
                        <div style={{ fontSize: '13px', color: '#475569' }}>{p.problem}</div>
                      </div>
                      <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>Delivery</div>
                        <div style={{ fontSize: '13px', color: '#475569' }}>{p.delivery}</div>
                      </div>
                    </div>
                    <div style={{ background: '#F8F5FF', borderRadius: '12px', padding: '16px', border: '1px solid #E0E7FF', marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: P, letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>📋 Selling Script — Copy & Send</div>
                      <div style={{ fontSize: '13px', color: DARK, lineHeight: 1.8, fontStyle: 'italic' }}>"{p.script}"</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(p.script) }}
                      style={{ padding: '10px 22px', background: P, border: 'none', borderRadius: '10px', color: W, fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                      📋 Copy Script & Launch
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: `linear-gradient(135deg,${P}10,${PL}08)`, padding: '72px 24px', borderTop: `3px solid ${GL}` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: P, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>SIMPLE 4-STEP EXECUTION</div>
            <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: DARK, margin: 0 }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { step: '01', icon: '📱', title: 'Join the Z2B Community', desc: 'Name, Email, WhatsApp. You get dashboard access + your unique referral link + full 4M system.' },
              { step: '02', icon: '📋', title: 'Follow Day 1 Instructions', desc: 'Coach Manlaw activates. You get your first action plan. No guessing. No waiting.' },
              { step: '03', icon: '💬', title: 'Send Offers Using AI Scripts', desc: 'Generate your offer, find your customers, send the messages. AI does the hard thinking.' },
              { step: '04', icon: '💰', title: 'Close & Repeat Daily', desc: 'Use the closing assistant. Collect payment. Add to your income tracker. Repeat tomorrow.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ background: W, borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0', position: 'relative' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg,${P},${PL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, color: W, fontFamily: 'Cinzel,Georgia,serif', marginBottom: '12px' }}>{step}</div>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: DARK, marginBottom: '6px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: W, borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: DARK, margin: '0 0 4px' }}>You do not study business.</p>
            <p style={{ fontSize: '17px', fontWeight: 900, color: P, margin: 0 }}>You build income habits.</p>
          </div>
        </div>
      </section>

      {/* ── PRICE vs COST ── */}
      <section style={{ background: W, padding: '72px 24px', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: DARK, margin: 0 }}>Price vs Cost</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', borderRadius: '20px', padding: '32px', border: '2px solid #86EFAC' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>💵 THE PRICE</div>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#059669', fontFamily: 'Cinzel,Georgia,serif', marginBottom: '4px' }}>R500</div>
              <div style={{ fontSize: '14px', color: '#166534', marginBottom: '20px' }}>60-Day AI Income Activation Program</div>
              {['Full 4M Machine — 3 vehicles', '12 AI-powered tools', '5 ready-to-sell digital products', 'Coach Manlaw guidance 24/7', 'Referral income R200/referral', '60-day execution plan'].map(item => (
                <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#059669', fontSize: '14px' }}>✅</span>
                  <span style={{ fontSize: '14px', color: '#166534' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)', borderRadius: '20px', padding: '32px', border: '2px solid #FCA5A5' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>❗ COST OF NOT STARTING</div>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#DC2626', fontFamily: 'Cinzel,Georgia,serif', marginBottom: '4px' }}>∞</div>
              <div style={{ fontSize: '14px', color: '#991B1B', marginBottom: '20px' }}>Paid in freedom, time and purpose</div>
              {['Working for someone else for life', 'No financial freedom', 'No time freedom', 'No purpose or fulfilment', 'Stuck in the income cycle forever', 'Missed opportunities every day', 'No legacy to leave behind'].map(item => (
                <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#DC2626', fontSize: '14px' }}>❌</span>
                  <span style={{ fontSize: '14px', color: '#991B1B' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: DARK, borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: '19px', fontWeight: 700, color: GL, fontStyle: 'italic', margin: '0 0 16px', lineHeight: 1.6 }}>
              "The PRICE is R500.<br />The COST is your future lifestyle, freedom, and missed opportunity."
            </p>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['R500 is the cost of starting.', 'You are choosing direction, not buying access.', 'Delay is more expensive than action.'].map(line => (
                <span key={line} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>✦ {line}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT HAPPENS AFTER 4M ── */}
      <section style={{ background: '#F8F5FF', padding: '64px 24px', borderTop: '1px solid #EDE9FE' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: P, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Z2B ECOSYSTEM PATHWAY</div>
          <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: DARK, margin: '0 0 12px' }}>4M is Just the Beginning</h2>
          <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px', lineHeight: 1.7 }}>
            After your 4M Machine is running — you graduate into the full Z2B wealth ecosystem.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px', marginBottom: '28px' }}>
            {[
              { icon: '🥉', title: 'Z2B Membership Income', desc: 'Bronze → Platinum tiers with escalating income streams and app builds' },
              { icon: '🏗️', title: 'PWA App Business Ownership', desc: 'Your own digital business with apps built for you' },
              { icon: '🎓', title: 'Entrepreneurial Consumer Workshop', desc: '99 sessions across 4 legs — Mindset, Money, Legacy, Momentum' },
              { icon: '🍽️', title: 'Z2B Table Banquet Ecosystem', desc: 'Full network marketing system, community, and generational wealth tools' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: W, borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: DARK, marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: `linear-gradient(135deg,${P},${PL})`, borderRadius: '16px', padding: '24px 32px', display: 'inline-block', textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: GL, marginBottom: '8px' }}>🧠 Important</div>
            <p style={{ fontSize: '15px', color: W, margin: '0 0 4px', fontWeight: 700 }}>4M = Income Activation</p>
            <p style={{ fontSize: '15px', color: W, margin: '0 0 12px', fontWeight: 700 }}>Z2B Ecosystem = Wealth Expansion</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>First you earn. Then you accelerate your legacy building.</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: `linear-gradient(160deg,${DARK},#1E1B4B)`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(165,180,252,0.7)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>STOP WAITING</div>
          <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(30px,5vw,48px)', fontWeight: 900, color: W, margin: '0 0 12px', lineHeight: 1.1 }}>
            Start Activating<br />
            <span style={{ background: 'linear-gradient(135deg,#A5B4FC,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Income From Your Phone
            </span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '12px' }}>
            Z2B 4M is your entry point into the Z2B Wealth Ecosystem.
          </p>
          <p style={{ fontSize: '28px', fontWeight: 900, fontStyle: 'italic', color: GL, marginBottom: '32px', lineHeight: 1.4 }}>
            "If they underpay you or fail to employ you, deploy yourself."
          </p>
          {payError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', color: '#FCA5A5', fontSize: '13px' }}>⚠️ {payError}</div>}
          <button onClick={handlePay} disabled={paying} className="cta-btn"
            style={{ display: 'block', width: '100%', maxWidth: '440px', margin: '0 auto 14px', padding: '20px', background: `linear-gradient(135deg,${P},${PL})`, border: 'none', borderRadius: '16px', color: W, fontWeight: 700, fontSize: '18px', cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'Cinzel,Georgia,serif', boxShadow: '0 12px 48px rgba(76,29,149,0.5)', opacity: paying ? 0.7 : 1 }}>
            {paying ? 'Setting up payment...' : '🚀 Join the Z2B 4M Community — R500'}
          </button>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            Already a member? <Link href="/login?redirect=/ai-income" style={{ color: '#A5B4FC', textDecoration: 'none', fontWeight: 700 }}>Sign in →</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: P, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: GL, marginBottom: '8px' }}>Z2B 4M</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Mobile · Money · Machine · Messaging</div>
        <div style={{ height: '1px', background: 'rgba(212,175,55,0.3)', maxWidth: '200px', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.8 }}>
          Built for execution. Designed for income. Powered by AI.<br />
          © {new Date().getFullYear()} Zero2Billionaires Amavulandlela PTY Ltd
        </p>
      </footer>

      {/* ── REGISTRATION MODAL ── */}
      {showReg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: W, borderRadius: '24px', padding: '36px 32px', maxWidth: '440px', width: '100%', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            <button onClick={() => setShowReg(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: '#64748B' }}>×</button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚀</div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: DARK, margin: '0 0 4px', fontFamily: 'Cinzel,Georgia,serif' }}>Create Your Account</h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Then proceed to R500 payment</p>
            </div>
            {payError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '13px', color: '#991B1B' }}>⚠️ {payError}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {[{ l: 'Full Name', v: regName, s: setRegName, p: 'Your full name', t: 'text' }, { l: 'Email', v: regEmail, s: setRegEmail, p: 'your@email.com', t: 'email' }, { l: 'WhatsApp', v: regWa, s: setRegWa, p: '+27 or 0XX XXX XXXX', t: 'tel' }].map(({ l, v, s, p, t }) => (
                <div key={l}>
                  <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '5px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>{l} *</label>
                  <input type={t} value={v} onChange={e => s(e.target.value)} placeholder={p}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'Georgia,serif', color: DARK }} />
                </div>
              ))}
            </div>
            <button onClick={handleRegPay} disabled={regLoading}
              style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg,${P},${PL})`, border: 'none', borderRadius: '12px', color: W, fontWeight: 700, fontSize: '16px', cursor: regLoading ? 'not-allowed' : 'pointer', fontFamily: 'Cinzel,Georgia,serif', opacity: regLoading ? 0.7 : 1 }}>
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4C1D95', fontFamily: 'Georgia,serif', fontSize: '16px' }}>Loading...</div>}>
      <LandingInner />
    </Suspense>
  )
}
