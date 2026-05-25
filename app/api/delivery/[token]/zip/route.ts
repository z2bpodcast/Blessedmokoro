import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import JSZip from 'jszip'

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Validate token
  const { data: rec } = await (sb().from as any)('product_delivery_tokens')
    .select('*').eq('token', token).maybeSingle()

  if (!rec) return new NextResponse('Invalid link', { status: 404 })
  if (new Date(rec.expires_at) < new Date()) return new NextResponse('Link expired', { status: 410 })
  if (rec.download_count >= rec.max_downloads) return new NextResponse('Download limit reached', { status: 410 })

  // Increment download count
  await (sb().from as any)('product_delivery_tokens')
    .update({ download_count: rec.download_count + 1 })
    .eq('token', token)

  // Load session
  const { data: session } = await (sb().from as any)('gear_sessions')
    .select('*').eq('id', rec.session_id).maybeSingle()
  if (!session) return new NextResponse('Product not found', { status: 404 })

  const intent   = session.intent_data ?? {}
  let content: any = session.content_draft ?? {}
  if (typeof content === 'string') { try { content = JSON.parse(content) } catch(e) { content = {} } }
  let assets: any = session.enhancement_assets ?? {}
  if (typeof assets === 'string') { try { assets = JSON.parse(assets) } catch(e) { assets = {} } }
  let distData: any = session.distribution_data ?? {}
  if (typeof distData === 'string') { try { distData = JSON.parse(distData) } catch(e) { distData = {} } }

  const title    = intent.productTitle ?? intent.title ?? 'Product'
  const sections = content.sections ?? content.generatedSections ?? []
  const assetList = Array.isArray(assets) ? assets : (assets.assets ?? assets.bundle ?? [])

  // ── BUILD ZIP ──────────────────────────────────────────────
  const zip = new JSZip()

  // 1. README
  const readme = [
    '='.repeat(60),
    title,
    '='.repeat(60),
    '',
    'Thank you for your purchase!',
    '',
    'CONTENTS:',
    '- reader.html    Interactive reader with audio',
    '- workbook.txt   Exercises and reflection questions',
    '- assets.txt     Bonus templates and checklists',
    '',
    'HOW TO USE:',
    '1. Open reader.html in any browser',
    '2. Use the Read, Listen and Workbook tabs',
    '3. Works offline — no internet needed',
    '',
    'Created with Z2B 4M Digital Products Factory',
    'app.z2blegacybuilders.co.za',
    '='.repeat(60),
  ].join('\n')
  zip.file('README.txt', readme)

  // 2. HTML Reader — use full premium reader
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.z2blegacybuilders.co.za'
    const htmlRes = await fetch(baseUrl + '/api/generate-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: rec.session_id, builderBypass: true }),
    })
    if (htmlRes.ok) {
      const html = await htmlRes.text()
      zip.file('reader.html', html)
    }
  } catch(e) {
    console.error('HTML generation failed:', e)
  }

  // 3. Workbook
  const wbLines: string[] = [
    title + ' — Interactive Workbook',
    '='.repeat(60),
    '',
  ]
  sections.forEach((s: any, i: number) => {
    wbLines.push('CHAPTER ' + (i+1) + ': ' + (s.sectionTitle ?? s.title ?? ''))
    wbLines.push('-'.repeat(40))
    wbLines.push('Key Takeaway:')
    wbLines.push('[Write your answer here]')
    wbLines.push('')
    wbLines.push('Action Step (next 7 days):')
    wbLines.push('[Write your answer here]')
    wbLines.push('')
    wbLines.push('Personal Application:')
    wbLines.push('[Write your answer here]')
    wbLines.push('')
    wbLines.push('='.repeat(60))
    wbLines.push('')
  })
  zip.file('workbook.txt', wbLines.join('\n'))

  // 4. Bonus Assets
  if (assetList.length > 0) {
    const assetLines: string[] = [
      title + ' — Bonus Assets & Tools',
      '='.repeat(60),
      '',
    ]
    assetList.forEach((a: any) => {
      assetLines.push('## ' + (a.title ?? a.type ?? 'Asset'))
      assetLines.push('-'.repeat(40))
      if (a.content) assetLines.push(a.content)
      if (a.items && Array.isArray(a.items)) assetLines.push(a.items.join('\n'))
      assetLines.push('')
    })
    zip.file('assets.txt', assetLines.join('\n'))
  }

  // Generate ZIP
  const zipBuffer = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
  const filename  = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-package.zip'

  return new NextResponse(zipBuffer as any, {
    headers: {
      'Content-Type':        'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  })
}// Mon, May 25, 2026  7:53:21 PM
