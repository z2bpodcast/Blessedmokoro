var fs = require('fs');

// ── FIX 1: Confirm button should show modal ────────────────
var g5 = fs.readFileSync('app/ai-income/gear/5/page.tsx', 'utf8');
g5 = g5.replace(
  '          <button onClick={handleConfirm}\n                  style={{ width:\'100%\', padding:\'16px\', borderRadius:\'14px\', border:\'none\', cursor:\'pointer\', background:\'linear-gradient(135deg,#D4AF37,#B8860B)\', color:\'#050A18\', fontWeight:900, fontSize:\'15px\', fontFamily:\'Cinzel,Georgia,serif\' }}>\n                  {isGear5Endpoint(tierId) ? \'✅ Bundle complete — Deliver My Product →\' : \'✅ Bundle approved — Move to Packaging →\'}',
  '          <button onClick={() => setShowCoverModal(true)}\n                  style={{ width:\'100%\', padding:\'16px\', borderRadius:\'14px\', border:\'none\', cursor:\'pointer\', background:\'linear-gradient(135deg,#D4AF37,#B8860B)\', color:\'#050A18\', fontWeight:900, fontSize:\'15px\', fontFamily:\'Cinzel,Georgia,serif\' }}>\n                  {isGear5Endpoint(tierId) ? \'✅ Bundle complete — Deliver My Product →\' : \'✅ Bundle approved — Move to Packaging →\'}'
);
fs.writeFileSync('app/ai-income/gear/5/page.tsx', g5);
console.log('Fix 1: Cover modal trigger done');

// ── FIX 2: HTML reader audio starts at Chapter 1 ──────────
var html = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');
html = html.replace(
  'window.addEventListener(\'load\',function(){initAudio();});',
  'window.addEventListener(\'load\',function(){initAudio();if(totalChapters>0)selectChapter(0);});'
);
fs.writeFileSync('app/api/generate-html/route.ts', html);
console.log('Fix 2: Audio starts at Chapter 1');

// ── FIX 3: Increase content depth to 1000 words ───────────
var g3 = fs.readFileSync('lib/v3/gear3-engine.ts', 'utf8');
g3 = g3.replace(
  /Target: ~\${targetWords} words/g,
  'Target: ~${Math.max(targetWords, 1000)} words minimum — do NOT write less than 1000 words per section'
);
fs.writeFileSync('lib/v3/gear3-engine.ts', g3);
console.log('Fix 3: Content depth 1000 words minimum');

// ── FIX 5: Persona save — check what's happening ──────────
var ignition = fs.readFileSync('app/ai-income/ignition/page.tsx', 'utf8');
// Add domain field to persona save
ignition = ignition.replace(
  'body: JSON.stringify({ action: \'save\', persona: { ...finalPersona, personaName, personaSummary: summary } }),',
  'body: JSON.stringify({ action: \'save\', persona: { ...finalPersona, personaName: personaName || \'My Persona\', personaSummary: summary } }),'
);
fs.writeFileSync('app/ai-income/ignition/page.tsx', ignition);
console.log('Fix 5: Persona save fix');

