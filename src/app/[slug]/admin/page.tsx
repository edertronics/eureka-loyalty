'use client'

import { useState, useEffect, useRef, use } from 'react'

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
}

interface Customer {
  id: string
  name: string
  stamps: number
  total_stamps: number
  rewards_redeemed: number
  created_at: string
  last_stamp_at: string | null
}

interface Stats {
  business: Business
  total_customers: number
  total_stamps: number
  total_rewards: number
  recent_customers: Customer[]
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

const STAMP_ICONS = [
  { label: 'Estrella', emoji: '⭐' },
  { label: 'Hamburguesa', emoji: '🍔' },
  { label: 'Café', emoji: '☕' },
  { label: 'Corazón', emoji: '❤️' },
  { label: 'Uña', emoji: '💅' },
  { label: 'Pizza', emoji: '🍕' },
  { label: 'Tijeras', emoji: '✂️' },
  { label: 'Patita', emoji: '🐾' },
  { label: 'Diamante', emoji: '💎' },
  { label: 'Taco', emoji: '🌮' },
  { label: 'Flor', emoji: '🌸' },
  { label: 'Corona', emoji: '👑' },
  { label: 'Helado', emoji: '🍦' },
  { label: 'Ramen', emoji: '🍜' },
  { label: 'Gym', emoji: '💪' },
  { label: 'Libro', emoji: '📚' },
]

export default function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const timerPassword = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [showPersonalizar, setShowPersonalizar] = useState(false)
  const [pForm, setPForm] = useState({ name: '', tagline: '', primary_color: '', accent_color: '', stamp_goal: 10, reward_description: '', new_password: '', logo_url: '', stamp_icon: '⭐', strip_image_url: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const timerNewPassword = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [stripFile, setStripFile] = useState<File | null>(null)
  const [stripPreview, setStripPreview] = useState<string | null>(null)

  function toggleNewPassword() {
    if (showNewPassword) {
      if (timerNewPassword.current) clearTimeout(timerNewPassword.current)
      setShowNewPassword(false)
    } else {
      setShowNewPassword(true)
      if (timerNewPassword.current) clearTimeout(timerNewPassword.current)
      timerNewPassword.current = setTimeout(() => setShowNewPassword(false), 2000)
    }
  }

  function togglePassword() {
    if (showPassword) {
      if (timerPassword.current) clearTimeout(timerPassword.current)
      setShowPassword(false)
    } else {
      setShowPassword(true)
      if (timerPassword.current) clearTimeout(timerPassword.current)
      timerPassword.current = setTimeout(() => setShowPassword(false), 2000)
    }
  }

  useEffect(() => {
    fetch(`/api/business/${slug}/stats`)
      .then(r => {
        if (r.ok) r.json().then(data => {
          setStats(data)
          setAuthed(true)
          const b = data.business
          setPForm({ name: b.name ?? '', tagline: b.tagline ?? '', primary_color: b.primary_color ?? '#6366f1', accent_color: b.accent_color ?? '#f59e0b', stamp_goal: b.stamp_goal ?? 10, reward_description: b.reward_description ?? '', new_password: '', logo_url: b.logo_url ?? '', stamp_icon: (b as { stamp_icon?: string }).stamp_icon ?? '⭐', strip_image_url: (b as { strip_image_url?: string }).strip_image_url ?? '' })
        })
        setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [slug])

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleStripSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStripFile(file)
    if (stripPreview) URL.revokeObjectURL(stripPreview)
    setStripPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    try {
      let logoUrl = pForm.logo_url
      if (logoFile) {
        const fd = new FormData()
        fd.append('logo', logoFile)
        const uploadRes = await fetch(`/api/business/${slug}/upload-logo`, {
          method: 'POST',
          body: fd,
        })
        if (!uploadRes.ok) {
          const d = await uploadRes.json()
          setSaveMsg({ type: 'err', text: d.error ?? 'Error subiendo logo' })
          return
        }
        const { logo_url } = await uploadRes.json()
        logoUrl = logo_url
        setLogoFile(null)
        if (logoPreview) { URL.revokeObjectURL(logoPreview); setLogoPreview(null) }
      }
      let stripUrl = pForm.strip_image_url
      if (stripFile) {
        const fd = new FormData()
        fd.append('strip', stripFile)
        const uploadRes = await fetch(`/api/business/${slug}/upload-strip`, {
          method: 'POST',
          body: fd,
        })
        if (!uploadRes.ok) {
          const d = await uploadRes.json()
          setSaveMsg({ type: 'err', text: d.error ?? 'Error subiendo imagen de Wallet' })
          return
        }
        const { strip_image_url } = await uploadRes.json()
        stripUrl = strip_image_url
        setStripFile(null)
        if (stripPreview) { URL.revokeObjectURL(stripPreview); setStripPreview(null) }
      }
      const res = await fetch(`/api/business/${slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pForm, logo_url: logoUrl, strip_image_url: stripUrl }),
      })
      if (!res.ok) {
        const d = await res.json()
        setSaveMsg({ type: 'err', text: d.error ?? 'Error al guardar' })
      } else {
        setSaveMsg({ type: 'ok', text: '¡Cambios guardados!' })
        const updated = await fetch(`/api/business/${slug}/stats`).then(r => r.json())
        setStats(updated)
        setPForm(f => ({ ...f, new_password: '', logo_url: logoUrl ?? '', strip_image_url: stripUrl ?? '' }))
        setTimeout(() => setSaveMsg(null), 3000)
      }
    } catch {
      setSaveMsg({ type: 'err', text: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch(`/api/business/${slug}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setStatsLoading(true)
      setAuthed(true)
      fetch(`/api/business/${slug}/stats`)
        .then(r => r.json())
        .then(data => { setStats(data); setStatsLoading(false) })
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoginLoading(false)
    }
  }

  const primary = stats?.business?.primary_color ?? '#1a1a2e'
  const secondary = stats?.business?.secondary_color ?? '#e94560'
  const accent = stats?.business?.accent_color ?? '#f5a623'

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}ee, #0a0a0a)` }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
      </main>
    )
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: `linear-gradient(135deg, ${primary}dd 0%, #080808 100%)` }}>

        <div className="mb-8 text-center">
          {stats?.business?.logo_url ? (
            <img src={stats.business.logo_url} alt={stats?.business?.name ?? slug} className="h-16 w-auto mx-auto mb-3" />
          ) : (
            <div className="text-white font-black text-2xl mb-1">{slug}</div>
          )}
        </div>

        <div className="w-full max-w-sm rounded-2xl p-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }}>

          <h1 className="text-white font-bold text-lg text-center mb-1">Panel de control</h1>
          <p className="text-white/40 text-sm text-center mb-6">Acceso restringido</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-white text-center outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 16, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={togglePassword}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: showPassword ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>

            {loginError && (
              <p className="text-sm text-center py-2 px-3 rounded-lg"
                style={{ backgroundColor: `${secondary}25`, color: secondary }}>
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 rounded-xl font-black text-white uppercase tracking-widest text-sm transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: secondary }}>
              {loginLoading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  const business = stats?.business

  return (
    <main className="min-h-screen px-4 py-8"
      style={{ background: `linear-gradient(135deg, ${primary}cc 0%, #080808 100%)` }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {business?.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="h-10 w-auto" />
            ) : (
              <span className="text-white font-black text-xl">{business?.name ?? slug}</span>
            )}
            <span className="text-white/40 text-sm">· Dashboard</span>
          </div>
          <div className="flex gap-2">
            <a href={`/${slug}`} target="_blank"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              Ver tarjeta
            </a>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a href="#clientes" className="block no-underline">
            <KPICard value={stats?.total_customers ?? 0} label="Clientes" color={primary} />
          </a>
          <a href="#clientes" className="block no-underline">
            <KPICard value={stats?.total_stamps ?? 0} label="Sellos dados" color={accent} />
          </a>
          <a href="#clientes" className="block no-underline">
            <KPICard value={stats?.total_rewards ?? 0} label="Premios" color={accent} />
          </a>
        </div>

        {/* Premio activo */}
        {business?.reward_description && (
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
            style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}40` }}>
            <div className="text-2xl">🎁</div>
            <div>
              <p className="text-xs text-white/50 mb-0.5">Premio al completar {business.stamp_goal} sellos</p>
              <p className="text-white font-bold text-sm">{business.reward_description}</p>
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a href={`/${slug}/scanner`}
            className="py-3 rounded-xl font-bold text-white text-sm text-center transition-all active:scale-95"
            style={{ backgroundColor: primary }}>
            Abrir scanner
          </a>
          <a href={`/${slug}`} target="_blank"
            className="py-3 rounded-xl font-semibold text-sm text-center transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
            + Registrar cliente
          </a>
        </div>

        {/* Personalizar */}
        <div className="mb-6">
          <button
            onClick={() => setShowPersonalizar(v => !v)}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Personalizar mi programa
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showPersonalizar ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showPersonalizar && (
            <form onSubmit={handleSave} style={{ marginTop: 12, borderRadius: 16, padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>

              {/* Vista previa en tiempo real */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Vista previa de la tarjeta</p>
              <CardPreview
                primaryColor={pForm.primary_color || '#6366f1'}
                accentColor={pForm.accent_color || '#f59e0b'}
                name={pForm.name}
                tagline={pForm.tagline}
                logoPreview={logoPreview}
                logoUrl={pForm.logo_url}
                stampGoal={pForm.stamp_goal}
                rewardDescription={pForm.reward_description}
                stampIcon={pForm.stamp_icon}
              />

              {/* Logo */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Logo</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {(logoPreview || pForm.logo_url) ? (
                    <img src={logoPreview || pForm.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'inline-block', cursor: 'pointer', padding: '8px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    {logoPreview ? 'Cambiar imagen' : pForm.logo_url ? 'Reemplazar logo' : 'Seleccionar imagen'}
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" onChange={handleLogoSelect} style={{ display: 'none' }} />
                  </label>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: 0 }}>PNG, JPG, SVG o WebP · Máx 2MB</p>
                  {pForm.logo_url && !logoPreview && (
                    <button type="button" onClick={() => setPForm(f => ({ ...f, logo_url: '' }))}
                      style={{ marginTop: 6, background: 'none', border: 'none', color: 'rgba(239,68,68,0.7)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                      Quitar logo
                    </button>
                  )}
                </div>
              </div>

              {/* Foto para Apple Wallet (strip image) */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Foto Apple Wallet</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 12 }}>Aparece como banner en la tarjeta de Apple Wallet</p>
              <div style={{ marginBottom: 24 }}>
                {(stripPreview || pForm.strip_image_url) ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 10, height: 100 }}>
                    <img src={stripPreview || pForm.strip_image_url} alt="Strip" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
                      <label style={{ cursor: 'pointer', padding: '5px 10px', borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 11, fontWeight: 600 }}>
                        Cambiar
                        <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleStripSelect} style={{ display: 'none' }} />
                      </label>
                      <button type="button" onClick={() => { setPForm(f => ({ ...f, strip_image_url: '' })); setStripFile(null); if (stripPreview) { URL.revokeObjectURL(stripPreview); setStripPreview(null) } }}
                        style={{ padding: '5px 10px', borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.4)', border: '1px solid rgba(239,68,68,0.5)', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, height: 90, borderRadius: 12, border: '2px dashed rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Seleccionar foto</span>
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleStripSelect} style={{ display: 'none' }} />
                  </label>
                )}
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 6 }}>PNG o JPG · Máx 5MB · Recomendado 1125×432px (horizontal)</p>
              </div>

              {/* Información básica */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Información básica</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <input
                  value={pForm.name}
                  onChange={e => setPForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre del negocio"
                  style={{ width: '100%', borderRadius: 10, padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ position: 'relative' }}>
                  <input
                    value={pForm.tagline}
                    onChange={e => setPForm(f => ({ ...f, tagline: e.target.value }))}
                    placeholder="Slogan (dejar vacío para no mostrar)"
                    style={{ width: '100%', borderRadius: 10, padding: '10px 36px 10px 14px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
                  />
                  {pForm.tagline && (
                    <button type="button" onClick={() => setPForm(f => ({ ...f, tagline: '' }))}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 16, lineHeight: 1, padding: 4 }}>
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Color principal */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Color principal</p>
              <ColorPicker value={pForm.primary_color} onChange={v => setPForm(f => ({ ...f, primary_color: v }))} presets={BRAND_COLORS} />

              {/* Color de acento */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 20 }}>Color de acento</p>
              <ColorPicker value={pForm.accent_color} onChange={v => setPForm(f => ({ ...f, accent_color: v }))} presets={ACCENT_COLORS} />

              {/* Ícono de sellos */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 20 }}>Ícono de sellos</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {STAMP_ICONS.map(icon => (
                  <button key={icon.emoji} type="button" title={icon.label}
                    onClick={() => setPForm(f => ({ ...f, stamp_icon: icon.emoji }))}
                    style={{
                      width: 44, height: 44, borderRadius: 10, fontSize: 22, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: pForm.stamp_icon === icon.emoji ? '2px solid white' : '2px solid rgba(255,255,255,0.12)',
                      background: pForm.stamp_icon === icon.emoji ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)',
                      transform: pForm.stamp_icon === icon.emoji ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}>
                    {icon.emoji}
                  </button>
                ))}
              </div>

              {/* Premio */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Premio</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, whiteSpace: 'nowrap' }}>Sellos para ganar:</span>
                  <input
                    type="number" min={1} max={50}
                    value={pForm.stamp_goal}
                    onChange={e => setPForm(f => ({ ...f, stamp_goal: parseInt(e.target.value) || 10 }))}
                    style={{ width: 70, borderRadius: 10, padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 16, outline: 'none', textAlign: 'center' }}
                  />
                </div>
                <input
                  value={pForm.reward_description}
                  onChange={e => setPForm(f => ({ ...f, reward_description: e.target.value }))}
                  placeholder="Descripción del premio"
                  style={{ width: '100%', borderRadius: 10, padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Contraseña */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Nueva contraseña <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(dejar vacío para no cambiarla)</span></p>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={pForm.new_password}
                  onChange={e => setPForm(f => ({ ...f, new_password: e.target.value }))}
                  placeholder="Nueva contraseña"
                  style={{ width: '100%', borderRadius: 10, padding: '10px 44px 10px 14px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={toggleNewPassword}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: showNewPassword ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                  {showNewPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Feedback */}
              {saveMsg && (
                <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, fontSize: 14, textAlign: 'center', backgroundColor: saveMsg.type === 'ok' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: saveMsg.type === 'ok' ? '#34d399' : '#ef4444', border: `1px solid ${saveMsg.type === 'ok' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  {saveMsg.text}
                </div>
              )}

              <button type="submit" disabled={saving || !pForm.name}
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: primary, color: 'white' }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          )}
        </div>

