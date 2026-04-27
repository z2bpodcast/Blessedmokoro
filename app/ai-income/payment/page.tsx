'use client'
// FILE: app/ai-income/payment/page.tsx
// Payment processing — EFT, Direct Bank Deposit, Yoco Online

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PURP = '#4C1D95'
const GOLD = '#D4AF37'
const BG   = '#0D0820'

const BANK_DETAILS = {
  bank:    'Nedbank',
  account: '1318257727',
  branch:  '198765',
  type:    'Current Account',
  name:    'Zero2Billionaires Amavuladlela Pty Ltd',
  ref:     'Your Full Name',
}

function PaymentInner() {
  const params  = useSearchParams()
  const router  = useRouter()
  const tier    = params.get('tier')   || 'starter'
  const amount  = params.get('amount') || '500'
  const name    = params.get('name')   || 'Starter Pack'

  const [method,    setMethod]    = useState<'eft'|'bank'|'yoco'|null>(null)
  const [copied,    setCopied]    = useState<string|null>(null)
  const [proofName, setProofName] = useState('')
  const [proofFile, setProofFile] = useState<File|null>(null)
  const [submitting,setSubmitting]= useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [paying,    setPaying]    = useState(false)

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const submitProof = async () => {
    if (!proofName.trim()) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('payment_proofs').insert({
        user_id:    user?.id,
        tier,
        amount:     parseInt(amount),
        method:     method === 'bank' ? 'bank_deposit' : 'eft',
        name:       proofName,
        status:     'pending',
        created_at: new Date().toISOString(),
      })
      setSubmitted(true)
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  const payWithYoco = async () => {
    setPaying(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/yoco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:    parseInt(amount) * 100,
          currency:  'ZAR',
          tier,
          userId:    user?.id,
          userEmail: user?.email,
        }),
      })
      const data = await res.json()
      if (data.redirectUrl) window.location.href = data.redirectUrl
      else alert('Payment setup failed. Please try EFT or bank deposit.')
    } catch (e) {
      alert('Payment error. Please try EFT or bank deposit.')
    }
    setPaying(false)
  }

  const btnStyle = (active: boolean, color: string) => ({
    flex: 1, padding:'14px 10px', borderRadius:'12px', cursor:'pointer', fontFamily:'Georgia,serif',
    fontSize:'13px', fontWeight:700, border:`2px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
    background: active ? `${color}18` : 'rgba(255,255,255,0.03)', color: active ? color : 'rgba(255,255,255,0.5)',
    textAlign:'center' as const, transition:'all 0.2s',
  })

  const inp = {
    width:'100%', padding:'12px', background:'rgba(255,255,255,0.07)',
    border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px',
    color:'#fff', fontSize:'13px', outline:'none', fontFamily:'Georgia,serif',
    boxSizing:'border-box' as const,
  }

  const copyRow = (label: string, value: string) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase' as const, letterSpacing:'1px' }}>{label}</div>
        <div style={{ fontSize:'14px', color:'#fff', fontWeight:700, marginTop:'2px' }}>{value}</div>
      </div>
      <button onClick={() => copyText(value, label)}
        style={{ padding:'6px 12px', background: copied===label ? '#059669' : 'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color: copied===label ? '#fff' : 'rgba(255,255,255,0.6)', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
        {copied === label ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:BG, color:'#F0EEF8', fontFamily:'Georgia,serif', padding:'20px 16px 60px' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'24px' }}>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', textTransform:'uppercase' as const, marginBottom:'8px' }}>Payment</div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:'#fff', margin:'0 0 4px' }}>
          {name}
        </h1>
        <div style={{ fontSize:'28px', fontWeight:900, color:GOLD }}>R{parseInt(amount).toLocaleString()}</div>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>Once-off investment · Activate your {name} power</p>
      </div>

      <div style={{ maxWidth:'480px', margin:'0 auto' }}>

        {/* Payment method selector */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'10px', textTransform:'uppercase' as const, letterSpacing:'1px' }}>Choose payment method</div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={() => setMethod('yoco')}  style={btnStyle(method==='yoco',  '#7C3AED')}>💳<br/>Yoco<br/><span style={{fontSize:'10px',fontWeight:400}}>Card Online</span></button>
            <button onClick={() => setMethod('eft')}   style={btnStyle(method==='eft',   '#0891B2')}>🏦<br/>EFT<br/><span style={{fontSize:'10px',fontWeight:400}}>Internet Banking</span></button>
            <button onClick={() => setMethod('bank')}  style={btnStyle(method==='bank',  GOLD)}>💵<br/>Bank<br/><span style={{fontSize:'10px',fontWeight:400}}>Cash Deposit</span></button>
          </div>
        </div>

        {/* YOCO */}
        {method === 'yoco' && (
          <div style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#C4B5FD', marginBottom:'8px' }}>💳 Pay Online with Yoco</div>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:'16px' }}>
              Secure card payment via Yoco. Accepted: Visa, Mastercard, Amex.<br/>
              Your account activates automatically after payment.
            </p>
            <button onClick={payWithYoco} disabled={paying}
              style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#7C3AED,#4C1D95)', border:'none', borderRadius:'12px', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
              {paying ? 'Redirecting to Yoco...' : `💳 Pay R${parseInt(amount).toLocaleString()} Now →`}
            </button>
          </div>
        )}

        {/* EFT */}
        {method === 'eft' && (
          <div style={{ background:'rgba(8,145,178,0.08)', border:'1px solid rgba(8,145,178,0.3)', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#38BDF8', marginBottom:'12px' }}>🏦 EFT Internet Banking</div>
            {copyRow('Bank', BANK_DETAILS.bank)}
            {copyRow('Account Holder', BANK_DETAILS.name)}
            {copyRow('Account Number', BANK_DETAILS.account)}
            {copyRow('Branch Code', BANK_DETAILS.branch)}
            {copyRow('Account Type', BANK_DETAILS.type)}
            {copyRow('Amount', `R${parseInt(amount).toLocaleString()}`)}
            {copyRow('Reference', 'Z2B-' + (typeof window !== 'undefined' ? '' : ''))}

            {!submitted ? (
              <div style={{ marginTop:'16px' }}>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>After payment, enter your name to notify us:
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', marginTop:'4px' }}>📱 Also send proof to WhatsApp: <strong style={{color:'#6EE7B7'}}>0774901639</strong></div></div>
                <input value={proofName} onChange={e => setProofName(e.target.value)}
                  placeholder="Your full name" style={{ ...inp, marginBottom:'10px' }} />
                <button onClick={submitProof} disabled={submitting || !proofName.trim()}
                  style={{ width:'100%', padding:'12px', background:submitting?'rgba(255,255,255,0.1)':'linear-gradient(135deg,#0891B2,#0284C7)', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  {submitting ? 'Submitting...' : '✅ I Have Paid — Notify Z2B'}
                </button>
              </div>
            ) : (
              <div style={{ marginTop:'16px', padding:'16px', background:'rgba(5,150,105,0.1)', border:'1px solid rgba(5,150,105,0.3)', borderRadius:'12px', textAlign:'center' as const }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>✅</div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'#6EE7B7' }}>Payment Notification Sent!</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginTop:'6px' }}>We will verify and activate your account within 2–4 hours.</div>
              </div>
            )}
          </div>
        )}

        {/* Bank Deposit */}
        {method === 'bank' && (
          <div style={{ background:'rgba(212,175,55,0.06)', border:`1px solid ${GOLD}40`, borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color:GOLD, marginBottom:'12px' }}>💵 Cash / Direct Bank Deposit</div>
            {copyRow('Bank', BANK_DETAILS.bank)}
            {copyRow('Account Holder', BANK_DETAILS.name)}
            {copyRow('Account Number', BANK_DETAILS.account)}
            {copyRow('Branch Code', BANK_DETAILS.branch)}
            {copyRow('Amount', `R${parseInt(amount).toLocaleString()}`)}

            {!submitted ? (
              <div style={{ marginTop:'16px' }}>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>After deposit, enter your name to notify us:
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', marginTop:'4px' }}>📱 Also send proof to WhatsApp: <strong style={{color:'#6EE7B7'}}>0774901639</strong></div></div>
                <input value={proofName} onChange={e => setProofName(e.target.value)}
                  placeholder="Your full name" style={{ ...inp, marginBottom:'10px' }} />
                <button onClick={submitProof} disabled={submitting || !proofName.trim()}
                  style={{ width:'100%', padding:'12px', background:submitting?'rgba(255,255,255,0.1)':`linear-gradient(135deg,${GOLD},#B8860B)`, border:'none', borderRadius:'10px', color:'#1E1245', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  {submitting ? 'Submitting...' : '✅ I Have Deposited — Notify Z2B'}
                </button>
              </div>
            ) : (
              <div style={{ marginTop:'16px', padding:'16px', background:'rgba(5,150,105,0.1)', border:'1px solid rgba(5,150,105,0.3)', borderRadius:'12px', textAlign:'center' as const }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>✅</div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'#6EE7B7' }}>Deposit Notification Sent!</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginTop:'6px' }}>We will verify and activate your account within 2–4 hours.</div>
              </div>
            )}
          </div>
        )}

        {/* Back link */}
        <div style={{ textAlign:'center', marginTop:'16px' }}>
          <button onClick={() => router.back()}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'13px', cursor:'pointer', textDecoration:'underline' }}>
            ← Choose a different tier
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>}><PaymentInner /></Suspense>
}
