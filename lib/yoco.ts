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
    name: 'FAM',
    fullName: 'Free Affiliate Marketer',
    price: 0,
    currency: 'ZAR',
    trainingBenefits: [
      'Basic access to feed',
      'Create personal channel',
      'Earn referral commissions',
      'Access public content'
    ],
    salesBenefits: [
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
    price: 480,
    currency: 'ZAR',
    trainingBenefits: [
      'All FAM benefits',
      'Access premium content',
      'Priority support',
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
    price: 1200,
    currency: 'ZAR',
    trainingBenefits: [
      'All Bronze benefits',
      'Advanced training modules',
      'Monthly group coaching',
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
    price: 2500,
    currency: 'ZAR',
    trainingBenefits: [
      'All Copper benefits',
      'Weekly mastermind access',
      'AI business tools',
      'App brainstorming & building (x1)',
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
    price: 5000,
    currency: 'ZAR',
    trainingBenefits: [
      'All Silver benefits',
      'Marketplace seller access',
      '1-on-1 coaching sessions',
      'App brainstorming & building (x2)',
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
    price: 12000,
    currency: 'ZAR',
    trainingBenefits: [
      'All Gold benefits',
      'White-label opportunities',
      'VIP event access',
      'App brainstorming & building (x4)',
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