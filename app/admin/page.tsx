// app/admin/page.tsx
// Decoy — shows 404 to anyone who guesses /admin

export default function AdminDecoyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 900, color: '#e5e7eb', margin: 0 }}>404</h1>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>Page not found</p>
        <a href="/" style={{ color: '#7C3AED', fontSize: '0.9rem', marginTop: '1rem', display: 'inline-block' }}>
          ← Go home
        </a>
      </div>
    </div>
  )
}
