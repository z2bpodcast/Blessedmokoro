var fs = require('fs');

// ── FIX YOCO ROUTE ────────────────────────────────────────────
var y = fs.readFileSync('app/api/yoco/route.ts', 'utf8');

// 1. Add full tier amounts — no top-up allowed
y = y.replace(
  "// ── TIER AMOUNTS ──────────────────────────────────────────────────\nconst AMOUNT_TO_TIER: Record<number, string> = {\n  700:   'starter',\n  2500:  'bronze',\n  5000:  'copper',\n  12000: 'silver',\n  25000: 'gold',\n  50000: 'platinum',\n}",
  "// ── TIER AMOUNTS — FULL PRICE ONLY (no top-up) ───────────────────────\nconst AMOUNT_TO_TIER: Record<number, string> = {\n  700:   'starter',\n  2500:  'bronze',\n  5000:  'copper',\n  12000: 'silver',\n  25000: 'gold',\n  50000: 'platinum',\n}\n\n// Full tier prices — Yoco must charge FULL amount, never a top-up\nconst FULL_TIER_PRICES: Record<string, number> = {\n  starter:  700,\n  bronze:   2500,\n  copper:   5000,\n  silver:   12000,\n  gold:     25000,\n  platinum: 50000,\n}"
);

// 2. On tier upgrade — set bfm_start_date 60 days from now (grace period)
y = y.replace(
  "        upgraded_at:    new Date().toISOString(),",
  "        upgraded_at:      new Date().toISOString(),\n        // BFM grace: 60 days from upgrade date\n        bfm_start_date:   new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),"
);

// 3. Validate full tier price on webhook — reject top-up amounts
y = y.replace(
  "      const newTier = AMOUNT_TO_TIER[amountRands] || 'starter'",
  "      // Validate FULL tier price — reject top-up attempts\n      if (!AMOUNT_TO_TIER[amountRands]) {\n        console.error('Invalid tier amount — top-ups not allowed:', amountRands)\n        return new NextResponse('Invalid payment amount', { status: 400 })\n      }\n      const newTier = AMOUNT_TO_TIER[amountRands]"
);

fs.writeFileSync('app/api/yoco/route.ts', y);
console.log('yoco/route.ts done');

// ── FIX PAYFAST ROUTE ─────────────────────────────────────────
var p = fs.readFileSync('app/api/payfast/route.ts', 'utf8');
p = p.replace(
  "        upgraded_at:    new Date().toISOString(),",
  "        upgraded_at:      new Date().toISOString(),\n        bfm_start_date:   new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),"
);
fs.writeFileSync('app/api/payfast/route.ts', p);
console.log('payfast/route.ts done');

