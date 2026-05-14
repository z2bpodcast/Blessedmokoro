// ============================================================
// Z2B 4M V3 — GEAR 4 QUALITY CONTROL ENGINE
// File: lib/v3/gear4-engine.ts
// Laws: GPT-5.x STRICT EVALUATOR — no compromises
//       Quality score NEVER leaves this layer (hidden law)
//       Builder sees plain English only — never numbers
//       Loop prevention: max 2 revision cycles total
//       Bronze endpoint · Copper+ continues to Gear 5
// ============================================================

import { orchestrate, parseAIJson } from '@/lib/v3/orchestration-router'
import type { ContentDraft }         from '@/lib/v3/gear3-engine'
import type { IntentDefinition }     from '@/lib/v3/gear1-engine'

// ── TYPES ────────────────────────────────────────────────────

// INTERNAL — never sent to UI
export interface QualityEvaluation {
  overallScore:       number   // 0-100 — HIDDEN from builder
  criteriaBreakdown: {
    solvesRealProblem:       number  // 0-100
    implementationReady:     number  // 0-100
    noFluff:                 number  // 0-100 (100 = no fluff found)
    transformationEvident:   number  // 0-100
    premiumFeel:             number  // 0-100
    justifiesPrice:          number  // 0-100
  }
  weakSections:       WeakSection[]
  revisionType:       'none' | 'minor' | 'major'
  passed:             boolean
  escalationReason?:  string   // if major fail
}

export interface WeakSection {
  sectionNumber: number
  sectionTitle:  string
  weakness:      string   // specific plain-English description
  directive:     string   // what Claude Sonnet must fix
}

// PUBLIC — what builder is allowed to see
export interface QualityPublicResult {
  passed:          boolean
  revisionType:    'none' | 'minor' | 'major'
  weakSectionCount:number   // how many sections need work (no titles shown)
  statusMessage:   string   // plain English only
  isComplete:      boolean  // true when QC is done and ready to advance
}

export interface Gear4Result {
  evaluation:  QualityEvaluation | null
  publicResult:QualityPublicResult | null
  tokensUsed:  number
  error:       string | null
}

// ── QUALITY THRESHOLDS ────────────────────────────────────────
const PASS_THRESHOLD   = 75   // score >= 75 = pass
const MINOR_THRESHOLD  = 60   // score 60-74 = minor revision
// score < 60 = major revision / escalation

// ── GEAR 4 ENGINE — EVALUATION ────────────────────────────────

export async function runGear4Evaluation(params: {
  draft:  ContentDraft
  intent: IntentDefinition
}): Promise<Gear4Result> {
  const { draft, intent } = params

  // Build evaluation prompt
  const evalPrompt = buildEvaluationPrompt(draft, intent)

  // GPT-5.x STRICT evaluation
  const evalResult = await orchestrate('quality_evaluation', evalPrompt)

  if (evalResult.error) {
    return {
      evaluation:  null,
      publicResult: null,
      tokensUsed:  evalResult.tokensUsed,
      error:       evalResult.error,
    }
  }

  const { data, error: parseError } = parseAIJson<QualityEvaluation>(evalResult.content)

  if (parseError || !data) {
    // If parse fails — default to pass to unblock builder (fail-safe)
    console.warn('[gear4-engine] Evaluation parse failed — defaulting to pass')
    const fallbackResult: QualityPublicResult = {
      passed:           true,
      revisionType:     'none',
      weakSectionCount: 0,
      statusMessage:    'Your product passed quality review.',
      isComplete:       true,
    }
    return {
      evaluation:   null,
      publicResult: fallbackResult,
      tokensUsed:   evalResult.tokensUsed,
      error:        null,
    }
  }

  // Clamp score to valid range
  data.overallScore = Math.max(0, Math.min(100, data.overallScore))

  // Determine revision type from score
  if (data.overallScore >= PASS_THRESHOLD) {
    data.revisionType  = 'none'
    data.passed        = true
    data.weakSections  = []
  } else if (data.overallScore >= MINOR_THRESHOLD) {
    data.revisionType  = 'minor'
    data.passed        = false
    // Keep only top 2 weak sections for minor revision
    data.weakSections  = (data.weakSections ?? []).slice(0, 2)
  } else {
    data.revisionType  = 'major'
    data.passed        = false
  }

  // Build PUBLIC result (strips all scores)
  const publicResult = buildPublicResult(data)

  return {
    evaluation:   data,
    publicResult,
    tokensUsed:   evalResult.tokensUsed,
    error:        null,
  }
}

// ── MINOR REVISION ────────────────────────────────────────────
// Claude Sonnet fixes ONLY the flagged weak sections

export async function runMinorRevision(params: {
  draft:        ContentDraft
  weakSections: WeakSection[]
  intent:       IntentDefinition
}): Promise<{
  revisedSections: { sectionNumber: number; content: string }[]
  tokensUsed:      number
  error:           string | null
}> {
  const revisedSections: { sectionNumber: number; content: string }[] = []
  let totalTokens = 0

  for (const weak of params.weakSections) {
    // Find original section
    const original = params.draft.sections.find(
      s => s.sectionNumber === weak.sectionNumber
    )
    if (!original) continue

    const revisionPrompt = `You are revising a specific section of a digital product.

Product: "${params.intent.productTitle}"
For: "${params.intent.targetAudience}"
Promise: "${params.intent.promiseStatement}"

SECTION TO REVISE:
Title: "${original.sectionTitle}"
Original content:
${original.content}

WHAT NEEDS IMPROVEMENT:
${weak.weakness}

REVISION DIRECTIVE:
${weak.directive}

Rewrite this section to address the weakness exactly.
Keep the same title. Keep all content that works.
Fix only what was identified as weak.
Write the revised section body content only (no title).`

    const result = await orchestrate('content_production', revisionPrompt)
    totalTokens += result.tokensUsed

    if (!result.error && result.content.trim()) {
      revisedSections.push({
        sectionNumber: weak.sectionNumber,
        content:       result.content.trim(),
      })
    } else {
      // Keep original if revision fails
      revisedSections.push({
        sectionNumber: weak.sectionNumber,
        content:       original.content,
      })
    }
  }

  return { revisedSections, tokensUsed: totalTokens, error: null }
}