        {/* Lista de clientes */}
        <div id="clientes" className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-white font-bold text-sm">Clientes registrados</h2>
            <span className="text-white/40 text-xs">{stats?.total_customers ?? 0} total</span>
          </div>

          {statsLoading ? (
            <div className="px-4 py-8 text-center text-white/40 text-sm">Cargando...</div>
          ) : !stats?.recent_customers?.length ? (
            <div className="px-4 py-10 text-center">
              <p className="text-white/30 text-sm">Aún no hay clientes registrados</p>
              <p className="text-white/20 text-xs mt-1">Comparte el link de registro con tus clientes</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {stats.recent_customers.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">{c.name}</p>
                    <p className="text-white/40 text-xs">
                      Registrado {new Date(c.created_at).toLocaleDateString('es-MX')}
                      {c.last_stamp_at && ` · último sello ${new Date(c.last_stamp_at).toLocaleDateString('es-MX')}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: secondary }}>
                      {c.stamps}/{business?.stamp_goal ?? 9} sellos
                    </p>
                    {c.rewards_redeemed > 0 && (
                      <p className="text-xs" style={{ color: accent }}>{c.rewards_redeemed} premios</p>
                    )}
                    {c.total_stamps > 0 && (
                      <p className="text-xs text-white/30">{c.total_stamps} total histórico</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">Easy Loyalty · Panel de {business?.name ?? slug}</p>
      </div>
    </main>
  )
}

function CardPreview({ primaryColor, accentColor, name, tagline, logoPreview, logoUrl, stampGoal, rewardDescription, stampIcon }: {
  primaryColor: string; accentColor: string; name: string; tagline: string
  logoPreview: string | null; logoUrl: string; stampGoal: number; rewardDescription: string; stampIcon: string
}) {
  const displayLogo = logoPreview || logoUrl || null
  const filled = Math.max(1, Math.floor(stampGoal * 0.4))
  return (
    <div style={{ borderRadius: 18, background: primaryColor, padding: '18px 16px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 8, right: 10, background: 'rgba(0,0,0,0.35)', borderRadius: 6, padding: '3px 8px', fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
        Vista previa
      </div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        {displayLogo
          ? <img src={displayLogo} alt={name} style={{ height: 40, maxWidth: '65%', objectFit: 'contain', display: 'block', margin: '0 auto 4px' }} />
          : <div style={{ color: 'white', fontWeight: 900, fontSize: 15, marginBottom: 4 }}>{name || 'Tu negocio'}</div>
        }
        {tagline && <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>{tagline}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {Array.from({ length: stampGoal }).map((_, i) => {
          const isFilled = i < filled
          const isLast = i === stampGoal - 1
          return (
            <div key={i} style={{
              width: 26, height: 26, borderRadius: 6,
              border: `2px solid ${isLast ? accentColor : 'rgba(255,255,255,0.45)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isFilled ? 'rgba(255,255,255,0.2)' : isLast ? `${accentColor}35` : 'transparent',
              fontSize: 13, transition: 'all 0.2s',
            }}>
              <span style={{ opacity: isFilled ? 1 : 0.2 }}>{stampIcon || '⭐'}</span>
            </div>
          )
        })}
      </div>
      <div style={{ textAlign: 'center', color: accentColor, fontSize: 10, fontWeight: 600 }}>
        Junta {stampGoal} y gana: {rewardDescription || 'tu premio especial'}
      </div>
    </div>
  )
}

