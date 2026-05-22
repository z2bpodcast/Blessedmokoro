var fs = require('fs');

// ── 1. ADD INCOME RIVERS TO HOMEPAGE NAV ─────────────────────
var p = fs.readFileSync('app/page.tsx', 'utf8');
p = p.replace(
  '<Link href="/ai-income" style={{ padding:\'8px 16px\', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:\'10px\', color:\'#050A18\', fontSize:\'12px\', fontWeight:900, fontFamily:\'Cinzel,Georgia,serif\' }}>\n                4M Machine\n              </Link>',
  '<Link href="/income-rivers" style={{ padding:\'8px 14px\', border:`1px solid ${BORDER}`, borderRadius:\'10px\', color:MUTED, fontSize:\'12px\', fontWeight:700 }}>4 Rivers</Link>\n              <Link href="/ai-income" style={{ padding:\'8px 16px\', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:\'10px\', color:\'#050A18\', fontSize:\'12px\', fontWeight:900, fontFamily:\'Cinzel,Georgia,serif\' }}>\n                4M Machine\n              </Link>'
);
fs.writeFileSync('app/page.tsx', p);
console.log('homepage nav done');

// ── 2. FIX INCOME RIVERS PAGE — product ownership ─────────────
var ir = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');
ir = ir.replace(
  "{ label:'Your share',       value:'75% of every sale'                    },",
  "{ label:'Ownership',        value:'100% yours — always. The 4M Machine builds YOUR product' },\n      { label:'Sell yourself',     value:'WhatsApp · Your PWA Store → Keep 100%'                 },\n      { label:'Z2B Marketplace',   value:'75% you · 20% affiliate · 5% Z2B platform fee'         },\n      { label:'Other platforms',   value:'Selar · Gumroad · Payhip → their platform split applies' },"
);
fs.writeFileSync('app/income-rivers/page.tsx', ir);
console.log('income-rivers ownership fixed');

