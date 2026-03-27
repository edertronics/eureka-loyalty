import Link from 'next/link'

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: '#110DDE' }}
    >
      <img src="/eureka-logo.png" alt="Eureka Burger" className="h-64 w-auto mb-6" />

      <p className="text-white/70 text-sm mb-10 max-w-xs" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', letterSpacing: '0.05em' }}>
        Programa de lealtad digital · Junta sellos y gana premios
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <Link
          href="/register"
          className="block w-full py-4 text-white text-lg uppercase tracking-widest"
          style={{
            backgroundColor: '#EC4E20',
            fontFamily: 'var(--font-bebas), Helvetica Neue, sans-serif',
            letterSpacing: '0.15em',
          }}
        >
          ⚡ Quiero mi tarjeta
        </Link>
        <Link
          href="/admin"
          className="block w-full py-3 text-sm text-white/60 uppercase tracking-widest"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
            letterSpacing: '0.1em',
          }}
        >
          Admin
        </Link>
      </div>
    </main>
  )
}
