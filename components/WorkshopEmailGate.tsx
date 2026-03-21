'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Props {
  onEnter: (email: string) => void
  showLoginOption?: boolean
}

export default function WorkshopEmailGate({ onEnter, showLoginOption = true }: Props) {
  const [mode, setMode]           = useState<'register' | 'login'>('register')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [checking, setChecking]   = useState(true)
  const searchParams = useSearchParams()
  const refCode = searchParams?.get('ref') || ''

  // ── On mount: check if already logged in — bypass gate entirely ──
  useEffect(() => {
    const bypass = async () => {
      try {
        // Check localStorage first for speed
        const stored = localStorage.getItem('z2b_workshop_email')
        if (stored) { onEnter(stored); return }

        // Check live Supabase session
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          localStorage.setItem('z2b_workshop_email', user.email)
          onEnter(user.email)
          return
        }
      } catch(e) {}
      setChecking(false)
    }
    bypass()
  }, [onEnter])

  // Show nothing while checking session — prevents gate flash for logged-in users
  if (checking) {
    return (
      <div style={{ position:'fixed', inset:0, background:'#0A0015', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid rgba(212,175,55,0.2)', borderTop:'3px solid #D4AF37', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Register handler ──
  const handleRegister = async () => {
    setError('')
    if (!firstName.trim()) { setError('Please enter your first name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    try {
      await supabase.from('workshop_prospects').upsert({
        email: email.toLowerCase().trim(),
        first_name: firstName.trim(),
        referred_by: refCode || null,
        registered_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      }, { onConflict: 'email', ignoreDuplicates: false })

      localStorage.setItem('z2b_workshop_email', email.toLowerCase().trim())
      localStorage.setItem('z2b_workshop_first_name', firstName.trim())
      if (refCode) localStorage.setItem('z2b_ref', refCode)
      onEnter(email.toLowerCase().trim())
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Login handler ──
  const handleLogin = async () => {
    setError('')
    if (!email.trim() || !email.includes('@')) { setError('Please enter your email.'); return }
    if (!password.trim()) { setError('Please enter your password.'); return }
    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (signInError) { setError('Incorrect email or password. Please try again.'); return }
      if (data.user?.email) {
        localStorage.setItem('z2b_workshop_email', data.user.email)
        onEnter(data.user.email)
      }
    } catch {
      setError('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: '10px', padding: '13px 16px',
    color: '#fff', fontSize: '15px', outline: 'none',
    fontFamily: 'Georgia,serif', width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'linear-gradient(135deg,#0A0015,#1A0035)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'linear-gradient(135deg,#1A0035,#0D0020)', border:'2px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'40px 32px', maxWidth:'420px', width:'100%', textAlign:'center', fontFamily:'Georgia,serif' }}>

        <img src="/logo.jpg" alt="Z2B" style={{ width:'72px', height:'72px', borderRadius:'16px', margin:'0 auto 20px', border:'2px solid #D4AF37', display:'block' }} />

        {/* Mode toggle — only shown if showLoginOption */}
        {showLoginOption && (
          <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:'12px', padding:'4px', marginBottom:'24px', gap:'4px' }}>
            <button onClick={() => { setMode('register'); setError('') }} style={{ flex:1, padding:'9px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, transition:'all 0.2s', background:mode==='register'?'rgba(212,175,55,0.2)':'transparent', color:mode==='register'?'#D4AF37':'rgba(255,255,255,0.45)', borderBottom:mode==='register'?'2px solid #D4AF37':'2px solid transparent' }}>
              New Here
            </button>
            <button onClick={() => { setMode('login'); setError('') }} style={{ flex:1, padding:'9px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, transition:'all 0.2s', background:mode==='login'?'rgba(124,58,237,0.2)':'transparent', color:mode==='login'?'#C4B5FD':'rgba(255,255,255,0.45)', borderBottom:mode==='login'?'2px solid #7C3AED':'2px solid transparent' }}>
              Already Registered
            </button>
          </div>
        )}

        {mode === 'register' ? (
          <>
            <div style={{ fontSize:'12px', color:'#D4AF37', letterSpacing:'3px', fontWeight:'bold', marginBottom:'10px' }}>FREE WORKSHOP</div>
            <h2 style={{ fontSize:'24px', fontWeight:'bold', color:'#fff', marginBottom:'8px', lineHeight:1.3 }}>Your seat is ready.</h2>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', marginBottom:'24px', lineHeight:1.7 }}>
              Access Sessions 1–9 free. No credit card required.
            </p>

            {refCode && (
              <div style={{ background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'10px', padding:'10px 14px', marginBottom:'20px', fontSize:'12px', color:'#D4AF37' }}>
                🌱 You were invited by a Z2B Builder — your sponsor will be credited when you upgrade.
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
              <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} style={inp} />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handleRegister()} style={inp} />
            </div>

            {error && <div style={{ color:'#FCA5A5', fontSize:'13px', marginBottom:'12px' }}>{error}</div>}

            <button onClick={handleRegister} disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#B8860B,#D4AF37)', color:'#000', border:'none', borderRadius:'12px', padding:'14px', fontSize:'16px', fontWeight:'bold', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'Georgia,serif' }}>
              {loading ? 'Saving your seat...' : 'Access Free Workshop →'}
            </button>

            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'14px' }}>
              No spam. No monthly fees. Unsubscribe anytime.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize:'24px', fontWeight:'bold', color:'#fff', marginBottom:'8px', lineHeight:1.3 }}>Welcome back.</h2>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', marginBottom:'24px', lineHeight:1.7 }}>
              Sign in to continue your workshop journey.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()} style={inp} />
            </div>

            {error && <div style={{ color:'#FCA5A5', fontSize:'13px', marginBottom:'12px' }}>{error}</div>}

            <button onClick={handleLogin} disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', color:'#fff', border:'1.5px solid #D4AF37', borderRadius:'12px', padding:'14px', fontSize:'16px', fontWeight:'bold', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'Georgia,serif' }}>
              {loading ? 'Signing in...' : 'Sign In & Continue →'}
            </button>

            <div style={{ marginTop:'16px', display:'flex', justifyContent:'center', gap:'16px' }}>
              <Link href="/login" style={{ fontSize:'12px', color:'rgba(196,181,253,0.6)', textDecoration:'underline' }}>
                Full sign in page
              </Link>
              <Link href="/signup" style={{ fontSize:'12px', color:'rgba(212,175,55,0.6)', textDecoration:'underline' }}>
                Create account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
