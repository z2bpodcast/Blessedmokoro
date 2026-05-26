// ============================================================
// Z2B 4M V3 — GEAR 2 STRUCTURE ENGINE
// File: lib/v3/gear2-engine.ts
// Laws: GPT-5.x architects · Claude Sonnet refines
//       Tier-scaled depth · Modular · Feeds Gear 3
// Purpose: Transform Gear 1 intent into a complete product
//          structure blueprint. Section count and depth
//          scale with tier. Claude Sonnet refines for
//          educational flow. Builder approves or adjusts.
// ============================================================

import {
  orchestrate,
  parseAIJson,
} from '@/lib/v3/orchestration-router'
import { getTier, normaliseTier } from '@/lib/v3/tier-config'
import type { IntentDefinition }  from '@/lib/v3/gear1-engine'

// ── TYPES ────────────────────────────────────────────────────

export interface ProductSection {
  number:           number
  title:            string
  purpose:          string
  keyPoints:        string[]
  estimatedPages?:  number
  readerResistance?:string
  quickWin?:        string
}

export interface ProductStructure {
  productTitle:    string
  totalSections:   number
  estimatedLength: string  // e.g. "18-24 pages" or "6 modules"
  sections:        ProductSection[]
  bonusSection?:   ProductSection  // Silver+ only
  contentFlow:     string  // how sections build on each other
  transformationArc: string  // the learning journey described
}

export interface Gear2Result {
  structure:  ProductStructure | null
  tokensUsed: number
  error:      string | null
}

// ── TIER STRUCTURE SCALING ────────────────────────────────────
// Architecture law: higher tiers get deeper, richer structures

interface StructureConfig {
  minSections:   number
  maxSections:   number
  keyPointsMin:  number
  keyPointsMax:  number
  hasBonus:      boolean
  depthLabel:    string
  lengthGuide:   string
}

const TIER_STRUCTURE_CONFIG: Record<string, StructureConfig> = {
  starter: {
    minSections: 5,  maxSections: 7,
    keyPointsMin: 2, keyPointsMax: 3,
    hasBonus: false,
    depthLabel: 'focused and practical',
    lengthGuide: '12-18 pages or 5-7 short modules',
  },
  bronze: {
    minSections: 6,  maxSections: 9,
    keyPointsMin: 2, keyPointsMax: 4,
    hasBonus: false,
    depthLabel: 'standard depth with clear implementation',
    lengthGuide: '16-24 pages or 6-9 modules',
  },
  copper: {
    minSections: 8,  maxSections: 12,
    keyPointsMin: 3, keyPointsMax: 4,
    hasBonus: false,
    depthLabel: 'comprehensive with frameworks',
    lengthGuide: '20-32 pages or 8-12 modules',
  },
  silver: {
    minSections: 10, maxSections: 14,
    keyPointsMin: 3, keyPointsMax: 5,
    hasBonus: true,
    depthLabel: 'premium depth with bonus module',
    lengthGuide: '28-40 pages or 10-14 modules plus bonus',
  },
  rocket_gold: {
    minSections: 12, maxSections: 16,
    keyPointsMin: 3, keyPointsMax: 5,
    hasBonus: true,
    depthLabel: 'premium automated structure',
    lengthGuide: '35-50 pages or 12-16 modules plus bonus',
  },
  rocket_platinum: {
    minSections: 14, maxSections: 18,
    keyPointsMin: 4, keyPointsMax: 6,
    hasBonus: true,
    depthLabel: 'flagship automated structure',
    lengthGuide: '45-65 pages or 14-18 modules plus bonus',
  },
  // Explicit gold and platinum entries (prevent starter fallback — HIGH #1)
  gold: {
    minSections: 12, maxSections: 16,
    keyPointsMin: 3, keyPointsMax: 5,
    hasBonus: true,
    depthLabel: 'elite depth with advanced content',
    lengthGuide: '35-50 pages or 12-16 modules plus bonus',
  },
  platinum: {
    minSections: 14, maxSections: 18,
    keyPointsMin: 4, keyPointsMax: 6,
    hasBonus: true,
    depthLabel: 'flagship depth — comprehensive ecosystem',
    lengthGuide: '45-65 pages or 14-18 modules plus bonus',
  },
}

function getStructureConfig(tierId: string): StructureConfig {
  const normalised = normaliseTier(tierId)
  return TIER_STRUCTURE_CONFIG[normalised] ?? TIER_STRUCTURE_CONFIG.starter
}

// ── GEAR 2 ENGINE ─────────────────────────────────────────────

