'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserPlus, Mail, Lock, User, Users } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorId, setSponsorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get referral code from URL (if exists)
  const referralCode = searchParams.get('ref')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name')
      setLoading(false)
      return
    }

    if (!sponsorName.trim() && !referralCode) {
      setError('Please enter your sponsor\'s name (or use a referral link)')
      setLoading(false)
      return
    }

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            sponsor_name: sponsorName.trim() || 'Direct Registration',
            sponsor_id: sponsorId.trim() || null,
            referred_by: referralCode || null
          }
        }
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        // Update profile with sponsor info
        await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            sponsor_name: sponsorName.trim() || 'Direct Registration',
            sponsor_id: sponsorId.trim() || null,
            referred_by: referralCode || null
          })
          .eq('id', authData.user.id)

        // If there's a referral code, track the referral
        if (referralCode) {
          await supabase
            .from('referrals')
            .insert({
              referrer_code: referralCode,
              referred_user_id: authData.user.id,
              status: 'pending'
            })
            .single()
        }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.jpg" alt="Z2B Logo" className="h-20 w-20 rounded-xl border-4 border-gold-400 shadow-lg mx-auto mb-4" />
          </Link>
          <h1 className="text-4xl font-bold text-primary-800 mb-2">Join the Banquet</h1>
          <p className="text-primary-600">Start your journey to entrepreneurship</p>
        </div>

        {/* Referral Notice */}
        {referralCode && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg">
            <p className="text-green-800 font-semibold text-center">
              ✅ You're joining via referral code: <span className="text-green-600">{referralCode}</span>
            </p>
          </div>
        )}

        {/* Signup Form */}
        <div className="card border-4 border-primary-300 shadow-2xl">
          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-400 text-red-800 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-primary-800 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600 w-5 h-5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-primary-800 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-primary-800 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Sponsor Information */}
            {!referralCode && (
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-700" />
                  <h3 className="font-bold text-purple-900">Sponsor Information</h3>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  Who invited you to join? (If you have a referral link, use that instead)
                </p>

                {/* Sponsor Name */}
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    Sponsor Name *
                  </label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="input-field"
                    placeholder="Enter your sponsor's name"
                    required={!referralCode}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Required - Enter the name of the person who invited you
                  </p>
                </div>

                {/* Sponsor ID */}
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    Sponsor ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={sponsorId}
                    onChange={(e) => setSponsorId(e.target.value.toUpperCase())}
                    className="input-field"
                    placeholder="e.g., 2C5B61A2"
                    maxLength={8}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Optional - If you know their Member ID
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create My Account
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-700 font-bold hover:text-gold-600">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-white border-2 border-primary-200 rounded-lg">
          <p className="text-sm text-center text-gray-700">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary-700 font-semibold hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary-700 font-semibold hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}