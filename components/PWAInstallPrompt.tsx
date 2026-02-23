'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-dismissed')
      if (!dismissed) {
        // Show prompt after 10 seconds
        setTimeout(() => setShowPrompt(true), 10000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA installed')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  if (isInstalled || !showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
      <div className="bg-royal-gradient rounded-2xl shadow-2xl p-6 border-4 border-gold-400">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white hover:text-gold-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-4">
          <img 
            src="/logo.jpg" 
            alt="Z2B Logo" 
            className="w-16 h-16 rounded-xl border-2 border-gold-400 shadow-lg flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">
              Install Z2B Table Banquet
            </h3>
            <p className="text-gold-200 text-sm mb-4">
              Add to your home screen for quick access and offline viewing!
            </p>
            <button
              onClick={handleInstall}
              className="w-full bg-white text-primary-700 hover:bg-gold-50 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border-2 border-gold-400"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
