import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Params = { deviceId: string; passTypeId: string }

// Apple pregunta: "¿qué pases de este dispositivo tienen actualizaciones?"
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { deviceId } = await params
  const url = new URL(req.url)
  const updatedSince = url.searchParams.get('passesUpdatedSince')

  const query = supabaseAdmin
    .from('device_registrations')
    .select('serial_number')
    .eq('device_library_identifier', deviceId)

  const { data, error } = await query

  if (error || !data || data.length === 0) {
    return new NextResponse(null, { status: 204 })
  }

  const serialNumbers = data.map((r) => r.serial_number)
  const tag = new Date().toISOString()

  return NextResponse.json({ serialNumbers, lastUpdated: updatedSince || tag })
}
