// Patches the admin hub page to add CEO Competitions inline
// Run from repo root: node patch-admin-hub.js

const fs = require('fs')
const path = 'app/z2b-command-7x9k/page.tsx'
if (!fs.existsSync(path)) { console.log('SKIP: not found at', path); process.exit(0) }
let c = fs.readFileSync(path, 'utf8')
const orig = c

// 1. Add 'ceo-competitions' to the tab type and add to tabs array
c = c.replace(
  `const [activeTab,     setActiveTab]     = useState<'hub'|'staff'|'permissions'>('hub')`,
  `const [activeTab,     setActiveTab]     = useState<'hub'|'staff'|'permissions'|'ceo-competitions'>('hub')`
)

c = c.replace(
  `{ key:'permissions', label:'🔐 Permissions',  show: true },`,
  `{ key:'permissions',     label:'🔐 Permissions',     show: true },
              { key:'ceo-competitions', label:'🏅 CEO Competitions', show: ['ceo','superadmin','admin'].includes(myRole) },`
)

// 2. Add a quick-link card in NAV_SECTIONS (before the last item)
c = c.replace(
  `{ href:'/dashboard',           icon:'🏠', label:'My Dashboard',`,
  `{ href:'#ceo-competitions',    icon:'🏅', label:'CEO Competitions', desc:'Create and manage seasonal NSB competitions · Set duration · Edit or delete', roles:['ceo','superadmin','admin'], onClick: () => setActiveTab('ceo-competitions') },
  { href:'/dashboard',           icon:'🏠', label:'My Dashboard',`
)

