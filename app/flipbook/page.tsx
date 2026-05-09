'use client'
// app/flipbook/page.tsx
// Access levels:
//   ?access=free  → preview only (no 4M)
//   ?buy=r200     → R200 paid → full flipbook + 3 x 4M features
//   ?buy=r700     → R700 paid → full flipbook + all 7 x 4M + audio + workbook

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function FlipbookContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const buyParam = searchParams.get('buy')
  const accessParam = searchParams.get('access')

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [accessLevel, setAccessLevel] = useState<'free' | 'r200' | 'r700' | 'denied'>('free')

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Not logged in — show free preview only
        setAccessLevel('free')
        setLoading(false)
        return
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('paid_tier, is_paid_member, payment_status')
        .eq('id', user.id)
        .single()

      setProfile(prof)

      const tier = prof?.paid_tier || 'fam'
      const isPaid = prof?.is_paid_member || prof?.payment_status === 'paid'

      // Determine access level
      if (['bronze', 'copper', 'silver', 'gold', 'platinum'].includes(tier)) {
        // Full members get full book system
        setAccessLevel('r700')
      } else if (tier === 'fam' && isPaid) {
        // Starter Pack — full book system
        setAccessLevel('r700')
      } else if (buyParam === 'r200') {
        // Came from R200 purchase — flipbook + 3 x 4M
        setAccessLevel('r200')
      } else if (accessParam === 'free') {
        setAccessLevel('free')
      } else {
        // Free affiliate — show preview
        setAccessLevel('free')
      }

      setLoading(false)
    }
    check()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#080608,#1a0d35)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"/>
        <p className="text-yellow-300 font-bold text-sm">Loading your book...</p>
      </div>
    </div>
  )

  // Free preview — show upgrade prompt
  if (accessLevel === 'free') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg,#080608,#1a0d35)' }}>
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="text-2xl font-black text-white mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Zero2Billionaires
          </h1>
          <p className="text-yellow-300 italic text-sm mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            by Rev Mokoro Manana
          </p>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">
            Get access to the full flipbook and start your journey from salary struggles to digital freedom.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/book?buy=r200"
              className="block py-4 rounded-sm font-black text-sm tracking-widest"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px',
                background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608'
              }}>
              📖 GET FLIPBOOK — R200
            </Link>
            <Link href="/book?buy=r700"
              className="block py-4 rounded-sm font-black text-sm tracking-widest border border-yellow-600/40 text-yellow-300"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px' }}>
              ⚡ FULL BOOK SYSTEM — R700
            </Link>
            <Link href="/book"
              className="text-white/30 text-xs mt-2"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              LEARN MORE →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // R200 access — embed flipbook HTML
  if (accessLevel === 'r200') {
    return (
      <div className="min-h-screen" style={{ background: '#080608' }}>
        {/* Access banner */}
        <div className="px-4 py-2 text-center text-xs"
          style={{ background: 'linear-gradient(90deg,#2d1b69,#1a0d35)', borderBottom: '1px solid rgba(201,162,39,0.2)' }}>
          <span style={{ color: '#5a4510', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            FLIPBOOK ACCESS · R200 PACKAGE · FIRST 3 FEATURES OF 4M MACHINE INCLUDED
          </span>
          <a href="/book?buy=r700" className="ml-4 text-yellow-400 underline">Upgrade to Full System →</a>
        </div>
        <iframe
          src="/z2b_flipbook_v2.html"
          className="w-full"
          style={{ height: 'calc(100vh - 40px)', border: 'none' }}
          title="Zero2Billionaires Flipbook"
        />
      </div>
    )
  }

  // R700 / Full member access — embed full reader
  return (
    <div className="min-h-screen" style={{ background: '#080608' }}>
      {/* Access banner */}
      <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-2"
        style={{ background: 'linear-gradient(90deg,#2d1b69,#1a0d35)', borderBottom: '1px solid rgba(201,162,39,0.3)' }}>
        <span style={{ color: '#f0c040', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px', fontSize: '0.65rem' }}>
          ⚡ FULL BOOK SYSTEM — ALL 7 FEATURES UNLOCKED
        </span>
        <div className="flex gap-3">
          <Link href="/reader"
            className="text-xs px-3 py-1 rounded-sm"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px', background: 'rgba(201,162,39,0.15)', color: '#f0c040', border: '1px solid rgba(201,162,39,0.3)' }}>
            📚 READER
          </Link>
          <Link href="/audio-reader"
            className="text-xs px-3 py-1 rounded-sm"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px', background: 'rgba(201,162,39,0.15)', color: '#f0c040', border: '1px solid rgba(201,162,39,0.3)' }}>
            🎧 AUDIO
          </Link>
          <Link href="/workbook"
            className="text-xs px-3 py-1 rounded-sm"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px', background: 'rgba(201,162,39,0.15)', color: '#f0c040', border: '1px solid rgba(201,162,39,0.3)' }}>
            📓 WORKBOOK
          </Link>
          <a href="/Zero2Billionaires_eBook.pdf" download="Zero2Billionaires_eBook.pdf"
            className="text-xs px-3 py-1 rounded-sm"
            style={{ fontFamily:'Bebas Neue, sans-serif', letterSpacing:'2px', background:'linear-gradient(135deg,#c9a227,#f0c040)', color:'#080608', border:'none', cursor:'pointer' }}>
            ⬇️ PDF
          </a>
        </div>
      </div>
      <iframe
        src="/z2b_flipbook_v2.html"
        className="w-full"
        style={{ height: 'calc(100vh - 44px)', border: 'none' }}
        title="Zero2Billionaires Full Book System"
      />
    </div>
  )
}

export default function FlipbookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#080608,#1a0d35)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400"/>
      </div>
    }>
      <FlipbookContent />
    </Suspense>
  )
}
