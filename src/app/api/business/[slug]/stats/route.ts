import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, name, slug, logo_url, primary_color, secondary_color, accent_color, stamp_goal, reward_description, tagline, admin_password, stamp_icon, strip_image_url')
    .eq('slug', slug)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const cookie = req.cookies.get(`admin_auth_${slug}`)
  const correctPassword = business.admin_password || process.env.ADMIN_PASSWORD
  if (!cookie || cookie.value !== correctPassword) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const now = new Date().toISOString()
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    customersRes, stampsRes, rewardsRes, recentRes,
    newCustomersRes, activeCustomersRes,
    stampsMonthRes, rewardsMonthRes, stamps7dRes,
    availableRewardsRes, expiringSoonRes, expiredTotalRes, rewardsByCustomerRes,
  ] = await Promise.all([
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
    supabaseAdmin.from('stamp_events').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
    supabaseAdmin.from('reward_events').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
    supabaseAdmin.from('customers')
      .select('id, name, email, phone, stamps, total_stamps, rewards_redeemed, created_at, last_stamp_at')
      .eq('business_id', business.id)
      .order('last_stamp_at', { ascending: false, nullsFirst: false })
      .limit(50),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id).gte('created_at', thirtyDaysAgo),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id).gte('last_stamp_at', thirtyDaysAgo),
    supabaseAdmin.from('stamp_events').select('id', { count: 'exact', head: true }).eq('business_id', business.id).gte('created_at', thirtyDaysAgo),
    supabaseAdmin.from('reward_events').select('id', { count: 'exact', head: true }).eq('business_id', business.id).gte('created_at', thirtyDaysAgo),
    supabaseAdmin.from('stamp_events').select('created_at').eq('business_id', business.id).gte('created_at', sevenDaysAgo),
    supabaseAdmin.from('pending_rewards').select('id', { count: 'exact', head: true }).eq('business_id', business.id).eq('status', 'available').gt('expires_at', now),
    supabaseAdmin.from('pending_rewards').select('id', { count: 'exact', head: true }).eq('business_id', business.id).eq('status', 'available').gt('expires_at', now).lte('expires_at', sevenDaysFromNow),
    supabaseAdmin.from('pending_rewards').select('id', { count: 'exact', head: true }).eq('business_id', business.id).eq('status', 'expired'),
    supabaseAdmin.from('pending_rewards')
      .select('customer_id, expires_at, customers(name)')
      .eq('business_id', business.id)
      .eq('status', 'available')
      .gt('expires_at', now)
      .order('expires_at', { ascending: true }),
  ])

  // Agrupar premios disponibles por cliente (cuántos tiene c/u y cuál vence primero)
  const rewardsByCustomer = new Map<string, { customer_name: string; count: number; soonest_expires_at: string }>()
  for (const row of rewardsByCustomerRes.data ?? []) {
    const name = (row.customers as unknown as { name: string } | null)?.name ?? 'Cliente'
    const existing = rewardsByCustomer.get(row.customer_id)
    if (existing) {
      existing.count++
    } else {
      rewardsByCustomer.set(row.customer_id, { customer_name: name, count: 1, soonest_expires_at: row.expires_at })
    }
  }

  return NextResponse.json({
    business,
    total_customers: customersRes.count ?? 0,
    total_stamps: stampsRes.count ?? 0,
    total_rewards: rewardsRes.count ?? 0,
    recent_customers: recentRes.data ?? [],
    customers_this_month: newCustomersRes.count ?? 0,
    active_customers: activeCustomersRes.count ?? 0,
    stamps_this_month: stampsMonthRes.count ?? 0,
    rewards_this_month: rewardsMonthRes.count ?? 0,
    stamps_7d: stamps7dRes.data ?? [],
    pending_rewards: {
      available_total: availableRewardsRes.count ?? 0,
      expiring_soon: expiringSoonRes.count ?? 0,
      expired_total: expiredTotalRes.count ?? 0,
      by_customer: Array.from(rewardsByCustomer.values()),
    },
  })
}
