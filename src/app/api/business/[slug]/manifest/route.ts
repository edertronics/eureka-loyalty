import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('name, primary_color')
    .eq('slug', slug)
    .single()

  const name = business?.name ?? 'Scanner'
  const themeColor = business?.primary_color ?? '#063f3a'

  const manifest = {
    name: 'Easy Loyalty SCAN',
    short_name: 'Easy Loyalty SCAN',
    description: `Escanea los códigos QR de tus clientes de ${name}`,
    start_url: `/${slug}/scanner`,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#00C896',
    theme_color: themeColor,
    lang: 'es',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
