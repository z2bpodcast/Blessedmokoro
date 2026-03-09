'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserPlus, MapPin, Building2, Users, User } from 'lucide-react'

// Separate component for the form that uses useSearchParams
function SignUpForm() {
  // Personal Info
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [idNumber, setIdNumber] = useState('')
  
  // Address Info
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  
  // Banking Info
  const [bankName, setBankName] = useState('')
  const [accountType, setAccountType] = useState('cheque')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  
  // Sponsor Info
  const [hasSponsor, setHasSponsor] = useState(true)
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorId, setSponsorId] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const referralCode = searchParams.get('ref')

  useEffect(() => {
    if (referralCode) {
      setHasSponsor(true)
      fetchSponsorInfo(referralCode)
    }
  }, [referralCode])

  const fetchSponsorInfo = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, referral_code')
        .eq('referral_code', code)
        .single()
      if (error) throw error
      if (data) {
        setSponsorName(data.full_name)
        setSponsorId(data.referral_code)
      }
    } catch (err) {
      console.error('Error fetching sponsor:', err)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!fullName.trim()) { setError('Please enter your full name'); setLoading(false); return }
    if (!phoneNumber.trim()) { setError('Please enter your phone number'); setLoading(false); return }
    if (hasSponsor && !sponsorName.trim() && !referralCode) {
      setError("Please enter your sponsor's name or select \"No Sponsor\"")
      setLoading(false); return
    }

    try {
      const metadata = {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        whatsapp_number: whatsappNumber.trim() || phoneNumber.trim(),
        birth_date: birthDate || null,
        id_number: idNumber.trim() || null,
        street_address: streetAddress.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        postal_code: postalCode.trim() || null,
        bank_name: bankName.trim() || null,
        account_type: accountType,
        account_number: accountNumber.trim() || null,
        account_holder: accountHolder.trim() || null,
        sponsor_name: hasSponsor ? (sponsorName.trim() || 'Direct Registration') : 'No Sponsor',
        sponsor_id: hasSponsor ? (sponsorId.trim() || null) : null,
        referred_by: referralCode || null,
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim(),
            phone_number: phoneNumber.trim(),
            whatsapp_number: whatsappNumber.trim() || phoneNumber.trim(),
            birth_date: birthDate || null,
            id_number: idNumber.trim() || null,
            street_address: streetAddress.trim() || null,
            city: city.trim() || null,
            province: province.trim() || null,
            postal_code: postalCode.trim() || null,
            bank_name: bankName.trim() || null,
            account_type: accountType,
            account_number: accountNumber.trim() || null,
            account_holder: accountHolder.trim() || null,
            sponsor_name: hasSponsor ? (sponsorName.trim() || 'Direct Registration') : 'No Sponsor',
            sponsor_id: hasSponsor ? (sponsorId.trim() || null) : null,
            referred_by: referralCode || null,
          })
          .eq('id', authData.user.id)

        alert('🎉 Registration successful! Please check your email to verify your account.')
        router.push('/login')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const provinces = [
    'Gauteng','Western Cape','Eastern Cape','KwaZulu-Natal',
    'Limpopo','Mpumalanga','North West','Northern Cape','Free State',
  ]

  const banks = [
    'ABSA','Capitec','FNB','Nedbank','Standard Bank',
    'African Bank','Discovery Bank','TymeBank','Other',
  ]

  return (
    <div className="max-w-4xl w-full">

      {/* ── NAVIGATION BAR ── */}
      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        <Link
          href="/"
          className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 shadow-lg"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 shadow-lg"
        >
          About Us
        </Link>
        <Link
          href="/pricing"
          className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 shadow-lg"
        >
          Pricing
        </Link>

        {/* ── FREE WORKSHOP BUTTON ── prospect can explore before signing up */}
        <Link
          href={referralCode ? `/workshop?ref=${referralCode}` : '/workshop'}
          className="font-semibold py-2 px-6 rounded-lg transition-all border-2 border-yellow-400 text-yellow-900 hover:scale-105 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
        >
          🎁 Free Workshop — Try Before You Join!
        </Link>
      </div>

      {/* ── WORKSHOP TEASER BANNER ── only shown when arriving via referral */}
      {referralCode && sponsorName && (
        <div
          className="mb-6 rounded-xl p-5 text-white text-center border-2 border-yellow-400"
          style={{ background: 'linear-gradient(135deg, #6B21A8, #9333EA)' }}
        >
          <p className="text-yellow-300 font-bold text-lg mb-1">
            🏆 {sponsorName} invited you to the Z2B Table!
          </p>
          <p className="text-purple-100 text-sm mb-3">
            Not sure yet? Explore our FREE 9-day Entrepreneurial Consumer Workshop first.
            No account needed for the first 9 sections.
          </p>
          <Link
            href={`/workshop?ref=${referralCode}`}
            className="inline-block font-bold py-2 px-8 rounded-lg border-2 border-yellow-400 text-yellow-900"
            style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
          >
            🎓 Start Free Workshop Now
          </Link>
          <p className="text-purple-200 text-xs mt-3">
            Your referral link is saved — come back to register anytime and {sponsorName} will still be your sponsor.
          </p>
        </div>
      )}

      {/* ── LOGO & HEADING ── */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <img
            src="/logo.jpg"
            alt="Z2B Logo"
            className="h-20 w-20 rounded-xl border-4 border-gold-400 shadow-lg mx-auto mb-4"
          />
        </Link>
        <h1 className="text-4xl font-bold text-primary-800 mb-2">Complete Registration</h1>
        <p className="text-primary-600">Join the Z2B Table Banquet Family</p>
      </div>

      {/* ── REFERRAL NOTICE (no sponsor banner) ── */}
      {referralCode && sponsorName && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold text-center mb-1">
            ✅ You&apos;re joining via referral from:
          </p>
          <p className="text-green-900 font-bold text-center text-lg">{sponsorName}</p>
          <p className="text-green-700 text-center text-sm">Referral Code: {referralCode}</p>
        </div>
      )}

      {/* ── SIGNUP FORM ── */}
      <div className="card border-4 border-primary-300 shadow-2xl">
        <form onSubmit={handleSignUp} className="space-y-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-400 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* SECTION 1: Personal Information */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
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

          {/* SECTION 2: Address Information */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Physical Address (Optional)
            </h3>
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

          {/* SECTION 3: Banking Information */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Banking Information (For Payouts)
            </h3>
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

          {/* SECTION 4: Sponsor Information */}
          <div className="bg-gold-50 border-2 border-gold-400 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gold-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sponsor Information
            </h3>
            <p className="text-sm text-gold-700 mb-4">Who invited you to join Z2B Table Banquet?</p>

            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hasSponsor}
                  onChange={(e) => {
                    setHasSponsor(!e.target.checked)
                    if (e.target.checked) { setSponsorName(''); setSponsorId('') }
                  }}
                  disabled={!!referralCode}
                  className="w-5 h-5"
                />
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

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Complete Registration
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-700 font-bold hover:text-gold-600">Sign In</Link>
          </p>
        </div>
      </div>

      {/* ── BOTTOM WORKSHOP NUDGE ── for those who scroll to the bottom and still hesitate */}
      <div
        className="mt-6 rounded-xl p-5 text-center border-2 border-yellow-400"
        style={{ background: 'linear-gradient(135deg, #3b0764, #6B21A8)' }}
      >
        <p className="text-yellow-300 font-bold text-lg mb-1">🤔 Still not sure?</p>
        <p className="text-purple-100 text-sm mb-3">
          Try our FREE 9-section Entrepreneurial Consumer Workshop first.
          No registration required. See what you&apos;re joining before you commit.
        </p>
        <Link
          href={referralCode ? `/workshop?ref=${referralCode}` : '/workshop'}
          className="inline-block font-bold py-3 px-10 rounded-lg border-2 border-yellow-400 text-yellow-900 hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
        >
          🎓 Experience the Workshop Free
        </Link>
        <p className="text-purple-300 text-xs mt-3">
          {referralCode
            ? `Your sponsor's referral link is preserved — register anytime and they'll still get credit.`
            : `9 free sections. No credit card. No commitment.`}
        </p>
      </div>

      <div className="mt-6 p-4 bg-white border-2 border-primary-200 rounded-lg">
        <p className="text-sm text-center text-gray-700">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-primary-700 font-semibold hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary-700 font-semibold hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

// Main page with Suspense boundary
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="max-w-md w-full card border-4 border-primary-300 shadow-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600">Loading...</p>
        </div>
      }>
        <SignUpForm />
      </Suspense>
    </div>
  )
}