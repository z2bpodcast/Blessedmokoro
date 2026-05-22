var fs = require('fs');
var c = fs.readFileSync('app/page.tsx', 'utf8');
c = c.replace(
  '<Link href="/login" style={{ padding:\'8px 14px\', border:`1px solid ${BORDER}`, borderRadius:\'10px\', color:MUTED, fontSize:\'12px\', fontWeight:700 }}>\n                Sign In\n              </Link>',
  '<Link href="/income-rivers" style={{ padding:\'8px 14px\', border:`1px solid ${BORDER}`, borderRadius:\'10px\', color:MUTED, fontSize:\'12px\', fontWeight:700 }}>4 Rivers</Link>\n              <Link href="/login" style={{ padding:\'8px 14px\', border:`1px solid ${BORDER}`, borderRadius:\'10px\', color:MUTED, fontSize:\'12px\', fontWeight:700 }}>\n                Sign In\n              </Link>'
);
fs.writeFileSync('app/page.tsx', c);
console.log('Done');
