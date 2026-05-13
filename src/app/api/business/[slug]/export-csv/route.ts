import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, name, admin_password')
    .eq('slug', slug)
    .single()

  if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const cookie = req.cookies.get(`admin_auth_${slug}`)
  const correctPassword = business.admin_password || process.env.ADMIN_PASSWORD
  if (!cookie || cookie.value !== correctPassword) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: customers } = await supabaseAdmin
    .from('customers')
    .select('name, email, phone, stamps, total_stamps, rewards_redeemed, created_at, last_stamp_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  if (!customers) return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })

  const headers = ['Nombre', 'Teléfono', 'Email', 'Sellos actuales', 'Sellos totales', 'Premios canjeados', 'Fecha de registro', 'Último sello']

  const rows = customers.map(c => [
    c.name ?? '',
    c.phone ?? '',
    c.email ?? '',
    c.stamps ?? 0,
    c.total_stamps ?? 0,
    c.rewards_redeemed ?? 0,
    c.created_at ? new Date(c.created_at).toLocaleDateString('es-MX') : '',
    c.last_stamp_at ? new Date(c.last_stamp_at).toLocaleDateString('es-MX') : '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const filename = `clientes-${slug}-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
