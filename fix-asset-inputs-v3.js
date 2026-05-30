var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Find the assetsHTML builder and add input detection
// Assets content is built in the assetsHTML section
// We need to transform lines ending with : into premium inputs

var oldAssetContent = "const assetsHTML = assetList.length > 0 ? assetList.map((a: any, i: number) => {";

// Add a helper function before assetsHTML
var helperFunc = `// ── ASSET INPUT TRANSFORMER ─────────────────────────────
  function buildAssetBody(content: string, isChecklist: boolean): string {
    const lines = content.split('\\n')
    const out: string[] = []
    for (const line of lines) {
      if (!line.trim()) { out.push('<div style="height:6px"></div>'); continue }
      // Heading
      if (/^###/.test(line)) { out.push(\`<h3 style="color:var(--primary);font-size:16px;font-weight:800;margin:20px 0 8px;">\${line.replace(/^###\\s*/,'')}</h3>\`); continue }
      if (/^##/.test(line))  { out.push(\`<h2 style="color:var(--primary);font-size:20px;font-weight:900;margin:24px 0 10px;border-bottom:2px solid var(--primary)20;padding-bottom:8px;">\${line.replace(/^##\\s*/,'')}</h2>\`); continue }
      if (/^#/.test(line))   { out.push(\`<h1 style="color:var(--primary);font-size:24px;font-weight:900;margin:28px 0 12px;">\${line.replace(/^#\\s*/,'')}</h1>\`); continue }
      if (/^---/.test(line)) { out.push('<hr style="border:none;border-top:2px solid var(--primary)15;margin:24px 0;">'); continue }
      // Checklist item
      if (isChecklist && /^[-*]\\s+/.test(line)) {
        const txt = line.replace(/^[-*]\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        out.push(\`<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--primary)08;"><span onclick="this.textContent=this.textContent==='☐'?'✅':'☐'" style="cursor:pointer;font-size:20px;flex-shrink:0;">☐</span><span style="flex:1;line-height:1.7;">\${txt}</span></div>\`)
        continue
      }
      // Fillable label (ends with colon, short line)
      if (/^[-*\\d.\\s]*[A-Z][^\\n]{2,50}:$/.test(line.trim())) {
        const lbl = line.trim().replace(/^[-*\\d.]+\\s*/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        out.push(\`<div class="workbook-inline" style="margin:16px 0;"><div class="wb-prompt"><span class="wb-icon">✍️</span><strong>\${lbl}</strong></div><textarea class="wb-answer" placeholder="Write your answer here..." rows="3"></textarea><div class="wb-actions"><button class="wb-save" onclick="var s=this.nextElementSibling;s.style.display='inline';setTimeout(function(){s.style.display='none';},2000)">Save Answer</button><span class="wb-saved" style="display:none">✓ Saved</span></div></div>\`)
        continue
      }
      // Empty numbered slot (1. 2. 3. with no text)
      if (/^\\d+\\.\\s*$/.test(line.trim())) {
        const num = line.trim().replace(/\\..*$/,'')
        out.push(\`<div style="display:flex;align-items:center;gap:10px;margin:8px 0;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\${num}</span><div class="workbook-inline" style="margin:0;flex:1;"><textarea class="wb-answer" placeholder="Your answer \${num}..." rows="2"></textarea></div></div>\`)
        continue
      }
      // Regular list
      if (/^[-*]\\s+/.test(line)) {
        const txt = line.replace(/^[-*]\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.+?)\\*/g,'<em>$1</em>')
        out.push(\`<div style="display:flex;align-items:flex-start;gap:10px;padding:7px 0;"><span style="color:var(--primary);font-size:8px;margin-top:8px;flex-shrink:0;">◆</span><span style="flex:1;line-height:1.7;">\${txt}</span></div>\`)
        continue
      }
      // Numbered list with content
      if (/^\\d+\\.\\s+\\S/.test(line)) {
        const num = (line.match(/^(\\d+)\\./) || ['','1'])[1]
        const txt = line.replace(/^\\d+\\.\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        out.push(\`<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid var(--primary)06;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\${num}</span><span style="flex:1;line-height:1.7;">\${txt}</span></div>\`)
        continue
      }
      // Normal paragraph
      out.push(\`<p style="margin:10px 0;line-height:1.8;font-size:14px;">\${line.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.+?)\\*/g,'<em>$1</em>')}</p>\`)
    }
    return out.join('\\n')
  }

  `;

c = c.replace(oldAssetContent, helperFunc + oldAssetContent);

// Now use buildAssetBody in the asset renderer
c = c.replace(
  "const aContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')\n    const items    = aContent.split('\\n').filter((l: string) => l.trim())\n    const isList   = items.length > 2\n    const isCheck  = aTitle.toLowerCase().includes('checklist')",
  "const rawAssetContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')\n    const isCheck  = aTitle.toLowerCase().includes('checklist')\n    const aContent = buildAssetBody(rawAssetContent, isCheck)\n    const items: string[] = []\n    const isList   = false"
);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done — lines: ' + c.split('\n').length);
