'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45
}

const BRAND_COLORS = [
  { label: 'Morado', value: '#6366f1' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Rojo', value: '#ef4444' },
  { label: 'Naranja', value: '#ea580c' },
  { label: 'Café', value: '#92400e' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Negro', value: '#1a1a1a' },
]

const ACCENT_COLORS = [
  { label: 'Dorado', value: '#f59e0b' },
  { label: 'Naranja', value: '#fb923c' },
  { label: 'Coral', value: '#f43f5e' },
  { label: 'Lima', value: '#a3e635' },
  { label: 'Menta', value: '#34d399' },
  { label: 'Cian', value: '#38bdf8' },
  { label: 'Lavanda', value: '#c084fc' },
  { label: 'Blanco', value: '#f8fafc' },
]

const FONT = 'system-ui, -apple-system, Helvetica Neue, sans-serif'

function CardPreview({ name, primary, accent, goal, reward }: {
  name: string; primary: string; accent: string; goal: number; reward: string
}) {
  const filled = Math.floor(goal * 0.4)
  const displayGoal = Math.min(goal, 10)
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: primary, boxShadow: `0 12px 40px ${primary}55`, transition: 'all 0.4s ease' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, margin: 0, fontFamily: FONT }}>
          Easy Loyalty
        </p>
        <p style={{ color: '#fff', fontSize: 16, fontWeight: 900, margin: '3px 0 0', letterSpacing: '-0.02em', fontFamily: FONT }}>
          {name || 'Tu negocio'}
        </p>
      </div>
      <div style={{ padding: '12px 16px 14px' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {Array.from({ length: displayGoal }).map((_, i) => (
            <div key={i} style={{
              width: 22, height: 22, borderRadius: '50%',
              background: i < filled ? accent : 'rgba(255,255,255,0.12)',
              border: `1.5px solid ${i < filled ? accent : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: i < filled ? `0 2px 8px ${accent}60` : 'none',
            }}>
              {i < filled && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke={isColorDark(accent) ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.55)'}
                  strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontFamily: FONT }}>
          <span style={{ color: accent, fontSize: 11, fontWeight: 800 }}>
            {goal - filled} sellos más
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
            {' → '}{reward || 'tu premio'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ name: string; slug: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [slugError, setSlugError] = useState('')
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([])
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const timerPassword = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerConfirm = useRef<ReturnType<typeof setTimeout> | null>(null)

  function toggleShow(
    current: boolean,
    setter: (v: boolean) => void,
    timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) {
    if (current) {
      if (timer.current) clearTimeout(timer.current)
      setter(false)
    } else {
      setter(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setter(false), 2000)
    }
  }

  function generateSuggestions(slug: string): string[] {
    const rand = Math.floor(100 + Math.random() * 900)
    return [`${slug}-2`, `${slug}-mx`, `${slug}-${rand}`]
  }

  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    primary_color: '#6366f1',
    accent_color: '#f59e0b',
    stamp_goal: '10',
    reward_description: '',
    admin_password: '',
    admin_password_confirm: '',
  })

  function set(field: string, value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name') {
        next.slug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      }
      return next
    })
  }

  useEffect(() => {
    const slug = form.slug
    if (!slug || slug.length < 2) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    if (checkTimer.current) clearTimeout(checkTimer.current)
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        if (data.available) {
          setSlugStatus('available')
          setSlugError('')
          setSlugSuggestions([])
        } else {
          setSlugStatus('taken')
          setSlugError('Esa dirección ya la usa otro negocio')
          setSlugSuggestions(generateSuggestions(slug))
        }
      } catch {
        setSlugStatus('idle')
      }
    }, 600)
  }, [form.slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.admin_password !== form.admin_password_confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.admin_password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          tagline: form.tagline,
          primary_color: form.primary_color,
          accent_color: form.accent_color,
          stamp_goal: form.stamp_goal,
          reward_description: form.reward_description,
          admin_password: form.admin_password,
        }),
      })
      const data = await res.json()
      if (res.status === 409) {
        // URL duplicada — regresar al paso 1 con sugerencias
        setStep(1)
        setSlugError('Esa dirección ya la usa otro negocio')
        setSlugSuggestions(generateSuggestions(form.slug))
        return
      }
      if (!res.ok) throw new Error(data.error)
      setDone({ name: data.business.name, slug: data.business.slug })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function copyUrl(path: string, key: string) {
    navigator.clipboard.writeText(`https://easyloyalty.io${path}`).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const color = form.primary_color
  const accent = form.accent_color
  const btnBg = isColorDark(color) ? '#fff' : color
  const btnColor = isColorDark(color) ? color : '#fff'

  // ── Success screen ─────────────────────────────────────────────
  if (done) {
    const links = [
      { label: 'Tarjeta para tus clientes', path: `/${done.slug}`, key: 'card' },
      { label: 'Tu panel de control', path: `/${done.slug}/admin`, key: 'admin' },
      { label: 'Scanner de sellos', path: `/${done.slug}/scanner`, key: 'scanner' },
    ]
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', background: `linear-gradient(135deg, ${color}cc 0%, #060606 100%)`, fontFamily: FONT }}>
        <style>{`
          @keyframes popIn { from { transform: scale(0.4); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          @keyframes fadeUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        `}</style>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 56, marginBottom: 14, display: 'inline-block', animation: 'popIn 0.55s cubic-bezier(0.34,1.56,0.64,1)' }}>🎉</div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.03em', animation: 'fadeUp 0.4s ease 0.15s both' }}>
              ¡{done.name} ya tiene lealtad!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, animation: 'fadeUp 0.4s ease 0.25s both' }}>
              Tu programa está activo. Comparte estas URLs.
            </p>
          </div>

          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 14, animation: 'fadeUp 0.4s ease 0.35s both' }}>
            {links.map(({ label, path, key }, i) => (
              <div
                key={key}
                onClick={() => copyUrl(path, key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', cursor: 'pointer',
                  borderBottom: i < links.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  background: copied === key ? 'rgba(255,255,255,0.04)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>
                    {label}
                  </p>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    easyloyalty.io{path}
                  </p>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0, marginLeft: 12,
                  background: copied === key ? `${accent}25` : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${copied === key ? accent : 'rgba(255,255,255,0.10)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s',
                }}>
                  {copied === key ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, animation: 'fadeUp 0.4s ease 0.45s both' }}>
            <button
              onClick={() => router.push(`/${done.slug}`)}
              style={{ flex: 1, padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer', fontFamily: FONT }}>
              Ver tarjeta
            </button>
            <button
              onClick={() => router.push(`/${done.slug}/admin`)}
              style={{ flex: 2, padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 14, color: btnColor, background: btnBg, border: 'none', cursor: 'pointer', fontFamily: FONT, letterSpacing: '-0.01em' }}>
              Ir a mi panel →
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Form ────────────────────────────────────────────────────────
  const STEPS = [
    { n: 1, label: 'Negocio' },
    { n: 2, label: 'Programa' },
    { n: 3, label: 'Acceso' },
  ]

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', background: `linear-gradient(135deg, ${color}cc 0%, #060606 100%)`, fontFamily: FONT, transition: 'background 0.6s ease' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: step === 1 ? 6 : 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 11,
              background: isColorDark(color) ? '#fff' : 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={isColorDark(color) ? color : '#fff'}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span style={{ color: '#fff', fontSize: 19, fontWeight: 900, letterSpacing: '-0.03em' }}>Easy Loyalty</span>
          </div>
          {step === 1 && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>Crea tu programa de lealtad en minutos</p>}
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
          {STEPS.map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, transition: 'all 0.35s ease',
                  background: step > n ? (isColorDark(color) ? '#fff' : color) : step === n ? (isColorDark(color) ? '#fff' : color) : 'rgba(255,255,255,0.08)',
                  color: step >= n ? (isColorDark(color) ? color : '#fff') : 'rgba(255,255,255,0.2)',
                  opacity: step < n ? 0.4 : 1,
                  boxShadow: step === n ? `0 0 20px ${color}70` : 'none',
                  outline: step === n ? `2px solid rgba(255,255,255,0.35)` : 'none',
                  outlineOffset: '3px',
                }}>
                  {step > n ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke={isColorDark(color) ? color : '#fff'}
                      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : n}
                </div>
                <span style={{ color: step >= n ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 0.3s' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1.5, borderRadius: 1, marginTop: 13, marginBottom: 16,
                  background: step > n ? (isColorDark(color) ? 'rgba(255,255,255,0.5)' : color) : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.35s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit}>
          <div style={{ borderRadius: 24, padding: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ── PASO 1 ── */}
            {step === 1 && (
              <>
                <div>
                  <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Tu negocio</h2>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>Cuéntanos sobre tu local</p>
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Nombre del negocio *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Ej. Café Luna"
                    required
                    style={{ width: '100%', borderRadius: 12, padding: '13px 14px', color: '#fff', outline: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 16, fontFamily: FONT, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Dirección de tu tarjeta *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', borderRadius: 12, overflow: 'hidden', border: `1px solid ${slugStatus === 'taken' ? 'rgba(239,68,68,0.5)' : slugStatus === 'available' ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.12)'}`, background: 'rgba(255,255,255,0.08)', transition: 'border 0.3s' }}>
                    <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, padding: '13px 12px', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      easyloyalty.io/
                    </span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="mi-negocio"
                      required
                      style={{ flex: 1, padding: '13px 10px', color: '#fff', outline: 'none', background: 'transparent', border: 'none', fontSize: 16, fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                    {/* Indicador de estado */}
                    <div style={{ paddingRight: 12, flexShrink: 0 }}>
                      {slugStatus === 'checking' && (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.5)', animation: 'spin 0.7s linear infinite' }} />
                      )}
                      {slugStatus === 'available' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {slugStatus === 'taken' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  {slugStatus === 'available' && (
                    <p style={{ color: '#34d399', fontSize: 11, fontWeight: 600, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Dirección disponible
                    </p>
                  )}

                  {slugStatus === 'taken' && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ color: '#f87171', fontSize: 12, fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {slugError}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '0 0 7px' }}>Prueba con alguna de estas:</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {slugSuggestions.map(s => (
                          <button key={s} type="button"
                            onClick={() => set('slug', s)}
                            style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Slogan <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={e => set('tagline', e.target.value)}
                    placeholder="Ej. El mejor café de la colonia"
                    style={{ width: '100%', borderRadius: 12, padding: '13px 14px', color: '#fff', outline: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 16, fontFamily: FONT, boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => { if (form.name && form.slug && slugStatus !== 'taken') setStep(2) }}
                  disabled={!form.name || !form.slug || slugStatus === 'taken' || slugStatus === 'checking'}
                  style={{ width: '100%', padding: '15px 0', borderRadius: 14, fontWeight: 900, fontSize: 15, cursor: (!form.name || !form.slug || slugStatus === 'taken' || slugStatus === 'checking') ? 'not-allowed' : 'pointer', opacity: (!form.name || !form.slug || slugStatus === 'taken' || slugStatus === 'checking') ? 0.35 : 1, border: 'none', fontFamily: FONT, letterSpacing: '-0.01em', background: btnBg, color: btnColor, transition: 'opacity 0.2s' }}>
                  Siguiente →
                </button>
              </>
            )}

            {/* ── PASO 2 ── */}
            {step === 2 && (
              <>
                <div>
                  <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Tu programa</h2>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>Personaliza la experiencia de tus clientes</p>
                </div>

                {/* Color principal */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Color principal
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
                    {BRAND_COLORS.map(c => (
                      <button key={c.value} type="button" onClick={() => set('primary_color', c.value)}
                        style={{ height: 30, borderRadius: 7, background: c.value, cursor: 'pointer', border: 'none', padding: 0, transition: 'all 0.2s', outline: form.primary_color === c.value ? '2.5px solid white' : '2px solid transparent', outlineOffset: '2px', transform: form.primary_color === c.value ? 'scale(1.18)' : 'scale(1)', boxShadow: c.value === '#1a1a1a' ? 'inset 0 0 0 1px rgba(255,255,255,0.15)' : 'none' }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Color de acento */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Color de acento
                    <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, fontWeight: 500, marginLeft: 7, textTransform: 'none', letterSpacing: 0 }}>botones y sellos</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
                    {ACCENT_COLORS.map(c => (
                      <button key={c.value} type="button" onClick={() => set('accent_color', c.value)}
                        style={{ height: 30, borderRadius: 7, background: c.value, cursor: 'pointer', border: 'none', padding: 0, transition: 'all 0.2s', outline: form.accent_color === c.value ? '2.5px solid white' : '2px solid transparent', outlineOffset: '2px', transform: form.accent_color === c.value ? 'scale(1.18)' : 'scale(1)', boxShadow: c.value === '#f8fafc' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none' }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Sellos */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Sellos para el premio *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {['5', '8', '10', '12'].map(n => (
                      <button key={n} type="button" onClick={() => set('stamp_goal', n)}
                        style={{
                          padding: '11px 0', borderRadius: 10, fontSize: 16, fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', fontFamily: FONT, border: 'none',
                          background: form.stamp_goal === n ? accent : 'rgba(255,255,255,0.07)',
                          color: form.stamp_goal === n ? (isColorDark(accent) ? '#fff' : 'rgba(0,0,0,0.75)') : 'rgba(255,255,255,0.35)',
                          transform: form.stamp_goal === n ? 'scale(1.06)' : 'scale(1)',
                          boxShadow: form.stamp_goal === n ? `0 4px 16px ${accent}50` : 'none',
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Premio */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    ¿Cuál es el premio? *
                  </label>
                  <input
                    type="text"
                    value={form.reward_description}
                    onChange={e => set('reward_description', e.target.value)}
                    placeholder="Ej. 1 café gratis"
                    required
                    style={{ width: '100%', borderRadius: 12, padding: '13px 14px', color: '#fff', outline: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 16, fontFamily: FONT, boxSizing: 'border-box' }}
                  />
                </div>

                {/* Preview */}
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                    Así verán tu tarjeta
                  </p>
                  <CardPreview
                    name={form.name}
                    primary={color}
                    accent={accent}
                    goal={parseInt(form.stamp_goal)}
                    reward={form.reward_description}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setStep(1)}
                    style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: FONT }}>
                    ← Atrás
                  </button>
                  <button type="button"
                    onClick={() => { if (form.reward_description) setStep(3) }}
                    disabled={!form.reward_description}
                    style={{ flex: 2, padding: '13px 0', borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: !form.reward_description ? 'not-allowed' : 'pointer', opacity: !form.reward_description ? 0.35 : 1, border: 'none', fontFamily: FONT, letterSpacing: '-0.01em', background: btnBg, color: btnColor, transition: 'opacity 0.2s' }}>
                    Siguiente →
                  </button>
                </div>
              </>
            )}

            {/* ── PASO 3 ── */}
            {step === 3 && (
              <>
                <div>
                  <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Acceso a tu panel</h2>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>Solo tú tendrás esta contraseña</p>
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Contraseña *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.admin_password}
                      onChange={e => set('admin_password', e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      style={{ width: '100%', borderRadius: 12, padding: '13px 44px 13px 14px', color: '#fff', outline: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 16, fontFamily: FONT, boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => toggleShow(showPassword, setShowPassword, timerPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Confirmar contraseña *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      value={form.admin_password_confirm}
                      onChange={e => set('admin_password_confirm', e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      style={{ width: '100%', borderRadius: 12, padding: '13px 44px 13px 14px', color: '#fff', outline: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 16, fontFamily: FONT, boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => toggleShow(showPasswordConfirm, setShowPasswordConfirm, timerConfirm)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {showPasswordConfirm ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p style={{ fontSize: 13, textAlign: 'center', padding: '11px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#f87171', margin: 0, border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setStep(2)}
                    style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: FONT }}>
                    ← Atrás
                  </button>
                  <button type="submit"
                    disabled={loading || !form.admin_password || !form.admin_password_confirm}
                    style={{ flex: 2, padding: '13px 0', borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: loading || !form.admin_password || !form.admin_password_confirm ? 'not-allowed' : 'pointer', opacity: loading || !form.admin_password || !form.admin_password_confirm ? 0.35 : 1, border: 'none', fontFamily: FONT, letterSpacing: '-0.01em', background: btnBg, color: btnColor, transition: 'opacity 0.2s' }}>
                    {loading ? 'Creando...' : '¡Crear programa!'}
                  </button>
                </div>
              </>
            )}

          </div>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.12)', fontSize: 11, marginTop: 24, letterSpacing: '0.04em' }}>
          Easy Loyalty · Plataforma de lealtad digital
        </p>
      </div>
    </main>
  )
}
