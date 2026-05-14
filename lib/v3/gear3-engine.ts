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
Audience level: ${params.intent.audienceLevel}
Content tone: ${params.intent.contentTone}
Geography context: ${params.intent.geographyContext}
Promise: "${params.intent.promiseStatement}"
Key problems: ${params.intent.keyProblems.join(', ')}
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
    return { directive: null, tokensUsed: result.tokensUsed, error: 'Could not build content directive.' }
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
  if (section.number > 1 && params.prevSectionTitle) {
    const transitionResult = await orchestrate(
      'content_transition',
      `Write one smooth bridge sentence from "${params.prevSectionTitle}" into "${section.title}". Under 20 words. Natural.`
    )
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
    tokensUsed: contentResult.tokensUsed,
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
  const regenPrompt = buildSectionPrompt({
    section:      params.section,
    directive:    params.directive,
    intent:       params.intent,
    totalSections:params.structure.totalSections,
    isBonus:      false,
    extraContext:  `Builder feedback: "${params.builderFeedback}". Address this specifically while maintaining all requirements.`,
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

  return `You are the Z2B Content Production Engine.

Write complete content for this section of a digital product.

PRODUCT:
Title: "${intent.productTitle}"
For: "${intent.targetAudience}"
Promise: "${intent.promiseStatement}"
Before → After: "${intent.beforeState}" → "${intent.afterState}"

DIRECTIVE:
Tone: ${directive.tone}
Depth: ${directive.depth}
Audience: ${directive.audienceLevel}
Geography: ${directive.geographyContext}
Focus: ${directive.transformationFocus}
Style: ${directive.implementationStyle}
Examples: ${directive.examplesType}
Avoid: ${directive.avoidList.join(', ')}

SECTION:
Title: "${section.title}"
Purpose: "${section.purpose}"
Key points:
${section.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}
Target: ~${targetWords} words
Position: ${positionNote}
${p.prevSectionTitle ? `Previous section: "${p.prevSectionTitle}" — do not repeat.` : ''}
${p.extraContext ? `\nINSTRUCTION: ${p.extraContext}` : ''}

RULES:
- Full paragraphs, not bullet lists unless content requires it
- Every paragraph moves reader toward the after-state
- Concrete, local examples (${directive.geographyContext})
- Open with a hook. Close with a bridge to next section.
- No filler. No generic statements. Implementation-ready.
- Do NOT include the section title — body content only.

Write now.`
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
  if (!draft.isComplete) return null
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
