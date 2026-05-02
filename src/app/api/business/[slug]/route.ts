import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: business, error } = await supabaseAdmin
    .from('businesses')
    .select('id, name, slug, logo_url, primary_color, secondary_color, accent_color, stamp_goal, stamp_icon, reward_description, tagline')
    .eq('slug', slug)
    .single()

  if (error || !business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ business })
}
