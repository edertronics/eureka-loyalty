'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const SVG_STAMP_PATHS: Record<string, string> = {
  star:     'M12 2 14.4 8.8 21.5 8.9 15.8 13.2 17.9 20.1 12 16 6.1 20.1 8.2 13.2 2.5 8.9 9.6 8.8Z',
  burger:   'M5 8c0-1.7 3.1-3 7-3s7 1.3 7 3H5M3 12h18M5 16c0 1.7 3.1 3 7 3s7-1.3 7-3H5',
  coffee:   'M7 7h10l-2 12H9L7 7zM17 8a3 3 0 010 6M5 20h14M10 4V2M14 4V2',
  heart:    'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  nail:     'M10 21V10l2-7 2 7v11h-4zM8 10h8',
  pizza:    'M12 2L3 21h18L12 2zm-2 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 3a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  scissors: 'M6 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM20 4L8.5 12M8.5 12L20 20',
  paw:      'M12 19c-3 0-5 2-5 3h10c0-1-2-3-5-3zM7.5 9a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zm-4.5-3a2 2 0 100-4 2 2 0 000 4z',
  diamond:  'M12 2l10 9-10 11L2 11zM2 11h20',
  taco:     'M4 20c0-5.5 3.6-10 8-10s8 4.5 8 10H4zm3-5c.8-1.2 2.3-2 5-2',
  flower:   'M12 15a3 3 0 100-6 3 3 0 000 6zM12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12',
  crown:    'M3 20h18M3 20V9l5 5L12 3l4 11 5-5v11',
  icecream: 'M8.5 16l3.5 6 3.5-6H8.5zM7 13a5 5 0 0110 0v3H7v-3z',
  ramen:    'M3 13h18M21 18H3l1.5-5h13L21 18zM8 9c0-2 1-3 2-3M14 9c0-2-1-3-2-3',
  gym:      'M6 12h12M6 9v6M4 10v4M18 9v6M20 10v4',
  book:     'M4 4h7a1 1 0 011 1v14a1 1 0 00-1-1H4V4zm16 0h-7a1 1 0 00-1 1v14a1 1 0 011-1h7V4zM12 4v16',
}

interface Business {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  stamp_goal: number
  reward_description: string
  tagline: string | null
  stamp_icon: string | null
}

