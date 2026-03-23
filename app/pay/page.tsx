'use client'
// FILE: app/pay/page.tsx
// PayFast payment page — generates secure payment form
// Redirects to PayFast, returns to /pay/success

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
const TIER_PRICES: Record<string, { amount: number; label: string; color: string; emoji: string; features: string[] }> = {
  bronze:   { amount: 480,   label: 'Bronze',   color: '#CD7F32', emoji: '🥉', features: ['All 99 sessions', 'ISP 18%', 'QPB bonus', 'Sales Funnel', 'Team commissions'] },
  copper:   { amount: 1200,  label: 'Copper',   color: '#B87333', emoji: '🪙', features: ['All 99 sessions', 'ISP 22%', 'QPB bonus', 'Sales Funnel', 'Team commissions'] },
  silver:   { amount: 2500,  label: 'Silver',   color: '#C0C0C0', emoji: '🥈', features: ['All 99 sessions', 'ISP 25%', 'QPB bonus', 'Sales Funnel', 'Team commissions'] },
  gold:     { amount: 5000,  label: 'Gold',     color: '#D4AF37', emoji: '🥇', features: ['All 99 sessions', 'ISP 28%', 'QPB bonus', 'Sales Funnel', 'Marketplace access'] },
  platinum: { amount: 12000, label: 'Platinum', color: '#E5E4E2', emoji: '💎', features: ['All 99 sessions', 'ISP 30%', 'QPB bonus', 'All features', 'Priority support'] },
}

const PAYFAST_URL = process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === 'true'
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process'

function PayPageInner() {
  const [profile, setProfile]   = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [tier, setTier]         = useState('bronze')
  const searchParams            = useSearchParams()

  useEffect(() => {
    const t = searchParams.get('tier') || 'bronze'
    setTier(t)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('profiles').select('full_name,email,referral_code,paid_tier').eq('id', user.id).single()
        .then(({ data }) => { setProfile(data); setLoading(false) })
    })
  }, [searchParams])

  const tierData = TIER_PRICES[tier] || TIER_PRICES.bronze

  const buildPayFastForm = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !profile) return

    const merchantId  = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '10000100'
    const merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '46f0cd694581a'
    const passphrase  = process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || ''
    const baseUrl     = process.env.NEXT_PUBLIC_APP_URL || 'https://app.z2blegacybuilders.co.za'

    const params: Record<string, string> = {
      merchant_id:  merchantId,
      merchant_key: merchantKey,
      return_url:   `${baseUrl}/pay/success?tier=${tier}`,
      cancel_url:   `${baseUrl}/pricing`,
      notify_url:   `${baseUrl}/api/payfast`,
      name_first:   profile.full_name?.split(' ')[0] || 'Builder',
      name_last:    profile.full_name?.split(' ').slice(1).join(' ') || 'Z2B',
      email_address: profile.email || user.email || '',
      m_payment_id: `${user.id}-${Date.now()}`,
      amount:       tierData.amount.toFixed(2),
      item_name:    `Z2B Table Banquet ${tierData.label} Membership`,
      item_description: `Z2B ${tierData.label} — Entrepreneurial Consumer Workshop`,
      custom_str1:  user.id,
      custom_str2:  profile.referral_code || '',
    }

    // Build signature
    const paramString = Object.keys(params)
      .filter(k => params[k] !== '')
      .map(k => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
      .join('&')

    const stringToHash = passphrase
      ? `${paramString}&passphrase=${encodeURIComponent(passphrase)}`
      : paramString

    // Note: MD5 hash must be done server-side in production
    // This is a simplified client-side version for demonstration
    params.signature = ''

    // Create and submit form
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = PAYFAST_URL
    Object.entries(params).forEach(([k, v]) => {
      const input = document.createElement('input')
      input.type = 'hidden'; input.name = k; input.value = v
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
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
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>Secure payment via PayFast</p>
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
                <span style={{ color:tierData.color, fontSize:'14px' }}>✓</span>
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

        {/* Pay button */}
        <button onClick={buildPayFastForm} style={{ width:'100%', padding:'18px', background:`linear-gradient(135deg,${tierData.color}cc,${tierData.color})`, border:'none', borderRadius:'14px', color: tierData.label === 'Silver' || tierData.label === 'Platinum' ? '#000' : '#fff', fontWeight:700, fontSize:'18px', cursor:'pointer', fontFamily:'Georgia,serif', marginBottom:'12px' }}>
          💳 Pay R{tierData.amount.toLocaleString()} via PayFast
        </button>

        <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.25)', lineHeight:1.6 }}>
          You will be redirected to PayFast — South Africa's trusted payment gateway.<br />
          EFT · Credit card · Instant EFT · Ozow supported.
        </p>

        <div style={{ marginTop:'16px', textAlign:'center', display:'flex', gap:'12px', justifyContent:'center', opacity:0.4 }}>
          {['EFT', 'Visa', 'Mastercard', 'Ozow'].map(p => (
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
