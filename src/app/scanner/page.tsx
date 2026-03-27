'use client'

import { useState, useRef, useEffect } from 'react'

const EUREKA_ORANGE = '#EC4E20'
const EUREKA_GOLD = '#F6AE2D'

interface StampResult {
  success: boolean
  customer_name: string
  stamps_before: number
  stamps_after: number
  stamp_goal: number
  reward_unlocked: boolean
  reward_description: string
}

export default function ScannerPage() {
  const [qrInput, setQrInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StampResult | null>(null)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<import('qr-scanner').default | null>(null)

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

  async function startCamera() {
    setCameraActive(true)
    setError('')
    setResult(null)
  }

  function stopCamera() {
    if (scannerRef.current) {
      scannerRef.current.stop()
      scannerRef.current.destroy()
      scannerRef.current = null
    }
    setCameraActive(false)
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
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
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

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#0D0A8F' }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Staff Scanner</p>
        <img src="/eureka-logo.png" alt="Eureka Burger" className="h-48 w-auto mx-auto" />
      </div>

      <div className="w-full max-w-sm space-y-4">

        {/* Cámara */}
        {cameraActive ? (
          <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${EUREKA_ORANGE}` }}>
            <video ref={videoRef} className="w-full" />
            <button
              onClick={stopCamera}
              className="w-full py-3 font-black text-white uppercase tracking-widest text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={startCamera}
            className="w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest text-sm transition-all active:scale-95"
            style={{ backgroundColor: EUREKA_ORANGE }}
          >
            📷 Escanear QR con cámara
          </button>
        )}

        {/* Manual input */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <p className="text-white/70 text-sm text-center mb-4">
              O ingrésalo manualmente
            </p>
            <input
              ref={inputRef}
              type="text"
              value={qrInput}
              onChange={e => setQrInput(e.target.value)}
              placeholder="ELY-XXXXXXXXXXXX"
              className="w-full rounded-xl px-4 py-3 text-white text-center font-mono text-sm outline-none mb-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
            <button
              type="submit"
              disabled={loading || !qrInput.trim()}
              className="w-full py-3 rounded-xl font-black text-white uppercase tracking-widest text-sm transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: EUREKA_ORANGE }}
            >
              {loading ? 'Procesando...' : '⚡ Dar sello'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 text-center text-sm"
            style={{ backgroundColor: `${EUREKA_ORANGE}20`, border: `1px solid ${EUREKA_ORANGE}50`, color: EUREKA_ORANGE }}
          >
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              backgroundColor: result.reward_unlocked ? `${EUREKA_GOLD}15` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${result.reward_unlocked ? EUREKA_GOLD : 'rgba(255,255,255,0.12)'}`,
            }}
          >
            {result.reward_unlocked ? (
              <>
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-black text-xl mb-1" style={{ color: EUREKA_GOLD }}>
                  ¡Premio desbloqueado!
                </p>
                <p className="text-white font-semibold mb-1">{result.customer_name}</p>
                <p className="text-sm" style={{ color: EUREKA_GOLD }}>{result.reward_description}</p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-white font-bold text-lg mb-1">{result.customer_name}</p>
                <div className="flex justify-center gap-1 my-3 flex-wrap">
                  {Array.from({ length: result.stamp_goal }).map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border flex items-center justify-center text-xs"
                      style={{
                        borderColor: i < result.stamps_after ? EUREKA_ORANGE : 'rgba(255,255,255,0.2)',
                        backgroundColor: i < result.stamps_after ? `${EUREKA_ORANGE}30` : 'transparent',
                        color: i < result.stamps_after ? EUREKA_ORANGE : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {i < result.stamps_after ? '⚡' : '○'}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/60">
                  {result.stamps_after}/{result.stamp_goal} sellos
                  {' · '}
                  <span style={{ color: EUREKA_GOLD }}>
                    {result.stamp_goal - result.stamps_after} para el premio
                  </span>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
