// ============================================================
// Z2B 4M V3 — GEAR 3 CONTENT ENGINE
// File: lib/v3/gear3-engine.ts
// Laws: Claude Sonnet PRIMARY · GPT-5.x directs + evaluates
//       Claude Haiku handles transitions · Section by section
//       Loop prevention: max 1 regen per section
//       Tier endpoint: Starter delivers at Gear 3
// ============================================================

import { orchestrate, parseAIJson } from '@/lib/v3/orchestration-router'
import type { ProductStructure, ProductSection } from '@/lib/v3/gear2-engine'
import type { IntentDefinition } from '@/lib/v3/gear1-engine'

// ── TYPES ────────────────────────────────────────────────────

export interface SectionContent {
  sectionNumber: number
  sectionTitle:  string
  content:       string
  wordCount:     number
  status:        'pending' | 'writing' | 'complete' | 'regenerating'
}

export interface ContentDraft {
  productTitle:   string
  totalSections:  number
  sections:       SectionContent[]
  bonusSection?:  SectionContent
  isComplete:     boolean
  wordCountTotal: number
}

export interface Gear3GenerateResult {
  section:    SectionContent | null
  tokensUsed: number
  error:      string | null
}

export interface ContentDirective {
  tone:                string
  depth:               string
  audienceLevel:       string
  geographyContext:    string
  transformationFocus: string
  implementationStyle: string
  examplesType:        string
  avoidList:           string[]
}

// ── CONTENT DIRECTIVE BUILDER ─────────────────────────────────
// GPT-5.x builds once — Claude Sonnet follows for all sections

export async function buildContentDirective(params: {
  intent:    IntentDefinition
  structure: ProductStructure
}): Promise<{ directive: ContentDirective | null; tokensUsed: number; error: string | null }> {

  const prompt = `You are preparing a content production directive for the Z2B Content Engine.

Product: "${params.intent.productTitle}"
Target audience: "${params.intent.targetAudience}"
Before state: "${params.intent.beforeState}"
After state: "${params.intent.afterState}"
Audience level: ${(params.intent.audienceLevel??params.intent.difficulty??"beginner")}
Content tone: ${(params.intent.contentTone??"professional")}
Geography context: ${(params.intent.geographyContext??"global")}
Promise: "${(params.intent.promiseStatement??"")}"
Key problems: ${(params.intent.keyProblems??[]).join(', ')}
Sections to write: ${params.structure.totalSections}
Estimated length: ${params.structure.estimatedLength}

Create a precise content directive for Claude Sonnet to follow for every section.

Return ONLY valid JSON:
{
  "tone": "specific tone instruction",
  "depth": "implementation or informational with specifics",
  "audienceLevel": "how to pitch the language",
  "geographyContext": "specific local context to weave in",
  "transformationFocus": "what every section must move the reader toward",
  "implementationStyle": "how to structure practical advice",
  "examplesType": "type of examples to use",
  "avoidList": ["things to never do in this content"]
}`

  const result = await orchestrate('content_directive', prompt)
  if (result.error) {
    return { directive: null, tokensUsed: result.tokensUsed, error: result.error }
  }

  const { data, error: parseError } = parseAIJson<ContentDirective>(result.content)
  if (parseError || !data) {
    // Fallback directive — ensures Gear 3 is never fully blocked (MEDIUM #5)
    const fallback: ContentDirective = {
      tone:                'warm, direct and practical — like a trusted mentor',
      depth:               'implementation-focused — every point must be actionable today',
      audienceLevel:       'clear and accessible — define terms, use simple language',
      geographyContext:    'South Africa — use ZAR pricing and local examples',
      transformationFocus: 'move reader from their current struggle to the promised result',
      implementationStyle: 'step-by-step with numbered instructions and concrete examples',
      examplesType:        'real-world scenarios the target audience would recognise',
      avoidList:           ['generic advice', 'filler phrases', 'vague generalisations', 'passive voice'],
    }
    console.warn('[gear3-engine] Directive parse failed — using fallback directive')
    return { directive: fallback, tokensUsed: result.tokensUsed, error: null }
  }

  return { directive: data, tokensUsed: result.tokensUsed, error: null }
}

// ── SECTION CONTENT GENERATOR ─────────────────────────────────
// Claude Sonnet writes ONE section at a time

