'use client'

// ============================================================
// FILE LOCATION: app/signup/page.tsx
//
// TWO MODES:
//   1. QUICK GATE (?ref=CODE) — 3-field lightweight registration
//      shown first when prospect arrives via referral link.
//      Locks sponsor permanently. Adds to funnel pipeline.
//      Redirects straight to workshop.
//
//   2. FULL FORM (/signup or /signup?mode=full) — complete
//      registration with personal info, address, banking,
//      sponsor. Used when upgrading to paid or direct signup.
//      Preserves ALL original form fields.
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserPlus, MapPin, Building2, Users, User } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// QUICK GATE — 3 fields, locks sponsor, goes to workshop
// Shown when ?ref= is present and mode != full
// ─────────────────────────────────────────────────────────────
function QuickGate({ referralCode, sponsorName, onSwitchFull }: {
  referralCode: string
  sponsorName: string
  onSwitchFull: () => void
}) {
  const [name,     setName]     = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)
  const router = useRouter()
  const sponsorFirst = sponsorName ? sponsorName.split(' ')[0] : ''

  const validate = (): string | null => {
    if (!name.trim())     return 'Please enter your full name.'
    if (!whatsapp.trim()) return 'Please enter your WhatsApp number.'
    if (!email.trim())    return 'Please enter your email address.'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const tempPassword = `Z2B${Math.random().toString(36).slice(2, 10).toUpperCase()}!`
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: tempPassword,
        options: { data: { full_name: name.trim(), whatsapp: whatsapp.trim(), referred_by: referralCode || null } },
      })

      if (signUpError?.message?.includes('already registered')) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(), password: tempPassword,
        })
        if (signInErr) { setError('This email is already registered. Please sign in instead.'); setLoading(false); return }
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('profiles').update({ full_name: name.trim(), whatsapp: whatsapp.trim() })
            .eq('id', user.id)
        }
        setDone(true)
        setTimeout(() => router.push(referralCode ? `/workshop?ref=${referralCode}` : '/workshop'), 1400)
        return
      }
      if (signUpError) throw signUpError
      const userId = authData.user?.id
      if (!userId) throw new Error('Account creation failed — please try again.')

      // Lock sponsor permanently in profiles
      await supabase.from('profiles').upsert({
        id: userId, full_name: name.trim(), email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(), referred_by: referralCode || null,
        profile_complete: false, is_paid_member: false, user_role: 'fam', paid_tier: 'fam',
      }, { onConflict: 'id' })

      // Add to builder funnel pipeline
      if (referralCode) {
        const { data: builderData } = await supabase
          .from('profiles').select('id').eq('referral_code', referralCode).single()
        if (builderData?.id) {
          await supabase.from('funnel_prospects').upsert({
            builder_id: builderData.id, full_name: name.trim(), whatsapp: whatsapp.trim(),
            email: email.trim().toLowerCase(), signup_date: new Date().toISOString(),
            stage: 'day1', prospect_user_id: userId,
          }, { onConflict: 'prospect_user_id' })
          await supabase.from('prospect_notifications').insert({
            builder_id: builderData.id, builder_ref: referralCode,
            prospect_name: name.trim(), prospect_whatsapp: whatsapp.trim(),
            prospect_email: email.trim().toLowerCase(), section_id: 1,
            section_title: 'Workshop Registration', status: 'new', read: false,
            message: `${name.trim()} just registered for the free workshop via your referral link.`,
          })
        }
      }
      setDone(true)
      setTimeout(() => router.push(referralCode ? `/workshop?ref=${referralCode}` : '/workshop'), 1400)
    } catch (err: any) {
      setError(err?.message || 'Could not create your account. Please try again.')
    } finally { setLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    padding: '13px 14px', color: '#F5F3FF', fontSize: '15px',
    fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'rgba(212,175,55,0.85)', letterSpacing: '0.8px',
    textTransform: 'uppercase', marginBottom: '6px',
  }

  return (
    <div style={{
      width: 'min(480px, 100%)',
      background: 'linear-gradient(160deg, #13102B 0%, #1E1B4B 100%)',
      border: '1.5px solid rgba(212,175,55,0.35)', borderRadius: '20px',
      overflow: 'hidden', fontFamily: 'Georgia, serif',
      boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
    }}>
      <div style={{ height: '4px', background: 'linear-gradient(90deg, transparent, #D4AF37, #F5D060, #D4AF37, transparent)' }} />

      <div style={{ padding: '32px 32px 0', textAlign: 'center' }}>
        <span style={{ fontSize: '28px', letterSpacing: '6px', display: 'block', marginBottom: '12px' }}>❤️ ❤️</span>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#D4AF37', margin: '0 0 8px', textShadow: '0 2px 16px rgba(212,175,55,0.35)' }}>
          Welcome to Abundance
        </h1>
        <p style={{ fontSize: '14px', color: '#A78BFA', margin: '0 0 24px', lineHeight: 1.6 }}>
          {sponsorName
            ? `${sponsorFirst} has personally invited you to start your Entrepreneurial Consumer journey.`
            : 'You have been invited to start your Entrepreneurial Consumer journey.'}
        </p>
      </div>

      {sponsorName && (
        <div style={{ margin: '0 32px 20px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', padding: '14px 18px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'rgba(167,139,250,0.8)', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Personally invited by</span>
          <p style={{ fontSize: '17px', fontWeight: 700, color: '#F5D060', margin: '0 0 4px' }}>🏆 {sponsorName}</p>
          <p style={{ fontSize: '12px', color: '#DDD6FE', margin: 0, lineHeight: 1.5 }}>Your sponsor will be permanently credited when you upgrade.</p>
        </div>
      )}

      <div style={{ height: '1px', margin: '0 32px 20px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent)' }} />

      <div style={{ display: 'flex', gap: '10px', margin: '0 32px 24px' }}>
        <div style={{ flex: 1, background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.3)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center', fontSize: '12px', color: '#6EE7B7', fontWeight: 700, lineHeight: 1.5 }}>✅ FREE<br />18 Sessions</div>
        <div style={{ flex: 1, background: 'rgba(245,208,96,0.1)', border: '1px solid rgba(245,208,96,0.3)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center', fontSize: '12px', color: '#F5D060', fontWeight: 700, lineHeight: 1.5 }}>🔑 R480 Once-Off<br />All 99 Sessions</div>
      </div>

      <div style={{ padding: '0 32px 32px' }}>
        {!done ? (
          <form onSubmit={handleSubmit} noValidate>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', padding: '10px 14px', color: '#FCA5A5', fontSize: '13px', marginBottom: '14px', lineHeight: 1.5 }}>{error}</div>}

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Thabo Nkosi" disabled={loading} style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.7)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>WhatsApp Number *</label>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 0821234567" disabled={loading} style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.7)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. thabo@email.com" disabled={loading} style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.7)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e as any) }} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '16px',
              background: loading ? 'rgba(76,29,149,0.5)' : 'linear-gradient(135deg, #4C1D95, #7C3AED)',
              border: '1.5px solid #D4AF37', borderRadius: '12px', color: '#F5D060',
              fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.4px', fontFamily: 'Georgia, serif',
              boxShadow: '0 4px 20px rgba(76,29,149,0.5)', transition: 'all 0.2s', marginTop: '6px',
            }}>
              {loading ? 'Creating your account...' : '🎓 Start My Free Workshop'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: 'rgba(167,139,250,0.7)' }}>
              Already registered?{'  '}
              <Link href={referralCode ? `/login?redirect=/workshop?ref=${referralCode}` : '/login'} style={{ color: '#D4AF37', textDecoration: 'underline' }}>Sign in here</Link>
            </p>

            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              Need full registration instead?{'  '}
              <button type="button" onClick={onSwitchFull} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.5)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Georgia, serif' }}>
                Complete full form
              </button>
            </p>

            {referralCode && (
              <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'rgba(212,175,55,0.4)', fontStyle: 'italic', lineHeight: 1.5 }}>
                🔒 {sponsorFirst ? `${sponsorFirst}'s` : "Your sponsor's"} referral link is permanently locked to your account. Even if you upgrade months from now, they will be credited.
              </p>
            )}
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#F5D060', margin: '0 0 8px' }}>You're in!</p>
            <p style={{ fontSize: '14px', color: '#DDD6FE', lineHeight: 1.7, margin: '0 0 20px' }}>
              {sponsorName ? `${sponsorFirst} has been notified. Taking you to your workshop now...` : 'Your account is ready. Taking you to your workshop now...'}
            </p>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        )}
      </div>

      <div style={{ height: '4px', background: 'linear-gradient(90deg, transparent, #D4AF37, #F5D060, #D4AF37, transparent)' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// FULL FORM — complete registration (original, unchanged)
// Used for: paid upgrade, direct signup, /signup?mode=full
// ─────────────────────────────────────────────────────────────
function FullSignUpForm({ referralCode }: { referralCode: string | null }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountType, setAccountType] = useState('cheque')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [hasSponsor, setHasSponsor] = useState(true)
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorId, setSponsorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (referralCode) {
      setHasSponsor(true)
      fetchSponsorInfo(referralCode)
    }
  }, [referralCode])

  const fetchSponsorInfo = async (code: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('full_name, referral_code').eq('referral_code', code).single()
      if (error) throw error
      if (data) { setSponsorName(data.full_name); setSponsorId(data.referral_code) }
    } catch (err) { console.error('Error fetching sponsor:', err) }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    if (!fullName.trim()) { setError('Please enter your full name'); setLoading(false); return }
    if (!phoneNumber.trim()) { setError('Please enter your phone number'); setLoading(false); return }
    if (hasSponsor && !sponsorName.trim() && !referralCode) {
      setError("Please enter your sponsor's name or select \"No Sponsor\""); setLoading(false); return
    }
    try {
      const metadata = {
        full_name: fullName.trim(), phone_number: phoneNumber.trim(),
        whatsapp_number: whatsappNumber.trim() || phoneNumber.trim(),
        birth_date: birthDate || null, id_number: idNumber.trim() || null,
        street_address: streetAddress.trim() || null, city: city.trim() || null,
        province: province.trim() || null, postal_code: postalCode.trim() || null,
        bank_name: bankName.trim() || null, account_type: accountType,
        account_number: accountNumber.trim() || null, account_holder: accountHolder.trim() || null,
        sponsor_name: hasSponsor ? (sponsorName.trim() || 'Direct Registration') : 'No Sponsor',
        sponsor_id: hasSponsor ? (sponsorId.trim() || null) : null,
        referred_by: referralCode || null,
      }
      const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: metadata } })
      if (signUpError) throw signUpError
      if (authData.user) {
        await supabase.from('profiles').update({
          full_name: fullName.trim(), phone_number: phoneNumber.trim(),
          whatsapp_number: whatsappNumber.trim() || phoneNumber.trim(),
          birth_date: birthDate || null, id_number: idNumber.trim() || null,
          street_address: streetAddress.trim() || null, city: city.trim() || null,
          province: province.trim() || null, postal_code: postalCode.trim() || null,
          bank_name: bankName.trim() || null, account_type: accountType,
          account_number: accountNumber.trim() || null, account_holder: accountHolder.trim() || null,
          sponsor_name: hasSponsor ? (sponsorName.trim() || 'Direct Registration') : 'No Sponsor',
          sponsor_id: hasSponsor ? (sponsorId.trim() || null) : null,
          referred_by: referralCode || null,
        }).eq('id', authData.user.id)
        alert('🎉 Registration successful! Please check your email to verify your account.')
        router.push('/login')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const provinces = ['Gauteng','Western Cape','Eastern Cape','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Free State']
  const banks = ['ABSA','Capitec','FNB','Nedbank','Standard Bank','African Bank','Discovery Bank','TymeBank','Other']

  return (
    <div className="max-w-4xl w-full">

      {/* Navigation bar */}
      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        <Link href="/" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 shadow-lg">Home</Link>
        <Link href="/about" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 shadow-lg">About Us</Link>
        <Link href="/pricing" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 shadow-lg">Pricing</Link>
        <Link href={referralCode ? `/workshop?ref=${referralCode}` : '/workshop'} className="font-semibold py-2 px-6 rounded-lg transition-all border-2 border-yellow-400 text-yellow-900 hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}>
          🎁 Free Workshop — Try Before You Join!
        </Link>
      </div>

      {/* Workshop teaser banner */}
      {referralCode && sponsorName && (
        <div className="mb-6 rounded-xl p-5 text-white text-center border-2 border-yellow-400" style={{ background: 'linear-gradient(135deg, #6B21A8, #9333EA)' }}>
          <p className="text-yellow-300 font-bold text-lg mb-1">🏆 {sponsorName} invited you to the Z2B Table!</p>
          <p className="text-purple-100 text-sm mb-3">Not sure yet? Explore our FREE 9-day Entrepreneurial Consumer Workshop first. No account needed for the first 9 sections.</p>
          <Link href={`/workshop?ref=${referralCode}`} className="inline-block font-bold py-2 px-8 rounded-lg border-2 border-yellow-400 text-yellow-900" style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}>
            🎓 Start Free Workshop Now
          </Link>
          <p className="text-purple-200 text-xs mt-3">Your referral link is saved — come back to register anytime and {sponsorName} will still be your sponsor.</p>
        </div>
      )}

      {/* Logo & Heading */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <img src="/logo.jpg" alt="Z2B Logo" className="h-20 w-20 rounded-xl border-4 border-gold-400 shadow-lg mx-auto mb-4" />
        </Link>
        <h1 className="text-4xl font-bold text-primary-800 mb-2">Complete Registration</h1>
        <p className="text-primary-600">Join the Z2B Table Banquet Family</p>
      </div>

      {/* Referral notice */}
      {referralCode && sponsorName && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold text-center mb-1">✅ You&apos;re joining via referral from:</p>
          <p className="text-green-900 font-bold text-center text-lg">{sponsorName}</p>
          <p className="text-green-700 text-center text-sm">Referral Code: {referralCode}</p>
        </div>
      )}

      {/* Full form */}
      <div className="card border-4 border-primary-300 shadow-2xl">
        <form onSubmit={handleSignUp} className="space-y-8">
          {error && <div className="bg-red-50 border-2 border-red-400 text-red-800 p-4 rounded-lg">{error}</div>}

          {/* Personal Information */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2"><User className="w-5 h-5" />Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-primary-800 mb-2">Full Name *</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="First and Last Name" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Email Address *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="your@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Phone Number *</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field" placeholder="0XX XXX XXXX" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">WhatsApp Number</label>
                <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="input-field" placeholder="0XX XXX XXXX (if different)" />
                <p className="text-xs text-gray-600 mt-1">Leave blank if same as phone number</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">🎂 Date of Birth (Optional)</label>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input-field" max={new Date().toISOString().split('T')[0]} />
                <p className="text-xs text-gray-600 mt-1">We&apos;ll celebrate your special day! 🎉</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-primary-800 mb-2">SA ID Number (Optional)</label>
                <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="input-field" placeholder="XXXXXXXXXXXXXX" maxLength={13} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-primary-800 mb-2">Password *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Min. 6 characters" required minLength={6} />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" />Physical Address (Optional)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-primary-800 mb-2">Street Address</label>
                <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="input-field" placeholder="Street, House/Flat Number" />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">City/Town</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" placeholder="e.g., Johannesburg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Province</label>
                <select value={province} onChange={(e) => setProvince(e.target.value)} className="input-field">
                  <option value="">Select Province</option>
                  {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Postal Code</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="input-field" placeholder="XXXX" maxLength={4} />
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2 flex items-center gap-2"><Building2 className="w-5 h-5" />Banking Information (For Payouts)</h3>
            <p className="text-sm text-green-700 mb-4">Where should we send your commission earnings?</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Bank Name</label>
                <select value={bankName} onChange={(e) => setBankName(e.target.value)} className="input-field">
                  <option value="">Select Bank</option>
                  {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Account Type</label>
                <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="input-field">
                  <option value="cheque">Cheque/Current</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Account Number</label>
                <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="input-field" placeholder="XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">Account Holder Name</label>
                <input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="input-field" placeholder="Name on account" />
              </div>
            </div>
          </div>

          {/* Sponsor Information */}
          <div className="bg-gold-50 border-2 border-gold-400 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gold-900 mb-2 flex items-center gap-2"><Users className="w-5 h-5" />Sponsor Information</h3>
            <p className="text-sm text-gold-700 mb-4">Who invited you to join Z2B Table Banquet?</p>
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!hasSponsor} onChange={(e) => { setHasSponsor(!e.target.checked); if (e.target.checked) { setSponsorName(''); setSponsorId('') } }} disabled={!!referralCode} className="w-5 h-5" />
                <span className="font-semibold text-primary-800">I joined directly (No Sponsor)</span>
              </label>
            </div>
            {hasSponsor && !referralCode && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">Sponsor Name *</label>
                  <input type="text" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} className="input-field" placeholder="Enter sponsor's full name" required={hasSponsor && !referralCode} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">Sponsor ID (Optional)</label>
                  <input type="text" value={sponsorId} onChange={(e) => setSponsorId(e.target.value.toUpperCase())} className="input-field" placeholder="e.g., 2C5B61A2" maxLength={8} />
                </div>
              </div>
            )}
            {hasSponsor && referralCode && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✅ Sponsor: {sponsorName || 'Loading...'}</p>
                <p className="text-green-700 text-sm">ID: {sponsorId || referralCode}</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2"><UserPlus className="w-5 h-5" />Complete Registration</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already have an account? <Link href="/login" className="text-primary-700 font-bold hover:text-gold-600">Sign In</Link></p>
        </div>
      </div>

      {/* Bottom workshop nudge */}
      <div className="mt-6 rounded-xl p-5 text-center border-2 border-yellow-400" style={{ background: 'linear-gradient(135deg, #3b0764, #6B21A8)' }}>
        <p className="text-yellow-300 font-bold text-lg mb-1">🤔 Still not sure?</p>
        <p className="text-purple-100 text-sm mb-3">Try our FREE 9-section Entrepreneurial Consumer Workshop first. No registration required. See what you&apos;re joining before you commit.</p>
        <Link href={referralCode ? `/workshop?ref=${referralCode}` : '/workshop'} className="inline-block font-bold py-3 px-10 rounded-lg border-2 border-yellow-400 text-yellow-900 hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}>
          🎓 Experience the Workshop Free
        </Link>
        <p className="text-purple-300 text-xs mt-3">{referralCode ? `Your sponsor's referral link is preserved — register anytime and they'll still get credit.` : `9 free sections. No credit card. No commitment.`}</p>
      </div>

      <div className="mt-6 p-4 bg-white border-2 border-primary-200 rounded-lg">
        <p className="text-sm text-center text-gray-700">
          By signing up, you agree to our{'  '}<Link href="/terms" className="text-primary-700 font-semibold hover:underline">Terms of Service</Link>{'  '}and{'  '}<Link href="/privacy" className="text-primary-700 font-semibold hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ROOT PAGE — decides which form to show
// ─────────────────────────────────────────────────────────────
function SignUpPage() {
  const searchParams  = useSearchParams()
  const referralCode  = searchParams.get('ref')
  const mode          = searchParams.get('mode')
  const [sponsorName, setSponsorName] = useState('')
  const [showFull, setShowFull]       = useState(false)

  // Resolve sponsor name
  useEffect(() => {
    if (!referralCode) return
    supabase.from('profiles').select('full_name').eq('referral_code', referralCode).single()
      .then(({ data }) => { if (data?.full_name) setSponsorName(data.full_name) })
  }, [referralCode])

  // Show quick gate if: has referral code AND not forcing full mode
  const showQuickGate = !!referralCode && mode !== 'full' && !showFull

  if (showQuickGate) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0D0A1E 0%, #1E1B4B 55%, #0A0818 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <QuickGate
          referralCode={referralCode}
          sponsorName={sponsorName}
          onSwitchFull={() => setShowFull(true)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
      <FullSignUpForm referralCode={referralCode} />
    </div>
  )
}

export default function SignUpPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="max-w-md w-full card border-4 border-primary-300 shadow-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600">Loading...</p>
        </div>
      </div>
    }>
      <SignUpPage />
    </Suspense>
  )
}