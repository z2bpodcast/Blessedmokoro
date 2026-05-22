var fs = require('fs');
var c = fs.readFileSync('app/page.tsx', 'utf8');
var link = '<Link href="/income-rivers" style={{ padding:\'8px 14px\', border:`1px solid ${BORDER}`, borderRadius:\'10px\', color:MUTED, fontSize:\'12px\', fontWeight:700 }}>4 Rivers</Link>\n              ';
c = c.replace(link + link, link);
fs.writeFileSync('app/page.tsx', c);
console.log('Done');
