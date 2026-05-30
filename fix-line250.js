var fs = require('fs');
var lines = fs.readFileSync('app/api/generate-html/route.ts', 'utf8').split('\n');
lines[249] = "        outputLines.push('<div class=\"workbook-inline\" style=\"margin:20px 0;\"><div class=\"wb-prompt\"><span class=\"wb-icon\">✍️</span><strong>'+lbl+'</strong></div><textarea class=\"wb-answer\" placeholder=\"Write your answer here...\" rows=\"3\"></textarea><div class=\"wb-actions\"><button class=\"wb-save\" onclick=\"var s=this.nextElementSibling;s.style.display=\\'inline\\';setTimeout(function(){s.style.display=\\'none\\';},2000)\">Save Answer</button><span class=\"wb-saved\" style=\"display:none\">✓ Saved</span></div></div>')";
fs.writeFileSync('app/api/generate-html/route.ts', lines.join('\n'));
console.log('Done');
