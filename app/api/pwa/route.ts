// File: app/api/pwa/route.ts — Builder PWA management
import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null }
  const { data: { user } } = await sb().auth.getUser(token)
  return { user }
}

// GET — load builder's PWAs
export async function GET(req: NextRequest) {
  const { user } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data } = await (sb().from as any)('builder_pwas')
    .select('*')
    .eq('builder_id', user.id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return NextResponse.json({ pwas: data ?? [] })
}

// POST — create or update a PWA
export async function POST(req: NextRequest) {
  const { user } = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { action, pwa } = body

  // Check tier allows PWA
  const { data: profile } = await (sb().from as any)('profiles')
    .select('paid_tier')
    .eq('id', user.id)
    .maybeSingle() as { data: any }

  const allowedTiers = ['copper','silver','gold','platinum']
  const { normaliseTier } = await import('@/lib/v3/tier-config')
  const tier = normaliseTier(profile?.paid_tier ?? 'fam')
  if (!allowedTiers.includes(tier)) {
    return NextResponse.json({ error: 'Builder PWA requires Copper tier or higher.', upgradeRequired: true }, { status: 403 })
  }

  // PWA limits per tier
  const PWA_LIMITS: Record<string, number> = { copper: 1, silver: 3, gold: 5, platinum: 999 }
  const limit = PWA_LIMITS[tier] ?? 1

  if (action === 'create') {
    // Check existing count
    const { count } = await (sb().from as any)('builder_pwas')
      .select('id', { count: 'exact', head: true })
      .eq('builder_id', user.id) as { count: number | null }

    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: `Your ${tier} tier allows ${limit} PWA${limit > 1 ? 's' : ''}. Upgrade to add more.` }, { status: 403 })
    }

    // Check slug is unique
    const { data: existing } = await (sb().from as any)('builder_pwas')
      .select('id')
      .eq('slug', pwa.slug)
      .maybeSingle() as { data: any }

    if (existing) return NextResponse.json({ error: 'This URL is already taken. Choose a different name.' }, { status: 409 })

    const { data, error } = await (sb().from as any)('builder_pwas').insert({
      builder_id:        user.id,
      slug:              pwa.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      display_name:      pwa.display_name,
      tagline:           pwa.tagline,
      about:             pwa.about,
      accent_color:      pwa.accent_color ?? '#D4AF37',
      tier_required:     tier,
      community_enabled: ['silver','gold','platinum'].includes(tier),
      community_paid:    ['gold','platinum'].includes(tier) && (pwa.community_paid ?? false),
      community_price:   pwa.community_price ?? null,
      is_live:           pwa.is_live ?? false,
    }).select().single() as { data: any; error: any }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, pwa: data })
  }

  if (action === 'update') {
    const { data, error } = await (sb().from as any)('builder_pwas')
      .update({
        display_name:  pwa.display_name,
        tagline:       pwa.tagline,
        about:         pwa.about,
        accent_color:  pwa.accent_color,
        is_live:       pwa.is_live,
        community_paid:   pwa.community_paid,
        community_price:  pwa.community_price,
        updated_at:    new Date().toISOString(),
      })
      .eq('id', pwa.id)
      .eq('builder_id', user.id)
      .select().single() as { data: any; error: any }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, pwa: data })
  }

  if (action === 'delete') {
    await (sb().from as any)('builder_pwas').delete().eq('id', pwa.id).eq('builder_id', user.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
