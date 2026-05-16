'use client'
// v3.1 — stabilized
// ============================================================
// Z2B 4M V3 — GEAR 6: DISTRIBUTION ENGINE PAGE
// File: app/ai-income/gear/6/page.tsx
// Laws: Builder approves listing · Score hidden · All tiers
//       Session completes here · Rocket flagged for n8n
// ============================================================

import { useState, useEffect, useRef, Suspense, memo } from 'react'
import { useRouter, useSearchParams }                   from 'next/navigation'
import { supabase }                                     from '@/lib/supabase'
import Link                                             from 'next/link'
import type { IntentDefinition }                        from '@/lib/v3/gear1-engine'
import type { ContentDraft }                            from '@/lib/v3/gear3-engine'
import type {
  DistributionPackage,
  MarketplaceListing,
  SocialPost,
} from '@/lib/v3/gear6-engine'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

type PageStep = 'loading'|'generating'|'review'|'adjusting'|'confirming'|'live'|'error'

const GEN_MSGS = [
  'Writing your marketplace listing...',
  'Crafting your social posts...',
  'Preparing your launch package...',
]

const GearProgressBar = memo(function GearProgressBar({ current, gearAccess }: { current: number; gearAccess: number }) {
  const labels = ['IG','1','2','3','4','5','6','7']
  return (
    <div style={{ padding:'12px 20px', background:SURF, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth:'600px', margin:'0 auto', display:'flex', alignItems:'center' }}>
        {labels.map((label, i) => {
          const isActive = i === current, isDone = i < current && i > 0, isLocked = i > gearAccess && i > 0
          return (
            <div key={label} style={{ display:'flex', alignItems:'center', flex: i < 7 ? 1 : 0 }}>
              <div style={{
                width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background: isActive ? GOLD : isDone ? GREEN : 'transparent',
                border:'2px solid ' + (isActive ? GOLD : isDone ? GREEN : isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'),
                fontSize:'11px', fontWeight: isActive ? 900 : 400,
                color: isActive ? '#050A18' : isDone ? '#050A18' : isLocked ? 'rgba(255,255,255,0.15)' : MUTED,
              }}>
                {isLocked ? '🔒' : isDone ? '✓' : label}
              </div>
              {i < 7 && <div style={{ flex:1, height:'2px', background: isDone ? GREEN : isLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)' }} />}
            </div>
          )
        })}
      </div>
      <div style={{ textAlign:'center', marginTop:'6px', fontSize:'11px', color:GOLD }}>
        Gear 6 — Launching to the World
      </div>
    </div>
  )
})

function SocialPostCard({ post }: { post: SocialPost }) {
  const [copied, setCopied] = useState(false)
  const icons: Record<string, string> = { facebook:'📘', instagram:'📸', whatsapp:'💬' }
  const colors: Record<string, string> = { facebook:'#1877F2', instagram:'#E1306C', whatsapp:'#25D366' }

  return (
    <div style={{ padding:'14px 16px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:'8px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'16px' }}>{icons[post.platform]}</span>
          <span style={{ fontSize:'11px', fontWeight:700, color:colors[post.platform] ?? MUTED, textTransform:'capitalize' }}>{post.platform}</span>
        </div>
        <button
          onClick={() => {
              const text = post.content + (post.hashtags.length ? '\n\n' + post.hashtags.join(' ') : '')
              if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => setCopied(false))
              } else {
                // Fallback for HTTP/older browsers
                const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); setCopied(true); setTimeout(() => setCopied(false), 2000)
              }
            }}
          style={{ fontSize:'10px', color: copied ? GREEN : MUTED, background:'transparent', border:'none', cursor:'pointer', padding:'2px 6px' }}>
          {copied ? '✅ Copied' : '📋 Copy'}
        </button>
      </div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
        {post.content}
      </div>
      {post.hashtags.length > 0 && (
        <div style={{ marginTop:'6px', fontSize:'11px', color:CYAN }}>
          {post.hashtags.join(' ')}
        </div>
      )}
    </div>
  )
}

