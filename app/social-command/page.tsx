'use client'

// ============================================================
// app/social-command/page.tsx  — V2
// Z2B Social Command Centre + Amavulandlela MyBrandPath
// Zero2Billionaires Amavulandlela Pty Ltd
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// ── TYPES ─────────────────────────────────────────────────────
type Tier = 'fam'|'starter'|'bronze'|'copper'|'silver'|'gold'|'platinum'|null
type AvaStatus = 'none'|'active'|'grace'|'suspended'
type AvaPlan = 'solo'|'multi'|'white_label'

interface Profile {
  id: string
  paid_tier: Tier
  full_name: string|null
  referral_code: string|null
  is_admin: boolean
}

interface AvaSubscription {
  plan: AvaPlan
  status: AvaStatus
  brand_limit: number
  is_white_label: boolean
  white_label_brand: string|null
  grace_period_ends: string|null
  next_billing_date: string|null
}

interface Brand {
  id: string
  brand_name: string
  brand_type: string
  brand_desc: string
  products: string[]
  cta_keywords: string[]
}

interface QueueItem {
  id: string
  platform: string
  caption: string
  product: string
  content_type: string
  content_emoji: string
  status: 'ready'|'posted'
  brand_mode: 'z2b'|'mybrand'
  brand_name?: string
  created_at: string
}

// ── TIER HELPERS ──────────────────────────────────────────────
const TIER_ORDER: Record<string,number> = {
  fam:0, starter:1, bronze:2, copper:3, silver:4, gold:5, platinum:6
}
const tierGte = (t: Tier, req: string) =>
  t ? (TIER_ORDER[t]??0) >= (TIER_ORDER[req]??99) : false

// ── PRICING ───────────────────────────────────────────────────
const MEMBER_PRICES: Record<AvaPlan, number> = {
  solo: 199, multi: 399, white_label: 799
}
const NON_MEMBER_PRICES: Record<AvaPlan, number> = {
  solo: 499, multi: 999, white_label: 2500
}
const PLAN_BRAND_LIMITS: Record<AvaPlan, string> = {
  solo: '1 brand', multi: '10 brands', white_label: 'Unlimited brands'
}
const PLAN_LABELS: Record<AvaPlan, string> = {
  solo: 'Pathfinder Solo', multi: 'Pathfinder Multi', white_label: 'Pathfinder White Label'
}

// ── Z2B CONSTANTS ──────────────────────────────────────────────
const PLATFORMS = {
  facebook:  { label:'Facebook',  color:'#1877F2', limit:500 },
  instagram: { label:'Instagram', color:'#E1306C', limit:300 },
  tiktok:    { label:'TikTok',    color:'#69C9D0', limit:150 },
}

const Z2B_PRODUCTS = [
  { id:'z2b_lb',   name:'Z2B Legacy Builders', tier:'Membership',     price:'R700–R50,000',   emoji:'🏛️' },
  { id:'z2b_dig',  name:'Z2B Digital',          tier:'Author Services', price:'R4,500–R55,000', emoji:'📚' },
  { id:'coach_ml', name:'Coach Manlaw AI',       tier:'AI Coaching',    price:'Member Benefit', emoji:'🤖' },
  { id:'fourm',    name:'4M Machine',            tier:'eBook/System',   price:'Included',       emoji:'⚙️' },
  { id:'trading',  name:'Z2B Trading EAs',       tier:'Forex Tools',    price:'Member Benefit', emoji:'📈' },
]

const CONTENT_TYPES = [
  { id:'devotion',    label:'Entrepreneurial Devotion', emoji:'🙏', hook:'Kingdom Business' },
  { id:'testimonial', label:'Transformation Story',     emoji:'🔥', hook:'Member Win'       },
  { id:'value',       label:'Value Post (No Pitch)',     emoji:'💡', hook:'Free Teaching'    },
  { id:'offer',       label:'Product Spotlight',        emoji:'💎', hook:'Product Feature'  },
  { id:'urgency',     label:'FOMO / Scarcity',          emoji:'⏰', hook:'Limited Offer'    },
  { id:'authority',   label:"Rev's Authority Moment",   emoji:'👑', hook:'Pastoral Voice'   },
]

const HASHTAG_SETS: Record<string,string> = {
  general: '#Zero2Billionaires #Z2BLegacyBuilders #RevMokoro #KingdomBusiness #SouthAfrica',
  digital: '#Z2BDigital #ChristianAuthor #KingdomBook #AuthorServices #BookLaunch',
  trading: '#Z2BTrading #ForexSA #4MMachine #PassiveIncome #FinancialFreedom',
  tiktok:  '#Z2B #MoneyMoves #SouthAfricaTikTok #KingdomEntrepreneur #BusinessTips',
}

