// ============================================================
// Z2B 4M V3 — COACH MANLAW INTELLIGENCE ENGINE
// File: lib/v3/coach-engine.ts
// v3.1 — stabilized
// ============================================================

import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { normaliseTier, getTier } from '@/lib/v3/tier-config'

// ── TYPES ────────────────────────────────────────────────────

export interface BuilderContext {
  firstName:        string
  tierId:           string
  tierLabel:        string
  gearAccess:       number
  hasActiveSession: boolean
  currentGear:      number
  productTitle:     string
  productFormat:    string
  productsLive:     number
  bfmStatus:        string
  isRocket:         boolean
  memberSince:      string
}

export interface CoachMessage {
  id:        string
  role:      'user' | 'coach'
  content:   string
  timestamp: string
}

export interface CoachSession {
  messages:  CoachMessage[]
  context:   BuilderContext
}

// ── BUILDER CONTEXT LOADER ────────────────────────────────────

export async function loadBuilderContext(userId: string): Promise<BuilderContext> {
  // Service role client — stateless per call (acceptable for coach context loading)
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await (sb.from('profiles') as any)
    .select('paid_tier, full_name, created_at, bfm_status')
    .eq('id', userId)
    .maybeSingle() as { data: any }

  const tier     = normaliseTier(profile?.paid_tier ?? 'fam')
  const tierDef  = getTier(tier)
  const name     = profile?.full_name?.split(' ')[0] ?? 'Builder'

  const { data: activeSessions } = await (sb.from as any)('gear_sessions')
    .select('phase_current, opportunity_data, gear_access')
    .eq('builder_id', userId)
    .eq('session_status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1) as { data: any[] | null }

  const activeSession = activeSessions?.[0]
  const oppData       = activeSession?.opportunity_data as any

  const { data: completed } = await (sb.from as any)('gear_sessions')
    .select('distribution_data')
    .eq('builder_id', userId)
    .eq('session_status', 'completed')
    .not('distribution_data', 'is', null) as { data: any[] | null }

  return {
    firstName:        name,
    tierId:           tier,
    tierLabel:        tierDef.label,
    gearAccess:       tierDef.gearAccess,
    hasActiveSession: !!activeSession,
    currentGear:      activeSession?.phase_current ?? 0,
    productTitle:     oppData?.title ?? '',
    productFormat:    oppData?.format ?? '',
    productsLive:     completed?.length ?? 0,
    bfmStatus:        profile?.bfm_status ?? 'none',
    isRocket:         tierDef.isRocket,
    memberSince:      profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
      : 'recently',
  }
}

// ── SYSTEM PROMPT BUILDER ─────────────────────────────────────

export function buildCoachSystemPrompt(ctx: BuilderContext): string {
  const gearLabels: Record<number, string> = {
    0: 'Idea Ignition', 1: 'Gear 1 — Intent', 2: 'Gear 2 — Blueprint',
    3: 'Gear 3 — Content', 4: 'Gear 4 — Quality', 5: 'Gear 5 — Enhancement',
    6: 'Gear 6 — Distribution',
  }

  const journeyStatus = ctx.hasActiveSession
    ? `Currently working on: "${ctx.productTitle}" — in ${gearLabels[ctx.currentGear] ?? 'the machine'}`
    : ctx.productsLive > 0
      ? `Has ${ctx.productsLive} live product${ctx.productsLive > 1 ? 's' : ''} on the marketplace. Currently between products.`
      : 'Has not yet started a product. Still exploring.'

  const tierContext = ctx.gearAccess >= 7
    ? `Has full access to all 7 Gears. ${ctx.isRocket ? 'Rocket tier — automation active.' : 'Premium tier.'}`
    : `Has access to Gears 1–${ctx.gearAccess}. Next upgrade unlocks Gear ${ctx.gearAccess + 1}.`

  return `You are Coach Manlaw — the AI Business Developer and personal coach for ${ctx.firstName} on the Z2B Legacy Builders platform.

YOUR IDENTITY:
You are Coach Manlaw. Not a chatbot. Not a help desk. A real business coach who knows ${ctx.firstName}'s journey, challenges and potential deeply. You speak with authority, warmth, wisdom and faith. You challenge laziness, celebrate progress and always bring the builder back to action.

YOUR BUILDER — ${ctx.firstName.toUpperCase()}:
- Platform tier: ${ctx.tierLabel}
- ${tierContext}
- Journey status: ${journeyStatus}
- Products live on marketplace: ${ctx.productsLive}
- Member since: ${ctx.memberSince}
- BFM status: ${ctx.bfmStatus === 'none' || !ctx.bfmStatus ? 'good standing' : ctx.bfmStatus}

YOUR COACHING PHILOSOPHY:
1. The Entrepreneurial Consumer — every expense becomes an income stream
2. Prove it before you promote it — integrity over hype
3. The 4M Machine is the vehicle — the builder's expertise is the fuel
4. Legacy is built section by section, product by product
5. Kingdom business principles — stewardship, excellence, service

HOW YOU SPEAK:
- Direct and confident — not wishy-washy
- Warm but not soft — you challenge people lovingly
- You use the builder's first name naturally
- You reference THEIR specific situation (what gear, what product, what tier)
- You give SPECIFIC advice — not generic motivation
- You ask one powerful question when the builder is stuck
- You celebrate wins genuinely
- You use faith-grounded language naturally but not excessively
- SHORT sentences. POWERFUL words. No padding.

WHAT YOU KNOW:
- The Z2B platform: Idea Ignition, 6 Gears, BFM, ISP, TSC, QPB, TLI, CEO Awards
- The compensation plan: Starter→Bronze→Copper→Silver→Gold→Platinum→Rocket
- The 4M Machine: Manual→Automatic→Electric→Rocket tiers
- Digital product creation: eBooks, courses, templates, workbooks, toolkits
- South African market context: ZAR pricing, local economy, entrepreneurship barriers
- Common builder struggles: fear of starting, perfectionism, imposter syndrome, tech overwhelm

WHAT YOU NEVER DO:
- Give programmed, generic answers
- Repeat the same phrases every response
- Say "Great question!" or "Absolutely!" or any hollow filler
- Give long lectures when a short sharp answer is needed
- Ignore what the builder just told you
- Pretend you don't know their situation

CONVERSATION RULES:
- Read what the builder actually said. Respond to THAT.
- If they're stuck — diagnose WHY and give one next step
- If they're confused about the platform — explain clearly with their tier in mind
- If they're celebrating — celebrate with them briefly then push forward
- If they're making excuses — call it lovingly and redirect
- Never be longer than needed. Some answers are 2 sentences.

You are the best business coach ${ctx.firstName} has ever had. Act like it.`
}

// ── COACH RESPONSE GENERATOR ──────────────────────────────────

export async function generateCoachResponse(params: {
  messages:   CoachMessage[]
  newMessage: string
  context:    BuilderContext
}): Promise<{ response: string; error: string | null }> {

  const systemPrompt = buildCoachSystemPrompt(params.context)

  // Last 6 messages only (~3600 tokens max — LOW #8)
  const history = params.messages.slice(-6).map(m => ({
    role:    m.role === 'coach' ? 'assistant' as const : 'user' as const,
    content: m.content,
  }))

  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 55000)

  let res: Response
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 600,
        system:     systemPrompt,
        messages:   [
          ...history,
          { role: 'user', content: params.newMessage },
        ],
      }),
    })
    clearTimeout(timeout)
  } catch (e) {
    clearTimeout(timeout)
    const isTimeout = e instanceof Error && e.name === 'AbortError'
    return {
      response: '',
      error: isTimeout
        ? 'Coach is thinking too hard. Please try again.'
        : 'Connection error. Please try again.',
    }
  }

  if (!res.ok) {
    const err = await res.text()
    console.error('[coach-engine] Claude error:', err)
    return { response: '', error: 'Coach is temporarily unavailable. Try again.' }
  }

  const data     = await res.json()
  const response = data.content?.[0]?.text ?? ''

  if (!response.trim()) {
    return { response: '', error: 'No response received. Please try again.' }
  }

  return { response, error: null }
}

