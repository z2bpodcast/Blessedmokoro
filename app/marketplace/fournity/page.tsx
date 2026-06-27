// app/marketplace/fournity/page.tsx
// FOURNITY Marketplace Page
// Reads referral code from URL ?ref=REFCODE

'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import FournityProductCard from '@/components/marketplace/FournityProductCard'

function FournityPage() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || undefined

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {refCode && (
          <div style={{
            background: 'rgba(46,204,113,0.08)',
            border: '1px solid rgba(46,204,113,0.2)',
            borderRadius: 4,
            padding: '10px 16px',
            marginBottom: 16,
            fontSize: 12,
            color: '#2ECC71',
            textAlign: 'center'
          }}>
            ✓ You were referred by a Z2B Legacy Builder member
          </div>
        )}
        <FournityProductCard
          memberReferralCode={refCode}
        />
        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(138,138,154,0.4)',
          marginTop: 16
        }}>
          © 2026 Rev Mokoro Manana · Z2B Digital Publishing · Zero2Billionaires Amavulandlela
        </p>
      </div>
    </div>
  )
}

export default function FournityMarketplacePage() {
  return (
    <Suspense fallback={<div style={{ color: '#C9A84C', padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <FournityPage />
    </Suspense>
  )
}