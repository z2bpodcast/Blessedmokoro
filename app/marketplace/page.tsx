'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Product = {
  id: string; name: string; tagline: string; description: string
  category: string; price_monthly: number | null; price_once: number | null
  badge: string | null; icon: string; color: string
  is_active: boolean; is_coming_soon: boolean; features: string[]; slug: string
}

const FEATURED: Product[] = [{
  id:'cs-plus', name:'Content Studio+',
  tagline:'Your AI content engine — create a week of posts in minutes',
  description:'Fully automated content creation powered by Z2B workshop material.',
  category:'app', price_monthly:297, price_once:null, badge:'NEW', icon:'🤖', color:'#7C3AED',
  is_active:true, is_coming_soon:false, slug:'cs-plus',
  features:['AI posts from 99 workshop sessions','Text · Image · Video script formats','Batch create up to 7 posts at once','Built-in content scheduler','Facebook + TikTok captions','Referral link auto-included in every post'],
}]

const COMING_SOON: Product[] = [
  {id:'caption-packs',name:'Caption Template Packs',tagline:'30 ready-to-use captions per pack',description:'',category:'template',price_monthly:null,price_once:97,badge:'Soon',icon:'✍️',color:'#D4AF37',is_active:false,is_coming_soon:true,features:[],slug:'caption-packs'},
  {id:'poster-packs',name:'Poster Template Packs',tagline:'Premium branded poster collections',description:'',category:'template',price_monthly:null,price_once:147,badge:'Soon',icon:'🎨',color:'#E11D48',is_active:false,is_coming_soon:true,features:[],slug:'poster-packs'},
  {id:'biz-planner',name:'Builder Business Planner',tagline:'Monthly planning tool for serious builders',description:'',category:'tool',price_monthly:null,price_once:197,badge:'Soon',icon:'📊',color:'#059669',is_active:false,is_coming_soon:true,features:[],slug:'biz-planner'},
  {id:'advanced-training',name:'Advanced Training',tagline:'Deep-dive coaching beyond the 99 sessions',description:'',category:'course',price_monthly:397,price_once:null,badge:'Soon',icon:'🎓',color:'#0EA5E9',is_active:false,is_coming_soon:true,features:[],slug:'advanced-training'},
  {id:'dfy-service',name:'Done-For-You Service',tagline:'We set up your full Z2B system for you',description:'',category:'service',price_monthly:null,price_once:1997,badge:'Soon',icon:'💼',color:'#F59E0B',is_active:false,is_coming_soon:true,features:[],slug:'dfy-service'},
  {id:'voice-clone',name:'Voice & Avatar Studio',tagline:'Clone your voice. Create your AI avatar.',description:'',category:'app',price_monthly:997,price_once:null,badge:'Phase 2',icon:'🎙️',color:'#9333EA',is_active:false,is_coming_soon:true,features:[],slug:'voice-clone'},
]

const CATS = ['all','app','tool','template','course','service']
const CAT_LABEL: Record<string,string> = {all:'All Products',app:'Apps',tool:'Tools',template:'Templates',course:'Courses',service:'Services'}

