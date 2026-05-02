'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [slug, setSlug] = useState('')

  function handleAcceder(e: React.FormEvent) {
    e.preventDefault()
    const clean = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')
    if (clean) router.push(`/${clean}/admin`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}>

      {/* Logo */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <span style={{ color: 'white', fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>Easy Loyalty</span>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 340 }}>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 900, lineHeight: 1.1, marginBottom: 14, letterSpacing: -1 }}>
          El programa de lealtad digital para tu negocio
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          Tus clientes acumulan sellos y ganan premios. Sin app, sin papel, sin complicaciones.
        </p>
      </div>

      {/* CTA principal */}
      <a href="/registro"
        style={{ display: 'block', width: '100%', maxWidth: 320, padding: '16px 0', borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 900, fontSize: 15, textAlign: 'center', textDecoration: 'none', letterSpacing: 0.5, marginBottom: 32, boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}>
        Crear mi programa gratis
      </a>

      {/* Divisor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 320, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>o accede a tu panel</span>
        <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* Acceder al panel del negocio */}
      <form onSubmit={handleAcceder} style={{ width: '100%', maxWidth: 320, display: 'flex', gap: 8, marginBottom: 40 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: 12, pointerEvents: 'none' }}>easyloyalty.io/</span>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="mi-negocio"
            style={{ width: '100%', borderRadius: 10, padding: '12px 12px 12px 108px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={!slug.trim()}
          style={{ borderRadius: 10, padding: '0 16px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: 13, cursor: slug.trim() ? 'pointer' : 'not-allowed', opacity: slug.trim() ? 1 : 0.4, whiteSpace: 'nowrap' }}>
          Entrar
        </button>
      </form>

      {/* Super admin (discreto) */}
      <a href="/super-admin" style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12, textDecoration: 'none' }}>
        Super Admin
      </a>
    </main>
  )
}
