'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Crown, Sparkles, Zap, CreditCard, Building2, Copy, CheckCircle, GraduationCap, TrendingUp, DollarSign, FileText, Smartphone } from 'lucide-react'
import { MEMBERSHIP_TIERS, YOCO_CONFIG, formatCurrency } from '@/lib/yoco'

declare global {
  interface Window { YocoSDK: any }
}

const COMPARE_ROWS = [
  { label: "ISP Rate",            vals: ["10%","18%","22%","25%","28%","30%"] },
  { label: "TPB Generations",     vals: ["None","Gen 3","Gen 4","Gen 6","Gen 8","Gen 10"] },
  { label: "QPB Eligible",        vals: ["✗","✓","✓","✓","✓","✓"] },
  { label: "CEO Awards",          vals: ["✗","✗","✗","✓","✓","✓"] },
  { label: "Workshop Sessions",   vals: ["1–9","1–90","1–90","1–90","1–90","1–90"] },
  { label: "Vision Board",        vals: ["View","Full","Full","Full","Full","Full"] },
  { label: "Coach Manlaw AI",     vals: ["3/sess","∞","∞","∞","∞","∞"] },
  { label: "GroundBreaker",       vals: ["✓","✓","✓","✓","✓","✓"] },
  { label: "TableBuilder",        vals: ["✗","✓","✓","✓","✓","✓"] },
  { label: "Group Coaching",      vals: ["✗","✗","✓","✓","✓","✓"] },
  { label: "Marketplace",         vals: ["✗","✗","✗","✗","✓","✓"] },
  { label: "App Building",        vals: ["✗","✗","✗","x1","x2","x4"] },
  { label: "1-on-1 Coaching",     vals: ["✗","✗","✗","✗","✓","✓"] },
  { label: "White-label",         vals: ["✗","✗","✗","✗","✗","✓"] },
  { label: "CEO Mastermind",      vals: ["✗","✗","✗","✗","✗","✓"] },
]

const TIER_COLORS: Record<string,string> = {
  fam:"#6B7280", bronze:"#CD7F32", copper:"#B87333",
  silver:"#C0C0C0", gold:"#D4AF37", platinum:"#9333EA",
}

const INCOME_STREAMS = [
  { code:"ISP", name:"Individual Sales Profit",  desc:"Direct referral commissions — 10% (FAM) up to 30% (Platinum)",               color:"#22C55E", tier:"All tiers" },
  { code:"QPB", name:"Quick Pathfinder Bonus",   desc:"Refer 3 diverse members in a quarter — unlocks from Bronze",                  color:"#0EA5E9", tier:"Bronze+"  },
  { code:"TPB", name:"Team Performance Bonus",   desc:"Earn across your team — Bronze Gen 3 up to Platinum Gen 10",                  color:"#D4AF37", tier:"Bronze+"  },
  { code:"TSC", name:"Team Sales Commission",    desc:"Commission from downline flowing multiple generations deep",                   color:"#9333EA", tier:"Bronze+"  },
  { code:"TLI", name:"Ten Level Legacy Income",  desc:"Passive income 10 levels deep — up to R5M at Platinum",                      color:"#E879F9", tier:"Platinum" },
  { code:"CEO", name:"CEO Awards",               desc:"Elite bonus pool for top Silver, Gold and Platinum builders",                 color:"#F97316", tier:"Silver+"  },
]

const BANK_DETAILS = {
  accountName:   'Zero2billionaires Amavulandlela',
  accountNumber: '1318257727',
  bank:          'NEDBANK',
}

