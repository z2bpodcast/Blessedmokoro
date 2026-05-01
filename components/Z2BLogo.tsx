// FILE: components/Z2BLogo.tsx
// Z2B Legacy Builders logo — used across all app pages
// Replace src with actual logo once uploaded to /public/logo-z2b.png

import Image from 'next/image'
import Link from 'next/link'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<LogoSize, { w: number; h: number; text: string }> = {
  sm:  { w: 32,  h: 32,  text: '12px' },
  md:  { w: 48,  h: 48,  text: '14px' },
  lg:  { w: 72,  h: 72,  text: '18px' },
  xl:  { w: 120, h: 120, text: '24px' },
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
      display: 'flex', alignItems: 'center', gap: '10px',
      justifyContent: center ? 'center' : 'flex-start',
    }}>
      {/* Logo image — replace with actual file once uploaded */}
      <div style={{
        width: w, height: h, borderRadius: '12px', overflow: 'hidden',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#1C1400,#3A2800)',
        border: '1px solid rgba(212,175,55,0.4)',
      }}>
        {/* Once logo is uploaded: replace this with <Image src="/logo-z2b.png" alt="Z2B" width={w} height={h} /> */}
        <svg width={w * 0.7} height={h * 0.7} viewBox="0 0 40 40" fill="none">
          {/* Robot hand holding phone — placeholder until real logo uploaded */}
          <rect x="14" y="8" width="12" height="20" rx="2" fill="#D4AF37" opacity="0.9"/>
          <rect x="16" y="10" width="8" height="14" rx="1" fill="#1C1400"/>
          <rect x="17" y="11" width="6" height="10" rx="0.5" fill="#D4AF37" opacity="0.3"/>
          <rect x="10" y="22" width="4" height="2" rx="1" fill="#D4AF37" opacity="0.7"/>
          <rect x="26" y="22" width="4" height="2" rx="1" fill="#D4AF37" opacity="0.7"/>
          <rect x="10" y="25" width="4" height="2" rx="1" fill="#D4AF37" opacity="0.7"/>
          <rect x="26" y="25" width="4" height="2" rx="1" fill="#D4AF37" opacity="0.7"/>
          <circle cx="20" cy="14" r="2" fill="#D4AF37" opacity="0.5"/>
        </svg>
      </div>
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
      display: 'flex', alignItems: 'center', gap: '10px',
      justifyContent: center ? 'center' : 'flex-start',
    }}>
      <div style={{
        width: w, height: h, borderRadius: '12px', overflow: 'hidden',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#101820,#1E3040)',
        border: '1px solid rgba(6,182,212,0.4)',
      }}>
        {/* Silver robot hand — placeholder until real logo uploaded */}
        <svg width={w * 0.7} height={h * 0.7} viewBox="0 0 40 40" fill="none">
          <rect x="14" y="8" width="12" height="20" rx="2" fill="#94A3B8" opacity="0.9"/>
          <rect x="16" y="10" width="8" height="14" rx="1" fill="#101820"/>
          <rect x="17" y="11" width="6" height="10" rx="0.5" fill="#06B6D4" opacity="0.3"/>
          <rect x="10" y="22" width="4" height="2" rx="1" fill="#94A3B8" opacity="0.7"/>
          <rect x="26" y="22" width="4" height="2" rx="1" fill="#94A3B8" opacity="0.7"/>
          <rect x="10" y="25" width="4" height="2" rx="1" fill="#94A3B8" opacity="0.7"/>
          <rect x="26" y="25" width="4" height="2" rx="1" fill="#94A3B8" opacity="0.7"/>
          <circle cx="20" cy="14" r="2" fill="#06B6D4" opacity="0.6"/>
        </svg>
      </div>
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
