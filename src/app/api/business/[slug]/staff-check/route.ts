import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // First get admin_password (column guaranteed to exist)
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, admin_password')
    .eq('slug', slug)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const adminCookie = req.cookies.get(`admin_auth_${slug}`)
  const adminPassword = business.admin_password || process.env.ADMIN_PASSWORD
  const isAdmin = adminCookie?.value === adminPassword

  if (isAdmin) {
    return NextResponse.json({ ok: true, role: 'admin' })
  }

  // Try to get staff_password — column may not exist yet
  const { data: staffData } = await supabaseAdmin
    .from('businesses')
    .select('staff_password')
    .eq('slug', slug)
    .single()

  const staffPassword: string | null = (staffData as { staff_password?: string | null })?.staff_password ?? null

  // No PIN configured → scanner is public (open access)
  if (!staffPassword) {
    return NextResponse.json({ ok: true, role: 'public' })
  }

  const staffCookie = req.cookies.get(`staff_auth_${slug}`)
  if (staffCookie?.value === staffPassword) {
    return NextResponse.json({ ok: true, role: 'staff' })
  }

  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}
