var fs = require('fs');

// Create secure PIN check API
require('fs').mkdirSync('app/api/admin-auth', { recursive: true });
fs.writeFileSync('app/api/admin-auth/route.ts', `import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  const correct = process.env.ADMIN_PIN
  if (!correct) return NextResponse.json({ ok: false }, { status: 500 })
  if (pin !== correct) return NextResponse.json({ ok: false }, { status: 401 })
  return NextResponse.json({ ok: true })
}`);

// Fix gate page to use API
var gate = fs.readFileSync('app/z2b-command-7x9k/page.tsx', 'utf8');
gate = gate.replace(
  "const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || 'Z2B@2026'",
  "// PIN verified server-side"
);
gate = gate.replace(
  "    // Check PIN\n    if (pin !== ADMIN_PIN) {\n      setError('Invalid admin credentials')\n      setLoading(false)\n      return\n    }",
  `    // Check PIN server-side
    const pinRes = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    })
    if (!pinRes.ok) {
      setError('Invalid admin credentials')
      setLoading(false)
      return
    }`
);
fs.writeFileSync('app/z2b-command-7x9k/page.tsx', gate);
console.log('Done');
