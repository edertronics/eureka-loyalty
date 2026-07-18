import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWalletPush } from '@/lib/apns'
import { sendRewardReminderEmail, sendRewardExpiringEmail } from '@/lib/email'

interface RewardRow {
  id: string
  earned_at: string
  expires_at: string
  customers: {
    name: string
    email: string | null
    qr_code: string
    businesses: {
      name: string
      slug: string
      reward_description: string
    } | null
  } | null
}

// Corre una vez al día (Vercel Cron). Revisa premios pendientes de eureka-burgers:
// caduca los vencidos, y manda los 2 correos programados (14 días, última semana).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const now = new Date()
  const results = { expired: 0, reminder14d: 0, reminderFinal: 0, errors: [] as string[] }

  // 1. Caducar premios vencidos
  const { data: toExpire } = await supabaseAdmin
    .from('pending_rewards')
    .select('id, customers(qr_code)')
    .eq('status', 'available')
    .lte('expires_at', now.toISOString())

  if (toExpire && toExpire.length > 0) {
    const ids = toExpire.map((r) => r.id)
    await supabaseAdmin.from('pending_rewards').update({ status: 'expired' }).in('id', ids)
    results.expired = ids.length

    const serials = toExpire
      .map((r) => (r.customers as unknown as { qr_code: string } | null)?.qr_code)
      .filter((s): s is string => !!s)
    await pushToSerials(serials)
  }

  // 2. Recordatorio a los 14 días de haberse ganado
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const { data: needReminder14 } = await supabaseAdmin
    .from('pending_rewards')
    .select('id, earned_at, expires_at, customers(name, email, qr_code, businesses(name, slug, reward_description))')
    .eq('status', 'available')
    .is('reminder_14d_sent_at', null)
    .lte('earned_at', fourteenDaysAgo.toISOString())
    .gt('expires_at', now.toISOString())

  for (const row of (needReminder14 || []) as unknown as RewardRow[]) {
    const customer = row.customers
    const business = customer?.businesses
    if (!customer?.email || !business) continue
    try {
      const daysLeft = Math.max(1, Math.ceil((new Date(row.expires_at).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      await sendRewardReminderEmail({
        to: customer.email,
        customerName: customer.name,
        businessName: business.name,
        businessSlug: business.slug,
        rewardDescription: business.reward_description,
        daysLeft,
      })
      await supabaseAdmin.from('pending_rewards').update({ reminder_14d_sent_at: now.toISOString() }).eq('id', row.id)
      results.reminder14d++
    } catch (err) {
      results.errors.push(`reminder14d ${row.id}: ${err instanceof Error ? err.message : 'error'}`)
    }
  }

  // 3. Aviso urgente — última semana antes de caducar
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const { data: needReminderFinal } = await supabaseAdmin
    .from('pending_rewards')
    .select('id, earned_at, expires_at, customers(name, email, qr_code, businesses(name, slug, reward_description))')
    .eq('status', 'available')
    .is('reminder_final_sent_at', null)
    .lte('expires_at', sevenDaysFromNow.toISOString())
    .gt('expires_at', now.toISOString())

  for (const row of (needReminderFinal || []) as unknown as RewardRow[]) {
    const customer = row.customers
    const business = customer?.businesses
    if (!customer?.email || !business) continue
    try {
      const daysLeft = Math.max(1, Math.ceil((new Date(row.expires_at).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      await sendRewardExpiringEmail({
        to: customer.email,
        customerName: customer.name,
        businessName: business.name,
        businessSlug: business.slug,
        rewardDescription: business.reward_description,
        daysLeft,
      })
      await supabaseAdmin.from('pending_rewards').update({ reminder_final_sent_at: now.toISOString() }).eq('id', row.id)
      results.reminderFinal++
    } catch (err) {
      results.errors.push(`reminderFinal ${row.id}: ${err instanceof Error ? err.message : 'error'}`)
    }
  }

  return NextResponse.json({ success: true, ...results })
}

async function pushToSerials(serials: string[]) {
  if (serials.length === 0) return
  const { data: devices } = await supabaseAdmin
    .from('device_registrations')
    .select('push_token')
    .in('serial_number', serials)
  if (devices && devices.length > 0) {
    await Promise.allSettled(devices.map((d) => sendWalletPush(d.push_token)))
  }
}
