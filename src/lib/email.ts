import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Easy Loyalty <noreply@easyloyalty.io>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://easyloyalty.io'

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
  const cardUrl = `${APP_URL}/${businessSlug}`

  await resend.emails.send({
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
  const cardUrl = `${APP_URL}/${businessSlug}`

  await resend.emails.send({
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
}
