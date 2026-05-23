var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Replace old audio JS with new global player
c = c.replace(
`// ── AUDIO READER ───────────────────────────────────────────
var synth       = window.speechSynthesis;
var utterance   = null;
var currentSpeed = 1;`,
`// ── GLOBAL AUDIO PLAYER ─────────────────────────────────────
var synth          = window.speechSynthesis;
var utterance      = null;
var currentSpeed   = 1;
var currentChapter = -1;
var totalChapters  = 0;

function initAudio() {
  totalChapters = document.querySelectorAll('[id^="chapter-text-"]').length;
  if (totalChapters > 0) selectChapter(0);
}

function getVoice() {
  var voices = synth.getVoices();
  return voices.find(function(v){ return v.lang.includes('en-ZA'); }) ||
         voices.find(function(v){ return v.lang.includes('en-GB'); }) ||
         voices.find(function(v){ return v.lang.includes('en'); }) || null;
}

function selectChapter(idx) {
  currentChapter = idx;
  document.querySelectorAll('.audio-chapter-item').forEach(function(el, i) {
    el.style.borderColor = i===idx ? 'var(--primary)' : 'var(--primary)20';
    el.style.background  = i===idx ? 'var(--primary)12' : 'var(--surface)';
  });
  var titleEl = document.querySelector('#chapter-item-'+idx+' .ch-title');
  var nowPlaying = document.getElementById('now-playing-title');
  if (titleEl && nowPlaying) nowPlaying.innerText = 'Chapter '+(idx+1)+': '+titleEl.innerText;
  var textEl  = document.getElementById('chapter-text-'+idx);
  var display = document.getElementById('audio-text-display');
  if (textEl && display) display.innerText = textEl.innerText.slice(0,300)+'...';
  var pct = totalChapters > 1 ? Math.round((idx/(totalChapters-1))*100) : 0;
  var prog = document.getElementById('audio-progress');
  if (prog) prog.style.width = pct+'%';
}

function speakChapter(idx) {
  if (idx < 0 || idx >= totalChapters) return;
  synth.cancel();
  selectChapter(idx);
  var textEl  = document.getElementById('chapter-text-'+idx);
  var titleEl = document.querySelector('#chapter-item-'+idx+' .ch-title');
  if (!textEl) return;
  var titleText = titleEl ? 'Chapter '+(idx+1)+'. '+titleEl.innerText+'. ' : '';
  var fullText  = titleText + textEl.innerText;
  utterance       = new SpeechSynthesisUtterance(fullText);
  utterance.rate  = currentSpeed;
  utterance.pitch = 1;
  utterance.lang  = 'en-ZA';
  var voice = getVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = function() {
    var s = document.getElementById('chapter-status-'+idx);
    if (s) s.innerText = '✓';
    var btn = document.getElementById('btn-play');
    if (btn) btn.innerText = '▶ Play';
    if (idx+1 < totalChapters) setTimeout(function(){ speakChapter(idx+1); }, 1500);
  };
  synth.speak(utterance);
  var btn = document.getElementById('btn-play');
  if (btn) btn.innerText = '⏸ Pause';
  var s = document.getElementById('chapter-status-'+idx);
  if (s) s.innerText = '🔊';
}

function togglePlay() {
  if (currentChapter < 0) { speakChapter(0); return; }
  if (synth.speaking) {
    if (synth.paused) {
      synth.resume();
      var btn = document.getElementById('btn-play');
      if (btn) btn.innerText = '⏸ Pause';
    } else {
      synth.pause();
      var btn = document.getElementById('btn-play');
      if (btn) btn.innerText = '▶ Resume';
    }
  } else {
    speakChapter(currentChapter);
  }
}

function nextChapter() {
  if (currentChapter+1 < totalChapters) speakChapter(currentChapter+1);
}

function prevChapter() {
  if (currentChapter-1 >= 0) speakChapter(currentChapter-1);
}

function stopAudio() {
  synth.cancel();
  var btn = document.getElementById('btn-play');
  if (btn) btn.innerText = '▶ Play';
  var nowPlaying = document.getElementById('now
cat > fix-audio-class.js << 'EOF'
var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');
c = c.replace(
  '<div style="font-size:13px;font-weight:700;color:var(--text);">${sTitle}</div>',
  '<div class="ch-title" style="font-size:13px;font-weight:700;color:var(--text);">${sTitle}</div>'
);
fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
