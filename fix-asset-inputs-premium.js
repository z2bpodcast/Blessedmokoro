var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Replace the plain input with premium workbook-style card
c = c.replace(
  `outputLines.push('<div style="margin:16px 0;"><label style="display:block;font-size:11px;font-weight:800;color:var(--primary);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">'+lbl+'</label><input type="text" placeholder="Write your answer here..." style="width:100%;padding:12px 16px;border-radius:10px;border:2px solid rgba(0,0,0,0.1);background:#fff;color:#1a1a2e;font-size:14px;outline:none;box-sizing:border-box;"/></div>')`,
  `outputLines.push('<div class="workbook-inline" style="margin:20px 0;"><div class="wb-prompt"><span class="wb-icon">✍️</span><strong>'+lbl+'</strong></div><textarea class="wb-answer" placeholder="Write your answer here..." rows="3"></textarea><div class="wb-actions"><button class="wb-save" onclick="this.nextElementSibling.style.display=\'inline\';setTimeout(()=>this.nextElementSibling.style.display=\'none\',2000)">Save Answer</button><span class="wb-saved" style="display:none">✓ Saved</span></div></div>')`
);

// Replace numbered input with premium numbered card
c = c.replace(
  `outputLines.push('<div style="margin:16px 0;"><label style="display:block;font-size:11px;font-weight:800;color:var(--primary);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">'+label2.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')+'</label><input type="text" placeholder="Write your answer here..." style="width:100%;padding:12px 16px;border-radius:10px;border:2px solid var(--primary)20;background:#fff;color:#1a1a2e;font-size:14px;outline:none;box-sizing:border-box;" /></div>')`,
  `outputLines.push('<div class="workbook-inline" style="margin:20px 0;"><div class="wb-prompt"><span class="wb-icon">✍️</span><strong>'+label2.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')+'</strong></div><textarea class="wb-answer" placeholder="Write your answer here..." rows="3"></textarea><div class="wb-actions"><button class="wb-save" onclick="this.nextElementSibling.style.display=\'inline\';setTimeout(()=>this.nextElementSibling.style.display=\'none\',2000)">Save Answer</button><span class="wb-saved" style="display:none">✓ Saved</span></div></div>')`
);

// Upgrade numbered list items that are clearly answer slots (1. 2. 3. with no content)
c = c.replace(
  `outputLines.push('<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid var(--primary)06;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+num+'</span><span style="flex:1;line-height:1.7;">'+txt3+'</span></div>')`,
  `var isEmpty3 = !txt3.trim() || txt3.trim().length < 5;
        if (isEmpty3) {
          outputLines.push('<div style="display:flex;align-items:center;gap:10px;margin:8px 0;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+num+'</span><input type="text" placeholder="Your answer '+num+'..." style="flex:1;padding:10px 14px;border-radius:10px;border:2px solid var(--primary)15;background:var(--surface);color:var(--text);font-size:14px;outline:none;" /></div>')
        } else {
          outputLines.push('<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid var(--primary)06;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+num+'</span><span style="flex:1;line-height:1.7;">'+txt3+'</span></div>')
        }`
);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
