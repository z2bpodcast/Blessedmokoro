// ============================================================
// Z2B 4M V3 — EARNINGS WIDGET (Drop-in dashboard component)
// File: components/v3/EarningsWidget.tsx
// Laws: Drop-in · Shows key numbers · QPB milestone tracker
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { supabase }             from '@/lib/supabase'
import Link                     from 'next/link'

const GOLD  = '#D4AF37'
const GREEN = '#10B981'
const CYAN  = '#06B6D4'
const W     = '#F0F9FF'
const MUTED = '#64748B'

interface EarningsSummary {
  grandTotal:     number
  grandThisMonth: number
  ispRate:        number
  qpbSalesCount:  number
  qpbEligible:    boolean
  qpbEstimate:    number
  nextTierLabel:  string | null
  ispToNextTier:  number | null
}

export default function EarningsWidget() {
  const [data,    setData]    = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return }
      try {
        const res  = await fetch('/api/earnings', {
          headers: { 'Authorization': 'Bearer ' + session.access_token },
        })
        if (res.ok) setData(await res.json())
      } catch (_) {}
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '22px', height: '22px', border: '2px solid ' + GREEN, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!data) return null

  const formatZar = (n: number) =>
    'R' + Math.round(n).toLocaleString('en-ZA')

  return (
    <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.04))', border: '1.5px solid rgba(16,185,129,0.25)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '10px', color: GREEN, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>
            💰 My Earnings
          </div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '22px', fontWeight: 900, color: GREEN }}>
            {formatZar(data.grandTotal)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: MUTED }}>This month</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: W }}>{formatZar(data.grandThisMonth)}</div>
        </div>
      </div>

      {/* ISP rate badge */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: GOLD, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', padding: '4px 10px', borderRadius: '10px' }}>
          {data.ispRate}% ISP Rate
        </div>
        {data.qpbEligible && (
          <div style={{ fontSize: '11px', color: CYAN, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', padding: '4px 10px', borderRadius: '10px' }}>
            ✦ QPB Eligible
          </div>
        )}
      </div>

      {/* QPB tracker */}
      <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: '11px', color: MUTED, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>QPB Tracker — {data.qpbSalesCount}/3 unique-tier sales</span>
          {data.qpbEligible && <span style={{ color: GREEN }}>✓ Unlocked</span>}
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: Math.min(100, (data.qpbSalesCount / 3) * 100) + '%', background: data.qpbEligible ? GREEN : GOLD, borderRadius: '2px', transition: 'width 0.4s' }} />
        </div>
        {data.qpbEligible && data.qpbEstimate > 0 && (
          <div style={{ fontSize: '10px', color: CYAN, marginTop: '5px' }}>
            Estimated QPB bonus: {formatZar(data.qpbEstimate)}
          </div>
        )}
      </div>

      {/* Next tier progress */}
      {data.nextTierLabel && data.ispToNextTier !== null && (
        <div style={{ marginBottom: '14px', fontSize: '11px', color: MUTED }}>
          {formatZar(data.ispToNextTier)} ISP away from {data.nextTierLabel}
        </div>
      )}

      <Link href="/earnings"
        style={{ display: 'block', padding: '10px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: GREEN, fontWeight: 700, fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
        View Full Earnings →
      </Link>
    </div>
  )
}
