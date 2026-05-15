// ============================================================
// Z2B 4M V3 — TIER CONFIGURATION
// File: lib/v3/tier-config.ts
// Laws: Modular · Extensible · No hardcoded logic
// Purpose: Single source of truth for all tier definitions
//          Used by: auth · gear gates · UI · API routes
// ============================================================

// ── TIER IDs ────────────────────────────────────────────────
// Preserves all V2 tier IDs for backward compatibility
export type TierId =
  | 'fam'
  | 'free'
  | 'starter'
  | 'bronze'
  | 'copper'
  | 'silver'
  | 'gold'
  | 'platinum'
  | '

// ── AUTOMATION MODE ──────────────────────────────────────────
export type AutomationMode = 'none' | 'high' | 'ultra'

// ── TIER DEFINITION ──────────────────────────────────────────
export interface TierDefinition {
  id:               TierId
  label:            string
  vehicle:          'manual' | 'automatic' | 'electric' | 'rocket' | 'free'
  priceZar:         number        // ZAR (not cents)
  gearAccess:       number        // 0, 3, 4, 5, or 7
  accessDays:       number        // 0 = no expiry (FAM), else days
  bfmMonthlyZar:    number        // 0 = no BFM
  automationMode:   AutomationMode
  ideaIgnitionDepth:'none' | 'limited' | 'enhanced' | 'expanded' | 'full' | 'premium' | 'elite'
  maxOpportunities: number        // max shown in Idea Ignition
  parallelSessions: number        // max simultaneous gear sessions
  hasBFM:           boolean
  isRocket:         boolean
  emoji:            string
  color:            string
  description:      string
}

