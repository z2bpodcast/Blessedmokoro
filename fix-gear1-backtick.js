var fs = require('fs');
var c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8');

// Fix the broken template literal — line 86 has wrong closing backtick
c = c.replace(
  "  const prompt = `${COACH_MANLAW_SYSTEM_PROMPT}`",
  "  const prompt = `${COACH_MANLAW_SYSTEM_PROMPT}"
);

fs.writeFileSync('lib/v3/gear1-engine.ts', c);
console.log('Done');
