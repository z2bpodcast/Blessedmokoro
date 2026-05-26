var fs = require('fs');
var lines = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8').split('\n');

// Find the line with just '}` ' and insert '}' after it before buildRefinePrompt
for (var i = 0; i < lines.length; i++) {
  if (lines[i] === '}`' && lines[i+1] && lines[i+1].startsWith('function buildRefinePrompt')) {
    lines.splice(i+1, 0, '}');
    console.log('Inserted at line', i+2);
    break;
  }
}

fs.writeFileSync('lib/v3/gear2-engine.ts', lines.join('\n'));
console.log('Done — lines: ' + lines.length);
