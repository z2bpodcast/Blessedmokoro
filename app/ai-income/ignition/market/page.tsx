'use client'
// ============================================================
// Z2B V3 — MARKET RESEARCH IGNITION (GOOGLE TRENDS POWERED)
// File: app/ai-income/ignition/market/page.tsx
// Zero input required — 4M discovers, analyses and recommends
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter }                      from 'next/navigation'
import { supabase }                       from '@/lib/supabase'
import { loadMarket, type TargetMarket }  from '@/components/v3/MarketSelector'
import { normaliseTier }                   from '@/lib/v3/tier-config'
import Link                               from 'next/link'

const BG    = '#050A18'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

const DEMAND_COLORS: Record<string, string> = {
  rising: CYAN, high: GOLD, very_high: GREEN,
}
const DEMAND_LABELS: Record<string, string> = {
  rising: '📈 Rising', high: '🔥 High demand', very_high: '⚡ Very high demand',
}

interface Opportunity {
  id:           string
  title:        string
  category:     string
  audience:     string
  problemSolved:string
  format:       string
  priceRangeMin:number
  priceRangeMax:number
  currency:     string
  difficulty:   string
  trendEvidence:string
  whyNow:       string
  demandLevel:  'rising' | 'high' | 'very_high'
}

interface TrendsResult {
  opportunities: Opportunity[]
  marketSignal:  string
  trendsUsed:    string[]
  risingUsed:    string[]
  liveData:      boolean
  aiOnly?:       boolean
  tierLabel?:    string
  marketLabel:   string
}

