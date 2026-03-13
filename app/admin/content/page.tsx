'use client'

// app/admin/content/page.tsx
// Content manager placeholder

import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminContentPage() {
  const router = useRouter()

  const checkAccess = useCallback(async () => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('z2b_cmd_auth') !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k'); return }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/z2b-command-7x9k'); return }
    const { data: profile } = await supabase.from('profiles').select('user_role').eq('id', user.id).single()
    if (!['ceo','superadmin','admin','content_admin'].includes(String(profile?.user_role||''))) { router.push('/dashboard'); return }
  }, [router])

  useEffect(() => { checkAccess() }, [checkAccess])

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)' }}
        className="border-b-4 border-yellow-400 shadow-xl px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white">📝 Content Manager</h1>
            <p className="text-purple-300 text-sm">Workshop sessions · Lessons · Resources</p>
          </div>
          <a href="/z2b-command-7x9k/hub" className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold text-sm">← Admin Hub</a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border-2 border-green-200 shadow-sm p-12 max-w-lg mx-auto">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Content Manager</h2>
          <p className="text-gray-500 mb-6">Create and manage workshop sessions, lessons, mirror moments and transformation activities. Coming in the next build phase.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/workshop" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm">
              👁️ Preview Workshop →
            </a>
            <a href="/z2b-command-7x9k/hub" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm">
              ← Admin Hub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}