var fs = require('fs');

// ── choose-plan/page.tsx ──────────────────────────────────────
var c = fs.readFileSync('app/ai-income/choose-plan/page.tsx', 'utf8');
c = c.replace("gears: '1–3', products: 2, bfm: 750", "gears: '1–3', products: 2, bfm: 300");
c = c.replace("gears: '1–5', products: 5, bfm: 750", "gears: '1–5', products: 5, bfm: 800");
c = c.replace("gears: '1–5', products: 15, bfm: 1500", "gears: '1–6', products: 15, bfm: 1500");
fs.writeFileSync('app/ai-income/choose-plan/page.tsx', c);
console.log('choose-plan done');

// ── payment/page.tsx ─────────────────────────────────────────
var p = fs.readFileSync('app/ai-income/payment/page.tsx', 'utf8');
p = p.replace("gears: '1–3', bfm: 300", "gears: '1–3', bfm: 300");
p = p.replace("gears: '1–5', bfm: 750", "gears: '1–5', bfm: 800");
p = p.replace("gears: '1–5', bfm: 1500", "gears: '1–6', bfm: 1500");
fs.writeFileSync('app/ai-income/payment/page.tsx', p);
console.log('payment done');

// ── pricing/page.tsx — fix Bronze BFM ────────────────────────
var pr = fs.readFileSync('app/pricing/page.tsx', 'utf8');
pr = pr.replace(
  "id:        'bronze',\n    name:      'Bronze',\n    price:     2500,\n    bfm:       750",
  "id:        'bronze',\n    name:      'Bronze',\n    price:     2500,\n    bfm:       800"
);
fs.writeFileSync('app/pricing/page.tsx', pr);
console.log('pricing done');

// ── income-rivers/page.tsx ───────────────────────────────────
var ir = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');
ir = ir.replace(
  "{ tier:'Starter',  amount:'R300',   bfm:300   }",
  "{ tier:'Starter',  amount:'R300',   bfm:300   }"
);
ir = ir.replace(
  "{ icon:'🔧', label:'Manual',    tier:'Starter – Bronze', desc:'Gears 1–5' }",
  "{ icon:'🔧', label:'Manual',    tier:'Starter – Bronze', desc:'Starter: Gears 1–3 · Bronze: Gears 1–5' }"
);
// Fix Bronze BFM
ir = ir.replace(
  "{ tier:'Bronze',   amount:'R1,050', bfm:1050  }",
  "{ tier:'Bronze',   amount:'R800',   bfm:800   }"
);
fs.writeFileSync('app/income-rivers/page.tsx', ir);
console.log('income-rivers done');

