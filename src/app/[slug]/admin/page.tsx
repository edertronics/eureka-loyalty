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
  stamp_icon?: string
  strip_image_url?: string
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  stamps: number
  total_stamps: number
  rewards_redeemed: number
  created_at: string
  last_stamp_at: string | null
  available_rewards?: number
}

interface CustomerDetail {
  customer: Customer
  stamps: { created_at: string; stamps_given: number }[]
  rewards: { created_at: string }[]
  available_rewards?: { id: string; earned_at: string; expires_at: string }[]
}

interface Stats {
  business: Business
  total_customers: number
  total_stamps: number
  total_rewards: number
  recent_customers: Customer[]
  customers_this_month: number
  active_customers: number
  stamps_this_month: number
  rewards_this_month: number
  stamps_7d: { created_at: string }[]
  pending_rewards?: {
    available_total: number
    expiring_soon: number
    expired_total: number
    by_customer: { customer_name: string; count: number; soonest_expires_at: string }[]
  }
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

const CARD_TEMPLATES = [
  { id: 'cafe-oscuro', name: 'Café Oscuro', cat: 'cafe', url: '/templates/cafe-oscuro.svg', primary: '#3d1a08', accent: '#f59e0b' },
  { id: 'cafe-latte', name: 'Café Latte', cat: 'cafe', url: '/templates/cafe-latte.svg', primary: '#8b5e3c', accent: '#f59e0b' },
  { id: 'cafe-moderno', name: 'Café Moderno', cat: 'cafe', url: '/templates/cafe-moderno.svg', primary: '#1a1a35', accent: '#f59e0b' },
  { id: 'comida-fresca', name: 'Comida Fresca', cat: 'comida', url: '/templates/comida-fresca.svg', primary: '#1a4a1a', accent: '#a3e635' },
  { id: 'comida-fuego', name: 'Fuego & Grill', cat: 'comida', url: '/templates/comida-fuego.svg', primary: '#c43300', accent: '#fb923c' },
  { id: 'comida-premium', name: 'Premium', cat: 'comida', url: '/templates/comida-premium.svg', primary: '#1a1a0d', accent: '#d4a017' },
  { id: 'belleza-rosa', name: 'Rosa Vibrante', cat: 'belleza', url: '/templates/belleza-rosa.svg', primary: '#c4006c', accent: '#f472b6' },
  { id: 'belleza-dorada', name: 'Rose Gold', cat: 'belleza', url: '/templates/belleza-dorada.svg', primary: '#8b4a28', accent: '#d4a017' },
  { id: 'belleza-violeta', name: 'Luxe Violeta', cat: 'belleza', url: '/templates/belleza-violeta.svg', primary: '#4d0099', accent: '#c084fc' },
  { id: 'barberia-navy', name: 'Barbería Clásica', cat: 'barberia', url: '/templates/barberia-navy.svg', primary: '#002244', accent: '#d4a017' },
  { id: 'barberia-oscura', name: 'Razor Dark', cat: 'barberia', url: '/templates/barberia-oscura.svg', primary: '#1a0000', accent: '#cc0000' },
  { id: 'gym-energia', name: 'Energía', cat: 'gym', url: '/templates/gym-energia.svg', primary: '#003300', accent: '#00ff00' },
  { id: 'gym-poder', name: 'Poder', cat: 'gym', url: '/templates/gym-poder.svg', primary: '#2d0000', accent: '#ff3300' },
  { id: 'general-ocean', name: 'Océano', cat: 'general', url: '/templates/general-ocean.svg', primary: '#003d66', accent: '#38bdf8' },
  { id: 'general-noche', name: 'Noche Estelar', cat: 'general', url: '/templates/general-noche.svg', primary: '#0d0026', accent: '#c084fc' },
  { id: 'general-mineral', name: 'Mineral', cat: 'general', url: '/templates/general-mineral.svg', primary: '#063f3a', accent: '#00c896' },
]

const FOCAL_PRESETS = [
  { label: '↖', value: '0% 0%' }, { label: '↑', value: '50% 0%' }, { label: '↗', value: '100% 0%' },
  { label: '←', value: '0% 50%' }, { label: '·', value: '50% 50%' }, { label: '→', value: '100% 50%' },
  { label: '↙', value: '0% 100%' }, { label: '↓', value: '50% 100%' }, { label: '↘', value: '100% 100%' },
]

const TEMPLATE_CATS = [
  { id: 'cafe', label: 'Café' },
  { id: 'comida', label: 'Comida' },
  { id: 'belleza', label: 'Belleza' },
  { id: 'barberia', label: 'Barbería' },
  { id: 'gym', label: 'Gym' },
  { id: 'general', label: 'General' },
]

function groupStampsByDay(stamps7d: { created_at: string }[]): { label: string; count: number }[] {
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const count = stamps7d.filter(s => s.created_at.startsWith(dateStr)).length
    return { label: i === 6 ? 'hoy' : days[d.getDay()], count }
  })
}

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
  const [pForm, setPForm] = useState({ name: '', tagline: '', primary_color: '', accent_color: '', stamp_goal: 10, reward_description: '', new_password: '', new_staff_password: '', logo_url: '', stamp_icon: '⭐', strip_image_url: '', strip_focal_point: '50% 50%', strip_scale: 1, logo_size: 1, qr_bg_color: '', stamp_display: 'none', logo_tint: '', banner_gradient: '', banner_gradient_width: 52 })
  const [templateCat, setTemplateCat] = useState('cafe')
  const [stripTab, setStripTab] = useState<'templates' | 'upload'>('templates')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const timerNewPassword = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showStaffPassword, setShowStaffPassword] = useState(false)
  const timerStaffPassword = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [stripFile, setStripFile] = useState<File | null>(null)
  const [stripPreview, setStripPreview] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<'activity' | 'registered'>('activity')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  // Lista de clientes paginada (búsqueda del lado del servidor, escala a miles)
  const [customerList, setCustomerList] = useState<Customer[]>([])
  const [customerTotal, setCustomerTotal] = useState(0)
  const [customerPage, setCustomerPage] = useState(0)
  const [customerTotalPages, setCustomerTotalPages] = useState(0)
  const [listLoading, setListLoading] = useState(false)

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

  function toggleStaffPassword() {
    if (showStaffPassword) {
      if (timerStaffPassword.current) clearTimeout(timerStaffPassword.current)
      setShowStaffPassword(false)
    } else {
      setShowStaffPassword(true)
      if (timerStaffPassword.current) clearTimeout(timerStaffPassword.current)
      timerStaffPassword.current = setTimeout(() => setShowStaffPassword(false), 2000)
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

  function initFormFromBusiness(b: Business) {
    setPForm({ name: b.name ?? '', tagline: b.tagline ?? '', primary_color: b.primary_color ?? '#6366f1', accent_color: b.accent_color ?? '#f59e0b', stamp_goal: b.stamp_goal ?? 10, reward_description: b.reward_description ?? '', new_password: '', new_staff_password: '', logo_url: b.logo_url ?? '', stamp_icon: b.stamp_icon ?? '⭐', strip_image_url: b.strip_image_url ?? '', strip_focal_point: (b as {strip_focal_point?: string}).strip_focal_point ?? '50% 50%', strip_scale: (b as {strip_scale?: number}).strip_scale ?? 1, logo_size: (b as {logo_size?: number}).logo_size ?? 1, qr_bg_color: (b as {qr_bg_color?: string}).qr_bg_color ?? '', stamp_display: (b as {stamp_display?: string}).stamp_display ?? 'none', logo_tint: (b as {logo_tint?: string}).logo_tint ?? '', banner_gradient: (b as {banner_gradient?: string}).banner_gradient ?? '', banner_gradient_width: (b as {banner_gradient_width?: number}).banner_gradient_width ?? 52 })
  }

  useEffect(() => {
    fetch(`/api/business/${slug}/stats`)
      .then(r => {
        if (r.ok) r.json().then(data => {
          setStats(data)
          setAuthed(true)
          initFormFromBusiness(data.business)
        })
        setChecking(false)
      })
      .catch(() => setChecking(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setPForm(f => ({ ...f, strip_scale: 1.5, strip_focal_point: '50% 50%' }))
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
        const uploadRes = await fetch(`/api/business/${slug}/upload-logo`, { method: 'POST', body: fd })
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
        const uploadRes = await fetch(`/api/business/${slug}/upload-strip`, { method: 'POST', body: fd })
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
        setPForm(f => ({ ...f, new_password: '', new_staff_password: '', logo_url: logoUrl ?? '', strip_image_url: stripUrl ?? '' }))
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
        .then(data => { setStats(data); initFormFromBusiness(data.business); setStatsLoading(false) })
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoginLoading(false)
    }
  }

  async function openCustomer(c: Customer) {
    setSelectedCustomer(c)
    setCustomerDetail(null)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/business/${slug}/customer/${c.id}`)
      if (res.ok) setCustomerDetail(await res.json())
    } finally {
      setDetailLoading(false)
    }
  }

  function closeCustomer() {
    setSelectedCustomer(null)
    setCustomerDetail(null)
  }

  // Al cambiar búsqueda u orden, regresar a la primera página
  useEffect(() => {
    setCustomerPage(0)
  }, [search, sortMode])

  // Cargar la lista de clientes desde el servidor (búsqueda + paginación).
  // Debounce de 350ms para no disparar una petición por cada tecla.
  useEffect(() => {
    if (!authed) return
    setListLoading(true)
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ search, sort: sortMode, page: String(customerPage) })
      fetch(`/api/business/${slug}/customers?${qs}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setCustomerList(data.customers ?? [])
            setCustomerTotal(data.total ?? 0)
            setCustomerTotalPages(data.total_pages ?? 0)
          }
          setListLoading(false)
        })
        .catch(() => setListLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [slug, authed, search, sortMode, customerPage])

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
              <button type="button" onClick={togglePassword}
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
            <button type="submit" disabled={loginLoading || !password}
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

  const retentionRate = stats && stats.total_customers > 0
    ? Math.round((stats.active_customers / stats.total_customers) * 100)
    : 0
  const retentionColor = retentionRate >= 50 ? primary : retentionRate >= 25 ? '#f59e0b' : '#ef4444'
  const chartData = groupStampsByDay(stats?.stamps_7d ?? [])
  const chartMax = Math.max(...chartData.map(d => d.count), 1)

  return (
    <main className="min-h-screen px-4 py-8"
      style={{ background: `linear-gradient(135deg, #0d0d18 0%, #050508 100%)`, position: 'relative' }}>
      {/* Subtle brand tint orb */}
      <div style={{ position: 'fixed', top: -200, left: -100, width: 600, height: 600, background: `radial-gradient(circle, ${primary}18 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div className="max-w-2xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>

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
        </div>

        {/* Últimos 30 días */}
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Últimos 30 días</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <MetricCard
            value={stats?.customers_this_month ?? 0}
            label="Nuevos clientes"
            color={primary}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>}
          />
          <MetricCard
            value={stats?.active_customers ?? 0}
            label="Clientes activos"
            color={accent}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          />
          <MetricCard
            value={stats?.stamps_this_month ?? 0}
            label="Sellos dados"
            color={primary}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
          />
          <MetricCard
            value={stats?.rewards_this_month ?? 0}
            label="Premios canjeados"
            color={accent}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>}
          />
        </div>

        {/* Retención */}
        <div style={{ borderRadius: 16, padding: '16px 18px', marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>Tasa de retención</p>
            <span style={{ fontSize: 28, fontWeight: 900, color: retentionColor, lineHeight: 1 }}>
              {stats?.total_customers ? `${retentionRate}%` : '—'}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${retentionRate}%`, borderRadius: 99, backgroundColor: retentionColor, transition: 'width 0.8s ease' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: 0 }}>
            {stats?.active_customers ?? 0} de {stats?.total_customers ?? 0} clientes visitaron en los últimos 30 días
          </p>
        </div>

        {/* Actividad 7 días */}
        <div style={{ borderRadius: 16, padding: '16px 18px', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px 0' }}>Actividad — últimos 7 días</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 }}>
            {chartData.map((d, i) => {
              const barH = chartMax > 0 ? Math.max(4, Math.round((d.count / chartMax) * 52)) : 4
              const isToday = i === 6
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ color: d.count > 0 ? 'rgba(255,255,255,0.6)' : 'transparent', fontSize: 9, fontWeight: 700 }}>{d.count > 0 ? d.count : ''}</span>
                  <div style={{ width: '100%', height: barH, borderRadius: 4, backgroundColor: isToday ? primary : `${primary}60`, transition: 'height 0.5s ease' }} />
                  <span style={{ color: isToday ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: isToday ? 700 : 400 }}>{d.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notificaciones de premios pendientes — solo eureka-burgers por ahora */}
        {slug === 'eureka-burgers' && stats?.pending_rewards && (
          <div style={{ borderRadius: 16, padding: '16px 18px', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px 0' }}>Notificaciones — premios pendientes</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: stats.pending_rewards.by_customer.length > 0 ? 14 : 0 }}>
              <div style={{ borderRadius: 12, padding: '10px 8px', textAlign: 'center', backgroundColor: 'rgba(218,92,45,0.12)', border: '1px solid rgba(218,92,45,0.3)' }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#DA5C2D', margin: '0 0 2px' }}>{stats.pending_rewards.expiring_soon}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.3 }}>Por caducar<br/>(7 días)</p>
              </div>
              <div style={{ borderRadius: 12, padding: '10px 8px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 2px' }}>{stats.pending_rewards.available_total}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.3 }}>Disponibles<br/>sin canjear</p>
              </div>
              <div style={{ borderRadius: 12, padding: '10px 8px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: 'rgba(255,255,255,0.6)', margin: '0 0 2px' }}>{stats.pending_rewards.expired_total}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.3 }}>Caducados<br/>histórico</p>
              </div>
            </div>
            {stats.pending_rewards.by_customer.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stats.pending_rewards.by_customer.map((r, i) => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(r.soonest_expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{r.customer_name}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                        {r.count} premio{r.count > 1 ? 's' : ''} · vence en {daysLeft}d
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Totales históricos */}
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Total histórico</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a href="#clientes" className="block no-underline">
            <KPICard value={stats?.total_customers ?? 0} label="Clientes" color={primary} />
          </a>
          <a href="#clientes" className="block no-underline">
            <KPICard value={stats?.total_stamps ?? 0} label="Sellos" color={accent} />
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
          <a href={`https://easyloyalty.io/${slug}`} target="_blank" rel="noopener noreferrer"
            className="py-3 rounded-xl font-semibold text-sm text-center transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
            + Registrar cliente
          </a>
        </div>

        {/* Personalizar — oculto para eureka-burgers durante el piloto para que el staff
            no altere por accidente la meta de sellos, el premio o el branding de las
            tarjetas reales. Reactivar quitando la condición de slug cuando exista el
            autoservicio de edición. */}
        {slug !== 'eureka-burgers' && (
          <div className="mb-6">
            <button
              onClick={() => setShowPersonalizar(true)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
              Personalizar mi programa
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}

        {/* Modal Personalizar — full screen */}
        {showPersonalizar && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', backgroundColor: '#080810' }}>

            {/* Header */}
            <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(8,8,16,0.97)', backdropFilter: 'blur(16px)' }}>
              <div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 18, margin: 0 }}>Personalizar programa</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '2px 0 0 0' }}>Vista previa en tiempo real</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPersonalizar(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cerrar
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

              {/* Left column — controls */}
              <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 460, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.08)' }}>

                {/* Mobile-only preview */}
                <div className="md:hidden" style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Así se ve en Apple Wallet</p>
                  <div style={{ position: 'relative', width: 195, height: 403, flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, transform: 'scale(0.65)', transformOrigin: 'top left' }}>
                      <IPhoneWalletPreview
                        primaryColor={pForm.primary_color || '#6366f1'}
                        accentColor={pForm.accent_color || '#f59e0b'}
                        name={pForm.name}
                        tagline={pForm.tagline}
                        logoPreview={logoPreview}
                        logoUrl={pForm.logo_url}
                        stampGoal={pForm.stamp_goal}
                        rewardDescription={pForm.reward_description}
                        stampIcon={pForm.stamp_icon}
                        stripImage={stripPreview || pForm.strip_image_url || null}
                        stripFocalPoint={pForm.strip_focal_point || '50% 50%'}
                        stripScale={pForm.strip_scale || 1}
                        logoSize={pForm.logo_size || 1}
                        qrBgColor={pForm.primary_color || '#6366f1'}
                        stampDisplay={pForm.stamp_display || 'none'}
                        logoTint={pForm.logo_tint || ''}
                        bannerGradient={pForm.banner_gradient || ''}
                        bannerGradientWidth={pForm.banner_gradient_width || 52}
                      />
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSave} style={{ padding: '16px 16px 48px' }}>

              {/* ── IDENTIDAD ─────────────────────────────── */}
              <div style={{ background: 'rgba(247,228,150,0.03)', border: '1px solid rgba(247,228,150,0.1)', borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(247,228,150,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Identidad</span>
                </div>
                <div style={{ padding: 20 }}>

              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Logo</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 72, height: 72, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {(logoPreview || pForm.logo_url) ? (
                    <img src={logoPreview || pForm.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    {logoPreview ? 'Cambiar imagen' : pForm.logo_url ? 'Reemplazar logo' : 'Subir logo'}
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" onChange={handleLogoSelect} style={{ display: 'none' }} />
                  </label>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.5 }}>De preferencia PNG sin fondo para mejor resultado</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', margin: '3px 0 0' }}>PNG, JPG, SVG o WebP · Máx 2MB</p>
                  {pForm.logo_url && !logoPreview && (
                    <button type="button" onClick={() => setPForm(f => ({ ...f, logo_url: '' }))}
                      style={{ marginTop: 6, background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                      Quitar logo
                    </button>
                  )}
                </div>
              </div>

              {(logoPreview || pForm.logo_url) && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Tamaño del logo</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontWeight: 600 }}>{Math.round(pForm.logo_size * 100)}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700 }}>A</span>
                    <input
                      type="range" min={0.5} max={2.5} step={0.05}
                      value={pForm.logo_size}
                      onChange={e => setPForm(f => ({ ...f, logo_size: parseFloat(e.target.value) }))}
                      style={{ flex: 1, accentColor: pForm.accent_color || '#f59e0b', cursor: 'pointer' }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 16, fontWeight: 700 }}>A</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>Pequeño</span>
                    <button type="button" onClick={() => setPForm(f => ({ ...f, logo_size: 1 }))}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 10, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                      Reset
                    </button>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>Grande</span>
                  </div>
                </div>
              )}

              {(logoPreview || pForm.logo_url) && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Color del logo</span>
                    {pForm.logo_tint && (
                      <button type="button" onClick={() => setPForm(f => ({ ...f, logo_tint: '' }))}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                        Quitar color
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button type="button" onClick={() => setPForm(f => ({ ...f, logo_tint: '' }))} title="Sin tinte"
                      style={{ width: 36, height: 36, borderRadius: 10, cursor: 'pointer', background: 'white', position: 'relative', overflow: 'hidden', padding: 0, flexShrink: 0,
                        border: !pForm.logo_tint ? '2.5px solid white' : '2px solid rgba(255,255,255,0.12)',
                        transform: !pForm.logo_tint ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.12s',
                        boxShadow: !pForm.logo_tint ? '0 0 0 3px rgba(255,255,255,0.18)' : 'none' }}>
                      <svg style={{ position: 'absolute', inset: 0 }} width="36" height="36" viewBox="0 0 36 36">
                        <line x1="4" y1="4" x2="32" y2="32" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    {([
                      { label: 'Blanco', value: '#ffffff' },
                      { label: 'Negro', value: '#1a1a1a' },
                      { label: 'Dorado', value: '#f59e0b' },
                      { label: 'Rosa', value: '#ec4899' },
                      { label: 'Rojo', value: '#ef4444' },
                      { label: 'Verde', value: '#10b981' },
                      { label: 'Azul', value: '#3b82f6' },
                      { label: 'Morado', value: '#8b5cf6' },
                    ] as { label: string; value: string }[]).map(c => (
                      <button key={c.value} type="button" title={c.label}
                        onClick={() => setPForm(f => ({ ...f, logo_tint: c.value }))}
                        style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.value, cursor: 'pointer', flexShrink: 0,
                          border: pForm.logo_tint === c.value ? '2.5px solid white' : '2px solid rgba(255,255,255,0.08)',
                          transform: pForm.logo_tint === c.value ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.12s',
                          boxShadow: pForm.logo_tint === c.value ? '0 0 0 3px rgba(255,255,255,0.18)' : 'none' }} />
                    ))}
                  </div>
                  {pForm.logo_tint && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                      <div style={{ position: 'relative', width: 44, height: 44, borderRadius: 12, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.15)', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: pForm.logo_tint }} />
                        <input type="color" value={pForm.logo_tint} onChange={e => setPForm(f => ({ ...f, logo_tint: e.target.value }))}
                          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'monospace' }}>#</span>
                        <input
                          value={pForm.logo_tint.replace('#', '')}
                          onChange={e => { const v = '#' + e.target.value.replace('#', ''); if (/^#[0-9a-fA-F]{6}$/.test(v)) setPForm(f => ({ ...f, logo_tint: v })) }}
                          maxLength={6} placeholder="ffffff"
                          style={{ width: '100%', borderRadius: 10, padding: '10px 12px 10px 28px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nombre + Slogan — dentro del card Identidad */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Nombre y slogan</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    value={pForm.name}
                    onChange={e => setPForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nombre del negocio"
                    style={{ width: '100%', borderRadius: 10, padding: '11px 14px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <div style={{ position: 'relative' }}>
                    <input
                      value={pForm.tagline}
                      onChange={e => setPForm(f => ({ ...f, tagline: e.target.value }))}
                      placeholder="Slogan (opcional)"
                      style={{ width: '100%', borderRadius: 10, padding: '11px 36px 11px 14px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                    />
                    {pForm.tagline && (
                      <button type="button" onClick={() => setPForm(f => ({ ...f, tagline: '' }))}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 18, lineHeight: 1, padding: 4 }}>
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

                </div>
              </div>{/* /Identidad */}

              {/* ── BANNER ────────────────────────────────── */}
              <div style={{ background: 'rgba(56,189,248,0.03)', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(56,189,248,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Imagen del banner</span>
                </div>
                <div style={{ padding: 20 }}>

              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Imagen de fondo</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 14, lineHeight: 1.5 }}>Elige una plantilla o sube tu propia foto</p>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3 }}>
                {(['templates', 'upload'] as const).map(tab => (
                  <button key={tab} type="button" onClick={() => setStripTab(tab)}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                      background: stripTab === tab ? 'rgba(255,255,255,0.12)' : 'transparent',
                      border: 'none',
                      color: stripTab === tab ? 'white' : 'rgba(255,255,255,0.4)' }}>
                    {tab === 'templates' ? 'Plantillas' : 'Subir foto'}
                  </button>
                ))}
              </div>

              {stripTab === 'templates' && (
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                    {TEMPLATE_CATS.map(c => (
                      <button key={c.id} type="button" onClick={() => setTemplateCat(c.id)}
                        style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                          background: templateCat === c.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                          color: templateCat === c.id ? 'white' : 'rgba(255,255,255,0.45)',
                          border: templateCat === c.id ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {CARD_TEMPLATES.filter(t => t.cat === templateCat).map(t => {
                      const isSelected = pForm.strip_image_url === t.url
                      return (
                        <button key={t.id} type="button"
                          onClick={() => {
                            setPForm(f => ({ ...f, strip_image_url: t.url, primary_color: t.primary, accent_color: t.accent, strip_focal_point: '50% 50%', strip_scale: 1 }))
                            setStripFile(null)
                            if (stripPreview) { URL.revokeObjectURL(stripPreview); setStripPreview(null) }
                          }}
                          style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', padding: 0,
                            border: isSelected ? '2px solid white' : '2px solid rgba(255,255,255,0.1)',
                            transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                            transition: 'all 0.15s', position: 'relative' }}>
                          <img src={t.url} alt={t.name} style={{ width: '100%', height: 48, objectFit: 'cover', display: 'block' }} />
                          <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.7)', fontSize: 9, fontWeight: 700, color: isSelected ? 'white' : 'rgba(255,255,255,0.6)', textAlign: 'center', letterSpacing: 0.5 }}>
                            {t.name}
                          </div>
                          {isSelected && (
                            <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {stripTab === 'upload' && (
                <div style={{ marginBottom: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: '1.5px dashed rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{(stripPreview || pForm.strip_image_url) ? 'Cambiar foto' : 'Seleccionar foto'}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>PNG o JPG · Máx 5MB · Horizontal recomendado</div>
                    </div>
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleStripSelect} style={{ display: 'none' }} />
                  </label>
                </div>
              )}

              {/* StripDragger — visible cuando hay imagen */}
              {(stripPreview || pForm.strip_image_url) && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16, paddingTop: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Ajustar posición</p>
                  <StripDragger
                    src={stripPreview || pForm.strip_image_url}
                    focalPoint={pForm.strip_focal_point}
                    scale={pForm.strip_scale}
                    onFocalChange={v => setPForm(f => ({ ...f, strip_focal_point: v }))}
                    onScaleChange={v => setPForm(f => ({ ...f, strip_scale: v }))}
                    onChangeFile={handleStripSelect}
                    onRemove={() => { setPForm(f => ({ ...f, strip_image_url: '', strip_focal_point: '50% 50%', strip_scale: 1 })); setStripFile(null); if (stripPreview) { URL.revokeObjectURL(stripPreview); setStripPreview(null) } }}
                  />
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>Degradado de contraste</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.5 }}>Mejora la legibilidad del nombre sobre la imagen</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: pForm.banner_gradient ? 12 : 0 }}>
                {/* Sin degradado */}
                <button type="button" onClick={() => setPForm(f => ({ ...f, banner_gradient: '' }))} title="Sin degradado"
                  style={{ width: 36, height: 36, borderRadius: 10, cursor: 'pointer', background: 'white', position: 'relative', overflow: 'hidden', padding: 0, flexShrink: 0,
                    border: !pForm.banner_gradient ? '2.5px solid white' : '2px solid rgba(255,255,255,0.12)',
                    transform: !pForm.banner_gradient ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.12s',
                    boxShadow: !pForm.banner_gradient ? '0 0 0 3px rgba(255,255,255,0.18)' : 'none' }}>
                  <svg style={{ position: 'absolute', inset: 0 }} width="36" height="36" viewBox="0 0 36 36">
                    <line x1="4" y1="4" x2="32" y2="32" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
                {([
                  { label: 'Negro', value: '#000000' },
                  { label: 'Principal', value: pForm.primary_color || '#6366f1' },
                  { label: 'Marino', value: '#001840' },
                  { label: 'Café', value: '#1a0800' },
                  { label: 'Morado', value: '#1a0033' },
                  { label: 'Verde', value: '#001a0e' },
                  { label: 'Rojo', value: '#1a0000' },
                  { label: 'Blanco', value: '#ffffff' },
                ] as { label: string; value: string }[]).map(c => (
                  <button key={c.label} type="button" title={c.label}
                    onClick={() => setPForm(f => ({ ...f, banner_gradient: c.value }))}
                    style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.value, cursor: 'pointer', flexShrink: 0,
                      border: pForm.banner_gradient === c.value ? '2.5px solid white' : '2px solid rgba(255,255,255,0.1)',
                      transform: pForm.banner_gradient === c.value ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.12s',
                      boxShadow: pForm.banner_gradient === c.value ? '0 0 0 3px rgba(255,255,255,0.18)' : 'none' }} />
                ))}
              </div>
              {pForm.banner_gradient && (
                <div style={{ marginBottom: 20 }}>
                  {/* Color picker row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${pForm.banner_gradient}, transparent)`, borderRadius: 10 }} />
                      <input type="color" value={pForm.banner_gradient} onChange={e => setPForm(f => ({ ...f, banner_gradient: e.target.value }))}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', fontSize: 14, fontFamily: 'monospace' }}>#</span>
                      <input
                        value={pForm.banner_gradient.replace('#', '')}
                        onChange={e => { const v = '#' + e.target.value.replace('#', ''); if (/^#[0-9a-fA-F]{6}$/.test(v)) setPForm(f => ({ ...f, banner_gradient: v })) }}
                        maxLength={6} placeholder="000000"
                        style={{ width: '100%', borderRadius: 10, padding: '10px 12px 10px 28px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 15, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  {/* Slider de extensión */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Extensión del degradado</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>{pForm.banner_gradient_width}%</span>
                  </div>
                  <div style={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center' }}>
                    {/* Track con preview del degradado */}
                    <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ position: 'absolute', left: 0, width: `${pForm.banner_gradient_width}%`, height: '100%', background: `linear-gradient(to right, ${pForm.banner_gradient}, transparent)`, transition: 'width 0.05s' }} />
                    </div>
                    <input
                      type="range" min={10} max={100} step={1}
                      value={pForm.banner_gradient_width}
                      onChange={e => setPForm(f => ({ ...f, banner_gradient_width: parseInt(e.target.value) }))}
                      style={{ position: 'relative', zIndex: 1, width: '100%', accentColor: pForm.banner_gradient || '#ffffff', cursor: 'pointer', background: 'transparent' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>Corto</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>Ancho completo</span>
                  </div>
                </div>
              )}

              </div>{/* /degradado inner */}
                </div>
              </div>{/* /Banner */}

              {/* ── COLORES ───────────────────────────────── */}
              <div style={{ background: 'rgba(0,200,150,0.03)', border: '1px solid rgba(0,200,150,0.12)', borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(0,200,150,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5"/><circle cx="17.5" cy="10.5" r="0.5"/><circle cx="8.5" cy="7.5" r="0.5"/><circle cx="6.5" cy="12.5" r="0.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.47-.688-.47-1.125a1.64 1.64 0 0 1 1.648-1.688h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Colores</span>
                </div>
                <div style={{ padding: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Color principal</p>
                  <ColorPicker value={pForm.primary_color} onChange={v => setPForm(f => ({ ...f, primary_color: v }))} presets={BRAND_COLORS} />
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Color de acento</p>
                    <ColorPicker value={pForm.accent_color} onChange={v => setPForm(f => ({ ...f, accent_color: v }))} presets={ACCENT_COLORS} />
                  </div>
                </div>
              </div>{/* /Colores */}

              {/* ── SELLOS ────────────────────────────────── */}
              <div style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Sellos</span>
                </div>
                <div style={{ padding: 20 }}>

                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Visualización en la tarjeta</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 12, lineHeight: 1.5 }}>Cómo se muestran los sellos sobre el código QR</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {([
                      { val: 'none', label: 'Solo contador', desc: '1/10' },
                      { val: 'icons', label: 'Íconos', desc: '⭐⭐⭐' },
                      { val: 'number', label: 'Número', desc: '#3' },
                    ] as const).map(opt => (
                      <button key={opt.val} type="button"
                        onClick={() => setPForm(f => ({ ...f, stamp_display: opt.val }))}
                        style={{ flex: 1, padding: '10px 6px 8px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          background: pForm.stamp_display === opt.val ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                          border: pForm.stamp_display === opt.val ? '1.5px solid rgba(255,255,255,0.35)' : '1.5px solid rgba(255,255,255,0.08)',
                          color: pForm.stamp_display === opt.val ? 'white' : 'rgba(255,255,255,0.35)' }}>
                        <span style={{ fontSize: 13, lineHeight: 1 }}>{opt.desc}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {pForm.stamp_display === 'icons' && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Ícono de sello</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {STAMP_ICONS.map(icon => (
                          <button key={icon.emoji} type="button" title={icon.label}
                            onClick={() => setPForm(f => ({ ...f, stamp_icon: icon.emoji }))}
                            style={{ width: 44, height: 44, borderRadius: 10, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: pForm.stamp_icon === icon.emoji ? '2px solid rgba(255,255,255,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
                              background: pForm.stamp_icon === icon.emoji ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                              transform: pForm.stamp_icon === icon.emoji ? 'scale(1.12)' : 'scale(1)', transition: 'all 0.12s',
                              boxShadow: pForm.stamp_icon === icon.emoji ? '0 0 0 3px rgba(255,255,255,0.12)' : 'none' }}>
                            {icon.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>Meta y premio</p>
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Sellos necesarios para ganar</p>
                      <input
                        type="number" min={1} max={50}
                        value={pForm.stamp_goal}
                        onChange={e => setPForm(f => ({ ...f, stamp_goal: parseInt(e.target.value) || 10 }))}
                        style={{ width: 80, borderRadius: 10, padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 18, fontWeight: 700, outline: 'none', textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Descripción del premio</p>
                      <input
                        value={pForm.reward_description}
                        onChange={e => setPForm(f => ({ ...f, reward_description: e.target.value }))}
                        placeholder="Ej. Hamburguesa gratis"
                        style={{ width: '100%', borderRadius: 10, padding: '11px 14px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                </div>
              </div>{/* /Sellos */}

              {/* ── ACCESO ────────────────────────────────── */}
              <div style={{ background: 'rgba(6,63,58,0.14)', border: '1px solid rgba(0,200,150,0.12)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(0,200,150,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Acceso</span>
                </div>
                <div style={{ padding: 20 }}>

                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Contraseña admin</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 10, lineHeight: 1.5 }}>Dejar vacío para no cambiarla</p>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={pForm.new_password}
                      onChange={e => setPForm(f => ({ ...f, new_password: e.target.value }))}
                      placeholder="Nueva contraseña"
                      style={{ width: '100%', borderRadius: 10, padding: '11px 44px 11px 14px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={toggleNewPassword}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: showNewPassword ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                      {showNewPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      )}
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>PIN de staff</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 10, lineHeight: 1.5 }}>Los empleados usan este PIN para el scanner. Dejar vacío para acceso público.</p>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showStaffPassword ? 'text' : 'password'}
                        value={pForm.new_staff_password}
                        onChange={e => setPForm(f => ({ ...f, new_staff_password: e.target.value }))}
                        placeholder="PIN de empleados"
                        style={{ width: '100%', borderRadius: 10, padding: '11px 44px 11px 14px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box', letterSpacing: '0.1em' }}
                      />
                      <button type="button" onClick={toggleStaffPassword}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: showStaffPassword ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                        {showStaffPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>{/* /Acceso */}

              {saveMsg && (
                <div style={{ marginBottom: 12, padding: '12px 16px', borderRadius: 12, fontSize: 14, textAlign: 'center', backgroundColor: saveMsg.type === 'ok' ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)', color: saveMsg.type === 'ok' ? '#34d399' : '#ef4444', border: `1px solid ${saveMsg.type === 'ok' ? 'rgba(52,211,153,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                  {saveMsg.text}
                </div>
              )}

              <button type="submit" disabled={saving || !pForm.name}
                style={{ width: '100%', padding: '15px 24px', borderRadius: 14, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, cursor: saving || !pForm.name ? 'not-allowed' : 'pointer', border: 'none', transition: 'opacity 0.15s, transform 0.1s', color: 'white',
                  background: `linear-gradient(135deg, ${pForm.primary_color || '#6366f1'} 0%, ${pForm.accent_color || '#f59e0b'} 100%)`,
                  opacity: (saving || !pForm.name) ? 0.4 : 1,
                  boxShadow: (saving || !pForm.name) ? 'none' : `0 4px 20px ${(pForm.primary_color || '#6366f1')}50` }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
                </form>
              </div>

              {/* Right column — iPhone preview (desktop only) */}
              <div className="hidden md:flex" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#05050c', position: 'relative' }}>
                <div style={{ position: 'absolute', width: 500, height: 500, background: `radial-gradient(circle, ${pForm.primary_color}18 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 14 }}>Así se ve en Apple Wallet</p>
                  <IPhoneWalletPreview
                    primaryColor={pForm.primary_color || '#6366f1'}
                    accentColor={pForm.accent_color || '#f59e0b'}
                    name={pForm.name}
                    tagline={pForm.tagline}
                    logoPreview={logoPreview}
                    logoUrl={pForm.logo_url}
                    stampGoal={pForm.stamp_goal}
                    rewardDescription={pForm.reward_description}
                    stampIcon={pForm.stamp_icon}
                    stripImage={stripPreview || pForm.strip_image_url || null}
                    stripFocalPoint={pForm.strip_focal_point || '50% 50%'}
                    stripScale={pForm.strip_scale || 1}
                    logoSize={pForm.logo_size || 1}
                    qrBgColor={pForm.primary_color || '#6366f1'}
                    stampDisplay={pForm.stamp_display || 'none'}
                    logoTint={pForm.logo_tint || ''}
                    bannerGradient={pForm.banner_gradient || ''}
                    bannerGradientWidth={pForm.banner_gradient_width || 52}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de clientes */}
        <div id="clientes" className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-white font-bold text-sm">Clientes registrados</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="text-white/40 text-xs">{stats?.total_customers ?? 0} total</span>
              {(stats?.total_customers ?? 0) > 0 && (
                <a href={`/api/business/${slug}/export-csv`}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Exportar
                </a>
              )}
            </div>
          </div>

          {/* Buscador + orden */}
          {(stats?.total_customers ?? 0) > 0 && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, teléfono o email..."
                  style={{ width: '100%', borderRadius: 8, padding: '7px 10px 7px 30px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                <button onClick={() => setSortMode('activity')}
                  style={{ padding: '7px 10px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: sortMode === 'activity' ? 'rgba(255,255,255,0.15)' : 'transparent', color: sortMode === 'activity' ? 'white' : 'rgba(255,255,255,0.4)' }}>
                  Actividad
                </button>
                <button onClick={() => setSortMode('registered')}
                  style={{ padding: '7px 10px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: sortMode === 'registered' ? 'rgba(255,255,255,0.15)' : 'transparent', color: sortMode === 'registered' ? 'white' : 'rgba(255,255,255,0.4)' }}>
                  Registro
                </button>
              </div>
            </div>
          )}

          {statsLoading ? (
            <div className="px-4 py-8 text-center text-white/40 text-sm">Cargando...</div>
          ) : (stats?.total_customers ?? 0) === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-white/30 text-sm">Aún no hay clientes registrados</p>
              <p className="text-white/20 text-xs mt-1">Comparte el link de registro con tus clientes</p>
            </div>
          ) : listLoading && customerList.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/40 text-sm">Cargando...</div>
          ) : customerList.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/30 text-sm">Sin resultados{search ? ` para "${search}"` : ''}</div>
          ) : (
            <>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)', opacity: listLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
                {customerList.map(c => (
                  <button key={c.id} onClick={() => openCustomer(c)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-white/5 active:bg-white/10"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p className="text-white text-sm font-semibold">{c.name}</p>
                      <p className="text-white/40 text-xs">
                        {sortMode === 'registered'
                          ? `Registrado ${new Date(c.created_at).toLocaleDateString('es-MX')}`
                          : c.last_stamp_at
                            ? `Último sello ${new Date(c.last_stamp_at).toLocaleDateString('es-MX')}`
                            : `Registrado ${new Date(c.created_at).toLocaleDateString('es-MX')}`
                        }
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: secondary }}>{c.stamps}/{business?.stamp_goal ?? 10}</p>
                        {(c.available_rewards ?? 0) > 0 ? (
                          <p className="text-xs font-bold" style={{ color: '#DA5C2D' }}>🎁 {c.available_rewards} por canjear</p>
                        ) : c.rewards_redeemed > 0 ? (
                          <p className="text-xs" style={{ color: accent }}>{c.rewards_redeemed} premios</p>
                        ) : null}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Paginación */}
              {customerTotalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    onClick={() => setCustomerPage(p => Math.max(0, p - 1))}
                    disabled={customerPage === 0}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: customerPage === 0 ? 'rgba(255,255,255,0.25)' : 'white', cursor: customerPage === 0 ? 'default' : 'pointer' }}>
                    ← Anterior
                  </button>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    Página {customerPage + 1} de {customerTotalPages}
                  </span>
                  <button
                    onClick={() => setCustomerPage(p => Math.min(customerTotalPages - 1, p + 1))}
                    disabled={customerPage >= customerTotalPages - 1}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: customerPage >= customerTotalPages - 1 ? 'rgba(255,255,255,0.25)' : 'white', cursor: customerPage >= customerTotalPages - 1 ? 'default' : 'pointer' }}>
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">Easy Loyalty · Panel de {business?.name ?? slug}</p>

        {/* Modal de detalle de cliente */}
        {selectedCustomer && (
          <div
            onClick={closeCustomer}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}>
            <div
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxHeight: '85vh', overflowY: 'auto', borderRadius: '20px 20px 0 0', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.12)', padding: '0 0 32px 0' }}>

              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              </div>

              {/* Header del modal */}
              <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: 18, margin: 0 }}>{selectedCustomer.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '2px 0 0 0' }}>
                    Cliente desde {new Date(selectedCustomer.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button onClick={closeCustomer}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 18, flexShrink: 0 }}>
                  ×
                </button>
              </div>

              {/* Contacto */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
                {selectedCustomer.phone && (
                  <a href={`tel:${selectedCustomer.phone}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>Teléfono</p>
                      <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>{selectedCustomer.phone}</p>
                    </div>
                  </a>
                )}
                {selectedCustomer.email && (
                  <a href={`mailto:${selectedCustomer.email}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>Email</p>
                      <p style={{ color: 'white', fontSize: 12, fontWeight: 600, margin: 0 }}>{selectedCustomer.email}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Stats rápidos */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: primary, margin: 0 }}>{selectedCustomer.stamps}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: '2px 0 0 0' }}>sellos actuales</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: accent, margin: 0 }}>{selectedCustomer.total_stamps}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: '2px 0 0 0' }}>sellos totales</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: accent, margin: 0 }}>{selectedCustomer.rewards_redeemed}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: '2px 0 0 0' }}>premios</p>
                </div>
              </div>

              {/* Premios disponibles sin canjear */}
              {customerDetail?.available_rewards && customerDetail.available_rewards.length > 0 && (
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ color: '#DA5C2D', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                    🎁 {customerDetail.available_rewards.length} premio{customerDetail.available_rewards.length > 1 ? 's' : ''} por canjear
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {customerDetail.available_rewards.map((r, i) => {
                      const daysLeft = Math.max(0, Math.ceil((new Date(r.expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                      const urgent = daysLeft <= 7
                      return (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, backgroundColor: 'rgba(218,92,45,0.1)', border: '1px solid rgba(218,92,45,0.25)' }}>
                          <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>Premio #{i + 1}</span>
                          <span style={{ fontSize: 12, color: urgent ? '#DA5C2D' : 'rgba(255,255,255,0.6)', fontWeight: urgent ? 700 : 500 }}>
                            {daysLeft === 0 ? 'Vence hoy' : `Vence en ${daysLeft} día${daysLeft > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, margin: '8px 0 0 0' }}>
                    Para canjear, usa el botón &quot;Canjear premio&quot; del scanner.
                  </p>
                </div>
              )}

              {/* Barra de progreso actual */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Progreso actual</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>{selectedCustomer.stamps} / {business?.stamp_goal ?? 10} sellos</p>
                </div>
                <div style={{ height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', borderRadius: 99, backgroundColor: primary, width: `${Math.min(100, (selectedCustomer.stamps / (business?.stamp_goal ?? 10)) * 100)}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>

              {/* Historial */}
              <div style={{ padding: '16px 20px 0' }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px 0' }}>Historial</p>
                {detailLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Cargando...</div>
                ) : !customerDetail ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No se pudo cargar el historial</div>
                ) : customerDetail.stamps.length === 0 && customerDetail.rewards.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Sin eventos registrados</div>
                ) : (
                  <CustomerTimeline
                    stamps={customerDetail.stamps}
                    rewards={customerDetail.rewards}
                    primary={primary}
                    accent={accent}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function MetricCard({ value, label, color, icon }: { value: number; label: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 14, padding: '14px 16px', backgroundColor: `${color}14`, border: `1px solid ${color}35` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: `${color}cc`, display: 'flex' }}>{icon}</span>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1, margin: '0 0 4px 0' }}>{value}</p>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{label}</p>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const c = (hex || '#000000').replace('#', '').padEnd(6, '0')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function IPhoneWalletPreview({ primaryColor, accentColor, name, tagline, logoPreview, logoUrl, stampGoal, rewardDescription, stampIcon, stripImage, stripFocalPoint, stripScale, logoSize, qrBgColor, stampDisplay, logoTint, bannerGradient, bannerGradientWidth }: {
  primaryColor: string; accentColor: string; name: string; tagline: string
  logoPreview: string | null; logoUrl: string; stampGoal: number; rewardDescription: string; stampIcon: string
  stripImage: string | null; stripFocalPoint: string; stripScale: number; logoSize?: number
  qrBgColor?: string; stampDisplay?: string; logoTint?: string; bannerGradient?: string; bannerGradientWidth?: number
}) {
  const displayLogo = logoPreview || logoUrl || null
  const scale = logoSize ?? 1
  const FRAME_W = 300
  const FRAME_H = 620
  const BEZEL = 13
  const SCREEN_W = FRAME_W - BEZEL * 2
  const STRIP_H = Math.round((SCREEN_W - 24) * 144 / 375)
  const resolvedQrBg = qrBgColor || primaryColor

  function isLightHex(hex: string): boolean {
    const c = hex.replace('#', '')
    if (c.length < 6) return true
    const r = parseInt(c.slice(0, 2), 16)
    const g = parseInt(c.slice(2, 4), 16)
    const b = parseInt(c.slice(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 128
  }
  const qrLight = isLightHex(resolvedQrBg)
  const qrDot = qrLight ? '000000' : 'ffffff'
  const qrBg = resolvedQrBg.replace('#', '')
  const stampCount = Math.min(stampGoal, 12)

  return (
    <div style={{ position: 'relative', width: FRAME_W, height: FRAME_H, flexShrink: 0 }}>

      {/* Phone frame */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: 48,
        background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 40%, #252525 100%)',
        boxShadow: '0 60px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
      }} />

      {/* Volume buttons */}
      <div style={{ position: 'absolute', left: -3, top: 100, width: 4, height: 28, borderRadius: '2px 0 0 2px', background: '#2a2a2a' }} />
      <div style={{ position: 'absolute', left: -3, top: 138, width: 4, height: 56, borderRadius: '2px 0 0 2px', background: '#2a2a2a' }} />
      <div style={{ position: 'absolute', left: -3, top: 204, width: 4, height: 56, borderRadius: '2px 0 0 2px', background: '#2a2a2a' }} />
      {/* Power button */}
      <div style={{ position: 'absolute', right: -3, top: 170, width: 4, height: 76, borderRadius: '0 2px 2px 0', background: '#2a2a2a' }} />

      {/* Screen */}
      <div style={{
        position: 'absolute',
        top: BEZEL, left: BEZEL,
        width: SCREEN_W,
        height: FRAME_H - BEZEL * 2,
        borderRadius: 36,
        backgroundColor: '#1c1c1e',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Status bar + Dynamic Island */}
        <div style={{ position: 'relative', height: 54, flexShrink: 0, display: 'flex', alignItems: 'flex-end', paddingBottom: 8, paddingLeft: 18, paddingRight: 14 }}>
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 90, height: 26, background: '#000', borderRadius: 14 }} />
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>9:41</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="10" viewBox="0 0 14 10">
              <rect x="0" y="7" width="2" height="3" rx="0.5" fill="white"/>
              <rect x="3" y="5" width="2" height="5" rx="0.5" fill="white"/>
              <rect x="6" y="3" width="2" height="7" rx="0.5" fill="white"/>
              <rect x="9" y="1" width="2" height="9" rx="0.5" fill="white"/>
            </svg>
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <circle cx="6.5" cy="9" r="1" fill="white"/>
              <path d="M3.2 6a4.7 4.7 0 0 1 6.6 0" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M1 3.8a7.5 7.5 0 0 1 11 0" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <div style={{ width: 23, height: 11, borderRadius: 3, border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', padding: 1.5 }}>
                <div style={{ width: '82%', height: '100%', background: 'white', borderRadius: 1.5 }} />
              </div>
              <div style={{ width: 2, height: 5, background: 'rgba(255,255,255,0.4)', borderRadius: '0 1px 1px 0', marginLeft: 1 }} />
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 1 1 6.5 7 12"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 400, color: '#007AFF' }}>Tarjetas</span>
          </div>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>Tarjetas</span>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </div>

        {/* Wallet scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px' }}>

          {/* Loyalty card */}
          <div style={{ borderRadius: 16, background: primaryColor, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>

            {/* Card header: logo left, SELLOS right */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 6px' }}>
              {displayLogo ? (
                logoTint ? (
                  <div style={{
                    height: Math.round(22 * scale),
                    width: Math.round(80 * scale),
                    background: logoTint,
                    WebkitMaskImage: `url(${displayLogo})`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'left center',
                    maskImage: `url(${displayLogo})`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'left center',
                    transition: 'height 0.15s',
                    flexShrink: 0,
                  }} />
                ) : (
                  <img src={displayLogo} alt="" style={{ height: Math.round(22 * scale), maxWidth: `${Math.min(44 * scale, 70)}%`, objectFit: 'contain', display: 'block', transition: 'height 0.15s, max-width 0.15s' }} />
                )
              ) : (
                <span style={{ color: 'white', fontWeight: 900, fontSize: 10, lineHeight: 1.2 }}>{name || 'Tu negocio'}</span>
              )}
              {stampDisplay !== 'number' && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 5.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>SELLOS</div>
                  <div style={{ color: 'white', fontSize: 15, fontWeight: 900, lineHeight: 1 }}>1/{stampGoal}</div>
                </div>
              )}
            </div>

            {/* Banner — imagen ancho completo, nombre superpuesto */}
            <div style={{ position: 'relative', width: '100%', height: STRIP_H, overflow: 'hidden', background: primaryColor, flexShrink: 0 }}>
              {stripImage && (
                <img src={stripImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: stripFocalPoint, transform: `scale(${stripScale})`, transformOrigin: stripFocalPoint, display: 'block' }} />
              )}
              {/* Degradado de contraste opcional */}
              {bannerGradient && (
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${hexToRgba(bannerGradient, 1)} 0%, ${hexToRgba(bannerGradient, 0.55)} ${Math.round((bannerGradientWidth ?? 52) * 0.54)}%, transparent ${bannerGradientWidth ?? 52}%)`, pointerEvents: 'none' }} />
              )}
              {/* Nombre del cliente */}
              <div style={{ position: 'absolute', bottom: 8, left: 12 }}>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 17, lineHeight: 1, textShadow: bannerGradient ? 'none' : '0 1px 8px rgba(0,0,0,0.7)' }}>Eder</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 6, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>CLIENTE</div>
              </div>
            </div>

            {/* Fields: PROGRAMA | PREMIO */}
            <div style={{ display: 'flex', gap: 12, padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 5.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 1 }}>PROGRAMA</div>
                <div style={{ color: 'white', fontSize: 8, fontWeight: 700, lineHeight: 1.3 }}>{name || 'Tu programa'}</div>
                {tagline && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 7.5, marginTop: 1 }}>{tagline}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 5.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 1 }}>PREMIO</div>
                <div style={{ color: accentColor, fontSize: 8, fontWeight: 700, lineHeight: 1.3 }}>{rewardDescription || 'Premio especial'}</div>
              </div>
            </div>

            {/* QR section — color personalizable */}
            <div style={{ background: resolvedQrBg, padding: '10px 12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>

              {/* Sellos: íconos */}
              {stampDisplay === 'icons' && (
                <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', marginBottom: 4 }}>
                  {Array.from({ length: stampCount }, (_, i) => {
                    const svgPath = SVG_STAMP_PATHS[stampIcon] || null
                    const iconSize = stampCount <= 6 ? 18 : stampCount <= 8 ? 16 : 14
                    return svgPath ? (
                      <svg key={i} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        style={{ opacity: i === 0 ? 1 : 0.22, filter: i === 0 ? 'drop-shadow(0 0 3px white)' : undefined, flexShrink: 0 }}>
                        <path d={svgPath} />
                      </svg>
                    ) : (
                      <span key={i} style={{ fontSize: 11, opacity: i === 0 ? 1 : 0.18, filter: i === 0 ? 'drop-shadow(0 0 3px currentColor)' : undefined }}>{stampIcon || '⭐'}</span>
                    )
                  })}
                </div>
              )}

              {/* Sellos: número grande */}
              {stampDisplay === 'number' && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: qrLight ? '#000' : '#fff', lineHeight: 1 }}>1</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: qrLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)', lineHeight: 1 }}>/{stampGoal}</span>
                </div>
              )}

              {/* QR code */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=easyloyalty-preview&size=100x100&color=${qrDot}&bgcolor=${qrBg}&qzone=1`}
                alt="QR"
                style={{ width: 76, height: 76 }}
              />
              <span style={{ fontSize: 7, color: qrLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' }}>Easy Loyalty Program</span>
            </div>
          </div>

          {/* Stacked cards below (iOS Wallet effect) */}
          <div style={{ marginTop: -8, marginLeft: 12, marginRight: 12, height: 16, borderRadius: '0 0 12px 12px', background: `${primaryColor}aa` }} />
          <div style={{ marginTop: -4, marginLeft: 24, marginRight: 24, height: 14, borderRadius: '0 0 10px 10px', background: `${primaryColor}55` }} />
        </div>

        {/* Home bar */}
        <div style={{ height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 100, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
    </div>
  )
}

function StripDragger({ src, focalPoint, scale, onFocalChange, onScaleChange, onChangeFile, onRemove }: {
  src: string; focalPoint: string; scale: number
  onFocalChange: (v: string) => void; onScaleChange: (v: number) => void
  onChangeFile: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const drag = useRef<{ active: boolean; startX: number; startY: number; startFX: number; startFY: number } | null>(null)
  const pinch = useRef<{ startDist: number; startScale: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const cb = useRef({ onFocalChange, onScaleChange, focalPoint, scale })
  cb.current = { onFocalChange, onScaleChange, focalPoint, scale }

  const parseFocal = (fp: string) => {
    const [x = '50', y = '50'] = fp.split(' ')
    return { x: parseFloat(x), y: parseFloat(y) }
  }

  const getSensitivity = (currentScale: number) => {
    if (!containerRef.current || !imgRef.current) return { x: 0.3, y: 0.3 }
    const img = imgRef.current
    if (!img.naturalWidth || !img.naturalHeight) return { x: 0.3, y: 0.3 }
    const cW = containerRef.current.offsetWidth, cH = containerRef.current.offsetHeight
    const baseScale = Math.max(cW / img.naturalWidth, cH / img.naturalHeight) * currentScale
    const overflowX = img.naturalWidth * baseScale - cW
    const overflowY = img.naturalHeight * baseScale - cH
    return { x: overflowX > 1 ? 100 / overflowX : 0, y: overflowY > 1 ? 100 / overflowY : 0 }
  }

  useEffect(() => {
    const move = (clientX: number, clientY: number) => {
      if (!drag.current?.active) return
      const dx = clientX - drag.current.startX, dy = clientY - drag.current.startY
      const { x: sx, y: sy } = getSensitivity(cb.current.scale)
      const newX = Math.max(0, Math.min(100, drag.current.startFX - dx * sx))
      const newY = Math.max(0, Math.min(100, drag.current.startFY - dy * sy))
      cb.current.onFocalChange(`${Math.round(newX)}% ${Math.round(newY)}%`)
    }
    const end = () => { if (drag.current) { drag.current.active = false; setIsDragging(false) }; pinch.current = null }
    const onMM = (e: MouseEvent) => move(e.clientX, e.clientY)
    const onTM = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinch.current) {
        e.preventDefault()
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
        const newScale = Math.max(1, Math.min(3, pinch.current.startScale * (dist / pinch.current.startDist)))
        cb.current.onScaleChange(Math.round(newScale * 10) / 10)
      } else if (e.touches.length === 1) { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY) }
    }
    const onWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return
      e.preventDefault()
      const newScale = Math.max(1, Math.min(3, cb.current.scale + (e.deltaY > 0 ? -0.1 : 0.1)))
      cb.current.onScaleChange(Math.round(newScale * 10) / 10)
    }
    window.addEventListener('mousemove', onMM)
    window.addEventListener('mouseup', end)
    window.addEventListener('touchmove', onTM, { passive: false })
    window.addEventListener('touchend', end)
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('mousemove', onMM)
      window.removeEventListener('mouseup', end)
      window.removeEventListener('touchmove', onTM)
      window.removeEventListener('touchend', end)
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  const { x: fx, y: fy } = parseFocal(focalPoint)

  return (
    <div>
      {/* Draggable preview */}
      <div ref={containerRef}
        onMouseDown={e => {
          e.preventDefault()
          const { x, y } = parseFocal(cb.current.focalPoint)
          drag.current = { active: true, startX: e.clientX, startY: e.clientY, startFX: x, startFY: y }
          setIsDragging(true)
        }}
        onTouchStart={e => {
          if (e.touches.length === 2) {
            pinch.current = { startDist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), startScale: cb.current.scale }
          } else {
            e.preventDefault()
            const { x, y } = parseFocal(cb.current.focalPoint)
            drag.current = { active: true, startX: e.touches[0].clientX, startY: e.touches[0].clientY, startFX: x, startFY: y }
            setIsDragging(true)
          }
        }}
        style={{ position: 'relative', height: 110, borderRadius: 12, overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none', marginBottom: 8 }}>
        <img ref={imgRef} src={src} alt="Strip"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx}% ${fy}%`, transform: `scale(${scale})`, transformOrigin: `${fx}% ${fy}%`, pointerEvents: 'none', display: 'block', transition: isDragging ? 'none' : 'transform 0.15s' }} />
        {!isDragging && (
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
              <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
            </svg>
            <span style={{ color: 'white', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>Arrastra · Pellizca o usa el slider para escalar</span>
          </div>
        )}
        {isDragging && <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, pointerEvents: 'none' }} />}
      </div>

      {/* Zoom slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
        <input type="range" min="100" max="300" step="5"
          value={Math.round(scale * 100)}
          onChange={e => onScaleChange(parseInt(e.target.value) / 100)}
          style={{ flex: 1, accentColor: 'white', height: 3, cursor: 'pointer' }} />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{Math.round(scale * 100)}%</span>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
        <label style={{ cursor: 'pointer', flex: 1, textAlign: 'center', padding: '7px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 600 }}>
          Cambiar foto
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={onChangeFile} style={{ display: 'none' }} />
        </label>
        <button type="button" onClick={onRemove}
          style={{ padding: '7px 14px', borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: 'rgba(239,68,68,0.75)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          Quitar
        </button>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: value, borderRadius: 10 }} />
          <input type="color" value={value} onChange={e => handleWheelChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
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

function CustomerTimeline({ stamps, rewards, primary, accent }: {
  stamps: { created_at: string; stamps_given: number }[]
  rewards: { created_at: string }[]
  primary: string
  accent: string
}) {
  const events = [
    ...stamps.map(s => ({ date: new Date(s.created_at), type: 'stamp' as const, stamps_given: s.stamps_given })),
    ...rewards.map(r => ({ date: new Date(r.created_at), type: 'reward' as const, stamps_given: 0 })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 16 }}>
          {/* línea de tiempo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              backgroundColor: e.type === 'reward' ? `${accent}25` : `${primary}25`,
              border: `1.5px solid ${e.type === 'reward' ? accent : primary}50`,
            }}>
              {e.type === 'reward' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            {i < events.length - 1 && (
              <div style={{ width: 1, flex: 1, minHeight: 12, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 4 }} />
            )}
          </div>
          {/* contenido */}
          <div style={{ paddingTop: 4 }}>
            <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>
              {e.type === 'reward' ? '🎁 Premio canjeado' : `Sello registrado`}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '2px 0 0 0' }}>
              {e.date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}
              {e.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
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
