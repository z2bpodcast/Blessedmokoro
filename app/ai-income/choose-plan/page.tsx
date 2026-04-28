'use client'
// FILE: app/ai-income/choose-plan/page.tsx

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const PURP = '#4C1D95'
const GOLD = '#D4AF37'
const BG   = '#0D0820'
const W    = '#F0EEF8'
const ROCK = '#FF6B35'

const TIERS = [
  { id:'free',             name:'Free',             price:0,     label:'R0',        badge:'🚀 FREE',            color:'#6EE7B7', rocket:false,
    features:['Offer Generator','Customer Finder','Post Generator','Basic Coach Manlaw'], cta:'Start Free Now →', highlight:false },
  { id:'starter',          name:'Starter Pack',     price:500,   label:'R500',      badge:'⭐ STARTER',         color:'#A78BFA', rocket:false,
    features:['All Free features','Reply System','Closing Assistant','Daily Engine','NSB: R150 on Starter sales','BFM: R850/month'], cta:'Get Starter Pack →', highlight:false },
  { id:'bronze',           name:'Bronze',           price:2500,  label:'R2,500',    badge:'🥉 BRONZE',          color:'#CD7F32', rocket:false,
    features:['All Starter','2-Product Engine','TSC G2-G3','ISP 18%','BFM: R1,050/month'], cta:'Upgrade to Bronze →', highlight:false },
  { id:'copper',           name:'Copper',           price:5000,  label:'R5,000',    badge:'🔶 COPPER',          color:'#B87333', rocket:false,
    features:['All Bronze','5-Product Engine','Self-Discovery','TSC G2-G4','ISP 22%','BFM: R1,300/month'], cta:'Upgrade to Copper →', highlight:false },
  { id:'silver',           name:'Silver',           price:12000, label:'R12,000',   badge:'⚙️ SILVER',         color:'#C0C0C0', rocket:false,
    features:['All Copper','7-Product Engine','Digital Twin (1)','TSC G2-G6','ISP 25%','TLI eligible','BFM: R2,000/month'], cta:'Upgrade to Silver →', highlight:true },
  { id:'silver_rocket',    name:'Silver Rocket',    price:17000, label:'R17,000',   badge:'🚀⚙️ SILVER ROCKET', color:'#FF6B35', rocket:true,
    features:['Everything in Silver','+ 🚀 Rocket Mode (12 products/month)','AI market research','AI creates complete products','Z2B Marketplace (keep 90%)','All product formats'], cta:'Get Silver Rocket →', highlight:false },
  { id:'gold',             name:'Gold',             price:24000, label:'R24,000',   badge:'⚡ GOLD',            color:GOLD, rocket:false,
    features:['All Silver','Digital Twin (5)','TSC G2-G8','ISP 28%','BFM: R3,200/month'], cta:'Upgrade to Gold →', highlight:false },
  { id:'gold_rocket',      name:'Gold Rocket',      price:35000, label:'R35,000',   badge:'🚀⚡ GOLD ROCKET',   color:'#FF6B35', rocket:true,
    features:['Everything in Gold','+ 🚀 Rocket Mode (30 products/month)','Live global market research','AI website builder per product','Sell anywhere + Z2B Marketplace','Demographic targeting'], cta:'Get Gold Rocket →', highlight:false },
  { id:'platinum',         name:'Platinum',         price:50000, label:'R50,000',   badge:'💎 PLATINUM',        color:'#E2E8F0', rocket:false,
    features:['All Gold','Digital Twin (7)','Distribution License','TSC G2-G10','ISP 30%','BFM: R5,800/month'], cta:'Upgrade to Platinum →', highlight:false },
  { id:'platinum_rocket',  name:'Platinum Rocket',  price:70000, label:'R70,000',   badge:'🚀💎 PLATINUM ROCKET', color:'#FF6B35', rocket:true,
    features:['Everything in Platinum','+ 🚀 Rocket Mode (Unlimited)','Bulk product creation','Own branded marketplace','Website builder + full promotion strategy (SEO, Ads, TikTok, Email)','Distribution Rights — 9th income stream'], cta:'Get Platinum Rocket →', highlight:false },
]

