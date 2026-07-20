import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import { supabaseAdmin } from '@/lib/supabase'

const ISSUER_ID = '3388000000023114743'

function classId(slug: string) {
  return `${ISSUER_ID}.loyalty_${slug.replace(/-/g, '_')}`
}

function buildClassBody(slug: string, business: {
  name: string
  logo_url: string | null
  primary_color: string | null
}) {
  return {
    id: classId(slug),
    issuerName: 'Easy Loyalty',
    programName: business.name,
    programLogo: {
      sourceUri: {
        uri: business.logo_url || 'https://app.easyloyalty.io/img/logo-mark.png',
      },
      contentDescription: {
        defaultValue: { language: 'es', value: business.name },
      },
    },
    hexBackgroundColor: business.primary_color || '#1a1a2e',
    reviewStatus: 'UNDER_REVIEW',
    countryCode: 'MX',
    multipleDevicesAndHoldersAllowedStatus: 'ONE_USER_ALL_DEVICES',
  }
}

async function ensureClass(
  token: string,
  slug: string,
  business: { name: string; logo_url: string | null; primary_color: string | null }
) {
  const id = classId(slug)
  const body = buildClassBody(slug, business)

  const getRes = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (getRes.status === 404) {
    const createRes = await fetch(
      'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    if (!createRes.ok) {
      console.error('Google Wallet class create error:', createRes.status, await createRes.text())
    }
  } else if (getRes.ok) {
    const existing = await getRes.json()
    if (existing.reviewStatus === 'draft' || existing.reviewStatus === 'DRAFT') {
      await fetch(
        `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${id}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, reviewStatus: 'UNDER_REVIEW' }),
        }
      )
    } else {
      // Ya existe y está activa — actualizar nombre/logo/color si el negocio los cambió
      await fetch(
        `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${id}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programName: business.name,
            programLogo: body.programLogo,
            hexBackgroundColor: body.hexBackgroundColor,
          }),
        }
      )
    }
  }

  return id
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
      .select('id, name, logo_url, primary_color, accent_color, reward_description, strip_image_url')
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

    const cid = await ensureClass(token, slug, business)
    const objectId = `${ISSUER_ID}.${slug}-${customer_id}`

    const stripUrl = (business as Record<string, unknown>).strip_image_url as string | null
    const rewardDescription = (business as Record<string, unknown>).reward_description as string | null

    const passObject: Record<string, unknown> = {
      id: objectId,
      classId: cid,
      state: 'ACTIVE',
      accountId: customer_id,
      accountName: customer_name,
      loyaltyPoints: {
        label: 'SELLOS',
        balance: {
          string: `${stamps} / ${stamp_goal}`,
        },
      },
      barcode: {
        type: 'QR_CODE',
        value: customer_id,
        alternateText: customer_id,
      },
      textModulesData: [
        {
          id: 'reward',
          header: 'PREMIO',
          body: rewardDescription || 'Premio especial al completar tu tarjeta',
        },
      ],
    }

    // Banner (strip image del negocio — foto de fondo ancha).
    // eureka-burgers usa una versión re-encuadrada a la proporción de Google (~3:1, sujetos
    // centrados) porque la original tiene el logo pegado a la esquina y el recorte redondeado
    // del pase lo cortaba feo.
    const heroUrl = slug === 'eureka-burgers'
      ? 'https://udcvtwjumcunbgcqnvpn.supabase.co/storage/v1/object/public/logos/eureka-burgers/strip-google.png?v=1'
      : stripUrl
    if (heroUrl) {
      passObject.heroImage = {
        sourceUri: { uri: heroUrl },
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
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(passObject),
        }
      )
      if (!updateRes.ok) {
        console.error('Google Wallet update error:', updateRes.status, await updateRes.text())
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
  const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const headerB64 = encode(header)
  const payloadB64 = encode(claims)
  const signingInput = `${headerB64}.${payloadB64}`
  const { createSign } = await import('crypto')
  const sign = createSign('RSA-SHA256')
  sign.update(signingInput)
  const signature = sign.sign(privateKey, 'base64url')
  return `${signingInput}.${signature}`
}
