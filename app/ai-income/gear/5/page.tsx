'use client'
// ============================================================
// Z2B 4M V3 — GEAR 5: VALUE ENHANCEMENT PAGE
// File: app/ai-income/gear/5/page.tsx
// Laws: Asset-by-asset progress · Copper endpoint
//       GPT-5.x plans hidden · Claude produces assets
// ============================================================

import { useState, useEffect, useRef, Suspense, memo } from 'react'
import { useRouter, useSearchParams }                   from 'next/navigation'
import { supabase }                                     from '@/lib/supabase'
import Link                                             from 'next/link'
import {
  ASSET_LABELS,
  isGear5Endpoint,
  type EnhancementAsset,
  type EnhancementBundle,
  type AssetType,
} from '@/lib/v3/gear5-engine'
import type { IntentDefinition } from '@/lib/v3/gear1-engine'
import type { ContentDraft }     from '@/lib/v3/gear3-engine'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

type PageStep = 'loading'|'planning'|'building'|'review'|'confirming'|'done'|'endpoint'|'error'

const PLANNING_MSGS = ['Planning your premium assets...','Selecting the best implementation tools...','Designing your value bundle...']
const BUILDING_MSGS = ['Building your assets...','Creating implementation tools...','Crafting your value bundle...']

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
                width:'32px', height:'32px', borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
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
      <div style={{ textAlign:'center', marginTop:'6px', fontSize:'11px', color:GOLD }}>Gear 5 — Adding Premium Value</div>
    </div>
  )
})

function AssetStatusRow({ plan, asset, isCurrent }: {
  plan: { type: AssetType; title: string }
  asset?: EnhancementAsset
  isCurrent?: boolean
}) {
  const def = ASSET_LABELS[plan.type]
  const status = asset ? 'complete' : isCurrent ? 'building' : 'pending'
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', borderRadius:'10px', marginBottom:'6px',
      background: isCurrent ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
      border:'1px solid ' + (isCurrent ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'),
      transition:'all 0.3s',
    }}>
      <div style={{
        width:'32px', height:'32px', borderRadius:'8px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px',
        background: status === 'complete' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
        animation: isCurrent ? 'pulse 1.2s ease-in-out infinite' : 'none',
      }}>
        {status === 'complete' ? '✅' : status === 'building' ? '⟳' : def.emoji}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'12px', color: status === 'complete' ? W : isCurrent ? GOLD : MUTED, fontWeight: isCurrent ? 700 : 400 }}>
          {plan.title}
        </div>
        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>{def.label}</div>
      </div>
      {isCurrent && <div style={{ fontSize:'10px', color:GOLD }}>Creating...</div>}
    </div>
  )
}

