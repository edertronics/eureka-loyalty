import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Params = { passTypeId: string; serialNumber: string }

// Apple descarga el .pkpass actualizado después de recibir el push
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { serialNumber } = await params

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('ApplePass ', '')

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('*, businesses(id, name, slug, primary_color, accent_color, stamp_goal, reward_description, logo_url, strip_image_url)')
    .eq('qr_code', serialNumber)
    .eq('auth_token', token)
    .single()

  if (!customer) {
    return new NextResponse(null, { status: 401 })
  }

  const business = customer.businesses as Record<string, unknown>

  // Regenerar el .pkpass con los sellos actuales
  const walletRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/business/${business.slug}/wallet/apple`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customer.qr_code,
        customer_name: customer.name,
        stamps: customer.stamps,
        stamp_goal: business.stamp_goal,
      }),
    }
  )

  if (!walletRes.ok) {
    return new NextResponse(null, { status: 500 })
  }

  const pkpass = await walletRes.arrayBuffer()

  return new NextResponse(pkpass, {
    headers: {
      'Content-Type': 'application/vnd.apple.pkpass',
      'Last-Modified': new Date().toUTCString(),
    },
  })
}
