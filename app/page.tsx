"use client"
// v2026-03-26 20:06 — JSX fix
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
  const [menuOpen, setMenuOpen]   = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeArticle, setActiveArticle] = useState<string | null>(null)

  // Close menu on outside click or route change
  useEffect(() => {
    const close = () => setMenuOpen(false)
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
    return () => document.removeEventListener('keydown', close)
  }, [])

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
            {/* ── CLEAN NAV: 3 buttons + hamburger ── */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>

              {user && profile ? (
                /* ── LOGGED IN: Dashboard + Workshop + Menu ── */
                <>
                  <Link href="/dashboard"
                    style={{ padding:'9px 18px', background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                    Dashboard
                  </Link>
                  <Link href="/meet-coach-manlaw"
                    style={{ padding:'9px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'10px', color:'#F5D060', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                    🎯 Coach Manlaw
                  </Link>
                  <Link href="/workshop"
                    style={{ padding:'9px 18px', background:'linear-gradient(135deg,#B8860B,#D4AF37)', border:'none', borderRadius:'10px', color:'#000', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                    🎓 Workshop
                  </Link>
                </>
              ) : (
                /* ── LOGGED OUT: 3 clean buttons ── */
                <>
                  <Link href="/login"
                    style={{ padding:'9px 18px', background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                    Sign In
                  </Link>
                  <Link href="/workshop"
                    style={{ padding:'9px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid rgba(212,175,55,0.5)', borderRadius:'10px', color:'#F5D060', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                    🎁 Free Workshop
                  </Link>
                </>
              )}

              {/* ── HAMBURGER MENU ── */}
              <div style={{ position:'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ width:'42px', height:'42px', background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:'10px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'5px', cursor:'pointer', padding:'0' }}
                  aria-label="Menu"
                >
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:'18px', height:'2px', background:'#fff', borderRadius:'1px', transition:'all 0.2s', transform: menuOpen && i===0?'rotate(45deg) translate(5px,5px)':menuOpen && i===1?'scaleX(0)':menuOpen && i===2?'rotate(-45deg) translate(5px,-5px)':'none' }} />
                  ))}
                </button>

                {menuOpen && (
                  <>
                    {/* Backdrop */}
                    <div onClick={() => setMenuOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
                    {/* Dropdown */}
                    <div style={{ position:'absolute', top:'48px', right:0, width:'260px', background:'linear-gradient(160deg,#0D0A1E,#1E1B4B)', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'16px', padding:'8px', zIndex:50, boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>

                      {/* Section: Explore */}
                      <div style={{ padding:'6px 12px 4px', fontSize:'9px', fontWeight:700, color:'rgba(212,175,55,0.5)', letterSpacing:'2px' }}>EXPLORE</div>
                      {[
                        { href:'/opportunity',          icon:'💼', label:'Digital Presentation' },
                        { href:'/pricing',              icon:'💎', label:'Membership & Pricing' },
                        { href:'/open-table/schedule',  icon:'🍽️', label:'Open Table' },
                        { href:'/type-as-you-feel',     icon:'✍️', label:'Type As You Feel' },
                        { href:'/marketplace',          icon:'🏪', label:'Marketplace' },
                        { href:'/founders-wall',        icon:'🏛️', label:'Founders Wall' },
                        { href:'/echo-wall',            icon:'📣', label:'Echo Wall' },
                        { href:'/blueprint',            icon:'📐', label:'Z2B Blueprint' },
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                          style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px', color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:'13px', fontFamily:'Georgia,serif', transition:'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background='rgba(212,175,55,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                        >
                          <span style={{ fontSize:'16px' }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}

                      {user && (
                        <>
                          <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', margin:'6px 0', padding:'6px 12px 4px', fontSize:'9px', fontWeight:700, color:'rgba(196,181,253,0.5)', letterSpacing:'2px' }}>MY ACCOUNT</div>
                          {[
                            { href:'/meet-coach-manlaw', icon:'🎯', label:'Coach Manlaw' },
                            { href:'/dashboard',         icon:'📊', label:'Dashboard' },
                            { href:'/my-funnel',         icon:'🎯', label:'My Funnel' },
                            { href:'/my-journey',        icon:'⏳', label:'My Journey' },
                            { href:'/leaderboard',       icon:'🏆', label:'Leaderboard' },
                            { href:'/builders-table',    icon:'👥', label:'Builders Table' },
                            { href:'/legacy-vault',      icon:'🔐', label:'Legacy Vault' },
                            { href:'/ceo-letters',       icon:'📜', label:'CEO Letters' },
                          ].map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px', color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:'13px', fontFamily:'Georgia,serif', transition:'background 0.15s' }}
                              onMouseEnter={e => (e.currentTarget.style.background='rgba(124,58,237,0.1)')}
                              onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                            >
                              <span style={{ fontSize:'16px' }}>{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
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
              <>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/signup" className="inline-block btn-primary text-lg px-10 py-4 text-xl shadow-2xl">
                    Start Building
                  </Link>
                  <Link
                    href="/invite"
                    className="inline-block font-bold text-lg px-10 py-4 rounded-lg border-2 text-white hover:opacity-90 shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #2D1B69, #4C1D95)', borderColor: 'rgba(212,175,55,0.7)' }}
                  >
                    🌟 You are Invited
                  </Link>
                </div>
                {/* 4M AI Income Machine CTA — for guests */}
                <div className="mt-4 flex justify-center">
                  <Link
                    href="/ai-income/landing"
                    className="inline-flex items-center gap-2 font-bold px-8 py-3 rounded-full text-sm border-2 hover:opacity-90 shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#B8860B,#D4AF37)', borderColor: 'rgba(212,175,55,0.5)', color: '#1E1245' }}
                  >
                    🤖 Start Earning with AI — 4M Money Machine
                  </Link>
                </div>
              </>
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
              🎁 Start Free Workshop — 99 Sections, No Login Needed
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

      {/* ── FEATURED CONTENT ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-primary-800 mb-2">Featured Content</h3>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
          <p className="text-gray-500 text-sm mt-3">Free to read. Share what moves you.</p>
        </div>

        {/* Hardcoded featured articles — always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* Article 1 — The Third Path */}
          <div onClick={() => setActiveArticle('third-path')}
            className="card hover:shadow-2xl transition-all cursor-pointer h-full border-4 border-primary-200 hover:border-gold-400 group">
            <div className="relative mb-4">
              <div className="w-full h-48 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#4c1d95 50%,#1e3a8a 100%)' }}>
                <div className="text-center px-6">
                  <div className="text-5xl mb-3">🔱</div>
                  <p className="font-black text-yellow-400 text-sm">THE 3rd ALTERNATIVE</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-gradient-to-r from-primary-600 to-primary-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 border-2 border-gold-400 shadow-lg">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">Article</span>
              </div>
              <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-black" style={{ background:'#D4AF37', color:'#1A0A00' }}>FREE</div>
            </div>
            <h4 className="text-xl font-bold text-primary-800 mb-2 group-hover:text-gold-600 transition-colors">
              The Third Path: From Employee to Entrepreneurial Consumer
            </h4>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              Society gives you two options: stay employed (safe but stuck) or start a business (free but risky). There is a third, smarter path — and most people have never heard of it.
            </p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-purple-600 text-xs font-black">Click to read preview →</span>
            </div>
          </div>

          {/* Article 2 — The Mindset Gap */}
          <div onClick={() => setActiveArticle('mindset-gap')}
            className="card hover:shadow-2xl transition-all cursor-pointer h-full border-4 border-primary-200 hover:border-gold-400 group">
            <div className="relative mb-4">
              <div className="w-full h-48 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#065F46 0%,#047857 50%,#1e1b4b 100%)' }}>
                <div className="text-center px-6">
                  <div className="text-5xl mb-3">🧠</div>
                  <p className="font-black text-yellow-400 text-sm">THE MINDSET GAP</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-gradient-to-r from-primary-600 to-primary-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 border-2 border-gold-400 shadow-lg">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">Article</span>
              </div>
              <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-black" style={{ background:'#D4AF37', color:'#1A0A00' }}>FREE</div>
            </div>
            <h4 className="text-xl font-bold text-primary-800 mb-2 group-hover:text-gold-600 transition-colors">
              The Employee Mindset vs The Entrepreneur Mindset
            </h4>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              The biggest gap between where you are and where you want to be is not money. It is not time. It is how you think. This is the mindset shift that changes everything.
            </p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-purple-600 text-xs font-black">Click to read preview →</span>
            </div>
          </div>

          {/* Article 3 — Purple Cow */}
          <div onClick={() => setActiveArticle('purple-cow')}
            className="card hover:shadow-2xl transition-all cursor-pointer h-full border-4 border-primary-200 hover:border-gold-400 group">
            <div className="relative mb-4">
              <div className="w-full h-48 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#78350f 0%,#92400e 50%,#1e1b4b 100%)' }}>
                <div className="text-center px-6">
                  <div className="text-5xl mb-3">🐄</div>
                  <p className="font-black text-yellow-400 text-sm">THE PURPLE COW</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-gradient-to-r from-primary-600 to-primary-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 border-2 border-gold-400 shadow-lg">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">Article</span>
              </div>
              <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-black" style={{ background:'#D4AF37', color:'#1A0A00' }}>FREE</div>
            </div>
            <h4 className="text-xl font-bold text-primary-800 mb-2 group-hover:text-gold-600 transition-colors">
              The Purple Cow: Why Sharing What Moves You Is Your Greatest Sales Tool
            </h4>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              You are not a salesperson. You are a student who discovered something remarkable. And when you see a purple cow — you cannot help but tell people about it.
            </p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-purple-600 text-xs font-black">Click to read preview →</span>
            </div>
          </div>

        </div>

        {/* Dynamic content from Supabase (if any) */}
        {!loading && publicContent.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicContent.map(content => (
              <Link key={content.id} href={`/content/${content.id}`}>
                <div className="card hover:shadow-2xl transition-all cursor-pointer h-full border-4 border-primary-200 hover:border-gold-400 group">
                  <div className="relative mb-4">
                    {content.thumbnail_url ? (
                      <img src={content.thumbnail_url} alt={content.title}
                        className="w-full h-48 object-cover rounded-lg border-2 border-primary-100 group-hover:border-gold-300 transition-all"/>
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

      {/* ── ARTICLE MODAL ── */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setActiveArticle(null) }}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#0A0015,#1A0035)' }}>

            {/* Modal close */}
            <button onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center font-black text-white hover:scale-110 transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              ✕
            </button>

            {/* Article: The Third Path */}
            {activeArticle === 'third-path' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-3">🔱</div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase mb-2">Featured Article</p>
                  <h2 className="text-2xl font-black text-white mb-2">The Third Path</h2>
                  <p className="text-purple-300">From Employee to Entrepreneurial Consumer</p>
                  <div className="w-16 h-0.5 mx-auto mt-3" style={{ background: '#D4AF37' }}/>
                </div>

                {[
                  { heading:'1. The First Alternative: Employment', emoji:'🏢', color:'#9CA3AF',
                    body:`Society has conditioned most of us to follow one path: go to school, get a good job, and you'll be secure. And employment does offer real benefits — stable income, lower risk, structure, and benefits like medical aid and pension. But beneath the surface, millions of employees are deeply frustrated.\n\nYou trade your time for money — no work, no income. Your salary has a ceiling. Your growth depends on someone else's decisions. One restructuring can change your entire life overnight. The truth is: employment is safe — but it often keeps people stuck.` },
                  { heading:'2. The Second Alternative: Business Ownership', emoji:'🚀', color:'#F59E0B',
                    body:`Then there is the entrepreneurial dream — build something of your own. Unlimited income, time freedom, full control, wealth creation, legacy. The dream is real. But so is the reality: most businesses fail in the first few years. The financial pressure is immense. Freedom is delayed, not immediate. You can lose everything.\n\nFor most employed people, the leap into full entrepreneurship feels reckless — not because they lack ambition, but because responsibility is heavy and the stakes are too high.` },
                  { heading:'3. The Third Alternative: The Entrepreneurial Consumer', emoji:'🔱', color:'#D4AF37',
                    body:`What if you did not have to choose between safety and freedom?\n\nThe Entrepreneurial Consumer is a hybrid model — someone who still earns income from employment, but leverages their everyday spending, networks and platforms to generate additional income streams. Instead of just consuming, you become a profiting consumer.\n\nNo need to quit your job. No all-in gamble. You build income streams while still employed, develop entrepreneurial skills without pressure, and grow beyond salary limitations over time. The mindset gap between employee and entrepreneur closes — gradually, naturally, safely.\n\nThat is the power of the Third Path.` },
                ].map((section, i) => (
                  <div key={i} className="mb-7">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{section.emoji}</span>
                      <h3 className="font-black text-base" style={{ color: section.color }}>{section.heading}</h3>
                    </div>
                    {section.body.split('\n\n').map((para, j) => (
                      <p key={j} className="text-purple-200 text-sm leading-relaxed mb-3">{para}</p>
                    ))}
                  </div>
                ))}

                <div className="rounded-2xl p-5 text-center border border-yellow-400/30 mb-6" style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(76,29,149,0.12))' }}>
                  <p className="text-yellow-400 font-black text-base mb-3">The Bottom Line</p>
                  <p className="text-white text-sm leading-relaxed mb-4">
                    Employment gives you <em className="text-purple-300">security without freedom.</em> Business ownership offers <em className="text-purple-300">freedom with high risk.</em> <strong className="text-yellow-400">The Entrepreneurial Consumer gives you a safe path to build freedom.</strong>
                  </p>
                  <div className="border-t border-yellow-400/20 pt-3 mt-3">
                    <p className="text-yellow-500 text-xs font-black tracking-wide">— Rev Mokoro Manana</p>
                    <p className="text-purple-400 text-xs">Founder & CEO · Z2B Legacy Builders</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/workshop"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-yellow-900 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}
                    onClick={() => setActiveArticle(null)}>
                    🎓 Start Free Workshop
                  </Link>
                  <Link href="/about"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-white border border-purple-500/40 hover:scale-105 transition-all"
                    style={{ background: 'rgba(76,29,149,0.3)' }}
                    onClick={() => setActiveArticle(null)}>
                    Read Our Full Story →
                  </Link>
                </div>
              </div>
            )}

            {/* Article: The Mindset Gap */}
            {activeArticle === 'mindset-gap' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-3">🧠</div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase mb-2">Featured Article</p>
                  <h2 className="text-2xl font-black text-white mb-2">The Mindset Gap</h2>
                  <p className="text-purple-300">Employee Thinking vs Entrepreneurial Thinking</p>
                  <div className="w-16 h-0.5 mx-auto mt-3" style={{ background: '#D4AF37' }}/>
                </div>

                <p className="text-purple-200 text-sm leading-relaxed mb-6">The biggest gap between where you are and where you want to be is not your bank balance. It is not your qualifications. It is not even your time. It is the way you think about yourself in relation to money, work and value.</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { title:'Employee Mindset', color:'#9CA3AF', bg:'rgba(107,114,128,0.1)', border:'rgba(107,114,128,0.3)',
                      points:['Seeks security above all else','Avoids risk and uncertainty','Follows instructions given','Thinks in terms of salary','Waits for permission to grow','Sees spending as unavoidable'] },
                    { title:'Entrepreneur Mindset', color:'#D4AF37', bg:'rgba(212,175,55,0.08)', border:'rgba(212,175,55,0.3)',
                      points:['Seeks value and opportunity','Embraces calculated risk','Creates systems and solutions','Thinks in terms of scalability','Takes responsibility to grow','Sees spending as potential equity'] },
                  ].map((col, i) => (
                    <div key={i} className="rounded-xl p-4 border" style={{ background: col.bg, borderColor: col.border }}>
                      <p className="font-black text-sm mb-3" style={{ color: col.color }}>{col.title}</p>
                      {col.points.map((pt, j) => (
                        <div key={j} className="flex items-start gap-2 mb-1.5">
                          <span className="text-xs mt-0.5" style={{ color: col.color }}>•</span>
                          <p className="text-purple-200 text-xs leading-relaxed">{pt}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-5 mb-6 border border-purple-500/20" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <p className="text-purple-300 text-sm leading-relaxed">This gap is why many employees fail when they try to start a business. Why many return to jobs after trying entrepreneurship. Why many never try at all — not because they lack talent, but because the mindset was never developed. The Z2B Workshop exists to close this gap — session by session, morning by morning, one mirror moment at a time.</p>
                </div>

                <Link href="/workshop"
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-black text-yellow-900 hover:scale-105 transition-all"
                  style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}
                  onClick={() => setActiveArticle(null)}>
                  🎓 Start Closing the Gap — Free Workshop
                </Link>
              </div>
            )}

            {/* Article: Purple Cow */}
            {activeArticle === 'purple-cow' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-3">🐄</div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase mb-2">Featured Article</p>
                  <h2 className="text-2xl font-black text-white mb-2">The Purple Cow</h2>
                  <p className="text-purple-300">Why Sharing What Moves You Is Your Greatest Sales Tool</p>
                  <div className="w-16 h-0.5 mx-auto mt-3" style={{ background: '#D4AF37' }}/>
                </div>

                {[
                  { heading:'What is a Purple Cow?', emoji:'🐄',
                    body:`Seth Godin said it best: when you drive past a field of ordinary brown cows, you do not stop. You have seen cows before. But if you see a purple cow — you slam on the brakes. You take a photo. You call someone. You cannot help but tell people.\n\nThe Purple Cow is anything remarkable enough that people feel compelled to talk about it. Not because they were paid to. Not because they were told to. Because they genuinely could not keep it to themselves.` },
                  { heading:'You Are Not a Salesperson', emoji:'🙅',
                    body:`The biggest mistake new Z2B builders make is approaching their network like salespeople. Pitching. Pushing. Following up with pressure. This approach repels the very people you want to attract.\n\nYou are not selling. You are a student who found something remarkable — and you are sharing it the way any honest person would. With enthusiasm, without pressure, and only when you genuinely believe in what you are sharing.` },
                  { heading:'Your Workshop Session Is Your Content', emoji:'📚',
                    body:`Every time you sit with a workshop session and something shifts inside you — that is your Purple Cow moment. That is your content. A sentence from the mirror moment that hit differently. An activity result that surprised you. A comprehension question that made you realise how long you have been thinking like an employee.\n\nPost that. Not a sales pitch. Not a company flyer. Your genuine moment of discovery. That is what stops the scroll. That is what makes someone ask: "What is this thing you are doing?"` },
                ].map((section, i) => (
                  <div key={i} className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{section.emoji}</span>
                      <h3 className="font-black text-sm text-yellow-400">{section.heading}</h3>
                    </div>
                    {section.body.split('\n\n').map((para, j) => (
                      <p key={j} className="text-purple-200 text-sm leading-relaxed mb-3">{para}</p>
                    ))}
                  </div>
                ))}

                <div className="rounded-2xl p-5 text-center border border-yellow-400/30 mb-6" style={{ background: 'rgba(212,175,55,0.08)' }}>
                  <p className="text-white text-sm italic leading-relaxed">"Do not post when you have nothing to say. Post when the workshop session gave you something you cannot keep to yourself. <strong className="text-yellow-400">That energy is the Purple Cow.</strong>"</p>
                  <p className="text-yellow-500 text-xs mt-2">— Rev Mokoro Manana</p>
                </div>

                <Link href="/workshop"
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-black text-yellow-900 hover:scale-105 transition-all"
                  style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}
                  onClick={() => setActiveArticle(null)}>
                  🎓 Find Your Purple Cow — Free Workshop
                </Link>
              </div>
            )}

          </div>
        </div>
      )}

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

      {/* ── BUSINESS OPPORTUNITY PAGE ── */}
      <section id="business-opportunity" className="py-20" style={{ background: 'linear-gradient(135deg,#0A0015 0%,#1A0035 50%,#0A0015 100%)' }}>
        <div className="max-w-5xl mx-auto px-4">

          {/* Section header */}
          <div className="text-center mb-14">
            <p className="text-yellow-400 font-black text-sm tracking-widest uppercase mb-3">The Invitation</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              The Z2B Business Opportunity
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full mb-5" style={{ background: 'linear-gradient(90deg,#D4AF37,#fbbf24)' }}/>
            <p className="text-purple-300 text-lg max-w-2xl mx-auto">
              Everything you need to know before you decide. No pressure. Just clarity.
            </p>
          </div>

          {/* Questions grid */}
          <div className="space-y-4">

            {/* Q1 — Who are we? */}
            <div className="rounded-2xl border border-white/10" style={{ position: 'relative', zIndex: 10 }}>
              <div className="flex items-center gap-4 px-6 py-5 rounded-t-2xl" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                <span className="text-3xl flex-shrink-0">🏛️</span>
                <div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase">Question 1</p>
                  <h3 className="text-white font-black text-xl">Who are we?</h3>
                </div>
              </div>
              <div className="px-6 py-6" style={{ background: 'rgba(255,255,255,0.03)' }}>

                {/* Core identity */}
                <div className="rounded-2xl p-5 mb-5 border border-yellow-400/20" style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(76,29,149,0.12))' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🔱</span>
                    <div>
                      <p className="text-yellow-400 font-black text-xs tracking-widest uppercase">Our Solution</p>
                      <p className="text-white font-black text-lg">Entrepreneurial Consumer Solutions</p>
                    </div>
                  </div>
                  <p className="text-yellow-300 leading-relaxed text-sm font-semibold mb-3">
                    A Personal and Business Development Coaching and AI Systems Service Provider dedicated to transforming the lives of employees and consumers worldwide.
                  </p>
                  <p className="text-purple-300 text-sm leading-relaxed mb-4">
                    We deliver this through the <strong className="text-white">Z2B Table Banquet platform</strong> — a complete ecosystem of workshops, AI coaching, sales tools and digital building solutions designed to walk any employee smoothly from consumption to ownership.
                  </p>
                  {/* Rev's quote locked in */}
                  <div className="rounded-xl p-4 border border-yellow-400/30 mb-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <p className="text-white text-sm leading-relaxed italic mb-2">
                      "Employment gives you security without freedom. Business ownership offers freedom with high risk. <strong className="text-yellow-400">The Entrepreneurial Consumer gives you a safe path to build freedom.</strong>"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg,#D4AF37,#fbbf24)' }}/>
                      <p className="text-yellow-500 text-xs font-black">Rev Mokoro Manana — Founder & CEO, Z2B Legacy Builders</p>
                    </div>
                  </div>
                  <a href="/about" className="inline-flex items-center gap-2 text-yellow-400 text-xs font-black hover:text-yellow-300 transition-colors">
                    Read our full story → app.z2blegacybuilders.co.za/about
                  </a>
                </div>

                {/* 3 pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  {[
                    {
                      emoji: '🔄',
                      title: 'Our Focus',
                      color: '#7C3AED',
                      bg: 'rgba(124,58,237,0.1)',
                      border: 'rgba(124,58,237,0.3)',
                      desc: 'Helping employees make a smooth transition to entrepreneurship by teaching them to flip everyday expenses into income-generating assets within a powerful wealth-building ecosystem.'
                    },
                    {
                      emoji: '🤖',
                      title: 'AI-Powered',
                      color: '#1D4ED8',
                      bg: 'rgba(29,78,216,0.1)',
                      border: 'rgba(29,78,216,0.3)',
                      desc: 'Leveraging cutting-edge AI technology to provide personalised coaching, automated learning paths, and intelligent business systems that accelerate your journey to ownership.'
                    },
                    {
                      emoji: '🌍',
                      title: 'Global & Digital',
                      color: '#065F46',
                      bg: 'rgba(6,95,70,0.1)',
                      border: 'rgba(6,95,70,0.3)',
                      desc: 'A digital-first business operating worldwide. Our platform is accessible from any device, in any country. We use network marketing as our distribution vehicle — not our identity.'
                    },
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl p-5 border" style={{ background: item.bg, borderColor: item.border }}>
                      <div className="text-3xl mb-3">{item.emoji}</div>
                      <p className="font-black text-white text-sm mb-2" style={{ color: item.color }}>{item.title}</p>
                      <p className="text-purple-300 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* 4 pillars strip */}
                <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-purple-400 text-xs font-black tracking-widest block mb-3">THE 4 TABLE LEGS — hover each leg to learn more:</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ position: 'relative', zIndex: 1 }}>
                    {[
                      {
                        emoji: '🧠', leg: 'Mindset',
                        color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.35)',
                        hoverBg: 'linear-gradient(135deg,#2e1065,#4c1d95)',
                        teaching: [
                          'Mindset is the foundation of everything. Before systems, before income, before team — your beliefs about yourself determine what you attempt and what you quit.',
                          'Most employees carry a hidden belief: "I am not the kind of person who builds businesses." This belief was formed by years of education designed to produce workers, not owners.',
                          'The Z2B Workshop breaks this belief session by session. Mirror moments reveal where your thinking is limiting you. Morning sessions anchor a new identity every day before the noise of the world can overwrite it.',
                          'The shift is not from poor to rich. It is from passive to active. From consumer to Entrepreneurial Consumer. Once that shift happens in your mind — your actions follow automatically.',
                        ]
                      },
                      {
                        emoji: '⚙️', leg: 'Systems',
                        color: '#1D4ED8', bg: 'rgba(29,78,216,0.12)', border: 'rgba(29,78,216,0.35)',
                        hoverBg: 'linear-gradient(135deg,#1e3a8a,#1D4ED8)',
                        teaching: [
                          'A system is anything that works while you sleep. Employees trade time for money — the moment they stop working, income stops. Systems break that dependency.',
                          'Z2B gives you your first system on Day 1: your referral link + the 9-Day Nurture Engine + My Sales Funnel. You share the link once. The system follows up for 9 days automatically.',
                          'Your second system is the Content Calendar. Post 4 times a day from your workshop insights. Each post is a seed. Each seed can produce a sign-up. Each sign-up enters your pipeline automatically.',
                          'As you grow, your team becomes your most powerful system. When 12 builders each run their own ratio — your income multiplies without you generating every sale. That is the beauty of TSC across 10 generations.',
                        ]
                      },
                      {
                        emoji: '🤝', leg: 'Relationships',
                        color: '#065F46', bg: 'rgba(6,95,70,0.12)', border: 'rgba(6,95,70,0.35)',
                        hoverBg: 'linear-gradient(135deg,#064e3b,#065F46)',
                        teaching: [
                          '"Your network is your net worth" is not a cliché — it is economics. Every person in your circle is a potential node in a value chain. The question is whether you have positioned yourself to activate that value.',
                          'Z2B teaches you to see people differently. Your colleague is not just a co-worker — they are a potential table companion. Your friend who complains about month-end is not just frustrated — they are ready for the third path.',
                          'The Circle of Twelve is your relationship architecture: 4 short-term destiny helpers who walk with you now, 4 medium-term strategic builders who add capability, and 4 long-term covenant partners who walk with you into legacy ventures.',
                          'Community is not a bonus feature of Z2B — it is the product. When you are surrounded by people who see what you see, your belief is reinforced daily. You do not have to explain yourself. You belong somewhere that gets it.',
                        ]
                      },
                      {
                        emoji: '🏆', leg: 'Legacy',
                        color: '#D4AF37', bg: 'rgba(212,175,55,0.10)', border: 'rgba(212,175,55,0.35)',
                        hoverBg: 'linear-gradient(135deg,#78350f,#92400e)',
                        teaching: [
                          'Legacy is the reason all of this matters. Not just income for this month. Not just freedom for yourself. But something that outlives your effort — something your children inherit, not just your debt.',
                          '"Before God gives a man land, He gives him people." Before He releases territory, He releases relationships. Before He entrusts wealth, He tests stewardship through human connection. Z2B is a Kingdom assignment.',
                          'Legacy thinking changes your behaviour today — even before the income arrives. When you know you are building for the next generation, you post consistently even when no one responds. You show up for your G1 team even when results are slow.',
                          'The Z2B Table Banquet is named deliberately. A banquet is not a meal for one. It is a feast prepared for many. Your seat at the table is not the end of the story — it is the beginning of a generational gathering.',
                        ]
                      },
                    ].map((item, i) => (
                      <div key={i} className="group relative">
                        {/* Pill button */}
                        <div className="rounded-2xl p-4 border cursor-pointer transition-all duration-200 group-hover:scale-105 flex items-center gap-2"
                          style={{ background: item.bg, borderColor: item.border }}>
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="font-black text-sm" style={{ color: item.color }}>{item.leg}</span>
                        </div>

                        {/* Big floating card on hover */}
                        <div className="absolute left-0 bottom-full mb-3 z-[9999] w-80 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 group-hover:translate-y-0 translate-y-2"
                          style={{ background: item.hoverBg, border: `2px solid ${item.color}`, boxShadow: `0 25px 50px rgba(0,0,0,0.8), 0 0 40px ${item.color}60` }}>
                          {/* Card header */}
                          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                            <span className="text-3xl">{item.emoji}</span>
                            <div>
                              <p className="text-white font-black text-base">{item.leg}</p>
                              <p className="text-white/50 text-xs">The {i+1}{i===0?'st':i===1?'nd':i===2?'rd':'th'} leg of your table</p>
                            </div>
                          </div>
                          {/* Card body */}
                          <div className="px-5 py-4 space-y-3">
                            {item.teaching.map((para, j) => (
                              <p key={j} className="text-white/90 text-xs leading-relaxed"
                                style={{ borderLeft: j === 0 ? `3px solid ${item.color}` : 'none', paddingLeft: j === 0 ? '10px' : '0' }}>
                                {para}
                              </p>
                            ))}
                          </div>
                          {/* Card footer */}
                          <div className="px-5 py-3 border-t border-white/10 rounded-b-2xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <a href="/workshop" className="text-xs font-black flex items-center gap-1 hover:gap-2 transition-all" style={{ color: item.color }}>
                              🎓 Build this leg in the Workshop →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Q2 — What do we sell? */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-4 px-6 py-5" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                <span className="text-3xl flex-shrink-0">📦</span>
                <div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase">Question 2</p>
                  <h3 className="text-white font-black text-xl">What do we offer?</h3>
                  <p className="text-purple-300 text-xs mt-0.5">Hover over any card for full details</p>
                </div>
              </div>
              <div className="px-6 py-6" style={{ background: 'rgba(255,255,255,0.03)' }}>

                {/* Category 1 — Membership & Coaching */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-6 rounded-full" style={{ background: '#7C3AED' }}/>
                    <p className="text-white font-black text-sm tracking-wide">MEMBERSHIP & PERSONAL DEVELOPMENT COACHING</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        emoji:'🎓', title:'99-Session Workshop',
                        tag:'ALL TIERS', tagColor:'#7C3AED',
                        short:'Entrepreneurial Consumer transformation journey',
                        detail:'A structured 99-session personal and business development programme split into Morning Sessions (identity anchoring, audio only) and Evening Sessions (deep learning with mirror moments, comprehension questions and daily activities). Starter Pack builders can access all 99 sessions.',
                      },
                      {
                        emoji:'🤖', title:'Coach Manlaw AI',
                        tag:'BRONZE+', tagColor:'#92400E',
                        short:'Personal AI business coach — 24/7',
                        detail:'Coach Manlaw is a purpose-built AI business coach trained on the Z2B philosophy, the 4 table legs and the Entrepreneurial Consumer mindset. Ask him anything about your mindset, your business strategy, your next step or your content. He responds in your context — knowing your tier, your referral code and your mission.',
                      },
                      {
                        emoji:'🎯', title:'My Sales Funnel',
                        tag:'BRONZE+', tagColor:'#92400E',
                        short:'Automated pipeline and prospect management',
                        detail:'A full 6-tab sales management system: Pipeline (Kanban board), Nurture Engine (9-day email sequence), Content Calendar, Sign-up Tracker, Content Studio with AI generation, and Add Prospect form. Every prospect who signs up via your referral link enters your pipeline automatically and gets nurtured by the system.',
                      },
                      {
                        emoji:'🎬', title:'Content Studio',
                        tag:'BRONZE+', tagColor:'#92400E',
                        short:'Scripts, captions and AI content on demand',
                        detail:'A library of 13 pre-written Purple Cow scripts for TikTok, Facebook and WhatsApp — all built around the Entrepreneurial Consumer philosophy. Plus Coach Manlaw AI mode generates custom scripts in seconds. Choose your platform, your audience type and your message — Coach Manlaw writes it with your referral link included.',
                      },
                      {
                        emoji:'📊', title:'Compensation Engine',
                        tag:'ALL TIERS', tagColor:'#7C3AED',
                        short:'6 income streams tracked in real time',
                        detail:'Your personal earnings dashboard tracks all 6 income streams: ISP (Individual Sales Profit), QPB (Quick Pathfinder Bonus), TSC (Team Sales Commission), MKT (Marketplace Sales), CEO Competitions and CEO Quarterly Awards. See confirmed earnings, pending payments and team depth — all in one view.',
                      },
                      {
                        emoji:'❤️', title:'Start Here Orientation',
                        tag:'ALL TIERS', tagColor:'#7C3AED',
                        short:'Permanent onboarding and compass page',
                        detail:'A permanent orientation page that every builder can return to at any time. It covers: Welcome to Abundance (with audio reader), Guide 1 (Personal Development & The Big Why), Guide 2 (Purple Cow sharing strategy), Guide 3 (How to use the Sales Funnel), and a Community section with sponsor connection and corporate WhatsApp group access.',
                      },
                    ].map((item, i) => (
                      <div key={i} className="group relative rounded-xl p-4 border border-white/10 cursor-pointer transition-all duration-300 hover:border-purple-400/50"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {/* Default view */}
                        <div className="transition-opacity duration-300 group-hover:opacity-0">
                          <div className="text-2xl mb-2">{item.emoji}</div>
                          <span className="text-xs font-black px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: item.tagColor + '30', color: item.tagColor, border: `1px solid ${item.tagColor}50` }}>{item.tag}</span>
                          <p className="text-white font-black text-sm mt-1">{item.title}</p>
                          <p className="text-purple-400 text-xs mt-1">{item.short}</p>
                        </div>
                        {/* Hover detail card */}
                        <div className="absolute inset-0 rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-y-auto"
                          style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', border: '2px solid rgba(167,139,250,0.4)' }}>
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-xl flex-shrink-0">{item.emoji}</span>
                            <div>
                              <p className="text-yellow-400 font-black text-xs">{item.title}</p>
                              <span className="text-xs font-black px-1.5 py-0.5 rounded-full" style={{ background: item.tagColor + '40', color: item.tagColor }}>{item.tag}</span>
                            </div>
                          </div>
                          <p className="text-purple-200 text-xs leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category 2 — SaaS & Digital Building */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-6 rounded-full" style={{ background: '#1D4ED8' }}/>
                    <p className="text-white font-black text-sm tracking-wide">SAAS SERVICES & DIGITAL BUILDING SOLUTIONS</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-black" style={{ background: 'rgba(29,78,216,0.2)', color:'#93C5FD', border:'1px solid rgba(29,78,216,0.4)' }}>SILVER TIER & ABOVE</span>
                  </div>
                  <p className="text-purple-300 text-xs mb-4 leading-relaxed">
                    From Silver tier upwards, Z2B members gain access to App Brainstorming &amp; Building consultations and digital business solutions — because we believe every Entrepreneurial Consumer should eventually own their own digital infrastructure.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        emoji:'💡', title:'App Brainstorming',
                        tag:'SILVER+', tagColor:'#1D4ED8',
                        short:'Turn your idea into a buildable concept',
                        detail:'A structured consultation session to map out your app idea, define your target user, design your core features and plan your MVP (Minimum Viable Product). We help you think through monetisation, user flows and technical requirements before a single line of code is written. Available from Silver tier.',
                      },
                      {
                        emoji:'📱', title:'App Building Solutions',
                        tag:'SILVER+', tagColor:'#1D4ED8',
                        short:'From concept to deployed application',
                        detail:'End-to-end app development support using modern stacks (Next.js, React, Supabase, Vercel). From web apps to PWAs and mobile-first platforms. We build with your branding, your business logic and your revenue model. Pricing discussed per project scope. Available from Silver tier upward.',
                      },
                      {
                        emoji:'🌐', title:'Digital Business Setup',
                        tag:'SILVER+', tagColor:'#1D4ED8',
                        short:'Domain, hosting, branding and launch',
                        detail:'Complete digital presence setup: domain registration, hosting configuration, landing page design, brand identity (logo, colours, typography), email setup and social media integration. We help you go from idea to a professional online presence ready to receive customers.',
                      },
                      {
                        emoji:'🤖', title:'AI Business Systems',
                        tag:'GOLD+', tagColor:'#78350F',
                        short:'Custom AI tools built for your business',
                        detail:'Custom AI integrations for your business — AI chatbots, automated content generation pipelines, AI-powered CRM systems, voice cloning and video avatar solutions. Built using cutting-edge APIs (OpenAI, Anthropic, ElevenLabs, D-ID) and tailored to your specific workflow. Available from Gold tier.',
                      },
                      {
                        emoji:'🎨', title:'Brand & Content Systems',
                        tag:'SILVER+', tagColor:'#1D4ED8',
                        short:'Visual identity and automated content pipelines',
                        detail:'Complete brand identity design plus automated content systems: social media scheduling, content templates, Canva brand kits, video editing workflows and AI caption generation. We build the system so your brand shows up consistently across all platforms without daily manual effort.',
                      },
                      {
                        emoji:'📈', title:'Growth & Analytics Setup',
                        tag:'GOLD+', tagColor:'#78350F',
                        short:'Data-driven dashboards for your business',
                        detail:'Business intelligence setup: Google Analytics, conversion tracking, referral tracking, funnel analytics and custom dashboards. Know exactly where your customers come from, what converts and where to focus. Turn your data into decisions. Available from Gold tier.',
                      },
                    ].map((item, i) => (
                      <div key={i} className="group relative rounded-xl p-4 border cursor-pointer transition-all duration-300 hover:border-blue-400/50"
                        style={{ background: 'rgba(29,78,216,0.06)', borderColor: 'rgba(29,78,216,0.2)' }}>
                        {/* Default view */}
                        <div className="transition-opacity duration-300 group-hover:opacity-0">
                          <div className="text-2xl mb-2">{item.emoji}</div>
                          <span className="text-xs font-black px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: item.tagColor + '30', color: item.tagColor, border: `1px solid ${item.tagColor}50` }}>{item.tag}</span>
                          <p className="text-white font-black text-sm mt-1">{item.title}</p>
                          <p className="text-blue-300 text-xs mt-1">{item.short}</p>
                        </div>
                        {/* Hover detail */}
                        <div className="absolute inset-0 rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-y-auto"
                          style={{ background: 'linear-gradient(135deg,#1e3a8a,#1e1b4b)', border: '2px solid rgba(59,130,246,0.5)' }}>
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-xl flex-shrink-0">{item.emoji}</span>
                            <div>
                              <p className="text-blue-300 font-black text-xs">{item.title}</p>
                              <span className="text-xs font-black px-1.5 py-0.5 rounded-full" style={{ background: item.tagColor + '40', color: item.tagColor }}>{item.tag}</span>
                            </div>
                          </div>
                          <p className="text-blue-100 text-xs leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SaaS CTA */}
                  <div className="mt-4 rounded-xl p-4 border border-blue-800/30 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ background: 'rgba(29,78,216,0.08)' }}>
                    <div className="flex-1">
                      <p className="text-white font-black text-sm">Ready to build your digital empire?</p>
                      <p className="text-blue-300 text-xs mt-0.5">SaaS services are available from Silver tier. Upgrade your membership to unlock digital building solutions.</p>
                    </div>
                    <a href="/pricing" className="flex-shrink-0 px-5 py-2.5 rounded-xl font-black text-sm text-white border border-blue-400/40 hover:scale-105 transition-all whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' }}>
                      View Tiers →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Q3 — Who is our best customer? */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-4 px-6 py-5" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                <span className="text-3xl flex-shrink-0">🎯</span>
                <div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase">Question 3</p>
                  <h3 className="text-white font-black text-xl">Who is our best customer?</h3>
                </div>
              </div>
              <div className="px-6 py-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-purple-200 leading-relaxed mb-5">
                  Our ideal customer is <strong className="text-white">any employed person or consumer anywhere in the world</strong> who is tired of the gap between their income and their lifestyle — and is ready to explore the third path between employment and full entrepreneurship.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { emoji:'👔', label:'Employees', desc:'Frustrated with the salary ceiling' },
                    { emoji:'🛒', label:'Consumers', desc:'Spending without building equity' },
                    { emoji:'🌱', label:'Students', desc:'Forming their financial identity' },
                    { emoji:'🙏', label:'Faith communities', desc:'Kingdom-minded legacy builders' },
                  ].map((c, i) => (
                    <div key={i} className="rounded-xl p-4 text-center border border-purple-800/40" style={{ background: 'rgba(76,29,149,0.2)' }}>
                      <div className="text-3xl mb-2">{c.emoji}</div>
                      <p className="text-white font-black text-sm">{c.label}</p>
                      <p className="text-purple-400 text-xs mt-1">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Q4 — How do we sell? */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-4 px-6 py-5" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                <span className="text-3xl flex-shrink-0">📱</span>
                <div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase">Question 4</p>
                  <h3 className="text-white font-black text-xl">How do we sell?</h3>
                </div>
              </div>
              <div className="px-6 py-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-purple-200 leading-relaxed mb-5">
                  We use the <strong className="text-white">Purple Cow Strategy</strong> — you share what genuinely moves you. Your daily workshop session becomes your content. Your personal transformation becomes your testimony. Your referral link does the rest.
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  {[
                    { step:'1', text:'Do your daily workshop session', color:'#7C3AED' },
                    { step:'→', text:'', color:'transparent' },
                    { step:'2', text:'Post 4 times on social media', color:'#1D4ED8' },
                    { step:'→', text:'', color:'transparent' },
                    { step:'3', text:'4 free sign-ups enter your pipeline', color:'#065F46' },
                    { step:'→', text:'', color:'transparent' },
                    { step:'4', text:'System nurtures for 9 days automatically', color:'#92400E' },
                    { step:'→', text:'', color:'transparent' },
                    { step:'5', text:'15% upgrade to Bronze = your income', color:'#D4AF37' },
                  ].map((s, i) => s.step === '→' ? (
                    <span key={i} className="text-purple-500 text-xl font-black">→</span>
                  ) : (
                    <div key={i} className="flex items-center gap-2 rounded-xl px-4 py-2 border border-white/10" style={{ background: `${s.color}25` }}>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: s.color }}>{s.step}</span>
                      <span className="text-white text-sm font-semibold">{s.text}</span>
                    </div>
                  ))}
                </div>
                <p className="text-purple-400 text-sm mt-4 italic">The ratio: 4 posts · 4 sign-ups/day · 5 days · 4 weeks · 15% conversion = 12 Bronze upgrades/month</p>
              </div>
            </div>

            {/* Q5 — How much do builders earn? */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-4 px-6 py-5" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                <span className="text-3xl flex-shrink-0">💰</span>
                <div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase">Question 5</p>
                  <h3 className="text-white font-black text-xl">How much do our Builders earn?</h3>
                </div>
              </div>
              <div className="px-6 py-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-purple-200 leading-relaxed mb-5">
                  Z2B has <strong className="text-white">6 income streams</strong>. Every paid tier unlocks more. Bronze is the starting point. Platinum unlocks all 10 generations of Team Sales Commission.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { code:'ISP', name:'Individual Sales Profit', desc:'18%–30% on your personal sales', color:'#7C3AED' },
                    { code:'QPB', name:'Quick Pathfinder Bonus', desc:'7.5%–10% for fast recruiting in first 90 days', color:'#D97706' },
                    { code:'TSC', name:'Team Sales Commission', desc:'1%–10% on your team across up to 10 generations', color:'#1D4ED8' },
                    { code:'MKT', name:'Marketplace Sales', desc:'95% of your asking price (Gold & Platinum)', color:'#065F46' },
                    { code:'CEO', name:'CEO Competitions', desc:'Variable prizes set by the CEO', color:'#DC2626' },
                    { code:'AWD', name:'CEO Quarterly Awards', desc:'Gold Pool, Platinum Pool & Founders Circle', color:'#9333EA' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-4 border border-white/10" style={{ background: `${s.color}15` }}>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: s.color, color: '#fff' }}>{s.code}</span>
                      <p className="text-white font-black text-sm mt-1">{s.name}</p>
                      <p className="text-purple-300 text-xs mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TIER COMPARISON TABLE */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-4 px-6 py-5" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                <span className="text-3xl flex-shrink-0">📊</span>
                <div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase">Bonus Structure</p>
                  <h3 className="text-white font-black text-xl">Team Performance Bonuses — Per Tier</h3>
                  <p className="text-purple-300 text-xs mt-0.5">
                    <span className="text-yellow-300 font-black">🟡 Bronze</span> and <span className="text-blue-300 font-black">🔵 Silver</span> highlighted for easy comparison
                  </p>
                </div>
              </div>
              <div className="px-4 py-5 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.03)' }}>

                {/* Table */}
                <table className="w-full text-xs border-collapse min-w-[700px]">

                  {/* Tier header row */}
                  <thead>
                    <tr>
                      <th className="text-left px-3 py-3 font-black text-white text-xs" style={{ background: '#1E1B4B', width: '22%' }}>INCOME STREAM</th>
                      {[
                        { tier:'FAM',      price:'Free',        bg:'#374151',   text:'#9CA3AF', hl:false },
                        { tier:'BRONZE',   price:'R480',        bg:'#D97706',   text:'#1A0A00', hl:true  },
                        { tier:'COPPER',   price:'R1,200',      bg:'#92400E',   text:'#FEF3C7', hl:false },
                        { tier:'SILVER',   price:'R2,500',      bg:'#1D4ED8',   text:'#EFF6FF', hl:true  },
                        { tier:'GOLD',     price:'R5,000',      bg:'#78350F',   text:'#FEF9C3', hl:false },
                        { tier:'PLATINUM', price:'R12,000',     bg:'#4C1D95',   text:'#F3F0FF', hl:false },
                      ].map(({ tier, price, bg, text, hl }) => (
                        <th key={tier} className="px-2 py-2 text-center" style={{
                          background: bg,
                          border: hl ? `3px solid ${tier==='BRONZE'?'#FDE68A':'#93C5FD'}` : undefined,
                          minWidth: '80px',
                        }}>
                          <div className="font-black text-xs" style={{ color: text }}>{tier}</div>
                          <div className="font-bold text-xs mt-0.5 opacity-80" style={{ color: text }}>{price}</div>
                          {hl && <div className="text-xs mt-0.5" style={{ color: tier==='BRONZE'?'#FDE68A':'#BFDBFE' }}>★ HIGHLIGHTED</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* ISP SECTION */}
                    <tr><td colSpan={7} className="px-3 py-2 font-black text-yellow-400 text-xs" style={{ background: '#1E1B4B' }}>💰 ISP — Individual Sales Profit (on your personal R480 sales)</td></tr>
                    {[
                      ['ISP Rate',                '10%',  '18%',   '22%',   '25%',   '28%',   '30%'   ],
                      ['Rand per R480 sale',      'R48',  'R86.40','R105.60','R120', 'R134.40','R144' ],
                    ].map(([label,...vals], ri) => (
                      <tr key={ri} style={{ background: ri%2===0?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.02)' }}>
                        <td className="px-3 py-2 text-purple-200 text-xs">{label}</td>
                        {vals.map((v,ci) => (
                          <td key={ci} className="px-2 py-2 text-center font-black text-xs" style={{
                            color: ci===1?'#92400E':ci===3?'#1E3A8A':'#E5E7EB',
                            background: ci===1?'#FDE68A':ci===3?'#BFDBFE':'transparent',
                            border: ci===1?'2px solid #D97706':ci===3?'2px solid #3B82F6':'none',
                            fontSize: ci===1||ci===3?'13px':'11px',
                          }}>{v}</td>
                        ))}
                      </tr>
                    ))}

                    {/* QPB SECTION */}
                    <tr><td colSpan={7} className="px-3 py-2 font-black text-yellow-400 text-xs" style={{ background: '#1E1B4B' }}>⚡ QPB — Quick Pathfinder Bonus (first 90 days · min 4 sales/month)</td></tr>
                    {[
                      ['First 4 sales/month',     '✗',    '7.5% = R144','7.5% = R144','7.5% = R144','7.5% = R144','7.5% = R144'],
                      ['Each next set of 4',       '✗',    '10% = R192', '10% = R192', '10% = R192', '10% = R192', '10% = R192' ],
                    ].map(([label,...vals], ri) => (
                      <tr key={ri} style={{ background: ri%2===0?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.02)' }}>
                        <td className="px-3 py-2 text-purple-200 text-xs">{label}</td>
                        {vals.map((v,ci) => (
                          <td key={ci} className="px-2 py-2 text-center font-black text-xs" style={{
                            color: v==='✗'?'#6B7280':ci===1?'#92400E':ci===3?'#1E3A8A':'#E5E7EB',
                            background: ci===1?'#FDE68A':ci===3?'#BFDBFE':'transparent',
                            border: ci===1?'2px solid #D97706':ci===3?'2px solid #3B82F6':'none',
                          }}>{v}</td>
                        ))}
                      </tr>
                    ))}

                    {/* TSC SECTION */}
                    <tr><td colSpan={7} className="px-3 py-2 font-black text-yellow-400 text-xs" style={{ background: '#1E1B4B' }}>🌳 TSC — Team Sales Commission (on your team's Bronze sales · G2 onwards)</td></tr>
                    {[
                      ['G2 (10%)', '10%','10%','10%','10%','10%','10%'],
                      ['G3 (5%)',  '—',  '5%', '5%', '5%', '5%', '5%' ],
                      ['G4 (3%)',  '—',  '—',  '3%', '3%', '3%', '3%' ],
                      ['G5 (2%)',  '—',  '—',  '—',  '2%', '2%', '2%' ],
                      ['G6 (1%)',  '—',  '—',  '—',  '1%', '1%', '1%' ],
                      ['G7 (1%)',  '—',  '—',  '—',  '—',  '1%', '1%' ],
                      ['G8 (1%)',  '—',  '—',  '—',  '—',  '1%', '1%' ],
                      ['G9 (1%)',  '—',  '—',  '—',  '—',  '—',  '1%' ],
                      ['G10 (1%)', '—',  '—',  '—',  '—',  '—',  '1%' ],
                    ].map(([label,...vals], ri) => (
                      <tr key={ri} style={{ background: ri%2===0?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.02)' }}>
                        <td className="px-3 py-2 text-purple-200 text-xs">{label}</td>
                        {vals.map((v,ci) => (
                          <td key={ci} className="px-2 py-2 text-center font-black text-xs" style={{
                            color: v==='—'?'#4B5563':ci===1?'#92400E':ci===3?'#1E3A8A':v!=='—'?'#E5E7EB':'#4B5563',
                            background: ci===1&&v!=='—'?'#FDE68A':ci===3&&v!=='—'?'#BFDBFE':'transparent',
                            border: ci===1&&v!=='—'?'2px solid #D97706':ci===3&&v!=='—'?'2px solid #3B82F6':'none',
                          }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                    <tr style={{ background:'rgba(255,255,255,0.06)' }}>
                      <td className="px-3 py-2 text-white font-black text-xs">Generations Deep</td>
                      {[['G2 only','#374151'],['G2–G3','#D97706'],['G2–G4','#92400E'],['G2–G6','#1D4ED8'],['G2–G8','#78350F'],['G2–G10','#4C1D95']].map(([v,bg],ci) => (
                        <td key={ci} className="px-2 py-2 text-center font-black text-xs" style={{
                          background: ci===1?'#FDE68A':ci===3?'#BFDBFE':bg+'33',
                          color: ci===1?'#92400E':ci===3?'#1E3A8A':'#E5E7EB',
                          border: ci===1?'2px solid #D97706':ci===3?'2px solid #3B82F6':'none',
                          fontSize:'12px',
                        }}>{v}</td>
                      ))}
                    </tr>

                    {/* MKT / CEO */}
                    <tr><td colSpan={7} className="px-3 py-2 font-black text-yellow-400 text-xs" style={{ background: '#1E1B4B' }}>🛒 MKT Marketplace · CEO Competitions · CEO Quarterly Awards</td></tr>
                    {[
                      ['Marketplace (MKT)',    '✗','✗',     '✗',     '✗',     '95%',   '95%'   ],
                      ['CEO Competitions',     '✓','✓',     '✓',     '✓',     '✓',     '✓'     ],
                      ['CEO Quarterly Awards', '✗','✗',     '✗',     '✗',     '✓ Gold','✓ Plat.'],
                    ].map(([label,...vals], ri) => (
                      <tr key={ri} style={{ background: ri%2===0?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.02)' }}>
                        <td className="px-3 py-2 text-purple-200 text-xs">{label}</td>
                        {vals.map((v,ci) => (
                          <td key={ci} className="px-2 py-2 text-center font-black text-xs" style={{
                            color: v==='✗'?'#6B7280':v==='✓'||v.startsWith('✓')?'#10B981':ci===1?'#92400E':ci===3?'#1E3A8A':'#E5E7EB',
                            background: ci===1?'#FDE68A':ci===3?'#BFDBFE':'transparent',
                            border: ci===1?'2px solid #D97706':ci===3?'2px solid #3B82F6':'none',
                          }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ background:'#FDE68A', border:'2px solid #D97706' }}/>
                    <span className="text-yellow-300 text-xs font-black">BRONZE — R480 once-off · Start here · 18% ISP · QPB active · TSC to G3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ background:'#BFDBFE', border:'2px solid #3B82F6' }}/>
                    <span className="text-blue-300 text-xs font-black">SILVER — R2,500 once-off · 25% ISP · TSC opens to G6 · Best upgrade value</span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-purple-400 text-xs italic">⚡ QPB active in first 90 days from Bronze upgrade date only</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Q6 — Potential Income */}
            <div className="rounded-2xl overflow-hidden border-2 border-yellow-400/40">
              <div className="flex items-center gap-4 px-6 py-5" style={{ background: 'linear-gradient(135deg,#78350f,#92400e)' }}>
                <span className="text-3xl flex-shrink-0">📈</span>
                <div>
                  <p className="text-yellow-300 font-black text-xs tracking-widest uppercase">Question 6</p>
                  <h3 className="text-white font-black text-xl">Potential Income</h3>
                </div>
              </div>
              <div className="px-6 py-6" style={{ background: 'rgba(120,53,15,0.15)' }}>
                <p className="text-purple-200 leading-relaxed mb-6">
                  Running the 4:4:5:4:15% ratio consistently. All projections based on Bronze sales at R480.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {[
                    { stage:'Month 1', tier:'Bronze', amount:'R1,564', desc:'12 personal upgrades · ISP + QPB' },
                    { stage:'Stage 3', tier:'Silver TSC', amount:'R427,219', desc:'6-generation team · G2–G6 active' },
                    { stage:'Stage 4', tier:'Platinum G7', amount:'R1,371,225', desc:'7 generations deep · G2–G7 only' },
                    { stage:'Stage 5', tier:'Platinum G10', amount:'Unlimited', desc:'G8–G10 not projected. Beyond measure.' },
                  ].map((p, i) => (
                    <div key={i} className="rounded-2xl p-4 text-center border-2" style={{
                      background: i === 3 ? 'linear-gradient(135deg,#1e1b4b,#4c1d95)' : 'rgba(255,255,255,0.05)',
                      borderColor: i === 3 ? '#D4AF37' : 'rgba(255,255,255,0.1)'
                    }}>
                      <p className="text-yellow-400 font-black text-xs mb-1">{p.stage}</p>
                      <p className="text-yellow-300 text-xs mb-2">{p.tier}</p>
                      <p className={`font-black ${i === 3 ? 'text-3xl text-yellow-400' : 'text-2xl text-white'}`}>{p.amount}</p>
                      <p className="text-purple-400 text-xs mt-2">{p.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-4 border border-yellow-400/30 text-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
                  <p className="text-yellow-300 font-black">⚡ Even at 10% team performance — you can still potentially earn <strong className="text-yellow-400 text-lg">R137,000/month</strong> at Stage 4</p>
                  <p className="text-yellow-500 text-xs mt-1 italic">Projections are mathematical potential based on consistent ratio execution. Not a guarantee. Results vary.</p>
                </div>
              </div>
            </div>

            {/* Q7 — How to Sign Up */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-4 px-6 py-5" style={{ background: 'linear-gradient(135deg,#065F46,#047857)' }}>
                <span className="text-3xl flex-shrink-0">🚀</span>
                <div>
                  <p className="text-green-200 font-black text-xs tracking-widest uppercase">Question 7</p>
                  <h3 className="text-white font-black text-xl">How to Sign Up?</h3>
                </div>
              </div>
              <div className="px-6 py-6" style={{ background: 'rgba(6,95,70,0.1)' }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { step:'1', emoji:'🎓', title:'Start Free', desc:'Join the free workshop. No credit card. No pressure. 99 sessions available.' },
                    { step:'2', emoji:'🧠', title:'Learn & Grow', desc:'Complete the morning and evening sessions. Find your Purple Cow.' },
                    { step:'3', emoji:'💎', title:'Upgrade to Bronze', desc:'R480 once-off. Card, EFT or ATM cash. No monthly fees. Ever.' },
                    { step:'4', emoji:'🌳', title:'Build Your Table', desc:'Share your referral link. Help your first 4. Watch it multiply.' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl p-5 text-center border border-green-800/40" style={{ background: 'rgba(6,95,70,0.15)' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white mx-auto mb-3 text-lg" style={{ background: 'linear-gradient(135deg,#065F46,#059669)' }}>{s.step}</div>
                      <div className="text-3xl mb-2">{s.emoji}</div>
                      <p className="text-white font-black text-sm mb-1">{s.title}</p>
                      <p className="text-green-300 text-xs">{s.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/workshop"
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-lg border-2 border-yellow-400 text-yellow-900 hover:scale-105 transition-all shadow-xl"
                    style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}>
                    🎓 Start Free Workshop
                  </Link>
                  <Link href="/pricing"
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-lg border-2 border-purple-400 text-white hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>
                    💎 View Membership Tiers
                  </Link>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-4 px-6 py-5" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
                <span className="text-3xl flex-shrink-0">⭐</span>
                <div>
                  <p className="text-yellow-400 font-black text-xs tracking-widest uppercase">From the Table</p>
                  <h3 className="text-white font-black text-xl">Testimonials</h3>
                </div>
              </div>
              <div className="px-6 py-8" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl p-5 border border-white/10 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-800/40"/>
                        <div className="space-y-2">
                          <div className="h-3 bg-purple-800/40 rounded w-24"/>
                          <div className="h-2 bg-purple-800/30 rounded w-16"/>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-purple-800/30 rounded w-full"/>
                        <div className="h-3 bg-purple-800/30 rounded w-4/5"/>
                        <div className="h-3 bg-purple-800/30 rounded w-3/5"/>
                      </div>
                      <div className="mt-4 text-center">
                        <span className="text-purple-500 text-xs font-bold tracking-widest">LOADING TESTIMONIALS...</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-purple-500 text-sm mt-6 italic">
                  Real testimonials from Z2B Legacy Builders coming soon. The table is being filled. 🍽️
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-8 mt-16 border-t-8 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Z2B Logo" className="h-12 w-12 rounded-lg border-2 border-gold-400" />
            <span className="text-2xl font-bold text-gold-300">Z2B TABLE BANQUET</span>
          </div>
          <p className="text-yellow-400 text-sm italic mb-2">"The plans of the diligent lead surely to abundance." — Proverbs 21:5</p>
          <p className="text-purple-300 text-xs mb-3">#Reka_Obesa_Okatuka — Many sticks. One Bonfire. 🔥</p>
          <p className="text-gold-200">&copy; 2026 Z2B Table Banquet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
