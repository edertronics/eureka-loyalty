'use client'

import { useState } from 'react'
import Image from 'next/image'

const EUREKA_BLUE = '#110DDE'
const EUREKA_ORANGE = '#EC4E20'
const EUREKA_GOLD = '#F6AE2D'

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState<{ name: string; qr_code: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          business_slug: 'eureka-burgers',
        }),
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
      {/* Logo / Header */}
      <div className="mb-8 text-center">
        <img src="/eureka-logo.png" alt="Eureka Burger" className="h-60 w-auto mx-auto" />
      </div>

      {step === 'form' && (
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <h1 className="text-white text-xl font-bold text-center mb-1" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
              Únete al club
            </h1>
            <p className="text-center text-sm mb-6" style={{ color: EUREKA_GOLD }}>
              Junta 9 sellos y tu 10ª burger es gratis
            </p>

            {/* Stamp preview */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: EUREKA_ORANGE }}
                >
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>⚡</span>
                </div>
              ))}
              <div
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: EUREKA_GOLD, backgroundColor: `${EUREKA_GOLD}30` }}
              >
                <span className="text-xs" style={{ color: EUREKA_GOLD }}>🍔</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="¿Cómo te llamas?"
                  className="w-full rounded-lg px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 text-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                  WhatsApp / Teléfono
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="55 1234 5678"
                  className="w-full rounded-lg px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 text-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className="w-full rounded-lg px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 text-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              </div>

              {error && (
                <p className="text-sm text-center py-2 px-3 rounded-lg" style={{ backgroundColor: `${EUREKA_ORANGE}30`, color: EUREKA_ORANGE }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !form.name}
                className="w-full py-4 rounded-xl font-black text-white text-base uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: EUREKA_ORANGE,
                  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                }}
              >
                {loading ? 'Creando tu tarjeta...' : '⚡ Quiero mi tarjeta'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-white/40 mt-4">
            Tu tarjeta se guarda directo en tu Apple Wallet o Google Wallet
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
      <h2 className="text-white text-2xl font-black mb-2" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
        ¡Listo, {firstName}!
      </h2>
      <p className="text-white/70 text-sm mb-6">
        Ya eres parte del club. Muestra este QR en cada visita para acumular tus sellos.
      </p>

      {/* QR Code display */}
      <div className="rounded-2xl p-6 mx-auto w-fit shadow-2xl" style={{ backgroundColor: 'white' }}>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${customer.qr_code}&color=110DDE`}
          alt="Tu QR de lealtad"
          width={200}
          height={200}
          className="rounded-lg"
        />
      </div>

      <p className="text-xs mt-4" style={{ color: '#F6AE2D' }}>
        ID: {customer.qr_code}
      </p>

      <div className="mt-6 space-y-3">
        <a
          href={`/api/passes/apple?qr=${customer.qr_code}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: 'black', color: 'white' }}
        >
          <span>🍎</span> Agregar a Apple Wallet
        </a>
        <a
          href={`/api/passes/google?qr=${customer.qr_code}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: '#4285F4', color: 'white' }}
        >
          <span>G</span> Agregar a Google Wallet
        </a>
      </div>

      <p className="text-xs text-white/40 mt-4">
        También puedes guardar una captura de pantalla de tu QR
      </p>
    </div>
  )
}
