'use client'

// app/start-here/page.tsx
// Welcome to Abundance — Z2B Orientation Guide
// Always accessible. Permanent reference. Opens from dashboard.

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Heart, ChevronDown, ChevronUp, ArrowRight, ExternalLink } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  paid_tier: string | null
  referral_code: string
  sponsor_name?: string
  referred_by?: string
}

const CARDS = [
  {
    id: 'guide1',
    number: '01',
    emoji: '🧠',
    title: 'Your Personal Table',
    subtitle: 'Personal & Business Development — The Big Why',
    color: '#7C3AED',
    bg: '#F3F0FF',
    border: '#C4B5FD',
    content: {
      opening: `Before you explore this platform — pause for a moment and ask yourself one honest question:

"In 5 years from now, if nothing changes — where will I be?"

If the answer makes you uncomfortable, you are in exactly the right place.`,
      sections: [
        {
          heading: 'Why Most Employed People Stay Stuck',
          body: `The system was not designed to make you wealthy. It was designed to make you useful. You were taught to study hard, get a job, work for 40 years, and retire on a fraction of your final salary.

Nobody taught you to build. Nobody taught you to own. Nobody taught you that there is a third path between employment and full entrepreneurship.

That third path is called Entrepreneurial Consumerism — and Z2B is built on it.`,
        },
        {
          heading: 'The 4 Legs of Your Table 🍽️',
          body: `A table with one leg falls. Most people's financial lives rest on one leg — their salary. One retrenchment and everything collapses.

Z2B builds four strong legs under you:

🧠 Mindset — You cannot build a new life with old thinking. We renew the mind first.

⚙️ Systems — Income that works while you sleep. Not more hours — more leverage.

🤝 Relationships — Your network is not just your net worth. It is your safety net, your growth engine and your legacy builders.

🏆 Legacy — We are not just building income. We are building something to hand to our children.

The Z2B Table Banquet Workshop builds each leg, session by session.`,
        },
        {
          heading: 'Meet Coach Manlaw 🤖',
          body: `You do not go through this journey alone.

Coach Manlaw is your personal AI business coach — available 24 hours a day, 7 days a week, 365 days a year. No appointment needed. No judgment. No charge.

Coach Manlaw knows the Z2B framework inside out. He understands Entrepreneurial Consumerism. He will help you think through your business, generate content, craft messages to prospects, and coach you through challenges.

He is in your My Sales Funnel under Content Studio — and he is waiting for your first question.`,
        },
      ],
      cta: { label: '🎓 Start the Free Workshop', href: '/workshop' },
    },
  },
  {
    id: 'guide2',
    number: '02',
    emoji: '🌱',
    title: 'Share As You Grow',
    subtitle: 'The Purple Cow Principle — Only Share What Genuinely Impresses You',
    color: '#059669',
    bg: '#F0FFF4',
    border: '#6EE7B7',
    content: {
      opening: `There is a concept from author Seth Godin called the Purple Cow.

He says: if you are driving through the countryside and you see an ordinary cow — you ignore it. But if you see a purple cow, you cannot stop talking about it. You call your friends. You take photos. You tell everyone.

You do not share the purple cow because someone told you to. You share it because you simply cannot help yourself.

That is the only sharing Z2B ever asks of you.`,
      sections: [
        {
          heading: 'You Are Not a Salesperson',
          body: `Z2B does not want you to pressure anyone. We do not want you to bother your family. We do not want you to send cold messages to strangers.

We want you to go through the Workshop. We want you to learn. We want you to grow.

And then — only if you find something in these sessions that genuinely moves you, genuinely shifts your thinking, genuinely feels like a Purple Cow — we invite you to share your referral link with the people around you.

Not because you have a quota. Because you have a discovery worth sharing.`,
        },
        {
          heading: 'Who to Invite',
          body: `Think about the people in your life who are:

👔 Employed but frustrated — they work hard but the money never stretches far enough
🛒 Consumers who spend but never build — they buy, but their wealth never grows
🌱 Curious about business but too scared to jump — they want something but do not know what

These people are not looking for a job opportunity. They are looking for a third path. They are looking for a seat at the table.

When the time feels right — share your workshop link. Just say: "I found something worth seeing. Take a look — it is free."

That is all. The Workshop does the rest.`,
        },
        {
          heading: 'Your Referral Link Is Ready',
          body: `Every person who signs up through your personal referral link is automatically tracked in your My Sales Funnel. You will get a notification the moment they register.

The 9-day email nurture sequence follows up with them automatically. Your WhatsApp Launcher gives you the right words at the right time.

You do not chase. You share. The system follows up.`,
        },
      ],
      cta: { label: '🔗 Get My Referral Link', href: '/dashboard' },
    },
  },
  {
    id: 'guide3',
    number: '03',
    emoji: '🎯',
    title: 'Your Sales Funnel',
    subtitle: 'How the System Works While You Live Your Life',
    color: '#D97706',
    bg: '#FFFBEA',
    border: '#FCD34D',
    content: {
      opening: `You do not have to manually follow up with every person you invite. You do not have to remember who is on day 3 or day 6. You do not have to guess what to say.

My Sales Funnel does it all for you — automatically.

Here is exactly how it works:`,
      sections: [
        {
          heading: 'The Pipeline — Your Prospect Journey',
          body: `Every person who signs up through your link enters your pipeline automatically. The system calculates which day they are on and shows you their card in the right column:

✨ NEW → 👋 DAY 1–2 → ⏳ DAY 3–5 → 🔥 DAY 6 → ⚡ DAY 9 → ✅ BRONZE

On Day 6 and Day 9 you will receive overdue alerts — the system tells you exactly who needs a WhatsApp follow-up and which script to use. One tap opens WhatsApp with the message pre-written and personalised.`,
        },
        {
          heading: 'The 9-Day Nurture Engine 📧',
          body: `From the moment someone signs up, a 9-day email sequence begins automatically:

Day 0 — Welcome to Z2B
Day 2 — The real reason your salary is never enough
Day 3 — What other South Africans are building
Day 4 — How R480 can become R12,000+ per month
Day 5 — "Is Z2B a pyramid scheme?" — Answered honestly
Day 6 — 🔥 Upgrade push — Bronze R480 once-off
Day 7 — The founder story — faith, family, legacy
Day 8 — The table invitation
Day 9 — ⚡ Final push

You do not send these emails. The system does. You just share and let the automation work.`,
        },
        {
          heading: 'The Content Studio + Coach Manlaw 🤖',
          body: `The Content Studio gives you two powerful tools:

📚 Script Library — 13 ready-to-use scripts for TikTok, Facebook and WhatsApp, all built around the Entrepreneurial Consumer philosophy. Filter by platform. Tap to expand. Copy and post.

🤖 Coach Manlaw AI — Tell Coach Manlaw what you need: "Generate a 45-second TikTok about the third path for employed South Africans." He will write the full script, caption and hashtags in seconds — personalised with your name and referral link.

You do not need to be a content creator. You just need to show up.`,
        },
      ],
      cta: { label: '🎯 Open My Sales Funnel', href: '/my-funnel' },
    },
  },
]

