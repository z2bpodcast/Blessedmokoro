'use client'

// FILE LOCATION: components/PWAInstallPrompt.tsx
// Shows a beautiful install banner when the app is installable
// Add to app/layout.tsx or any page

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [installable, setInstallable] = useState(false)
  const [prompt, setPrompt]           = useState<any>(null)
  const [dismissed, setDismissed]     = useState(false)
  const [installed, setInstalled]     = useState(false)
  const [isIOS, setIsIOS]             = useState(false)
  const [showIOS, setShowIOS]         = useState(false)

  useEffect(() => {
    // Check if already dismissed
    try {
      if (localStorage.getItem('z2b_pwa_dismissed')) { setDismissed(true); return }
    } catch(e) {}

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true); return
    }

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const safari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)
    if (ios && safari) {
      setIsIOS(true)
      // Show iOS instructions after 3 seconds
      setTimeout(() => setShowIOS(true), 3000)
      return
    }

    // Android/Desktop — listen for beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
      setInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setInstallable(false)
    })

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
    try { localStorage.setItem('z2b_pwa_dismissed', '1') } catch(e) {}
  }

  // Nothing to show
  if (dismissed || installed || (!installable && !showIOS)) return null

  const banner: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    width: 'min(380px, 92vw)',
    background: 'linear-gradient(135deg, #1A0035, #0D0A1E)',
    border: '1.5px solid rgba(212,175,55,0.45)',
    borderRadius: '18px',
    padding: '18px 20px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    fontFamily: 'Georgia, serif',
    color: '#F5F3FF',
  }

  // iOS instructions
  if (isIOS && showIOS) {
    return (
      <div style={banner}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <img src="/logo.jpg" alt="Z2B" style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1.5px solid #D4AF37', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#D4AF37', marginBottom: '4px' }}>
              Add Z2B to your Home Screen
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              Tap <strong style={{ color: '#fff' }}>Share</strong> <span style={{ fontSize: '14px' }}>⬆️</span> then <strong style={{ color: '#fff' }}>"Add to Home Screen"</strong> to install Z2B as an app on your iPhone.
            </div>
          </div>
          <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 0 4px 4px', flexShrink: 0 }}>×</button>
        </div>
        {/* Arrow pointing to Safari share button */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'rgba(212,175,55,0.5)' }}>
          ↓ Safari share button is at the bottom of your screen
        </div>
      </div>
    )
  }

  // Android / Desktop install prompt
  if (installable) {
    return (
      <div style={banner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <img src="/logo.jpg" alt="Z2B" style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1.5px solid #D4AF37', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#D4AF37' }}>Install Z2B Table Banquet</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>Add to your home screen — works offline</div>
          </div>
          <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={handleInstall} style={{ padding: '11px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
            📲 Install App
          </button>
          <button onClick={handleDismiss} style={{ padding: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
            Not now
          </button>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
          {['Workshop', 'Type As You Feel', 'Dashboard'].map(f => (
            <span key={f} style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)' }}>✓ {f}</span>
          ))}
        </div>
      </div>
    )
  }

  return null
}
