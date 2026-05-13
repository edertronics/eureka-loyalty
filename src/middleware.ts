import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // En desarrollo local no hacemos nada
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return NextResponse.next()
  }

  const isAppSubdomain = host.startsWith('app.')

  // ── DOMINIO PRINCIPAL (easyloyalty.io) ──────────────────────────────────
  // Permite: / (landing), /{slug} (tarjeta cliente), /api/*, archivos estáticos
  // Redirige a app.easyloyalty.io: /registro, /super-admin, /{slug}/admin, /{slug}/scanner
  if (!isAppSubdomain) {
    // Siempre permitir APIs y archivos estáticos (los necesita la tarjeta cliente)
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
      return NextResponse.next()
    }

    // Raíz → servir la landing comercial
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/landing-page.html', request.url))
    }

    // Redirigir páginas de producto al subdominio app
    const appRoutes = ['/registro', '/super-admin', '/admin', '/scanner', '/pitch', '/register']
    if (appRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
      return NextResponse.redirect(new URL(`https://app.easyloyalty.io${pathname}${request.nextUrl.search}`))
    }

    // Redirigir /{slug}/admin y /{slug}/scanner al subdominio app
    if (/^\/[^/]+(\/admin|\/scanner)(\/|$)/.test(pathname)) {
      return NextResponse.redirect(new URL(`https://app.easyloyalty.io${pathname}${request.nextUrl.search}`))
    }

    // / y /{slug} se quedan en el dominio principal
    return NextResponse.next()
  }

  // ── SUBDOMINIO APP (app.easyloyalty.io) ─────────────────────────────────
  // Si alguien entra a la raíz de app, mandarlo a /registro
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/registro', request.url))
  }

  // Archivos estáticos — nunca redirigir
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next()
  }

  // Si alguien entra a /{slug} sin /admin ni /scanner en el subdominio app,
  // redirigir a /{slug}/admin (porque es el contexto de negocio)
  const slugOnly = /^\/[^/]+$/.test(pathname)
  const reservedPaths = ['/registro', '/super-admin', '/admin', '/scanner', '/pitch', '/register', '/api']
  if (slugOnly && !reservedPaths.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(`${pathname}/admin`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
