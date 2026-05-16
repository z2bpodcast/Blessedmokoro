'use client'
// File: app/ai-income/ignition/page.tsx — GLOBAL VERSION
// Market selector at the top flows into all 4 idea sources
import { useState, useEffect, Suspense } from 'react'
import Link                               from 'next/link'
import MarketSelector, { loadMarket, defaultMarket, type TargetMarket } from '@/components/v3/MarketSelector'

const BG   = '#050A18'
const GOLD = '#D4AF37'
const W    = '#F0F9FF'
const MUTED= '#64748B'

const SOURCES = [
  { href: '/ai-income/ignition/self',    icon: '🪞', title: 'Self Discovery',       desc: 'Answer 5 questions about your skills. 4M matches you to the right product idea.',   badge: 'Most Popular' },
  { href: '/ai-income/ignition/market',  icon: '📊', title: 'Market Research',       desc: '4M scans 90+ opportunity categories and matches them to demand in your target market.', badge: '' },
  { href: '/ai-income/ignition/topical', icon: '🎯', title: 'Topical / Theme',       desc: 'Enter any topic, industry or theme. 4M generates targeted ideas for your market.',  badge: 'New' },
  { href: '/ai-income/ignition/script',  icon: '📄', title: 'Script / PDF Content',  desc: 'Paste existing content or a PDF. 4M finds the products hiding inside it.',           badge: 'New' },
]

function IgnitionHubInner() {
  const [market, setMarket] = useState<TargetMarket>(defaultMarket())

  useEffect(() => {
    setMarket(loadMarket())
  }, [])

  function handleMarketChange(m: TargetMarket) {
    setMarket(m)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>
      <nav style={{ padding: '12px 20px', background: '#0D1629', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/ai-income" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← 4M Machine</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>Idea Ignition</span>
        <Link href="/ai-income/saved-ideas" style={{ fontSize: '12px', color: GOLD, textDecoration: 'none' }}>Saved Ideas</Link>
      </nav>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '32px 20px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '44px', marginBottom: '12px' }}>💡</div>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: W, marginBottom: '10px' }}>
            Choose Your Idea Source
          </h1>
          <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8 }}>
            Four ways to find your next digital product. Set your target market first — all ideas will be tailored to it.
          </p>
        </div>

        {/* Market selector — drives all 4 sources */}
        <MarketSelector value={market} onChange={handleMarketChange} />

        {/* Market confirmation badge */}
        <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '11px', color: market.scope === 'global' ? MUTED : GOLD }}>
          {market.scope === 'global'
            ? '🌍 Ideas will be generated for the global market'
            : `🎯 Ideas will be tailored for: ${market.label} · ${market.currency}`}
        </div>

        {/* 4 sources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SOURCES.map(s => (
            <Link key={s.href} href={s.href}
              style={{ display: 'flex', gap: '16px', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', textDecoration: 'none', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '30px', flexShrink: 0, marginTop: '2px' }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W }}>{s.title}</div>
                  {s.badge && (
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px',
                      background: s.badge === 'New' ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.15)',
                      color: s.badge === 'New' ? '#10B981' : GOLD,
                      border: '1px solid ' + (s.badge === 'New' ? 'rgba(16,185,129,0.3)' : 'rgba(212,175,55,0.3)') }}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7 }}>{s.desc}</div>
              </div>
              <div style={{ color: MUTED, fontSize: '18px', flexShrink: 0, alignSelf: 'center' }}>›</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function IgnitionHubPage() {
  return <Suspense fallback={null}><IgnitionHubInner /></Suspense>
}
