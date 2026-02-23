'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Share2, Lock, Facebook, Twitter, Linkedin, Copy, CheckCircle } from 'lucide-react'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

type Content = {
  id: string
  title: string
  description: string | null
  type: 'video' | 'audio' | 'pdf'
  file_url: string
  is_public: boolean
  created_at: string
}

export default function ContentPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<Content | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchContent()
  }, [params.id])

  const checkAuthAndFetchContent = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
    }

    await fetchContent()
  }

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      // Check if user has access
      if (!data.is_public && !user) {
        router.push('/login')
        return
      }

      setContent(data)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getShareUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    if (profile?.referral_code) {
      return `${baseUrl}/content/${params.id}?ref=${profile.referral_code}`
    }
    return `${baseUrl}/content/${params.id}`
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnSocial = (platform: string) => {
    const url = getShareUrl()
    const text = content ? `Check out: ${content.title}` : 'Check out this content'
    
    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content not found</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary-600">Z2B TABLE BANQUET</h1>
            </Link>
            <div className="flex gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-secondary">
                    Dashboard
                  </Link>
                  <Link href="/library" className="btn-primary">
                    Library
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Content Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
            {!content.is_public && (
              <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Members Only
              </span>
            )}
          </div>
          {content.description && (
            <p className="text-gray-600">{content.description}</p>
          )}
        </div>

        {/* Media Player */}
        <div className="card mb-6">
          {content.type === 'pdf' ? (
            <div className="text-center py-12">
              <a
                href={content.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block"
              >
                Open PDF Document
              </a>
            </div>
          ) : (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                url={content.file_url}
                controls
                width="100%"
                height="100%"
                config={{
                  file: {
                    attributes: {
                      crossOrigin: 'anonymous',
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Share Section - Only for public content or logged-in members */}
        {(content.is_public || user) && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share This Content
            </h3>
            
            {user && profile && (
              <div className="mb-4 p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-900 mb-2">
                  <strong>Share with your referral link to get credit!</strong>
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={getShareUrl()}
                    readOnly
                    className="input-field flex-1 bg-white text-sm"
                  />
                  <button
                    onClick={copyShareLink}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => shareOnSocial('facebook')}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </button>
              <button
                onClick={() => shareOnSocial('twitter')}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 bg-sky-500 text-white hover:bg-sky-600"
              >
                <Twitter className="w-5 h-5" />
                Twitter
              </button>
              <button
                onClick={() => shareOnSocial('linkedin')}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 bg-blue-700 text-white hover:bg-blue-800"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </button>
            </div>

            {!user && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  <Link href="/signup" className="text-primary-600 font-semibold hover:text-primary-700">
                    Sign up
                  </Link>
                  {' '}to get your own referral link and track who you bring in!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
