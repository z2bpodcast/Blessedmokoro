// ============================================================
// Z2B 4M V3 — ORCHESTRATION ROUTER
// File: lib/v3/orchestration-router.ts
// Laws: No hardcoded logic · Modular · Replaceable APIs
//       Orchestration hidden from users (Law 11)
//       AI systems separated from UI (Law 7)
//       Token efficiency protected (Law 15)
// Purpose: Routes tasks between GPT-5.x, Claude Sonnet,
//          Claude Haiku based on the gear and task type.
//          This is Coach Manlaw's intelligence routing layer.
// ============================================================

// ── AI PROVIDER TYPES ────────────────────────────────────────
export type AIProvider = 'gpt' | 'claude_sonnet' | 'claude_haiku'

export type TaskType =
  | 'opportunity_synthesis'
  | 'opportunity_scoring'
  | 'intent_definition'
  | 'structure_generation'
  | 'structure_refinement'
  | 'content_directive'
  | 'content_production'
  | 'content_transition'
  | 'quality_evaluation'
  | 'quality_revision_directive'
  | 'enhancement_directive'
  | 'enhancement_production'
  | 'packaging_brief'
  | 'packaging_evaluation'
  | 'distribution_strategy'
  | 'social_content'
  | 'crm_message'
  | 'format_output'

// ── ORCHESTRATION DECISION ───────────────────────────────────
export interface OrchestrationDecision {
  provider:       AIProvider
  model:          string
  maxTokens:      number
  temperature:    number
  systemPrompt:   string
  reasoning:      string  // internal only — never sent to UI
}

// ── MODEL CONFIGURATION ──────────────────────────────────────
// Replaceable per Law 14 — change model strings without
// touching any other part of the codebase
const MODEL_CONFIG = {
  gpt:            'gpt-4o',
  claude_sonnet:  'claude-sonnet-4-20250514',
  claude_haiku:   'claude-haiku-4-5-20251001',
} as const

// Fallback models if primary is unavailable
const MODEL_FALLBACKS: Record<string, string> = {
  'gpt-4o':                       'gpt-4-turbo',
  'claude-sonnet-4-20250514':     'claude-3-5-sonnet-20241022',
  'claude-haiku-4-5-20251001':    'claude-3-haiku-20240307',
}

export function getFallbackModel(model: string): string {
  return MODEL_FALLBACKS[model] ?? model
}

