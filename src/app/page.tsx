import Link from 'next/link'

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center"
      style={{ backgroundColor: '#110DDE' }}
    >
      <img src="/eureka-logo.png" alt="Eureka Burger" className="h-72 w-auto mb-3" />

      <p className="text-white/60 text-sm mt-6 mb-8 max-w-xs">
        Programa de lealtad digital · Junta sellos y gana premios
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <Link
          href="/register"
          className="block w-full py-4 rounded-xl font-black text-white text-base uppercase tracking-widest"
          style={{ backgroundColor: '#EC4E20' }}
        >
          ⚡ Quiero mi tarjeta
        </Link>
        <Link
          href="/admin"
          className="block w-full py-3 rounded-xl font-semibold text-sm text-white/70"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          Admin
        </Link>
      </div>
    </main>
  )
}
