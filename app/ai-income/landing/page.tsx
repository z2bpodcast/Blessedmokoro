'use client'
// File: app/ai-income/landing/page.tsx
import Link from 'next/link'
import { Suspense } from 'react'

const BG   = '#050A18'
const GOLD = '#D4AF37'
const CYAN = '#06B6D4'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'
const VIO  = '#8B5CF6'

const FEATURES = [
  { icon: '💡', title: '4 Idea Sources',        desc: 'Self discovery, live market research via Google Trends, any topic or your own content' },
  { icon: '✍️', title: '4M Writes Everything',  desc: 'The machine writes your full digital product — eBooks, toolkits, templates and more' },
  { icon: '✅', title: 'Quality Approved',       desc: '4M evaluates and strengthens your content before you even see it' },
  { icon: '🧰', title: 'Assets Included',        desc: 'Worksheets, checklists and templates added automatically to your product' },
  { icon: '🏪', title: '5 Marketplaces',         desc: 'Listed on Z2B, Selar, Gumroad, Payhip and WhatsApp with one click' },
  { icon: '💰', title: 'Multiple Income Streams',desc: 'Product sales, affiliate commissions, team earnings and BFM returns' },
]

const TIERS_SUMMARY = [
  { name: 'Starter',  price: 'R700',    engine: '🔧', gears: '3 gears', color: '#B4B2A9' },
  { name: 'Bronze',   price: 'R2,500',  engine: '🔧', gears: '4 gears', color: '#CD7F32' },
  { name: 'Copper',   price: 'R5,000',  engine: '⚙️', gears: '5 gears', color: '#B87333' },
  { name: 'Silver',   price: 'R12,000', engine: '⚡', gears: '7 gears', color: '#C0C0C0' },
  { name: 'Gold',     price: 'R25,000', engine: '🚀', gears: '7 gears', color: GOLD },
  { name: 'Platinum', price: 'R50,000', engine: '🚀', gears: '7 gears + unlimited', color: '#E5E4E2' },
]

function LandingInner() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 24px', background: 'rgba(5,10,24,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: GOLD }}>Z2B</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/pricing" style={{ fontSize: '13px', color: MUTED, textDecoration: 'none' }}>Pricing</Link>
          <Link href="/login" style={{ fontSize: '13px', color: MUTED, textDecoration: 'none' }}>Login</Link>
          <Link href="/ai-income/choose-plan" style={{ padding: '8px 18px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '13px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>Start Building →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'clamp(48px,8vw,80px) 24px 40px' }}>
        <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px' }}>Zero 2 Billionaires · Legacy Builders</div>
        <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, color: W, margin: '0 0 16px', lineHeight: 1.2 }}>
          Your Knowledge.<br/>
          <span style={{ color: GOLD }}>The 4M Machine.</span><br/>
          Your Income.
        </h1>
        <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: MUTED, lineHeight: 1.9, maxWidth: '560px', margin: '0 auto 32px' }}>
          The AI-powered digital product factory that turns your knowledge into sellable products — without design skills, coding or a big budget.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/ai-income/choose-plan"
            style={{ padding: '15px 36px', borderRadius: '14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
            Start from R700 →
          </Link>
          <Link href="/pricing"
            style={{ padding: '15px 28px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '14px', textDecoration: 'none' }}>
            View all packages
          </Link>
        </div>
        <div style={{ marginTop: '16px', fontSize: '12px', color: MUTED }}>
          ✓ BFM starts day 61 only &nbsp;·&nbsp; ✓ No contracts &nbsp;·&nbsp; ✓ Upgrade anytime
        </div>
      </div>

      {/* Proof stat */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ padding: '20px 24px', borderRadius: '16px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: MUTED, marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>Proven in production</div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(15px,3vw,20px)', fontWeight: 900, color: W, marginBottom: '6px' }}>
            9,489 words · 14 sections · R299 selling price
          </div>
          <div style={{ fontSize: '13px', color: GOLD }}>First product built by our founder using the 4M Machine</div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,3vw,30px)', fontWeight: 900, color: W }}>What the 4M Machine gives you</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '14px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: W, marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier ladder */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: W, marginBottom: '8px' }}>One machine. Six engines.</div>
          <div style={{ fontSize: '13px', color: MUTED }}>Start at the level that suits you. Upgrade as you grow.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {TIERS_SUMMARY.map((t, i) => (
            <Link key={i} href={`/ai-income/payment?tier=${t.name.toLowerCase()}&amount=${t.price.replace(/[^0-9]/g,'')}&name=${t.name}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderRadius: '12px', border: '1px solid ' + t.color + '30', background: 'rgba(255,255,255,0.02)', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{t.engine}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: t.color, fontFamily: 'Cinzel,Georgia,serif' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: MUTED }}>{t.gears}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: t.color }}>{t.price}</div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/pricing" style={{ fontSize: '13px', color: CYAN, textDecoration: 'none' }}>Compare all features →</Link>
        </div>
      </div>

      {/* Global CTA */}
      <div style={{ padding: '48px 24px 64px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, color: W, marginBottom: '12px' }}>
          The world is your market.
        </div>
        <div style={{ fontSize: '14px', color: MUTED, marginBottom: '28px' }}>
          50+ countries · Any niche · Any language · Multiple income streams
        </div>
        <Link href="/ai-income/choose-plan"
          style={{ display: 'inline-block', padding: '16px 40px', borderRadius: '14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
          Choose Your Engine →
        </Link>
      </div>

    </div>
  )
}

export default function LandingPage() {
  return <Suspense fallback={null}><LandingInner /></Suspense>
}