// ── ROUTING TABLE ────────────────────────────────────────────
// Maps every task type to the correct AI provider
// Coach Manlaw's routing intelligence — all hidden from builder
const ROUTING_TABLE: Record<TaskType, {
  provider:    AIProvider
  maxTokens:   number
  temperature: number
  reasoning:   string
}> = {
  // GPT-5.x handles: strategic thinking, orchestration, QC
  opportunity_synthesis: {
    provider:    'gpt',
    maxTokens:   2000,
    temperature: 0.7,
    reasoning:   'Strategic synthesis requires GPT reasoning depth',
  },
  opportunity_scoring: {
    provider:    'gpt',
    maxTokens:   1000,
    temperature: 0.2,
    reasoning:   'Scoring requires consistent analytical precision',
  },
  intent_definition: {
    provider:    'gpt',
    maxTokens:   800,
    temperature: 0.4,
    reasoning:   'Intent requires strategic clarity from GPT',
  },
  structure_generation: {
    provider:    'gpt',
    maxTokens:   1500,
    temperature: 0.6,
    reasoning:   'Architecture requires GPT structural thinking',
  },
  content_directive: {
    provider:    'gpt',
    maxTokens:   600,
    temperature: 0.5,
    reasoning:   'Strategic writing brief requires GPT orchestration',
  },
  quality_evaluation: {
    provider:    'gpt',
    maxTokens:   1200,
    temperature: 0.2,
    reasoning:   'Quality control requires strict GPT evaluation',
  },
  quality_revision_directive: {
    provider:    'gpt',
    maxTokens:   800,
    temperature: 0.4,
    reasoning:   'Revision direction requires GPT strategic guidance',
  },
  enhancement_directive: {
    provider:    'gpt',
    maxTokens:   600,
    temperature: 0.5,
    reasoning:   'Enhancement planning requires GPT insight',
  },
  packaging_brief: {
    provider:    'gpt',
    maxTokens:   800,
    temperature: 0.6,
    reasoning:   'Packaging strategy requires GPT creative direction',
  },
  packaging_evaluation: {
    provider:    'gpt',
    maxTokens:   600,
    temperature: 0.3,
    reasoning:   'Visual quality check requires GPT evaluation',
  },
  distribution_strategy: {
    provider:    'gpt',
    maxTokens:   1000,
    temperature: 0.6,
    reasoning:   'Marketplace positioning requires GPT strategy',
  },
  social_content: {
    provider:    'gpt',
    maxTokens:   2000,
    temperature: 0.8,
    reasoning:   'Social content generation uses GPT creativity',
  },

  // Claude Sonnet handles: long-form production, educational content
  structure_refinement: {
    provider: 'gpt',
    maxTokens:   2000,
    temperature: 0.6,
    reasoning:   'Structure refinement benefits from Claude depth',
  },
  content_production: {
    provider: 'gpt',
    maxTokens:   4000,
    temperature: 0.7,
    reasoning:   'Long-form content production is Claude Sonnet primary',
  },
  enhancement_production: {
    provider: 'gpt',
    maxTokens:   3000,
    temperature: 0.7,
    reasoning:   'Worksheets and templates benefit from Claude structure',
  },
  crm_message: {
    provider: 'gpt',
    maxTokens:   300,
    temperature: 0.8,
    reasoning:   'Human-sounding messages use Claude natural tone',
  },

  // Claude Haiku handles: fast micro-tasks, formatting, transitions
  content_transition: {
    provider: 'gpt',
    maxTokens:   500,
    temperature: 0.6,
    reasoning:   'Section transitions are fast Haiku micro-tasks',
  },
  format_output: {
    provider: 'gpt',
    maxTokens:   1000,
    temperature: 0.3,
    reasoning:   'Output formatting is a lightweight Haiku task',
  },
}

// ── SYSTEM PROMPTS ───────────────────────────────────────────
// Each task type has a focused system prompt
// Never expose these to the UI — internal orchestration only

