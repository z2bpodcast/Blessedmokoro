var fs = require('fs');
var c = fs.readFileSync('app/marketplace/page.tsx', 'utf8');

// Replace plain "Z2B" text logo in nav with image logo
c = c.replace(
  `<Link href="/" style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:GOLD, textDecoration:'none' }}>Z2B</Link>`,
  `<Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <img src="/logo-marketplace.png" alt="Z2B Marketplace" style={{ height:32, width:'auto', objectFit:'contain' }} />
        </Link>`
);

fs.writeFileSync('app/marketplace/page.tsx', c);
console.log('Done');
