'use client'

import WorkshopEmailGate from '@/components/WorkshopEmailGate'
// In your WorkshopPage component, before rendering:
if (!workshopEmail) return <WorkshopEmailGate onEnter={setWorkshopEmail} />

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Props {
  onEnter: (email: string) => void
}
export default function WorkshopEmailGate({ onEnter }: Props) {
  const [email,       setEmail]       = useState('')
  const [firstName,   setFirstName]   = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const refCode       = searchParams.get('ref') || ''

  // If user already registered with this email, skip gate
  useEffect(() => {
    const saved = localStorage.getItem('z2b_workshop_email')
    if (saved) onEnter(saved)
  }, [onEnter])

  const handleSubmit = async () => {
    setError('')
    if (!firstName.trim()) { setError('Please enter your first name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return }

    setLoading(true)
    try {
      // Upsert prospect — lock referral code to email on first touch
      const { error: upsertError } = await supabase
        .from('workshop_prospects')
        .upsert({
          email:          email.toLowerCase().trim(),
          first_name:     firstName.trim(),
          referred_by:    refCode || null,
          registered_at:  new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        }, {
          onConflict:     'email',
          ignoreDuplicates: false,   // update last_active but keep original referred_by
        })

      // If email already exists, DO NOT overwrite referred_by — handled by DB trigger
      if (upsertError) throw upsertError

      // Save locally so they don't see gate again this session
      localStorage.setItem('z2b_workshop_email',      email.toLowerCase().trim())
      localStorage.setItem('z2b_workshop_first_name', firstName.trim())
      if (refCode) localStorage.setItem('z2b_ref',   refCode)

      onEnter(email.toLowerCase().trim())
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #0A0015, #1A0035)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1A0035, #0D0020)',
        border: '2px solid rgba(212,175,55,0.4)',
        borderRadius: '20px', padding: '40px 32px',
        maxWidth: '420px', width: '100%', textAlign: 'center',
      }}>
        {/* Logo */}
        <img src="/logo.jpg" alt="Z2B" style={{ width: '72px', height: '72px', borderRadius: '16px', margin: '0 auto 20px', border: '2px solid #D4AF37' }} />

        <div style={{ fontSize: '12px', color: '#D4AF37', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '10px' }}>
          FREE WORKSHOP
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
          Your seat is ready.
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px', lineHeight: 1.7 }}>
          Enter your details to access Sessions 1–9 free. No credit card required.
        </p>

        {refCode && (
          <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#D4AF37' }}>
            🌱 You were invited by a Z2B Builder — your sponsor will be credited when you upgrade.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '15px', outline: 'none',
            }}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '15px', outline: 'none',
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', background: 'linear-gradient(135deg, #B8860B, #D4AF37)',
            color: '#000', border: 'none', borderRadius: '12px',
            padding: '14px', fontSize: '16px', fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Saving your seat...' : 'Access Free Workshop →'}
        </button>

        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '14px' }}>
          No spam. No monthly fees. Unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}