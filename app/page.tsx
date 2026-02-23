'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Play, Lock, FileText, Headphones, Video } from 'lucide-react'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

type Content = {
  id: string
  title: string
  description: string | null
  type: 'video' | 'audio' | 'pdf'
  file_url: string
  thumbnail_url: string | null
  is_public: boolean
  created_at: string
  duration: number | null
}

export default function Home() {
  const [publicContent, setPublicContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
    fetchPublicContent()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchPublicContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPublicContent(data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-6 h-6" />
      case 'audio':
        return <Headphones className="w-6 h-6" />
      case 'pdf':
        return <FileText className="w-6 h-6" />
      default:
        return <Play className="w-6 h-6" />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <PWAInstallPrompt />
      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
                <p className="text-sm text-gold-300">Premium Learning Experience</p>
              </div>
            </div>
            <div className="flex gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                    Dashboard
                  </Link>
                  <Link href="/library" className="btn-primary">
                    My Library
                  </Link>
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

      {/* Hero Section with Banquet Image */}
      <section className="relative overflow-hidden border-b-8 border-primary-600">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 to-transparent z-10"></div>
        <img 
          src="/hero-banquet.png" 
          alt="Z2B Table Banquet" 
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-4 bg-black/40 backdrop-blur-sm py-12 rounded-2xl border-4 border-gold-400 max-w-4xl mx-4">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              Transform Your Knowledge
            </h2>
            <p className="text-xl md:text-2xl text-gold-200 mb-8 max-w-2xl mx-auto drop-shadow-lg">
              Join the royal table of wisdom. Access premium video lessons, audio insights, 
              and exclusive resources designed to elevate your journey.
            </p>
            {!user && (
              <Link href="/signup" className="inline-block btn-primary text-lg px-10 py-4 text-xl shadow-2xl">
                Join the Banquet
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Public Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-primary-800 mb-2">Featured Content</h3>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse border-4 border-primary-200">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : publicContent.length === 0 ? (
          <div className="card text-center py-12 border-4 border-primary-300">
            <p className="text-primary-700 text-lg font-medium">No public content available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicContent.map(content => (
              <Link key={content.id} href={`/content/${content.id}`}>
                <div className="card hover:shadow-2xl transition-all cursor-pointer h-full border-4 border-primary-200 hover:border-gold-400 group">
                  <div className="relative mb-4">
                    {content.thumbnail_url ? (
                      <img 
                        src={content.thumbnail_url} 
                        alt={content.title}
                        className="w-full h-48 object-cover rounded-lg border-2 border-primary-100 group-hover:border-gold-300 transition-all"
                      />
                    ) : (
                      <div className="w-full h-48 bg-royal-gradient rounded-lg flex items-center justify-center text-white shadow-lg">
                        {getIcon(content.type)}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-primary-600 to-primary-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 border-2 border-gold-400 shadow-lg">
                      {getIcon(content.type)}
                      <span className="capitalize font-semibold">{content.type}</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-primary-800 mb-2 group-hover:text-gold-600 transition-colors">{content.title}</h4>
                  {content.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{content.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Members Only Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-royal-gradient rounded-2xl p-12 text-white text-center border-8 border-gold-400 shadow-2xl">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gold-300" />
          <h3 className="text-4xl font-bold mb-4">Unlock Premium Content</h3>
          <p className="text-xl mb-8 text-gold-100">
            Get access to exclusive video lessons, audio masterclasses, and downloadable resources at the royal table
          </p>
          {!user && (
            <Link href="/signup" className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-lg hover:bg-gold-50 transition-colors text-lg border-4 border-gold-400 shadow-xl">
              Become a Member
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-8 mt-16 border-t-8 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Z2B Logo" className="h-12 w-12 rounded-lg border-2 border-gold-400" />
            <span className="text-2xl font-bold text-gold-300">Z2B TABLE BANQUET</span>
          </div>
          <p className="text-gold-200">&copy; 2026 Z2B Table Banquet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
