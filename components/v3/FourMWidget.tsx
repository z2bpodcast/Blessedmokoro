// ============================================================
// Z2B 4M V3 — 4M MACHINE DASHBOARD WIDGET
// File: components/v3/FourMWidget.tsx
// Laws: Drop-in component · Works with existing dashboard
//       Shows session status · Tier-appropriate CTA
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import Link                     from 'next/link'
import { supabase }             from '@/lib/supabase'
import { normaliseTier, getTier } from '@/lib/v3/tier-config'

const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

interface WidgetData {
  tierId:            string
  tierLabel:         string
  gearAccess:        number
  hasActiveSession:  boolean
  currentGear:       number
  productTitle:      string
  sessionId:         string
  productsLive:      number
  canAccess:         boolean
  isBfmOverdue:      boolean
  isRocket:          boolean
}

const GEAR_PATHS: Record<number, string> = {
  0: '/ai-income/ignition',
  1: '/ai-income/gear/1',
  2: '/ai-income/gear/2',
  3: '/ai-income/gear/3',
  4: '/ai-income/gear/4',
  5: '/ai-income/gear/5',
  6: '/ai-income/gear/6',
}

const GEAR_NAMES: Record<number, string> = {
  0: 'Idea Ignition', 1: 'Intent', 2: 'Blueprint',
  3: 'Content', 4: 'Quality', 5: 'Enhancement', 6: 'Distribution',
}

export default function FourMWidget() {
  const [data,    setData]    = useState<WidgetData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles' as any)
      .select('paid_tier, bfm_status')
      .eq('id', user.id)
      .single() as { data: { paid_tier: string | null; bfm_status: string | null } | null }

    const tier    = normaliseTier(profile?.paid_tier ?? 'fam')
    const tierDef = getTier(tier)
    const canAccess  = tier !== 'fam' && tier !== 'free'
    const isBfmBad   = profile?.bfm_status === 'overdue' || profile?.bfm_status === 'suspended'

    // Active session
    const { data: sessions } = await (supabase.from as any)('gear_sessions')
      .select('id, phase_current, opportunity_data')
      .eq('builder_id', user.id)
      .eq('session_status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1) as { data: any[] | null }

    const sess    = sessions?.[0]
    const oppData = sess?.opportunity_data as any

    // Completed count
    const { count } = await (supabase.from as any)('gear_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('builder_id', user.id)
      .eq('session_status', 'completed') as { count: number | null }

    setData({
      tierId:           tier,
      tierLabel:        tierDef.label,
      gearAccess:       tierDef.gearAccess,
      hasActiveSession: !!sess,
      currentGear:      sess?.phase_current ?? 0,
      productTitle:     oppData?.title ?? '',
      sessionId:        sess?.id ?? '',
      productsLive:     count ?? 0,
      canAccess,
      isBfmOverdue:     isBfmBad,
      isRocket:         tierDef.isRocket,
    })
    setLoading(false)
    } catch (e) {
      console.error('[FourMWidget] loadData failed:', e)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!data) return null

  // ── FREE TIER ──────────────────────────────────────────────
  if (!data.canAccess) {
    return (
      <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ fontSize: '22px' }}>⚙️</div>
          <div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: W }}>4M Machine</div>
            <div style={{ fontSize: '11px', color: MUTED }}>Upgrade to start building</div>
          </div>
        </div>
        <Link href="/pricing"
          style={{ display: 'block', padding: '10px', borderRadius: '10px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
          View Packages →
        </Link>
      </div>
    )
  }

  // ── BFM OVERDUE ────────────────────────────────────────────
  if (data.isBfmOverdue) {
    return (
      <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#F87171', marginBottom: '4px' }}>⚠️ BFM Payment Overdue</div>
        <div style={{ fontSize: '11px', color: MUTED }}>4M Machine access suspended. Contact admin.</div>
      </div>
    )
  }

  // ── ACTIVE SESSION ─────────────────────────────────────────
  const resumePath = data.hasActiveSession
    ? (GEAR_PATHS[data.currentGear] ?? '/ai-income/gear/1') + (data.currentGear > 0 ? '?session=' + data.sessionId : '')
    : '/ai-income'

  const progressPct = data.hasActiveSession
    ? Math.round((data.currentGear / Math.max(1, Math.min(data.gearAccess, 6))) * 100)
    : 0

  return (
    <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.04))', border: '1.5px solid rgba(212,175,55,0.25)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '18px' }}>{data.isRocket ? '🚀' : '⚙️'}</div>
          <div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: W }}>4M Machine</div>
            <div style={{ fontSize: '10px', color: data.isRocket ? CYAN : GOLD }}>{data.tierLabel}</div>
          </div>
        </div>
        {data.productsLive > 0 && (
          <div style={{ fontSize: '10px', color: GREEN, background: 'rgba(16,185,129,0.12)', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
            {data.productsLive} LIVE
          </div>
        )}
      </div>

      {/* Active session info */}
      {data.hasActiveSession && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Gear {data.currentGear} — {GEAR_NAMES[data.currentGear]}</span>
            <span>{progressPct}%</span>
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ height: '100%', width: progressPct + '%', background: GOLD, borderRadius: '2px' }} />
          </div>
          {data.productTitle && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{data.productTitle}"
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link href={resumePath}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', textAlign: 'center', textDecoration: 'none',
            background: data.hasActiveSession ? 'rgba(212,175,55,0.15)' : GOLD,
            border: data.hasActiveSession ? '1px solid rgba(212,175,55,0.3)' : 'none',
            color: data.hasActiveSession ? GOLD : '#050A18',
            fontWeight: 900, fontSize: '12px', fontFamily: 'Cinzel,Georgia,serif',
          }}>
          {data.hasActiveSession ? 'Resume →' : '🌱 Start Building →'}
        </Link>
        {data.hasActiveSession && (
          <Link href="/ai-income/ignition"
            style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: MUTED, fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            + New
          </Link>
        )}
      </div>
    </div>
  )
}
