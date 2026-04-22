'use client'
// FILE: app/invite/page.tsx
// Z2B Public Invite Page — https://app.z2blegacybuilders.co.za/invite
//
// HOW IT WORKS:
//   • Reads ?ref=XXXXX from the URL
//   • Shows the full marketing invite page
//   • "View the Platform" button → /signup?ref=XXXXX  (passes ref through)
//   • Every builder shares: https://app.z2blegacybuilders.co.za/invite?ref=THEIRCODE

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ─── Inner component (needs useSearchParams so must be wrapped in Suspense) ───
function InvitePage() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref') || 'REVMOK2B'

  const signupUrl = `/signup?ref=${ref}`
  const appUrl    = `https://app.z2blegacybuilders.co.za/invite?ref=${ref}`

  // ── Payment modal state ──
  const [modal,        setModal]       = useState(false)
  const [selTier,      setSelTier]     = useState<{name:string,price:string,amount:number}|null>(null)
  const [step,         setStep]        = useState<'register'|'paying'|'done'>('register')
  const [fullName,     setFullName]    = useState('')
  const [email,        setEmail]       = useState('')
  const [whatsapp,     setWhatsapp]    = useState('')
  const [modalError,   setModalError]  = useState('')
  const [modalLoading, setModalLoading]= useState(false)

  // Sponsor name — fetched from profiles using ref code
  const [sponsorName, setSponsorName] = useState<string | null>(null)

  useEffect(() => {
    if (!ref) return
    // Fetch sponsor name for ALL ref codes including default
    fetch(`/api/sponsor?ref=${encodeURIComponent(ref)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.name) setSponsorName(data.name) })
      .catch(() => {})
  }, [ref])

  const tierAmounts: Record<string,number> = {
    bronze:2500, copper:5000, silver:12000, gold:24000, platinum:50000
  }

  const openModal = (name: string, price: string) => {
    const tierKey = name.toLowerCase()
    window.location.href = `/pricing?compare=true&autoopen=${encodeURIComponent(tierKey)}&ref=${encodeURIComponent(ref)}`
  }

  const handlePay = async () => {
    if (!fullName.trim()) { setModalError('Please enter your full name.'); return }
    if (!email.trim() || !email.includes('@')) { setModalError('Please enter a valid email address.'); return }
    if (!whatsapp.trim()) { setModalError('Please enter your WhatsApp number.'); return }
    if (!selTier) return

    setModalLoading(true); setModalError('')

    try {
      // Step 1 — Light registration (temp password, full profile done in dashboard)
      const tempPassword = `Z2B${Math.random().toString(36).slice(2,10).toUpperCase()}!`
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: tempPassword,
        options: { data: { full_name: fullName.trim(), whatsapp: whatsapp.trim(), referred_by: ref || null } },
      })

      let userId = authData?.user?.id

      // If already registered — sign them in
      if (signUpError?.message?.toLowerCase().includes('already registered') || signUpError?.message?.toLowerCase().includes('already exists')) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: tempPassword,
        })
        if (signInErr) {
          setModalError('This email is already registered. Please sign in to your account first.')
          setModalLoading(false)
          return
        }
        userId = signInData?.user?.id
      }

      if (!userId) {
        setModalError('Registration failed. Please try again.')
        setModalLoading(false)
        return
      }

      // Step 2 — Create Yoco checkout
      const res = await fetch('/api/yoco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:   'create_checkout',
          user_id:  userId,
          ref_code: ref || '',
          tier:     selTier.name.toLowerCase(),
        }),
      })

      // Safe JSON parse — response may be empty on network/server errors
      let data: any = {}
      const rawText = await res.text()
      try {
        if (rawText) data = JSON.parse(rawText)
      } catch {
        setModalError('Payment service returned an unexpected response. Please try again.')
        setModalLoading(false)
        return
      }

      if (!res.ok || !data.checkoutUrl) {
        setModalError(data.error || `Payment setup failed (${res.status}). Please try again.`)
        setModalLoading(false)
        return
      }

      // Step 3 — Redirect to Yoco
      setStep('paying')
      window.location.href = data.checkoutUrl

    } catch (err: any) {
      setModalError(err.message || 'Something went wrong. Please try again.')
      setModalLoading(false)
    }
  }

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box }

        :root {
          --purple:  #2D1B69;
          --purpleM: #4C1D95;
          --purpleL: #7C3AED;
          --gold:    #D4AF37;
          --goldL:   #FDE68A;
          --goldD:   #B8860B;
          --white:   #F9F7FF;
          --ink:     #1E1245;
          --bg:      #09060F;
        }

        .inv-body {
          background: #09060F;
          color: #F9F7FF;
          font-family: 'Georgia', serif;
          font-size: 18px;
          line-height: 1.7;
          overflow-x: hidden;
          min-height: 100vh;
        }
        .inv-body::before {
          content: '';
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 50% at 15% 10%, rgba(76,29,149,.22) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 85% 85%, rgba(212,175,55,.09) 0%, transparent 65%);
          pointer-events: none;
        }
        .wrap { position:relative; z-index:1; max-width:780px; margin:0 auto; padding:0 24px 80px; }

        /* HEADER */
        .site-header { text-align:center; padding:52px 24px 0; }
        .eyebrow { font-family:'Georgia',serif; font-size:11px; letter-spacing:4px; color:rgba(212,175,55,.55); margin-bottom:18px; text-transform:uppercase; }
        .tagline { font-family:'Georgia',serif; font-size:clamp(28px,5.5vw,48px); font-weight:900; line-height:1.1; margin-bottom:20px; color:#fff; }
        .tagline span { color:var(--gold); }
        .sub { font-size:clamp(17px,2.5vw,21px); color:rgba(249,247,255,.58); max-width:560px; margin:0 auto 14px; font-style:italic; }
        .divider { width:80px; height:2px; background:linear-gradient(90deg,transparent,var(--gold),transparent); margin:22px auto 0; }

        /* TARGET PILL */
        .target-pill { display:inline-block; background:rgba(212,175,55,.08); border:1.5px solid rgba(212,175,55,.25); border-radius:40px; padding:10px 24px; font-size:15px; color:var(--gold); margin:32px auto 0; text-align:center; }

        /* SECTION LABEL */
        .section-label { font-family:'Georgia',serif; font-size:10px; letter-spacing:3px; color:rgba(212,175,55,.45); text-align:center; margin:60px 0 28px; text-transform:uppercase; }

        /* PAIN POINTS */
        .pains { display:flex; flex-direction:column; gap:14px; margin-bottom:16px; }
        .pain-card { display:flex; align-items:flex-start; gap:16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-left:4px solid var(--purpleL); border-radius:12px; padding:18px 20px; }
        .pain-stat { font-family:'Georgia',serif; font-size:24px; font-weight:900; color:var(--gold); min-width:64px; line-height:1; padding-top:4px; }
        .pain-text strong { display:block; font-size:17px; color:#fff; margin-bottom:4px; }
        .pain-text p { font-size:15px; color:rgba(249,247,255,.55); line-height:1.6; }

        /* MIRROR */
        .mirror { background:linear-gradient(135deg,rgba(44,27,105,.45),rgba(76,29,149,.2)); border:1.5px solid rgba(212,175,55,.22); border-radius:20px; padding:40px 36px; text-align:center; margin:16px 0; }
        .mirror-quote { font-size:clamp(20px,3.5vw,30px); font-weight:600; font-style:italic; color:#fff; line-height:1.4; margin-bottom:18px; }
        .mirror-quote span { color:var(--gold); }
        .mirror-body { font-size:16px; color:rgba(249,247,255,.62); max-width:500px; margin:0 auto; line-height:1.75; }

        /* NEEDS GRID */
        .needs-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:16px 0; }
        @media(max-width:560px){ .needs-grid { grid-template-columns:1fr; } }
        .need-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:22px 20px; position:relative; overflow:hidden; }
        .need-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--gold),transparent); }
        .need-number { font-family:'Georgia',serif; font-size:11px; letter-spacing:2px; color:rgba(212,175,55,.5); margin-bottom:10px; text-transform:uppercase; }
        .need-title { font-family:'Georgia',serif; font-size:17px; font-weight:700; color:var(--gold); margin-bottom:10px; line-height:1.2; }
        .need-body { font-size:15px; color:rgba(249,247,255,.58); line-height:1.65; }
        .need-need { font-size:13px; color:rgba(212,175,55,.7); font-style:italic; margin-top:8px; }

        /* SOLUTION HEADER */
        .solution-header { text-align:center; padding:16px 0 28px; }
        .solution-header h2 { font-family:'Georgia',serif; font-size:clamp(22px,4vw,34px); font-weight:900; color:#fff; margin-bottom:12px; line-height:1.2; }
        .solution-header h2 span { color:var(--gold); }
        .solution-header p { font-size:17px; color:rgba(249,247,255,.58); max-width:520px; margin:0 auto; }

        /* 4 LEGS */
        .legs-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:16px 0; }
        @media(max-width:560px){ .legs-grid { grid-template-columns:1fr; } }
        .leg-card { background:rgba(212,175,55,.06); border:1.5px solid rgba(212,175,55,.2); border-radius:14px; padding:24px 20px; text-align:center; }
        .leg-icon { font-size:32px; margin-bottom:10px; }
        .leg-name { font-family:'Georgia',serif; font-size:16px; font-weight:700; color:var(--gold); margin-bottom:8px; }
        .leg-desc { font-size:14px; color:rgba(249,247,255,.55); line-height:1.6; }
        .leg-need { font-size:13px; color:rgba(212,175,55,.7); font-style:italic; margin-top:8px; }

        /* PROMISE */
        .promise { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:36px 32px; margin:14px 0; }
        .promise h3 { font-family:'Georgia',serif; font-size:20px; color:#fff; margin-bottom:22px; text-align:center; }
        .promise-list { list-style:none; display:flex; flex-direction:column; gap:14px; }
        .promise-list li { display:flex; align-items:flex-start; gap:14px; font-size:16px; color:rgba(249,247,255,.72); line-height:1.6; }
        .promise-list li::before { content:'✦'; color:var(--gold); font-size:14px; padding-top:3px; flex-shrink:0; }

        /* WORKSHOP BOX */
        .workshop-box { background:linear-gradient(135deg,rgba(44,27,105,.5),rgba(76,29,149,.3)); border:2px solid rgba(212,175,55,.35); border-radius:20px; padding:40px 32px; text-align:center; margin:14px 0; }
        .workshop-box .pre { font-family:'Georgia',serif; font-size:10px; letter-spacing:3px; color:rgba(212,175,55,.55); margin-bottom:14px; text-transform:uppercase; }
        .workshop-box h2 { font-family:'Georgia',serif; font-size:clamp(20px,4vw,30px); font-weight:900; color:#fff; margin-bottom:14px; line-height:1.2; }
        .workshop-box h2 span { color:var(--gold); }
        .workshop-box p { font-size:16px; color:rgba(249,247,255,.6); max-width:480px; margin:0 auto 28px; line-height:1.75; }

        /* CTA BUTTON */
        .cta-btn { display:inline-block; padding:18px 44px; background:linear-gradient(135deg,#2D1B69,#4C1D95); border:2px solid var(--gold); border-radius:14px; font-family:'Georgia',serif; font-size:17px; font-weight:700; color:var(--goldL); text-decoration:none; letter-spacing:1px; cursor:pointer; transition:transform .2s, box-shadow .2s; }
        .cta-btn:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(212,175,55,.2); }
        .cta-sub { display:block; margin-top:12px; font-size:13px; color:rgba(249,247,255,.35); font-style:italic; }

        /* SIGN */
        .sign { text-align:center; padding:52px 24px 0; border-top:1px solid rgba(255,255,255,.06); margin-top:52px; }
        .sign-name { font-family:'Georgia',serif; font-size:20px; color:var(--gold); margin-bottom:6px; }
        .sign-title { font-size:15px; color:rgba(249,247,255,.45); }
        .sign-hashtag { font-size:13px; color:rgba(212,175,55,.4); margin-top:14px; letter-spacing:1px; }

        /* ANIMATIONS */
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .inv-body .wrap > * { animation: fadeUp 0.7s ease both; }
        .inv-body .wrap > *:nth-child(1) { animation-delay: 0.05s; }
        .inv-body .wrap > *:nth-child(2) { animation-delay: 0.15s; }
        .inv-body .wrap > *:nth-child(3) { animation-delay: 0.25s; }
        .inv-body .wrap > *:nth-child(4) { animation-delay: 0.35s; }
      `}</style>

      <div className="inv-body">
        <div className="wrap">

          {/* ── HEADER ── */}
          <header className="site-header">
            <div style={{ textAlign:'left', marginBottom:'10px' }}>
              <Link href="/" style={{ fontSize:'13px', color:'rgba(212,175,55,0.8)', textDecoration:'none' }}>← Back to Home</Link>
            </div>
            <p className="eyebrow">Zero2Billionaires Amavulandlela Pty Ltd</p>
            <h1 className="tagline">
              You Were Never Built<br/>
              to <span>Work for Someone Else</span><br/>
              Forever.
            </h1>
            <p className="sub">This is for the employee who already knows it — and is ready to do something about it.</p>
            <div className="divider" />
            <div style={{ marginTop:'28px' }}>
              <span className="target-pill">
                This is NOT for every employee. This is for the one who dares to dream beyond the payslip.
              </span>
            </div>
          </header>

          {/* ── PAIN POINTS ── */}
          <p className="section-label">The Reason You Are Still Reading This</p>
          <p style={{ textAlign:'center', fontSize:'15px', color:'rgba(255,255,255,0.5)', fontStyle:'italic', maxWidth:'560px', margin:'0 auto 28px', lineHeight:'1.8' }}>
            Research across millions of employed people worldwide reveals a pattern that is hard to ignore. These are not isolated feelings — they are global statistics about the employee experience.
          </p>

          <div className="pains">
            {[
              { stat:'45%', title:'Of employees are working for someone else\'s dream', body:'Nearly half of all employees want to be their own boss — but most never take the first step because they do not know where to start.' },
              { stat:'70%', title:'Of employees run out of salary before month-end', body:'7 in 10 employees say inflation is overtaking their income. The annual raise never keeps up with the cost of living that rises every month.' },
              { stat:'62%', title:'Of employees are in a toxic or draining work environment', body:'Difficult management. Office politics. Being overlooked by people they are smarter than. 40+ hours a week in an environment that kills the spirit.' },
              { stat:'100%', title:'Of employees cannot pass their job to their children', body:'Everything built at that company belongs to the company. When an employee leaves — it disappears. No inheritance. No legacy. Nothing to pass on.' },
              { stat:'97%', title:'Of those who made the transition never go back', body:'Of employees who successfully transitioned from employment to entrepreneurship — 97% say they would never return to traditional employment. The freedom is real.' },
            ].map(({ stat, title, body }) => (
              <div key={stat} className="pain-card">
                <div className="pain-stat">{stat}</div>
                <div className="pain-text">
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── MIRROR MOMENT ── */}
          <div className="mirror">
            <p className="mirror-quote">
              "The dream is not the problem.<br/>
              <span>The preparation is what is missing."</span>
            </p>
            <p className="mirror-body">
              You already have the vision. You already feel the pull. What you need is not motivation — you have enough of that. What you need is a structured path to prepare yourself <em>before</em> you leap.
            </p>
          </div>

          {/* ── THE 4 NEEDS ── */}
          <p className="section-label">What You Actually Need Before You Quit</p>
          <div className="needs-grid">
            {[
              { num:'NEED 01', title:'A New Mindset & Psychology', body:'Employment programs your mind to wait for instruction, to fear failure, and to trade time for money. Entrepreneurship requires the complete opposite. Before you build a business — you must rebuild your thinking.', need:'Most people skip this. Most businesses fail because of it.' },
              { num:'NEED 02', title:'Business Systems That Run Without You', body:'A job is someone else\'s system. A business without systems is just another job — one you own. You need to understand how to build income-generating systems while you are still employed.', need:'Build the system before you need it to survive.' },
              { num:'NEED 03', title:'Strategic Relationships', body:'You cannot build an empire alone. The right relationships — mentors, partners, clients and a community — are worth more than capital. Your network is your net worth.', need:'Who you know determines how fast you grow.' },
              { num:'NEED 04', title:'A Vision Bigger Than Yourself', body:'The entrepreneurs who survive hardship are those driven by something beyond personal gain — a family to liberate, a community to serve, a legacy that outlives them.', need:'A vision bigger than you cannot be stopped by circumstances.' },
            ].map(({ num, title, body, need }) => (
              <div key={num} className="need-card">
                <p className="need-number">{num}</p>
                <h3 className="need-title">{title}</h3>
                <p className="need-body">{body}</p>
                <p className="need-need">{need}</p>
              </div>
            ))}
          </div>

          {/* ── THE SOLUTION — 3D BANNER ── */}
          <div style={{ margin:'60px 0 40px', textAlign:'center', position:'relative' }}>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'340px', height:'120px', background:'radial-gradient(ellipse, rgba(124,58,237,0.45) 0%, transparent 70%)', pointerEvents:'none', filter:'blur(24px)' }} />
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'260px', height:'80px', background:'radial-gradient(ellipse, rgba(212,175,55,0.2) 0%, transparent 70%)', pointerEvents:'none', filter:'blur(16px)' }} />
            <div style={{ fontFamily:'Georgia,serif', fontSize:'11px', letterSpacing:'5px', color:'rgba(212,175,55,0.5)', marginBottom:'16px', position:'relative', textTransform:'uppercase' }}>
              What Changes Everything
            </div>
            <div style={{ position:'relative', display:'inline-block' }}>
              <span style={{ fontFamily:'Georgia,serif', fontSize:'clamp(52px,11vw,88px)', fontWeight:900, letterSpacing:'4px', lineHeight:1, background:'linear-gradient(180deg, #FDE68A 0%, #D4AF37 40%, #B8860B 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', display:'block', filter:'drop-shadow(0 4px 24px rgba(212,175,55,0.35)) drop-shadow(0 2px 0px rgba(184,134,11,0.8))', transform:'perspective(400px) rotateX(6deg)', transformOrigin:'center bottom' }}>
                THE SOLUTION
              </span>
              <span style={{ fontFamily:'Georgia,serif', fontSize:'clamp(52px,11vw,88px)', fontWeight:900, letterSpacing:'4px', lineHeight:1, color:'rgba(76,29,149,0.5)', position:'absolute', top:'6px', left:'4px', display:'block', zIndex:-1, transform:'perspective(400px) rotateX(6deg)', transformOrigin:'center bottom', WebkitTextFillColor:'rgba(76,29,149,0.45)' }}>
                THE SOLUTION
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginTop:'18px', position:'relative' }}>
              <div style={{ height:'1.5px', width:'60px', background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.6))' }} />
              <div style={{ width:'8px', height:'8px', background:'#D4AF37', transform:'rotate(45deg)' }} />
              <div style={{ height:'1.5px', width:'60px', background:'linear-gradient(90deg,rgba(212,175,55,0.6),transparent)' }} />
            </div>
          </div>

          <div className="solution-header">
            <h2>The Z2B Entrepreneurial<br/><span>Consumer Workshop</span></h2>
            <p>A structured, practical, AI-powered workshop designed for working employees who want to build the foundation of a business — without quitting their job first.</p>
          </div>

          {/* ── 4 LEGS ── */}
          <div className="legs-grid">
            {[
              { icon:'🧠', name:'Mindset', desc:'Rebuild your psychology from employee to entrepreneur. Understand money, fear, identity and the mental frameworks of people who build lasting wealth.', need:'↳ Addresses your need for mental preparation' },
              { icon:'⚙️', name:'Systems', desc:'Learn to identify, build and own income-generating systems — while you are still employed. Step by step. Practically. At your own pace.', need:'↳ Addresses your need for business systems' },
              { icon:'🤝', name:'Relationships', desc:'Join a community of like-minded builders. Develop strategic connections. Learn the art of human capital — the relationships that accelerate everything.', need:'↳ Addresses your need for a strategic network' },
              { icon:'🌍', name:'Legacy', desc:'Build something that outlives you. Develop a vision that goes beyond personal income — and create wealth that can be inherited by your children and community.', need:'↳ Addresses your need for purpose and direction' },
            ].map(({ icon, name, desc, need }) => (
              <div key={name} className="leg-card">
                <div className="leg-icon">{icon}</div>
                <h3 className="leg-name">{name}</h3>
                <p className="leg-desc">{desc}</p>
                <p className="leg-need">{need}</p>
              </div>
            ))}
          </div>

          {/* ── SESSION CATEGORIES ── */}
          <p className="section-label">What Is Inside — 99 Sessions Across 5 Categories</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'14px' }}>
            {[
              { bg:'rgba(76,29,149,0.1)', border:'rgba(76,29,149,0.35)', color:'#C4B5FD', badgeBg:'rgba(76,29,149,0.3)', icon:'🧠', name:'Mindset', count:'17 Sessions', desc:'Psychological preparation · Identity shift · Beliefs about money · Faith foundations' },
              { bg:'rgba(184,134,11,0.08)', border:'rgba(184,134,11,0.3)', color:'#FDE68A', badgeBg:'rgba(184,134,11,0.25)', icon:'⚙️', name:'Systems', count:'40 Sessions', desc:'AI tools · Income models · Platform funnels · Automation · Financial systems' },
              { bg:'rgba(6,95,70,0.1)', border:'rgba(6,95,70,0.35)', color:'#6EE7B7', badgeBg:'rgba(6,95,70,0.3)', icon:'✦', name:'Relationships', count:'24 Sessions', desc:'Circle of Twelve · Partnerships · Leadership · Community · Human capital' },
              { bg:'rgba(124,45,18,0.1)', border:'rgba(124,45,18,0.35)', color:'#FED7AA', badgeBg:'rgba(124,45,18,0.3)', icon:'◈', name:'Legacy', count:'10 Sessions', desc:'Generational wealth · Vision beyond self · Stewardship · Kingdom impact' },
            ].map(({ bg, border, color, badgeBg, icon, name, count, desc }) => (
              <div key={name} style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:'12px', padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontFamily:'Georgia,serif', fontSize:'16px', fontWeight:700, color }}>{icon} {name}</span>
                  <span style={{ background:badgeBg, color, fontSize:'12px', fontWeight:700, padding:'4px 14px', borderRadius:'20px' }}>{count}</span>
                </div>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.55)', lineHeight:'1.7', margin:0 }}>{desc}</p>
              </div>
            ))}
            {/* Morning Bonus */}
            <div style={{ background:'rgba(30,64,175,0.08)', border:'1.5px solid rgba(30,64,175,0.3)', borderRadius:'12px', padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
              <div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'16px', fontWeight:700, color:'#93C5FD', marginBottom:'6px' }}>☀ Morning Bonus Sessions</div>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.55)', lineHeight:'1.7', margin:0 }}>9 surprise sessions waiting for you inside — not listed here. Discovered by members who show up daily.</p>
              </div>
              <span style={{ background:'rgba(30,64,175,0.25)', color:'#93C5FD', fontSize:'13px', fontWeight:700, padding:'6px 16px', borderRadius:'20px', whiteSpace:'nowrap' }}>9 Sessions 🎁</span>
            </div>
          </div>

          {/* ── THE PROMISE ── */}
          <p className="section-label">Our Commitment to You</p>
          <div className="promise">
            <h3>We Do Not Just Teach. We Build With You.</h3>
            <ul className="promise-list">
              {[
                'The systems we show you that you need — we will help you build those very systems inside our platform. Real tools. Real infrastructure. Not theory.',
                'The relationships we tell you that you need — we will help you build them through our Builders Table, Open Table sessions and Bonfire inner circle.',
                'The AI tools we introduce you to — we put them directly in your hands. Coach Manlaw, your AI business coach, is available 24 hours a day, 7 days a week.',
                'The income streams we teach you about — we have built a compensation plan that activates from your very first day as a member. You learn and earn simultaneously.',
                'Everything that Z2B Table Banquet offers — the Content Engine, the Visual Studio, the community, the marketplace — comes to you as a bonus once you walk through the workshop door.',
              ].map((text, i) => <li key={i}>{text}</li>)}
            </ul>
          </div>

          {/* ── MEMBERSHIP + CTA ── */}
          <div className="workshop-box">
            <p className="pre">Your Next Step</p>

            {/* Sponsor assurance — visible on page before clicking any tier */}
            {sponsorName && (
              <div style={{ background:'rgba(16,185,129,0.08)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'14px', padding:'16px 20px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'14px', textAlign:'left' as const }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg,#065F46,#10B981)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>🏆</div>
                <div>
                  <div style={{ fontSize:'12px', color:'rgba(110,231,183,0.7)', letterSpacing:'1px', textTransform:'uppercase' as const, marginBottom:'2px' }}>You were personally invited by</div>
                  <div style={{ fontSize:'18px', fontWeight:700, color:'#6EE7B7', fontFamily:'Cinzel,Georgia,serif' }}>{sponsorName}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>When you pay — {sponsorName} is permanently credited as your sponsor. This never changes.</div>
                </div>
              </div>
            )}

            <h2>Choose Your Seat at the<br/><span>Billionaire Table</span></h2>
            <p>99 sessions. 4 Legs. Built while you are still employed. The real question is not what it costs — it is what it costs you to stay where you are.</p>

            {/* Opportunity Cost */}
            <div style={{ background:'rgba(0,0,0,0.25)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'14px', padding:'20px 22px', marginBottom:'24px', textAlign:'left' }}>
              <div style={{ fontFamily:'Georgia,serif', fontSize:'11px', letterSpacing:'2px', color:'rgba(212,175,55,0.55)', marginBottom:'14px', textTransform:'uppercase' }}>The Real Cost of Not Joining</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  { title:'Financial Freedom', body:'Every month without a plan is another month working for someone else\'s dream.' },
                  { title:'Time Freedom', body:'Your time is your most finite asset. It is the one thing you cannot earn back.' },
                  { title:'Fulfilment', body:'Building something of your own produces a satisfaction that no salary ever replaces.' },
                  { title:'Creating a Legacy', body:'Your children can inherit a system. They cannot inherit your job title.' },
                ].map(({ title, body }) => (
                  <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                    <span style={{ color:'#D4AF37', fontSize:'18px', flexShrink:0 }}>✦</span>
                    <div><strong style={{ color:'#fff', fontSize:'14px' }}>{title}</strong> <span style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px' }}>— {body}</span></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'16px', paddingTop:'14px', borderTop:'1px solid rgba(212,175,55,0.15)', fontSize:'13px', color:'rgba(212,175,55,0.75)', fontStyle:'italic', textAlign:'center' }}>
                The membership fee is not your real cost. Staying unprepared is. Working your entire life for someone else's dream — because fear kept you from starting your own — is.
              </div>
            </div>

            {/* Tiers */}
            <div style={{ fontFamily:'Georgia,serif', fontSize:'11px', letterSpacing:'2px', color:'rgba(212,175,55,0.55)', marginBottom:'14px', textTransform:'uppercase' }}>Choose Your Membership Tier</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'22px', textAlign:'left' }}>
              {[
                { color:'#CD7F32', border:'rgba(205,127,50,0.35)', bg:'rgba(205,127,50,0.08)', emoji:'🥉', name:'Bronze', price:'R480', desc:'Workshop Only — All 99 sessions + Z2B Table Banquet Business Systems included free.' },
                { color:'#B87333', border:'rgba(184,115,51,0.35)', bg:'rgba(184,115,51,0.08)', emoji:'🥈', name:'Copper', price:'R1200', desc:'All Bronze benefits + Z2B Flip Your Household Expenses to Income Generating Assets Programme.' },
                { color:'#C0C0C0', border:'rgba(192,192,192,0.3)', bg:'rgba(192,192,192,0.06)', emoji:'🥇', name:'Silver', price:'R2500', desc:'All Copper benefits + We build One App for you.' },
                { color:'#D4AF37', border:'rgba(212,175,55,0.35)', bg:'rgba(212,175,55,0.07)', emoji:'💛', name:'Gold', price:'R5000', desc:'All Silver benefits + Two Apps built for you after completing all 99 sessions + Z2B Gold Pool Profit Sharing.' },
                { color:'#E5E4E2', border:'rgba(229,228,226,0.3)', bg:'rgba(229,228,226,0.06)', emoji:'💎', name:'Platinum', price:'R12000', desc:'All Gold benefits + Four Apps built for you + Z2B Platinum Pool Profit Sharing + White Label License to sell selected Z2B Apps under your own brand. T&Cs apply.' },
              ].map(({ color, border, bg, emoji, name, price, desc }) => (
                <div key={name}
                  onClick={() => openModal(name, price)}
                  style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:'12px', padding:'16px 18px', cursor:'pointer', transition:'all 0.15s' }}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                    <span style={{ fontFamily:'Georgia,serif', fontSize:'15px', fontWeight:700, color }}>{emoji} {name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontFamily:'Georgia,serif', fontSize:'16px', fontWeight:900, color }}>{price}</span>
                      <span style={{ background:color, color:'#000', fontSize:'10px', fontWeight:900, padding:'3px 10px', borderRadius:'20px', whiteSpace:'nowrap' as const }}>PAY NOW →</span>
                    </div>
                  </div>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', margin:0, lineHeight:'1.65' }}>{desc}</p>
                </div>
              ))}
            </div>

            <div style={{ fontSize:'12px', color:'rgba(212,175,55,0.6)', fontStyle:'italic', marginBottom:'22px', textAlign:'center' }}>
              ✦ All paid memberships include free access to Z2B Table Banquet Business Systems ✦
            </div>

            {/* Free Viewing */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'16px 20px', marginBottom:'24px', textAlign:'left' }}>
              <div style={{ fontFamily:'Georgia,serif', fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'8px', letterSpacing:'1px', textTransform:'uppercase' }}>Free Membership — Platform Viewing</div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:'1.7', margin:0 }}>
                Like a property viewing before you buy — we invite you to explore our platform for free so you can make an informed decision. Browse the workshop, meet Coach Manlaw, and see what your investment unlocks. When you are ready, choose your tier and take your seat at the table.
              </p>
            </div>

            {/* CTA — passes ref through */}
            <Link href={signupUrl} className="cta-btn">
              View the Platform — Then Choose Your Seat
            </Link>
            <span className="cta-sub">
              Free to view · No pressure · Choose your tier when ready ·{' '}
              <Link href={`${signupUrl}&pricing=1`} style={{ color:'rgba(212,175,55,0.6)', textDecoration:'none' }}>Full membership details inside →</Link>
            </span>
          </div>

          {/* ── SIGN ── */}
          <div className="sign">
            <p className="sign-name">Rev Mokoro Manana</p>
            <p className="sign-title">Founder & CEO · Zero2Billionaires Amavulandlela Pty Ltd</p>
            <p className="sign-title" style={{ marginTop:'6px', fontStyle:'italic', color:'rgba(249,247,255,0.38)' }}>
              "I was an employee. I know what it costs to stay. I also know what it is worth to leave prepared."
            </p>
            <p className="sign-hashtag">#Reka_Obesa_Okatuka · app.z2blegacybuilders.co.za</p>
          </div>

        </div>{/* end .wrap */}
      </div>{/* end .inv-body */}
    <>

      {/* ══════════════════════════════════════════════
          PAYMENT MODAL
      ══════════════════════════════════════════════ */}
      {modal && selTier && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'linear-gradient(160deg,#0F0820,#1E1245)', border:'2px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'36px 32px', maxWidth:'460px', width:'100%', position:'relative', fontFamily:'Georgia,serif' }}>

            {/* Close */}
            <button onClick={() => setModal(false)} style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'50%', width:'34px', height:'34px', color:'rgba(255,255,255,0.5)', fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>×</button>

            {/* Header */}
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'11px', letterSpacing:'3px', color:'rgba(212,175,55,0.5)', marginBottom:'8px', textTransform:'uppercase' }}>Securing Your Seat</div>
              <h2 style={{ fontSize:'22px', fontWeight:900, color:'#fff', margin:'0 0 6px' }}>{selTier.name} Membership</h2>
              <div style={{ fontSize:'32px', fontWeight:900, color:'#D4AF37' }}>{selTier.price}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'4px' }}>Once-off · No monthly fees · Lifetime access</div>
            </div>

            {/* Sponsor assurance inside modal */}
            {sponsorName && (
              <div style={{ background:'rgba(16,185,129,0.08)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'12px', padding:'14px 18px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#065F46,#10B981)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>🏆</div>
                <div>
                  <div style={{ fontSize:'12px', color:'rgba(110,231,183,0.7)', letterSpacing:'1px', textTransform:'uppercase' as const, marginBottom:'2px' }}>Your sponsor</div>
                  <div style={{ fontSize:'16px', fontWeight:700, color:'#6EE7B7' }}>{sponsorName}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>Permanently credited the moment your payment goes through</div>
                </div>
              </div>
            )}

            {step === 'register' && (
              <>
                {modalError && (
                  <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#FCA5A5' }}>
                    ⚠️ {modalError}
                  </div>
                )}

                {/* Form */}
                <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'20px' }}>
                  <div>
                    <label style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Full Name *</label>
                    <input
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', color:'#fff', fontSize:'15px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>Email Address *</label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', color:'#fff', fontSize:'15px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', display:'block', marginBottom:'6px', letterSpacing:'1px', textTransform:'uppercase' }}>WhatsApp Number *</label>
                    <input
                      type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                      placeholder="+27 or 0XX XXX XXXX"
                      style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', color:'#fff', fontSize:'15px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const }}
                    />
                  </div>
                </div>

                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginBottom:'16px', textAlign:'center', lineHeight:'1.6' }}>
                  Your account is created instantly. Complete your full profile inside your Dashboard after payment.
                </div>

                {/* Pay button */}
                <button onClick={handlePay} disabled={modalLoading}
                  style={{ width:'100%', padding:'16px', background: modalLoading ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg,#B8860B,#D4AF37)', border:'none', borderRadius:'12px', color:'#000', fontWeight:900, fontSize:'17px', cursor: modalLoading ? 'not-allowed' : 'pointer', fontFamily:'Cinzel,Georgia,serif', letterSpacing:'1px' }}>
                  {modalLoading ? 'Setting up payment...' : `Pay ${selTier.price} Now →`}
                </button>

                {/* Already a member */}
                <div style={{ textAlign:'center', marginTop:'16px', fontSize:'13px', color:'rgba(255,255,255,0.3)' }}>
                  Already a member?{' '}
                  <a href="/login" style={{ color:'rgba(212,175,55,0.6)', textDecoration:'none', fontWeight:700 }}>Sign in →</a>
                </div>
              </>
            )}

            {step === 'paying' && (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:'40px', marginBottom:'16px' }}>⏳</div>
                <p style={{ color:'#D4AF37', fontWeight:700, fontSize:'16px', marginBottom:'8px' }}>Redirecting to payment...</p>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px' }}>You will be taken to Yoco to complete your payment securely.</p>
              </div>
            )}

          </div>
        </div>
      )}
    </>

    </>
  )
}

// ─── Default export wrapped in Suspense (required for useSearchParams) ─────────
export default function InvitePageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#09060F', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif', fontSize:'18px' }}>
        Loading...
      </div>
    }>
      <InvitePage />
    </Suspense>
  )
}
