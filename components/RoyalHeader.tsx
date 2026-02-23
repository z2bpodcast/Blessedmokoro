'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'

type HeaderProps = {
  user?: any
  profile?: any
  showAdmin?: boolean
  onLogout?: () => void
}

export default function RoyalHeader({ user, profile, showAdmin = false, onLogout }: HeaderProps) {
  return (
    <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
            <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
            <div>
              <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
              <p className="text-sm text-gold-300">Premium Learning Experience</p>
            </div>
          </Link>
          <div className="flex gap-3 items-center">
            {user ? (
              <>
                <Link href="/library" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                  Library
                </Link>
                <Link href="/dashboard" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                  Dashboard
                </Link>
                {showAdmin && profile?.is_admin && (
                  <Link href="/admin" className="btn-primary">
                    Admin
                  </Link>
                )}
                {onLogout && (
                  <button onClick={onLogout} className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                  Sign In
                </Link>
                <Link href="/signup" className="btn-primary">
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
