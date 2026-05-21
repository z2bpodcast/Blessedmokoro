// ============================================================
// Z2B — HTML PRODUCT GENERATOR API v2
// File: app/api/generate-html/route.ts
// Uses correct column names from gear_sessions
// Design: Playfair Display · Gold · Purple — Z2B book aesthetic
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { getThemeForProduct }        from '@/lib/v3/html-themes'

async function getUser(req: NextRequest) {
  const sb = createClient(
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
    .select('intent_data, structure_data, content_draft, enhancement_assets, distribution_data, opportunity_data')
    .eq('id', sessionId)
    .eq('builder_id', user.id)
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const intent    = session.intent_data        ?? {}
  const structure = session.structure_data     ?? {}
  const content   = session.content_draft      ?? {}
  const assets    = session.enhancement_assets ?? {}
  const dist      = session.distribution_data  ?? {}

  const title    = intent.productTitle    ?? intent.title    ?? 'My Product'
  const subtitle = intent.subtitle        ?? intent.hookLine ?? ''
  const author   = intent.authorName      ?? ''
  const audience = intent.targetAudience  ?? ''
  const format   = intent.format          ?? intent.productFormat ?? 'ebook'
  const currency = intent.currency        ?? 'R'
  const price    = intent.priceRecommended ?? intent.suggestedPrice ?? 299
  const promise  = intent.corePromise     ?? intent.promiseStatement ?? ''
  const theme    = getThemeForProduct(title, format, audience)

  // Extract sections from content_draft — try multiple structures
  let sections: any[] = []
  if (Array.isArray(content.sections))          sections = content.sections
  else if (Array.isArray(content.generatedSections)) sections = content.generatedSections
  else if (Array.isArray(structure.sections))   sections = structure.sections
  else if (typeof content === 'object') {
    // Sometimes content is stored as { section1: {...}, section2: {...} }
    sections = Object.values(content).filter((v: any) => v?.title || v?.heading || v?.content)
  }

  // Extract assets
  let assetList: any[] = []
  if (Array.isArray(assets.assets))  assetList = assets.assets
  else if (Array.isArray(assets))    assetList = assets

  const FORMAT_LABEL: Record<string, string> = {
    ebook: 'eBook & Guide', toolkit: 'Toolkit & Templates',
    course: 'Course & Masterclass', framework: 'Framework & Protocol',
    template: 'Template Pack', workbook: 'Workbook',
    checklist: 'Checklist & Reference', printable: 'Printable & Planner',
  }

  // Table of contents
  const tocHTML = sections.length > 0 ? sections.map((s: any, i: number) =>
    `<li><a href="#sec${i+1}">${i+1}. ${s.title ?? s.heading ?? 'Section ' + (i+1)}</a></li>`
  ).join('') : ''

  // Section content
  const sectionsHTML = sections.map((s: any, i: number) => {
    const raw = s.content ?? s.text ?? s.body ?? ''
    const paras = String(raw).split(/\n\n+/).filter(p => p.trim())
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
    return `
    <section id="sec${i+1}" class="section">
      <div class="section-num">${i+1}</div>
      <h2 class="section-title">${s.title ?? s.heading ?? 'Section ' + (i+1)}</h2>
      <div class="section-body">${paras || '<p>Content coming soon.</p>'}</div>
    </section>`
  }).join('')

  // Assets HTML
  const assetsHTML = assetList.length > 0 ? `
  <div class="assets-section">
    <h2 class="chapter-title">Bonus Assets & Tools</h2>
    ${assetList.map((a: any) => `
    <div class="asset-card">
      <h3 class="asset-title">${a.title ?? a.type ?? 'Asset'}</h3>
      <div class="asset-body">${String(a.content ?? (Array.isArray(a.items) ? a.items.join('<br>') : '')).replace(/\n/g, '<br>')}</div>
    </div>`).join('')}
  </div>` : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
:root {
  --gold: #c9a227;
  --gold-bright: #f0c040;
  --purple: #2d1b69;
  --deep: #0f0d18;
  --black: #080608;
  --white: #f5f0e8;
  --muted: #a09070;
  --accent: ${theme.accentColor};
  --primary: ${theme.primaryColor};
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Lato', Georgia, serif; background: var(--black); color: var(--white); line-height: 1.8; }

/* COVER */
.cover {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--black) 0%, var(--purple) 50%, var(--black) 100%);
  display: flex; flex-direction: column; justify-content: space-between;
  padding: clamp(40px,8vw,80px);
  position: relative; overflow: hidden;
}
.cover::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 5px;
  background: linear-gradient(90deg, var(--gold), var(--gold-bright), var(--gold));
}
.cover::after {
  content: '';
  position: absolute;
  top: 20%; right: -10%; width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%);
  border-radius: 50%;
}
.cover-format {
  font-family: 'Lato', sans-serif;
  font-size: 11px; letter-spacing: 5px; text-transform: uppercase;
  color: var(--gold); margin-bottom: 32px;
}
.cover-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(32px, 6vw, 72px);
  font-weight: 900; line-height: 1.1;
  color: var(--white); margin-bottom: 20px;
  text-shadow: 0 0 60px rgba(201,162,39,0.2);
}
.cover-subtitle {
  font-family: 'Playfair Display', serif;
  font-size: clamp(16px, 2.5vw, 22px);
  font-style: italic; color: var(--gold);
  margin-bottom: 40px; max-width: 600px; line-height: 1.5;
}
.cover-promise {
  background: rgba(201,162,39,0.1);
  border: 1px solid rgba(201,162,39,0.3);
  border-left: 4px solid var(--gold);
  padding: 20px 24px; border-radius: 0 12px 12px 0;
  font-style: italic; color: var(--gold);
  font-size: 15px; max-width: 600px;
  margin-bottom: 32px; line-height: 1.7;
}
.cover-author { font-size: 14px; color: rgba(245,240,232,0.7); margin-bottom: 12px; }
.cover-meta {
  font-size: 10px; color: rgba(201,162,39,0.5);
  letter-spacing: 1px; line-height: 2;
}
.cover-divider {
  width: 80px; height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
  margin: 24px 0;
}

