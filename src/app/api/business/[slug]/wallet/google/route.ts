import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import { supabaseAdmin } from '@/lib/supabase'

const ISSUER_ID = '33880000000023114743'
const CLASS_ID = `${ISSUER_ID}.easyloyalty_loyalty_class`

async function ensureLoyaltyClass(token: string) {
  const getRes = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${CLASS_ID}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (getRes.status === 404) {
    const createRes = await fetch(
      'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: CLASS_ID,
          issuerName: 'Easy Loyalty',
          programName: 'Easy Loyalty',
          programLogo: {
            sourceUri: { uri: 'https://easyloyalty.io/icon.png' },
            contentDescription: { defaultValue: { language: 'es', value: 'Easy Loyalty' } },
          },
          reviewStatus: 'UNDER_REVIEW',
        }),
      }
    )
    if (!createRes.ok) {
      const errBody = await createRes.text()
      console.error('Google Wallet class create error:', createRes.status, errBody)
    }
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { customer_id, customer_name, stamps, stamp_goal } = await req.json()

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id, name, logo_url, primary_color')
      .eq('slug', slug)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })

    const client = await auth.getClient()
    const tokenRes = await client.getAccessToken()
    const token = tokenRes.token!

    // Asegurar que la clase existe
    await ensureLoyaltyClass(token)

    const objectId = `${ISSUER_ID}.${slug}-${customer_id}`

    const passObject: Record<string, unknown> = {
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      accountId: customer_id,
      accountName: customer_name,
      loyaltyPoints: {
        label: `Sellos (meta: ${stamp_goal})`,
        balance: { int: stamps },
      },
      barcode: {
        type: 'QR_CODE',
        value: customer_id,
        alternateText: 'Easy Loyalty Program',
      },
    }

    if (business.logo_url) {
      passObject.heroImage = {
        sourceUri: { uri: business.logo_url },
        contentDescription: { defaultValue: { language: 'es', value: business.name } },
      }
    }

    const getRes = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (getRes.status === 404) {
      const createRes = await fetch(
        'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passObject),
        }
      )
      if (!createRes.ok) {
        const errBody = await createRes.text()
        console.error('Google Wallet create error:', createRes.status, errBody)
        return NextResponse.json({ error: 'Error creando objeto en Google Wallet' }, { status: 500 })
      }
    } else if (getRes.ok) {
      const updateRes = await fetch(
        `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passObject),
        }
      )
      if (!updateRes.ok) {
        const errBody = await updateRes.text()
        console.error('Google Wallet update error:', updateRes.status, errBody)
      }
    }

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: ['https://app.easyloyalty.io', 'https://easyloyalty.io'],
      payload: {
        loyaltyObjects: [{ id: objectId }],
      },
    }

    const signedJwt = await generateJwt(credentials.private_key, credentials.client_email, claims)
    const saveUrl = `https://pay.google.com/gp/v/save/${signedJwt}`

    return NextResponse.json({ url: saveUrl })
  } catch (error) {
    console.error('Google Wallet error:', error)
    return NextResponse.json({ error: 'Error generando pase' }, { status: 500 })
  }
}

async function generateJwt(privateKey: string, clientEmail: string, claims: object): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' }

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')

  const headerB64 = encode(header)
  const payloadB64 = encode(claims)
  const signingInput = `${headerB64}.${payloadB64}`

  const { createSign } = await import('crypto')
  const sign = createSign('RSA-SHA256')
  sign.update(signingInput)
  const signature = sign.sign(privateKey, 'base64url')

  return `${signingInput}.${signature}`
}
