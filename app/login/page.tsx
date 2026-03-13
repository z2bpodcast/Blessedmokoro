'use client'

// app/login/page.tsx

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginInner() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [mode,     setMode]     = useState<'login'|'reset'>('login')
  const [resetSent,setResetSent]= useState(false)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/dashboard'
  const upgrade      = searchParams.get('upgrade')   || ''

  // If already logged in, send straight to destination
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const dest = upgrade ? `${redirect}?upgrade=${upgrade}` : redirect
        router.push(dest)
      }
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // Redirect back to where they came from (pricing + upgrade tier if set)
    const dest = upgrade ? `${redirect}?autoopen=${upgrade}` : redirect
    router.push(dest)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#0A0015 0%,#1A0035 50%,#0A0015 100%)' }}>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.jpg" alt="Z2B Logo"
              className="h-20 w-20 rounded-2xl border-4 border-yellow-400 shadow-xl mx-auto mb-4"/>
          </Link>
          <h1 className="text-3xl font-black text-white">Welcome Back</h1>
          <p className="text-purple-300 mt-1">
            {upgrade
              ? `Sign in to upgrade to ${upgrade.toUpperCase()}`
              : 'Sign in to your Z2B account'}
          </p>
        </div>

        {/* Upgrade context banner */}
        {upgrade && (
          <div className="mb-5 rounded-2xl p-4 border-2 border-yellow-400/50 text-center"
            style={{ background: '#78350f30' }}>
            <p className="text-yellow-300 font-black">
              🚀 You're upgrading to {upgrade.toUpperCase()}
            </p>
            <p className="text-yellow-200 text-sm mt-1">
              Sign in first — your upgrade continues automatically
            </p>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-white/10 p-8"
          style={{ background: '#1e1b4b90' }}>

          {resetSent ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-white font-black text-xl mb-2">Check Your Email</h2>
              <p className="text-purple-300 text-sm mb-6">
                We sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <button onClick={() => { setMode('login'); setResetSent(false) }}
                className="text-yellow-400 font-bold hover:underline">
                ← Back to Sign In
              </button>
            </div>
          ) : mode === 'reset' ? (
            <form onSubmit={handleReset} className="space-y-4">
              <h2 className="text-white font-black text-xl mb-4">Reset Password</h2>
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-xl p-3 text-sm">{error}</div>
              )}
              <div>
                <label className="text-purple-300 text-sm font-bold block mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-black text-purple-900 transition-all"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => setMode('login')}
                className="w-full text-purple-300 text-sm hover:text-white text-center">
                ← Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-xl p-3 text-sm">{error}</div>
              )}
              <div>
                <label className="text-purple-300 text-sm font-bold block mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400"/>
              </div>
              <div>
                <label className="text-purple-300 text-sm font-bold block mb-2">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-purple-900 text-lg transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
                {loading ? 'Signing in...' : upgrade ? `Sign In & Upgrade →` : 'Sign In →'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setMode('reset')}
                  className="text-purple-400 text-sm hover:text-purple-200">
                  Forgot password?
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-purple-400 text-sm">
            New to Z2B?{' '}
            <Link href="/workshop" className="text-yellow-400 font-bold hover:underline">
              Start the Free Workshop →
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#0A0015,#1A0035)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-yellow-400"/>
      </div>
    }>
      <LoginInner/>
    </Suspense>
  )
}