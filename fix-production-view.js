var fs = require('fs');
var c = fs.readFileSync('app/production/page.tsx', 'utf8');

c = c.replace(
  `                    <a href={'/marketplace'} style={{ padding:'7px 14px', borderRadius:8, background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontSize:11, fontWeight:700, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                      View →
                    </a>`,
  `<button onClick={() => downloadTXT(p.session_id, p.title)}
                      style={{ padding:'7px 14px', borderRadius:8, background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                      📦 Package
                    </button>
                    <button onClick={() => downloadHTML(p.session_id, p.title)}
                      style={{ padding:'7px 14px', borderRadius:8, background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#06B6D4', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                      📖 HTML Reader
                    </button>`
);

fs.writeFileSync('app/production/page.tsx', c);
console.log('Fix 1 done');
