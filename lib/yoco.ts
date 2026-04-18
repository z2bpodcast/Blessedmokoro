// lib/yoco.ts - Yoco Configuration
export const YOCO_CONFIG = {
  publicKey: process.env.YOCO_MODE === 'live' 
    ? process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY_LIVE 
    : process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY_TEST,
  mode: process.env.YOCO_MODE || 'test',
  businessName: 'ZERO2BILLIONAIRES AMAVULANDLELA'
}

export const MEMBERSHIP_TIERS = {
  fam: {
    name: '4M Money Machine',
    fullName: '4M Money Machine (Entry Digital Product)',
    price: 500,
    currency: 'ZAR',
    trainingBenefits: [
      'AI Income execution starter access',
      'Smartphone-based income activation',
      'Digital product onboarding',
      '4M launch support resources'
    ],
    salesBenefits: [
      'R200 for every 4M Money Machine you sell',
      'SALES & MARKETING: R200 for every SALES & MARKETING',
      '10% Individual Sales Profit (ISP)',
      'Promote Z2B products & memberships',
      'No Team Performance Bonus (TPB)',
      'No Quick Pathfinder Bonus (QPB)',
      'No Marketplace access',
      'Optional CEO Competitions'
    ],
    color: 'gray'
  },
  bronze: {
    name: 'Bronze',
    price: 2500,
    currency: 'ZAR',
    trainingBenefits: [
      'All FAM benefits',
      'Access premium content',
      'Priority support',
      'App or Website build included (x1)',
      'Private AI automation stack enabled (content, voice, workflow and growth tools)',
      'Bronze badge'
    ],
    salesBenefits: [
      '18% Individual Sales Profit (ISP)',
      'Quick Pathfinder Bonus (QPB) eligible',
      'Team Performance Bonus (TPB) - Gen 3',
      'Participate in CEO Competitions'
    ],
    color: 'orange'
  },
  copper: {
    name: 'Copper',
    price: 5000,
    currency: 'ZAR',
    trainingBenefits: [
      'All Bronze benefits',
      'Advanced training modules',
      'Monthly group coaching',
      'App or Website builds included (x2)',
      'Private AI automation stack enabled (content, voice, workflow and growth tools)',
      'Copper badge'
    ],
    salesBenefits: [
      '22% Individual Sales Profit (ISP)',
      'Quick Pathfinder Bonus (QPB) eligible',
      'Team Performance Bonus (TPB) - Gen 4',
      'Participate in CEO Competitions'
    ],
    color: 'amber'
  },
  silver: {
    name: 'Silver',
    price: 12000,
    currency: 'ZAR',
    trainingBenefits: [
      'All Copper benefits',
      'Weekly mastermind access',
      'AI business tools',
      'App builds included (x4)',
      'Private AI automation stack enabled (content, voice, workflow and growth tools)',
      'Silver badge'
    ],
    salesBenefits: [
      '25% Individual Sales Profit (ISP)',
      'Quick Pathfinder Bonus (QPB) eligible',
      'Team Performance Bonus (TPB) - Gen 6',
      'Eligibility for CEO Awards',
      'Participate in CEO Competitions'
    ],
    color: 'slate'
  },
  gold: {
    name: 'Gold',
    price: 24000,
    currency: 'ZAR',
    trainingBenefits: [
      'All Silver benefits',
      'Marketplace seller access',
      'App builds included (x5)',
      'Gold Pool profit sharing',
      '1 weekend boot camp',
      'Private AI automation stack enabled (content, voice, workflow and growth tools)',
      'Gold badge'
    ],
    salesBenefits: [
      '28% Individual Sales Profit (ISP)',
      'Quick Pathfinder Bonus (QPB) eligible',
      'Team Performance Bonus (TPB) - Gen 8',
      'Marketplace Seller Access',
      'Eligibility for CEO Awards',
      'Participate in CEO Competitions'
    ],
    color: 'yellow'
  },
  platinum: {
    name: 'Platinum',
    price: 50000,
    currency: 'ZAR',
    trainingBenefits: [
      'All Gold benefits',
      'App builds included (x7)',
      'Platinum Pool profit sharing',
      '1 weekend boot camp',
      '1-on-1 strategic business consultation (monthly x3)',
      'Private AI automation stack enabled (content, voice, workflow and growth tools)',
      'White-label opportunities',
      'VIP event access',
      'Platinum badge',
      'Exclusive CEO mastermind'
    ],
    salesBenefits: [
      '30% Individual Sales Profit (ISP)',
      'Quick Pathfinder Bonus (QPB) eligible',
      'Team Performance Bonus (TPB) - Gen 10',
      'Marketplace Seller Access',
      'Eligibility for CEO Awards',
      'Participate in CEO Competitions'
    ],
    color: 'purple'
  }
}

export function getTierKey(tierName: string): string {
  return tierName.toLowerCase().replace(/\s+/g, '_')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0
  }).format(amount)
}