function ColorPicker({ value, onChange, presets }: { value: string; onChange: (v: string) => void; presets: { label: string; value: string }[] }) {
  const [hex, setHex] = useState(value)

  function handleHexChange(raw: string) {
    setHex(raw)
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) onChange(raw)
  }

  function handleWheelChange(v: string) {
    setHex(v)
    onChange(v)
  }

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Rueda + hex */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: value, borderRadius: 10 }} />
          <input
            type="color"
            value={value}
            onChange={e => handleWheelChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
          />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', fontSize: 14, fontFamily: 'monospace' }}>#</span>
          <input
            value={hex.replace('#', '')}
            onChange={e => handleHexChange('#' + e.target.value.replace('#', ''))}
            maxLength={6}
            placeholder="6366f1"
            style={{ width: '100%', borderRadius: 10, padding: '10px 12px 10px 28px', backgroundColor: 'rgba(255,255,255,0.08)', border: `1px solid ${/^#[0-9a-fA-F]{6}$/.test(hex) ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.5)'}`, color: 'white', fontSize: 15, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>
      {/* Sugeridos */}
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 8 }}>Sugeridos</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {presets.map(c => (
          <button key={c.value} type="button" title={c.label} onClick={() => { onChange(c.value); setHex(c.value) }}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: c.value, border: value === c.value ? '3px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.1s', transform: value === c.value ? 'scale(1.2)' : 'scale(1)' }} />
        ))}
      </div>
    </div>
  )
}

function KPICard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${color}18`, border: `1px solid ${color}45` }}>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-white/60 mt-1">{label}</p>
    </div>
  )
}
