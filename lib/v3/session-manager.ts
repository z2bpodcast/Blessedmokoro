// ============================================================
// Z2B 4M V3 — SESSION MANAGER
// File: lib/v3/session-manager.ts
// Laws: Modular · Scalable · Separated from UI and AI logic
// Purpose: All gear session CRUD and lifecycle management
//          This layer sits between the UI and Supabase
//          Never contains AI logic or UI components
// ============================================================

import { createClient } from '@supabase/supabase-js'
import {
  TierId,
  getTier,
  canAccessGear,
  isRocketTier,
  normaliseTier,
} from '@/lib/v3/tier-config'

// ── TYPES ────────────────────────────────────────────────────

export type GearPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export type ProductStatus =
  | 'draft'
  | 'ignition_complete'
  | 'gear1_complete'
  | 'gear2_complete'
  | 'gear3_complete'
  | 'gear4_complete'
  | 'gear5_complete'
  | 'gear6_complete'
  | 'live'
  | 'abandoned'

export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned'

export interface GearSession {
  id:                 string
  builder_id:         string
  tier:               string
  gear_access:        number
  phase_current:      GearPhase
  opportunity_data:   Record<string, unknown> | null
  intent_data:        Record<string, unknown> | null
  structure_data:     Record<string, unknown> | null
  content_draft:      string | null
  quality_score:      number | null  // hidden from builder
  quality_passed:     boolean | null
  revision_count:     number
  enhancement_assets: Record<string, unknown> | null
  packaging_data:     Record<string, unknown> | null
  distribution_data:  Record<string, unknown> | null
  product_status:     ProductStatus
  marketplace_id:     string | null
  session_status:     SessionStatus
  automation_mode:    'none' | 'high' | 'ultra'
  created_at:         string
  updated_at:         string
  completed_at:       string | null
}

// Builder-safe session view (hides quality scores and internal data)
export interface PublicGearSession {
  id:             string
  phase_current:  GearPhase
  gear_access:    number
  product_status: ProductStatus
  session_status: SessionStatus
  tier:           string
  automation_mode:'none' | 'high' | 'ultra'
  has_opportunity:boolean
  has_intent:     boolean
  has_structure:  boolean
  has_content:    boolean
  has_assets:     boolean
  has_packaging:  boolean
  is_distributed: boolean
  created_at:     string
  updated_at:     string
}

// Access check result
export interface AccessCheckResult {
  allowed:  boolean
  reason?:  string
  redirect?:string
}

// ── SUPABASE CLIENT ──────────────────────────────────────────
// Memoized server-side client — created once per module lifecycle
// Never use client-side Supabase for session management (Law 19)
let _serverClient: ReturnType<typeof createClient> | null = null

