var fs = require('fs');
var c = fs.readFileSync('app/production/page.tsx', 'utf8');

c = c.replace(
  '{/* TXT removed — HTML has Save as PDF */}\n                      style={{',
  '<button onClick={() => downloadTXT(p.session_id, p.title ?? "product")}\n                      style={{'
);

fs.writeFileSync('app/production/page.tsx', c);
console.log('Done');
