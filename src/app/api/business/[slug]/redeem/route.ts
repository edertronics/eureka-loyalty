import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWalletPush } from '@/lib/apns'
import { updateGoogleWalletPass } from '@/lib/googleWallet'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { qr_code, staff_id } = await req.json()

    if (!qr_code) {
      return NextResponse.json({ error: 'QR requerido' }, { status: 400 })
    }

    const { data: customer, error: custError } = await supabaseAdmin
      .from('customers')
      .select('*, businesses(name, slug, reward_description, stamp_goal)')
      .eq('qr_code', qr_code)
      .single()

    if (custError || !customer) {
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
    }

    const business = customer.businesses as { name: string; slug: string; reward_description: string; stamp_goal: number }

    if (business.slug !== slug) {
      return NextResponse.json({ error: 'Esta tarjeta no pertenece a este negocio' }, { status: 400 })
    }

    // Buscar el premio disponible más próximo a caducar (FIFO por vencimiento)
    const { data: reward, error: rewardError } = await supabaseAdmin
      .from('pending_rewards')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('status', 'available')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })
      .limit(1)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json({ error: 'Este cliente no tiene premios disponibles para canjear' }, { status: 404 })
    }

    const { error: updateRewardError } = await supabaseAdmin
      .from('pending_rewards')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
        staff_id: staff_id || null,
      })
      .eq('id', reward.id)

    if (updateRewardError) {
      return NextResponse.json({ error: 'Error al canjear el premio' }, { status: 500 })
    }

    await supabaseAdmin
      .from('customers')
      .update({ rewards_redeemed: customer.rewards_redeemed + 1 })
      .eq('id', customer.id)

    await supabaseAdmin.from('reward_events').insert({
      customer_id: customer.id,
      business_id: customer.business_id,
      staff_id: staff_id || null,
    })

    const { count: remaining } = await supabaseAdmin
      .from('pending_rewards')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id)
      .eq('status', 'available')
      .gt('expires_at', new Date().toISOString())

    // Push a Wallet para que el pase se actualice (y dispare el aviso visible vía changeMessage)
    const { data: devices } = await supabaseAdmin
      .from('device_registrations')
      .select('push_token')
      .eq('serial_number', customer.qr_code)

    if (devices && devices.length > 0) {
      await Promise.allSettled(devices.map((d) => sendWalletPush(d.push_token)))
    }

    // Actualizar pase de Google Wallet (si el cliente lo guardó en Android)
    await updateGoogleWalletPass({
      slug: business.slug,
      qrCode: customer.qr_code,
      customerId: customer.id,
      stamps: customer.stamps,
      stampGoal: business.stamp_goal,
      rewardDescription: business.reward_description,
    })

    return NextResponse.json({
      success: true,
      customer_name: customer.name,
      reward_description: business.reward_description,
      remaining_available: remaining || 0,
    })
  } catch (err) {
    console.error('Redeem error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