function getServerClient() {
  if (!_serverClient) {
    _serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _serverClient
}

// ── ACCESS CONTROL ───────────────────────────────────────────

// Check if a builder can access the 4M Machine at all
export async function check4MAccess(builderId: string): Promise<AccessCheckResult> {
  const supabase = getServerClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('paid_tier, gear_access, bfm_status, access_expires, v3_enrolled')
    .eq('id', builderId)
    .single()

  if (error || !profile) {
    return { allowed: false, reason: 'Profile not found', redirect: '/login' }
  }

  const tier = normaliseTier(profile.paid_tier || 'fam')

  // FAM tier — no 4M access
  if (tier === 'fam') {
    return {
      allowed:  false,
      reason:   'Free tier cannot access the 4M Machine',
      redirect: '/pricing',
    }
  }

  // BFM overdue — suspend access
  if (profile.bfm_status === 'overdue' || profile.bfm_status === 'suspended') {
    return {
      allowed:  false,
      reason:   'BFM payment overdue — please contact admin',
      redirect: '/dashboard?bfm=overdue',
    }
  }

  // Access expired
  if (profile.access_expires && new Date(profile.access_expires) < new Date()) {
    return {
      allowed:  false,
      reason:   'Your access period has expired',
      redirect: '/pricing?reason=expired',
    }
  }

  return { allowed: true }
}

// Check if a builder can access a specific gear
// Combined access check — single DB round trip for both checks
export async function checkGearAccess(
  builderId: string,
  gearNumber: number
): Promise<AccessCheckResult> {
  const supabase = getServerClient()

  // Single query fetches all fields needed for both checks
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('paid_tier, gear_access, bfm_status, access_expires')
    .eq('id', builderId)
    .single()

  if (error || !profile) {
    return { allowed: false, reason: 'Profile not found', redirect: '/login' }
  }

  const tier = normaliseTier(profile.paid_tier || 'fam')

  if (tier === 'fam') {
    return { allowed: false, reason: 'Free tier cannot access the 4M Machine', redirect: '/pricing' }
  }
  if (profile.bfm_status === 'overdue' || profile.bfm_status === 'suspended') {
    return { allowed: false, reason: 'BFM payment overdue', redirect: '/dashboard?bfm=overdue' }
  }
  if (profile.access_expires && new Date(profile.access_expires) < new Date()) {
    return { allowed: false, reason: 'Access period expired', redirect: '/pricing?reason=expired' }
  }

  const tierGearAccess = profile.gear_access ?? 0
  if (gearNumber > tierGearAccess) {
    return {
      allowed:  false,
      reason:   'Your tier does not include Gear ' + String(gearNumber),
      redirect: '/pricing?upgrade=gear' + String(gearNumber),
    }
  }

  return { allowed: true }
}

// ── SESSION CREATION ─────────────────────────────────────────

// Create a new gear session after Idea Ignition completes
export async function createGearSession(
  builderId: string,
  opportunityData: Record<string, unknown>
): Promise<{ session: GearSession | null; error: string | null }> {
  const supabase = getServerClient()

  // Get current tier
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('paid_tier, gear_access')
    .eq('id', builderId)
    .single()

  if (profileError || !profile) {
    return { session: null, error: 'Could not load builder profile' }
  }

  const tier = normaliseTier(profile.paid_tier)
  const tierDef = getTier(tier)

  // Check parallel session limit
  const { count: activeSessions } = await supabase
    .from('gear_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('builder_id', builderId)
    .eq('session_status', 'active')

  if (
    tierDef.parallelSessions > 0 &&
    (activeSessions ?? 0) >= tierDef.parallelSessions
  ) {
    return {
      session: null,
      error:   'Maximum parallel sessions reached for your tier',
    }
  }

  const { data: session, error: createError } = await supabase
    .from('gear_sessions')
    .insert({
      builder_id:      builderId,
      tier:            tier,
      gear_access:     tierDef.gearAccess,
      phase_current:   0,
      opportunity_data: opportunityData,
      product_status:  'ignition_complete',
      session_status:  'active',
      automation_mode: tierDef.automationMode,
    })
    .select()
    .single()

  if (createError) {
    return { session: null, error: createError.message }
  }

  return { session: session as GearSession, error: null }
}

// ── SESSION RETRIEVAL ────────────────────────────────────────

// Get active session for a builder (most recent)
export async function getActiveSession(
  builderId: string
): Promise<GearSession | null> {
  const supabase = getServerClient()

  const { data } = await supabase
    .from('gear_sessions')
    .select('*')
    .eq('builder_id', builderId)
    .eq('session_status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  return (data as GearSession) ?? null
}

// Get a specific session (validates ownership)
export async function getSession(
  sessionId: string,
  builderId: string
): Promise<GearSession | null> {
  const supabase = getServerClient()

  const { data } = await supabase
    .from('gear_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('builder_id', builderId)
    .single()

  return (data as GearSession) ?? null
}

// Get all active sessions (for Rocket Platinum pipeline)
export async function getAllActiveSessions(
  builderId: string
): Promise<GearSession[]> {
  const supabase = getServerClient()

  const { data } = await supabase
    .from('gear_sessions')
    .select('*')
    .eq('builder_id', builderId)
    .eq('session_status', 'active')
    .order('updated_at', { ascending: false })

  return (data as GearSession[]) ?? []
}

// ── SESSION UPDATES ──────────────────────────────────────────

// Advance to next gear (saves gear output before advancing)
export async function advanceGear(
  sessionId:   string,
  builderId:   string,
  gearNumber:  number,
  gearOutput:  Record<string, unknown>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = getServerClient()

  // Map gear number to its output column
  const outputColumnMap: Record<number, string> = {
    1: 'intent_data',
    2: 'structure_data',
    3: 'content_draft',
    5: 'enhancement_assets',
    6: 'packaging_data',
    7: 'distribution_data',
  }

  // Gear 7 = product goes live, not a named gear-complete state
  const productStatusMap: Record<number, string> = {
    1: 'in_progress',
    2: 'in_progress',
    3: 'in_progress',
    4: 'quality_check',
    5: 'in_progress',
    6: 'in_progress',
    7: 'live',
  }

  const outputColumn  = outputColumnMap[gearNumber]
  const nextPhase     = (gearNumber < 7 ? gearNumber + 1 : 7) as GearPhase
  const newStatus     = productStatusMap[gearNumber] ?? 'in_progress'

  const updateData: Record<string, unknown> = {
    phase_current:   nextPhase,
    product_status:  newStatus,
  }

  if (outputColumn) {
    updateData[outputColumn] = gearOutput
  }

  const { error } = await supabase
    .from('gear_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .eq('builder_id', builderId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

// Save content draft (Gear 3 — saves as writing progresses)
export async function saveContentDraft(
  sessionId:  string,
  builderId:  string,
  content:    string
): Promise<boolean> {
  const supabase = getServerClient()

  const { error } = await supabase
    .from('gear_sessions')
    .update({ content_draft: content })
    .eq('id', sessionId)
    .eq('builder_id', builderId)

  return !error
}

// Save quality evaluation result (admin/AI only — never exposed to builder)
export async function saveQualityResult(
  sessionId:     string,
  builderId:     string,
  score:         number,
  passed:        boolean,
  revisionCount: number
): Promise<boolean> {
  const supabase = getServerClient()

  const { error } = await supabase
    .from('gear_sessions')
    .update({
      quality_score:  score,
      quality_passed: passed,
      revision_count: revisionCount,
    })
    .eq('id', sessionId)
    .eq('builder_id', builderId)

  return !error
}

// Mark session as complete (Gear 7 distributed, or tier endpoint reached)
export async function completeSession(
  sessionId:     string,
  builderId:     string,
  marketplaceId: string | null = null
): Promise<boolean> {
  const supabase = getServerClient()

  const { error } = await supabase
    .from('gear_sessions')
    .update({
      session_status: 'completed',
      product_status: 'live',
      marketplace_id: marketplaceId,
      completed_at:   new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('builder_id', builderId)

  return !error
}

// Pause session (builder closes app)
export async function pauseSession(
  sessionId: string,
  builderId: string
): Promise<boolean> {
  const supabase = getServerClient()

  const { error } = await supabase
    .from('gear_sessions')
    .update({ session_status: 'paused' })
    .eq('id', sessionId)
    .eq('builder_id', builderId)
    .eq('session_status', 'active')

  return !error
}

// Resume a paused session
export async function resumeSession(
  sessionId: string,
  builderId: string
): Promise<boolean> {
  const supabase = getServerClient()

  const { error } = await supabase
    .from('gear_sessions')
    .update({ session_status: 'active' })
    .eq('id', sessionId)
    .eq('builder_id', builderId)
    .eq('session_status', 'paused')

  return !error
}

// Abandon session
export async function abandonSession(
  sessionId: string,
  builderId: string
): Promise<boolean> {
  const supabase = getServerClient()

  const { error } = await supabase
    .from('gear_sessions')
    .update({ session_status: 'abandoned' })
    .eq('id', sessionId)
    .eq('builder_id', builderId)

  return !error
}

// ── SAFE PUBLIC VIEW ─────────────────────────────────────────
// Strips all internal/hidden data before sending to UI
// Law 11: Orchestration hidden from users

export function toPublicSession(session: GearSession): PublicGearSession {
  return {
    id:             session.id,
    phase_current:  session.phase_current,
    gear_access:    session.gear_access,
    product_status: session.product_status,
    session_status: session.session_status,
    tier:           session.tier,
    automation_mode:session.automation_mode,
    has_opportunity:!!session.opportunity_data,
    has_intent:     !!session.intent_data,
    has_structure:  !!session.structure_data,
    has_content:    !!session.content_draft,
    has_assets:     !!session.enhancement_assets,
    has_packaging:  !!session.packaging_data,
    is_distributed: !!session.distribution_data,
    created_at:     session.created_at,
    updated_at:     session.updated_at,
    // NEVER includes: quality_score, quality_passed, revision_count
  }
}

// ── STALE SESSION CLEANUP ───────────────────────────────────
// Marks sessions stuck in 'active' for over 4 hours as 'paused'
// Call this from a cron job or on user login
export async function cleanStaleSessions(builderId: string): Promise<number> {
  const supabase = getServerClient()
  const staleThreshold = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('gear_sessions')
    .update({ session_status: 'paused' })
    .eq('builder_id', builderId)
    .eq('session_status', 'active')
    .lt('updated_at', staleThreshold)
    .select('id')

  if (error) return 0
  return data?.length ?? 0
}

// ============================================================
// END OF SESSION MANAGER
// ============================================================
