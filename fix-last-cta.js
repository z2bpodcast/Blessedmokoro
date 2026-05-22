var fs = require('fs');
var c = fs.readFileSync('app/ai-income/page.tsx', 'utf8');
c = c.replace(
  "href={user ? '/ai-income/ignition' : '/ai-income/choose-plan'}",
  "href={user ? '/ai-income/ignition' : '/register'}"
);
fs.writeFileSync('app/ai-income/page.tsx', c);
console.log('Done');
