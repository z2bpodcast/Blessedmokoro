// FILE: app/z2b-command-7x9k/api-debug/page.tsx
'use client'
import { useEffect, useState } from 'react'

export default function ApiDebug() {
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch('/api/coach-manlaw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'DEBUG_TEST' }],
        tier: 'starter',
        debug: true,
      }),
    })
      .then(r => r.json())
      .then(d => setResult(d))
      .catch(e => setResult({ error: e.message }))
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', background: '#111', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff' }}>Coach Manlaw Debug</h1>
      <pre style={{ marginTop: '20px', fontSize: '14px' }}>
        {result ? JSON.stringify(result, null, 2) : 'Loading...'}
      </pre>
    </div>
  )
}
