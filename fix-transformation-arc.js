const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8')
c = c.replace(
  'transformationArc:raw.transformationArc || intent.promiseStatement,',
  'transformationArc:raw.transformationArc || intent.promiseStatement || "",'
)
fs.writeFileSync('lib/v3/gear2-engine.ts', c)
console.log('done')
