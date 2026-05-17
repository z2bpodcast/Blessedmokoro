// ============================================================
// Z2B V3 — PRODUCT DOWNLOAD API
// File: app/api/gear/download/route.ts
// Allows builders to download everything 4M created:
//   - Full content (all sections as text)
//   - All 8 enhancement assets
//   - Marketplace listing copy
//   - Social media posts
// Builder owns the content — sell anywhere, however
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

async function getUser(req: NextRequest) {
  const sb    = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user }
}

export async function POST(req: NextRequest) {
  const { user } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { sessionId, format } = await req.json()
  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Load session data
  const { data: gs } = await (sb.from as any)('gear_sessions')
    .select('intent_data, structure_data, content_draft, enhancement_assets, packaging_data')
    .eq('id', sessionId)
    .maybeSingle() as { data: any }

  if (!gs) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const intent   = gs.intent_data    ? (typeof gs.intent_data    === 'string' ? JSON.parse(gs.intent_data)    : gs.intent_data)    : null
  const draft    = gs.content_draft  ? (typeof gs.content_draft  === 'string' ? JSON.parse(gs.content_draft)  : gs.content_draft)  : null
  const assets   = gs.enhancement_assets ? (typeof gs.enhancement_assets === 'string' ? JSON.parse(gs.enhancement_assets) : gs.enhancement_assets) : null
  const listing  = gs.packaging_data ? (typeof gs.packaging_data === 'string' ? JSON.parse(gs.packaging_data) : gs.packaging_data) : null

  if (!intent || !draft) return NextResponse.json({ error: 'Incomplete product data' }, { status: 422 })

  // ── BUILD COMPLETE DOWNLOAD PACKAGE ──────────────────────
  const productTitle = intent.productTitle ?? 'Digital Product'
  const separator    = '\n' + '='.repeat(60) + '\n'

  let fullText = ''

  // COVER PAGE
  fullText += `${'='.repeat(60)}\n`
  fullText += `${productTitle.toUpperCase()}\n`
  if (intent.subtitle) fullText += `${intent.subtitle}\n`
  fullText += `${'='.repeat(60)}\n\n`
  if (intent.targetAudience) fullText += `For: ${intent.targetAudience}\n`
  if (intent.problemSolved)  fullText += `Solving: ${intent.problemSolved}\n`
  fullText += `\nCreated with the Z2B 4M Machine\n`
  fullText += `© ${new Date().getFullYear()} ${productTitle}. All rights reserved.\n\n`

  // TABLE OF CONTENTS
  if (draft.sections?.length) {
    fullText += separator
    fullText += 'TABLE OF CONTENTS\n'
    fullText += separator
    draft.sections.forEach((s: any, i: number) => {
      fullText += `${i + 1}. ${s.sectionTitle}\n`
    })
    fullText += '\n'
  }

  // MAIN CONTENT — all sections
  if (draft.sections?.length) {
    draft.sections.forEach((section: any) => {
      fullText += separator
      fullText += `${section.sectionTitle.toUpperCase()}\n`
      fullText += separator
      fullText += `${section.content}\n\n`
      if (section.keyTakeaways?.length) {
        fullText += 'KEY TAKEAWAYS:\n'
        section.keyTakeaways.forEach((t: string) => fullText += `• ${t}\n`)
        fullText += '\n'
      }
    })
  }

  // BONUS / ENHANCEMENT ASSETS
  if (assets?.assets?.length) {
    fullText += separator
    fullText += 'PREMIUM ASSETS INCLUDED\n'
    fullText += separator
    assets.assets.forEach((asset: any) => {
      fullText += `\n--- ${asset.title ?? asset.type?.toUpperCase()} ---\n\n`
      if (asset.content)   fullText += `${asset.content}\n`
      if (asset.items?.length) {
        asset.items.forEach((item: any, i: number) => {
          if (typeof item === 'string') fullText += `${i+1}. ${item}\n`
          else if (item.text) fullText += `${i+1}. ${item.text}\n`
          else if (item.step) fullText += `${i+1}. ${item.step}: ${item.action ?? ''}\n`
        })
      }
      fullText += '\n'
    })
  }

  // MARKETPLACE LISTING (for sellers)
  if (listing) {
    fullText += separator
    fullText += 'YOUR MARKETPLACE LISTING COPY\n'
    fullText += '(Use this on Selar, Gumroad, Payhip, WhatsApp and any other platform)\n'
    fullText += separator
    if (listing.title)       fullText += `TITLE:\n${listing.title}\n\n`
    if (listing.description) fullText += `DESCRIPTION:\n${listing.description}\n\n`
    if (listing.keywords?.length) fullText += `KEYWORDS:\n${listing.keywords.join(', ')}\n\n`
    if (listing.socialPosts) {
      fullText += `SOCIAL MEDIA POSTS:\n`
      Object.entries(listing.socialPosts).forEach(([platform, post]: [string, any]) => {
        fullText += `\n${platform.toUpperCase()}:\n${post}\n`
      })
    }
  }

  fullText += separator
  fullText += 'END OF DOCUMENT\n'
  fullText += `Generated by Z2B 4M Machine on ${new Date().toLocaleDateString('en-ZA')}\n`
  fullText += 'app.z2blegacybuilders.co.za\n'
  fullText += separator

  // Return as downloadable text file
  return new NextResponse(fullText, {
    status: 200,
    headers: {
      'Content-Type':        'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${productTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-complete.txt"`,
      'Cache-Control':       'no-cache',
    },
  })
}
