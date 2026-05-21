var fs = require('fs');
var c = fs.readFileSync('app/reader/page.tsx', 'utf8');
c = c.replace("          if (!access) router.push('/book?buy=r700')", '');
c = c.replace("  if (!hasAccess) return null", '');
fs.writeFileSync('app/reader/page.tsx', c);
console.log('Done');
