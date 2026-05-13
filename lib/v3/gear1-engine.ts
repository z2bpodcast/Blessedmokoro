// ============================================================
// Z2B 4M V3 — GEAR 1 INTENT ENGINE
// File: lib/v3/gear1-engine.ts
// Laws: GPT-5.x orchestrates · Modular · Extensible
// Purpose: Transform Idea Ignition opportunity into a
//          precise product intent definition. This feeds
//          directly into Gear 2 Structure Engine.
// ============================================================

import { orchestrate, parseAIJson } from '@/lib/v3/orchestration-router'

// ── TYPES ────────────────────────────────────────────────────

export interface SelectedOpportunity {
  title:          string
  audience:       string
  transformation: string
  format:         string
  priceRangeMin?: number
  priceRangeMax?: number
}

export type AudienceLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'beginner_intermediate'
  | 'intermediate_advanced'
  | 'all_levels'

export type ProductFormat =
  | 'ebook'
  | 'course'
  | 'template'
  | 'checklist'
  | 'workbook'
  | 'toolkit'
  | 'masterclass'
  | 'guide'
  | 'swipe_file'
  | 'planner'

export interface IntentDefinition {
  // Core intent fields (shown to builder for confirmation)
  productTitle:      string       // refined title
  productPurpose:    string       // what transformation this delivers
  targetAudience:    string       // specific person description
  beforeState:       string       // their situation before the product
  afterState:        string       // their situation after using the product
  productFormat:     ProductFormat
  audienceLevel:     AudienceLevel
  priceRecommended:  number       // ZAR
  // Implementation notes (used by Gear 2 — not shown to builder directly)
  keyProblems:       string[]     // 3 core problems the product solves
  promiseStatement:  string       // "This product will help [audience] [achieve X] by [method]"
  contentTone:       string       // writing tone recommendation
  geographyContext:  string       // SA / Nigeria / Global etc.
}

export interface Gear1Result {
  intent:     IntentDefinition | null
  tokensUsed: number
  error:      string | null
}

// ── FORMAT LABELS ─────────────────────────────────────────────
export const FORMAT_LABELS: Record<ProductFormat, { label: string; emoji: string; description: string }> = {
  ebook:      { label: 'eBook',           emoji: '📖', description: 'A comprehensive written guide' },
  course:     { label: 'Online Course',   emoji: '🎓', description: 'Structured learning with modules' },
  template:   { label: 'Template Pack',   emoji: '📋', description: 'Ready-to-use files and frameworks' },
  checklist:  { label: 'Checklist',       emoji: '✅', description: 'Step-by-step action list' },
  workbook:   { label: 'Workbook',        emoji: '📓', description: 'Interactive guided exercises' },
  toolkit:    { label: 'Toolkit',         emoji: '🧰', description: 'Bundle of practical resources' },
  masterclass:{ label: 'Masterclass',     emoji: '🏆', description: 'In-depth premium training' },
  guide:      { label: 'Step-by-Step Guide', emoji: '🗺️', description: 'Practical implementation guide' },
  swipe_file: { label: 'Swipe File',      emoji: '📂', description: 'Collection of proven examples' },
  planner:    { label: 'Planner',         emoji: '📅', description: 'Structured planning system' },
}

export const AUDIENCE_LEVEL_LABELS: Record<AudienceLevel, string> = {
  beginner:             'Complete Beginners',
  intermediate:         'Intermediate (some experience)',
  advanced:             'Advanced Practitioners',
  beginner_intermediate:'Beginners to Intermediate',
  intermediate_advanced:'Intermediate to Advanced',
  all_levels:           'All Levels',
}

// ── GEAR 1 ENGINE ─────────────────────────────────────────────

