// FILE: app/api/admin/api-settings/route.ts
// Admin API key manager — status check + Vercel env var instructions
// OpenAI added as primary AI engine

import { NextRequest, NextResponse } from 'next/server'

const ENV_MAP: Record<string, string[]> = {
  // AI Engines — top priority
  openai:          ['OPENAI_API_KEY'],
  anthropic:       ['ANTHROPIC_API_KEY'],
  // Core platform
  supabase_service:['SUPABASE_SERVICE_ROLE_KEY'],
  yoco:            ['YOCO_SECRET_KEY', 'YOCO_WEBHOOK_SECRET'],
  resend:          ['RESEND_API_KEY'],
  // Manual power
  elevenlabs:      ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID'],
  assembly:        ['ASSEMBLYAI_API_KEY'],
  // Automatic power
  buffer:          ['BUFFER_ACCESS_TOKEN'],
  make:            ['MAKE_WEBHOOK_URL'],
  canva:           ['CANVA_API_KEY'],
  // Electric power
  did:             ['DID_API_KEY'],
  replicate:       ['REPLICATE_API_TOKEN'],
  n8n:             ['N8N_WEBHOOK_URL'],
  twilio:          ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
}

// ── GET: Return connection status for all APIs ────────────────────────────────
export async function GET() {
  const statuses: Record<string, string> = {}
  for (const [id, keys] of Object.entries(ENV_MAP)) {
    const primary = process.env[keys[0]]
    statuses[id] = primary && primary.length > 10 ? 'connected' : 'missing'
  }

  // Extra info: which AI engine is active
  const openaiActive    = !!process.env.OPENAI_API_KEY    && process.env.OPENAI_API_KEY.length > 10
  const anthropicActive = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10
  const activeEngine    = openaiActive ? 'openai' : anthropicActive ? 'anthropic' : 'none'

  return NextResponse.json({ statuses, activeEngine, values: {} })
}

// ── POST: Return Vercel instructions for adding the key ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const { id, value, value2 } = await req.json()
    const keys = ENV_MAP[id]
    if (!keys) return NextResponse.json({ error: 'Unknown API ID' }, { status: 400 })
    if (!value || value.trim().length < 5) return NextResponse.json({ error: 'Key is too short' }, { status: 400 })

    const keyNames = keys.join(' and ')
    const instruction = `Add ${keyNames} to Vercel → Your Project → Settings → Environment Variables → Save → Redeploy`

    return NextResponse.json({
      ok:          true,
      instruction,
      envKey:      keys[0],
      envKey2:     keys[1] || null,
      // We return the instruction but never store or log the actual key value
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