export async function runGear2(params: {
  intent:   IntentDefinition
  tierId:   string
}): Promise<Gear2Result> {
  const config = getStructureConfig(params.tierId)

  // Step 1: GPT-5.x generates the architecture
  const architectPrompt = buildArchitectPrompt(params.intent, config)
  const archResult      = await orchestrate('structure_generation', architectPrompt)

  if (archResult.error) {
    return { structure: null, tokensUsed: archResult.tokensUsed, error: archResult.error }
  }

  const { data: rawStructure, error: parseError } =
    parseAIJson<ProductStructure>(archResult.content)

  if (parseError || !rawStructure?.sections?.length) {
    return {
      structure:  null,
      tokensUsed: archResult.tokensUsed,
      error:      'Could not generate structure. Please try again.',
    }
  }

  // Step 2: Claude Sonnet refines for educational flow
  const refinePrompt = buildRefinePrompt(rawStructure, params.intent)
  const refineResult = await orchestrate('structure_refinement', refinePrompt)

  let finalStructure = rawStructure

  if (!refineResult.error) {
    const { data: refined } = parseAIJson<ProductStructure>(refineResult.content)
    if (refined?.sections?.length) {
      finalStructure = refined
    }
    // If refinement fails, keep the GPT-5.x version — don't error
    if (refineResult.error) {
      console.warn('[gear2-engine] Claude refinement failed:', refineResult.error, '— using GPT-5.x version')
    }
  }

  const totalTokens = archResult.tokensUsed + refineResult.tokensUsed

  // Validate and normalise
  finalStructure = normaliseStructure(finalStructure, params.intent, config)

  return { structure: finalStructure, tokensUsed: totalTokens, error: null }
}

// ── STRUCTURE ADJUSTMENT ──────────────────────────────────────

export async function adjustGear2(params: {
  currentStructure: ProductStructure
  adjustment:       string
  intent:           IntentDefinition
  tierId:           string
}): Promise<Gear2Result> {
  const prompt = `You designed this product structure:
${JSON.stringify(params.currentStructure, null, 2)}

The product is: "${params.intent.productTitle}"
For: "${params.intent.targetAudience}"

The builder wants to adjust it:
"${params.adjustment}"

Apply ONLY the requested changes. Keep all other sections exactly the same.
Maintain section numbering. Keep the transformation arc intact.
Return the complete updated structure as valid JSON matching the original format exactly.`

  const result = await orchestrate('structure_generation', prompt)

  if (result.error) {
    return { structure: params.currentStructure, tokensUsed: result.tokensUsed, error: null }
  }

  const { data } = parseAIJson<ProductStructure>(result.content)

  if (!data?.sections?.length) {
    console.warn('[gear2-engine] Adjustment parse failed — keeping current structure')
    return { structure: params.currentStructure, tokensUsed: result.tokensUsed, error: null }
  }

  const config   = getStructureConfig(params.tierId)
  const adjusted = normaliseStructure(data, params.intent, config)
  return { structure: adjusted, tokensUsed: result.tokensUsed, error: null }
}

// ── PROMPT BUILDERS ──────────────────────────────────────────

function buildArchitectPrompt(intent: IntentDefinition, config: StructureConfig): string {
  return `You are the world's most elite digital product architect — McKinsey precision, bestselling author clarity, transformation coach depth.

Your job is NOT to create a table of contents.
Your job is to architect a TRANSFORMATION JOURNEY from BEFORE to AFTER — systematically and powerfully.

PRODUCT INTELLIGENCE:
Title: "${intent.productTitle}"
Target Person: "${intent.targetAudience}"
Real Problem: "${intent.productPurpose ?? intent.problemSolved ?? ''}"
Promise: "${intent.promiseStatement ?? intent.corePromise ?? ''}"
Before State: "${intent.beforeState ?? ''}"
After State: "${intent.afterState ?? ''}"
Format: ${intent.productFormat ?? intent.format ?? 'ebook'}
Level: ${intent.audienceLevel ?? intent.difficulty ?? 'beginner'}
Geography: ${intent.geographyContext ?? 'South Africa'}

PHASE 1 — STRATEGIC POSITIONING (think before writing):
1. UNIQUE MECHANISM: What ONE approach makes this different from everything else?
2. TRANSFORMATION MILESTONES: What 3-5 critical milestones must the reader hit?
3. RESISTANCE MAPPING: What will cause the reader to quit at each stage?
4. QUICK WIN: Where is the reader's first small win? (Must be Section 2 or 3)
5. MOMENTUM ARC: Awareness > Understanding > Belief > Action > Result > Identity Shift

PHASE 2 — STRUCTURAL REQUIREMENTS:
- Sections: ${config.minSections} to ${config.maxSections}
- Key points per section: ${config.keyPointsMin} to ${config.keyPointsMax}
- Depth: ${config.depthLabel}
- Length: ${config.lengthGuide}
${config.hasBonus ? '- Include ONE high-value bonus section' : ''}

10 LAWS OF ELITE PRODUCT STRUCTURE:

LAW 1: NO GENERIC TITLES — Every title must be specific and compelling
BAD: "Understanding Your Finances"
GOOD: "The 3 Money Lies Keeping You Broke"

LAW 2: EARN EVERY SECTION — Pass the "so what?" test or cut it

LAW 3: BUILD ON ITSELF — Each section assumes the previous was read

LAW 4: QUICK WIN EARLY — Reader wins by Section 2 or 3

LAW 5: RESISTANCE FIRST — Name the doubt at each stage

LAW 6: SPECIFIC KEY POINTS — No vague bullets
BAD: "Learn time management"
GOOD: "The 90-minute morning block that replaces 4 hours of scattered work"

LAW 7: MOMENTUM ARC — Tension builds, breakthrough comes, identity shifts

LAW 8: CONTEXTUAL RELEVANCE — Examples relevant to ${intent.geographyContext ?? 'the reader market'}

LAW 9: FORMAT INTELLIGENCE — Structure matches how this format is consumed

LAW 10: IDENTITY CLOSE — Final section cements WHO THE READER NOW IS

Return ONLY valid JSON:
{
  "productTitle": "${intent.productTitle}",
  "totalSections": ${config.minSections},
  "estimatedLength": "${config.lengthGuide}",
  "contentFlow": "One sentence describing how sections connect and build",
  "transformationArc": "One paragraph describing the complete reader journey",
  "uniqueMechanism": "The ONE thing that makes this approach different",
  "sections": [
    {
      "number": 1,
      "title": "Specific Compelling Section Title",
      "purpose": "What this section achieves for the reader",
      "readerResistance": "What doubt or fear the reader has at this stage",
      "quickWin": "The specific win the reader gets from this section",
      "keyPoints": ["specific point 1", "specific point 2", "specific point 3"],
      "estimatedPages": 3
    }
  ]${config.hasBonus ? `,
  "bonusSection": {
    "number": 99,
    "title": "Bonus: [Specific High-Value Title]",
    "purpose": "What this bonus delivers",
    "keyPoints": ["bonus point 1", "bonus point 2"],
    "estimatedPages": 4
  }` : ''}
}`
}

