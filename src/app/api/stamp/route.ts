import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWalletPush } from '@/lib/apns'
import { updateGoogleWalletPass } from '@/lib/googleWallet'
import { sendRewardEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { qr_code, staff_id } = await req.json()

    if (!qr_code) {
      return NextResponse.json({ error: 'QR requerido' }, { status: 400 })
    }

    // Buscar cliente
    const { data: customer, error: custError } = await supabaseAdmin
      .from('customers')
      .select('*, businesses(stamp_goal, reward_description, name, slug)')
      .eq('qr_code', qr_code)
      .single()

    if (custError || !customer) {
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
    }

    const business = customer.businesses as { stamp_goal: number; reward_description: string; name: string; slug: string }

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

    // Al alcanzar la meta, el sello se reinicia y el premio queda "disponible" hasta
    // por 30 días (pueden acumularse varios en paralelo). El staff lo canjea después
    // desde el scanner ("Canjear premio"), que ahí sí suma rewards_redeemed.
    const updatedStamps = reachedGoal ? 0 : newStamps

    // Actualizar sellos del cliente
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        stamps: updatedStamps,
        total_stamps: customer.total_stamps + 1,
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
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await supabaseAdmin.from('pending_rewards').insert({
        customer_id: customer.id,
        business_id: customer.business_id,
        status: 'available',
        expires_at: expiresAt.toISOString(),
      })

      if (customer.email) {
        sendRewardEmail({
          to: customer.email,
          customerName: customer.name,
          businessName: business.name,
          businessSlug: business.slug,
          rewardDescription: business.reward_description,
        }).catch((err) => console.error('Reward email error:', err))
      }
    }

    // Enviar push a Apple Wallet para que actualice la tarjeta del cliente
    const { data: devices } = await supabaseAdmin
      .from('device_registrations')
      .select('push_token')
      .eq('serial_number', customer.qr_code)

    if (devices && devices.length > 0) {
      await Promise.allSettled(
        devices.map((d) => sendWalletPush(d.push_token))
      )
    }

    // Actualizar pase de Google Wallet (si el cliente lo guardó en Android)
    await updateGoogleWalletPass({
      slug: business.slug,
      qrCode: customer.qr_code,
      customerId: customer.id,
      stamps: updatedStamps,
      stampGoal: business.stamp_goal,
      rewardDescription: business.reward_description,
    })

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
