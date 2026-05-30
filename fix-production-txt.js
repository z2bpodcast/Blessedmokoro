var fs = require('fs');
var c = fs.readFileSync('app/production/page.tsx', 'utf8');

// Remove TXT button from listed products section
c = c.replace(
  `<button onClick={() => downloadTXT(p.session_id, p.title)}`,
  `{/* TXT removed — HTML has Save as PDF */}`
);

// Remove TXT button from projects section
c = c.replace(
  `                      <button onClick={() => downloadTXT(proj.session_id, proj.title ?? 'product')}
                        disabled={dlLoading === proj.session_id + '-txt'}
                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(6,182,212,0.3)', background:'rgba(6,182,212,0.06)', color:CYAN, fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                        {dlLoading === proj.session_id + '-txt' ? '...' : '⬇️ TXT'}
                      </button>`,
  ``
);

fs.writeFileSync('app/production/page.tsx', c);
console.log('TXT buttons removed');