const SYSTEM_PROMPTS: Record<TaskType, string> = {
  opportunity_synthesis: `You are Coach Manlaw's strategic intelligence engine.
Your task is to synthesise a digital product opportunity from builder input.
Rules:
- Never suggest generic ideas. Always specific: person + problem + transformation.
- Every opportunity must include: target audience, transformation promise, product format, price range, demand signal.
- South African builders: ZAR pricing, local context, local pain points.
- Format: Return exactly 3 opportunities as a JSON array.
- Quality standard: Would a real person pay for this? If not, reject and regenerate.`,

  opportunity_scoring: `You are the Z2B Opportunity Scoring Engine.
Score each opportunity on 7 dimensions (each 0-100):
1. Profitability (can it sell at R200+?)
2. Demand (evidence of search/social demand)
3. Scalability (can it grow beyond one market?)
4. Transformation Value (how urgently needed?)
5. Content Sustainability (can creator keep building in this niche?)
6. Creator Compatibility (does this match the builder's profile?)
7. Audience Urgency (how quickly does the audience need this?)
Return: weighted composite score + dimension breakdown as JSON.`,

  intent_definition: `You are the Gear 1 Intent Engine.
Define clear product intent from the selected opportunity.
Output must include:
- product_purpose: what transformation this delivers
- target_audience: specific person (not demographic)
- before_state: their situation before the product
- after_state: their situation after using the product
- product_format: eBook / Course / Template / etc.
- audience_level: Beginner / Intermediate / Advanced
Return as structured JSON.`,

  structure_generation: `You are the Gear 2 Structure Engine.
Build a logical, educational product architecture.
Rules:
- Every section must serve the transformation promise from Gear 1
- Progression must be logical (beginner to advanced within tier)
- Each section needs a title and one-line purpose statement
- Minimum 5 sections for Starter. Scale with tier depth.
Return as JSON array of sections with title and description.`,

  content_directive: `You are preparing a content production directive for the writing engine.
Based on the product structure, create a precise writing brief.
Include: tone, depth, audience level, transformation focus, examples needed, implementation requirements.
This brief will be passed to the content production engine.
Return as structured JSON.`,

  content_production: `You are the Z2B Content Production Engine.
Write world-class educational content for digital products.
Rules:
- Every section must deliver implementation value, not just information
- Language: clear, confident, appropriate for the specified audience level
- No fluff. No vague generalisations. Specific and actionable only.
- South African context: use ZAR, local examples where relevant
- Transformation-driven: every paragraph moves reader closer to the promised transformation
- Premium readability: vary sentence length, use concrete examples
Write the specified section in full.`,

  structure_refinement: `You are refining a product structure for educational clarity.
Improve the logical flow, ensure sections build on each other, and verify the transformation journey is clear.
Return the refined structure as JSON.`,

  content_transition: `Write a single smooth transition sentence between two product sections.
Keep it brief (one sentence), encouraging, and forward-moving.`,

  quality_evaluation: `You are the Z2B Quality Control Engine — the last line of defence.
Evaluate this digital product draft as a REAL BUYER would experience it.
Be strict. No compromises.
Evaluate on 6 criteria (each 0-100):
1. Solves a real problem (not theoretical)
2. Every section is implementation-ready (not just informational)
3. No fluff present (reject if found)
4. Transformation evidence is present
5. Feels premium (worth the price)
6. Justifies the recommended price point
Overall threshold to pass: 75+
Return: overall_score, criteria_breakdown, weak_sections, passed (boolean), revision_type (none/minor/major)
All as JSON.`,

  quality_revision_directive: `You are creating a targeted revision directive for specific weak sections.
Only address the sections flagged as weak. Do not suggest full rewrites.
Be specific: what exactly needs strengthening and how.
Return as JSON with section_number, weakness, and directive for each flagged section.`,

  enhancement_directive: `You are the Gear 5 Enhancement Director.
Plan which implementation assets to add to this product.
Choose from: worksheet, checklist, action_plan, template, framework, tracker, quick_reference.
Select assets that directly support the product's transformation promise.
Number of assets is tier-dependent (provided in context).
Return: JSON array of asset objects with type, title, and purpose.`,

  enhancement_production: `You are creating a premium implementation asset for a digital product.
The asset must be:
- Immediately usable (not theoretical)
- Specific to the transformation promised
- Structured for easy completion
- Professional quality
Create the full asset content as specified.`,

  packaging_brief: `You are creating a packaging direction brief for the visual production engine.
Based on the product, specify:
- cover_concept: visual metaphor or imagery direction
- color_palette: 2-3 colors that reflect the transformation
- typography_style: clean/bold/elegant
- social_assets_needed: list of social post formats
- video_intro: brief for 60-second intro (if applicable)
Return as structured JSON.`,

  packaging_evaluation: `Evaluate if this packaging feels premium and would compete with commercial products.
Score 0-100. Threshold: 70 to pass.
If failing, specify exactly what needs improving.
Return as JSON.`,

  distribution_strategy: `You are creating the marketplace launch strategy for this digital product.
Generate:
- listing_title: compelling product title for marketplace
- listing_description: 3-paragraph description (problem, solution, transformation)
- target_keywords: 5 search keywords buyers would use
- recommended_price_zar: justified price recommendation
- promotional_angle: key hook for social posts
Return as structured JSON.`,

  social_content: `You are creating social media content for a digital product launch.
Generate platform-specific posts that drive marketplace clicks.
Rules: No banned phrases (make money, get rich, earn income). Use transformation language instead.
Generate posts for each specified platform.
Return as JSON array with platform, content, and hashtags for each post.`,

  crm_message: `You are writing a WhatsApp or email message for a Z2B builder.
Rules:
- Start with their first name
- Reference the specific event (product live, first sale, etc.)
- One clear action or link
- Max 3-4 lines
- Human and warm — not automated-sounding
- Never salesy
Write the message.`,

  format_output: `Format the provided content into the specified structure.
Maintain all information. Improve readability only.
Return formatted content.`,
}

