// File: app/store/[slug]/page.tsx
// Z2B Builder PWA Storefront — Phase 1 Complete
// Features: Store · Payment · Social Feed · Members · Affiliate · Admin · PWA Install
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── TYPES ─────────────────────────────────────────────────────
interface PWA {
  id: string
  builder_id: string
  slug: string
  display_name: string
  tagline: string
  about: string
  accent_color: string
  logo_url: string
  banner_url: string
  yoco_public_key: string
  community_enabled: boolean
  community_paid: boolean
  community_price: number
  is_live: boolean
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  retail_price: number
  price_once?: number
  format: string
  cover_url: string
  file_url: string
  is_free: boolean
}

interface Post {
  id: string
  author_name: string
  author_avatar: string
  content: string
  image_url: string
  audio_url: string
  created_at: string
  likes: number
}

type Tab = 'store' | 'feed' | 'members' | 'admin'
type ModalType = 'payment' | 'login' | 'post' | null

// ── SQL FOR SUPABASE (run once) ────────────────────────────────
// ALTER TABLE builder_pwas ADD COLUMN IF NOT EXISTS yoco_public_key text;
// ALTER TABLE builder_pwas ADD COLUMN IF NOT EXISTS logo_url text;
// ALTER TABLE builder_pwas ADD COLUMN IF NOT EXISTS banner_url text;
// ALTER TABLE builder_pwas ADD COLUMN IF NOT EXISTS nedbank_account text;
// ALTER TABLE builder_pwas ADD COLUMN IF NOT EXISTS nedbank_name text;
// ALTER TABLE builder_pwas ADD COLUMN IF NOT EXISTS nedbank_branch text DEFAULT '198765';
//
// CREATE TABLE IF NOT EXISTS pwa_posts (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   pwa_id uuid NOT NULL,
//   author_id uuid,
//   author_name text,
//   author_avatar text,
//   content text,
//   image_url text,
//   audio_url text,
//   likes integer DEFAULT 0,
//   created_at timestamptz DEFAULT now()
// );
//
// CREATE TABLE IF NOT EXISTS pwa_members (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   pwa_id uuid NOT NULL,
//   user_id uuid,
//   email text NOT NULL,
//   name text,
//   ref_code text,
//   status text DEFAULT 'active',
//   joined_at timestamptz DEFAULT now()
// );
//
// CREATE TABLE IF NOT EXISTS pwa_sales (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   pwa_id uuid NOT NULL,
//   product_id uuid,
//   buyer_email text,
//   buyer_name text,
//   amount numeric(10,2),
//   affiliate_ref text,
//   commission_amount numeric(10,2) DEFAULT 0,
//   payment_method text,
//   status text DEFAULT 'pending',
//   created_at timestamptz DEFAULT now()
// );
//
// CREATE TABLE IF NOT EXISTS pwa_affiliates (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   pwa_id uuid NOT NULL,
//   member_id uuid,
//   ref_code text UNIQUE NOT NULL,
//   email text,
//   name text,
//   total_sales integer DEFAULT 0,
//   total_earned numeric(10,2) DEFAULT 0,
//   status text DEFAULT 'active',
//   created_at timestamptz DEFAULT now()
// );

