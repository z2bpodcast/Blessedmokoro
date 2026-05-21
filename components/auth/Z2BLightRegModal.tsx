'use client'
// ============================================================
// Z2B LIGHT REGISTRATION MODAL
// File: components/auth/Z2BLightRegModal.tsx
//
// Used on 3 landing pages:
// 1. /marketplace?ref=XXXXX    → Marketplace
// 2. /book_landing (HTML page) → eBook
// 3. /ai-income?ref=XXXXX      → 4M Machine
//
// Flow: Name + Email + Password → Supabase signup → Payment
// No banking details. No full profile. Just get them in.
// ============================================================

import { useState } from 'react'
import { supabase }  from '@/lib/supabase'

// ── IMAGES ───────────────────────────────────────────────────
const IMAGES = {
  book:        'https://udfjauogxptlkfrmdtsg.supabase.co/storage/v1/object/public/public-assets/book-cover.jpg',
  marketplace: 'https://udfjauogxptlkfrmdtsg.supabase.co/storage/v1/object/public/public-assets/logo-marketplace.png',
  machine:     'https://udfjauogxptlkfrmdtsg.supabase.co/storage/v1/object/public/public-assets/z2b%204M%20logo.png',
}

// ── CONFIGS PER VARIANT ───────────────────────────────────────
const CONFIG = {
  book: {
    image:       IMAGES.book,
    imageStyle:  { borderRadius: 4, width: '100%' },
    animate:     true,   // floating animation
    eyebrow:     'ZERO2BILLIONAIRES · ANCHOR EBOOK',
    title:       'Zero2Billionaires',
    titleEm:     true,
    subtitle:    'From Salary Struggles to Digital Freedom',
    benefit:     'Get instant access to the full book ecosystem — eBook, Audio, Flipbook & Workbook.',
    price:       'R200',
    ctaLabel:    'GET THE EBOOK',
    redirectTo:  '/marketplace',   // after signup → payment modal opens
    color:       '#D4AF37',
    accentBg:    'rgba(212,175,55,0.08)',
    accentBorder:'rgba(212,175,55,0.3)',
  },
  marketplace: {
    image:       IMAGES.marketplace,
    imageStyle:  { borderRadius: 12, width: '100%' },
    animate:     false,
    eyebrow:     'Z2B MARKETPLACE · DIGITAL PRODUCTS',
    title:       'The Z2B Marketplace',
    titleEm:     false,
    subtitle:    'Buy, Sell & Earn from Digital Products',
    benefit:     'Join free and start earning 20% affiliate commission on every product you refer.',
    price:       'FREE',
    ctaLabel:    'JOIN THE MARKETPLACE',
    redirectTo:  '/marketplace',
    color:       '#06B6D4',
    accentBg:    'rgba(6,182,212,0.08)',
    accentBorder:'rgba(6,182,212,0.3)',
  },
  machine: {
    image:       IMAGES.machine,
    imageStyle:  { borderRadius: 12, width: '100%' },
    animate:     false,
    eyebrow:     '4M MACHINE · DIGITAL PRODUCTS FACTORY',
    title:       '4M: Digital Products Factory',
    titleEm:     false,
    subtitle:    'Build. Sell. Earn. Repeat.',
    benefit:     'Create and sell digital products with AI. From idea to marketplace in one session.',
    price:       'From R700',
    ctaLabel:    'START BUILDING',
    redirectTo:  '/ai-income',     // after signup → compare tiers first
    color:       '#8B5CF6',
    accentBg:    'rgba(139,92,246,0.08)',
    accentBorder:'rgba(139,92,246,0.3)',
  },
}

type Variant = 'book' | 'marketplace' | 'machine'
type Step    = 'form' | 'loading' | 'success' | 'error'

interface Props {
  variant:   Variant
  refCode?:  string
  onClose?:  () => void
  onSuccess?: (redirectTo: string) => void
}

