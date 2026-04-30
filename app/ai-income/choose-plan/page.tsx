'use client'
// FILE: app/ai-income/choose-plan/page.tsx

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const SURF2 = '#111D35'
const GOLD  = '#F59E0B'
const BLUE  = '#3B82F6'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const VIO2  = '#A78BFA'
const W     = '#F0F9FF'
const MUTED = '#94A3B8'
const GREEN = '#10B981'
const BORDER= '#1E3A5F'
const ORANGE= '#F97316'

const TIERS = [
  { id:'starter',  label:'Starter',          price:500,   currency:'R', color:GREEN,  icon:'🚗', vehicle:'Manual',    desc:'Your deployment begins here. First income in 14 days.',
    features:['Offer Generator','Customer Finder','Post Creator','Closing Scripts','Marketplace listing','NSB income stream','Coach Manlaw basic'] },
  { id:'bronze',   label:'Bronze',           price:2500,  currency:'R', color:'#CD7F32', icon:'🚗', vehicle:'Manual+', desc:'Manual tools plus team building and ISP tracking.',
    features:['All Starter tools','Team Builder Script','ISP Calculator','Product Idea Generator','NSB + ISP income','Self-Discovery tool'] },
  { id:'copper',   label:'Copper',           price:5000,  currency:'R', color:'#B87333', icon:'🚗', vehicle:'Manual Pro', desc:'Full Manual suite plus Influencer Partnership Engine.',
    features:['All Bronze tools','Advanced Targeting','Influencer Engine (3/mo)','Partnership proposals','DM outreach scripts','NSB + ISP + TSC'] },
  { id:'silver',   label:'Silver',           price:12000, currency:'R', color:'#C0C0C0', icon:'⚙️', vehicle:'Automatic', desc:'The system works with you — 7 automation tools.',
    features:['7-Tool Automatic Dashboard','Content Machine','Digital Twin setup','7-Day Launch System','Auto Follow-Up','Influencer Engine (5/mo)','All income streams'] },
  { id:'gold',     label:'Gold',             price:32000, currency:'R', color:GOLD,   icon:'⚡', vehicle:'Electric', desc:'AI creates digital products. You list and earn.',
    features:['20 Product Type Creator','AI-powered product creation','Z2B Marketplace listing','Influencer Engine (10/mo)','Product + Launch copy','All income streams'] },
  { id:'platinum', label:'Platinum',         price:58000, currency:'R', color:CYAN,   icon:'⚡', vehicle:'Electric Pro', desc:'Unlimited creation. Distribution Rights unlocked.',
    features:['Unlimited product creation','Distribution Rights','CEO Competition eligible','Own Marketplace','Bulk product creation','All income streams'] },
  { id:'silver_rocket', label:'Silver Rocket', price:25500, currency:'R', color:ORANGE, icon:'🚀', vehicle:'Rocket', desc:'Rocket Mode — AI creates. Market distributes.',
    features:['12 products/month','All Automatic tools','Rocket Mode access','AI market research','Marketplace + Affiliate','All income streams'] },
  { id:'gold_rocket',   label:'Gold Rocket',   price:52500, currency:'R', color:ORANGE, icon:'🚀', vehicle:'Rocket Pro', desc:'Scale without limits across global markets.',
    features:['30 products/month','AI website builder','Sell anywhere externally','Global market targeting','Influencer Engine (10/mo)','All income streams'] },
  { id:'platinum_rocket',label:'Platinum Rocket',price:105000,currency:'R',color:ORANGE,icon:'🚀', vehicle:'Rocket Max', desc:'Unlimited. Unstoppable. The full Z2B arsenal.',
    features:['Unlimited products','Own branded marketplace','Bulk AI creation','Full Distribution Rights','CEO Competition elite','All income streams'] },
]

function ChoosePlanInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<string|null>(null)

  const pay = (tierId: string) => {
    router.push(`/pay?tier=${tierId}`)
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      <style>{`*{box-sizing:border-box}a{text-decoration:none}@keyframes glow{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>

      {/* Nav */}
      <nav style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'10px', borderBottom:`1px solid ${BORDER}`, background:`${BG}EE`, backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <Link href="/ai-income" style={{ fontSize:'12px', color:MUTED }}>← 4M Machine</Link>
        <span style={{ color:BORDER }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:GOLD }}>Your Deployment Starts Here</span>
        <Link href="/login?redirect=/ai-income/choose-plan" style={{ marginLeft:'auto', padding:'7px 16px', background:`${GOLD}15`, border:`1px solid ${GOLD}40`, borderRadius:'20px', color:GOLD, fontSize:'12px', fontWeight:700 }}>
          Sign In →
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'48px 20px 32px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at center,${GOLD}08 0%,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>⚡ Deploy Yourself</div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,4vw,42px)', fontWeight:900, color:W, marginBottom:'12px' }}>
            Choose Your Deployment Level
          </div>
          <p style={{ fontSize:'15px', color:MUTED, maxWidth:'500px', margin:'0 auto 12px', lineHeight:1.7 }}>
            Every level unlocks more tools, more income streams and more of the 4M Machine. Start where you are. Grow from there.
          </p>
          <div style={{ fontSize:'13px', color:GOLD, fontWeight:700 }}>
            ✦ Starter Pack builders can list digital products on the Z2B Marketplace
          </div>
        </div>
      </div>

      {/* Vehicle group headers */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 16px 60px' }}>
        {[
          { vehicle:'Manual', icon:'🚗', color:VIO, tiers:['starter','bronze','copper'], headline:'Learn to sell. Build your foundation.', desc:'First income in 14 days. No quitting your job.' },
          { vehicle:'Automatic', icon:'⚙️', color:BLUE, tiers:['silver'], headline:'Let the system work with you.', desc:'7 AI tools automate your business while you grow.' },
          { vehicle:'Electric', icon:'⚡', color:GOLD, tiers:['gold','platinum'], headline:'Create once. Sell forever.', desc:'AI builds digital products. Marketplace distributes them.' },
          { vehicle:'Rocket', icon:'🚀', color:ORANGE, tiers:['silver_rocket','gold_rocket','platinum_rocket'], headline:'Your income needs no permission.', desc:'Unlimited. Global. Unstoppable.' },
        ].map(group => (
          <div key={group.vehicle} style={{ marginBottom:'48px' }}>
            {/* Group header */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', padding:'14px 20px', background:SURF, border:`1px solid ${group.color}30`, borderRadius:'14px' }}>
              <span style={{ fontSize:'24px' }}>{group.icon}</span>
              <div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:group.color }}>{group.vehicle} Mode</div>
                <div style={{ fontSize:'12px', color:MUTED }}>{group.headline} · {group.desc}</div>
              </div>
            </div>

            {/* Tier cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'14px' }}>
              {TIERS.filter(t => group.tiers.includes(t.id)).map(tier => (
                <div key={tier.id}
                  onClick={() => setSelected(tier.id)}
                  style={{ background:`linear-gradient(145deg,${SURF},${SURF2})`,
                    border:`2px solid ${selected===tier.id ? tier.color : BORDER}`,
                    borderRadius:'18px', padding:'24px', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden',
                    boxShadow: selected===tier.id ? `0 0 30px ${tier.color}25` : 'none' }}>

                  <div style={{ position:'absolute', top:0, right:0, width:'100px', height:'100px', background:`radial-gradient(circle,${tier.color}15 0%,transparent 70%)`, pointerEvents:'none' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${tier.color},transparent)` }} />

                  <div style={{ fontSize:'10px', color:tier.color, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>{tier.vehicle}</div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'4px' }}>{tier.label}</div>
                  <div style={{ fontSize:'12px', color:MUTED, marginBottom:'16px', lineHeight:1.5 }}>{tier.desc}</div>

                  <div style={{ marginBottom:'16px' }}>
                    <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900,
                      background:`linear-gradient(135deg,${tier.color},${GOLD2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      {tier.currency}{(tier.price/100).toFixed(0)}
                    </span>
                    <span style={{ fontSize:'12px', color:MUTED }}> /month</span>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'20px' }}>
                    {tier.features.map(f => (
                      <div key={f} style={{ display:'flex', gap:'8px', fontSize:'12px', color:'rgba(255,255,255,0.75)' }}>
                        <span style={{ color:tier.color, fontWeight:700, flexShrink:0 }}>✦</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={e => { e.stopPropagation(); pay(tier.id) }}
                    style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', fontFamily:'Cinzel,Georgia,serif', fontWeight:900, fontSize:'13px', cursor:'pointer',
                      background:`linear-gradient(135deg,${tier.color},${tier.color}BB)`,
                      color: tier.id==='gold'||tier.id==='gold_rocket'||tier.id==='silver_rocket' ? '#050A18' : '#fff',
                      boxShadow: selected===tier.id ? `0 0 20px ${tier.color}40` : 'none' }}>
                    Deploy at {tier.label} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Revenue reminder */}
        <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}25`, borderRadius:'16px', padding:'24px', textAlign:'center' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:GOLD, marginBottom:'10px' }}>
            Every tier includes Marketplace access from Starter
          </div>
          <div style={{ fontSize:'13px', color:MUTED, lineHeight:1.8 }}>
            Direct sale: You keep 90% · Affiliate-driven: You keep 70% · Z2B takes 10% always<br/>
            Marketplace product sales never cascade to your upline — you keep what you make
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChoosePlan() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#F59E0B', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <ChoosePlanInner />
    </Suspense>
  )
}
