// ============================================================
// Z2B 4M V3 — GEAR 5 VALUE ENHANCEMENT ENGINE
// File: lib/v3/gear5-engine.ts
// Laws: GPT-5.x directs · Claude Sonnet produces assets
//       Tier-scaled asset count · Copper endpoint
// ============================================================

import { orchestrate, parseAIJson } from '@/lib/v3/orchestration-router'
import { normaliseTier }             from '@/lib/v3/tier-config'
import type { ContentDraft }         from '@/lib/v3/gear3-engine'
import type { IntentDefinition }     from '@/lib/v3/gear1-engine'

// ── TYPES ────────────────────────────────────────────────────

export type AssetType =
  | 'worksheet'
  | 'checklist'
  | 'action_plan'
  | 'template'
  | 'framework'
  | 'tracker'
  | 'quick_reference'
  | 'planner'

export interface EnhancementAsset {
  id:          string
  type:        AssetType
  title:       string
  description: string
  content:     string
  status:      'pending' | 'generating' | 'complete'
}

export interface EnhancementBundle {
  assets:     EnhancementAsset[]
  isComplete: boolean
}

// ── TIER ASSET COUNT ──────────────────────────────────────────
const TIER_ASSET_COUNT: Record<string, number> = {
  copper:          3,
  silver:          5,
  gold:            6,
  platinum:        8,
  rocket_gold:     6,
  rocket_platinum: 8,
  default:         3,
}

export function getAssetCount(tierId: string): number {
  const n = normaliseTier(tierId)
  return TIER_ASSET_COUNT[n] ?? TIER_ASSET_COUNT.default
}

export const ASSET_LABELS: Record<AssetType, { label: string; emoji: string }> = {
  worksheet:      { label: 'Worksheet',          emoji: '📝' },
  checklist:      { label: 'Checklist',          emoji: '✅' },
  action_plan:    { label: '30-Day Action Plan',  emoji: '🗓️' },
  template:       { label: 'Template',            emoji: '📋' },
  framework:      { label: 'Framework',           emoji: '🧩' },
  tracker:        { label: 'Progress Tracker',    emoji: '📊' },
  quick_reference:{ label: 'Quick Reference',     emoji: '⚡' },
  planner:        { label: 'Planner',             emoji: '📅' },
}

// ── STEP 1: GPT-5.x BUILDS ENHANCEMENT DIRECTIVE ─────────────

export async function buildEnhancementDirective(params: {
  draft:   ContentDraft
  intent:  IntentDefinition
  tierId:  string
}): Promise<{
  assets: { type: AssetType; title: string; purpose: string }[]
  tokensUsed: number
  error: string | null
}> {
  const assetCount = getAssetCount(params.tierId)

  const prompt = `You are the Z2B Value Enhancement Director.

Plan ${assetCount} premium implementation assets for this digital product:

Product: "${params.intent.productTitle}"
For: "${params.intent.targetAudience}"
Promise: "${params.intent.promiseStatement}"
Format: ${params.intent.productFormat}
Audience level: ${params.intent.audienceLevel}
Sections: ${params.draft.sections.map(s => s.sectionTitle).join(', ')}

Select ${assetCount} assets that DIRECTLY help the reader implement the product content.
Available types: worksheet, checklist, action_plan, template, framework, tracker, quick_reference, planner

Rules:
- Every asset must serve the transformation promise specifically
- No generic assets — each must be tied to the product content
- Mix types for variety (not all checklists)
- Prioritise implementation over information

Return ONLY valid JSON:
{
  "assets": [
    {
      "type": "checklist",
      "title": "Specific asset title",
      "purpose": "One line — exactly what this helps the reader do"
    }
  ]
}`

  const result = await orchestrate('enhancement_directive', prompt)
  if (result.error) {
    return { assets: [], tokensUsed: result.tokensUsed, error: result.error }
  }

  const { data } = parseAIJson<{ assets: { type: AssetType; title: string; purpose: string }[] }>(result.content)
  if (!data?.assets?.length) {
    // Fallback plan if parse fails
    const fallback = [
      { type: 'checklist'   as AssetType, title: 'Implementation Checklist', purpose: 'Step-by-step action list from the product' },
      { type: 'action_plan' as AssetType, title: '30-Day Action Plan',       purpose: 'Structured plan to achieve the transformation' },
      { type: 'worksheet'   as AssetType, title: 'Progress Worksheet',       purpose: 'Track progress and reflect on implementation' },
    ].slice(0, assetCount)
    console.warn('[gear5-engine] Directive parse failed — using fallback plan')
    return { assets: fallback, tokensUsed: result.tokensUsed, error: null }
  }

  return { assets: data.assets.slice(0, assetCount), tokensUsed: result.tokensUsed, error: null }
}