// ── STARTER TEMPLATES (abbreviated — full set in previous file) ─
const STARTER_TEMPLATES: Record<string,Record<string,string>> = {
  devotion: {
    z2b_lb:  `Genesis 1:28 wasn't just a blessing — it was an assignment.\n\nYou were created to be FRUITFUL. To MULTIPLY. To REPLENISH.\n\nThat's not Sunday language. That's Monday morning business language.\n\n👇 Drop 'LEGACY' in the comments.\n\n#Zero2Billionaires #KingdomBusiness #RevMokoro`,
    z2b_dig: `Your story is not just a testimony. It's a BOOK waiting to be written.\n\nZ2B Digital helps Kingdom authors turn manuscripts into multi-format legacy products.\n\n👇 DM 'BOOK' to begin.\n\n#Z2BDigital #ChristianAuthor #KingdomBook`,
  },
  offer: {
    z2b_lb:  `💎 BRONZE TIER — R2,500\n\n✅ Coach Manlaw AI\n✅ 4M Machine\n✅ Social Command Centre\n✅ Marketplace access\n\n👇 DM 'BRONZE' to upgrade today.\n\n#Z2BLegacyBuilders #BronzeTier`,
    z2b_dig: `💎 THE SCRIBE — R4,500\n\n✅ One Word Discovery\n✅ Manuscript Analysis\n✅ Chapter Digitisation\n\n👇 DM 'SCRIBE' to begin.\n\n#Z2BDigital #AuthorServices`,
  },
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function SocialCommandPage() {
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )

  // ── State ──────────────────────────────────────────────────
  const [profile, setProfile]           = useState<Profile|null>(null)
  const [avaSub, setAvaSub]             = useState<AvaSubscription|null>(null)
  const [brands, setBrands]             = useState<Brand[]>([])
  const [queue, setQueue]               = useState<QueueItem[]>([])
  const [loading, setLoading]           = useState(true)

  const [activeTab, setActiveTab]       = useState('z2b')  // 'z2b' | 'mybrand' | 'queue' | 'buffer' | 'schedule' | 'hashtags'
  const [activeBrand, setActiveBrand]   = useState<Brand|null>(null)

  // Generator state
  const [selectedProduct, setSelectedProduct] = useState(Z2B_PRODUCTS[0])
  const [selectedType, setSelectedType]       = useState(CONTENT_TYPES[0])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook','instagram'])
  const [customNote, setCustomNote]           = useState('')
  const [generatedCaptions, setGeneratedCaptions] = useState<Record<string,string>>({})
  const [isGenerating, setIsGenerating]       = useState(false)

  // Brand setup modal state
  const [showBrandModal, setShowBrandModal]   = useState(false)
  const [brandForm, setBrandForm]             = useState({
    brand_name:'', brand_type:'', brand_desc:'',
    products:'', cta_keywords:''
  })
  const [savingBrand, setSavingBrand]         = useState(false)

  // Copy/queue feedback
  const [copiedKey, setCopiedKey]   = useState<string|null>(null)
  const [queuedKey, setQueuedKey]   = useState<string|null>(null)
  const [allQueued, setAllQueued]   = useState(false)
  const [expandedId, setExpandedId] = useState<string|null>(null)
  const [bufferToken, setBufferToken]   = useState<string|null>(null)
  const [bufferChannels, setBufferChannels] = useState<{id:string,service:string,service_username:string}[]>([])
  const [sendingToBuffer, setSendingToBuffer] = useState<string|null>(null)
  const [bufferSent, setBufferSent]     = useState<string|null>(null)

  // ── Load ───────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: prof }, { data: sub }, { data: brandsData }, { data: queueData }] = await Promise.all([
        supabase.from('profiles').select('id,paid_tier,full_name,referral_code,is_admin').eq('id', user.id).single(),
        supabase.rpc('get_ava_subscription', { p_user_id: user.id }).single(),
        supabase.from('amavulandlela_brands').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at'),
        supabase.from('social_queue').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      ])

      setProfile(prof)
      setAvaSub((sub as AvaSubscription) || null)
      setBrands(brandsData || [])
      setQueue(queueData || [])
      if (brandsData?.length) setActiveBrand(brandsData[0])
      // Load Buffer token if connected
      const { data: bufData } = await supabase
        .from("builder_buffer_tokens")
        .select("access_token,channels_json")
        .eq("user_id", user.id)
        .single()
      if (bufData?.access_token) {
        setBufferToken(bufData.access_token)
        if (bufData.channels_json) {
          try { setBufferChannels(JSON.parse(bufData.channels_json)) } catch {}
        }
      }
      setLoading(false)
    }
    load()
  }, [supabase, router])

  // ── Helpers ────────────────────────────────────────────────
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const togglePlatform = (p: string) =>
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const charInfo = (text: string, platform: string) => {
    const limit = PLATFORMS[platform as keyof typeof PLATFORMS]?.limit || 500
    const len = text?.length || 0
    return { len, limit, pct: Math.min((len/limit)*100,100), over: len > limit }
  }

  // ── Generate captions ──────────────────────────────────────
  const generate = async (mode: 'z2b'|'mybrand') => {
    if (!selectedPlatforms.length) return
    setIsGenerating(true)
    setGeneratedCaptions({})

    const results: Record<string,string> = {}

    for (const platform of selectedPlatforms) {
      const pInfo = PLATFORMS[platform as keyof typeof PLATFORMS]

      let prompt = ''
      if (mode === 'z2b') {
        prompt = `You are the social media voice of Rev Mokoro Manana, Founder & CEO of Zero2Billionaires Amavulandlela. Kingdom/Christian business philosophy. Anchor scripture Genesis 1:28.

Write a ${platform} post:
- Product: ${selectedProduct.name} (${selectedProduct.tier}, ${selectedProduct.price})
- Content Type: ${selectedType.label} (${selectedType.hook})
- Platform: ${pInfo.label} (max ${pInfo.limit} chars)
- Tone: Direct, faith-based, South African, motivational, pastoral authority
- NEVER say "make money", "earn income", or "join my team"
- End with CTA (DM keyword or Comment a word)
- Include 3–5 hashtags
${customNote ? `- Note: ${customNote}` : ''}

Return ONLY the caption. No preamble.`
      } else if (activeBrand) {
        prompt = `You are a professional social media copywriter writing for a business called "${activeBrand.brand_name}".

Business type: ${activeBrand.brand_type}
What they do: ${activeBrand.brand_desc}
Products/services: ${activeBrand.products?.join(', ') || 'Various products'}
Preferred CTA keywords: ${activeBrand.cta_keywords?.join(', ') || 'DM INFO'}

Write a ${platform} post:
- Content Type: ${selectedType.label} (${selectedType.hook})
- Platform: ${pInfo.label} (max ${pInfo.limit} chars)
- Tone: Neutral, professional, persuasive, South African context
- NEVER make income claims or use "join my team"
- End with a CTA using their keywords
- Include 3–5 relevant hashtags
${customNote ? `- Extra note: ${customNote}` : ''}

Return ONLY the caption. No preamble. No explanation.`
      }

      try {
        const res = await fetch('/api/amavulandlela/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, mode }),
        })
        const data = await res.json()
        results[platform] = data.caption || 'Error generating. Please try again.'
      } catch {
        results[platform] = 'Network error. Please try again.'
      }
    }

    setGeneratedCaptions(results)
    setIsGenerating(false)
  }

  // ── Queue ──────────────────────────────────────────────────
  const addToQueue = async (platform: string, caption: string, mode: 'z2b'|'mybrand') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const item = {
      user_id: user.id,
      platform, caption,
      product: mode === 'z2b' ? selectedProduct.name : (activeBrand?.brand_name || ''),
      content_type: selectedType.label,
      content_emoji: selectedType.emoji,
      status: 'ready',
      brand_mode: mode,
      brand_name: mode === 'mybrand' ? activeBrand?.brand_name : null,
    }
    const { data } = await supabase.from('social_queue').insert(item).select().single()
    if (data) setQueue(prev => [data, ...prev])
    setQueuedKey(platform)
    setTimeout(() => setQueuedKey(null), 2000)
  }

  const addAllToQueue = async (mode: 'z2b'|'mybrand') => {
    for (const [p, c] of Object.entries(generatedCaptions)) await addToQueue(p, c, mode)
    setAllQueued(true)
    setTimeout(() => setAllQueued(false), 2000)
  }

  const markPosted = async (id: string) => {
    await supabase.from('social_queue').update({ status:'posted' }).eq('id', id)
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status:'posted' as const } : q))
  }

  const deleteItem = async (id: string) => {
    await supabase.from('social_queue').delete().eq('id', id)
    setQueue(prev => prev.filter(q => q.id !== id))
  }

  // ── Send to Buffer ─────────────────────────────────────────
  const sendToBuffer = async (item: QueueItem) => {
    if (!bufferToken || !bufferChannels.length) return
    setSendingToBuffer(item.id)
    try {
      // Match platform to Buffer channel
      const platformMap: Record<string,string[]> = {
        facebook:  ["facebook","facebookpage","facebook_page"],
        instagram: ["instagram"],
        tiktok:    ["tiktok"],
      }
      const targetServices = platformMap[item.platform] || []
      const matchedChannels = bufferChannels
        .filter(ch => targetServices.includes(ch.service.toLowerCase()))
        .map(ch => ch.id)

      if (!matchedChannels.length) {
        alert(`No Buffer channel connected for ${item.platform}. Please connect it in Buffer settings.`)
        setSendingToBuffer(null)
        return
      }

      const res = await fetch("/api/buffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          token: bufferToken,
          post: { caption: item.caption, body: "", hashtags: "" },
          channel_ids: matchedChannels,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setBufferSent(item.id)
        setTimeout(() => setBufferSent(null), 3000)
        // Auto mark as posted
        await markPosted(item.id)
      } else {
        alert("Buffer error: " + (data.results?.[0]?.error || "Unknown error"))
      }
    } catch (e) {
      alert("Failed to send to Buffer. Please try again.")
    }
    setSendingToBuffer(null)
  }

  // ── Save brand ─────────────────────────────────────────────
  const saveBrand = async () => {
    if (!brandForm.brand_name.trim()) return
    setSavingBrand(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: sub } = await supabase
      .from('amavulandlela_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['active','grace'])
      .single()

    if (!sub) { setSavingBrand(false); return }

    const { data } = await supabase.from('amavulandlela_brands').insert({
      subscription_id: sub.id,
      user_id: user.id,
      brand_name: brandForm.brand_name,
      brand_type: brandForm.brand_type,
      brand_desc: brandForm.brand_desc,
      products: brandForm.products.split(',').map(s => s.trim()).filter(Boolean),
      cta_keywords: brandForm.cta_keywords.split(',').map(s => s.trim()).filter(Boolean),
    }).select().single()

    if (data) {
      setBrands(prev => [...prev, data])
      setActiveBrand(data)
      setShowBrandModal(false)
      setBrandForm({ brand_name:'', brand_type:'', brand_desc:'', products:'', cta_keywords:'' })
    }
    setSavingBrand(false)
  }

  // ── Computed ───────────────────────────────────────────────
  const readyCount  = queue.filter(q => q.status === 'ready').length
  const postedCount = queue.filter(q => q.status === 'posted').length
  const avaActive   = avaSub?.status === 'active' || avaSub?.status === 'grace'
  const brandLimit  = avaSub?.brand_limit ?? 0
  const canAddBrand = avaActive && brands.length < brandLimit
  const isWhiteLabel = avaSub?.is_white_label && !!avaSub?.white_label_brand

  // ── Pricing for upgrade CTA ────────────────────────────────
  const memberPricing = [
    { plan:'solo' as AvaPlan,       label:'Pathfinder Solo',       brands:'1 brand',        price:'R199/mo',  who:'Bronze+' },
    { plan:'multi' as AvaPlan,      label:'Pathfinder Multi',      brands:'3 brands',       price:'R399/mo',  who:'Copper+' },
    { plan:'white_label' as AvaPlan, label:'Pathfinder Agency',    brands:'Unlimited',      price:'R799/mo',  who:'Silver+' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-[#D4AF37] font-bold animate-pulse">Loading Amavulandlela...</div>
    </div>
  )

  // ── Tabs ───────────────────────────────────────────────────
  const tabs = [
    { id:'z2b',      label:'🏛️ Z2B BrandPath',  locked: !tierGte(profile?.paid_tier??null,'bronze') },
    { id:'mybrand',  label:'🌍 MyBrandPath',     locked: !avaActive },
    { id:'queue',    label:`📋 Queue${readyCount>0?` (${readyCount})`:''}`, locked:false },
    { id:'buffer',   label:'🔗 Buffer',           locked:false },
    { id:'schedule', label:'📅 Schedule',         locked:false },
    { id:'hashtags', label:'#️⃣ Hashtags',        locked:false },
  ]

  const footerBrand = isWhiteLabel ? avaSub!.white_label_brand! : 'Zero2Billionaires Amavulandlela Pty Ltd'

  // ── Caption result block (reusable) ───────────────────────
  const CaptionResults = ({ mode }: { mode: 'z2b'|'mybrand' }) => (
    Object.keys(generatedCaptions).length > 0 ? (
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#7a9cc6] font-bold uppercase tracking-wider">Generated Captions</div>
          <button onClick={() => addAllToQueue(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${allQueued ? 'bg-green-500 text-white' : 'bg-[#1a3a6e] text-[#D4AF37]'}`}>
            {allQueued ? '✓ All Queued!' : '📋 Add All to Queue'}
          </button>
        </div>
        {Object.entries(generatedCaptions).map(([platform, caption]) => {
          const pInfo = PLATFORMS[platform as keyof typeof PLATFORMS]
          const cc = charInfo(caption, platform)
          return (
            <div key={platform} className="rounded-xl overflow-hidden border" style={{ borderColor: pInfo.color+'44' }}>
              <div className="px-4 py-2.5 flex items-center justify-between gap-2" style={{ background: pInfo.color+'22', borderBottom:`1px solid ${pInfo.color}33` }}>
                <span className="text-sm font-bold" style={{ color: pInfo.color }}>{pInfo.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${cc.over?'text-red-400':'text-[#7a9cc6]'}`}>{cc.len}/{cc.limit}</span>
                  <div className="w-12 h-1 bg-[#1e2a4a] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${cc.pct}%`, background: cc.over?'#ff4444':pInfo.color }} />
                  </div>
                  <button onClick={() => addToQueue(platform, caption, mode)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${queuedKey===platform?'bg-green-500 text-white':'bg-[#1a3a6e] text-[#D4AF37]'}`}>
                    {queuedKey===platform?'✓':'+Queue'}
                  </button>
                  <button onClick={() => copy(caption, platform)}
                    className="px-2.5 py-1 rounded-md text-xs font-bold text-white transition-all"
                    style={{ background: copiedKey===platform?'#22c55e':pInfo.color }}>
                    {copiedKey===platform?'✓ Copied!':'Copy'}
                  </button>
                </div>
              </div>
              <div className="p-4 text-sm text-[#d0d8e8] leading-relaxed whitespace-pre-wrap bg-[#111827]">{caption}</div>
            </div>
          )
        })}
      </div>
    ) : null
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] border-b border-[#1a3a6e] px-4 pt-5 pb-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-black font-black text-lg font-serif flex-shrink-0">
              {isWhiteLabel ? avaSub!.white_label_brand![0].toUpperCase() : 'Z'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-extrabold text-[#D4AF37]">
                {isWhiteLabel ? avaSub!.white_label_brand : 'Z2B Social Command Centre'}
              </div>
              <div className="text-xs text-[#7a9cc6] mt-0.5">
                {isWhiteLabel ? 'Powered by Amavulandlela' : '90% Automated · Facebook · Instagram · TikTok'}
              </div>
            </div>
            <div className="flex gap-2 items-center flex-shrink-0">
              {readyCount > 0 && <span className="bg-[#D4AF37] text-black text-xs font-bold px-2.5 py-1 rounded-full">📋 {readyCount}</span>}
              {avaSub?.status === 'grace' && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">⚠️ Grace Period</span>
              )}
              <span className="bg-[#D4AF37] text-black text-xs font-bold px-2.5 py-1 rounded-full capitalize">
                {profile?.paid_tier || 'fam'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-0 scrollbar-none">
            {tabs.map(t => (
              <button key={t.id} onClick={() => !t.locked && setActiveTab(t.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-t-lg text-xs font-semibold transition-all border-b-2 relative ${
                  activeTab === t.id
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : t.locked
                    ? 'bg-white/5 text-[#3a4a5e] border-transparent cursor-not-allowed'
                    : 'bg-white/5 text-[#7a9cc6] border-transparent hover:bg-white/10'
                }`}>
                {t.label}
                {t.locked && <span className="ml-1 opacity-50">🔒</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grace period banner */}
      {avaSub?.status === 'grace' && (
        <div className="bg-orange-500/10 border-b border-orange-500/30 px-4 py-3">
          <div className="max-w-3xl mx-auto text-xs text-orange-400">
            ⚠️ <strong>Payment overdue.</strong> Your MyBrandPath access is in a 3-day grace period. 
            Update your payment to avoid suspension. Grace ends: {avaSub.grace_period_ends ? new Date(avaSub.grace_period_ends).toLocaleDateString('en-ZA') : 'soon'}.
            <button onClick={() => router.push('/billing')} className="ml-2 underline font-bold">Update Payment →</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* ════ Z2B BRANDPATH TAB ════ */}
        {activeTab === 'z2b' && (
          <>
            {!tierGte(profile?.paid_tier??null, 'bronze') ? (
              /* Locked state for FAM/Starter */
              <div className="space-y-4">
                <div className="bg-[#111827] border border-[#D4AF37]/30 rounded-xl p-5 text-center">
                  <div className="text-3xl mb-3">🏛️</div>
                  <div className="text-sm font-bold text-[#D4AF37] mb-2">Z2B BrandPath — Bronze Members & Above</div>
                  <p className="text-xs text-[#7a9cc6] leading-relaxed mb-4">
                    AI-powered caption generation for the entire Z2B ecosystem. 
                    Upgrade to Bronze to unlock Social Command, Coach Manlaw, and the 4M Machine.
                  </p>
                  <button onClick={() => router.push('/upgrade')}
                    className="bg-[#D4AF37] text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#FFD700] transition-colors">
                    Upgrade to Bronze — R2,500 →
                  </button>
                  <div className="mt-3 text-xs text-[#4a5a7e]">
                    FAM members: Share your referral link to earn R500 commission toward your upgrade.
                  </div>
                </div>

                {/* Greyed out preview */}
                <div className="opacity-30 pointer-events-none select-none">
                  <div className="text-xs text-[#7a9cc6] font-bold uppercase tracking-wider mb-2">Select Product</div>
                  <div className="flex flex-wrap gap-2">
                    {Z2B_PRODUCTS.map(p => (
                      <div key={p.id} className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#2a3a5e] bg-[#111827] text-[#7a9cc6]">
                        {p.emoji} {p.name}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 h-12 bg-[#111827] rounded-xl border border-[#2a3a5e]" />
                </div>
              </div>
            ) : (
              /* Unlocked Z2B generator */
              <div className="space-y-4">
                {/* Product */}
                <div>
                  <div className="text-xs text-[#7a9cc6] font-bold uppercase tracking-wider mb-2">Select Product / Service</div>
                  <div className="flex flex-wrap gap-2">
                    {Z2B_PRODUCTS.map(p => (
                      <button key={p.id} onClick={() => setSelectedProduct(p)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          selectedProduct.id===p.id ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#FFD700]' : 'border-[#2a3a5e] bg-[#111827] text-[#7a9cc6]'
                        }`}>
                        {p.emoji} {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content type */}
                <div>
                  <div className="text-xs text-[#7a9cc6] font-bold uppercase tracking-wider mb-2">Content Type</div>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map(ct => (
                      <button key={ct.id} onClick={() => setSelectedType(ct)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          selectedType.id===ct.id ? 'border-[#E1306C] bg-[#E1306C]/15 text-[#ff6b9d]' : 'border-[#2a3a5e] bg-[#111827] text-[#7a9cc6]'
                        }`}>
                        {ct.emoji} {ct.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <div className="text-xs text-[#7a9cc6] font-bold uppercase tracking-wider mb-2">Platforms</div>
                  <div className="flex gap-2">
                    {Object.entries(PLATFORMS).map(([key,p]) => (
                      <button key={key} onClick={() => togglePlatform(key)}
                        style={{ borderColor: selectedPlatforms.includes(key)?p.color:'#2a3a5e', color: selectedPlatforms.includes(key)?p.color:'#666' }}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedPlatforms.includes(key)?'bg-white/5':'bg-[#111827]'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <input value={customNote} onChange={e => setCustomNote(e.target.value)}
                  placeholder="Optional note (e.g. Spirit of Elijah launch week...)"
                  className="w-full bg-[#111827] border border-[#2a3a5e] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4a5a7e] focus:outline-none focus:border-[#D4AF37] transition-colors" />

                <button onClick={() => { setGeneratedCaptions({}); generate('z2b') }}
                  disabled={isGenerating || !selectedPlatforms.length}
                  className="w-full py-4 rounded-xl font-extrabold text-sm tracking-wide transition-all disabled:opacity-40"
                  style={{ background: isGenerating?'#1a2a4a':'linear-gradient(135deg,#D4AF37,#FFD700)', color: isGenerating?'#666':'#000' }}>
                  {isGenerating ? '⚡ Generating...' : '⚡ GENERATE Z2B CAPTIONS'}
                </button>

                {/* Starter templates hint */}
                <div className="bg-[#0d1628] border border-[#1a3a6e] rounded-xl p-3 text-xs text-[#4a5a7e]">
                  💡 <span className="text-[#7a9cc6]">Need something immediately? Use a <strong className="text-[#D4AF37]">Starter Template</strong> — no AI needed. Coming soon as a dedicated tab.</span>
                </div>

                <CaptionResults mode="z2b" />
              </div>
            )}
          </>
        )}

        {/* ════ MYBRANDPATH TAB ════ */}
        {activeTab === 'mybrand' && (
          <>
            {!avaActive ? (
              /* Upgrade wall — MyBrandPath */
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#1a0d35] to-[#0d0520] border border-[#9b59b6] rounded-xl p-5 text-center">
                  <div className="text-3xl mb-3">🌍</div>
                  <div className="text-sm font-bold text-[#9b59b6] mb-1">MyBrandPath — Market Everything You Build</div>
                  <div className="text-xs text-[#7a6a90] mb-4">Generate AI captions for YOUR business, NWM company, influencer brand — anything you build.</div>

                  {/* Pricing cards */}
                  <div className="grid gap-3 mb-5">
                    {memberPricing.map((tier) => (
                      <div key={tier.plan} className="bg-[#0d0520]/60 border border-[#9b59b6]/30 rounded-xl p-4 text-left">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-sm font-bold text-white">{tier.label}</div>
                            <div className="text-xs text-[#7a6a90]">{tier.brands} · {tier.who}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-[#D4AF37]">{tier.price}</div>
                            <div className="text-xs text-[#4a3a6e]">member rate</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => router.push('/marketplace/apps')}
                    className="w-full bg-gradient-to-r from-[#9b59b6] to-[#8e44ad] text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
                    Unlock MyBrandPath →
                  </button>
                  <div className="mt-3 text-xs text-[#4a3a6e]">
                    Not a Z2B member? Visit the Marketplace for Pioneer pricing.
                  </div>
                </div>
              </div>
            ) : (
              /* Active MyBrandPath */
              <div className="space-y-4">

                {/* Brand selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-[#7a9cc6] font-bold uppercase tracking-wider">Your Brands</div>
                    {canAddBrand && (
                      <button onClick={() => setShowBrandModal(true)}
                        className="text-xs font-bold text-[#9b59b6] border border-[#9b59b6]/40 px-3 py-1 rounded-lg hover:bg-[#9b59b6]/10 transition-colors">
                        + Add Brand
                      </button>
                    )}
                    {!canAddBrand && (
                      <span className="text-xs text-[#4a5a7e]">
                        {brands.length}/{brandLimit === 999999 ? '∞' : brandLimit} brands used
                      </span>
                    )}
                  </div>

                  {brands.length === 0 ? (
                    <div className="bg-[#111827] border border-dashed border-[#2a3a5e] rounded-xl p-6 text-center">
                      <div className="text-2xl mb-2">🌍</div>
                      <div className="text-sm font-bold text-[#7a9cc6] mb-1">No brands yet</div>
                      <div className="text-xs text-[#4a5a7e] mb-4">Add your first brand to start generating captions.</div>
                      <button onClick={() => setShowBrandModal(true)}
                        className="bg-[#9b59b6] text-white font-bold px-5 py-2 rounded-xl text-xs hover:opacity-90 transition-opacity">
                        + Add Your First Brand
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {brands.map(b => (
                        <button key={b.id} onClick={() => setActiveBrand(b)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                            activeBrand?.id===b.id ? 'border-[#9b59b6] bg-[#9b59b6]/15 text-[#c084fc]' : 'border-[#2a3a5e] bg-[#111827] text-[#7a9cc6]'
                          }`}>
                          🌍 {b.brand_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activeBrand && (
                  <>
                    {/* Active brand info */}
                    <div className="bg-[#111827] border border-[#9b59b6]/30 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold text-[#c084fc]">{activeBrand.brand_name}</div>
                          <div className="text-xs text-[#7a6a90] mt-0.5">{activeBrand.brand_type}</div>
                          <div className="text-xs text-[#7a9cc6] mt-1 leading-relaxed">{activeBrand.brand_desc}</div>
                        </div>
                      </div>
                      {activeBrand.products?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {activeBrand.products.map((p,i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-[#1a2a4a] text-[#7ab8ff] rounded-md">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content type */}
                    <div>
                      <div className="text-xs text-[#7a9cc6] font-bold uppercase tracking-wider mb-2">Content Type</div>
                      <div className="flex flex-wrap gap-2">
                        {CONTENT_TYPES.map(ct => (
                          <button key={ct.id} onClick={() => setSelectedType(ct)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              selectedType.id===ct.id ? 'border-[#9b59b6] bg-[#9b59b6]/15 text-[#c084fc]' : 'border-[#2a3a5e] bg-[#111827] text-[#7a9cc6]'
                            }`}>
                            {ct.emoji} {ct.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="flex gap-2">
                      {Object.entries(PLATFORMS).map(([key,p]) => (
                        <button key={key} onClick={() => togglePlatform(key)}
                          style={{ borderColor: selectedPlatforms.includes(key)?p.color:'#2a3a5e', color: selectedPlatforms.includes(key)?p.color:'#666' }}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedPlatforms.includes(key)?'bg-white/5':'bg-[#111827]'}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <input value={customNote} onChange={e => setCustomNote(e.target.value)}
                      placeholder="Optional: any special angle for this week..."
                      className="w-full bg-[#111827] border border-[#2a3a5e] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4a5a7e] focus:outline-none focus:border-[#9b59b6] transition-colors" />

                    <button onClick={() => { setGeneratedCaptions({}); generate('mybrand') }}
                      disabled={isGenerating || !selectedPlatforms.length}
                      className="w-full py-4 rounded-xl font-extrabold text-sm tracking-wide transition-all disabled:opacity-40"
                      style={{ background: isGenerating?'#1a2a4a':'linear-gradient(135deg,#9b59b6,#8e44ad)', color:'#fff' }}>
                      {isGenerating ? '⚡ Generating...' : `⚡ GENERATE CAPTIONS FOR ${activeBrand.brand_name.toUpperCase()}`}
                    </button>

                    <CaptionResults mode="mybrand" />
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ════ QUEUE TAB ════ */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'Ready',      value:readyCount,  color:'#D4AF37' },
                { label:'Posted',     value:postedCount, color:'#22c55e' },
                { label:'Total',      value:queue.length, color:'#7a9cc6' },
              ].map((s,i) => (
                <div key={i} className="bg-[#111827] rounded-xl p-3 text-center border border-[#1a3a6e]">
                  <div className="text-2xl font-black" style={{ color:s.color }}>{s.value}</div>
                  <div className="text-xs text-[#4a5a7e] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {queue.length === 0 && (
              <div className="bg-[#111827] border border-dashed border-[#2a3a5e] rounded-xl p-10 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="text-sm font-bold text-[#7a9cc6] mb-2">Queue is empty</div>
                <div className="text-xs text-[#4a5a7e]">Generate captions and tap + Queue to save them here. Persists between sessions.</div>
              </div>
            )}

            {queue.map(item => {
              const pInfo = PLATFORMS[item.platform as keyof typeof PLATFORMS]
              const isOpen = expandedId === item.id
              return (
                <div key={item.id}
                  className="rounded-xl overflow-hidden border transition-opacity"
                  style={{ borderColor: item.status==='posted'?'#22c55e33':(pInfo?.color??'#D4AF37')+'44', opacity:item.status==='posted'?0.65:1, background:item.status==='posted'?'#0d1a0d':'#111827' }}>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:item.status==='posted'?'#22c55e':(pInfo?.color??'#D4AF37') }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold" style={{ color:pInfo?.color??'#D4AF37' }}>{pInfo?.label??item.platform}</span>
                        {item.brand_mode === 'mybrand' && item.brand_name && (
                          <span className="text-xs px-2 py-0.5 bg-[#9b59b6]/20 text-[#c084fc] rounded-md">{item.brand_name}</span>
                        )}
                        <span className="text-xs text-[#7a9cc6]">{item.content_emoji} {item.content_type}</span>
                      </div>
                      <div className="text-xs text-[#4a5a7e] mt-0.5">{new Date(item.created_at).toLocaleDateString('en-ZA')}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.status==='ready' && (
                        <button onClick={() => markPosted(item.id)} className="px-2 py-1 rounded-md text-xs font-bold bg-green-900/40 text-green-400 hover:bg-green-500 hover:text-white transition-all">✓</button>
                      )}
                      {item.status==='posted' && <span className="text-xs font-bold text-green-400">✓ Posted</span>}
                      <button onClick={() => copy(item.caption,`q_${item.id}`)}
                        className="px-2 py-1 rounded-md text-xs font-bold text-white transition-all"
                        style={{ background: copiedKey===`q_${item.id}`?'#22c55e':(pInfo?.color??'#D4AF37') }}>
                        {copiedKey===`q_${item.id}`?'✓':'Copy'}
                      </button>
                      {/* Buffer send button */}
                      {item.status==='ready' && bufferToken && (
                        <button
                          onClick={() => sendToBuffer(item)}
                          disabled={sendingToBuffer===item.id}
                          className="px-2 py-1 rounded-md text-xs font-bold transition-all disabled:opacity-50"
                          style={{ background: bufferSent===item.id ? '#22c55e' : '#1a4a2e', color: bufferSent===item.id ? '#fff' : '#22c55e', border: '1px solid #22c55e44' }}>
                          {sendingToBuffer===item.id ? 'Sending...' : bufferSent===item.id ? '✓ Sent!' : '→ Buffer'}
                        </button>
                      )}
                      <button onClick={() => setExpandedId(isOpen?null:item.id)} className="px-2 py-1 rounded-md text-xs bg-[#1a3a6e] text-[#7a9cc6]">{isOpen?'▲':'▼'}</button>
                      <button onClick={() => deleteItem(item.id)} className="px-2 py-1 rounded-md text-xs bg-[#3a1a1a] text-red-400">✕</button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 text-sm text-[#d0d8e8] leading-relaxed whitespace-pre-wrap border-t border-[#1a3a6e] pt-3">
                      {item.caption}
                    </div>
                  )}
                </div>
              )
            {/* Buffer status in queue */}
            {!bufferToken ? (
              <div className="bg-[#0d1f0d] border border-[#1a4a2e] rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#22c55e] mb-1">🔗 Connect Buffer for 1-tap posting</div>
                  <div className="text-xs text-[#4a5a7e]">Connect Buffer in Content Studio → posts go directly from here to your social accounts.</div>
                </div>
                <a href="https://dub.sh/OjXitzf" target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold bg-[#22c55e] text-black hover:opacity-90 transition-opacity">
                  Get Buffer Free
                </a>
              </div>
            ) : (
              <div className="bg-[#0d1f0d] border border-[#22c55e]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <div className="text-xs font-bold text-[#22c55e]">Buffer Connected — {bufferChannels.length} channel{bufferChannels.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bufferChannels.map((ch,i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-[#1a4a2e] text-[#22c55e] rounded-md capitalize">{ch.service} · {ch.service_username}</span>
                  ))}
                </div>
                <div className="text-xs text-[#4a5a7e] mt-2">Tap "→ Buffer" on any queue item to send directly. No copy-paste needed.</div>
              </div>
            )}
            })}
          </div>
        )}

        {/* ════ BUFFER TAB ════ */}
        {activeTab === 'buffer' && (
          <div className="space-y-3">
            {[
              { step:'1', icon:'🔗', color:'#1877F2', title:'Sign Up at buffer.com',           desc:'Free plan: 3 channels — Facebook Page, Instagram Business, TikTok. Connect all 3 under Settings → Channels.' },
              { step:'2', icon:'⏰', color:'#E1306C', title:'Set Your Posting Schedule',       desc:'Settings → Posting Schedule. Facebook 7AM & 6PM · Instagram 6:30AM & 7:30PM · TikTok 12PM & 9PM.' },
              { step:'3', icon:'✍️', color:'#D4AF37', title:'Generate Captions Here (Sunday)', desc:'15 minutes every Sunday. Generate 7 days of captions. Copy each one using the Copy button.' },
              { step:'4', icon:'📋', color:'#22c55e', title:'Paste into Buffer → Add to Queue', desc:'New Post → Paste → Select platform → Add to Queue (NOT Share Now). Buffer schedules to your next open slot.' },
              { step:'5', icon:'🖼️', color:'#a855f7', title:'Add Graphic or Video',            desc:'Upload your Canva graphic or video. Buffer holds it until posting time.' },
              { step:'6', icon:'🚀', color:'#FFD700', title:'Buffer Posts Automatically',      desc:'Walk away. Buffer publishes at the exact times you set. That\'s the 90% automation.' },
            ].map((s,i) => (
              <div key={i} className="bg-[#111827] rounded-xl p-4 flex gap-3 border border-[#1a3a6e]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border-2" style={{ background:s.color+'22', borderColor:s.color }}>{s.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full text-black" style={{ background:s.color }}>STEP {s.step}</span>
                    <span className="text-sm font-bold text-[#e0e8f8]">{s.title}</span>
                  </div>
                  <p className="text-xs text-[#7a9cc6] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
            <a href="https://buffer.com" target="_blank" rel="noopener noreferrer"
              className="block w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl text-sm text-center tracking-wide hover:bg-[#FFD700] transition-colors">
              Open Buffer.com →
            </a>
          </div>
        )}

        {/* ════ SCHEDULE TAB ════ */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            {[
              { day:'Mon', theme:'Faith Foundation',  type:'devotion',    platforms:['facebook','instagram'] },
              { day:'Tue', theme:'Member Win',        type:'testimonial', platforms:['facebook','instagram','tiktok'] },
              { day:'Wed', theme:'Value Drop',        type:'value',       platforms:['facebook','instagram'] },
              { day:'Thu', theme:'Product Spotlight', type:'offer',       platforms:['facebook','instagram','tiktok'] },
              { day:'Fri', theme:'Kingdom Business',  type:'authority',   platforms:['facebook','instagram'] },
              { day:'Sat', theme:'FOMO Saturday',     type:'urgency',     platforms:['facebook','instagram','tiktok'] },
              { day:'Sun', theme:'Rest (Auto-Queue)', type:'devotion',    platforms:['facebook'] },
            ].map((item,i) => (
              <div key={i} className="bg-[#111827] border border-[#1a3a6e] rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1a3a6e] to-[#0f3460] flex items-center justify-center text-xs font-black text-[#D4AF37] flex-shrink-0">{item.day}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#e0e8f8]">{item.theme}</div>
                  <div className="text-xs text-[#7a9cc6] mt-0.5">{CONTENT_TYPES.find(c=>c.id===item.type)?.emoji} {CONTENT_TYPES.find(c=>c.id===item.type)?.label}</div>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {item.platforms.map(p => (
                    <span key={p} className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background:PLATFORMS[p as keyof typeof PLATFORMS]?.color+'33', color:PLATFORMS[p as keyof typeof PLATFORMS]?.color }}>
                      {PLATFORMS[p as keyof typeof PLATFORMS]?.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ HASHTAGS TAB ════ */}
        {activeTab === 'hashtags' && (
          <div className="space-y-3">
            {Object.entries(HASHTAG_SETS).map(([key,tags]) => (
              <div key={key} className="bg-[#111827] border border-[#1a3a6e] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm font-bold text-[#D4AF37]">
                    {{ general:'🏛️ General Z2B', digital:'📚 Z2B Digital', trading:'📈 Trading', tiktok:'♪ TikTok' }[key]}
                  </div>
                  <button onClick={() => copy(tags,`ht_${key}`)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copiedKey===`ht_${key}`?'bg-green-500 text-white':'bg-[#D4AF37] text-black'}`}>
                    {copiedKey===`ht_${key}`?'✓ Copied!':'Copy All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.split(' ').map((tag,i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-[#1a3a6e] text-[#7ab8ff] rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ════ ADD BRAND MODAL ════ */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#9b59b6] rounded-2xl w-full max-w-md p-6">
            <div className="text-base font-bold text-[#c084fc] mb-4">🌍 Add a Brand</div>
            <div className="space-y-3">
              {[
                { key:'brand_name',    label:'Brand / Business Name *',             placeholder:'e.g. Thabo\'s Wellness Co., Herbalife, My Church Ministry' },
                { key:'brand_type',    label:'Type',                                placeholder:'e.g. NWM, Own Business, Influencer, Church, Coaching' },
                { key:'brand_desc',    label:'What do you sell / do?',              placeholder:'e.g. Health supplements for busy professionals in SA' },
                { key:'products',      label:'Products / Services (comma-separated)', placeholder:'e.g. Protein shakes, Weight loss program, Membership' },
                { key:'cta_keywords',  label:'Your CTA Keywords (comma-separated)', placeholder:'e.g. DM INFO, Comment YES, Link in bio' },
              ].map(f => (
                <div key={f.key}>
                  <div className="text-xs text-[#7a9cc6] font-bold mb-1">{f.label}</div>
                  <input
                    value={brandForm[f.key as keyof typeof brandForm]}
                    onChange={e => setBrandForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-[#0d1628] border border-[#2a3a5e] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#3a4a6e] focus:outline-none focus:border-[#9b59b6] transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowBrandModal(false)}
                className="flex-1 py-3 rounded-xl border border-[#2a3a5e] text-[#7a9cc6] text-sm font-bold">
                Cancel
              </button>
              <button onClick={saveBrand} disabled={savingBrand || !brandForm.brand_name.trim()}
                className="flex-1 py-3 rounded-xl bg-[#9b59b6] text-white text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity">
                {savingBrand ? 'Saving...' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center py-5 text-xs text-[#1a2a4a] tracking-widest uppercase border-t border-[#0d1628]">
        Powered by {footerBrand}
      </div>
    </div>
  )
}
