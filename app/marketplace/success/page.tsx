'use client'
// File: app/marketplace/success/page.tsx
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase }        from '@/lib/supabase'
import Link                from 'next/link'

const BG = '#050A18'; const GOLD = '#D4AF37'; const GREEN = '#10B981'; const W = '#F0F9FF'; const MUTED = '#64748B'

function SuccessInner() {
  const params    = useSearchParams()
  const productId = params.get('product') ?? ''
  const refCode   = params.get('ref') ?? ''
  const [product, setProduct] = useState<any>(null)
  const [loading,  setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    supabase.from('marketplace_products' as any).select('title, name, session_id, builder_id').eq('id', productId).maybeSingle()
      .then(({ data }) => { setProduct(data); setLoading(false) })
  }, [productId])

  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'Georgia,serif', color:W }}>
      <div style={{ maxWidth:'440px', width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'72px', marginBottom:'20px' }}>🎉</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, color:GOLD, marginBottom:'10px' }}>Payment Successful!</div>
        <div style={{ fontSize:'14px', color:MUTED, lineHeight:1.8, marginBottom:'24px' }}>
          {product ? `Thank you for purchasing "${product.title ?? product.name}". ` : ''}
          Your download link has been sent to your email. Check your inbox.
        </div>
        <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', marginBottom:'24px', fontSize:'12px', color:GREEN, lineHeight:1.8 }}>
          ✓ Payment confirmed · ✓ Download link sent · ✓ Product is yours forever
        </div>
        <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/marketplace" style={{ padding:'12px 24px', borderRadius:'12px', background:GOLD, color:'#050A18', fontWeight:900, fontSize:'14px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            Back to Marketplace →
          </Link>
          <Link href="/ai-income" style={{ padding:'12px 20px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.15)', color:MUTED, fontSize:'13px', textDecoration:'none' }}>
            Build Your Own Product
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense fallback={null}><SuccessInner /></Suspense>
}
