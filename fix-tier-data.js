var fs = require('fs');

// ── FILES TO FIX ──────────────────────────────────────────────
var files = [
  'app/pricing/page.tsx',
  'app/ai-income/choose-plan/page.tsx',
  'app/ai-income/payment/page.tsx',
  'app/income-rivers/page.tsx',
];

files.forEach(file => {
  var c = fs.readFileSync(file, 'utf8');

  // Fix Starter BFM: 750 → 300
  c = c.replace(/starter.*bfm.*750/gi, m => m.replace('750','300'));
  c = c.replace(/bfm.*750.*starter/gi, m => m.replace('750','300'));
  c = c.replace("bfm:       750,\n    engine:    '🔧 Manual',\n    gears:     '1–3'", "bfm:       300,\n    engine:    '🔧 Manual',\n    gears:     '1–3'");
  c = c.replace("bfm: 750,\n    color: '#B4B2A9', gears: '1–3'", "bfm: 300,\n    color: '#B4B2A9', gears: '1–3'");
  c = c.replace("starter:  { engine: '🔧 Manual',    gears: '1–3', bfm: 750", "starter:  { engine: '🔧 Manual',    gears: '1–3', bfm: 300");
  c = c.replace("{ tier:'Starter',  amount:'R750',   bfm:750   }", "{ tier:'Starter',  amount:'R300',   bfm:300   }");

  // Fix Bronze gears: 1-4 → 1-5
  c = c.replace("gears: '1–4'", "gears: '1–5'");
  c = c.replace("gears:     '1–4'", "gears:     '1–5'");

  // Fix Bronze products: 4 → 5
  c = c.replace("products: 4, bfm", "products: 5, bfm");
  c = c.replace("products:  4,", "products:  5,");

  fs.writeFileSync(file, c);
  console.log('Fixed:', file);
});
