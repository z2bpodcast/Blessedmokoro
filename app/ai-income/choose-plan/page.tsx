'use client'
// FILE: app/ai-income/choose-plan/page.tsx
// Tier selection → Free starts immediately → Paid tiers go to payment page

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PURP  = '#4C1D95'
const GOLD  = '#D4AF37'
const BG    = '#0D0820'
const WHITE = '#F0EEF8'

const TIERS = [
  {
    id:       'free',
    name:     'Start Free',
    price:    0,
    label:    'R0',
    badge:    '🚀 FREE',
    color:    '#6EE7B7',
    features: ['Offer Generator', 'Customer Finder', 'Post Generator', 'Coach Manlaw (basic)'],
    cta:      'Start Free Now →',
    highlight: false,
  },
  {
    id:       'starter',
    name:     'Starter Pack',
    price:    500,
    label:    'R500',
    badge:    '⭐ STARTER',
    color:    '#A78BFA',
    bfm:      'R850/month',
    features: ['All Free features', 'Reply System', 'Closing Assistant', 'Daily Engine', 'Referral Booster'],
    cta:      'Get Starter Pack →',
    highlight: false,
  },
  {
    id:       'bronze',
    name:     'Bronze',
    price:    2500,
    label:    'R2,500',
    badge:    '🥉 BRONZE',
    color:    '#CD7F32',
    bfm:      'R1,050/month',
    features: ['All Starter features', '2-Product Engine', 'Team commissions G2-G3', 'ISP 18%'],
    cta:      'Upgrade to Bronze →',
    highlight: false,
  },
  {
    id:       'copper',
    name:     'Copper',
    price:    5000,
    label:    'R5,000',
    badge:    '🔶 COPPER',
    color:    '#B87333',
    bfm:      'R1,300/month',
    features: ['All Bronze features', '5-Product Engine', 'Self-Discovery Engine', 'Team commissions G2-G4', 'ISP 22%'],
    cta:      'Upgrade to Copper →',
    highlight: false,
  },
  {
    id:       'silver',
    name:     'Silver',
    price:    12000,
    label:    'R12,000',
    badge:    '⚙️ SILVER',
    color:    '#C0C0C0',
    bfm:      'R2,000/month',
    features: ['All Copper features', '7-Product Engine', 'Digital Twin (1)', 'Sales Funnel Builder', 'Niche Blueprint', 'TLI Leadership Bonuses'],
    cta:      'Upgrade to Silver →',
    highlight: true,
  },
  {
    id:       'gold',
    name:     'Gold',
    price:    24000,
    label:    'R24,000',
    badge:    '⚡ GOLD',
    color:    GOLD,
    bfm:      'R3,200/month',
    features: ['All Silver features', 'Digital Twin (5)', 'Team commissions G2-G8', 'ISP 28%', 'Higher TLI bonuses'],
    cta:      'Upgrade to Gold →',
    highlight: false,
  },
  {
    id:       'platinum',
    name:     'Platinum',
    price:    50000,
    label:    'R50,000',
    badge:    '💎 PLATINUM',
    color:    '#E2E8F0',
    bfm:      'R5,800/month',
    features: ['All Gold features', 'Digital Twin (7)', 'Distribution License', 'Team commissions G2-G10', 'ISP 30%', 'CEO Awards eligible'],
    cta:      'Upgrade to Platinum →',
    highlight: false,
  },
]

export default function ChoosePlan() {
  const router  = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (tier: typeof TIERS[0]) => {
    if (tier.price === 0) {
      // Free — go straight to app
      router.push('/ai-income')
      return
    }
    // Paid — go to payment page with tier pre-selected
    router.push(`/ai-income/payment?tier=${tier.id}&amount=${tier.price}&name=${encodeURIComponent(tier.name)}`)
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:WHITE, fontFamily:'Georgia,serif', padding:'20px 16px 60px' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'32px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, letterSpacing:'3px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:'8px' }}>
          Step 2 of 2
        </div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:WHITE, margin:'0 0 8px' }}>
          Choose Your Power Level
        </h1>
        <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', margin:0, lineHeight:1.7 }}>
          Start free and upgrade anytime — or go straight to the tier that matches your ambition.
        </p>
      </div>

      {/* Tiers grid */}
      <div style={{ maxWidth:'480px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'12px' }}>
        {TIERS.map(tier => (
          <div key={tier.id}
            onClick={() => handleSelect(tier)}
            style={{
              border: `2px solid ${tier.highlight ? GOLD : `${tier.color}40`}`,
              borderRadius:'16px',
              padding:'18px 20px',
              background: tier.highlight ? `rgba(212,175,55,0.08)` : 'rgba(255,255,255,0.03)',
              cursor:'pointer',
              position:'relative',
              transition:'all 0.2s',
            }}>

            {/* Most Popular badge */}
            {tier.highlight && (
              <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:'#1E1245', fontSize:'10px', fontWeight:900, padding:'3px 14px', borderRadius:'20px', letterSpacing:'1px', whiteSpace:'nowrap' as const }}>
                ⭐ MOST POPULAR
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
              <div>
                <span style={{ fontSize:'11px', fontWeight:700, color:tier.color, letterSpacing:'1px' }}>{tier.badge}</span>
                <div style={{ fontSize:'17px', fontWeight:900, color:WHITE, fontFamily:'Cinzel,Georgia,serif', marginTop:'2px' }}>{tier.name}</div>
              </div>
              <div style={{ textAlign:'right' as const }}>
                <div style={{ fontSize:'20px', fontWeight:900, color:tier.color }}>{tier.label}</div>
                {tier.bfm && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)' }}>+ {tier.bfm} BFM</div>}
              </div>
            </div>

            {/* Features */}
            <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginBottom:'14px' }}>
              {tier.features.map(f => (
                <div key={f} style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', display:'flex', gap:'6px', alignItems:'center' }}>
                  <span style={{ color:tier.color }}>✓</span> {f}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button style={{
              width:'100%', padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer',
              background: tier.price === 0
                ? 'linear-gradient(135deg,#059669,#047857)'
                : tier.highlight
                  ? `linear-gradient(135deg,${GOLD},#B8860B)`
                  : `${tier.color}22`,
              color: tier.price === 0 || tier.highlight ? '#fff' : tier.color,
              fontSize:'13px', fontWeight:700, fontFamily:'Cinzel,Georgia,serif',
              border: tier.price === 0 || tier.highlight ? 'none' : `1px solid ${tier.color}60`,
            }}>
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{ textAlign:'center', marginTop:'24px', fontSize:'11px', color:'rgba(255,255,255,0.3)', lineHeight:1.7 }}>
        All prices in ZAR · BFM = Builder's Monthly Fee (keeps earnings active)<br/>
        Upgrade anytime · Cancel anytime
      </div>
    </div>
  )
}