function StoreInner() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const slug         = params.slug as string
  const refCode      = searchParams.get('ref') ?? ''

  const [pwa,        setPwa]        = useState<PWA | null>(null)
  const [products,   setProducts]   = useState<Product[]>([])
  const [posts,      setPosts]      = useState<Post[]>([])
  const [user,       setUser]       = useState<any>(null)
  const [isBuilder,  setIsBuilder]  = useState(false)
  const [isMember,   setIsMember]   = useState(false)
  const [tab,        setTab]        = useState<Tab>('store')
  const [modal,      setModal]      = useState<ModalType>(null)
  const [selProduct, setSelProduct] = useState<Product | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)

  // Payment form
  const [buyerName,  setBuyerName]  = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [payMethod,  setPayMethod]  = useState<'yoco'|'eft'|'atm'>('yoco')
  const [payLoading, setPayLoading] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)
  const [eftRef,     setEftRef]     = useState('')

  // Post form
  const [postText,   setPostText]   = useState('')
  const [postImg,    setPostImg]    = useState('')
  const [postLoading,setPostLoading]= useState(false)

  // Admin
  const [adminTab,   setAdminTab]   = useState<'products'|'members'|'sales'|'affiliates'|'settings'>('products')
  const [members,    setMembers]    = useState<any[]>([])
  const [sales,      setSales]      = useState<any[]>([])
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [settings,   setSettings]   = useState<Partial<PWA>>({})
  const [saveMsg,    setSaveMsg]    = useState('')

  const accent = pwa?.accent_color ?? '#D4AF37'
  const BG     = '#050A18'
  const SURF   = '#0D1629'
  const W      = '#F0F9FF'
  const MUTED  = '#64748B'

  // ── PWA INSTALL ─────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    })
  }, [])

  async function installPWA() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setCanInstall(false)
  }

  // ── DYNAMIC MANIFEST ─────────────────────────────────────────
  useEffect(() => {
    if (!pwa) return
    const manifest = {
      name:             pwa.display_name,
      short_name:       pwa.display_name.slice(0, 12),
      start_url:        `/store/${pwa.slug}`,
      display:          'standalone',
      background_color: '#050A18',
      theme_color:      pwa.accent_color ?? '#D4AF37',
      icons: [
        { src: pwa.logo_url || '/logo-z2b.png', sizes: '192x192', type: 'image/png' },
        { src: pwa.logo_url || '/logo-z2b.png', sizes: '512x512', type: 'image/png' },
      ],
    }
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('link')
    link.rel   = 'manifest'
    link.href  = url
    document.head.appendChild(link)
    return () => { document.head.removeChild(link); URL.revokeObjectURL(url) }
  }, [pwa])

  // ── LOAD DATA ────────────────────────────────────────────────
  useEffect(() => {
    loadAll()
  }, [slug])

  async function loadAll() {
    setLoading(true)
    const sb = supabase as any

    // Load PWA
    const { data: pwaData } = await sb.from('builder_pwas')
      .select('*').eq('slug', slug).eq('is_live', true).maybeSingle()

    if (!pwaData) { setNotFound(true); setLoading(false); return }
    setPwa(pwaData)
    setSettings(pwaData)

    // Load products
    const { data: prods } = await sb.from('marketplace_products')
      .select('id, title, description, retail_price, price_once, price, format, cover_url, file_url, is_free')
      .eq('seller_id', pwaData.builder_id)
      .eq('status', 'listed')
      .order('created_at', { ascending: false })
      .limit(50)
    setProducts(prods ?? [])

    // Load posts
    const { data: postsData } = await sb.from('pwa_posts')
      .select('*').eq('pwa_id', pwaData.id)
      .order('created_at', { ascending: false }).limit(30)
    setPosts(postsData ?? [])

    // Check auth
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      setUser(u)
      setIsBuilder(u.id === pwaData.builder_id)
      // Check membership
      const { data: mem } = await sb.from('pwa_members')
        .select('id').eq('pwa_id', pwaData.id).eq('user_id', u.id).maybeSingle()
      setIsMember(!!mem)
    }

    // Load admin data if builder
    if (pwaData.builder_id) {
      const [memRes, salesRes, affRes] = await Promise.all([
        sb.from('pwa_members').select('*').eq('pwa_id', pwaData.id).order('joined_at', { ascending: false }),
        sb.from('pwa_sales').select('*').eq('pwa_id', pwaData.id).order('created_at', { ascending: false }).limit(50),
        sb.from('pwa_affiliates').select('*').eq('pwa_id', pwaData.id).order('total_earned', { ascending: false }),
      ])
      setMembers(memRes.data ?? [])
      setSales(salesRes.data ?? [])
      setAffiliates(affRes.data ?? [])
    }

    setLoading(false)
  }

  function getPrice(p: Product): number {
    return p.retail_price ?? p.price_once ?? p.price ?? 0
  }

  function copyRef() {
    const link = `${window.location.origin}/store/${slug}?ref=${user?.id?.slice(0,8) ?? 'share'}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ── PAYMENT ──────────────────────────────────────────────────
  async function handlePay() {
    if (!selProduct || !buyerName || !buyerEmail) return
    setPayLoading(true)
    const price   = getPrice(selProduct)
    const sb      = supabase as any
    const newRef  = 'Z2B-' + Date.now().toString().slice(-8)

    if (payMethod === 'yoco' && pwa?.yoco_public_key) {
      // Load Yoco SDK
      const script    = document.createElement('script')
      script.src      = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
      script.onload   = () => {
        const yoco = new (window as any).YocoSDK({ publicKey: pwa.yoco_public_key })
        yoco.showPopup({
          amountInCents: price * 100,
          currency:      'ZAR',
          name:          selProduct.title,
          callback:      async (result: any) => {
            if (result.error) { alert('Payment failed: ' + result.error.message); setPayLoading(false); return }
            await recordSale('yoco', newRef, 'paid')
            setPaySuccess(true)
            setPayLoading(false)
          }
        })
      }
      document.head.appendChild(script)
    } else if (payMethod === 'eft' || payMethod === 'atm') {
      setEftRef(newRef)
      await recordSale(payMethod, newRef, 'pending')
      setPayLoading(false)
    } else {
      // Z2B default Yoco
      await recordSale(payMethod, newRef, 'pending')
      setPayLoading(false)
      setPaySuccess(true)
    }
  }

  async function recordSale(method: string, ref: string, status: string) {
    const sb      = supabase as any
    const price   = getPrice(selProduct!)
    const comm    = refCode ? price * 0.20 : 0

    await sb.from('pwa_sales').insert({
      pwa_id:           pwa!.id,
      product_id:       selProduct!.id,
      buyer_email:      buyerEmail,
      buyer_name:       buyerName,
      amount:           price,
      affiliate_ref:    refCode || null,
      commission_amount: comm,
      payment_method:   method,
      status,
    })

    // Add as member
    await sb.from('pwa_members').upsert({
      pwa_id: pwa!.id, email: buyerEmail, name: buyerName,
      ref_code: ref, status: 'active', joined_at: new Date().toISOString(),
    }, { onConflict: 'pwa_id,email' })
  }

  // ── POST ─────────────────────────────────────────────────────
  async function handlePost() {
    if (!postText.trim() || !pwa) return
    setPostLoading(true)
    const sb = supabase as any
    const { data: { user: u } } = await supabase.auth.getUser()
    await sb.from('pwa_posts').insert({
      pwa_id:      pwa.id,
      author_id:   u?.id,
      author_name: u?.user_metadata?.full_name ?? 'Builder',
      content:     postText,
      image_url:   postImg || null,
    })
    setPostText('')
    setPostImg('')
    setPostLoading(false)
    setModal(null)
    loadAll()
  }

  // ── SAVE SETTINGS ─────────────────────────────────────────────
  async function saveSettings() {
    if (!pwa) return
    const sb = supabase as any
    await sb.from('builder_pwas').update({
      display_name:    settings.display_name,
      tagline:         settings.tagline,
      about:           settings.about,
      accent_color:    settings.accent_color,
      yoco_public_key: settings.yoco_public_key,
      updated_at:      new Date().toISOString(),
    }).eq('id', pwa.id)
    setSaveMsg('✓ Settings saved!')
    setTimeout(() => setSaveMsg(''), 2500)
    loadAll()
  }

  // ── RENDER ────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:`3px solid ${accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color:accent, fontFamily:'Georgia,serif', fontSize:13 }}>Loading store...</div>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:W, fontFamily:'Georgia,serif', textAlign:'center', padding:20 }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>🏪</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900, marginBottom:8 }}>Store Not Found</div>
        <div style={{ color:MUTED, fontSize:14 }}>This store may not be live yet or the URL is incorrect.</div>
      </div>
    </div>
  )

  const storeUrl  = `${typeof window !== 'undefined' ? window.location.origin : ''}/store/${slug}`
  const myRefLink = `${storeUrl}?ref=${user?.id?.slice(0,8) ?? 'share'}`

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', paddingBottom:80 }}>

      {/* ── DYNAMIC STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }
        input, textarea, select { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${accent}50; border-radius: 2px; }
        .prod-card:hover { border-color: ${accent}50 !important; transform: translateY(-2px); }
        .post-card:hover { border-color: ${accent}30 !important; }
        .tab-bottom-btn { transition: all 0.15s; }
        .tab-bottom-btn:hover { color: ${accent} !important; }
      `}</style>

      {/* ── BANNER / HERO ── */}
      <div style={{
        background: pwa?.banner_url
          ? `url(${pwa.banner_url}) center/cover`
          : `linear-gradient(135deg, ${accent}22 0%, #0D1629 60%, #050A18 100%)`,
        borderBottom: `1px solid ${accent}30`,
        padding: '32px 20px 24px',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Install PWA button */}
        {canInstall && (
          <button onClick={installPWA} style={{ position:'absolute', top:12, right:12, padding:'6px 14px', borderRadius:8, background:accent, color:BG, fontSize:11, fontWeight:900, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
            📲 Install App
          </button>
        )}

        {pwa?.logo_url && (
          <img src={pwa.logo_url} alt={pwa.display_name}
            style={{ width:72, height:72, borderRadius:16, objectFit:'cover', marginBottom:12, border:`2px solid ${accent}50`, boxShadow:`0 8px 24px ${accent}30` }} />
        )}
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(20px,5vw,32px)', fontWeight:900, color:W, marginBottom:6 }}>
          {pwa?.display_name}
        </h1>
        {pwa?.tagline && (
          <p style={{ fontSize:13, color:MUTED, maxWidth:480, margin:'0 auto 16px', lineHeight:1.7 }}>{pwa.tagline}</p>
        )}

        {/* Referral link for members */}
        {user && (
          <button onClick={copyRef}
            style={{ padding:'7px 16px', borderRadius:8, background:`${accent}18`, border:`1px solid ${accent}30`, color:accent, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
            {copied ? '✓ Link Copied!' : '🔗 Copy My Referral Link'}
          </button>
        )}
      </div>

      {/* ── BOTTOM NAV TABS ── */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:`${BG}f0`, backdropFilter:'blur(12px)', borderTop:`1px solid ${accent}20`, display:'flex' }}>
        {[
          { id:'store',   icon:'🛍️', label:'Store'   },
          { id:'feed',    icon:'📣', label:'Feed'    },
          { id:'members', icon:'👥', label:'Members' },
          ...(isBuilder ? [{ id:'admin', icon:'⚙️', label:'Admin' }] : []),
        ].map((t: any) => (
          <button key={t.id} className="tab-bottom-btn"
            onClick={() => setTab(t.id as Tab)}
            style={{ flex:1, padding:'10px 4px 8px', border:'none', cursor:'pointer', background:'transparent', color: tab===t.id ? accent : MUTED, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            <span style={{ fontSize:20 }}>{t.icon}</span>
            <span style={{ fontSize:9, letterSpacing:1, fontWeight: tab===t.id ? 700 : 400 }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* ══ TAB: STORE ══════════════════════════════════════════ */}
      {tab === 'store' && (
        <div style={{ maxWidth:680, margin:'0 auto', padding:'24px 16px' }}>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>
            {products.length} Digital Product{products.length !== 1 ? 's' : ''}
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', color:MUTED }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📦</div>
              <div style={{ fontSize:16, color:W, marginBottom:8 }}>No products yet</div>
              <div style={{ fontSize:13 }}>Check back soon — new products coming!</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {products.map(p => {
                const price = getPrice(p)
                return (
                  <div key={p.id} className="prod-card"
                    style={{ borderRadius:14, border:`1px solid ${accent}20`, background:SURF, overflow:'hidden', transition:'all 0.2s', cursor:'pointer' }}>
                    {p.cover_url && (
                      <div style={{ height:140, background:`url(${p.cover_url}) center/cover`, position:'relative' }}>
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, #0D1629)' }} />
                      </div>
                    )}
                    <div style={{ padding:'16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:W, flex:1 }}>{p.title}</div>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:accent, marginLeft:12 }}>
                          {p.is_free ? 'FREE' : `R${price}`}
                        </div>
                      </div>
                      {p.description && (
                        <div style={{ fontSize:12, color:MUTED, lineHeight:1.7, marginBottom:12 }}>
                          {String(p.description).slice(0, 120)}...
                        </div>
                      )}
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:10, color:accent, background:`${accent}15`, padding:'3px 8px', borderRadius:6, textTransform:'uppercase', letterSpacing:1 }}>
                          {p.format ?? 'ebook'}
                        </span>
                        <button
                          onClick={() => { setSelProduct(p); setModal('payment'); setPaySuccess(false); setEftRef('') }}
                          style={{ marginLeft:'auto', padding:'8px 20px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:12, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                          {p.is_free ? 'Download Free →' : 'Get This →'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* About section */}
          {pwa?.about && (
            <div style={{ marginTop:32, padding:20, borderRadius:14, background:SURF, border:`1px solid ${accent}15` }}>
              <div style={{ fontSize:10, color:accent, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>About</div>
              <div style={{ fontSize:13, color:MUTED, lineHeight:1.8 }}>{pwa.about}</div>
            </div>
          )}

          {/* Powered by Z2B */}
          <div style={{ textAlign:'center', marginTop:24, fontSize:10, color:`${MUTED}80` }}>
            Powered by <a href="https://app.z2blegacybuilders.co.za/ai-income" style={{ color:accent, textDecoration:'none' }}>Z2B 4M Machine</a>
          </div>
        </div>
      )}

      {/* ══ TAB: FEED ═══════════════════════════════════════════ */}
      {tab === 'feed' && (
        <div style={{ maxWidth:680, margin:'0 auto', padding:'24px 16px' }}>

          {/* Post button */}
          {(isBuilder || isMember) && (
            <button onClick={() => setModal('post')}
              style={{ width:'100%', padding:14, borderRadius:12, border:`1px solid ${accent}30`, background:SURF, color:MUTED, fontSize:13, cursor:'pointer', marginBottom:20, textAlign:'left', fontFamily:'Georgia,serif' }}>
              📝 Share something with the community...
            </button>
          )}

          {posts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', color:MUTED }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📣</div>
              <div style={{ fontSize:16, color:W, marginBottom:8 }}>No posts yet</div>
              <div style={{ fontSize:13 }}>Be the first to share something!</div>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-card"
                style={{ marginBottom:12, padding:16, borderRadius:14, border:`1px solid ${accent}15`, background:SURF, transition:'border-color 0.2s' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`${accent}20`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                    {post.author_avatar ? <img src={post.author_avatar} style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} alt="" /> : '👤'}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:W }}>{post.author_name ?? 'Member'}</div>
                    <div style={{ fontSize:10, color:MUTED }}>{new Date(post.created_at).toLocaleDateString('en-ZA', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
                  </div>
                </div>
                <div style={{ fontSize:14, color:`${W}cc`, lineHeight:1.7, marginBottom: post.image_url ? 12 : 0 }}>{post.content}</div>
                {post.image_url && (
                  <img src={post.image_url} alt="" style={{ width:'100%', borderRadius:10, marginTop:8, maxHeight:320, objectFit:'cover' }} />
                )}
                {post.audio_url && (
                  <audio controls src={post.audio_url} style={{ width:'100%', marginTop:8 }} />
                )}
                <div style={{ display:'flex', gap:16, marginTop:10 }}>
                  <button style={{ background:'none', border:'none', color:MUTED, cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                    ❤️ {post.likes ?? 0}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══ TAB: MEMBERS ════════════════════════════════════════ */}
      {tab === 'members' && (
        <div style={{ maxWidth:680, margin:'0 auto', padding:'24px 16px' }}>
          {!user ? (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:32, marginBottom:16 }}>👥</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:8 }}>Members Area</div>
              <div style={{ fontSize:13, color:MUTED, marginBottom:20 }}>
                {pwa?.community_paid ? `Join for R${pwa.community_price}/month` : 'Free to join with any product purchase'}
              </div>
              <button onClick={() => setModal('login')}
                style={{ padding:'12px 28px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                Login / Join →
              </button>
            </div>
          ) : !isMember && !isBuilder ? (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:32, marginBottom:16 }}>🔒</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:8 }}>Members Only</div>
              <div style={{ fontSize:13, color:MUTED, marginBottom:20 }}>Purchase any product to join this community.</div>
              <button onClick={() => setTab('store')}
                style={{ padding:'12px 28px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                Browse Products →
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>
                {members.length} Member{members.length !== 1 ? 's' : ''}
              </div>
              {/* Member referral link */}
              <div style={{ padding:16, borderRadius:12, background:SURF, border:`1px solid ${accent}20`, marginBottom:20 }}>
                <div style={{ fontSize:11, color:accent, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>Your Referral Link</div>
                <div style={{ fontSize:12, color:MUTED, wordBreak:'break-all', marginBottom:10 }}>{myRefLink}</div>
                <button onClick={copyRef}
                  style={{ padding:'8px 18px', borderRadius:8, background:accent, color:BG, fontWeight:900, fontSize:11, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
              {/* Member list (builder sees full list, members see count) */}
              {isBuilder && members.map(m => (
                <div key={m.id} style={{ padding:'12px 16px', borderRadius:10, border:`1px solid ${accent}12`, background:SURF, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:W }}>{m.name ?? 'Member'}</div>
                    <div style={{ fontSize:11, color:MUTED }}>{m.email} · {new Date(m.joined_at).toLocaleDateString('en-ZA')}</div>
                  </div>
                  <div style={{ fontSize:10, color:accent, background:`${accent}15`, padding:'3px 8px', borderRadius:6 }}>{m.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: ADMIN ══════════════════════════════════════════ */}
      {tab === 'admin' && isBuilder && (
        <div style={{ maxWidth:680, margin:'0 auto', padding:'24px 16px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:20 }}>
            ⚙️ Store Admin
          </div>

          {/* Admin sub-tabs */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:20, paddingBottom:4 }}>
            {[
              { id:'products',   label:'📦 Products'   },
              { id:'members',    label:'👥 Members'    },
              { id:'sales',      label:'💰 Sales'      },
              { id:'affiliates', label:'🔗 Affiliates' },
              { id:'settings',   label:'⚙️ Settings'   },
            ].map(t => (
              <button key={t.id} onClick={() => setAdminTab(t.id as any)}
                style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${adminTab===t.id ? accent : accent+'30'}`, background: adminTab===t.id ? `${accent}18` : 'transparent', color: adminTab===t.id ? accent : MUTED, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Georgia,serif' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Products */}
          {adminTab === 'products' && (
            <div>
              <div style={{ fontSize:12, color:MUTED, marginBottom:12 }}>{products.length} products listed in your store</div>
              {products.map(p => (
                <div key={p.id} style={{ padding:'12px 16px', borderRadius:10, border:`1px solid ${accent}15`, background:SURF, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:W }}>{p.title}</div>
                    <div style={{ fontSize:11, color:MUTED }}>{p.format} · R{getPrice(p)}</div>
                  </div>
                  <div style={{ fontSize:10, color:accent }}>✓ LIVE</div>
                </div>
              ))}
              <div style={{ marginTop:16, fontSize:12, color:MUTED }}>
                Add products via the <a href="/ai-income" style={{ color:accent }}>4M Machine →</a>
              </div>
            </div>
          )}

          {/* Members */}
          {adminTab === 'members' && (
            <div>
              <div style={{ fontSize:12, color:MUTED, marginBottom:12 }}>{members.length} total members</div>
              {members.map(m => (
                <div key={m.id} style={{ padding:'12px 16px', borderRadius:10, border:`1px solid ${accent}12`, background:SURF, marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:W }}>{m.name ?? 'Member'}</div>
                      <div style={{ fontSize:11, color:MUTED }}>{m.email}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:10, color:accent }}>{m.status?.toUpperCase()}</div>
                      <div style={{ fontSize:10, color:MUTED }}>{new Date(m.joined_at).toLocaleDateString('en-ZA')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sales */}
          {adminTab === 'sales' && (
            <div>
              <div style={{ fontSize:12, color:MUTED, marginBottom:12 }}>
                {sales.length} sales · R{sales.filter(s => s.status === 'paid').reduce((a: number, s: any) => a + (s.amount ?? 0), 0).toFixed(2)} confirmed
              </div>
              {sales.map(s => (
                <div key={s.id} style={{ padding:'12px 16px', borderRadius:10, border:`1px solid ${accent}12`, background:SURF, marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:W }}>{s.buyer_name ?? s.buyer_email}</div>
                      <div style={{ fontSize:11, color:MUTED }}>{s.payment_method} · {new Date(s.created_at).toLocaleDateString('en-ZA')}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:16, fontWeight:900, color:accent }}>R{s.amount}</div>
                      <div style={{ fontSize:10, color: s.status === 'paid' ? '#10B981' : '#F59E0B' }}>{s.status?.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Affiliates */}
          {adminTab === 'affiliates' && (
            <div>
              <div style={{ fontSize:12, color:MUTED, marginBottom:12 }}>{affiliates.length} affiliates</div>
              {affiliates.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', color:MUTED }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>🔗</div>
                  <div>No affiliates yet. Share your store link to get affiliates promoting your products!</div>
                </div>
              ) : affiliates.map(a => (
                <div key={a.id} style={{ padding:'12px 16px', borderRadius:10, border:`1px solid ${accent}12`, background:SURF, marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:W }}>{a.name ?? a.email}</div>
                      <div style={{ fontSize:11, color:MUTED }}>Ref: {a.ref_code} · {a.total_sales} sales</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:16, fontWeight:900, color:accent }}>R{a.total_earned?.toFixed(2)}</div>
                      <div style={{ fontSize:10, color:MUTED }}>earned</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings */}
          {adminTab === 'settings' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'Store Name',    key:'display_name',    type:'text',  placeholder:'My Digital Store'     },
                { label:'Tagline',       key:'tagline',         type:'text',  placeholder:'Your store tagline'   },
                { label:'About',         key:'about',           type:'text',  placeholder:'About your store...'  },
                { label:'Accent Color',  key:'accent_color',    type:'color', placeholder:'#D4AF37'              },
                { label:'Yoco Public Key', key:'yoco_public_key', type:'text', placeholder:'pk_live_...'         },
              ].map(field => (
                <div key={field.key}>
                  <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>{field.label}</div>
                  <input
                    type={field.type}
                    value={(settings as any)[field.key] ?? ''}
                    onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ width:'100%', padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}20`, color:W, fontFamily:'Georgia,serif', fontSize:13 }}
                  />
                </div>
              ))}
              <button onClick={saveSettings}
                style={{ padding:'13px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                Save Settings
              </button>
              {saveMsg && <div style={{ textAlign:'center', color:'#10B981', fontSize:13 }}>{saveMsg}</div>}

              {/* Domain instructions */}
              <div style={{ padding:16, borderRadius:12, background:`${accent}08`, border:`1px solid ${accent}20`, marginTop:8 }}>
                <div style={{ fontSize:11, color:accent, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Custom Domain Setup</div>
                <div style={{ fontSize:12, color:MUTED, lineHeight:1.8 }}>
                  1. Buy your domain at <a href="https://www.domains.co.za/billing/aff.php?aff=5163" target="_blank" style={{ color:accent }}>domains.co.za →</a><br/>
                  2. Add a CNAME record pointing to: <strong style={{ color:W }}>app.z2blegacybuilders.co.za</strong><br/>
                  3. Contact support to connect your domain to this store.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ PAYMENT MODAL ═══════════════════════════════════════ */}
      {modal === 'payment' && selProduct && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(12px)' }}>
          <div style={{ width:'100%', maxWidth:440, background:'#0D1629', borderRadius:16, border:`1px solid ${accent}25`, borderTop:`3px solid ${accent}`, overflow:'hidden', maxHeight:'90vh', overflowY:'auto' }}>

            {/* Header */}
            <div style={{ padding:'20px', borderBottom:`1px solid ${accent}15`, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:W, marginBottom:4 }}>{selProduct.title}</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900, color:accent }}>R{getPrice(selProduct)}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background:'none', border:'none', color:MUTED, cursor:'pointer', fontSize:20 }}>✕</button>
            </div>

            {paySuccess ? (
              <div style={{ padding:32, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>👑</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:8 }}>
                  {eftRef ? 'Payment Noted!' : 'Payment Confirmed!'}
                </div>
                {eftRef ? (
                  <div style={{ fontSize:13, color:MUTED, lineHeight:1.7 }}>
                    Your order is recorded. Please complete your {payMethod === 'atm' ? 'ATM deposit' : 'EFT transfer'} using reference <strong style={{ color:accent }}>{eftRef}</strong>. Your product will be delivered to {buyerEmail} once confirmed.
                  </div>
                ) : (
                  <div style={{ fontSize:13, color:MUTED }}>Your product will be delivered to {buyerEmail} shortly.</div>
                )}
                <button onClick={() => setModal(null)} style={{ marginTop:20, padding:'11px 28px', borderRadius:10, background:accent, color:BG, fontWeight:900, fontSize:13, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>Close</button>
              </div>
            ) : eftRef ? (
              /* Bank details */
              <div style={{ padding:20 }}>
                <div style={{ padding:16, borderRadius:12, background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.25)', marginBottom:16 }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, fontWeight:900, color:'#06B6D4', marginBottom:12 }}>
                    {payMethod === 'atm' ? '🏧 ATM Deposit Details' : '🏦 EFT Bank Details'}
                  </div>
                  {[
                    ['Bank',           'Nedbank'                                    ],
                    ['Account Name',   pwa?.display_name ?? 'Store'                ],
                    ['Account Number', '1318257727'                                 ],
                    ['Branch Code',    '198765'                                     ],
                    ['Amount',         `R${getPrice(selProduct)}`                  ],
                    ['Reference',      eftRef                                       ],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                      <span style={{ color:MUTED }}>{k}:</span>
                      <span style={{ color: k === 'Reference' || k === 'Amount' ? accent : W, fontWeight: k === 'Reference' || k === 'Amount' ? 900 : 400 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPaySuccess(true)}
                  style={{ width:'100%', padding:13, borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  I Have Made The Payment →
                </button>
              </div>
            ) : (
              <div style={{ padding:20 }}>
                {/* Buyer details */}
                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Your Details</div>
                <input placeholder="Full name" value={buyerName} onChange={e => setBuyerName(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}20`, color:W, fontSize:13, fontFamily:'Georgia,serif', marginBottom:8 }} />
                <input type="email" placeholder="Email address" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}20`, color:W, fontSize:13, fontFamily:'Georgia,serif', marginBottom:16 }} />

                {/* Payment method */}
                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Payment Method</div>
                {[
                  { id:'yoco', icon:'💳', label:'Card via Yoco',   desc:'Instant · Visa & Mastercard'         },
                  { id:'eft',  icon:'🏦', label:'EFT Transfer',    desc:'Bank transfer · Confirmed in 24hrs'  },
                  { id:'atm',  icon:'🏧', label:'Nedbank ATM',     desc:'Cash deposit · Same day'             },
                ].map(m => (
                  <div key={m.id} onClick={() => setPayMethod(m.id as any)}
                    style={{ padding:'11px 14px', borderRadius:10, border:`2px solid ${payMethod===m.id ? accent : accent+'20'}`, background: payMethod===m.id ? `${accent}10` : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:12, marginBottom:8, transition:'all 0.15s' }}>
                    <span style={{ fontSize:20 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color: payMethod===m.id ? accent : W }}>{m.label}</div>
                      <div style={{ fontSize:11, color:MUTED }}>{m.desc}</div>
                    </div>
                  </div>
                ))}

                <button onClick={handlePay} disabled={!buyerName || !buyerEmail || payLoading}
                  style={{ width:'100%', marginTop:8, padding:14, borderRadius:12, border:'none', cursor: (!buyerName||!buyerEmail||payLoading) ? 'not-allowed' : 'pointer', background: (!buyerName||!buyerEmail||payLoading) ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,${accent},${accent}cc)`, color: (!buyerName||!buyerEmail||payLoading) ? MUTED : BG, fontWeight:900, fontSize:15, fontFamily:'Cinzel,Georgia,serif', opacity: (!buyerName||!buyerEmail) ? 0.5 : 1 }}>
                  {payLoading ? 'Processing...' : `Pay R${getPrice(selProduct)} →`}
                </button>

                {refCode && (
                  <div style={{ textAlign:'center', marginTop:10, fontSize:10, color:`${accent}60`, letterSpacing:2 }}>
                    ◆ REFERRED BY {refCode}
                  </div>
                )}
                <div style={{ textAlign:'center', marginTop:8, fontSize:10, color:MUTED }}>🔒 Secure checkout</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ POST MODAL ═══════════════════════════════════════════ */}
      {modal === 'post' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(12px)' }}>
          <div style={{ width:'100%', maxWidth:440, background:'#0D1629', borderRadius:16, border:`1px solid ${accent}25`, borderTop:`3px solid ${accent}`, padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:W }}>📝 New Post</div>
              <button onClick={() => setModal(null)} style={{ background:'none', border:'none', color:MUTED, cursor:'pointer', fontSize:20 }}>✕</button>
            </div>
            <textarea
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder="Share something with your community..."
              rows={5}
              style={{ width:'100%', padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}20`, color:W, fontSize:14, fontFamily:'Georgia,serif', lineHeight:1.7, resize:'vertical', marginBottom:12 }}
            />
            <input
              type="url"
              value={postImg}
              onChange={e => setPostImg(e.target.value)}
              placeholder="Image URL (optional)"
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}15`, color:W, fontSize:13, fontFamily:'Georgia,serif', marginBottom:14 }}
            />
            <button onClick={handlePost} disabled={!postText.trim() || postLoading}
              style={{ width:'100%', padding:13, borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', opacity: !postText.trim() ? 0.5 : 1 }}>
              {postLoading ? 'Posting...' : 'Share Post →'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default function StorePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
        Loading store...
      </div>
    }>
      <StoreInner />
    </Suspense>
  )
}
