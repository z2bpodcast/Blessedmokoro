var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// ── FIX 1: Remove price from cover and footer ─────────────────
c = c.replace(
  '<div class="cover-price-tag">${currency}${price}</div>',
  ''
);
c = c.replace(
  '    ${currency}${price} &nbsp;·&nbsp; ${FORMAT_LABEL[format] ?? \'Digital Product\'}<br>',
  '    ${FORMAT_LABEL[format] ?? \'Digital Product\'}<br>'
);

// ── FIX 2: Replace per-chapter audio with ONE global player ───
var OLD_AUDIO = `      \${sections.map((s: any, i: number) => {
        const sTitle = s.title ?? s.heading ?? \`Section \${i + 1}\`
        const raw    = String(s.content ?? s.text ?? s.body ?? '').replace(/<[^>]*>/g, '').slice(0, 2000)
        return \`
      <div class="audio-player" id="audio-\${i+1}">
        <div class="audio-section-title">\${i+1}. \${sTitle}</div>
        <div class="audio-controls">
          <button class="audio-btn audio-btn-primary" onclick="playSection(\${i+1})">▶ Play</button>
          <button class="audio-btn audio-btn-secondary" onclick="pauseSection()">⏸ Pause</button>
          <button class="audio-btn audio-btn-secondary" onclick="stopSection()">⏹ Stop</button>
          <div class="audio-speed">
            <span style="font-size:11px;color:var(--muted);margin-right:4px;">Speed:</span>
            <button class="speed-btn" onclick="setSpeed(0.75,this)">0.75×</button>
            <button class="speed-btn active" onclick="setSpeed(1,this)">1×</button>
            <button class="speed-btn" onclick="setSpeed(1.25,this)">1.25×</button>
            <button class="speed-btn" onclick="setSpeed(1.5,this)">1.5×</button>
          </div>
        </div>
        <div class="audio-text" id="audio-text-\${i+1}">\${raw.replace(/"/g, '&quot;')}</div>
      </div>\`
      }).join('')}`;

var NEW_AUDIO = `
      <!-- Single global audio player -->
      <div class="audio-player">
        <div class="audio-section-title" id="now-playing-title">Press Play to begin reading</div>
        <div class="audio-controls">
          <button class="audio-btn audio-btn-secondary" onclick="prevChapter()" id="btn-prev">⏮ Prev</button>
          <button class="audio-btn audio-btn-primary"   onclick="togglePlay()"  id="btn-play">▶ Play</button>
          <button class="audio-btn audio-btn-secondary" onclick="nextChapter()" id="btn-next">⏭ Next</button>
          <button class="audio-btn audio-btn-secondary" onclick="stopAudio()">⏹ Stop</button>
          <div class="audio-speed">
            <span style="font-size:11px;color:var(--muted);margin-right:4px;">Speed:</span>
            <button class="speed-btn" onclick="setSpeed(0.75,this)">0.75×</button>
            <button class="speed-btn active" onclick="setSpeed(1,this)">1×</button>
            <button class="speed-btn" onclick="setSpeed(1.25,this)">1.25×</button>
            <button class="speed-btn" onclick="setSpeed(1.5,this)">1.5×</button>
          </div>
        </div>
        <!-- Progress bar -->
        <div style="height:4px;border-radius:2px;background:var(--primary)20;margin-bottom:16px;">
          <div id="audio-progress" style="height:100%;border-radius:2px;background:var(--primary);width:0%;transition:width 0.3s;"></div>
        </div>
        <div class="audio-text" id="audio-text-display">Select a chapter below and press Play to listen.</div>
      </div>

      <!-- Chapter list -->
      <div style="display:flex;flex-direction:column;gap:8px;">
        \${sections.map((s: any, i: number) => {
          const sTitle = s.title ?? s.heading ?? \`Section \${i + 1}\`
          const raw    = String(s.content ?? s.text ?? s.body ?? '')
            .replace(/<[^>]*>/g, '')
            .replace(/\\s+/g, ' ')
            .trim()
          return \`
        <div class="audio-chapter-item" id="chapter-item-\${i}"
          onclick="selectChapter(\${i})"
          style="padding:12px 16px;border-radius:10px;border:1px solid var(--primary)20;cursor:pointer;display:flex;align-items:center;gap:12px;background:var(--surface);">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--primary)18;border:1px solid var(--primary)30;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:var(--primary);flex-shrink:0;">\${i+1}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:700;color:var(--text);">\${sTitle}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">\${Math.max(1,Math.round(raw.split(/\\s+/).length/200))} min read</div>
          </div>
          <div id="chapter-status-\${i}" style="font-size:11px;color:var(--muted);">▶</div>
        </div>
        <div id="chapter-text-\${i}" style="display:none;">\${raw.replace(/"/g,'&quot;')}</div>\`
        }).join('')}
      </div>`;

if (c.includes('sections.map((s: any, i: number) => {')) {
  c = c.replace(OLD_AUDIO, NEW_AUDIO);
  console.log('Audio player replaced');
} else {
  console.log('Audio pattern not found — check manually');
}