export async function runGear1(params: {
  opportunity: SelectedOpportunity
  tierId:      string
  geography?:  string
}): Promise<Gear1Result> {
  const geo = params.geography ?? 'South Africa'

  const prompt = buildIntentPrompt({
    opportunity: params.opportunity,
    geo,
    tierId:      params.tierId,
  })

  const result = await orchestrate('intent_definition', prompt)

  if (result.error) {
    return { intent: null, tokensUsed: result.tokensUsed, error: result.error }
  }

  const { data, error: parseError } = parseAIJson<IntentDefinition>(result.content)

  if (parseError || !data) {
    return { intent: null, tokensUsed: result.tokensUsed, error: 'Could not process intent. Please try again.' }
  }

  // Validate required fields are present
  const required: (keyof IntentDefinition)[] = [
    'productTitle', 'productPurpose', 'targetAudience',
    'beforeState', 'afterState', 'productFormat', 'audienceLevel',
  ]
  const missing = required.filter(k => !data[k])
  if (missing.length > 0) {
    return { intent: null, tokensUsed: result.tokensUsed, error: 'Incomplete intent generated. Please try again.' }
  }

  // Validate format is a known value
  const validFormats = Object.keys(FORMAT_LABELS) as ProductFormat[]
  if (!validFormats.includes(data.productFormat)) {
    data.productFormat = mapToValidFormat(data.productFormat as string)
  }

  // Validate audience level
  const validLevels = Object.keys(AUDIENCE_LEVEL_LABELS) as AudienceLevel[]
  if (!validLevels.includes(data.audienceLevel)) {
    data.audienceLevel = 'beginner'
  }

  // Ensure price is reasonable (between R99 and R5000)
  if (!data.priceRecommended || data.priceRecommended < 99 || data.priceRecommended > 5000) {
    data.priceRecommended = deriveDefaultPrice(params.opportunity)
  }
  // Hard clamp — prevent any price slipping through out of range
  data.priceRecommended = Math.max(99, Math.min(4999, Math.round(data.priceRecommended)))

  // Ensure key problems array exists
  if (!Array.isArray(data.keyProblems) || data.keyProblems.length === 0) {
    data.keyProblems = ['Identified from opportunity data']
  }

  return { intent: data, tokensUsed: result.tokensUsed, error: null }
}

// ── INTENT ADJUSTMENT ─────────────────────────────────────────
// Called when builder wants to modify the generated intent

export async function adjustGear1(params: {
  currentIntent: IntentDefinition
  adjustment:    string
  tierId:        string
}): Promise<Gear1Result> {
  const prompt = `You generated this product intent definition:
${JSON.stringify(params.currentIntent, null, 2)}

The builder wants to adjust it with this request:
"${params.adjustment}"

Apply ONLY the requested changes. Keep everything else exactly the same.
Return the complete updated intent definition as valid JSON matching the original structure exactly.`

  const result = await orchestrate('intent_definition', prompt)

  if (result.error) {
    return { intent: null, tokensUsed: result.tokensUsed, error: result.error }
  }

  const { data, error: parseError } = parseAIJson<IntentDefinition>(result.content)

  if (parseError || !data) {
    return { intent: params.currentIntent, tokensUsed: result.tokensUsed, error: null }
  }

  // Clamp price after adjustment too (LOW #10)
  if (data.priceRecommended) {
    data.priceRecommended = Math.max(99, Math.min(4999, Math.round(data.priceRecommended)))
  }
  return { intent: data, tokensUsed: result.tokensUsed, error: null }
}

// ── PROMPT BUILDER ────────────────────────────────────────────

