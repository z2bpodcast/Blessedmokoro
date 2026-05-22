var fs = require('fs');
var c = fs.readFileSync('app/ai-income/page.tsx', 'utf8');

// FIX 1 — Swap hero h1: make WELCOME big, Deploy Yourself small
c = c.replace(
  `<h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: 1.15, marginBottom: '20px' }}>
          If they underpay you<br/>
          or don't want to employ you —<br/>
          <span style={{ color: GOLD }}>Deploy Yourself.</span>
        </h1>`,
  `<div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(11px,1.5vw,13px)', color: MUTED, fontStyle: 'italic', marginBottom: '12px', letterSpacing: '1px' }}>
          "If they underpay you or don't want to employ you — Deploy Yourself."
        </div>
        <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: 1.1, marginBottom: '20px' }}>
          Welcome to the<br/>
          <span style={{ color: GOLD }}>4M: Mobile Money</span><br/>
          Making Machine
        </h1>`
);

// FIX 2 — Non-member CTA: "Start Free" nav button → light reg
c = c.replace(
  `<Link href="/register" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
              Start Free →
            </Link>`,
  `<Link href="/pricing" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
              Start from R700 →
            </Link>`
);

// FIX 3 — Non-member hero CTA: keep "Start from R700" going to choose-plan (pricing comparison)
// Already correct: href="/ai-income/choose-plan" — no change needed

fs.writeFileSync('app/ai-income/page.tsx', c);
console.log('Done');
