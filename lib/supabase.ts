import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          referral_code: string
          referred_by: string | null
          created_at: string
          is_admin: boolean
          status: 'active' | 'suspended' | 'deleted'
          membership_type: 'free' | 'paid'
          subscription_end_date: string | null
          last_login: string | null
          total_referrals: number
        }
        Insert: {
          id: string
          email: string
          whatsapp_number: string | null
          full_name?: string | null
          referral_code: string
          referred_by?: string | null
          created_at?: string
          is_admin?: boolean
          status?: 'active' | 'suspended' | 'deleted'
          membership_type?: 'free' | 'paid'
          subscription_end_date?: string | null
          last_login?: string | null
          total_referrals?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          referral_code?: string
          referred_by?: string | null
          created_at?: string
          is_admin?: boolean
          status?: 'active' | 'suspended' | 'deleted'
          membership_type?: 'free' | 'paid'
          subscription_end_date?: string | null
          last_login?: string | null
          total_referrals?: number
        }
      }
      content: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'video' | 'audio' | 'pdf'
          file_url: string
          thumbnail_url: string | null
          is_public: boolean
          created_at: string
          created_by: string
          duration: number | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'video' | 'audio' | 'pdf'
          file_url: string
          thumbnail_url?: string | null
          is_public?: boolean
          created_at?: string
          created_by: string
          duration?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'video' | 'audio' | 'pdf'
          file_url?: string
          thumbnail_url?: string | null
          is_public?: boolean
          created_at?: string
          created_by?: string
          duration?: number | null
        }
      }
      referral_clicks: {
        Row: {
          id: string
          referrer_id: string
          ip_address: string | null
          user_agent: string | null
          content_id: string | null
          created_at: string
          converted: boolean
        }
        Insert: {
          id?: string
          referrer_id: string
          ip_address?: string | null
          user_agent?: string | null
          content_id?: string | null
          created_at?: string
          converted?: boolean
        }
        Update: {
          id?: string
          referrer_id?: string
          ip_address?: string | null
          user_agent?: string | null
          content_id?: string | null
          created_at?: string
          converted?: boolean
        }
      }
    }
  }
}
