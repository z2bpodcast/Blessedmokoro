var fs = require('fs');

// ── API: Generate delivery token ──────────────────────────────
var generateRoute = `import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { data: { user } } = await sb().auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { sessionId, buyerEmail, buyerName, productTitle } = await req.json()
  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await (sb().from as any)('product_delivery_tokens').insert({
    session_id:    sessionId,
    builder_id:    user.id,
    buyer_email:   buyerEmail ?? '',
    buyer_name:    buyerName  ?? '',
    product_title: productTitle ?? '',
    max_downloads: 2,
    expires_at:    expires,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const link = \`\${process.env.NEXT_PUBLIC_APP_URL}/download/\${data.token}\`
  return NextResponse.json({ token: data.token, link, expires })
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { data: { user } } = await sb().auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data } = await (sb().from as any)('product_delivery_tokens')
    .select('*')
    .eq('builder_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ tokens: data ?? [] })
}`;

require('fs').mkdirSync('app/api/delivery', { recursive: true });
fs.writeFileSync('app/api/delivery/route.ts', generateRoute);
console.log('delivery route done');

// ── DOWNLOAD PAGE ─────────────────────────────────────────────
var downloadPage = `'use client'
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
          <a href={'/api/delivery/' + token + '/html'}
            style={{ display:'block', padding:'14px 24px', borderRadius:12, background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:15, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            📖 Download Interactive Reader (HTML)
          </a>
          <a href={'/api/delivery/' + token + '/assets'}
            style={{ display:'block', padding:'14px 24px', borderRadius:12, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontWeight:700, fontSize:14, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            🧰 Download Bonus Assets (TXT)
          </a>
        </div>

        <div style={{ marginTop:24, fontSize:11, color:MUTED }}>
          Powered by <a href="https://app.z2blegacybuilders.co.za" style={{ color:GOLD, textDecoration:'none' }}>Z2B Legacy Builders</a>
        </div>
      </div>
    </div>
  )
}`;

require('fs').mkdirSync('app/download/[token]', { recursive: true });
fs.writeFileSync('app/download/[token]/page.tsx', downloadPage);
console.log('download page done');

// ── TOKEN VALIDATE + SERVE API ────────────────────────────────
var tokenRoute = `import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: rec } = await (sb().from as any)('product_delivery_tokens')
    .select('*').eq('token', token).maybeSingle()

  if (!rec) return NextResponse.json({ error: 'Invalid link', status: 'error' }, { status: 404 })

  if (new Date(rec.expires_at) < new Date())
    return NextResponse.json({ error: 'Link expired', status: 'expired' }, { status: 410 })

  if (rec.download_count >= rec.max_downloads)
    return NextResponse.json({ error: 'Download limit reached', status: 'exhausted' }, { status: 410 })

  return NextResponse.json({
    product_title:       rec.product_title,
    buyer_name:          rec.buyer_name,
    expires_at:          rec.expires_at,
    downloads_remaining: rec.max_downloads - rec.download_count,
    session_id:          rec.session_id,
  })
}`;

require('fs').mkdirSync('app/api/delivery/[token]', { recursive: true });
fs.writeFileSync('app/api/delivery/[token]/route.ts', tokenRoute);
console.log('token route done');

