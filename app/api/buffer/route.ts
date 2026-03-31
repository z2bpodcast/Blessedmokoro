// FILE: app/api/buffer/route.ts
// Buffer API integration — verify token + send posts to Buffer queue
// Z2B Affiliate: https://dub.sh/OjXitzf

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const Z2B_BUFFER_AFFILIATE = 'https://dub.sh/OjXitzf'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET /api/buffer ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action')

  if (action === 'affiliate') {
    return NextResponse.json({ url: Z2B_BUFFER_AFFILIATE })
  }

  try {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

    const res = await fetch('https://api.bufferapp.com/1/updates/pending.json', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // Safe JSON parsing
    const text = await res.text()
    let data: any = {}
    try { data = JSON.parse(text) } catch { data = {} }

    return NextResponse.json({ queue: data.updates || [], total: data.total || 0 })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── POST /api/buffer ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = getSupabase()

  try {
    const body = await req.json()
    const { action, token, post, channel_ids, scheduled_at } = body

    // ── ACTION: verify ────────────────────────────────────────
    if (action === 'verify') {
      if (!token) {
        return NextResponse.json({
          error: 'No token provided. Please paste your Buffer Access Token.',
          signup_url: Z2B_BUFFER_AFFILIATE,
        }, { status: 400 })
      }

      const res = await fetch('https://api.bufferapp.com/1/profiles.json', {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
      })

      // Read as text first to avoid JSON parse crash on empty/HTML responses
      const rawText = await res.text()

      // Check if response is empty
      if (!rawText || rawText.trim() === '') {
        return NextResponse.json({
          error: 'Buffer returned an empty response. Your token may be invalid or expired.',
          signup_url: Z2B_BUFFER_AFFILIATE,
        }, { status: 400 })
      }

      // Try to parse JSON
      let profiles: any[]
      try {
        const parsed = JSON.parse(rawText)
        // Buffer returns array for valid token, object with error for invalid
        if (Array.isArray(parsed)) {
          profiles = parsed
        } else if (parsed.error) {
          return NextResponse.json({
            error: `Buffer error: ${parsed.error}. Please check your token.`,
            signup_url: Z2B_BUFFER_AFFILIATE,
          }, { status: 400 })
        } else {
          profiles = []
        }
      } catch {
        return NextResponse.json({
          error: 'Could not read Buffer response. Token may be invalid.',
          signup_url: Z2B_BUFFER_AFFILIATE,
        }, { status: 400 })
      }

      const channels = profiles.map((p: any) => ({
        id:               p.id,
        service:          p.service,
        service_username: p.service_username || p.formatted_username || p.id,
        avatar:           p.avatar || '',
      }))

      return NextResponse.json({
        channels,
        affiliate_url: Z2B_BUFFER_AFFILIATE,
      })
    }

    // ── ACTION: schedule ──────────────────────────────────────
    if (action === 'schedule') {
      if (!token || !post || !channel_ids?.length) {
        return NextResponse.json({ error: 'token, post and channel_ids required' }, { status: 400 })
      }

      const results = []

      for (const profileId of channel_ids) {
        const formBody = new URLSearchParams({
          'profile_ids[]': profileId,
          'text':          `${post.caption}\n\n${post.body}\n\n${post.hashtags}`,
          'shorten':       'true',
          'now':           scheduled_at ? 'false' : 'true',
        })

        if (scheduled_at) {
          formBody.append('scheduled_at', String(Math.floor(new Date(scheduled_at).getTime() / 1000)))
        }

        const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
          method:  'POST',
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody.toString(),
        })

        const rawText = await res.text()
        let data: any = {}
        try { data = JSON.parse(rawText) } catch { data = {} }

        if (data.success || data.update) {
          results.push({ profile_id: profileId, success: true, buffer_id: data.update?.id })
        } else {
          results.push({ profile_id: profileId, success: false, error: data.message || 'Unknown error' })
        }
      }

      // Update post record in Supabase
      try {
        await supabase.from('cs_plus_posts').update({
          posted_at:      scheduled_at ? null : new Date().toISOString(),
          scheduled_date: scheduled_at ? new Date(scheduled_at).toISOString().split('T')[0] : null,
        }).eq('id', post.id)
      } catch { /* non-fatal */ }

      return NextResponse.json({
        success:  results.every(r => r.success),
        sent:     results.filter(r => r.success).length,
        failed:   results.filter(r => !r.success).length,
        results,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch(e: any) {
    console.error('[Buffer API]', e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
