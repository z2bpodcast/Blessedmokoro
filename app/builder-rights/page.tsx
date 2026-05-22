'use client'
// File: app/builder-rights/page.tsx
// Z2B Builder Rights — Clear ownership boundaries

import Link from 'next/link'

const BG   = '#050A18'
const SURF = '#0D1629'
const GOLD = '#D4AF37'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'
const RED  = '#EF4444'

export default function BuilderRightsPage() {
  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding:'12px 20px', background:SURF, borderBottom:`1px solid ${GOLD}20`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/" style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:GOLD, textDecoration:'none' }}>← Z2B Home</Link>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:W, fontWeight:700 }}>Builder Rights</span>
        <Link href="/register" style={{ padding:'7px 16px', borderRadius:8, background:GOLD, color:BG, fontSize:12, fontWeight:900, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
          Start Now →
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'64px 20px 48px', borderBottom:`1px solid ${GOLD}15`, background:`linear-gradient(180deg,${GOLD}08,transparent)` }}>
        <div style={{ fontSize:10, color:GOLD, letterSpacing:5, textTransform:'uppercase', marginBottom:12 }}>
          Zero2Billionaires Legacy Builders
        </div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,5vw,42px)', fontWeight:900, color:W, marginBottom:16, lineHeight:1.1 }}>
          Builder Rights &<br/>
          <span style={{ color:GOLD }}>Ownership Charter</span>
        </h1>
        <p style={{ fontSize:15, color:MUTED, maxWidth:560, margin:'0 auto', lineHeight:1.8 }}>
          At Z2B, we are a service provider — not a co-owner of your business.
          What you build belongs to you. This document exists so there is never any confusion.
        </p>
      </div>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'48px 20px 80px' }}>

        {/* The Golden Rule */}
        <div style={{ padding:'28px 32px', borderRadius:16, background:`${GOLD}08`, border:`2px solid ${GOLD}30`, marginBottom:40, textAlign:'center' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:11, letterSpacing:4, color:GOLD, marginBottom:12, textTransform:'uppercase' }}>
            The Golden Rule
          </div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:W, lineHeight:1.4 }}>
            "Everything you create, build and grow<br/>
            on this platform belongs to <span style={{ color:GOLD }}>you</span>.<br/>
            Z2B is your tool — not your partner."
          </div>
        </div>

        {/* What the builder owns */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>✅</div>
            <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,24px)', fontWeight:900, color:GREEN }}>
              What You Own — 100%
            </h2>
          </div>

          {[
            { icon:'📦', title:'Your Digital Products', desc:'Every product created with the 4M Machine is yours. The intellectual property, the content, the files — all belong to you. Z2B has no claim on your products.' },
            { icon:'🏪', title:'Your PWA Store', desc:'Your store, your brand, your rules. The members who join your store are your members. Their data belongs to you. You set your prices, your payment gateway, your terms.' },
            { icon:'👥', title:'Your Members & Community', desc:'Every person who joins your community, subscribes to your content or purchases from your store is your member — not Z2B\'s. Their relationship is with you.' },
            { icon:'📧', title:'Your Leads & Contact List', desc:'Every email and contact captured through your brand site or store belongs to you. Z2B does not use, sell or contact your leads.' },
            { icon:'🎓', title:'Your Students & Course Content', desc:'Your academy, your courses, your students. The curriculum you build, the lessons you record, the certificates you issue — all yours. Z2B has no access to your academy.' },
            { icon:'🔗', title:'Your Affiliate Network', desc:'The affiliates who promote your products work for you — not Z2B. You set their commission, you pay them directly, you manage the relationship.' },
            { icon:'💰', title:'Your Revenue', desc:'Money paid to you by your members, students and customers goes directly to you. Z2B only earns when you list on the Z2B Marketplace (5% platform fee). Everything else is yours.' },
            { icon:'🎨', title:'Your Brand & Identity', desc:'Your logo, your colors, your name, your story — entirely yours. We provide the infrastructure. You provide the brand.' },
          ].map(item => (
            <div key={item.title} style={{ display:'flex', gap:16, padding:'18px 20px', borderRadius:12, background:SURF, border:'1px solid rgba(16,185,129,0.12)', marginBottom:10 }}>
              <span style={{ fontSize:24, flexShrink:0 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:W, marginBottom:4 }}>{item.title}</div>
                <div style={{ fontSize:13, color:MUTED, lineHeight:1.7 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* What Z2B earns */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:`${GOLD}15`, border:`1px solid ${GOLD}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>⚙️</div>
            <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,24px)', fontWeight:900, color:GOLD }}>
              What Z2B Provides & Earns
            </h2>
          </div>

          {[
            { icon:'🔧', title:'4M Machine Access', desc:'We provide the AI-powered Digital Products Factory. You pay through your tier membership and monthly BFM (Business Fuel Maintenance). The tool is yours to use — the products you create are yours to own.' },
            { icon:'🏗️', title:'PWA Infrastructure', desc:'We host and maintain your PWA store, brand site, academy and affiliate network. Your BFM covers the infrastructure costs.' },
            { icon:'🏪', title:'Marketplace Listing', desc:'When you choose to list your products on the Z2B Marketplace, we earn 5% of each sale. This is the only time Z2B earns from your product sales.' },
            { icon:'💼', title:'Compensation Plan', desc:'Z2B runs its own compensation plan (ISP, TSC, TLI, CEO Awards) for membership sales — this is separate from your product business. Your tier membership and BFM fund these earnings across the network.' },
            { icon:'⛽', title:'Business Fuel Maintenance (BFM)', desc:'BFM is your monthly operational fee that covers AI production costs, platform hosting and infrastructure. It starts on day 61 after each tier upgrade. Without BFM, team earnings pause — but your products and store remain yours.' },
          ].map(item => (
            <div key={item.title} style={{ display:'flex', gap:16, padding:'18px 20px', borderRadius:12, background:SURF, border:`1px solid ${GOLD}12`, marginBottom:10 }}>
              <span style={{ fontSize:24, flexShrink:0 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:W, marginBottom:4 }}>{item.title}</div>
                <div style={{ fontSize:13, color:MUTED, lineHeight:1.7 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* What Z2B will NEVER do */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🚫</div>
            <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,24px)', fontWeight:900, color:'#FCA5A5' }}>
              What Z2B Will Never Do
            </h2>
          </div>

          {[
            'Claim ownership of your digital products',
            'Contact your members, students or leads without your permission',
            'Sell or share your customer data with third parties',
            'Take a cut of sales made through your own PWA store',
            'Interfere with your affiliate relationships or commissions',
            'Modify or remove your content without cause',
            'Use your brand or name for Z2B marketing without consent',
          ].map(item => (
            <div key={item} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:10, background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.12)', marginBottom:8 }}>
              <span style={{ color:'#FCA5A5', fontSize:14, flexShrink:0 }}>✗</span>
              <span style={{ fontSize:13, color:`${W}cc`, lineHeight:1.6 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Summary table */}
        <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${GOLD}20`, marginBottom:40 }}>
          <div style={{ height:3, background:`linear-gradient(90deg,${GOLD},#f0c040,${GOLD})` }} />
          <div style={{ padding:'20px 24px', background:SURF, borderBottom:`1px solid ${GOLD}15` }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:16, fontWeight:900, color:W }}>Quick Reference</div>
          </div>
          {[
            { item:'Digital products you create',     builder:'✅ 100% yours',         z2b:'❌ No claim'             },
            { item:'Your PWA store revenue',          builder:'✅ 100% yours',         z2b:'❌ No cut'              },
            { item:'Z2B Marketplace revenue',         builder:'✅ 75% yours',          z2b:'5% platform fee'        },
            { item:'Your members data',               builder:'✅ 100% yours',         z2b:'❌ No access'           },
            { item:'Your course content',             builder:'✅ 100% yours',         z2b:'❌ No claim'             },
            { item:'Your leads',                      builder:'✅ 100% yours',         z2b:'❌ Never contacted'      },
            { item:'Your affiliate commissions',      builder:'✅ You set & pay',      z2b:'❌ Not involved'         },
            { item:'Membership sales commission',     builder:'✅ ISP/TSC/TLI earned', z2b:'Platform compensation'  },
            { item:'BFM monthly fee',                 builder:'You pay from day 61',   z2b:'Covers infrastructure'  },
          ].map((row, i) => (
            <div key={row.item} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'12px 24px', background: i%2===0 ? 'rgba(255,255,255,0.01)' : 'transparent', borderBottom:`1px solid ${GOLD}08` }}>
              <span style={{ fontSize:12, color:`${W}80` }}>{row.item}</span>
              <span style={{ fontSize:12, color:GREEN, fontWeight:700 }}>{row.builder}</span>
              <span style={{ fontSize:12, color:MUTED }}>{row.z2b}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign:'center', padding:'40px 24px', borderRadius:16, background:`${GOLD}06`, border:`1px solid ${GOLD}20` }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,28px)', fontWeight:900, color:W, marginBottom:12 }}>
            Build Your Business.<br/>
            <span style={{ color:GOLD }}>Own Every Piece of It.</span>
          </div>
          <p style={{ fontSize:14, color:MUTED, marginBottom:28, lineHeight:1.8, maxWidth:480, margin:'0 auto 28px' }}>
            Z2B gives you the tools, the infrastructure and the marketplace.
            You bring the knowledge, the hustle and the vision.
            Everything you build is yours.
          </p>
          <Link href="/register"
            style={{ display:'inline-block', padding:'14px 36px', borderRadius:12, background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:BG, fontWeight:900, fontSize:15, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            Start Building →
          </Link>
        </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${GOLD}15`, padding:'20px', textAlign:'center', fontSize:11, color:MUTED }}>
        Zero2Billionaires Legacy Builders · app.z2blegacybuilders.co.za ·{' '}
        <a href="mailto:support@z2blegacybuilders.co.za" style={{ color:GOLD, textDecoration:'none' }}>support@z2blegacybuilders.co.za</a>
      </div>
    </div>
  )
}
