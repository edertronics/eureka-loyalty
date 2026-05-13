import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { password } = await req.json()

  const { data: staffData } = await supabaseAdmin
    .from('businesses')
    .select('id, staff_password')
    .eq('slug', slug)
    .single()

  if (!staffData) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const staffPassword: string | null = (staffData as { id: string; staff_password?: string | null })?.staff_password ?? null

  if (!staffPassword) {
    return NextResponse.json({ error: 'Acceso de staff no configurado' }, { status: 403 })
  }

  if (password !== staffPassword) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(`staff_auth_${slug}`, staffPassword, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 12,
    path: '/',
  })
  return res
}