function PricingInner() {
  const [user,             setUser]             = useState<any>(null)
  const [currentTier,      setCurrentTier]      = useState<string>('fam')
  const [loading,          setLoading]          = useState(false)
  const [selectedTier,     setSelectedTier]     = useState<string|null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod,    setPaymentMethod]    = useState<'yoco'|'bank'|'cash'|null>(null)
  const [copied,           setCopied]           = useState<string|null>(null)
  const [showCompare,      setShowCompare]      = useState(false)
  const [openFaq,          setOpenFaq]          = useState<number|null>(null)
  const [payDone,          setPayDone]          = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => { checkUser(); loadYocoSDK() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('user_role,paid_tier').eq('id',user.id).single()
      if (profile) setCurrentTier(profile.paid_tier || profile.user_role || 'fam')
    }
  }

  const loadYocoSDK = () => {
    if (document.getElementById('yoco-sdk')) return
    const script = document.createElement('script')
    script.id = 'yoco-sdk'; script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'; script.async = true
    document.body.appendChild(script)
  }

  const handleUpgrade = async (tierKey: string) => {
    const tier = MEMBERSHIP_TIERS[tierKey as keyof typeof MEMBERSHIP_TIERS]
    if (tier.price === 0) { router.push('/workshop-signup'); return }
    setSelectedTier(tierKey)
    setShowPaymentModal(true)
    setPaymentMethod(null)
    setPayDone(false)
  }

  const handleYocoPayment = async () => {
    if (!selectedTier) return
    // Must be logged in for Yoco
    if (!user) { router.push(`/workshop-signup?next=pricing&tier=${selectedTier}`); return }

    const tier = MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS]
    setLoading(true)
    setPaymentMethod('yoco')
    try {
      const yoco = new window.YocoSDK({ publicKey: YOCO_CONFIG.publicKey })
      yoco.showPopup({
        amountInCents: tier.price * 100,
        currency: 'ZAR',
        name: `${tier.name} Tier - Lifetime Membership`,
        description: `Z2B Table Banquet - ${tier.name} Tier`,
        callback: async (result: any) => {
          if (result.error) { alert('Payment failed. Please try again.'); setLoading(false); return }

          // Record payment as completed immediately
          await supabase.from('payments').insert({
            user_id: user.id, tier: selectedTier,
            amount: tier.price, currency: 'ZAR',
            payment_provider: 'yoco', payment_id: result.id,
            status: 'completed', payment_type: 'tier_upgrade',
          })
          // Trigger fires automatically in Supabase → updates is_paid_member
          setShowPaymentModal(false)
          router.push(`/membership-form?tier=${selectedTier}`)
        }
      })
    } catch {
      alert('Payment system unavailable. Please use EFT or Cash Deposit instead.')
      setLoading(false)
    }
  }

  const recordManualPayment = async (method: 'bank_transfer' | 'cash_deposit') => {
    if (!user) { router.push(`/workshop-signup?next=pricing&tier=${selectedTier}`); return }
    if (!selectedTier) return
    const tier = MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS]
    const ref  = user.id.slice(0, 8).toUpperCase()

    await supabase.from('payments').insert({
      user_id: user.id, tier: selectedTier,
      amount: tier.price, currency: 'ZAR',
      payment_provider: method,
      payment_id: `${method.toUpperCase()}_${user.id.slice(0,8)}_${Date.now()}`,
      status: 'pending', payment_type: 'tier_upgrade',
      metadata: { bank_details: { ...BANK_DETAILS, reference: ref }, instructions: 'Awaiting admin verification' },
    })
    setPayDone(true)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const getTierIcon = (key: string) => {
    if (key === 'platinum') return <Crown className="w-8 h-8" />
    if (key === 'gold')     return <Sparkles className="w-8 h-8" />
    if (key === 'silver')   return <Zap className="w-8 h-8" />
    return <Check className="w-8 h-8" />
  }

  const tierKeys   = Object.keys(MEMBERSHIP_TIERS)
  const selTierObj = selectedTier ? MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS] : null
  const ref        = user?.id?.slice(0,8).toUpperCase() || 'MEMBER'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">

      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
                <p className="text-sm text-gold-300">Lifetime Membership Tiers</p>
              </div>
            </Link>
            <div className="flex gap-3">
              <Link href="/" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">Home</Link>
              <Link href="/workshop" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-4 rounded-lg transition-colors border-2 border-gold-400">Workshop</Link>
              {user
                ? <Link href="/dashboard" className="btn-primary">Dashboard</Link>
                : <Link href="/login"     className="btn-primary">Sign In</Link>}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-20 border-b-8 border-gold-400">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Choose Your Legacy Path</h2>
          <p className="text-xl md:text-2xl text-gold-200 max-w-3xl mx-auto mb-4">One-time payment. Lifetime access. Build your empire forever.</p>
          <p className="text-lg text-purple-200 mb-8">Pay via Card, EFT or ATM Cash Deposit 🏦 &nbsp; No monthly fees ever! 🚀</p>
          <button onClick={() => setShowCompare(!showCompare)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border-2 border-gold-400 text-gold-300 font-semibold py-2 px-6 rounded-lg transition-colors">
            {showCompare ? '← Back to Tier Cards' : '📊 Compare All Tiers'}
          </button>
        </div>
      </section>

      {/* Compare table */}
      {showCompare && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h3 className="text-4xl font-bold text-primary-800 mb-3">Compare All Tiers</h3>
            <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
          </div>
          <div className="overflow-x-auto rounded-2xl border-4 border-primary-200 shadow-xl">
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'700px' }}>
              <thead>
                <tr style={{ background:'linear-gradient(135deg,#1A0035,#0D0020)' }}>
                  <th style={{ padding:'14px 16px', textAlign:'left', color:'rgba(255,255,255,0.5)', fontSize:'13px', fontWeight:'normal', width:'180px' }}>Feature</th>
                  {tierKeys.map(k => (
                    <th key={k} style={{ padding:'14px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:'12px', fontWeight:'bold', color:TIER_COLORS[k] }}>{MEMBERSHIP_TIERS[k as keyof typeof MEMBERSHIP_TIERS].name}</div>
                      <div style={{ fontSize:'15px', fontWeight:'bold', color:'#fff', marginTop:'2px' }}>{formatCurrency(MEMBERSHIP_TIERS[k as keyof typeof MEMBERSHIP_TIERS].price)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => (
                  <tr key={ri} style={{ background: ri%2===0 ? 'rgba(147,51,234,0.04)' : 'transparent' }}>
                    <td style={{ padding:'10px 16px', fontSize:'12px', color:'#4B5563', borderBottom:'1px solid #E5E7EB', fontWeight:'600' }}>{row.label}</td>
                    {row.vals.map((v,vi) => (
                      <td key={vi} style={{ padding:'10px', textAlign:'center', fontSize:'13px', borderBottom:'1px solid #E5E7EB',
                        color: v==='✓'?'#16A34A':v==='✗'?'#D1D5DB':TIER_COLORS[tierKeys[vi]],
                        fontWeight: v==='✓'||v==='✗'?'bold':'600' }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tier Cards */}
      {!showCompare && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => {
              const isCurrentTier = currentTier === key || (currentTier==='free_member'&&key==='fam') || (currentTier==='paid_member'&&key!=='fam')
              const isBestValue   = key === 'gold'
              return (
                <div key={key} className={`card border-4 ${isBestValue?'border-gold-500 shadow-2xl transform scale-105':isCurrentTier?'border-green-400':'border-primary-200'} hover:border-gold-400 transition-all relative`}>
                  {isBestValue && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gold-gradient text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">⭐ BEST VALUE</span>
                    </div>
                  )}
                  {isCurrentTier && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">✓ ACTIVE</span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-br ${
                      key==='platinum'?'from-purple-500 to-purple-700':key==='gold'?'from-yellow-500 to-yellow-700':
                      key==='silver'?'from-slate-400 to-slate-600':key==='copper'?'from-amber-600 to-amber-800':
                      key==='bronze'?'from-orange-600 to-orange-800':'from-gray-400 to-gray-600'
                    } text-white shadow-lg`}>{getTierIcon(key)}</div>
                    <h3 className="text-3xl font-bold text-primary-800 mb-2">{tier.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-primary-900">{formatCurrency(tier.price)}</span>
                      {tier.price > 0 && <p className="text-sm text-gray-600 mt-1">One-time • Lifetime Access</p>}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-primary-700 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />TRAINING & ACCESS
                    </h4>
                    <ul className="space-y-2">
                      {tier.trainingBenefits.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{b}</span>
                        </li>
                      ))}
                      {key==='fam'&&<>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">🎓 Sessions 1–9 Workshop — free forever</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">🤖 Coach Manlaw AI — 3 chats/session</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">🌱 GroundBreaker referral dashboard</span></li>
                      </>}
                      {key!=='fam'&&<>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">🎓 All 90 Workshop Sessions — lifetime</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">🤖 Coach Manlaw AI — unlimited</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">🌱 GroundBreaker referral dashboard</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">🏛️ TableBuilder team dashboard</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-gray-700">🎯 Vision Board — full save & download</span></li>
                      </>}
                    </ul>
                  </div>

                  <div className="mb-6 bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <h4 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />SALES & MARKETING
                    </h4>
                    <ul className="space-y-2">
                      {tier.salesBenefits.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6 text-center border-t-2 border-gray-200 pt-4">
                    <p className="text-xs text-gray-600 mb-2">Terms & Conditions Apply</p>
                    <Link href="/builder-rules" className="text-sm text-primary-700 font-semibold hover:text-gold-600 hover:underline flex items-center justify-center gap-1">
                      <FileText className="w-4 h-4" />View Builder Rules
                    </Link>
                  </div>

                  <button onClick={() => handleUpgrade(key)} disabled={isCurrentTier}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                      isCurrentTier?'bg-gray-300 text-gray-600 cursor-not-allowed':
                      isBestValue?'bg-gold-gradient text-white hover:shadow-xl':
                      'bg-royal-gradient text-white hover:shadow-lg'
                    }`}>
                    {isCurrentTier?'Current Tier':tier.price===0?'Start Free':`Upgrade to ${tier.name}`}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Income Streams */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t-4 border-primary-100">
        <div className="text-center mb-10">
          <h3 className="text-4xl font-bold text-primary-800 mb-3">6 Income Streams</h3>
          <p className="text-gray-600 mb-4">Activated progressively as you upgrade your tier</p>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INCOME_STREAMS.map(s => (
            <div key={s.code} className="card border-4 border-primary-200 hover:border-gold-400 transition-all" style={{ borderLeft:`4px solid ${s.color}` }}>
              <div className="flex justify-between items-center mb-3">
                <div className="text-2xl font-bold" style={{ color:s.color }}>{s.code}</div>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">{s.tier}</span>
              </div>
              <div className="font-bold text-primary-800 mb-2">{s.name}</div>
              <div className="text-sm text-gray-600 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Kingdom Business */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-16 border-y-4 border-gold-400">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">👑</div>
          <h3 className="text-3xl font-bold text-white mb-6">This Is a Kingdom Business</h3>
          <p className="text-lg text-purple-200 leading-relaxed mb-6">
            Z2B was not built to make employees richer consumers. It was built to raise up stewards — people who understand that wealth is a tool for service, legacy, and community transformation. Every membership activates a builder. Every builder cultivates a table. Every table changes a family.
          </p>
          <p className="text-gold-300 italic text-lg">"You prepare a table before me in the presence of my enemies." — Psalm 23:5</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PAYMENT MODAL — NEW FLOW: PAY → FORM
      ══════════════════════════════════════════════════════ */}
      {showPaymentModal && selectedTier && selTierObj && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { if (!payDone) { setShowPaymentModal(false); setPaymentMethod(null) } }}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
            {!payDone && (
              <button onClick={() => { setShowPaymentModal(false); setSelectedTier(null); setPaymentMethod(null) }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
            )}

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${payDone?'bg-green-500 text-white':'bg-primary-700 text-white'}`}>1</div>
                <span className="text-sm font-semibold text-gray-700">Pay</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${payDone?'bg-primary-700 text-white':'bg-gray-200 text-gray-500'}`}>2</div>
                <span className="text-sm font-semibold text-gray-500">Complete Profile</span>
              </div>
            </div>

            {/* Tier summary */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-primary-800 mb-2">
                {payDone ? '✅ Payment Recorded!' : 'Choose Payment Method'}
              </h2>
              <div className="inline-flex items-center gap-2 bg-primary-50 border-2 border-primary-200 rounded-lg px-4 py-2">
                <span className="font-bold text-2xl" style={{ color: TIER_COLORS[selectedTier] }}>
                  {formatCurrency(selTierObj.price)}
                </span>
                <span className="text-sm text-gray-600">—</span>
                <span className="font-bold text-primary-800">{selTierObj.name} Tier</span>
                <span className="text-xs text-gray-500">once-off lifetime</span>
              </div>
            </div>

            {/* Payment confirmed state */}
            {payDone && (paymentMethod === 'bank' || paymentMethod === 'cash') && (
              <div>
                <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-5 mb-5">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">
                    {paymentMethod === 'bank' ? '🏦 Bank Transfer Details' : '💵 ATM Cash Deposit Details'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label:'Account Name',                   value:BANK_DETAILS.accountName,   field:'name' },
                      { label:'Account Number',                 value:BANK_DETAILS.accountNumber, field:'number' },
                      { label:'Bank',                           value:BANK_DETAILS.bank,           field:'bank' },
                      { label:'Your Reference (REQUIRED)',      value:ref,                         field:'ref', highlight:true },
                    ].map(row => (
                      <div key={row.field} className={`bg-white rounded-lg p-3 border-2 ${(row as any).highlight?'border-gold-400':'border-blue-200'}`}>
                        <p className="text-xs text-gray-500 mb-1">{row.label}</p>
                        <div className="flex items-center justify-between">
                          <p className={`font-bold ${(row as any).highlight?'text-gold-600 text-lg':'text-primary-900'}`}>{row.value}</p>
                          <button onClick={() => copyToClipboard(row.value, row.field)} className="text-primary-600 hover:text-gold-600">
                            {copied===row.field ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="bg-gold-50 rounded-lg p-3 border-2 border-gold-400">
                      <p className="text-xs text-gray-500 mb-1">Amount to Pay</p>
                      <p className="font-bold text-gold-700 text-2xl">{formatCurrency(selTierObj.price)}</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-semibold">⚠️ Use your reference <strong>{ref}</strong> when paying. Your account activates within 24 hours of verification.</p>
                  </div>
                </div>
                <button onClick={() => router.push(`/membership-form?tier=${selectedTier}`)}
                  className="w-full btn-primary text-lg py-4">
                  Continue → Complete Your Profile
                </button>
              </div>
            )}

            {/* Payment method selection */}
            {!payDone && (
              <>
                {/* Method selector if none chosen yet */}
                {!paymentMethod && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Yoco Card */}
                    <button onClick={handleYocoPayment} disabled={loading}
                      className="p-5 border-4 border-primary-300 rounded-xl hover:border-gold-400 transition-all text-center group disabled:opacity-50">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 text-primary-600 group-hover:text-gold-600" />
                      <h3 className="text-lg font-bold text-primary-800 mb-1">Card Payment</h3>
                      <p className="text-gray-500 text-xs mb-3">Credit/debit via Yoco</p>
                      <div className="bg-green-50 border-2 border-green-400 rounded-lg p-2">
                        <p className="text-green-800 font-bold text-xs">✅ Instant Activation</p>
                      </div>
                    </button>

                    {/* EFT */}
                    <button onClick={() => { setPaymentMethod('bank'); recordManualPayment('bank_transfer') }}
                      className="p-5 border-4 border-primary-300 rounded-xl hover:border-gold-400 transition-all text-center group">
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-primary-600 group-hover:text-gold-600" />
                      <h3 className="text-lg font-bold text-primary-800 mb-1">EFT / Bank Transfer</h3>
                      <p className="text-gray-500 text-xs mb-3">Direct deposit from app</p>
                      <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-2">
                        <p className="text-blue-800 font-bold text-xs">⏳ 24hr Activation</p>
                      </div>
                    </button>

                    {/* ATM Cash Deposit */}
                    <button onClick={() => { setPaymentMethod('cash'); recordManualPayment('cash_deposit') }}
                      className="p-5 border-4 border-primary-300 rounded-xl hover:border-gold-400 transition-all text-center group">
                      <Smartphone className="w-12 h-12 mx-auto mb-3 text-primary-600 group-hover:text-gold-600" />
                      <h3 className="text-lg font-bold text-primary-800 mb-1">ATM Cash Deposit</h3>
                      <p className="text-gray-500 text-xs mb-3">Cash at any Nedbank ATM</p>
                      <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-2">
                        <p className="text-orange-800 font-bold text-xs">⏳ 24hr Activation</p>
                      </div>
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 mx-auto mb-3" />
                    <p className="text-gray-600">Processing payment...</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center mt-4">
                  🔒 Card payments secured by Yoco (PCI-DSS compliant) · Bank details verified Nedbank account
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-primary-800 mb-4">Frequently Asked Questions</h3>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
        </div>
        <div className="space-y-4">
          {[
            { q:'Is this really lifetime access?',     a:'Yes! Pay once, access forever. No monthly fees, ever.' },
            { q:'Can I pay cash at an ATM?',           a:'Yes! Choose ATM Cash Deposit during checkout. Deposit at any Nedbank ATM using the account number and your reference code. Your account activates within 24 hours after we verify receipt.' },
            { q:'Can I pay via bank transfer?',        a:'Yes! Choose EFT/Bank Transfer, copy the details shown, and make your payment. Activation takes up to 24 hours after verification.' },
            { q:'Why do I pay before filling in my details?', a:'We built it this way on purpose — most platforms make you fill in a long form before you can even pay. At Z2B, your seat is secured the moment you pay. The profile form comes after, at your own pace.' },
            { q:'How does the referral credit work?', a:'When you signed up for the free workshop, your email was linked to your sponsor\'s referral code immediately. When you upgrade, that link is used to credit your sponsor automatically — no matter how much time has passed.' },
            { q:'Is my payment secure?',               a:'100%. Card payments use Yoco, PCI-DSS compliant and trusted by 400,000+ SA businesses. Bank transfers go directly to our verified Nedbank business account.' },
            { q:'What are the Builder Rules?',         a:'Our Builder Rules outline the full commission structure, activity requirements, and operational policies.' },
          ].map((f, i) => (
            <div key={i} className={`card border-4 cursor-pointer transition-all ${openFaq===i?'border-gold-400':'border-primary-200 hover:border-primary-400'}`}
              onClick={() => setOpenFaq(openFaq===i?null:i)}>
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-primary-800 flex-1 pr-4">{f.q}</h4>
                <span className="text-2xl text-gold-600 flex-shrink-0">{openFaq===i?'−':'+'}</span>
              </div>
              {openFaq===i && <p className="text-gray-700 mt-3 leading-relaxed">{f.a}</p>}
            </div>
          ))}
          <div className="text-center pt-4">
            <Link href="/builder-rules" className="text-primary-700 font-semibold hover:text-gold-600 hover:underline">View full Builder Rules →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-royal-gradient py-16 border-t-8 border-gold-400">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Life?</h3>
          <p className="text-xl text-gold-200 mb-8">Join thousands building their legacy at the Z2B Table Banquet</p>
          {!user && (
            <Link href="/workshop-signup" className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-lg hover:bg-gold-50 transition-colors text-lg border-4 border-gold-400 shadow-xl">
              Start Your Journey
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-8 border-t-8 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 text-center">
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

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" /></div>}>
      <PricingInner />
    </Suspense>
  )
}