/* READER NAV */
.reader-nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(8,6,8,0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(201,162,39,0.2);
  padding: 12px 24px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 8px;
}
.nav-title { font-family: 'Playfair Display', serif; font-size: 14px; color: var(--gold); }
.nav-links { display: flex; gap: 8px; flex-wrap: wrap; }
.nav-link {
  font-size: 11px; padding: 5px 12px; border-radius: 4px;
  background: rgba(201,162,39,0.1); color: var(--gold);
  border: 1px solid rgba(201,162,39,0.25);
  cursor: pointer; text-decoration: none;
  font-family: 'Lato', sans-serif; letter-spacing: 1px;
}

/* TOC */
.toc-section {
  max-width: 800px; margin: 0 auto; padding: 60px 40px;
}
.chapter-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px; font-weight: 700;
  color: var(--gold); margin-bottom: 32px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(201,162,39,0.2);
}
.toc-list { list-style: none; }
.toc-list li {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 15px;
}
.toc-list a {
  color: rgba(245,240,232,0.8); text-decoration: none;
  transition: color 0.2s;
}
.toc-list a:hover { color: var(--gold); }

/* SECTIONS */
.section {
  max-width: 800px; margin: 0 auto;
  padding: 60px 40px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.section-num {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), #8B6914);
  display: flex; align-items: center; justify-content: center;
  color: var(--black); font-weight: 900; font-size: 18px;
  margin-bottom: 20px;
  font-family: 'Playfair Display', serif;
}
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 700; color: var(--white);
  margin-bottom: 28px; line-height: 1.3;
}
.section-body p {
  font-size: 16px; line-height: 1.9;
  color: rgba(245,240,232,0.85);
  margin-bottom: 20px;
}

/* ASSETS */
.assets-section {
  max-width: 800px; margin: 0 auto;
  padding: 60px 40px;
  background: rgba(45,27,105,0.1);
}
.asset-card {
  background: rgba(201,162,39,0.06);
  border: 1px solid rgba(201,162,39,0.2);
  border-radius: 12px; padding: 28px;
  margin-bottom: 24px;
}
.asset-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px; color: var(--gold);
  margin-bottom: 16px;
}
.asset-body {
  font-size: 15px; line-height: 1.8;
  color: rgba(245,240,232,0.8);
}

/* FOOTER */
.product-footer {
  text-align: center; padding: 60px 40px;
  border-top: 1px solid rgba(201,162,39,0.2);
  background: linear-gradient(180deg, transparent, rgba(45,27,105,0.1));
}
.product-footer p {
  font-size: 12px; color: rgba(201,162,39,0.5);
  line-height: 2; letter-spacing: 1px;
}
.product-footer a { color: var(--gold); text-decoration: none; }

@media (max-width: 600px) {
  .cover { padding: 32px 24px; }
  .section, .toc-section { padding: 40px 20px; }
}
@media print {
  .reader-nav { display: none; }
  .cover { page-break-after: always; }
  .section { page-break-inside: avoid; }
}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div>
    <div class="cover-format">${FORMAT_LABEL[format] ?? 'Digital Product'}</div>
    <h1 class="cover-title">${title}</h1>
    ${subtitle ? `<div class="cover-subtitle">${subtitle}</div>` : ''}
    <div class="cover-divider"></div>
    ${promise ? `<div class="cover-promise">"${promise}"</div>` : ''}
  </div>
  <div>
    ${author ? `<div class="cover-author">By <strong>${author}</strong></div>` : ''}
    <div class="cover-meta">
      ${currency}${price} &nbsp;·&nbsp; ${FORMAT_LABEL[format] ?? 'Digital Product'}<br>
      Created with Z2B 4M Digital Products Factory<br>
      app.z2blegacybuilders.co.za/ai-income
    </div>
  </div>
</div>

<!-- READER NAV -->
<nav class="reader-nav">
  <div class="nav-title">📖 ${title}</div>
  <div class="nav-links">
    <a href="#toc" class="nav-link">Contents</a>
    ${sections.map((_: any, i: number) => `<a href="#sec${i+1}" class="nav-link">${i+1}</a>`).join('')}
    ${assetList.length > 0 ? `<a href="#assets" class="nav-link">Assets</a>` : ''}
  </div>
</nav>

<!-- TABLE OF CONTENTS -->
${sections.length > 0 ? `
<div class="toc-section" id="toc">
  <h2 class="chapter-title">Table of Contents</h2>
  <ol class="toc-list">${tocHTML}</ol>
</div>` : ''}

<!-- SECTIONS -->
${sectionsHTML}

<!-- ASSETS -->
${assetList.length > 0 ? `<div id="assets">${assetsHTML}</div>` : ''}

<!-- FOOTER -->
<div class="product-footer">
  <p>
    Created with Z2B 4M Digital Products Factory<br>
    <a href="https://app.z2blegacybuilders.co.za/ai-income">app.z2blegacybuilders.co.za/ai-income</a><br>
    Zero 2 Billionaires Legacy Builders &nbsp;·&nbsp; support@z2blegacybuilders.co.za
  </p>
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
