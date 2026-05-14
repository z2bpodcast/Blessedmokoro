'use client'
// ============================================================
// Z2B 4M V3 — 4M MACHINE HUB PAGE
// File: app/ai-income/page.tsx
// Laws: Tier-gated entry · Session resume · Portfolio view
//       Mobile-first · No orchestration exposed
// ============================================================

import { useState, useEffect, Suspense, memo } from 'react'
import { useRouter }                             from 'next/navigation'
import { supabase }                              from '@/lib/supabase'
import Link                                      from 'next/link'
import {
  ActiveSessionCard,
  CompletedProductCard,
  NoSessionCard,
  type ActiveSessionData,
  type CompletedProductData,
} from '@/components/v3/GearStatusCard'
import { getTier, normaliseTier } from '@/lib/v3/tier-config'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

// ── STAT CARD ─────────────────────────────────────────────────
const StatCard = memo(function StatCard({ label, value, color = W }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontWeight: 900, color, fontFamily: 'Cinzel,Georgia,serif', marginBottom: '3px' }}>{value}</div>
      <div style={{ fontSize: '10px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  )
})

function AiIncomeInner() {
  const router = useRouter()

  const [loading,    setLoading]    = useState(true)
  const [tierId,     setTierId]     = useState('fam')
  const [tierLabel,  setTierLabel]  = useState('Free Member')
  const [firstName,  setFirstName]  = useState('')
  const [bfmStatus,  setBfmStatus]  = useState('none')
  const [session,    setSession]    = useState<ActiveSessionData | null>(null)
  const [products,   setProducts]   = useState<CompletedProductData[]>([])
  const [totalWords, setTotalWords] = useState(0)
  const [isRocket,   setIsRocket]   = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('paid_tier, full_name, bfm_status, gear_access')
        .eq('id', user.id)
        .single() as { data: { paid_tier: string | null; full_name: string | null; bfm_status: string | null; gear_access: number | null } | null }

      const tier = normaliseTier(profile?.paid_tier ?? 'fam')
      const tierDef = getTier(tier)
      setTierId(tier)
      setTierLabel(tierDef.label)
      setFirstName(profile?.full_name?.split(' ')[0] ?? '')
      setBfmStatus(profile?.bfm_status ?? 'none')
      setIsRocket(tierDef.isRocket)

      // Load active session
      const { data: activeSessions } = await (supabase.from as any)('gear_sessions')
        .select('id, opportunity_data, phase_current, gear_access, product_status, updated_at')
        .eq('builder_id', user.id)
        .eq('session_status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1) as { data: any[] | null }

      if (activeSessions?.[0]) {
        const s = activeSessions[0]
        const oppData = s.opportunity_data as { title?: string } | null
        setSession({
          sessionId:     s.id,
          productTitle:  oppData?.title ?? 'Product in progress',
          currentGear:   s.phase_current ?? 0,
          gearAccess:    s.gear_access ?? tierDef.gearAccess,
          productStatus: s.product_status,
          updatedAt:     s.updated_at,
        })
      }

      // Load completed products
      const { data: completedSessions } = await (supabase.from as any)('gear_sessions')
        .select('id, opportunity_data, distribution_data, completed_at, marketplace_id')
        .eq('builder_id', user.id)
        .eq('session_status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10) as { data: any[] | null }

      if (completedSessions?.length) {
        const mapped: CompletedProductData[] = completedSessions
          .filter((s: any) => s.completed_at)
          .map((s: any) => {
            const opp  = s.opportunity_data as any
            const dist = s.distribution_data as any
            return {
              productId:   s.marketplace_id ?? s.id,
              sessionId:   s.id,
              title:       dist?.productTitle ?? opp?.title ?? 'Completed Product',
              priceZar:    dist?.priceZar ?? opp?.priceRangeMin ?? 0,
              format:      dist?.format ?? opp?.format ?? 'eBook',
              completedAt: s.completed_at,
            }
          })
        setProducts(mapped)

        // Estimate total words (not exposed as exact number)
        setTotalWords(mapped.length * 3500)
      }

      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const canAccess4M   = tierId !== 'fam' && tierId !== 'free'
  const isBfmOverdue  = bfmStatus === 'overdue' || bfmStatus === 'suspended'
  const tierDef       = getTier(tierId)

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: BG + 'EE', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/dashboard" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Dashboard</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>4M Machine</span>
        <span style={{ fontSize: '11px', color: tierDef.isRocket ? CYAN : GOLD, background: tierDef.isRocket ? 'rgba(6,182,212,0.12)' : 'rgba(212,175,55,0.12)', border: '1px solid ' + (tierDef.isRocket ? 'rgba(6,182,212,0.3)' : 'rgba(212,175,55,0.3)'), padding: '3px 10px', borderRadius: '20px' }}>
          {tierDef.emoji} {tierLabel}
        </span>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: W, margin: '0 0 6px' }}>
            {firstName ? `Welcome back, ${firstName}.` : 'Your 4M Machine'}
          </h1>
          <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>
            {session ? 'You have a product in progress.' : canAccess4M ? 'Start your next digital product.' : 'Upgrade to unlock the 4M Machine.'}
          </p>
        </div>

        {/* BFM overdue warning */}
        {isBfmOverdue && (
          <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F87171', marginBottom: '4px' }}>⚠️ BFM Payment Overdue</div>
            <div style={{ fontSize: '12px', color: MUTED }}>Your product creation access is suspended. Please contact admin to resolve your payment.</div>
          </div>
        )}

        {/* Stats row */}
        {canAccess4M && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '24px' }}>
            <StatCard label="Products Live" value={products.length} color={GREEN} />
            <StatCard label="In Progress"   value={session ? 1 : 0}  color={GOLD} />
            <StatCard label="Gears Access"  value={tierDef.gearAccess === 7 ? 'All 7' : `1–${tierDef.gearAccess}`} color={CYAN} />
          </div>
        )}

        {/* Active session */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Current Session
          </div>
          {!canAccess4M || isBfmOverdue ? (
            <NoSessionCard tierId={tierId} />
          ) : session ? (
            <ActiveSessionCard session={session} />
          ) : (
            <NoSessionCard tierId={tierId} />
          )}
        </div>

        {/* Start new product button */}
        {canAccess4M && !isBfmOverdue && (
          <Link href="/ai-income/ignition"
            style={{
              display: 'block', width: '100%', padding: '15px', borderRadius: '14px', textAlign: 'center',
              background: session ? 'transparent' : 'linear-gradient(135deg,#D4AF37,#B8860B)',
              border: session ? '1px solid rgba(212,175,55,0.3)' : 'none',
              color: session ? GOLD : '#050A18',
              fontWeight: 900, fontSize: '14px', textDecoration: 'none',
              fontFamily: 'Cinzel,Georgia,serif', boxSizing: 'border-box',
              marginBottom: '24px',
            }}>
            {session ? '+ Start New Product' : '🌱 Start Idea Ignition →'}
          </Link>
        )}

        {/* Rocket automation status */}
        {isRocket && (
          <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: CYAN, marginBottom: '6px' }}>
              🚀 {tierLabel} — Automation Active
            </div>
            <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.7 }}>
              {tierId === 'rocket_platinum'
                ? 'Ultra automation (95%) — social posts, CRM and marketplace listing handled automatically after Gear 6.'
                : 'High automation — 30-day social campaign and CRM follow-up queued automatically after each product launch.'
              }
            </div>
          </div>
        )}

        {/* Completed products */}
        {products.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Your Products</span>
              <span style={{ color: GREEN, fontWeight: 700 }}>{products.length} LIVE</span>
            </div>
            {products.map(p => <CompletedProductCard key={p.productId} product={p} />)}
          </div>
        )}

        {/* Gear map */}
        {canAccess4M && (
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Your Gear Access
            </div>
            {[
              { g: 1, name: 'Intent Engine',           tier: 'Starter+',  color: GOLD },
              { g: 2, name: 'Structure Engine',         tier: 'Starter+',  color: GOLD },
              { g: 3, name: 'Content Engine',           tier: 'Starter+',  color: GOLD },
              { g: 4, name: 'Quality Control',          tier: 'Bronze+',   color: '#CD7F32' },
              { g: 5, name: 'Value Enhancement',        tier: 'Copper+',   color: '#B87333' },
              { g: 6, name: 'Distribution Engine',      tier: 'Silver+',   color: '#C0C0C0' },
            ].map(({ g, name, tier, color }) => {
              const hasAccess = tierDef.gearAccess >= g
              return (
                <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: hasAccess ? `rgba(212,175,55,0.12)` : 'rgba(255,255,255,0.04)',
                    fontSize: '11px', fontWeight: 900,
                    color: hasAccess ? color : 'rgba(255,255,255,0.2)',
                  }}>
                    {hasAccess ? g : '🔒'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: hasAccess ? W : 'rgba(255,255,255,0.3)', fontWeight: hasAccess ? 700 : 400 }}>
                      Gear {g} — {name}
                    </div>
                    {!hasAccess && (
                      <div style={{ fontSize: '10px', color: MUTED }}>Requires {tier}</div>
                    )}
                  </div>
                  {hasAccess && <div style={{ fontSize: '10px', color: GREEN }}>✓</div>}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default function AiIncomePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif' }}>
        Loading...
      </div>
    }>
      <AiIncomeInner />
    </Suspense>
  )
}
