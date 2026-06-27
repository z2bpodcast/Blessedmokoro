'use client'
import { useState, useEffect } from 'react'
interface PricingData { currentPrice: number; launchPrice: number; standardPrice: number; launchCopiesRemaining: number; totalSold: number; isLaunchPrice: boolean }
interface Props { memberReferralCode?: string }
declare global { interface Window { YocoSDK: any } }
export default function FournityProductCard({ memberReferralCode }: Props) {
  const [pricing, setPricing] = useState<PricingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [copied, setCopied] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    buyerName:'', buyerEmail:'', buyerWhatsapp:'',
    deliveryAddress:'', deliverySuburb:'', deliveryCity:'',
    deliveryPostalCode:'', deliveryProvince:''
  })
  const referralLink = memberReferralCode
    ? `https://app.z2blegacybuilders.co.za/marketplace/fournity?ref=${memberReferralCode}`
    : ''
  useEffect(() => {
    fetch('/api/fournity/purchase').then(r=>r.json()).then(d=>{ setPricing(d); setLoading(false) }).catch(()=>setLoading(false))
    if (!document.querySelector('script[src*="yoco"]')) {
      const s = document.createElement('script')
      s.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
      document.head.appendChild(s)
    }
  }, [])
  function copyLink() { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  function validate() {
    const f = form
    if (!f.buyerName||!f.buyerEmail||!f.buyerWhatsapp||!f.deliveryAddress||!f.deliverySuburb||!f.deliveryCity||!f.deliveryPostalCode||!f.deliveryProvince) {
      setFormError('Please fill in all fields.'); return false
    }
    if (!f.buyerEmail.includes('@')) { setFormError('Please enter a valid email.'); return false }
    setFormError(''); return true
  }