function buildRefinePrompt(structure: ProductStructure, intent: IntentDefinition): string {
  return `You are refining a digital product structure for educational clarity and flow.

Product: "${structure.productTitle}"
For: "${intent.targetAudience}"
Transformation: "${intent.beforeState}" → "${intent.afterState}"

Current structure:
${JSON.stringify(structure.sections.map(s => ({ number: s.number, title: s.title, purpose: s.purpose })), null, 2)}

Refinement task:
1. Ensure each section title is specific and compelling — not generic
2. Verify logical progression — does each section build on the previous?
3. Check the transformation arc — does the structure take reader from before to after?
4. Ensure no section is redundant or could be merged
5. Strengthen any weak section purposes with clearer implementation language

Keep the same number of sections. Only improve titles, purposes, and flow.
Keep keyPoints and estimatedPages exactly as they are.
Return the complete refined structure as valid JSON in the same format.`
}

// ── NORMALISE STRUCTURE ───────────────────────────────────────

function normaliseStructure(
  raw:    ProductStructure,
  intent: IntentDefinition,
  config: StructureConfig
): ProductStructure {
  // Return a copy — never mutate the input (MEDIUM #4)
  let sections = raw.sections.map((s, i) => ({
    ...s,
    number:        i + 1,
    keyPoints:     Array.isArray(s.keyPoints) ? s.keyPoints : [],
    estimatedPages:s.estimatedPages
      ? Math.round(s.estimatedPages)              // LOW #6: integer pages
      : Math.max(2, 2 + Math.round(i * 0.5)),    // fallback integer
  }))

  // Clamp section count to tier limits
  if (sections.length > config.maxSections) {
    sections = sections.slice(0, config.maxSections)
  }

  return {
    ...raw,
    productTitle:     intent.productTitle,
    sections,
    totalSections:    sections.length,
    bonusSection:     config.hasBonus ? raw.bonusSection : undefined,
    contentFlow:      raw.contentFlow
      || 'Each section builds on the previous, guiding the reader from problem awareness to full implementation.',
    transformationArc:raw.transformationArc || intent.promiseStatement || "",
  }
}

// ── GEAR 3 HANDOFF ────────────────────────────────────────────

export function toGear3Handoff(
  structure: ProductStructure | null,
  intent:    IntentDefinition
): Record<string, unknown> | null {
  if (!structure) return null
  return {
    productTitle:     structure.productTitle,
    totalSections:    structure.totalSections,
    estimatedLength:  structure.estimatedLength,
    contentFlow:      structure.contentFlow,
    transformationArc:structure.transformationArc,
    sections:         structure.sections,
    bonusSection:     structure.bonusSection ?? null,
    // Intent context for content generation
    targetAudience:   intent.targetAudience,
    audienceLevel:    intent.audienceLevel,
    contentTone:      intent.contentTone,
    geographyContext: intent.geographyContext,
    promiseStatement: intent.promiseStatement,
    beforeState:      intent.beforeState,
    afterState:       intent.afterState,
  }
}
