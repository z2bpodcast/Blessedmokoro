var fs = require('fs');

// HTML serve route
var htmlRoute = `import { NextRequest, NextResponse } from 'next/server'
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

  if (!rec) return new NextResponse('Invalid link', { status: 404 })
  if (new Date(rec.expires_at) < new Date()) return new NextResponse('Link expired', { status: 410 })
  if (rec.download_count >= rec.max_downloads) return new NextResponse('Download limit reached', { status: 410 })

  // Increment download count
  await (sb().from as any)('product_delivery_tokens')
    .update({ download_count: rec.download_count + 1 })
    .eq('token', token)

  // Generate HTML via existing generator
  const session = await (sb().from as any)('gear_sessions')
    .select('*').eq('id', rec.session_id).maybeSingle()

  if (!session.data) return new NextResponse('Product not found', { status: 404 })

  // Call generate-html logic inline
  const res = await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/generate-html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': req.headers.get('authorization') ?? '' },
    body: JSON.stringify({ sessionId: rec.session_id, builderBypass: rec.builder_id }),
  })

  const html = await res.text()
  const filename = (rec.product_title ?? 'product').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50) + '.html'

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': \`attachment; filename="\${filename}"\`,
    }
  })
}`;

require('fs').mkdirSync('app/api/delivery/[token]/html', { recursive: true });
fs.writeFileSync('app/api/delivery/[token]/html/route.ts', htmlRoute);
console.log('html serve done');

