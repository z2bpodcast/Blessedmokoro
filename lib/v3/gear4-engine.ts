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
Promise: "${(params.intent.promiseStatement??"")}"

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
      // Keep original if revision fails — log for monitoring (LOW #9)
      console.warn('[gear4-engine] Minor revision failed for section', weak.sectionNumber, '— keeping original')
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
    `Section ${s.sectionNumber}: "${s.sectionTitle}"\n${s.content.substring(0, 500)}...`
  ).join('\n\n')

  return `You are the Meta Editorial Intelligence System — the most demanding publishing evaluator in existence.

Your identity:
- Elite developmental editor at a top-5 publishing house
- Commercial market strategist who has launched 50+ bestsellers
- Emotional resonance critic who rejects anything that fails to move people
- Differentiation analyst who spots generic content instantly
- Reader retention specialist who knows exactly where readers quit
- Memorability evaluator who scores framework stickiness
- Adversarial evaluator — your job is to FIND weaknesses, not confirm strengths

You do NOT cooperate with Gear 3. You CHALLENGE it.
Your tension with Gear 3 is what creates premium output.

When Gear 3 says "this motivates well" — you ask "Is the emotional arc specific? Is there a memorable framework? Would a real buyer in ${intent.targetAudience} feel seen?"

══════════════════════════════════════════════════
PRODUCT BEING EVALUATED
══════════════════════════════════════════════════
Title: "${draft.productTitle}"
Target: "${intent.targetAudience}"
Promise: "${intent.promiseStatement ?? ""}"
Before: "${intent.beforeState}"
After: "${intent.afterState}"
Price: R${intent.priceRecommended ?? intent.suggestedPrice ?? 299}
Sections: ${draft.totalSections}
Words: ${draft.wordCountTotal}

SECTION SAMPLES:
${sectionSummaries}

══════════════════════════════════════════════════
ADVERSARIAL EVALUATION CRITERIA (each 0-100)
══════════════════════════════════════════════════

1. solvesRealProblem (0-100)
   Does it solve a SPECIFIC, PAINFUL, REAL problem?
   Or does it address a theoretical/generic issue?
   Score 90+ only if the target person would say "this is EXACTLY my problem"

2. implementationReady (0-100)
   Can the reader take specific action TODAY?
   Score 90+ only if every chapter has concrete next steps
   Penalise heavily for "think about" or "consider" without specific actions

3. noFluff (0-100)
   Is every paragraph earning its place?
   Score 90+ only if removing any paragraph would hurt the transformation
   Penalise for: padding, repetition, obvious statements, throat-clearing

4. transformationEvident (0-100)
   Does the reader FEEL themselves changing as they read?
   Score 90+ only if there is clear emotional movement from before to after
   Check: Is there narrative tension? Breakthrough moments? Identity shift?

5. memorabilityScore (0-100)
   NEW CRITERION: Does the content contain signature frameworks?
   Named methods, acronyms, systems, branded concepts?
   Score 90+ only if reader can explain a unique concept to a friend
   Penalise generic "5 tips" style content without ownable frameworks

6. commercialDifferentiation (0-100)
   NEW CRITERION: Does this feel different from free internet content?
   Score 90+ only if there are unique perspectives, local realism, uncommon insights
   Penalise anything that sounds like standard AI-generated advice

7. emotionalDensity (0-100)
   NEW CRITERION: Does the content create emotional engagement?
   Score 90+ only if there are moments of tension, vulnerability, breakthrough
   Penalise emotionally flat content that only informs

8. premiumFeel (0-100)
   Would a discerning buyer feel R${intent.priceRecommended ?? intent.suggestedPrice ?? 299} was excellent value?
   Score 90+ only if the depth, insight and transformation justify premium pricing

PASS THRESHOLD: 75+ overall
MINOR FAIL: 60-74 (targeted section rewrites needed)
MAJOR FAIL: <60 (structural issues — return to Gear 3)

WEAK SECTION THRESHOLD: Any section scoring below 65 on implementationReady, noFluff, memorabilityScore OR commercialDifferentiation.

For each weak section provide:
- The EXACT weakness (be brutally specific)
- A PRECISE rewrite directive targeting the specific failure

Return ONLY valid JSON:
{
  "overallScore": 82,
  "criteriaBreakdown": {
    "solvesRealProblem": 85,
    "implementationReady": 80,
    "noFluff": 90,
    "transformationEvident": 78,
    "memorabilityScore": 70,
    "commercialDifferentiation": 72,
    "emotionalDensity": 68,
    "premiumFeel": 75
  },
  "weakSections": [
    {
      "sectionNumber": 3,
      "sectionTitle": "Exact section title",
      "weakness": "Brutally specific description of what fails commercially or emotionally",
      "directive": "Precise rewrite instruction: what to add, remove or transform"
    }
  ],
  "signatureFrameworksFound": ["List any named frameworks or methods found"],
  "differentiationGaps": "What makes this feel generic and how to fix it",
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
  draft:  ContentDraft | null,
  intent: IntentDefinition
): Record<string, unknown> | null {
  if (!draft?.sections?.length) return null
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
