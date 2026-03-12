'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Crown, Sparkles, Zap, CreditCard, Building2, Copy, CheckCircle, GraduationCap, TrendingUp, DollarSign, FileText } from 'lucide-react'
import { MEMBERSHIP_TIERS, YOCO_CONFIG, formatCurrency } from '@/lib/yoco'

declare global {
  interface Window {
    YocoSDK: any
  }
}

// ── Compare table ─────────────────────────────────────────────
const COMPARE_ROWS = [
  { label: "ISP Rate",             vals: ["10%",    "18%",   "22%",   "25%",   "28%",   "30%"  ] },
  { label: "TPB Generations",      vals: ["None",   "Gen 3", "Gen 4", "Gen 6", "Gen 8", "Gen 10"] },
  { label: "QPB Eligible",         vals: ["✗",      "✓",     "✓",     "✓",     "✓",     "✓"    ] },
  { label: "CEO Awards",           vals: ["✗",      "✗",     "✗",     "✓",     "✓",     "✓"    ] },
  { label: "Workshop Sessions",    vals: ["1–9",    "1–90",  "1–90",  "1–90",  "1–90",  "1–90" ] },
  { label: "Vision Board",         vals: ["View",   "Full",  "Full",  "Full",  "Full",  "Full" ] },
  { label: "Coach Manlaw AI",      vals: ["3/sess", "∞",     "∞",     "∞",     "∞",     "∞"    ] },
  { label: "GroundBreaker",        vals: ["✓",      "✓",     "✓",     "✓",     "✓",     "✓"    ] },
  { label: "TableBuilder",         vals: ["✗",      "✓",     "✓",     "✓",     "✓",     "✓"    ] },
  { label: "Group Coaching",       vals: ["✗",      "✗",     "✓",     "✓",     "✓",     "✓"    ] },
  { label: "Marketplace",          vals: ["✗",      "✗",     "✗",     "✗",     "✓",     "✓"    ] },
  { label: "App Building",         vals: ["✗",      "✗",     "✗",     "x1",    "x2",    "x4"   ] },
  { label: "1-on-1 Coaching",      vals: ["✗",      "✗",     "✗",     "✗",     "✓",     "✓"    ] },
  { label: "White-label",          vals: ["✗",      "✗",     "✗",     "✗",     "✗",     "✓"    ] },
  { label: "CEO Mastermind",       vals: ["✗",      "✗",     "✗",     "✗",     "✗",     "✓"    ] },
]

const TIER_COLORS: Record<string, string> = {
  fam:      "#6B7280",
  bronze:   "#CD7F32",
  copper:   "#B87333",
  silver:   "#C0C0C0",
  gold:     "#D4AF37",
  platinum: "#E5E4E2",
}

const INCOME_STREAMS = [
  { code: "ISP", name: "Individual Sales Profit",  desc: "Direct referral commissions — 10% (FAM) up to 30% (Platinum) on every membership you refer",            color: "#22C55E", tier: "All tiers" },
  { code: "QPB", name: "Quick Pathfinder Bonus",   desc: "Refer 3 diverse members in a quarter — bonus unlocks from Bronze and above",                             color: "#0EA5E9", tier: "Bronze+"  },
  { code: "TPB", name: "Team Performance Bonus",   desc: "Earn across your team's sales — Bronze Gen 3 up to Platinum Gen 10",                                     color: "#D4AF37", tier: "Bronze+"  },
  { code: "TSC", name: "Team Sales Commission",    desc: "Commission from your downline's sales flowing through multiple generations",                              color: "#9333EA", tier: "Bronze+"  },
  { code: "TLI", name: "Ten Level Legacy Income",  desc: "Passive income flowing 10 levels deep — up to R5M in legacy earnings at Platinum",                       color: "#E879F9", tier: "Platinum" },
  { code: "CEO", name: "CEO Awards",               desc: "Elite recognition and bonus pool for top-performing Silver, Gold and Platinum builders",                  color: "#F97316", tier: "Silver+"  },
]

