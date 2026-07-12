'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Business {
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  stamp_goal: number
  reward_description: string
}

interface StampResult {
  success: boolean
  customer_name: string
  stamps_before: number
  stamps_after: number
  stamp_goal: number
  reward_unlocked: boolean
  reward_description: string
}

export default function DynamicScannerPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  // Auth
  const [authState, setAuthState] = useState<'loading' | 'login' | 'ok'>('loading')
  const [staffPin, setStaffPin] = useState('')
  const [staffError, setStaffError] = useState('')
  const [staffLoading, setStaffLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const pinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [qrInput, setQrInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StampResult | null>(null)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<import('qr-scanner').default | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch(`/api/business/${slug}`).then(r => r.json()),
      fetch(`/api/business/${slug}/staff-check`),
    ]).then(([bizData, authRes]) => {
      if (bizData.business) setBusiness(bizData.business)
      else setNotFound(true)
      setAuthState(authRes.ok ? 'ok' : 'login')
    }).catch(() => {
      setNotFound(true)
    }).finally(() => setPageLoading(false))
  }, [slug])

  function togglePin() {
    if (showPin) {
      if (pinTimerRef.current) clearTimeout(pinTimerRef.current)
      setShowPin(false)
    } else {
      setShowPin(true)
      if (pinTimerRef.current) clearTimeout(pinTimerRef.current)
      pinTimerRef.current = setTimeout(() => setShowPin(false), 2000)
    }
  }

  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!staffPin.trim()) return
    setStaffLoading(true)
    setStaffError('')
    try {
      const res = await fetch(`/api/business/${slug}/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: staffPin.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setAuthState('ok')
      setStaffPin('')
    } catch (err: unknown) {
      setStaffError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setStaffLoading(false)
    }
  }

  async function handleStamp(qr: string) {
    if (!qr.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qr.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setQrInput('')
      setTimeout(() => inputRef.current?.focus(), 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleStamp(qrInput)
  }

  useEffect(() => {
    if (!cameraActive || !videoRef.current) return
    let destroyed = false
    async function initScanner() {
      const QrScanner = (await import('qr-scanner')).default
      if (destroyed || !videoRef.current) return
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          scanner.stop()
          scanner.destroy()
          scannerRef.current = null
          setCameraActive(false)
          handleStamp(result.data)
        },
        { highlightScanRegion: true, highlightCodeOutline: true, preferredCamera: 'environment' }
      )
      scannerRef.current = scanner
      await scanner.start()
    }
    initScanner()
    return () => {
      destroyed = true
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
      }
    }
  }, [cameraActive])

  const FONT  = 'system-ui, -apple-system, Helvetica Neue, sans-serif'
  const NAVY  = '#003860'
  const MUTED = 'rgba(0,56,96,0.45)'
  const BDR   = 'rgba(0,56,96,0.18)'

  if (pageLoading || authState === 'loading') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <p style={{ color: MUTED, fontSize: 14, fontFamily: FONT }}>Cargando...</p>
      </main>
    )
  }

  if (notFound || !business) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 24 }}>
        <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 700, fontFamily: FONT }}>Negocio no encontrado</h1>
      </main>
    )
  }

  // El logo normal de eureka-burgers es un badge azul sólido (pensado para fondos azules/oscuros);
  // aquí el fondo es blanco, así que usamos la variante transparente solo en esta página.
  const scannerLogoUrl = slug === 'eureka-burgers'
    ? 'https://udcvtwjumcunbgcqnvpn.supabase.co/storage/v1/object/public/logos/eureka-burgers/logo-transparente.png'
    : business.logo_url

  // Pantalla de login para staff
  if (authState === 'login') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: '#ffffff', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Logo o nombre */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ color: MUTED, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, fontFamily: FONT }}>
              Staff Scanner
            </p>
            {scannerLogoUrl
              ? <img src={scannerLogoUrl} alt={business.name} style={{ height: 44, width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
              : <h1 style={{ color: NAVY, fontSize: 20, fontWeight: 900, fontFamily: FONT, letterSpacing: '-0.02em', margin: 0 }}>{business.name}</h1>
            }
          </div>

          {/* Card de login */}
          <div style={{ width: '100%', borderRadius: 20, padding: 24, backgroundColor: 'rgba(0,56,96,0.04)', border: `1.5px solid ${BDR}`, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(0,56,96,0.08)', margin: '0 auto 16px', border: `1px solid ${BDR}` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 style={{ color: NAVY, fontSize: 17, fontWeight: 800, fontFamily: FONT, textAlign: 'center', margin: '0 0 4px 0' }}>
              Acceso de Staff
            </h2>
            <p style={{ color: MUTED, fontSize: 13, fontFamily: FONT, textAlign: 'center', margin: '0 0 20px 0' }}>
              Ingresa el PIN de empleado
            </p>

            <form onSubmit={handleStaffLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={staffPin}
                  onChange={e => setStaffPin(e.target.value)}
                  placeholder="PIN"
                  autoFocus
                  style={{
                    width: '100%', padding: '13px 44px 13px 14px', fontSize: 18, color: NAVY,
                    textAlign: 'center', letterSpacing: '0.2em',
                    background: 'rgba(0,56,96,0.04)', border: `1.5px solid ${BDR}`,
                    borderRadius: 12, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
                  }}
                />
                <button type="button" onClick={togglePin}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: showPin ? NAVY : MUTED }}>
                  {showPin ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>

              {staffError && (
                <div style={{ borderRadius: 10, padding: '10px 14px', textAlign: 'center', fontSize: 13, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontFamily: FONT }}>
                  {staffError}
                </div>
              )}

              <button
                type="submit"
                disabled={staffLoading || !staffPin.trim()}
                style={{
                  width: '100%', padding: 14, borderRadius: 12, fontWeight: 800,
                  color: '#ffffff', background: NAVY, border: 'none',
                  cursor: staffLoading || !staffPin.trim() ? 'not-allowed' : 'pointer',
                  opacity: staffLoading || !staffPin.trim() ? 0.4 : 1, fontSize: 15, fontFamily: FONT,
                }}
              >
                {staffLoading ? 'Verificando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px 16px 16px', background: '#ffffff', boxSizing: 'border-box' }}>

      {/* Header con logo del negocio */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ color: MUTED, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, fontFamily: FONT }}>
          Staff Scanner
        </p>
        {scannerLogoUrl
          ? <img src={scannerLogoUrl} alt={business.name} style={{ height: 40, width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
          : <h1 style={{ color: NAVY, fontSize: 18, fontWeight: 900, fontFamily: FONT, letterSpacing: '-0.02em', margin: 0 }}>{business.name}</h1>
        }
      </div>

      <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>

        {/* Cámara */}
        {cameraActive ? (
          <div style={{ borderRadius: 14, overflow: 'hidden', border: `2px solid ${BDR}` }}>
            <video ref={videoRef} style={{ width: '100%', display: 'block', maxHeight: '38vh', objectFit: 'cover' }} />
            <button
              onClick={() => setCameraActive(false)}
              style={{ width: '100%', padding: 10, fontWeight: 700, color: MUTED, background: 'rgba(0,56,96,0.05)', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: FONT }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setCameraActive(true); setError(''); setResult(null) }}
            style={{ width: '100%', padding: 14, borderRadius: 14, fontWeight: 800, color: NAVY, background: 'rgba(0,56,96,0.06)', border: `2px solid ${BDR}`, cursor: 'pointer', fontSize: 15, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Escanear QR con cámara
          </button>
        )}

        {/* Divisor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: BDR }} />
          <span style={{ color: MUTED, fontSize: 11, fontFamily: FONT }}>o ingresa el código</span>
          <div style={{ flex: 1, height: 1, background: BDR }} />
        </div>

        {/* Input manual */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={qrInput}
            onChange={e => setQrInput(e.target.value)}
            placeholder="ELY-XXXXXXXXXXXX"
            style={{
              width: '100%', padding: '12px 14px', fontSize: 16, color: NAVY, textAlign: 'center',
              background: 'rgba(0,56,96,0.04)', border: `1.5px solid ${BDR}`,
              borderRadius: 10, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            style={{
              width: '100%', padding: 14, borderRadius: 10, fontWeight: 800,
              color: '#ffffff', background: NAVY, border: 'none',
              cursor: loading || !qrInput.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !qrInput.trim() ? 0.4 : 1, fontSize: 15, fontFamily: FONT,
            }}
          >
            {loading ? 'Procesando...' : 'Dar sello'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{ borderRadius: 12, padding: 16, textAlign: 'center', fontSize: 13, background: 'rgba(0,56,96,0.04)', border: `1px solid ${BDR}`, color: NAVY, fontFamily: FONT }}>
            {error}
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div style={{
            borderRadius: 16, padding: 24, textAlign: 'center',
            background: result.reward_unlocked ? 'rgba(0,56,96,0.06)' : 'rgba(0,56,96,0.04)',
            border: `1.5px solid ${result.reward_unlocked ? NAVY : BDR}`,
          }}>
            {result.reward_unlocked ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                <p style={{ fontWeight: 900, fontSize: 20, color: NAVY, marginBottom: 6, fontFamily: FONT }}>¡Premio desbloqueado!</p>
                <p style={{ color: NAVY, fontWeight: 700, marginBottom: 6, fontFamily: FONT }}>{result.customer_name}</p>
                <p style={{ fontSize: 14, color: MUTED, fontFamily: FONT }}>{result.reward_description}</p>
              </>
            ) : (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,56,96,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p style={{ color: NAVY, fontWeight: 800, fontSize: 18, marginBottom: 12, fontFamily: FONT }}>{result.customer_name}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  {Array.from({ length: result.stamp_goal }).map((_, i) => (
                    <div key={i} style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: `2px solid ${i < result.stamps_after ? NAVY : BDR}`,
                      background: i < result.stamps_after ? 'rgba(0,56,96,0.12)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {i < result.stamps_after ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : null}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: MUTED, fontFamily: FONT }}>
                  {result.stamps_after}/{result.stamp_goal} sellos
                  {' · '}
                  <span style={{ color: NAVY, fontWeight: 700 }}>{result.stamp_goal - result.stamps_after} para el premio</span>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
