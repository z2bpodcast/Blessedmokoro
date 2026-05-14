'use client'
// ============================================================
// Z2B 4M V3 — FULL EARNINGS DASHBOARD
// File: app/earnings/page.tsx
// Laws: ISP · TSC · QPB · TLI · Tier progression · Mobile-first
// ============================================================

import { useState, useEffect, Suspense, memo } from 'react'
import { useRouter }                             from 'next/navigation'
import { supabase }                              from '@/lib/supabase'
import Link                                      from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'
const RED   = '#EF4444'

type TabId = 'overview' | 'isp' | 'team' | 'transactions'

interface EarningsData {
  tierId:         string
  tierLabel:      string
  firstName:      string
  ispRate:        number
  ispTotal:       number
  ispThisMonth:   number
  tscTotal:       number
  tscThisMonth:   number
  qpbTotal:       number
  qpbThisMonth:   number
  qpbSalesCount:  number
  qpbEligible:    boolean
  qpbEstimate:    number
  qpbMinSales:    number
  tliTotal:       number
  grandTotal:     number
  grandThisMonth: number
  nextTierId:     string | null
  nextTierLabel:  string | null
  nextTierPrice:  number | null
  ispToNextTier:  number | null
  recentTx:       TxItem[]
  asOf:           string
}

interface TxItem {
  id:     string
  type:   string
  amount: number
  note:   string
  date:   string
  status: string
}

const TYPE_COLORS: Record<string, string> = {
  ISP: GREEN, TSC: CYAN, QPB: GOLD, TLI: VIO,
}

