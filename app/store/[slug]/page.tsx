// File: app/store/[slug]/page.tsx — Builder PWA Storefront
import { createClient }  from '@supabase/supabase-js'
import { notFound }      from 'next/navigation'
import Link              from 'next/link'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

async function getPWA(slug: string) {
  const { data: pwa } = await (sb.from as any)('builder_pwas').select('*').eq('slug', slug).eq('is_live', true).maybeSingle() as { data: any }
  return pwa
}

async function getProducts(builderId: string) {
  const { data } = await (sb.from as any)('marketplace_products').select('id, title, description, price, format, keywords').eq('seller_id', builderId).eq('status', 'active').order('created_at', { ascending: false }).limit(20) as { data: any[] | null }
  return data ?? []
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pwa = await getPWA(slug)
  if (!pwa) return notFound()
  const products = await getProducts(pwa.builder_id)
  const accent = pwa.accent_color ?? '#D4AF37'

  return (
    <div style={{ minHeight: '100vh', background: '#050A18', color: '#F0F9FF', fontFamily: 'Georgia,serif' }}>
      {/* PWA meta */}
      <div style={{ background: `linear-gradient(135deg, ${accent}22, transparent)`, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '32px 20px 24px', textAlign: 'center' }}>
        {pwa.logo_url && <img src={pwa.logo_url} alt={pwa.display_name} style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '12px', objectFit: 'cover' }} />}
        <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#F0F9FF', marginBottom: '8px' }}>{pwa.display_name}</h1>
        {pwa.tagline && <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>{pwa.tagline}</p>}
      </div>

      {/* Products */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Digital Products</div>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No products yet — check back soon.</div>
        ) : (
          products.map(p => (
            <div key={p.id} style={{ marginBottom: '10px', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: '#F0F9FF', flex: 1 }}>{p.title}</div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: accent, flexShrink: 0, marginLeft: '12px' }}>R{p.price}</div>
              </div>
              {p.description && <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.7, marginBottom: '10px' }}>{(p.description as string).slice(0, 120)}...</div>}
              <Link href={`/marketplace`} style={{ display: 'inline-block', padding: '8px 18px', borderRadius: '10px', background: accent, color: '#050A18', fontWeight: 900, fontSize: '12px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Get This Product →
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', color: '#64748B' }}>Powered by <Link href="https://app.z2blegacybuilders.co.za" style={{ color: accent, textDecoration: 'none' }}>Z2B Legacy Builders</Link></div>
      </div>
    </div>
  )
}
