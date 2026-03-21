'use client'

// app/z2b-command-7x9k/page.tsx
// SECRET ADMIN ENTRY — do not link to this page publicly
// URL: /z2b-command-7x9k
// This is the ONLY way into the admin system

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── SECRET PASSPHRASE ── change this to something only you know ──
const ADMIN_PASSPHRASE = 'legacy7table9'
const SESSION_KEY      = 'z2b_cmd_auth'
const SESSION_VALUE    = 'z2b_unlocked_2026'

export default function AdminGatePage() {
  const [phase,    setPhase]    = useState<'loading'|'login'|'passphrase'|'denied'>('loading')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [phrase,   setPhrase]   = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)
  const [attempts, setAttempts] = useState(0)
  const router = useRouter()

  const ADMIN_ROLES = ['ceo','superadmin','admin','content_admin','support','staff']

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    // Already has session token?
    const token = sessionStorage.getItem(SESSION_KEY)
    if (token === SESSION_VALUE) {
      // Verify still logged in with admin role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('user_role').eq('id', user.id).single()
        if (ADMIN_ROLES.includes(String(profile?.user_role || ''))) {
          router.push('/z2b-command-7x9k/hub')
          return
        }
      }
    }
    // Check if already logged into Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('user_role').eq('id', user.id).single()
      if (ADMIN_ROLES.includes(String(profile?.user_role || ''))) {
        // Logged in + admin role — just need passphrase
        setPhase('passphrase')
        return
      }
    }
    setPhase('login')
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Enter your credentials.'); return }
    setBusy(true); setError('')
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw authErr
      // Check admin role
      const { data: profile } = await supabase.from('profiles').select('user_role').eq('id', data.user.id).single()
      if (!ADMIN_ROLES.includes(String(profile?.user_role || ''))) {
        await supabase.auth.signOut()
        setPhase('denied')
        return
      }
      setPhase('passphrase')
    } catch(err: any) {
      setError('Invalid credentials. Try again.')
      setAttempts(a => a + 1)
      if (attempts >= 4) {
        setError('Too many failed attempts. Please wait.')
        setTimeout(() => setAttempts(0), 60000)
      }
    } finally { setBusy(false) }
  }

  const handlePassphrase = () => {
    if (phrase.trim().toLowerCase() === ADMIN_PASSPHRASE) {
      sessionStorage.setItem(SESSION_KEY, SESSION_VALUE)
      router.push('/z2b-command-7x9k/hub')
    } else {
      setError('Incorrect passphrase.')
      setPhrase('')
      setAttempts(a => a + 1)
      if (attempts >= 3) {
        supabase.auth.signOut()
        setPhase('denied')
      }
    }
  }

  // ── LOADING ──
  if (phase === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#0f0f1a' }}>
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400"/>
    </div>
  )

  // ── DENIED ──
  if (phase === 'denied') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#0f0f1a' }}>
      <div className="text-center max-w-sm mx-auto px-6">
        <div className="text-6xl mb-6">🚫</div>
        <h2 className="text-white text-2xl font-black mb-3">Access Denied</h2>
        <p className="text-gray-400 text-sm mb-6">You don't have permission to access this area.</p>
        <button onClick={() => { setPhase('login'); setAttempts(0); setError('') }}
          className="text-yellow-400 text-sm underline">Try again</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f1a0f 100%)' }}>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background:'radial-gradient(circle, #7C3AED, transparent)' }}/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background:'radial-gradient(circle, #D4AF37, transparent)' }}/>
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl"
            style={{ background:'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
            <span className="text-2xl">👑</span>
          </div>
          <h1 className="text-white text-xl font-black tracking-widest uppercase">Z2B Command</h1>
          <p className="text-gray-600 text-xs mt-1 tracking-wider">RESTRICTED ACCESS</p>
        </div>

        {/* ── PHASE: LOGIN ── */}
        {phase === 'login' && (
          <div className="rounded-2xl p-8 shadow-2xl border border-white/10"
            style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)' }}>
            <h2 className="text-white font-bold text-lg mb-6 text-center">Sign In</h2>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-2">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleLogin()}
                  placeholder="admin@z2b.co.za"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-all"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-2">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button onClick={handleLogin} disabled={busy || attempts >= 5}
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-40"
                style={{ background:'linear-gradient(135deg, #D4AF37, #F59E0B)', color:'#1a0a2e' }}>
                {busy ? 'Verifying...' : 'Enter →'}
              </button>
            </div>
          </div>
        )}

        {/* ── PHASE: PASSPHRASE ── */}
        {phase === 'passphrase' && (
          <div className="rounded-2xl p-8 shadow-2xl border border-yellow-400/30"
            style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)' }}>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔑</div>
              <h2 className="text-white font-bold text-lg">One More Step</h2>
              <p className="text-gray-500 text-xs mt-1">Enter the command passphrase</p>
            </div>

            <div className="space-y-4">
              <input
                type="password" value={phrase} onChange={e => setPhrase(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handlePassphrase()}
                placeholder="••••••••••••"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-all text-center tracking-widest"
                autoComplete="off"
                autoFocus
              />

              {error && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button onClick={handlePassphrase}
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                style={{ background:'linear-gradient(135deg, #7C3AED, #4C1D95)', color:'white' }}>
                Unlock Command Centre →
              </button>

              <button onClick={async () => { await supabase.auth.signOut(); setPhase('login'); setPhrase(''); setError('') }}
                className="w-full text-center text-gray-600 text-xs hover:text-gray-400 transition-all">
                ← Sign out
              </button>
            </div>
          </div>
        )}

        {/* Footer — no hints */}
        <p className="text-center text-gray-800 text-xs mt-6">
          Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}
