'use client'

// app/marketplace/join/page.tsx
// New affiliate signup — creates ONE account that works on both
// marketplace.z2blegacybuilders.co.za AND app.z2blegacybuilders.co.za

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function MarketplaceJoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newRefCode, setNewRefCode] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      setError('Please fill in all fields.'); return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }

    setLoading(true)
    setError('')

    try {
      // ── STEP 1: Check if already a Z2B member ──────────────
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, referral_code')
        .eq('email', form.email.toLowerCase().trim())
        .single()

      if (existing) {
        // Already a member — just send them to login
        setError('You already have a Z2B account. Please log in instead.')
        setLoading(false)
        return
      }

      // ── STEP 2: Create auth account ────────────────────────
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        options: { data: { full_name: form.fullName } },
      })

      if (signUpError) throw signUpError

      const userId = authData.user?.id
      if (!userId) throw new Error('Account creation failed.')

      // ── STEP 3: Generate referral code ─────────────────────
      const generatedCode = `${form.fullName.slice(0, 3).toUpperCase().replace(/\s/g, '')}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

      // ── STEP 4: Find sponsor from ref code ─────────────────
      let sponsorId = null
      if (refCode) {
        const { data: sponsor } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', refCode.toUpperCase())
          .single()
        sponsorId = sponsor?.id || null
      }

      // ── STEP 5: Create FAM profile ─────────────────────────
      // FAM tier = free access:
      //   ✅ Marketplace affiliate (share links, earn 20%)
      //   ✅ First 3 features of 4M Machine
      //   ✅ Entrepreneurial Consumer Workshop free content
      //   ❌ Full 4M Machine (requires paid tier)
      //   ❌ Full workshop access (requires paid tier)
      await supabase.from('profiles').upsert({
        id: userId,
        email: form.email.toLowerCase().trim(),
        full_name: form.fullName,
        user_role: 'fam',
        paid_tier: 'fam',
        is_paid_member: false,
        referral_code: generatedCode,
        referred_by: sponsorId,
        sponsor_id: sponsorId,
        joined_at: new Date().toISOString(),
        joined_via: 'marketplace_affiliate',
      })

      setNewRefCode(generatedCode)
      setSuccess(true)

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  // ── SUCCESS SCREEN ──────────────────────────────────────────
  if (success) {
    const shareLink = `https://marketplace.z2blegacybuilders.co.za/book-ecosystem?ref=${newRefCode}`

    return (
      <div className="min-h-screen bg-[#080608] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl text-white mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
            Welcome to Z2B!
          </h1>
          <p className="text-[#e8d48b] text-sm italic mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your account is ready. The same login works on the marketplace and the full Z2B platform.
          </p>

          {/* Their referral code */}
          <div className="rounded-lg p-5 mb-5" style={{ background: '#0f0d18', border: '1px solid rgba(201,162,39,0.3)' }}>
            <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              YOUR REFERRAL CODE
            </div>
            <div className="text-2xl text-[#f0c040] mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px' }}>
              {newRefCode}
            </div>
            <div className="text-xs text-[rgba(255,255,255,0.35)]">
              Use this code on everything. One code. One system.
            </div>
          </div>

          {/* Their first shareable link */}
          <div className="rounded-lg p-4 mb-6" style={{ background: '#0f0d18', border: '1px solid rgba(201,162,39,0.15)' }}>
            <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              YOUR FIRST AFFILIATE LINK — SHARE & EARN 20%
            </div>
            <div className="text-xs text-[rgba(255,255,255,0.5)] break-all mb-3">{shareLink}</div>
            <button
              onClick={() => { navigator.clipboard.writeText(shareLink) }}
              className="w-full py-2.5 rounded-sm text-xs font-bold tracking-widest"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608' }}
            >
              COPY LINK
            </button>
          </div>

          {/* What they can access */}
          <div className="rounded-lg p-4 mb-6 text-left" style={{ background: 'rgba(45,27,105,0.15)', border: '1px solid rgba(201,162,39,0.1)' }}>
            <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              YOUR FREE ACCESS INCLUDES
            </div>
            {[
              '✅ Marketplace affiliate — share any product and earn 20%',
              '✅ First 3 features of the 4M Machine',
              '✅ Entrepreneurial Consumer Workshop — free sessions',
              '✅ Same login on app.z2blegacybuilders.co.za',
            ].map((item, i) => (
              <div key={i} className="text-xs text-[rgba(255,255,255,0.65)] py-1.5 border-b border-white/[0.04]">{item}</div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link href="/marketplace"
              className="flex-1 py-3 rounded-sm text-xs font-bold tracking-widest text-center transition-all"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608' }}>
              BROWSE PRODUCTS
            </Link>
            <Link href="https://app.z2blegacybuilders.co.za/login"
              className="flex-1 py-3 rounded-sm text-xs font-bold tracking-widest text-center border border-[#5a4510]/40 text-[#c9a227] transition-all hover:border-[#c9a227]"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
              GO TO MAIN APP
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── SIGNUP FORM ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080608] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[11px] tracking-[5px] text-[#5a4510] mb-3 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Z2B Marketplace · Affiliate Partner
          </div>
          <h1 className="text-3xl text-white mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
            Join as an Affiliate
          </h1>
          <p className="text-[#e8d48b] text-sm italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Share products. Earn 20% on every sale. One account for everything.
          </p>
          {refCode && (
            <div className="mt-3 text-xs text-[rgba(255,255,255,0.4)]">
              Referred by code: <span className="text-[#c9a227] font-bold">{refCode}</span>
            </div>
          )}
        </div>

        {/* What they get */}
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(45,27,105,0.12)', border: '1px solid rgba(201,162,39,0.15)' }}>
          <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            FREE ACCOUNT INCLUDES
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              '🔗 Affiliate links for any marketplace product',
              '💰 20% commission on every sale you refer',
              '⚡ First 3 features of the 4M Machine',
              '📚 Free Entrepreneurial Consumer Workshop sessions',
              '🌐 Same login on the full Z2B platform',
            ].map((item, i) => (
              <div key={i} className="text-xs text-[rgba(255,255,255,0.65)]">{item}</div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
          <div className="px-6 py-5 flex flex-col gap-4" style={{ background: '#0f0d18' }}>

            {[
              { name: 'fullName', label: 'FULL NAME', type: 'text', placeholder: 'Your full name' },
              { name: 'email', label: 'EMAIL ADDRESS', type: 'email', placeholder: 'your@email.com' },
              { name: 'password', label: 'PASSWORD', type: 'password', placeholder: 'Min 6 characters' },
              { name: 'confirm', label: 'CONFIRM PASSWORD', type: 'password', placeholder: 'Repeat password' },
            ].map(field => (
              <div key={field.name}>
                <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-1.5" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  {field.label}
                </div>
                <input
                  type={field.type}
                  name={field.name}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-sm text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-[#c9a227]"
                />
              </div>
            ))}

            {error && (
              <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-sm font-bold tracking-widest text-sm transition-all disabled:opacity-50"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px', background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608' }}
            >
              {loading ? 'CREATING ACCOUNT…' : 'JOIN FREE — START EARNING'}
            </button>
          </div>
        </div>

        <div className="text-center mt-5">
          <span className="text-xs text-[rgba(255,255,255,0.3)]">Already have an account? </span>
          <Link href="/login" className="text-xs text-[#c9a227] hover:text-[#f0c040]">
            Sign in here
          </Link>
        </div>

        <div className="text-center mt-3 text-[10px] text-[rgba(255,255,255,0.2)]">
          Zero2Billionaires Amavulandlela Pty Ltd · app.z2blegacybuilders.co.za
        </div>

      </div>
    </div>
  )
}

export default function MarketplaceJoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080608] flex items-center justify-center">
        <div className="text-2xl animate-pulse">⚡</div>
      </div>
    }>
      <MarketplaceJoinContent />
    </Suspense>
  )
}
