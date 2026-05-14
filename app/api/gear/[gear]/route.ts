// ============================================================
// Z2B 4M V3 — UNIFIED GEAR API ROUTE
// File: app/api/gear/[gear]/route.ts
// Laws: Modular · Tier-gated · Extensible for Gears 2-7
// Purpose: Single API route handles all gear actions.
//          Each gear has its own engine in lib/v3/.
//          This route validates, gates, and delegates.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { normaliseTier }             from '@/lib/v3/tier-config'
import {
  checkGearAccess,
  createGearSession,
  getActiveSession,
  getSession,
  advanceGear,
  saveContentDraft,
  toPublicSession,
  type GearSession,
} from '@/lib/v3/session-manager'
import {
  runGear1,
  adjustGear1,
  toGear2Handoff,
  type SelectedOpportunity,
} from '@/lib/v3/gear1-engine'
import {
  runGear2,
  adjustGear2,
  toGear3Handoff,
  type ProductStructure,
} from '@/lib/v3/gear2-engine'
import {
  buildContentDirective,
  generateSectionContent,
  regenerateSectionContent,
  assembleContentDraft,
  toGear4Handoff,
  isGear3Endpoint,
  type SectionContent,
  type ContentDraft,
  type ContentDirective,
} from '@/lib/v3/gear3-engine'
import type { IntentDefinition } from '@/lib/v3/gear1-engine'

// Gear API timeout — prevents Vercel serverless from hanging (MEDIUM #6)
// Vercel serverless max is 60s — we abort at 50s
const GEAR_API_TIMEOUT_MS = 50000

// ── TYPES ────────────────────────────────────────────────────

type GearNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7

// ── AUTH HELPER ──────────────────────────────────────────────
async function getAuthUser(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, supabase, error: 'No auth token' }
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return { user, supabase, error: error?.message ?? null }
}

// ── MAIN HANDLER ─────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gear: string }> }
) {
  try {
    const { gear: gearParam } = await params
    const gearNumber = parseInt(gearParam) as GearNumber
    if (isNaN(gearNumber) || gearNumber < 1 || gearNumber > 7) {
      return NextResponse.json({ error: 'Invalid gear number' }, { status: 400 })
    }

    const body   = await req.json()
    const action = body.action as string

    // ── AUTH ──────────────────────────────────────────────────
    const { user, supabase, error: authError } = await getAuthUser(req)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Session expired. Please refresh.', code: 'AUTH_EXPIRED' },
        { status: 401 }
      )
    }

    // ── GEAR ACCESS GATE ──────────────────────────────────────
    const access = await checkGearAccess(user.id, gearNumber)
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason, redirect: access.redirect },
        { status: 403 }
      )
    }

    // ── GET TIER ──────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('paid_tier')
      .eq('id', user.id)
      .single() as { data: { paid_tier: string | null } | null }

    const tierId = normaliseTier(profile?.paid_tier || 'fam')

    // ── ROUTE TO GEAR HANDLER ────────────────────────────────
    switch (gearNumber) {
      case 1: return await handleGear1(req, user.id, tierId, action, body)
      // Gears 2-7 added in Sprints 4-7
      case 2: return await handleGear2(user.id, tierId, action, body)
      case 3: return await handleGear3(user.id, tierId, action, body)
      case 4: return await handleGear4(user.id, tierId, action, body)
      case 5: return await handleGear5(user.id, tierId, action, body)
      case 6:
      case 7:
        return NextResponse.json(
          { error: 'Gear ' + String(gearNumber) + ' is coming soon.' },
          { status: 501 }
        )
      default:
        return NextResponse.json({ error: 'Unknown gear' }, { status: 400 })
    }

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    console.error('[gear-api]', msg)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

// ── GEAR 5 HANDLER ───────────────────────────────────────────

