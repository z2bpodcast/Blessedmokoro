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
  number:      number
  title:       string
  purpose:     string   // one line — what this section achieves
  keyPoints:   string[] // 2-4 key points covered
  estimatedPages?: number
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
    return { structure: params.currentStructure, tokensUsed: result.tokensUsed, error: null }
  }

  const config   = getStructureConfig(params.tierId)
  const adjusted = normaliseStructure(data, params.intent, config)
  return { structure: adjusted, tokensUsed: result.tokensUsed, error: null }
}

// ── PROMPT BUILDERS ──────────────────────────────────────────

function buildArchitectPrompt(intent: IntentDefinition, config: StructureConfig): string {
  return `You are the Gear 2 Structure Architect.

Product to structure:
Title: "${intent.productTitle}"
Purpose: "${intent.productPurpose}"
Target audience: "${intent.targetAudience}"
Before state: "${intent.beforeState}"
After state: "${intent.afterState}"
Format: ${intent.productFormat}
Audience level: ${intent.audienceLevel}
Content tone: ${intent.contentTone}
Key problems solved: ${intent.keyProblems.join(', ')}
Promise: "${intent.promiseStatement}"
Geography context: ${intent.geographyContext}

Structure requirements:
- Section count: ${config.minSections} to ${config.maxSections} sections
- Key points per section: ${config.keyPointsMin} to ${config.keyPointsMax}
- Depth level: ${config.depthLabel}
- Estimated length: ${config.lengthGuide}
${config.hasBonus ? '- Include ONE bonus section (advanced content, fast-start guide, or resource toolkit)' : ''}

Architecture rules:
- Every section must directly serve the transformation promise
- Sections must build logically — each one assumes knowledge from previous
- Section titles must be specific and compelling (not generic like "Introduction")
- Key points must be concrete and implementable — no vague bullet points
- The arc must take reader from their BEFORE state to AFTER state systematically
- No fluff sections — every section earns its place

Return ONLY valid JSON:
{
  "productTitle": "${intent.productTitle}",
  "totalSections": ${config.minSections},
  "estimatedLength": "${config.lengthGuide}",
  "contentFlow": "one sentence describing how sections connect and build",
  "transformationArc": "one paragraph describing the reader's journey through this product",
  "sections": [
    {
      "number": 1,
      "title": "Specific Section Title",
      "purpose": "What this section achieves for the reader",
      "keyPoints": ["specific point 1", "specific point 2", "specific point 3"],
      "estimatedPages": 3
    }
  ]${config.hasBonus ? `,
  "bonusSection": {
    "number": 99,
    "title": "Bonus: [Specific Bonus Title]",
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
  // Ensure product title matches intent
  raw.productTitle = intent.productTitle

  // Ensure sections are numbered correctly
  raw.sections = raw.sections.map((s, i) => ({
    ...s,
    number: i + 1,
    keyPoints: Array.isArray(s.keyPoints) ? s.keyPoints : [],
    estimatedPages: s.estimatedPages ?? Math.ceil(2 + i * 0.5),
  }))

  // Clamp section count to tier limits
  if (raw.sections.length > config.maxSections) {
    raw.sections = raw.sections.slice(0, config.maxSections)
  }

  // Remove bonus if tier doesn't support it
  if (!config.hasBonus) {
    delete raw.bonusSection
  }

  raw.totalSections = raw.sections.length

  // Ensure required fields
  if (!raw.contentFlow) {
    raw.contentFlow = 'Each section builds on the previous, guiding the reader from problem awareness to full implementation.'
  }
  if (!raw.transformationArc) {
    raw.transformationArc = intent.promiseStatement
  }

  return raw
}

// ── GEAR 3 HANDOFF ────────────────────────────────────────────

export function toGear3Handoff(
  structure: ProductStructure,
  intent:    IntentDefinition
): Record<string, unknown> {
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