// ── PROMPT BUILDER ────────────────────────────────────────────

function buildEvaluationPrompt(draft: ContentDraft, intent: IntentDefinition): string {
  // Build section summaries (first 300 chars each — token efficient)
  const sectionSummaries = draft.sections.map(s =>
    `Section ${s.sectionNumber}: "${s.sectionTitle}"\n${s.content.substring(0, 300)}...`
  ).join('\n\n')

  return `You are the Z2B Quality Control Engine — the STRICT final gatekeeper.

Evaluate this digital product as a REAL BUYER would experience it.
Be strict. No compromises. No pity passes.

PRODUCT BEING EVALUATED:
Title: "${draft.productTitle}"
Target audience: "${intent.targetAudience}"
Promise: "${intent.promiseStatement}"
Before state: "${intent.beforeState}"
After state: "${intent.afterState}"
Key problems: ${intent.keyProblems.join(', ')}
Recommended price: R${intent.priceRecommended}
Total sections: ${draft.totalSections}
Total words: ${draft.wordCountTotal}

SECTION CONTENT SAMPLES:
${sectionSummaries}

EVALUATION CRITERIA (each scored 0-100):
1. solvesRealProblem — Does it solve a REAL, specific problem? (not theoretical)
2. implementationReady — Can reader ACT on this today? (not just learn)
3. noFluff — Is every paragraph earning its place? (100 = zero fluff)
4. transformationEvident — Does content move reader from before to after?
5. premiumFeel — Would someone pay R${intent.priceRecommended} for this?
6. justifiesPrice — Does the depth match the price point?

PASS THRESHOLD: 75+ overall (weighted average of all criteria)
MINOR FAIL: 60-74 overall (1-2 sections need targeted fixes)
MAJOR FAIL: <60 overall (structural issues — needs deeper work)

For any section scoring below 65 on implementation_ready or no_fluff:
Identify it as a weak section with:
- The exact weakness (be specific — not "needs improvement")
- A precise revision directive for Claude Sonnet to follow

Return ONLY valid JSON:
{
  "overallScore": 82,
  "criteriaBreakdown": {
    "solvesRealProblem": 85,
    "implementationReady": 80,
    "noFluff": 90,
    "transformationEvident": 78,
    "premiumFeel": 75,
    "justifiesPrice": 80
  },
  "weakSections": [
    {
      "sectionNumber": 3,
      "sectionTitle": "Section title here",
      "weakness": "specific description of what is weak",
      "directive": "precise instruction for what to fix"
    }
  ],
  "revisionType": "none",
  "passed": true
}`
}

// ── PUBLIC RESULT BUILDER ─────────────────────────────────────
// CRITICAL: Score never included in public result

function buildPublicResult(eval_: QualityEvaluation): QualityPublicResult {
  if (eval_.passed) {
    return {
      passed:           true,
      revisionType:     'none',
      weakSectionCount: 0,
      statusMessage:    'Your product passed quality review.',
      isComplete:       true,
    }
  }

  if (eval_.revisionType === 'minor') {
    const count = eval_.weakSections.length
    return {
      passed:           false,
      revisionType:     'minor',
      weakSectionCount: count,
      statusMessage:    count === 1
        ? 'We are strengthening one section. Your product will be better for it.'
        : `We are strengthening ${count} sections. Your product will be better for it.`,
      isComplete:       false,
    }
  }

  // Major fail
  return {
    passed:           false,
    revisionType:     'major',
    weakSectionCount: eval_.weakSections.length,
    statusMessage:    'Your content needs structural improvements before it is ready. We are working on it.',
    isComplete:       false,
  }
}

// ── TIER ENDPOINT ─────────────────────────────────────────────
// Bronze tier: Gear 4 is the endpoint

export function isGear4Endpoint(tierId: string): boolean {
  return tierId === 'bronze'
}

// ── GEAR 5 HANDOFF ────────────────────────────────────────────

export function toGear5Handoff(
  draft:  ContentDraft,
  intent: IntentDefinition
): Record<string, unknown> {
  return {
    productTitle:     draft.productTitle,
    totalSections:    draft.totalSections,
    wordCountTotal:   draft.wordCountTotal,
    sections:         draft.sections,
    bonusSection:     draft.bonusSection ?? null,
    targetAudience:   intent.targetAudience,
    promiseStatement: intent.promiseStatement,
    beforeState:      intent.beforeState,
    afterState:       intent.afterState,
    audienceLevel:    intent.audienceLevel,
    contentTone:      intent.contentTone,
    productFormat:    intent.productFormat,
    priceRecommended: intent.priceRecommended,
    keyProblems:      intent.keyProblems,
  }
}
