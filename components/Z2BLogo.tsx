// FILE: components/Z2BLogo.tsx
// Z2B Legacy Builders + Marketplace logos — using uploaded PNG files

import Image from 'next/image'
import Link from 'next/link'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<LogoSize, { w: number; h: number; text: string }> = {
  sm:  { w: 36,  h: 36,  text: '12px' },
  md:  { w: 56,  h: 56,  text: '14px' },
  lg:  { w: 88,  h: 88,  text: '18px' },
  xl:  { w: 140, h: 140, text: '24px' },
}

export function Z2BLogo({
  size = 'md',
  showText = true,
  href = '/',
  center = false,
}: {
  size?: LogoSize
  showText?: boolean
  href?: string
  center?: boolean
}) {
  const { w, h, text } = SIZES[size]

  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      justifyContent: center ? 'center' : 'flex-start',
    }}>
      <Image
        src="/logo-z2b.png"
        alt="Z2B Legacy Builders"
        width={w}
        height={h}
        style={{ objectFit: 'contain', flexShrink: 0 }}
        priority={size === 'xl' || size === 'lg'}
      />
      {showText && (
        <div>
          <div style={{
            fontFamily: 'Cinzel,Georgia,serif', fontSize: text, fontWeight: 900,
            background: 'linear-gradient(135deg,#D4AF37,#FCD34D)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}>
            Z2B Legacy Builders
          </div>
          {size !== 'sm' && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              Deploy Yourself
            </div>
          )}
        </div>
      )}
    </div>
  )

  return href ? (
    <Link href={href} style={{ textDecoration: 'none', display: 'inline-block' }}>
      {inner}
    </Link>
  ) : inner
}

// ── Marketplace Logo ─────────────────────────────────────────────
export function MarketplaceLogo({
  size = 'md',
  showText = true,
  href = '/marketplace',
  center = false,
}: {
  size?: LogoSize
  showText?: boolean
  href?: string
  center?: boolean
}) {
  const { w, h, text } = SIZES[size]

  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      justifyContent: center ? 'center' : 'flex-start',
    }}>
      <Image
        src="/logo-marketplace.png"
        alt="Z2B Marketplace"
        width={w}
        height={h}
        style={{ objectFit: 'contain', flexShrink: 0 }}
        priority={size === 'xl' || size === 'lg'}
      />
      {showText && (
        <div>
          <div style={{
            fontFamily: 'Cinzel,Georgia,serif', fontSize: text, fontWeight: 900,
            background: 'linear-gradient(135deg,#06B6D4,#38BDF8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}>
            Z2B Marketplace
          </div>
          {size !== 'sm' && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              Digital Products · Global
            </div>
          )}
        </div>
      )}
    </div>
  )

  return href ? (
    <Link href={href} style={{ textDecoration: 'none', display: 'inline-block' }}>
      {inner}
    </Link>
  ) : inner
}
