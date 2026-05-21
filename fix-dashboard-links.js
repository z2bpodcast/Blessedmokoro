var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
c = c.replace("href:'/reader'", "href:'/z2b_reader.html'");
c = c.replace("href:'/audio-reader'", "href:'/z2b_audio_reader.html'");
c = c.replace("href:'/workbook'", "href:'/z2b_workbook.html'");
c = c.replace("href:'/flipbook'", "href:'/z2b_flipbook_v2.html'");
fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Done');
