import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import { supabaseAdmin } from '@/lib/supabase'

const ISSUER_ID = '3388000000023114743'
const CLASS_ID = `${ISSUER_ID}.easyloyalty_loyalty_class`

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { customer_id, customer_name, stamps, stamp_goal } = await req.json()

    // Obtener datos del negocio
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id, name, logo_url, primary_color')
      .eq('slug', slug)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // Configurar autenticación con Google
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })

    const client = await auth.getClient()
    const token = await client.getAccessToken()

    const objectId = `${ISSUER_ID}.${slug}-${customer_id}`

    // Crear o actualizar el objeto del pase
    const passObject = {
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      accountId: customer_id,
      accountName: customer_name,
      loyaltyPoints: {
        label: 'Sellos',
        balance: {
          int: stamps,
        },
      },
      secondaryLoyaltyPoints: {
        label: 'Meta',
        balance: {
          int: stamp_goal,
        },
      },
      barcode: {
        type: 'QR_CODE',
        value: customer_id,
        alternateText: customer_id,
      },
      heroImage: business.logo_url ? {
        sourceUri: { uri: business.logo_url },
      } : undefined,
    }

    // Intentar crear, si ya existe actualizar
    let walletObjectRes = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
      {
        headers: { Authorization: `Bearer ${token.token}` },
      }
    )

    if (walletObjectRes.status === 404) {
      // Crear nuevo objeto
      await fetch(
        'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passObject),
        }
      )
    } else {
      // Actualizar existente
      await fetch(
        `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passObject),
        }
      )
    }

    // Generar JWT para el botón "Agregar a Google Wallet"
    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      payload: {
        loyaltyObjects: [{ id: objectId }],
      },
    }

    const jwtClient = await auth.getClient() as any
    const signedJwt = await jwtClient.signJwt ?
      await jwtClient.signJwt(claims) :
      await generateJwt(credentials.private_key, credentials.client_email, claims)

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
