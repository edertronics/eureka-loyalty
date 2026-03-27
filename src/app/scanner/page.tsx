'use client'

import { useState, useRef } from 'react'

const EUREKA_BLUE = '#110DDE'
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
  const inputRef = useRef<HTMLInputElement>(null)

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

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#0a0820' }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Staff Scanner</p>
        <div className="flex items-center justify-center gap-1">
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>EUR</span>
          <span className="text-2xl font-black" style={{ color: EUREKA_ORANGE }}>⚡</span>
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>KA</span>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Scanner input */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <p className="text-white/70 text-sm text-center mb-4">
              Escanea el QR del cliente o ingrésalo manualmente
            </p>
            <input
              ref={inputRef}
              autoFocus
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
