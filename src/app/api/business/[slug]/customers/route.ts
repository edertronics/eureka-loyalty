import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const PAGE_SIZE = 20

// Lista de clientes con búsqueda y paginación del lado del servidor.
// Escala a miles de clientes: no carga todo, solo la página pedida.
// Query params: ?search= &sort=activity|registered &page=0
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, admin_password, stamp_goal')
    .eq('slug', slug)
    .single()

  if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const cookie = req.cookies.get(`admin_auth_${slug}`)
  const correctPassword = business.admin_password || process.env.ADMIN_PASSWORD
  if (!cookie || cookie.value !== correctPassword) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = new URL(req.url)
  const search = (url.searchParams.get('search') || '').trim()
  const sort = url.searchParams.get('sort') === 'registered' ? 'registered' : 'activity'
  const page = Math.max(0, parseInt(url.searchParams.get('page') || '0') || 0)
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabaseAdmin
    .from('customers')
    .select('id, name, email, phone, stamps, total_stamps, rewards_redeemed, created_at, last_stamp_at', { count: 'exact' })
    .eq('business_id', business.id)

  if (search) {
    // Escapar comas y paréntesis que romperían el filtro .or de PostgREST
    const safe = search.replace(/[,()]/g, ' ')
    query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`)
  }

  if (sort === 'registered') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('last_stamp_at', { ascending: false, nullsFirst: false })
  }

  const { data: customers, count, error } = await query.range(from, to)

  if (error) {
    console.error('Customers list error:', error)
    return NextResponse.json({ error: 'Error al cargar clientes' }, { status: 500 })
  }

  // Premios disponibles por cliente (solo para los de esta página)
  const availableByCustomer: Record<string, number> = {}
  const ids = (customers ?? []).map((c) => c.id)
  if (ids.length > 0) {
    const { data: pending } = await supabaseAdmin
      .from('pending_rewards')
      .select('customer_id')
      .eq('business_id', business.id)
      .eq('status', 'available')
      .gt('expires_at', new Date().toISOString())
      .in('customer_id', ids)
    for (const row of pending ?? []) {
      availableByCustomer[row.customer_id] = (availableByCustomer[row.customer_id] || 0) + 1
    }
  }

  const customersWithRewards = (customers ?? []).map((c) => ({
    ...c,
    available_rewards: availableByCustomer[c.id] || 0,
  }))

  return NextResponse.json({
    customers: customersWithRewards,
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
    total_pages: Math.ceil((count ?? 0) / PAGE_SIZE),
  })
}
