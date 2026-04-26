// FILE: app/api/coach-manlaw/route.ts
// REBUILT: 2026-04-26
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM = `You are Coach Manlaw, a direct South African business coach. NEVER say "I am here". NEVER greet. ALWAYS give numbered steps. Format: "Here is your plan:\n1. step\n2. step\n3. step\nYOUR NEXT ACTION: [action]"`

async function getKey(): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (url && sk) {
      const r = await fetch(`${url}/rest/v1/z2b_api_keys?key_name=eq.OPENAI_API_KEY&select=key_value`, {
        headers: { apikey: sk, Authorization: `Bearer ${sk}` }, cache: 'no-store'
      })
      const rows = await r.json()
      const val = rows?.[0]?.key_value?.trim()
      if (val && val.length > 20) { console.log(`key:supabase:${val.length}`); return val }
    }
  } catch(e: any) { console.log(`supabase-err:${e.message}`) }
  const env = (process.env.OPENAI_API_KEY||'').trim()
  console.log(`key:env:${env.length}`)
  return env
}

export async function POST(req: NextRequest) {
  try {
    const { messages, tier } = await req.json()
    const key = await getKey()
    console.log(`manlaw:key:${key.length}:${key.slice(0,7)}`)
    if (key.length < 20) return NextResponse.json({ reply: `No key (len=${key.length}). Add OpenAI key in Admin API Settings.` })
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'gpt-4.1-mini', max_tokens: 500,
        messages: [{ role: 'system', content: SYSTEM }, ...(Array.isArray(messages) ? messages.slice(-6) : [])] })
    })
    const raw = await res.text()
    console.log(`openai:${res.status}:${raw.slice(0,80)}`)
    if (!res.ok) return NextResponse.json({ reply: `OpenAI ${res.status}: ${raw.slice(0,200)}` })
    return NextResponse.json({ reply: JSON.parse(raw).choices?.[0]?.message?.content?.trim() || 'No reply' })
  } catch(e: any) {
    console.error(`manlaw-error:${e.message}`)
    return NextResponse.json({ reply: `Error: ${e.message}` })
  }
}
