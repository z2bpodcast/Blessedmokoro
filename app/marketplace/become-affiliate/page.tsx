'use client'
// FILE: app/marketplace/affiliate/page.tsx
// External affiliate dashboard — for non-Z2B-members + members
// Also: /marketplace/become-affiliate for signup

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const W    = '#F0EEF8'
const PURP = '#7C3AED'

function AffiliateInner() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') || ''
  const [tab,          setTab]          = useState<'dashboard'|'signup'>(!code ? 'signup' : 'dashboard')
  const [affiliate,    setAffiliate]    = useState<any>(null)
  const [links,        setLinks]        = useState<any[]>([])
  const [sales,        setSales]        = useState<any[]>([])
  const [loading,      setLoading]      = useState(false)
  const [email,        setEmail]        = useState('')
  const [fullName,     setFullName]     = useState('')
  const [lookupCode,   setLookupCode]   = useState(code)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutDetails,setPayoutDetails]= useState('')
  const [message,      setMessage]      = useState('')

  const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:W, fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }

  const loadDashboard = async (c: string) => {
    setLoading(true)
    const res  = await fetch(`/api/affiliate?code=${c}`)
    const data = await res.json()
    if (data.affiliate) {
      setAffiliate(data.affiliate)
      const res2 = await fetch('/api/affiliate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'get_earnings', affiliateId: data.affiliate.id }) })
      const data2 = await res2.json()
      setLinks(data2.links || [])
      setSales(data2.sales || [])
    }
    setLoading(false)
  }

  useEffect(() => { if (code) { setTab('dashboard'); loadDashboard(code) } }, [code])

  const signup = async () => {
    if (!email.trim()) return
    setLoading(true)
    const res  = await fetch('/api/affiliate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'register_external', email, fullName }) })
    const data = await res.json()
    if (data.code) {
      setMessage(`Your affiliate code: ${data.code}`)
      setLookupCode(data.code)
      setTab('dashboard')
      loadDashboard(data.code)
    }
    setLoading(false)
  }

  const requestPayout = async () => {
    if (!affiliate || !payoutAmount) return
    setLoading(true)
    await fetch('/api/affiliate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'request_payout', affiliateId: affiliate.id, amount: parseFloat(payoutAmount)*100, paymentDetails: payoutDetails }) })
    setMessage('Payout request submitted. Processed within 3 business days.')
    setPayoutAmount('')
    setLoading(false)
  }

  const balance = Math.round((affiliate?.wallet_balance || 0) / 100)
  const earned  = Math.round((affiliate?.total_earned || 0) / 100)

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      {/* Nav */}
      <div style={{ padding:'10px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'10px' }}>
        <Link href="/marketplace" style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Marketplace</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:GOLD }}>💰 Affiliate Dashboard</span>
      </div>

      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'24px 16px 60px' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
          {[{id:'signup',label:'Join as Affiliate'},{id:'dashboard',label:'My Dashboard'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)}
              style={{ flex:1, padding:'10px', borderRadius:'10px', border:`1px solid ${tab===t.id?GOLD:'rgba(255,255,255,0.1)'}`, background:tab===t.id?`${GOLD}15`:'transparent', color:tab===t.id?GOLD:'rgba(255,255,255,0.5)', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {message && (
          <div style={{ background:`${GOLD}15`, border:`1px solid ${GOLD}30`, borderRadius:'10px', padding:'12px', marginBottom:'14px', fontSize:'12px', color:GOLD }}>
            {message}
          </div>
        )}

        {/* SIGN UP */}
        {tab === 'signup' && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'4px' }}>Earn 20% on Every Sale</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:1.8, marginBottom:'20px' }}>
              Share any product from the Z2B Marketplace. Every time someone buys through your link, you earn 20% of the sale price — automatically credited to your wallet.
            </div>

            <div style={{ background:'rgba(212,175,55,0.06)', border:`1px solid ${GOLD}25`, borderRadius:'14px', padding:'16px', marginBottom:'20px' }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:GOLD, marginBottom:'10px' }}>How it works:</div>
              {['1. Sign up free — no Z2B membership needed','2. Browse the marketplace — pick any product to promote','3. Get your unique affiliate link for that product','4. Share it — WhatsApp, social media, anywhere','5. Earn 20% every time someone buys through your link','6. Withdraw to your bank account — no minimum'].map(s=>(
                <div key={s} style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{s}</div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Your name</label>
                <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name" style={inp} />
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px' }}>Email address *</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" type="email" style={inp} />
              </div>
            </div>

            <button onClick={signup} disabled={!email.trim() || loading}
              style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', fontFamily:'Cinzel,Georgia,serif', fontWeight:900, fontSize:'14px', cursor:!email.trim()||loading?'not-allowed':'pointer',
                background:!email.trim()||loading?'rgba(255,255,255,0.08)':`linear-gradient(135deg,${GOLD},#B8860B)`,
                color:!email.trim()||loading?'rgba(255,255,255,0.3)':'#1E1245' }}>
              {loading ? 'Setting up your account...' : '💰 Get My Affiliate Account →'}
            </button>

            <div style={{ textAlign:'center', marginTop:'14px', fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>
              Already have a code? <button onClick={()=>setTab('dashboard')} style={{ background:'none', border:'none', color:GOLD, cursor:'pointer', fontSize:'12px', fontWeight:700 }}>View my dashboard →</button>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            {!affiliate ? (
              <div>
                <div style={{ fontSize:'14px', color:W, fontWeight:700, marginBottom:'10px' }}>Enter your affiliate code:</div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <input value={lookupCode} onChange={e=>setLookupCode(e.target.value.toUpperCase())} placeholder="e.g. THABO8X2" style={{ ...inp, flex:1, textTransform:'uppercase', letterSpacing:'2px' }} />
                  <button onClick={()=>loadDashboard(lookupCode)} disabled={!lookupCode || loading}
                    style={{ padding:'0 16px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:'#1E1245', fontWeight:900, cursor:'pointer' }}>
                    {loading ? '...' : '→'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Stats */}
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'4px' }}>
                  Hi, {affiliate.full_name || 'Affiliate'} 👋
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>Affiliate code: <strong style={{ color:GOLD }}>{affiliate.affiliate_code}</strong></div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
                  {[
                    { label:'Wallet Balance', val:`R${balance}`, color:'#6EE7B7' },
                    { label:'Total Earned',   val:`R${earned}`, color:GOLD },
                    { label:'Links Created',  val:links.length, color:'#A78BFA' },
                    { label:'Total Sales',    val:sales.length, color:'#38BDF8' },
                  ].map(s => (
                    <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:'24px', fontWeight:900, color:s.color, fontFamily:'Cinzel,Georgia,serif' }}>{s.val}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Links */}
                {links.length > 0 && (
                  <div style={{ marginBottom:'20px' }}>
                    <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'10px' }}>Your Affiliate Links</div>
                    {links.map((l: any) => (
                      <div key={l.id} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'12px', marginBottom:'8px' }}>
                        <div style={{ fontSize:'12px', fontWeight:700, color:W, marginBottom:'4px' }}>{l.marketplace_products?.title}</div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}>
                          {l.clicks} clicks · {l.conversions} sales · R{Math.round((l.total_earned||0)/100)} earned
                        </div>
                        <div style={{ fontSize:'11px', color:GOLD, wordBreak:'break-all' }}>
                          marketplace.z2blegacybuilders.co.za/p/{l.marketplace_products?.slug}?ref={affiliate.affiliate_code}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payout */}
                {balance > 0 && (
                  <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}25`, borderRadius:'14px', padding:'16px', marginBottom:'14px' }}>
                    <div style={{ fontSize:'14px', fontWeight:700, color:GOLD, marginBottom:'10px' }}>💳 Request Payout</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      <input value={payoutAmount} onChange={e=>setPayoutAmount(e.target.value)} placeholder={`Amount (max R${balance})`} type="number" style={inp} />
                      <input value={payoutDetails} onChange={e=>setPayoutDetails(e.target.value)} placeholder="Bank account or EFT details" style={inp} />
                      <button onClick={requestPayout} disabled={!payoutAmount || loading}
                        style={{ padding:'12px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:'#1E1245', fontWeight:900, fontSize:'13px', cursor:'pointer' }}>
                        {loading ? 'Submitting...' : 'Request Payout →'}
                      </button>
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'8px' }}>Processed within 3 business days</div>
                  </div>
                )}

                {/* Browse more products */}
                <Link href="/marketplace" style={{ display:'block', padding:'12px', borderRadius:'10px', border:`1px solid ${GOLD}30`, background:`${GOLD}08`, color:GOLD, fontWeight:700, fontSize:'13px', textAlign:'center', textDecoration:'none' }}>
                  🏪 Browse More Products to Promote →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AffiliatePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37' }}>Loading...</div>}>
      <AffiliateInner />
    </Suspense>
  )
}
