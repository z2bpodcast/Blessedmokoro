var fs = require('fs');
var c = fs.readFileSync('app/api/delivery/[token]/zip/route.ts', 'utf8');

// Replace the fetch call with direct HTML generation
c = c.replace(
  `  // 2. HTML Reader
  const htmlRes = await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/generate-html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: rec.session_id, builderBypass: rec.builder_id }),
  })
  if (htmlRes.ok) {
    const html = await htmlRes.text()
    zip.file('reader.html', html)
  }`,
  `  // 2. HTML Reader — build inline
  try {
    const sections2 = content.sections ?? content.generatedSections ?? []
    const htmlLines: string[] = []
    htmlLines.push('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">')
    htmlLines.push('<meta name="viewport" content="width=device-width,initial-scale=1.0">')
    htmlLines.push('<title>' + title + '</title>')
    htmlLines.push('<style>body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px 20px;background:#050A18;color:#F0F9FF;line-height:1.8}h1{color:#D4AF37;font-size:2em;margin-bottom:8px}h2{color:#D4AF37;font-size:1.3em;margin-top:40px;border-bottom:1px solid rgba(212,175,55,0.3);padding-bottom:8px}p{margin-bottom:16px;color:#CBD5E1}.cover{text-align:center;padding:60px 0;border-bottom:2px solid rgba(212,175,55,0.3);margin-bottom:40px}.badge{display:inline-block;padding:4px 12px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);border-radius:20px;font-size:12px;color:#D4AF37;margin-bottom:16px}.footer{text-align:center;margin-top:60px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:#64748B}</style>')
    htmlLines.push('</head><body>')
    htmlLines.push('<div class="cover">')
    htmlLines.push('<div class="badge">Z2B 4M Digital Product</div>')
    htmlLines.push('<h1>' + title + '</h1>')
    if (intent.subtitle) htmlLines.push('<p style="font-style:italic;color:#94A3B8">' + intent.subtitle + '</p>')
    if (intent.authorName) htmlLines.push('<p>By <strong style="color:#D4AF37">' + intent.authorName + '</strong></p>')
    htmlLines.push('<p style="color:#64748B">' + sections2.length + ' chapters · Created with Z2B 4M Machine</p>')
    htmlLines.push('</div>')
    sections2.forEach((s: any, i: number) => {
      const sTitle = s.sectionTitle ?? s.title ?? ('Chapter ' + (i+1))
      const sContent = s.content ?? s.text ?? s.body ?? ''
      htmlLines.push('<h2>Chapter ' + (i+1) + ': ' + sTitle + '</h2>')
      sContent.split(/\n+/).filter((p: string) => p.trim()).forEach((p: string) => {
        htmlLines.push('<p>' + p.trim() + '</p>')
      })
    })
    htmlLines.push('<div class="footer">Created with Z2B 4M Digital Products Factory · app.z2blegacybuilders.co.za</div>')
    htmlLines.push('</body></html>')
    zip.file('reader.html', htmlLines.join('\n'))
  } catch(e) {
    zip.file('reader.html', '<html><body><h1>' + title + '</h1><p>Content unavailable</p></body></html>')
  }`
);

fs.writeFileSync('app/api/delivery/[token]/zip/route.ts', c);
console.log('Done');
