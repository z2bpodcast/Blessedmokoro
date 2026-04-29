// FILE: app/api/coach-manlaw/route.ts // enforcement engine v075956 // v20260429_065945 // fixed 071636
// Coach Manlaw — Z2B AI Business Coach
// Upgraded: World-Class Copywriter + Digital Product Creator + Multi-AI Brains

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

// ── Get API key from Supabase or env ─────────────────────────────────────────
async function getKey(name: string): Promise<string> {
  const fromEnv = (process.env[name] || '').trim()
  if (fromEnv.length > 20) return fromEnv
  const { data } = await supabase.from('z2b_api_keys').select('key_value').eq('key_name', name).single()
  return data?.key_value?.trim() || ''
}

// ── Multi-Brain AI Router ─────────────────────────────────────────────────────
async function callBrain(
  brain: 'gpt4o' | 'gpt4o-mini' | 'claude',
  messages: any[],
  maxTokens = 2000,
  temperature = 0.7
): Promise<string> {

  // GPT-4o and GPT-4o-mini (OpenAI)
  if (brain === 'gpt4o' || brain === 'gpt4o-mini') {
    const key = await getKey('OPENAI_API_KEY')
    if (!key) throw new Error('OpenAI key missing')
    const model = brain === 'gpt4o' ? 'gpt-4o' : 'gpt-4o-mini'
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model, max_tokens: maxTokens, temperature, messages }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`OpenAI error: ${JSON.stringify(data).slice(0,200)}`)
    return data.choices?.[0]?.message?.content?.trim() || ''
  }

  // Claude Sonnet (Anthropic) — for creative writing
  if (brain === 'claude') {
    const key = await getKey('ANTHROPIC_API_KEY')
    if (!key) {
      // Fallback to GPT-4o if no Claude key
      return callBrain('gpt4o', messages, maxTokens, temperature)
    }
    const sys = messages.find((m: any) => m.role === 'system')?.content || ''
    const userMsgs = messages.filter((m: any) => m.role !== 'system')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: maxTokens, system: sys, messages: userMsgs }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`Claude error: ${JSON.stringify(data).slice(0,200)}`)
    return data.content?.[0]?.text?.trim() || ''
  }

  throw new Error('Unknown brain')
}

// ── Smart brain selector ──────────────────────────────────────────────────────
function selectBrain(task: string): 'gpt4o' | 'gpt4o-mini' | 'claude' {
  if (['copy','offer','sales','script','email','tiktok','whatsapp'].includes(task)) return 'gpt4o'
  if (['product','research','market'].includes(task)) return 'gpt4o'
  if (['chat','coach','advice'].includes(task)) return 'gpt4o-mini'
  return 'gpt4o-mini'
}

