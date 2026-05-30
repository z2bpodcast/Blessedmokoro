var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// FIX 1: Fix text cleaning — add proper whitespace regex
c = c.replace(
  '.replace(/s+/g," ").trim();',
  '.replace(/\\s+/g," ").replace(/[\\u200B-\\u200D\\uFEFF]/g,"").trim();'
);

// FIX 2: Remove Listen tab button
c = c.replace(
  `      <button class="tab-btn"        onclick="switchTab('audio')"   role="tab">🎧 Listen</button>`,
  ``
);

// FIX 3: Add mini audio player to Read panel — find end of read panel opening
c = c.replace(
  '<div class="tab-panel active" id="panel-read">',
  `<div class="tab-panel active" id="panel-read">
  <!-- Mini audio player floating at top of Read tab -->
  <div id="mini-player" style="position:sticky;top:0;z-index:40;background:var(--surface);border-bottom:1px solid var(--primary)15;padding:10px 20px;display:flex;align-items:center;gap:12px;backdrop-filter:blur(12px);">
    <div style="flex:1;min-width:0;">
      <div id="mini-now-playing" style="font-size:11px;color:var(--primary);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Press Play to listen while reading</div>
      <div style="height:3px;background:var(--primary)15;border-radius:2px;margin-top:4px;">
        <div id="mini-progress" style="height:100%;background:var(--primary);width:0%;border-radius:2px;transition:width 0.3s;"></div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
      <button onclick="prevChapter()" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--primary)30;background:transparent;color:var(--primary);cursor:pointer;font-size:12px;">⏮</button>
      <button onclick="togglePlay()" id="btn-play" style="width:38px;height:38px;border-radius:50%;border:none;background:var(--primary);color:#fff;cursor:pointer;font-size:14px;font-weight:900;">▶</button>
      <button onclick="nextChapter()" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--primary)30;background:transparent;color:var(--primary);cursor:pointer;font-size:12px;">⏭</button>
      <button onclick="stopAudio()" style="width:30px;height:30px;border-radius:50%;border:1px solid rgba(0,0,0,0.15);background:transparent;color:var(--muted);cursor:pointer;font-size:12px;">⏹</button>
      <select onchange="setSpeed(parseFloat(this.value),null)" style="padding:4px 6px;border-radius:6px;border:1px solid var(--primary)20;background:transparent;color:var(--primary);font-size:11px;cursor:pointer;">
        <option value="0.75">0.75×</option>
        <option value="1" selected>1×</option>
        <option value="1.25">1.25×</option>
        <option value="1.5">1.5×</option>
      </select>
    </div>
  </div>`
);

// FIX 4: Update selectChapter to also update mini player
c = c.replace(
  "function selectChapter(idx){currentChapter=idx;document.querySelectorAll('.audio-chapter-item').forEach(function(el,i){el.style.borderColor=i===idx?'var(--primary)':'rgba(0,0,0,0.1)';el.style.background=i===idx?'rgba(var(--primary-rgb),0.08)':'var(--surface)';});var t=document.querySelector('#chapter-item-'+idx+' .ch-title');var np=document.getElementById('now-playing-title');if(t&&np)np.innerText='Chapter '+(idx+1)+': '+t.innerText;var tx=document.getElementById('chapter-text-'+idx);var dp=document.getElementById('audio-text-display');if(tx&&dp)dp.innerText=tx.innerText.slice(0,300)+'...';var pg=document.getElementById('audio-progress');if(pg)pg.style.width=(totalChapters>1?Math.round(idx/(totalChapters-1)*100):0)+'%';}",
  "function selectChapter(idx){currentChapter=idx;document.querySelectorAll('.audio-chapter-item').forEach(function(el,i){el.style.borderColor=i===idx?'var(--primary)':'rgba(0,0,0,0.1)';el.style.background=i===idx?'rgba(var(--primary-rgb),0.08)':'var(--surface)';});var t=document.querySelector('#chapter-item-'+idx+' .ch-title');var title=t?'Chapter '+(idx+1)+': '+t.innerText:'Chapter '+(idx+1);var np=document.getElementById('now-playing-title');if(np)np.innerText=title;var mn=document.getElementById('mini-now-playing');if(mn)mn.innerText=title;var tx=document.getElementById('chapter-text-'+idx);var dp=document.getElementById('audio-text-display');if(tx&&dp)dp.innerText=tx.innerText.slice(0,300)+'...';var pct=totalChapters>1?Math.round(idx/(totalChapters-1)*100):0;var pg=document.getElementById('audio-progress');if(pg)pg.style.width=pct+'%';var mp=document.getElementById('mini-progress');if(mp)mp.style.width=pct+'%';// Scroll to chapter in read tab\nvar sec=document.getElementById('sec'+(idx+1));if(sec)sec.scrollIntoView({behavior:'smooth',block:'start'});}"
);

// FIX 5: Update btn-play button in speakChapter to also update mini player btn
c = c.replace(
  "synth.speak(utterance);var b=document.getElementById(\"btn-play\");if(b)b.innerText=\"⏸ Pause\";",
  "synth.speak(utterance);var b=document.getElementById(\"btn-play\");if(b)b.textContent=\"⏸\";"
);
c = c.replace(
  "if(idx+1<totalChapters)setTimeout(function(){speakChapter(idx+1);},1500);};",
  "if(idx+1<totalChapters){setTimeout(function(){speakChapter(idx+1);},1000);}else{var bp=document.getElementById('btn-play');if(bp)bp.textContent='▶';}}"
);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done — lines: ' + c.split('\n').length);
