var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

var oldLine = "const aContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')";
var newLine = "const rawContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')\n    const aContent = rawContent\n      .replace(/^### (.+)$/gm, '<h3 style=\"color:var(--primary);font-size:16px;margin:20px 0 8px;\">$1</h3>')\n      .replace(/^## (.+)$/gm, '<h2 style=\"color:var(--primary);font-size:20px;margin:28px 0 10px;\">$1</h2>')\n      .replace(/^# (.+)$/gm, '<h1 style=\"color:var(--primary);font-size:26px;margin:32px 0 12px;\">$1</h1>')\n      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')\n      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')\n      .replace(/^---+$/gm, '<hr style=\"border:none;border-top:1px solid rgba(0,0,0,0.1);margin:24px 0;\">')\n      .replace(/^- (.+)$/gm, '<li style=\"padding:6px 0;line-height:1.7;\">$1</li>')\n      .replace(/\\n\\n/g, '</p><p style=\"margin:12px 0;line-height:1.8;\">')";

c = c.replace(oldLine, newLine);
fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
