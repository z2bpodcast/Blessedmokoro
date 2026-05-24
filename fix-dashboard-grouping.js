var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Replace flat product list with grouped by month
c = c.replace(
  `            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {projects.slice(0, 5).map(proj => (`,
  `            {/* Group by month */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {Object.entries(
                projects.reduce((acc: any, proj: any) => {
                  const month = new Date(proj.created_at).toLocaleDateString('en-ZA', { month:'long', year:'numeric' })
                  if (!acc[month]) acc[month] = []
                  acc[month].push(proj)
                  return acc
                }, {})
              ).map(([month, monthProjs]: any) => (
                <div key={month} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:8, paddingBottom:4, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    {month} · {monthProjs.length} product{monthProjs.length !== 1 ? 's' : ''}
                  </div>
                  {monthProjs.map((proj: any) => (`
);

// Close the new grouping
c = c.replace(
  `                </div>\n              ))}\n              {projects.length > 5 &&`,
  `                  </div>\n                ))}\n                </div>\n              ))}\n              {projects.length > 10 &&`
);

fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Fix 3 done');
