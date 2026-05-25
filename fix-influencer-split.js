var fs = require('fs');

// Fix API
var api = fs.readFileSync('app/api/influencer/route.ts', 'utf8');
api = api.replace(
  "- Affiliate earns: 20% of product price (10% from builder, 10% from influencer)",
  "- Influencer earns: 75% of product price (they OWN the product)\n- Affiliate earns: 20% (builder earns this by referring sales)\n- Z2B earns: 5% platform fee\n- Builder earns: Z2B compensation plan (ISP, TSC, TLI) on membership referrals"
);
api = api.replace(
  "  const builderGross = Math.round(remaining * 0.30)\n  const influencerGross = Math.round(remaining * 0.70)",
  "  const influencerGross = Math.round(remaining * 0.75)\n  const builderGross = 0 // Builder earns via Z2B comp plan, not product split"
);
fs.writeFileSync('app/api/influencer/route.ts', api);
console.log('API done');

// Fix page
var pg = fs.readFileSync('app/influencer/page.tsx', 'utf8');
pg = pg.replace(
  "  const aff  = Math.round(price * 0.20)\n",
  "  const aff  = Math.round(price * 0.20)\n  const inf  = Math.round(price * 0.75)\n"
);
pg = pg.replace(
  "    { label:'Direct sale (no affiliate)', z2b, builder:bld, influencer:inf, affiliate:0 },\n    { label:'Via affiliate link',          z2b, builder:bld - Math.round(price*0.10), influencer:inf - Math.round(price*0.10), affiliate:aff },\n    { label:'Influencer uses own link',    z2b, builder:bld - Math.round(price*0.10), influencer:inf - Math.round(price*0.10) + aff, affiliate:aff },",
  "    { label:'Direct sale (no affiliate)', z2b, builder:0,   influencer:inf,       affiliate:0 },\n    { label:'Builder uses affiliate link', z2b, builder:aff, influencer:inf-aff,   affiliate:aff },\n    { label:'Influencer uses own link',    z2b, builder:0,   influencer:inf,       affiliate:aff },"
);
fs.writeFileSync('app/influencer/page.tsx', pg);
console.log('Page done');
