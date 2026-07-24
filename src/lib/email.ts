import { Resend } from 'resend'

const FROM = 'Easy Loyalty <noreply@easyloyalty.io>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://easyloyalty.io'
// La tarjeta del cliente vive en el dominio raíz (easyloyalty.io), no en app.easyloyalty.io
// (ahí el middleware redirige /{slug} a /{slug}/admin). En local dev APP_URL ya es localhost,
// donde no hay separación de dominios, así que se reutiliza tal cual.
const CARD_URL = APP_URL.includes('localhost') ? APP_URL : 'https://easyloyalty.io'

export async function sendWelcomeEmail({
  to,
  customerName,
  businessName,
  businessSlug,
  stampGoal,
  rewardDescription,
}: {
  to: string
  customerName: string
  businessName: string
  businessSlug: string
  stampGoal: number
  rewardDescription: string
}) {
  const cardUrl = `${CARD_URL}/${businessSlug}`

  const { error: e1 } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `¡Bienvenido a ${businessName}! Tu tarjeta de lealtad está lista`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#1a1a2e;padding:32px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#a0a0b0;letter-spacing:1px;text-transform:uppercase;">Easy Loyalty</p>
            <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;">¡Bienvenido, ${customerName}!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#374151;">
              Ya eres parte del programa de lealtad de <strong>${businessName}</strong>.
              Acumula sellos en cada visita y gana tu premio.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Tu meta</p>
                  <p style="margin:0;font-size:20px;font-weight:bold;color:#1a1a2e;">${stampGoal} sellos</p>
                </td>
              </tr>
              <tr><td style="padding-top:16px;">
                <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Tu premio</p>
                <p style="margin:0;font-size:20px;font-weight:bold;color:#1a1a2e;">${rewardDescription}</p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${cardUrl}" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;font-weight:bold;">
                  Ver mi tarjeta
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Puedes agregar tu tarjeta a Apple Wallet o Google Wallet desde la página de tu tarjeta.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
  if (e1) throw new Error(`Resend error (welcome): ${e1.message}`)
}

export async function sendOnboardingEmail({
  to,
  businessName,
  businessSlug,
}: {
  to: string
  businessName: string
  businessSlug: string
}) {
  const cardUrl    = `${CARD_URL}/${businessSlug}`
  const adminUrl   = `${APP_URL}/${businessSlug}/admin`
  const scannerUrl = `${APP_URL}/${businessSlug}/scanner`

  const { error: e2 } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `¡${businessName} ya tiene lealtad! Aquí están tus links`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#063f3a;padding:32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;color:#00C896;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Easy Loyalty</p>
            <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:800;">¡${businessName} ya tiene lealtad!</h1>
            <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.5);">Tu programa de lealtad está activo</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              Guarda este correo — contiene todo lo que necesitas para operar tu programa de lealtad.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td style="padding-bottom:12px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px;border-left:4px solid #00C896;">
                  <tr><td>
                    <p style="margin:0 0 4px;font-size:10px;color:#00C896;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Tarjeta para tus clientes</p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#111827;font-family:monospace;">${cardUrl}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">Comparte este link con tus clientes</p>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td style="padding-bottom:12px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px;border-left:4px solid #6366f1;">
                  <tr><td>
                    <p style="margin:0 0 4px;font-size:10px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Tu panel de control</p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#111827;font-family:monospace;">${adminUrl}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">Estadísticas, clientes y configuración</p>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px;border-left:4px solid #f59e0b;">
                  <tr><td>
                    <p style="margin:0 0 4px;font-size:10px;color:#d97706;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Scanner de sellos</p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#111827;font-family:monospace;">${scannerUrl}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">Para que tu personal escanee los QR</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${adminUrl}" style="display:inline-block;background:#00C896;color:#063f3a;text-decoration:none;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:800;">
                  Ir a mi panel de control →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              También puedes consultar estos links en cualquier momento regresando a<br/>
              <strong style="color:#6b7280;">app.easyloyalty.io/registro</strong><br/>
              El programa de lealtad más fácil de Latinoamérica.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
  if (e2) throw new Error(`Resend error (onboarding): ${e2.message}`)
}