export async function generateSectionContent(params: {
  section:           ProductSection
  directive:         ContentDirective
  intent:            IntentDefinition
  structure:         ProductStructure
  isBonus?:          boolean
  prevSectionTitle?: string
}): Promise<Gear3GenerateResult> {
  const { section, directive, intent, structure } = params

  const writingPrompt = buildSectionPrompt({
    section,
    directive,
    intent,
    totalSections:    structure.totalSections,
    prevSectionTitle: params.prevSectionTitle,
    isBonus:          params.isBonus ?? false,
  })

  // Claude Sonnet is PRIMARY for content production
  const contentResult = await orchestrate('content_production', writingPrompt)
  if (contentResult.error) {
    return { section: null, tokensUsed: contentResult.tokensUsed, error: contentResult.error }
  }

  let sectionContent = contentResult.content.trim()

  // Claude Haiku adds transition (non-blocking — proceeds if fails)
  let transitionTokens = 0
  if (section.number > 1 && params.prevSectionTitle) {
    const transitionResult = await orchestrate(
      'content_transition',
      `Write one smooth bridge sentence from "${params.prevSectionTitle}" into "${section.title}". Under 20 words. Natural.`
    )
    transitionTokens = transitionResult.tokensUsed
    if (!transitionResult.error && transitionResult.content.trim()) {
      sectionContent = transitionResult.content.trim() + '\n\n' + sectionContent
    }
  }

  return {
    section: {
      sectionNumber: section.number,
      sectionTitle:  section.title,
      content:       sectionContent,
      wordCount:     countWords(sectionContent),
      status:        'complete',
    },
    tokensUsed: contentResult.tokensUsed + transitionTokens,  // LOW #11: include Haiku tokens
    error:      null,
  }
}

// ── SECTION REGENERATION ──────────────────────────────────────
// Max 1 regen per section — loop prevention law enforced in API

export async function regenerateSectionContent(params: {
  section:         ProductSection
  directive:       ContentDirective
  intent:          IntentDefinition
  structure:       ProductStructure
  builderFeedback: string
}): Promise<Gear3GenerateResult> {
  // LOW #13: Ensure feedback is meaningful
  const feedback = params.builderFeedback.trim()
  if (feedback.length < 5) {
    return { section: null, tokensUsed: 0, error: 'Please describe what to improve in at least a few words.' }
  }

  const regenPrompt = buildSectionPrompt({
    section:      params.section,
    directive:    params.directive,
    intent:       params.intent,
    totalSections:params.structure.totalSections,
    isBonus:      false,
    extraContext:  `Builder feedback: "${feedback}". Address this specifically while maintaining all requirements.`,
  })

  const result = await orchestrate('content_production', regenPrompt)
  if (result.error) {
    return { section: null, tokensUsed: result.tokensUsed, error: result.error }
  }

  return {
    section: {
      sectionNumber: params.section.number,
      sectionTitle:  params.section.title,
      content:       result.content.trim(),
      wordCount:     countWords(result.content),
      status:        'complete',
    },
    tokensUsed: result.tokensUsed,
    error:      null,
  }
}

// ── SECTION PROMPT BUILDER ────────────────────────────────────

