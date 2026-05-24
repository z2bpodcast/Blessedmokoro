'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminMarketplacePage() {
  const router   = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const auth = sessionStorage.getItem('z2b_cmd_auth')
    if (auth !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k'); return }
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await (supabase as any).from('marketplace_products')
      .select('id, name, title, status, is_active, retail_price, product_type, category')
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0c14', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
      Loading products...
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0a0c14', color:'#F0F9FF', fontFamily:'Georgia,serif', padding:24 }}>
      <a href="/z2b-command-7x9k/hub" style={{ color:'#64748B', textDecoration:'none', fontSize:12 }}>← Hub</a>
      <h1 style={{ color:'#D4AF37', fontFamily:'Cinzel,Georgia,serif', marginTop:16 }}>🏪 Marketplace Admin</h1>
      <p style={{ color:'#64748B' }}>{products.length} products found</p>
      {products.map(p => (
        <div key={p.id} style={{ padding:16, marginBottom:8, borderRadius:10, background:'#111827', border:'1px solid rgba(255,255,255,0.08)' }}>
          <strong style={{ color:'#F0F9FF' }}>{p.name || p.title}</strong>
          <span style={{ marginLeft:12, color:'#64748B', fontSize:12 }}>{p.status} · R{p.retail_price}</span>
        </div>
      ))}
    </div>
  )
}
