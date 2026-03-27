export interface Business {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  stamp_goal: number
  reward_description: string
  tagline: string | null
  created_at: string
}

export interface Customer {
  id: string
  business_id: string
  name: string
  email: string | null
  phone: string | null
  device_type: 'apple' | 'google' | 'web' | null
  pass_serial: string | null
  qr_code: string
  stamps: number
  total_stamps: number
  rewards_redeemed: number
  created_at: string
  last_stamp_at: string | null
}

export interface StampEvent {
  id: string
  customer_id: string
  business_id: string
  staff_id: string | null
  stamps_given: number
  note: string | null
  created_at: string
}

export interface RegisterFormData {
  name: string
  email: string
  phone: string
  device_type: 'apple' | 'google' | 'web'
}
