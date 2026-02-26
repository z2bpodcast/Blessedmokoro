'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')

  useEffect(() => {
    if (referralCode) {
      // Track the referral click
      trackReferralClick(referralCode)
    }
  }, [referralCode])

  const trackReferralClick = async (code: string) => {
    try {
      // Find the referrer
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .single()

      if (referrer) {
        await supabase.from('referral_clicks').insert({
          referrer_id: referrer.id,
          ip_address: null, // In production, capture from headers
          user_agent: navigator.userAgent,
        })
      }
    } catch (error) {
      console.error('Error tracking referral:', error)
    }
  }

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile with referral tracking
        const newReferralCode = generateReferralCode()
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            whatsapp_number: whatsappNumber,
            referral_code: newReferralCode,
            referred_by: referralCode || null,
          })

        if (profileError) throw profileError

        // Mark referral as converted if applicable
        if (referralCode) {
          const { data: referrer } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', referralCode)
            .single()

          if (referrer) {
            await supabase
              .from('referral_clicks')
              .update({ converted: true })
              .eq('referrer_id', referrer.id)
              .is('converted', false)
              .order('created_at', { ascending: false })
              .limit(1)
          }
        }

        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #6b21a8 0, #6b21a8 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.jpg" alt="Z2B Logo" className="h-24 w-24 mx-auto rounded-2xl border-4 border-gold-400 shadow-2xl mb-4" />
            <h1 className="text-3xl font-bold text-primary-800 mb-2">Z2B TABLE BANQUET</h1>
          </Link>
          <p className="text-primary-600 font-medium">Join the royal table of wisdom</p>
          
          {/* About Button */}
          <Link 
            href="/about" 
            className="inline-block mt-3 bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400"
          >
            Learn More About Z2B
          </Link>

          {referralCode && (
            <p className="text-sm text-white bg-royal-gradient mt-3 px-4 py-2 rounded-full font-semibold border-2 border-gold-400 inline-block">
              🎉 You've been invited! Welcome to the banquet.
            </p>
          )}
        </div>

        <div className="card border-4 border-primary-600 shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-bold text-primary-800 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-bold text-primary-800 mb-1">
                WhatsApp Number
              </label>
              <input
                id="whatsappNumber"
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="input-field"
                placeholder="+27 123 456 7890"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +27 for South Africa)</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-primary-800 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-primary-800 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating your seat...' : 'Join the Banquet'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already a member? </span>
            <Link href="/login" className="text-primary-700 font-bold hover:text-gold-600 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}