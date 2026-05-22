var fs = require('fs');
var c = fs.readFileSync('app/store/[slug]/academy/page.tsx', 'utf8');
c = c.split('canAccess && loadLesson(lesson)').join('canAccess && setSelLesson(lesson)');
fs.writeFileSync('app/store/[slug]/academy/page.tsx', c);
console.log('Done');