function AssetCard({ asset }: { asset: EnhancementAsset }) {
  const [expanded, setExpanded] = useState(false)
  const def = ASSET_LABELS[asset.type]
  return (
    <div style={{ borderRadius:'14px', overflow:'hidden', marginBottom:'8px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>
      <button onClick={() => setExpanded(p => !p)} style={{ width:'100%', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
        <div style={{ width:'32px', height:'32px', borderRadius:'8px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', background:'rgba(16,185,129,0.15)' }}>
          {def.emoji}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:W }}>{asset.title}</div>
          <div style={{ fontSize:'10px', color:MUTED, marginTop:'2px' }}>{def.label}</div>
        </div>
        <span style={{ color:MUTED, fontSize:'16px', transform: expanded ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>↓</span>
      </button>
      {expanded && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ paddingTop:'12px', fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.8, whiteSpace:'pre-wrap', maxHeight:'360px', overflowY:'auto' }}>
            {asset.content}
          </div>
        </div>
      )}
    </div>
  )
}

function Gear5Inner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [step,        setStep]       = useState<PageStep>('loading')
  const [intent,      setIntent]     = useState<IntentDefinition | null>(null)
  const [draft,       setDraft]      = useState<ContentDraft | null>(null)
  const [assetPlan,   setAssetPlan]  = useState<{ type: AssetType; title: string; purpose: string }[]>([])
  const [assets,      setAssets]     = useState<EnhancementAsset[]>([])
  const [currentIdx,  setCurrentIdx] = useState(0)
  const [sessionId,   setSessionId]  = useState('')
  const [authToken,   setAuthToken]  = useState('')
  const [gearAccess,  setGearAccess] = useState(7)
  const [tierId,      setTierId]     = useState('copper')
  const [msgIdx,      setMsgIdx]     = useState(0)
  const [errorMsg,    setErrorMsg]   = useState('')
  const hasRun = useRef(false)

  useEffect(() => {
    if (step !== 'planning' && step !== 'building') return
    const msgs = step === 'planning' ? PLANNING_MSGS : BUILDING_MSGS
    const iv = setInterval(() => setMsgIdx(p => (p + 1) % msgs.length), 3000)
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
        .from('profiles').select('gear_access, paid_tier').eq('id', session.user.id).single() as
        { data: { gear_access: number | null; paid_tier: string | null } | null }
      setGearAccess(profile?.gear_access ?? 5)
      const tier = profile?.paid_tier ?? 'copper'
      setTierId(tier)

      let loadedIntent: IntentDefinition | null = null
      let loadedDraft:  ContentDraft | null     = null
      try {
        const ri  = sessionStorage.getItem('v3_gear1_intent')
        const rd4 = sessionStorage.getItem('v3_gear4_draft')
        const rd3 = sessionStorage.getItem('v3_gear3_draft')
        const rd  = rd4 ?? rd3
        if (ri) loadedIntent = JSON.parse(ri)
        if (rd) loadedDraft  = JSON.parse(rd)
      } catch (_) {}

      // FALLBACK: load from database if sessionStorage was cleared
      if ((!loadedIntent || !loadedDraft) && sid) {
        try {
          const dbRes = await fetch('/api/gear/5', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ action: 'load_from_db', sessionId: sid }),
          })
          const dbData = await dbRes.json()
          if (dbData.intent && !loadedIntent) {
            loadedIntent = dbData.intent
            sessionStorage.setItem('v3_gear1_intent', JSON.stringify(dbData.intent))
          }
          if (dbData.draft && !loadedDraft) {
            loadedDraft = dbData.draft
            sessionStorage.setItem('v3_gear3_draft', JSON.stringify(dbData.draft))
          }
        } catch (_) {}
      }

      if (!loadedIntent || !loadedDraft || !sid) {
        setErrorMsg('Could not load product data. Please return to Gear 4.')
        setStep('error')
        return
      }
      setIntent(loadedIntent)
      setDraft(loadedDraft)

      if (!hasRun.current) {
        hasRun.current = true
        await fetchDirectiveAndBuild(token, loadedIntent, loadedDraft, sid)
      }
    })
  }, [])

  async function fetchDirectiveAndBuild(token: string, intentData: IntentDefinition, draftData: ContentDraft, sid: string) {
    setStep('planning')
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)
    let res: Response
    try {
      res = await fetch('/api/gear/5', {
        method:'POST', signal: controller.signal,
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + token },
        body: JSON.stringify({ action:'get_directive', draft:draftData, intent:intentData, sessionId:sid }),
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
    if (!res.ok || data.error) { hasRun.current = false; setErrorMsg(data.error ?? 'Could not plan assets.'); setStep('error'); return }

    const plan = data.assets as { type: AssetType; title: string; purpose: string }[]
    setAssetPlan(plan)
    setStep('building')
    await buildAssetsSequentially(token, plan, intentData, draftData, sid)
  }

  async function buildAssetsSequentially(
    token: string,
    plan: { type: AssetType; title: string; purpose: string }[],
    intentData: IntentDefinition,
    draftData: ContentDraft,
    sid: string
  ) {
    const built: EnhancementAsset[] = []
    for (let i = 0; i < plan.length; i++) {
      setCurrentIdx(i)
      const controller = new AbortController()
      const timeout    = setTimeout(() => controller.abort(), 55000)
      try {
        const res = await fetch('/api/gear/5', {
          method:'POST', signal: controller.signal,
          headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + token },
          body: JSON.stringify({ action:'generate_asset', assetPlan:plan[i], draft:draftData, intent:intentData, sessionId:sid }),
        })
        clearTimeout(timeout)
        const data = await res.json()
        if (res.ok && data.asset) built.push(data.asset as EnhancementAsset)
        else {
          // Non-fatal — continue
          console.warn('[gear5-page] Asset', i, 'failed:', data.error)
        }
      } catch (e) {
        clearTimeout(timeout)
        console.warn('[gear5-page] Asset', i, 'timeout/error:', e)
      }
      setAssets([...built])
    }
    // HIGH: All assets failed — show error not blank review
    if (built.length === 0) {
      setErrorMsg('Asset generation failed for all sections. Please try again.')
      hasRun.current = false
      setStep('error')
    } else {
      setStep('review')
    }
  }

  async function handleConfirm() {
    if (!draft || !intent || !sessionId) return
    if (assets.length === 0) {
      setErrorMsg('No assets available. Please try again.')
      setStep('error')
      return
    }
    setStep('confirming')
    const bundle: EnhancementBundle = { assets, isComplete: true }
    try { sessionStorage.setItem('v3_gear5_bundle', JSON.stringify(bundle)) } catch (_) {}

    const res = await fetch('/api/gear/5', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + authToken },
      body: JSON.stringify({ action:'confirm', bundle, draft, intent, sessionId }),
    })
    const data = await res.json()
    if (!res.ok || data.error) { setErrorMsg(data.error ?? 'Could not save.'); setStep('error'); return }
    if (data.isEndpoint) { setStep('endpoint') }
    else { setStep('done'); setTimeout(() => router.push(data.redirect ?? '/ai-income/gear/6?session=' + sessionId), 1200) }
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', flexDirection:'column' }}>
      <nav style={{ padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', background:BG+'EE', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href={'/ai-income/gear/4?session=' + sessionId} style={{ fontSize:'12px', color:MUTED, textDecoration:'none' }}>← Gear 4</Link>
        <span style={{ fontSize:'12px', color:GOLD, fontWeight:700 }}>⚙️ Gear 5</span>
        {assets.length > 0 && <span style={{ fontSize:'10px', color:MUTED, background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:'10px' }}>{assets.length} assets ready</span>}
      </nav>

      <GearProgressBar current={5} gearAccess={gearAccess} />

      <div style={{ flex:1, padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:'100%', maxWidth:'580px' }}>

          {step === 'loading' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ width:'40px', height:'40px', border:'3px solid '+GOLD, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            </div>
          )}

          {(step === 'planning' || step === 'building') && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ position:'relative', width:'72px', height:'72px', margin:'0 auto 24px' }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid transparent', borderTopColor:GOLD, animation:'spin 1.2s linear infinite' }} />
                <div style={{ position:'absolute', inset:'14px', borderRadius:'50%', border:'1px solid transparent', borderTopColor:VIO, animation:'spin 0.8s linear infinite reverse' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:700, color:W, marginBottom:'8px' }}>
                {step === 'planning' ? 'Planning your premium assets' : 'Building your value bundle'}
              </div>
              <div style={{ fontSize:'12px', color:MUTED, marginBottom:'20px' }}>
                {step === 'planning' ? PLANNING_MSGS[msgIdx] : BUILDING_MSGS[msgIdx]}
              </div>
              {step === 'building' && assetPlan.length > 0 && (
                <div style={{ textAlign:'left', maxWidth:'400px', margin:'0 auto' }}>
                  {assetPlan.map((plan, i) => (
                    <AssetStatusRow key={i} plan={plan} asset={assets.find(a => a.title === plan.title)} isCurrent={i === currentIdx && assets.length <= i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'review' && assets.length > 0 && (
            <div>
              <div style={{ textAlign:'center', marginBottom:'20px' }}>
                <div style={{ fontSize:'11px', color:GOLD, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>⚙️ Value Bundle Ready</div>
                <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(17px,4vw,24px)', fontWeight:900, color:W, margin:'0 0 6px' }}>
                  Your premium assets are ready.
                </h2>
                <p style={{ fontSize:'12px', color:MUTED, margin:0 }}>This is YOUR product. You own every asset — sell on any platform, anywhere in the world.. Then confirm your bundle.</p>
              </div>

              <div style={{ padding:'12px 16px', borderRadius:'12px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.15)', marginBottom:'16px' }}>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'13px', color:GOLD, fontWeight:700, marginBottom:'4px' }}>{draft?.productTitle}</div>
                <div style={{ fontSize:'11px', color:MUTED }}>{assets.length} premium assets added to your product</div>
              </div>

              {assets.map(asset => <AssetCard key={asset.id} asset={asset} />)}

              <div style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
                <button onClick={async () => {
            const { data: { session: s } } = await supabase.auth.getSession()
            if (!s) return
            const sid = sessionStorage.getItem('v3_current_session_id') ?? ''
            const res = await fetch('/api/download-package', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.access_token },
              body: JSON.stringify({ sessionId: sid }),
            })
            if (!res.ok) return
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'my-product-complete.txt'; a.click()
            URL.revokeObjectURL(url)
          }}
            style={{ width:'100%', padding:'11px', borderRadius:'10px', border:'1px solid rgba(6,182,212,0.3)', background:'rgba(6,182,212,0.06)', color:'#06B6D4', fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700, marginBottom:'8px' }}>
            ⬇️ Download Product + Assets — Sell Anywhere
          </button>
          <button onClick={handleConfirm}
                  style={{ width:'100%', padding:'16px', borderRadius:'14px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:'15px', fontFamily:'Cinzel,Georgia,serif' }}>
                  {isGear5Endpoint(tierId) ? '✅ Bundle complete — Deliver My Product →' : '✅ Bundle approved — Move to Packaging →'}
                </button>
                <div style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>
                  {isGear5Endpoint(tierId) ? 'Copper Pack: your enhanced product is ready' : 'Gear 6 will professionally package your product'}
                </div>
              </div>
            </div>
          )}

          {step === 'confirming' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚙️</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', color:W, marginBottom:'8px' }}>Saving your bundle...</div>
              <div style={{ fontSize:'13px', color:MUTED }}>{isGear5Endpoint(tierId) ? 'Preparing your product...' : 'Moving to Gear 6'}</div>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>✅</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', color:GREEN, fontWeight:900, marginBottom:'8px' }}>Gear 5 Complete</div>
              <div style={{ fontSize:'13px', color:MUTED }}>Entering Gear 6 — Professional Packaging...</div>
            </div>
          )}

          {step === 'endpoint' && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ fontSize:'56px', marginBottom:'20px' }}>🎉</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:GOLD, marginBottom:'10px' }}>Your enhanced product is ready.</div>
              <div style={{ fontSize:'14px', color:W, marginBottom:'6px' }}>{draft?.productTitle}</div>
              <div style={{ fontSize:'12px', color:MUTED, marginBottom:'28px' }}>Quality-approved · {assets.length} premium assets included</div>
              <div style={{ padding:'16px', borderRadius:'14px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', marginBottom:'20px', textAlign:'left' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD, marginBottom:'6px' }}>🚀 Upgrade to Silver to unlock Gear 6</div>
                <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.7 }}>Gear 6 designs a professional cover · Gear 7 lists your product on the Marketplace with social posts scheduled automatically.</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <Link href="/pricing" style={{ display:'block', padding:'14px', borderRadius:'12px', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, textDecoration:'none', textAlign:'center', fontFamily:'Cinzel,Georgia,serif' }}>
                  ⬆️ Upgrade to Silver — R12,000
                </Link>
                <Link href="/dashboard" style={{ display:'block', padding:'14px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.15)', color:MUTED, textDecoration:'none', textAlign:'center', fontSize:'13px' }}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚠️</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', color:W, marginBottom:'10px' }}>Something went wrong</div>
              <div style={{ fontSize:'13px', color:MUTED, marginBottom:'28px', lineHeight:1.7 }}>{errorMsg}</div>
              <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
                {intent && draft && (
                  <button onClick={() => { hasRun.current = false; fetchDirectiveAndBuild(authToken, intent, draft, sessionId) }}
                    style={{ padding:'12px 24px', borderRadius:'10px', border:'none', background:GOLD, color:'#050A18', fontWeight:700, cursor:'pointer', fontSize:'13px', fontFamily:'Georgia,serif' }}>
                    Try Again
                  </button>
                )}
                <Link href={'/ai-income/gear/4?session=' + sessionId} style={{ padding:'12px 24px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', color:MUTED, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>Back to Gear 4</Link>
                <Link href="/ai-income/ignition" style={{ padding:'12px 24px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.3)', fontSize:'12px', textDecoration:'none', fontFamily:'Georgia,serif' }}>New Product</Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function Gear5Page() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif', fontSize:'14px' }}>Loading Gear 5...</div>}>
      <Gear5Inner />
    </Suspense>
  )
}