function buildSectionPrompt(p: {
  section:          ProductSection
  directive:        ContentDirective
  intent:           IntentDefinition
  totalSections:    number
  isBonus:          boolean
  prevSectionTitle?: string
  extraContext?:    string
}): string {
  const { section, directive, intent } = p
  const targetWords = section.estimatedPages
    ? section.estimatedPages * 250
    : 450

  const positionNote = p.isBonus
    ? 'BONUS section — premium, advanced, high-value content.'
    : section.number === 1
      ? 'OPENING section — hook immediately, establish problem and promise.'
      : section.number === p.totalSections
        ? 'FINAL section — powerful close, inspire action toward the transformation.'
        : `Section ${section.number} of ${p.totalSections} — builds on previous content.`

  return `You are a world-class Creative Narrative & Commercial Intelligence Engine.

Your identity:
- Bestselling nonfiction author
- Transformation strategist & narrative architect
- Behavioral psychologist & emotional storytelling specialist
- Commercial publishing expert & reader retention engineer
- Signature framework creator

You do NOT merely "write content."
You ENGINEER commercially memorable transformation.

══════════════════════════════════════════════════
PRODUCT INTELLIGENCE
══════════════════════════════════════════════════
Title: "${intent.productTitle}"
For: "${intent.targetAudience}"
Promise: "${intent.promiseStatement ?? ""}"
Before State: "${intent.beforeState}"
After State: "${intent.afterState}"
Geography: ${directive.geographyContext}
Tone: ${directive.tone}
Depth: ${directive.depth}
Avoid: ${directive.avoidList.join(', ')}

══════════════════════════════════════════════════
SECTION TO WRITE
══════════════════════════════════════════════════
Title: "${section.title}"
Purpose: "${section.purpose}"
Position: ${positionNote}
${p.prevSectionTitle ? `Previous section: "${p.prevSectionTitle}" — do not repeat content.` : ''}
${section.readerResistance ? `Reader resistance at this stage: "${section.readerResistance}"` : ''}
${section.quickWin ? `Quick win to deliver: "${section.quickWin}"` : ''}

Key points to cover:
${section.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}
Target: ~${targetWords} words
${p.extraContext ? `\nSPECIAL INSTRUCTION: ${p.extraContext}` : ''}

══════════════════════════════════════════════════
6 CREATIVE INTELLIGENCE LAWS — APPLY ALL OF THEM
══════════════════════════════════════════════════

LAW 1 — NARRATIVE ARCHITECTURE:
Before writing, define the emotional arc of THIS section:
- What emotion does the reader START with?
- What tension or conflict do you CREATE in the middle?
- What breakthrough or relief do you deliver at the END?
Every section must be an emotional journey, not just information delivery.

LAW 2 — SIGNATURE FRAMEWORK GENERATION:
Ask yourself: "What memorable system, acronym, framework or named method
can I create to OWN this concept?"
Instead of "here are 3 tips" — create "The RISE Method" or "The 4-Step Clarity Protocol"
Signature frameworks make content sticky, brandable and shareable.
Create AT LEAST ONE signature element per section where relevant.

LAW 3 — COMMERCIAL DIFFERENTIATION:
Ask yourself: "What makes this DIFFERENT from standard internet advice?"
Deliberately inject:
- Unique perspectives the reader has NOT heard before
- Local realism specific to ${directive.geographyContext}
- Uncommon insights that challenge assumptions
- Emotionally specific examples (real names, real situations)
- Cultural grounding that makes the reader feel seen
Without this, AI content averages toward generic. Be distinctive.

LAW 4 — EMOTIONAL DENSITY ENGINEERING:
Current AI writing informs well but emotionally plateaus.
You must intentionally create:
- Moments of uncertainty or setback (before the breakthrough)
- Internal conflict the reader recognizes in themselves
- Vulnerability that builds trust
- A clear emotional payoff at the end
Emotion creates retention. Information alone does not.

LAW 5 — READER RETENTION ENGINEERING:
Actively vary your pacing:
- Short punchy sentences after long ones
- Questions that create curiosity loops
- Subheadings that tease what's coming
- Pattern interrupts that prevent mental fatigue
- Callback references to earlier content
The reader must feel pulled forward, not pushed.

LAW 6 — IDENTITY TRANSFORMATION LAYER:
Every section must answer the question: "Who is the reader BECOMING?"
Not just: "What are they learning?"
Close every section by reinforcing the reader's emerging new identity.
Example: "You are no longer someone who waits for permission. You are someone who builds."

══════════════════════════════════════════════════
PRODUCTION RULES
══════════════════════════════════════════════════
- Full paragraphs — no bullet lists unless the content type demands it
- Every paragraph moves reader toward the after-state
- Open with a hook that creates immediate identification
- Close with a bridge that makes the reader hungry for the next section
- Use concrete, specific examples from ${directive.geographyContext} context
- No filler sentences — every sentence earns its place
- Do NOT include the section title — body content only
- Write as if a premium buyer paid R500+ for this — deliver that value

Write now. Engineer transformation.`
}

// ── CONTENT ASSEMBLY ──────────────────────────────────────────

export function assembleContentDraft(params: {
  structure:         ProductStructure
  completedSections: SectionContent[]
  bonusSection?:     SectionContent
}): ContentDraft {
  const totalWords = params.completedSections.reduce((sum, s) => sum + s.wordCount, 0)
    + (params.bonusSection?.wordCount ?? 0)

  return {
    productTitle:   params.structure.productTitle,
    totalSections:  params.structure.totalSections,
    sections:       params.completedSections,
    bonusSection:   params.bonusSection,
    isComplete:     params.completedSections.length >= params.structure.totalSections,
    wordCountTotal: totalWords,
  }
}

// ── GEAR 4 HANDOFF ────────────────────────────────────────────

export function toGear4Handoff(
  draft:     ContentDraft,
  intent:    IntentDefinition,
  structure: ProductStructure
): Record<string, unknown> | null {
  if (!draft.isComplete || !draft.sections?.length) return null
  return {
    productTitle:     draft.productTitle,
    totalSections:    draft.totalSections,
    wordCountTotal:   draft.wordCountTotal,
    sections:         draft.sections.map(s => ({
      sectionNumber: s.sectionNumber,
      sectionTitle:  s.sectionTitle,
      content:       s.content,
      wordCount:     s.wordCount,
    })),
    bonusSection:     draft.bonusSection ?? null,
    targetAudience:   intent.targetAudience,
    promiseStatement: intent.promiseStatement,
    beforeState:      intent.beforeState,
    afterState:       intent.afterState,
    audienceLevel:    intent.audienceLevel,
    keyProblems:      intent.keyProblems,
    priceRecommended: intent.priceRecommended,
    contentTone:      intent.contentTone,
    productFormat:    intent.productFormat,
    estimatedLength:  structure.estimatedLength,
  }
}

// ── TIER ENDPOINT ─────────────────────────────────────────────

export function isGear3Endpoint(tierId: string): boolean {
  return tierId === 'starter' || tierId === 'fam' || tierId === 'free'
}

// ── HELPERS ───────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function formatWordCount(count: number): string {
  return count >= 1000
    ? (count / 1000).toFixed(1) + 'k words'
    : count + ' words'
}

export function estimateReadingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200))
}