function ChoosePlanInner() {
  const router  = useRouter()
  const params  = useSearchParams()
  const ref     = params.get('ref') || ''
  const [filter, setFilter] = useState<'all'|'rocket'|'standard'>('all')

  const visible = TIERS.filter(t => {
    if (filter === 'rocket')   return t.rocket || t.id === 'free'
    if (filter === 'standard') return !t.rocket
    return true
  })

  const handleSelect = (tier: typeof TIERS[0]) => {
    if (tier.price === 0) {
      router.push(`/ai-income${ref ? '?ref='+ref : ''}`)
      return
    }
    router.push(`/ai-income/payment?tier=${tier.id}&amount=${tier.price}&name=${encodeURIComponent(tier.name)}${ref ? '&ref='+ref : ''}`)
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', padding:'0 0 60px' }}>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => router.back()}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'13px', padding:0 }}>
          ← Back
        </button>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:GOLD }}>Choose Your Power Level</span>
        <Link href="/login?redirect=/ai-income/choose-plan"
          style={{ marginLeft:'auto', padding:'5px 14px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', fontSize:'12px', color:'rgba(255,255,255,0.6)', textDecoration:'none', fontWeight:700 }}>
          Sign In →
        </Link>
      </div>

      <div style={{ maxWidth:'480px', margin:'0 auto', padding:'20px 16px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px' }}>Step 2 of 2</div>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, margin:'0 0 6px' }}>Choose Your Power Level</h1>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.7 }}>
            Start free. Upgrade anytime. Rocket Mode tiers include AI product creation.
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'16px', justifyContent:'center' }}>
          {[
            { id:'all',      label:'All Tiers' },
            { id:'standard', label:'Standard' },
            { id:'rocket',   label:'🚀 Rocket Mode' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)}
              style={{ padding:'6px 14px', borderRadius:'20px', border:`1px solid ${filter===f.id ? ROCK : 'rgba(255,255,255,0.1)'}`,
                background: filter===f.id ? `${ROCK}18` : 'transparent',
                color: filter===f.id ? ROCK : 'rgba(255,255,255,0.5)',
                fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Tiers */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {visible.map(tier => (
            <div key={tier.id} onClick={() => handleSelect(tier)}
              style={{ border:`2px solid ${tier.highlight ? GOLD : tier.rocket ? `${ROCK}60` : `${tier.color}40`}`,
                borderRadius:'16px', padding:'16px', cursor:'pointer',
                background: tier.highlight ? `${GOLD}08` : tier.rocket ? `${ROCK}06` : 'rgba(255,255,255,0.03)',
                position:'relative', transition:'all 0.2s' }}>

              {tier.highlight && (
                <div style={{ position:'absolute', top:'-11px', left:'50%', transform:'translateX(-50%)', background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:'#1E1245', fontSize:'10px', fontWeight:900, padding:'3px 14px', borderRadius:'20px', whiteSpace:'nowrap' as const }}>
                  ⭐ MOST POPULAR
                </div>
              )}
              {tier.rocket && (
                <div style={{ position:'absolute', top:'-11px', right:'16px', background:`linear-gradient(135deg,${ROCK},#E55A2B)`, color:'#fff', fontSize:'10px', fontWeight:900, padding:'3px 12px', borderRadius:'20px' }}>
                  🚀 INCLUDES ROCKET
                </div>
              )}

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <div>
                  <span style={{ fontSize:'10px', fontWeight:700, color:tier.rocket ? ROCK : tier.color, letterSpacing:'1px', display:'block', marginBottom:'2px' }}>{tier.badge}</span>
                  <div style={{ fontSize:'16px', fontWeight:900, color:W, fontFamily:'Cinzel,Georgia,serif' }}>{tier.name}</div>
                </div>
                <div style={{ textAlign:'right' as const }}>
                  <div style={{ fontSize:'18px', fontWeight:900, color: tier.rocket ? ROCK : tier.color }}>{tier.label}</div>
                  {tier.price > 0 && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>once-off</div>}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'3px', marginBottom:'12px' }}>
                {tier.features.map(f => (
                  <div key={f} style={{ fontSize:'11px', color:'rgba(255,255,255,0.65)', display:'flex', gap:'5px', alignItems:'flex-start' }}>
                    <span style={{ color: tier.rocket ? ROCK : tier.color, flexShrink:0 }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <button onClick={e => { e.stopPropagation(); handleSelect(tier) }}
                style={{ width:'100%', padding:'11px', borderRadius:'10px', border:'none', cursor:'pointer',
                  background: tier.price === 0 ? 'linear-gradient(135deg,#059669,#047857)'
                    : tier.rocket ? `linear-gradient(135deg,${ROCK},#E55A2B)`
                    : tier.highlight ? `linear-gradient(135deg,${GOLD},#B8860B)`
                    : `${tier.color}22`,
                  color: tier.price === 0 || tier.rocket || tier.highlight ? '#fff' : tier.color,
                  fontSize:'13px', fontWeight:700, fontFamily: tier.rocket || tier.highlight ? 'Cinzel,Georgia,serif' : 'Georgia,serif',
                  border: (!tier.price || tier.rocket || tier.highlight) ? 'none' : `1px solid ${tier.color}60` }}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* 9 income streams note */}
        <div style={{ marginTop:'20px', padding:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', textAlign:'center' as const }}>
          <div style={{ fontSize:'12px', color:GOLD, fontWeight:700, marginBottom:'4px' }}>9 Income Streams Available</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>
            NSB · ISP · QPB · TSC · TLI · CEO Competition · CEO Awards<br/>
            + Marketplace Income (90%) · + Distribution Rights (Platinum)
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:'12px', fontSize:'11px', color:'rgba(255,255,255,0.3)', lineHeight:1.7 }}>
          All prices in ZAR · BFM activates after 60 days · Cancel anytime<br/>
          <Link href="/compensation" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'underline' }}>View full compensation plan →</Link>
        </div>
      </div>
    </div>
  )
}

export default function ChoosePlan() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <ChoosePlanInner />
    </Suspense>
  )
}
