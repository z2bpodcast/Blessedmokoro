'use client'
// ============================================================
// Z2B V3 — PRICING PAGE (REVAMPED SPRINT 17)
// File: app/pricing/page.tsx
// ============================================================

import { useState, Suspense } from 'react'
import Link                   from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

const TIERS = [
  {
    id:        'starter',
    name:      'Starter',
    price:     700,
    bfm:       750,
    engine:    '🔧 Manual',
    gears:     '1–3',
    products:  2,
    pwa:       0,
    market:    false,
    gear7:     false,
    color:     '#B4B2A9',
    bg:        'rgba(180,178,169,0.08)',
    features: [
      'Idea Ignition — all 4 sources',
      'Gear 1: Intent Engine',
      'Gear 2: Blueprint Engine',
      'Gear 3: Content Engine (full product written)',
      'List on Z2B Marketplace',
      '10% ISP on membership sales',
      '20% Affiliate commission',
      'Coach Manlaw AI',
      'My Projects — save drafts',
    ],
    locked: [
      'Quality control (Gear 4)',
      'Enhancement (Gear 5)',
      'Live market research',
      'Multi-platform distribution',
      'Progressive Web App (PWA)',
    ],
  },
  {
    id:        'bronze',
    name:      'Bronze',
    price:     2500,
    bfm:       750,
    engine:    '🔧 Manual',
    gears:     '1–4',
    products:  4,
    pwa:       0,
    market:    true,
    gear7:     false,
    color:     '#CD7F32',
    bg:        'rgba(205,127,50,0.08)',
    features: [
      'Everything in Starter',
      'Gear 4: Quality Control (auto-approved)',
      'Live Google Trends market research',
      '4 products per month',
      '18% ISP on membership sales',
      'QPB · TSC · TLI · CEO Awards',
    ],
    locked: [
      'Enhancement assets (Gear 5)',
      'Multi-platform distribution (Gear 7)',
      'Progressive Web App (PWA)',
    ],
  },
  {
    id:        'copper',
    name:      'Copper',
    price:     5000,
    bfm:       1500,
    engine:    '⚙️ Automatic',
    gears:     '1–5',
    products:  15,
    pwa:       1,
    market:    true,
    gear7:     false,
    color:     '#B87333',
    bg:        'rgba(184,115,51,0.08)',
    badge:     'Most Popular',
    features: [
      'Everything in Bronze',
      'Gear 5: Templates, worksheets & toolkits',
      'Automatic Engine — less manual input',
      '15 products per month',
      '1 Builder PWA storefront',
      '22% ISP on membership sales',
    ],
    locked: [
      'Multi-platform distribution (Gear 7)',
      'Free community',
    ],
  },
  {
    id:        'silver',
    name:      'Silver',
    price:     12000,
    bfm:       3000,
    engine:    '⚡ Electric',
    gears:     '1–7',
    products:  30,
    pwa:       3,
    market:    true,
    gear7:     true,
    color:     '#C0C0C0',
    bg:        'rgba(192,192,192,0.08)',
    features: [
      'Everything in Copper',
      'ALL 7 Gears — full machine power',
      'Gear 6: Z2B Marketplace auto-listing',
      'Gear 7: Selar · Gumroad · Payhip · WhatsApp kits',
      'Electric Engine — semi-automated',
      '30 products per month',
      '3 Builder PWAs + free community',
      '25% ISP on membership sales',
    ],
    locked: [
      'Paid community',
      'White-label branding',
    ],
  },
  {
    id:        'gold',
    name:      'Gold',
    price:     25000,
    bfm:       7000,
    engine:    '🚀 Rocket',
    gears:     '1–7',
    products:  60,
    pwa:       5,
    market:    true,
    gear7:     true,
    color:     GOLD,
    bg:        'rgba(212,175,55,0.1)',
    badge:     'Best Value',
    features: [
      'Everything in Silver',
      'Rocket Engine — full automation',
      '60 products per month',
      '5 Builder PWAs + paid community',
      'Auto-distribute on Gear 7 confirm',
      '28% ISP on membership sales',
      'CEO Competitions — open to paid members (not FAM) · Top prizes each season',
    ],
    locked: ['White-label branding'],
  },
  {
    id:        'platinum',
    name:      'Platinum',
    price:     50000,
    bfm:       12000,
    engine:    '🚀 Rocket',
    gears:     '1–7',
    products:  -1,
    pwa:       -1,
    market:    true,
    gear7:     true,
    color:     '#E5E4E2',
    bg:        'rgba(229,228,226,0.08)',
    features: [
      'Everything in Gold',
      'Unlimited products per month',
      'Unlimited Builder PWAs',
      'White-label — your brand, not Z2B\'s',
      'Paid community on every PWA',
      'Priority AI queue',
      '30% ISP — highest rate',
      'CEO Awards — open to ALL members paying Business Fuel Maintenance (BFM) · Top prizes each season',
    ],
    locked: [],
  },
]

