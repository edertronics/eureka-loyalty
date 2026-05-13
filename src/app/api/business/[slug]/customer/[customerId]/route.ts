import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; customerId: string }> }
) {
  const { slug, customerId } = await params

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, admin_password')
    .eq('slug', slug)
    .single()

  if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const cookie = req.cookies.get(`admin_auth_${slug}`)
  const correctPassword = business.admin_password || process.env.ADMIN_PASSWORD
  if (!cookie || cookie.value !== correctPassword) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [customerRes, stampsRes, rewardsRes] = await Promise.all([
    supabaseAdmin
      .from('customers')
      .select('id, name, email, phone, stamps, total_stamps, rewards_redeemed, created_at, last_stamp_at')
      .eq('id', customerId)
      .eq('business_id', business.id)
      .single(),
    supabaseAdmin
      .from('stamp_events')
      .select('created_at, stamps_given')
      .eq('customer_id', customerId)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabaseAdmin
      .from('reward_events')
      .select('created_at')
      .eq('customer_id', customerId)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (!customerRes.data) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

  return NextResponse.json({
    customer: customerRes.data,
    stamps: stampsRes.data ?? [],
    rewards: rewardsRes.data ?? [],
  })
}