// ── FIX 3: Replace audio JS with global player logic ──────────
var OLD_JS = `// ── AUDIO READER ───────────────────────────────────────────
var synth       = window.speechSynthesis;
var utterance   = null;
var currentSpeed = 1;
function playSection(num) {
  if (synth.speaking) synth.cancel();
  var textEl = document.getElementById('audio-text-' + num);
  if (!textEl) return;
  utterance          = new SpeechSynthesisUtterance(textEl.innerText);
  utterance.rate     = currentSpeed;
  utterance.pitch    = 1;
  utterance.lang     = 'en-ZA';
  // Try South African English voice
  var voices = synth.getVoices();
  var zaVoice = voices.find(function(v) { return v.lang.includes('en-ZA') || v.lang.includes('en-GB'); });
  if (zaVoice) utterance.voice = zaVoice;
  synth.speak(utterance);
}
function pauseSection() {
  if (synth.speaking) {
    synth.paused ? synth.resume() : synth.pause();
  }
}
function stopSection() {
  if (synth.speaking) synth.cancel();
}
function setSpeed(speed, btn) {
  currentSpeed = speed;
  document.querySelectorAll('.speed-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  if (utterance) utterance.rate = speed;
}
// Load voices
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = function() { synth.getVoices(); };
}`;

var NEW_JS = `// ── GLOBAL AUDIO READER ────────────────────────────────────
var synth        = window.speechSynthesis;
var utterance    = null;
var currentSpeed = 1;
var currentChapter = -1;
var isPlaying    = false;
var totalChapters = document.querySelectorAll('[id^="chapter-text-"]').length;

function selectChapter(idx) {
  currentChapter = idx;
  // Update UI
  document.querySelectorAll('.audio-chapter-item').forEach(function(el,i) {
    el.style.borderColor = i === idx ? 'var(--primary)' : 'var(--primary)20';
    el.style.background  = i === idx ? 'var(--primary)12' : 'var(--surface)';
  });
  // Update now playing title
  var titleEl = document.querySelector('#chapter-item-' + idx + ' div:nth-child(2) div');
  if (titleEl) document.getElementById('now-playing-title').innerText = 'Chapter ' + (idx+1) + ': ' + titleEl.innerText;
  // Show text preview
  var textEl = document.getElementById('chapter-text-' + idx);
  var display = document.getElementById('audio-text-display');
  if (textEl && display) display.innerText = textEl.innerText.slice(0, 300) + '...';
  // Update progress
  var pct = totalChapters > 1 ? Math.round((idx / (totalChapters-1)) * 100) : 0;
  document.getElementById('audio-progress').style.width = pct + '%';
}

function getVoice() {
  var voices = synth.getVoices();
  return voices.find(function(v) { return v.lang.includes('en-ZA'); }) ||
         voices.find(function(v) { return v.lang.includes('en-GB'); }) ||
         voices.find(function(v) { return v.lang.includes('en'); }) ||
         null;
}

function speakChapter(idx) {
  if (idx < 0 || idx >= totalChapters) return;
  synth.cancel();
  selectChapter(idx);
  var textEl = document.getElementById('chapter-text-' + idx);
  if (!textEl) return;

  // Read chapter title first then content
  var titleEl = document.querySelector('#chapter-item-' + idx + ' div:nth-child(2) div');
  var titleText = titleEl ? 'Chapter ' + (idx+1) + '. ' + titleEl.innerText + '. ' : '';
  var fullText  = titleText + textEl.innerText;

  utterance       = new SpeechSynthesisUtterance(fullText);
  utterance.rate  = currentSpeed;
  utterance.pitch = 1;
  utterance.lang  = 'en-ZA';
  var voice = getVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = function() {
    document.getElementById('chapter-status-' + idx).innerText = '✓';
    isPlaying = false;
    document.getElementById('btn-play').innerText = '▶ Play';
    // Auto-play next chapter
    if (idx + 1 < totalChapters) {
      setTimeout(function() { speakChapter(idx + 1); }, 1500);
    }
  };

  synth.speak(utterance);
  isPlaying = true;
  document.getElementById('btn-play').innerText = '⏸ Pause';
  document.getElementById('chapter-status-' + idx).innerText = '🔊';
}

function togglePlay() {
  if (currentChapter < 0) {
    speakChapter(0);
    return;
  }
  if (synth.speaking) {
    if (synth.paused) {
      synth.resume();
      isPlaying = true;
      document.getElementById('btn-play').innerText = '⏸ Pause';
    } else {
      synth.pause();
      isPlaying = false;
      document.getElementById('btn-play').innerText = '▶ Resume';
    }
  } else {
    speakChapter(currentChapter);
  }
}

function nextChapter() {
  var next = currentChapter + 1;
  if (next < totalChapters) speakChapter(next);
}

function prevChapter() {
  var prev = currentChapter - 1;
  if (prev >= 0) speakChapter(prev);
}

function stopAudio() {
  synth.cancel();
  isPlaying = false;
  document.getElementById('btn-play').innerText = '▶ Play';
  document.getElementById('now-playing-title').innerText = 'Press Play to begin reading';
}

function setSpeed(speed, btn) {
  currentSpeed = speed;
  document.querySelectorAll('.speed-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  if (synth.speaking) {
    var idx = currentChapter;
    synth.cancel();
    setTimeout(function() { speakChapter(idx); }, 100);
  }
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = function() { getVoice(); };
}

// Auto-select first chapter
window.addEventListener('load', function() {
  totalChapters = document.querySelectorAll('[id^="chapter-text-"]').length;
  if (totalChapters > 0) selectChapter(0);
});`;

c = c.replace(OLD_JS, NEW_JS);
console.log('JS replaced');

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('All done!');