function formatZar(n: number): string {
  return 'R' + Math.round(n).toLocaleString('en-ZA')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── STAT CARD ─────────────────────────────────────────────────
const StatCard = memo(function StatCard({
  label, total, month, color = GREEN, info
}: { label: string; total: number; month: number; color?: string; info?: string }) {
  return (
    <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: '10px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color, marginBottom: '4px' }}>{formatZar(total)}</div>
      <div style={{ fontSize: '11px', color: MUTED }}>{formatZar(month)} this month</div>
      {info && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>{info}</div>}
    </div>
  )
})

// ── TRANSACTION ROW ───────────────────────────────────────────
function TxRow({ tx }: { tx: TxItem }) {
  const color = TYPE_COLORS[tx.type] ?? MUTED
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(255,255,255,0.05)`, fontSize: '11px', fontWeight: 900, color }}>
        {tx.type}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', color: W, fontWeight: 700 }}>{formatZar(tx.amount)}</div>
        <div style={{ fontSize: '11px', color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tx.note || tx.type + ' commission'}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: MUTED }}>{formatDate(tx.date)}</div>
        <div style={{ fontSize: '10px', color: tx.status === 'paid' ? GREEN : GOLD, marginTop: '2px' }}>{tx.status}</div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
function EarningsInner() {
  const router  = useRouter()
  const [data,    setData]    = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<TabId>('overview')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
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
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid ' + GREEN, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontFamily: 'Georgia,serif', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '36px' }}>💰</div>
        <div>Could not load earnings. Please try again.</div>
        <Link href="/dashboard" style={{ color: GOLD, textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
      </div>
    )
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview',     label: 'Overview'      },
    { id: 'isp',          label: 'My Sales'      },
    { id: 'team',         label: 'Team'          },
    { id: 'transactions', label: 'History'       },
  ]

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <Link href="/dashboard" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Dashboard</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GREEN }}>My Earnings</span>
        <span style={{ fontSize: '11px', color: GOLD, background: 'rgba(212,175,55,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.2)' }}>
          {data.tierLabel}
        </span>
      </nav>

      {/* Hero total */}
      <div style={{ padding: '32px 20px 24px', textAlign: 'center', background: 'linear-gradient(180deg,rgba(16,185,129,0.08) 0%,transparent 100%)' }}>
        <div style={{ fontSize: '11px', color: GREEN, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Total Lifetime Earnings</div>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: GREEN, marginBottom: '6px' }}>
          {formatZar(data.grandTotal)}
        </div>
        <div style={{ fontSize: '14px', color: MUTED }}>{formatZar(data.grandThisMonth)} this month · {data.ispRate}% ISP rate</div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '8px 6px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'Georgia,serif', fontWeight: tab === t.id ? 700 : 400, background: tab === t.id ? 'rgba(16,185,129,0.15)' : 'transparent', color: tab === t.id ? GREEN : MUTED }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────── */}
        {tab === 'overview' && (
          <div>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px', marginBottom: '20px' }}>
              <StatCard label="ISP — My Sales"       total={data.ispTotal}  month={data.ispThisMonth}  color={GREEN} info={data.ispRate + '% of each sale'} />
              <StatCard label="TSC — Team Sales"     total={data.tscTotal}  month={data.tscThisMonth}  color={CYAN}  />
              <StatCard label="QPB — Perf. Bonus"    total={data.qpbTotal}  month={data.qpbThisMonth}  color={GOLD}  info={data.qpbEligible ? 'Active this month' : data.qpbSalesCount + '/3 sales for QPB'} />
              <StatCard label="TLI — Leadership"     total={data.tliTotal}  month={0}                  color={VIO}   />
            </div>

            {/* QPB tracker */}
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: GOLD, marginBottom: '10px' }}>
                ✦ QPB Tracker — {data.qpbSalesCount}/{data.qpbMinSales} unique-tier sales this month
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: Math.min(100, (data.qpbSalesCount / data.qpbMinSales) * 100) + '%', background: data.qpbEligible ? GREEN : GOLD, borderRadius: '3px', transition: 'width 0.4s' }} />
              </div>
              {data.qpbEligible ? (
                <div style={{ fontSize: '12px', color: GREEN }}>
                  ✅ QPB unlocked. Estimated bonus: {formatZar(data.qpbEstimate)}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: MUTED }}>
                  {data.qpbMinSales - data.qpbSalesCount} more unique-tier sale{data.qpbMinSales - data.qpbSalesCount !== 1 ? 's' : ''} needed to unlock your QPB bonus.
                </div>
              )}
            </div>

            {/* Tier progression */}
            {data.nextTierLabel && data.ispToNextTier !== null && (
              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: W, marginBottom: '6px' }}>
                  🚀 Path to {data.nextTierLabel}
                </div>
                <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7 }}>
                  You need {formatZar(data.ispToNextTier)} more in ISP earnings to self-fund your upgrade to {data.nextTierLabel}.
                </div>
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: MUTED, marginBottom: '4px' }}>
                    <span>Progress toward {data.nextTierLabel}</span>
                    <span>{Math.min(100, Math.round((data.ispTotal / (data.nextTierPrice ?? 1)) * 100))}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: Math.min(100, (data.ispTotal / (data.nextTierPrice ?? 1)) * 100) + '%', background: GOLD, borderRadius: '2px' }} />
                  </div>
                </div>
                <Link href="/pricing"
                  style={{ display: 'inline-block', marginTop: '12px', fontSize: '12px', color: GOLD, textDecoration: 'none', fontWeight: 700 }}>
                  Upgrade to {data.nextTierLabel} →
                </Link>
              </div>
            )}

            {/* Last updated */}
            <div style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>
              Updated {new Date(data.asOf).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}

        {/* ── ISP TAB ──────────────────────────────────────── */}
        {tab === 'isp' && (
          <div>
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: GREEN, marginBottom: '8px' }}>Individual Sales Profit (ISP)</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.8 }}>
                You earn <strong style={{ color: GREEN }}>{data.ispRate}%</strong> of every product you sell personally. This is your direct income from the Z2B Marketplace. Upgrade your tier to increase your ISP rate.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: GREEN }}>{formatZar(data.ispTotal)}</div>
                <div style={{ fontSize: '10px', color: MUTED, marginTop: '4px' }}>Lifetime ISP</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: GREEN }}>{formatZar(data.ispThisMonth)}</div>
                <div style={{ fontSize: '10px', color: MUTED, marginTop: '4px' }}>This Month</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: MUTED, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
              <strong style={{ color: W }}>How to earn more ISP:</strong> Create more products using the 4M Machine. Every product listed on the Marketplace earns you {data.ispRate}% of every sale automatically.
            </div>
          </div>
        )}

        {/* ── TEAM TAB ─────────────────────────────────────── */}
        {tab === 'team' && (
          <div>
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: CYAN, marginBottom: '8px' }}>Team Earnings Overview</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.8 }}>
                TSC and TLI income grows as your team grows. When your referrals make sales, you earn across multiple generations.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: MUTED, marginBottom: '6px', textTransform: 'uppercase' }}>TSC Lifetime</div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: CYAN }}>{formatZar(data.tscTotal)}</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: MUTED, marginBottom: '6px', textTransform: 'uppercase' }}>TLI Lifetime</div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: VIO }}>{formatZar(data.tliTotal)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS TAB ──────────────────────────────── */}
        {tab === 'transactions' && (
          <div>
            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px' }}>
              Last {data.recentTx.length} transactions
            </div>
            {data.recentTx.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: MUTED }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💸</div>
                No transactions yet. Your first sale will appear here.
              </div>
            ) : (
              data.recentTx.map(tx => <TxRow key={tx.id} tx={tx} />)
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default function EarningsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontFamily: 'Georgia,serif' }}>
        Loading earnings...
      </div>
    }>
      <EarningsInner />
    </Suspense>
  )
}
