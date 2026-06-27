'use client'
import { useState, useEffect } from 'react'
export default function FournityProductCard({ memberReferralCode }: { memberReferralCode?: string }) {
  const [pricing, setPricing] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [copied, setCopied] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ buyerName:'', buyerEmail:'', buyerWhatsapp:'', deliveryAddress:'', deliverySuburb:'', deliveryCity:'', deliveryPostalCode:'', deliveryProvince:'' })
  const referralLink = memberReferralCode ? 'https://app.z2blegacybuilders.co.za/marketplace/fournity?ref='+memberReferralCode : ''
  useEffect(() => {
    fetch('/api/fournity/purchase').then(r=>r.json()).then(setPricing)
    if (!document.querySelector('script[src*="yoco"]')) { const s=document.createElement('script'); s.src='https://js.yoco.com/sdk/v1/yoco-sdk-web.js'; document.head.appendChild(s) }
  }, [])
  function copyLink() { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  function validate() {
    const f=form
    if (!f.buyerName||!f.buyerEmail||!f.buyerWhatsapp||!f.deliveryAddress||!f.deliverySuburb||!f.deliveryCity||!f.deliveryPostalCode||!f.deliveryProvince) { setFormError('Please fill in all fields.'); return false }
    if (!f.buyerEmail.includes('@')) { setFormError('Please enter a valid email.'); return false }
    setFormError(''); return true
  }
  async function pay() {
    if (!validate()||!pricing) return
    setProcessing(true)
    const yoco = new (window as any).YocoSDK({ publicKey: 'pk_live_6659251fdV6b2GJaeec4' })
    yoco.showPopup({ amountInCents: pricing.currentPrice, currency:'ZAR', name:'FOURNITY', description:'Digital edition + Signed copy + Workbook',
      callback: async (result: any) => {
        if (result.error) { setFormError(result.error.message); setProcessing(false); return }
        const res = await fetch('/api/fournity/purchase', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, referralCode:memberReferralCode||null, paymentReference:result.id, paymentStatus:'completed'}) })
        const data = await res.json()
        if (data.success) { setOrderNumber(data.orderNumber); setOrderComplete(true); setShowForm(false); fetch('/api/fournity/purchase').then(r=>r.json()).then(setPricing) }
        else setFormError(data.error||'Order failed.')
        setProcessing(false)
      }
    })
  }
  const price = pricing?.currentPrice ? pricing.currentPrice/100 : 350
  const stdPrice = pricing?.standardPrice ? pricing.standardPrice/100 : 500
  const remaining = pricing?.launchCopiesRemaining ?? 100
  const isLaunch = pricing?.isLaunchPrice ?? true
  const commission = Math.round(price*0.20)
  if (orderComplete) return (
    <div style={{background:'#12121A',border:'1px solid rgba(201,168,76,0.25)',borderRadius:8,padding:'32px 24px',textAlign:'center' as const,fontFamily:'Inter,sans-serif'}}>
      <div style={{fontSize:48,marginBottom:12}}>🎉</div>
      <p style={{fontSize:10,letterSpacing:3,textTransform:'uppercase' as const,color:'#C9A84C',marginBottom:10}}>ORDER CONFIRMED</p>
      <h3 style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'#fff',marginBottom:12}}>Welcome, Founding Reader!</h3>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:15,color:'#EDE6D6',lineHeight:1.7,marginBottom:16}}>Your <strong style={{color:'#C9A84C'}}>digital edition with Audio Reader</strong> will be sent to <strong>{form.buyerEmail}</strong> shortly. Rev Mokoro Manana will contact you on WhatsApp to confirm your signed copy delivery.</p>
      <div style={{background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:4,padding:'10px 16px',marginBottom:16}}>
        <p style={{fontSize:10,color:'#C9A84C',letterSpacing:1.5,textTransform:'uppercase' as const,marginBottom:4}}>Order Reference</p>
        <p style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:'monospace'}}>{orderNumber}</p>
      </div>
      <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:13,color:'#C9A84C',fontStyle:'italic',lineHeight:1.7,marginBottom:16}}>"In that day you will know that I am in the Father, and you in Me, and I in you." — John 14:20</p>
      {memberReferralCode && <div style={{background:'rgba(46,204,113,0.06)',border:'1px solid rgba(46,204,113,0.2)',borderRadius:4,padding:'12px 16px'}}>
        <p style={{fontSize:12,fontWeight:700,color:'#2ECC71',marginBottom:8}}>💰 Share and Earn R{commission} Per Sale</p>
        <button onClick={copyLink} style={{width:'100%',background:'#2ECC71',border:'none',color:'#0A0A0F',fontSize:12,fontWeight:700,padding:10,borderRadius:3,cursor:'pointer'}}>{copied?'✓ Copied!':'Copy My Referral Link'}</button>
      </div>}
    </div>
  )
  if (!pricing) return <div style={{background:'#12121A',border:'1px solid rgba(201,168,76,0.25)',borderRadius:8,padding:40,textAlign:'center' as const,color:'#C9A84C',fontFamily:'Inter,sans-serif'}}>Loading...</div>
  return (
    <div style={{background:'#12121A',border:'1px solid rgba(201,168,76,0.25)',borderRadius:8,overflow:'hidden',fontFamily:'Inter,sans-serif'}}>
      <div style={{position:'relative' as const,width:'100%',maxHeight:420,overflow:'hidden'}}>
        <img src="/fournity-cover.png" alt="FOURNITY by Rev Mokoro Manana" style={{width:'100%',display:'block',objectFit:'cover' as const,objectPosition:'top'}}/>
        <div style={{position:'absolute' as const,bottom:0,left:0,right:0,height:'50%',background:'linear-gradient(to bottom, transparent, #12121A)'}}/>
      </div>
      <div style={{padding:'20px 20px 24px'}}>
        <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap' as const}}>
          <a href="https://fournity.vercel.app" target="_blank" rel="noopener noreferrer" style={{flex:1,background:'transparent',border:'1px solid rgba(201,168,76,0.4)',color:'#C9A84C',padding:'12px 16px',fontSize:13,fontWeight:600,cursor:'pointer',borderRadius:3,textAlign:'center' as const,textDecoration:'none',display:'block'}}>📖 Read Free Preview</a>
          <button onClick={()=>setShowForm(true)} style={{flex:1,background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#0A0A0F',border:'none',padding:'12px 16px',fontSize:13,fontWeight:700,cursor:'pointer',borderRadius:3}}>Pre-Order — R{price}</button>
        </div>
        <div style={{marginBottom:14}}>
          {isLaunch ? <>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
              <span style={{background:'rgba(231,76,60,0.15)',border:'1px solid rgba(231,76,60,0.3)',color:'#E74C3C',fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:2}}>🔥 LAUNCH PRICE</span>
              <span style={{fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:900,color:'#fff'}}>R{price}</span>
              <span style={{fontSize:14,color:'#8A8A9A',textDecoration:'line-through'}}>R{stdPrice}</span>
            </div>
            <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:2,marginBottom:6,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${remaining}%`,background:'linear-gradient(90deg,#E74C3C,#E8C97A)',borderRadius:2}}/>
            </div>
            <p style={{fontSize:11,color:'#8A8A9A'}}><strong style={{color:'#E74C3C'}}>{remaining} copies</strong> remaining at launch price — then R{stdPrice}</p>
          </> : <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:900,color:'#fff'}}>R{price}</span>
          </div>}
          <p style={{fontSize:11,color:'rgba(138,138,154,0.5)',fontStyle:'italic',marginTop:4}}>{pricing.totalSold||0} founding readers have joined</p>
        </div>
        <div style={{background:'rgba(201,168,76,0.06)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:4,padding:'12px 14px',marginBottom:14}}>
          <p style={{fontSize:11,fontWeight:600,color:'#C9A84C',marginBottom:8}}>📦 Bundle Includes:</p>
          {['📱 Digital edition with Audio Reader — sent immediately','✍️ Signed physical copy — after printing','📚 Interactive FOURNITY Workbook','🎁 Exclusive surprise gift','🏆 Your name as a Founding Reader'].map((item,i)=>(
            <p key={i} style={{fontSize:12,color:'#EDE6D6',padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>{item}</p>
          ))}
        </div>
        {memberReferralCode && <div style={{background:'rgba(46,204,113,0.06)',border:'1px solid rgba(46,204,113,0.2)',borderRadius:4,padding:'10px 14px',marginBottom:14}}>
          <p style={{fontSize:11,fontWeight:700,color:'#2ECC71',marginBottom:6}}>💰 Earn R{commission} — Share Your Referral Link</p>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{fontSize:10,color:'#EDE6D6',background:'rgba(0,0,0,0.3)',padding:'6px 10px',borderRadius:3,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{referralLink}</span>
            <button onClick={copyLink} style={{background:'#2ECC71',border:'none',color:'#0A0A0F',fontSize:11,fontWeight:700,padding:'6px 12px',borderRadius:3,cursor:'pointer'}}>{copied?'✓ Copied':'Copy'}</button>
          </div>
        </div>}
        {showForm && <div style={{background:'#1A1A26',border:'1px solid rgba(201,168,76,0.15)',borderRadius:4,padding:'16px',marginBottom:14}}>
          <h4 style={{fontFamily:'Playfair Display,serif',fontSize:16,fontWeight:700,color:'#fff',marginBottom:2}}>Complete Your Pre-Order</h4>
          <p style={{fontSize:11,color:'#8A8A9A',marginBottom:12}}>Delivery Details</p>
          <div style={{background:'rgba(201,168,76,0.06)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:3,padding:'10px 12px',marginBottom:12,fontSize:12,color:'#EDE6D6',lineHeight:1.6}}>
            <strong style={{color:'#C9A84C',fontSize:10,letterSpacing:1,textTransform:'uppercase' as const,display:'block',marginBottom:4}}>YOUR BUNDLE — R{price}</strong>
            ✓ Digital edition + Audio Reader — sent immediately<br/>✓ Signed physical copy · ✓ Workbook · ✓ Surprise Gift
          </div>
          {formError && <p style={{background:'rgba(231,76,60,0.1)',border:'1px solid rgba(231,76,60,0.3)',color:'#E74C3C',fontSize:12,padding:'10px 12px',borderRadius:3,marginBottom:10}}>{formError}</p>}
          {[['Full Name','buyerName','Your full name','text'],['Email','buyerEmail','your@email.com','email'],['WhatsApp','buyerWhatsapp','+27 83 123 4567','tel'],['Street Address','deliveryAddress','Street address','text'],['Suburb','deliverySuburb','Suburb','text'],['City','deliveryCity','City','text'],['Postal Code','deliveryPostalCode','0001','text'],['Province','deliveryProvince','e.g. Gauteng','text']].map(([label,key,placeholder,type])=>(
            <div key={key} style={{marginBottom:8}}>
              <label style={{display:'block',fontSize:10,letterSpacing:1.5,textTransform:'uppercase' as const,color:'#C9A84C',fontWeight:600,marginBottom:4}}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{width:'100%',background:'#0A0A0F',border:'1px solid rgba(201,168,76,0.2)',borderRadius:3,padding:'10px 12px',fontSize:13,color:'#F5F0E8',fontFamily:'Inter,sans-serif',outline:'none',boxSizing:'border-box' as const}}/>
            </div>
          ))}
          <button onClick={pay} disabled={processing} style={{width:'100%',background:'linear-gradient(135deg,#C9A84C,#8B6914)',color:'#0A0A0F',border:'none',padding:16,fontSize:14,fontWeight:700,cursor:'pointer',borderRadius:3,marginBottom:8,opacity:processing?0.7:1}}>{processing?'Processing...':'Proceed to Payment — R'+price}</button>
          <button onClick={()=>setShowForm(false)} style={{width:'100%',background:'transparent',color:'#8A8A9A',border:'1px solid rgba(255,255,255,0.1)',padding:12,fontSize:12,cursor:'pointer',borderRadius:3}}>Cancel</button>
        </div>}
        <p style={{fontSize:11,color:'#8A8A9A',textAlign:'center' as const}}>🔒 Secure payment powered by Yoco · South Africa</p>
      </div>
    </div>
  )
}
