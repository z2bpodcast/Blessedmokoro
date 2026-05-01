'use client'
// FILE: components/PWAInstallPrompt.tsx
// Smart PWA install banner — detects hostname and shows correct app name + logo

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [installable, setInstallable] = useState(false)
  const [prompt,      setPrompt]      = useState<any>(null)
  const [dismissed,   setDismissed]   = useState(false)
  const [installed,   setInstalled]   = useState(false)
  const [isIOS,       setIsIOS]       = useState(false)
  const [showIOS,     setShowIOS]     = useState(false)
  const [isMarket,    setIsMarket]    = useState(false)

  useEffect(() => {
    // Detect which subdomain we are on
    const host = window.location.hostname
    setIsMarket(host.startsWith('marketplace.'))

    try {
      const key = host.startsWith('marketplace.') ? 'z2b_market_pwa_dismissed' : 'z2b_pwa_dismissed'
      if (localStorage.getItem(key)) { setDismissed(true); return }
    } catch(e) {}

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true); return
    }

    const ios    = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const safari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)
    if (ios && safari) {
      setIsIOS(true)
      setTimeout(() => setShowIOS(true), 3000)
      return
    }

    const handler = (e: any) => { e.preventDefault(); setPrompt(e); setInstallable(true) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallable(false) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallable(false)
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShowIOS(false)
    try {
      const key = isMarket ? 'z2b_market_pwa_dismissed' : 'z2b_pwa_dismissed'
      localStorage.setItem(key, '1')
    } catch(e) {}
  }

  if (dismissed || installed || (!installable && !showIOS)) return null

  // ── Branding based on subdomain ───────────────────────────────
  const logo        = isMarket ? '/logo-marketplace.png' : '/logo-z2b.png'
  const appName     = isMarket ? 'Z2B Marketplace'       : 'Z2B Legacy Builders'
  const appDesc     = isMarket
    ? 'Shop digital products · Earn 20% as affiliate · No membership needed'
    : 'Deploy yourself · AI tools · 9 income streams · Build digital products'
  const btnColor    = isMarket
    ? 'linear-gradient(135deg,#06B6D4,#0891B2)'
    : 'linear-gradient(135deg,#B8860B,#D4AF37)'
  const borderColor = isMarket ? 'rgba(6,182,212,0.45)' : 'rgba(212,175,55,0.45)'
  const accentColor = isMarket ? '#06B6D4' : '#D4AF37'
  const features    = isMarket
    ? ['Browse Products', 'Affiliate Links', 'Earn 20%']
    : ['4M Machine', 'Coach Manlaw', 'Marketplace']

  const banner: React.CSSProperties = {
    position: 'fixed', bottom: '20px', left: '50%',
    transform: 'translateX(-50%)', zIndex: 9999,
    width: 'min(400px, 94vw)',
    background: 'linear-gradient(135deg,#0D0820,#050A18)',
    border: '1.5px solid ' + borderColor,
    borderRadius: '20px', padding: '18px 20px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
    fontFamily: 'Georgia,serif', color: '#F0F9FF',
  }

  // ── iOS ───────────────────────────────────────────────────────
  if (isIOS && showIOS) {
    return (
      <div style={banner}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
          <img src={logo} alt={appName}
            style={{ width:'52px', height:'52px', borderRadius:'14px',
              border:'1.5px solid ' + borderColor, flexShrink:0, objectFit:'contain',
              background:'rgba(255,255,255,0.04)' }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'13px', fontWeight:700, color:accentColor, marginBottom:'3px' }}>
              Add {appName} to Home Screen
            </div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>
              Tap <strong style={{ color:'#fff' }}>Share</strong> ⬆️ then{' '}
              <strong style={{ color:'#fff' }}>"Add to Home Screen"</strong> to install as an app.
            </div>
          </div>
          <button onClick={handleDismiss}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)',
              cursor:'pointer', fontSize:'20px', lineHeight:1, padding:'0 0 4px 4px', flexShrink:0 }}>
            ×
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:'10px', fontSize:'10px', color:'rgba(255,255,255,0.25)' }}>
          ↓ Safari share button is at the bottom of your screen
        </div>
      </div>
    )
  }

  // ── Android / Desktop ─────────────────────────────────────────
  if (installable) {
    return (
      <div style={banner}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'14px' }}>
          <img src={logo} alt={appName}
            style={{ width:'56px', height:'56px', borderRadius:'16px',
              border:'1.5px solid ' + borderColor, flexShrink:0, objectFit:'contain',
              background:'rgba(255,255,255,0.04)' }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'15px', fontWeight:700, color:accentColor,
              fontFamily:'Cinzel,Georgia,serif', lineHeight:1.3 }}>
              {appName}
            </div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginTop:'3px', lineHeight:1.5 }}>
              {appDesc}
            </div>
          </div>
          <button onClick={handleDismiss}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)',
              cursor:'pointer', fontSize:'22px', lineHeight:1, flexShrink:0 }}>
            ×
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
          <button onClick={handleInstall}
            style={{ padding:'12px', background:btnColor, border:'none',
              borderRadius:'12px', color: isMarket ? '#fff' : '#000',
              fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
            📲 Install App
          </button>
          <button onClick={handleDismiss}
            style={{ padding:'12px', background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px',
              color:'rgba(255,255,255,0.45)', fontWeight:700, fontSize:'13px',
              cursor:'pointer', fontFamily:'Georgia,serif' }}>
            Not now
          </button>
        </div>

        <div style={{ display:'flex', justifyContent:'center', gap:'14px' }}>
          {features.map(f => (
            <span key={f} style={{ fontSize:'10px', color: accentColor + '80' }}>✦ {f}</span>
          ))}
        </div>
      </div>
    )
  }

  return null
}