function buildIntentPrompt(p: {
  opportunity: SelectedOpportunity
  geo:         string
  tierId:      string
}): string {
  const priceRange = p.opportunity.priceRangeMin && p.opportunity.priceRangeMax
    ? `R${p.opportunity.priceRangeMin}–R${p.opportunity.priceRangeMax}`
    : 'R149–R499'

  return `You are the Gear 1 Intent Engine.

A Z2B builder has selected this digital product opportunity:
Title: "${p.opportunity.title}"
Audience: "${p.opportunity.audience}"
Transformation: "${p.opportunity.transformation}"
Format: "${p.opportunity.format}"
Price range: ${priceRange}
Geography: ${p.geo}

Your task: Define the precise INTENT for this digital product.

Rules:
- targetAudience must be MORE specific than what was given — add age, context, pain specifics
- beforeState and afterState must be vivid and concrete (not generic)
- productTitle may be refined to be more compelling but must match the original concept
- priceRecommended must be in ZAR, realistic for ${p.geo}, between R99 and R4999
- audienceLevel must be one of: beginner, intermediate, advanced, beginner_intermediate, intermediate_advanced, all_levels
- productFormat must be one of: ebook, course, template, checklist, workbook, toolkit, masterclass, guide, swipe_file, planner
- keyProblems: exactly 3 specific problems this product solves
- contentTone: one of: conversational, professional, inspiring, practical, bold
- promiseStatement: "This product will help [specific person] [achieve specific result] by [specific method]"
- geographyContext: note any ZAR pricing, local examples, or market-specific context needed

Return ONLY valid JSON:
{
  "productTitle": "refined compelling title",
  "productPurpose": "one sentence — the core transformation this delivers",
  "targetAudience": "specific person: age, situation, exact pain, context",
  "beforeState": "vivid description of their current struggle",
  "afterState": "vivid description of their life after using this product",
  "productFormat": "ebook|course|template|checklist|workbook|toolkit|masterclass|guide|swipe_file|planner",
  "audienceLevel": "beginner|intermediate|advanced|beginner_intermediate|intermediate_advanced|all_levels",
  "priceRecommended": 299,
  "keyProblems": ["problem 1", "problem 2", "problem 3"],
  "promiseStatement": "This product will help...",
  "contentTone": "conversational|professional|inspiring|practical|bold",
  "geographyContext": "context note for content generation"
}`
}

// ── HELPERS ───────────────────────────────────────────────────

function mapToValidFormat(raw: string): ProductFormat {
  const lower = raw.toLowerCase()
  const map: Record<string, ProductFormat> = {
    'e-book':   'ebook',
    'e book':   'ebook',
    'book':     'ebook',
    'pdf':      'ebook',
    'video':    'course',
    'program':  'course',
    'training': 'course',
    'template': 'template',
    'bundle':   'toolkit',
    'pack':     'toolkit',
    'class':    'masterclass',
    'workshop': 'course',
    'plan':     'planner',
    'system':   'guide',
  }
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val
  }
  console.warn('[gear1-engine] Unknown format:', raw, '— defaulting to ebook')
  return 'ebook' // safe default
}

function deriveDefaultPrice(opp: SelectedOpportunity): number {
  if (opp.priceRangeMin && opp.priceRangeMax && opp.priceRangeMin > 0) {
    return Math.max(99, Math.round((opp.priceRangeMin + opp.priceRangeMax) / 2))
  }
  const formatPrices: Record<string, number> = {
    masterclass: 499, course: 399, toolkit: 349, workbook: 249,
    guide: 199, ebook: 199, template: 149, checklist: 99, planner: 149,
  }
  return formatPrices[opp.format?.toLowerCase() ?? ''] ?? 199
}

// ── INTENT SUMMARY FOR HANDOFF ─────────────────────────────────
// Stripped version passed to Gear 2 (no internal fields)
export function toGear2Handoff(intent: IntentDefinition | null): Record<string, unknown> | null {
  if (!intent) return null
  return {
    productTitle:     intent.productTitle,
    productPurpose:   intent.productPurpose,
    targetAudience:   intent.targetAudience,
    beforeState:      intent.beforeState,
    afterState:       intent.afterState,
    productFormat:    intent.productFormat,
    audienceLevel:    intent.audienceLevel,
    priceRecommended: intent.priceRecommended,
    keyProblems:      intent.keyProblems,
    promiseStatement: intent.promiseStatement,
    contentTone:      intent.contentTone,
    geographyContext: intent.geographyContext,
  }
}
