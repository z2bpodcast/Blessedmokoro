'use client'
// File: app/ai-income/ignition/page.tsx — 4 Idea Sources hub
import Link from 'next/link'
import { Suspense } from 'react'

const BG   = '#050A18'
const GOLD = '#D4AF37'
const W    = '#F0F9FF'
const MUTED= '#64748B'

const SOURCES = [
  { href: 'self',    icon: '🪞', title: 'Self Discovery',      desc: 'Answer 5 questions about yourself. AI identifies your strongest monetisable skills.', badge: 'Most Popular' },
  { href: 'market',  icon: '📊', title: 'Market Research',      desc: 'AI scans 90+ proven opportunity categories and matches them to demand.', badge: '' },
  { href: 'topical', icon: '🎯', title: 'Topical / Theme',      desc: 'Enter a topic, industry or theme. AI generates targeted product ideas around it.', badge: 'New' },
  { href: 'script',  icon: '📄', title: 'Script / PDF Upload',  desc: 'Paste existing content or upload a PDF. AI finds the product hiding inside it.', badge: 'New' },
]

function IgnitionHubInner() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>
      <nav style={{ padding: '12px 20px', background: '#0D1629', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/ai-income" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← 4M Machine</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>Idea Ignition</span>
        <Link href="/ai-income/saved-ideas" style={{ fontSize: '12px', color: GOLD, textDecoration: 'none' }}>Saved Ideas</Link>
      </nav>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '44px', marginBottom: '12px' }}>💡</div>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,4vw,30px)', fontWeight: 900, color: W, marginBottom: '10px' }}>
            Choose Your Idea Source
          </h1>
          <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8 }}>
            Four ways to find your next digital product. All sources lead to the same machine.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {SOURCES.map(s => (
            <Link key={s.href} href={s.href}
              style={{ display: 'flex', gap: '16px', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', textDecoration: 'none', alignItems: 'flex-start', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '32px', flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W }}>{s.title}</div>
                  {s.badge && (
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: s.badge === 'New' ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.15)', color: s.badge === 'New' ? '#10B981' : GOLD, border: '1px solid ' + (s.badge === 'New' ? 'rgba(16,185,129,0.3)' : 'rgba(212,175,55,0.3)') }}>
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
  return (
    <Suspense fallback={null}>
      <IgnitionHubInner />
    </Suspense>
  )
}
