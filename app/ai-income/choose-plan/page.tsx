'use client'
// File: app/ai-income/choose-plan/page.tsx
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const BG   = '#050A18'
const GOLD = '#D4AF37'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 700, engine: '🔧 Manual',
    color: '#B4B2A9', gears: '1–3', products: 2, bfm: 750,
    highlight: ['Idea Ignition (4 sources)', 'Gears 1–3: Intent + Blueprint + Content', 'Z2B Marketplace listing', '10% ISP · 20% Affiliate', 'Coach Manlaw AI'],
  },
  {
    id: 'bronze', name: 'Bronze', price: 2500, engine: '🔧 Manual',
    color: '#CD7F32', gears: '1–4', products: 4, bfm: 750,
    highlight: ['Everything in Starter', 'Gear 4: Quality Control', 'Live Google Trends market research', '4 products/month', '18% ISP'],
  },
  {
    id: 'copper', name: 'Copper', price: 5000, engine: '⚙️ Automatic',
    color: '#B87333', gears: '1–5', products: 15, bfm: 1500,
    badge: 'Most Popular',
    highlight: ['Everything in Bronze', 'Gear 5: Templates + worksheets', 'Automatic Engine — less input needed', '15 products/month', '1 Builder PWA storefront', '22% ISP'],
  },
  {
    id: 'silver', name: 'Silver', price: 12000, engine: '⚡ Electric',
    color: '#C0C0C0', gears: '1–7', products: 30, bfm: 3000,
    highlight: ['Everything in Copper', 'Full 7-gear machine', 'Gear 7: Selar · Gumroad · Payhip · WhatsApp', '30 products/month', '3 PWAs + free community', '25% ISP'],
  },
  {
    id: 'gold', name: 'Gold', price: 25000, engine: '🚀 Rocket',
    color: GOLD, gears: '1–7', products: 60, bfm: 7000,
    badge: 'Best Value',
    highlight: ['Everything in Silver', 'Rocket Engine — full automation', '60 products/month', '5 PWAs + paid community', '28% ISP + CEO Awards'],
  },
  {
    id: 'platinum', name: 'Platinum', price: 50000, engine: '🚀 Rocket',
    color: '#E5E4E2', gears: '1–7', products: -1, bfm: 12000,
    highlight: ['Everything in Gold', 'Unlimited products + PWAs', 'White-label branding', 'Priority AI queue', '30% ISP — maximum rate'],
  },
]

function ChoosePlanInner() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function proceed() {
    const plan = PLANS.find(p => p.id === selected)
    if (!plan) return
    router.push(`/ai-income/payment?tier=${plan.id}&amount=${plan.price}&name=${encodeURIComponent(plan.name)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>
      <nav style={{ padding: '12px 20px', background: '#0D1629', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/ai-income/landing" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Back</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: GOLD }}>Choose Your Engine</span>
        <Link href="/pricing" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>Full comparison</Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: W, marginBottom: '10px' }}>Which engine powers your legacy?</h1>
          <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8 }}>Start at any level. Upgrade as you grow. BFM only starts day 61.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {PLANS.map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id)}
              style={{ padding: '18px 20px', borderRadius: '14px', border: '2px solid ' + (selected === plan.id ? plan.color : 'rgba(255,255,255,0.08)'), background: selected === plan.id ? plan.color + '12' : 'rgba(255,255,255,0.02)', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: plan.id === 'gold' ? GOLD : 'rgba(139,92,246,0.2)', color: plan.id === 'gold' ? '#050A18' : '#8B5CF6', border: plan.id === 'gold' ? 'none' : '1px solid rgba(139,92,246,0.4)' }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '17px', fontWeight: 900, color: plan.color }}>{plan.name}</div>
                    <div style={{ fontSize: '11px', color: MUTED }}>{plan.engine} · Gears {plan.gears}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: MUTED }}>
                    {plan.products === -1 ? 'Unlimited' : plan.products} products/month · R{plan.bfm.toLocaleString()}/mo BFM from day 61
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: plan.color }}>R{plan.price.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: MUTED }}>once-off</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {plan.highlight.slice(0, 3).map((h, i) => (
                  <span key={i} style={{ fontSize: '10px', color: selected === plan.id ? plan.color : MUTED, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>✓ {h}</span>
                ))}
                {plan.highlight.length > 3 && <span style={{ fontSize: '10px', color: MUTED, padding: '3px 8px' }}>+{plan.highlight.length - 3} more</span>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={proceed} disabled={!selected}
          style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: selected ? 'pointer' : 'default', background: selected ? 'linear-gradient(135deg,#D4AF37,#B8860B)' : 'rgba(255,255,255,0.06)', color: selected ? '#050A18' : MUTED, fontWeight: 900, fontSize: '16px', fontFamily: 'Cinzel,Georgia,serif', opacity: selected ? 1 : 0.5 }}>
          {selected ? `Proceed to Payment — R${PLANS.find(p=>p.id===selected)?.price.toLocaleString()} →` : 'Select a package to continue'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: MUTED }}>
          Secure payment via PayFast · EFT · Card · Instant EFT
        </div>
      </div>
    </div>
  )
}

export default function ChoosePlanPage() {
  return <Suspense fallback={null}><ChoosePlanInner /></Suspense>
}
