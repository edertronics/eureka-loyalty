'use client'

import { useState } from 'react'

const EUREKA_BLUE = '#110DDE'
const EUREKA_ORANGE = '#EC4E20'
const EUREKA_GOLD = '#F6AE2D'

const FONT_BEBAS = 'var(--font-bebas), Impact, Arial Narrow, sans-serif'
const FONT_BODY = 'Helvetica Neue, Helvetica, Arial, sans-serif'

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState<{ name: string; qr_code: string } | null>(null)

  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, business_slug: 'eureka-burgers' }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrarse')

      setCustomer(data.customer)
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: EUREKA_BLUE }}
    >
      {/* Logo */}
      <div className="mb-8">
        <img src="/eureka-logo.png" alt="Eureka Burger" className="h-28 w-auto mx-auto" />
      </div>

      {step === 'form' && (
        <div className="w-full max-w-sm">
          <div
            className="p-6"
            style={{
              backgroundColor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <h1
              className="text-white text-3xl text-center mb-1 uppercase"
              style={{ fontFamily: FONT_BEBAS, letterSpacing: '0.1em' }}
            >
              Únete al club
            </h1>
            <p className="text-center text-sm mb-6" style={{ color: EUREKA_GOLD, fontFamily: FONT_BODY }}>
              Junta 9 sellos y tu 10ª burger es gratis
            </p>

            {/* Stamp preview */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 flex items-center justify-center"
                  style={{ border: `2px solid ${EUREKA_ORANGE}` }}
                >
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>⚡</span>
                </div>
              ))}
              <div
                className="w-7 h-7 flex items-center justify-center"
                style={{ border: `2px solid ${EUREKA_GOLD}`, backgroundColor: `${EUREKA_GOLD}30` }}
              >
                <span className="text-xs" style={{ color: EUREKA_GOLD }}>🍔</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1" style={{ fontFamily: FONT_BODY }}>
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="¿Cómo te llamas?"
                  className="w-full px-4 py-3 text-white placeholder-white/40 outline-none text-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontFamily: FONT_BODY,
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1" style={{ fontFamily: FONT_BODY }}>
                  WhatsApp / Teléfono
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="55 1234 5678"
                  className="w-full px-4 py-3 text-white placeholder-white/40 outline-none text-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontFamily: FONT_BODY,
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1" style={{ fontFamily: FONT_BODY }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 text-white placeholder-white/40 outline-none text-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontFamily: FONT_BODY,
                  }}
                />
              </div>

              {error && (
                <p className="text-sm text-center py-2 px-3" style={{ backgroundColor: `${EUREKA_ORANGE}30`, color: EUREKA_ORANGE, fontFamily: FONT_BODY }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !form.name}
                className="w-full py-4 text-white text-xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: EUREKA_ORANGE,
                  fontFamily: FONT_BEBAS,
                  letterSpacing: '0.15em',
                }}
              >
                {loading ? 'Creando tu tarjeta...' : '⚡ Quiero mi tarjeta'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-white/30 mt-4" style={{ fontFamily: FONT_BODY }}>
            Tus datos están protegidos y no serán compartidos
          </p>
        </div>
      )}

      {step === 'success' && customer && (
        <SuccessStep customer={customer} />
      )}
    </main>
  )
}

function SuccessStep({ customer }: { customer: { name: string; qr_code: string } }) {
  const firstName = customer.name.split(' ')[0]

  return (
    <div className="w-full max-w-sm text-center">
      <div className="text-5xl mb-4">⚡</div>
      <h2
        className="text-white text-4xl mb-2 uppercase"
        style={{ fontFamily: 'var(--font-bebas), Impact, Arial Narrow, sans-serif', letterSpacing: '0.08em' }}
      >
        ¡Listo, {firstName}!
      </h2>
      <p className="text-white/70 text-sm mb-6" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
        Ya eres parte del club. Muestra este QR en cada visita para acumular tus sellos.
      </p>

      {/* QR Code */}
      <div className="p-6 mx-auto w-fit" style={{ backgroundColor: 'white' }}>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${customer.qr_code}&color=110DDE`}
          alt="Tu QR de lealtad"
          width={200}
          height={200}
        />
      </div>

      <p className="text-xs mt-4" style={{ color: EUREKA_GOLD, fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
        ID: {customer.qr_code}
      </p>

      <p className="text-xs text-white/40 mt-6" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
        Guarda una captura de pantalla de tu QR para tenerlo siempre a la mano
      </p>
    </div>
  )
}
