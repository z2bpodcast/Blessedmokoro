'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Crown, Sparkles, Zap, CreditCard, Building2, Copy, CheckCircle, GraduationCap, TrendingUp, DollarSign, FileText } from 'lucide-react'
import { MEMBERSHIP_TIERS, YOCO_CONFIG, formatCurrency } from '@/lib/yoco'

declare global { interface Window { YocoSDK: any } }

const BANK = {
  accountName:   'Zero2billionaires Amavulandlela',
  accountNumber: '1318257727',
  bank:          'NEDBANK',
}

const TIER_COLORS: Record<string,string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2',
}

const ISP_RATES: Record<string,number> = {
  fam:0.10, bronze:0.18, copper:0.22, silver:0.25, gold:0.28, platinum:0.30
}

export default function PricingPage() {
  const [user,             setUser]             = useState<any>(null)
  const [currentTier,      setCurrentTier]      = useState<string>('fam')
  const [loading,          setLoading]          = useState(false)
  const [selectedTier,     setSelectedTier]     = useState<string|null>(null)
  const [showModal,        setShowModal]        = useState(false)
  const [paymentMethod,    setPaymentMethod]    = useState<'card'|'bank'|'atm'|null>(null)
  const [copied,           setCopied]           = useState<string|null>(null)
  const [openFaq,          setOpenFaq]          = useState<number|null>(null)
  const [showCompare,      setShowCompare]      = useState(false)
  const [refCode,          setRefCode]          = useState('')
  const [email,            setEmail]            = useState('')
  const router = useRouter()

  useEffect(() => {
    // Load user + referral + email from localStorage
    const savedEmail = localStorage.getItem('z2b_workshop_email') || ''
    const savedRef   = localStorage.getItem('z2b_ref') || ''
    setEmail(savedEmail)
    setRefCode(savedRef)

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('user_role, paid_tier').eq('id', user.id).single()
          .then(({ data }) => { if (data) setCurrentTier(data.paid_tier || data.user_role || 'fam') })

        // Auto-open payment modal if returning from login with ?autoopen=tier
        const params = new URLSearchParams(window.location.search)
        const autoOpen = params.get('autoopen')
        if (autoOpen && MEMBERSHIP_TIERS[autoOpen as keyof typeof MEMBERSHIP_TIERS]) {
          setTimeout(() => {
            setSelectedTier(autoOpen)
            setPaymentMethod(null)
            setShowModal(true)
          }, 600)
        }
      }
    })

    // Load Yoco SDK
    if (!document.getElementById('yoco-sdk')) {
      const s = document.createElement('script')
      s.id = 'yoco-sdk'
      s.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
      s.async = true
      document.body.appendChild(s)
    }
  }, [])

  const reference = user?.id?.slice(0,8) || email?.slice(0,8) || 'Z2BMEMBER'

  const openPayment = (tierKey: string) => {
    const tier = MEMBERSHIP_TIERS[tierKey as keyof typeof MEMBERSHIP_TIERS]
    if (tier.price === 0) { router.push('/workshop'); return }

    // Must be logged in to upgrade — send to login with return URL
    if (!user) {
      router.push(`/login?redirect=/pricing&upgrade=${tierKey}`)
      return
    }

    setSelectedTier(tierKey)
    setPaymentMethod(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTier(null)
    setPaymentMethod(null)
  }

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── CARD: Yoco popup → on success → /register/complete ──
  const payByCard = async () => {
    if (!selectedTier) return
    const tier = MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS]
    setLoading(true)
    try {
      const yoco = new window.YocoSDK({ publicKey: YOCO_CONFIG.publicKey })
      yoco.showPopup({
        amountInCents: tier.price * 100,
        currency:      'ZAR',
        name:          `Z2B ${tier.name} — Lifetime Membership`,
        description:   `Z2B Table Banquet ${tier.name} Tier`,
        callback: async (result: any) => {
          if (result.error) {
            alert('Payment failed. Please try again.')
            setLoading(false)
            return
          }

          // Record payment in Supabase
          const { data: payRec } = await supabase.from('payments').insert({
            user_id:          user?.id || null,
            email:            email || user?.email || null,
            tier:             selectedTier,
            amount:           tier.price,
            currency:         'ZAR',
            payment_provider: 'yoco',
            payment_id:       result.id,
            status:           'completed',
            payment_type:     'tier_upgrade',
            metadata:         { referred_by: refCode },
          }).select().single()

          // If already logged in — update profile immediately
          if (user) {
            await supabase.from('profiles').update({
              paid_tier:      selectedTier,
              is_paid_member: true,
              payment_status: 'paid',
              paid_at:        new Date().toISOString(),
            }).eq('id', user.id)
            closeModal()
            router.push(`/dashboard?upgraded=${selectedTier}`)
            return
          }

          // Not logged in → go to membership form
          closeModal()
          router.push(`/register/complete?payment_id=${(payRec as any)?.id || result.id}&tier=${selectedTier}`)
        }
      })
    } catch {
      alert('Card payment unavailable. Please try EFT or ATM Cash Deposit.')
      setLoading(false)
    }
  }

  // ── EFT / ATM: record pending payment ──
  const recordManualPayment = async (method: 'bank'|'atm') => {
    if (!selectedTier) return
    const tier     = MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS]
    const provider = method === 'atm' ? 'atm_deposit' : 'bank_transfer'

    const { data: payRec } = await supabase.from('payments').insert({
      user_id:          user?.id || null,
      email:            email || user?.email || null,
      tier:             selectedTier,
      amount:           tier.price,
      currency:         'ZAR',
      payment_provider: provider,
      payment_id:       `${provider.toUpperCase()}_${reference}_${Date.now()}`,
      status:           'pending',
      payment_type:     'tier_upgrade',
      metadata:         { referred_by: refCode, reference },
    }).select().single()

    closeModal()

    if (user) {
      // Existing member — update tier to pending, go to dashboard
      await supabase.from('profiles').update({
        paid_tier:      selectedTier,
        payment_status: 'pending',
      }).eq('id', user.id)
      router.push(`/dashboard?upgrade=${selectedTier}&pending=true`)
    } else {
      // New prospect — light signup then dashboard
      router.push(`/register/complete?payment_id=${(payRec as any)?.id || 'pending'}&tier=${selectedTier}&method=pending`)
    }
  }

  const selTier = selectedTier ? MEMBERSHIP_TIERS[selectedTier as keyof typeof MEMBERSHIP_TIERS] : null

  const getTierIcon = (key: string) => {
    if (key === 'platinum') return <Crown className="w-8 h-8" />
    if (key === 'gold')     return <Sparkles className="w-8 h-8" />
    if (key === 'silver')   return <Zap className="w-8 h-8" />
    return <Check className="w-8 h-8" />
  }

  const FAQS = [
    { q:'Is this really lifetime access?',      a:'Yes. Pay once, access forever. No monthly fees, ever.' },
    { q:'Can I pay via bank transfer?',         a:'Yes. We accept card (instant activation), bank EFT and ATM cash deposit (both activated within 24 hours after verification).' },
    { q:'Can I pay cash at an ATM?',            a:'Yes. Choose ATM Cash Deposit, deposit at any Nedbank ATM using the account number and your reference code. Activates within 24 hours.' },
    { q:'What are the Builder Rules?',          a:'Our Builder Rules outline commission structure, activity requirements and policies. View the full details via the link on each tier card.' },
    { q:'Is my payment secure?',                a:'100%. Card payments use Yoco, PCI-DSS compliant and trusted by 400,000+ SA businesses. EFT and ATM go directly to our verified Nedbank account.' },
    { q:'Is this a pyramid scheme?',            a:'No. Z2B is a legal direct sales and education platform under the Consumer Protection Act. Real products, real education, real value.' },
    { q:'Do I need to quit my job?',            a:'Never. Z2B was built for employed people. Build alongside your job in 30-minute daily windows.' },
    { q:'When does my sponsor get credited?',   a:'Your sponsor is credited automatically the moment your payment is confirmed — instantly for card, within 24 hours for EFT and ATM.' },
  ]

  const COMPARE = [
    { label:'ISP Rate',          vals:['10%','18%','22%','25%','28%','30%'] },
    { label:'TPB Generations',   vals:['None','Gen 3','Gen 4','Gen 6','Gen 8','Gen 10'] },
    { label:'QPB Eligible',      vals:['✗','✓','✓','✓','✓','✓'] },
    { label:'CEO Awards',        vals:['✗','✗','✗','✓','✓','✓'] },
    { label:'Workshop Sessions', vals:['1–9','1–90','1–90','1–90','1–90','1–90'] },
    { label:'Coach Manlaw AI',   vals:['3/sess','∞','∞','∞','∞','∞'] },
    { label:'Vision Board',      vals:['View','Full','Full','Full','Full','Full'] },
    { label:'GroundBreaker',     vals:['✓','✓','✓','✓','✓','✓'] },
    { label:'TableBuilder',      vals:['✗','✓','✓','✓','✓','✓'] },
    { label:'Marketplace',       vals:['✗','✗','✗','✗','✓','✓'] },
    { label:'App Building',      vals:['✗','✗','✗','x1','x2','x4'] },
    { label:'1-on-1 Coaching',   vals:['✗','✗','✗','✗','✓','✓'] },
    { label:'White-label',       vals:['✗','✗','✗','✗','✗','✓'] },
    { label:'CEO Mastermind',    vals:['✗','✗','✗','✗','✗','✓'] },
  ]

  const tierKeys = Object.keys(MEMBERSHIP_TIERS)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">

      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Z2B" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
            <div>
              <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
              <p className="text-sm text-gold-300">Lifetime Membership Tiers</p>
            </div>
          </Link>
          <div className="flex gap-3">
            <Link href="/"         className="bg-white text-primary-700 font-semibold py-2 px-4 rounded-lg border-2 border-gold-400 hover:bg-gold-50">Home</Link>
            <Link href="/workshop" className="bg-white text-primary-700 font-semibold py-2 px-4 rounded-lg border-2 border-gold-400 hover:bg-gold-50">Workshop</Link>
            {user
              ? <Link href="/dashboard" className="btn-primary">Dashboard</Link>
              : <Link href="/login"     className="btn-primary">Sign In</Link>
            }
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-20 border-b-8 border-gold-400 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Choose Your Legacy Path</h2>
          <p className="text-xl text-gold-200 mb-3">One-time payment. Lifetime access. Build your empire forever.</p>
          <p className="text-lg text-purple-200 mb-8">💳 Card &nbsp;·&nbsp; 🏦 Bank EFT &nbsp;·&nbsp; 💵 ATM Cash Deposit &nbsp;·&nbsp; No monthly fees ever!</p>
          <button onClick={() => setShowCompare(!showCompare)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border-2 border-gold-400 text-gold-300 font-semibold py-2 px-6 rounded-lg transition-colors">
            {showCompare ? '← Back to Tier Cards' : '📊 Compare All Tiers'}
          </button>
        </div>
      </section>

      {/* Compare table */}
      {showCompare && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="overflow-x-auto rounded-2xl border-4 border-primary-200 shadow-xl">
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'700px' }}>
              <thead>
                <tr style={{ background:'linear-gradient(135deg,#1A0035,#0D0020)' }}>
                  <th style={{ padding:'14px 16px', textAlign:'left', color:'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:'normal', width:'180px' }}>Feature</th>
                  {tierKeys.map(k => (
                    <th key={k} style={{ padding:'14px 8px', textAlign:'center' }}>
                      <div style={{ fontSize:'11px', fontWeight:'bold', color: TIER_COLORS[k] }}>{MEMBERSHIP_TIERS[k as keyof typeof MEMBERSHIP_TIERS].name}</div>
                      <div style={{ fontSize:'14px', fontWeight:'bold', color:'#fff', marginTop:'2px' }}>{formatCurrency(MEMBERSHIP_TIERS[k as keyof typeof MEMBERSHIP_TIERS].price)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(147,51,234,0.04)' : 'transparent' }}>
                    <td style={{ padding:'10px 16px', fontSize:'12px', color:'#4B5563', borderBottom:'1px solid #E5E7EB', fontWeight:'600' }}>{row.label}</td>
                    {row.vals.map((v, vi) => (
                      <td key={vi} style={{ padding:'10px 8px', textAlign:'center', fontSize:'12px', borderBottom:'1px solid #E5E7EB', color: v==='✓'?'#16A34A':v==='✗'?'#D1D5DB': TIER_COLORS[tierKeys[vi]], fontWeight: v==='✓'||v==='✗'?'bold':'600' }}>
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

      {/* Tier cards */}
      {!showCompare && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => {
              const isActive   = currentTier === key || (currentTier==='free_member'&&key==='fam') || (currentTier==='paid_member'&&key!=='fam')
              const isBest     = key === 'gold'
              return (
                <div key={key} className={`card border-4 relative hover:border-gold-400 transition-all ${isBest?'border-gold-500 shadow-2xl scale-105':isActive?'border-green-400':'border-primary-200'}`}>
                  {isBest  && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="bg-gold-gradient text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">⭐ BEST VALUE</span></div>}
                  {isActive && <div className="absolute -top-4 right-4"><span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">✓ ACTIVE</span></div>}

                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 text-white shadow-lg bg-gradient-to-br ${
                      key==='platinum'?'from-purple-500 to-purple-700':key==='gold'?'from-yellow-500 to-yellow-700':
                      key==='silver'?'from-slate-400 to-slate-600':key==='copper'?'from-amber-600 to-amber-800':
                      key==='bronze'?'from-orange-600 to-orange-800':'from-gray-400 to-gray-600'}`}>
                      {getTierIcon(key)}
                    </div>
                    <h3 className="text-3xl font-bold text-primary-800 mb-2">{tier.name}</h3>
                    <div className="text-5xl font-bold text-primary-900">{formatCurrency(tier.price)}</div>
                    {tier.price > 0 && <p className="text-sm text-gray-500 mt-1">One-time · Lifetime Access</p>}
                  </div>

                  <div className="mb-5">
                    <h4 className="text-xs font-bold text-primary-700 mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4"/>TRAINING & ACCESS</h4>
                    <ul className="space-y-2">
                      {tier.trainingBenefits.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">{b}</span></li>
                      ))}
                      {key==='fam' && <>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">🎓 Sessions 1–9 free forever</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">🤖 Coach Manlaw AI — 3/session</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">🌱 GroundBreaker dashboard</span></li>
                      </>}
                      {key!=='fam' && <>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">🎓 All 90 Sessions — lifetime</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">🤖 Coach Manlaw AI — unlimited</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">🌱 GroundBreaker dashboard</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">🏛️ TableBuilder dashboard</span></li>
                        <li className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">🎯 Vision Board — full</span></li>
                      </>}
                    </ul>
                  </div>

                  <div className="mb-5 bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <h4 className="text-xs font-bold text-purple-700 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/>SALES & MARKETING</h4>
                    <ul className="space-y-2">
                      {tier.salesBenefits.map((b: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm"><DollarSign className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5"/><span className="text-gray-700">{b}</span></li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-5 text-center border-t-2 border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 mb-1">Terms & Conditions Apply</p>
                    <Link href="/builder-rules" className="text-sm text-primary-700 font-semibold hover:text-gold-600 flex items-center justify-center gap-1">
                      <FileText className="w-4 h-4"/>View Builder Rules
                    </Link>
                  </div>

                  <button
                    onClick={() => openPayment(key)}
                    disabled={isActive}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${isActive?'bg-gray-300 text-gray-600 cursor-not-allowed':isBest?'bg-gold-gradient text-white hover:shadow-xl':'bg-royal-gradient text-white hover:shadow-lg'}`}
                  >
                    {isActive ? 'Current Tier' : tier.price===0 ? 'Start Free' : `Upgrade to ${tier.name}`}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Payment Modal */}
      {showModal && selTier && selectedTier && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl leading-none">×</button>

            {/* Step header */}
            <div className="text-center mb-6">
              <div className="text-xs font-bold text-primary-500 tracking-widest mb-1">STEP 1 OF 2 — PAYMENT</div>
              <h2 className="text-2xl font-bold text-primary-800 mb-1">{selTier.name} Membership</h2>
              <div className="text-3xl font-bold text-primary-900">{formatCurrency(selTier.price)}</div>
              <p className="text-xs text-gray-400 mt-1">Once-off · Lifetime · Your membership form comes after payment</p>
            </div>

            {/* 3 payment options */}
            <div className="flex flex-col gap-3 mb-4">

              {/* Card */}
              <button onClick={payByCard} disabled={loading}
                className="flex items-center gap-4 p-4 border-4 border-primary-200 rounded-xl hover:border-gold-400 transition-all text-left w-full">
                <CreditCard className="w-10 h-10 text-primary-600 flex-shrink-0"/>
                <div className="flex-1">
                  <div className="font-bold text-primary-800">Pay by Card</div>
                  <div className="text-gray-500 text-xs">Credit / debit card via Yoco — instant &amp; secure</div>
                </div>
                <div className="bg-green-50 border-2 border-green-400 rounded-lg px-3 py-2 text-center flex-shrink-0">
                  <div className="text-green-800 font-bold text-xs">✅ INSTANT</div>
                </div>
              </button>

              {/* EFT */}
              <button onClick={() => setPaymentMethod(paymentMethod==='bank' ? null : 'bank')}
                className={`flex items-center gap-4 p-4 border-4 rounded-xl hover:border-gold-400 transition-all text-left w-full ${paymentMethod==='bank'?'border-gold-400 bg-amber-50':'border-primary-200'}`}>
                <Building2 className="w-10 h-10 text-primary-600 flex-shrink-0"/>
                <div className="flex-1">
                  <div className="font-bold text-primary-800">Bank EFT / Transfer</div>
                  <div className="text-gray-500 text-xs">Internet banking to our Nedbank account</div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg px-3 py-2 text-center flex-shrink-0">
                  <div className="text-blue-800 font-bold text-xs">⏳ 24hrs</div>
                </div>
              </button>

              {/* ATM */}
              <button onClick={() => setPaymentMethod(paymentMethod==='atm' ? null : 'atm')}
                className={`flex items-center gap-4 p-4 border-4 rounded-xl hover:border-gold-400 transition-all text-left w-full ${paymentMethod==='atm'?'border-gold-400 bg-amber-50':'border-primary-200'}`}>
                <span className="text-4xl flex-shrink-0">💵</span>
                <div className="flex-1">
                  <div className="font-bold text-primary-800">ATM Cash Deposit</div>
                  <div className="text-gray-500 text-xs">Cash at any Nedbank ATM nationwide</div>
                </div>
                <div className="bg-orange-50 border-2 border-orange-400 rounded-lg px-3 py-2 text-center flex-shrink-0">
                  <div className="text-orange-800 font-bold text-xs">⏳ 24hrs</div>
                </div>
              </button>
            </div>

            {/* Bank details panel — shown for EFT or ATM */}
            {(paymentMethod==='bank' || paymentMethod==='atm') && (
              <div className="bg-primary-50 border-4 border-primary-400 rounded-xl p-5 mb-4">
                <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5"/>
                  {paymentMethod==='atm' ? 'ATM Cash Deposit Details' : 'Bank Transfer Details'}
                </h3>
                <div className="space-y-3">
                  {[
                    { label:'Account Name',                   value: BANK.accountName,   field:'name',      hi:false },
                    { label:'Account Number',                 value: BANK.accountNumber, field:'number',    hi:false },
                    { label:'Bank',                           value: BANK.bank,           field:'bank',      hi:false },
                    { label:'Your Reference (IMPORTANT)',     value: reference,           field:'ref',       hi:true  },
                  ].map(row => (
                    <div key={row.field} className={`bg-white rounded-lg p-3 border-2 ${row.hi?'border-gold-400':'border-primary-200'}`}>
                      <p className="text-xs text-gray-500 mb-1">{row.label}</p>
                      <div className="flex items-center justify-between">
                        <p className={`font-bold ${row.hi?'text-gold-600 text-lg':'text-primary-900'}`}>{row.value}</p>
                        <button onClick={() => copy(row.value, row.field)} className="text-primary-400 hover:text-gold-600 ml-2">
                          {copied===row.field ? <CheckCircle className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5"/>}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="bg-gold-50 border-2 border-gold-400 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Amount to Deposit</p>
                    <p className="font-bold text-gold-700 text-2xl">{formatCurrency(selTier.price)}</p>
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 text-xs text-yellow-800">
                  <strong>⚠️ Important:</strong> Use YOUR reference code above. We activate your membership within 24 hours after verifying receipt.
                </div>
                <button
                  onClick={() => recordManualPayment(paymentMethod)}
                  className="w-full btn-primary mt-4 py-4 text-base font-bold"
                >
                  I&apos;ve Noted the Details — Complete My Registration →
                </button>
              </div>
            )}

            <p className="text-center text-xs text-gray-400">🔒 Secure · No monthly fees · Sponsor credited automatically</p>
          </div>
        </div>
      )}

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h3 className="text-4xl font-bold text-primary-800 mb-4">Frequently Asked Questions</h3>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
        </div>
        <div className="space-y-4">
          {FAQS.map((f,i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq===i?null:i)}
              className={`card border-4 cursor-pointer transition-all ${openFaq===i?'border-gold-400':'border-primary-200 hover:border-primary-400'}`}>
              <div className="flex justify-between items-center">
                <h4 className="text-base font-bold text-primary-800 flex-1 pr-4">{f.q}</h4>
                <span className="text-2xl text-gold-600 flex-shrink-0">{openFaq===i?'−':'+'}</span>
              </div>
              {openFaq===i && <p className="text-gray-700 mt-3 leading-relaxed text-sm">{f.a}</p>}
            </div>
          ))}
          <div className="text-center pt-2">
            <Link href="/builder-rules" className="text-primary-700 font-semibold hover:text-gold-600">View full Builder Rules →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-royal-gradient py-16 border-t-8 border-gold-400 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Life?</h3>
          <p className="text-xl text-gold-200 mb-8">Join thousands building their legacy at the Z2B Table Banquet</p>
          {!user && (
            <Link href="/signup" className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-lg hover:bg-gold-50 text-lg border-4 border-gold-400 shadow-xl">
              Start Your Journey
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-8 border-t-8 border-gold-400">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Z2B" className="h-12 w-12 rounded-lg border-2 border-gold-400"/>
            <span className="text-2xl font-bold text-gold-300">Z2B TABLE BANQUET</span>
          </div>
          <p className="text-gold-200">© 2026 Z2B Table Banquet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}