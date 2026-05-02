import * as http2 from 'http2'

const PASS_TYPE_ID = 'pass.com.easyloyalty.loyalty'
const APNS_HOST = 'api.push.apple.com'

export async function sendWalletPush(pushToken: string): Promise<void> {
  const cert = process.env.APPLE_CERTIFICATE_PEM
  const key = process.env.APPLE_KEY_PEM
  if (!cert || !key) throw new Error('Certificados Apple no configurados')

  return new Promise((resolve, reject) => {
    const client = http2.connect(`https://${APNS_HOST}`, {
      cert,
      key,
      rejectUnauthorized: true,
    })

    client.on('error', reject)

    const path = `/3/device/${pushToken}`
    const body = '{}'

    const req = client.request({
      ':method': 'POST',
      ':path': path,
      ':scheme': 'https',
      ':authority': APNS_HOST,
      'apns-topic': PASS_TYPE_ID,
      'apns-push-type': 'background',
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
    })

    let statusCode = 0
    req.on('response', (headers) => {
      statusCode = headers[':status'] as number
    })

    req.on('end', () => {
      client.close()
      if (statusCode === 201 || statusCode === 200) {
        resolve()
      } else {
        reject(new Error(`APNs respondió ${statusCode}`))
      }
    })

    req.on('error', (err) => {
      client.close()
      reject(err)
    })

    req.write(body)
    req.end()
  })
}
