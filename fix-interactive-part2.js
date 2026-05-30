var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

var startIdx = 10749;
var endLine  = 12204;

var newBlock = `    const rawContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')
    var outputLines = []
    var tableRows = []
    var lines2 = rawContent.split('\\n')
    for (var li = 0; li < lines2.length; li++) {
      var line = lines2[li]
      if (/^\\|/.test(line) && line.trim().endsWith('|')) {
        var cells = line.split('|').filter(function(x){return x.trim()})
        var isSep = cells.every(function(x){return /^[-: ]+$/.test(x)})
        if (!isSep) {
          var isHdr = tableRows.length===0
          tableRows.push('<tr>'+cells.map(function(cell,ci){
            var bg=isHdr?'background:var(--primary)15;font-weight:700;':(ci%2===0?'background:rgba(255,255,255,0.03);':'')
            return '<td style="padding:10px 14px;border:1px solid var(--primary)15;font-size:13px;'+bg+'">'+cell.trim()+'</td>'
          }).join('')+'</tr>')
        }
        continue
      }
      if (tableRows.length>0 && !/^\\|/.test(line)) {
        outputLines.push('<div style="overflow-x:auto;margin:16px 0;border-radius:10px;overflow:hidden;border:1px solid var(--primary)20;"><table style="width:100%;border-collapse:collapse;">'+tableRows.join('')+'</table></div>')
        tableRows=[]
      }
      if (/^### /.test(line)){outputLines.push('<h3 style="color:var(--primary);font-size:16px;font-weight:800;margin:24px 0 8px;">'+line.replace(/^### /,'')+'</h3>');continue}
      if (/^## /.test(line)){outputLines.push('<h2 style="color:var(--primary);font-size:20px;font-weight:900;margin:28px 0 10px;border-bottom:2px solid var(--primary)20;padding-bottom:8px;">'+line.replace(/^## /,'')+'</h2>');continue}
      if (/^# /.test(line)){outputLines.push('<h1 style="color:var(--primary);font-size:26px;font-weight:900;margin:32px 0 12px;">'+line.replace(/^# /,'')+'</h1>');continue}
      if (/^---/.test(line)){outputLines.push('<hr style="border:none;border-top:2px solid var(--primary)15;margin:28px 0;">');continue}
      if (/^[-*]\\s+/.test(line) && isCheck) {
        var txt=line.replace(/^[-*]\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        outputLines.push('<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--primary)08;"><span class="chk-'+i+'" onclick="toggleCheck(this,'+i+',999)" style="cursor:pointer;font-size:20px;flex-shrink:0;">&#9744;</span><span style="flex:1;line-height:1.7;">'+txt+'</span></div>')
        continue
      }
      if (/^[A-Z][^\\n]{2,60}:$/.test(line.trim())||/^[-*]\\s+[A-Z][^\\n]{2,50}:$/.test(line.trim())||/^\\d+\\.\\s+[A-Z][^\\n]{2,50}:$/.test(line.trim())) {
        var lbl=line.trim().replace(/^[-*\\d.]+\\s*/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        outputLines.push('<div style="margin:16px 0;"><label style="display:block;font-size:11px;font-weight:800;color:var(--primary);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">'+lbl+'</label><input type="text" placeholder="Write your answer here..." style="width:100%;padding:12px 16px;border-radius:10px;border:2px solid rgba(0,0,0,0.1);background:#fff;color:#1a1a2e;font-size:14px;outline:none;box-sizing:border-box;"/></div>')
        continue
      }
      if (/^[-*]\\s+/.test(line)){
        var txt2=line.replace(/^[-*]\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.+?)\\*/g,'<em>$1</em>')
        outputLines.push('<div style="display:flex;align-items:flex-start;gap:10px;padding:7px 0;"><span style="color:var(--primary);font-size:8px;margin-top:8px;flex-shrink:0;">&#9670;</span><span style="flex:1;line-height:1.7;">'+txt2+'</span></div>')
        continue
      }
      if (/^\\d+\\.\\s+/.test(line)){
        var num=line.match(/^(\\d+)\\./)[1]
        var txt3=line.replace(/^\\d+\\.\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        outputLines.push('<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid var(--primary)06;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+num+'</span><span style="flex:1;line-height:1.7;">'+txt3+'</span></div>')
        continue
      }
      if (!line.trim()){outputLines.push('<div style="height:6px;"></div>');continue}
      outputLines.push('<p style="margin:10px 0;line-height:1.8;font-size:14px;">'+line.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.+?)\\*/g,'<em>$1</em>')+'</p>')
    }
    if (tableRows.length>0) outputLines.push('<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;">'+tableRows.join('')+'</table></div>')
    var aContent = outputLines.join('\\n')`;

var before = c.slice(0, startIdx);
var after  = c.slice(endLine);
var result = before + newBlock + after;
fs.writeFileSync('app/api/generate-html/route.ts', result);
console.log('Done — lines: ' + result.split('\n').length);
