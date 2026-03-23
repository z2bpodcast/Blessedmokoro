'use client'
// FILE: app/pay/page.tsx
// Yoco payment page — creates checkout and redirects

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const TIER_CONFIG: Record<string, { amount:number; label:string; color:string; emoji:string; features:string[] }> = {
  bronze:   { amount:480,   label:'Bronze',   color:'#CD7F32', emoji:'🥉', features:['All 99 sessions','ISP 18%','QPB bonus','Sales Funnel','Team commissions'] },
  copper:   { amount:1200,  label:'Copper',   color:'#B87333', emoji:'🪙', features:['All 99 sessions','ISP 22%','QPB bonus','Sales Funnel','Team commissions'] },
  silver:   { amount:2500,  label:'Silver',   color:'#C0C0C0', emoji:'🥈', features:['All 99 sessions','ISP 25%','QPB bonus','Sales Funnel','Team commissions'] },
  gold:     { amount:5000,  label:'Gold',     color:'#D4AF37', emoji:'🥇', features:['All 99 sessions','ISP 28%','QPB bonus','Sales Funnel','Marketplace access'] },
  platinum: { amount:12000, label:'Platinum', color:'#E5E4E2', emoji:'💎', features:['All 99 sessions','ISP 30%','QPB bonus','All features','Priority support'] },
}

function PayPageInner() {
  const [profile,  setProfile]  = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [paying,   setPaying]   = useState(false)
  const [error,    setError]    = useState('')
  const [tier,     setTier]     = useState('bronze')
  const searchParams = useSearchParams()

  useEffect(() => {
    const t = searchParams.get('tier') || 'bronze'
    setTier(t)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('profiles').select('full_name,email,referral_code,paid_tier').eq('id', user.id).single()
        .then(({ data }) => { setProfile(data); setLoading(false) })
    })
  }, [searchParams])

  const tierData = TIER_CONFIG[tier] || TIER_CONFIG.bronze

  const handleYocoPay = async () => {
    if (!profile) return
    setPaying(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Please sign in first'); setPaying(false); return }

      const res = await fetch('/api/yoco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:   'create_checkout',
          user_id:  user.id,
          ref_code: profile.referral_code || '',
          tier,
        })
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Payment failed to initialize')
      }
      // Redirect to Yoco checkout
      window.location.href = data.checkoutUrl
    } catch(e: any) {
      setError(e.message || 'Payment failed. Please try again.')
      setPaying(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0A0818', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
      Loading...
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight:'100vh', background:'#0A0818', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
      <p style={{ color:'rgba(255,255,255,0.6)', fontFamily:'Georgia,serif' }}>Please sign in to continue</p>
      <Link href="/login" style={{ padding:'12px 28px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, textDecoration:'none', fontFamily:'Georgia,serif' }}>Sign In →</Link>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ maxWidth:'480px', width:'100%' }}>

        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <Link href="/pricing" style={{ fontSize:'13px', color:'rgba(196,181,253,0.6)', textDecoration:'none' }}>← Back to Pricing</Link>
          <h1 style={{ fontSize:'28px', fontWeight:700, color:'#fff', margin:'16px 0 6px' }}>Complete Your Upgrade</h1>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>Secure payment via Yoco</p>
        </div>

        {/* Order summary */}
        <div style={{ background:`${tierData.color}10`, border:`1.5px solid ${tierData.color}33`, borderRadius:'20px', padding:'24px', marginBottom:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px' }}>
            <span style={{ fontSize:'32px' }}>{tierData.emoji}</span>
            <div>
              <div style={{ fontSize:'18px', fontWeight:700, color:tierData.color }}>{tierData.label} Membership</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>Once-off lifetime upgrade</div>
            </div>
            <div style={{ marginLeft:'auto', textAlign:'right' }}>
              <div style={{ fontSize:'28px', fontWeight:700, color:tierData.color }}>R{tierData.amount.toLocaleString()}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>once-off</div>
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${tierData.color}22`, paddingTop:'12px' }}>
            {tierData.features.map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                <span style={{ color:tierData.color }}>✓</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Builder info */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px 18px', marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'1px', marginBottom:'10px' }}>PAYING AS</div>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{profile.full_name}</div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>{profile.email}</div>
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'12px 16px', color:'#FCA5A5', fontSize:'13px', marginBottom:'16px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Pay button */}
        <button onClick={handleYocoPay} disabled={paying} style={{ width:'100%', padding:'18px', background: paying?'rgba(255,255,255,0.05)':`linear-gradient(135deg,${tierData.color}cc,${tierData.color})`, border:'none', borderRadius:'14px', color: paying?'rgba(255,255,255,0.3)':'#fff', fontWeight:700, fontSize:'18px', cursor: paying?'not-allowed':'pointer', fontFamily:'Georgia,serif', marginBottom:'12px', transition:'all 0.2s' }}>
          {paying ? '⚡ Creating checkout...' : `💳 Pay R${tierData.amount.toLocaleString()} via Yoco`}
        </button>

        <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.25)', lineHeight:1.6 }}>
          You will be redirected to Yoco — South Africa's trusted payment platform.<br />
          Visa · Mastercard · Instant EFT · QR code supported.
        </p>

        <div style={{ marginTop:'16px', textAlign:'center', display:'flex', gap:'12px', justifyContent:'center', opacity:0.4 }}>
          {['Visa','Mastercard','Instant EFT','QR'].map(p => (
            <span key={p} style={{ fontSize:'10px', padding:'3px 10px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'6px', color:'rgba(255,255,255,0.5)' }}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0A0818', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
        Loading...
      </div>
    }>
      <PayPageInner />
    </Suspense>
  )
}
