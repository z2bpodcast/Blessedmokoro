// ============================================================
// Z2B — HTML PRODUCT THEMES
// File: lib/v3/html-themes.ts
// Generates unique visual identity per product
// Based on product title, format and audience
// ============================================================

export interface ProductTheme {
  name:        string
  primaryColor:string
  accentColor: string
  bgColor:     string
  textColor:   string
  mutedColor:  string
  fontHeading: string
  fontBody:    string
  coverStyle:  string
}

// Hash a string to a number for consistent theme selection
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const THEMES: ProductTheme[] = [
  // Professional Dark — business, finance, career
  {
    name: 'Professional Dark',
    primaryColor: '#1A2E4A', accentColor: '#D4AF37',
    bgColor: '#0D1929', textColor: '#E8F0FE', mutedColor: '#94A3B8',
    fontHeading: 'Georgia, serif', fontBody: 'Georgia, serif',
    coverStyle: 'dark-gold',
  },
  // Fresh Teal — health, wellness, lifestyle
  {
    name: 'Fresh Teal',
    primaryColor: '#0F4C5C', accentColor: '#06D6A0',
    bgColor: '#F0FAFA', textColor: '#1A2E2E', mutedColor: '#4A7C7C',
    fontHeading: 'Georgia, serif', fontBody: 'Georgia, serif',
    coverStyle: 'teal-mint',
  },
  // Royal Purple — personal development, spirituality, education
  {
    name: 'Royal Purple',
    primaryColor: '#2D1B69', accentColor: '#8B5CF6',
    bgColor: '#FAF8FF', textColor: '#1A0A3E', mutedColor: '#6B5E8E',
    fontHeading: 'Georgia, serif', fontBody: 'Georgia, serif',
    coverStyle: 'purple-light',
  },
  // Warm Amber — parenting, relationships, community
  {
    name: 'Warm Amber',
    primaryColor: '#92400E', accentColor: '#F59E0B',
    bgColor: '#FFFBF0', textColor: '#1C1007', mutedColor: '#78563A',
    fontHeading: 'Georgia, serif', fontBody: 'Georgia, serif',
    coverStyle: 'amber-warm',
  },
  // Clean Slate — technology, productivity, tools
  {
    name: 'Clean Slate',
    primaryColor: '#1E293B', accentColor: '#06B6D4',
    bgColor: '#F8FAFC', textColor: '#0F172A', mutedColor: '#64748B',
    fontHeading: 'Georgia, serif', fontBody: 'Georgia, serif',
    coverStyle: 'slate-cyan',
  },
  // Forest Green — environment, sustainability, nature
  {
    name: 'Forest Green',
    primaryColor: '#14532D', accentColor: '#22C55E',
    bgColor: '#F0FFF4', textColor: '#052E16', mutedColor: '#4A7C59',
    fontHeading: 'Georgia, serif', fontBody: 'Georgia, serif',
    coverStyle: 'forest-green',
  },
  // Crimson Bold — entrepreneurship, sales, marketing
  {
    name: 'Crimson Bold',
    primaryColor: '#7F1D1D', accentColor: '#EF4444',
    bgColor: '#FFF5F5', textColor: '#1A0000', mutedColor: '#7C3A3A',
    fontHeading: 'Georgia, serif', fontBody: 'Georgia, serif',
    coverStyle: 'crimson-bold',
  },
  // Ocean Blue — travel, adventure, freedom
  {
    name: 'Ocean Blue',
    primaryColor: '#1E3A5F', accentColor: '#3B82F6',
    bgColor: '#F0F8FF', textColor: '#0C1B2E', mutedColor: '#4A6A8A',
    fontHeading: 'Georgia, serif', fontBody: 'Georgia, serif',
    coverStyle: 'ocean-blue',
  },
]

export function getThemeForProduct(productTitle: string, format: string, audience: string): ProductTheme {
  const combined = (productTitle + format + audience).toLowerCase()
  const hash     = hashString(combined)
  return THEMES[hash % THEMES.length]
}
