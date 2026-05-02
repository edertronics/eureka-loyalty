import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(`admin_auth_${slug}`)

  if (!authCookie?.value) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen no puede pesar más de 2MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `${slug}/logo.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // Crear bucket si no existe (ignora error si ya existe)
    await supabaseAdmin.storage.createBucket('logos', { public: true }).catch(() => {})

    const { error: uploadError } = await supabaseAdmin.storage
      .from('logos')
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Error subiendo la imagen' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('logos').getPublicUrl(filename)

    const { error: updateError } = await supabaseAdmin
      .from('businesses')
      .update({ logo_url: publicUrl })
      .eq('slug', slug)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Error guardando la URL del logo' }, { status: 500 })
    }

    return NextResponse.json({ logo_url: publicUrl })
  } catch (err) {
    console.error('Upload logo error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
