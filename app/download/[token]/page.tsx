'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function DownloadPage() {
  const params  = useParams()
  const token   = params.token as string
  const [status, setStatus] = useState<'loading'|'ready'|'expired'|'exhausted'|'error'>('loading')
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    fetch('/api/delivery/' + token)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setStatus(d.status ?? 'error'); return }
        setProduct(d)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [token])

  const BG   = '#050A18'
  const GOLD = '#D4AF37'
  const W    = '#F0F9FF'
  const MUTED= '#64748B'

  if (status === 'loading') return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontFamily:'Georgia,serif' }}>
      Verifying your download link...
    </div>
  )

  if (status === 'expired') return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Georgia,serif', textAlign:'center', color:W, padding:20 }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>⏰</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900, marginBottom:8, color:GOLD }}>Link Expired</div>
        <div style={{ fontSize:14, color:MUTED }}>This download link has expired (24 hour limit). Please contact the seller for a new link.</div>
      </div>
    </div>
  )

  if (status === 'exhausted') return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Georgia,serif', textAlign:'center', color:W, padding:20 }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900, marginBottom:8, color:GOLD }}>Download Limit Reached</div>
        <div style={{ fontSize:14, color:MUTED }}>This link has reached its maximum downloads. Please contact the seller for assistance.</div>
      </div>
    </div>
  )

  if (status === 'error' || !product) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Georgia,serif', textAlign:'center', color:W, padding:20 }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>❌</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900, marginBottom:8 }}>Invalid Link</div>
        <div style={{ fontSize:14, color:MUTED }}>This download link is invalid. Please contact the seller.</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:10, color:GOLD, letterSpacing:4, textTransform:'uppercase', marginBottom:16 }}>Your Download is Ready</div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:W, marginBottom:8 }}>
          {product.product_title}
        </h1>
        <div style={{ fontSize:13, color:MUTED, marginBottom:32 }}>
          {product.downloads_remaining} download{product.downloads_remaining !== 1 ? 's' : ''} remaining · Expires {new Date(product.expires_at).toLocaleDateString('en-ZA')}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <a href={'/api/delivery/' + token + '/zip'}
            style={{ display:'block', padding:'14px 24px', borderRadius:12, background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:15, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            📦 Download Complete Package (ZIP)
          </a>
          <div style={{ fontSize:11, color:MUTED, textAlign:'center' }}>
            Includes: Interactive Reader · Workbook · Bonus Assets
          </div>
        </div>

        <div style={{ marginTop:24, fontSize:11, color:MUTED }}>
          Powered by <a href="https://app.z2blegacybuilders.co.za" style={{ color:GOLD, textDecoration:'none' }}>Z2B Legacy Builders</a>
        </div>
      </div>
    </div>
  )
}