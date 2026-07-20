import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(`admin_auth_${slug}`)

  const { data: authBiz } = await supabaseAdmin
    .from('businesses')
    .select('admin_password')
    .eq('slug', slug)
    .single()
  const correctPassword = authBiz?.admin_password || process.env.ADMIN_PASSWORD
  if (!authCookie?.value || authCookie.value !== correctPassword) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { name, tagline, primary_color, accent_color, stamp_goal, reward_description, new_password, new_staff_password, logo_url, stamp_icon, strip_image_url, strip_focal_point, strip_scale, logo_size, qr_bg_color, stamp_display, logo_tint, banner_gradient, banner_gradient_width } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      name: name.trim(),
      tagline: tagline?.trim() || null,
      primary_color: primary_color || '#6366f1',
      accent_color: accent_color || '#f59e0b',
      stamp_goal: parseInt(stamp_goal) || 10,
      reward_description: reward_description?.trim() || 'Premio especial',
      logo_url: logo_url || null,
      stamp_icon: stamp_icon || '⭐',
      strip_image_url: strip_image_url || null,
      strip_focal_point: strip_focal_point || '50% 50%',
      strip_scale: typeof strip_scale === 'number' ? strip_scale : 1,
      logo_size: typeof logo_size === 'number' ? logo_size : 1,
      qr_bg_color: qr_bg_color || null,
      stamp_display: stamp_display || 'none',
      logo_tint: logo_tint || null,
      banner_gradient: banner_gradient || null,
      banner_gradient_width: typeof banner_gradient_width === 'number' ? banner_gradient_width : 52,
    }

    if (new_password?.trim()) {
      updates.admin_password = new_password.trim()
    }

    if (new_staff_password?.trim()) {
      updates.staff_password = new_staff_password.trim()
    }

    const { error } = await supabaseAdmin
      .from('businesses')
      .update(updates)
      .eq('slug', slug)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Error actualizando el negocio' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Update error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
