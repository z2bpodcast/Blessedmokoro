'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import { MEMBERSHIP_TIERS, YOCO_CONFIG, formatCurrency } from '@/lib/yoco'

declare global {
  interface Window {
    YocoSDK: any
  }
}

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [currentTier, setCurrentTier] = useState<string>('fam')
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const router = useRouter()

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
      
      if (profile) {
        setCurrentTier(profile.user_role)
      }
    }
  }

  const loadYocoSDK = () => {
    if (document.getElementById('yoco-sdk')) return

    const script = document.createElement('script')
    script.id = 'yoco-sdk'
    script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
    script.async = true
    document.body.appendChild(script)
  }

  const handleUpgrade = async (tierKey: string) => {
    const tier = MEMBERSHIP_TIERS[tierKey as keyof typeof MEMBERSHIP_TIERS]
    
    if (tier.price === 0) {
      alert('FAM tier is free - just sign up!')
      router.push('/signup')
      return
    }

    if (!user) {
      router.push('/login')
      return
    }

    setSelectedTier(tierKey)
    setLoading(true)

    try {
      // Initialize Yoco SDK
      const yoco = new window.YocoSDK({
        publicKey: YOCO_CONFIG.publicKey
      })

      // Open payment popup
      yoco.showPopup({
        amountInCents: tier.price * 100, // Convert to cents
        currency: 'ZAR',
        name: `${tier.name} Tier - Lifetime Membership`,
        description: `Z2B Table Banquet - ${tier.name} Tier`,
        callback: async (result: any) => {
          if (result.error) {
            console.error('Payment error:', result.error)
            alert('Payment failed. Please try again.')
            setLoading(false)
            setSelectedTier(null)
            return
          }

          // Payment successful - upgrade user
          await upgradeUserTier(tierKey, result.id)
        }
      })
    } catch (error) {
      console.error('Yoco SDK error:', error)
      alert('Payment system unavailable. Please try again later.')
      setLoading(false)
      setSelectedTier(null)
    }
  }

  const upgradeUserTier = async (tierKey: string, paymentId: string) => {
    try {
      // Update user tier in profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_role: tierKey === 'fam' ? 'free_member' : 'paid_member',
          is_paid_member: tierKey !== 'fam',
          payment_status: 'paid'
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Record payment in database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          tier: tierKey,
          amount: MEMBERSHIP_TIERS[tierKey as keyof typeof MEMBERSHIP_TIERS].price,
          currency: 'ZAR',
          payment_provider: 'yoco',
          payment_id: paymentId,
          status: 'completed',
          payment_type: 'tier_upgrade'
        })

      if (paymentError) console.error('Payment record error:', paymentError)

      // Success!
      alert(`🎉 Welcome to ${MEMBERSHIP_TIERS[tierKey as keyof typeof MEMBERSHIP_TIERS].name} tier! Your lifetime membership is now active.`)
      router.push('/dashboard')
    } catch (error) {
      console.error('Tier upgrade error:', error)
      alert('Payment received but tier upgrade failed. Please contact support.')
    } finally {
      setLoading(false)
      setSelectedTier(null)
    }
  }

  const getTierIcon = (tierKey: string) => {
    switch (tierKey) {
      case 'platinum': return <Crown className="w-8 h-8" />
      case 'gold': return <Sparkles className="w-8 h-8" />
      case 'silver': return <Zap className="w-8 h-8" />
      default: return <Check className="w-8 h-8" />
    }
  }

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
              <Link href="/" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Home
              </Link>
              {user ? (
                <Link href="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" className="btn-primary">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-20 border-b-8 border-gold-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your Legacy Path
          </h2>
          <p className="text-xl md:text-2xl text-gold-200 max-w-3xl mx-auto mb-4">
            One-time payment. Lifetime access. Build your empire forever.
          </p>
          <p className="text-lg text-purple-200">
            No monthly fees. No hidden charges. Just pure value for life. 🚀
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
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
                  isBestValue
                    ? 'border-gold-500 shadow-2xl transform scale-105'
                    : isCurrentTier
                    ? 'border-green-400'
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

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-br ${
                    key === 'platinum' ? 'from-purple-500 to-purple-700' :
                    key === 'gold' ? 'from-yellow-500 to-yellow-700' :
                    key === 'silver' ? 'from-slate-400 to-slate-600' :
                    key === 'copper' ? 'from-amber-600 to-amber-800' :
                    key === 'bronze' ? 'from-orange-600 to-orange-800' :
                    'from-gray-400 to-gray-600'
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

                <ul className="space-y-3 mb-8">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={loading && selectedTier === key}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                    isCurrentTier
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : isBestValue
                      ? 'bg-gold-gradient text-white hover:shadow-xl'
                      : 'bg-royal-gradient text-white hover:shadow-lg'
                  }`}
                >
                  {loading && selectedTier === key ? (
                    'Processing...'
                  ) : isCurrentTier ? (
                    'Current Tier'
                  ) : tier.price === 0 ? (
                    'Start Free'
                  ) : (
                    `Upgrade to ${tier.name}`
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-primary-800 mb-4">Frequently Asked Questions</h3>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full"></div>
        </div>

        <div className="space-y-6">
          <div className="card border-4 border-primary-200">
            <h4 className="text-xl font-bold text-primary-800 mb-2">Is this really lifetime access?</h4>
            <p className="text-gray-700">Yes! Pay once, access forever. No monthly fees, ever.</p>
          </div>

          <div className="card border-4 border-primary-200">
            <h4 className="text-xl font-bold text-primary-800 mb-2">Can I upgrade later?</h4>
            <p className="text-gray-700">Absolutely! Upgrade anytime and only pay the difference.</p>
          </div>

          <div className="card border-4 border-primary-200">
            <h4 className="text-xl font-bold text-primary-800 mb-2">What payment methods do you accept?</h4>
            <p className="text-gray-700">We accept all major credit/debit cards via Yoco (secure South African payment gateway).</p>
          </div>

          <div className="card border-4 border-primary-200">
            <h4 className="text-xl font-bold text-primary-800 mb-2">Is my payment secure?</h4>
            <p className="text-gray-700">100%. We use Yoco, a PCI-DSS compliant payment provider trusted by 400,000+ South African businesses.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-royal-gradient py-16 border-t-8 border-gold-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Life?
          </h3>
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

      {/* Footer */}
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