export default function PricingPage() {
  const [user,             setUser]             = useState<any>(null)
  const [currentTier,      setCurrentTier]      = useState<string>('fam')
  const [loading,          setLoading]          = useState(false)
  const [selectedTier,     setSelectedTier]     = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod,    setPaymentMethod]    = useState<'yoco' | 'bank' | null>(null)
  const [copied,           setCopied]           = useState<string | null>(null)
  const [showCompare,      setShowCompare]      = useState(false)
  const [openFaq,          setOpenFaq]          = useState<number | null>(null)
  const router = useRouter()

  const BANK_DETAILS = {
    accountName:   'Zero2billionaires Amavulandlela',
    accountNumber: '1318257727',
    bank:          'NEDBANK',
    reference:     user?.id?.slice(0, 8) || 'MEMBER'
  }

  useEffect(() => {
    checkUser()
    loadYocoSDK()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single()
      if (profile) setCurrentTier(profile.user_role)
    }
  }

  const loadYocoSDK = () => {
    if (document.getElementById('yoco-sdk')) return
    const script   = document.createElement('script')
    script.id      = 'yoco-sdk'
    script.src     = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
    script.async   = true
    document.body.appendChild(script)
  }

  const handleUpgrade = async (tierKey: string) => {
    const tier = MEMBERSHIP_TIERS[tierKey as keyof typeof MEMBERSHIP_TIERS]
    if (tier.price === 0) {
      alert('FAM tier is free - just sign up!')
      router.push('/signup')
      return
    }
    if (!user) { router.push('/login'); return }
    setSelectedTier(tierKey)
    setShowPaymentModal(true)
  }

  const handleYocoPayment = async () => {
    if (!selectedTier) return
    const tier = MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS]
    setLoading(true)
    setPaymentMethod('yoco')
    try {
      const yoco = new window.YocoSDK({ publicKey: YOCO_CONFIG.publicKey })
      yoco.showPopup({
        amountInCents: tier.price * 100,
        currency:      'ZAR',
        name:          `${tier.name} Tier - Lifetime Membership`,
        description:   `Z2B Table Banquet - ${tier.name} Tier`,
        callback: async (result: any) => {
          if (result.error) {
            console.error('Payment error:', result.error)
            alert('Payment failed. Please try again.')
            setLoading(false)
            setShowPaymentModal(false)
            setSelectedTier(null)
            return
          }
          await upgradeUserTier(selectedTier, result.id, 'yoco')
        }
      })
    } catch (error) {
      console.error('Yoco SDK error:', error)
      alert('Payment system unavailable. Please try Bank Transfer instead.')
      setLoading(false)
    }
  }

  const handleBankTransfer = async () => {
    if (!selectedTier) return
    const tier = MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS]
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id:          user.id,
          tier:             selectedTier,
          amount:           tier.price,
          currency:         'ZAR',
          payment_provider: 'bank_transfer',
          payment_id:       `BANK_${user.id.slice(0, 8)}_${Date.now()}`,
          status:           'pending',
          payment_type:     'tier_upgrade',
          metadata:         { bank_details: BANK_DETAILS, instructions: 'Awaiting manual verification' }
        })
      if (paymentError) throw paymentError
      alert(`✅ Bank transfer details saved!\n\nPlease make your payment and we'll activate your ${tier.name} tier within 24 hours after verification.`)
      setShowPaymentModal(false)
      setSelectedTier(null)
      setPaymentMethod(null)
    } catch (error) {
      console.error('Bank transfer record error:', error)
      alert('Failed to record bank transfer. Please contact support.')
    }
  }

  const upgradeUserTier = async (tierKey: string, paymentId: string, provider: string) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_role:      tierKey === 'fam' ? 'free_member' : 'paid_member',
          is_paid_member: tierKey !== 'fam',
          payment_status: 'paid'
        })
        .eq('id', user.id)
      if (updateError) throw updateError

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id:          user.id,
          tier:             tierKey,
          amount:           MEMBERSHIP_TIERS[tierKey as keyof typeof MEMBERSHIP_TIERS].price,
          currency:         'ZAR',
          payment_provider: provider,
          payment_id:       paymentId,
          status:           'completed',
          payment_type:     'tier_upgrade'
        })
      if (paymentError) console.error('Payment record error:', paymentError)

      alert(`🎉 Welcome to ${MEMBERSHIP_TIERS[tierKey as keyof typeof MEMBERSHIP_TIERS].name} tier! Your lifetime membership is now active.`)
      setShowPaymentModal(false)
      setSelectedTier(null)
      setPaymentMethod(null)
      router.push('/dashboard')
    } catch (error) {
      console.error('Tier upgrade error:', error)
      alert('Payment received but tier upgrade failed. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const getTierIcon = (tierKey: string) => {
    switch (tierKey) {
      case 'platinum': return <Crown className="w-8 h-8" />
      case 'gold':     return <Sparkles className="w-8 h-8" />
      case 'silver':   return <Zap className="w-8 h-8" />
      default:         return <Check className="w-8 h-8" />
    }
  }

  const tierKeys = Object.keys(MEMBERSHIP_TIERS)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">

      {/* ── Header ── */}
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
              <Link href="/" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Home
              </Link>
              <Link href="/workshop" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-4 rounded-lg transition-colors border-2 border-gold-400">
                Workshop
              </Link>
              {user
                ? <Link href="/dashboard" className="btn-primary">Dashboard</Link>
                : <Link href="/login"     className="btn-primary">Sign In</Link>
              }
            </div>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-20 border-b-8 border-gold-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Choose Your Legacy Path</h2>
          <p className="text-xl md:text-2xl text-gold-200 max-w-3xl mx-auto mb-4">
            One-time payment. Lifetime access. Build your empire forever.
          </p>
          <p className="text-lg text-purple-200 mb-8">
            Pay via Card or Bank Transfer 🏦 &nbsp; No monthly fees ever! 🚀
          </p>
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border-2 border-gold-400 text-gold-300 font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {showCompare ? '← Back to Tier Cards' : '📊 Compare All Tiers'}
          </button>
        </div>
      </section>

      {/* ── Compare Table ── */}
      {showCompare && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h3 className="text-4xl font-bold text-primary-800 mb-3">Compare All Tiers</h3>
            <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
          </div>
          <div className="overflow-x-auto rounded-2xl border-4 border-primary-200 shadow-xl">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #1A0035, #0D0020)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 'normal', width: '180px' }}>
                    Feature
                  </th>
                  {tierKeys.map(k => (
                    <th key={k} style={{ padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: TIER_COLORS[k] }}>
                        {MEMBERSHIP_TIERS[k as keyof typeof MEMBERSHIP_TIERS].name}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>
                        {formatCurrency(MEMBERSHIP_TIERS[k as keyof typeof MEMBERSHIP_TIERS].price)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(147,51,234,0.04)' : 'transparent' }}>
                    <td style={{ padding: '10px 16px', fontSize: '12px', color: '#4B5563', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>
                      {row.label}
                    </td>
                    {row.vals.map((v, vi) => (
                      <td key={vi} style={{
                        padding: '10px 10px', textAlign: 'center', fontSize: '13px',
                        borderBottom: '1px solid #E5E7EB',
                        color: v === '✓' ? '#16A34A' : v === '✗' ? '#D1D5DB' : TIER_COLORS[tierKeys[vi]],
                        fontWeight: v === '✓' || v === '✗' ? 'bold' : '600'
                      }}>
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

      {/* ── Pricing Tiers (original structure preserved) ── */}
      {!showCompare && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => {
              const isCurrentTier = currentTier === key ||
                (currentTier === 'free_member' && key === 'fam') ||
                (currentTier === 'paid_member' && key !== 'fam')
              const isBestValue = key === 'gold'

              return (
                <div
                  key={key}
                  className={`card border-4 ${
                    isBestValue     ? 'border-gold-500 shadow-2xl transform scale-105'
                    : isCurrentTier ? 'border-green-400'
                    : 'border-primary-200'
                  } hover:border-gold-400 transition-all relative`}
                >
                  {isBestValue && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gold-gradient text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        ⭐ BEST VALUE
                      </span>
                    </div>
                  )}
                  {isCurrentTier && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ✓ ACTIVE
                      </span>
                    </div>
                  )}

                  {/* Icon + Price */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-br ${
                      key === 'platinum' ? 'from-purple-500 to-purple-700'
                      : key === 'gold'   ? 'from-yellow-500 to-yellow-700'
                      : key === 'silver' ? 'from-slate-400 to-slate-600'
                      : key === 'copper' ? 'from-amber-600 to-amber-800'
                      : key === 'bronze' ? 'from-orange-600 to-orange-800'
                      : 'from-gray-400 to-gray-600'
                    } text-white shadow-lg`}>
                      {getTierIcon(key)}
                    </div>
                    <h3 className="text-3xl font-bold text-primary-800 mb-2">{tier.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-primary-900">{formatCurrency(tier.price)}</span>
                      {tier.price > 0 && (
                        <p className="text-sm text-gray-600 mt-1">One-time • Lifetime Access</p>
                      )}
                    </div>
                  </div>

                  {/* Training & Access Benefits — from MEMBERSHIP_TIERS */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-primary-700 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      TRAINING & ACCESS
                    </h4>
                    <ul className="space-y-2">
                      {tier.trainingBenefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                      {/* Z2B TABLE app features appended per tier */}
                      {key === 'fam' && <>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">🎓 Sessions 1–9 Workshop — free forever</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">🤖 Coach Manlaw AI — 3 chats/session</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">🌱 GroundBreaker referral dashboard</span>
                        </li>
                      </>}
                      {key !== 'fam' && <>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">🎓 All 90 Workshop Sessions — lifetime</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">🤖 Coach Manlaw AI — unlimited</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">🌱 GroundBreaker referral dashboard</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">🏛️ TableBuilder team dashboard</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">🎯 Vision Board — full save & download</span>
                        </li>
                      </>}
                    </ul>
                  </div>

                  {/* Sales & Marketing Benefits — from MEMBERSHIP_TIERS */}
                  <div className="mb-6 bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <h4 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      SALES & MARKETING
                    </h4>
                    <ul className="space-y-2">
                      {tier.salesBenefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Terms & Builder Rules Link */}
                  <div className="mb-6 text-center border-t-2 border-gray-200 pt-4">
                    <p className="text-xs text-gray-600 mb-2">Terms & Conditions Apply</p>
                    <Link
                      href="/builder-rules"
                      className="text-sm text-primary-700 font-semibold hover:text-gold-600 hover:underline flex items-center justify-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      View Builder Rules
                    </Link>
                  </div>

                  {/* Upgrade Button */}
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={loading && selectedTier === key || isCurrentTier}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                      isCurrentTier     ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : isBestValue     ? 'bg-gold-gradient text-white hover:shadow-xl'
                      : 'bg-royal-gradient text-white hover:shadow-lg'
                    }`}
                  >
                    {loading && selectedTier === key ? 'Processing...'
                      : isCurrentTier   ? 'Current Tier'
                      : tier.price === 0 ? 'Start Free'
                      : `Upgrade to ${tier.name}`}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 6 Income Streams ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t-4 border-primary-100">
        <div className="text-center mb-10">
          <h3 className="text-4xl font-bold text-primary-800 mb-3">6 Income Streams</h3>
          <p className="text-gray-600 mb-4">Activated progressively as you upgrade your tier</p>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INCOME_STREAMS.map(s => (
            <div key={s.code} className="card border-4 border-primary-200 hover:border-gold-400 transition-all" style={{ borderLeft: `4px solid ${s.color}` }}>
              <div className="flex justify-between items-center mb-3">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.code}</div>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">{s.tier}</span>
              </div>
              <div className="font-bold text-primary-800 mb-2">{s.name}</div>
              <div className="text-sm text-gray-600 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Kingdom Business ── */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-16 border-y-4 border-gold-400">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">👑</div>
          <h3 className="text-3xl font-bold text-white mb-6">This Is a Kingdom Business</h3>
          <p className="text-lg text-purple-200 leading-relaxed mb-6">
            Z2B was not built to make employees richer consumers. It was built to raise up stewards — people who understand that wealth is a tool for service, legacy, and community transformation. Every membership activates a builder. Every builder cultivates a table. Every table changes a family.
          </p>
          <p className="text-gold-300 italic text-lg">
            "You prepare a table before me in the presence of my enemies." — Psalm 23:5
          </p>
        </div>
      </section>

      {/* ── Payment Method Modal (original preserved exactly) ── */}
      {showPaymentModal && selectedTier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => { setShowPaymentModal(false); setSelectedTier(null); setPaymentMethod(null) }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold text-primary-800 mb-6 text-center">Choose Payment Method</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Card Payment */}
              <button
                onClick={handleYocoPayment}
                disabled={loading}
                className="p-6 border-4 border-primary-300 rounded-xl hover:border-gold-400 transition-all text-center group"
              >
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary-600 group-hover:text-gold-600" />
                <h3 className="text-xl font-bold text-primary-800 mb-2">Card Payment</h3>
                <p className="text-gray-600 mb-4">Pay instantly with credit/debit card via Yoco</p>
                <div className="bg-green-50 border-2 border-green-400 rounded-lg p-3">
                  <p className="text-green-800 font-semibold">✅ Instant Activation</p>
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => setPaymentMethod('bank')}
                className="p-6 border-4 border-primary-300 rounded-xl hover:border-gold-400 transition-all text-center group"
              >
                <Building2 className="w-16 h-16 mx-auto mb-4 text-primary-600 group-hover:text-gold-600" />
                <h3 className="text-xl font-bold text-primary-800 mb-2">Bank Transfer</h3>
                <p className="text-gray-600 mb-4">EFT/Direct Deposit to our bank account</p>
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-3">
                  <p className="text-blue-800 font-semibold">⏳ 24hr Activation</p>
                </div>
              </button>
            </div>

            {/* Bank Transfer Details */}
            {paymentMethod === 'bank' && (
              <div className="bg-primary-50 border-4 border-primary-400 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-primary-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  Bank Transfer Details
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Account Name',                   value: BANK_DETAILS.accountName,   field: 'name',      highlight: false },
                    { label: 'Account Number',                 value: BANK_DETAILS.accountNumber, field: 'number',    highlight: false },
                    { label: 'Bank',                           value: BANK_DETAILS.bank,           field: 'bank',      highlight: false },
                    { label: 'Payment Reference (IMPORTANT!)', value: BANK_DETAILS.reference,     field: 'reference', highlight: true  },
                  ].map(row => (
                    <div key={row.field} className={`bg-white rounded-lg p-4 border-2 ${row.highlight ? 'border-gold-400' : 'border-primary-200'}`}>
                      <p className="text-sm text-gray-600 mb-1">{row.label}</p>
                      <div className="flex items-center justify-between">
                        <p className={`font-bold ${row.highlight ? 'text-gold-600 text-xl' : 'text-primary-900'}`}>{row.value}</p>
                        <button onClick={() => copyToClipboard(row.value, row.field)} className="text-primary-600 hover:text-gold-600">
                          {copied === row.field ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="bg-gold-50 rounded-lg p-4 border-2 border-gold-400">
                    <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                    <p className="font-bold text-gold-700 text-3xl">
                      {formatCurrency(MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS].price)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Important:</strong> Use the reference code above when making your payment. Your account will be activated within 24 hours after we verify your payment.
                  </p>
                </div>
                <button onClick={handleBankTransfer} className="w-full btn-primary mt-6 text-lg py-4">
                  I&apos;ve Made the Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FAQ (accordion) ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-primary-800 mb-4">Frequently Asked Questions</h3>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
        </div>
        <div className="space-y-4">
          {[
            { q: 'Is this really lifetime access?',       a: 'Yes! Pay once, access forever. No monthly fees, ever.' },
            { q: 'Can I pay via bank transfer?',          a: 'Yes! We accept both card payments (instant) and bank transfers (activated within 24 hours). Choose your preferred method during checkout.' },
            { q: 'What are the Builder Rules?',           a: 'Our Builder Rules outline the commission structure, activity requirements, and operational policies.' },
            { q: 'Is my payment secure?',                 a: '100%. Card payments use Yoco, a PCI-DSS compliant payment provider trusted by 400,000+ South African businesses. Bank transfers go directly to our verified business account.' },
            { q: 'Is this a pyramid scheme?',             a: 'No. Z2B is a legal direct sales and education platform regulated under the Consumer Protection Act. Real products, real education, real value. You earn by sharing — not just by recruiting.' },
            { q: 'Do I need to quit my job?',             a: 'Never. Z2B was built specifically for employed people. You build alongside your job in 30-minute daily windows. The system works through duplication — your network grows even when you rest.' },
            { q: 'What is GroundBreaker?',                a: 'GroundBreaker is your prospect cultivation dashboard. Share your referral link. When someone goes through the 9 free sessions, you get alerts at Sessions 3, 6, and 9 — and a Harvest Ready notification when they are ready to join.' },
          ].map((f, i) => (
            <div
              key={i}
              className={`card border-4 cursor-pointer transition-all ${openFaq === i ? 'border-gold-400' : 'border-primary-200 hover:border-primary-400'}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-primary-800 flex-1 pr-4">{f.q}</h4>
                <span className="text-2xl text-gold-600 flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="text-gray-700 mt-3 leading-relaxed">{f.a}</p>}
            </div>
          ))}
          <div className="text-center pt-4">
            <Link href="/builder-rules" className="text-primary-700 font-semibold hover:text-gold-600 hover:underline">
              View full Builder Rules →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA (original preserved) ── */}
      <section className="bg-royal-gradient py-16 border-t-8 border-gold-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Life?</h3>
          <p className="text-xl text-gold-200 mb-8">
            Join thousands building their legacy at the Z2B Table Banquet
          </p>
          {!user && (
            <Link href="/signup" className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-lg hover:bg-gold-50 transition-colors text-lg border-4 border-gold-400 shadow-xl">
              Start Your Journey
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer (original preserved) ── */}
      <footer className="bg-primary-900 text-white py-8 border-t-8 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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