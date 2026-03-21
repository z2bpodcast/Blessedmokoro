import type { Metadata, Viewport } from 'next'
import './globals.css'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export const metadata: Metadata = {
  title: 'Z2B Table Banquet — Welcome to Abundance',
  description: 'Zero2Billionaires — The Entrepreneurial Consumer Platform. Free 18-session workshop, Content Studio+, Type As You Feel and more.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Z2B Table Banquet',
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'Z2B Table Banquet — Welcome to Abundance',
    description: 'The Entrepreneurial Consumer Workshop — 18 free sessions. No credit card required.',
    images: ['/logo.jpg'],
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Z2B" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        {/* Theme */}
        <meta name="theme-color" content="#D4AF37" />
        <meta name="msapplication-TileColor" content="#0D0A1E" />
        {/* Service Worker registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('Z2B SW registered'); })
                .catch(function(err) { console.log('Z2B SW error:', err); });
            });
          }
        `}} />
      </head>
      <body>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
