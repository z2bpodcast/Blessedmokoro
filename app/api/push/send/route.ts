// FILE: app/api/push/send/route.ts
// Sends push notifications to all subscribed members

import { NextRequest, NextResponse } from 'next/server'

/* eslint-disable @typescript-eslint/no-var-requires */
declare module 'web-push'

const VAPID_PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_EMAIL   = 'mailto:admin@z2blegacybuilders.co.za'

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    // eslint-disable-next-line
    const webpush = require('web-push')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    const body     = await req.json()
    const { title, message, url, admin_key } = body

    if (admin_key !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 503 })
    }

    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!subs?.length) return NextResponse.json({ sent: 0, message: 'No subscribers yet' })

    const payload = JSON.stringify({
      title: title || '🍽️ Z2B Open Table',
      body:  message || 'The table is calling. Come take your seat.',
      url:   url || '/open-table',
    })

    let sent = 0; let failed = 0
    const dead: string[] = []

    await Promise.allSettled(
      subs.map(async (sub: any) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
          sent++
        } catch (err: any) {
          failed++
          if (err.statusCode === 410) dead.push(sub.endpoint)
        }
      })
    )

    if (dead.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', dead)
    }

    return NextResponse.json({ sent, failed, cleaned: dead.length })

  } catch (e: any) {
    console.error('Push send error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
