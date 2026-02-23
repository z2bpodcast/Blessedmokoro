import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Z2B Table Banquet - Premium Learning Content',
  description: 'Access exclusive video lessons, audio clips, and resources from Z2B Table Banquet',
  manifest: '/manifest.json',
  themeColor: '#6b21a8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Z2B Banquet',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6b21a8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Z2B Banquet" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
