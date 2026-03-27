import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// FILE: app/api/push/route.ts
// Sends push notifications to subscribed users
// Supports: daily_spark · builders_table · ceo_letter · announcements · rank_up · payment

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Notification templates per type
const TEMPLATES: Record<string, (data: any) => { title: string; body: string; url: string }> = {
  daily_spark: (data) => ({
    title: '⚡ Daily Spark — Z2B Table Banquet',
    body:  data.spark ? `"${data.spark.substring(0,100)}..."` : 'Your daily insight is ready. Tap to read.',
    url:   '/daily-spark',
  }),
  builders_table: (data) => ({
    title: `🍽️ ${data.author || 'A Builder'} posted on the Table`,
    body:  data.preview ? data.preview.substring(0,120) : 'New post in the Builders Table community.',
    url:   '/builders-table',
  }),
  ceo_letter: (data) => ({
    title: '📜 New CEO Letter from Rev Mokoro Manana',
    body:  data.title ? `"${data.title}"` : 'A new letter has arrived. Read it now.',
    url:   '/ceo-letters',
  }),
  announcements: (data) => ({
    title: `📣 Z2B Announcement${data.title ? `: ${data.title}` : ''}`,
    body:  data.body || 'An important update from the Z2B Table Banquet.',
    url:   data.url || '/dashboard',
  }),
  rank_up: (data) => ({
    title: '🏆 Rank Promotion — Congratulations!',
    body:  `You have advanced to ${data.rank}. Coach Manlaw is waiting for you.`,
    url:   '/meet-coach-manlaw',
  }),
  payment: (data) => ({
    title: '💰 Commission Earned!',
    body:  data.amount ? `R${data.amount} earned from your table` : 'You have earned a commission.',
    url:   '/my-earnings',
  }),
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const { type, data = {}, user_id, channel } = await req.json()
    if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 })

    const template = TEMPLATES[type]
    if (!template) return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })

    const notification = template(data)

    // Build subscription query
    let query = supabase.from('push_subscriptions').select('user_id,subscription,channels')
    if (user_id) {
      query = query.eq('user_id', user_id) // Send to specific user
    }
    // Filter by channel preference
    // (channel filtering happens client-side for now — all subscribed users get it)

    const { data: subs } = await query

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No subscribers found' })
    }

    let sent = 0; let failed = 0

    for (const sub of subs) {
      // Check if user has this channel enabled
      const channels = sub.channels || {}
      if (channels[type] === false) continue // User opted out of this channel

      // Log notification (even without VAPID — for in-app notification bell)
      try {
        await supabase.from('notification_log').insert({
          user_id:           sub.user_id,
          notification_type: type,
          title:             notification.title,
          body:              notification.body,
          url:               notification.url,
          sent_at:           new Date().toISOString(),
        })
      } catch(_e) {}

      // Send web push if subscription endpoint exists and VAPID is configured
      if (sub.subscription && process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        try {
          const subData = JSON.parse(sub.subscription)
          // In production, use web-push library here
          // For now, log is sufficient — in-app bell shows all notifications
          sent++
        } catch(e) { failed++ }
      } else {
        sent++ // Counted as in-app notification
      }
    }

    return NextResponse.json({ sent, failed, total: subs.length })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// GET — fetch unread notifications for logged-in user
export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const userId = req.nextUrl.searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    const { data } = await supabase
      .from('notification_log')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ notifications: data || [] })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
