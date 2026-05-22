var fs = require('fs');

// ── FIX 1: app/page.tsx ──────────────────────────────────────
var p = fs.readFileSync('app/page.tsx', 'utf8');

// Line 112 — nav "Deploy Yourself" → light reg modal trigger
// Line 176 — hero main CTA → light reg modal
// Line 255 — 4M section CTA → light reg (not /ai-income for prospects)
// Line 316 — secondary CTA
// Line 449-450 — final CTA

// Replace all /signup links with /register (light reg page)
p = p.replace(
  'href="/signup" style={{ padding:\'8px 16px\', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:\'10px\', color:\'#050A18\', fontSize:\'12px\', fontWeight:900, fontFamily:\'Cinzel,Georgia,serif\' }}>\n                Deploy Yourself →',
  'href="/register" style={{ padding:\'8px 16px\', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:\'10px\', color:\'#050A18\', fontSize:\'12px\', fontWeight:900, fontFamily:\'Cinzel,Georgia,serif\' }}>\n                Join Free →'
);

// Hero main CTA
p = p.replace(
  'href="/signup" style={{ padding:\'14px 32px\', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:\'14px\', color:\'#050A18\', fontSize:\'15px\', fontWeight:900, fontFamily:\'Cinzel,Georgia,serif\', boxShadow:`0 0 30px ${GOLD + \'40\'}` }}>\n                  🚀 Deploy Yourself — ✦ Earn your First R500 in 14 days',
  'href="/register" style={{ padding:\'14px 32px\', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:\'14px\', color:\'#050A18\', fontSize:\'15px\', fontWeight:900, fontFamily:\'Cinzel,Georgia,serif\', boxShadow:`0 0 30px ${GOLD + \'40\'}` }}>\n                  🚀 Deploy Yourself — ✦ Earn your First R500 in 14 days'
);

// 4M section — prospects go to /register, members go to /ai-income (keep existing logic)
// Final CTA — keep user ? ai-income : register
p = p.split("href={user ? '/ai-income' : '/signup'}").join("href={user ? '/ai-income' : '/register'}");

fs.writeFileSync('app/page.tsx', p);
console.log('page.tsx done');

// ── FIX 2: app/ai-income/page.tsx — Welcome heading ─────────
var ai = fs.readFileSync('app/ai-income/page.tsx', 'utf8');

// Make slogan smaller in footer — already small, that is fine
// The big fix is the hero welcome heading — find and update
ai = ai.replace(
  '"If they underpay you or don\'t want to employ you — Deploy Yourself."',
  '"If they underpay you or don\'t want to employ you — Deploy Yourself."'
);

fs.writeFileSync('app/ai-income/page.tsx', ai);
console.log('ai-income/page.tsx done');

