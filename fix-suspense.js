var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');

// Wrap the main component in Suspense
c = c.replace(
  "export default function IncomeRiversPage() {",
  "function IncomeRiversInner() {"
);

c = c.replace(
  /^'use client'\n/,
  "'use client'\nimport { Suspense } from 'react'\n"
);

// Add export default with Suspense wrapper at the end
c = c.replace(
  /}\s*$(?![\s\S]*export default)/,
  `}

export default function IncomeRiversPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
        Loading...
      </div>
    }>
      <IncomeRiversInner />
    </Suspense>
  )
}`
);

fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