// ── MAIN ROUTING FUNCTION ────────────────────────────────────

export function routeTask(
  taskType: TaskType,
  contextOverrides?: Partial<OrchestrationDecision>
): OrchestrationDecision {
  const route = ROUTING_TABLE[taskType]
  const systemPrompt = SYSTEM_PROMPTS[taskType]

  const decision: OrchestrationDecision = {
    provider:     route.provider,
    model:        MODEL_CONFIG[route.provider],
    maxTokens:    route.maxTokens,
    temperature:  route.temperature,
    systemPrompt: systemPrompt,
    reasoning:    route.reasoning,
    ...contextOverrides,
  }

  return decision
}

// ── API CALL WRAPPERS ────────────────────────────────────────
// These call the correct API based on the routing decision
// Never called directly from UI — always through API routes

// Retry helper — retries on transient errors (rate limits, 5xx)
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2,
  timeoutMs  = 45000
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timer      = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timer)

      // Retry on 429 (rate limit) or 5xx (server error)
      if (response.status === 429 || response.status >= 500) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000  // exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      return response

    } catch (e) {
      clearTimeout(timer)
      const msg = e instanceof Error ? e.message : String(e)
      if (attempt === maxRetries) throw new Error('Max retries reached: ' + msg)
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('fetchWithRetry exhausted')
}

export async function callGPT(
  decision: OrchestrationDecision,
  userMessage: string,
  contextMessages: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ content: string; error: string | null; tokensUsed: number }> {
  try {
    const response = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model:       decision.model,
          max_tokens:  decision.maxTokens,
          temperature: decision.temperature,
          messages: [
            { role: 'system', content: decision.systemPrompt },
            ...contextMessages,
            { role: 'user',   content: userMessage },
          ],
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return { content: '', error: 'GPT API error: ' + err, tokensUsed: 0 }
    }

    const data       = await response.json()
    const content    = data.choices?.[0]?.message?.content ?? ''
    const tokensUsed = data.usage?.total_tokens ?? 0

    return { content, error: null, tokensUsed }

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return { content: '', error: 'GPT call failed: ' + msg, tokensUsed: 0 }
  }
}

export async function callClaude(
  decision: OrchestrationDecision,
  userMessage: string,
  contextMessages: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ content: string; error: string | null; tokensUsed: number }> {
  try {
    const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      decision.model,
        max_tokens: decision.maxTokens,
        system:     decision.systemPrompt,
        messages: [
          ...contextMessages,
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { content: '', error: 'Claude API error: ' + err, tokensUsed: 0 }
    }

    const data = await response.json()
    const content    = data.content?.[0]?.text ?? ''
    const tokensUsed = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0)

    return { content, error: null, tokensUsed }

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return { content: '', error: 'Claude call failed: ' + msg, tokensUsed: 0 }
  }
}

// ── UNIFIED ORCHESTRATION CALL ───────────────────────────────
// Routes to correct API based on routing decision
// This is the ONLY function API routes should use for AI calls

