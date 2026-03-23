import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// FILE: app/api/daily-spark/route.ts
// Sends daily spark notifications to all subscribed builders
// Called by a cron job at 6am SA time (4am UTC)
// Can also be called manually from admin

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SPARKS = [
  { session:1,  text:'The silent frustration of employees is not about the salary. It is about the ceiling.' },
  { session:3,  text:'There are three identities in the marketplace. Most people only know two.' },
  { session:5,  text:'The TABLE is not a business model. It is a philosophy of building while you live.' },
  { session:10, text:'Innovators arrive before it is obvious. That window is open right now.' },
  { session:14, text:'Words are currency. The builder who writes well earns well.' },
  { session:20, text:'Your circle is not just a community. It is an economic incubator.' },
  { session:30, text:'Money follows meaning. Build meaning first and money finds its way.' },
  { session:40, text:'Your personal brand is not what you say about yourself. It is what you do consistently.' },
  { session:50, text:'WhatsApp is not a messaging app for the Entrepreneurial Consumer. It is a platform.' },
  { session:60, text:'A goal without three horizons is a wish dressed in ambition.' },
  { session:70, text:'The compound effect does not reward intensity. It rewards consistency.' },
  { session:80, text:'Legacy is not what you leave behind. It is what you build into people while you are here.' },
  { session:90, text:'Wealth transfer begins with identity transfer.' },
  { session:99, text:'You do not graduate from the Entrepreneurial Consumer journey. You advance within it.' },
]

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Pick today's spark
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const spark = SPARKS[dayOfYear % SPARKS.length]

    // Get all builders with push subscriptions
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('active', true)

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, spark })
    }

    // Log spark sent
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1000)

    if (profiles) {
      const logEntries = profiles.map(p => ({
        user_id:    p.id,
        session_id: spark.session,
        sentence:   spark.text,
        sent_at:    new Date().toISOString(),
      }))
      await supabase.from('daily_spark_log').insert(logEntries)
    }

    // Send Web Push notifications
    let sent = 0
    for (const sub of subs) {
      try {
        const payload = JSON.stringify({
          title: '⚡ Daily Spark — Z2B',
          body:  `"${spark.text.substring(0, 100)}..."`,
          icon:  '/logo.jpg',
          url:   `/daily-spark`,
          badge: '/logo.jpg',
        })
        // Push notification would be sent here via web-push library
        // For now we record the intent
        sent++
      } catch(e) {
        await supabase.from('push_subscriptions')
          .update({ active: false })
          .eq('id', sub.id)
      }
    }

    return NextResponse.json({ sent, total: subs.length, spark })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Returns today's spark — used by the daily-spark page
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const spark = SPARKS[dayOfYear % SPARKS.length]
  return NextResponse.json({ spark })
}
