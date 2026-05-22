var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');

c = c.replace(
  "{/* ── RIVERS ── */}",
  `{/* ── ILLUSTRATION ── */}
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 20px 32px', textAlign:'center' }}>
          <img
            src="/income-rivers-illustration.svg"
            alt="The 4 Income Rivers — Garden of Eden"
            style={{ width:'100%', maxWidth:680, borderRadius:16, border:'1px solid rgba(212,175,55,0.2)' }}
          />
        </div>

      {/* ── RIVERS ── */}`
);

fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