export default function StartHerePage() {
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [openCards,    setOpenCards]    = useState<string[]>([])
  const [entered,      setEntered]      = useState(false)
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
          setTimeout(() => setEntered(true), 100)
        })
    })
  }, [router])

  const toggleCard = (id: string) => {
    setOpenCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const referralLink = profile
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/workshop?ref=${profile.referral_code}`
    : ''

  const sponsorWA = profile?.referred_by
    ? `https://wa.me/?text=${encodeURIComponent(`Hi ${profile.sponsor_name || 'Coach'}, I just completed my Z2B orientation. Please add me to the Corporate WhatsApp Group. My name is ${profile.full_name}. 🙏`)}`
    : null

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#0A0015,#1A0035)' }}>
      <div className="text-center">
        <Heart className="w-12 h-12 text-red-400 mx-auto mb-4 animate-pulse"/>
        <p className="text-white font-black text-lg">Welcome to Abundance...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#0A0015 0%,#1A0035 40%,#0D001A 100%)' }}>

      {/* ── HERO ── */}
      <div className={`relative overflow-hidden transition-all duration-1000 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #DC2626 0%, transparent 70%)', filter: 'blur(60px)' }}/>
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)', filter: 'blur(40px)' }}/>
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', filter: 'blur(40px)' }}/>
        </div>

        <div className="max-w-2xl mx-auto px-6 pt-16 pb-12 text-center relative z-10">

          {/* Heart icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)', boxShadow: '0 0 40px rgba(220,38,38,0.5)' }}>
                <Heart className="w-10 h-10 text-white fill-white"/>
              </div>
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: 'rgba(220,38,38,0.4)' }}/>
            </div>
          </div>

          {/* Welcome text */}
          <p className="text-yellow-400 font-black text-sm tracking-widest uppercase mb-3">
            Z2B Legacy Builders
          </p>
          <h1 className="font-black text-white mb-4 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', textShadow: '0 0 60px rgba(220,38,38,0.3)' }}>
            Welcome to<br/>
            <span style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444,#D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Abundance
            </span>
          </h1>

          {profile && (
            <p className="text-purple-300 text-lg mb-4">
              <span className="text-white font-black">{profile.full_name}</span> — you just stepped into something bigger than a membership.
            </p>
          )}

          <p className="text-purple-300 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            You stepped into a <strong className="text-white">movement</strong>. A community of Entrepreneurial Consumers who are building their four table legs — Mindset, Systems, Relationships and Legacy — one step at a time.
          </p>

          {/* 3D Arrow + Start Here */}
          <div className="flex flex-col items-center gap-3 mb-6">
            {/* Animated arrow */}
            <div className="flex flex-col items-center gap-1 animate-bounce">
              {[0.9, 0.7, 0.5].map((opacity, i) => (
                <svg key={i} width="32" height="20" viewBox="0 0 32 20" style={{ opacity }}>
                  <path d="M1 1 L16 18 L31 1" stroke="#D4AF37" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ))}
            </div>
            <p className="text-yellow-400 text-xs font-black tracking-widest uppercase">Open any guide below</p>
          </div>

          {/* Stat pills */}
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { label:'3 Guides', emoji:'📖' },
              { label:'Free Workshop', emoji:'🎓' },
              { label:'Coach Manlaw AI', emoji:'🤖' },
              { label:'Your Sales Funnel', emoji:'🎯' },
            ].map(s => (
              <span key={s.label} className="px-4 py-2 rounded-full text-xs font-black border border-white/10 text-purple-300"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                {s.emoji} {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── GUIDE CARDS ── */}
      <div className="max-w-2xl mx-auto px-4 pb-8 space-y-4">

        {CARDS.map((card, ci) => {
          const isOpen = openCards.includes(card.id)
          return (
            <div key={card.id}
              className={`rounded-2xl overflow-hidden border-2 transition-all duration-500 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{
                borderColor: isOpen ? card.color : 'rgba(255,255,255,0.1)',
                background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                transitionDelay: `${ci * 150}ms`
              }}>

              {/* Card header — always visible */}
              <button onClick={() => toggleCard(card.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:opacity-90 transition-opacity">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 font-black"
                  style={{ background: `${card.color}25`, border: `2px solid ${card.color}40` }}>
                  {card.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black tracking-widest" style={{ color: card.color }}>
                      GUIDE {card.number}
                    </span>
                  </div>
                  <h2 className="font-black text-white text-lg leading-tight">{card.title}</h2>
                  <p className="text-purple-400 text-xs mt-0.5 leading-snug">{card.subtitle}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: isOpen ? `${card.color}30` : 'rgba(255,255,255,0.05)' }}>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4" style={{ color: card.color }}/>
                    : <ChevronDown className="w-4 h-4 text-purple-400"/>
                  }
                </div>
              </button>

              {/* Card content — expandable */}
              {isOpen && (
                <div className="px-5 pb-6 border-t border-white/5">

                  {/* Opening paragraph */}
                  <div className="mt-5 mb-6 rounded-xl p-4 border-l-4"
                    style={{ borderColor: card.color, background: `${card.color}10` }}>
                    <pre className="text-purple-200 text-sm leading-relaxed whitespace-pre-wrap font-sans italic">
                      {card.content.opening}
                    </pre>
                  </div>

                  {/* Sections */}
                  <div className="space-y-5">
                    {card.content.sections.map((section, si) => (
                      <div key={si}>
                        <h3 className="font-black text-white text-base mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ background: card.color }}/>
                          {section.heading}
                        </h3>
                        <pre className="text-purple-300 text-sm leading-relaxed whitespace-pre-wrap font-sans pl-4">
                          {section.body}
                        </pre>
                      </div>
                    ))}
                  </div>

                  {/* CTA button */}
                  <a href={card.content.cta.href}
                    className="mt-6 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg,${card.color},${card.color}BB)` }}>
                    {card.content.cta.label}
                    <ArrowRight className="w-4 h-4"/>
                  </a>
                </div>
              )}
            </div>
          )
        })}

        {/* ── COMMUNITY CLOSE ── */}
        <div className={`rounded-2xl overflow-hidden border-2 border-red-500/30 transition-all duration-500 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.08),rgba(76,29,149,0.08))', transitionDelay: '600ms' }}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(220,38,38,0.2)', border: '2px solid rgba(220,38,38,0.3)' }}>
                🙏
              </div>
              <div>
                <p className="text-red-400 font-black text-xs tracking-widest uppercase">You Are Not Alone</p>
                <h2 className="text-white font-black text-lg">Join the Community</h2>
              </div>
            </div>

            <p className="text-purple-300 text-sm leading-relaxed mb-5">
              The Z2B Table Banquet is built on relationships. Your sponsor was placed in your life for a reason — they are your first table leg, your guide and your accountability partner. Reach out. Introduce yourself. Let them walk alongside you.
            </p>

            <p className="text-purple-300 text-sm leading-relaxed mb-5">
              And beyond your sponsor, there is a whole community of Entrepreneurial Consumers across South Africa who are on this same journey. The Corporate WhatsApp Group is where we celebrate wins, share insights and hold each other to a higher standard.
            </p>

            <div className="space-y-3">

              {/* Sponsor WhatsApp */}
              {sponsorWA && (
                <a href={sponsorWA} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30 hover:border-green-400/60 transition-all"
                  style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <span className="text-2xl">💬</span>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm">WhatsApp Your Sponsor</p>
                    <p className="text-green-400 text-xs mt-0.5">
                      {profile?.sponsor_name || 'Your Sponsor'} — tap to introduce yourself
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-green-400"/>
                </a>
              )}

              {/* Corporate Group */}
              <a href="https://wa.me/27770490163"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 hover:border-red-400/60 transition-all"
                style={{ background: 'rgba(220,38,38,0.08)' }}>
                <span className="text-2xl">🏛️</span>
                <div className="flex-1">
                  <p className="text-white font-black text-sm">Join Our Corporate WhatsApp Group</p>
                  <p className="text-red-400 text-xs mt-0.5">
                    +27 77 049 0163 — Request to be added
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-red-400"/>
              </a>

              {/* Referral link copy */}
              {referralLink && (
                <div className="p-4 rounded-xl border border-yellow-500/30"
                  style={{ background: 'rgba(212,175,55,0.08)' }}>
                  <p className="text-yellow-400 font-black text-sm mb-1">🔗 Your Referral Link</p>
                  <p className="text-purple-300 text-xs font-mono break-all leading-relaxed">
                    {referralLink}
                  </p>
                  <p className="text-purple-400 text-xs mt-2 italic">
                    Share this when you find your Purple Cow moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to dashboard */}
        <div className="text-center pb-8 pt-2">
          <a href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-purple-900 text-sm hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
            ← Back to Dashboard
          </a>
          <p className="text-purple-500 text-xs mt-3">
            This guide is always here whenever you need to find your footing again. 🙏
          </p>
        </div>

      </div>
    </div>
  )
}