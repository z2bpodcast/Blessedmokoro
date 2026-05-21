// ============================================================
// Z2B — HTML PRODUCT GENERATOR API
// File: app/api/generate-html/route.ts
// Generates a beautiful self-contained HTML product file
// Unique theme per product · Cover page · TOC · Full content
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { getThemeForProduct }        from '@/lib/v3/html-themes'

async function getUser(req: NextRequest) {
  const sb    = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, sb }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user, sb }
}

export async function POST(req: NextRequest) {
  const { user, sb } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { sessionId } = await req.json()
  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  const { data: session } = await (sb.from as any)('gear_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('builder_id', user.id)
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const intent    = session.intent_data   ?? {}
  const structure = session.structure_data ?? {}
  const content   = session.content_data  ?? {}
  const assets    = session.assets_data   ?? {}

  const title       = intent.productTitle    ?? 'My Product'
  const subtitle    = intent.subtitle        ?? ''
  const author      = intent.authorName      ?? ''
  const audience    = intent.targetAudience  ?? ''
  const format      = intent.format          ?? 'ebook'
  const currency    = intent.currency        ?? 'R'
  const price       = intent.priceRecommended ?? intent.suggestedPrice ?? 299
  const promise     = intent.corePromise     ?? ''
  const theme       = getThemeForProduct(title, format, audience)

  const sections    = content.sections ?? content.generatedSections ?? []
  const assetList   = assets.assets    ?? assets.bundle ?? []

  const FORMAT_LABEL: Record<string, string> = {
    ebook: 'eBook & Guide', toolkit: 'Toolkit & Templates',
    course: 'Course & Masterclass', framework: 'Framework & Protocol',
    template: 'Template Pack', workbook: 'Workbook',
    checklist: 'Checklist & Reference', printable: 'Printable & Planner',
  }

  // Build TOC
  const tocItems = sections.map((s: any, i: number) =>
    `<li><a href="#section-${i + 1}" style="color:${theme.accentColor};text-decoration:none;">${i + 1}. ${s.title ?? s.heading ?? 'Section ' + (i + 1)}</a></li>`
  ).join('\n')

  // Build sections
  const sectionHTML = sections.map((s: any, i: number) => {
    const sectionContent = (s.content ?? s.text ?? s.body ?? '')
      .split('\n\n')
      .filter((p: string) => p.trim())
      .map((p: string) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('\n')

    return `
      <section id="section-${i + 1}" style="margin-bottom:60px;padding-bottom:40px;border-bottom:1px solid ${theme.mutedColor}20;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
          <div style="width:40px;height:40px;border-radius:50%;background:${theme.accentColor};display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:16px;flex-shrink:0;">${i + 1}</div>
          <h2 style="font-family:${theme.fontHeading};font-size:24px;font-weight:900;color:${theme.primaryColor};margin:0;line-height:1.3;">${s.title ?? s.heading ?? 'Section ' + (i + 1)}</h2>
        </div>
        <div style="font-size:16px;line-height:1.9;color:${theme.textColor};">
          ${sectionContent}
        </div>
      </section>`
  }).join('\n')

  // Build assets
  const assetsHTML = assetList.length > 0 ? `
    <div style="page-break-before:always;margin-top:80px;">
      <h2 style="font-family:${theme.fontHeading};font-size:28px;color:${theme.primaryColor};text-align:center;margin-bottom:40px;">Bonus Assets & Tools</h2>
      ${assetList.map((a: any) => `
        <div style="background:${theme.accentColor}10;border:1px solid ${theme.accentColor}30;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h3 style="font-family:${theme.fontHeading};color:${theme.primaryColor};margin:0 0 12px;">${a.title ?? a.type ?? 'Asset'}</h3>
          <div style="color:${theme.textColor};line-height:1.8;font-size:15px;">${(a.content ?? (Array.isArray(a.items) ? a.items.join('<br>') : '')).replace(/\n/g, '<br>')}</div>
        </div>`).join('')}
    </div>` : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${theme.fontBody}; background: ${theme.bgColor}; color: ${theme.textColor}; line-height: 1.7; }
    .cover { min-height: 100vh; background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}DD); display: flex; flex-direction: column; justify-content: space-between; padding: 60px; position: relative; overflow: hidden; }
    .cover::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${theme.accentColor}; }
    .cover::after { content: ''; position: absolute; bottom: 80px; left: 60px; right: 60px; height: 1px; background: ${theme.accentColor}40; }
    .content { max-width: 800px; margin: 0 auto; padding: 60px 40px; }
    .toc { background: ${theme.accentColor}08; border: 1px solid ${theme.accentColor}25; border-radius: 16px; padding: 40px; margin-bottom: 60px; }
    .toc ol { padding-left: 20px; }
    .toc li { padding: 8px 0; font-size: 15px; border-bottom: 1px solid ${theme.mutedColor}15; }
    .toc li:last-child { border-bottom: none; }
    p { margin-bottom: 16px; font-size: 16px; }
    blockquote { border-left: 4px solid ${theme.accentColor}; padding: 16px 24px; margin: 24px 0; background: ${theme.accentColor}08; border-radius: 0 8px 8px 0; font-style: italic; color: ${theme.mutedColor}; }
    @media print { .cover { page-break-after: always; } }
    @media (max-width: 600px) { .cover { padding: 40px 24px; } .content { padding: 40px 20px; } }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover">
    <div>
      <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${theme.accentColor};margin-bottom:24px;">${FORMAT_LABEL[format] ?? 'Digital Product'}</div>
      <h1 style="font-family:${theme.fontHeading};font-size:clamp(28px,5vw,52px);font-weight:900;color:white;line-height:1.15;margin-bottom:20px;">${title}</h1>
      ${subtitle ? `<p style="font-size:18px;color:${theme.accentColor}CC;line-height:1.6;max-width:600px;">${subtitle}</p>` : ''}
    </div>
    <div>
      ${promise ? `<div style="background:${theme.accentColor}20;border:1px solid ${theme.accentColor}40;border-radius:12px;padding:20px 24px;margin-bottom:24px;font-size:14px;color:${theme.accentColor};font-style:italic;max-width:600px;">"${promise}"</div>` : ''}
      ${author ? `<div style="font-size:14px;color:white;margin-bottom:16px;">By <strong>${author}</strong></div>` : ''}
      <div style="font-size:10px;color:${theme.accentColor}60;letter-spacing:1px;line-height:1.8;">
        Created with Z2B 4M Digital Products Factory<br>
        app.z2blegacybuilders.co.za/ai-income<br>
        ${currency}${price}
      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <div class="content">

    <!-- TABLE OF CONTENTS -->
    ${sections.length > 0 ? `
    <div class="toc">
      <h2 style="font-family:${theme.fontHeading};font-size:22px;color:${theme.primaryColor};margin-bottom:24px;">Table of Contents</h2>
      <ol style="list-style:none;padding:0;">${tocItems}</ol>
    </div>` : ''}

    <!-- SECTIONS -->
    ${sectionHTML}

    <!-- ASSETS -->
    ${assetsHTML}

    <!-- FOOTER -->
    <div style="margin-top:80px;padding-top:40px;border-top:2px solid ${theme.accentColor}30;text-align:center;">
      <div style="font-size:13px;color:${theme.mutedColor};line-height:2;">
        Created with Z2B 4M Digital Products Factory<br>
        <a href="https://app.z2blegacybuilders.co.za/ai-income" style="color:${theme.accentColor};">app.z2blegacybuilders.co.za/ai-income</a><br>
        Zero 2 Billionaires Legacy Builders · support@z2blegacybuilders.co.za
      </div>
    </div>

  </div>
</body>
</html>`

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '.html'

  return new NextResponse(html, {
    headers: {
      'Content-Type':        'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
