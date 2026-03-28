// FILE: app/api/buffer/route.ts
// Buffer API integration — verify token + send posts to Buffer queue

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── POST /api/buffer — send a post to Buffer queue ──────────
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const { action, token, post, channel_ids, scheduled_at } = await req.json()

    // ── ACTION: verify — check token + return channels ──
    if (action === 'verify') {
      const res = await fetch('https://api.bufferapp.com/1/profiles.json', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        return NextResponse.json({ error: 'Invalid Buffer token. Check and try again.' }, { status: 400 })
      }
      const profiles = await res.json()
      const channels = (profiles || []).map((p: any) => ({
        id:               p.id,
        service:          p.service,
        service_username: p.service_username || p.formatted_username || '',
        avatar:           p.avatar || '',
      }))
      return NextResponse.json({ channels })
    }

    // ── ACTION: schedule — add post to Buffer queue ──────
    if (action === 'schedule') {
      if (!token || !post || !channel_ids?.length) {
        return NextResponse.json({ error: 'token, post and channel_ids required' }, { status: 400 })
      }

      const results = []

      for (const profileId of channel_ids) {
        // Build Buffer update body
        const body = new URLSearchParams({
          'profile_ids[]':   profileId,
          'text':            `${post.caption}\n\n${post.body}\n\n${post.hashtags}`,
          'shorten':         'true',
          'now':             scheduled_at ? 'false' : 'true',
        })

        if (scheduled_at) {
          // Convert date to Unix timestamp
          body.append('scheduled_at', String(Math.floor(new Date(scheduled_at).getTime() / 1000)))
        }

        const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
          method:  'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        })

        const data = await res.json()
        if (data.success || data.update) {
          results.push({ profile_id: profileId, success: true, buffer_id: data.update?.id })
        } else {
          results.push({ profile_id: profileId, success: false, error: data.message || 'Unknown error' })
        }
      }

      // Log to Supabase
      const { data: { user } } = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ).auth.getUser()

      if (user) {
        await supabase.from('cs_plus_posts').update({
          posted_at: scheduled_at ? null : new Date().toISOString(),
          scheduled_date: scheduled_at ? new Date(scheduled_at).toISOString().split('T')[0] : null,
        }).eq('id', post.id)
      }

      const allSuccess = results.every(r => r.success)
      return NextResponse.json({
        success: allSuccess,
        sent:    results.filter(r => r.success).length,
        failed:  results.filter(r => !r.success).length,
        results,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── GET /api/buffer — fetch queue status ────────────────────
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

    const res = await fetch('https://api.bufferapp.com/1/updates/pending.json', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    return NextResponse.json({ queue: data.updates || [], total: data.total || 0 })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
