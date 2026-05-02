import { NextRequest, NextResponse } from 'next/server'

// Apple manda logs de errores de las tarjetas — los capturamos para debug
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.error('Apple Wallet log:', JSON.stringify(body))
  } catch {
    // ignorar errores de parsing
  }
  return new NextResponse(null, { status: 200 })
}