export default function MarketplacePage() {
  const [filter, setFilter] = useState('all')
  const [adminProducts, setAdminProducts] = useState<Product[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
    supabase.from('marketplace_products').select('*').eq('is_active', true)
      .then(({ data }) => { if (data) setAdminProducts(data) })
  }, [])

  const allActive = [...FEATURED, ...adminProducts.filter(p => !p.is_coming_soon)]
  const filtered  = filter === 'all' ? allActive : allActive.filter(p => p.category === filter)

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818 0%,#0D0A1E 50%,#110E24 100%)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid rgba(212,175,55,0.15)', background:'rgba(0,0,0,0.35)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px', fontWeight:700, color:'#D4AF37', letterSpacing:'4px' }}>Z2B</span>
          <span style={{ fontSize:'11px', color:'rgba(212,175,55,0.5)', letterSpacing:'2px' }}>MARKETPLACE</span>
        </Link>
        <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
          <Link href="/dashboard" style={{ fontSize:'13px', color:'rgba(196,181,253,0.7)', textDecoration:'none' }}>Dashboard</Link>
          <Link href="/workshop" style={{ fontSize:'13px', color:'rgba(196,181,253,0.7)', textDecoration:'none' }}>Workshop</Link>
          {profile && <div style={{ fontSize:'12px', color:'#D4AF37', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'4px 14px' }}>{profile.full_name?.split(' ')[0]} · {(profile.paid_tier||'FAM').toUpperCase()}</div>}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'64px 24px 48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'600px', height:'300px', background:'radial-gradient(ellipse,rgba(124,58,237,0.14) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ width:'48px', height:'3px', background:'linear-gradient(90deg,#D4AF37,#F5D060)', borderRadius:'2px', margin:'0 auto 24px' }} />
        <h1 style={{ fontSize:'clamp(28px,5vw,52px)', fontWeight:700, color:'#fff', margin:'0 0 16px', lineHeight:1.2 }}>
          The Z2B <span style={{ color:'#D4AF37' }}>Marketplace</span>
        </h1>
        <p style={{ fontSize:'16px', color:'rgba(196,181,253,0.8)', maxWidth:'520px', margin:'0 auto 12px', lineHeight:1.7 }}>
          Premium apps, tools, templates and services — curated by Rev Mokoro Manana to accelerate your Entrepreneurial Consumer journey.
        </p>
        <p style={{ fontSize:'13px', color:'rgba(212,175,55,0.45)', fontStyle:'italic' }}>#Reka_Obesa_Okatuka — We build the Banquet together</p>
      </div>

      {/* Category filters */}
      <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap', padding:'0 24px 44px' }}>
        {CATS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding:'8px 20px', borderRadius:'20px', cursor:'pointer',
            fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, letterSpacing:'0.5px',
            transition:'all 0.2s',
            background: filter===cat ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
            border: filter===cat ? '1.5px solid #D4AF37' : '1.5px solid rgba(255,255,255,0.08)',
            color: filter===cat ? '#D4AF37' : 'rgba(255,255,255,0.45)',
          }}>
            {CAT_LABEL[cat]}
          </button>
        ))}
      </div>

      {/* Products */}
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 24px 80px' }}>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'rgba(196,181,253,0.4)' }}>No products in this category yet.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'24px' }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Coming Soon */}
        {filter === 'all' && (
          <>
            <div style={{ margin:'64px 0 32px', display:'flex', alignItems:'center', gap:'16px' }}>
              <div style={{ flex:1, height:'1px', background:'rgba(212,175,55,0.12)' }} />
              <span style={{ fontSize:'11px', color:'rgba(212,175,55,0.45)', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase' }}>Coming Soon</span>
              <div style={{ flex:1, height:'1px', background:'rgba(212,175,55,0.12)' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'14px' }}>
              {COMING_SOON.map(p => <ComingSoonCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop:'1px solid rgba(212,175,55,0.08)', padding:'32px 24px', textAlign:'center' }}>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.18)', margin:0 }}>Z2B Table Banquet Marketplace · Zero2Billionaires Amavulandlela Pty Ltd</p>
        <p style={{ fontSize:'11px', color:'rgba(212,175,55,0.3)', margin:'4px 0 0', fontStyle:'italic' }}>#Reka_Obesa_Okatuka</p>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background:'linear-gradient(160deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.02) 100%)',
      border: hovered ? `1.5px solid ${product.color}` : '1.5px solid rgba(255,255,255,0.08)',
      borderRadius:'20px', overflow:'hidden', transition:'all 0.25s',
      transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      boxShadow: hovered ? `0 20px 48px rgba(0,0,0,0.45), 0 0 0 1px ${product.color}18` : '0 4px 20px rgba(0,0,0,0.2)',
    }}>
      <div style={{ height:'4px', background:`linear-gradient(90deg,${product.color},${product.color}66)` }} />
      <div style={{ padding:'28px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'18px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:`${product.color}18`, border:`1.5px solid ${product.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px' }}>
            {product.icon}
          </div>
          {product.badge && (
            <div style={{ background:`${product.color}20`, border:`1px solid ${product.color}55`, borderRadius:'20px', padding:'4px 12px', fontSize:'11px', fontWeight:700, color:product.color, letterSpacing:'0.5px' }}>
              {product.badge}
            </div>
          )}
        </div>
        <h3 style={{ fontSize:'20px', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>{product.name}</h3>
        <p style={{ fontSize:'13px', color:'rgba(196,181,253,0.7)', margin:'0 0 18px', lineHeight:1.6 }}>{product.tagline}</p>
        {product.features.length > 0 && (
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 24px' }}>
            {product.features.map((f,i) => (
              <li key={i} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'rgba(255,255,255,0.65)', marginBottom:'6px' }}>
                <span style={{ color:product.color, fontSize:'10px' }}>◆</span>{f}
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginBottom:'20px' }}>
          {product.price_monthly && <div><span style={{ fontSize:'34px', fontWeight:700, color:'#D4AF37' }}>R{product.price_monthly}</span><span style={{ fontSize:'14px', color:'rgba(255,255,255,0.38)', marginLeft:'4px' }}>/month</span></div>}
          {product.price_once && <div><span style={{ fontSize:'34px', fontWeight:700, color:'#D4AF37' }}>R{product.price_once}</span><span style={{ fontSize:'14px', color:'rgba(255,255,255,0.38)', marginLeft:'4px' }}>once-off</span></div>}
        </div>
        <Link href={`/marketplace/${product.slug}`} style={{ display:'block', textAlign:'center', padding:'14px', background:`linear-gradient(135deg,${product.color},${product.color}bb)`, borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
          Get {product.name} →
        </Link>
      </div>
    </div>
  )
}

function ComingSoonCard({ product }: { product: Product }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'18px 20px', display:'flex', alignItems:'center', gap:'14px', opacity:0.65 }}>
      <div style={{ width:'42px', height:'42px', borderRadius:'11px', background:`${product.color}12`, border:`1px solid ${product.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{product.icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:'2px' }}>{product.name}</div>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', lineHeight:1.5 }}>{product.tagline}</div>
      </div>
      <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.5px', color:product.color, background:`${product.color}15`, border:`1px solid ${product.color}28`, borderRadius:'10px', padding:'4px 10px', flexShrink:0 }}>{product.badge}</div>
    </div>
  )
}
