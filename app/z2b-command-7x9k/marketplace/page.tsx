'use client'
// app/z2b-command-7x9k/marketplace/page.tsx
// Z2B Marketplace Admin — Full Product Management
// 4M Products + External Apps · List/Delist · Edit · Upload

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const BG   = '#0a0c14'
const SURF = '#111827'
const GOLD = '#D4AF37'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'
const RED  = '#EF4444'
const VIO  = '#7C3AED'

const CATEGORIES = ['ebook','toolkit','course','framework','template','workbook','checklist','app','pwa','service','other']
const STATUSES   = ['listed','draft','delisted']
const TYPES      = ['z2b_product','external_app','external_ebook','external_tool']

interface Product {
  id?:              string
  name:             string
  title?:           string
  slug:             string
  tagline:          string
  description:      string
  category:         string
  format?:          string
  icon?:            string
  color?:           string
  cover_url?:       string
  product_url?:     string
  retail_price?:    number
  price_once?:      number
  price_monthly?:   number
  seller_id?:       string
  seller_name?:     string
  status:           string
  is_active:        boolean
  is_coming_soon?:  boolean
  product_type?:    string
  affiliate_enabled?:boolean
  seller_earnings?: number
  z2b_commission?:  number
  session_id?:      string
  sort_order?:      number
  features?:        string[]
  keywords?:        string[]
  created_at?:      string
}

const EMPTY: Product = {
  name:'', slug:'', tagline:'', description:'',
  category:'ebook', status:'draft', is_active:false,
  product_type:'external_app', retail_price:299,
  affiliate_enabled:true, icon:'📦', color:VIO,
  features:[], keywords:[],
}

const lbl: any = { fontSize:11, color:MUTED, letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:6, fontFamily:'Georgia,serif' }
const inp: any = { width:'100%', padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:W, fontFamily:'Georgia,serif', fontSize:13, outline:'none', marginBottom:0, boxSizing:'border-box' }

