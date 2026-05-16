'use client'
// File: app/register/page.tsx
// Light registration — name, email, phone → straight to payment
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BG   = '#050A18'
const GOLD = '#D4AF37'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'

const TIER_INFO: Record<string, { price: number; engine: string; color: string }> = {
  starter:  { price: 700,   engine: '🔧 Manual',    color: '#B4B2A9' },
  bronze:   { price: 2500,  engine: '🔧 Manual',    color: '#CD7F32' },
  copper:   { price: 5000,  engine: '⚙️ Automatic', color: '#B87333' },
  silver:   { price: 12000, engine: '⚡ Electric',  color: '#C0C0C0' },
  gold:     { price: 25000, engine: '🚀 Rocket',    color: '#D4AF37' },
  platinum: { price: 50000, engine: '🚀 Rocket',    color: '#E5E4E2' },
}

function RegisterInner() {
  const router = useRouter()
  const params = useSearchParams()
  const tier   = params.get('tier') ?? 'starter'
  const info   = TIER_INFO[tier.toLowerCase()] ?? TIER_INFO['starter']

  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')

    // Sign up with Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email:    email.trim(),
      password: password.trim(),
      options:  { data: { full_name: fullName.trim(), phone: phone.trim() } },
    })

    if (signUpError) {
      // If already registered, just sign in
      if (signUpError.message.includes('already registered')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(), password: password.trim(),
        })
        if (signInError) { setError('Account exists — wrong password. Try logging in.'); setLoading(false); return }
      } else {
        setError(signUpError.message)
        setLoading(false)
        return
      }
    }

    // Go straight to payment
    router.push(`/ai-income/payment?tier=${tier}&amount=${info.price}&name=${encodeURIComponent(tierName)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', letterSpacing: '3px', color: GOLD, marginBottom: '8px' }}>ZERO 2 BILLIONAIRES</div>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '24px', fontWeight: 900, color: W, marginBottom: '6px' }}>Create Your Account</h1>
          <p style={{ fontSize: '13px', color: MUTED }}>Then proceed to secure payment</p>
        </div>

        {/* Selected tier */}
        <div style={{ padding: '14px 16px', borderRadius: '12px', background: info.color + '12', border: '1px solid ' + info.color + '40', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '2px' }}>Selected package</div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: info.color }}>
              {info.engine} {tierName}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: info.color }}>
              R{info.price.toLocaleString()}
            </div>
            <Link href="/pricing" style={{ fontSize: '10px', color: MUTED, textDecoration: 'none', display: 'block', textAlign: 'right' }}>Change →</Link>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '5px' }}>Full Name *</div>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '5px' }}>Email Address *</div>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              placeholder="your@email.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '5px' }}>Phone Number</div>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
              placeholder="+27 XX XXX XXXX (optional)"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '5px' }}>Create Password *</div>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password"
              placeholder="Minimum 8 characters"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        {error && (
          <div style={{ color: '#F87171', fontSize: '12px', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)' }}>
            {error}
          </div>
        )}

        <button onClick={handleRegister} disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'default' : 'pointer', background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#D4AF37,#B8860B)', color: loading ? MUTED : '#050A18', fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif', marginBottom: '14px' }}>
          {loading ? 'Creating account...' : `Continue to Payment — R${info.price.toLocaleString()} →`}
        </button>

        <div style={{ textAlign: 'center', fontSize: '12px', color: MUTED, marginBottom: '16px' }}>
          Already have an account?{' '}
          <Link href={`/login?redirect=/ai-income/payment?tier=${tier}&amount=${info.price}&name=${encodeURIComponent(tierName)}`}
            style={{ color: GOLD, textDecoration: 'none' }}>Log in →</Link>
        </div>

        <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.7 }}>
          🔒 Your details are secure · No spam · No sharing<br/>
          By registering you agree to our Terms of Service
        </div>

      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <RegisterInner />
    </Suspense>
  )
}