// ── STARTER MESSAGES ──────────────────────────────────────────

export function buildStarterMessage(ctx: BuilderContext): string {
  if (!ctx.hasActiveSession && ctx.productsLive === 0) {
    return `${ctx.firstName}. You're here and that already puts you ahead of 90% of people who say they want to build something.\n\nYou're on the ${ctx.tierLabel} — the machine is ready. What's stopping you from pressing start on your first product right now?`
  }

  if (ctx.hasActiveSession) {
    const gearLabels: Record<number, string> = {
      1: 'defining your product intent', 2: 'building your blueprint',
      3: 'writing the content', 4: 'passing quality control',
      5: 'adding premium assets', 6: 'going live',
    }
    const stage = gearLabels[ctx.currentGear] ?? 'working through the machine'
    return `${ctx.firstName}. You're in the middle of something — "${ctx.productTitle}" — ${stage}.\n\nThat product doesn't finish itself. What do you need from me right now to keep moving?`
  }

  if (ctx.productsLive === 1) {
    return `${ctx.firstName}. One product live is proof the machine works. Most people stop here.\n\nThe question is: what's your second product? Because that's where momentum compounds. What are you thinking?`
  }

  return `${ctx.firstName}. ${ctx.productsLive} products live. The machine is working.\n\nNow let's talk about what's next — because there's always a next. What's on your mind?`
}

export { randomUUID }
