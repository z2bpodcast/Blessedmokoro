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

type Profile = {
  user_role: string
  full_name: string
  referral_code: string
  is_paid_member: boolean
}

export default function Home() {
  const [publicContent, setPublicContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    checkUser()
    fetchPublicContent()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_role, full_name, referral_code, is_paid_member')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
    }
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

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: string } = {
      'ceo': '👑 CEO',
      'staff': '⚙️ Staff',
      'guest_speaker': '🎤 Guest',
      'paid_member': '💎 Paid',
      'free_member': '🆓 Free',
    }
    return badges[role] || role
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
                <p className="text-sm text-gold-300">Welcome to Abundance</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {user && profile && (
                <div className="text-right mr-2">
                  <p className="text-sm text-white font-semibold">{profile.full_name || 'Legacy Builder'}</p>
                  <p className="text-xs text-gold-300">{getRoleBadge(profile.user_role || '')} • {profile.referral_code}</p>
                </div>
              )}
              {user ? (
                <>
                  {/* Z2B BLUEPRINT — logged in */}
                  <Link
                    href="/blueprint"
                    className="font-semibold py-2 px-5 rounded-lg transition-all border-2 text-white hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1a0a35, #2D1654)', borderColor: 'rgba(167,139,250,0.6)' }}
                  >
                    📐 Z2B Blueprint
                  </Link>
                  {/* WORKSHOP — logged in */}
                  <Link
                    href="/workshop"
                    className="font-semibold py-2 px-5 rounded-lg transition-all border-2 border-yellow-400 text-yellow-900 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
                  >
                    🎓 Workshop
                  </Link>
                  <Link href="/about" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                    About
                  </Link>
                  <Link href="/pricing" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                    Pricing
                  </Link>
                  <Link href="/dashboard" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                    Dashboard
                  </Link>
                  <Link href="/library" className="btn-primary">
                    My Library
                  </Link>
                </>
              ) : (
                <>
                  {/* Z2B BLUEPRINT — logged out */}
                  <Link
                    href="/blueprint"
                    className="font-semibold py-2 px-5 rounded-lg transition-all border-2 text-white hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1a0a35, #2D1654)', borderColor: 'rgba(167,139,250,0.6)' }}
                  >
                    📐 Z2B Blueprint
                  </Link>
                  {/* WORKSHOP — logged out */}
                  <Link
                    href="/workshop"
                    className="font-semibold py-2 px-5 rounded-lg transition-all border-2 border-yellow-400 text-yellow-900 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
                  >
                    🎁 Free Workshop
                  </Link>
                  <Link href="/about" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                    About
                  </Link>
                  <Link href="/pricing" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                    Pricing
                  </Link>
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

      {/* TEEE Hero Section with Banquet Background */}
      <section className="relative overflow-hidden border-b-8 border-primary-600">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 to-transparent z-10"></div>
        <img 
          src="/hero-banquet.png" 
          alt="Z2B Table Banquet" 
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-4 bg-black/40 backdrop-blur-sm py-12 rounded-2xl border-4 border-gold-400 max-w-4xl mx-4">
            <h2 className="text-7xl md:text-8xl font-bold text-white mb-3 drop-shadow-2xl uppercase">
              TEEE
            </h2>
            <p className="text-sm md:text-base text-gold-200 mb-8 tracking-widest drop-shadow-lg">
              Transformation · Education · Empowerment · Enrichment
            </p>
            <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
              Transform from employee to entrepreneurial consumer by flipping everyday expenses into income-generating assets within a powerful wealth-building ecosystem.
            </p>
            {!user && (
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/signup" className="inline-block btn-primary text-lg px-10 py-4 text-xl shadow-2xl">
                  Start Building
                </Link>
                <Link
                  href="/blueprint"
                  className="inline-block font-bold text-lg px-10 py-4 rounded-lg border-2 text-white hover:opacity-90 shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #1a0a35, #2D1654)', borderColor: 'rgba(167,139,250,0.7)' }}
                >
                  📐 See The Blueprint
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STORY SECTION: Speaking to employees and consumers ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-4">
          <span className="inline-block bg-primary-100 text-primary-700 font-bold text-sm px-5 py-2 rounded-full border-2 border-primary-300 tracking-widest uppercase">
            This is for you
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-primary-800 mb-8 leading-tight">
          You go to work every day.<br />
          <span className="text-gold-600">But who is your money working for?</span>
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Every month you earn. Every month you spend. You pay rent, buy groceries, subscribe to services, fill up the car — and by the end of the month, the cycle resets. You work hard. But the wealth seems to flow <em>away</em> from you, not <em>toward</em> you.
        </p>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          You are not alone. Millions of employees and consumers live this exact reality. Not because they are lazy. Not because they lack talent. But because <strong className="text-primary-700">nobody ever taught them that their spending could become their greatest asset.</strong>
        </p>
        <p className="text-xl text-gray-700 leading-relaxed mb-10">
          That changes today. Welcome to Z2B Table Banquet — where ordinary people discover extraordinary paths to abundance.
        </p>
        <div className="w-24 h-1 bg-gold-400 mx-auto rounded-full mb-4"></div>
        <p className="text-lg text-primary-600 italic font-semibold">
          "You don't need to quit your job. You need to change your relationship with money."
        </p>
        <p className="text-sm text-primary-400 mt-2 tracking-widest uppercase">— Rev Mokoro Manana, Founder Z2B</p>
      </section>

      {/* ── THE PROBLEM: Mirror moment ── */}
      <section className="bg-primary-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">Does This Sound Familiar?</h2>
            <p className="text-gold-200 text-lg max-w-2xl mx-auto">Most employees and consumers live with these silent frustrations every single day.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '💸', title: 'Salary Disappears', text: 'You earn a good income but somehow there is never enough left at the end of the month. The money comes in — and immediately flows out.' },
              { icon: '⏰', title: 'Trading Time for Money', text: 'If you stop working, the income stops too. You have a job, not freedom. And deep down, you know there must be another way.' },
              { icon: '🏪', title: 'You Buy, They Build', text: 'Every time you spend, you make someone else wealthier. You are the customer that built their empire — but you saw none of the returns.' },
              { icon: '😔', title: 'Dreams on Pause', text: 'The business idea, the investment, the better life — always next year. Always when things settle down. Always waiting for the right moment.' },
              { icon: '🔄', title: 'The Same Cycle', text: 'January looks exactly like December. Earn, spend, survive, repeat. The hamster wheel keeps spinning but you never seem to get ahead.' },
              { icon: '❓', title: 'No One Showed You', text: 'School taught you to be a good employee. Nobody ever taught you how to become a builder. That gap is not your fault — but it is your responsibility to close it.' },
            ].map((item, i) => (
              <div key={i} className="bg-primary-800 border-2 border-primary-600 rounded-xl p-6 hover:border-gold-400 transition-colors">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-primary-200 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE SHIFT: Introducing the concept ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-6">
          <span className="inline-block bg-gold-100 text-gold-700 font-bold text-sm px-5 py-2 rounded-full border-2 border-gold-400 tracking-widest uppercase">
            The Big Shift
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-primary-800 mb-8 leading-tight">
          What if your monthly expenses<br />
          <span className="text-gold-600">could build your legacy instead?</span>
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          There is a growing movement of people who have made a powerful decision. They chose to become <strong className="text-primary-700">Entrepreneurial Consumers</strong> — people who do not just spend money, but redirect it. People who do not just work jobs, but build systems. People who do not just dream of abundance — they architect it.
        </p>
        <p className="text-xl text-gray-700 leading-relaxed mb-10">
          This is not about getting rich quick. This is not about abandoning your career. This is about upgrading your relationship with money, community, and purpose — one intentional decision at a time.
        </p>
        <div className="bg-primary-50 border-4 border-primary-200 rounded-2xl p-8 mb-10">
          <p className="text-2xl font-bold text-primary-800 leading-relaxed">
            "An entrepreneurial consumer does not just buy products.<br className="hidden md:block" />
            They build <span className="text-gold-600">networks, income, and legacy</span> — from the same money they were already spending."
          </p>
        </div>
      </section>

      {/* ── BLUEPRINT INTRO: 4 legs in a nutshell ── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #ffffff 50%, #fefce8 100%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-primary-100 text-primary-700 font-bold text-sm px-5 py-2 rounded-full border-2 border-primary-300 tracking-widest uppercase mb-4">
              The Foundation
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-800 mb-4">The Z2B Table Blueprint</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Just like a table needs four legs to stand strong — true wealth stands on four unshakeable pillars. Remove any one leg and the table collapses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              { number: '1️⃣', emoji: '🧠', title: 'Mindset', color: 'border-purple-400 bg-purple-50', titleColor: 'text-purple-800', text: 'Your beliefs about money determine your outcomes. Before you can build wealth, you must upgrade how you think about it. The journey from Zero to Billionaire thinking begins in the mind — not the wallet.' },
              { number: '2️⃣', emoji: '⚙️', title: 'Systems', color: 'border-blue-400 bg-blue-50', titleColor: 'text-blue-800', text: 'Wealthy people build structures that generate income whether they are sleeping or working. Online businesses, automated funnels, digital platforms — systems work for you long after you stop working for them.' },
              { number: '3️⃣', emoji: '🤝', title: 'Relationships', color: 'border-green-400 bg-green-50', titleColor: 'text-green-800', text: 'No billionaire builds alone. Your network is your net worth. The right community, partnerships, and mentors multiply your progress faster than any strategy you could execute on your own.' },
              { number: '4️⃣', emoji: '🌍', title: 'Legacy', color: 'border-amber-400 bg-amber-50', titleColor: 'text-amber-800', text: 'The ultimate purpose of wealth is impact that outlives you. Legacy thinking changes how you act today — not because you are rich yet, but because you are building something that will matter long after you are gone.' },
            ].map((leg, i) => (
              <div key={i} className={`rounded-2xl p-8 border-4 ${leg.color} hover:shadow-xl transition-shadow`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{leg.emoji}</span>
                  <div>
                    <div className="text-sm font-bold text-gray-500 tracking-widest uppercase">Pillar {leg.number}</div>
                    <h3 className={`text-2xl font-bold ${leg.titleColor}`}>{leg.title}</h3>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-base">{leg.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center bg-primary-800 rounded-2xl p-10 border-4 border-gold-400">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Mindset + Systems + Relationships + Legacy
            </h3>
            <p className="text-gold-200 text-xl mb-2">= <strong className="text-gold-300">The Billionaire Table</strong></p>
            <p className="text-primary-300 text-base mt-4 max-w-xl mx-auto leading-relaxed">
              This is not a theory. This is a lived blueprint, tested by real people who started exactly where you are — as employees and consumers — and built their seat at the table.
            </p>
          </div>
        </div>
      </section>

      {/* ── WELCOME TO ABUNDANCE ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-6">
            <span className="text-5xl">❤️</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-800 mb-6 leading-tight">
            Welcome to Abundance
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Abundance is not just financial. It is the freedom to choose how you spend your time. It is the joy of building something that matters. It is the peace of knowing your family's future is secure. It is the fulfilment of leaving the world better than you found it.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed mb-10">
            At Z2B Table Banquet, you are not just joining a platform. You are pulling up a chair at a table where employees become entrepreneurs, consumers become builders, and ordinary people create extraordinary legacies.
          </p>
          <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-2xl p-10 border-4 border-gold-400 shadow-2xl mb-10">
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-4">
              "The seeds you plant in private<br />
              determine the harvest you reap in public."
            </p>
            <p className="text-gold-300 font-bold tracking-widest uppercase text-sm">— Rev Mokoro Manana</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/workshop"
              className="font-bold text-lg px-10 py-4 rounded-xl border-4 border-yellow-400 text-yellow-900 hover:scale-105 transition-all shadow-xl"
              style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
            >
              🎁 Start Free Workshop — 9 Sections, No Login Needed
            </Link>
            {!user && (
              <Link href="/signup" className="btn-primary text-lg px-10 py-4 shadow-xl">
                Pull Up Your Chair →
              </Link>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-6">
            No credit card. No pressure. Just the beginning of your transformation.
          </p>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section className="bg-primary-50 border-y-4 border-primary-200 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '90', label: 'Workshop Sections', sub: 'Step-by-step transformation' },
              { number: '4', label: 'Blueprint Pillars', sub: 'Mindset · Systems · Relationships · Legacy' },
              { number: '9', label: 'Free Sections', sub: 'No registration required' },
              { number: '∞', label: 'Your Potential', sub: 'Zero to Billionaire thinking' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-5xl font-bold text-primary-700 mb-1">{stat.number}</div>
                <div className="font-bold text-primary-800 text-sm mb-1">{stat.label}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{stat.sub}</div>
              </div>
            ))}
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