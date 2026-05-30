var fs = require('fs');

// ── FIX 1: INCREASE COVER TEXT SIZE ──────────────────────
var g5 = fs.readFileSync('app/ai-income/gear/5/page.tsx', 'utf8');

// Title: 42px → 72px
g5 = g5.replace(
  'font-size:42px;font-weight:900;color:#F0F9FF;text-align:center;line-height:1.25;word-wrap:break-word;',
  'font-size:72px;font-weight:900;color:#F0F9FF;text-align:center;line-height:1.2;word-wrap:break-word;'
);

// Author name: find and increase
g5 = g5.replace(
  "font-family:Georgia,serif;font-size:18px;fill:#D4AF37;text-anchor:middle",
  "font-family:Georgia,serif;font-size:28px;fill:#D4AF37;text-anchor:middle"
);

// Save author name to profile on confirm
g5 = g5.replace(
  "  async function getToken() {",
  `  // Save author name to localStorage for future use
  function saveAuthorNameLocally(name: string, type: string) {
    try { localStorage.setItem('z2b_author_name', name); localStorage.setItem('z2b_author_type', type); } catch(e) {}
  }
  function loadSavedAuthorName() {
    try { return localStorage.getItem('z2b_author_name') || ''; } catch(e) { return '' }
  }
  async function getToken() {`
);

// Load saved author name on mount
g5 = g5.replace(
  "  const [authorName,     setAuthorName]     = useState('')",
  "  const [authorName,     setAuthorName]     = useState(() => { try { return typeof window !== 'undefined' ? localStorage.getItem('z2b_author_name') || '' : '' } catch(e) { return '' } })"
);

// Save when user types author name
g5 = g5.replace(
  "value={authorName} onChange={e => setAuthorName(e.target.value)}",
  "value={authorName} onChange={e => { setAuthorName(e.target.value); try { localStorage.setItem('z2b_author_name', e.target.value); } catch(er) {} }}"
);

fs.writeFileSync('app/ai-income/gear/5/page.tsx', g5);
console.log('Cover + author name fixes done');

// ── FIX 2: SAVE COVER_URL + AUTHOR TO GEAR 6 CONFIRM ──
var route = fs.readFileSync('app/api/gear/[gear]/route.ts', 'utf8');

// Add cover_url and author to marketplace insert
route = route.replace(
  "        seller_name: listing.sellerName ?? '',",
  "        seller_name: listing.sellerName ?? listing.authorName ?? '',\n        cover_url:   listing.coverUrl ?? listing.cover_url ?? null,"
);

// Add cover_url to saved_projects upsert
route = route.replace(
  "      title:        listing.title ?? listing.productTitle ?? 'Digital Product',\n      current_gear: 6,\n      status:       'live',",
  "      title:        listing.title ?? listing.productTitle ?? 'Digital Product',\n      cover_url:    listing.coverUrl ?? listing.cover_url ?? null,\n      current_gear: 6,\n      status:       'live',"
);

fs.writeFileSync('app/api/gear/[gear]/route.ts', route);
console.log('Dashboard + cover_url fixes done');

