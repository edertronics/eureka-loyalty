'use client'

import { useState, useEffect, useRef } from 'react'

interface Customer {
  id: string
  name: string
  stamps: number
  total_stamps: number
  rewards_redeemed: number
  created_at: string
  last_stamp_at: string | null
}

interface BusinessStats {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  stamp_goal: number
  reward_description: string
  created_at: string
  total_customers: number
  total_stamps: number
  total_rewards: number
  customers: Customer[]
}

interface PlatformTotals {
  businesses: number
  customers: number
  stamps: number
  rewards: number
}

interface StatsData {
  platform_totals: PlatformTotals
  businesses: BusinessStats[]
}

export default function SuperAdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const timerPassword = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [selectedBiz, setSelectedBiz] = useState<BusinessStats | null>(null)

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
    fetch('/api/super-admin/stats')
      .then(r => {
        if (r.ok) r.json().then(data => { setStats(data); setAuthed(true) })
        setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/super-admin/login', {
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
      const statsRes = await fetch('/api/super-admin/stats')
      const data = await statsRes.json()
      setStats(data)
      setStatsLoading(false)
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoginLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #000000 100%)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
      </main>
    )
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #000000 100%)' }}>

        <div className="mb-8 text-center">
          <div className="text-3xl font-black text-white mb-1">Easy Loyalty</div>
          <div className="text-white/40 text-sm">Super Admin</div>
        </div>

        <div className="w-full max-w-sm rounded-2xl p-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)' }}>

          <h1 className="text-white font-bold text-lg text-center mb-1">Acceso restringido</h1>
          <p className="text-white/40 text-sm text-center mb-6">Solo para el equipo de Easy Loyalty</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña maestra"
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-white text-center outline-none text-sm"
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
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 rounded-xl font-black text-white uppercase tracking-widest text-sm transition-all active:scale-95 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {loginLoading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  const totals = stats?.platform_totals
  const businesses = stats?.businesses ?? []

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #000000 100%)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white font-black text-2xl">Easy Loyalty</h1>
            <p className="text-white/40 text-sm">Panel maestro · {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            SA
          </div>
        </div>

        {/* KPIs globales */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <PlatformKPI value={totals?.businesses ?? 0} label="Negocios" color="#6366f1" />
          <PlatformKPI value={totals?.customers ?? 0} label="Clientes totales" color="#22d3ee" />
          <PlatformKPI value={totals?.stamps ?? 0} label="Sellos dados" color="#f59e0b" />
          <PlatformKPI value={totals?.rewards ?? 0} label="Premios canjeados" color="#4ade80" />
        </div>

        {/* Lista de negocios */}
        {statsLoading ? (
          <div className="text-center text-white/40 py-10">Cargando negocios...</div>
        ) : businesses.length === 0 ? (
          <div className="text-center text-white/30 py-10">No hay negocios registrados aún.</div>
        ) : (
          <div className="space-y-3">
            {businesses.map(biz => (
              <div key={biz.id}>
                {/* Card del negocio */}
                <button
                  onClick={() => setSelectedBiz(selectedBiz?.id === biz.id ? null : biz)}
                  className="w-full text-left rounded-2xl p-4 transition-all"
                  style={{
                    backgroundColor: selectedBiz?.id === biz.id ? `${biz.primary_color}20` : 'rgba(255,255,255,0.04)',
                    border: selectedBiz?.id === biz.id ? `1px solid ${biz.primary_color}60` : '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Dot de color */}
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: biz.primary_color }} />
                      <div>
                        <p className="text-white font-bold text-sm">{biz.name}</p>
                        <p className="text-white/40 text-xs">/{biz.slug} · desde {new Date(biz.created_at).toLocaleDateString('es-MX')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-white font-bold text-sm">{biz.total_customers}</p>
                        <p className="text-white/40 text-xs">clientes</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-sm" style={{ color: biz.secondary_color || '#f59e0b' }}>{biz.total_stamps}</p>
                        <p className="text-white/40 text-xs">sellos</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-sm" style={{ color: '#4ade80' }}>{biz.total_rewards}</p>
                        <p className="text-white/40 text-xs">premios</p>
                      </div>
                      <div className="text-white/40 text-xs ml-2">
                        {selectedBiz?.id === biz.id ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Detalle expandible */}
                {selectedBiz?.id === biz.id && (
                  <div className="mt-2 rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${biz.primary_color}30`, backgroundColor: 'rgba(255,255,255,0.02)' }}>

                    {/* Links de acción */}
                    <div className="px-4 py-3 flex gap-2 flex-wrap"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <a href={`/${biz.slug}`} target="_blank"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                        style={{ backgroundColor: `${biz.primary_color}40`, border: `1px solid ${biz.primary_color}60` }}>
                        Ver tarjeta
                      </a>
                      <a href={`/${biz.slug}/admin`} target="_blank"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        Ir al dashboard
                      </a>
                      <a href={`/${biz.slug}/scanner`} target="_blank"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        Abrir scanner
                      </a>
                      <span className="px-3 py-1.5 rounded-lg text-xs text-white/40"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        Premio: {biz.reward_description || 'Sin definir'} · Meta: {biz.stamp_goal} sellos
                      </span>
                    </div>

                    {/* KPIs móvil */}
                    <div className="px-4 py-3 grid grid-cols-3 gap-3 sm:hidden"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-center">
                        <p className="text-white font-bold">{biz.total_customers}</p>
                        <p className="text-white/40 text-xs">clientes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold" style={{ color: biz.secondary_color || '#f59e0b' }}>{biz.total_stamps}</p>
                        <p className="text-white/40 text-xs">sellos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-400">{biz.total_rewards}</p>
                        <p className="text-white/40 text-xs">premios</p>
                      </div>
                    </div>

                    {/* Lista de clientes */}
                    {biz.customers.length === 0 ? (
                      <div className="px-4 py-6 text-center text-white/30 text-sm">Sin clientes aún</div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        {biz.customers.map(c => (
                          <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-semibold">{c.name}</p>
                              <p className="text-white/30 text-xs">
                                Registrado {new Date(c.created_at).toLocaleDateString('es-MX')}
                                {c.last_stamp_at && ` · último sello ${new Date(c.last_stamp_at).toLocaleDateString('es-MX')}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold" style={{ color: biz.secondary_color || '#f59e0b' }}>
                                {c.stamps}/{biz.stamp_goal}
                              </p>
                              {c.rewards_redeemed > 0 && (
                                <p className="text-xs text-green-400">{c.rewards_redeemed} premios</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-white/15 text-xs mt-10">Easy Loyalty · Super Admin · v1.0</p>
      </div>
    </main>
  )
}

function PlatformKPI({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ backgroundColor: `${color}12`, border: `1px solid ${color}35` }}>
      <p className="text-xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-white/50 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
