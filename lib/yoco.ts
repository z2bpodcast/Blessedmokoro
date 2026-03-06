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
    benefits: [
      'Basic access to feed',
      'Create personal channel',
      'Earn referral commissions',
      'Access public content'
    ],
    color: 'gray'
  },
  bronze: {
    name: 'Bronze',
    price: 480,
    currency: 'ZAR',
    benefits: [
      'All FAM benefits',
      'Access premium content',
      'Priority support',
      'Bronze badge'
    ],
    color: 'orange'
  },
  copper: {
    name: 'Copper',
    price: 1200,
    currency: 'ZAR',
    benefits: [
      'All Bronze benefits',
      'Advanced training modules',
      'Monthly group coaching',
      'Copper badge'
    ],
    color: 'amber'
  },
  silver: {
    name: 'Silver',
    price: 2500,
    currency: 'ZAR',
    benefits: [
      'All Copper benefits',
      'Weekly mastermind access',
      'AI business tools',
      'Silver badge'
    ],
    color: 'slate'
  },
  gold: {
    name: 'Gold',
    price: 5000,
    currency: 'ZAR',
    benefits: [
      'All Silver benefits',
      'Marketplace seller access',
      '1-on-1 coaching sessions',
      'Gold badge'
    ],
    color: 'yellow'
  },
  platinum: {
    name: 'Platinum',
    price: 12000,
    currency: 'ZAR',
    benefits: [
      'All Gold benefits',
      'White-label opportunities',
      'VIP event access',
      'Platinum badge',
      'Exclusive CEO mastermind'
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