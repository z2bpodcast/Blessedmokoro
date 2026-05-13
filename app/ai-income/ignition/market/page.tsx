'use client'
// ============================================================
// Z2B 4M V3 — MARKET DISCOVERY PAGE
// File: app/ai-income/ignition/market/page.tsx
// Laws: Mobile-first · Premium UX · Tier-gated depth
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  MARKET_GEOGRAPHIES,
  MARKET_CATEGORIES,
  MARKET_AUDIENCES,
  type MarketGeography,
  type MarketCategory,
  type MarketAudience,
  type MarketParams,
  type IgnitionOpportunity,
} from '@/lib/v3/ignition-engine'

const BG    = '#050A18'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const W     = '#F0F9FF'
const MUTED = '#64748B'

type Step = 'params' | 'thinking' | 'results'

const THINKING_MSGS_MARKET = [
  'Scanning market demand...',
  'Detecting opportunity gaps...',
  'Ranking your best entries...',
]

function MarketDiscoveryInner() {
  const router = useRouter()

  const [step,          setStep]       = useState<Step>('params')
  const [geography,     setGeo]        = useState<MarketGeography>('south_africa')
  const [category,      setCat]        = useState<MarketCategory | ''>('')
  const [audience,      setAud]        = useState<MarketAudience | ''>('')
  const [opportunities, setOpps]       = useState<IgnitionOpportunity[]>([])
  const [regenCount,    setRegenCount] = useState(0)
  const [selected,      setSelected]   = useState<IgnitionOpportunity | null>(null)
  const [authToken,     setAuthToken]  = useState('')
  const [thinkingMsg,   setThinkingMsg]= useState(0)
  const [paramError,    setParamError] = useState('')

  // THINKING_MSGS moved to module level

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setAuthToken(session.access_token)
    })
  }, [router])

  useEffect(() => {
    if (step !== 'thinking') return
    const interval = setInterval(() => {
      setThinkingMsg(prev => (prev + 1) % THINKING_MSGS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [step])

  async function handleSearch(regen = false) {
    if (!category || !audience) {
      setParamError('Please select a category and audience to continue.')
      return
    }
    setParamError('')
    setStep('thinking')

    const params: MarketParams = {
      geography: geography,
      category:  category as MarketCategory,
      audience:  audience as MarketAudience,
    }

    // Timeout guard — 55s abort (HIGH #14)
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)

    let res: Response
    try {
      res = await fetch('/api/idea-ignition', {
        signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        action:      regen ? 'regenerate' : 'synthesise_market',
        params,
        regen_count: regen ? regenCount : 0,
        route:       'market',
      }),
    })

      clearTimeout(timeout)
    } catch (e) {
      clearTimeout(timeout)
      const msg = (e instanceof Error && e.name === 'AbortError')
        ? 'This is taking longer than expected. Please try again.'
        : 'Something went wrong. Please try again.'
      alert(msg)
      setStep('params')
      return
    }

    const data = await res.json()

    if (!res.ok || data.error) {
      alert(data.error ?? 'Something went wrong. Please try again.')
      setStep('params')
      return
    }

    if (regen) setRegenCount(prev => prev + 1)
    setOpps(data.opportunities ?? [])
    setStep('results')
  }

  async function handleSelect(opp: IgnitionOpportunity) {
    setSelected(opp)
    // Save to sessionStorage — Gear 1 reads on mount (HIGH #3)
    try {
      sessionStorage.setItem('v3_selected_opportunity', JSON.stringify({
        title: opp.title, audience: opp.audience,
        transformation: opp.transformation, format: opp.format,
        priceRangeMin: opp.priceRangeMin, priceRangeMax: opp.priceRangeMax,
      }))
    } catch (_) {}
    fetch('/api/idea-ignition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body: JSON.stringify({ action: 'save_selection', opportunity: opp }),
    }).catch(console.error)
    router.push('/ai-income/gear/1')
  }

  const SelectCard = ({ value, label, selected: sel, onSelect }: { value: string; label: string; selected: boolean; onSelect: () => void }) => (
    <button onClick={onSelect}
      style={{
        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontSize: '13px',
        background: sel ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
        border: '1px solid ' + (sel ? CYAN : 'rgba(255,255,255,0.1)'),
        color: sel ? CYAN : MUTED, fontFamily: 'Georgia,serif', transition: 'all 0.15s',
        fontWeight: sel ? 700 : 400,
      }}>
      {label}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: BG + 'EE', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Back</Link>
        <span style={{ fontSize: '12px', color: CYAN, fontWeight: 700 }}>🌍 Market Discovery</span>
      </nav>

      <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          {/* ── PARAMS ── */}
          {step === 'params' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', color: CYAN, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>🌍 Market Discovery</div>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,28px)', fontWeight: 900, color: W, margin: '0 0 10px' }}>
                  Where is your market?
                </h2>
                <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>Select your geography, category and audience</p>
              </div>

              {/* Geography */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Geography
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(Object.entries(MARKET_GEOGRAPHIES) as [MarketGeography, string][]).map(([key, label]) => (
                    <SelectCard key={key} value={key} label={label} selected={geography === key} onSelect={() => setGeo(key)} />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Category
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(Object.entries(MARKET_CATEGORIES) as [MarketCategory, string][]).map(([key, label]) => (
                    <SelectCard key={key} value={key} label={label} selected={category === key} onSelect={() => setCat(key)} />
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Target Audience
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(Object.entries(MARKET_AUDIENCES) as [MarketAudience, string][]).map(([key, label]) => (
                    <SelectCard key={key} value={key} label={label} selected={audience === key} onSelect={() => setAud(key)} />
                  ))}
                </div>
              </div>

              {paramError && (
                <div style={{ fontSize: '12px', color: '#F87171', marginBottom: '12px', textAlign: 'center' }}>{paramError}</div>
              )}

              <button onClick={() => handleSearch(false)}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
                  color: W, fontWeight: 900, fontSize: '15px', cursor: 'pointer',
                  fontFamily: 'Cinzel,Georgia,serif',
                }}>
                🌍 Search This Market →
              </button>
            </div>
          )}

          {/* ── THINKING ── */}
          {step === 'thinking' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 32px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(6,182,212,0.2)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: CYAN, animation: 'spin 1.2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '16px', borderRadius: '50%', border: '1px solid transparent', borderTopColor: GOLD, animation: 'spin 0.8s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: '28px', background: 'rgba(6,182,212,0.3)', borderRadius: '50%' }} />
              </div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: W, marginBottom: '8px', fontWeight: 700 }}>
                Discovering your opportunity
              </div>
              <div style={{ fontSize: '13px', color: MUTED }}>
                {THINKING_MSGS_MARKET[thinkingMsg]}
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── RESULTS ── */}
          {step === 'results' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', color: CYAN, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Market opportunities found
                </div>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,26px)', fontWeight: 900, color: W, margin: 0 }}>
                  Select one to build
                </h2>
              </div>

              {opportunities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌍</div>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: W, marginBottom: '8px' }}>No opportunities found</div>
                  <div style={{ fontSize: '13px', color: MUTED, marginBottom: '16px' }}>Try a different category or geography to find active market gaps.</div>
                  <button onClick={() => setStep('params')} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: CYAN, color: '#050A18', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif' }}>
                    Change Parameters
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {opportunities.map((opp, i) => (
                  <button key={opp.id} onClick={() => handleSelect(opp)}
                    style={{
                      width: '100%', padding: '22px 20px', borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
                      background: selected?.id === opp.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                      border: '1.5px solid ' + (selected?.id === opp.id ? CYAN : 'rgba(255,255,255,0.1)'),
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (selected?.id !== opp.id) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,182,212,0.4)' }}
                    onMouseLeave={e => { if (selected?.id !== opp.id) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ fontSize: '10px', color: CYAN, letterSpacing: '1px', textTransform: 'uppercase' }}>Opportunity {i + 1}</div>
                      <div style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '10px' }}>{opp.format}</div>
                    </div>

                    <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: CYAN, marginBottom: '8px', lineHeight: 1.3 }}>
                      {opp.title}
                    </div>

                    <div style={{ fontSize: '12px', color: MUTED, marginBottom: '8px', lineHeight: 1.6 }}>
                      <strong style={{ color: 'rgba(255,255,255,0.7)' }}>For:</strong> {opp.audience}
                    </div>
                    <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px', lineHeight: 1.6 }}>
                      <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Transformation:</strong> {opp.transformation}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>R{opp.priceRangeMin}–R{opp.priceRangeMax}</span>
                        {opp.gapType && opp.gapType !== 'null' && (
                          <span style={{ fontSize: '10px', color: CYAN, background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                            {opp.gapType.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        {['low','medium','high','very_high'].map((level, li) => (
                          <div key={level} style={{
                            width: '6px', height: '14px', borderRadius: '2px',
                            background: ['low','medium','high','very_high'].indexOf(opp.demandLevel) >= li ? GOLD : 'rgba(255,255,255,0.1)',
                          }} />
                        ))}
                        <span style={{ fontSize: '10px', color: MUTED, marginLeft: '4px' }}>demand</span>
                      </div>
                    </div>

                    {selected?.id === opp.id && (
                      <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(6,182,212,0.15)', borderRadius: '8px', fontSize: '12px', color: CYAN, textAlign: 'center', fontWeight: 700 }}>
                        ✅ Selected — entering Gear 1...
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                {regenCount < 2 && (
                  <button onClick={() => handleSearch(true)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: MUTED, fontSize: '12px', fontFamily: 'Georgia,serif' }}>
                    🔄 Show me different options ({2 - regenCount} left)
                  </button>
                )}
                <button onClick={() => setStep('params')}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontFamily: 'Georgia,serif' }}>
                  ← Change market parameters
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function MarketDiscoveryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4', fontFamily: 'Georgia,serif' }}>Loading...</div>}>
      <MarketDiscoveryInner />
    </Suspense>
  )
}