// 3. Add the CEO Competitions tab panel before the closing of the tab area
// Find the end of the permissions tab
const permTabEnd = c.indexOf(`)}\n\n        {/* ── TAB: STAFF')
// Actually find after last tab panel
c = c.replace(
  `{/* ── TAB: STAFF & ROLES ── */}`,
  `{/* ── TAB: CEO COMPETITIONS ── */}
        {activeTab === 'ceo-competitions' && (
          <CeoCompetitionsInline supabase={supabase} />
        )}

        {/* ── TAB: STAFF & ROLES ── */}`
)

// 4. Add import for supabase if not already there and inline CeoCompetitions component
// Add component definition before the export default
const componentCode = `
// ── CEO Competitions inline component ────────────────────────────────────────

function CeoCompetitionsInline({ supabase: sb }: { supabase: any }) {
  const [comps,   setComps]   = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [form,    setForm]    = React.useState<any>(null)
  const [editId,  setEditId]  = React.useState<string|null>(null)
  const [saving,  setSaving]  = React.useState(false)
  const [error,   setError]   = React.useState('')

  React.useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await (sb.from as any)('ceo_competitions')
      .select('*').order('starts_at', { ascending: false })
    setComps(data ?? [])
    setLoading(false)
  }

  const blank = { title:'', description:'', bonus_type:'flat', bonus_value:0,
    starts_at: new Date().toISOString().slice(0,16),
    ends_at: new Date(Date.now()+30*86400000).toISOString().slice(0,16), is_active: true }

  async function save() {
    if (!form?.title?.trim() || !form.starts_at || !form.ends_at) { setError('Title and dates required.'); return }
    if (new Date(form.ends_at) <= new Date(form.starts_at)) { setError('End must be after start.'); return }
    setSaving(true); setError('')
    const payload = { ...form, starts_at: new Date(form.starts_at).toISOString(), ends_at: new Date(form.ends_at).toISOString() }
    if (editId) await (sb.from as any)('ceo_competitions').update(payload).eq('id', editId)
    else        await (sb.from as any)('ceo_competitions').insert(payload)
    setForm(null); setEditId(null); await load(); setSaving(false)
  }

  async function del(id: string) {
    if (!window.confirm('Delete this competition? This cannot be undone.')) return
    await (sb.from as any)('ceo_competitions').delete().eq('id', id)
    await load()
  }

  async function toggle(comp: any) {
    await (sb.from as any)('ceo_competitions').update({ is_active: !comp.is_active }).eq('id', comp.id)
    await load()
  }

  function duration(comp: any) {
    const s = new Date(comp.starts_at), e = new Date(comp.ends_at), now = new Date()
    const days = Math.ceil((e.getTime()-s.getTime())/86400000)
    if (now < s) return \`Starts \${s.toLocaleDateString('en-ZA')} · \${days}d\`
    if (now > e) return \`Ended \${e.toLocaleDateString('en-ZA')}\`
    return \`\${Math.ceil((e.getTime()-now.getTime())/86400000)} days left · ends \${e.toLocaleDateString('en-ZA')}\`
  }

  const inp = 'w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">🏅 CEO Competitions</h2>
          <p className="text-sm text-gray-500 mt-1">NSB is a seasonal CEO Competition — not a permanent income stream</p>
        </div>
        <button onClick={() => { setForm({...blank}); setEditId(null); setError('') }}
          className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-colors">
          + New Competition
        </button>
      </div>

      {form && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-6">
          <h3 className="font-black text-gray-900 mb-4">{editId ? 'Edit' : 'New'} CEO Competition</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Competition Title *</label>
              <input className={inp} value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Q2 New Builders Sprint" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
              <textarea className={inp} rows={2} value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Competition rules and prizes..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Bonus Type</label>
                <select className={inp} value={form.bonus_type} onChange={e => setForm({...form, bonus_type:e.target.value})}>
                  <option value="flat">Flat amount (ZAR)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Value ({form.bonus_type==='flat'?'R':'%'})</label>
                <input className={inp} type="number" value={form.bonus_value} onChange={e => setForm({...form, bonus_value:parseFloat(e.target.value)||0})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Start Date & Time *</label>
                <input className={inp} type="datetime-local" value={form.starts_at} onChange={e => setForm({...form, starts_at:e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">End Date & Time *</label>
                <input className={inp} type="datetime-local" value={form.ends_at} onChange={e => setForm({...form, ends_at:e.target.value})} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active:e.target.checked})} />
              Active — members can earn this NSB now
            </label>
            {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
            <div className="flex gap-3">
              <button onClick={save} disabled={saving} className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 disabled:opacity-60">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create Competition'}
              </button>
              <button onClick={() => { setForm(null); setEditId(null); setError('') }} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading competitions...</div>
      ) : comps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🏅</div>
          <p>No CEO Competitions yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comps.map(comp => (
            <div key={comp.id} className="bg-white rounded-2xl border-2 border-gray-200 p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-black text-gray-900 text-lg">{comp.title}</span>
                  <span className={\`text-xs font-bold px-3 py-1 rounded-full border \${comp.is_active ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-200'}\`}>
                    {comp.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{duration(comp)} · Bonus: {comp.bonus_type==='flat' ? \`R\${comp.bonus_value}\` : \`\${comp.bonus_value}%\`}</p>
                {comp.description && <p className="text-sm text-gray-600 line-clamp-2">{comp.description}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggle(comp)} className="px-3 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                  {comp.is_active ? 'Pause' : 'Activate'}
                </button>
                <button onClick={() => { setForm({ title:comp.title, description:comp.description, bonus_type:comp.bonus_type, bonus_value:comp.bonus_value, starts_at:comp.starts_at.slice(0,16), ends_at:comp.ends_at.slice(0,16), is_active:comp.is_active }); setEditId(comp.id); setError('') }}
                  className="px-3 py-1 rounded-lg border border-amber-300 text-xs text-amber-700 hover:bg-amber-50">
                  Edit
                </button>
                <button onClick={() => del(comp.id)} className="px-3 py-1 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

`

// Add React import if not present
if (!c.includes("import React")) {
  c = c.replace("'use client'", "'use client'\nimport React from 'react'")
}

// Insert component before export default
c = c.replace('// ─── Component ───', componentCode + '// ─── Component ───')

if (c !== orig) {
  fs.writeFileSync(path, c, 'utf8')
  console.log('✅ Admin hub updated with CEO Competitions tab')
  console.log('   Added: tab button, inline panel, quick-link card')
} else {
  console.log('-- No changes applied (check patterns)')
}
