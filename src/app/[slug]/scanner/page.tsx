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

  const [qrInput, setQrInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StampResult | null>(null)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<import('qr-scanner').default | null>(null)

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

  if (pageLoading) {
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

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px 16px 16px', background: '#ffffff', boxSizing: 'border-box' }}>

      {/* Header con logo del negocio */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ color: MUTED, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, fontFamily: FONT }}>
          Staff Scanner
        </p>
        {business.logo_url
          ? <img src={business.logo_url} alt={business.name} style={{ height: 40, width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
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
