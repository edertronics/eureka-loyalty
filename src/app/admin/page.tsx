'use client'

import { useState, useEffect } from 'react'

const EUREKA_BLUE = '#110DDE'
const EUREKA_ORANGE = '#EC4E20'
const EUREKA_GOLD = '#F6AE2D'

interface Stats {
  total_customers: number
  total_stamps: number
  total_rewards: number
  recent_customers: Array<{
    id: string
    name: string
    stamps: number
    total_stamps: number
    rewards_redeemed: number
    created_at: string
    last_stamp_at: string | null
  }>
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Verificar si ya hay sesión activa
  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => {
        if (r.ok) {
          r.json().then(data => {
            setStats(data)
            setAuthed(true)
          })
        }
        setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    try {
      const res = await fetch('/api/admin/login', {
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
      fetch('/api/admin/stats')
        .then(r => r.json())
        .then(data => {
          setStats(data)
          setStatsLoading(false)
        })
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoginLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0820' }}>
        <div className="text-white/50 text-sm">Cargando...</div>
      </main>
    )
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#0a0820' }}>
        <img src="/eureka-logo.png" alt="Eureka Burger" className="h-24 w-auto mb-8" />

        <div
          className="w-full max-w-sm rounded-2xl p-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <h1 className="text-white font-bold text-lg text-center mb-1">Panel Admin</h1>
          <p className="text-white/40 text-sm text-center mb-6">Acceso restringido</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-white text-center outline-none text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />

            {loginError && (
              <p className="text-sm text-center py-2 px-3 rounded-lg" style={{ backgroundColor: `${EUREKA_ORANGE}30`, color: EUREKA_ORANGE }}>
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 rounded-xl font-black text-white uppercase tracking-widest text-sm transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: EUREKA_ORANGE }}
            >
              {loginLoading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ backgroundColor: '#0a0820' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <img src="/eureka-logo.png" alt="Eureka Burger" className="h-10 w-auto" />
          <span className="text-white/50 text-sm">Admin</span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <KPICard value={stats?.total_customers ?? 0} label="Clientes" color={EUREKA_BLUE} />
          <KPICard value={stats?.total_stamps ?? 0} label="Sellos" color={EUREKA_ORANGE} />
          <KPICard value={stats?.total_rewards ?? 0} label="Premios" color={EUREKA_GOLD} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <a
            href="/scanner"
            className="flex-1 py-3 rounded-xl font-semibold text-white text-sm text-center"
            style={{ backgroundColor: EUREKA_ORANGE }}
          >
            ⚡ Abrir Scanner
          </a>
          <a
            href="/register"
            target="_blank"
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            + Ver Registro
          </a>
        </div>

        {/* Customer list */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="px-4 py-3 border-b" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <h2 className="text-white font-bold text-sm">Clientes recientes</h2>
          </div>

          {statsLoading ? (
            <div className="px-4 py-8 text-center text-white/40 text-sm">Cargando...</div>
          ) : !stats?.recent_customers?.length ? (
            <div className="px-4 py-8 text-center text-white/40 text-sm">Aún no hay clientes registrados</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {stats.recent_customers.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">{c.name}</p>
                    <p className="text-white/40 text-xs">
                      {new Date(c.created_at).toLocaleDateString('es-MX')}
                      {c.last_stamp_at && ` · último sello ${new Date(c.last_stamp_at).toLocaleDateString('es-MX')}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: EUREKA_ORANGE }}>{c.stamps} sellos</p>
                    {c.rewards_redeemed > 0 && (
                      <p className="text-xs" style={{ color: EUREKA_GOLD }}>{c.rewards_redeemed} premios</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function KPICard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-white/60 mt-1">{label}</p>
    </div>
  )
}