export default function BusinessRegisterPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState<{ name: string; qr_code: string } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [googleWalletUrl, setGoogleWalletUrl] = useState<string | null>(null)
  const [appleWalletLoading, setAppleWalletLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/business/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.business) setBusiness(data.business)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setPageLoading(false))
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!business) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, business_slug: slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrarse')
      setCustomer(data.customer)
      setStep('success')
      // Generar Google Wallet pass
      fetch(`/api/business/${slug}/wallet/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: data.customer.qr_code,
          customer_name: data.customer.name,
          stamps: 0,
          stamp_goal: business?.stamp_goal ?? 9,
        }),
      })
        .then(r => r.json())
        .then(d => { if (d.url) setGoogleWalletUrl(d.url) })
        .catch(() => {})
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function handleAppleWallet() {
    if (!customer || !business) return
    setAppleWalletLoading(true)
    try {
      const res = await fetch(`/api/business/${slug}/wallet/apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.qr_code,
          customer_name: customer.name,
          stamps: 0,
          stamp_goal: business.stamp_goal ?? 9,
        }),
      })
      if (!res.ok) throw new Error('Error')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `loyalty-${slug}.pkpass`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silencioso
    } finally {
      setAppleWalletLoading(false)
    }
  }

  // --- Loading ---
  if (pageLoading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Cargando...</p>
      </main>
    )
  }

  // --- Not found ---
  if (notFound || !business) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 24 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: 'system-ui' }}>Negocio no encontrado</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'system-ui' }}>El link que usaste no corresponde a ningún programa activo.</p>
      </main>
    )
  }

  const PRIMARY = business.primary_color || '#110DDE'
  const SECONDARY = business.secondary_color || '#EC4E20'
  const ACCENT = business.accent_color || '#F6AE2D'
  const STAMP_ICON = business.stamp_icon || '⭐'
  const FONT = 'system-ui, -apple-system, Helvetica Neue, sans-serif'
  // Nail polish emoji (U+1F485) → usar icono PNG personalizado
  const customStampUrl = STAMP_ICON.codePointAt(0) === 0x1F485
    ? 'https://udcvtwjumcunbgcqnvpn.supabase.co/storage/v1/object/public/logos/mariabonita-unas/stamp-icon.png?v=2'
    : null

  // Detectar si el fondo es oscuro para elegir texto blanco o azul oscuro
  const isColorDark = (hex: string) => {
    const c = (hex || '#000').replace('#', '')
    const r = parseInt(c.slice(0,2), 16)
    const g = parseInt(c.slice(2,4), 16)
    const b = parseInt(c.slice(4,6), 16)
    return (0.299*r + 0.587*g + 0.114*b) / 255 < 0.55
  }
  const isDark = isColorDark(PRIMARY)
  const TEXT       = isDark ? '#ffffff'                    : '#1a3a6e'
  const TEXT65     = isDark ? 'rgba(255,255,255,0.65)'     : 'rgba(26,58,110,0.75)'
  const TEXT50     = isDark ? 'rgba(255,255,255,0.50)'     : 'rgba(26,58,110,0.60)'
  const TEXT25     = isDark ? 'rgba(255,255,255,0.25)'     : 'rgba(26,58,110,0.40)'
  const CARD_BG    = isDark ? 'rgba(255,255,255,0.07)'     : 'rgba(26,58,110,0.07)'
  const CARD_BORDER= isDark ? 'rgba(255,255,255,0.15)'     : 'rgba(26,58,110,0.18)'
  const INPUT_BG   = isDark ? 'rgba(255,255,255,0.08)'     : 'rgba(26,58,110,0.06)'
  const INPUT_BDR  = isDark ? 'rgba(255,255,255,0.18)'     : 'rgba(26,58,110,0.20)'
  const BTN_BG     = isDark ? '#ffffff'                    : '#1a3a6e'
  const BTN_TEXT   = isDark ? PRIMARY                      : '#ffffff'

  // --- Success ---
  if (step === 'success' && customer) {
    const firstName = customer.name.split(' ')[0]
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', background: PRIMARY }}>
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.8); }
            70% { transform: scale(1.04); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes qrPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4), 0 8px 32px rgba(0,0,0,0.2); }
            50% { box-shadow: 0 0 0 8px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.2); }
          }
          @keyframes scanLine {
            0% { top: 4%; opacity: 0.8; }
            80% { opacity: 0.8; }
            100% { top: 92%; opacity: 0; }
          }
          .success-header { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
          .success-body { animation: fadeSlideUp 0.5s ease 0.15s both; }
          .qr-card { animation: qrPulse 2.5s ease-in-out infinite; }
          .scan-line {
            position: absolute; left: 10%; right: 10%; height: 2px;
            background: linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent);
            animation: scanLine 2.5s ease-in-out infinite;
            border-radius: 2px;
          }
        `}</style>

        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          {/* Saludo animado */}
          <div className="success-header">
            {business.logo_url && (
              <img src={business.logo_url} alt={business.name} style={{ height: 83, width: 'auto', marginBottom: 16, objectFit: 'contain', display: 'block', margin: '0 auto 16px' }} />
            )}
            {!business.logo_url && (
              <h2 style={{ color: TEXT65, fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: FONT, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{business.name}</h2>
            )}
            <h2 style={{ color: TEXT, fontSize: 30, fontWeight: 900, marginBottom: 6, fontFamily: FONT, letterSpacing: '-0.02em' }}>
              ¡Listo, {firstName}!
            </h2>
            <p style={{ color: TEXT65, fontSize: 14, marginBottom: 28, fontFamily: FONT }}>
              Ya eres parte del club de lealtad
            </p>
          </div>

          {/* QR con efecto */}
          <div className="success-body">
            <div className="qr-card" style={{
              background: '#fff', padding: 20, borderRadius: 20,
              display: 'inline-block', marginBottom: 16, position: 'relative', overflow: 'hidden',
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${customer.qr_code}&color=${ACCENT.replace('#', '')}`}
                alt="Tu QR de lealtad"
                width={220}
                height={220}
                style={{ display: 'block', borderRadius: 8 }}
              />
              <div className="scan-line" />
            </div>

            <p style={{ color: TEXT, fontWeight: 700, fontSize: 15, marginBottom: 4, fontFamily: FONT }}>
              Muestra este QR en cada visita
            </p>
            <p style={{ color: TEXT50, fontSize: 13, marginBottom: 10, fontFamily: FONT }}>
              para acumular tus sellos y ganar premios
            </p>
            <p style={{ color: ACCENT, fontSize: 11, fontFamily: 'monospace', marginBottom: 4 }}>{customer.qr_code}</p>

            {/* Botones Wallet */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={`/api/business/${slug}/wallet/apple?customer_id=${encodeURIComponent(customer.qr_code)}&customer_name=${encodeURIComponent(customer.name)}&stamps=0&stamp_goal=${business.stamp_goal ?? 9}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#000', color: '#fff', padding: '10px 18px',
                  borderRadius: 10, textDecoration: 'none', fontFamily: FONT,
                  fontWeight: 700, fontSize: 13, width: '100%', boxSizing: 'border-box',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Agregar a Apple Wallet
              </a>
              {googleWalletUrl && (
                <a
                  href={googleWalletUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: '#fff', color: '#1a1a1a', padding: '10px 18px',
                    borderRadius: 10, textDecoration: 'none', fontFamily: FONT,
                    fontWeight: 700, fontSize: 13, width: '100%', boxSizing: 'border-box',
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Agregar a Google Wallet
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // --- Form ---
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', background: PRIMARY }}>

      {/* Logo o nombre */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        {business.logo_url
          ? <img src={business.logo_url} alt={business.name} style={{ height: 98, width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
          : <h1 style={{ color: TEXT, fontSize: 28, fontWeight: 900, textAlign: 'center', fontFamily: FONT, letterSpacing: '-0.03em', margin: 0 }}>{business.name}</h1>
        }
        {business.tagline && (
          <p style={{ color: TEXT65, fontSize: 13, marginTop: 8, fontFamily: FONT }}>{business.tagline}</p>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Card */}
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 28 }}>

          <h2 style={{ color: TEXT, fontSize: 26, fontWeight: 900, textAlign: 'center', marginBottom: 4, fontFamily: FONT, letterSpacing: '-0.02em' }}>
            Únete al club
          </h2>
          <p style={{ color: ACCENT, fontSize: 13, textAlign: 'center', marginBottom: 24, fontFamily: FONT }}>
            Junta {business.stamp_goal} sellos y gana
          </p>

          {/* Stamp preview */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
            {Array.from({ length: business.stamp_goal }).map((_, i) => {
              const isLast = i === business.stamp_goal - 1
              return (
                <div key={i} style={{ width: 30, height: 30, border: `2px solid ${isLast ? ACCENT : TEXT25}`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isLast ? `${ACCENT}18` : 'transparent' }}>
                  {customStampUrl ? (
                    <img src={customStampUrl} alt="" width={16} height={16} style={{ objectFit: 'contain', opacity: isLast ? 1 : 0.2 }} />
                  ) : SVG_STAMP_PATHS[STAMP_ICON] ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ opacity: isLast ? 1 : 0.22 }}>
                      <path d={SVG_STAMP_PATHS[STAMP_ICON]} />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 14, lineHeight: 1, opacity: isLast ? 1 : 0.22 }}>{STAMP_ICON}</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Nombre', key: 'name', type: 'text', placeholder: '¿Cómo te llamas?', required: true },
              { label: 'WhatsApp / Teléfono', key: 'phone', type: 'tel', placeholder: '55 1234 5678', required: true },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'tu@email.com', required: true },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: TEXT50, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: FONT }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: 16, color: TEXT,
                    background: INPUT_BG, border: `1px solid ${INPUT_BDR}`,
                    borderRadius: 10, outline: 'none', fontFamily: FONT,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            {error && (
              <p style={{ fontSize: 13, textAlign: 'center', padding: '10px 14px', background: `${SECONDARY}25`, color: SECONDARY, borderRadius: 8, fontFamily: FONT }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !form.name || !form.phone || !form.email}
              style={{
                width: '100%', padding: '15px', fontSize: 16, fontWeight: 800,
                color: BTN_TEXT, background: BTN_BG, border: 'none',
                borderRadius: 10, cursor: loading || !form.name || !form.phone || !form.email ? 'not-allowed' : 'pointer',
                opacity: loading || !form.name || !form.phone || !form.email ? 0.5 : 1,
                fontFamily: FONT, letterSpacing: '-0.01em',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Creando tu tarjeta...' : 'Quiero mi tarjeta'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: TEXT25, marginTop: 16, fontFamily: FONT }}>
          Tus datos están protegidos y no serán compartidos
        </p>
      </div>
    </main>
  )
}
