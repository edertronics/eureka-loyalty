/* La página que ve alguien que llegó a una URL que no existe. Se pinta
   cuando `notFound()` se lanza en cualquier parte de la app — hoy, desde
   la envoltura de [slug] cuando el negocio no está en la base.
   Va sin dependencias ni fuentes propias a propósito: es una página que
   idealmente nadie ve, y no merece descargar nada. */
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 18, padding: 32,
      background: '#10214F', color: '#F1F0EC', textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <p style={{
        fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase',
        color: 'rgba(241,240,236,.45)', margin: 0,
      }}>Easy Loyalty</p>

      <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-.02em' }}>
        Esta página no existe
      </h1>

      <p style={{
        fontSize: 15, lineHeight: 1.6, color: 'rgba(241,240,236,.7)',
        margin: 0, maxWidth: 380,
      }}>
        Puede que el enlace esté mal escrito, o que el programa de lealtad que
        buscas ya no esté activo. Revisa la dirección con el negocio que te la
        compartió.
      </p>

      <Link href="/" style={{
        marginTop: 8, display: 'inline-block', padding: '12px 26px',
        background: '#00C896', color: '#10214F', borderRadius: 4,
        fontSize: 14, fontWeight: 600, textDecoration: 'none',
      }}>
        Ir al inicio
      </Link>
    </div>
  )
}
