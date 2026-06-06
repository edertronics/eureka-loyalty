import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendOnboardingEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, slug, tagline, primary_color, accent_color, stamp_goal, reward_description, admin_password, email, stamp_icon, stamp_display } = await req.json()

    // Validaciones básicas
    if (!name || !slug || !admin_password) {
      return NextResponse.json({ error: 'Nombre, slug y contraseña son requeridos' }, { status: 400 })
    }

    // Slug solo letras, números y guiones
    const slugClean = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')

    // Verificar que el slug no exista
    const { data: existing } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('slug', slugClean)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ese slug ya está en uso. Elige otro.' }, { status: 409 })
    }

    // Crear el negocio
    const { data: business, error } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: name.trim(),
        slug: slugClean,
        tagline: tagline?.trim() || null,
        primary_color: primary_color || '#6366f1',
        secondary_color: '#ffffff',
        accent_color: accent_color || '#f59e0b',
        stamp_goal: parseInt(stamp_goal) || 10,
        reward_description: reward_description?.trim() || 'Premio especial',
        admin_password: admin_password,
        stamp_icon: stamp_icon || 'star',
        stamp_display: stamp_display || 'none',
        logo_url: null,
      })
      .select('id, name, slug')
      .single()

    if (error || !business) {
      console.error('Onboarding error:', error)
      return NextResponse.json({ error: 'Error creando el negocio' }, { status: 500 })
    }

    if (email) {
      try {
        await sendOnboardingEmail({ to: email, businessName: business.name, businessSlug: business.slug })
        console.log('[onboarding] email sent to:', email)
      } catch (err) {
        console.error('[onboarding] email FAILED for:', email, err)
      }
    } else {
      console.log('[onboarding] no email provided, skipping')
    }

    return NextResponse.json({ business }, { status: 201 })
  } catch (err) {
    console.error('Onboarding error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
