const fs = require('fs')
const path = "app/api/gear/[gear]/route.ts"
let c = fs.readFileSync(path, 'utf8')
const marker = "import { runGear6,"
const addition = "import { runGear7, PLATFORMS } from '@/lib/v3/gear7-engine'\n"
if (c.includes("import { runGear7")) {
  console.log("Already imported")
} else {
  c = c.replace(marker, addition + marker)
  fs.writeFileSync(path, c, 'utf8')
  console.log("Fixed — runGear7 import added")
}