export async function sendRewardEmail({
  to,
  customerName,
  businessName,
  businessSlug,
  rewardDescription,
}: {
  to: string
  customerName: string
  businessName: string
  businessSlug: string
  rewardDescription: string
}) {
  const cardUrl = `${CARD_URL}/${businessSlug}`

  const { error: e3 } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `¡Ganaste tu premio en ${businessName}! 🎉`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#16a34a;padding:32px;text-align:center;">
            <p style="margin:0;font-size:40px;">🏆</p>
            <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;">¡Completaste tu tarjeta!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:16px;color:#374151;">
              <strong>${customerName}</strong>, acumulaste todos tus sellos en <strong>${businessName}</strong>.
              Tu premio te está esperando.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr><td align="center">
                <p style="margin:0 0 4px;font-size:13px;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;">Tu premio</p>
                <p style="margin:0;font-size:22px;font-weight:bold;color:#14532d;">${rewardDescription}</p>
              </td></tr>
            </table>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
              Muestra este correo o tu tarjeta digital al personal de ${businessName} para canjear tu premio.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${cardUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;font-weight:bold;">
                  Ver mi tarjeta
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Tu tarjeta se ha reiniciado automáticamente. ¡Sigue acumulando sellos!
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
  if (e3) throw new Error(`Resend error (reward): ${e3.message}`)
}

export async function sendRewardReminderEmail({
  to,
  customerName,
  businessName,
  businessSlug,
  rewardDescription,
  daysLeft,
}: {
  to: string
  customerName: string
  businessName: string
  businessSlug: string
  rewardDescription: string
  daysLeft: number
}) {
  const cardUrl = `${CARD_URL}/${businessSlug}`

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `Recordatorio: tienes un premio disponible en ${businessName}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#16a34a;padding:32px;text-align:center;">
            <p style="margin:0;font-size:40px;">🎁</p>
            <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;">Todavía tienes un premio esperando</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:16px;color:#374151;">
              <strong>${customerName}</strong>, no olvides que tienes un premio disponible en <strong>${businessName}</strong>. Te quedan <strong>${daysLeft} días</strong> para canjearlo.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr><td align="center">
                <p style="margin:0 0 4px;font-size:13px;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;">Tu premio</p>
                <p style="margin:0;font-size:22px;font-weight:bold;color:#14532d;">${rewardDescription}</p>
              </td></tr>
            </table>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
              Muestra tu tarjeta digital al personal de ${businessName} para canjearlo en tu próxima visita.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${cardUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;font-weight:bold;">
                  Ver mi tarjeta
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
  if (error) throw new Error(`Resend error (reward reminder): ${error.message}`)
}

export async function sendRewardExpiringEmail({
  to,
  customerName,
  businessName,
  businessSlug,
  rewardDescription,
  daysLeft,
}: {
  to: string
  customerName: string
  businessName: string
  businessSlug: string
  rewardDescription: string
  daysLeft: number
}) {
  const cardUrl = `${CARD_URL}/${businessSlug}`

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `⚠️ Tu premio en ${businessName} caduca en ${daysLeft} días`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#DA5C2D;padding:32px;text-align:center;">
            <p style="margin:0;font-size:40px;">⏰</p>
            <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;">¡Tu premio está por caducar!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:16px;color:#374151;">
              <strong>${customerName}</strong>, tu premio en <strong>${businessName}</strong> caduca en <strong>${daysLeft} días</strong>. Después de eso, se cancela y no se puede recuperar.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:2px solid #DA5C2D;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr><td align="center">
                <p style="margin:0 0 4px;font-size:13px;color:#c2410c;text-transform:uppercase;letter-spacing:0.5px;">Tu premio</p>
                <p style="margin:0;font-size:22px;font-weight:bold;color:#7c2d12;">${rewardDescription}</p>
              </td></tr>
            </table>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
              Cánjalo antes de que caduque — muestra tu tarjeta digital al personal de ${businessName}.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${cardUrl}" style="display:inline-block;background:#DA5C2D;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;font-weight:bold;">
                  Canjea tu premio antes de que caduque
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
  if (error) throw new Error(`Resend error (reward expiring): ${error.message}`)
}
