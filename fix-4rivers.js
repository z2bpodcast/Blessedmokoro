var fs = require('fs');

// ── 1. invite/page.tsx ────────────────────────────────────────
var inv = fs.readFileSync('app/invite/page.tsx', 'utf8');
inv = inv.replace(
  'One platform. 9 income streams. AI tools that create digital products. A global marketplace. An influencer engine. A community of builders.',
  'One platform. 4 Income Rivers. 9 compensation streams. AI tools that create digital products. A global marketplace. An influencer engine. A community of builders.'
);
fs.writeFileSync('app/invite/page.tsx', inv);
console.log('invite done');

// ── 2. page.tsx (homepage) ────────────────────────────────────
var home = fs.readFileSync('app/page.tsx', 'utf8');
home = home.replace(
  "'Your success is tied to those around you — 9 income streams, no ceiling'",
  "'Your success is tied to those around you — 4 Income Rivers · 9 compensation streams · no ceiling'"
);
fs.writeFileSync('app/page.tsx', home);
console.log('homepage done');

// ── 3. earn/page.tsx ──────────────────────────────────────────
var earn = fs.readFileSync('app/earn/page.tsx', 'utf8');
earn = earn.replace(
  'All 9 income streams.',
  '4 Income Rivers · 9 compensation streams.'
);
fs.writeFileSync('app/earn/page.tsx', earn);
console.log('earn done');

// ── 4. marketplace/dashboard/page.tsx ────────────────────────
var mkd = fs.readFileSync('app/marketplace/dashboard/page.tsx', 'utf8');
mkd = mkd.replace(
  'access the full 4M Machine, and qualify for all 9 income streams.',
  'access the full 4M Machine, and qualify for all 4 Income Rivers and 9 compensation streams.'
);
fs.writeFileSync('app/marketplace/dashboard/page.tsx', mkd);
console.log('marketplace dashboard done');

