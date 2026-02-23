'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Ban } from 'lucide-react'

export default function AccessDeniedPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="card border-4 border-red-400 shadow-2xl">
          <div className="bg-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Ban className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-red-800 mb-4">
            Access Denied
          </h1>
          
          <p className="text-gray-700 mb-6">
            Your account access has been restricted. This may be due to:
          </p>
          
          <ul className="text-left mb-6 space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              Account suspension by an administrator
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              Account deactivation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              Terms of service violation
            </li>
          </ul>

          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-primary-800 font-medium">
              If you believe this is an error, please contact our support team at:
              <br />
              <a href="mailto:support@z2btable.com" className="text-primary-600 font-bold hover:text-gold-600">
                support@z2btable.com
              </a>
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full btn-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
