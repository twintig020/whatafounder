export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          current_day: number
          last_session_date: string | null
          streak: number
          onboarding_completed: boolean
          has_purchased: boolean
          push_subscription: Json | null
          referral_code: string | null
          discount_token: string | null
          discount_token_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          current_day?: number
          last_session_date?: string | null
          streak?: number
          onboarding_completed?: boolean
          has_purchased?: boolean
          push_subscription?: Json | null
          referral_code?: string | null
          discount_token?: string | null
          discount_token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          current_day?: number
          last_session_date?: string | null
          streak?: number
          onboarding_completed?: boolean
          has_purchased?: boolean
          push_subscription?: Json | null
          referral_code?: string | null
          discount_token?: string | null
          discount_token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          id: string
          user_id: string
          data_storage: boolean
          ai_processing: boolean
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data_storage: boolean
          ai_processing?: boolean
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data_storage?: boolean
          ai_processing?: boolean
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          day: number
          order_index: number
          type: 'likert' | 'forced_choice' | 'reflection'
          dimension: string
          text: string
          context_text: string | null
          option_a: string | null
          option_b: string | null
          scale_min: number | null
          scale_max: number | null
          reverse_scored: boolean
          created_at: string
        }
        Insert: {
          id?: string
          day: number
          order_index: number
          type: 'likert' | 'forced_choice' | 'reflection'
          dimension: string
          text: string
          context_text?: string | null
          option_a?: string | null
          option_b?: string | null
          scale_min?: number | null
          scale_max?: number | null
          reverse_scored?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          day?: number
          order_index?: number
          type?: 'likert' | 'forced_choice' | 'reflection'
          dimension?: string
          text?: string
          context_text?: string | null
          option_a?: string | null
          option_b?: string | null
          scale_min?: number | null
          scale_max?: number | null
          reverse_scored?: boolean
          created_at?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          day: number
          raw_value: string
          scored_value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          day: number
          raw_value: string
          scored_value?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          day?: number
          raw_value?: string
          scored_value?: number | null
          created_at?: string
        }
        Relationships: []
      }
      dimension_scores: {
        Row: {
          id: string
          user_id: string
          dimension: string
          score: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dimension: string
          score: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dimension?: string
          score?: number
          updated_at?: string
        }
        Relationships: []
      }
      founder_profiles: {
        Row: {
          id: string
          user_id: string
          archetype_key: string
          dimension_scores: Json
          reflection_quotes: Json
          extended_report: Json | null
          share_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          archetype_key: string
          dimension_scores: Json
          reflection_quotes: Json
          extended_report?: Json | null
          share_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          archetype_key?: string
          dimension_scores?: Json
          reflection_quotes?: Json
          extended_report?: Json | null
          share_code?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          id: string
          referrer_user_id: string
          referred_user_id: string | null
          referral_code: string
          clicked_at: string
          converted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_user_id: string
          referred_user_id?: string | null
          referral_code: string
          clicked_at?: string
          converted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_user_id?: string
          referred_user_id?: string | null
          referral_code?: string
          clicked_at?: string
          converted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: { [key: string]: never }
    Functions: { [key: string]: never }
    Enums: {
      question_type: 'likert' | 'forced_choice' | 'reflection'
    }
    CompositeTypes: { [key: string]: never }
  }
}
