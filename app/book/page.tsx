// app/book/page.tsx
// Served at: book.z2blegacybuilders.co.za (via proxy.ts rewrite)
// PayFast credentials injected from Vercel environment variables

import { headers } from 'next/headers'

export const metadata = {
  title: 'Zero2Billionaires — From Salary Struggles to Digital Freedom',
  description: 'Your roadmap from salary struggles or no income to building a Digital Estate with AI and creating lasting income. By Rev Mokoro Manana.',
  openGraph: {
    title: 'Zero2Billionaires — From Salary Struggles to Digital Freedom',
    description: 'No Capital. No Experience. No Problem. Just Action. Real Results.',
    url: 'https://book.z2blegacybuilders.co.za',
  },
}

export default function BookLandingPage() {
  // PayFast credentials from Vercel environment — injected server-side
  const merchantId  = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || ''
  const merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || ''

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: getBookLandingHTML(merchantId, merchantKey),
      }}
    />
  )
}

function getBookLandingHTML(merchantId: string, merchantKey: string): string {
  return `
<style>
  /* Reset next.js body styles for this page */
  body { margin:0!important; padding:0!important; background:#080608!important; }
  #__next { all: unset; }
</style>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Bebas+Neue&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">

<style>
:root{
  --black:#080608;--deep:#0f0d18;--purple:#2d1b69;
  --gold:#c9a227;--gold-bright:#f0c040;--gold-pale:#e8d48b;
  --gold-dim:#5a4510;--white:#f5f0e8;
}
*{box-sizing:border-box;}
.z2b-book-page{background:var(--black);font-family:'Lato',sans-serif;color:var(--white);overflow-x:hidden;}

/* NAV */
.z2b-nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  padding:12px 24px;background:rgba(8,6,8,0.94);
  border-bottom:1px solid rgba(201,162,39,0.15);
  backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:space-between;
}
.z2b-nav-logo{font-family:'Bebas Neue',sans-serif;font-size:0.9rem;letter-spacing:3px;color:var(--gold-bright);}
.z2b-nav-logo span{color:rgba(255,255,255,0.35);font-size:0.55rem;letter-spacing:2px;display:block;}
.z2b-nav-btns{display:flex;gap:8px;}
.z2b-nbtn{
  padding:8px 16px;border-radius:2px;font-family:'Bebas Neue',sans-serif;
  font-size:0.65rem;letter-spacing:3px;text-decoration:none;
  transition:all 0.15s;cursor:pointer;
}
.z2b-nbtn-gold{background:linear-gradient(135deg,var(--gold),var(--gold-bright));color:var(--black);border:none;}
.z2b-nbtn-out{background:none;border:1px solid rgba(201,162,39,0.3);color:var(--gold-pale);}

/* HERO */
.z2b-hero{
  min-height:100vh;position:relative;overflow:hidden;
  display:flex;align-items:center;
  background:linear-gradient(160deg,#080608 0%,#1a0d35 45%,#080608 100%);
}
.z2b-hero::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 70% 60% at 0% 30%,rgba(45,27,105,0.5) 0%,transparent 60%),
    radial-gradient(ellipse 50% 40% at 100% 80%,rgba(201,162,39,0.07) 0%,transparent 55%);
}
.z2b-hero-inner{
  max-width:1100px;margin:0 auto;padding:100px 24px 60px;
  display:grid;grid-template-columns:1fr 1fr;
  gap:60px;align-items:center;position:relative;z-index:2;width:100%;
}
.z2b-eyebrow{
  font-family:'Bebas Neue',sans-serif;font-size:0.65rem;
  letter-spacing:5px;color:var(--gold-dim);margin-bottom:16px;
}
.z2b-hero-title{
  font-family:'Playfair Display',serif;font-size:clamp(2.6rem,5vw,4rem);
  font-weight:900;color:var(--white);line-height:1.05;margin-bottom:8px;
}
.z2b-hero-title em{font-style:italic;color:var(--gold-bright);}
.z2b-divider{
  width:60px;height:2px;
  background:linear-gradient(90deg,var(--gold),var(--gold-bright));
  margin:20px 0;
}
.z2b-hero-sub{
  font-family:'Playfair Display',serif;font-style:italic;
  font-size:1rem;color:var(--gold-pale);
  line-height:1.75;margin-bottom:12px;max-width:480px;
}
.z2b-hero-note{
  font-size:0.82rem;color:rgba(255,255,255,0.3);margin-bottom:12px;
}
.z2b-author-line{
  font-family:'Bebas Neue',sans-serif;font-size:0.6rem;
  letter-spacing:4px;color:var(--gold-dim);margin-bottom:32px;
}
.z2b-buy-stack{display:flex;flex-direction:column;gap:12px;max-width:420px;}
.z2b-btn-buy{
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 22px;border-radius:3px;cursor:pointer;
  text-decoration:none;transition:all 0.2s;border:none;width:100%;
}
.z2b-btn-buy:hover{transform:translateY(-2px);}
.z2b-btn-gold{
  background:linear-gradient(135deg,var(--gold),var(--gold-bright));
  box-shadow:0 6px 24px rgba(201,162,39,0.3);
}
.z2b-btn-gold:hover{box-shadow:0 12px 36px rgba(201,162,39,0.45);}
.z2b-btn-out2{background:rgba(45,27,105,0.35);border:1px solid rgba(201,162,39,0.35);}
.z2b-btn-out2:hover{background:rgba(45,27,105,0.55);border-color:var(--gold);}
.z2b-btn-left{text-align:left;}
.z2b-btn-lbl{font-family:'Bebas Neue',sans-serif;font-size:0.9rem;letter-spacing:3px;display:block;}
.z2b-btn-gold .z2b-btn-lbl{color:var(--black);}
.z2b-btn-out2 .z2b-btn-lbl{color:var(--gold-pale);}
.z2b-btn-desc{font-size:0.7rem;margin-top:3px;}
.z2b-btn-gold .z2b-btn-desc{color:rgba(8,6,8,0.55);}
.z2b-btn-out2 .z2b-btn-desc{color:rgba(232,212,139,0.45);}
.z2b-btn-price{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:1px;}
.z2b-btn-gold .z2b-btn-price{color:var(--black);}
.z2b-btn-out2 .z2b-btn-price{color:var(--gold-bright);}

.z2b-book-wrap{
  display:flex;justify-content:center;align-items:center;
}
.z2b-book{
  filter:drop-shadow(0 40px 80px rgba(201,162,39,0.18)) drop-shadow(0 0 60px rgba(45,27,105,0.35));
  animation:z2bfloat 6s ease-in-out infinite;
}
@keyframes z2bfloat{
  0%,100%{transform:translateY(0px) rotate(-1deg);}
  50%{transform:translateY(-14px) rotate(1deg);}
}
.z2b-book img{width:100%;max-width:380px;border-radius:4px;display:block;}

/* SECTIONS */
.z2b-section{padding:80px 24px;}
.z2b-section-inner{max-width:1000px;margin:0 auto;}
.z2b-sec-ey{
  font-family:'Bebas Neue',sans-serif;font-size:0.6rem;
  letter-spacing:5px;color:var(--gold-dim);text-align:center;margin-bottom:10px;
}
.z2b-sec-title{
  font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.8rem);
  font-weight:900;color:var(--white);text-align:center;margin-bottom:8px;
}
.z2b-sec-title em{font-style:italic;color:var(--gold-bright);}
.z2b-sec-sub{
  font-family:'Playfair Display',serif;font-style:italic;
  font-size:0.95rem;color:rgba(255,255,255,0.35);
  text-align:center;margin-bottom:48px;
}

/* PACKAGES */
.z2b-what{background:var(--deep);border-top:3px solid var(--gold);}
.z2b-pkgs{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.z2b-pkg{border-radius:4px;overflow:hidden;transition:transform 0.2s;}
.z2b-pkg:hover{transform:translateY(-4px);}
.z2b-pkg-head{
  padding:28px;background:linear-gradient(135deg,var(--purple) 0%,#1a0d35 100%);
  border-bottom:2px solid var(--gold);position:relative;
}
.z2b-pkg-head::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--gold),var(--gold-bright),var(--gold));
}
.z2b-pkg-featured .z2b-pkg-head{border-bottom-color:var(--gold-bright);box-shadow:0 0 40px rgba(201,162,39,0.1);}
.z2b-pkg-tier{
  font-family:'Bebas Neue',sans-serif;font-size:0.58rem;
  letter-spacing:4px;color:var(--gold-dim);margin-bottom:6px;
}
.z2b-pkg-name{
  font-family:'Playfair Display',serif;font-size:1.3rem;
  font-weight:700;color:var(--white);margin-bottom:12px;
}
.z2b-pkg-price{
  font-family:'Bebas Neue',sans-serif;font-size:3rem;
  color:var(--gold-bright);letter-spacing:1px;line-height:1;
}
.z2b-pkg-note{font-size:0.72rem;color:rgba(255,255,255,0.25);margin-top:4px;font-style:italic;}
.z2b-pkg-body{
  padding:24px 28px;background:#0f0d18;
  border:1px solid rgba(201,162,39,0.1);border-top:none;
}
.z2b-pkg-f{
  display:flex;align-items:flex-start;gap:10px;
  padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);
  font-size:0.85rem;color:rgba(255,255,255,0.7);line-height:1.5;
}
.z2b-pkg-f:last-of-type{border-bottom:none;}
.z2b-dot{color:var(--gold-bright);font-size:0.65rem;margin-top:4px;flex-shrink:0;}
.z2b-pkg-cta{
  display:block;width:100%;margin-top:20px;padding:14px;
  text-align:center;border-radius:2px;cursor:pointer;border:none;
  font-family:'Bebas Neue',sans-serif;font-size:0.8rem;
  letter-spacing:4px;transition:all 0.2s;
}
.z2b-cta-gold{background:linear-gradient(135deg,var(--gold),var(--gold-bright));color:var(--black);}
.z2b-cta-out{background:rgba(45,27,105,0.25);border:1px solid rgba(201,162,39,0.3);color:var(--gold-pale);}

/* CHAPTERS */
.z2b-inside{background:var(--black);}
.z2b-chapters{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
  gap:14px;margin-top:40px;
}
.z2b-ch{
  padding:20px;border-radius:3px;
  background:rgba(255,255,255,0.02);
  border:1px solid rgba(201,162,39,0.1);
  transition:border-color 0.2s,background 0.2s;
}
.z2b-ch:hover{border-color:rgba(201,162,39,0.3);background:rgba(45,27,105,0.12);}
.z2b-ch-num{
  font-family:'Bebas Neue',sans-serif;font-size:0.55rem;
  letter-spacing:3px;color:var(--gold-dim);margin-bottom:6px;
}
.z2b-ch-title{
  font-family:'Playfair Display',serif;font-size:0.92rem;
  font-weight:700;color:var(--white);margin-bottom:4px;
}
.z2b-ch-sub{font-size:0.75rem;color:rgba(255,255,255,0.3);line-height:1.5;}

/* AUTHOR */
.z2b-author{
  background:linear-gradient(135deg,#1a0d35 0%,var(--black) 60%);
  border-top:1px solid rgba(201,162,39,0.12);
}
.z2b-author-inner{
  max-width:800px;margin:0 auto;
  display:grid;grid-template-columns:auto 1fr;gap:40px;align-items:start;
}
.z2b-author-photo{
  width:150px;height:150px;border-radius:50%;overflow:hidden;
  border:3px solid var(--gold);flex-shrink:0;
  box-shadow:0 0 40px rgba(201,162,39,0.18);
  background:var(--purple);display:flex;align-items:center;
  justify-content:center;
}
.z2b-author-photo-init{
  font-family:'Playfair Display',serif;font-size:3rem;
  font-weight:900;color:var(--gold-bright);
}
.z2b-author-name{
  font-family:'Playfair Display',serif;font-size:1.5rem;
  font-weight:900;color:var(--white);margin-bottom:4px;
}
.z2b-author-role{
  font-family:'Bebas Neue',sans-serif;font-size:0.58rem;
  letter-spacing:3px;color:var(--gold-dim);margin-bottom:16px;
}
.z2b-author-bio{
  font-size:0.88rem;color:rgba(255,255,255,0.5);
  line-height:1.9;margin-bottom:14px;
}
.z2b-author-quote{
  font-family:'Playfair Display',serif;font-style:italic;
  font-size:1rem;color:var(--gold-pale);line-height:1.6;
}

/* TESTIMONIALS */
.z2b-testi{background:var(--deep);border-top:1px solid rgba(201,162,39,0.1);}
.z2b-testi-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:16px;margin-top:40px;
}
.z2b-testi-card{
  padding:24px;border-radius:3px;
  background:rgba(255,255,255,0.02);
  border:1px solid rgba(201,162,39,0.12);
}
.z2b-testi-ph{
  display:flex;align-items:center;justify-content:center;min-height:100px;
  font-family:'Bebas Neue',sans-serif;font-size:0.55rem;
  letter-spacing:3px;color:rgba(201,162,39,0.2);text-align:center;
}
.z2b-challenge{
  margin-top:48px;padding:36px;border-radius:4px;text-align:center;
  background:rgba(45,27,105,0.2);border:1px solid rgba(201,162,39,0.2);
}
.z2b-challenge h3{
  font-family:'Playfair Display',serif;font-size:1.4rem;
  font-weight:900;color:var(--white);margin-bottom:10px;
}
.z2b-challenge p{
  font-family:'Playfair Display',serif;font-style:italic;
  font-size:0.92rem;color:var(--gold-pale);line-height:1.75;
  margin-bottom:24px;max-width:540px;margin-left:auto;margin-right:auto;
}
.z2b-challenge-btn{
  display:inline-block;padding:14px 36px;
  background:linear-gradient(135deg,var(--gold),var(--gold-bright));
  color:var(--black);font-family:'Bebas Neue',sans-serif;
  font-size:0.75rem;letter-spacing:4px;border-radius:2px;
  text-decoration:none;transition:all 0.2s;
}
.z2b-challenge-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,162,39,0.35);}

/* FINAL CTA */
.z2b-final{
  padding:100px 24px;text-align:center;
  background:var(--black);border-top:3px solid var(--gold);
  position:relative;overflow:hidden;
}
.z2b-final::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(45,27,105,0.3) 0%,transparent 70%);
}
.z2b-final-inner{position:relative;z-index:2;max-width:580px;margin:0 auto;}
.z2b-final-title{
  font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.2rem);
  font-weight:900;color:var(--white);line-height:1.1;margin-bottom:16px;
}
.z2b-final-title em{font-style:italic;color:var(--gold-bright);}
.z2b-final-sub{
  font-family:'Playfair Display',serif;font-style:italic;
  font-size:0.95rem;color:rgba(255,255,255,0.35);
  line-height:1.75;margin-bottom:36px;
}
.z2b-final-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.z2b-fb-gold{
  padding:16px 36px;border-radius:2px;
  background:linear-gradient(135deg,var(--gold),var(--gold-bright));
  color:var(--black);font-family:'Bebas Neue',sans-serif;
  font-size:0.8rem;letter-spacing:4px;border:none;cursor:pointer;transition:all 0.2s;
}
.z2b-fb-gold:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(201,162,39,0.35);}
.z2b-fb-out{
  padding:16px 36px;border-radius:2px;background:none;
  border:1px solid rgba(201,162,39,0.3);color:var(--gold-pale);
  font-family:'Bebas Neue',sans-serif;font-size:0.8rem;
  letter-spacing:4px;cursor:pointer;transition:all 0.2s;
}
.z2b-fb-out:hover{border-color:var(--gold);color:var(--gold);}

/* FOOTER */
.z2b-footer{
  padding:24px;text-align:center;background:#050304;
  border-top:1px solid rgba(201,162,39,0.08);
}
.z2b-footer p{
  font-family:'Bebas Neue',sans-serif;font-size:0.55rem;
  letter-spacing:3px;color:rgba(201,162,39,0.2);
}

/* MODAL */
.z2b-modal-bg{
  display:none;position:fixed;inset:0;z-index:200;
  background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);
  align-items:center;justify-content:center;padding:20px;
}
.z2b-modal-bg.open{display:flex;}
.z2b-modal{
  background:#0f0d18;border:1px solid rgba(201,162,39,0.25);
  border-radius:6px;padding:36px;max-width:460px;width:100%;
  position:relative;max-height:90vh;overflow-y:auto;
}
.z2b-mc{position:absolute;top:16px;right:16px;background:none;border:none;color:rgba(255,255,255,0.3);font-size:1.2rem;cursor:pointer;}
.z2b-mc:hover{color:var(--white);}
.z2b-m-tier{font-family:'Bebas Neue',sans-serif;font-size:0.58rem;letter-spacing:4px;color:var(--gold-dim);margin-bottom:4px;}
.z2b-m-name{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:var(--white);margin-bottom:4px;}
.z2b-m-price{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--gold-bright);margin-bottom:20px;}
.z2b-m-div{height:1px;background:rgba(201,162,39,0.12);margin-bottom:20px;}
.z2b-popt{
  display:flex;align-items:center;gap:14px;padding:14px 16px;
  border:1px solid rgba(255,255,255,0.07);border-radius:3px;
  cursor:pointer;margin-bottom:8px;transition:all 0.15s;
  background:rgba(255,255,255,0.02);
}
.z2b-popt:hover{border-color:rgba(201,162,39,0.3);background:rgba(45,27,105,0.15);}
.z2b-pi{font-size:1.3rem;flex-shrink:0;}
.z2b-pl{font-size:0.85rem;font-weight:700;color:var(--white);}
.z2b-ps{font-size:0.7rem;color:rgba(255,255,255,0.3);margin-top:2px;}
.z2b-pb{margin-left:auto;padding:3px 8px;border-radius:2px;font-family:'Bebas Neue',sans-serif;font-size:0.5rem;letter-spacing:2px;flex-shrink:0;}
.z2b-bg{background:rgba(5,150,105,0.15);border:1px solid rgba(5,150,105,0.35);color:#6ee7b7;}
.z2b-ba{background:rgba(217,119,6,0.15);border:1px solid rgba(217,119,6,0.35);color:#fcd34d;}
.z2b-bank{display:none;margin-top:8px;padding:14px;background:rgba(8,6,8,0.6);border:1px solid rgba(201,162,39,0.15);border-radius:3px;margin-bottom:8px;}
.z2b-bank.open{display:block;}
.z2b-brow{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);}
.z2b-brow:last-child{border-bottom:none;}
.z2b-bk{font-size:0.68rem;color:rgba(255,255,255,0.28);}
.z2b-bv{font-size:0.82rem;font-weight:700;color:var(--white);}
.z2b-bv-hl{color:var(--gold-bright);font-size:0.95rem;}
.z2b-cbtn{background:none;border:none;cursor:pointer;font-size:0.65rem;color:rgba(201,162,39,0.45);font-family:'Bebas Neue',sans-serif;letter-spacing:1px;}
.z2b-cbtn:hover{color:var(--gold);}
.z2b-mnote{font-size:0.72rem;color:rgba(255,255,255,0.2);font-style:italic;text-align:center;margin-top:14px;line-height:1.6;}

@media(max-width:700px){
  .z2b-hero-inner{grid-template-columns:1fr;gap:36px;padding-top:110px;}
  .z2b-book-wrap{order:-1;}
  .z2b-book img{max-width:240px;}
  .z2b-pkgs{grid-template-columns:1fr;}
  .z2b-author-inner{grid-template-columns:1fr;text-align:center;}
  .z2b-author-photo{margin:0 auto;}
  .z2b-nbtn-out{display:none;}
}
</style>

<div class="z2b-book-page">

<!-- NAV -->
<nav class="z2b-nav">
  <div class="z2b-nav-logo">ZERO2BILLIONAIRES<span>BY REV MOKORO MANANA</span></div>
  <div class="z2b-nav-btns">
    <a href="https://app.z2blegacybuilders.co.za/login" class="z2b-nbtn z2b-nbtn-out">MEMBER LOGIN</a>
    <button class="z2b-nbtn z2b-nbtn-gold" onclick="z2bOpenModal('r700')">GET THE BOOK</button>
  </div>
</nav>

<!-- HERO -->
<section class="z2b-hero">
  <div class="z2b-hero-inner">
    <div>
      <div class="z2b-eyebrow">ZERO2BILLIONAIRES · REV MOKORO MANANA · 2026</div>
      <h1 class="z2b-hero-title">From Salary<br>Struggles to<br><em>Digital Freedom.</em></h1>
      <div class="z2b-divider"></div>
      <p class="z2b-hero-sub">Your roadmap from salary struggles or no income — to building a Digital Estate with AI and creating lasting income.</p>
      <p class="z2b-hero-note">No Capital. No Experience. No Problem. Just Action. Real Results.</p>
      <div class="z2b-author-line">AUTHOR: REV MOKORO MANANA · FOUNDER, ZERO2BILLIONAIRES AMAVULANDLELA PTY LTD</div>
      <div class="z2b-buy-stack">
        <button class="z2b-btn-buy z2b-btn-gold" onclick="z2bOpenModal('r700')">
          <div class="z2b-btn-left">
            <span class="z2b-btn-lbl">⚡ FULL BOOK SYSTEM</span>
            <span class="z2b-btn-desc">PDF + Audio + Workbook + 4M Machine Starter Pack</span>
          </div>
          <span class="z2b-btn-price">R700</span>
        </button>
        <button class="z2b-btn-buy z2b-btn-out2" onclick="z2bOpenModal('r200')">
          <div class="z2b-btn-left">
            <span class="z2b-btn-lbl">📖 GET THE FLIPBOOK</span>
            <span class="z2b-btn-desc">Interactive digital book · Read online instantly</span>
          </div>
          <span class="z2b-btn-price">R200</span>
        </button>
      </div>
    </div>
    <div class="z2b-book-wrap">
      <div class="z2b-book">
        <img src="/book-cover.jpg" alt="Zero2Billionaires by Rev Mokoro Manana" onerror="this.style.display='none'">
      </div>
    </div>
  </div>
</section>

<!-- PACKAGES -->
<section class="z2b-section z2b-what">
  <div class="z2b-section-inner">
    <div class="z2b-sec-ey">CHOOSE YOUR PACKAGE</div>
    <h2 class="z2b-sec-title">Two Ways to <em>Start Your Journey</em></h2>
    <p class="z2b-sec-sub">Pick the entry point that fits where you are right now.</p>
    <div class="z2b-pkgs">
      <div class="z2b-pkg">
        <div class="z2b-pkg-head">
          <div class="z2b-pkg-tier">ENTRY PACKAGE</div>
          <div class="z2b-pkg-name">Zero2Billionaires Flipbook</div>
          <div class="z2b-pkg-price">R200</div>
          <div class="z2b-pkg-note">Once-off · Instant access · Read online</div>
        </div>
        <div class="z2b-pkg-body">
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Full interactive digital flipbook — all chapters</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>First 3 features of the 4M Manual Engine</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Read on any device — no download needed</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Instant access after payment</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Gateway to the full ecosystem</div>
          <button class="z2b-pkg-cta z2b-cta-out" onclick="z2bOpenModal('r200')">GET FLIPBOOK — R200</button>
        </div>
      </div>
      <div class="z2b-pkg z2b-pkg-featured">
        <div class="z2b-pkg-head">
          <div class="z2b-pkg-tier">⭐ RECOMMENDED · STARTER PACK</div>
          <div class="z2b-pkg-name">Full Book System</div>
          <div class="z2b-pkg-price">R700</div>
          <div class="z2b-pkg-note">Once-off · Complete ecosystem · Lifetime access</div>
        </div>
        <div class="z2b-pkg-body">
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Everything in the Flipbook package</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Branded PDF eBook — download &amp; print</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Audio Reader — listen chapter by chapter</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Action Workbook — all chapters</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>4M Machine — ALL 7 Manual features unlocked</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Coach Manlaw AI — unlimited sessions</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>All 99 Entrepreneurial Consumer Workshop sessions</div>
          <div class="z2b-pkg-f"><span class="z2b-dot">◆</span>Full Z2B Platform access</div>
          <button class="z2b-pkg-cta z2b-cta-gold" onclick="z2bOpenModal('r700')">GET FULL SYSTEM — R700</button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- INSIDE THE BOOK -->
<section class="z2b-section z2b-inside">
  <div class="z2b-section-inner">
    <div class="z2b-sec-ey">30 CHAPTERS · 5 SECTIONS · 1 BONUS CHALLENGE</div>
    <h2 class="z2b-sec-title">What's <em>Inside</em></h2>
    <p class="z2b-sec-sub">A complete journey from awakening to legacy — structured, practical, Kingdom-grounded.</p>
    <div class="z2b-chapters">
      <div class="z2b-ch"><div class="z2b-ch-num">SECTION 1</div><div class="z2b-ch-title">Foundation of Transformation</div><div class="z2b-ch-sub">The awakening. Breaking the salary mindset. Identity shift. Digital assets.</div></div>
      <div class="z2b-ch"><div class="z2b-ch-num">SECTION 2</div><div class="z2b-ch-title">Market &amp; Positioning Clarity</div><div class="z2b-ch-sub">Define your customer. Understand real pain. The digital opportunity gap.</div></div>
      <div class="z2b-ch"><div class="z2b-ch-num">SECTION 3</div><div class="z2b-ch-title">The Digital Estate Wealth Engine</div><div class="z2b-ch-sub">Create digital products using AI. Package. Sell. Your first sales system.</div></div>
      <div class="z2b-ch"><div class="z2b-ch-num">SECTION 4</div><div class="z2b-ch-title">Scale, Systems &amp; Digital Empire</div><div class="z2b-ch-sub">Automation. Repeatable income. Distribution. Community. Multiplication.</div></div>
      <div class="z2b-ch"><div class="z2b-ch-num">SECTION 5</div><div class="z2b-ch-title">From Builder to Legacy Architect</div><div class="z2b-ch-sub">Strategic mediation. Systems. Ownership. Impact. How to live forever.</div></div>
      <div class="z2b-ch"><div class="z2b-ch-num">🏆 BONUS</div><div class="z2b-ch-title">7-Day First Product Challenge</div><div class="z2b-ch-sub">Day-by-day execution. From zero to your first product in one week.</div></div>
    </div>
  </div>
</section>

<!-- AUTHOR -->
<section class="z2b-section z2b-author">
  <div class="z2b-section-inner">
    <div class="z2b-sec-ey" style="margin-bottom:40px;">THE AUTHOR</div>
    <div class="z2b-author-inner">
      <div class="z2b-author-photo">
        <div class="z2b-author-photo-init">R</div>
      </div>
      <div>
        <div class="z2b-author-name">Rev Mokoro Manana</div>
        <div class="z2b-author-role">AUTHOR · DIGITAL ECOSYSTEM BUILDER · FOUNDER · ZERO2BILLIONAIRES AMAVULANDLELA PTY LTD</div>
        <p class="z2b-author-bio">Rev Mokoro Manana is a Kingdom business entrepreneur, digital systems architect, and the founder of Zero2Billionaires Legacy Builders. Built on the conviction that ordinary people carry extraordinary potential, his work combines faith-grounded principles with practical digital income strategies — accessible to anyone, regardless of capital, education or background.</p>
        <p class="z2b-author-bio">Zero2Billionaires is not just a book. It is the product of a system Rev built, tested and proved before writing a single word. Every chapter is lived experience. Every framework is battle-tested. Every reader is equipped — not just inspired.</p>
        <p class="z2b-author-quote">"You started at Zero. But you were never meant to stay there."</p>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="z2b-section z2b-testi">
  <div class="z2b-section-inner">
    <div class="z2b-sec-ey">WHAT READERS SAY</div>
    <h2 class="z2b-sec-title">Legacy Builders <em>Testify</em></h2>
    <p class="z2b-sec-sub">Real people. Real transformation. Real results.</p>
    <div class="z2b-testi-grid">
      <div class="z2b-testi-card"><div class="z2b-testi-ph">YOUR TESTIMONY COMING SOON</div></div>
      <div class="z2b-testi-card"><div class="z2b-testi-ph">YOUR TESTIMONY COMING SOON</div></div>
      <div class="z2b-testi-card"><div class="z2b-testi-ph">YOUR TESTIMONY COMING SOON</div></div>
    </div>
    <div class="z2b-challenge">
      <h3>Has Zero2Billionaires Transformed You?</h3>
      <p>We are calling all Legacy Builders to tell the world. Share how this book changed your thinking, your income, your life. Your testimony could be the spark that lights someone else's journey.</p>
      <a href="mailto:revmokorolawrencemanana@gmail.com?subject=My Zero2Billionaires Testimony&body=Hi Rev,%0A%0AHere is my transformation story:%0A%0AName:%0ACity:%0A%0AHow Zero2Billionaires transformed me:%0A%0A" class="z2b-challenge-btn">📣 SHARE YOUR TRANSFORMATION STORY</a>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="z2b-final">
  <div class="z2b-final-inner">
    <h2 class="z2b-final-title">Your Digital Estate<br>Starts <em>Now.</em></h2>
    <p class="z2b-final-sub">One book. One decision. One system that changes everything. No capital. No experience. No problem.</p>
    <div class="z2b-final-btns">
      <button class="z2b-fb-gold" onclick="z2bOpenModal('r700')">⚡ GET FULL SYSTEM — R700</button>
      <button class="z2b-fb-out" onclick="z2bOpenModal('r200')">📖 GET FLIPBOOK — R200</button>
    </div>
  </div>
</section>

<footer class="z2b-footer">
  <p>© 2026 ZERO2BILLIONAIRES AMAVULANDLELA PTY LTD · ALL RIGHTS RESERVED · APP.Z2BLEGACYBUILDERS.CO.ZA</p>
</footer>

<!-- PAYMENT MODAL -->
<div class="z2b-modal-bg" id="z2bPayModal">
  <div class="z2b-modal">
    <button class="z2b-mc" onclick="z2bCloseModal()">✕</button>
    <div id="z2b-modal-content"></div>
  </div>
</div>

<script>
var Z2B_PF_MERCHANT_ID  = '${merchantId}';
var Z2B_PF_MERCHANT_KEY = '${merchantKey}';
var Z2B_PKGS = {
  r200:{tier:'ENTRY PACKAGE',name:'Zero2Billionaires Flipbook',price:'R200',amount:'200.00',item:'Zero2Billionaires Flipbook'},
  r700:{tier:'STARTER PACK',name:'Full Book System',price:'R700',amount:'700.00',item:'Zero2Billionaires Full Book System'}
};
var Z2B_BANK = {name:'Zero2billionaires Amavulandlela',num:'1318257727',bank:'NEDBANK'};
var Z2B_URLS = {
  return_url:'https://app.z2blegacybuilders.co.za/dashboard?upgraded=starter&from=book',
  cancel_url:'https://book.z2blegacybuilders.co.za',
  notify_url:'https://app.z2blegacybuilders.co.za/api/payfast'
};


// ── Check if user is already logged in ──────────────────────
async function z2bCheckAuth() {
  try {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    return data?.user || null;
  } catch { return null; }
}

// ── Open modal with light registration first ─────────────────
function z2bOpenModal(pkg){
  var p=Z2B_PKGS[pkg];
  document.getElementById('z2b-modal-content').innerHTML=
    '<div class="z2b-m-tier">'+p.tier+'</div>'+
    '<div class="z2b-m-name">'+p.name+'</div>'+
    '<div class="z2b-m-price">'+p.price+'</div>'+
    '<div class="z2b-m-div"></div>'+

    // Light registration form
    '<div id="z2b-reg-form">'+
      '<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;letter-spacing:3px;color:#5a4510;margin-bottom:12px;">YOUR DETAILS — CREATE YOUR FREE ACCOUNT</div>'+
      '<input id="z2b-reg-name" type="text" placeholder="Full Name" style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:3px;color:#f5f0e8;font-size:0.85rem;margin-bottom:8px;outline:none;">'+
      '<input id="z2b-reg-email" type="email" placeholder="Email Address" style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:3px;color:#f5f0e8;font-size:0.85rem;margin-bottom:8px;outline:none;">'+
      '<input id="z2b-reg-phone" type="tel" placeholder="WhatsApp Number (+27...)" style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:3px;color:#f5f0e8;font-size:0.85rem;margin-bottom:16px;outline:none;">'+
      '<div id="z2b-reg-error" style="color:#f87171;font-size:0.75rem;margin-bottom:8px;display:none;"></div>'+
      '<button onclick="z2bProceedToPayment(''+pkg+'')" style="width:100%;padding:14px;background:linear-gradient(135deg,#c9a227,#f0c040);color:#080608;font-family:Bebas Neue,sans-serif;font-size:0.8rem;letter-spacing:4px;border:none;border-radius:2px;cursor:pointer;">'+
        'CONTINUE TO PAYMENT — '+p.price+' →'+
      '</button>'+
      '<p style="font-size:0.7rem;color:rgba(255,255,255,0.2);text-align:center;margin-top:10px;font-style:italic;">'+
        'Your account is created free. You get your own referral link after payment.'+
      '</p>'+
    '</div>'+

    // PayFast form (hidden until registration complete)
    '<form id="z2b-pf-form" action="https://www.payfast.co.za/eng/process" method="post" style="display:none">'+
      '<input type="hidden" name="merchant_id" value="'+Z2B_PF_MERCHANT_ID+'">'+
      '<input type="hidden" name="merchant_key" value="'+Z2B_PF_MERCHANT_KEY+'">'+
      '<input type="hidden" name="return_url" value="'+Z2B_URLS.return_url+'">'+
      '<input type="hidden" name="cancel_url" value="'+Z2B_URLS.cancel_url+'">'+
      '<input type="hidden" name="notify_url" value="'+Z2B_URLS.notify_url+'">'+
      '<input type="hidden" name="amount" id="z2b-pf-amount" value="'+p.amount+'">'+
      '<input type="hidden" name="item_name" id="z2b-pf-item" value="'+p.item+'">'+
      '<input type="hidden" name="name_first" id="z2b-pf-fname" value="">'+
      '<input type="hidden" name="email_address" id="z2b-pf-email" value="">'+
      '<input type="hidden" name="custom_str1" id="z2b-pf-phone" value="">'+
    '</form>';

  document.getElementById('z2bPayModal').classList.add('open');
}

async function z2bProceedToPayment(pkg) {
  var name  = document.getElementById('z2b-reg-name').value.trim();
  var email = document.getElementById('z2b-reg-email').value.trim();
  var phone = document.getElementById('z2b-reg-phone').value.trim();
  var errEl = document.getElementById('z2b-reg-error');

  if (!name || !email || !phone) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.style.display = 'block';
    return;
  }
  if (!email.includes('@')) {
    errEl.textContent = 'Please enter a valid email address.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';

  // Register as FAM member via API
  try {
    var res = await fetch('/api/auth/marketplace-signup', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        fullName: name,
        email: email,
        whatsapp: phone,
        password: Math.random().toString(36).slice(2,10) + 'Z2B!',
        referralCode: new URLSearchParams(window.location.search).get('ref') || '',
        joinedVia: 'book_landing_' + pkg
      })
    });
    var data = await res.json();

    // Set PayFast form fields
    document.getElementById('z2b-pf-fname').value  = name.split(' ')[0];
    document.getElementById('z2b-pf-email').value  = email;
    document.getElementById('z2b-pf-phone').value  = phone;

    // Submit to PayFast
    document.getElementById('z2b-pf-form').submit();

  } catch(err) {
    errEl.textContent = 'Something went wrong. Please try again.';
    errEl.style.display = 'block';
  }
}

function z2bOpenModal_old(pkg){
  var p=Z2B_PKGS[pkg];
  document.getElementById('z2b-modal-content').innerHTML=
    '<div class="z2b-m-tier">'+p.tier+'</div>'+
    '<div class="z2b-m-name">'+p.name+'</div>'+
    '<div class="z2b-m-price">'+p.price+'</div>'+
    '<div class="z2b-m-div"></div>'+
    '<form id="z2b-pf-form" action="https://www.payfast.co.za/eng/process" method="post" style="display:none">'+
      '<input type="hidden" name="merchant_id" value="'+Z2B_PF_MERCHANT_ID+'">'+
      '<input type="hidden" name="merchant_key" value="'+Z2B_PF_MERCHANT_KEY+'">'+
      '<input type="hidden" name="return_url" value="'+Z2B_URLS.return_url+'">'+
      '<input type="hidden" name="cancel_url" value="'+Z2B_URLS.cancel_url+'">'+
      '<input type="hidden" name="notify_url" value="'+Z2B_URLS.notify_url+'">'+
      '<input type="hidden" name="amount" value="'+p.amount+'">'+
      '<input type="hidden" name="item_name" value="'+p.item+'">'+
    '</form>'+
    '<div class="z2b-popt" onclick="document.getElementById(\'z2b-pf-form\').submit()">'+
      '<span class="z2b-pi">💳</span>'+
      '<div><div class="z2b-pl">Pay by Card</div><div class="z2b-ps">Credit / Debit card via PayFast — secure &amp; instant</div></div>'+
      '<span class="z2b-pb z2b-bg">INSTANT</span>'+
    '</div>'+
    '<div class="z2b-popt" onclick="z2bToggleBank(\'eft\')">'+
      '<span class="z2b-pi">🏦</span>'+
      '<div><div class="z2b-pl">Bank EFT / Transfer</div><div class="z2b-ps">Internet banking to our Nedbank account</div></div>'+
      '<span class="z2b-pb z2b-ba">24 HRS</span>'+
    '</div>'+
    '<div class="z2b-bank" id="z2b-bank-eft">'+
      '<div class="z2b-brow"><span class="z2b-bk">Account Name</span><span class="z2b-bv">'+Z2B_BANK.name+'</span></div>'+
      '<div class="z2b-brow"><span class="z2b-bk">Account Number</span><div style="display:flex;gap:8px;align-items:center"><span class="z2b-bv">'+Z2B_BANK.num+'</span><button class="z2b-cbtn" onclick="z2bCopy(\''+Z2B_BANK.num+'\',this)">COPY</button></div></div>'+
      '<div class="z2b-brow"><span class="z2b-bk">Bank</span><span class="z2b-bv">'+Z2B_BANK.bank+'</span></div>'+
      '<div class="z2b-brow"><span class="z2b-bk">Amount</span><span class="z2b-bv z2b-bv-hl">'+p.price+'.00</span></div>'+
      '<div class="z2b-brow"><span class="z2b-bk">Reference</span><div style="display:flex;gap:8px;align-items:center"><span class="z2b-bv z2b-bv-hl">Z2BBOOK</span><button class="z2b-cbtn" onclick="z2bCopy(\'Z2BBOOK\',this)">COPY</button></div></div>'+
    '</div>'+
    '<div class="z2b-popt" onclick="z2bToggleBank(\'atm\')">'+
      '<span class="z2b-pi">💵</span>'+
      '<div><div class="z2b-pl">ATM Cash Deposit</div><div class="z2b-ps">Cash at any Nedbank ATM nationwide</div></div>'+
      '<span class="z2b-pb z2b-ba">24 HRS</span>'+
    '</div>'+
    '<div class="z2b-bank" id="z2b-bank-atm">'+
      '<div class="z2b-brow"><span class="z2b-bk">Account Name</span><span class="z2b-bv">'+Z2B_BANK.name+'</span></div>'+
      '<div class="z2b-brow"><span class="z2b-bk">Account Number</span><div style="display:flex;gap:8px;align-items:center"><span class="z2b-bv">'+Z2B_BANK.num+'</span><button class="z2b-cbtn" onclick="z2bCopy(\''+Z2B_BANK.num+'\',this)">COPY</button></div></div>'+
      '<div class="z2b-brow"><span class="z2b-bk">Bank</span><span class="z2b-bv">'+Z2B_BANK.bank+'</span></div>'+
      '<div class="z2b-brow"><span class="z2b-bk">Amount</span><span class="z2b-bv z2b-bv-hl">'+p.price+'.00</span></div>'+
      '<div class="z2b-brow"><span class="z2b-bk">Reference</span><div style="display:flex;gap:8px;align-items:center"><span class="z2b-bv z2b-bv-hl">Z2BBOOK</span><button class="z2b-cbtn" onclick="z2bCopy(\'Z2BBOOK\',this)">COPY</button></div></div>'+
    '</div>'+
    '<p class="z2b-mnote">🔒 Secure payment · EFT &amp; ATM activated within 24 hours · Card is instant</p>';
  document.getElementById('z2bPayModal').classList.add('open');
}
function z2bCloseModal(){document.getElementById('z2bPayModal').classList.remove('open');}
function z2bToggleBank(t){document.getElementById('z2b-bank-'+t).classList.toggle('open');}
function z2bCopy(txt,btn){navigator.clipboard.writeText(txt);btn.textContent='✓';setTimeout(function(){btn.textContent='COPY';},2000);}
document.getElementById('z2bPayModal').addEventListener('click',function(e){if(e.target===this)z2bCloseModal();});

// ── Auto-open modal if ?buy= param present ──────────────────
(function(){
  var params = new URLSearchParams(window.location.search);
  var buy = params.get('buy');
  if(buy === 'r200') { setTimeout(function(){ z2bOpenModal('r200'); }, 300); }
  if(buy === 'r700') { setTimeout(function(){ z2bOpenModal('r700'); }, 300); }
})();
</script>
`
}