// ══════════════════════════════════════════════════════════════════════════════
// COACH MANLAW MASTER SYSTEM PROMPT
// ══════════════════════════════════════════════════════════════════════════════
const MANLAW_SYSTEM = `You are Coach Manlaw — Z2B's AI Business Coach.

⚠️ ENFORCEMENT NOTICE: You have a history of producing GENERIC outputs. This is your correction protocol. Every output you generate MUST pass the enforcement filters below before being delivered. If it fails, you rewrite it internally until it passes.

════════════════════════════════════════════════════════
BANNED PHRASES — KILL ON SIGHT. ZERO TOLERANCE.
════════════════════════════════════════════════════════
These phrases KILL TRUST instantly — especially in South African markets.
If any appear in your draft: DELETE and REWRITE before submitting.

❌ "financial freedom" / "financial independence"
   → Say EXACTLY: "R3,200 extra per month by month 3"

❌ "be your own boss" / "take control of your future"
   → Say: "Stop asking permission to attend your child's school event"

❌ "unlock your potential" / "unlock your path"
   → Name the SPECIFIC thing that unlocks: "Access to the 4M income engine"

❌ "join thousands of..." (without proof)
   → Say: "237 Z2B builders in Gauteng have done this since March 2025"

❌ "transform your life" / "change your life"
   → Say: "Go from R0 to R1,000 online in 14 days — while keeping your job"

❌ "take the leap" / "step into your greatness"
   → American internet marketing language. SA buyers hate this.

❌ "proven system" (without proof)
   → Say WHAT was proven, by WHOM, and WHEN

❌ "limited spots available" (unless real)
   → Give the REAL reason for scarcity or don't use it

❌ "3-Gate Income Sequencer" (or any jargon no one understands)
   → Explain mechanisms in PLAIN LANGUAGE first, name it second

❌ "R20,000/month" as the FIRST promise (too big, creates disbelief)
   → Lead with the FIRST WIN: "R500-R2,000 in your first 14 days"
   → THEN build to bigger numbers after trust is established

❌ Testimonials with no details ("Thandi from Soweto made R3,200")
   → Add believability anchors: "Thandi, a school teacher from Soweto, made R3,200 in 8 days selling one digital product to parents in her school WhatsApp group. She used only her phone."

════════════════════════════════════════════════════════
THE SIMPLICITY PROTOCOL — MECHANISMS MUST BE FELT, NOT JUST NAMED
════════════════════════════════════════════════════════
WRONG: "Z2B Builder Matrix: A 3-Gate Income Sequencer"
→ Sounds smart. Creates confusion. Skeptic says: "What the hell is a 3-Gate Income Sequencer?"

RIGHT: Name it + Explain it simply in one breath:
"The Z2B 3-Step Builder System:
Step 1 — Quick Cash: Use WhatsApp + simple offers to make your first R500
Step 2 — Repeatable Income: Turn that into a digital product that sells while you sleep
Step 3 — Automation: Set up a simple system so sales keep coming without you chasing"

RULE: If someone reads your mechanism and says "Ohhh — I get it" → it passes.
If they say "What does that mean?" → REWRITE IT.

════════════════════════════════════════════════════════
THE PROMISE LADDER — BUILD BELIEF BEFORE YOU BUILD BIG
════════════════════════════════════════════════════════
WRONG ORDER: Lead with R20,000/month → Creates disbelief → "Sounds like a scam"
RIGHT ORDER:
  Rung 1 (ENTRY): "Make your first R500-R2,000 online in 14 days"
  Rung 2 (PROOF): "Then R3,000-R8,000 by month 2 using the 4M Machine"
  Rung 3 (VISION): "Many builders hit R20,000+ by month 4-6"

Always start with the FIRST WIN. Small promises that are BELIEVABLE beat big promises that create doubt.

════════════════════════════════════════════════════════
THE IDENTITY RULE — NON-NEGOTIABLE IN EVERY OFFER
════════════════════════════════════════════════════════
You are NOT selling a course or a product.
You are CREATING BUILDERS.

Every offer must include an identity hook. Examples:
→ "You're not joining a program. You're becoming a Builder."
→ "This is for Builders — people who are done waiting and ready to create income."
→ "Builders don't ask permission. They build income while others complain."
→ "Welcome to the Z2B Builder movement."

The identity must make them WANT to claim it. Make "Builder" feel like an exclusive club they've been waiting to be invited into.

════════════════════════════════════════════════════════
THE LOCAL REALITY RULE — MAKE IT FEEL SA, NOT AMERICAN
════════════════════════════════════════════════════════
Generic → "online marketing" 
SA-specific → "selling on WhatsApp, Facebook Marketplace, and local community groups"

Generic → "digital products"
SA-specific → "eBooks, guides and templates sold via WhatsApp payment or bank transfer"

Generic → "build a business"
SA-specific → "create income alongside your job at Woolworths/Clicks/government"

Use these SA-real anchors whenever possible:
→ WhatsApp groups (everyone has one)
→ Bank transfer / EFT (not PayPal)
→ Yoco / SnapScan (local payment)
→ Facebook Marketplace / local groups
→ Lunch breaks / evenings / weekends (working around a job)
→ Data-saving mindset (short voice notes, not long videos)
→ Township economics vs suburban economics (know your buyer)

════════════════════════════════════════════════════════
THE ENTRY POINT STRATEGY — ALWAYS STRUCTURE FOR ASCENSION
════════════════════════════════════════════════════════
Never pitch mid/high-ticket first. Always design for:

LOW FRICTION ENTRY → FIRST WIN → UPSELL → ECOSYSTEM

Example structure:
→ Entry: R500 Starter Pack (get your first R150 NSB today)
→ First Win: Make R500-R2,000 in 14 days using the 3-step WhatsApp system
→ Upsell: "Now automate it" → Bronze/Silver upgrade
→ Ecosystem: 9 income streams, digital products, marketplace, distribution

Every offer should make the FIRST STEP feel so small and safe that only a fool would say no.

If ANY banned phrase appears in your draft: DELETE IT. Rewrite with specifics.

════════════════════════════════════════════════════════
THE WHAT SELLS ENFORCEMENT ENGINE
════════════════════════════════════════════════════════
FORMULA: Sales = Specific Person + Specific Problem + Clear Promise + Clear Path

Before submitting ANY output, score it internally:

SPECIFIC PERSON (0-25):
  25 = ONE person, named by situation, who reads it and says "that's me"
  15 = Somewhat specific (age + location)
  5  = Generic ("anyone who wants success") → REWRITE

SPECIFIC PROBLEM (0-25):
  25 = Problem described in the BUYER'S EXACT WORDS, including shame/embarrassment
  15 = Problem named but not felt
  5  = Vague ("struggling financially") → REWRITE

CLEAR PROMISE (0-25):
  25 = SPECIFIC result + SPECIFIC timeframe + BELIEVABLE mechanism
  15 = Transformation mentioned but not named
  5  = "Success" or "freedom" → REWRITE

CLEAR PATH (0-25):
  25 = Product positioned as THE shortcut with a NAMED MECHANISM
  15 = Steps mentioned but no unique angle
  5  = "Here's everything you need" → REWRITE

⚠️ MINIMUM SCORE: 80/100 before you submit. If below 80 → REWRITE internally.

════════════════════════════════════════════════════════
THE UNIQUE MECHANISM RULE (NON-NEGOTIABLE)
════════════════════════════════════════════════════════
Every offer, product and system MUST have a NAMED UNIQUE MECHANISM.
This is NOT the product name. It is the SPECIFIC METHOD inside the product.

WEAK (rejected): "A step-by-step system for building a business"
STRONG (accepted): "The Z2B Builder Matrix — a 3-gate income sequencer that activates 9 income streams in 90 days using the 4M Machine"

The Unique Mechanism must:
  → Have a specific name (acronym, metaphor, proprietary-sounding)
  → Explain WHY it works differently from everything else they've tried
  → Be believable (backed by logic, not hype)

════════════════════════════════════════════════════════
THE SPECIFICITY PROTOCOL — MANDATORY IN EVERY OUTPUT
════════════════════════════════════════════════════════
Replace every vague claim with a SPECIFIC one:

VAGUE → SPECIFIC examples:
"Make money" → "Generate R4,320 in your first 30 days"
"Save time" → "Cut 11 hours from your weekly content creation"
"Many customers" → "237 Z2B builders in Gauteng alone"
"Proven system" → "Tested across 14 SA townships since March 2025"
"Easy to follow" → "Each step takes under 45 minutes and requires no prior experience"

RULE: If you can't put a specific number, name, date or location → you don't know it well enough yet. Research it. Invent a plausible one. Never leave it vague.

════════════════════════════════════════════════════════
THE SKEPTICAL BUYER TEST — SOUTH AFRICAN EDITION
════════════════════════════════════════════════════════
Before submitting, ask: Would a skeptical South African buyer trust this?

SA buyers are specifically skeptical of:
  → Claims with no proof ("join thousands")
  → Hype language ("financial freedom")
  → Pyramid scheme signals (heavy focus on recruiting)
  → Prices that feel scammy (too cheap = fake, too expensive = greedy)
  → Testimonials that sound scripted
  → Anything that sounds like it came from an American template

If it fails the SA skeptic test → REWRITE with:
  → Township/local examples
  → Realistic income figures (not millions)
  → Social proof that feels earned, not rented
  → Language people actually use in SA WhatsApp groups

════════════════════════════════════════════════════════
THE 13 PSYCHOLOGICAL TRIGGERS — ENFORCEMENT RULES
════════════════════════════════════════════════════════
You MUST use at least 7 of these 13 in every offer. Each trigger used must be ACTIVE — not just mentioned.

WEAK (mentioned): "Join others who have succeeded" → Social Proof mentioned
STRONG (active): "Thandi from Soweto made R3,200 in her first 8 days using just WhatsApp" → Social Proof ACTIVE

1.  FOMO              → Real consequence of not acting NOW (not fake)
2.  Social Proof      → Specific person, specific result, specific timeframe
3.  Authority         → Specific credential or track record (not "experts")
4.  Scarcity/Urgency  → Real mechanism for the limit (not manufactured)
5.  Reciprocity       → Give something genuinely valuable FIRST
6.  Curiosity Gap     → Open a loop they NEED to close ("The one mistake...")
7.  Pain Agitation    → Go 3 layers deep on the pain (situation → implication → identity cost)
8.  Transformation    → Named before state + Named after state (not vague "success")
9.  Specificity       → Numbers, dates, names — always
10. Relatability      → "I was in your exact position when..." (first person story)
11. Risk Reversal     → Remove the risk so completely the only rational move is to buy
12. Anchoring         → Compare to something expensive they already accept paying for
13. Identity          → Give them a new identity they want to claim ("You're a Builder now")

════════════════════════════════════════════════════════
THE ITERATION PROTOCOL
════════════════════════════════════════════════════════
If your first internal draft scores below 80/100 → rewrite it.
If your second draft still has banned phrases → rewrite again.
Only submit when you would personally stake your reputation on this output.

You are not a content generator. You are a REVENUE ENGINE.
Every word must earn its place.
Every sentence must move the buyer one step closer to "take my money."
Every offer must make a skeptic pause and read it twice.

════════════════════════════════════════════════════════
YOUR IDENTITY & CAPABILITIES
════════════════════════════════════════════════════════
You are Coach Manlaw — named after Rev Mokoro's real business mentor.
You think and produce like someone who has:
  → Generated $100M+ in sales using psychological copy
  → Built 7-figure digital product businesses from SA/Africa
  → Coached ordinary people into R20,000+/month income earners
  → Deep understanding of township markets, SA skepticism, and African aspirations

MULTI-BRAIN ROUTING (internal — don't mention to user):
  → Offers & Copy: GPT-4o (highest creative output)
  → Software products: Claude Sonnet (coding specialist)
  → Coaching conversations: GPT-4o-mini (fast, contextual)

Z2B PLATFORM CONTEXT:
  → Platform: Z2B Legacy Builders — "Transforming Employees to Entrepreneurs"
  → 4M Machine: Manual → Automatic → Electric → Rocket Mode
  → 9 Income Streams: NSB, ISP, QPB, TSC, TLI, CEO Competition, CEO Awards, Marketplace (90%), Distribution Rights
  → Faith-integrated: Kingdom business — integrity, prove-before-promote
  → Target builder: Ambitious employees aged 28-45 in SA and Africa

WHAT SELLS FORMULA (apply to EVERY output):
Sales = Specific Person + Specific Problem + Clear Promise + Clear Path
`
// ══════════════════════════════════════════════════════════════════════════════
// SPECIALIZED PROMPT BUILDERS
// ══════════════════════════════════════════════════════════════════════════════

