import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Params = { deviceId: string; passTypeId: string; serialNumber: string }

// Apple llama a este endpoint cuando el usuario agrega la tarjeta a su Wallet
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { deviceId, serialNumber } = await params

  // Verificar authenticationToken
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('ApplePass ', '')

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('qr_code', serialNumber)
    .eq('auth_token', token)
    .single()

  if (!customer) {
    return new NextResponse(null, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const pushToken = body.pushToken

  if (!pushToken) {
    return new NextResponse(null, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('device_registrations')
    .upsert({
      device_library_identifier: deviceId,
      push_token: pushToken,
      pass_type_identifier: 'pass.com.easyloyalty.loyalty',
      serial_number: serialNumber,
    }, { onConflict: 'device_library_identifier,serial_number' })

  if (error) {
    return new NextResponse(null, { status: 500 })
  }

  return new NextResponse(null, { status: 201 })
}

// Apple llama a este endpoint cuando el usuario elimina la tarjeta de su Wallet
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { deviceId, serialNumber } = await params

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('ApplePass ', '')

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('qr_code', serialNumber)
    .eq('auth_token', token)
    .single()

  if (!customer) {
    return new NextResponse(null, { status: 401 })
  }

  await supabaseAdmin
    .from('device_registrations')
    .delete()
    .eq('device_library_identifier', deviceId)
    .eq('serial_number', serialNumber)

  return new NextResponse(null, { status: 200 })
}
