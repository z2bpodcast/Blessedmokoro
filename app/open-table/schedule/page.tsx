'use client'
// FILE: app/open-table/schedule/page.tsx
// Public Open Table landing — for prospects arriving via builder invite link
// ?ref=BUILDERCODE → traced · already registered → login option · no ref → Rev default

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function SchedulePage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const ref          = searchParams.get('ref') || 'REVMOK2B'

  const [sponsorName,  setSponsorName]  = useState<string | null>(null)
  const [user,         setUser]         = useState<any>(null)
  const [checking,     setChecking]     = useState(true)
  const [showReg,      setShowReg]      = useState(false)
  const [fullName,     setFullName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [whatsapp,     setWhatsapp]     = useState('')
  const [regLoading,   setRegLoading]   = useState(false)
  const [regError,     setRegError]     = useState('')

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setChecking(false)
    })
    // Fetch sponsor name
    fetch(`/api/sponsor?ref=${encodeURIComponent(ref)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setSponsorName(d.name) })
      .catch(() => {})
  }, [ref])

  const handleRegister = async () => {
    if (!fullName.trim()) { setRegError('Please enter your full name.'); return }
    if (!email.trim() || !email.includes('@')) { setRegError('Please enter a valid email.'); return }
    if (!whatsapp.trim()) { setRegError('Please enter your WhatsApp number.'); return }
    setRegLoading(true); setRegError('')
    const tempPwd = `Z2B${Math.random().toString(36).slice(2,10).toUpperCase()}!`
    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: tempPwd,
      options: { data: { full_name: fullName.trim(), whatsapp: whatsapp.trim(), referred_by: ref || null } }
    })
    if (signUpErr && !signUpErr.message.toLowerCase().includes('already')) {
      setRegError(signUpErr.message); setRegLoading(false); return
    }
    // If already registered — redirect to login
    if (signUpErr?.message.toLowerCase().includes('already')) {
      router.push(`/login?redirect=/open-table`)
      return
    }
    // Success — go straight to Open Table
    router.push('/open-table')
  }

  // ── Countdown to next Sunday 8PM SAST
  const [countdown, setCountdown] = useState({ d:0,h:0,m:0,s:0 })
  useEffect(() => {
    const tick = () => {
      const now  = new Date()
      const sast = new Date(now.toLocaleString('en-US',{ timeZone:'Africa/Johannesburg' }))
      const day  = sast.getDay()
      const diff0 = day===0 && sast.getHours()<20 ? 0 : day===0 ? 7 : 7-day
      const target = new Date(sast)
      target.setDate(sast.getDate()+diff0); target.setHours(20,0,0,0)
      const ms = target.getTime()-sast.getTime()
      if (ms<=0) return
      setCountdown({ d:Math.floor(ms/86400000), h:Math.floor((ms%86400000)/3600000), m:Math.floor((ms%3600000)/60000), s:Math.floor((ms%60000)/1000) })
    }
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id)
  },[])
  const pad = (n:number) => String(n).padStart(2,'0')

  const AGENDA = [
    { time:'8:00–8:05',  icon:'🙏', title:'Opening Prayer & Welcome' },
    { time:'8:05–8:15',  icon:'🏆', title:'This Week at the Table' },
    { time:'8:15–8:30',  icon:'📚', title:'One Teaching — 4 Legs Rotation' },
    { time:'8:30–8:45',  icon:'🎙️', title:'Builder Spotlight' },
    { time:'8:45–8:55',  icon:'🙋', title:'Open Floor — Q&A' },
    { time:'8:55–9:00',  icon:'🌟', title:'Closing Call to Action' },
  ]

  if (checking) return (
    <div style={{ minHeight:'100vh', background:'#09060F', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#09060F', color:'#F0EEF8', fontFamily:'Georgia,serif' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      {/* Nav */}
      <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(9,6,15,0.9)', backdropFilter:'blur(16px)' }}>
        <Link href="/" style={{ fontSize:'14px', fontWeight:700, color:'#D4AF37', textDecoration:'none' }}>Z2B Table Banquet</Link>
        <div style={{ display:'flex', gap:'10px' }}>
          <Link href="/workshop" style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>Free Workshop</Link>
          {user
            ? <Link href="/open-table" style={{ fontSize:'13px', padding:'7px 16px', background:'linear-gradient(135deg,#065F46,#10B981)', border:'1px solid rgba(16,185,129,0.4)', borderRadius:'20px', color:'#6EE7B7', fontWeight:700, textDecoration:'none' }}>Enter the Table →</Link>
            : <Link href="/login?redirect=/open-table" style={{ fontSize:'13px', padding:'7px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'20px', color:'rgba(255,255,255,0.6)', fontWeight:700, textDecoration:'none' }}>Sign In</Link>
          }
        </div>
      </div>

      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'0 20px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', padding:'48px 0 36px' }}>
          <div style={{ fontSize:'11px', letterSpacing:'4px', color:'rgba(212,175,55,0.5)', marginBottom:'16px', textTransform:'uppercase' }}>Every Sunday · 8PM SA Time</div>
          <div style={{ fontSize:'56px', marginBottom:'10px' }}>🍽️</div>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(28px,5vw,44px)', fontWeight:900, color:'#fff', margin:'0 0 12px' }}>The Open Table</h1>
          <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.55)', lineHeight:1.8, maxWidth:'500px', margin:'0 auto' }}>
            A weekly live gathering where builders, prospects and Rev come together. Community conversation all week. Live session every Sunday.
          </p>
        </div>

        {/* Sponsor banner */}
        {sponsorName && (
          <div style={{ background:'rgba(16,185,129,0.08)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'14px', padding:'16px 20px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#065F46,#10B981)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>🏆</div>
            <div>
              <div style={{ fontSize:'12px', color:'rgba(110,231,183,0.6)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'2px' }}>You were personally invited by</div>
              <div style={{ fontSize:'17px', fontWeight:700, color:'#6EE7B7' }}>{sponsorName}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>Your sponsor is permanently credited when you join</div>
            </div>
          </div>
        )}

        {/* Countdown */}
        <div style={{ background:'linear-gradient(135deg,rgba(44,27,105,0.5),rgba(76,29,149,0.3))', border:'2px solid rgba(212,175,55,0.3)', borderRadius:'18px', padding:'28px 20px', textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'11px', letterSpacing:'3px', color:'rgba(212,175,55,0.5)', marginBottom:'16px', textTransform:'uppercase' }}>Next Session In</div>
          <div style={{ display:'flex', justifyContent:'center', gap:'16px', flexWrap:'wrap', marginBottom:'20px' }}>
            {[['DAYS',pad(countdown.d)],['HRS',pad(countdown.h)],['MIN',pad(countdown.m)],['SEC',pad(countdown.s)]].map(([lbl,val]) => (
              <div key={lbl} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(32px,7vw,48px)', fontWeight:900, color:'#D4AF37', lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.3)', marginTop:'4px' }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* CTA — registered vs new */}
          {user ? (
            <Link href="/open-table" style={{ display:'inline-block', padding:'16px 36px', background:'linear-gradient(135deg,#065F46,#10B981)', border:'none', borderRadius:'14px', color:'#fff', fontWeight:700, fontSize:'16px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', letterSpacing:'1px' }}>
              🍽️ Enter The Open Table →
            </Link>
          ) : (
            <button onClick={() => setShowReg(true)} style={{ padding:'16px 36px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'2px solid #D4AF37', borderRadius:'14px', color:'#FDE68A', fontWeight:700, fontSize:'16px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', letterSpacing:'1px' }}>
              🍽️ Join & Enter The Table →
            </button>
          )}
          {!user && (
            <div style={{ marginTop:'12px', fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>
              Already a member?{' '}
              <Link href="/login?redirect=/open-table" style={{ color:'rgba(212,175,55,0.7)', fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
            </div>
          )}
        </div>

        {/* Registration modal */}
        {showReg && !user && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(8px)' }}>
            <div style={{ background:'linear-gradient(160deg,#0F0820,#1E1245)', border:'2px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'36px 32px', maxWidth:'440px', width:'100%', position:'relative', fontFamily:'Georgia,serif' }}>
              <button onClick={() => setShowReg(false)} style={{ position:'absolute', top:'14px', right:'14px', background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'50%', width:'32px', height:'32px', color:'rgba(255,255,255,0.5)', fontSize:'18px', cursor:'pointer' }}>×</button>
              <div style={{ textAlign:'center', marginBottom:'22px' }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>🍽️</div>
                <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Pull Up Your Chair</h2>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', margin:0 }}>Free to join · No credit card · Enter the table instantly</p>
              </div>
              {sponsorName && (
                <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'10px', padding:'10px 14px', marginBottom:'18px', fontSize:'13px', color:'#6EE7B7', textAlign:'center' }}>
                  🏆 {sponsorName} will be credited as your sponsor
                </div>
              )}
              {regError && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#FCA5A5' }}>⚠️ {regError}</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'18px' }}>
                {[
                  { label:'Full Name', val:fullName, set:setFullName, ph:'Your full name', type:'text' },
                  { label:'Email', val:email, set:setEmail, ph:'your@email.com', type:'email' },
                  { label:'WhatsApp', val:whatsapp, set:setWhatsapp, ph:'+27 or 0XX XXX XXXX', type:'tel' },
                ].map(({ label, val, set, ph, type }) => (
                  <div key={label}>
                    <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', letterSpacing:'1px', textTransform:'uppercase' }}>{label} *</label>
                    <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', color:'#fff', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const }} />
                  </div>
                ))}
              </div>
              <button onClick={handleRegister} disabled={regLoading} style={{ width:'100%', padding:'15px', background: regLoading ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg,#B8860B,#D4AF37)', border:'none', borderRadius:'12px', color:'#000', fontWeight:900, fontSize:'16px', cursor: regLoading ? 'not-allowed' : 'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                {regLoading ? 'Joining...' : 'Enter The Open Table →'}
              </button>
              <div style={{ textAlign:'center', marginTop:'14px', fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>
                Already registered?{' '}
                <Link href="/login?redirect=/open-table" style={{ color:'rgba(212,175,55,0.6)', fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
              </div>
            </div>
          </div>
        )}

        {/* Agenda */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'10px', letterSpacing:'3px', color:'rgba(212,175,55,0.45)', textAlign:'center', marginBottom:'18px', textTransform:'uppercase' }}>Sunday Session Agenda</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {AGENDA.map((item,i) => (
              <div key={i} style={{ display:'flex', gap:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:'4px solid rgba(212,175,55,0.4)', borderRadius:'10px', padding:'13px 16px', alignItems:'center' }}>
                <span style={{ fontSize:'18px' }}>{item.icon}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{item.title}</span>
                </div>
                <span style={{ fontSize:'11px', color:'rgba(212,175,55,0.55)', background:'rgba(212,175,55,0.07)', padding:'2px 10px', borderRadius:'20px', whiteSpace:'nowrap' as const }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign:'center', padding:'28px', background:'linear-gradient(135deg,rgba(44,27,105,0.4),rgba(76,29,149,0.2))', border:'1.5px solid rgba(212,175,55,0.2)', borderRadius:'16px' }}>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.6)', marginBottom:'18px', lineHeight:1.75 }}>
            The table is always set. Join the community. Show up on Sunday. Bring someone next week.
          </p>
          {user
            ? <Link href="/open-table" style={{ display:'inline-block', padding:'14px 32px', background:'linear-gradient(135deg,#065F46,#10B981)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'15px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>🍽️ Enter The Open Table →</Link>
            : <button onClick={() => setShowReg(true)} style={{ padding:'14px 32px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'2px solid #D4AF37', borderRadius:'12px', color:'#FDE68A', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>🌟 Join Free & Enter →</button>
          }
        </div>

      </div>
    </div>
  )
}

export default function OpenTableScheduleWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#09060F', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <SchedulePage />
    </Suspense>
  )
}