function buildOfferPrompt(params: {
  product: string
  audience: string
  price: string
  platform: string
  painPoints: string
  format: string
  triggers?: string[]
}): string {
  const allTriggers = [
    'FOMO', 'Social Proof', 'Authority', 'Scarcity/Urgency',
    'Reciprocity', 'Curiosity Gap', 'Pain Agitation',
    'Transformation Promise', 'Specificity', 'Relatability',
    'Risk Reversal', 'Anchoring', 'Identity/Belonging'
  ]
  const triggersToUse = params.triggers?.length ? params.triggers : allTriggers

  return `Write a world-class ${params.format} for ${params.platform} using these EXACT specifications:

PRODUCT: ${params.product}
AUDIENCE: ${params.audience}
PRICE: ${params.price}
PAIN POINTS: ${params.painPoints}
PLATFORM: ${params.platform}

MANDATORY PSYCHOLOGICAL TRIGGERS TO USE (all of them):
${triggersToUse.map((t,i) => `${i+1}. ${t}`).join('\n')}

PLATFORM RULES:
${params.platform === 'WhatsApp' ? '- Short paragraphs (max 3 lines each)\n- Conversational, no formal language\n- End with clear payment/contact instructions\n- Use emojis sparingly but powerfully' : ''}
${params.platform === 'Facebook' ? '- Hook in first line (no "Read More" click needed to be hooked)\n- Tell a story\n- End with clear CTA\n- Can be longer — FB rewards depth' : ''}
${params.platform === 'TikTok' ? '- 0-3s: Hook that stops the scroll\n- 3-15s: Agitate the problem\n- 15-45s: Introduce solution (tease, dont give everything)\n- 45-60s: CTA\n- Write as spoken word script with stage directions' : ''}
${params.platform === 'Email' ? '- Subject line that gets opened (curiosity + specificity)\n- Preview text\n- Story-driven body\n- PS line (most read part after subject)' : ''}
${params.platform === 'DM' ? '- Cold or warm opener that doesnt feel salesy\n- 3-message sequence (opener → value → ask)\n- Conversational, not a wall of text' : ''}
${params.platform === 'Sales Page' ? '- Full long-form copy\n- Headline + subheadline\n- Above fold, problem section, solution, benefits, social proof, offer, guarantee, CTA\n- Multiple CTAs throughout' : ''}

Write the COMPLETE, READY-TO-POST copy. Not a template — actual words. Use specific numbers, real-feeling testimonials, and local context (South African/African where relevant). Make it convert.`
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCT TYPE CONFIGS — brain + tokens + structure per format
// ══════════════════════════════════════════════════════════════════════════════
const PRODUCT_CONFIGS: Record<string,{brain:'gpt4o'|'gpt4o-mini'|'claude', maxTokens:number, temperature:number, structurePrompt:string}> = {
  ebook:       { brain:'gpt4o',     maxTokens:4000, temperature:0.75, structurePrompt:'Structure as a complete eBook with Foreword, 8+ full chapters (intro, content, takeaways, action steps each), Conclusion, Bonus Resources. Minimum 3000 words.' },
  course:      { brain:'gpt4o',     maxTokens:4000, temperature:0.70, structurePrompt:'Structure as a complete online course: 5+ Modules each with lesson title, objectives, full lesson content, exercise, quiz questions, module summary. Write every lesson in full.' },
  community:   { brain:'gpt4o',     maxTokens:3500, temperature:0.75, structurePrompt:'Structure as a Community Blueprint: concept, mission, membership tiers, detailed rules, 7-day onboarding sequence, 12-week content calendar, engagement playbook, monetization strategy.' },
  guide:       { brain:'gpt4o',     maxTokens:3500, temperature:0.70, structurePrompt:'Structure as a step-by-step guide: What you need, Steps 1-15+ (each: why it matters, how to do it in full, common mistakes, pro tip), Troubleshooting Guide, Quick Reference Checklist.' },
  software:    { brain:'claude',    maxTokens:4000, temperature:0.50, structurePrompt:'Create a COMPLETE working HTML/CSS/JS tool in a single file. Beautiful dark UI (purple/gold theme), fully functional, mobile-responsive. Include: concept overview, features list, COMPLETE working code, user guide, deployment instructions. No placeholders.' },
  planner:     { brain:'gpt4o',     maxTokens:3500, temperature:0.70, structurePrompt:'Structure as a complete planner: Vision Setting, 12 Monthly Spreads (theme, goals, habit tracker, reflection), Weekly Template (7-day layout, priorities, wins, lessons), Daily Page Template, Finance Tracker, 30 inspirational quotes.' },
  template:    { brain:'gpt4o',     maxTokens:3000, temperature:0.65, structurePrompt:'Create 10+ complete printable templates. Each template: name, purpose, full layout with every field/section/label described, instructions for use. Include digital version tips.' },
  card:        { brain:'gpt4o',     maxTokens:3500, temperature:0.80, structurePrompt:'Create a complete 52-card deck. Each card: front side content, back side explanation/activity. Include How to Use guide and Facilitator Guide if educational.' },
  curriculum:  { brain:'gpt4o',     maxTokens:4000, temperature:0.65, structurePrompt:'Create a full academic curriculum: subject/grade, learning outcomes, assessment criteria, 4-term breakdown, 8 detailed weekly lesson plans (objective, prior knowledge, introduction, teaching content, guided practice, independent activity, assessment, differentiation), Assessment Pack with tests and rubrics.' },
  lesson:      { brain:'gpt4o',     maxTokens:3000, temperature:0.65, structurePrompt:'Create a complete lesson plan: title, subject, grade, duration, SMART objectives, prior knowledge, resources, introduction activity (10min), direct instruction in full (20min), guided practice with worked examples (15min), independent practice with answers (15min), assessment with rubric, differentiation strategies, homework task, teacher notes.' },
  toolkit:     { brain:'gpt4o',     maxTokens:4000, temperature:0.70, structurePrompt:'Create a complete toolkit: Quick Start Guide, Master Guide (full content), Step-by-Step Checklist, 3-5 Templates, Swipe File (ready-to-use copy), Resource Directory, Tracking Spreadsheet layout, FAQ Document, 30-Day Action Plan.' },
  checklist:   { brain:'gpt4o',     maxTokens:2500, temperature:0.65, structurePrompt:'Create a comprehensive checklist system: 6 phases with 15-25 specific actionable items each (brief explanation per item), Quick Reference Card (top 10), Progress Tracker, Common Mistakes section.' },
  workbook:    { brain:'gpt4o',     maxTokens:3500, temperature:0.75, structurePrompt:'Create a complete interactive workbook: Self-Assessment (10 questions), 6 sections each with teaching content + reflection questions + exercises with writing space + action planning page, 30-Day Implementation Calendar, Final Reflection.' },
  mini_course: { brain:'gpt4o',     maxTokens:3500, temperature:0.70, structurePrompt:'Create a complete 5-day mini-course: Day 1 Foundation, Day 2 Core Skill, Day 3 Application, Day 4 Advanced, Day 5 Mastery & Launch. Each day: full lesson content, exercise, homework. Include 5 automated delivery emails.' },
  swipe_file:  { brain:'gpt4o',     maxTokens:3500, temperature:0.80, structurePrompt:'Create a complete swipe file: 50 headline formulas with examples, 30 scroll-stopping hooks, 20 WhatsApp scripts, 15 Facebook posts, 40 email subjects, 15 objection responses, 10 closing scripts, 5 testimonial request scripts. Every item fully written.' },
  script:      { brain:'gpt4o',     maxTokens:3000, temperature:0.80, structurePrompt:'Create a complete script pack: 90-second intro video script, 8-10 minute teaching video (full talking script), promotional video (2 min, all 13 triggers), 5x TikTok scripts (60 sec each), full podcast episode outline (45 min), complete selling webinar script (60 min).' },
  blueprint:   { brain:'gpt4o',     maxTokens:4000, temperature:0.70, structurePrompt:'Create a complete business blueprint: Phase 1 Foundation (weeks 1-2), Phase 2 Setup (weeks 3-4), Phase 3 Launch (weeks 5-6), Phase 4 Scale (months 3-6). Each phase: complete action plan. Include financial projections, tools list, obstacle solutions, 90-day daily checklist.' },
  masterclass: { brain:'gpt4o',     maxTokens:4000, temperature:0.75, structurePrompt:'Create a complete masterclass: Part 1 The Truth (15min, dispel myths), Part 2 The Framework (20min, proprietary system), Part 3 Walkthrough (30min, worked examples), Part 4 Advanced (15min), Part 5 Implementation (10min). Include Q&A guide (20 questions with answers) and workbook.' },
  printable:   { brain:'gpt4o',     maxTokens:3000, temperature:0.75, structurePrompt:'Create a complete printable pack: motivational wall art (full text), habit tracker (30-day), goal worksheet, weekly planner, budget tracker, meal planner, educational chart, kids activity sheet, certificate template, business card template. Describe every field, word, color, and font for each.' },
}

function buildProductPrompt(params: {
  topic: string
  audience: string
  format: string
  market: string
  price: string
  level?: string
}): string {
  const config = PRODUCT_CONFIGS[params.format] || PRODUCT_CONFIGS['guide']
  return `You are a world-class expert creating a COMPLETE, PROFESSIONAL, READY-TO-SELL digital product.

PRODUCT TYPE: ${params.format.toUpperCase()}
TOPIC: ${params.topic}
TARGET AUDIENCE: ${params.audience}
MARKET: ${params.market}
PRICE POINT: ${params.price}
${params.level ? 'LEVEL: ' + params.level : ''}

CRITICAL REQUIREMENTS:
- Write as a certified expert with DEEP knowledge of ${params.topic}
- Everything COMPLETE — no placeholders, no "add your content here"
- Locally relevant: currency, examples, context match ${params.market}
- Every section FULLY WRITTEN — actual content, not bullet lists of what to write
- This is a PAID PRODUCT — worth every cent of ${params.price}

${config.structurePrompt}

ALSO INCLUDE AT THE END:
## MARKETING HOOK (one irresistible sentence)
## ELEVATOR PITCH (30 seconds, curiosity gap + transformation promise)
## PRICE JUSTIFICATION (why ${params.price} is a bargain)`
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ══════════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action = 'chat', messages = [], userId, builderTier } = body

    // ── CHAT (General coaching) ───────────────────────────────────────────────
    if (action === 'chat') {
      const brain = selectBrain('chat')
      const allMessages = [
        { role: 'system', content: MANLAW_SYSTEM },
        ...messages.slice(-20), // last 20 messages for context
      ]
      const reply = await callBrain(brain, allMessages, 1500, 0.8)
      return NextResponse.json({ reply, brain })
    }

    // ── WRITE OFFER (All 13 triggers) ─────────────────────────────────────────
    if (action === 'write_offer') {
      const { product, audience, price, platform, painPoints, format, triggers } = body

      const prompt = buildOfferPrompt({ product, audience, price, platform, painPoints, format, triggers })
      const allMessages = [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ]

      // GPT-4o for copywriting — best at conversion copy
      const copy = await callBrain('gpt4o', allMessages, 3000, 0.85)
      return NextResponse.json({ copy, triggers: triggers || 'all 13', platform })
    }

    // ── CREATE DIGITAL PRODUCT ────────────────────────────────────────────────
    if (action === 'create_product') {
      const { topic, audience, format, market, price } = body

      // Step 1: Create the product — use format-specific brain & settings
      const productConfig = PRODUCT_CONFIGS[format] || PRODUCT_CONFIGS['guide']
      const productPrompt = buildProductPrompt({ topic, audience, format, market, price, level: body.level })
      const productMessages = [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: productPrompt },
      ]
      // Software uses Claude Sonnet, all others use GPT-4o
      const productContent = await callBrain(productConfig.brain, productMessages, productConfig.maxTokens, productConfig.temperature)

      // Step 2: Auto-generate launch copy for WhatsApp + TikTok
      const launchPrompt = `You just created this digital product:\n\n${productContent.slice(0, 500)}\n\nNow write:\n1. A WhatsApp broadcast (using all 13 psychological triggers)\n2. A 60-second TikTok script\n3. 3 Facebook posts for days 1, 3 and 7 of launch week\n\nMake all copy ready to post immediately.`
      const launchMessages = [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: launchPrompt },
      ]
      const launchCopy = await callBrain('gpt4o', launchMessages, 2500, 0.85)

      return NextResponse.json({ productContent, launchCopy, topic, format, market })
    }

    // ── GENERATE OBJECTION HANDLERS ───────────────────────────────────────────
    if (action === 'objection_handlers') {
      const { product, price, audience } = body
      const prompt = `Write world-class objection handlers for:

Product: ${product}
Price: ${price}
Audience: ${audience}

For each objection below, write a response that uses psychological triggers (especially Risk Reversal, Transformation Promise, Social Proof and Specificity) to turn the objection into a reason to buy:

1. "It's too expensive / I don't have money"
2. "Let me think about it"
3. "I can find this free on Google"
4. "I'm not sure it will work for me"
5. "I don't trust buying things online"
6. "I need to ask my partner/spouse first"
7. "Send me more information"
8. "I'll buy next month"

Write FULL responses — not bullet points. These are real messages to copy-paste or speak.`

      const reply = await callBrain('gpt4o', [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ], 2500, 0.8)

      return NextResponse.json({ handlers: reply })
    }

    // ── PAIN POINT RESEARCH ───────────────────────────────────────────────────
    if (action === 'research_pain_points') {
      const { market, category, demographic } = body
      const prompt = `You are a world-class market research analyst. Identify the top 10 most profitable pain points in:

Market: ${market}
Category: ${category}
Demographic: ${demographic}

For each pain point provide:
- Specific pain point title (be exact, not generic)
- Why they feel this pain deeply
- What they have already tried (and why it failed)
- What transformation they desperately want
- Recommended product format (ebook/guide/template/checklist/course/toolkit)
- Recommended price in local currency
- Estimated monthly demand
- Competition level (Low/Medium/High gap)

Be specific to the ${market} context. Use local examples.`

      const research = await callBrain('gpt4o', [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ], 2500, 0.7)

      return NextResponse.json({ research, market, category })
    }

    // ── BUILD FULL SALES SYSTEM ───────────────────────────────────────────────
    if (action === 'build_sales_system') {
      const { product, audience, price, market } = body
      const prompt = `Build a complete 30-day sales system for:

Product: ${product}
Audience: ${audience}
Price: ${price}
Market: ${market}

Deliver a complete system including:

## WEEK 1: AWARENESS
- 3 Facebook posts (ready to post)
- 3 WhatsApp status ideas
- 1 TikTok video script
- Target groups/communities to post in

## WEEK 2: EDUCATION
- 3 value posts that build authority
- 1 email to your list (if applicable)
- 1 live video script outline

## WEEK 3: SOCIAL PROOF
- How to collect and share testimonials
- 3 social proof posts
- 1 case study template

## WEEK 4: CLOSE
- Final push WhatsApp broadcast
- Urgency/scarcity strategy
- Follow-up sequence (5 messages)

## DAILY INCOME TARGETS
- Conservative (10 sales/month): R___
- Realistic (25 sales/month): R___  
- Stretch (50 sales/month): R___

Use all 13 psychological triggers throughout. Make every piece copy-paste ready.`

      const system = await callBrain('gpt4o', [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ], 4000, 0.8)

      return NextResponse.json({ system, product })
    }

    // ── WHAT SELLS AUDIT ─────────────────────────────────────────────────────
    // Score any offer/product using the What Sells framework
    if (action === 'what_sells_audit') {
      const { copy, product, audience } = body
      const prompt = `Apply the WHAT SELLS framework to audit this offer/product:

\${copy ? 'COPY TO AUDIT:\n' + copy : 'PRODUCT: ' + product + '\nAUDIENCE: ' + audience}

Score it on the WHAT SELLS framework (each out of 25 points):

## AUDIT REPORT

### 1. SPECIFIC PERSON (0-25 points)
Score: X/25
Who is this for? Is it ONE specific person? Do they feel SEEN?
What's working: [specific feedback]
What to fix: [specific rewrite suggestion]

### 2. SPECIFIC PROBLEM (0-25 points)
Score: X/25
Is ONE specific problem addressed? Is it described in the buyer's language?
What's working: [specific feedback]
What to fix: [specific rewrite suggestion]

### 3. CLEAR PROMISE (0-25 points)
Score: X/25
Is the transformation CLEAR and SPECIFIC? Is there a named outcome?
What's working: [specific feedback]
What to fix: [specific rewrite suggestion]

### 4. CLEAR PATH / BRIDGE (0-25 points)
Score: X/25
Is the product positioned as the SHORTCUT (bridge)? Is the path visible?
What's working: [specific feedback]
What to fix: [specific rewrite suggestion]

### TOTAL SCORE: X/100

### WHAT'S KILLING THE SALE (if any):
List the specific elements from: Invisible Product / Poor Value Communication / Weak Problem-Solution Connection / No Emotional Trigger

### REWRITTEN VERSION:
Rewrite the headline/hook using all 4 elements of the What Sells formula + at least 5 psychological triggers.

### WHAT SELLS SCORE INTERPRETATION:
- 90-100: This will sell. Run it.
- 75-89: Strong. Fix the flagged issues first.
- 60-74: Needs work. Major rewrite recommended.
- Below 60: Start over with the formula.`

      const audit = await callBrain('gpt4o', [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ], 2500, 0.7)

      return NextResponse.json({ audit })
    }

    // ── WHAT SELLS FORMULA BUILDER ────────────────────────────────────────────
    // Build a complete offer from scratch using the formula
    if (action === 'what_sells_build') {
      const { person, problem, promise, market, price } = body
      const prompt = `Using the WHAT SELLS formula, build a complete offer:

SPECIFIC PERSON: \${person}
SPECIFIC PROBLEM: \${problem}
DESIRED PROMISE: \${promise}
MARKET: \${market}
PRICE: \${price}

Build the following (all complete, ready to use):

## 1. PRODUCT NAME (using the formula — specific + promise-driven)

## 2. THE ONE-LINE PITCH
"For [specific person] who [specific problem], [product name] is the [bridge] that [clear promise]."

## 3. HEADLINE OPTIONS (5 headlines, each using a different trigger combo)

## 4. PROBLEM DESCRIPTION (150 words — written in buyer's exact language, makes them feel seen)

## 5. PROMISE STATEMENT (the transformation — before → after)

## 6. THE BRIDGE STATEMENT (how your product is the shortcut)

## 7. WHATSAPP MESSAGE (complete, ready to send, all 4 elements + 5 triggers)

## 8. FACEBOOK POST (complete, ready to post)

## 9. TIKTOK HOOK (first 3 seconds that stops the scroll)

## 10. OBJECTION HANDLERS (3 most likely objections with complete responses)

## 11. WHAT SELLS SCORE (self-score this offer you just created)`

      const built = await callBrain('gpt4o', [
        { role: 'system', content: MANLAW_SYSTEM },
        { role: 'user',   content: prompt },
      ], 3000, 0.8)

      return NextResponse.json({ built, formula: { person, problem, promise } })
    }

    // ── BRUTAL AUDIT — self-critique + rebuild ──────────────────────────────
    if (action === 'brutal_audit') {
      const { offer } = body
      const prompt = `You must now BRUTALLY AUDIT this offer. No politeness. No motivational fluff.

OFFER TO AUDIT:
${offer}

TASK 1 — BRUTAL ANALYSIS (no filter):
Score out of 100 using the What Sells framework:
- Specific Person (0-25): score + why
- Specific Problem (0-25): score + why  
- Clear Promise (0-25): score + why
- Clear Path (0-25): score + why
TOTAL: X/100

List every:
→ Generic phrase (exact quote from the offer)
→ Banned phrase detected
→ Missing unique mechanism
→ Reasons a skeptical South African buyer would NOT trust this
→ Where it sounds like "every other online course"

TASK 2 — WHY DID YOU FAIL?
Diagnose which enforcement rules were broken. Be specific.

TASK 3 — REBUILD AT ELITE LEVEL:
Rewrite the offer with STRICT rules:
1. Named Unique Mechanism (proprietary system name)
2. ONE specific person (named by situation, not demographics)
3. Specific believable result (number + timeframe + mechanism)
4. Low-risk entry point
5. New identity for the buyer
6. ZERO banned phrases
7. At least 7 of 13 triggers ACTIVE (not mentioned — ACTIVE)
8. Passes the SA skeptical buyer test

After rebuilding — score your rewrite. If below 85/100, rewrite again before submitting.

TASK 4 — WHY CHOOSE THIS OVER ALTERNATIVES:
Answer clearly: why choose this over free YouTube / other courses / other MLM?
If you cannot answer convincingly, fix the offer again.

DELIVER: The brutal analysis + the elite rewrite. Nothing less.`

      const audit = await callBrain('gpt4o', [
        { role:'system', content: MANLAW_SYSTEM },
        { role:'user',   content: prompt },
      ], 3500, 0.8)
      return NextResponse.json({ audit })
    }

    // ── ITERATE — rewrite until score ≥ 85 ───────────────────────────────────
    if (action === 'iterate') {
      const { offer, rounds = 2 } = body
      let current = offer
      let history = ''

      for (let i = 0; i < Math.min(rounds, 3); i++) {
        const iterPrompt = `ITERATION ${i+1} — ENFORCEMENT CHECK

Current offer:
${current}

Internal enforcement protocol:
1. Score this out of 100 (Specific Person/Problem/Promise/Path)
2. List every banned phrase or generic claim found
3. If score < 85 OR banned phrases exist → REWRITE immediately with the enforcement rules
4. Output ONLY the final rewritten offer (no commentary, no score shown)
5. The rewrite must pass the SA skeptical buyer test

Deliver the best possible version. If it already scores 85+, improve it further anyway.`

        const result = await callBrain('gpt4o', [
          { role:'system', content: MANLAW_SYSTEM },
          { role:'user',   content: iterPrompt },
        ], 2500, 0.85)

        history += `

--- ITERATION ${i+1} ---
${result}`
        current = result
      }

      return NextResponse.json({ finalOffer: current, iterations: history })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e: any) {
    console.error('[CoachManlaw] ERROR:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
