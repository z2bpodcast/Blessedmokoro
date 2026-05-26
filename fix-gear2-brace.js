var fs = require('fs');
var lines = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8').split('\n');

// Find and remove the duplicate closing line
var fixed = [];
var found = false;
for (var i = 0; i < lines.length; i++) {
  // Skip the duplicate backtick-brace line (appears right before the function)
  if (lines[i] === '}`' && lines[i+1] === '}' && lines[i+2] && lines[i+2].includes('function buildRefinePrompt')) {
    if (!found) { fixed.push(lines[i]); found = true; }
    // skip the duplicate
  } else {
    fixed.push(lines[i]);
  }
}
fs.writeFileSync('lib/v3/gear2-engine.ts', fixed.join('\n'));
console.log('Done — lines: ' + fixed.length);