function MarketResearchInner() {
  const router  = useRouter()
  const [market,   setMarket]   = useState<TargetMarket | null>(null)
  const [result,   setResult]   = useState<TrendsResult | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [tierId,   setTierId]   = useState<string>('starter')

  useEffect(() => {
    const m = loadMarket()
    setMarket(m)
    // Load tier for gate check
    supabase.auth.getUser().then(({ data: { user } }) => { if (user) supabase.from('profiles').select('paid_tier').eq('id', user.id).single().then(({ data }) => { if (data?.paid_tier) setTierId(normaliseTier(data.paid_tier)) }) })
  }, [])

  const discover = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    setLoading(true); setError(''); setResult(null)

    try {
      const res  = await fetch('/api/trends', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
        body:    JSON.stringify({ market }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Could not analyse market.'); return }
      setResult(data)
    } catch (_) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectOpp = (opp: Opportunity) => {
    sessionStorage.setItem('v3_selected_opportunity', JSON.stringify({
      id: opp.id, title: opp.title, category: opp.category,
      targetAudience: opp.audience, problemSolved: opp.problemSolved,
      format: opp.format,
      priceRange: `${opp.currency?.split(' ')[0] ?? '$'}${opp.priceRangeMin}–${opp.currency?.split(' ')[0] ?? '$'}${opp.priceRangeMax}`,
      difficulty: opp.difficulty,
    }))
    router.push('/ai-income/ignition/self')
  }

  const saveOpp = async (opp: Opportunity) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res  = await fetch('/api/saved-ideas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body:    JSON.stringify({ action: 'save', idea: {
        id: opp.id, title: opp.title, category: opp.category,
        targetAudience: opp.audience, problemSolved: opp.problemSolved,
        priceRange: `${opp.priceRangeMin}–${opp.priceRangeMax} ${opp.currency}`,
        format: opp.format, difficulty: opp.difficulty,
      }}),
    })
    const data = await res.json()
    if (data.success) setSavedIds(prev => { const s = new Set(Array.from(prev)); s.add(opp.id); return s })
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>
      <nav style={{ padding: '12px 20px', background: '#0D1629', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Idea Sources</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>📊 Market Research</span>
        <div style={{ fontSize: '11px', color: MUTED }}>Powered by Google Trends</div>
      </nav>

      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '28px 20px 48px' }}>

        {/* Market display */}
        <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: MUTED, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Your target market</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: GOLD }}>🌍 {market?.label ?? 'Global market'}</div>
          {market?.currency && market.scope !== 'global' && (
            <div style={{ fontSize: '11px', color: MUTED, marginTop: '3px' }}>Currency: {market.currency}</div>
          )}
          <Link href="/ai-income/ignition" style={{ fontSize: '11px', color: CYAN, textDecoration: 'none', display: 'inline-block', marginTop: '6px' }}>
            Change market →
          </Link>
        </div>

        {/* Hero CTA — Bronze+ only */}
        {!result && !loading && (
          <div>
            {/* Feature explanation */}
            <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: CYAN, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>How 4M Market Research Works</div>
              <div style={{ fontSize: '13px', color: W, lineHeight: 1.9, marginBottom: '12px' }}>
                You set your market once. 4M simultaneously fetches <strong style={{ color: CYAN }}>live Google Trends</strong> for your country, rising business queries (demand gaps — the gold) and rising self-improvement signals.
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px', fontSize: '12px', color: MUTED, fontStyle: 'italic', lineHeight: 1.8 }}>
                Instead of showing "stress is trending" — 4M says: <span style={{ color: W, fontStyle: 'normal' }}>"The UK professional market is showing a spike in 'burnout recovery' and 'quiet quitting' — here is the product: <strong style={{ color: GOLD }}>The Corporate Detox Toolkit: 30 Days to Reclaim Your Mental Energy at Work</strong> · £27 · eBook + worksheets · ⚡ Very high demand"</span>
              </div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7 }}>
                The builder never typed a word. 4M did the market analysis. 4M connected the dots. 4M named the product. All the builder does is press one button.
              </div>
            </div>

            {/* Tier gate */}
            {false ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.06)' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>🔒</div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '10px' }}>
                  Live Market Research — Bronze+
                </div>
                <div style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8, marginBottom: '20px', maxWidth: '380px', margin: '0 auto 20px' }}>
                  Google Trends market intelligence is available from <strong style={{ color: GOLD }}>Bronze tier</strong> upwards. Upgrade to unlock real-time demand signals and let 4M find your next best-selling product automatically.
                </div>
                <a href="/pricing"
                  style={{ display: 'inline-block', padding: '13px 32px', borderRadius: '12px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '14px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                  Upgrade to Bronze — R2,500 →
                </a>
                <div style={{ fontSize: '11px', color: MUTED, marginTop: '12px' }}>
                  Already on Bronze or higher? <a href="/login" style={{ color: GOLD, textDecoration: 'none' }}>Log in again to refresh</a>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>📡</div>
                <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,4vw,24px)', fontWeight: 900, color: W, marginBottom: '12px' }}>
                  What is the market telling us right now?
                </h1>
                <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8, marginBottom: '8px' }}>
                  No input needed. 4M does the analysis. You press one button.
                </p>
                <p style={{ fontSize: '12px', color: CYAN, marginBottom: '24px' }}>
                  Live Google Trends · {market?.label ?? 'Global market'}
                </p>
                <button onClick={discover}
                  style={{ padding: '16px 40px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', fontFamily: 'Cinzel,Georgia,serif' }}>
                  🔍 Discover What's Trending →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: GOLD, marginBottom: '8px' }}>4M is reading the market...</div>
            <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.8 }}>
              Fetching live Google Trends · Analysing demand signals<br/>
              Synthesising product opportunities · Almost ready
            </div>
          </div>
        )}

        {error && <div style={{ color: '#F87171', fontSize: '13px', textAlign: 'center', padding: '20px' }}>{error}</div>}

        {/* Results */}
        {result && (
          <div>
            {/* Market signal */}
            <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: CYAN, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                {result.liveData ? '📡 Live Google Trends' : result.aiOnly ? '🧠 Z2B AI Intelligence' : '📊 Market Intelligence'}
              </div>
              <div style={{ fontSize: '13px', color: W, lineHeight: 1.7, marginBottom: result.trendsUsed.length > 0 ? '10px' : 0 }}>
                {result.marketSignal}
              </div>
              {result.trendsUsed.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {result.trendsUsed.map((t, i) => (
                    <span key={i} style={{ fontSize: '10px', color: CYAN, background: 'rgba(6,182,212,0.12)', padding: '2px 8px', borderRadius: '8px' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px' }}>
              {result.opportunities.length} opportunities found for {result.marketLabel}
            </div>

            {result.opportunities.map(opp => (
              <div key={opp.id} style={{ position: 'relative', marginBottom: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                {/* Demand badge */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: DEMAND_COLORS[opp.demandLevel] ?? GOLD }} />

                <button onClick={() => saveOpp(opp)}
                  style={{ position: 'absolute', top: '14px', right: '14px', background: savedIds.has(opp.id) ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '13px', zIndex: 2 }}>
                  {savedIds.has(opp.id) ? '✓' : '🔖'}
                </button>

                <button onClick={() => selectOpp(opp)} style={{ width: '100%', textAlign: 'left', padding: '18px 56px 14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', color: W, fontFamily: 'Georgia,serif' }}>
                  {/* Demand signal + data source label */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: DEMAND_COLORS[opp.demandLevel] ?? GOLD, fontWeight: 700 }}>
                      {DEMAND_LABELS[opp.demandLevel] ?? '📊 In demand'}
                    </span>
                    {result.liveData
                      ? <span style={{ fontSize: '9px', color: CYAN, background: 'rgba(6,182,212,0.1)', padding: '2px 6px', borderRadius: '6px' }}>📡 Live Trends</span>
                      : <span style={{ fontSize: '9px', color: MUTED, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '6px' }}>🧠 AI Intelligence</span>
                    }
                  </div>

                  {/* Title */}
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W, marginBottom: '6px', lineHeight: 1.3 }}>
                    {opp.title}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', color: GOLD, background: 'rgba(212,175,55,0.1)', padding: '2px 8px', borderRadius: '8px' }}>{opp.format}</span>
                    <span style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '8px' }}>{opp.priceRangeMin}–{opp.priceRangeMax} {opp.currency}</span>
                    <span style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '8px' }}>{opp.difficulty}</span>
                  </div>

                  {/* Problem */}
                  <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7, marginBottom: '8px' }}>
                    {opp.problemSolved}
                  </div>

                  {/* Trend evidence */}
                  {opp.trendEvidence && (
                    <div style={{ fontSize: '11px', color: CYAN, lineHeight: 1.6, marginBottom: '4px' }}>
                      📡 {opp.trendEvidence}
                    </div>
                  )}

                  {/* Why now */}
                  {opp.whyNow && (
                    <div style={{ fontSize: '11px', color: GREEN, lineHeight: 1.6 }}>
                      ⚡ {opp.whyNow}
                    </div>
                  )}
                </button>
              </div>
            ))}

            {/* Rediscover */}
            <button onClick={discover}
              style={{ width: '100%', marginTop: '8px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)', color: GOLD, fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cinzel,Georgia,serif' }}>
              🔄 Refresh — Discover More Opportunities
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketResearchPage() {
  return <Suspense fallback={null}><MarketResearchInner /></Suspense>
}
