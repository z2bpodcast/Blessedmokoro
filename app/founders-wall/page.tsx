'use client'
// FILE: app/founders-wall/page.tsx
// Founders Wall — Rev Mokoro Manana's full founding story

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CHAPTERS = [
  {
    id: 1,
    tag: 'THE BEGINNING',
    title: 'Where It All Started',
    color: '#D4AF37',
    emoji: '🌱',
    content: `My business journey did not start in comfort.

It started in tragedy.

I witnessed robbers shoot and kill my father, Herman Metse Manana, at our family supermarket in Kagiso township.

In that moment, my childhood ended.

I was forced to be brave — to step into my father's big shoes long before I was ready. I chose courage over fear. I took responsibility for the business. For the family. For everything.

During that season of grief and pressure, I needed a father figure. A mentor. A voice of guidance. I never found one in person.

So I adopted one through the media.

Raymond Ackerman — founder of Pick n Pay — became my media-based mentor. I never met him. But I read every article written about him. I watched every television interview he gave.

He taught me one life-changing principle:

"The power of business systems."

He illustrated it using a table with four legs. I credit Raymond Ackerman for inspiring me to coin what I now call the Z2B Table Banquet.`,
  },
  {
    id: 2,
    tag: 'THE FIRST RISE',
    title: 'From Kagiso to R500,000 a Month',
    color: '#10B981',
    emoji: '📈',
    content: `I bought a SPAR franchise.

Why a franchise? Because Pick n Pay did not sell franchises then — and I had learned from Ackerman that buying a franchise means buying a successful entrepreneur's business system. A system that has already proved to work.

That decision changed everything.

The business grew from R40,000 per month to R500,000 per month.

It was not just financial growth. It was proof — living, breathing proof — that systems work. That ordinary people can produce extraordinary results when they plug into the right system.

My story was featured in a national publication. The cover went to Herman Mashaba of Black Like Me. But my journey as a young boy from Kagiso township was still recognised across the country.

I had arrived.

Or so I thought.`,
  },
  {
    id: 3,
    tag: 'THE ATTACK',
    title: 'Success Attracts Attack',
    color: '#EF4444',
    emoji: '⚔️',
    content: `Success does not only attract opportunity.

It also attracts attack.

My supermarket became a target of repeated armed robberies. I responded by investing in security.

But the greatest attack came from a direction I never expected.

Political activists — AmaComrades — targeted my business under the narrative of White Monopoly Capital. During Operation Khanyisa, surrounding communities were encouraged to illegally connect electricity from the same supply that powered my supermarket.

The costs became unsustainable.

What I had built began to collapse.

Like the Titanic hitting an iceberg — every attempt to save the business only made things worse.`,
  },
  {
    id: 4,
    tag: 'THE FALL',
    title: 'I Lost Everything',
    color: '#6B7280',
    emoji: '🌧️',
    content: `I lost everything.

The business.
The mansion.
The cars — including my BMW 325is "Gusheshe."

My identity as a successful young Township Tycoon was gone.

I was left with nothing but shame, pain, and unanswered questions.

The fall was total. The silence was deafening.`,
  },
  {
    id: 5,
    tag: 'THE TURNING POINT',
    title: 'A Song That Saved My Life',
    color: '#7C3AED',
    emoji: '🙏',
    content: `At my lowest point, I became suicidal.

One day, I picked up my 9mm Star firearm, ready to end my life.

But just before I could pull the trigger — I heard a song.

Voices singing behind my home:

"Reya matha matha, reya gae Jerusalem..."

Something inside me paused.

I said to myself: "Before I do this — let me go pray."

That decision saved my life.

At that open-air meeting, the preacher shared 1 Peter 5:7:

"Cast all your burdens onto Him, because He cares for you."

In that moment, I encountered Jesus Christ. I stepped forward and gave Him my life.

That day, I did not just find faith.

I found a reason to live again.

I had nothing left. But I had a second chance.

And I made a decision:

"I will rebuild my life — one step at a time."`,
  },
  {
    id: 6,
    tag: 'THE RISE',
    title: 'What Looked Like a Step Down Was Preparation',
    color: '#0EA5E9',
    emoji: '🚛',
    content: `Soon after, I got a job as a truck driver at Group Africa Marketing.

To others, it looked like a step down.

But for me — it was the beginning of my rise.

My employer saw something in me. They invested in my education, sent me back to school, and promoted me step by step until I became a warehouse manager.

I also answered a deeper calling and went to Bible school, earning a ministerial diploma.

But life was still difficult.

At one point, I had to dig a pit toilet for my family in Mshegoville. I was working for the Government Printing Works in Pretoria — but my salary could not afford a bond house on its own.

Like many government employees, I needed a second income.

That pit-toilet-digging moment humbled me. But it also awakened something powerful inside me.

I told myself:

"I am not finished. I must return to business — because most employers pay employees just enough to come back to work on Monday."`,
  },
  {
    id: 7,
    tag: 'THE SECOND ATTEMPT',
    title: 'The Lesson I Will Never Forget',
    color: '#F59E0B',
    emoji: '📚',
    content: `I turned to network marketing.

I chose it for the same reason I chose franchising: buying into network marketing means buying someone else's proven business system — but at a far lower entry cost than a franchise.

I worked hard. I built a large sales team. I sold so much toothpaste that I earned an international trip to Malaysia via Dubai.

Special gratitude to my sponsor Didintle Motshwanaesi and her upline Kgalalelo Chabe.

Excited, I made a critical mistake.

I resigned from my job — believing my breakthrough had finally come.

But while we were celebrating overseas, a key leader back home recruited our entire team into a new network marketing company.

We came back to nothing.

The system collapsed overnight.

The lesson I received from that experience is a principle I will never forget:

"If you don't own the system, you don't own the future."`,
  },
  {
    id: 8,
    tag: 'THE BREAKTHROUGH',
    title: 'When Artificial Intelligence Changed Everything',
    color: '#D4AF37',
    emoji: '🤖',
    content: `Just when I thought my dream was over — something new emerged.

Artificial Intelligence.

AI gave me what I never had before:

The ability to build systems without technical skills.
The power to execute ideas quickly.
The freedom to create without massive capital.

For the first time in my life — I was no longer limited by what I did not know.

I did not have the education or skill to build business systems like Bill Gates or Mark Zuckerberg.
I did not have the money to hire systems builders like Jeff Bezos.
I had ideas — but due to lack of education, skills and capital, I was too slow to execute them.

AI changed all of that.

And that is when everything changed.`,
  },
  {
    id: 9,
    tag: 'THE MISSION',
    title: 'Why I Built Z2B Table Banquet',
    color: '#D4AF37',
    emoji: '🔥',
    content: `I built Z2B Table Banquet for employees and consumers who see themselves as future entrepreneurs and business owners.

Because deep down, many employees are not just workers — they are unrealised entrepreneurs.

They know — deep on the inside — that they have more inside them than just working for a living.

They desire time and financial freedom. Escape from toxic work environments. A life of purpose and fulfilment.

I know this... because I lived it.

Four reasons drove me to build this platform:

First: Mindset Transformation. Employees cannot succeed in business with an employee mindset. This platform helps you think, act and execute like the billionaire you were created to be. As I write in my book Zero2Billionaires: "The distance between where you are today and where you and God envision you to be tomorrow — is the distance between your left and right ear. Your Mindset."

Second: Building Business Systems. AI has democratised what was once only available to the wealthy and educated. Z2B Table Banquet is a banquet of AI-powered systems designed to help you build and own your own business systems.

Third: Lifetime Business Relationships. I built this platform to create a community of entrepreneurial consumers who grow together. No more starting over. No more losing teams. Z2B Table is a lifetime ecosystem for collaboration, partnership and sustainable growth.

Fourth: Legacy. Jobs pay bills — but they do not create inheritance. Your children cannot inherit your job and your CV. But they can inherit your income-generating business systems. Just like Pick n Pay continues beyond Raymond Ackerman — he is gone, but his legacy system has immortalised him. Building income-generating systems will outlive you.`,
  },
]

