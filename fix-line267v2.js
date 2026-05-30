var fs = require('fs');
var lines = fs.readFileSync('app/api/generate-html/route.ts', 'utf8').split('\n');

lines[266] = '          return \'<li style="\'+style+\'list-style:none;margin-bottom:12px;"><label style="display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;">\'+text.replace(/\\[.*?\\]/g,"").replace(/_+/g,"").trim()+\'</label><input type="text" placeholder="Type your answer here..." class="asset-input" style="width:100%;padding:10px 14px;border-radius:8px;border:2px solid rgba(0,0,0,0.1);background:#fff;color:#111;font-size:13px;outline:none;box-sizing:border-box;"/></li>\'';

fs.writeFileSync('app/api/generate-html/route.ts', lines.join('\n'));
console.log('Done');
