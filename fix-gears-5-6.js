const fs = require('fs')

// ── FIX 1: Gear 5 — add hasRun guard to sessionStorage so it doesn't re-run ──
const g5path = 'app/ai-income/gear/5/page.tsx'
let g5 = fs.readFileSync(g5path, 'utf8')

// The problem: hasRun.current is reset when page remounts
// Fix: also check sessionStorage for completion flag
if (!g5.includes('v3_gear5_complete')) {
  g5 = g5.replace(
    "if (!hasRun.current) {\n        hasRun.current = true\n        await fetchDirectiveAndBuild(token, loadedIntent, loadedDraft, sid)",
    `// Check if gear 5 already completed this session
      const g5done = sessionStorage.getItem('v3_gear5_complete_' + sid)
      if (g5done) {
        try {
          const saved = JSON.parse(g5done)
          setAssets(saved.assets ?? [])
          setBundle(saved.bundle ?? null)
          setStep('review')
          return
        } catch (_) {}
      }
      if (!hasRun.current) {
        hasRun.current = true
        await fetchDirectiveAndBuild(token, loadedIntent, loadedDraft, sid)`
  )
  fs.writeFileSync(g5path, g5, 'utf8')
  console.log('Gear 5: re-run guard added')
} else {
  console.log('Gear 5: already has re-run guard')
}

// ── FIX 2: Gear 6 — add DB fallback for load ──
const g6path = 'app/ai-income/gear/6/page.tsx'
let g6 = fs.readFileSync(g6path, 'utf8')

if (g6.includes('load_from_db')) {
  console.log('Gear 6: DB fallback already present')
} else {
  const old6 = `      if (!loadedIntent || !loadedDraft || !sid) {
        setErrorMsg('Could not load product data. Please return to Gear 5. (Tip: try refreshing — your work is saved)')
        setStep('error')
        return
      }`

  const new6 = `      // DB fallback — load from database if sessionStorage was cleared
      if ((!loadedIntent || !loadedDraft) && sid) {
        try {
          const dbRes = await fetch('/api/gear/6', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ action: 'load_from_db', sessionId: sid }),
          })
          const dbData = await dbRes.json()
          if (dbData.intent && !loadedIntent) {
            loadedIntent = dbData.intent
            sessionStorage.setItem('v3_gear1_intent', JSON.stringify(dbData.intent))
          }
          if (dbData.draft && !loadedDraft) {
            loadedDraft = dbData.draft
            sessionStorage.setItem('v3_gear3_draft', JSON.stringify(dbData.draft))
          }
        } catch (_) {}
      }

      if (!loadedIntent || !loadedDraft || !sid) {
        setErrorMsg('Could not load product data. Please return to Gear 5.')
        setStep('error')
        return
      }`

  if (g6.includes(old6)) {
    g6 = g6.replace(old6, new6)
    fs.writeFileSync(g6path, g6, 'utf8')
    console.log('Gear 6: DB fallback added')
  } else {
    console.log('Gear 6: pattern not found — showing context')
    const idx = g6.indexOf('Please return to Gear 5')
    console.log(g6.slice(Math.max(0,idx-200), idx+100))
  }
}

// ── FIX 3: Gear API — add load_from_db to Gear 6 handler ──
const apipath = 'app/api/gear/[gear]/route.ts'
let api = fs.readFileSync(apipath, 'utf8')

// Find gear 6 valid actions and add load_from_db
if (api.includes("'finalize', 'load_from_db'")) {
  console.log('API Gear 6: already has load_from_db')
} else {
  // Find gear 6 valid actions line
  api = api.replace(
    "const validActions = ['generate_listing', 'adjust_listing', 'generate_pkg', 'finalize']",
    "const validActions = ['generate_listing', 'adjust_listing', 'generate_pkg', 'finalize', 'load_from_db']"
  )
  
  // Add load_from_db handler after the validActions check in gear 6
  const g6marker = "const validActions = ['generate_listing', 'adjust_listing', 'generate_pkg', 'finalize', 'load_from_db']"
  const g6insert = `${g6marker}

  if (action === 'load_from_db') {
    const sbL = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
    const sid6 = body.sessionId as string
    const { data: gs6 } = await (sbL.from as any)('gear_sessions').select('intent_data, content_draft').eq('id', sid6).maybeSingle() as { data: any }
    if (!gs6) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    const intent = gs6.intent_data ? (typeof gs6.intent_data === 'string' ? JSON.parse(gs6.intent_data) : gs6.intent_data) : null
    const draft  = gs6.content_draft ? (typeof gs6.content_draft === 'string' ? JSON.parse(gs6.content_draft) : gs6.content_draft) : null
    return NextResponse.json({ intent, draft })
  }`

  api = api.replace(g6marker, g6insert)
  fs.writeFileSync(apipath, api, 'utf8')
  console.log('API Gear 6: load_from_db added')
}

console.log('\nAll fixes applied. Now check what the publish error is.')
