// FILE: app/api/admin/api-settings/test/route.ts
// Live connection test for each API

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id') || ''

  try {
    switch (id) {

      case 'openai': {
        const key = process.env.OPENAI_API_KEY
        if (!key) return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY not set' })
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        })
        if (!res.ok) return NextResponse.json({ ok: false, error: `OpenAI returned ${res.status}` })
        return NextResponse.json({ ok: true, message: 'OpenAI connected ✅' })
      }

      case 'anthropic': {
        const key = process.env.ANTHROPIC_API_KEY
        if (!key) return NextResponse.json({ ok: false, error: 'ANTHROPIC_API_KEY not set' })
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 10, messages: [{ role: 'user', content: 'ping' }] }),
        })
        if (!res.ok) return NextResponse.json({ ok: false, error: `Anthropic returned ${res.status}` })
        return NextResponse.json({ ok: true, message: 'Anthropic connected ✅' })
      }

      case 'resend': {
        const key = process.env.RESEND_API_KEY
        if (!key) return NextResponse.json({ ok: false, error: 'RESEND_API_KEY not set' })
        const res = await fetch('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${key}` } })
        return NextResponse.json({ ok: res.ok, message: res.ok ? 'Resend connected ✅' : `Resend returned ${res.status}` })
      }

      case 'elevenlabs': {
        const key = process.env.ELEVENLABS_API_KEY
        if (!key) return NextResponse.json({ ok: false, error: 'ELEVENLABS_API_KEY not set' })
        const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } })
        return NextResponse.json({ ok: res.ok, message: res.ok ? 'ElevenLabs connected ✅' : `ElevenLabs returned ${res.status}` })
      }

      case 'replicate': {
        const key = process.env.REPLICATE_API_TOKEN
        if (!key) return NextResponse.json({ ok: false, error: 'REPLICATE_API_TOKEN not set' })
        const res = await fetch('https://api.replicate.com/v1/models', { headers: { Authorization: `Token ${key}` } })
        return NextResponse.json({ ok: res.ok, message: res.ok ? 'Replicate connected ✅' : `Replicate returned ${res.status}` })
      }

      default:
        return NextResponse.json({ ok: true, message: `${id} status check — verify in Vercel env vars` })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}
