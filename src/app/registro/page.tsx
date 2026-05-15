'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45
}

const GREEN  = '#00C896'
const TEAL   = '#063f3a'
const CARBON = '#111111'

const BRAND_COLORS = [
  { label: 'Morado',  value: '#6366f1' },
  { label: 'Azul',    value: '#3b82f6' },
  { label: 'Verde',   value: '#10b981' },
  { label: 'Rojo',    value: '#ef4444' },
  { label: 'Naranja', value: '#ea580c' },
  { label: 'Café',    value: '#92400e' },
  { label: 'Rosa',    value: '#ec4899' },
  { label: 'Negro',   value: '#1a1a1a' },
]

const ACCENT_COLORS = [
  { label: 'Dorado',  value: '#f59e0b' },
  { label: 'Naranja', value: '#fb923c' },
  { label: 'Coral',   value: '#f43f5e' },
  { label: 'Lima',    value: '#a3e635' },
  { label: 'Menta',   value: '#34d399' },
  { label: 'Cian',    value: '#38bdf8' },
  { label: 'Lavanda', value: '#c084fc' },
  { label: 'Blanco',  value: '#f8fafc' },
]

const FONT_STACK = `'HKGroteskWide', system-ui, -apple-system, sans-serif`

function CardPreview({ name, primary, accent, goal, reward }: {
  name: string; primary: string; accent: string; goal: number; reward: string
}) {
  const filled = Math.floor(goal * 0.4)
  const displayGoal = Math.min(goal, 10)
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: primary, boxShadow: `0 12px 40px ${primary}55`, transition: 'all 0.4s ease', width: '100%' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, margin: 0, fontFamily: FONT_STACK }}>Easy Loyalty</p>
        <p style={{ color: '#fff', fontSize: 16, fontWeight: 900, margin: '3px 0 0', letterSpacing: '-0.02em', fontFamily: FONT_STACK }}>{name || 'Tu negocio'}</p>
      </div>
      <div style={{ padding: '12px 16px 14px' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {Array.from({ length: displayGoal }).map((_, i) => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: i < filled ? accent : 'rgba(255,255,255,0.12)', border: `1.5px solid ${i < filled ? accent : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', boxShadow: i < filled ? `0 2px 8px ${accent}60` : 'none' }}>
              {i < filled && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isColorDark(accent) ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.55)'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontFamily: FONT_STACK }}>
          <span style={{ color: accent, fontSize: 11, fontWeight: 800 }}>{goal - filled} sellos más</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{' → '}{reward || 'tu premio'}</span>
        </p>
      </div>
    </div>
  )
}

function PhoneMockup({ name, primary, accent, goal, reward }: {
  name: string; primary: string; accent: string; goal: number; reward: string
}) {
  const filled = Math.floor(goal * 0.4)
  const displayGoal = Math.min(goal, 10)
  return (
    <div style={{ position: 'relative', width: 230, height: 460, backgroundColor: '#0d0d0d', border: '3px solid rgba(255,255,255,0.12)', borderRadius: 38, overflow: 'hidden', boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px ${primary}30`, flexShrink: 0, transition: 'box-shadow 0.4s ease' }}>
      {/* Dynamic island */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 72, height: 20, backgroundColor: '#0d0d0d', borderRadius: 14, zIndex: 10 }} />
      {/* Screen */}
      <div style={{ width: '100%', height: '100%', borderRadius: 35, overflow: 'hidden', background: '#111' }}>
        {/* Status bar */}
        <div style={{ height: 38, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 18px 5px' }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600, fontFamily: FONT_STACK }}>9:41</span>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <svg width="13" height="10" viewBox="0 0 13 10"><rect x="0" y="4" width="2" height="6" rx="0.5" fill="rgba(255,255,255,0.5)"/><rect x="3" y="2.5" width="2" height="7.5" rx="0.5" fill="rgba(255,255,255,0.5)"/><rect x="6" y="1" width="2" height="9" rx="0.5" fill="rgba(255,255,255,0.5)"/><rect x="9" y="0" width="2" height="10" rx="0.5" fill="rgba(255,255,255,0.7)"/></svg>
            <svg width="14" height="10" viewBox="0 0 14 10"><path d="M7 1.5C9.7 1.5 12.1 2.6 13.8 4.4L12.4 5.9C11.1 4.5 9.2 3.5 7 3.5S2.9 4.5 1.6 5.9L0.2 4.4C1.9 2.6 4.3 1.5 7 1.5Z" fill="rgba(255,255,255,0.5)"/><path d="M7 4.5C9 4.5 10.8 5.3 12.1 6.6L10.7 8.1C9.8 7.1 8.5 6.5 7 6.5S4.2 7.1 3.3 8.1L1.9 6.6C3.2 5.3 5 4.5 7 4.5Z" fill="rgba(255,255,255,0.7)"/><circle cx="7" cy="9.5" r="1" fill="white"/></svg>
            <div style={{ width: 22, height: 11, border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 3, display: 'flex', alignItems: 'center', padding: '0 2px', gap: 1 }}>
              <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
              <div style={{ width: 2, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: 'calc(100% - 38px)', overflowY: 'hidden' }}>
          {/* Business header */}
          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 2px', fontFamily: FONT_STACK }}>Easy Loyalty</p>
            <p style={{ color: '#fff', fontSize: 15, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', fontFamily: FONT_STACK }}>{name || 'Tu negocio'}</p>
          </div>

          {/* Loyalty card */}
          <div style={{ borderRadius: 14, overflow: 'hidden', background: primary, boxShadow: `0 8px 24px ${primary}60`, transition: 'all 0.4s ease', flexShrink: 0 }}>
            <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 3px', fontFamily: FONT_STACK }}>Tu tarjeta de lealtad</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {Array.from({ length: displayGoal }).map((_, i) => (
                  <div key={i} style={{ width: i < filled ? 18 : 16, height: i < filled ? 18 : 16, borderRadius: '50%', background: i < filled ? accent : 'rgba(255,255,255,0.1)', border: `1.5px solid ${i < filled ? accent : 'rgba(255,255,255,0.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', boxShadow: i < filled ? `0 2px 6px ${accent}50` : 'none' }}>
                    {i < filled && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={isColorDark(accent) ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '8px 14px 12px' }}>
              <span style={{ color: accent, fontSize: 10, fontWeight: 800, fontFamily: FONT_STACK }}>{goal - filled} sellos más </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: FONT_STACK }}>→ {reward || 'tu premio'}</span>
            </div>
          </div>

          {/* QR placeholder */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8, fontFamily: FONT_STACK, margin: 0, textAlign: 'center' }}>Tu QR único aparece aquí</p>
          </div>

          {/* Add to Wallet */}
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: FONT_STACK, fontWeight: 600 }}>Añadir a Apple / Google Wallet</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')
  const [done, setDone] = useState<{ name: string; slug: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [slugError, setSlugError] = useState('')
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([])
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [hexPrimary, setHexPrimary] = useState('#6366f1')
  const [hexAccent, setHexAccent] = useState('#f59e0b')
  const timerPassword = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerConfirm = useRef<ReturnType<typeof setTimeout> | null>(null)

  function toggleShow(
    current: boolean,
    setter: (v: boolean) => void,
    timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) {
    if (current) { if (timer.current) clearTimeout(timer.current); setter(false) }
    else {
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
    name: '', slug: '', tagline: '',
    primary_color: '#6366f1', accent_color: '#f59e0b',
    stamp_goal: '10', reward_description: '',
    admin_password: '', admin_password_confirm: '',
  })

  function handleHex(field: 'primary_color' | 'accent_color', val: string, setHex: (v: string) => void) {
    const v = val.startsWith('#') ? val : '#' + val
    setHex(v)
    if (/^#[0-9a-fA-F]{6}$/.test(v)) set(field, v)
  }

  function set(field: string, value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name') {
        next.slug = value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
      }
      return next
    })
  }

  useEffect(() => {
    const slug = form.slug
    if (!slug || slug.length < 2) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    if (checkTimer.current) clearTimeout(checkTimer.current)
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        if (data.available) { setSlugStatus('available'); setSlugError(''); setSlugSuggestions([]) }
        else { setSlugStatus('taken'); setSlugError('Esa dirección ya la usa otro negocio'); setSlugSuggestions(generateSuggestions(slug)) }
      } catch { setSlugStatus('idle') }
    }, 600)
  }, [form.slug])

  function validateStep1(): string {
    if (!form.name || !form.slug) return 'Completa el nombre y la dirección'
    if (slugStatus === 'taken') return 'Esa dirección ya está en uso'
    if (slugStatus === 'checking') return 'Verificando dirección...'
    if (form.admin_password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (form.admin_password !== form.admin_password_confirm) return 'Las contraseñas no coinciden'
    return ''
  }

  function goToStep2() {
    const err = validateStep1()
    if (err) { setStepError(err); return }
    setStepError('')
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.reward_description) { setError('Describe el premio para tus clientes'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, slug: form.slug, tagline: form.tagline,
          primary_color: form.primary_color, accent_color: form.accent_color,
          stamp_goal: form.stamp_goal, reward_description: form.reward_description,
          admin_password: form.admin_password,
        }),
      })
      const data = await res.json()
      if (res.status === 409) { setStep(1); setSlugError('Esa dirección ya la usa otro negocio'); setSlugSuggestions(generateSuggestions(form.slug)); return }
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

  const LABEL = { color: `${GREEN}99`, fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: FONT_STACK }
  const INPUT = { width: '100%', borderRadius: 10, padding: '13px 14px', color: '#fff', outline: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 16, fontFamily: FONT_STACK, boxSizing: 'border-box' as const }

  const FONT_FACES = `
    @font-face { font-family: 'HKGroteskWide'; src: url('/fonts/HKGroteskWide-Black.otf'); font-weight: 900; }
    @font-face { font-family: 'HKGroteskWide'; src: url('/fonts/HKGroteskWide-ExtraBold.otf'); font-weight: 800; }
    @font-face { font-family: 'HKGroteskWide'; src: url('/fonts/HKGroteskWide-Bold.otf'); font-weight: 700; }
    @font-face { font-family: 'HKGroteskWide'; src: url('/fonts/HKGroteskWide-SemiBold.otf'); font-weight: 600; }
    @font-face { font-family: 'HKGroteskWide'; src: url('/fonts/HKGroteskWide-Medium.otf'); font-weight: 500; }
    @font-face { font-family: 'HKGroteskWide'; src: url('/fonts/HKGroteskWide-Regular.otf'); font-weight: 400; }
  `

  // ── SUCCESS ──────────────────────────────────────────────────────
  if (done) {
    const links = [
      { label: 'Tarjeta para tus clientes', path: `/${done.slug}`,         key: 'card'    },
      { label: 'Tu panel de control',        path: `/${done.slug}/admin`,   key: 'admin'   },
      { label: 'Scanner de sellos',           path: `/${done.slug}/scanner`, key: 'scanner' },
    ]
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', background: `linear-gradient(160deg, ${TEAL} 0%, ${CARBON} 60%)`, fontFamily: FONT_STACK }}>
        <style>{`${FONT_FACES}
          @keyframes popIn { from { transform: scale(0.5) rotate(-8deg); opacity: 0 } to { transform: scale(1) rotate(0deg); opacity: 1 } }
          @keyframes fadeUp { from { transform: translateY(18px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        `}</style>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: `0 0 40px ${GREEN}60` }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.03em', animation: 'fadeUp 0.4s ease 0.2s both', fontFamily: FONT_STACK }}>
              ¡{done.name} ya tiene lealtad!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0, animation: 'fadeUp 0.4s ease 0.3s both', fontFamily: FONT_STACK }}>
              Tu programa está activo. Comparte estas URLs.
            </p>
          </div>

          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(0,200,150,0.2)`, marginBottom: 14, animation: 'fadeUp 0.4s ease 0.4s both' }}>
            {links.map(({ label, path, key }, i) => (
              <div key={key} onClick={() => copyUrl(path, key)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', cursor: 'pointer',
                borderBottom: i < links.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: copied === key ? 'rgba(0,200,150,0.06)' : 'transparent', transition: 'background 0.2s',
              }}>
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <p style={{ color: `${GREEN}80`, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px', fontFamily: FONT_STACK }}>{label}</p>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>easyloyalty.io{path}</p>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, marginLeft: 12, background: copied === key ? `${GREEN}20` : 'rgba(255,255,255,0.07)', border: `1px solid ${copied === key ? GREEN : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s' }}>
                  {copied === key
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  }
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, animation: 'fadeUp 0.4s ease 0.5s both' }}>
            <button onClick={() => router.push(`/${done.slug}`)}
              style={{ flex: 1, padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: FONT_STACK }}>
              Ver tarjeta
            </button>
            <button onClick={() => router.push(`/${done.slug}/admin`)}
              style={{ flex: 2, padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 14, color: TEAL, background: GREEN, border: 'none', cursor: 'pointer', fontFamily: FONT_STACK, letterSpacing: '-0.01em' }}>
              Ir a mi panel →
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── FORM ─────────────────────────────────────────────────────────
  const STEPS = [{ n: 1, label: 'Tu negocio' }, { n: 2, label: 'Tu tarjeta' }]
  const color  = form.primary_color
  const accent = form.accent_color

  const step1Valid = form.name && form.slug && slugStatus !== 'taken' && slugStatus !== 'checking'
    && form.admin_password.length >= 6 && form.admin_password === form.admin_password_confirm

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: step === 2 ? 'flex-start' : 'center', padding: '32px 16px', background: `linear-gradient(160deg, ${TEAL} 0%, ${CARBON} 65%)`, fontFamily: FONT_STACK }}>
      <style>{`
        ${FONT_FACES}
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(0,200,150,0.5) !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: step === 2 ? 820 : 360, transition: 'max-width 0.4s ease' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/img/logo-dark.png" alt="Easy Loyalty" style={{ height: 60, width: 'auto', filter: 'invert(1)', opacity: 0.95, display: 'inline-block' }} />
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
          {STEPS.map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, transition: 'all 0.35s ease', fontFamily: FONT_STACK,
                  background: step >= n ? GREEN : 'rgba(255,255,255,0.08)',
                  color: step >= n ? TEAL : 'rgba(255,255,255,0.2)',
                  opacity: step < n ? 0.4 : 1,
                  boxShadow: step === n ? `0 0 20px ${GREEN}60` : 'none',
                  outline: step === n ? `2px solid rgba(0,200,150,0.35)` : 'none',
                  outlineOffset: '3px',
                }}>
                  {step > n
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : n
                  }
                </div>
                <span style={{ color: step >= n ? `${GREEN}90` : 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 0.3s', fontFamily: FONT_STACK }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1.5, borderRadius: 1, marginTop: 13, background: step > n ? `${GREEN}60` : 'rgba(255,255,255,0.08)', transition: 'background 0.35s ease' }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── PASO 1: Negocio + Contraseña ── */}
          {step === 1 && (
            <div style={{ borderRadius: 20, padding: 24, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(0,200,150,0.15)`, backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.02em', fontFamily: FONT_STACK }}>Tu negocio</h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0, fontFamily: FONT_STACK }}>Cuéntanos sobre tu local</p>
              </div>

              <div>
                <label style={LABEL}>Nombre del negocio *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej. Café Luna" required style={INPUT} />
              </div>

              <div>
                <label style={LABEL}>Dirección de tu tarjeta *</label>
                <div style={{ display: 'flex', alignItems: 'center', borderRadius: 10, overflow: 'hidden', border: `1px solid ${slugStatus === 'taken' ? 'rgba(239,68,68,0.5)' : slugStatus === 'available' ? `${GREEN}60` : 'rgba(255,255,255,0.1)'}`, background: 'rgba(255,255,255,0.06)', transition: 'border 0.3s' }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: '13px 10px', borderRight: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                    easyloyalty.io/
                  </span>
                  <input type="text" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="mi-negocio" required
                    style={{ flex: 1, padding: '13px 10px', color: '#fff', outline: 'none', background: 'transparent', border: 'none', fontSize: 16, fontFamily: 'monospace', boxSizing: 'border-box' as const }} />
                  <div style={{ paddingRight: 12, flexShrink: 0 }}>
                    {slugStatus === 'checking'  && <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid rgba(0,200,150,0.2)`, borderTopColor: GREEN, animation: 'spin 0.7s linear infinite' }} />}
                    {slugStatus === 'available' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {slugStatus === 'taken'     && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                  </div>
                </div>
                {slugStatus === 'available' && (
                  <p style={{ color: GREEN, fontSize: 11, fontWeight: 600, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT_STACK }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Dirección disponible
                  </p>
                )}
                {slugStatus === 'taken' && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ color: '#f87171', fontSize: 12, fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5, fontFamily: FONT_STACK }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {slugError}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {slugSuggestions.map(s => (
                        <button key={s} type="button" onClick={() => set('slug', s)}
                          style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={LABEL}>Slogan <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
                <input type="text" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Ej. El mejor café de la colonia" style={INPUT} />
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

              <div>
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 14px', letterSpacing: '-0.01em', fontFamily: FONT_STACK }}>Contraseña de acceso</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={LABEL}>Contraseña *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? 'text' : 'password'} value={form.admin_password} onChange={e => set('admin_password', e.target.value)} placeholder="Mínimo 6 caracteres" required style={{ ...INPUT, paddingRight: 44 }} />
                      <button type="button" onClick={() => toggleShow(showPassword, setShowPassword, timerPassword)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                        {showPassword
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={LABEL}>Confirmar contraseña *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPasswordConfirm ? 'text' : 'password'} value={form.admin_password_confirm} onChange={e => set('admin_password_confirm', e.target.value)} placeholder="Repite la contraseña" required style={{ ...INPUT, paddingRight: 44 }} />
                      <button type="button" onClick={() => toggleShow(showPasswordConfirm, setShowPasswordConfirm, timerConfirm)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                        {showPasswordConfirm
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {stepError && (
                <p style={{ fontSize: 13, textAlign: 'center', padding: '11px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', margin: 0, border: '1px solid rgba(239,68,68,0.2)', fontFamily: FONT_STACK }}>
                  {stepError}
                </p>
              )}

              <button type="button" onClick={goToStep2}
                style={{ width: '100%', padding: '15px 0', borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: step1Valid ? 'pointer' : 'not-allowed', opacity: step1Valid ? 1 : 0.35, border: 'none', fontFamily: FONT_STACK, letterSpacing: '-0.01em', background: GREEN, color: TEAL, transition: 'opacity 0.2s' }}>
                Diseña tu tarjeta →
              </button>
            </div>
          )}

          {/* ── PASO 2: Constructor visual de tarjeta ── */}
          {step === 2 && (
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>

              {/* Preview — mockup de teléfono dominante */}
              <div style={{ flex: '1 1 260px', minWidth: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <p style={{ color: `${GREEN}70`, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, fontFamily: FONT_STACK, alignSelf: 'flex-start' }}>
                  Así verán tu tarjeta
                </p>
                <PhoneMockup name={form.name} primary={color} accent={accent} goal={parseInt(form.stamp_goal)} reward={form.reward_description} />
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(0,200,150,0.07)', border: '1px solid rgba(0,200,150,0.15)', width: '100%', maxWidth: 230 }}>
                  <p style={{ color: `${GREEN}80`, fontSize: 11, fontFamily: FONT_STACK, margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
                    Puedes cambiar colores, logo y más desde tu panel.
                  </p>
                </div>
              </div>

              {/* Controles */}
              <div style={{ flex: '1 1 280px', minWidth: 260, borderRadius: 20, padding: 22, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(0,200,150,0.15)`, backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', gap: 18 }}>

                <div>
                  <label style={LABEL}>Color principal</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: 8 }}>
                    {BRAND_COLORS.map(c => (
                      <button key={c.value} type="button" onClick={() => { set('primary_color', c.value); setHexPrimary(c.value) }}
                        style={{ height: 30, borderRadius: 7, background: c.value, cursor: 'pointer', border: 'none', padding: 0, transition: 'all 0.2s', outline: form.primary_color === c.value ? `2.5px solid ${GREEN}` : '2px solid transparent', outlineOffset: '2px', transform: form.primary_color === c.value ? 'scale(1.18)' : 'scale(1)', boxShadow: c.value === '#1a1a1a' ? 'inset 0 0 0 1px rgba(255,255,255,0.15)' : 'none' }}
                        title={c.label} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.primary_color}
                      onChange={e => { set('primary_color', e.target.value); setHexPrimary(e.target.value) }}
                      style={{ width: 38, height: 38, padding: 3, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                    <input type="text" value={hexPrimary} maxLength={7} placeholder="#000000"
                      onChange={e => handleHex('primary_color', e.target.value, setHexPrimary)}
                      onBlur={e => { const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) { set('primary_color', v); setHexPrimary(v) } else setHexPrimary(form.primary_color) }}
                      style={{ ...INPUT, fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.05em' }} />
                  </div>
                </div>

                <div>
                  <label style={LABEL}>Color de acento <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>sellos y botones</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: 8 }}>
                    {ACCENT_COLORS.map(c => (
                      <button key={c.value} type="button" onClick={() => { set('accent_color', c.value); setHexAccent(c.value) }}
                        style={{ height: 30, borderRadius: 7, background: c.value, cursor: 'pointer', border: 'none', padding: 0, transition: 'all 0.2s', outline: form.accent_color === c.value ? `2.5px solid ${GREEN}` : '2px solid transparent', outlineOffset: '2px', transform: form.accent_color === c.value ? 'scale(1.18)' : 'scale(1)', boxShadow: c.value === '#f8fafc' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none' }}
                        title={c.label} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.accent_color}
                      onChange={e => { set('accent_color', e.target.value); setHexAccent(e.target.value) }}
                      style={{ width: 38, height: 38, padding: 3, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                    <input type="text" value={hexAccent} maxLength={7} placeholder="#000000"
                      onChange={e => handleHex('accent_color', e.target.value, setHexAccent)}
                      onBlur={e => { const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) { set('accent_color', v); setHexAccent(v) } else setHexAccent(form.accent_color) }}
                      style={{ ...INPUT, fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.05em' }} />
                  </div>
                </div>

                <div>
                  <label style={LABEL}>Sellos para el premio *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {['5', '8', '10', '12'].map(n => (
                      <button key={n} type="button" onClick={() => set('stamp_goal', n)}
                        style={{ padding: '11px 0', borderRadius: 10, fontSize: 16, fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', fontFamily: FONT_STACK, border: 'none', background: form.stamp_goal === n ? GREEN : 'rgba(255,255,255,0.07)', color: form.stamp_goal === n ? TEAL : 'rgba(255,255,255,0.35)', transform: form.stamp_goal === n ? 'scale(1.06)' : 'scale(1)', boxShadow: form.stamp_goal === n ? `0 4px 16px ${GREEN}40` : 'none' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={LABEL}>¿Cuál es el premio? *</label>
                  <input type="text" value={form.reward_description} onChange={e => set('reward_description', e.target.value)} placeholder="Ej. 1 café gratis" required style={INPUT} />
                </div>

                {error && (
                  <p style={{ fontSize: 13, textAlign: 'center', padding: '11px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', margin: 0, border: '1px solid rgba(239,68,68,0.2)', fontFamily: FONT_STACK }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button type="button" onClick={() => setStep(1)}
                    style={{ flex: 1, padding: '13px 0', borderRadius: 12, fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: FONT_STACK }}>
                    ← Atrás
                  </button>
                  <button type="submit" disabled={loading || !form.reward_description}
                    style={{ flex: 2, padding: '13px 0', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: (loading || !form.reward_description) ? 'not-allowed' : 'pointer', opacity: (loading || !form.reward_description) ? 0.35 : 1, border: 'none', fontFamily: FONT_STACK, background: GREEN, color: TEAL, letterSpacing: '-0.01em' }}>
                    {loading ? 'Creando...' : '¡Crear mi programa! →'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.1)', fontSize: 11, marginTop: 20, letterSpacing: '0.04em', fontFamily: FONT_STACK }}>
          Easy Loyalty · Plataforma de lealtad digital
        </p>
      </div>
    </main>
  )
}
