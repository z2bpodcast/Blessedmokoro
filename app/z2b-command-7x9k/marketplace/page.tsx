'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Product = {
  id?: string; name: string; tagline: string; description: string
  category: string; price_monthly: number|null; price_once: number|null
  badge: string; icon: string; color: string
  is_active: boolean; is_coming_soon: boolean
  features: string[]; slug: string; sort_order: number
}

const EMPTY: Product = { name:'', tagline:'', description:'', category:'app', price_monthly:null, price_once:null, badge:'', icon:'🔧', color:'#7C3AED', is_active:false, is_coming_soon:false, features:[], slug:'', sort_order:0 }

const CATS = ['app','tool','template','course','service']

export default function AdminMarketplacePage() {
  const router = useRouter()
  const [products, setProducts]   = useState<Product[]>([])
  const [editing, setEditing]     = useState<Product|null>(null)
  const [isNew, setIsNew]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')
  const [featureInput, setFeatureInput] = useState('')
  const [stats, setStats]         = useState({ total:0, active:0, subscribers:0, mrr:0 })

  useEffect(() => {
    // Auth check
    const session = sessionStorage.getItem('z2b_cmd_auth')
    if (session !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k/'); return }
    loadProducts()
    loadStats()
  }, [])

  const loadProducts = async () => {
    const { data } = await supabase.from('marketplace_products').select('*').order('sort_order')
    if (data) setProducts(data)
  }

  const loadStats = async () => {
    const [{ count: total }, { count: active }, subs] = await Promise.all([
      supabase.from('marketplace_products').select('*', {count:'exact',head:true}),
      supabase.from('marketplace_products').select('*', {count:'exact',head:true}).eq('is_active',true),
      supabase.from('cs_plus_subscriptions').select('plan'),
    ])
    const subData = subs.data || []
    const mrr = subData.reduce((sum: number, s: any) => {
      const price = s.plan==='starter'?297:s.plan==='pro'?597:s.plan==='elite'?997:0
      return sum + price
    }, 0)
    setStats({ total:total||0, active:active||0, subscribers:subData.length, mrr })
  }

  const startNew = () => { setEditing({...EMPTY}); setIsNew(true); setFeatureInput('') }
  const startEdit = (p: Product) => { setEditing({...p}); setIsNew(false); setFeatureInput('') }
  const cancelEdit = () => { setEditing(null); setIsNew(false) }

  const addFeature = () => {
    if (!featureInput.trim() || !editing) return
    setEditing(prev => prev ? {...prev, features:[...prev.features, featureInput.trim()]} : prev)
    setFeatureInput('')
  }

  const removeFeature = (idx: number) => {
    if (!editing) return
    setEditing(prev => prev ? {...prev, features:prev.features.filter((_,i)=>i!==idx)} : prev)
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.name || !editing.slug) { setMsg('Name and slug are required.'); return }
    setSaving(true); setMsg('')
    try {
      if (isNew) {
        const { error } = await supabase.from('marketplace_products').insert(editing)
        if (error) throw error
        setMsg('✅ Product created successfully')
      } else {
        const { error } = await supabase.from('marketplace_products').update(editing).eq('id', editing.id)
        if (error) throw error
        setMsg('✅ Product updated successfully')
      }
      await loadProducts()
      setEditing(null); setIsNew(false)
    } catch (err: any) {
      setMsg(`❌ Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (p: Product) => {
    await supabase.from('marketplace_products').update({ is_active: !p.is_active }).eq('id', p.id)
    await loadProducts()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await supabase.from('marketplace_products').delete().eq('id', id)
    await loadProducts()
  }

  const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'9px', padding:'10px 13px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'5px' }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0818', fontFamily:'Georgia,serif', color:'#F5F3FF', padding:'0 0 60px' }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.15)', padding:'18px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'20px', fontWeight:700, color:'#D4AF37' }}>🏪 Marketplace Admin</h1>
          <p style={{ margin:'3px 0 0', fontSize:'12px', color:'rgba(196,181,253,0.6)' }}>Manage products, tools and services</p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <a href="/marketplace" target="_blank" style={{ padding:'9px 18px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'9px', color:'rgba(255,255,255,0.6)', fontSize:'12px', textDecoration:'none', fontFamily:'Georgia,serif' }}>View Marketplace ↗</a>
          <button onClick={startNew} style={{ padding:'9px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'9px', color:'#F5D060', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>+ Add Product</button>
        </div>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 24px' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px' }}>
          {[
            { label:'Total Products', value:stats.total, color:'#7C3AED' },
            { label:'Active Listings', value:stats.active, color:'#059669' },
            { label:'CS+ Subscribers', value:stats.subscribers, color:'#0EA5E9' },
            { label:'CS+ MRR', value:`R${stats.mrr.toLocaleString()}`, color:'#D4AF37' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'20px' }}>
              <div style={{ fontSize:'28px', fontWeight:700, color:s.color, marginBottom:'4px' }}>{s.value}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{ background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:'10px', padding:'12px 16px', color:msg.startsWith('✅')?'#6EE7B7':'#FCA5A5', fontSize:'13px', marginBottom:'20px' }}>
            {msg}
          </div>
        )}

        {/* Edit / New form */}
        {editing && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'18px', padding:'28px', marginBottom:'32px' }}>
            <h3 style={{ margin:'0 0 24px', fontSize:'18px', fontWeight:700, color:'#D4AF37' }}>{isNew ? '+ New Product' : `Editing: ${editing.name}`}</h3>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <div>
                <label style={lbl}>Product Name *</label>
                <input value={editing.name} onChange={e=>setEditing(p=>p?{...p,name:e.target.value}:p)} style={inp} placeholder="e.g. Content Studio+" />
              </div>
              <div>
                <label style={lbl}>Slug * (URL path)</label>
                <input value={editing.slug} onChange={e=>setEditing(p=>p?{...p,slug:e.target.value.toLowerCase().replace(/\s+/g,'-')}:p)} style={inp} placeholder="e.g. cs-plus" />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Tagline</label>
                <input value={editing.tagline} onChange={e=>setEditing(p=>p?{...p,tagline:e.target.value}:p)} style={inp} placeholder="Short description shown on marketplace card" />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Description</label>
                <textarea value={editing.description} onChange={e=>setEditing(p=>p?{...p,description:e.target.value}:p)} rows={3} style={{ ...inp, resize:'vertical', cursor:'text' }} placeholder="Full product description" />
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select value={editing.category} onChange={e=>setEditing(p=>p?{...p,category:e.target.value}:p)} style={inp}>
                  {CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Icon (emoji)</label>
                <input value={editing.icon} onChange={e=>setEditing(p=>p?{...p,icon:e.target.value}:p)} style={inp} placeholder="🔧" />
              </div>
              <div>
                <label style={lbl}>Monthly Price (R) — leave blank if once-off</label>
                <input type="number" value={editing.price_monthly||''} onChange={e=>setEditing(p=>p?{...p,price_monthly:e.target.value?Number(e.target.value):null}:p)} style={inp} placeholder="e.g. 297" />
              </div>
              <div>
                <label style={lbl}>Once-off Price (R) — leave blank if monthly</label>
                <input type="number" value={editing.price_once||''} onChange={e=>setEditing(p=>p?{...p,price_once:e.target.value?Number(e.target.value):null}:p)} style={inp} placeholder="e.g. 980" />
              </div>
              <div>
                <label style={lbl}>Badge (e.g. NEW, Soon, Phase 2)</label>
                <input value={editing.badge} onChange={e=>setEditing(p=>p?{...p,badge:e.target.value}:p)} style={inp} placeholder="NEW" />
              </div>
              <div>
                <label style={lbl}>Accent Color</label>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  <input type="color" value={editing.color} onChange={e=>setEditing(p=>p?{...p,color:e.target.value}:p)} style={{ width:'44px', height:'38px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', background:'none' }} />
                  <input value={editing.color} onChange={e=>setEditing(p=>p?{...p,color:e.target.value}:p)} style={{ ...inp, flex:1 }} placeholder="#7C3AED" />
                </div>
              </div>
              <div>
                <label style={lbl}>Sort Order (lower = first)</label>
                <input type="number" value={editing.sort_order} onChange={e=>setEditing(p=>p?{...p,sort_order:Number(e.target.value)}:p)} style={inp} placeholder="0" />
              </div>
              <div>
                <div style={{ display:'flex', gap:'20px', marginTop:'8px' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>
                    <input type="checkbox" checked={editing.is_active} onChange={e=>setEditing(p=>p?{...p,is_active:e.target.checked}:p)} style={{ width:'16px', height:'16px', accentColor:'#059669' }} />
                    Active (visible on marketplace)
                  </label>
                  <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>
                    <input type="checkbox" checked={editing.is_coming_soon} onChange={e=>setEditing(p=>p?{...p,is_coming_soon:e.target.checked}:p)} style={{ width:'16px', height:'16px', accentColor:'#D4AF37' }} />
                    Coming Soon
                  </label>
                </div>
              </div>
            </div>

            {/* Features */}
            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>Features / Bullet Points</label>
              <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
                <input value={featureInput} onChange={e=>setFeatureInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();addFeature()} }} style={{ ...inp, flex:1 }} placeholder="Type a feature and press Enter or Add" />
                <button onClick={addFeature} style={{ padding:'10px 16px', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.35)', borderRadius:'9px', color:'#C4B5FD', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif', flexShrink:0 }}>Add</button>
              </div>
              {editing.features.map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'8px 12px', marginBottom:'6px' }}>
                  <span style={{ color:'#7C3AED', fontSize:'10px' }}>◆</span>
                  <span style={{ flex:1, fontSize:'13px', color:'rgba(255,255,255,0.75)' }}>{f}</span>
                  <button onClick={()=>removeFeature(i)} style={{ background:'none', border:'none', color:'rgba(239,68,68,0.6)', cursor:'pointer', fontSize:'16px', lineHeight:1, padding:'0 4px' }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleSave} disabled={saving} style={{ padding:'12px 28px', background:saving?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'10px', color:saving?'rgba(255,255,255,0.3)':'#F5D060', fontWeight:700, fontSize:'14px', cursor:saving?'not-allowed':'pointer', fontFamily:'Georgia,serif' }}>
                {saving ? 'Saving...' : isNew ? '✅ Create Product' : '✅ Save Changes'}
              </button>
              <button onClick={cancelEdit} style={{ padding:'12px 20px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Products table */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h3 style={{ margin:0, fontSize:'16px', fontWeight:700, color:'#fff' }}>All Products ({products.length})</h3>
          </div>

          {products.length===0 ? (
            <div style={{ padding:'48px', textAlign:'center', color:'rgba(196,181,253,0.4)' }}>
              No products yet. Click "Add Product" to create the first one.
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['Product','Category','Price','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 18px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p,idx) => (
                  <tr key={p.id} style={{ borderBottom:idx<products.length-1?'1px solid rgba(255,255,255,0.05)':'none', background:idx%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding:'14px 18px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${p.color}18`, border:`1px solid ${p.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>{p.icon}</div>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{p.name}</div>
                          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>/marketplace/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'14px 18px' }}>
                      <span style={{ fontSize:'12px', background:`${p.color}15`, border:`1px solid ${p.color}30`, borderRadius:'8px', padding:'3px 10px', color:p.color, fontWeight:700 }}>{p.category}</span>
                    </td>
                    <td style={{ padding:'14px 18px', fontSize:'14px', color:'#D4AF37', fontWeight:700 }}>
                      {p.price_monthly ? `R${p.price_monthly}/mo` : p.price_once ? `R${p.price_once}` : '—'}
                    </td>
                    <td style={{ padding:'14px 18px' }}>
                      <button onClick={()=>toggleActive(p)} style={{ padding:'5px 12px', borderRadius:'20px', border:`1px solid ${p.is_active?'rgba(16,185,129,0.35)':'rgba(239,68,68,0.28)'}`, cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'11px', fontWeight:700, background:p.is_active?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.1)', color:p.is_active?'#6EE7B7':'#FCA5A5' }}>
                        {p.is_active ? '● Active' : '○ Inactive'}
                      </button>
                      {p.is_coming_soon && <span style={{ marginLeft:'6px', fontSize:'11px', color:'rgba(212,175,55,0.6)' }}>Soon</span>}
                    </td>
                    <td style={{ padding:'14px 18px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={()=>startEdit(p)} style={{ padding:'6px 14px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.28)', borderRadius:'7px', color:'#C4B5FD', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>Edit</button>
                        <button onClick={()=>deleteProduct(p.id!)} style={{ padding:'6px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'7px', color:'#FCA5A5', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
