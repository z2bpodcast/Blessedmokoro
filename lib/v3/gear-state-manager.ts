// ============================================================
// Z2B V3 — GEAR STATE MANAGER
// File: lib/v3/gear-state-manager.ts
// PURPOSE: Auto-save and restore every gear's output
//          so pressing BACK never triggers re-generation
// RULE: Check saved state FIRST. Only call AI if nothing saved.
// ============================================================

import { createClient } from '@supabase/supabase-js'

// ── KEY BUILDERS ──────────────────────────────────────────────
export function gearStorageKey(sessionId: string, gear: number): string {
  return `v3_gear${gear}_output_${sessionId}`
}

export function gearDraftKey(sessionId: string, gear: number): string {
  return `v3_gear${gear}_draft_${sessionId}`
}

// ── SESSION STORAGE (fast, same-tab) ─────────────────────────

export function saveGearOutputToSession(
  sessionId: string,
  gear: number,
  output: unknown
): void {
  try {
    sessionStorage.setItem(
      gearStorageKey(sessionId, gear),
      JSON.stringify({ output, savedAt: Date.now() })
    )
  } catch (_) {}
}

export function loadGearOutputFromSession(
  sessionId: string,
  gear: number
): unknown | null {
  try {
    const raw = sessionStorage.getItem(gearStorageKey(sessionId, gear))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.output ?? null
  } catch (_) {
    return null
  }
}

export function clearGearOutput(sessionId: string, gear: number): void {
  try {
    sessionStorage.removeItem(gearStorageKey(sessionId, gear))
    sessionStorage.removeItem(gearDraftKey(sessionId, gear))
  } catch (_) {}
}

// ── SUPABASE PERSISTENCE (cross-session, survives refresh) ────

export async function saveGearOutputToDB(params: {
  userId:    string
  sessionId: string
  gear:      number
  output:    unknown
  status?:   'in_progress' | 'complete'
}): Promise<void> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await (sb.from as any)('gear_outputs').upsert({
      session_id:  params.sessionId,
      builder_id:  params.userId,
      gear_number: params.gear,
      output_data: params.output,
      status:      params.status ?? 'in_progress',
      updated_at:  new Date().toISOString(),
    }, { onConflict: 'session_id,gear_number' })
  } catch (_) {}
}

export async function loadGearOutputFromDB(
  sessionId: string,
  gear: number
): Promise<unknown | null> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await (sb.from as any)('gear_outputs')
      .select('output_data')
      .eq('session_id', sessionId)
      .eq('gear_number', gear)
      .maybeSingle() as { data: { output_data: unknown } | null }
    return data?.output_data ?? null
  } catch (_) {
    return null
  }
}

// ── COMBINED SAVE (both layers) ───────────────────────────────

export async function saveGearOutput(params: {
  userId:    string
  sessionId: string
  gear:      number
  output:    unknown
  status?:   'in_progress' | 'complete'
}): Promise<void> {
  // Layer 1: sessionStorage (instant)
  saveGearOutputToSession(params.sessionId, params.gear, params.output)
  // Layer 2: Supabase (persistent)
  await saveGearOutputToDB(params)
}

// ── COMBINED LOAD (check sessionStorage first, then DB) ───────

export async function loadGearOutput(
  sessionId: string,
  gear: number
): Promise<unknown | null> {
  // Fast path: check sessionStorage first
  const cached = loadGearOutputFromSession(sessionId, gear)
  if (cached !== null) return cached

  // Slow path: check database
  const dbData = await loadGearOutputFromDB(sessionId, gear)
  if (dbData !== null) {
    // Restore to sessionStorage for speed
    saveGearOutputToSession(sessionId, gear, dbData)
  }
  return dbData
}

// ── PROJECT SAVE ──────────────────────────────────────────────
// Saves the full project state (all gears) as a named draft

export async function saveProjectDraft(params: {
  userId:       string
  sessionId:    string
  title:        string
  currentGear:  number
  allOutputs:   Record<number, unknown>
}): Promise<void> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await (sb.from as any)('saved_projects').upsert({
      session_id:   params.sessionId,
      builder_id:   params.userId,
      title:        params.title,
      current_gear: params.currentGear,
      all_outputs:  params.allOutputs,
      status:       'draft',
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'session_id' })
  } catch (_) {}
}
