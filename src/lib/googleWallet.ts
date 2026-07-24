import { GoogleAuth } from 'google-auth-library'
import { supabaseAdmin } from './supabase'

const ISSUER_ID = '3388000000023114743'

// Actualiza el objeto de Google Wallet de un cliente (contador de sellos y texto de premio).
// El objeto se crea al guardar el pase desde la tarjeta con id `${ISSUER_ID}.${slug}-${qr_code}`;
// si el cliente nunca lo guardó, el PATCH regresa 404 y simplemente no hay nada que actualizar.
export async function updateGoogleWalletPass(params: {
  slug: string
  qrCode: string
  customerId: string
  stamps: number
  stampGoal: number
  rewardDescription: string | null
}) {
  const { slug, qrCode, customerId, stamps, stampGoal, rewardDescription } = params
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })
    const client = await auth.getClient()
    const tokenRes = await client.getAccessToken()
    const token = tokenRes.token!

    const objectId = `${ISSUER_ID}.${slug}-${qrCode}`

    // Mismo texto dinámico de premio que muestra el pase de Apple
    let rewardText = rewardDescription || 'Premio especial al completar tu tarjeta'
    const { count } = await supabaseAdmin
      .from('pending_rewards')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('status', 'available')
      .gt('expires_at', new Date().toISOString())
    const n = count || 0
    const remaining = Math.max(stampGoal - stamps, 0)
    rewardText = n >= 1
      ? `¡Tienes ${n} premio${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''}! Cánjalo${n > 1 ? 's' : ''} en tu próxima visita`
      : `Te faltan ${remaining} sello${remaining === 1 ? '' : 's'} para tu premio`

    const res = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loyaltyPoints: { label: 'SELLOS', balance: { string: `${stamps} / ${stampGoal}` } },
          textModulesData: [{ id: 'reward', header: 'PREMIO', body: rewardText }],
        }),
      }
    )
    if (!res.ok && res.status !== 404) {
      console.error('Google Wallet PATCH error:', res.status, await res.text())
    }
  } catch (err) {
    // Nunca romper el flujo de sello/canje por un fallo de Google Wallet
    console.error('Google Wallet update error:', err)
  }
}
