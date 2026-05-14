// ============================================================
// Z2B 4M V3 — GEAR STATUS CARD COMPONENT
// File: components/v3/GearStatusCard.tsx
// Laws: Reusable · Mobile-first · No internal state exposed
// Purpose: Shows active session progress or completed product
// ============================================================

import Link from 'next/link'

const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const GREEN = '#10B981'
const MUTED = '#64748B'
const W     = '#F0F9FF'

// ── TYPES ────────────────────────────────────────────────────

export interface ActiveSessionData {
  sessionId:     string
  productTitle:  string
  currentGear:   number
  gearAccess:    number
  productStatus: string
  updatedAt:     string
}

export interface CompletedProductData {
  productId:     string
  sessionId:     string
  title:         string
  priceZar:      number
  format:        string
  completedAt:   string
}

// ── ACTIVE SESSION CARD ───────────────────────────────────────

export function ActiveSessionCard({ session }: { session: ActiveSessionData }) {
  const gearLabels: Record<number, string> = {
    0: 'Idea Ignition',
    1: 'Gear 1 — Intent',
    2: 'Gear 2 — Blueprint',
    3: 'Gear 3 — Content',
    4: 'Gear 4 — Quality',
    5: 'Gear 5 — Enhancement',
    6: 'Gear 6 — Distribution',
  }

  const gearPaths: Record<number, string> = {
    0: '/ai-income/ignition',
    1: '/ai-income/gear/1',
    2: '/ai-income/gear/2',
    3: '/ai-income/gear/3',
    4: '/ai-income/gear/4',
    5: '/ai-income/gear/5',
    6: '/ai-income/gear/6',
  }

  const currentLabel = gearLabels[session.currentGear] ?? 'In Progress'
  const resumePath   = (gearPaths[session.currentGear] ?? '/ai-income/gear/1') + '?session=' + session.sessionId
  const progressPct  = Math.round((session.currentGear / Math.min(session.gearAccess, 6)) * 100)
  const updatedAgo   = getTimeAgo(session.updatedAt)

  return (
    <div style={{
      padding: '18px 20px', borderRadius: '16px',
      background: 'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.04))',
      border: '1.5px solid rgba(212,175,55,0.3)',
      marginBottom: '12px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
            ⚙️ Active Session
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: W, lineHeight: 1.3 }}>
            {session.productTitle || 'Product in progress'}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: MUTED, textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
          {updatedAgo}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: MUTED, marginBottom: '5px' }}>
          <span>{currentLabel}</span>
          <span>{progressPct}%</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: progressPct + '%', background: GOLD, borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Mini gear indicators */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
        {Array.from({ length: Math.min(session.gearAccess, 6) }, (_, i) => i + 1).map(g => (
          <div key={g} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: g < session.currentGear
              ? GREEN
              : g === session.currentGear
                ? GOLD
                : 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>

      {/* Resume button */}
      <Link href={resumePath}
        style={{
          display: 'block', width: '100%', padding: '11px', borderRadius: '10px',
          background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
          color: GOLD, fontWeight: 700, fontSize: '13px', textAlign: 'center',
          textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif',
          boxSizing: 'border-box',
        }}>
        Resume → {currentLabel}
      </Link>
    </div>
  )
}

// ── COMPLETED PRODUCT CARD ────────────────────────────────────

export function CompletedProductCard({ product }: { product: CompletedProductData }) {
  const completedDate = new Date(product.completedAt).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div style={{
      padding: '14px 16px', borderRadius: '14px',
      background: 'rgba(16,185,129,0.06)',
      border: '1px solid rgba(16,185,129,0.2)',
      marginBottom: '8px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
        background: 'rgba(16,185,129,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px',
      }}>
        ✅
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: W, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.title}
        </div>
        <div style={{ fontSize: '11px', color: MUTED }}>
          R{product.priceZar.toLocaleString()} · {product.format} · {completedDate}
        </div>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 900, color: GREEN, flexShrink: 0 }}>
        LIVE
      </div>
    </div>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────

export function NoSessionCard({ tierId }: { tierId: string }) {
  const isFree = tierId === 'fam' || tierId === 'free'

  if (isFree) {
    return (
      <div style={{
        padding: '24px', borderRadius: '16px', textAlign: 'center',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '12px',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌱</div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: W, marginBottom: '6px' }}>
          Unlock the 4M Machine
        </div>
        <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7, marginBottom: '16px' }}>
          Upgrade to Starter to begin creating your first digital product.
        </div>
        <Link href="/pricing"
          style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '10px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '13px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
          View Packages →
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      padding: '24px', borderRadius: '16px', textAlign: 'center',
      background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)',
      marginBottom: '12px',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌱</div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: W, marginBottom: '6px' }}>
        Ready to build your first product?
      </div>
      <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7, marginBottom: '16px' }}>
        The 4M Machine will guide you from idea to live product.
      </div>
      <Link href="/ai-income/ignition"
        style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '10px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '13px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
        🌱 Start Idea Ignition →
      </Link>
    </div>
  )
}

// ── HELPER ────────────────────────────────────────────────────

function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
