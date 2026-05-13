import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'

const ISSUER_ID = '3388000000023114743'
const CLASS_ID = `${ISSUER_ID}.easyloyalty_loyalty_class`

export async function GET(req: NextRequest) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })
    const client = await auth.getClient()
    const tokenRes = await client.getAccessToken()
    const token = tokenRes.token!

    // Verificar estado del Issuer
    const issuerRes = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/issuer/${ISSUER_ID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const issuerData = await issuerRes.json()

    // Verificar estado de la Clase
    const classRes = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${CLASS_ID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const classData = await classRes.json()

    // Intentar actualizar clase a UNDER_REVIEW si está en draft
    let patchResult = null
    if (classRes.ok && (classData.reviewStatus === 'draft' || classData.reviewStatus === 'DRAFT')) {
      const patchRes = await fetch(
        `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${CLASS_ID}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewStatus: 'UNDER_REVIEW' }),
        }
      )
      patchResult = { status: patchRes.status, body: await patchRes.text() }
    }

    return NextResponse.json({
      issuer: { status: issuerRes.status, data: issuerData },
      class: { status: classRes.status, data: classData },
      patch: patchResult,
      service_account_email: credentials.client_email,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