function Gear6Inner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [step,        setStep]       = useState<PageStep>('loading')
  const [intent,      setIntent]     = useState<IntentDefinition | null>(null)
  const [draft,       setDraft]      = useState<ContentDraft | null>(null)
  const [pkg,         setPkg]        = useState<DistributionPackage | null>(null)
  const [sessionId,   setSessionId]  = useState('')
  const [authToken,   setAuthToken]  = useState('')
  const [gearAccess,  setGearAccess] = useState(7)
  const [adjustInput, setAdjustInput]= useState('')
  const [adjustCount, setAdjustCount]= useState(0)
  const [adjustError, setAdjustError]= useState('')
  const [msgIdx,      setMsgIdx]     = useState(0)
  const [errorMsg,    setErrorMsg]   = useState('')
  const [activeTab,   setActiveTab]  = useState<'listing'|'social'>('listing')
  const hasRun = useRef(false)

  useEffect(() => {
    if (step !== 'generating') return
    const iv = setInterval(() => setMsgIdx(p => (p + 1) % GEN_MSGS.length), 3000)
    return () => clearInterval(iv)
  }, [step])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const token = session.access_token
      setAuthToken(token)
      const sid = searchParams.get('session') ?? ''
      setSessionId(sid)

      const { data: profile } = await supabase
        .from('profiles').select('gear_access').eq('id', session.user.id).single() as
        { data: { gear_access: number | null } | null }
      setGearAccess(profile?.gear_access ?? 7)

      let loadedIntent: IntentDefinition | null = null
      let loadedDraft:  ContentDraft | null     = null
      try {
        const ri = sessionStorage.getItem('v3_gear1_intent')
        const rd = sessionStorage.getItem('v3_gear4_draft') ?? sessionStorage.getItem('v3_gear3_draft')
        if (ri) loadedIntent = JSON.parse(ri)
        if (rd) loadedDraft  = JSON.parse(rd)
      } catch (_) {}

      if (!loadedIntent || !loadedDraft || !sid) {
        setErrorMsg('Could not load product data. Please return to Gear 5.')
        setStep('error')
        return
      }
      setIntent(loadedIntent)
      setDraft(loadedDraft)

      if (!hasRun.current) {
        hasRun.current = true
        await generate(token, loadedIntent, loadedDraft, sid)
      }
    })
  }, [])

  async function generate(token: string, intentData: IntentDefinition, draftData: ContentDraft, sid: string) {
    setStep('generating')
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)
    let res: Response
    try {
      res = await fetch('/api/gear/6', {
        method:'POST', signal: controller.signal,
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + token },
        body: JSON.stringify({
          action:    'generate',
          intent:    intentData,
          wordCount: draftData.wordCountTotal,
          sections:  draftData.totalSections,
          sessionId: sid,
        }),
      })
      clearTimeout(timeout)
    } catch (e) {
      clearTimeout(timeout)
      hasRun.current = false
      setErrorMsg((e instanceof Error && e.name === 'AbortError') ? 'Timed out. Please try again.' : 'Connection error.')
      setStep('error')
      return
    }

    const data = await res.json()
    if (!res.ok || data.error) { hasRun.current = false; setErrorMsg(data.error ?? 'Generation failed.'); setStep('error'); return }

    setPkg(data.package as DistributionPackage)
    setStep('review')
  }

  async function handleAdjust() {
    if (!adjustInput.trim() || adjustInput.trim().length < 5) {
      setAdjustError('Please describe what to change.')
      return
    }
    if (adjustCount >= 2 || !pkg || !intent) return
    setAdjustError('')
    setStep('adjusting')

    const res = await fetch('/api/gear/6', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + authToken },
      body: JSON.stringify({ action:'adjust', currentListing: pkg.listing, adjustment: adjustInput.trim(), intent, sessionId }),
    })
    const data = await res.json()

    if (!res.ok || data.error) { setAdjustError(data.error ?? 'Adjustment failed.'); setAdjustInput(''); setStep('review'); return }

    setPkg(prev => prev ? { ...prev, listing: data.listing as MarketplaceListing } : prev)
    setAdjustCount(p => p + 1)
    setAdjustInput('')
    setStep('review')
  }

  async function handleConfirm() {
    if (!pkg || !intent || !sessionId) return
    // MEDIUM #8: Validate listing has content
    if (!pkg.listing?.title?.trim() || !pkg.listing?.description?.trim()) {
      setErrorMsg('Your listing is incomplete. Please adjust and try again.')
      setStep('error')
      return
    }
    setStep('confirming')
    try { sessionStorage.setItem('v3_gear6_package', JSON.stringify(pkg)) } catch (_) {}

    const res = await fetch('/api/gear/6', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + authToken },
      body: JSON.stringify({ action:'confirm', pkg, intent, sessionId }),
    })
    const data = await res.json()

    if (!res.ok || data.error) { setErrorMsg(data.error ?? 'Could not publish.'); setStep('error'); return }

    // Clear all V3 session storage — product is live
    try {
      ['v3_selected_opportunity','v3_gear1_intent','v3_gear2_structure',
       'v3_gear3_draft','v3_gear4_draft','v3_gear5_bundle','v3_gear6_package']
        .forEach(k => sessionStorage.removeItem(k))
    } catch (_) {}

    setStep('live')
    setTimeout(() => router.push(data.redirect ?? '/dashboard'), 3000)
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', flexDirection:'column' }}>

      <nav style={{ padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', background:BG+'EE', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href={'/ai-income/gear/5?session=' + sessionId} style={{ fontSize:'12px', color:MUTED, textDecoration:'none' }}>← Gear 5</Link>
        <span style={{ fontSize:'12px', color:GOLD, fontWeight:700 }}>⚙️ Gear 6</span>
      </nav>

      <GearProgressBar current={6} gearAccess={gearAccess} />

      <div style={{ flex:1, padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:'100%', maxWidth:'600px' }}>

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ width:'40px', height:'40px', border:'3px solid '+GOLD, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* GENERATING / ADJUSTING */}
          {(step === 'generating' || step === 'adjusting') && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ position:'relative', width:'72px', height:'72px', margin:'0 auto 24px' }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid transparent', borderTopColor:GOLD, animation:'spin 1.2s linear infinite' }} />
                <div style={{ position:'absolute', inset:'14px', borderRadius:'50%', border:'1px solid transparent', borderTopColor:CYAN, animation:'spin 0.8s linear infinite reverse' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:700, color:W, marginBottom:'8px' }}>
                {step === 'adjusting' ? 'Applying your changes...' : 'Preparing your launch'}
              </div>
              {step === 'generating' && <div style={{ fontSize:'12px', color:MUTED }}>{GEN_MSGS[msgIdx]}</div>}
            </div>
          )}

          {/* REVIEW */}
          {step === 'review' && pkg && (
            <div>
              <div style={{ textAlign:'center', marginBottom:'20px' }}>
                <div style={{ fontSize:'11px', color:GOLD, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>⚙️ Your Launch Package is Ready</div>
                <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(17px,4vw,24px)', fontWeight:900, color:W, margin:'0 0 6px' }}>Review before publishing</h2>
                <p style={{ fontSize:'12px', color:MUTED, margin:0 }}>Adjust your listing if needed. Confirm to go live.</p>
              </div>

              {/* Tabs */}
              <div style={{ display:'flex', gap:'4px', marginBottom:'16px', background:'rgba(255,255,255,0.04)', padding:'4px', borderRadius:'12px' }}>
                {(['listing','social'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ flex:1, padding:'8px', borderRadius:'9px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight: activeTab === tab ? 700 : 400, background: activeTab === tab ? 'rgba(212,175,55,0.15)' : 'transparent', color: activeTab === tab ? GOLD : MUTED, fontFamily:'Georgia,serif', textTransform:'capitalize' }}>
                    {tab === 'listing' ? '🏪 Marketplace Listing' : '📣 Social Posts'}
                  </button>
                ))}
              </div>

              {/* Listing tab */}
              {activeTab === 'listing' && (
                <div>
                  <div style={{ padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', marginBottom:'12px' }}>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:W, marginBottom:'6px' }}>{pkg.listing.title}</div>
                    <div style={{ fontSize:'13px', color:GOLD, marginBottom:'14px', fontStyle:'italic' }}>{pkg.listing.tagline}</div>

                    <div style={{ fontSize:'10px', color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>Description</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8, marginBottom:'14px', whiteSpace:'pre-wrap' }}>{pkg.listing.description}</div>

                    <div style={{ fontSize:'10px', color:MUTED, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>What You Get</div>
                    {pkg.listing.keyBenefits.map((b, i) => (
                      <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'5px', fontSize:'12px', color:'rgba(255,255,255,0.7)' }}>
                        <span style={{ color:GREEN }}>✓</span><span>{b}</span>
                      </div>
                    ))}

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'14px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:GOLD }}>R{pkg.listing.priceZar.toLocaleString()}</div>
                      <div style={{ fontSize:'11px', color:MUTED, background:'rgba(255,255,255,0.06)', padding:'3px 10px', borderRadius:'10px' }}>{pkg.listing.format}</div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'14px' }}>
                    {pkg.listing.keywords.map((k, i) => (
                      <span key={i} style={{ fontSize:'10px', color:CYAN, background:'rgba(6,182,212,0.1)', padding:'3px 8px', borderRadius:'10px' }}>{k}</span>
                    ))}
                  </div>

                  {/* Adjust */}
                  {adjustCount < 2 && (
                    <div style={{ padding:'14px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:'14px' }}>
                      <div style={{ fontSize:'11px', color:MUTED, marginBottom:'8px' }}>Adjust the listing ({2 - adjustCount} left)</div>
                      <textarea
                        value={adjustInput}
                        onChange={e => { setAdjustInput(e.target.value); setAdjustError('') }}
                        placeholder='e.g. "Make the tagline punchier" or "Change the price to R299"'
                        rows={2}
                        style={{ width:'100%', padding:'8px 10px', borderRadius:'8px', resize:'none', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:'12px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box', marginBottom:'6px' }}
                      />
                      {adjustError && <div style={{ fontSize:'11px', color:'#F87171', marginBottom:'6px' }}>{adjustError}</div>}
                      <button onClick={handleAdjust} disabled={!adjustInput.trim()}
                        style={{ padding:'8px 14px', borderRadius:'8px', border:'none', cursor:'pointer', background: adjustInput.trim() ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', color: adjustInput.trim() ? W : MUTED, fontSize:'11px', fontFamily:'Georgia,serif' }}>
                        Apply →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Social posts tab */}
              {activeTab === 'social' && (
                <div>
                  <div style={{ fontSize:'12px', color:MUTED, marginBottom:'12px', lineHeight:1.7 }}>
                    Your launch posts are ready. Copy each one to share after your product goes live.
                  </div>
                  {pkg.socialPosts.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'32px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize:'24px', marginBottom:'8px' }}>📣</div>
                      <div style={{ fontSize:'13px', color:MUTED }}>Social posts could not be generated this time.</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)', marginTop:'4px' }}>Use your listing description to create posts manually.</div>
                    </div>
                  ) : (
                    pkg.socialPosts.map((post, i) => <SocialPostCard key={i} post={post} />)
                  )}
                </div>
              )}

              {/* Confirm */}
              <div style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'8px' }}>
                <button onClick={handleConfirm}
                  style={{ width:'100%', padding:'16px', borderRadius:'14px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:'15px', fontFamily:'Cinzel,Georgia,serif' }}>
                  🚀 Publish to Marketplace — Go Live →
                </button>
                <div style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>
                  Your product will be listed immediately on the Z2B Marketplace
                </div>
              </div>
            </div>
          )}

          {/* CONFIRMING */}
          {step === 'confirming' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>🚀</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', color:W, marginBottom:'8px' }}>Publishing your product...</div>
              <div style={{ fontSize:'13px', color:MUTED }}>Going live on the Marketplace</div>
            </div>
          )}

          {/* LIVE */}
          {step === 'live' && pkg && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ fontSize:'64px', marginBottom:'20px' }}>🎉</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'26px', fontWeight:900, color:GOLD, marginBottom:'12px' }}>
                You are LIVE.
              </div>
              <div style={{ fontSize:'16px', color:W, marginBottom:'6px' }}>{pkg.listing.title}</div>
              <div style={{ fontSize:'13px', color:GREEN, marginBottom:'4px', fontWeight:700 }}>R{pkg.listing.priceZar.toLocaleString()}</div>
              <div style={{ fontSize:'12px', color:MUTED, marginBottom:'32px' }}>Now live on the Z2B Marketplace</div>

              <div style={{ padding:'16px', borderRadius:'14px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', marginBottom:'12px', textAlign:'left' }}>
                <div style={{ fontSize:'12px', color:GREEN, fontWeight:700, marginBottom:'6px' }}>✅ What happens next:</div>
                <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.8 }}>
                  Your product is live · Share the social posts we prepared · Earn ISP on every sale · Track sales in your dashboard
                </div>
              </div>

              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Redirecting to dashboard...</div>
              <Link href="/dashboard" style={{ fontSize:'12px', color:MUTED, textDecoration:'underline' }}>
                Click here if not redirected
              </Link>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚠️</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', color:W, marginBottom:'10px' }}>Something went wrong</div>
              <div style={{ fontSize:'13px', color:MUTED, marginBottom:'28px', lineHeight:1.7 }}>{errorMsg}</div>
              <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
                {intent && draft && (
                  <button onClick={() => { hasRun.current = false; generate(authToken, intent, draft, sessionId) }}
                    style={{ padding:'12px 24px', borderRadius:'10px', border:'none', background:GOLD, color:'#050A18', fontWeight:700, cursor:'pointer', fontSize:'13px', fontFamily:'Georgia,serif' }}>
                    Try Again
                  </button>
                )}
                <Link href={'/ai-income/gear/5?session=' + sessionId} style={{ padding:'12px 24px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', color:MUTED, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                  Back to Gear 5
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function Gear6Page() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif', fontSize:'14px' }}>Loading Gear 6...</div>}>
      <Gear6Inner />
    </Suspense>
  )
}
