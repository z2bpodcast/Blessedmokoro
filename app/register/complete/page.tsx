'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── Inner component uses useSearchParams — must be inside Suspense ──
function RegisterCompleteInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const paymentId    = searchParams.get('payment_id') || ''
  const tier         = searchParams.get('tier')        || 'bronze'

  const [form, setForm] = useState({
    firstName:   '',
    lastName:    '',
    whatsapp:    '',
    city:        '',
    province:    '',
    occupation:  '',
    password:    '',
    confirmPass: '',
  })
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [step,    setStep]    = useState<'form' | 'done'>('form')

  useEffect(() => {
    const savedEmail = localStorage.getItem('z2b_workshop_email') || ''
    const savedName  = localStorage.getItem('z2b_workshop_first_name') || ''
    setEmail(savedEmail)
    if (savedName) setForm(f => ({ ...f, firstName: savedName }))
    if (!paymentId) router.replace('/pricing')
  }, [paymentId, router])

  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async () => {
    setError('')
    const { firstName, lastName, whatsapp, city, password, confirmPass } = form
    if (!firstName || !lastName || !whatsapp || !city) { setError('Please fill in all required fields.'); return }
    if (!password || password.length < 8)              { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPass)                       { setError('Passwords do not match.'); return }
    if (!email)                                         { setError('Email not found. Please return to workshop.'); return }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: `${firstName} ${lastName}`, tier } }
      })
      if (authError) throw authError
      const userId = authData.user?.id
      if (!userId) throw new Error('User creation failed')

      const { data: prospect } = await supabase
        .from('workshop_prospects')
        .select('referred_by')
        .eq('email', email)
        .single()

      const referredBy = prospect?.referred_by || localStorage.getItem('z2b_ref') || null
      const refCode    = `${firstName.slice(0,3).toUpperCase()}${Math.random().toString(36).slice(2,6).toUpperCase()}`

      await supabase.from('profiles').upsert({
        id:              userId,
        email,
        full_name:       `${firstName} ${lastName}`,
        first_name:      firstName,
        last_name:       lastName,
        whatsapp_number: whatsapp,
        city,
        province:        form.province,
        occupation:      form.occupation,
        user_role:       tier,
        is_paid_member:  true,
        payment_status:  'paid',
        referral_code:   refCode,
        referred_by:     referredBy,
        joined_at:       new Date().toISOString(),
      })

      if (paymentId && paymentId !== 'pending') {
        await supabase.from('payments')
          .update({ user_id: userId, status: 'completed' })
          .eq('id', paymentId)
      }

      if (referredBy) await creditSponsor(referredBy, userId, tier, email)

      localStorage.removeItem('z2b_workshop_email')
      localStorage.removeItem('z2b_workshop_first_name')
      localStorage.removeItem('z2b_ref')

      setStep('done')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  const creditSponsor = async (sponsorCode: string, newUserId: string, tier: string, newEmail: string) => {
    try {
      const { data: sponsor } = await supabase
        .from('profiles').select('id').eq('referral_code', sponsorCode).single()
      if (!sponsor) return

      const ISP_RATES:  Record<string, number> = { fam: 0.10, bronze: 0.18, copper: 0.22, silver: 0.25, gold: 0.28, platinum: 0.30 }
      const TIER_PRICES: Record<string, number> = { bronze: 480, copper: 1200, silver: 2500, gold: 5000, platinum: 12000 }
      const ispRate   = ISP_RATES[tier]  || 0.18
      const price     = TIER_PRICES[tier] || 480
      const ispEarned = Math.round(price * ispRate)

      await supabase.from('sponsor_earnings').insert({
        sponsor_id: sponsor.id, new_member_id: newUserId, new_member_email: newEmail,
        tier_purchased: tier, tier_price: price, isp_rate: ispRate, isp_amount: ispEarned,
        earning_type: 'ISP', status: 'confirmed', earned_at: new Date().toISOString(),
      })

      await supabase.from('builder_alerts').insert({
        builder_code: sponsorCode, prospect_id: newUserId, alert_type: 'conversion', session_num: 0,
        message: `🎉 ${newEmail} just upgraded to ${tier.toUpperCase()}! You earned R${ispEarned} ISP commission.`,
        read: false,
      })
    } catch (err) {
      console.error('Sponsor credit error:', err)
    }
  }

  const S = {
    page:  { minHeight: '100vh', background: 'linear-gradient(135deg, #0A0015, #1A0035)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
    card:  { background: '#1A0035', border: '2px solid rgba(212,175,55,0.35)', borderRadius: '20px', padding: '36px 28px', maxWidth: '520px', width: '100%' } as React.CSSProperties,
    label: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', display: 'block' } as React.CSSProperties,
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const } as React.CSSProperties,
    row:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' } as React.CSSProperties,
  }

  if (step === 'done') return (
    <div style={S.page}>
      <div style={{ ...S.card, textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <div style={{ fontSize: '12px', color: '#D4AF37', letterSpacing: '3px', marginBottom: '10px' }}>WELCOME TO THE TABLE</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>Your membership is active!</h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px', lineHeight: 1.7 }}>
          You are now a Z2B {tier.charAt(0).toUpperCase() + tier.slice(1)} member. Your lifetime seat at the table is secured.
        </p>
        <button onClick={() => router.push('/workshop')}
          style={{ width: '100%', background: 'linear-gradient(135deg, #B8860B, #D4AF37)', color: '#000', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
          Continue to Workshop →
        </button>
        <button onClick={() => router.push('/groundbreaker')}
          style={{ width: '100%', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
          Open GroundBreaker Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo.jpg" alt="Z2B" style={{ width: '56px', height: '56px', borderRadius: '12px', margin: '0 auto 14px', border: '2px solid #D4AF37' }} />
          <div style={{ fontSize: '11px', color: '#D4AF37', letterSpacing: '3px', marginBottom: '6px' }}>STEP 2 OF 2</div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>Complete Your Membership</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Payment confirmed ✅ — tell us about yourself</p>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={S.label}>Email address {email ? '(pre-filled from workshop)' : '*'}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            readOnly={!!email}
            placeholder="your@email.com"
            style={{ ...S.input, opacity: email ? 0.6 : 1, cursor: email ? 'not-allowed' : 'text' }}
          />
          {email && (
            <button
              onClick={() => setEmail('')}
              style={{ fontSize:'11px', color:'#A78BFA', background:'none', border:'none', cursor:'pointer', marginTop:'4px', padding:0 }}
            >
              ✏️ Use a different email
            </button>
          )}
        </div>

        <div style={S.row}>
          <div>
            <label style={S.label}>First name *</label>
            <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} style={S.input} placeholder="Mokoro" />
          </div>
          <div>
            <label style={S.label}>Last name *</label>
            <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} style={S.input} placeholder="Manana" />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={S.label}>WhatsApp number *</label>
          <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} style={S.input} placeholder="+27 81 234 5678" />
        </div>

        <div style={S.row}>
          <div>
            <label style={S.label}>City *</label>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)} style={S.input} placeholder="Johannesburg" />
          </div>
          <div>
            <label style={S.label}>Province</label>
            <select value={form.province} onChange={e => set('province', e.target.value)} style={{ ...S.input, appearance: 'none' as any }}>
              <option value="">Select...</option>
              {['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','North West','Free State','Northern Cape'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={S.label}>Occupation</label>
          <input type="text" value={form.occupation} onChange={e => set('occupation', e.target.value)} style={S.input} placeholder="e.g. Teacher, Nurse, Accountant..." />
        </div>

        <div style={S.row}>
          <div>
            <label style={S.label}>Create password *</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} style={S.input} placeholder="Min 8 characters" />
          </div>
          <div>
            <label style={S.label}>Confirm password *</label>
            <input type="password" value={form.confirmPass} onChange={e => set('confirmPass', e.target.value)} style={S.input} placeholder="Repeat password" />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#FCA5A5', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', background: 'linear-gradient(135deg, #B8860B, #D4AF37)', color: '#000', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}>
          {loading ? 'Activating your membership...' : 'Activate My Membership 🎉'}
        </button>

        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '14px', textAlign: 'center' }}>
          Your referral sponsor will be credited automatically.
        </p>
      </div>
    </div>
  )
}

// ── Suspense wrapper — required for useSearchParams ──
export default function RegisterComplete() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0015, #1A0035)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '18px' }}>
        Loading...
      </div>
    }>
      <RegisterCompleteInner />
    </Suspense>
  )
}