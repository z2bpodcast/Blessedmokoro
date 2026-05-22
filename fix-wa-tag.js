var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');
c = c.replace(
  "              {/* WhatsApp */}\n              \n                href=",
  "              {/* WhatsApp */}\n              <a\n                href="
);
fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