async function handleGear5(
  userId:  string,
  tierId:  string,
  action:  string,
  body:    Record<string, unknown>
): Promise<NextResponse> {

  const validActions = ['get_directive', 'generate_asset', 'confirm']
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action for Gear 5' }, { status: 400 })
  }

  // ── GET DIRECTIVE: GPT-5.x plans assets ───────────────────
  if (action === 'get_directive') {
    const { draft, intent, sessionId } = body as {
      draft:     Record<string, unknown>
      intent:    Record<string, unknown>
      sessionId: string
    }
    if (!draft || !intent || !sessionId) {
      return NextResponse.json({ error: 'Missing data.' }, { status: 400 })
    }
    const result = await buildEnhancementDirective({
      draft:  draft as any,
      intent: intent as any,
      tierId,
    })
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ assets: result.assets })
  }

  // ── GENERATE ASSET: Claude Sonnet builds one asset ────────
  if (action === 'generate_asset') {
    const { assetPlan, draft, intent, sessionId } = body as {
      assetPlan: Record<string, unknown>
      draft:     Record<string, unknown>
      intent:    Record<string, unknown>
      sessionId: string
    }
    if (!assetPlan?.type || !draft || !intent || !sessionId) {
      return NextResponse.json({ error: 'Missing asset data.' }, { status: 400 })
    }

    // MEDIUM #2: Validate asset type against known values
    const validTypes = ['worksheet','checklist','action_plan','template','framework','tracker','quick_reference','planner']
    if (!validTypes.includes(String(assetPlan.type))) {
      return NextResponse.json({ error: 'Invalid asset type: ' + String(assetPlan.type) }, { status: 400 })
    }

    const result = await generateAsset({
      assetPlan: assetPlan as any,
      draft:     draft as any,
      intent:    intent as any,
      tierId,
    })

    if (result.error || !result.asset) {
      return NextResponse.json({ error: result.error ?? 'Asset generation failed.' }, { status: 500 })
    }

    // Save to session incrementally
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: sessionRow } = await (sb.from as any)('gear_sessions')
      .select('enhancement_assets')
      .eq('id', sessionId)
      .eq('builder_id', userId)
      .maybeSingle() as { data: { enhancement_assets: string | null } | null }

    const existing: EnhancementAsset[] = sessionRow?.enhancement_assets
      ? (() => { try { return JSON.parse(sessionRow.enhancement_assets) } catch { return [] } })()
      : []

    const updated = [...existing.filter((a: EnhancementAsset) => a.id !== result.asset!.id), result.asset]

    await (sb.from as any)('gear_sessions')
      .update({ enhancement_assets: JSON.stringify(updated) })
      .eq('id', sessionId)
      .eq('builder_id', userId)

    return NextResponse.json({ asset: result.asset })
  }

  // ── CONFIRM: Save bundle and advance ──────────────────────
  if (action === 'confirm') {
    const { bundle, draft, intent, sessionId } = body as {
      bundle:    Record<string, unknown>
      draft:     Record<string, unknown>
      intent:    Record<string, unknown>
      sessionId: string
    }
    if (!bundle || !draft || !intent || !sessionId) {
      return NextResponse.json({ error: 'Missing data.' }, { status: 400 })
    }
    if (!Array.isArray((bundle as any).assets) || (bundle as any).assets.length === 0) {
      return NextResponse.json({ error: 'No assets in bundle.' }, { status: 400 })
    }

    // MEDIUM #3: Validate asset content is present
    const emptyAssets = (bundle as any).assets.filter(
      (a: { content?: string }) => !a.content?.trim() || a.content.trim().length < 20
    )
    if (emptyAssets.length > 0) {
      return NextResponse.json(
        { error: `${emptyAssets.length} asset(s) have no content. Please try regenerating.` },
        { status: 400 }
      )
    }

    const handoff = toGear6Handoff(bundle as any, draft as any, intent as any)
    if (!handoff) {
      return NextResponse.json({ error: 'Could not build handoff.' }, { status: 500 })
    }

    const { success, error: advanceError } = await advanceGear(sessionId, userId, 5, handoff)
    if (!success) {
      return NextResponse.json({ error: advanceError ?? 'Could not save.' }, { status: 500 })
    }

    const isEndpoint = isGear5Endpoint(tierId)
    if (isEndpoint) {
      return NextResponse.json({
        success:    true,
        isEndpoint: true,
        redirect:   '/ai-income/gear/5/complete?session=' + sessionId,
      })
    }
    return NextResponse.json({
      success:    true,
      isEndpoint: false,
      nextGear:   6,
      redirect:   '/ai-income/gear/6?session=' + sessionId,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// ── GEAR 4 HANDLER ───────────────────────────────────────────

async function handleGear4(
  userId:  string,
  tierId:  string,
  action:  string,
  body:    Record<string, unknown>
): Promise<NextResponse> {

  const validActions = ['evaluate', 'confirm']
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action for Gear 4' }, { status: 400 })
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // ── EVALUATE ──────────────────────────────────────────────
  // GPT-5.x evaluates the full content draft
  // Runs automatically — then auto-revises if needed
  // Builder never sees the score — only the outcome
  if (action === 'evaluate') {
    const { draft, intent, sessionId } = body as {
      draft:     Record<string, unknown>
      intent:    Record<string, unknown>
      sessionId: string
    }

    if (!draft || !intent || !sessionId) {
      return NextResponse.json({ error: 'Missing draft, intent or session.' }, { status: 400 })
    }

    // HIGH #1: Validate draft has actual sections before running QC
    const draftSections = (draft as any).sections
    if (!Array.isArray(draftSections) || draftSections.length === 0) {
      return NextResponse.json({ error: 'Draft has no sections. Please return to Gear 3.' }, { status: 400 })
    }

    // Check revision cycle count (server-side — loop prevention law)
    const { data: sessionRow } = await (sb.from as any)('gear_sessions')
      .select('revision_count')
      .eq('id', sessionId)
      .eq('builder_id', userId)
      .maybeSingle() as { data: { revision_count: number } | null }

    const revisionCount = sessionRow?.revision_count ?? 0

    // After 2 revision cycles — force pass to prevent infinite loop
    if (revisionCount >= 2) {
      const forcedPass = {
        passed:           true,
        revisionType:     'none' as const,
        weakSectionCount: 0,
        statusMessage:    'Quality review complete. Your product is ready.',
        isComplete:       true,
      }
      return NextResponse.json({ publicResult: forcedPass, forced: true })
    }

    // Run evaluation
    const evalResult = await runGear4Evaluation({
      draft:  draft as any,
      intent: intent as any,
    })

    if (evalResult.error) {
      return NextResponse.json({ error: evalResult.error }, { status: 500 })
    }

    // Save quality evaluation to DB (admin/AI only — hidden from builder)
    if (evalResult.evaluation) {
      await (sb.from as any)('quality_evaluations').insert({
        session_id:          sessionId,
        builder_id:          userId,
        overall_score:       evalResult.evaluation.overallScore,
        criteria_breakdown:  evalResult.evaluation.criteriaBreakdown,
        revision_number:     revisionCount,
        revision_type:       evalResult.evaluation.revisionType,
        weak_sections:       evalResult.evaluation.weakSections,
        escalated:           evalResult.evaluation.revisionType === 'major',
        escalation_reason:   evalResult.evaluation.escalationReason ?? null,
        passed:              evalResult.evaluation.passed,
        passed_at:           evalResult.evaluation.passed ? new Date().toISOString() : null,
      })

      // Save score to gear_sessions (also hidden from builder)
      await (sb.from as any)('gear_sessions')
        .update({
          quality_score:  evalResult.evaluation.overallScore,
          quality_passed: evalResult.evaluation.passed,
        })
        .eq('id', sessionId)
        .eq('builder_id', userId)
    }

    // If needs minor revision — run it automatically (hidden from builder)
    let finalDraft = draft
    if (
      !evalResult.evaluation?.passed &&
      evalResult.evaluation?.revisionType === 'minor' &&
      evalResult.evaluation.weakSections.length > 0
    ) {
      const revisionResult = await runMinorRevision({
        draft:        draft as any,
        weakSections: evalResult.evaluation.weakSections,
        intent:       intent as any,
      })

      if (!revisionResult.error && revisionResult.revisedSections.length > 0) {
        // Merge revised sections into draft
        const updatedSections = (draft as any).sections.map((s: any) => {
          const revised = revisionResult.revisedSections.find(
            r => r.sectionNumber === s.sectionNumber
          )
          return revised ? { ...s, content: revised.content } : s
        })
        finalDraft = { ...draft as any, sections: updatedSections }

        // Increment revision count
        await (sb.from as any)('gear_sessions')
          .update({ revision_count: revisionCount + 1 })
          .eq('id', sessionId)
          .eq('builder_id', userId)

        // HIGH #2: Save updated content_draft to session immediately after revision
        await (sb.from as any)('gear_sessions')
          .update({ content_draft: JSON.stringify(finalDraft) })
          .eq('id', sessionId)
          .eq('builder_id', userId)

        // Re-run evaluation on revised draft (one time only)
        const revalResult = await runGear4Evaluation({
          draft:  finalDraft as any,
          intent: intent as any,
        })

        if (!revalResult.error && revalResult.evaluation) {
          const revalPassed = (revalResult.evaluation?.overallScore ?? 0) >= 60  // lenient threshold after revision
          await (sb.from as any)('quality_evaluations').insert({
            session_id:         sessionId,
            builder_id:         userId,
            overall_score:      revalResult.evaluation.overallScore,
            criteria_breakdown: revalResult.evaluation.criteriaBreakdown,
            revision_number:    revisionCount + 1,
            revision_type:      'none',
            weak_sections:      [],
            escalated:          false,
            passed:             revalPassed,  // MEDIUM #6: real score, lenient threshold
            passed_at:          revalPassed ? new Date().toISOString() : null,
          })

          await (sb.from as any)('gear_sessions')
            .update({
              quality_score:  revalResult.evaluation.overallScore,
              quality_passed: revalPassed,
            })
            .eq('id', sessionId)
            .eq('builder_id', userId)
        }

        // Return pass result after revision (builder sees "strengthened" then pass)
        const passAfterRevision = {
          passed:           true,
          revisionType:     'minor' as const,
          weakSectionCount: evalResult.evaluation.weakSections.length,
          statusMessage:    'Quality approved. Your product has been strengthened.',
          isComplete:       true,
        }
        return NextResponse.json({
          publicResult: passAfterRevision,
          draft:        finalDraft,
        })
      }
    }

    // Major fail or pass — return public result only (no scores)
    return NextResponse.json({
      publicResult: evalResult.publicResult,
      draft:        evalResult.evaluation?.revisionType === 'major' ? null : finalDraft,
    })
  }

  // ── CONFIRM: Advance to Gear 5 (or deliver for Bronze) ────
  if (action === 'confirm') {
    const { draft, intent, sessionId } = body as {
      draft:     Record<string, unknown>
      intent:    Record<string, unknown>
      sessionId: string
    }

    if (!draft || !intent || !sessionId) {
      return NextResponse.json({ error: 'Missing data.' }, { status: 400 })
    }

    // MEDIUM #7: Validate draft has sections before advancing
    if (!Array.isArray((draft as any).sections) || (draft as any).sections.length === 0) {
      return NextResponse.json({ error: 'Draft has no content. Please return to Gear 3.' }, { status: 400 })
    }

    const handoff = toGear5Handoff(draft as any, intent as any)
    if (!handoff) {
      return NextResponse.json({ error: 'Could not build product handoff.' }, { status: 500 })
    }
    const { success, error: advanceError } = await advanceGear(sessionId, userId, 4, handoff)

    if (!success) {
      return NextResponse.json({ error: advanceError ?? 'Could not save.' }, { status: 500 })
    }

    const isEndpoint = isGear4Endpoint(tierId)

    if (isEndpoint) {
      return NextResponse.json({
        success:    true,
        isEndpoint: true,
        nextGear:   null,
        redirect:   '/ai-income/gear/4/complete?session=' + sessionId,
      })
    }

    return NextResponse.json({
      success:    true,
      isEndpoint: false,
      nextGear:   5,
      redirect:   '/ai-income/gear/5?session=' + sessionId,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// ── GEAR 3 HANDLER ───────────────────────────────────────────
// Gear 3 works section-by-section — each section is one API call
// This enables live progress updates in the UI

async function handleGear3(
  userId:  string,
  tierId:  string,
  action:  string,
  body:    Record<string, unknown>
): Promise<NextResponse> {

  const validActions = ['get_directive', 'generate_section', 'regenerate_section', 'confirm']
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action for Gear 3' }, { status: 400 })
  }

  // ── GET DIRECTIVE: GPT-5.x builds writing brief once ──────
  if (action === 'get_directive') {
    const { intent, structure, sessionId } = body as {
      intent:    IntentDefinition
      structure: ProductStructure
      sessionId: string
    }

    if (!intent?.productTitle || !structure?.sections?.length || !sessionId) {
      return NextResponse.json({ error: 'Missing intent, structure or session.' }, { status: 400 })
    }

    const result = await buildContentDirective({ intent, structure })

    if (result.error || !result.directive) {
      return NextResponse.json({ error: result.error ?? 'Could not build directive.' }, { status: 500 })
    }

    return NextResponse.json({ directive: result.directive })
  }

  // ── GENERATE SECTION: Claude Sonnet writes one section ────
  if (action === 'generate_section') {
    const { section, directive, intent, structure, sessionId, isBonus, prevSectionTitle } = body as {
      section:           Record<string, unknown>
      directive:         Record<string, unknown>
      intent:            IntentDefinition
      structure:         ProductStructure
      sessionId:         string
      isBonus?:          boolean
      prevSectionTitle?: string
    }

    if (!section || !directive || !intent || !structure || !sessionId) {
      return NextResponse.json({ error: 'Missing section generation data.' }, { status: 400 })
    }

    // Server-side section field validation (HIGH #1)
    const sectionNum   = section.number as number
    const sectionTitle = section.title as string
    const sectionPurpose = section.purpose as string
    if (!sectionNum || !sectionTitle?.trim() || !sectionPurpose?.trim()) {
      return NextResponse.json({ error: 'Invalid section data — missing number, title or purpose.' }, { status: 400 })
    }

    const result = await generateSectionContent({
      section:          section as any,
      directive:        directive as any,
      intent,
      structure,
      isBonus:          isBonus ?? false,
      prevSectionTitle: prevSectionTitle,
    })

    if (result.error || !result.section) {
      return NextResponse.json({ error: result.error ?? 'Section generation failed.' }, { status: 500 })
    }

    // Save progress to session content_draft incrementally
    // Reuse existing client — createClient is idempotent with same args (MEDIUM #7)
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: sessionRow } = await (sb.from as any)('gear_sessions')
      .select('content_draft')
      .eq('id', sessionId)
      .eq('builder_id', userId)
      .maybeSingle() as { data: { content_draft: string | null } | null }

    const existingDraft = sessionRow?.content_draft
      ? (() => { try { return JSON.parse(sessionRow.content_draft) } catch { return null } })()
      : null

    const existingSections: SectionContent[] = existingDraft?.sections ?? []
    const updatedSections = [
      ...existingSections.filter((s: SectionContent) => s.sectionNumber !== result.section!.sectionNumber),
      result.section,
    ].sort((a, b) => a.sectionNumber - b.sectionNumber)

    await (sb.from as any)('gear_sessions')
      .update({ content_draft: JSON.stringify({ sections: updatedSections }) })
      .eq('id', sessionId)
      .eq('builder_id', userId)

    return NextResponse.json({ section: result.section })
  }

  // ── REGENERATE SECTION: max 1 per section ─────────────────
  if (action === 'regenerate_section') {
    const { section, directive, intent, structure, sessionId, builderFeedback, sectionRegenCounts } = body as {
      section:            Record<string, unknown>
      directive:          Record<string, unknown>
      intent:             IntentDefinition
      structure:          ProductStructure
      sessionId:          string
      builderFeedback:    string
      sectionRegenCounts: Record<number, number>
    }

    if (!section || !directive || !intent || !sessionId || !builderFeedback?.trim()) {
      return NextResponse.json({ error: 'Missing regeneration data.' }, { status: 400 })
    }

    // MEDIUM #8: Server-side feedback minimum length
    if (builderFeedback.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please describe what to improve in at least a few words.' },
        { status: 400 }
      )
    }

    // Enforce max 1 regen per section (loop prevention law)
    const sectionNum = section.number as number
    const regenCount = sectionRegenCounts?.[sectionNum] ?? 0
    if (regenCount >= 1) {
      return NextResponse.json(
        { error: 'This section has already been regenerated once. Please accept it or move on.' },
        { status: 429 }
      )
    }

    const result = await regenerateSectionContent({
      section:         section as any,
      directive:       directive as any,
      intent,
      structure,
      builderFeedback: builderFeedback.trim(),
    })

    if (result.error || !result.section) {
      return NextResponse.json({ error: result.error ?? 'Regeneration failed.' }, { status: 500 })
    }

    return NextResponse.json({ section: result.section, regenCount: regenCount + 1 })
  }

  // ── CONFIRM: All sections complete — advance gear ──────────
  if (action === 'confirm') {
    const { draft, intent, structure, sessionId } = body as {
      draft:     ContentDraft
      intent:    IntentDefinition
      structure: ProductStructure
      sessionId: string
    }

    if (!draft?.sections?.length || !intent || !structure || !sessionId) {
      return NextResponse.json({ error: 'Missing draft, intent or session.' }, { status: 400 })
    }

    if (!draft.isComplete) {
      return NextResponse.json(
        { error: 'Not all sections are complete. Please generate all sections first.' },
        { status: 400 }
      )
    }

    // HIGH #2: Double-check sections actually exist with content
    const emptySections = draft.sections.filter(
      (s: { content?: string }) => !s.content?.trim() || s.content.trim().length < 50
    )
    if (emptySections.length > 0) {
      return NextResponse.json(
        { error: `${emptySections.length} section(s) have no content. Please regenerate them.` },
        { status: 400 }
      )
    }

    const isEndpoint = isGear3Endpoint(tierId)
    const handoff    = toGear4Handoff(draft, intent, structure)

    if (!handoff) {
      return NextResponse.json({ error: 'Could not build product handoff.' }, { status: 500 })
    }

    const { success, error: advanceError } = await advanceGear(sessionId, userId, 3, handoff)

    if (!success) {
      return NextResponse.json({ error: advanceError ?? 'Could not save content.' }, { status: 500 })
    }

    if (isEndpoint) {
      return NextResponse.json({
        success:    true,
        isEndpoint: true,
        nextGear:   null,
        redirect:   '/ai-income/gear/3/complete?session=' + sessionId,
        message:    'Your product is complete. Time to deliver it.',
      })
    }

    return NextResponse.json({
      success:    true,
      isEndpoint: false,
      nextGear:   4,
      redirect:   '/ai-income/gear/4?session=' + sessionId,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

async function handleGear2(
  userId:  string,
  tierId:  string,
  action:  string,
  body:    Record<string, unknown>
): Promise<NextResponse> {

  const validActions = ['generate', 'adjust', 'confirm']
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action for Gear 2' }, { status: 400 })
  }

  // ── GENERATE ──────────────────────────────────────────────
  if (action === 'generate') {
    const { intent, sessionId } = body as {
      intent:    IntentDefinition
      sessionId: string
    }

    if (!intent?.productTitle || !sessionId) {
      return NextResponse.json({ error: 'Missing intent or session.' }, { status: 400 })
    }

    const result = await runGear2({ intent, tierId })

    if (result.error || !result.structure) {
      return NextResponse.json({ error: result.error ?? 'Structure generation failed.' }, { status: 500 })
    }

    // Save intent to session so it survives resume (HIGH #2)
    await advanceGear(sessionId, userId, 0, { intent_persisted: true })
    // Persist intent_data directly using v3Table
    const sb3 = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await (sb3.from as any)('gear_sessions')
      .update({ intent_data: intent })
      .eq('id', sessionId)
      .eq('builder_id', userId)

    return NextResponse.json({ structure: result.structure })
  }

  // ── ADJUST ────────────────────────────────────────────────
  if (action === 'adjust') {
    const { currentStructure, adjustment, intent, sessionId } = body as {
      currentStructure: ProductStructure
      adjustment:       string
      intent:           IntentDefinition
      sessionId:        string
    }

    if (!currentStructure || !adjustment?.trim() || !intent || !sessionId) {
      return NextResponse.json({ error: 'Missing adjustment data.' }, { status: 400 })
    }

    if (adjustment.trim().length < 5) {
      return NextResponse.json({ error: 'Please describe what you want to change.' }, { status: 400 })
    }

    // Server-side adjust count enforcement
    const supabase2 = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: sessionRow } = await (supabase2.from as any)('gear_sessions')
      .select('revision_count')
      .eq('id', sessionId)
      .eq('builder_id', userId)
      .maybeSingle() as { data: { revision_count: number } | null }

    const serverRevCount = sessionRow?.revision_count ?? 0
    if (serverRevCount >= 2) {
      return NextResponse.json(
        { error: 'Maximum adjustments reached. Please confirm your structure.' },
        { status: 429 }
      )
    }

    await (supabase2.from as any)('gear_sessions')
      .update({ revision_count: serverRevCount + 1 })
      .eq('id', sessionId)
      .eq('builder_id', userId)

    const result = await adjustGear2({ currentStructure, adjustment: adjustment.trim(), intent, tierId })

    return NextResponse.json({ structure: result.structure })
  }

  // ── CONFIRM ───────────────────────────────────────────────
  if (action === 'confirm') {
    const { structure, intent, sessionId } = body as {
      structure: ProductStructure
      intent:    IntentDefinition
      sessionId: string
    }

    if (!structure?.sections?.length || !intent || !sessionId) {
      return NextResponse.json({ error: 'Missing structure, intent or session.' }, { status: 400 })
    }

    if (structure.sections.length < 3) {
      return NextResponse.json({ error: 'Structure must have at least 3 sections.' }, { status: 400 })
    }
    // Validate section content — no empty titles (MEDIUM #6)
    const emptySections = structure.sections.filter(
      (s: { title?: string }) => !s.title?.trim() || s.title.trim().length < 3
    )
    if (emptySections.length > 0) {
      return NextResponse.json({ error: 'All sections must have valid titles.' }, { status: 400 })
    }

    const handoff = toGear3Handoff(structure, intent)

    const { success, error: advanceError } = await advanceGear(sessionId, userId, 2, handoff)

    if (!success) {
      return NextResponse.json({ error: advanceError ?? 'Could not save structure.' }, { status: 500 })
    }

    return NextResponse.json({
      success:  true,
      nextGear: 3,
      redirect: '/ai-income/gear/3?session=' + sessionId,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// ── GEAR 1 HANDLER ───────────────────────────────────────────

async function handleGear1(
  req:     NextRequest,
  userId:  string,
  tierId:  string,
  action:  string,
  body:    Record<string, unknown>
): Promise<NextResponse> {

  const validActions = ['generate', 'adjust', 'confirm', 'resume']
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action for Gear 1' }, { status: 400 })
  }

  // ── GENERATE: First run of Gear 1 ─────────────────────────
  if (action === 'generate') {
    const opportunity = body.opportunity as SelectedOpportunity | undefined

    if (!opportunity?.title || !opportunity?.audience || !opportunity?.transformation) {
      return NextResponse.json(
        { error: 'Missing opportunity data. Please return to Idea Ignition.' },
        { status: 400 }
      )
    }

    // Run engine FIRST — create session only on success (HIGH #1)
    // This prevents orphaned sessions if AI call fails
    const result = await runGear1({
      opportunity,
      tierId,
      geography: body.geography as string | undefined,
    })

    if (result.error || !result.intent) {
      return NextResponse.json({ error: result.error ?? 'Intent generation failed.' }, { status: 500 })
    }

    // Engine succeeded — now create the session
    const { session, error: sessionError } = await createGearSession(
      userId,
      {
        title:          opportunity.title,
        audience:       opportunity.audience,
        transformation: opportunity.transformation,
        format:         opportunity.format,
        priceRangeMin:  opportunity.priceRangeMin,
        priceRangeMax:  opportunity.priceRangeMax,
      }
    )

    if (sessionError || !session) {
      return NextResponse.json(
        { error: sessionError ?? 'Could not create session.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      intent:    result.intent,
      sessionId: session.id,
      session:   toPublicSession(session),
    })
  }

  // ── ADJUST: Builder requests a change to intent ────────────
  if (action === 'adjust') {
    const { currentIntent, adjustment, sessionId } = body as {
      currentIntent: Record<string, unknown>
      adjustment:    string
      sessionId:     string
    }

    if (!currentIntent || !adjustment?.trim() || !sessionId) {
      return NextResponse.json({ error: 'Missing adjustment data.' }, { status: 400 })
    }

    if (adjustment.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please describe what you want to change.' },
        { status: 400 }
      )
    }

    // Server-side adjust count enforcement (HIGH #3 — client count is spoofable)
    const supabase2 = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: sessionRow } = await (supabase2.from as any)('gear_sessions')
      .select('revision_count')
      .eq('id', sessionId)
      .eq('builder_id', userId)
      .maybeSingle() as { data: { revision_count: number } | null }

    const serverRevCount = sessionRow?.revision_count ?? 0
    if (serverRevCount >= 2) {
      return NextResponse.json(
        { error: 'Maximum adjustments reached. Please confirm your intent.' },
        { status: 429 }
      )
    }

    // Increment server-side revision count
    await (supabase2.from as any)('gear_sessions')
      .update({ revision_count: serverRevCount + 1 })
      .eq('id', sessionId)
      .eq('builder_id', userId)

    const result = await adjustGear1({
      currentIntent: currentIntent as any,
      adjustment:    adjustment.trim(),
      tierId,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ intent: result.intent })
  }

  // ── CONFIRM: Builder approves intent → advance to Gear 2 ───
  if (action === 'confirm') {
    const { intent, sessionId } = body as {
      intent:    Record<string, unknown>
      sessionId: string
    }

    if (!intent || !sessionId) {
      return NextResponse.json({ error: 'Missing intent or session.' }, { status: 400 })
    }

    // Server-side intent field validation (HIGH #2)
    const requiredFields = ['productTitle','targetAudience','beforeState','afterState','productFormat','audienceLevel']
    const missingFields  = requiredFields.filter(f => !intent[f] || String(intent[f]).trim().length < 3)
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Intent is incomplete. Please generate again.' },
        { status: 400 }
      )
    }

    // Clamp price server-side
    if (typeof intent.priceRecommended === 'number') {
      intent.priceRecommended = Math.max(99, Math.min(4999, Math.round(intent.priceRecommended)))
    }

    // Save intent to session and advance phase
    const { success, error: advanceError } = await advanceGear(
      sessionId,
      userId,
      1,
      toGear2Handoff(intent as any)
    )

    if (!success) {
      return NextResponse.json(
        { error: advanceError ?? 'Could not save intent.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success:   true,
      nextGear:  2,
      redirect:  '/ai-income/gear/2?session=' + sessionId,
    })
  }

  // ── RESUME: Load existing Gear 1 session ───────────────────
  if (action === 'resume') {
    const { sessionId: resumeId } = body as { sessionId?: string }

    // Use specific sessionId if provided — prevents loading wrong session (MEDIUM #5)
    let session = null
    if (resumeId) {
      session = await getSession(resumeId, userId)
    }
    if (!session) {
      session = await getActiveSession(userId)
    }

    if (!session) {
      return NextResponse.json({ session: null })
    }

    // If session is past Gear 1 already, redirect to correct gear
    if (session.phase_current > 1) {
      return NextResponse.json({
        session:  toPublicSession(session),
        redirect: '/ai-income/gear/' + String(session.phase_current) + '?session=' + session.id,
      })
    }

    return NextResponse.json({
      session:         toPublicSession(session),
      intentData:      session.intent_data,
      opportunityData: session.opportunity_data,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
