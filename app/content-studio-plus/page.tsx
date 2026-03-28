'use client'
// v2026-03-28 — Z2B Content Engine: 7-day pack + posting lessons
// FILE: app/content-studio-plus/page.tsx

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import BufferConnect from '@/components/BufferConnect'
import { Suspense } from 'react'

type Platform   = 'facebook' | 'instagram' | 'tiktok'
type ContentDay = {
  day: number; date: string; platform: Platform
  type: 'text'|'image-caption'|'video-script'|'story'|'reel-script'
  theme: string; caption: string; body: string; hashtags: string
  imagePrompt?: string; videoScript?: string; storyScript?: string
  copied: boolean
}

const WEEK_BLUEPRINT = [
  { day:1, platform:'facebook'  as Platform, type:'text'          as const, theme:'Pain Point — The Employee Reality'    },
  { day:2, platform:'instagram' as Platform, type:'image-caption' as const, theme:'Quote from Coach Manlaw'               },
  { day:3, platform:'tiktok'    as Platform, type:'reel-script'   as const, theme:'3 Income Streams Explained in 60 Secs' },
  { day:4, platform:'facebook'  as Platform, type:'text'          as const, theme:'Founder Story — Real and Personal'     },
  { day:5, platform:'instagram' as Platform, type:'story'         as const, theme:'Before and After Transformation'       },
  { day:6, platform:'tiktok'    as Platform, type:'video-script'  as const, theme:'I Need Money Now — 3 Steps'            },
  { day:7, platform:'facebook'  as Platform, type:'image-caption' as const, theme:'Join the Table — Direct Invitation'    },
]

const PC: Record<Platform,string> = { facebook:'#1877F2', instagram:'#E1306C', tiktok:'#2d2d2d' }

const HACKS = [
  {
    platform:'facebook' as Platform, color:'#1877F2',
    title:'Facebook — The Long Game',
    lessons:[
      { t:'Best posting times', b:'Wednesday 11am–1pm and Thursday 1–3pm SAST. Facebook rewards consistent posting — same days every week.' },
      { t:'7-Day Facebook Strategy', b:'3 posts per week is the sweet spot:\n• Day 1: Pain point text post (emotional hook)\n• Day 4: Personal story post (builds trust)\n• Day 7: Direct invitation with link\n\nMore posts does not mean more reach on Facebook.' },
      { t:'Facebook Creator Studio hack', b:'Go to Facebook.com/creatorstudio (free, built into Facebook). Write all 3 of your Facebook posts on Monday. Schedule them for Tuesday, Thursday and Sunday. Done for the entire week in 10 minutes.' },
      { t:'Groups hack — free prospects', b:'Find 5 Facebook groups where employees gather: government workers, teachers, nurses, retail staff, call centre workers.\n\nPost your Day 1 pain point post in those groups. No selling — just truth and your link at the bottom. Groups reach people who are not your friends yet.' },
      { t:'Facebook Story (5-minute hack)', b:'Screenshot your Instagram Story script. Open Facebook. Create a Story. Type it out as 3 slides. Takes 5 minutes. Reaches a completely different audience than your main feed.' },
    ]
  },
  {
    platform:'instagram' as Platform, color:'#E1306C',
    title:'Instagram — The Visual Shortcut',
    lessons:[
      { t:'Best posting times', b:'Tuesday and Friday 9–11am SAST for feed posts. Reels get pushed any time of day — post Reels whenever they are ready, not on a schedule.' },
      { t:'7-Day Instagram Strategy', b:'2 posts per week minimum:\n• Day 2: Motivational quote image (tap "Save this post" = more reach)\n• Day 5: Story sequence — 3 slides: Pain → Solution → Link\n\nBonus: Post your TikTok video to Instagram Reels. Same video. Double the reach.' },
      { t:'Story Slides — 3 taps', b:'Your Story script has 3 parts. Create 3 Story slides using Canva free:\n• Slide 1: The pain question\n• Slide 2: Z2B as the solution\n• Slide 3: "Link in bio" with the link\n\nUse a purple/gold Canva template. Takes 5 minutes to set up once.' },
      { t:'Reels watermark hack', b:'Post your TikTok video to Instagram Reels WITHOUT the TikTok watermark. Instagram penalises content with TikTok logos.\n\nUse SnapTik.app (free) to download your video without the watermark before uploading to Instagram.' },
      { t:'Link in bio — one link rule', b:'Instagram only allows one clickable link. Use Linktree.com (free) or bio.link (free) to put your Z2B referral link there permanently.\n\nWrite "Link in bio 👆" at the end of every caption. Never post the full URL in the caption — it does not work as a link on Instagram.' },
    ]
  },
  {
    platform:'tiktok' as Platform, color:'#2d2d2d',
    title:'TikTok — The Fastest Reach',
    lessons:[
      { t:'Best posting times', b:'Monday, Wednesday and Friday 7–9am or 7–9pm SAST. TikTok algorithm is less time-sensitive than other platforms — but consistency and frequency matter more than timing.' },
      { t:'7-Day TikTok Strategy', b:'2 videos per week:\n• Day 3: Explain 3 income streams (talking head, 60 seconds)\n• Day 6: "I need money now" — 3 real actionable steps\n\nPost both videos also to Instagram Reels and YouTube Shorts. 3x reach from 1 video.' },
      { t:'The 3-second hook rule', b:'Your first 3 seconds determine everything on TikTok. The app generates your hook — always start with one of these patterns:\n• "Nobody told you this about your salary..."\n• "3 income streams you can start this week..."\n• "I was broke. Here is what changed everything..."\n\nThe viewer decides in 3 seconds. Hook them or lose them.' },
      { t:'One-take recording hack', b:'Read the video script once before recording. Then record in one take — looking straight at the camera. Imperfect is more authentic on TikTok. Authenticity gets shared.\n\nAfter recording: tap the Captions button in TikTok — it auto-generates subtitles. This alone doubles watch time because many people watch without sound.' },
      { t:'Hashtag strategy — 5 only', b:'Use exactly 5 hashtags:\n• 2 large: #sidehustle #financialfreedom\n• 2 branded: #Z2BTableBanquet #EntrepreneurialConsumer\n• 1 niche: #southafricanbusiness or #makemoneysouthafrica\n\nThe app includes the right hashtags automatically in every post.' },
    ]
  },
]

