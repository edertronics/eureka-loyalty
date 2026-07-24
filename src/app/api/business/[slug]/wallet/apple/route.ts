import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHash } from 'crypto'
import JSZip from 'jszip'

const PASS_TYPE_ID = 'pass.com.easyloyalty.loyalty'
const TEAM_ID = 'YPD8C8783D'

const ICON_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAAAJklEQVR4nGMQ5L1HC8Qwau6ouaPmjpo7au6ouaPmjpo7au6gMhcAtrc8Cqnj5poAAAAASUVORK5CYII=', 'base64')
const ICON2X_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAADoAAAA6CAIAAABu2d1/AAAATUlEQVR4nO3OQQ0AMAgEMAzwmH9v0zIL+x0kTSqgdfouUvGB7hi6urq6urq6urppurq6urq6urq6abq6urq6urq6umm6urq6urq6uj8eUd/wJZeJNYQAAAAASUVORK5CYII=', 'base64')

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const url = new URL(req.url)
  const customer_id = url.searchParams.get('customer_id') || ''
  const customer_name = url.searchParams.get('customer_name') || ''
  const stamps = parseInt(url.searchParams.get('stamps') || '0')
  const stamp_goal = parseInt(url.searchParams.get('stamp_goal') || '9')
  return generatePass({ slug: (await params).slug, customer_id, customer_name, stamps, stamp_goal })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { customer_id, customer_name, stamps, stamp_goal } = await req.json()
    return generatePass({ slug, customer_id, customer_name, stamps, stamp_goal })
  } catch (error) {
    console.error('Apple Wallet error:', error)
    return NextResponse.json({ error: 'Error generando pase Apple' }, { status: 500 })
  }
}

