import { NextRequest, NextResponse } from 'next/server'

const ISSUER_ID = '3388000000023114743'
const SERVICE_ACCOUNT = 'easy-loyalty-wallet@easy-loyalty-493322.iam.gserviceaccount.com'
const OWNER_EMAIL = 'eder.estudillo@gmail.com'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return new NextResponse(`Error de autorización: ${error}`, { status: 400 })
  }

  if (!code) {
    return new NextResponse('No se recibió código de autorización', { status: 400 })
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!
  const redirectUri = 'https://app.easyloyalty.io/api/setup/wallet-callback'

  // Intercambiar code por token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return new NextResponse(`Error obteniendo token: ${JSON.stringify(tokenData)}`, { status: 500 })
  }

  // Actualizar permisos del issuer para incluir la service account
  const permRes = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/permissions/${ISSUER_ID}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issuerId: ISSUER_ID,
        permissions: [
          { emailAddress: OWNER_EMAIL, role: 'OWNER' },
          { emailAddress: SERVICE_ACCOUNT, role: 'WRITER' },
        ],
      }),
    }
  )

  const permData = await permRes.json()

  if (permRes.ok) {
    return new NextResponse(
      `✅ ¡Listo! La service account fue agregada al issuer.\n\nRespuesta: ${JSON.stringify(permData, null, 2)}`,
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  } else {
    return new NextResponse(
      `❌ Error actualizando permisos:\n${JSON.stringify(permData, null, 2)}`,
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  }
}
