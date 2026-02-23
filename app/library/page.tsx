'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Video, Headphones, FileText, Lock, Play } from 'lucide-react'

type Content = {
  id: string
  title: string
  description: string | null
  type: 'video' | 'audio' | 'pdf'
  file_url: string
  thumbnail_url: string | null
  is_public: boolean
  created_at: string
}

export default function LibraryPage() {
  const [content, setContent] = useState<Content[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'pdf'>('all')
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchContent()
  }, [filter])

  const checkAuthAndFetchContent = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)
    await fetchContent()
  }

  const fetchContent = async () => {
    try {
      let query = supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('type', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setContent(data || [])
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
                <p className="text-sm text-gold-300">Premium Learning Experience</p>
              </div>
            </Link>
            <div className="flex gap-3">
              <Link href="/dashboard" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-primary-800 mb-2">Content Library</h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full mb-2"></div>
          <p className="text-primary-600 font-medium">Browse all available lessons and resources</p>
        </div>

        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          <button onClick={() => setFilter('all')} className={`px-6 py-3 rounded-lg font-bold transition-all ${filter === 'all' ? 'bg-royal-gradient text-white border-4 border-gold-400 shadow-lg' : 'bg-white text-primary-700 hover:bg-primary-50 border-2 border-primary-300'}`}>
            All Content
          </button>
          <button onClick={() => setFilter('video')} className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${filter === 'video' ? 'bg-royal-gradient text-white border-4 border-gold-400 shadow-lg' : 'bg-white text-primary-700 hover:bg-primary-50 border-2 border-primary-300'}`}>
            <Video className="w-4 h-4" />
            Videos
          </button>
          <button onClick={() => setFilter('audio')} className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${filter === 'audio' ? 'bg-royal-gradient text-white border-4 border-gold-400 shadow-lg' : 'bg-white text-primary-700 hover:bg-primary-50 border-2 border-primary-300'}`}>
            <Headphones className="w-4 h-4" />
            Audio
          </button>
          <button onClick={() => setFilter('pdf')} className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${filter === 'pdf' ? 'bg-royal-gradient text-white border-4 border-gold-400 shadow-lg' : 'bg-white text-primary-700 hover:bg-primary-50 border-2 border-primary-300'}`}>
            <FileText className="w-4 h-4" />
            Documents
          </button>
        </div>

        {content.length === 0 ? (
          <div className="card text-center py-12 border-4 border-primary-300">
            <p className="text-primary-700 text-lg font-semibold">No content found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map(item => (
              <Link key={item.id} href={`/content/${item.id}`}>
                <div className="card hover:shadow-2xl transition-all cursor-pointer h-full border-4 border-primary-200 hover:border-gold-400 group">
                  <div className="relative mb-4">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-48 object-cover rounded-lg border-2 border-primary-100" />
                    ) : (
                      <div className="w-full h-48 bg-royal-gradient rounded-lg flex items-center justify-center text-white shadow-lg">
                        {getIcon(item.type)}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-primary-600 to-primary-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 border-2 border-gold-400">
                      {getIcon(item.type)}
                      <span className="capitalize font-semibold">{item.type}</span>
                    </div>
                    {!item.is_public && (
                      <div className="absolute top-2 left-2 bg-gold-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 font-bold shadow-lg">
                        <Lock className="w-3 h-3" />
                        Members
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-primary-800 mb-2 group-hover:text-gold-600 transition-colors">{item.title}</h4>
                  {item.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
