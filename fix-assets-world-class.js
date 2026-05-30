var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Replace the asset section render
var oldReturn = `    return \`
    <section class="section" id="asset-\${i+1}" style="padding:32px 0;display:\${i===0?'block':'none'};">
      <div class="section-header">
        <div class="section-badge">
          <span class="section-num" style="font-size:22px;">\${icon}</span>
          <span class="section-label">Bonus \${i+1}</span>
        </div>
        <div class="section-progress-bar">
          <div class="section-progress-fill" style="width:\${Math.round(((i+1)/assetList.length)*100)}%"></div>
        </div>
      </div>
      <h2 class="section-title">\${aTitle}</h2>
      <div class="section-body">\${bodyHTML}</div>
    </section>\`
  }).join('') : ''`;

var newReturn = `    // Build input-enhanced body
    const interactiveBody = bodyHTML
      .replace(/<li style="([^"]*)">((?!<span)[^<]*)<\\/li>/g, function(match, style, text) {
        if (text.includes('_') || text.includes('[') || text.includes('example') || text.includes('Example') || text.includes('e.g.')) {
          return '<li style="'+style+'list-style:none;margin-bottom:12px;"><label style="display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;">'+text.replace(/\\[.*?\\]/g,'').replace(/_+/g,'').trim()+'</label><input type="text" placeholder="Type your answer here..." style="width:100%;padding:10px 14px;border-radius:8px;border:2px solid var(--primary)20;background:#fff;color:#111;font-size:13px;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--primary)\'" onblur="this.style.borderColor=\'var(--primary)20\'"/></li>'
        }
        return match
      })
      .replace(/<p>(.*?\\|.*?)<\\/p>/g, '$1')
    
    return \`
    <div id="asset-\${i+1}" style="display:\${i===0?'block':'none'};">

      <!-- Asset header card -->
      <div style="background:linear-gradient(135deg,var(--primary)12,var(--primary)06);border:1px solid var(--primary)25;border-radius:16px;padding:24px 28px;margin-bottom:28px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:var(--primary)08;"></div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
          <div style="width:52px;height:52px;border-radius:14px;background:var(--primary)18;border:1px solid var(--primary)30;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">\${icon}</div>
          <div>
            <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--primary);opacity:0.8;margin-bottom:4px;">Bonus Asset \${i+1} of \${assetList.length}</div>
            <h2 style="font-family:var(--font-serif);font-size:clamp(16px,3vw,22px);font-weight:900;color:var(--text);margin:0;">\${aTitle}</h2>
          </div>
        </div>
        <!-- Progress bar -->
        <div style="height:4px;background:var(--primary)15;border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:\${Math.round(((i+1)/assetList.length)*100)}%;background:var(--primary);border-radius:2px;transition:width 0.5s;"></div>
        </div>
        <div style="font-size:10px;color:var(--primary);margin-top:6px;opacity:0.7;">\${Math.round(((i+1)/assetList.length)*100)}% through bonus materials</div>
      </div>

      <!-- Asset content -->
      <div style="background:var(--surface);border:1px solid var(--primary)12;border-radius:14px;padding:28px;margin-bottom:24px;">
        \${interactiveBody}
      </div>

      <!-- Bottom navigation -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--primary)15;margin-top:8px;gap:12px;">
        \${i > 0 ? \`<button onclick="selectAsset(\${i-1})" style="padding:10px 20px;border-radius:10px;border:1px solid var(--primary)30;background:transparent;color:var(--primary);font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;">← \${assetList[i-1].title||'Previous'}</button>\` : '<div></div>'}
        <div style="font-size:11px;color:var(--muted);">\${i+1} / \${assetList.length}</div>
        \${i < assetList.length-1 ? \`<button onclick="selectAsset(\${i+1})" style="padding:10px 20px;border-radius:10px;border:none;background:var(--primary);color:#fff;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;">\${assetList[i+1].title||'Next'} →</button>\` : '<div style="font-size:12px;color:var(--primary);font-weight:700;">✅ All assets complete!</div>'}
      </div>
    </div>\`
  }).join('') : ''`;

c = c.replace(oldReturn, newReturn);
fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done — lines: ' + c.split('\n').length);