function formatR(n: number) {
  return 'R' + n.toLocaleString('en-ZA')
}

function PricingInner() {
  const [annual, setAnnual] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Home</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: GOLD }}>Z2B Packages</span>
        <Link href="/register" style={{ fontSize: '12px', color: GOLD, textDecoration: 'none', fontWeight: 700 }}>Start Now →</Link>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 20px 32px' }}>
        <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>Zero to Billionaires</div>
        <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900, color: W, margin: '0 0 14px' }}>
          One Machine. Six Tiers.<br/>Multiple Income Streams.
        </h1>
        <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 24px' }}>
          The 4M Machine builds your digital products from idea to marketplace. Every tier gives you a more powerful engine, more gears and more income potential.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', color: GREEN }}>
          ✓ BFM starts day 61 · No contracts · Upgrade anytime
        </div>
      </div>

      {/* Tier grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {TIERS.map(tier => (
            <div key={tier.id} style={{ borderRadius: '20px', border: '1px solid ' + tier.color + '40', background: tier.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>

              {/* Badge */}
              {tier.badge && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: tier.id === 'gold' ? GOLD : 'rgba(139,92,246,0.2)', color: tier.id === 'gold' ? '#050A18' : VIO, border: tier.id === 'gold' ? 'none' : '1px solid rgba(139,92,246,0.4)' }}>
                  {tier.badge}
                </div>
              )}

              {/* Header */}
              <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: tier.color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>{tier.engine}</div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '22px', fontWeight: 900, color: W, marginBottom: '10px' }}>{tier.name}</div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '32px', fontWeight: 900, color: tier.color }}>
                  {formatR(tier.price)}
                  <span style={{ fontSize: '13px', fontWeight: 400, color: MUTED }}> once-off</span>
                </div>
                <div style={{ fontSize: '11px', color: MUTED, marginTop: '4px' }}>
                  + {formatR(tier.bfm)}/month Business Fuel Maintenance (BFM) from day 61
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Gears', value: tier.gears },
                  { label: 'Products/mo', value: tier.products === -1 ? '∞' : tier.products },
                  { label: 'PWAs', value: tier.pwa === -1 ? '∞' : tier.pwa === 0 ? '—' : tier.pwa },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: tier.color }}>{stat.value}</div>
                    <div style={{ fontSize: '9px', color: MUTED, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div style={{ padding: '16px 20px', flex: 1 }}>
                {tier.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>
                    <span style={{ color: GREEN, flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
                {tier.locked.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', lineHeight: 1.5 }}>
                    <span style={{ flexShrink: 0 }}>—</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ padding: '0 20px 24px' }}>
                <Link href={`/register?tier=${tier.id}&amount=${tier.price}&name=${encodeURIComponent(tier.name)}`}
                  style={{ display: 'block', padding: '13px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, background: tier.id === 'gold' ? GOLD : 'transparent', color: tier.id === 'gold' ? '#050A18' : tier.color, border: tier.id === 'gold' ? 'none' : '1px solid ' + tier.color + '60' }}>
                  Get {tier.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table — key features */}
        <div style={{ marginTop: '48px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W }}>Feature Comparison</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: MUTED, fontWeight: 500 }}>Feature</th>
                  {TIERS.map(t => <th key={t.id} style={{ padding: '12px 10px', textAlign: 'center', color: t.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{t.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Engine', values: TIERS.map(t => t.engine) },
                  { label: 'Gear access', values: TIERS.map(t => t.gears) },
                  { label: 'Products / month', values: TIERS.map(t => t.products === -1 ? '∞' : String(t.products)) },
                  { label: 'Live market research', values: TIERS.map(t => t.market ? '✓' : '—') },
                  { label: 'Gear 7 distribution', values: TIERS.map(t => t.gear7 ? '✓' : '—') },
                  { label: 'Progressive Web App (PWA)', values: TIERS.map(t => t.pwa === 0 ? '—' : t.pwa === -1 ? '∞' : String(t.pwa)) },
                  { label: 'ISP rate', values: ['10%','18%','22%','25%','28%','30%'] },
                  { label: 'Business Fuel Maintenance (BFM) from day 61', values: TIERS.map(t => formatR(t.bfm) + '/mo') },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '10px 16px', color: MUTED }}>{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} style={{ padding: '10px', textAlign: 'center', color: v === '✓' ? GREEN : v === '—' ? 'rgba(255,255,255,0.15)' : W, fontWeight: v === '✓' ? 700 : 400 }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ strip */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
          {[
            { q: 'What is BFM?', a: 'Business Facilitation Monthly — a small operational fee starting day 61 that covers your AI production costs. Your product sales should cover it by then.' },
            { q: 'Can I upgrade anytime?', a: 'Yes. Upgrading requires full payment of the new tier — not a top-up of the difference. Your existing products stay live. Good news: new members enjoy 60 days without Business Fuel Maintenance (BFM) payments, giving you time to generate income before maintenance begins.' },
            { q: 'What is the 4M Machine?', a: 'An AI-powered digital product factory. From idea to marketplace in one session — without design skills, coding or a big budget.' },
            { q: 'Is there a free tier?', a: 'The Free Affiliate Marketer (FAM) tier is available by invitation when you refer members to the marketplace. Paid tiers start at R700.' },
            { q: 'What are QPB · TSC · TLI · CEO Awards?', a: 'These are your Z2B compensation plan earnings. QPB (Quick Performance Bonus), TSC (Team Sales Commission), TLI (Team Leader Incentives) and CEO Awards reward your growth and team building. View full details at app.z2blegacybuilders.co.za/compensation' },
            { q: 'Do I own what the 4M Machine creates?', a: '100%. Every product the 4M Machine builds for you is yours to keep, sell and distribute however you choose. Sell on Z2B, Selar, Gumroad, Payhip, Etsy, Udemy, ClickBank, Whop, your own website — anywhere. The 5% Z2B fee only applies to sales made on the Z2B Marketplace.' },
          ].map((faq, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: W, marginBottom: '8px' }}>{faq.q}</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7 }}>{faq.a}</div>
            </div>
          ))}
        </div>

        {/* NOTEPAD — Build story */}
        <div style={{ marginTop: '48px', marginBottom: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
          {/* Notepad title bar */}
          <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['#E24B4A','#EF9F27','#639922'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
            </div>
            <span style={{ fontSize: '11px', color: MUTED, marginLeft: '8px', letterSpacing: '0.5px' }}>Z2B Legacy Builders · Build Notes</span>
          </div>
          {/* Notepad content */}
          <div style={{ padding: '24px' }}>
            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '8px', fontFamily: 'monospace' }}>// This Business System was built with you in mind</div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '8px', lineHeight: 1.4 }}>
              Built for employees and unemployed visionaries who refuse to retire broke.
            </div>
            <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8, marginBottom: '20px' }}>
              Before you choose your package, we want you to know what went into building the machine you are about to access.
            </p>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Sprints completed',  value: '100+',    sub: 'active build sessions' },
                { label: 'Hours invested',     value: '~300',    sub: '3–6 hrs per session' },
                { label: 'Calendar time',      value: '17 months',sub: 'Jan 2025 – May 2026' },
                { label: 'Lines of code',      value: '25,000+', sub: '80+ files · TS · SQL · React' },
              ].map(s => (
                <div key={s.label} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '9px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: GOLD, marginBottom: '2px' }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: MUTED }}>{s.sub}</div>
                </div>
              ))}
            </div>
            {/* Pull quote */}
            <div style={{ borderLeft: '2px solid rgba(212,175,55,0.4)', paddingLeft: '14px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8, fontStyle: 'italic' }}>
                A South African development agency would charge <strong style={{ color: W, fontStyle: 'normal' }}>R800,000 – R1,000,000+</strong> to build this from scratch. Timeline: 12–18 months. You are accessing it from <strong style={{ color: GOLD, fontStyle: 'normal' }}>R700.</strong>
              </p>
            </div>
            <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8, marginBottom: '12px' }}>
              You are not buying software. You are buying 17 months of obsession, 300 hours of precision engineering, and a system designed specifically for someone in your situation — someone who has more to offer the world than their salary suggests.
            </p>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>// The convenience you get is priceless.</div>
          </div>
        </div>

        {/* HOVER + CLICK CARD — Real cost of not buying */}
        <div style={{ position: 'relative', marginBottom: '32px', zIndex: 50 }}>
          <button
            onClick={() => { const card = document.getElementById('z2b-cost-card'); if(card) { const showing = card.style.opacity === '1'; card.style.opacity = showing ? '0' : '1'; card.style.transform = showing ? 'translateY(8px)' : 'translateY(0)'; card.style.pointerEvents = showing ? 'none' : 'auto'; } }}
            onMouseEnter={() => { const card = document.getElementById('z2b-cost-card'); if(card) { card.style.opacity='1'; card.style.transform='translateY(0)'; card.style.pointerEvents='auto'; } }}
            onMouseLeave={() => { const card = document.getElementById('z2b-cost-card'); if(card) { card.style.opacity='0'; card.style.transform='translateY(8px)'; card.style.pointerEvents='none'; } }}
            style={{ width: '100%', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '12px', fontSize: '14px', color: W, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'Georgia,serif', textAlign: 'left' }}>
            <span>The price you pay to access the Z2B 4M Machine and System is not your real cost...</span>
            <span style={{ fontSize: '16px', color: GOLD, flexShrink: 0, marginLeft: '12px' }}>▼</span>
          </button>
          <div id="z2b-cost-card"
            style={{ position: 'static', marginTop: '8px', opacity: 0, transform: 'translateY(8px)', transition: 'opacity 0.25s ease, transform 0.25s ease', pointerEvents: 'none', background: '#0D1629', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: W, marginBottom: '14px' }}>
              The real cost is choosing <em>not</em> to start.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: '⏳', title: '40 years of salary dependence', desc: 'You trade 40 years of your life for a fixed income decided by someone else. No growth. No ownership. No legacy.' },
                { icon: '📉', title: 'Inflation quietly erodes what you have', desc: 'Every year you wait, the money you earn buys less. A passive income stream today protects tomorrow.' },
                { icon: '🚫', title: 'Retrenchment with no backup plan', desc: 'One company decision ends your income overnight. No second stream. No safety net. Nothing to fall back on.' },
                { icon: '🏦', title: 'Settling for a government social grant', desc: 'R350/month. After 40 years of work, knowledge and potential — that is the default retirement for millions of South Africans.' },
                { icon: '🔥', title: 'Your knowledge and dreams die with you', desc: 'Everything you know — your skills, your wisdom, your lived experience, your dreams — leaves the world when you do. The 4M Machine turns that into a legacy that outlives you.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: W, marginBottom: '3px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '12px 14px', background: 'rgba(212,175,55,0.06)', borderLeft: '2px solid rgba(212,175,55,0.4)', borderRadius: '0 8px 8px 0', marginTop: '4px' }}>
                <p style={{ fontSize: '13px', color: MUTED, fontStyle: 'italic', lineHeight: 1.7 }}>
                  The price you pay for Z2B is not your cost. The cost is what you continue to lose every month you delay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer slogan */}
        <div style={{ textAlign: 'center', padding: '16px 0 8px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '16px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', color: GOLD, fontStyle: 'italic', marginBottom: '6px' }}>
            "If they underpay you or don't want to employ you — Deploy Yourself."
          </div>
          <div style={{ fontSize: '11px', color: MUTED }}>
            <a href="mailto:payments@z2blegacybuilders.co.za" style={{ color: GOLD, textDecoration: 'none' }}>payments@z2blegacybuilders.co.za</a>
            {' · '}
            <a href="mailto:support@z2blegacybuilders.co.za" style={{ color: GOLD, textDecoration: 'none' }}>support@z2blegacybuilders.co.za</a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: '48px', textAlign: 'center', padding: '40px 20px', borderRadius: '20px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,3vw,28px)', fontWeight: 900, color: W, marginBottom: '10px' }}>
            The world is your market. Start building.
          </div>
          <div style={{ fontSize: '13px', color: MUTED, marginBottom: '24px' }}>
            Your knowledge. The 4M Machine. Multiple income streams.
          </div>
          <Link href="/register"
            style={{ display: 'inline-block', padding: '14px 36px', borderRadius: '14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
            Start from R700 →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <PricingInner />
    </Suspense>
  )
}
