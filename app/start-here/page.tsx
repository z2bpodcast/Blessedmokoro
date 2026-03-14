'use client'

// app/start-here/page.tsx
// Z2B Welcome to Abundance — Permanent Orientation & Reference Page

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Heart, ExternalLink } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  paid_tier: string | null
  referral_code: string
  sponsor_name: string | null
  referred_by: string | null
}

const TIER_COLORS: Record<string, string> = {
  fam: '#6B7280', bronze: '#CD7F32', copper: '#B87333',
  silver: '#9CA3AF', gold: '#D4AF37', platinum: '#9333EA',
}

export default function StartHerePage() {
  const [profile,   setProfile]   = useState<Profile | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [openCards, setOpenCards] = useState<Set<string>>(new Set(['welcome']))
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles')
        .select('id, full_name, paid_tier, referral_code, sponsor_name, referred_by')
        .eq('id', user.id).single()
        .then(({ data }) => {
          if (data) setProfile(data as Profile)
          setLoading(false)
        })
    })
  }, [router])

  const toggle = (key: string) => {
    setOpenCards(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const getFirstName = () => profile?.full_name?.split(' ')[0] || 'Builder'
  const tier      = profile?.paid_tier || 'fam'
  const tierColor = TIER_COLORS[tier] || '#6B7280'
  const workshopLink = `https://app.z2blegacybuilders.co.za/workshop?ref=${profile?.referral_code || ''}`

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#0a0015,#1a0035,#0a0015)' }}>
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">❤️</div>
        <p className="text-yellow-300 font-black text-lg">Preparing your welcome...</p>
      </div>
    </div>
  )

  const CARDS = [
    {
      key: 'welcome',
      emoji: '❤️',
      label: 'Welcome to Abundance',
      sublabel: 'Your new identity starts here',
      accent: '#DC2626',
      accentBg: '#FFF5F5',
      content: (
        <div className="space-y-5">
          <div className="rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
            <p className="text-yellow-400 font-black text-xl mb-3">
              {getFirstName()}, welcome to the Z2B Table Banquet. 🍽️
            </p>
            <p className="text-white leading-relaxed mb-3">
              You have just stepped into something bigger than a membership.
              You stepped into a <strong className="text-yellow-300">movement</strong> — and a new identity.
            </p>
            <p className="text-purple-200 leading-relaxed mb-3">
              The world offers most people two options: stay an employee and trade time for money forever,
              or take the big risky leap into full entrepreneurship. Most people choose neither and stay stuck.
            </p>
            <p className="text-white leading-relaxed font-bold">
              Z2B offers a third path. And you just found it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji:'🧠', title:'Mindset',       desc:'Break the employee thinking that keeps you stuck' },
              { emoji:'⚙️', title:'Systems',       desc:'Build income that works while you sleep' },
              { emoji:'🤝', title:'Relationships', desc:'Turn your network into your net worth' },
              { emoji:'🏆', title:'Legacy',        desc:'Build something to pass on to your children' },
            ].map(leg => (
              <div key={leg.title} className="rounded-xl p-4 border-2 border-purple-100 bg-white">
                <div className="text-2xl mb-2">{leg.emoji}</div>
                <p className="font-black text-purple-900 text-sm">{leg.title}</p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{leg.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 border-2 border-yellow-400 text-center"
            style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(76,29,149,0.1))' }}>
            <p className="text-gray-800 font-black text-lg">
              "I am an Entrepreneurial Consumer."
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This is your new identity. Not what you do — <strong>who you are.</strong>{' '}
              Someone who creates value, builds equity and participates in the wealth chain —
              while still employed.
            </p>
          </div>

          <p className="text-center text-gray-400 text-sm italic">
            This page is your compass. Come back anytime you need direction. ❤️
          </p>
        </div>
      ),
    },
    {
      key: 'guide1',
      emoji: '🧠',
      label: 'Guide 1 — Your Personal Table',
      sublabel: 'Personal & Business Development — The Big Why',
      accent: '#7C3AED',
      accentBg: '#F3F0FF',
      content: (
        <div className="space-y-5">
          <div className="rounded-2xl p-5 border-2 border-purple-200 bg-purple-50">
            <p className="font-black text-purple-900 text-base mb-2">Why most employed people stay stuck</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              It is not laziness. It is not lack of talent. It is a system designed to keep you consuming,
              not creating. School teaches you to get a job. Nobody teaches you to build a table.
              Z2B changes that — one leg at a time.
            </p>
          </div>

          <div className="rounded-2xl p-5 border-2 border-purple-200 bg-white">
            <p className="font-black text-purple-900 text-base mb-3">🎓 The Free Workshop — Your Foundation</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              The Z2B Workshop is 9 sessions of personal and business development —
              designed specifically for employed people who are ready to think differently.
              Each session builds one leg of your table. Go at your own pace.
              There is no deadline. There is only direction.
            </p>
            <div className="space-y-2 mb-4">
              {[
                'Session 1 — Who you are and why you are here',
                'Session 2 — The Mindset shift from employee to builder',
                'Session 3 — Understanding the income model',
                'Session 4 — Building your first system',
                'Session 5 — Growing your relationships intentionally',
                'Session 6 — The Legacy mission and long-term vision',
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  {s}
                </div>
              ))}
            </div>
            <a href="/workshop"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-purple-900"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
              Start the Workshop <ExternalLink className="w-4 h-4"/>
            </a>
          </div>

          <div className="rounded-2xl p-5 border-2 border-yellow-300"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#D4AF37,#fbbf24)' }}>
                🤖
              </div>
              <div>
                <p className="text-yellow-400 font-black text-base">Meet Coach Manlaw</p>
                <p className="text-purple-300 text-xs">Your personal AI business coach — available 24/7</p>
              </div>
            </div>
            <p className="text-white text-sm leading-relaxed mb-3">
              Coach Manlaw is not a chatbot. He is a purpose-built AI coach trained on the Z2B philosophy,
              the 4 table legs and the Entrepreneurial Consumer mindset.
              Ask him anything — about your business, your mindset, your next step.
              He speaks your language and knows your mission.
            </p>
            <p className="text-yellow-300 text-sm font-bold italic">
              "You have a coach in your pocket. Use him." — Rev Mokoro
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'guide2',
      emoji: '🌱',
      label: 'Guide 2 — Share As You Grow',
      sublabel: 'Inviting Others — Only When You Are Moved To',
      accent: '#065F46',
      accentBg: '#F0FFF4',
      content: (
        <div className="space-y-5">
          <div className="rounded-2xl p-5 border-2 border-green-200 bg-green-50">
            <p className="font-black text-green-900 text-base mb-2">
              You are not a salesperson. You are a student.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Z2B does not ask you to chase people, pressure friends or meet quotas.
              We believe in a different principle — one that author Seth Godin called
              the <strong className="text-green-800">Purple Cow</strong>.
            </p>
          </div>

          <div className="rounded-2xl p-5 border-l-4 border-green-500 bg-white border border-green-100">
            <p className="text-green-800 font-black text-sm mb-2">🐄 The Purple Cow Principle</p>
            <p className="text-gray-600 text-sm leading-relaxed italic">
              "When you drive past a field of brown cows, you don't stop. But if you see a purple cow —
              you tell everyone. Not because you have to. Because you can't help it."
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mt-3 font-bold">
              If Z2B impresses you — share it. If the workshop moves you — invite someone.
              If Entrepreneurial Consumerism resonates — tell an employed friend.
              Only share what you genuinely believe in. That is the only rule.
            </p>
          </div>

          <div className="rounded-2xl p-5 border-2 border-green-200 bg-white">
            <p className="font-black text-gray-800 text-base mb-3">🌍 Who to Invite</p>
            <div className="space-y-3">
              {[
                { icon:'👔', who:'Employed people',  why:'They feel stuck and do not know about the third path' },
                { icon:'🛒', who:'Consumers',        why:'Every rand they spend builds someone else. Show them the alternative' },
                { icon:'🌱', who:'Students',         why:'They are forming their identity. Help them form the right one' },
                { icon:'🙏', who:'Church community', why:'Legacy and Kingdom building is in their DNA — Z2B speaks their language' },
              ].map(r => (
                <div key={r.who} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{r.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{r.who}</p>
                    <p className="text-gray-500 text-xs">{r.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5 border-2 border-green-300"
            style={{ background: 'linear-gradient(135deg,#065F4610,#16A34A08)' }}>
            <p className="font-black text-green-900 text-sm mb-2">📎 Your Referral Link</p>
            <p className="text-xs text-gray-500 mb-2">Share this — every sign-up is automatically tracked to you:</p>
            <code className="text-green-800 text-xs font-mono break-all bg-white rounded-xl px-3 py-2 block border border-green-200">
              {workshopLink}
            </code>
            <p className="text-xs text-gray-400 mt-2 italic">
              No pressure. Share only when you feel the Purple Cow moment. 🐄
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'guide3',
      emoji: '🎯',
      label: 'Guide 3 — Your Sales Funnel',
      sublabel: 'How the System Works While You Live Your Life',
      accent: '#1D4ED8',
      accentBg: '#EFF6FF',
      content: (
        <div className="space-y-5">
          <div className="rounded-2xl p-5 border-2 border-blue-200 bg-blue-50">
            <p className="font-black text-blue-900 text-base mb-2">You invite. The system follows up.</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              My Sales Funnel is your personal command center — built so that once you share
              your link, the system does most of the follow-up work for you.
              You focus on sharing. The funnel focuses on converting.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { step:'1', icon:'📊', title:'Pipeline View',        desc:'Every person you invite appears as a card. The system tracks which day they are on — Day 1 through Day 9 — and tells you exactly when to reach out.' },
              { step:'2', icon:'📧', title:'9-Day Nurture Engine', desc:'A sequence of 9 emails goes out automatically to every sign-up through your link — building trust, answering objections, inviting them to upgrade. Already written. Fully automated.' },
              { step:'3', icon:'💬', title:'WhatsApp Launcher',    desc:'On key days the system shows you the exact right WhatsApp message to send. One tap opens WhatsApp with the message pre-written. All you do is press send.' },
              { step:'4', icon:'🎬', title:'Content Studio',       desc:'Pre-written TikTok, Facebook and WhatsApp scripts built around Entrepreneurial Consumerism. Plus Coach Manlaw AI generates custom content on demand — in your voice, with your referral link.' },
              { step:'5', icon:'🎯', title:'Sign-up Tracker',      desc:'See how many people signed up today, this week and this month. Track your conversion rate and watch your progress toward the First 100 Bronze members.' },
            ].map(s => (
              <div key={s.step} className="flex gap-4 bg-white rounded-2xl p-4 border-2 border-blue-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' }}>
                  {s.step}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{s.icon}</span>
                    <p className="font-black text-gray-800 text-sm">{s.title}</p>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 border-2 border-yellow-300 flex items-start gap-3"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
            <span className="text-2xl flex-shrink-0">🤖</span>
            <div>
              <p className="text-yellow-400 font-black text-sm">Coach Manlaw is in the Studio</p>
              <p className="text-purple-200 text-xs leading-relaxed mt-1">
                Stuck on what to post? Open Content Studio → Generate with AI.
                Tell Coach Manlaw your platform, your audience and what you want to say.
                He will write it in seconds — in your voice, with your referral link included.
              </p>
            </div>
          </div>

          <a href="/my-funnel"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-black text-white text-lg"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' }}>
            🎯 Open My Sales Funnel <ExternalLink className="w-5 h-5"/>
          </a>
        </div>
      ),
    },
    {
      key: 'community',
      emoji: '🙏',
      label: 'Join the Community',
      sublabel: 'You are not building alone',
      accent: '#D4AF37',
      accentBg: '#FFFBEA',
      content: (
        <div className="space-y-5">
          <div className="rounded-2xl p-5 border-2 border-yellow-200"
            style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(76,29,149,0.1))' }}>
            <p className="font-black text-gray-800 text-base mb-2">A table needs people around it. 🍽️</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              The Z2B Table Banquet is not built in isolation. Every Legacy Builder around you
              is on the same journey — breaking the employee mindset, building systems, deepening
              relationships and creating a legacy. You grow faster together than alone.
            </p>
          </div>

          <div className="rounded-2xl p-5 border-2 border-purple-200 bg-white">
            <p className="font-black text-purple-900 text-base mb-3">👤 Connect with Your Sponsor</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Your sponsor invited you to this table. They are your first point of contact,
              your guide and your accountability partner.
              Reach out, introduce yourself and let them know you are here and ready to build.
            </p>
            {profile?.sponsor_name ? (
              <div className="rounded-xl p-4 bg-purple-50 border border-purple-200 text-center">
                <p className="text-xs text-gray-500 mb-1">Your Sponsor</p>
                <p className="font-black text-purple-900 text-lg">{profile.sponsor_name}</p>
                <p className="text-xs text-gray-400 mt-1">Send them a WhatsApp to say you are ready 🙏</p>
              </div>
            ) : (
              <div className="rounded-xl p-4 bg-gray-50 border border-gray-200 text-center">
                <p className="text-gray-500 text-sm">Contact your sponsor to introduce yourself and get started</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl p-5 border-2 border-green-300"
            style={{ background: 'linear-gradient(135deg,#F0FFF4,#DCFCE7)' }}>
            <p className="font-black text-green-900 text-base mb-2">
              💬 Join the Z2B Corporate WhatsApp Group
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Our Corporate WhatsApp Group is where the Z2B family gathers —
              for encouragement, announcements, team wins, training updates and Kingdom business
              conversations. Ask your sponsor to add you, or tap the button below to request
              directly.
            </p>
            <a href="https://wa.me/27770490163?text=Hi%2C%20I%20am%20a%20new%20Z2B%20Legacy%20Builder%20and%20I%20would%20like%20to%20be%20added%20to%20the%20Corporate%20WhatsApp%20Group.%20My%20name%20is%20"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-black text-white"
              style={{ background: '#25D366' }}>
              <span className="text-xl">💬</span>
              Request to Join — +27 77 049 0163
            </a>
            <p className="text-xs text-gray-400 mt-3 text-center italic">
              Opens WhatsApp with a pre-written request message
            </p>
          </div>

          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
            <div className="text-4xl mb-3">❤️</div>
            <p className="text-yellow-400 font-black text-lg mb-2">
              Welcome to Abundance, {getFirstName()}.
            </p>
            <p className="text-white text-sm leading-relaxed mb-3">
              You did not stumble upon Z2B by accident.
              You are here because you were ready for the third path.
              The table is set. Your seat is waiting.
            </p>
            <p className="text-purple-300 text-xs italic">
              "The plans of the diligent lead surely to abundance." — Proverbs 21:5
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F8F6FF' }}>

      {/* HEADER */}
      <header style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)' }}
        className="border-b-4 border-yellow-400 shadow-2xl">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse"/>
            <h1 className="text-3xl font-black text-white">Welcome to Abundance</h1>
            <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse"/>
          </div>
          <p className="text-yellow-300 font-bold mb-1">
            {profile?.full_name} ·
            <span className="ml-1 font-black" style={{ color: tierColor }}>{tier.toUpperCase()}</span>
          </p>
          <p className="text-purple-300 text-sm">
            Your orientation guide — always here when you need direction
          </p>
        </div>
      </header>

      {/* CARDS */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {CARDS.map(card => {
          const isOpen = openCards.has(card.key)
          return (
            <div key={card.key}
              className="rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-200"
              style={{ borderColor: isOpen ? card.accent : '#E5E7EB' }}>

              <button onClick={() => toggle(card.key)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all"
                style={{ background: isOpen ? card.accentBg : '#FFFFFF' }}>
                <span className="text-3xl flex-shrink-0">{card.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-base leading-tight">{card.label}</p>
                  {card.sublabel && (
                    <p className="text-gray-500 text-xs mt-0.5">{card.sublabel}</p>
                  )}
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{ borderColor: card.accent, background: isOpen ? card.accent : 'transparent' }}>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-white"/>
                    : <ChevronDown className="w-4 h-4" style={{ color: card.accent }}/>
                  }
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t-2" style={{ borderColor: `${card.accent}30` }}>
                  {card.content}
                </div>
              )}
            </div>
          )
        })}

        <div className="text-center py-4">
          <a href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-purple-900"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}