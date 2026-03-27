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
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0820' }}>
        <div className="text-white/50 text-sm">Cargando...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ backgroundColor: '#0a0820' }}>
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>EUR</span>
          <span className="text-2xl font-black" style={{ color: EUREKA_ORANGE }}>⚡</span>
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>KA</span>
          <span className="ml-2 text-white/50 text-sm">Admin</span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <KPICard
            value={stats?.total_customers ?? 0}
            label="Clientes"
            color={EUREKA_BLUE}
          />
          <KPICard
            value={stats?.total_stamps ?? 0}
            label="Sellos"
            color={EUREKA_ORANGE}
          />
          <KPICard
            value={stats?.total_rewards ?? 0}
            label="Premios"
            color={EUREKA_GOLD}
          />
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
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-white font-bold text-sm">Clientes recientes</h2>
          </div>

          {!stats?.recent_customers?.length ? (
            <div className="px-4 py-8 text-center text-white/40 text-sm">
              Aún no hay clientes registrados
            </div>
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
                    <p className="text-sm font-bold" style={{ color: EUREKA_ORANGE }}>
                      {c.stamps} sellos
                    </p>
                    {c.rewards_redeemed > 0 && (
                      <p className="text-xs" style={{ color: EUREKA_GOLD }}>
                        {c.rewards_redeemed} premios
                      </p>
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
    <div
      className="rounded-xl p-4 text-center"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}
    >
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-white/60 mt-1">{label}</p>
    </div>
  )
}
