'use client'
// ============================================================
// Z2B 4M V3 — IDEA IGNITION ENTRY PAGE
// File: app/ai-income/ignition/page.tsx
// Laws: Mobile-first · Premium UX · Guided · Hidden complexity
// Purpose: Route selection screen — Self Discovery or Market
// ============================================================

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Z2BLogo } from '@/components/Z2BLogo'
import Link from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'

function IgnitionEntry() {
  const router = useRouter()
  const [loading, setLoading]     = useState(true)
  const [tierLabel, setTierLabel] = useState('')
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('paid_tier, full_name')
        .eq('id', user.id)
        .single()

      const tier = profile?.paid_tier || 'fam'

      // Gate: FAM cannot access Idea Ignition
      if (tier === 'fam' || tier === 'free') {
        router.push('/pricing?reason=ignition')
        return
      }

      const tierLabels: Record<string, string> = {
        starter:         'Manual Starter',
        bronze:          'Manual Bronze',
        copper:          'Automatic Copper',
        silver:          'Electric Silver',
        gold:            'Gold',
        platinum:        'Platinum',
        rocket_gold:     'Rocket Gold',
        rocket_platinum: 'Rocket Platinum',
      }
      setTierLabel(tierLabels[tier] ?? tier)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: MUTED, fontSize: '13px', fontFamily: 'Georgia,serif' }}>Preparing your ignition...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: BG + 'EE', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Z2BLogo size="sm" showText={false} href="/dashboard" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: GOLD, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '4px 10px', borderRadius: '20px' }}>
            {tierLabel}
          </span>
          <Link href="/dashboard" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      {/* Gear Progress Bar — Phase 0 */}
      <div style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0' }}>
          {['IG', '1', '2', '3', '4', '5', '6', '7'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 7 ? 1 : 0 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? GOLD : (i > 3 && tierLabel.includes('Starter')) || (i > 4 && tierLabel.includes('Bronze')) || (i > 5 && tierLabel.includes('Copper')) ? 'transparent' : 'rgba(255,255,255,0.06)',
                border: '2px solid ' + (i === 0 ? GOLD : 'rgba(255,255,255,0.1)'),
                fontSize: '11px', fontWeight: i === 0 ? 900 : 400,
                color: i === 0 ? '#050A18' : (i > 3 && tierLabel.includes('Starter')) || (i > 4 && tierLabel.includes('Bronze')) || (i > 5 && tierLabel.includes('Copper')) ? 'rgba(255,255,255,0.15)' : MUTED,
              }}>
                {label}
              </div>
              {i < 7 && <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.06)' }} />}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: GOLD }}>
          Idea Ignition — Discovering your opportunity
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>

          {/* Headline */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', color: CYAN, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
              🌱 Idea Ignition Mode
            </div>
            <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,5vw,36px)', fontWeight: 900, color: W, margin: '0 0 14px', lineHeight: 1.3 }}>
              What will your next<br />product be about?
            </h1>
            <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.8, margin: 0 }}>
              Let the system find it for you.<br />
              Choose how you want to discover your opportunity.
            </p>
          </div>

          {/* Route Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>

            {/* Self Discovery */}
            <button
              onClick={() => router.push('/ai-income/ignition/self')}
              style={{
                width: '100%', padding: '28px 24px', borderRadius: '18px', cursor: 'pointer', textAlign: 'left',
                background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(139,92,246,0.05))',
                border: '1.5px solid rgba(139,92,246,0.4)',
                transition: 'all 0.2s', outline: 'none',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#8B5CF6'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ fontSize: '36px', flexShrink: 0 }}>🌱</div>
                <div>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '17px', fontWeight: 900, color: '#A78BFA', marginBottom: '8px' }}>
                    Self Discovery
                  </div>
                  <div style={{ fontSize: '13px', color: MUTED, lineHeight: 1.7, marginBottom: '12px' }}>
                    Start with what you know. Your knowledge, experience and passion is the product. We find it.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Your expertise', 'Your story', 'Your transformation'].map(tag => (
                      <span key={tag} style={{ fontSize: '10px', color: '#8B5CF6', background: 'rgba(139,92,246,0.12)', padding: '3px 8px', borderRadius: '10px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '20px', color: '#8B5CF6', flexShrink: 0 }}>→</div>
              </div>
            </button>

            {/* Market Discovery */}
            <button
              onClick={() => router.push('/ai-income/ignition/market')}
              style={{
                width: '100%', padding: '28px 24px', borderRadius: '18px', cursor: 'pointer', textAlign: 'left',
                background: 'linear-gradient(135deg,rgba(6,182,212,0.12),rgba(6,182,212,0.05))',
                border: '1.5px solid rgba(6,182,212,0.4)',
                transition: 'all 0.2s', outline: 'none',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#06B6D4'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,182,212,0.4)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ fontSize: '36px', flexShrink: 0 }}>🌍</div>
                <div>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '17px', fontWeight: 900, color: CYAN, marginBottom: '8px' }}>
                    Market Discovery
                  </div>
                  <div style={{ fontSize: '13px', color: MUTED, lineHeight: 1.7, marginBottom: '12px' }}>
                    Start with what sells. The market has a gap. We find it for you using real demand intelligence.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Market gaps', 'Real demand', 'Trend intelligence'].map(tag => (
                      <span key={tag} style={{ fontSize: '10px', color: CYAN, background: 'rgba(6,182,212,0.12)', padding: '3px 8px', borderRadius: '10px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '20px', color: CYAN, flexShrink: 0 }}>→</div>
              </div>
            </button>
          </div>

          {/* Reassurance */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.8 }}>
            Both routes lead to the same Gear 1.<br />
            You can always start a new product with a different route.
          </div>

        </div>
      </div>

    </div>
  )
}

export default function IgnitionPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif', fontSize: '14px' }}>
        Loading...
      </div>
    }>
      <IgnitionEntry />
    </Suspense>
  )
}
