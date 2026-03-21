'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type ContentType = 'text' | 'text-image' | 'video-script'
type ContentStyle = 'educational' | 'transformation' | 'invitation' | 'motivational'
type Platform = 'facebook' | 'tiktok' | 'both'
type GeneratedPost = { id: string; caption: string; body: string; hashtags: string; imagePrompt?: string; videoScript?: string; approved: boolean; scheduledDate?: string }

const PLANS = [
  { id:'starter', name:'Starter', price:297, posts:30, batch:3, color:'#6B7280', features:['30 AI posts per month','Text posts only','Facebook + TikTok captions','Batch up to 3 at a time','Basic content scheduler','Referral link auto-included'] },
  { id:'pro', name:'Pro', price:597, posts:60, batch:7, color:'#7C3AED', popular:true, features:['60 AI posts per month','Text posts + AI images','60-second video scripts','Batch up to 7 at a time','Advanced scheduler + calendar','Content performance tracking','Referral link auto-included'] },
  { id:'elite', name:'Elite', price:997, posts:-1, batch:7, color:'#D4AF37', features:['Unlimited AI posts','Voice cloning (Phase 2)','Avatar video generation (Phase 2)','Priority content generation','Full analytics dashboard','Auto-publishing when API ready','All Pro features included'] },
]

const SESSIONS = [
  {id:1,title:'The Silent Frustration of Employees'},
  {id:2,title:'Consumption Without Leverage'},
  {id:3,title:'Three Identities in the Marketplace'},
  {id:4,title:'Employees Already Have Assets'},
  {id:5,title:'The TABLE Philosophy'},
  {id:6,title:'Vision Before Execution'},
  {id:7,title:'From SWOT to Opportunity'},
  {id:8,title:'Network Marketing — A Vehicle'},
  {id:9,title:'Your Circle of Twelve'},
  {id:10,title:'Innovators and Early Adopters'},
  {id:14,title:'Copywriting — Words Into Currency'},
  {id:15,title:'Platform Funnel Architecture'},
  {id:20,title:'Your Circle as Economic Incubator'},
  {id:25,title:'Financial Literacy for Builders'},
  {id:30,title:'Psychology of Money'},
  {id:40,title:'Personal Branding'},
  {id:50,title:'WhatsApp as a Platform'},
  {id:60,title:'Goal Setting — Three Horizons'},
  {id:70,title:'Compound Effect'},
  {id:80,title:'Legacy Mindset'},
  {id:90,title:'Wealth Transfer'},
  {id:99,title:'The Commissioning — Go Build the Table'},
]

