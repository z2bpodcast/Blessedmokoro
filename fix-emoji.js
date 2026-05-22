var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');
c = c.replace(
  '💬 WhatsApp',
  '{'+"'💬'"+'} WhatsApp'
);
c = c.replace(
  "{copied ? '✓ Copied!' : '📋 Copy Link'}",
  "{copied ? '✓ Copied!' : '📋 Copy Link'}"
);
fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
