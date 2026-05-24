// ============================================================
// Z2B — DOWNLOAD PACKAGE API (SPRINT 22)
// File: app/api/download-package/route.ts
// Downloads complete product content from a gear session
// Available at any gear stage
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

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

  // Load the gear session
  const { data: session } = await (sb.from as any)('gear_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('builder_id', user.id)
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const intent    = session.intent_data          ?? {}
  const structure = session.structure_data       ?? {}
  let content: any = session.content_draft      ?? {}
  if (typeof content === 'string') { try { content = JSON.parse(content) } catch(e) { content = {} } }
  let assets: any  = session.enhancement_assets ?? {}
  if (typeof assets === 'string') { try { assets = JSON.parse(assets) } catch(e) { assets = {} } }
  let distData: any = session.distribution_data ?? {}
  if (typeof distData === 'string') { try { distData = JSON.parse(distData) } catch(e) { distData = {} } }
  const listing   = distData?.listing ?? {}

  // Build the download text
  const lines: string[] = []

  // Header
  lines.push('=' .repeat(70))
  lines.push(`  ${intent.productTitle ?? 'My Product'}`)
  if (intent.subtitle) lines.push(`  ${intent.subtitle}`)
  lines.push('='.repeat(70))
  lines.push('')

  // Author
  if (intent.authorName) {
    lines.push(`By ${intent.authorName}`)
    lines.push('')
  }

  // Metadata
  lines.push(`Format:   ${intent.format ?? intent.productFormat ?? 'Digital Product'}`)
  lines.push(`Audience: ${intent.targetAudience ?? ''}`)
  lines.push(`Price:    ${intent.currency ?? 'R'}${intent.priceRecommended ?? intent.suggestedPrice ?? 299}`)
  lines.push('')
  lines.push('Created with Z2B 4M Digital Products Factory')
  lines.push('app.z2blegacybuilders.co.za/ai-income')
  lines.push('')
  lines.push('-'.repeat(70))
  lines.push('')

  // Core promise
  if (intent.corePromise) {
    lines.push('THE PROMISE')
    lines.push(intent.corePromise)
    lines.push('')
  }

  // Table of contents
  const sections = content.sections ?? content.generatedSections ?? structure.sections ?? []
  if (sections.length > 0) {
    lines.push('TABLE OF CONTENTS')
    lines.push('-'.repeat(40))
    sections.forEach((s: any, i: number) => {
      lines.push(`${i + 1}. ${s.title ?? s.heading ?? 'Section ' + (i + 1)}`)
    })
    lines.push('')
    lines.push('='.repeat(70))
    lines.push('')
  }

  // Full content
  const contentSections = content.sections ?? content.generatedSections ?? []
  if (contentSections.length > 0) {
    contentSections.forEach((s: any, i: number) => {
      lines.push(`SECTION ${i + 1}: ${s.title ?? s.heading ?? ''}`)
      lines.push('='.repeat(50))
      lines.push('')
      lines.push(s.content ?? s.text ?? s.body ?? '')
      lines.push('')
      lines.push('-'.repeat(50))
      lines.push('')
    })
  }

  // Assets
  const assetList = Array.isArray(assets) ? assets : (assets.assets ?? assets.bundle ?? [])
  if (assetList.length > 0) {
    lines.push('')
    lines.push('='.repeat(70))
    lines.push('BONUS ASSETS & TOOLS')
    lines.push('='.repeat(70))
    lines.push('')
    assetList.forEach((a: any) => {
      lines.push(`## ${a.title ?? a.type ?? 'Asset'}`)
      lines.push('')
      if (a.content) lines.push(a.content)
      if (a.items)   lines.push(a.items.join('\n'))
      lines.push('')
    })
  }

  // Listing copy
  if (listing.listingTitle || listing.listingBody) {
    lines.push('')
    lines.push('='.repeat(70))
    lines.push('MARKETPLACE LISTING COPY')
    lines.push('='.repeat(70))
    lines.push('')
    if (listing.listingTitle) lines.push(`Title: ${listing.listingTitle}`)
    if (listing.listingBody)  lines.push(`\n${listing.listingBody}`)
    lines.push('')
  }

  // Social posts
  const posts = distData?.socialPosts ?? listing.socialPosts ?? {}
  const postKeys = Object.keys(posts)
  if (postKeys.length > 0) {
    lines.push('')
    lines.push('='.repeat(70))
    lines.push('SOCIAL MEDIA POSTS')
    lines.push('='.repeat(70))
    lines.push('')
    postKeys.forEach(platform => {
      lines.push(`## ${platform.toUpperCase()}`)
      lines.push(posts[platform])
      lines.push('')
    })
  }

  // Footer
  lines.push('='.repeat(70))
  lines.push('Created with Z2B 4M Digital Products Factory')
  lines.push('app.z2blegacybuilders.co.za/ai-income')
  lines.push('Zero 2 Billionaires Legacy Builders')
  lines.push('support@z2blegacybuilders.co.za')
  lines.push('='.repeat(70))

  const text     = lines.join('\n')
  const filename = (intent.productTitle ?? 'my-product')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '.txt'

  return new NextResponse(text, {
    headers: {
      'Content-Type':        'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
