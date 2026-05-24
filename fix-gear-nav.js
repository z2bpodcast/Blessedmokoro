var fs = require('fs');
[1,2,3,4,5,6,7].forEach(function(g) {
  var path = 'app/ai-income/gear/' + g + '/page.tsx';
  try {
    var c = fs.readFileSync(path, 'utf8');
    // Add back button to the nav bar
    c = c.replace(
      "<div style={{ padding:'12px 20px', background:SURF, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>",
      "<div style={{ padding:'12px 20px', background:SURF, borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:16 }}>\n      <a href='/dashboard' style={{ fontSize:11, color:'#94A3B8', textDecoration:'none', fontWeight:700, whiteSpace:'nowrap' }}>← Dashboard</a>\n      <a href='/ai-income' style={{ fontSize:11, color:'#D4AF37', textDecoration:'none', fontWeight:700, whiteSpace:'nowrap' }}>4M Machine</a>"
    );
    fs.writeFileSync(path, c);
    console.log('Gear ' + g + ' done');
  } catch(e) {
    console.log('Gear ' + g + ' error:', e.message);
  }
});
