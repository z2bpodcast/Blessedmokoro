var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

c = c.replace(
  `<Link key={proj.id} href={\`/production?session=\${proj.session_id}\`}`,
  `<div key={proj.id} style={{ borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', padding:'14px 16px', marginBottom:8 }}>
                  <Link href={\`/production?session=\${proj.session_id}\`}`
);

// Close the wrapping div and add gear buttons after the existing link
c = c.replace(
  `<Link href="/production" style={{ textAlign:'center', fontSize:'12px', color:CYAN, padding:'10px', textDecoration:'none' }}>`,
  `<Link href="/production" style={{ textAlign:'center', fontSize:'12px', color:CYAN, padding:'10px', textDecoration:'none' }}>`
);

fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Done');