export default function FoundersWallPage() {
  const [activeChapter, setActiveChapter] = useState<number|null>(null)
  const [founders, setFounders]           = useState<any[]>([])
  const [myProfile, setMyProfile]         = useState<any>(null)

  useEffect(() => {
    // Load top builders for Founders Wall
    supabase.from('profiles')
      .select('full_name,paid_tier,referral_code,signup_date,rank')
      .in('paid_tier', ['bronze','copper','silver','gold','platinum'])
      .order('signup_date', { ascending: true })
      .limit(100)
      .then(({ data }) => { if (data) setFounders(data) })

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier,rank').eq('id', user.id).single()
        .then(({ data }) => setMyProfile(data))
    })
  }, [])

  const TIER_COLOR: Record<string,string> = {
    bronze:'#CD7F32', copper:'#B87333', silver:'#C0C0C0',
    gold:'#D4AF37', platinum:'#E5E4E2'
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', color:'#F5F3FF', fontFamily:'Georgia,serif' }}>

      {/* NAV */}
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(12px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ fontSize:'13px', color:'rgba(196,181,253,0.6)', textDecoration:'none' }}>← Dashboard</Link>
        <span style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>🏛️ Founders Wall</span>
        <Link href="/workshop" style={{ fontSize:'12px', padding:'7px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'20px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Workshop</Link>
      </div>

      {/* HERO */}
      <div style={{ textAlign:'center', padding:'60px 24px 48px', background:'radial-gradient(ellipse at 50% 0%,rgba(212,175,55,0.1) 0%,transparent 60%)' }}>
        <div style={{ fontSize:'52px', marginBottom:'16px' }}>🏛️</div>
        <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'3px', color:'rgba(212,175,55,0.6)', marginBottom:'12px' }}>THE FOUNDING STORY</div>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(26px,5vw,52px)', fontWeight:900, color:'#fff', lineHeight:1.1, margin:'0 0 16px' }}>
          Why I Built<br/><span style={{ color:'#D4AF37' }}>Z2B Table Banquet</span>
        </h1>
        <p style={{ fontSize:'clamp(14px,2vw,18px)', fontStyle:'italic', color:'rgba(255,255,255,0.55)', maxWidth:'600px', margin:'0 auto 24px', lineHeight:1.7 }}>
          From pain to purpose. From fall to rise. From vision to mission.
        </p>
        <div style={{ display:'inline-block', padding:'8px 20px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'20px', fontSize:'13px', color:'#D4AF37' }}>
          — Rev Mokoro Manana · Founder & CEO · Z2B Legacy Builders
        </div>
      </div>

      <div style={{ maxWidth:'820px', margin:'0 auto', padding:'0 20px 80px' }}>

        {/* CHAPTER NAV */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'40px', justifyContent:'center' }}>
          {CHAPTERS.map(ch => (
            <button key={ch.id} onClick={() => setActiveChapter(activeChapter===ch.id?null:ch.id)}
              style={{ padding:'7px 14px', background: activeChapter===ch.id?`${ch.color}18`:'rgba(255,255,255,0.04)', border:`1px solid ${activeChapter===ch.id?ch.color+'44':'rgba(255,255,255,0.1)'}`, borderRadius:'20px', color: activeChapter===ch.id?ch.color:'rgba(255,255,255,0.4)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
              {ch.emoji} {ch.tag}
            </button>
          ))}
        </div>

        {/* CHAPTERS */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0', position:'relative' }}>
          <div style={{ position:'absolute', left:'27px', top:0, bottom:0, width:'2px', background:'linear-gradient(to bottom,rgba(212,175,55,0.4),rgba(124,58,237,0.3),rgba(16,185,129,0.2))', borderRadius:'1px' }} />

          {CHAPTERS.map((ch, i) => (
            <div key={ch.id} style={{ marginBottom:'32px', paddingLeft:'0' }}>
              <div style={{ display:'flex', gap:'20px', alignItems:'flex-start' }}>
                {/* Timeline dot */}
                <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:`${ch.color}15`, border:`2px solid ${ch.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0, zIndex:1, position:'relative', cursor:'pointer' }}
                  onClick={() => setActiveChapter(activeChapter===ch.id?null:ch.id)}>
                  {ch.emoji}
                </div>

                <div style={{ flex:1 }}>
                  {/* Header */}
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'10px', letterSpacing:'2px', color:`${ch.color}99`, marginBottom:'4px' }}>{ch.tag}</div>
                  <h3 onClick={() => setActiveChapter(activeChapter===ch.id?null:ch.id)} style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(16px,2.5vw,22px)', fontWeight:700, color: activeChapter===ch.id?ch.color:'#fff', margin:'0 0 10px', cursor:'pointer', lineHeight:1.2 }}>
                    {ch.title}
                  </h3>

                  {/* Expanded content */}
                  {activeChapter === ch.id && (
                    <div style={{ background:`${ch.color}08`, border:`1px solid ${ch.color}22`, borderRadius:'16px', padding:'24px 22px', animation:'fadeIn 0.3s ease' }}>
                      {ch.content.split('\n\n').map((para, pi) => (
                        <p key={pi} style={{ fontSize:'15px', color: para.startsWith('"')||para.startsWith('"')?'rgba(255,255,255,0.88)':'rgba(255,255,255,0.72)', lineHeight:1.85, margin:'0 0 16px', fontStyle: para.startsWith('"')||para.startsWith('"')?'italic':'normal', borderLeft: para.startsWith('"')||para.startsWith('"')?`3px solid ${ch.color}66`:undefined, paddingLeft: para.startsWith('"')||para.startsWith('"')?'16px':undefined }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {activeChapter !== ch.id && (
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.38)', lineHeight:1.6 }}>
                      {ch.content.split('\n\n')[0].substring(0,120)}...
                      <button onClick={() => setActiveChapter(ch.id)} style={{ background:'none', border:'none', color:`${ch.color}99`, cursor:'pointer', fontSize:'12px', fontFamily:'Georgia,serif', marginLeft:'6px', textDecoration:'underline' }}>Read more</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CLOSING STATEMENT */}
        <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(124,58,237,0.06))', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'40px 32px', textAlign:'center', marginBottom:'48px' }}>
          <div style={{ fontSize:'32px', marginBottom:'16px' }}>🔥</div>
          <p style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(18px,3vw,26px)', fontStyle:'italic', color:'#fff', lineHeight:1.6, marginBottom:'16px' }}>
            "I built Z2B TABLE BANQUET to establish systems that outlive us."
          </p>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, maxWidth:'560px', margin:'0 auto 20px' }}>
            Jobs pay bills — but they do not create inheritance. Your children cannot inherit your job and CV. But they can inherit your income-generating business systems.
          </p>
          <p style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'#D4AF37', marginBottom:'4px' }}>Rev Mokoro Manana</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>Founder & CEO · Zero2Billionaires / Z2B Legacy Builders</p>
          <p style={{ fontSize:'14px', color:'rgba(212,175,55,0.5)', marginTop:'16px', fontStyle:'italic' }}>#Reka_Obesa_Okatuka</p>
        </div>

        {/* SCRIPTURE */}
        <div style={{ textAlign:'center', padding:'24px', borderTop:'1px solid rgba(212,175,55,0.1)', marginBottom:'40px' }}>
          <p style={{ fontStyle:'italic', fontSize:'15px', color:'rgba(212,175,55,0.6)', marginBottom:'4px' }}>"The plans of the diligent lead surely to abundance."</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>— Proverbs 21:5</p>
        </div>

        {/* FOUNDERS WALL */}
        {founders.length > 0 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:'28px' }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'3px', color:'rgba(212,175,55,0.6)', marginBottom:'8px' }}>HALL OF BUILDERS</div>
              <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(20px,3vw,32px)', fontWeight:700, color:'#fff', margin:'0 0 8px' }}>Those Who Answered the Call</h2>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>{founders.length} Legacy Builder{founders.length!==1?'s':''} have taken their seat at the table</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px' }}>
              {founders.map((f, i) => (
                <div key={i} style={{ background:`${TIER_COLOR[f.paid_tier]||'#6B7280'}0D`, border:`1px solid ${TIER_COLOR[f.paid_tier]||'#6B7280'}33`, borderRadius:'14px', padding:'16px 12px', textAlign:'center' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:`${TIER_COLOR[f.paid_tier]||'#6B7280'}18`, border:`1.5px solid ${TIER_COLOR[f.paid_tier]||'#6B7280'}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color:TIER_COLOR[f.paid_tier]||'#6B7280', margin:'0 auto 8px' }}>
                    {f.full_name?.charAt(0)?.toUpperCase()||'?'}
                  </div>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>{f.full_name?.split(' ')[0]||'Builder'}</div>
                  <div style={{ fontSize:'10px', color:TIER_COLOR[f.paid_tier]||'#6B7280', fontWeight:700 }}>{(f.paid_tier||'').toUpperCase()}</div>
                  {f.rank && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>{f.rank}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign:'center', marginTop:'48px' }}>
          <Link href="/signup" style={{ display:'inline-block', padding:'16px 40px', background:'linear-gradient(135deg,#B8860B,#D4AF37)', border:'none', borderRadius:'50px', color:'#000', fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'15px', textDecoration:'none', boxShadow:'0 0 30px rgba(212,175,55,0.25)' }}>
            🔥 Take Your Seat at the Table
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
