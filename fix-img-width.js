var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');
c = c.replace(
  "style={{ width:'100%', maxWidth:680, borderRadius:16, border:'1px solid rgba(212,175,55,0.2)' }}",
  "style={{ width:'100%', maxWidth:900, borderRadius:16, border:'1px solid rgba(212,175,55,0.2)', display:'block', margin:'0 auto' }}"
);
fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