// ── TIER REGISTRY ────────────────────────────────────────────
// Single source of truth — all tier behaviour defined here
export const TIER_CONFIG: Record<TierId, TierDefinition> = {
  fam: {
    id:               'fam',
    label:            'Free Member',
    vehicle:          'free',
    priceZar:         0,
    gearAccess:       0,
    accessDays:       0,
    bfmMonthlyZar:    0,
    automationMode:   'none',
    ideaIgnitionDepth:'none',
    maxOpportunities: 0,
    parallelSessions: 0,
    hasBFM:           false,
    isRocket:         false,
    emoji:            '🌱',
    color:            '#6B7280',
    description:      'Workshop · Zero2Billionaires Flipbook + PDF · Browse Marketplace',
    engineType: 'manual' as const,
  },
  // free is an alias for fam — same values, normaliseTier() normalises it
  free: {
    id:               'fam',
    label:            'Free Member',
    vehicle:          'free',
    priceZar:         0,
    gearAccess:       0,
    accessDays:       0,
    bfmMonthlyZar:    0,
    automationMode:   'none',
    ideaIgnitionDepth:'none',
    maxOpportunities: 0,
    parallelSessions: 0,
    hasBFM:           false,
    isRocket:         false,
    emoji:            '🌱',
    color:            '#6B7280',
    description:      'Workshop · Zero2Billionaires Flipbook + PDF · Browse Marketplace',
    engineType: 'manual' as const,
  },
  starter: {
    id:               'starter',
    label:            'Manual Starter',
    vehicle:          'manual',
    priceZar:         700,
    gearAccess:       3,
    accessDays:       60,
    bfmMonthlyZar:    250,
    automationMode:   'none',
    ideaIgnitionDepth:'limited',
    maxOpportunities: 3,
    parallelSessions: 1,
    hasBFM:           true,
    isRocket:         false,
    emoji:            '🚗',
    color:            '#10B981',
    description:      'Idea Ignition · Gears 1-3 · Marketplace listing · NSB income · Zero2Billionaires eBook',
    engineType: 'manual' as const,
  },
  bronze: {
    id:               'bronze',
    label:            'Manual Bronze',
    vehicle:          'manual',
    priceZar:         2500,
    gearAccess:       4,
    accessDays:       60,
    bfmMonthlyZar:    1050,
    automationMode:   'none',
    ideaIgnitionDepth:'enhanced',
    maxOpportunities: 3,
    parallelSessions: 1,
    hasBFM:           true,
    isRocket:         false,
    emoji:            '🥉',
    color:            '#CD7F32',
    description:      'Gears 1-4 · Quality Control · ISP + TSC income · Team building',
    engineType: 'manual' as const,
  },
  copper: {
    id:               'copper',
    label:            'Automatic Copper',
    vehicle:          'automatic',
    priceZar:         5000,
    gearAccess:       5,
    accessDays:       90,
    bfmMonthlyZar:    1300,
    automationMode:   'none',
    ideaIgnitionDepth:'expanded',
    maxOpportunities: 5,
    parallelSessions: 1,
    hasBFM:           true,
    isRocket:         false,
    emoji:            '🪙',
    color:            '#B87333',
    description:      'Gears 1-5 · Value Enhancement · Influencer Engine · Google Trends',
    engineType: 'automatic' as const,
  },
  silver: { // UPDATED: Silver now has all 7 gears
    id:               'silver',
    label:            'Electric Silver',
    vehicle:          'electric',
    priceZar:         12000,
    gearAccess: 7,
    accessDays:       120,
    bfmMonthlyZar:    2000,
    automationMode:   'none',
    ideaIgnitionDepth:'full',
    maxOpportunities: 7,
    parallelSessions: 1,
    hasBFM:           true,
    isRocket:         false,
    emoji:            '🥈',
    color:            '#C0C0C0',
    description:      'All 7 Gears · Professional packaging · Distribution engine · Full AI creation',
    engineType: 'electric' as const,
  },
  gold: {
    id:               'gold',
    label:            'Gold',
    vehicle:          'electric',
    priceZar:         24000,
    gearAccess:       7,
    accessDays:       365,
    bfmMonthlyZar:    0,
    automationMode:   'none',
    ideaIgnitionDepth:'full',
    maxOpportunities: 7,
    parallelSessions: 1,
    hasBFM:           false,
    isRocket:         false,
    emoji:            '🥇',
    color:            '#D4AF37',
    description:      'All 7 Gears · 1-year access · Premium AI product creation',
    // NOTE: gold/platinum have 365-day access like Rocket but are NOT Rocket tiers
    // They do not get automation routing. isRocket=false is correct.
    engineType: 'rocket' as const,
  },
  platinum: {
    id:               'platinum',
    label:            'Platinum',
    vehicle:          'electric',
    priceZar:         50000,
    gearAccess:       7,
    accessDays:       365,
    bfmMonthlyZar:    0,
    automationMode:   'none',
    ideaIgnitionDepth:'full',
    maxOpportunities: 10,
    parallelSessions: 2,
    hasBFM:           false,
    isRocket:         false,
    emoji:            '💎',
    color:            '#E5E4E2',
    description:      'All 7 Gears · Distribution Rights · CEO Competition · 1-year access',
    engineType: 'rocket' as const,
  },
  

// ── TIER ACCESS HELPERS ──────────────────────────────────────

// Get tier definition safely
export function getTier(tierId: string): TierDefinition {
  const normalised = normaliseTier(tierId)
  return TIER_CONFIG[normalised] ?? TIER_CONFIG.fam
}

// Can a tier access a specific gear?
export function canAccessGear(tierId: string, gearNumber: number): boolean {
  const tier = getTier(tierId)
  return tier.gearAccess >= gearNumber
}

// Can a tier access Idea Ignition?
// Helper: check if opportunity count is unlimited (-1)
export function isUnlimitedOpportunities(maxOpps: number): boolean {
  return maxOpps === -1
}

// Helper: get display count (shows Unlimited for -1)
export function getOpportunityCountLabel(maxOpps: number): string {
  return maxOpps === -1 ? 'Unlimited' : String(maxOpps)
}

export function canAccessIdeaIgnition(tierId: string): boolean {
  const tier = getTier(tierId)
  return tier.ideaIgnitionDepth !== 'none'
}

// Is this tier Rocket-capable?
export function isRocketTier(tierId: string): boolean {
  return getTier(tierId).isRocket
}

// Get next upgrade path from current tier
export function getUpgradePath(tierId: string): TierDefinition | null {
  const order: TierId[] = [
    'fam', 'starter', 'bronze', 'copper', 'silver',
    'gold', 'platinum', '

// Get number of accessible gears for display
export function getGearLabel(tierId: string): string {
  const tier = getTier(tierId)
  if (tier.gearAccess === 0) return 'No Gears'
  if (tier.gearAccess === 7) return 'All 7 Gears'
  return 'Gears 1-' + String(tier.gearAccess)
}

// ── GEAR DEFINITIONS ─────────────────────────────────────────
// Gear metadata for UI display (never exposes internal logic)
export interface GearDefinition {
  number:         number
  name:           string
  publicLabel:    string      // what builder sees
  minTier:        TierId      // minimum tier to access
  aiPrimary:      'gpt' | 'claude' | 'both'
  isEndpoint:     TierId[]    // tiers where this is the last gear
}

export const GEAR_DEFINITIONS: GearDefinition[] = [
  {
    number:      1,
    name:        'Intent Engine',
    publicLabel: 'Defining Your Product',
    minTier:     'starter',
    aiPrimary:   'gpt',
    isEndpoint:  [],
  },
  {
    number:      2,
    name:        'Structure Engine',
    publicLabel: 'Building Your Blueprint',
    minTier:     'starter',
    aiPrimary:   'both',
    isEndpoint:  [],
  },
  {
    number:      3,
    name:        'Content Engine',
    publicLabel: 'Creating Your Content',
    minTier:     'starter',
    aiPrimary:   'claude',
    isEndpoint:  ['starter'],
  },
  {
    number:      4,
    name:        'Quality Control Engine',
    publicLabel: 'Quality Review',
    minTier:     'bronze',
    aiPrimary:   'gpt',
    isEndpoint:  ['bronze'],
  },
  {
    number:      5,
    name:        'Value Enhancement Engine',
    publicLabel: 'Adding Premium Value',
    minTier:     'copper',
    aiPrimary:   'both',
    isEndpoint:  ['copper'],
  },
  {
    number:      6,
    name:        'Packaging Engine',
    publicLabel: 'Professional Packaging',
    minTier:     'silver',
    aiPrimary:   'gpt',
    isEndpoint:  [],
  },
  {
    number:      7,
    name:        'Distribution Engine',
    publicLabel: 'Launching to the World',
    minTier:     'silver',
    aiPrimary:   'gpt',
    isEndpoint:  ['silver', 'gold', 'platinum', '
]

// Get gear definition by number
export function getGear(gearNumber: number): GearDefinition | null {
  return GEAR_DEFINITIONS.find(g => g.number === gearNumber) ?? null
}

// Check if a gear is the endpoint for a tier
export function isGearEndpoint(tierId: string, gearNumber: number): boolean {
  const normalised = normaliseTier(tierId)
  const gear = getGear(gearNumber)
  if (!gear) return false
  return gear.isEndpoint.includes(normalised)
}

// Get all gears accessible for a tier
export function getAccessibleGears(tierId: string): GearDefinition[] {
  const tier = getTier(tierId)
  return GEAR_DEFINITIONS.filter(g => g.number <= tier.gearAccess)
}

// ── FREE TIER CONTENT ACCESS ──────────────────────────────────
export const FREE_TIER_ACCESS = {
  workshop:             true,  // All 99 Entrepreneurial Consumer sessions
  flipbook:             true,  // Zero2Billionaires Flipbook
  pdfDownload:          true,  // Zero2Billionaires PDF
  marketplaceBrowse:    true,  // Browse (not list)
  ideaIgnition:         false,
  gearAccess:           false,
  coachManlaw:          false,
  marketplaceList:      false,
} as const

// ── IDEA IGNITION DEPTH DESCRIPTIONS ──────────────────────────
export const IGNITION_DEPTH_CONFIG = {
  none:     { maxOpps: 0, hasGapAnalysis: false, hasHistory: false, hasMarketData: false },
  limited:  { maxOpps: 3, hasGapAnalysis: false, hasHistory: false, hasMarketData: false },
  enhanced: { maxOpps: 3, hasGapAnalysis: true,  hasHistory: true,  hasMarketData: false },
  expanded: { maxOpps: 5, hasGapAnalysis: true,  hasHistory: true,  hasMarketData: true  },
  full:     { maxOpps: 7, hasGapAnalysis: true,  hasHistory: true,  hasMarketData: true  },
  premium:  { maxOpps: 10, hasGapAnalysis: true, hasHistory: true,  hasMarketData: true  },
  elite:    { maxOpps: -1, hasGapAnalysis: true,  hasHistory: true,  hasMarketData: true  }, // -1 = unlimited
} as const

// ============================================================
// END OF TIER CONFIG
// ============================================================
