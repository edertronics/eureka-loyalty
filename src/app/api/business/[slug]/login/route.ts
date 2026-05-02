import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { password } = await req.json()

  // Obtener contraseña del negocio
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, admin_password')
    .eq('slug', slug)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // Usar contraseña del negocio, o la global como fallback para negocios legacy
  const correctPassword = business.admin_password || process.env.ADMIN_PASSWORD

  if (password !== correctPassword) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(`admin_auth_${slug}`, correctPassword!, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return res
}