async function generatePass({ slug, customer_id, customer_name, stamps, stamp_goal }: {
  slug: string, customer_id: string, customer_name: string, stamps: number, stamp_goal: number
}) {
  try {
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id, name, primary_color, accent_color, logo_url, reward_description, strip_image_url')
      .eq('slug', slug)
      .single()

    // Obtener o crear auth_token del cliente
    let authToken: string | null = null
    const { data: customerRow } = await supabaseAdmin
      .from('customers')
      .select('id, auth_token')
      .eq('qr_code', customer_id)
      .single()
    if (customerRow?.auth_token) {
      authToken = customerRow.auth_token
    } else {
      const newToken = crypto.randomUUID()
      await supabaseAdmin
        .from('customers')
        .update({ auth_token: newToken })
        .eq('qr_code', customer_id)
      authToken = newToken
    }

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const rawCert = process.env.APPLE_CERTIFICATE_PEM
    const rawKey = process.env.APPLE_KEY_PEM
    const wwdr = process.env.APPLE_WWDR_PEM

    if (!rawCert || !rawKey || !wwdr) {
      return NextResponse.json({ error: 'Certificados no configurados' }, { status: 500 })
    }

    const extractPem = (raw: string, type: string) => {
      const begin = `-----BEGIN ${type}-----`
      const end = `-----END ${type}-----`
      const start = raw.indexOf(begin)
      const finish = raw.indexOf(end)
      if (start === -1 || finish === -1) return raw
      return raw.substring(start, finish + end.length)
    }
    const signerCert = extractPem(rawCert, 'CERTIFICATE')
    const signerKey = extractPem(rawKey, 'PRIVATE KEY')

    // Convertir hex → rgb() para Apple Wallet
    const hexToRgb = (hex: string) => {
      const c = (hex || '#000000').replace('#', '')
      return `rgb(${parseInt(c.slice(0,2),16)}, ${parseInt(c.slice(2,4),16)}, ${parseInt(c.slice(4,6),16)})`
    }

    // Si el color principal es oscuro (ej. rosa mexicano), usar fondo blanco
    // con texto en el color del negocio para que sea legible sobre la strip image
    const walletColorDark = (hex: string) => {
      const c = (hex || '#000').replace('#', '')
      const r = parseInt(c.slice(0,2), 16)
      const g = parseInt(c.slice(2,4), 16)
      const b = parseInt(c.slice(4,6), 16)
      return (0.299*r + 0.587*g + 0.114*b) / 255 < 0.55
    }
    const primaryIsDark = walletColorDark(business.primary_color || '#FFE44D')
    const bgColor = hexToRgb(business.primary_color || '#FFE44D')
    const textColor = primaryIsDark ? 'rgb(255, 255, 255)' : hexToRgb(business.accent_color || '#003860')

    // Fetch logo (aparece arriba a la izquierda en la Wallet)
    let logoBuffer: Buffer | null = null
    if (business.logo_url) {
      try {
        const res = await fetch(business.logo_url)
        if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer())
      } catch { /* sin logo */ }
    }

    // Fetch strip image (foto de fondo — café o uñas)
    // strip_image_url es una columna opcional; si no existe en DB, business.strip_image_url será undefined
    let stripBuffer: Buffer | null = null
    const stripUrl = (business as Record<string, unknown>).strip_image_url as string | null
    if (stripUrl) {
      try {
        const res = await fetch(stripUrl)
        if (res.ok) stripBuffer = Buffer.from(await res.arrayBuffer())
      } catch { /* sin strip */ }
    }

    const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://app.easyloyalty.io').trim()

    // Premios pendientes con vigencia. El campo "PREMIO" se vuelve dinámico y lleva
    // changeMessage para que Wallet muestre un aviso visible en pantalla de bloqueo
    // cada vez que el texto cambie (incluye cada sello normal).
    let auxiliaryFields: Array<{ key: string; label: string; value: string; changeMessage?: string }> = [
      { key: 'reward', label: 'PREMIO', value: 'Estás más cerca de tu premio' },
    ]

    if (customerRow?.id) {
      const { count: availableCount } = await supabaseAdmin
        .from('pending_rewards')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customerRow.id)
        .eq('status', 'available')
        .gt('expires_at', new Date().toISOString())

      const n = availableCount || 0
      const remaining = Math.max(stamp_goal - stamps, 0)
      const rewardText = n >= 1
        ? `¡Tienes ${n} premio${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''}! Cánjalo${n > 1 ? 's' : ''} en tu próxima visita`
        : `Te faltan ${remaining} sello${remaining === 1 ? '' : 's'} para tu premio`

      auxiliaryFields = [
        { key: 'reward', label: 'PREMIO', value: rewardText, changeMessage: '%@' },
      ]
    }

    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: PASS_TYPE_ID,
      serialNumber: customer_id,
      teamIdentifier: TEAM_ID,
      organizationName: business.name,
      description: business.name,
      webServiceURL: `${APP_URL}/api/wallet/apple/`,
      authenticationToken: authToken,
      backgroundColor: bgColor,
      foregroundColor: textColor,
      labelColor: textColor,
      storeCard: {
        headerFields: [
          {
            key: 'stamps',
            label: 'SELLOS',
            value: `${stamps}/${stamp_goal}`,
            textAlignment: 'PKTextAlignmentRight',
          },
        ],
        primaryFields: [
          {
            key: 'name',
            label: 'CLIENTE',
            value: customer_name.split(' ')[0],
          },
        ],
        secondaryFields: [
          {
            key: 'business',
            label: 'PROGRAMA',
            value: business.name,
          },
        ],
        auxiliaryFields,
        backFields: [
          {
            key: 'id',
            label: 'ID de cliente',
            value: customer_id,
          },
          {
            key: 'instructions',
            label: '¿Cómo funciona?',
            value: `Muestra tu QR en cada visita para acumular sellos. Al completar ${stamp_goal} sellos ganas: ${business.reward_description || 'un premio especial'}.`,
          },
        ],
      },
      barcode: {
        message: customer_id,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: 'Easy Loyalty Program',
      },
    }

    const passJsonBuffer = Buffer.from(JSON.stringify(passJson))

    const manifest: Record<string, string> = {
      'pass.json': createHash('sha1').update(passJsonBuffer).digest('hex'),
      'icon.png': createHash('sha1').update(ICON_PNG).digest('hex'),
      'icon@2x.png': createHash('sha1').update(ICON2X_PNG).digest('hex'),
    }
    if (logoBuffer) {
      manifest['logo.png'] = createHash('sha1').update(logoBuffer).digest('hex')
      manifest['logo@2x.png'] = createHash('sha1').update(logoBuffer).digest('hex')
    }
    if (stripBuffer) {
      manifest['strip.png'] = createHash('sha1').update(stripBuffer).digest('hex')
      manifest['strip@2x.png'] = createHash('sha1').update(stripBuffer).digest('hex')
    }

    const manifestBuffer = Buffer.from(JSON.stringify(manifest))
    const signature = await signPkcs7(manifestBuffer, signerCert, signerKey, wwdr)

    const zip = new JSZip()
    zip.file('pass.json', passJsonBuffer)
    zip.file('manifest.json', manifestBuffer)
    zip.file('signature', signature)
    zip.file('icon.png', ICON_PNG)
    zip.file('icon@2x.png', ICON2X_PNG)
    if (logoBuffer) {
      zip.file('logo.png', logoBuffer)
      zip.file('logo@2x.png', logoBuffer)
    }
    if (stripBuffer) {
      zip.file('strip.png', stripBuffer)
      zip.file('strip@2x.png', stripBuffer)
    }

    const pkpassBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new NextResponse(pkpassBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
      },
    })
  } catch (error) {
    console.error('Apple Wallet error:', error)
    return NextResponse.json({ error: 'Error generando pase Apple' }, { status: 500 })
  }
}

async function signPkcs7(
  data: Buffer,
  certPem: string,
  keyPem: string,
  wwdrPem: string
): Promise<Buffer> {
  const { default: forge } = await import('node-forge')

  const cert = forge.pki.certificateFromPem(certPem)
  const key = forge.pki.privateKeyFromPem(keyPem)
  const wwdrCert = forge.pki.certificateFromPem(wwdrPem)

  const p7 = forge.pkcs7.createSignedData()
  p7.content = forge.util.createBuffer(data.toString('binary'))
  p7.addCertificate(cert)
  p7.addCertificate(wwdrCert)
  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date().toISOString() },
    ],
  })
  p7.sign({ detached: true })

  const der = forge.asn1.toDer(p7.toAsn1()).getBytes()
  return Buffer.from(der, 'binary')
}
