const fs = require('fs')

// FIX 1: Auto-save — the upsert uses user.id but needs resolvedId
// Check current state of the upsert in gear API
let api = fs.readFileSync('app/api/gear/[gear]/route.ts', 'utf8')

// Find the saved_projects upsert and ensure resolvedId is used
const upsertIdx = api.indexOf("await (supabase.from as any)('saved_projects').upsert({")
if (upsertIdx > -1) {
  const snippet = api.slice(upsertIdx, upsertIdx + 300)
  console.log('Current upsert snippet:', snippet.slice(0, 200))
}

// The upsert needs builder_id to use resolvedId consistently
// Also add created_at to avoid NOT NULL violation
api = api.replace(
  "session_id:   sessionId,\n                builder_id:   resolvedId ?? user.id,\n                title,\n                current_gear: gearNumber,\n                status:       gearNumber >= 6 ? 'complete' : 'draft',\n                updated_at:   new Date().toISOString(),",
  "session_id:   sessionId,\n                builder_id:   resolvedId ?? user.id,\n                title,\n                current_gear: gearNumber,\n                status:       gearNumber >= 6 ? 'complete' : 'draft',\n                updated_at:   new Date().toISOString(),\n                created_at:   new Date().toISOString(),"
)

fs.writeFileSync('app/api/gear/[gear]/route.ts', api)
console.log('✅ Auto-save: created_at added to upsert')

// FIX 2: Add logout button to nav on key pages
const pagesToFix = [
  'app/dashboard/page.tsx',
  'app/ai-income/page.tsx',
]

pagesToFix.forEach(path => {
  try {
    let p = fs.readFileSync(path, 'utf8')
    
    // Add logout button next to existing nav buttons
    if (!p.includes('Sign Out') && !p.includes('logout') && !p.includes('signOut')) {
      p = p.replace(
        "import { supabase } from '@/lib/supabase'",
        "import { supabase } from '@/lib/supabase'"
      )
      
      // Add logout handler after useState declarations
      p = p.replace(
        "const [user,",
        `async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
  const [user,`
      )
      
      // Add logout button to nav
      p = p.replace(
        "← 4M Machine</Link>",
        "← 4M Machine</Link>"
      )
      
      // Find the nav and add logout
      p = p.replace(
        "href=\"/ai-income/ignition\" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD",
        `onClick={handleLogout} style={{ padding: '7px 12px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: MUTED, fontSize: '11px', cursor: 'pointer', fontFamily: 'Georgia,serif', marginRight: '8px' }}>
              Sign Out
            </button>
            <Link href="/ai-income/ignition" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD`
      )
      
      fs.writeFileSync(path, p)
      console.log(`✅ Logout added to: ${path}`)
    } else {
      console.log(`⚠️  Logout already exists in: ${path}`)
    }
  } catch(e) {
    console.log(`Skip: ${path} — ${e.message}`)
  }
})