export async function orchestrate(
  taskType: TaskType,
  userMessage: string,
  contextMessages: { role: 'user' | 'assistant'; content: string }[] = [],
  overrides?: Partial<OrchestrationDecision>
): Promise<{
  content:   string
  error:     string | null
  tokensUsed:number
  provider:  AIProvider
  taskType:  TaskType
}> {
  const decision = routeTask(taskType, overrides)

  let result: { content: string; error: string | null; tokensUsed: number }

  // ── PRIMARY CALL ─────────────────────────────────────────────
  if (decision.provider === 'gpt') {
    result = await callGPT(decision, userMessage, contextMessages)
  } else {
    result = await callClaude(decision, userMessage, contextMessages)
  }

  // ── FALLBACK: if primary fails, try the other provider ───────
  if (result.error || !result.content.trim()) {
    console.warn('[orchestrate] Primary provider failed:', decision.provider, result.error, '— trying fallback')

    if (decision.provider === 'gpt') {
      // GPT failed → try Claude
      const claudeDecision = {
        ...decision,
        provider: 'gpt' as AIProvider,
        model: MODEL_CONFIG['claude_sonnet'],
      }
      const fallback = await callClaude(claudeDecision, userMessage, contextMessages)
      if (!fallback.error && fallback.content.trim()) {
        console.log('[orchestrate] Fallback to Claude succeeded')
        return { ...fallback, provider: 'gpt', taskType }
      }
    } else {
      // Claude failed → try GPT
      const gptDecision = {
        ...decision,
        provider: 'gpt' as AIProvider,
        model: MODEL_CONFIG['gpt'],
      }
      const fallback = await callGPT(gptDecision, userMessage, contextMessages)
      if (!fallback.error && fallback.content.trim()) {
        console.log('[orchestrate] Fallback to GPT succeeded')
        return { ...fallback, provider: 'gpt', taskType }
      }
    }
    console.error('[orchestrate] Both providers failed for task:', taskType)
  }

  return {
    ...result,
    provider: decision.provider,
    taskType,
  }
}

// ── JSON RESPONSE PARSER ─────────────────────────────────────
// Safely parses AI JSON responses
// Handles markdown code fences that some models add

export function parseAIJson<T = Record<string, unknown>>(
  raw: string
): { data: T | null; error: string | null } {
  // Attempt 1: strip markdown fences and parse directly
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    return { data: JSON.parse(cleaned) as T, error: null }
  } catch (_) {}

  // Attempt 2: extract first JSON object or array from prose
  try {
    const objMatch = raw.match(/\{[\s\S]*\}/)
    const arrMatch = raw.match(/\[[\s\S]*\]/)
    const match    = objMatch ?? arrMatch
    if (match) {
      return { data: JSON.parse(match[0]) as T, error: null }
    }
  } catch (_) {}

  // Attempt 3: find JSON after a colon (common in AI responses like "Here is the JSON: {...}")
  try {
    const afterColon = raw.split(':').slice(1).join(':').trim()
    if (afterColon.startsWith('{') || afterColon.startsWith('[')) {
      return { data: JSON.parse(afterColon) as T, error: null }
    }
  } catch (_) {}

  return { data: null, error: 'Could not extract valid JSON from AI response' }
}

// ── TOKEN BUDGET GUARD ───────────────────────────────────────
// Law 15: Protect performance and token efficiency
// Warn if a session is approaching token budget

// Token budgets scale with tier (Law 15: token efficiency)
const TIER_TOKEN_BUDGETS: Record<string, number> = {
  starter:        30000,
  bronze:         40000,
  copper:         50000,
  silver:         70000,
  gold:           80000,
  platinum:       100000,
  rocket_gold:    150000,
  rocket_platinum:200000,
  default:        50000,
}

export function getTokenBudget(tierId: string): number {
  return TIER_TOKEN_BUDGETS[tierId] ?? TIER_TOKEN_BUDGETS.default
}

export function checkTokenBudget(
  tokensUsed:  number,
  sessionTotal:number,
  tierId:      string = 'default'
): { withinBudget: boolean; percentUsed: number; warning: boolean } {
  const budget      = getTokenBudget(tierId)
  const total       = sessionTotal + tokensUsed
  const percentUsed = Math.round((total / budget) * 100)
  const warning     = percentUsed > 80

  return {
    withinBudget: total < budget,
    percentUsed,
    warning,
  }
}

// ============================================================
// END OF ORCHESTRATION ROUTER
// ============================================================