export default function AdminMarketplacePage() {
  const router = useRouter()

  const [products,  setProducts]  = useState<Product[]>([])
  const [editing,   setEditing]   = useState<Product|null>(null)
  const [isNew,     setIsNew]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState('')
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')
  const [typeFilter,setTypeFilter]= useState('all')
  const [stats,     setStats]     = useState({ total:0, listed:0, external:0, z2b:0 })
  const [tagInput,  setTagInput]  = useState('')
  const [sales,     setSales]     = useState<Record<string,number>>({})
  const [confirmDel,setConfirmDel]= useState<string|null>(null)

  useEffect(() => {
    const session = sessionStorage.getItem('z2b_cmd_auth') || localStorage.getItem('z2b_cmd_auth')
    if (session !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k/'); return }
    loadAll()
  }, [])

  async function loadAll() {
    const { data } = await (supabase as any).from('marketplace_products')
      .select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)

    // Stats
    const total    = data?.length ?? 0
    const listed   = data?.filter((p: any) => p.status === 'listed' || p.is_active).length ?? 0
    const external = data?.filter((p: any) => p.product_type && p.product_type !== 'z2b_product').length ?? 0
    const z2b      = data?.filter((p: any) => p.product_type === 'z2b_product').length ?? 0
    setStats({ total, listed, external, z2b })

    // Sales counts
    const { data: salesData } = await (supabase as any).from('pwa_sales')
      .select('product_id').eq('status', 'paid')
    const salesMap: Record<string,number> = {}
    salesData?.forEach((s: any) => {
      if (s.product_id) salesMap[s.product_id] = (salesMap[s.product_id] ?? 0) + 1
    })
    setSales(salesMap)
  }

  async function saveProduct() {
    if (!editing) return
    setSaving(true)
    const sb = supabase as any

    // Auto-fill title from name
    const record = {
      ...editing,
      title:          editing.title || editing.name,
      name:           editing.name,
      seller_earnings:Math.round((editing.retail_price ?? editing.price_once ?? 299) * 0.75),
      z2b_commission: Math.round((editing.retail_price ?? editing.price_once ?? 299) * 0.05),
      price_once:     editing.retail_price ?? editing.price_once,
    }

    if (isNew) {
      if (!record.slug) record.slug = record.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,80) + '-' + Date.now().toString().slice(-4)
      const { error } = await sb.from('marketplace_products').insert(record)
      if (error) { setMsg('❌ ' + error.message); setSaving(false); return }
      setMsg('✅ Product created and ' + (record.status === 'listed' ? 'listed!' : 'saved as draft!'))
    } else {
      const { error } = await sb.from('marketplace_products').update(record).eq('id', editing.id)
      if (error) { setMsg('❌ ' + error.message); setSaving(false); return }
      setMsg('✅ Product updated!')
    }

    setSaving(false)
    setEditing(null)
    setIsNew(false)
    loadAll()
    setTimeout(() => setMsg(''), 3000)
  }

  async function toggleStatus(p: Product) {
    const sb = supabase as any
    const newStatus  = p.status === 'listed' ? 'delisted' : 'listed'
    const newActive  = newStatus === 'listed'
    await sb.from('marketplace_products').update({ status: newStatus, is_active: newActive }).eq('id', p.id)
    loadAll()
  }

  async function deleteProduct(id: string) {
    await (supabase as any).from('marketplace_products').delete().eq('id', id)
    setConfirmDel(null)
    loadAll()
    setMsg('✅ Product deleted')
    setTimeout(() => setMsg(''), 2500)
  }

  function addTag(field: 'features'|'keywords') {
    if (!tagInput.trim() || !editing) return
    const arr = editing[field] ?? []
    setEditing({ ...editing, [field]: [...arr, tagInput.trim()] })
    setTagInput('')
  }

  function removeTag(field: 'features'|'keywords', idx: number) {
    if (!editing) return
    const arr = [...(editing[field] ?? [])]
    arr.splice(idx, 1)
    setEditing({ ...editing, [field]: arr })
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || (p.name + p.title + p.tagline + p.description).toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter || (filter === 'active' && p.is_active)
    const matchType   = typeFilter === 'all' || p.product_type === typeFilter
    return matchSearch && matchFilter && matchType
  })

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing:border-box; }
        input,select,textarea { outline:none; }
        .prod-row:hover { background:rgba(255,255,255,0.04) !important; }
        .toggle-btn { transition:all 0.2s; }
      `}</style>

      {/* Nav */}
      <div style={{ background:'rgba(0,0,0,0.6)', borderBottom:`1px solid ${GOLD}20`, padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <a href="/z2b-command-7x9k/hub" style={{ fontSize:12, color:MUTED, textDecoration:'none', fontWeight:700 }}>← Hub</a>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:GOLD, margin:0 }}>🏪 Marketplace Admin</h1>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <a href="/marketplace" target="_blank" style={{ padding:'8px 16px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:MUTED, fontSize:12, textDecoration:'none' }}>
            View Marketplace ↗
          </a>
          <button onClick={() => { setEditing({...EMPTY}); setIsNew(true); setTagInput('') }}
            style={{ padding:'8px 18px', borderRadius:8, background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:BG, fontSize:13, fontWeight:900, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
            + Upload Product
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:28 }}>
          {[
            { label:'Total Products',  value:stats.total,    color:VIO   },
            { label:'Live Listings',   value:stats.listed,   color:GREEN },
            { label:'4M Products',     value:stats.z2b,      color:GOLD  },
            { label:'External Apps',   value:stats.external, color:'#06B6D4' },
          ].map(s => (
            <div key={s.label} style={{ padding:'18px 20px', borderRadius:12, background:SURF, border:`1px solid ${s.color}25` }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:28, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:MUTED, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{ padding:'12px 16px', borderRadius:10, background: msg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: msg.startsWith('✅') ? GREEN : RED, fontSize:13, marginBottom:20 }}>
            {msg}
          </div>
        )}

        {/* ── EDIT/NEW FORM ── */}
        {editing && (
          <div style={{ background:SURF, border:`1.5px solid ${GOLD}30`, borderRadius:16, padding:28, marginBottom:32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:GOLD, margin:0 }}>
                {isNew ? '+ Upload Product' : `Editing: ${editing.name || editing.title}`}
              </h3>
              <button onClick={() => setEditing(null)} style={{ background:'none', border:'none', color:MUTED, cursor:'pointer', fontSize:20 }}>✕</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

              {/* Product Type */}
              <div>
                <label style={lbl}>Product Type</label>
                <select value={editing.product_type ?? 'external_app'} onChange={e => setEditing({...editing, product_type:e.target.value})} style={inp}>
                  <option value="z2b_product">4M Machine Product</option>
                  <option value="external_app">External PWA / App</option>
                  <option value="external_ebook">External eBook</option>
                  <option value="external_tool">External Tool</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label style={lbl}>Status</label>
                <select value={editing.status} onChange={e => setEditing({...editing, status:e.target.value, is_active:e.target.value==='listed'})} style={inp}>
                  <option value="draft">Draft (not visible)</option>
                  <option value="listed">Listed (live on marketplace)</option>
                  <option value="delisted">Delisted (hidden)</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label style={lbl}>Product Name *</label>
                <input value={editing.name || editing.title || ''} onChange={e => setEditing({...editing, name:e.target.value, title:e.target.value})} style={inp} placeholder="e.g. AI Budget Planner PWA" />
              </div>

              {/* Slug */}
              <div>
                <label style={lbl}>Slug (URL) — leave blank to auto-generate</label>
                <input value={editing.slug} onChange={e => setEditing({...editing, slug:e.target.value.toLowerCase().replace(/\s+/g,'-')})} style={inp} placeholder="ai-budget-planner" />
              </div>

              {/* Tagline */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Tagline</label>
                <input value={editing.tagline} onChange={e => setEditing({...editing, tagline:e.target.value})} style={inp} placeholder="One punchy line that sells the product" />
              </div>

              {/* Description */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Description</label>
                <textarea value={editing.description} onChange={e => setEditing({...editing, description:e.target.value})} rows={4} style={{ ...inp, resize:'vertical' }} placeholder="Full product description — problem, solution, transformation" />
              </div>

              {/* Category */}
              <div>
                <label style={lbl}>Category / Format</label>
                <select value={editing.category || editing.format || 'app'} onChange={e => setEditing({...editing, category:e.target.value, format:e.target.value})} style={inp}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>

              {/* Icon */}
              <div>
                <label style={lbl}>Icon (emoji)</label>
                <input value={editing.icon ?? '📦'} onChange={e => setEditing({...editing, icon:e.target.value})} style={inp} placeholder="📦" />
              </div>

              {/* Price */}
              <div>
                <label style={lbl}>Price (ZAR) — once-off</label>
                <input type="number" value={editing.retail_price || editing.price_once || ''} onChange={e => setEditing({...editing, retail_price:Number(e.target.value), price_once:Number(e.target.value)})} style={inp} placeholder="299" />
              </div>

              {/* Monthly Price */}
              <div>
                <label style={lbl}>Monthly Price (ZAR) — leave blank if once-off</label>
                <input type="number" value={editing.price_monthly || ''} onChange={e => setEditing({...editing, price_monthly:e.target.value?Number(e.target.value):undefined})} style={inp} placeholder="97" />
              </div>

              {/* Cover Image */}
              <div>
                <label style={lbl}>Cover Image URL</label>
                <input value={editing.cover_url ?? ''} onChange={e => setEditing({...editing, cover_url:e.target.value})} style={inp} placeholder="https://..." />
              </div>

              {/* Product URL (for external apps) */}
              <div>
                <label style={lbl}>Product URL (for PWAs / external apps)</label>
                <input value={editing.product_url ?? ''} onChange={e => setEditing({...editing, product_url:e.target.value})} style={inp} placeholder="https://myapp.vercel.app" />
              </div>

              {/* Seller Name */}
              <div>
                <label style={lbl}>Seller / Builder Name</label>
                <input value={editing.seller_name ?? ''} onChange={e => setEditing({...editing, seller_name:e.target.value})} style={inp} placeholder="Rev Manana" />
              </div>

              {/* Affiliate */}
              <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:24 }}>
                <input type="checkbox" checked={editing.affiliate_enabled ?? true} onChange={e => setEditing({...editing, affiliate_enabled:e.target.checked})} id="aff" />
                <label htmlFor="aff" style={{ fontSize:13, color:W, cursor:'pointer' }}>Enable 20% affiliate commission</label>
              </div>

              {/* Features */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Key Features / Benefits</label>
                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addTag('features')} style={{ ...inp, flex:1 }} placeholder="Type a feature and press Enter or Add" />
                  <button onClick={() => addTag('features')} style={{ padding:'10px 16px', borderRadius:8, background:GOLD, color:BG, fontWeight:900, fontSize:12, border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>Add</button>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {(editing.features ?? []).map((f,i) => (
                    <div key={i} style={{ padding:'4px 10px', borderRadius:20, background:`${GOLD}15`, border:`1px solid ${GOLD}30`, fontSize:12, color:GOLD, display:'flex', alignItems:'center', gap:6 }}>
                      {f} <span onClick={() => removeTag('features',i)} style={{ cursor:'pointer', color:RED }}>✕</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>SEO Keywords</label>
                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addTag('keywords')} style={{ ...inp, flex:1 }} placeholder="Type a keyword and press Enter or Add" />
                  <button onClick={() => addTag('keywords')} style={{ padding:'10px 16px', borderRadius:8, background:`${VIO}cc`, color:W, fontWeight:900, fontSize:12, border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>Add</button>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {(editing.keywords ?? []).map((k,i) => (
                    <div key={i} style={{ padding:'4px 10px', borderRadius:20, background:`${VIO}15`, border:`1px solid ${VIO}30`, fontSize:12, color:'#A78BFA', display:'flex', alignItems:'center', gap:6 }}>
                      {k} <span onClick={() => removeTag('keywords',i)} style={{ cursor:'pointer', color:RED }}>✕</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Commission preview */}
            {(editing.retail_price || editing.price_once) && (
              <div style={{ marginTop:16, padding:'12px 16px', borderRadius:10, background:'rgba(212,175,55,0.06)', border:`1px solid ${GOLD}20`, fontSize:12, color:MUTED }}>
                💰 Commission split — Seller: <strong style={{ color:GREEN }}>R{Math.round((editing.retail_price || editing.price_once || 0) * 0.75)}</strong> ·
                Affiliate: <strong style={{ color:'#06B6D4' }}>R{Math.round((editing.retail_price || editing.price_once || 0) * 0.20)}</strong> ·
                Z2B: <strong style={{ color:GOLD }}>R{Math.round((editing.retail_price || editing.price_once || 0) * 0.05)}</strong>
              </div>
            )}

            <div style={{ display:'flex', gap:12, marginTop:20 }}>
              <button onClick={saveProduct} disabled={saving || !editing.name}
                style={{ flex:1, padding:'13px', borderRadius:10, background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:saving?'wait':'pointer', fontFamily:'Cinzel,Georgia,serif', opacity:!editing.name?0.5:1 }}>
                {saving ? 'Saving...' : isNew ? '🚀 Upload to Marketplace' : '💾 Save Changes'}
              </button>
              <button onClick={() => setEditing(null)}
                style={{ padding:'13px 24px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:MUTED, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── FILTERS ── */}
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search products..."
            style={{ flex:1, minWidth:200, padding:'9px 14px', borderRadius:8, background:SURF, border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:13, outline:'none' }} />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding:'9px 14px', borderRadius:8, background:SURF, border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:13, outline:'none', cursor:'pointer' }}>
            <option value="all">All Statuses</option>
            <option value="listed">Listed</option>
            <option value="draft">Draft</option>
            <option value="delisted">Delisted</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding:'9px 14px', borderRadius:8, background:SURF, border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:13, outline:'none', cursor:'pointer' }}>
            <option value="all">All Types</option>
            <option value="z2b_product">4M Products</option>
            <option value="external_app">External Apps</option>
            <option value="external_ebook">External eBooks</option>
          </select>
          <div style={{ fontSize:12, color:MUTED }}>{filtered.length} product{filtered.length!==1?'s':''}</div>
        </div>

        {/* ── PRODUCT LIST ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(p => {
            const isListed = p.status === 'listed' || p.is_active
            const salesCount = sales[p.id ?? ''] ?? 0
            const price = p.retail_price ?? p.price_once ?? 0

            return (
              <div key={p.id} className="prod-row"
                style={{ padding:'16px 20px', borderRadius:12, background:SURF, border:`1px solid ${isListed ? GREEN+'25' : 'rgba(255,255,255,0.06)'}`, transition:'all 0.2s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>

                  {/* Icon */}
                  <div style={{ width:40, height:40, borderRadius:10, background:`${GOLD}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                    {p.icon ?? '📦'}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:W, marginBottom:3 }}>
                      {p.name || p.title}
                    </div>
                    <div style={{ fontSize:11, color:MUTED, display:'flex', gap:10, flexWrap:'wrap' }}>
                      <span>{p.category || p.format}</span>
                      <span style={{ color:GOLD }}>R{price}</span>
                      <span style={{ color: isListed ? GREEN : MUTED }}>
                        {isListed ? '✅ Listed' : p.status === 'draft' ? '📝 Draft' : '🔴 Delisted'}
                      </span>
                      <span style={{ color:'#06B6D4' }}>
                        {p.product_type === 'z2b_product' ? '⚙️ 4M' : '🌐 External'}
                      </span>
                      {salesCount > 0 && <span style={{ color:GREEN }}>💰 {salesCount} sales</span>}
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:GOLD, flexShrink:0 }}>
                    R{price}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                    {/* List/Delist */}
                    <button className="toggle-btn" onClick={() => toggleStatus(p)}
                      style={{ padding:'6px 12px', borderRadius:7, background: isListed ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border:`1px solid ${isListed ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, color: isListed ? '#FCA5A5' : GREEN, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                      {isListed ? '🔴 Delist' : '✅ List'}
                    </button>

                    {/* Edit */}
                    <button onClick={() => { setEditing({...p, features: p.features ?? [], keywords: (p as any).keywords ?? []}); setIsNew(false); setTagInput('') }}
                      style={{ padding:'6px 12px', borderRadius:7, background:`${GOLD}10`, border:`1px solid ${GOLD}30`, color:GOLD, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                      ✏️ Edit
                    </button>

                    {/* View */}
                    {p.product_url && (
                      <a href={p.product_url} target="_blank" rel="noopener noreferrer"
                        style={{ padding:'6px 12px', borderRadius:7, background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#06B6D4', fontSize:11, fontWeight:700, textDecoration:'none' }}>
                        🔗 Open
                      </a>
                    )}

                    {/* Delete */}
                    {confirmDel === p.id ? (
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => deleteProduct(p.id!)}
                          style={{ padding:'6px 10px', borderRadius:7, background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', color:'#FCA5A5', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                          Confirm ✗
                        </button>
                        <button onClick={() => setConfirmDel(null)}
                          style={{ padding:'6px 10px', borderRadius:7, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:MUTED, fontSize:11, cursor:'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(p.id!)}
                        style={{ padding:'6px 12px', borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#FCA5A5', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Tags preview */}
                {((p.features ?? []).length > 0 || (p as any).keywords?.length > 0) && (
                  <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
                    {(p.features ?? []).slice(0,3).map((f,i) => (
                      <span key={i} style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:`${GOLD}10`, color:GOLD }}>{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:MUTED }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
              <div style={{ fontSize:16, color:W, marginBottom:6 }}>No products found</div>
              <div style={{ fontSize:13 }}>Try adjusting filters or upload your first product</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
