import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const businessSlug = 'eureka-burgers'

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('slug', businessSlug)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const [customersRes, stampsRes, rewardsRes, recentRes] = await Promise.all([
      supabaseAdmin
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id),
      supabaseAdmin
        .from('stamp_events')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id),
      supabaseAdmin
        .from('reward_events')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id),
      supabaseAdmin
        .from('customers')
        .select('id, name, stamps, total_stamps, rewards_redeemed, created_at, last_stamp_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    return NextResponse.json({
      total_customers: customersRes.count ?? 0,
      total_stamps: stampsRes.count ?? 0,
      total_rewards: rewardsRes.count ?? 0,
      recent_customers: recentRes.data ?? [],
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
