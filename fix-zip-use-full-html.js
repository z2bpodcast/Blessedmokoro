var fs = require('fs');
var c = fs.readFileSync('app/api/delivery/[token]/zip/route.ts', 'utf8');

// Replace inline HTML builder with full generate-html call
c = c.replace(
  /\/\/ 2\. HTML Reader — build inline[\s\S]*?\/\/ 3\. Workbook/,
  `// 2. HTML Reader — use full premium reader
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.z2blegacybuilders.co.za'
    const htmlRes = await fetch(baseUrl + '/api/generate-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: rec.session_id, builderBypass: true }),
    })
    if (htmlRes.ok) {
      const html = await htmlRes.text()
      zip.file('reader.html', html)
    }
  } catch(e) {
    console.error('HTML generation failed:', e)
  }

  // 3. Workbook`
);

fs.writeFileSync('app/api/delivery/[token]/zip/route.ts', c);
console.log('Done');
