// FILE: lib/fourm-access.ts
// 4M vehicle access rules — member-facing (no API/provider names)

export type FourmVehicle = 'manual' | 'automatic' | 'electric'

/** Highest vehicle mode a paid Table tier unlocks by default */
export function tierVehicleCap(paidTier: string | null | undefined): FourmVehicle {
  const t = (paidTier || 'fam').toLowerCase()
  if (t === 'silver') return 'automatic'
  if (t === 'gold' || t === 'platinum') return 'electric'
  // fam, bronze, copper (and unknown) stay on Manual Power
  return 'manual'
}

export function vehicleRank(v: FourmVehicle): number {
  if (v === 'manual') return 1
  if (v === 'automatic') return 2
  return 3
}

/** Pick the lower of two caps (tier cap vs admin override) */
export function minVehicle(a: FourmVehicle, b: FourmVehicle): FourmVehicle {
  return vehicleRank(a) <= vehicleRank(b) ? a : b
}

export function parseVehicleScope(raw: string | null | undefined): FourmVehicle | null {
  if (!raw) return null
  const v = String(raw).toLowerCase().trim()
  if (v === 'manual' || v === 'automatic' || v === 'electric') return v
  return null
}

/** True when a Table Banquet paid tier includes 4M access (Silver+) */
export function tierIncludesFourmMembership(paidTier: string | null | undefined): boolean {
  return vehicleRank(tierVehicleCap(paidTier)) > vehicleRank('manual')
}

/**
 * Starter (R500) activation on the free Table tier — separate from Silver+ membership entitlement.
 * Row shape is controlled server-side (`four_m_unlock_source === 'payment_ai_income'`).
 */
export function famHasPaidStarterUnlock(unlockRow: { four_m_unlock_source?: string | null } | null | undefined): boolean {
  if (!unlockRow) return false
  return String(unlockRow.four_m_unlock_source || '') === 'payment_ai_income'
}

/** Any situation where the member should see the full 4M workspace (not preview-only). */
export function hasFourmWorkspaceAccess(
  paidTier: string | null | undefined,
  unlockRow: { four_m_unlock_source?: string | null } | null | undefined
): boolean {
  const t = String(paidTier || 'fam').toLowerCase()
  if (t !== 'fam') return true
  return famHasPaidStarterUnlock(unlockRow)
}