// ── STEP 2: CLAUDE SONNET PRODUCES EACH ASSET ─────────────────

export async function generateAsset(params: {
  assetPlan: { type: AssetType; title: string; purpose: string }
  draft:     ContentDraft
  intent:    IntentDefinition
}): Promise<{
  asset:     EnhancementAsset | null
  tokensUsed:number
  error:     string | null
}> {
  const { assetPlan, draft, intent } = params

  const prompt = buildAssetPrompt(assetPlan, draft, intent)
  const result = await orchestrate('enhancement_production', prompt)

  if (result.error) {
    return { asset: null, tokensUsed: result.tokensUsed, error: result.error }
  }

  return {
    asset: {
      id:          crypto.randomUUID(),
      type:        assetPlan.type,
      title:       assetPlan.title,
      description: assetPlan.purpose,
      content:     result.content.trim(),
      status:      'complete',
    },
    tokensUsed: result.tokensUsed,
    error:      null,
  }
}

// ── ASSET PROMPT BUILDER ──────────────────────────────────────

function buildAssetPrompt(
  plan:   { type: AssetType; title: string; purpose: string },
  draft:  ContentDraft,
  intent: IntentDefinition
): string {
  const formats: Record<AssetType, string> = {
    worksheet:      'A fillable worksheet with clearly labelled sections, questions and space for reflection.',
    checklist:      'A numbered checklist of specific action items the reader must complete.',
    action_plan:    'A 30-day structured plan with daily/weekly actions broken into 4 weeks.',
    template:       'A ready-to-use template with clear headings and placeholder instructions.',
    framework:      'A named framework with 3-5 components, each with a clear description and how-to.',
    tracker:        'A progress tracking table with rows for dates and columns for key metrics.',
    quick_reference:'A one-page reference card with key terms, steps and rules in scannable format.',
    planner:        'A planning tool with goal-setting, scheduling and review sections.',
  }

  return `You are creating a premium implementation asset for a digital product.

PRODUCT CONTEXT:
Product: "${draft.productTitle}"
For: "${intent.targetAudience}"
Promise: "${intent.promiseStatement}"
Audience level: ${intent.audienceLevel}

ASSET TO CREATE:
Type: ${plan.type} — ${formats[plan.type]}
Title: "${plan.title}"
Purpose: "${plan.purpose}"

FORMAT RULES:
- Immediately usable — no further explanation needed
- Specific to THIS product and audience (not generic)
- Professional quality — worth paying for
- Use clear structure: headers, numbered items, tables where needed
- Include instructions for HOW to use each section
- Keep it practical — every element must serve the transformation

Write the complete asset content now.`
}

// ── GEAR 6 HANDOFF ────────────────────────────────────────────

export function toGear6Handoff(
  bundle: EnhancementBundle,
  draft:  ContentDraft,
  intent: IntentDefinition
): Record<string, unknown> | null {
  if (!bundle.assets.length) return null
  return {
    productTitle:     draft.productTitle,
    wordCountTotal:   draft.wordCountTotal,
    totalSections:    draft.totalSections,
    sections:         draft.sections,
    bonusSection:     draft.bonusSection ?? null,
    enhancementAssets:bundle.assets.map(a => ({
      id:          a.id,
      type:        a.type,
      title:       a.title,
      description: a.description,
      content:     a.content,
    })),
    targetAudience:   intent.targetAudience,
    promiseStatement: intent.promiseStatement,
    productFormat:    intent.productFormat,
    audienceLevel:    intent.audienceLevel,
    contentTone:      intent.contentTone,
    priceRecommended: intent.priceRecommended,
    geographyContext: intent.geographyContext,
    keyProblems:      intent.keyProblems,
  }
}

// ── TIER ENDPOINT ─────────────────────────────────────────────

export function isGear5Endpoint(tierId: string): boolean {
  return normaliseTier(tierId) === 'copper'
}
