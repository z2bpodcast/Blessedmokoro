import { supabase } from './supabase'

export async function checkMemberAccess(userId: string): Promise<{
  hasAccess: boolean
  status: string
  message?: string
}> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('status, membership_type')
      .eq('id', userId)
      .single()

    if (error) throw error

    if (profile.status === 'suspended') {
      return {
        hasAccess: false,
        status: 'suspended',
        message: 'Your account has been suspended. Please contact support for assistance.'
      }
    }

    if (profile.status === 'deleted') {
      return {
        hasAccess: false,
        status: 'deleted',
        message: 'This account has been deactivated. Please contact support if you believe this is an error.'
      }
    }

    return {
      hasAccess: true,
      status: profile.status
    }
  } catch (error) {
    console.error('Error checking member access:', error)
    return {
      hasAccess: false,
      status: 'error',
      message: 'An error occurred. Please try again.'
    }
  }
}

export async function updateLastLogin(userId: string) {
  try {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}