export default function ContentStudioPlusPage() {
  const [profile, setProfile]           = useState<any>(null)
  const [subscription, setSubscription] = useState<string | null>(null)
  const [activeTab, setActiveTab]       = useState<'plans'|'create'|'schedule'>('plans')
  const [contentType, setContentType]   = useState<ContentType>('text')
  const [contentStyle, setContentStyle] = useState<ContentStyle>('educational')
  const [platform, setPlatform]         = useState<Platform>('both')
  const [batchSize, setBatchSize]       = useState(3)
  const [selectedSession, setSelectedSession] = useState(1)
  const [customTopic, setCustomTopic]   = useState('')
  const [useCustom, setUseCustom]       = useState(false)
  const [generating, setGenerating]     = useState(false)
  const [posts, setPosts]               = useState<GeneratedPost[]>([])
  const [error, setError]               = useState('')
  const [copiedId, setCopiedId]         = useState<string|null>(null)
  const [postsUsed, setPostsUsed]       = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier,referral_code').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
      supabase.from('cs_plus_subscriptions').select('plan,posts_used_this_month').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) { setSubscription(data.plan); setPostsUsed(data.posts_used_this_month||0) } })
    })
  }, [])

  const activePlan     = PLANS.find(p => p.id === subscription)
  const postsRemaining = activePlan ? (activePlan.posts === -1 ? 999 : activePlan.posts - postsUsed) : 0
  const maxBatch       = activePlan?.batch || 1
  const refCode        = profile?.referral_code || 'Z2BREF'
  const refLink        = `https://app.z2blegacybuilders.co.za/signup?ref=${refCode}`

  const handleGenerate = async () => {
    if (!subscription) return
    if (postsRemaining < batchSize) { setError(`Only ${postsRemaining} posts remaining this month.`); return }
    setGenerating(true); setError(''); setPosts([])
    const sessionTitle = SESSIONS.find(s => s.id === selectedSession)?.title || ''
    const topic = useCustom ? customTopic : `Z2B Workshop Session ${selectedSession}: ${sessionTitle}`
    const systemPrompt = `You are Coach Manlaw — the AI content engine of Z2B Table Banquet, created by Rev Mokoro Manana.

BUILDER: ${profile?.full_name || 'the Builder'}
REFERRAL LINK: ${refLink}

CRITICAL RULES:
1. Output ONLY valid JSON array — no preamble, no markdown, no explanation
2. CAPTION must be ALL CAPS — the scroll stopper, first line
3. Body in authentic builder voice — never corporate, never generic
4. Referral link MUST appear in every post body: ${refLink}
5. End every post with ONLY: #Reka_Obesa_Okatuka #Entrepreneurial_Consumer
6. NEVER use HOOK: BODY: CTA: CAPTION: labels

CONTENT TYPE: ${contentType}
STYLE: ${contentStyle}  
PLATFORM: ${platform}
TOPIC: ${topic}

Return JSON array of ${batchSize} objects:
[{"caption":"ALL CAPS HERE","body":"body text...\\n\\n${refLink}","hashtags":"#Reka_Obesa_Okatuka #Entrepreneurial_Consumer"${contentType==='text-image'?',"imagePrompt":"detailed image prompt for DALL-E"':''}${contentType==='video-script'?',"videoScript":"HOOK (0-5s): ...\\nSTORY (5-45s): ...\\nCTA (45-60s): ..."':''}},...]`

    try {
      const res  = await fetch('/api/coach-manlaw', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ systemPrompt, messages:[{role:'user',content:`Generate ${batchSize} ${contentStyle} ${contentType} posts about: ${topic}`}] }) })
      const data = await res.json()
      const raw  = (data.reply||'').replace(/```json|```/g,'').trim()
      const parsed: any[] = JSON.parse(raw)
      setPosts(parsed.map((p,i) => ({ id:`post-${Date.now()}-${i}`, caption:p.caption||'', body:p.body||'', hashtags:p.hashtags||'#Reka_Obesa_Okatuka #Entrepreneurial_Consumer', imagePrompt:p.imagePrompt, videoScript:p.videoScript, approved:false, scheduledDate:'' })))
      setPostsUsed(prev => prev + batchSize)
      setActiveTab('schedule')
    } catch { setError('Generation failed — please try again.') }
    finally { setGenerating(false) }
  }

  const copyPost = (post: GeneratedPost) => {
    navigator.clipboard.writeText(`${post.caption}\n\n${post.body}\n\n${post.hashtags}`)
      .then(() => { setCopiedId(post.id); setTimeout(() => setCopiedId(null), 2500) })
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding:'10px 24px', borderRadius:'10px', cursor: tab!=='plans'&&!subscription ? 'not-allowed':'pointer',
    fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, transition:'all 0.2s',
    background: activeTab===tab ? 'rgba(124,58,237,0.2)':'rgba(255,255,255,0.04)',
    border: activeTab===tab ? '1.5px solid #7C3AED':'1.5px solid rgba(255,255,255,0.08)',
    color: activeTab===tab ? '#C4B5FD':'rgba(255,255,255,0.4)',
    opacity: tab!=='plans'&&!subscription ? 0.4:1,
  })

  const inputStyle: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px 14px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', cursor:'pointer', boxSizing:'border-box' }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818 0%,#0D0A1E 50%,#0A0818 100%)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid rgba(212,175,55,0.15)', background:'rgba(0,0,0,0.35)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/marketplace" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Marketplace</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'18px' }}>🤖</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#fff' }}>Content Studio<span style={{ color:'#D4AF37' }}>+</span></span>
        </div>
        {profile && <div style={{ fontSize:'12px', color:'#D4AF37', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </nav>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'56px 24px 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'500px', height:'280px', background:'radial-gradient(ellipse,rgba(124,58,237,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'20px', padding:'6px 16px', fontSize:'12px', color:'#C4B5FD', fontWeight:700, letterSpacing:'1px', marginBottom:'20px' }}>
          🤖 AI-POWERED · AUTOMATED CONTENT CREATION
        </div>
        <h1 style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:700, color:'#fff', margin:'0 0 16px', lineHeight:1.2 }}>
          Content Studio<span style={{ color:'#D4AF37' }}>+</span>
        </h1>
        <p style={{ fontSize:'16px', color:'rgba(196,181,253,0.8)', maxWidth:'520px', margin:'0 auto 8px', lineHeight:1.7 }}>
          Create a full week of professional social media posts in minutes — powered by the 99 Z2B workshop sessions and Coach Manlaw AI.
        </p>
        <p style={{ fontSize:'13px', color:'rgba(212,175,55,0.5)', fontStyle:'italic' }}>You review. You approve. You post. The AI does everything else.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', justifyContent:'center', gap:'4px', padding:'0 24px 40px' }}>
        {(['plans','create','schedule'] as const).map(tab => (
          <button key={tab} onClick={() => { if(tab!=='plans'&&!subscription) return; setActiveTab(tab) }} style={tabStyle(tab)}>
            {tab==='plans'?'📋 Plans':tab==='create'?'⚡ Create Content':'📅 Review & Schedule'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'0 24px' }}>

        {/* ── PLANS ── */}
        {activeTab==='plans' && (
          <div style={{ paddingBottom:'60px' }}>
            {subscription && (
              <div style={{ background:'rgba(16,185,129,0.08)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'16px', padding:'20px 24px', marginBottom:'32px', display:'flex', alignItems:'center', gap:'16px' }}>
                <span style={{ fontSize:'24px' }}>✅</span>
                <div>
                  <div style={{ fontWeight:700, color:'#6EE7B7', fontSize:'15px' }}>Active — {PLANS.find(p=>p.id===subscription)?.name} Plan</div>
                  <div style={{ fontSize:'13px', color:'rgba(110,231,183,0.7)', marginTop:'2px' }}>{postsRemaining===999?'Unlimited':postsRemaining} posts remaining this month</div>
                </div>
                <button onClick={() => setActiveTab('create')} style={{ marginLeft:'auto', padding:'10px 20px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'10px', color:'#F5D060', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Create Content →</button>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'20px', marginBottom:'40px' }}>
              {PLANS.map(plan => (
                <div key={plan.id} style={{ background:plan.id==='elite'?'linear-gradient(160deg,rgba(212,175,55,0.08),rgba(212,175,55,0.03))':'rgba(255,255,255,0.04)', border:plan.popular?`2px solid ${plan.color}`:plan.id===subscription?'2px solid #6EE7B7':'1.5px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', position:'relative' }}>
                  {plan.popular && <div style={{ height:'3px', background:`linear-gradient(90deg,${plan.color},${plan.color}55)` }} />}
                  {plan.popular && <div style={{ position:'absolute', top:'16px', right:'16px', background:plan.color, borderRadius:'12px', padding:'3px 12px', fontSize:'11px', fontWeight:700, color:'#fff' }}>MOST POPULAR</div>}
                  {plan.id===subscription && <div style={{ position:'absolute', top:'16px', right:'16px', background:'#059669', borderRadius:'12px', padding:'3px 12px', fontSize:'11px', fontWeight:700, color:'#fff' }}>ACTIVE</div>}
                  <div style={{ padding:'28px' }}>
                    <h3 style={{ fontSize:'22px', fontWeight:700, color:plan.id==='elite'?'#D4AF37':'#fff', margin:'0 0 4px' }}>{plan.name}</h3>
                    <div style={{ marginBottom:'20px' }}>
                      <span style={{ fontSize:'38px', fontWeight:700, color:'#D4AF37' }}>R{plan.price}</span>
                      <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.38)', marginLeft:'4px' }}>/month</span>
                    </div>
                    <ul style={{ listStyle:'none', padding:0, margin:'0 0 28px' }}>
                      {plan.features.map((f,i) => (
                        <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'8px', fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'8px', lineHeight:1.5 }}>
                          <span style={{ color:plan.id==='elite'?'#D4AF37':plan.color, flexShrink:0, marginTop:'2px' }}>◆</span>{f}
                        </li>
                      ))}
                    </ul>
                    {plan.id==='elite' ? (
                      <div style={{ textAlign:'center', padding:'14px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:'12px', color:'rgba(212,175,55,0.55)', fontSize:'13px', fontWeight:700 }}>🔮 Coming — Phase 2</div>
                    ) : plan.id===subscription ? (
                      <div style={{ textAlign:'center', padding:'14px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.28)', borderRadius:'12px', color:'#6EE7B7', fontSize:'13px', fontWeight:700 }}>✅ Your Current Plan</div>
                    ) : (
                      <Link href={`/pricing?product=cs-plus&plan=${plan.id}`} style={{ display:'block', textAlign:'center', padding:'14px', background:`linear-gradient(135deg,${plan.color},${plan.color}aa)`, borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                        Subscribe — R{plan.price}/mo →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,175,55,0.1)', borderRadius:'20px', padding:'32px' }}>
              <h3 style={{ fontSize:'20px', fontWeight:700, color:'#D4AF37', margin:'0 0 28px', textAlign:'center' }}>How It Works</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'24px' }}>
                {[
                  {step:'1',icon:'📚',title:'Choose Source',desc:'Pick any of the 99 workshop sessions or enter your own topic'},
                  {step:'2',icon:'⚡',title:'Generate Batch',desc:'AI creates up to 7 posts — text, image prompts or video scripts'},
                  {step:'3',icon:'👁️',title:'Review & Edit',desc:'Read every post. Edit freely. Approve what you love.'},
                  {step:'4',icon:'📅',title:'Schedule & Post',desc:'Set your posting date. Get notified. Copy and post with one tap.'},
                ].map(s => (
                  <div key={s.step} style={{ textAlign:'center', padding:'16px' }}>
                    <div style={{ fontSize:'28px', marginBottom:'8px' }}>{s.icon}</div>
                    <div style={{ fontSize:'10px', color:'#D4AF37', fontWeight:700, letterSpacing:'1.5px', marginBottom:'6px' }}>STEP {s.step}</div>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>{s.title}</div>
                    <div style={{ fontSize:'12px', color:'rgba(196,181,253,0.6)', lineHeight:1.6 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE ── */}
        {activeTab==='create' && subscription && (
          <div style={{ paddingBottom:'60px' }}>

            {/* Usage */}
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px 18px', marginBottom:'28px', display:'flex', alignItems:'center', gap:'16px' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontSize:'12px', color:'rgba(196,181,253,0.7)' }}>Posts used this month</span>
                  <span style={{ fontSize:'12px', color:'#D4AF37', fontWeight:700 }}>{postsUsed} / {activePlan?.posts===-1?'∞':activePlan?.posts}</span>
                </div>
                <div style={{ height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${activePlan?.posts===-1?10:Math.min((postsUsed/(activePlan?.posts||1))*100,100)}%`, background:'linear-gradient(90deg,#7C3AED,#D4AF37)', borderRadius:'2px' }} />
                </div>
              </div>
              <div style={{ fontSize:'13px', color:postsRemaining<5?'#EF4444':'#6EE7B7', fontWeight:700, flexShrink:0 }}>{postsRemaining===999?'∞':postsRemaining} remaining</div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', marginBottom:'20px' }}>

              {/* Source */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.75)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Content Source</label>
                <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
                  {[{id:'workshop',label:'📚 From Workshop Sessions'},{id:'custom',label:'✍️ Custom Topic'}].map(src => (
                    <button key={src.id} onClick={() => setUseCustom(src.id==='custom')} style={{ padding:'9px 18px', borderRadius:'9px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, background:(src.id==='custom')===useCustom?'rgba(124,58,237,0.15)':'rgba(255,255,255,0.04)', border:(src.id==='custom')===useCustom?'1.5px solid #7C3AED':'1.5px solid rgba(255,255,255,0.08)', color:(src.id==='custom')===useCustom?'#C4B5FD':'rgba(255,255,255,0.45)' }}>
                      {src.label}
                    </button>
                  ))}
                </div>
                {!useCustom ? (
                  <select value={selectedSession} onChange={e => setSelectedSession(Number(e.target.value))} style={inputStyle}>
                    {SESSIONS.map(s => <option key={s.id} value={s.id}>Session {s.id} — {s.title}</option>)}
                  </select>
                ) : (
                  <input type="text" value={customTopic} onChange={e => setCustomTopic(e.target.value)} placeholder="e.g. Why low-income employees should start building now..." style={{ ...inputStyle, cursor:'text' }} />
                )}
              </div>

              {/* Type */}
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.75)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Content Type</label>
                <select value={contentType} onChange={e => setContentType(e.target.value as ContentType)} style={inputStyle}>
                  <option value="text">📝 Text Post Only</option>
                  <option value="text-image" disabled={subscription==='starter'}>🖼️ Text + AI Image{subscription==='starter'?' (Pro+)':''}</option>
                  <option value="video-script" disabled={subscription==='starter'}>🎬 60-Second Video Script{subscription==='starter'?' (Pro+)':''}</option>
                </select>
              </div>

              {/* Style */}
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.75)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Content Style</label>
                <select value={contentStyle} onChange={e => setContentStyle(e.target.value as ContentStyle)} style={inputStyle}>
                  <option value="educational">🎓 Educational</option>
                  <option value="transformation">✨ Transformation Story</option>
                  <option value="invitation">🙋 Invitation / CTA</option>
                  <option value="motivational">🔥 Motivational</option>
                </select>
              </div>

              {/* Platform */}
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.75)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Platform</label>
                <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} style={inputStyle}>
                  <option value="both">📱 Facebook + TikTok</option>
                  <option value="facebook">📘 Facebook Only</option>
                  <option value="tiktok">🎵 TikTok Only</option>
                </select>
              </div>

              {/* Batch */}
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.75)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Batch Size</label>
                <select value={batchSize} onChange={e => setBatchSize(Number(e.target.value))} style={inputStyle}>
                  {[1,3,5,7].filter(n => n<=maxBatch).map(n => <option key={n} value={n}>{n} post{n>1?'s':''}</option>)}
                </select>
              </div>
            </div>

            {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.28)', borderRadius:'10px', padding:'12px 16px', color:'#FCA5A5', fontSize:'13px', marginBottom:'16px' }}>{error}</div>}

            <button onClick={handleGenerate} disabled={generating||postsRemaining<batchSize} style={{ width:'100%', padding:'16px', background:generating||postsRemaining<batchSize?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:generating||postsRemaining<batchSize?'1.5px solid rgba(255,255,255,0.1)':'1.5px solid #D4AF37', borderRadius:'12px', color:generating||postsRemaining<batchSize?'rgba(255,255,255,0.25)':'#F5D060', fontSize:'16px', fontWeight:700, cursor:generating||postsRemaining<batchSize?'not-allowed':'pointer', fontFamily:'Georgia,serif' }}>
              {generating ? '⚡ Coach Manlaw is creating your posts...' : `⚡ Generate ${batchSize} Post${batchSize>1?'s':''} Now`}
            </button>
            <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(196,181,253,0.45)', marginTop:'10px' }}>Referral link auto-included · 2 hashtags only · No section labels</p>
          </div>
        )}

        {/* ── SCHEDULE / REVIEW ── */}
        {activeTab==='schedule' && (
          <div style={{ paddingBottom:'60px' }}>
            {posts.length===0 ? (
              <div style={{ textAlign:'center', padding:'60px 24px' }}>
                <div style={{ fontSize:'48px', marginBottom:'16px' }}>📭</div>
                <p style={{ color:'rgba(196,181,253,0.5)', fontSize:'15px', marginBottom:'20px' }}>No posts generated yet.</p>
                <button onClick={() => setActiveTab(subscription?'create':'plans')} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  {subscription ? '⚡ Create Content' : '📋 Get a Plan'}
                </button>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
                  <div>
                    <h3 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#fff' }}>Your Generated Posts</h3>
                    <p style={{ margin:'4px 0 0', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>{posts.filter(p=>p.approved).length} of {posts.length} approved</p>
                  </div>
                  <button onClick={() => setActiveTab('create')} style={{ padding:'10px 18px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.28)', borderRadius:'10px', color:'#C4B5FD', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>+ Generate More</button>
                </div>

                {posts.map((post, idx) => (
                  <div key={post.id} style={{ background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.08)', borderRadius:'16px', overflow:'hidden', marginBottom:'16px' }}>

                    {/* Header */}
                    <div style={{ padding:'13px 18px', background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.45)' }}>Post {idx+1}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        {post.approved ? (
                          <span style={{ padding:'8px 16px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)', borderRadius:'8px', color:'#6EE7B7', fontSize:'12px', fontWeight:700 }}>✅ Approved</span>
                        ) : (
                          <button onClick={() => setPosts(prev=>prev.map(p=>p.id===post.id?{...p,approved:true}:p))} style={{ padding:'8px 16px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px', color:'#6EE7B7', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>✓ Approve</button>
                        )}
                        <button onClick={() => copyPost(post)} style={{ padding:'8px 16px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.28)', borderRadius:'8px', color:'#F5D060', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                          {copiedId===post.id?'✅ Copied!':'📋 Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding:'18px' }}>
                      <p style={{ fontSize:'15px', fontWeight:700, color:'#D4AF37', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px', lineHeight:1.4 }}>{post.caption}</p>
                      <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.72)', lineHeight:1.8, marginBottom:'10px', whiteSpace:'pre-wrap' }}>{post.body}</p>
                      <p style={{ fontSize:'13px', color:'rgba(124,58,237,0.75)', marginBottom:'14px' }}>{post.hashtags}</p>

                      {post.imagePrompt && (
                        <div style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'10px', padding:'12px 14px', marginBottom:'12px' }}>
                          <div style={{ fontSize:'11px', fontWeight:700, color:'#C4B5FD', letterSpacing:'0.5px', marginBottom:'6px' }}>🖼️ AI IMAGE PROMPT (use in DALL-E or Canva AI)</div>
                          <p style={{ fontSize:'12px', color:'rgba(196,181,253,0.7)', margin:0, lineHeight:1.6 }}>{post.imagePrompt}</p>
                        </div>
                      )}

                      {post.videoScript && (
                        <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:'10px', padding:'12px 14px', marginBottom:'12px' }}>
                          <div style={{ fontSize:'11px', fontWeight:700, color:'#FCA5A5', letterSpacing:'0.5px', marginBottom:'8px' }}>🎬 60-SECOND VIDEO SCRIPT</div>
                          <pre style={{ fontSize:'12px', color:'rgba(252,165,165,0.8)', margin:0, lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:'Georgia,serif' }}>{post.videoScript}</pre>
                        </div>
                      )}

                      {/* Schedule */}
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.38)' }}>📅 Schedule posting date:</span>
                        <input type="date" value={post.scheduledDate||''} min={new Date().toISOString().split('T')[0]} onChange={e => setPosts(prev=>prev.map(p=>p.id===post.id?{...p,scheduledDate:e.target.value}:p))} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'7px 12px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none' }} />
                        {post.scheduledDate && <span style={{ fontSize:'12px', color:'#6EE7B7', fontWeight:700 }}>📌 {new Date(post.scheduledDate).toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short'})}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