function ContentStudioPlusPageInner() {
  const [profile,        setProfile]       = useState<any>(null)
  const [subscription,   setSubscription]  = useState<string|null>(null)
  const [activeTab,      setActiveTab]     = useState<'intro'|'generate'|'pack'|'lessons'>('intro')
  const [generating,     setGenerating]    = useState(false)
  const [genStep,        setGenStep]       = useState(0)
  const [weekPack,       setWeekPack]      = useState<ContentDay[]>([])
  const [refCode,        setRefCode]       = useState('Z2BREF')
  const [bufferChannels, setBufCh]         = useState<any[]>([])
  const [bufferToken,    setBufTok]        = useState<string|null>(null)
  const [error,          setError]         = useState('')
  const [justActivated,  setJustActivated]  = useState(false)
  const [credits,        setCredits]       = useState(0)
  const [inviteCount,    setInviteCount]   = useState(0)
  const [planActive,     setPlanActive]    = useState(false)
  const [planName,       setPlanName]      = useState<string|null>(null)
  const [expandedDay,    setExpandedDay]   = useState<number|null>(1)
  const [expandedHack,   setExpandedHack]  = useState<string|null>(null)
  const [copiedDay,      setCopiedDay]     = useState<number|null>(null)
  const packRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('activated') === 'true') setJustActivated(true)
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: prof }, { data: flag }, { data: buf }, { data: cred }] = await Promise.all([
        supabase.from('profiles').select('full_name,paid_tier,referral_code,user_role').eq('id', user.id).single(),
        supabase.from('feature_flags').select('enabled,plan').eq('user_id', user.id).eq('feature','content_studio').single(),
        supabase.from('builder_buffer_tokens').select('access_token,channels_json').eq('user_id', user.id).single(),
        supabase.from('ce_credits').select('credits,invite_count,plan,plan_active').eq('user_id', user.id).single(),
      ])
      setProfile(prof)
      setRefCode(prof?.referral_code || 'Z2BREF')

      // Admin check — ceo/superadmin/admin get Elite automatically, no flag needed
      const role = prof?.user_role || ''
      const isAdmin = ['ceo','superadmin','admin'].includes(role)

      if (isAdmin) {
        // Admin: full access always — no feature flag required
        setSubscription('elite')
        setPlanActive(true)
        setPlanName('elite')
      } else if (flag?.enabled) {
        // Builder with flag enabled
        setSubscription(flag.plan || 'invite')
        if (cred) {
          setCredits(cred.credits || 0)
          setInviteCount(cred.invite_count || 0)
          setPlanActive(cred.plan_active || false)
          setPlanName(cred.plan || 'invite')
        } else {
          // Flag enabled but no credit row yet — still give invite access
          setSubscription('invite')
        }
      } else if (cred?.plan_active) {
        // Paid plan exists even if flag not set — grant access
        setSubscription(cred.plan || 'starter')
        setPlanActive(true)
        setPlanName(cred.plan || 'starter')
        setCredits(cred.credits || 0)
      }
      if (buf?.access_token) {
        setBufTok(buf.access_token)
        if (buf.channels_json) setBufCh(JSON.parse(buf.channels_json))
      }
    })
  }, [])

  const refLink = `https://app.z2blegacybuilders.co.za/signup?ref=${refCode}`

  const initiatePayment = async (tier: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch('/api/yoco', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'create_checkout',
        user_id:  user.id,
        ref_code: refCode,
        tier,
      }),
    })
    const data = await res.json()
    if (data.redirectUrl) window.location.href = data.redirectUrl
  }

  const generatePack = async () => {
    if (!subscription) return
    // Check credits
    const isAdmin = planName === 'elite'
    const hasPaidPlan = planActive && planName && ['starter','pro','elite'].includes(planName)
    if (!isAdmin && !hasPaidPlan && credits < 1) {
      setError('No credits available. Invite 4 people who complete Session 1 to earn a credit — or upgrade to a paid plan.')
      return
    }
    setGenerating(true); setError(''); setGenStep(0)
    const pack: ContentDay[] = []
    const today = new Date()
    try {
      for (let i = 0; i < WEEK_BLUEPRINT.length; i++) {
        const bp = WEEK_BLUEPRINT[i]
        setGenStep(i + 1)
        const d = new Date(today); d.setDate(today.getDate() + i)
        const dateStr = d.toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'short' })
        const typeGuide =
          bp.type==='text'          ? 'Facebook text post. Long-form, emotional, story-driven. 150-250 words. Ends with referral link.' :
          bp.type==='image-caption' ? 'Short punchy caption for image post. 2-3 lines. Include image description. Link in bio CTA.' :
          bp.type==='reel-script'   ? '60-second TikTok/Reel script. HOOK (0-3s): one shocking line. CONTENT (3-50s): 3 clear points. CTA (50-60s): link.' :
          bp.type==='video-script'  ? '60-second talking-head script. Each sentence short. HOOK then 3 steps then call to action.' :
                                      'Instagram Story — 3 slides. Slide 1: Pain question. Slide 2: Z2B solution. Slide 3: Link CTA.'
        const res = await fetch('/api/coach-manlaw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemPrompt: `You are Coach Manlaw — the AI content engine for Z2B Table Banquet by Rev Mokoro Manana (Zero2Billionaires Amavulandlela Pty Ltd).

MISSION: Write social media content that attracts employed South Africans aged 25–50 who want financial freedom.
BUILDER REFERRAL LINK: ${refLink}
PLATFORM: ${bp.platform.toUpperCase()}
CONTENT TYPE: ${typeGuide}
THEME: ${bp.theme}

RULES:
- Write in first person as if the builder is speaking from their own experience
- Referral link MUST appear naturally in the post body
- Never use "MLM" or "pyramid scheme"
- Speak to pain first, then hope, then the link
- South African context where relevant
- End with: "Link in bio 👆" or "Comment YES and I'll send you the link"

Return ONLY valid JSON:
{"caption":"HOOK IN CAPS","body":"full post with ${refLink}","hashtags":"#Z2BTableBanquet #RekaobesaOkatuka #EntrepreneurialConsumer #sidehustle #financialfreedom","imagePrompt":"visual description"${bp.type==='reel-script'||bp.type==='video-script'?',"videoScript":"HOOK:\\nCONTENT:\\nCTA:"':''}${bp.type==='story'?',"storyScript":"Slide 1:\\nSlide 2:\\nSlide 3:"':''}}`,
            messages: [{ role:'user', content:`Generate ${bp.platform} ${bp.type} post: ${bp.theme}` }],
          }),
        })
        const data = await res.json()
        const text = data?.content?.[0]?.text || ''
        let parsed: any = {}
        try { parsed = JSON.parse(text.replace(/```json|```/g,'').trim()) }
        catch { parsed = { caption: bp.theme, body: text, hashtags: '#Z2BTableBanquet #EntrepreneurialConsumer' } }
        pack.push({
          day:bp.day, date:dateStr, platform:bp.platform, type:bp.type, theme:bp.theme,
          caption:parsed.caption||bp.theme, body:parsed.body||'', hashtags:parsed.hashtags||'#Z2BTableBanquet',
          imagePrompt:parsed.imagePrompt, videoScript:parsed.videoScript, storyScript:parsed.storyScript,
          copied:false,
        })
      }
      setWeekPack(pack)
      // Consume one credit
      if (!isAdmin && !hasPaidPlan) {
        const { data:{ user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.rpc('consume_ce_credit', { builder_user_id: user.id })
          setCredits(c => Math.max(0, c - 1))
        }
      }
      setActiveTab('pack')
      setTimeout(() => packRef.current?.scrollIntoView({ behavior:'smooth' }), 200)
    } catch(e:any) { setError('Generation failed. Please try again.') }
    setGenerating(false); setGenStep(0)
  }

  const copyDay = (day: ContentDay) => {
    const parts = [day.caption,'',day.body,'',day.hashtags]
    if (day.videoScript) parts.push('','--- VIDEO SCRIPT ---',day.videoScript)
    if (day.storyScript) parts.push('','--- STORY SLIDES ---',day.storyScript)
    navigator.clipboard.writeText(parts.filter(Boolean).join('\n'))
    setCopiedDay(day.day)
    setTimeout(() => setCopiedDay(null), 3000)
    setWeekPack(p => p.map(d => d.day===day.day ? {...d, copied:true} : d))
  }

  const tab  = (a:boolean) => ({ padding:'10px 18px', borderRadius:'20px', border:`1.5px solid ${a?'rgba(212,175,55,0.4)':'rgba(255,255,255,0.1)'}`, background:a?'rgba(212,175,55,0.1)':'rgba(255,255,255,0.04)', color:a?'#D4AF37':'rgba(255,255,255,0.4)', fontSize:'13px', fontWeight:700 as const, cursor:'pointer' as const, fontFamily:'Georgia,serif' })
  const plat = (p:Platform) => ({ padding:'4px 12px', background:`${PC[p]}15`, border:`1px solid ${PC[p]}44`, borderRadius:'20px', fontSize:'11px', fontWeight:700 as const, color:PC[p] })

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E)', color:'#F5F3FF', fontFamily:'Georgia,serif' }}>

      {/* NAV */}
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(12px)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ fontSize:'13px', color:'rgba(196,181,253,0.6)', textDecoration:'none' }}>← Dashboard</Link>
        <span style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'#D4AF37' }}>📱 Z2B Content Engine</span>
        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>{subscription?.toUpperCase()||'NO ACCESS'}</span>
      </div>

      <div style={{ maxWidth:'780px', margin:'0 auto', padding:'20px 16px 80px' }}>

        {/* TABS */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', margin:'20px 0 24px' }}>
          {([['intro','◎ How It Works'],['generate','⚡ Generate Week'],['pack','📦 My 7-Day Pack'],['lessons','📚 Posting Lessons']] as const).map(([id,lbl]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={tab(activeTab===id)}>{lbl}</button>
          ))}
        </div>

        {/* ── Welcome banner after purchase ── */}
        {justActivated && (
          <div style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(76,29,149,0.15))', border:'1.5px solid rgba(16,185,129,0.4)', borderRadius:'16px', padding:'20px 24px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{ fontSize:'36px' }}>🎉</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'16px', fontWeight:700, color:'#6EE7B7', marginBottom:'4px' }}>
                Content Engine Activated!
              </div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>
                Your plan is active. Click <strong style={{ color:'#D4AF37' }}>Generate Week</strong> to create your first 7-day content pack right now.
              </div>
            </div>
            <button onClick={() => { setJustActivated(false); setActiveTab('generate') }}
              style={{ padding:'10px 20px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'1.5px solid #D4AF37', borderRadius:'10px', color:'#F5D060', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Cinzel,serif', whiteSpace:'nowrap' as const }}>
              ⚡ Generate Now
            </button>
          </div>
        )}

        {/* ═══ INTRO ═══ */}
        {activeTab==='intro' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,rgba(76,29,149,0.3),rgba(212,175,55,0.06))', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'32px 24px', marginBottom:'24px', textAlign:'center' }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'10px', letterSpacing:'3px', color:'rgba(212,175,55,0.55)', marginBottom:'12px' }}>Z2B CONTENT ENGINE</div>
              <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,4vw,30px)', fontWeight:900, color:'#fff', margin:'0 0 14px', lineHeight:1.25 }}>
                The App Creates.<br/><span style={{ color:'#D4AF37' }}>You Post. Prospects Join.</span>
              </h1>
              <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.65)', lineHeight:1.85, maxWidth:'520px', margin:'0 auto 24px' }}>
                You do not need to think about what to write. You do not need to be a copywriter or a marketing expert. This engine creates a complete 7-day content pack — one post per day across Facebook, Instagram and TikTok — with your referral link already inside every post. Your only job is to copy and paste.
              </p>
              <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
                <button onClick={() => setActiveTab('generate')} style={{ padding:'14px 28px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Cinzel,serif' }}>
                  ⚡ Generate My 7-Day Pack
                </button>
                <button onClick={() => setActiveTab('lessons')} style={{ padding:'14px 28px', background:'transparent', border:'1.5px solid rgba(16,185,129,0.4)', borderRadius:'12px', color:'#6EE7B7', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  📚 See Posting Lessons
                </button>
              </div>
            </div>

            {/* 4 Steps */}
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'2px', color:'rgba(212,175,55,0.5)', textAlign:'center', marginBottom:'16px' }}>HOW IT WORKS — 4 STEPS</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'28px' }}>
              {[
                { n:'01', icon:'⚡', t:'App Generates Everything', b:'One click. 7 posts for 7 days — Facebook text posts, Instagram captions, TikTok scripts, Story slides. Your referral link is inside every single post automatically.' },
                { n:'02', icon:'📋', t:'You Copy in One Tap', b:'Each post has a single Copy button. Tap it — the full caption, body and hashtags go to your clipboard. Nothing to type. Nothing to edit.' },
                { n:'03', icon:'📱', t:'You Open the App and Paste', b:'Open Facebook, Instagram or TikTok. Create a post. Paste. For video posts — read the script to camera. It takes 2 minutes. The engine saved you 3 hours of thinking.' },
                { n:'04', icon:'🔗', t:'Prospects Click. You Earn.', b:'Every post drives people to your Z2B signup page with your referral code embedded. When they register and upgrade — your commission activates. The content does the selling.' },
              ].map(s => (
                <div key={s.n} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>{s.icon}</div>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:'9px', letterSpacing:'1px', color:'rgba(212,175,55,0.5)' }}>STEP {s.n}</div>
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{s.t}</div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.58)', lineHeight:1.7 }}>{s.b}</div>
                </div>
              ))}
            </div>

            {/* What's in the pack */}
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'2px', color:'rgba(212,175,55,0.5)', textAlign:'center', marginBottom:'14px' }}>YOUR 7-DAY PACK INCLUDES</div>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px', marginBottom:'24px' }}>
              {WEEK_BLUEPRINT.map((bp,i) => {
                const d=new Date(); d.setDate(d.getDate()+i)
                return (
                  <div key={bp.day} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:i<6?'1px solid rgba(255,255,255,0.05)':'none' }}>
                    <div style={{ width:'24px', fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.3)', fontFamily:'Cinzel,serif', flexShrink:0 }}>{bp.day}</div>
                    <span style={plat(bp.platform)}>{bp.platform}</span>
                    <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', flex:1 }}>{bp.theme}</span>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', textTransform:'capitalize' }}>{bp.type.replace('-',' ')}</span>
                  </div>
                )
              })}
            </div>

            {!subscription ? (
              <div style={{ textAlign:'center', padding:'24px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'14px' }}>
                <div style={{ fontSize:'15px', fontWeight:700, color:'#FCA5A5', marginBottom:'6px' }}>Access Not Yet Enabled</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)' }}>Your admin needs to enable Content Studio for your account — or invite 4 people who complete Session 1 to earn a free credit.</div>
              </div>
            ) : (
              <div style={{ textAlign:'center' }}>
                <button onClick={() => setActiveTab('generate')} style={{ padding:'14px 32px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'16px', cursor:'pointer', fontFamily:'Cinzel,serif' }}>
                  ⚡ Generate My 7-Day Pack
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ GENERATE ═══ */}
        {activeTab==='generate' && (
          <div>
            {!subscription ? (
              <div style={{ textAlign:'center', padding:'48px 24px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'16px' }}>
                <div style={{ fontSize:'18px', fontWeight:700, color:'#FCA5A5', marginBottom:'10px' }}>Access Not Yet Active</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>Invite 4 people who complete Session 1 to earn a free credit — or upgrade below.</div>
                <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
                  <button onClick={() => initiatePayment('ce_starter')} style={{ padding:'12px 20px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Starter — R400/month</button>
                  <button onClick={() => initiatePayment('ce_pro')} style={{ padding:'12px 20px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'10px', color:'#C4B5FD', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Pro — R900/month</button>
                </div>
              </div>
            ) : (
              <>
                {/* ── Credit Dashboard ── */}
                <div style={{ marginBottom:'16px' }}>
                  {planActive && planName && ['pro','elite'].includes(planName) ? (
                    /* Paid plan */
                    <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(76,29,149,0.1))', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'14px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px' }}>
                      <div style={{ fontSize:'28px' }}>♾️</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'15px', fontWeight:700, color:'#D4AF37', marginBottom:'2px' }}>{planName?.toUpperCase()} Plan — Unlimited Packs</div>
                        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>R{planName==='pro'?'900':'400'}/month · Auto-renews · Generate as many packs as you need</div>
                      </div>
                    </div>
                  ) : (
                    /* Invite credits */
                    <div style={{ background:'rgba(255,255,255,0.03)', border:`1.5px solid ${credits>0?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.1)'}`, borderRadius:'14px', padding:'16px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
                        <div>
                          <div style={{ fontSize:'15px', fontWeight:700, color:credits>0?'#6EE7B7':'#fff', marginBottom:'2px' }}>
                            {credits > 0 ? `${credits} Pack Credit${credits>1?'s':''} Available` : 'No Credits Yet'}
                          </div>
                          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>
                            {inviteCount} qualified invite{inviteCount!==1?'s':''} · Every 4 who complete Session 1 = 1 credit
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, color:credits>0?'#6EE7B7':'rgba(255,255,255,0.2)' }}>{credits}</div>
                          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>credit{credits!==1?'s':''}</div>
                        </div>
                      </div>
                      {/* Progress to next credit */}
                      {(() => {
                        const progressInBatch = inviteCount % 4
                        const needed = 4 - progressInBatch
                        return (
                          <div>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                              <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Progress to next credit</span>
                              <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{progressInBatch}/4 invites</span>
                            </div>
                            <div style={{ display:'flex', gap:'4px', marginBottom:'10px' }}>
                              {[1,2,3,4].map(n => (
                                <div key={n} style={{ flex:1, height:'8px', borderRadius:'4px', background: n<=progressInBatch?'#10B981':'rgba(255,255,255,0.08)' }} />
                              ))}
                            </div>
                            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', fontStyle:'italic' }}>
                              {progressInBatch===0 && credits===0
                                ? 'Invite 4 people who complete Session 1 to earn your first free credit'
                                : `${needed} more invite${needed!==1?'s':''} needed for your next credit`}
                            </div>
                          </div>
                        )
                      })()}
                      {/* Upgrade — payment buttons */}
                      <div style={{ marginTop:'14px', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px' }}>
                        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginBottom:'10px' }}>Or upgrade for unlimited packs:</div>
                        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                          <button onClick={() => initiatePayment('ce_starter')}
                            style={{ flex:1, padding:'10px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif', textAlign:'left' as const }}>
                            <div>Starter — R400/month</div>
                            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', fontWeight:400, marginTop:'2px' }}>Unlimited packs · Text + scripts</div>
                          </button>
                          <button onClick={() => initiatePayment('ce_pro')}
                            style={{ flex:1, padding:'10px 14px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'10px', color:'#C4B5FD', fontWeight:700, fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif', textAlign:'left' as const }}>
                            <div>Pro — R900/month</div>
                            <div style={{ fontSize:'11px', color:'rgba(196,181,253,0.5)', fontWeight:400, marginTop:'2px' }}>Unlimited · All features · Priority</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <BufferConnect compact={bufferChannels.length>0} onChannelsLoaded={(ch) => {
                  setBufCh(ch)
                  supabase.auth.getUser().then(({ data:{ user } }) => {
                    if (user) supabase.from('builder_buffer_tokens').select('access_token').eq('user_id',user.id).single()
                      .then(({ data }) => { if (data) setBufTok(data.access_token) })
                  })
                }} />

                {/* Week preview */}
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1.5px solid rgba(212,175,55,0.2)', borderRadius:'14px', padding:'18px', marginBottom:'20px' }}>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'2px', color:'rgba(212,175,55,0.5)', marginBottom:'14px' }}>POSTS THAT WILL BE GENERATED</div>
                  {WEEK_BLUEPRINT.map((bp,i) => {
                    const d=new Date(); d.setDate(d.getDate()+i)
                    const done = weekPack.find(w=>w.day===bp.day)
                    return (
                      <div key={bp.day} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:i<6?'1px solid rgba(255,255,255,0.05)':'none' }}>
                        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', width:'90px', flexShrink:0 }}>{d.toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short'})}</span>
                        <span style={plat(bp.platform)}>{bp.platform}</span>
                        <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', flex:1 }}>{bp.theme}</span>
                        {done && <span style={{ fontSize:'11px', color:'#6EE7B7', fontWeight:700 }}>✓</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Progress */}
                {generating && (
                  <div style={{ background:'rgba(255,255,255,0.03)', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'14px', padding:'20px', marginBottom:'20px', textAlign:'center' }}>
                    <div style={{ fontSize:'14px', color:'#D4AF37', fontWeight:700, marginBottom:'16px' }}>Coach Manlaw is writing your content...</div>
                    <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginBottom:'14px' }}>
                      {WEEK_BLUEPRINT.map(bp => (
                        <div key={bp.day} style={{ width:'36px', height:'36px', borderRadius:'50%', background:genStep>bp.day?'#10B981':genStep===bp.day?'#D4AF37':'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:genStep>=bp.day?'#fff':'rgba(255,255,255,0.3)', transition:'all 0.3s' }}>
                          {genStep>bp.day?'✓':bp.day}
                        </div>
                      ))}
                    </div>
                    <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(genStep/7)*100}%`, background:'linear-gradient(90deg,#4C1D95,#D4AF37)', borderRadius:'2px', transition:'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'10px' }}>
                      {genStep>0 ? `Day ${genStep} — ${WEEK_BLUEPRINT[genStep-1]?.platform} ${WEEK_BLUEPRINT[genStep-1]?.type}...` : 'Starting...'}
                    </div>
                  </div>
                )}

                {error && <div style={{ padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', marginBottom:'14px', fontSize:'13px', color:'#FCA5A5' }}>⚠️ {error}</div>}

                <button onClick={generatePack} disabled={generating}
                  style={{ width:'100%', padding:'18px', background:generating?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#2D1B69,#4C1D95)', border:generating?'1.5px solid rgba(255,255,255,0.08)':'1.5px solid #D4AF37', borderRadius:'14px', color:generating?'rgba(255,255,255,0.25)':'#F5D060', fontWeight:700, fontSize:'17px', cursor:generating?'not-allowed':'pointer', fontFamily:'Cinzel,serif' }}>
                  {generating ? `Writing Day ${genStep} of 7...` : weekPack.length>0 ? '⚡ Regenerate My 7-Day Pack' : '⚡ Generate My 7-Day Pack — Free'}
                </button>

                {weekPack.length>0 && !generating && (
                  <div style={{ textAlign:'center', marginTop:'14px' }}>
                    <button onClick={() => setActiveTab('pack')} style={{ padding:'12px 28px', background:'rgba(16,185,129,0.1)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'12px', color:'#6EE7B7', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                      📦 View My 7-Day Pack →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ PACK ═══ */}
        {activeTab==='pack' && (
          <div ref={packRef}>
            {weekPack.length===0 ? (
              <div style={{ textAlign:'center', padding:'60px 24px' }}>
                <div style={{ fontSize:'48px', marginBottom:'16px' }}>📦</div>
                <div style={{ fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'10px' }}>No Pack Generated Yet</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.4)', marginBottom:'24px' }}>Go to Generate Week to create your 7-day content pack.</div>
                <button onClick={() => setActiveTab('generate')} style={{ padding:'14px 28px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Cinzel,serif' }}>⚡ Generate Now</button>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
                  <div>
                    <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', color:'#D4AF37', margin:'0 0 4px' }}>Your 7-Day Content Pack</h2>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>{weekPack.filter(d=>d.copied).length} of 7 copied · Open each day and copy when ready to post</div>
                  </div>
                  <button onClick={() => setActiveTab('generate')} style={{ padding:'9px 18px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif' }}>⚡ Regenerate</button>
                </div>

                {/* Progress */}
                <div style={{ marginBottom:'20px' }}>
                  <div style={{ height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(weekPack.filter(d=>d.copied).length/7)*100}%`, background:'linear-gradient(90deg,#4C1D95,#D4AF37)', borderRadius:'3px', transition:'width 0.4s' }} />
                  </div>
                </div>

                {weekPack.map(day => (
                  <div key={day.day} style={{ marginBottom:'10px', border:`1.5px solid ${day.copied?'rgba(16,185,129,0.3)':expandedDay===day.day?PC[day.platform]+'44':'rgba(255,255,255,0.08)'}`, borderRadius:'14px', overflow:'hidden', background:day.copied?'rgba(16,185,129,0.03)':'rgba(255,255,255,0.03)' }}>

                    {/* Header */}
                    <div onClick={() => setExpandedDay(expandedDay===day.day?null:day.day)}
                      style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
                      <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${PC[day.platform]}18`, border:`1.5px solid ${PC[day.platform]}44`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:PC[day.platform], flexShrink:0 }}>
                        {day.day}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                          <span style={plat(day.platform)}>{day.platform}</span>
                          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textTransform:'capitalize' }}>{day.type.replace('-',' ')}</span>
                          {day.copied && <span style={{ fontSize:'11px', color:'#6EE7B7', fontWeight:700 }}>✓ Copied</span>}
                        </div>
                        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginTop:'3px' }}>{day.date} · {day.theme}</div>
                      </div>
                      <div style={{ fontSize:'18px', color:'rgba(255,255,255,0.3)', transform:expandedDay===day.day?'rotate(180deg)':'none', transition:'transform 0.2s' }}>▾</div>
                    </div>

                    {expandedDay===day.day && (
                      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'16px' }}>

                        <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'1px', marginBottom:'6px' }}>CAPTION / HOOK</div>
                        <div style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'14px', padding:'10px 14px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', lineHeight:1.5 }}>{day.caption}</div>

                        <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'1px', marginBottom:'6px' }}>POST BODY</div>
                        <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.75)', marginBottom:'14px', padding:'12px 14px', background:'rgba(255,255,255,0.04)', borderRadius:'8px', lineHeight:1.85, whiteSpace:'pre-wrap' }}>{day.body}</div>

                        <div style={{ fontSize:'13px', color:'rgba(124,58,237,0.8)', marginBottom:'14px', fontStyle:'italic' }}>{day.hashtags}</div>

                        {day.videoScript && (
                          <>
                            <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(239,68,68,0.6)', letterSpacing:'1px', marginBottom:'6px' }}>VIDEO SCRIPT — READ TO CAMERA</div>
                            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.75)', marginBottom:'14px', padding:'12px 14px', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'8px', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{day.videoScript}</div>
                          </>
                        )}

                        {day.storyScript && (
                          <>
                            <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(225,48,108,0.7)', letterSpacing:'1px', marginBottom:'6px' }}>STORY SLIDES — 3 SCREENS</div>
                            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.75)', marginBottom:'14px', padding:'12px 14px', background:'rgba(225,48,108,0.05)', border:'1px solid rgba(225,48,108,0.15)', borderRadius:'8px', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{day.storyScript}</div>
                          </>
                        )}

                        {day.imagePrompt && (
                          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', marginBottom:'14px', fontStyle:'italic' }}>
                            📸 Image idea for Canva: {day.imagePrompt}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                          <button onClick={() => copyDay(day)}
                            style={{ flex:1, padding:'13px', background:copiedDay===day.day?'rgba(16,185,129,0.15)':'rgba(212,175,55,0.1)', border:`1.5px solid ${copiedDay===day.day?'rgba(16,185,129,0.4)':'rgba(212,175,55,0.3)'}`, borderRadius:'10px', color:copiedDay===day.day?'#6EE7B7':'#F5D060', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                            {copiedDay===day.day ? '✅ Copied! Open the app and paste' : '📋 Copy Full Post'}
                          </button>
                          <a href={day.platform==='facebook'?'https://www.facebook.com':day.platform==='instagram'?'https://www.instagram.com':'https://www.tiktok.com'}
                            target="_blank" rel="noreferrer"
                            style={{ padding:'13px 20px', background:`${PC[day.platform]}18`, border:`1.5px solid ${PC[day.platform]}44`, borderRadius:'10px', color:PC[day.platform], fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            Open {day.platform.charAt(0).toUpperCase()+day.platform.slice(1)} →
                          </a>
                        </div>

                        <div style={{ marginTop:'10px', padding:'9px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', fontSize:'12px', color:'rgba(255,255,255,0.35)', fontStyle:'italic' }}>
                          💡 Copy → Open {day.platform} → Create Post → Paste → Add image/video if needed → Post
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ═══ LESSONS ═══ */}
        {activeTab==='lessons' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'20px', color:'#D4AF37', margin:'0 0 10px' }}>Posting Lessons and Hacks</h2>
              <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:'560px', margin:'0 auto' }}>
                The Content Engine creates every post. These lessons teach you how to use each platform's features so your posts reach the right people — 4 new prospects every day.
              </p>
            </div>

            {HACKS.map(h => (
              <div key={h.platform} style={{ marginBottom:'16px', border:`1.5px solid ${h.color}33`, borderRadius:'16px', overflow:'hidden' }}>
                <div style={{ background:`${h.color}18`, padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${h.color}25`, border:`1.5px solid ${h.color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:900, color:h.color, fontFamily:'Georgia,serif', flexShrink:0 }}>
                    {h.platform==='facebook'?'f':h.platform==='instagram'?'◉':'♪'}
                  </div>
                  <div>
                    <div style={{ fontSize:'16px', fontWeight:700, color:'#fff', fontFamily:'Cinzel,serif' }}>{h.title}</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>{h.lessons.length} lessons</div>
                  </div>
                </div>
                <div style={{ padding:'12px 16px' }}>
                  {h.lessons.map((lesson, li) => {
                    const key = `${h.platform}-${li}`
                    const open = expandedHack===key
                    return (
                      <div key={li} style={{ marginBottom:'8px', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', overflow:'hidden' }}>
                        <div onClick={() => setExpandedHack(open?null:key)}
                          style={{ padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background:open?`${h.color}10`:'transparent' }}>
                          <div style={{ fontSize:'14px', fontWeight:700, color:open?h.color:'rgba(255,255,255,0.75)' }}>{lesson.t}</div>
                          <span style={{ fontSize:'16px', color:'rgba(255,255,255,0.3)', transform:open?'rotate(180deg)':'none', transition:'transform 0.2s' }}>▾</span>
                        </div>
                        {open && (
                          <div style={{ padding:'0 14px 14px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.72)', lineHeight:1.9, marginTop:'12px', whiteSpace:'pre-line' }}>{lesson.b}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* 7-Day Rhythm */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1.5px solid rgba(212,175,55,0.2)', borderRadius:'16px', padding:'20px', marginTop:'8px' }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', letterSpacing:'2px', color:'rgba(212,175,55,0.55)', marginBottom:'16px' }}>YOUR DAILY 7-DAY RHYTHM — 5 TO 10 MINUTES PER DAY</div>
              {[
                { day:'Monday',    col:'#1877F2', t:'Facebook text post — Pain point. Emotional hook. Link at the bottom.' },
                { day:'Tuesday',   col:'#E1306C', t:'Instagram image post — Quote card on Canva. Link in bio.' },
                { day:'Wednesday', col:'#2d2d2d', t:'TikTok Reel — Film in one take. Read the script. Add auto-captions.' },
                { day:'Thursday',  col:'#1877F2', t:'Facebook story post — Personal and real. Your testimony builds trust.' },
                { day:'Friday',    col:'#E1306C', t:'Instagram Story — 3 slides. Pain → Z2B → Link. Done in 5 minutes.' },
                { day:'Saturday',  col:'#2d2d2d', t:'TikTok video — Upload to Instagram Reels + YouTube Shorts. 3x reach, 1 video.' },
                { day:'Sunday',    col:'#1877F2', t:'Facebook invite post — Direct, bold, clear. Post and rest.' },
              ].map((d,i) => (
                <div key={d.day} style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'10px 0', borderBottom:i<6?'1px solid rgba(255,255,255,0.05)':'none' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`${d.col}15`, border:`1px solid ${d.col}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:d.col, flexShrink:0, fontFamily:'Georgia,serif' }}>
                    {d.day.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#fff', marginBottom:'2px' }}>{d.day}</div>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>{d.t}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:'16px', padding:'12px 14px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.18)', borderRadius:'10px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#D4AF37', marginBottom:'5px' }}>Total time: 5–10 minutes per day</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.7 }}>The Content Engine writes everything. You copy and paste. With this rhythm you can realistically attract 4 new prospects per day — 28 per week. Your referral link is in every post. Your table builds while you work.</div>
              </div>
            </div>

            <div style={{ textAlign:'center', marginTop:'24px' }}>
              <button onClick={() => setActiveTab('generate')} style={{ padding:'14px 32px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'16px', cursor:'pointer', fontFamily:'Cinzel,serif' }}>
                ⚡ Generate My 7-Day Pack Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContentStudioPlusPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0A0818', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <ContentStudioPlusPageInner />
    </Suspense>
  )
}
