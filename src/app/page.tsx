import Link from 'next/link'

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center"
      style={{ backgroundColor: '#110DDE' }}
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>EUR</span>
        <span className="text-5xl font-black" style={{ color: '#EC4E20' }}>⚡</span>
        <span className="text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>KA</span>
      </div>
      <p className="text-white text-sm font-bold tracking-widest uppercase mb-1">BURGERS</p>
      <p className="text-xs italic tracking-widest" style={{ color: '#F6AE2D' }}>from California</p>

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
