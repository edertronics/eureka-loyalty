import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { qr_code, staff_id } = await req.json()

    if (!qr_code) {
      return NextResponse.json({ error: 'QR requerido' }, { status: 400 })
    }

    // Buscar cliente
    const { data: customer, error: custError } = await supabaseAdmin
      .from('customers')
      .select('*, businesses(stamp_goal, reward_description, name)')
      .eq('qr_code', qr_code)
      .single()

    if (custError || !customer) {
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
    }

    const business = customer.businesses as { stamp_goal: number; reward_description: string; name: string }

    // Cooldown de 4 horas — previene fraude
    const COOLDOWN_HOURS = 4
    if (customer.last_stamp_at) {
      const lastStamp = new Date(customer.last_stamp_at)
      const hoursSince = (Date.now() - lastStamp.getTime()) / (1000 * 60 * 60)
      if (hoursSince < COOLDOWN_HOURS) {
        const minutesLeft = Math.ceil((COOLDOWN_HOURS - hoursSince) * 60)
        const hoursLeft = Math.floor(minutesLeft / 60)
        const minsLeft = minutesLeft % 60
        const timeMsg = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}min` : `${minsLeft} minutos`
        return NextResponse.json(
          { error: `Ya tiene un sello reciente. Puede volver a sellar en ${timeMsg}.` },
          { status: 429 }
        )
      }
    }

    const newStamps = customer.stamps + 1
    const reachedGoal = newStamps >= business.stamp_goal

    // Si alcanzó la meta, reiniciar sellos y sumar canje
    const updatedStamps = reachedGoal ? 0 : newStamps
    const updatedRewards = reachedGoal ? customer.rewards_redeemed + 1 : customer.rewards_redeemed

    // Actualizar sellos del cliente
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        stamps: updatedStamps,
        total_stamps: customer.total_stamps + 1,
        rewards_redeemed: updatedRewards,
        last_stamp_at: new Date().toISOString(),
      })
      .eq('id', customer.id)

    if (updateError) {
      return NextResponse.json({ error: 'Error al registrar sello' }, { status: 500 })
    }

    // Log del evento
    await supabaseAdmin.from('stamp_events').insert({
      customer_id: customer.id,
      business_id: customer.business_id,
      staff_id: staff_id || null,
      stamps_given: 1,
    })

    if (reachedGoal) {
      await supabaseAdmin.from('reward_events').insert({
        customer_id: customer.id,
        business_id: customer.business_id,
        staff_id: staff_id || null,
      })
    }

    return NextResponse.json({
      success: true,
      customer_name: customer.name,
      stamps_before: customer.stamps,
      stamps_after: updatedStamps,
      stamp_goal: business.stamp_goal,
      reward_unlocked: reachedGoal,
      reward_description: business.reward_description,
    })
  } catch (err) {
    console.error('Stamp error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
