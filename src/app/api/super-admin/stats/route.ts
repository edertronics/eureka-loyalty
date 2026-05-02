import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('super_admin_auth')
  if (!cookie || cookie.value !== process.env.SUPER_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Traer todos los negocios
    const { data: businesses, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('id, name, slug, logo_url, primary_color, secondary_color, accent_color, stamp_goal, reward_description, created_at')
      .order('created_at', { ascending: true })

    if (bizError || !businesses) {
      return NextResponse.json({ error: 'Error obteniendo negocios' }, { status: 500 })
    }

    // KPIs por negocio en paralelo
    const businessStats = await Promise.all(
      businesses.map(async (biz) => {
        const [customersRes, stampsRes, rewardsRes, recentRes] = await Promise.all([
          supabaseAdmin
            .from('customers')
            .select('id', { count: 'exact', head: true })
            .eq('business_id', biz.id),
          supabaseAdmin
            .from('stamp_events')
            .select('id', { count: 'exact', head: true })
            .eq('business_id', biz.id),
          supabaseAdmin
            .from('reward_events')
            .select('id', { count: 'exact', head: true })
            .eq('business_id', biz.id),
          supabaseAdmin
            .from('customers')
            .select('id, name, stamps, total_stamps, rewards_redeemed, created_at, last_stamp_at')
            .eq('business_id', biz.id)
            .order('created_at', { ascending: false })
            .limit(50),
        ])

        return {
          ...biz,
          total_customers: customersRes.count ?? 0,
          total_stamps: stampsRes.count ?? 0,
          total_rewards: rewardsRes.count ?? 0,
          customers: recentRes.data ?? [],
        }
      })
    )

    // Totales globales de la plataforma
    const platform_totals = {
      businesses: businessStats.length,
      customers: businessStats.reduce((acc, b) => acc + b.total_customers, 0),
      stamps: businessStats.reduce((acc, b) => acc + b.total_stamps, 0),
      rewards: businessStats.reduce((acc, b) => acc + b.total_rewards, 0),
    }

    return NextResponse.json({ platform_totals, businesses: businessStats })
  } catch (err) {
    console.error('Super admin stats error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
