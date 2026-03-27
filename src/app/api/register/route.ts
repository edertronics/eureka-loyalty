import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, business_slug } = await req.json()

    if (!name || !business_slug) {
      return NextResponse.json({ error: 'Nombre y negocio son requeridos' }, { status: 400 })
    }

    // Obtener el negocio por slug
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('id, name, stamp_goal, reward_description')
      .eq('slug', business_slug)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // Verificar si ya existe un cliente con ese email o teléfono
    if (email) {
      const { data: existing } = await supabaseAdmin
        .from('customers')
        .select('id, name, qr_code')
        .eq('business_id', business.id)
        .eq('email', email)
        .single()

      if (existing) {
        return NextResponse.json({ customer: existing, already_exists: true })
      }
    }

    // Crear QR único
    const qr_code = `ELY-${uuidv4().replace(/-/g, '').toUpperCase().slice(0, 12)}`

    // Crear el customer
    const { data: customer, error: custError } = await supabaseAdmin
      .from('customers')
      .insert({
        business_id: business.id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        qr_code,
        stamps: 0,
        total_stamps: 0,
        rewards_redeemed: 0,
      })
      .select('id, name, qr_code, stamps')
      .single()

    if (custError || !customer) {
      console.error('Error creating customer:', custError)
      return NextResponse.json({ error: 'Error al crear la tarjeta' }, { status: 500 })
    }

    return NextResponse.json({ customer, business }, { status: 201 })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
