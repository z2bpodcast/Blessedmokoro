// FILE: app/api/admin/api-settings/route.ts
// Manages API key status checks for the admin API settings panel
// NOTE: Keys are stored in Vercel env vars — this route READS status only
// Writing to Vercel env vars requires the Vercel API which needs a token

import { NextRequest, NextResponse } from 'next/server'

// Map of API IDs to their env var names
const ENV_MAP: Record<string, string[]> = {
  anthropic:       ['ANTHROPIC_API_KEY'],
  supabase_service:['SUPABASE_SERVICE_ROLE_KEY'],
  yoco:            ['YOCO_SECRET_KEY'],
  resend:          ['RESEND_API_KEY'],
  elevenlabs:      ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID'],
  assembly:        ['ASSEMBLYAI_API_KEY'],
  buffer:          ['BUFFER_ACCESS_TOKEN'],
  make:            ['MAKE_WEBHOOK_URL'],
  canva:           ['CANVA_API_KEY'],
  did:             ['DID_API_KEY'],
  replicate:       ['REPLICATE_API_TOKEN'],
  n8n:             ['N8N_WEBHOOK_URL'],
  twilio:          ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
}

export async function GET() {
  // Return connection status for each API (not the actual keys)
  const statuses: Record<string, string> = {}
  for (const [id, keys] of Object.entries(ENV_MAP)) {
    const allSet = keys.every(k => !!process.env[k] && process.env[k]!.length > 10)
    statuses[id] = allSet ? 'connected' : 'missing'
  }
  return NextResponse.json({ statuses, values: {} }) // Never return actual key values
}

export async function POST(req: NextRequest) {
  try {
    const { id, value, value2 } = await req.json()
    const keys = ENV_MAP[id]
    if (!keys) return NextResponse.json({ error: 'Unknown API ID' }, { status: 400 })

    // We cannot directly write to Vercel env vars from Next.js
    // Return instructions for the admin to do it manually
    return NextResponse.json({
      ok: true,
      instruction: `Add ${keys[0]}${keys[1] ? ' and ' + keys[1] : ''} to Vercel → Settings → Environment Variables → Redeploy`,
      envKey: keys[0],
      envKey2: keys[1] || null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
