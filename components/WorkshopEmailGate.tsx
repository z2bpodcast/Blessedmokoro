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
  const [mode, setMode]             = useState<'register' | 'login' | 'reset'>('register')
  const [firstName, setFirstName]   = useState('')
  const [whatsapp, setWhatsapp]     = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [resetSent, setResetSent]   = useState(false)
  const [checking, setChecking]     = useState(true)

  const searchParams = useSearchParams()
  const refCode = searchParams?.get('ref') || ''

  // ── On mount: ONLY bypass if actively logged in via Supabase session ──
  // localStorage email alone is NOT enough — user may have logged out
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          // Confirmed active session — bypass gate
          localStorage.setItem('z2b_workshop_email', user.email)
          onEnter(user.email)
          return
        }
        // No active session — clear any stale localStorage and show gate
        localStorage.removeItem('z2b_workshop_email')
      } catch(e) {}
      setChecking(false)
    }
    checkSession()
  }, [onEnter])

  // Loading spinner while checking session
  if (checking) {
    return (
      <div style={{ position:'fixed', inset:0, background:'#0A0015', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid rgba(212,175,55,0.2)', borderTop:'3px solid #D4AF37', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    )
  }

  // ── Register: Name + WhatsApp + Email ──
  const handleRegister = async () => {
    setError('')
    if (!firstName.trim())  { setError('Please enter your first name.'); return }
    if (!whatsapp.trim())   { setError('Please enter your WhatsApp number.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    try {
      // Save prospect data
      await supabase.from('workshop_prospects').upsert({
        email:          email.toLowerCase().trim(),
        first_name:     firstName.trim(),
        whatsapp:       whatsapp.trim(),
        referred_by:    refCode || null,
        registered_at:  new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      }, { onConflict: 'email', ignoreDuplicates: false })

      // Also save to profiles if they have an account
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          full_name: firstName.trim(),
          whatsapp:  whatsapp.trim(),
        }).eq('id', user.id)
      }

      localStorage.setItem('z2b_workshop_email',      email.toLowerCase().trim())
      localStorage.setItem('z2b_workshop_first_name', firstName.trim())
      if (refCode) localStorage.setItem('z2b_ref', refCode)
      onEnter(email.toLowerCase().trim())
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Sign In ──
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

  // ── Reset Password ──
  const handleReset = async () => {
    setError('')
    if (!email.trim() || !email.includes('@')) { setError('Please enter your email address.'); return }
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: 'https://app.z2blegacybuilders.co.za/workshop' }
      )
      if (resetError) { setError('Could not send reset email. Please try again.'); return }
      setResetSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
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

  const tabBtn = (active: boolean, color: string): React.CSSProperties => ({
    flex: 1, padding: '9px', borderRadius: '9px', border: 'none',
    cursor: 'pointer', fontFamily: 'Georgia,serif',
    fontSize: '12px', fontWeight: 700, transition: 'all 0.2s',
    background: active ? `rgba(${color},0.2)` : 'transparent',
    color: active ? `rgb(${color})` : 'rgba(255,255,255,0.4)',
    borderBottom: active ? `2px solid rgb(${color})` : '2px solid transparent',
  })

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'linear-gradient(135deg,#0A0015,#1A0035)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'Georgia,serif' }}>
      <div style={{ background:'linear-gradient(135deg,#1A0035,#0D0020)', border:'2px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'36px 32px', maxWidth:'420px', width:'100%', textAlign:'center' }}>

        {/* Logo */}
        <img src="/logo.jpg" alt="Z2B" style={{ width:'68px', height:'68px', borderRadius:'14px', margin:'0 auto 18px', border:'2px solid #D4AF37', display:'block' }} />

        {/* Mode tabs */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'4px', marginBottom:'24px', gap:'3px' }}>
          <button onClick={() => { setMode('register'); setError('') }}
            style={{ flex:1, padding:'9px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, transition:'all 0.2s', background:mode==='register'?'rgba(212,175,55,0.18)':'transparent', color:mode==='register'?'#D4AF37':'rgba(255,255,255,0.4)', borderBottom:mode==='register'?'2px solid #D4AF37':'2px solid transparent' }}>
            New Here
          </button>
          <button onClick={() => { setMode('login'); setError('') }}
            style={{ flex:1, padding:'9px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, transition:'all 0.2s', background:mode==='login'?'rgba(124,58,237,0.2)':'transparent', color:mode==='login'?'#C4B5FD':'rgba(255,255,255,0.4)', borderBottom:mode==='login'?'2px solid #7C3AED':'2px solid transparent' }}>
            Sign In
          </button>
          <button onClick={() => { setMode('reset'); setError(''); setResetSent(false) }}
            style={{ flex:1, padding:'9px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, transition:'all 0.2s', background:mode==='reset'?'rgba(16,185,129,0.15)':'transparent', color:mode==='reset'?'#6EE7B7':'rgba(255,255,255,0.4)', borderBottom:mode==='reset'?'2px solid #059669':'2px solid transparent' }}>
            Forgot?
          </button>
        </div>

        {/* ── REGISTER MODE ── */}
        {mode === 'register' && (
          <>
            <div style={{ fontSize:'11px', color:'#D4AF37', letterSpacing:'3px', fontWeight:'bold', marginBottom:'8px' }}>FREE WORKSHOP</div>
            <h2 style={{ fontSize:'22px', fontWeight:'bold', color:'#fff', marginBottom:'6px', lineHeight:1.3 }}>Your seat is ready.</h2>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginBottom:'22px', lineHeight:1.7 }}>
              Sessions 1–9 free. No credit card required.
            </p>

            {refCode && (
              <div style={{ background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'10px', padding:'9px 14px', marginBottom:'16px', fontSize:'12px', color:'#D4AF37' }}>
                🌱 You were personally invited — your sponsor will be credited when you upgrade.
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
              <input type="text"  placeholder="First name *"        value={firstName} onChange={e => setFirstName(e.target.value)} style={inp} />
              <input type="tel"   placeholder="WhatsApp number *"   value={whatsapp}  onChange={e => setWhatsapp(e.target.value)}  style={inp} />
              <input type="email" placeholder="Email address *"     value={email}     onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handleRegister()} style={inp} />
            </div>

            {error && <div style={{ color:'#FCA5A5', fontSize:'13px', marginBottom:'10px' }}>{error}</div>}

            <button onClick={handleRegister} disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#B8860B,#D4AF37)', color:'#000', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'bold', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'Georgia,serif' }}>
              {loading ? 'Saving your seat...' : '🎓 Access Free Workshop →'}
            </button>

            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginTop:'12px' }}>
              No spam. No monthly fees. Unsubscribe anytime.
            </p>
          </>
        )}

        {/* ── SIGN IN MODE ── */}
        {mode === 'login' && (
          <>
            <h2 style={{ fontSize:'22px', fontWeight:'bold', color:'#fff', marginBottom:'6px' }}>Welcome back.</h2>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginBottom:'22px', lineHeight:1.7 }}>
              Sign in to continue your workshop journey.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
              <input type="email"    placeholder="Email address" value={email}    onChange={e => setEmail(e.target.value)}    style={inp} />
              <input type="password" placeholder="Password"      value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()} style={inp} />
            </div>

            {error && <div style={{ color:'#FCA5A5', fontSize:'13px', marginBottom:'10px' }}>{error}</div>}

            <button onClick={handleLogin} disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', color:'#fff', border:'1.5px solid #D4AF37', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'bold', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'Georgia,serif' }}>
              {loading ? 'Signing in...' : 'Sign In & Continue →'}
            </button>

            <p style={{ marginTop:'14px', fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>
              Forgot your password?{' '}
              <button onClick={() => { setMode('reset'); setError('') }} style={{ background:'none', border:'none', color:'#6EE7B7', cursor:'pointer', fontSize:'12px', fontFamily:'Georgia,serif', textDecoration:'underline' }}>
                Reset it here
              </button>
            </p>
          </>
        )}

        {/* ── RESET PASSWORD MODE ── */}
        {mode === 'reset' && (
          <>
            <h2 style={{ fontSize:'22px', fontWeight:'bold', color:'#fff', marginBottom:'6px' }}>Reset Password</h2>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginBottom:'22px', lineHeight:1.7 }}>
              Enter your email and we will send you a reset link.
            </p>

            {resetSent ? (
              <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.35)', borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
                <div style={{ fontSize:'32px', marginBottom:'10px' }}>📧</div>
                <p style={{ color:'#6EE7B7', fontWeight:700, fontSize:'15px', marginBottom:'6px' }}>Reset link sent!</p>
                <p style={{ color:'rgba(110,231,183,0.7)', fontSize:'13px', lineHeight:1.6 }}>
                  Check your email at <strong>{email}</strong>. Click the link to set a new password, then come back and sign in.
                </p>
              </div>
            ) : (
              <>
                <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handleReset()} style={{ ...inp, marginBottom:'14px' }} />
                {error && <div style={{ color:'#FCA5A5', fontSize:'13px', marginBottom:'10px' }}>{error}</div>}
                <button onClick={handleReset} disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#065F46,#059669)', color:'#fff', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'bold', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'Georgia,serif' }}>
                  {loading ? 'Sending...' : '📧 Send Reset Link'}
                </button>
              </>
            )}

            <p style={{ marginTop:'14px', fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>
              Remembered it?{' '}
              <button onClick={() => { setMode('login'); setError('') }} style={{ background:'none', border:'none', color:'#C4B5FD', cursor:'pointer', fontSize:'12px', fontFamily:'Georgia,serif', textDecoration:'underline' }}>
                Back to Sign In
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  )
}