export default function Z2BLightRegModal({ variant, refCode = '', onClose, onSuccess }: Props) {
  const cfg = CONFIG[variant]

  const [step,     setStep]     = useState<Step>('form')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')

  const canSubmit = name.trim().length > 1 && email.includes('@') && password.length >= 6

  async function handleSubmit() {
    if (!canSubmit) return
    setStep('loading')
    setError('')

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name:    name,
            referral_by:  refCode || null,
          }
        }
      })

      if (authErr) throw new Error(authErr.message)

      const userId = authData.user?.id
      if (!userId) throw new Error('Signup failed — please try again.')

      // 2. Create minimal profile — full profile done in dashboard
      await (supabase as any).from('profiles').upsert({
        id:           userId,
        full_name:    name,
        email,
        paid_tier:    'fam',
        referred_by:  refCode || null,
        created_at:   new Date().toISOString(),
      }, { onConflict: 'id' })

      // 3. Save referral code to session for payment tracking
      try { sessionStorage.setItem('z2b_ref', refCode) } catch (_) {}

      setStep('success')

      // 4. Redirect after 1.5s
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(cfg.redirectTo)
        } else {
          window.location.href = cfg.redirectTo + (refCode ? `?ref=${refCode}` : '')
        }
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('error')
    }
  }

  return (
    <>
      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Bebas+Neue&family=Lato:wght@300;400;700&display=swap');

        .z2b-lr-bg {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .z2b-lr-modal {
          background: #0f0d18;
          border: 1px solid rgba(255,255,255,0.1);
          border-top: 3px solid ${cfg.color};
          border-radius: 16px;
          width: 100%; max-width: 460px;
          position: relative;
          max-height: 92vh; overflow-y: auto;
        }
        .z2b-lr-close {
          position: absolute; top: 14px; right: 14px;
          background: none; border: none;
          color: rgba(255,255,255,0.3); font-size: 1.2rem;
          cursor: pointer; transition: color 0.15s; z-index: 2;
        }
        .z2b-lr-close:hover { color: #fff; }

        /* IMAGE HEADER */
        .z2b-lr-head {
          padding: 28px 24px 20px;
          display: flex; gap: 18px; align-items: center;
          background: linear-gradient(135deg, rgba(45,27,105,0.4) 0%, rgba(13,22,41,0.9) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .z2b-lr-img-wrap {
          flex-shrink: 0; width: 80px;
          filter: drop-shadow(0 12px 24px ${cfg.color}40);
        }
        .z2b-lr-img-wrap.floating {
          animation: lrFloat 5s ease-in-out infinite;
        }
        @keyframes lrFloat {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-8px) rotate(1deg); }
        }
        .z2b-lr-eyebrow {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.5rem; letter-spacing: 4px;
          color: ${cfg.color}99; margin-bottom: 4px;
        }
        .z2b-lr-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem; font-weight: 900;
          color: #f5f0e8; line-height: 1.1; margin-bottom: 3px;
        }
        .z2b-lr-title em { font-style: italic; color: ${cfg.color}; }
        .z2b-lr-subtitle {
          font-family: 'Playfair Display', serif;
          font-style: italic; font-size: 0.78rem;
          color: ${cfg.color}80; margin-bottom: 6px;
        }
        .z2b-lr-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem; color: ${cfg.color};
          letter-spacing: 2px;
        }

        /* BODY */
        .z2b-lr-body { padding: 22px 24px; }
        .z2b-lr-benefit {
          font-size: 0.8rem; color: rgba(255,255,255,0.5);
          line-height: 1.7; margin-bottom: 20px;
          padding: 10px 13px; border-radius: 8px;
          background: ${cfg.accentBg};
          border: 1px solid ${cfg.accentBorder};
        }
        .z2b-lr-lbl {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.5rem; letter-spacing: 3px;
          color: rgba(255,255,255,0.3); display: block; margin-bottom: 5px;
        }
        .z2b-lr-inp {
          width: 100%; padding: 11px 13px; margin-bottom: 11px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
          color: #f5f0e8; font-family: 'Lato', sans-serif;
          font-size: 0.88rem; outline: none; transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .z2b-lr-inp:focus { border-color: ${cfg.color}60; }
        .z2b-lr-inp::placeholder { color: rgba(255,255,255,0.2); }
        .z2b-lr-pw-wrap {
          position: relative; margin-bottom: 11px;
        }
        .z2b-lr-pw-wrap .z2b-lr-inp { margin-bottom: 0; padding-right: 44px; }
        .z2b-lr-pw-toggle {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 0.75rem; color: rgba(255,255,255,0.3);
          font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px;
        }
        .z2b-lr-hint {
          font-size: 0.68rem; color: rgba(255,255,255,0.2);
          margin-bottom: 18px; margin-top: 4px;
        }
        .z2b-lr-btn {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 14px 18px;
          background: linear-gradient(135deg, ${cfg.color}, ${cfg.color}CC);
          border: none; border-radius: 8px; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
          box-shadow: 0 6px 20px ${cfg.color}30;
        }
        .z2b-lr-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px ${cfg.color}40;
        }
        .z2b-lr-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .z2b-lr-btn-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.82rem; letter-spacing: 3px; color: #080608;
        }
        .z2b-lr-btn-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem; color: #080608; letter-spacing: 1px;
        }
        .z2b-lr-secure {
          text-align: center; margin-top: 10px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.48rem; letter-spacing: 3px;
          color: rgba(255,255,255,0.18);
        }
        .z2b-lr-divider {
          height: 1px; background: rgba(255,255,255,0.06);
          margin: 16px 0;
        }
        .z2b-lr-login {
          text-align: center; font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
        }
        .z2b-lr-login a {
          color: ${cfg.color}; text-decoration: none; font-weight: 700;
        }

        /* STATES */
        .z2b-lr-loading {
          text-align: center; padding: 32px 0;
        }
        .z2b-lr-spinner {
          width: 36px; height: 36px;
          border: 3px solid ${cfg.color}30;
          border-top-color: ${cfg.color};
          border-radius: 50%;
          animation: lrSpin 0.7s linear infinite;
          margin: 0 auto 14px;
        }
        @keyframes lrSpin { to { transform: rotate(360deg); } }
        .z2b-lr-success { text-align: center; padding: 28px 0; }
        .z2b-lr-success-icon { font-size: 2.8rem; margin-bottom: 12px; }
        .z2b-lr-success-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem; font-weight: 900; color: #f5f0e8; margin-bottom: 6px;
        }
        .z2b-lr-success-title em { font-style: italic; color: ${cfg.color}; }
        .z2b-lr-success-sub {
          font-size: 0.82rem; color: rgba(255,255,255,0.4); line-height: 1.7;
        }
        .z2b-lr-error {
          padding: 10px 13px; border-radius: 8px; margin-bottom: 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          font-size: 0.8rem; color: #fca5a5; line-height: 1.6;
        }
      `}</style>

      {/* ── MODAL ── */}
      <div className="z2b-lr-bg" onClick={e => { if (e.target === e.currentTarget && onClose) onClose() }}>
        <div className="z2b-lr-modal">
          {onClose && <button className="z2b-lr-close" onClick={onClose}>✕</button>}

          {/* IMAGE HEADER */}
          <div className="z2b-lr-head">
            <div className={`z2b-lr-img-wrap${cfg.animate ? ' floating' : ''}`}>
              <img src={cfg.image} alt={cfg.title} style={cfg.imageStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="z2b-lr-eyebrow">{cfg.eyebrow}</div>
              <div className="z2b-lr-title">
                {cfg.titleEm
                  ? <><span>Zero2</span><em>Billionaires</em></>
                  : cfg.title
                }
              </div>
              <div className="z2b-lr-subtitle">{cfg.subtitle}</div>
              <div className="z2b-lr-price">{cfg.price}</div>
            </div>
          </div>

          {/* BODY */}
          <div className="z2b-lr-body">

            {/* LOADING STATE */}
            {step === 'loading' && (
              <div className="z2b-lr-loading">
                <div className="z2b-lr-spinner" />
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'0.7rem', letterSpacing:'3px', color:'rgba(255,255,255,0.4)' }}>
                  CREATING YOUR ACCOUNT...
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
            {step === 'success' && (
              <div className="z2b-lr-success">
                <div className="z2b-lr-success-icon">👑</div>
                <div className="z2b-lr-success-title">
                  <em>Welcome</em> to the Kingdom!
                </div>
                <div className="z2b-lr-success-sub">
                  Account created! Taking you to {variant === 'machine' ? 'the 4M Machine' : variant === 'book' ? 'complete your purchase' : 'the marketplace'}...
                </div>
              </div>
            )}

            {/* FORM STATE */}
            {(step === 'form' || step === 'error') && (
              <>
                <div className="z2b-lr-benefit">✅ {cfg.benefit}</div>

                {step === 'error' && (
                  <div className="z2b-lr-error">⚠️ {error}</div>
                )}

                <label className="z2b-lr-lbl">YOUR NAME</label>
                <input
                  className="z2b-lr-inp"
                  placeholder="Full name"
                  value={name}
                  onChange={e => { setName(e.target.value); if (step==='error') setStep('form') }}
                />

                <label className="z2b-lr-lbl">EMAIL ADDRESS</label>
                <input
                  className="z2b-lr-inp"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (step==='error') setStep('form') }}
                />

                <label className="z2b-lr-lbl">CREATE PASSWORD</label>
                <div className="z2b-lr-pw-wrap">
                  <input
                    className="z2b-lr-inp"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (step==='error') setStep('form') }}
                  />
                  <button className="z2b-lr-pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                <div className="z2b-lr-hint">
                  You'll use this to log into your member dashboard
                </div>

                {refCode && (
                  <div style={{ fontSize:'0.68rem', color:`${cfg.color}60`, marginBottom:14, fontFamily:'Bebas Neue,sans-serif', letterSpacing:'2px' }}>
                    ◆ REFERRED BY {refCode}
                  </div>
                )}

                <button
                  className="z2b-lr-btn"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  <span className="z2b-lr-btn-label">{cfg.ctaLabel}</span>
                  <span className="z2b-lr-btn-price">{cfg.price}</span>
                </button>

                <div className="z2b-lr-secure">
                  🔒 NO BANKING DETAILS REQUIRED · COMPLETE PROFILE LATER IN DASHBOARD
                </div>

                <div className="z2b-lr-divider" />

                <div className="z2b-lr-login">
                  Already a member?{' '}
                  <a href="/login">Sign in to your dashboard →</a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
