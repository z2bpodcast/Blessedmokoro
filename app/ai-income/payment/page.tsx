'use client'
// File: app/ai-income/payment/page.tsx
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams }               from 'next/navigation'
import { supabase }                      from '@/lib/supabase'
import Link                              from 'next/link'

const BG   = '#050A18'
const GOLD = '#D4AF37'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'
const CYAN = '#06B6D4'

const PAYMENT_METHODS = [
  { id: 'card',        icon: '💳', label: 'Credit / Debit Card',  desc: 'Visa · Mastercard · Amex', provider: 'PayFast' },
  { id: 'instant_eft', icon: '⚡', label: 'Instant EFT',          desc: 'All major SA banks — instant', provider: 'PayFast' },
  { id: 'eft',         icon: '🏦', label: 'Manual EFT',           desc: 'Pay by bank transfer — email proof', provider: 'Manual' },
  { id: 'mobicred',    icon: '📱', label: 'Mobicred',             desc: 'Buy now, pay later', provider: 'PayFast' },
]

const TIER_DETAILS: Record<string, { engine: string; gears: string; bfm: number; color: string }> = {
  starter:  { engine: '🔧 Manual',    gears: '1–3', bfm: 750,   color: '#B4B2A9' },
  bronze:   { engine: '🔧 Manual',    gears: '1–4', bfm: 750,   color: '#CD7F32' },
  copper:   { engine: '⚙️ Automatic', gears: '1–5', bfm: 1500,  color: '#B87333' },
  silver:   { engine: '⚡ Electric',  gears: '1–7', bfm: 3000,  color: '#C0C0C0' },
  gold:     { engine: '🚀 Rocket',    gears: '1–7', bfm: 7000,  color: GOLD },
  platinum: { engine: '🚀 Rocket',    gears: '1–7', bfm: 12000, color: '#E5E4E2' },
  gold_rocket:     { engine: '🚀 Rocket', gears: '1–7', bfm: 7000,  color: GOLD },
  platinum_rocket: { engine: '🚀 Rocket', gears: '1–7', bfm: 12000, color: '#E5E4E2' },
}

function PaymentInner() {
  const params  = useSearchParams()
  const tier    = params.get('tier') ?? 'starter'
  const amount  = Number(params.get('amount') ?? 700)
  const name    = params.get('name') ?? 'Starter'

  const [method,   setMethod]   = useState<string>('card')
  const [email,    setEmail]    = useState('')
  const [fullName, setFullName] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [efeRef,   setEftRef]   = useState('')

  const tierInfo = TIER_DETAILS[tier.toLowerCase()] ?? TIER_DETAILS['starter']

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
    })
  }, [])

  async function handlePayment() {
    if (!email || !fullName) return
    setLoading(true)

    if (method === 'eft') {
      // Show manual EFT details
      setEftRef('Z2B-' + Date.now().toString().slice(-8))
      setLoading(false)
      return
    }

    // PayFast payment initiation
    const res  = await fetch('/api/payment/initiate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tier, amount, name, method, email, fullName }),
    })
    const data = await res.json()
    if (data.redirect) window.location.href = data.redirect
    else setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>
      <nav style={{ padding: '12px 20px', background: '#0D1629', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/ai-income/choose-plan" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Back</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>Secure Payment</span>
        <div style={{ fontSize: '11px', color: GREEN }}>🔒 SSL Secured</div>
      </nav>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* Order summary */}
        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid ' + tierInfo.color + '30', marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Order Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: tierInfo.color, marginBottom: '4px' }}>{name} Package</div>
              <div style={{ fontSize: '12px', color: MUTED }}>{tierInfo.engine} · Gears {tierInfo.gears}</div>
              <div style={{ fontSize: '11px', color: MUTED, marginTop: '4px' }}>+ R{tierInfo.bfm.toLocaleString()}/month BFM from day 61</div>
            </div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '26px', fontWeight: 900, color: tierInfo.color }}>
              R{amount.toLocaleString()}
            </div>
          </div>
          <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '11px', color: GREEN }}>
            ✓ Once-off payment · No subscription for 60 days · Upgrade anytime
          </div>
        </div>

        {/* Manual EFT reference */}
        {efeRef && (
          <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: CYAN, marginBottom: '12px' }}>Manual EFT Details</div>
            <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.9 }}>
              <div><strong style={{ color: W }}>Bank:</strong> First National Bank (FNB)</div>
              <div><strong style={{ color: W }}>Account Name:</strong> Z2B Legacy Builders</div>
              <div><strong style={{ color: W }}>Account Number:</strong> 62XXXXXXXXX</div>
              <div><strong style={{ color: W }}>Branch Code:</strong> 250655</div>
              <div><strong style={{ color: W }}>Amount:</strong> R{amount.toLocaleString()}</div>
              <div><strong style={{ color: W }}>Reference:</strong> <span style={{ color: GOLD, fontWeight: 900 }}>{efeRef}</span></div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: MUTED }}>
              Email proof of payment to <span style={{ color: GOLD }}>payments@z2blegacybuilders.co.za</span> with your reference number. Account activated within 2 hours.
            </div>
          </div>
        )}

        {!efeRef && (
          <>
            {/* Contact info */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: MUTED, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Details</div>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' }} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Payment methods */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: MUTED, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Method</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PAYMENT_METHODS.map(pm => (
                  <div key={pm.id} onClick={() => setMethod(pm.id)}
                    style={{ padding: '14px 16px', borderRadius: '12px', border: '2px solid ' + (method === pm.id ? GOLD : 'rgba(255,255,255,0.08)'), background: method === pm.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '24px', flexShrink: 0 }}>{pm.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: method === pm.id ? GOLD : W }}>{pm.label}</div>
                      <div style={{ fontSize: '11px', color: MUTED }}>{pm.desc}</div>
                    </div>
                    {pm.provider !== 'Manual' && <div style={{ fontSize: '10px', color: MUTED, flexShrink: 0 }}>via {pm.provider}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Pay button */}
            <button onClick={handlePayment} disabled={loading || !email || !fullName}
              style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: loading || !email || !fullName ? 'default' : 'pointer', background: loading || !email || !fullName ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#D4AF37,#B8860B)', color: loading || !email || !fullName ? MUTED : '#050A18', fontWeight: 900, fontSize: '16px', fontFamily: 'Cinzel,Georgia,serif', marginBottom: '12px' }}>
              {loading ? 'Redirecting to payment...' : method === 'eft' ? 'Get EFT Details →' : `Pay R${amount.toLocaleString()} Securely →`}
            </button>
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: '11px', color: MUTED, lineHeight: 1.8 }}>
          🔒 All card payments processed securely by PayFast<br/>
          Your account activates immediately after payment confirmation
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return <Suspense fallback={null}><PaymentInner /></Suspense>
}
