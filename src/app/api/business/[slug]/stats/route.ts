import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, name, slug, logo_url, primary_color, secondary_color, accent_color, stamp_goal, reward_description, tagline, admin_password')
    .eq('slug', slug)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // Verificar auth con contraseña del negocio (o global como fallback)
  const cookie = req.cookies.get(`admin_auth_${slug}`)
  const correctPassword = business.admin_password || process.env.ADMIN_PASSWORD
  if (!cookie || cookie.value !== correctPassword) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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
      .limit(50),
  ])

  return NextResponse.json({
    business,
    total_customers: customersRes.count ?? 0,
    total_stamps: stampsRes.count ?? 0,
    total_rewards: rewardsRes.count ?? 0,
    recent_customers: recentRes.data ?? [],
  })
}
