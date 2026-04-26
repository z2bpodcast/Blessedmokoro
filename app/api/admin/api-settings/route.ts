// FILE: app/api/admin/api-settings/route.ts
// Admin API key manager — saves keys to Supabase, reads at runtime
// No Vercel dashboard needed — paste key in Admin panel = live immediately

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ENV_MAP: Record<string, string> = {
  openai:     'OPENAI_API_KEY',
  anthropic:  'ANTHROPIC_API_KEY',
  elevenlabs: 'ELEVENLABS_API_KEY',
  resend:     'RESEND_API_KEY',
  yoco:       'YOCO_SECRET_KEY',
  replicate:  'REPLICATE_API_TOKEN',
  did:        'DID_API_KEY',
  buffer:     'BUFFER_ACCESS_TOKEN',
}

// ── GET: Return status of all keys ───────────────────────────────────────────
export async function GET() {
  const { data: rows } = await supabase
    .from('z2b_api_keys')
    .select('key_name, key_value')

  const stored: Record<string, boolean> = {}
  for (const row of rows || []) {
    stored[row.key_name] = row.key_value?.length > 10
  }

  const statuses: Record<string, string> = {}
  for (const [id, envKey] of Object.entries(ENV_MAP)) {
    const fromEnv     = process.env[envKey]
    const fromDB      = stored[envKey]
    statuses[id] = (fromEnv && fromEnv.length > 10) || fromDB ? 'connected' : 'missing'
  }

  const openaiKey    = await getKey('OPENAI_API_KEY')
  const anthropicKey = await getKey('ANTHROPIC_API_KEY')
  const activeEngine = openaiKey ? 'openai' : anthropicKey ? 'anthropic' : 'none'

  return NextResponse.json({ statuses, activeEngine })
}

// ── POST: Save key to Supabase ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { id, value } = await req.json()
    const envKey = ENV_MAP[id]
    if (!envKey) return NextResponse.json({ error: 'Unknown API' }, { status: 400 })
    if (!value || value.trim().length < 10) return NextResponse.json({ error: 'Key too short' }, { status: 400 })

    const { error } = await supabase
      .from('z2b_api_keys')
      .upsert({ key_name: envKey, key_value: value.trim() }, { onConflict: 'key_name' })

    if (error) throw error

    return NextResponse.json({ ok: true, message: `${envKey} saved — active immediately` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── Helper: get key from DB or env ────────────────────────────────────────────
export async function getKey(keyName: string): Promise<string> {
  // Check env first (Vercel)
  const fromEnv = process.env[keyName]
  if (fromEnv && fromEnv.length > 10) return fromEnv

  // Check Supabase (Admin panel)
  const { data } = await supabase
    .from('z2b_api_keys')
    .select('key_value')
    .eq('key_name', keyName)
    .single()

  return data?.key_value || ''
}
