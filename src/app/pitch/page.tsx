'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ── Minimalist SVG Icons ── */
function IconTrash({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  )
}
function IconChart({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}
function IconMoney({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="1" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}
function IconPhone({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" />
    </svg>
  )
}
function IconCamera({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  )
}
function IconGift({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  )
}
function IconScreenshot({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" /><rect x="8" y="8" width="8" height="8" rx="1" />
    </svg>
  )
}
function IconLock({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}
function IconShield({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IconZap({ color = 'currentColor', size = 28 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
function IconUser({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IconStar({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconCheck({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const BLUE = '#110DDE'
const DARK_BLUE = '#0D0A8F'
const ORANGE = '#EC4E20'
const GOLD = '#F6AE2D'
const BEBAS = 'var(--font-bebas), Impact, Arial Narrow, sans-serif'
const BODY = 'Helvetica Neue, Helvetica, Arial, sans-serif'

const SLIDES = [
  'Apertura',
  'El problema',
  'La solución',
  'Registro',
  'El QR',
  'El sello',
  'Premio',
  'Admin',
  'Cierre',
]

export default function PitchPage() {
  const [current, setCurrent] = useState(0)
  const total = SLIDES.length

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        setCurrent(c => Math.min(c + 1, total - 1))
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setCurrent(c => Math.max(c - 1, 0))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [total])

  const slides = [
    <Slide1 key={0} />,
    <Slide2 key={1} />,
    <Slide3 key={2} />,
    <Slide4 key={3} />,
    <Slide5 key={4} />,
    <Slide6 key={5} />,
    <Slide7 key={6} />,
    <Slide8 key={7} />,
    <Slide9 key={8} />,
  ]

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ backgroundColor: DARK_BLUE }}>

      {/* Slides container */}
      <div
        className="h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}vw)`, display: 'flex', width: `${total * 100}vw` }}
      >
        {slides}
      </div>

      {/* Nav dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            title={SLIDES[i]}
            className="transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              backgroundColor: i === current ? ORANGE : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      {/* Prev / Next */}
      {current > 0 && (
        <button
          onClick={() => setCurrent(c => c - 1)}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 text-3xl text-white/40 hover:text-white transition-colors"
        >‹</button>
      )}
      {current < total - 1 && (
        <button
          onClick={() => setCurrent(c => c + 1)}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 text-3xl text-white/40 hover:text-white transition-colors"
        >›</button>
      )}

      {/* Counter */}
      <div className="absolute top-5 right-6 z-10 text-xs text-white/30" style={{ fontFamily: BODY }}>
        {current + 1} / {total}
      </div>
    </div>
  )
}

/* ── Wrapper ── */
function SW({ children, bg }: { children: React.ReactNode; bg?: string }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center px-8 md:px-16"
      style={{ width: '100vw', height: '100vh', backgroundColor: bg ?? BLUE }}
    >
      {children}
    </div>
  )
}

/* ── Phone mockup ── */
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: 220,
        height: 420,
        backgroundColor: '#0a0a0a',
        border: '3px solid rgba(255,255,255,0.15)',
        borderRadius: 36,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ width: 80, height: 22, backgroundColor: '#0a0a0a', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }} />
      <div className="w-full h-full overflow-hidden" style={{ borderRadius: 33 }}>
        {children}
      </div>
    </div>
  )
}

/* ── Label de paso ── */
function StepLabel({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: ORANGE, fontFamily: BODY }}>
        {n}
      </div>
      <p className="text-white/50 text-xs uppercase tracking-widest" style={{ fontFamily: BODY }}>{text}</p>
    </div>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 1 — Apertura                          */
/* ─────────────────────────────────────────── */
function Slide1() {
  return (
    <SW>
      <div className="text-center flex flex-col items-center">
        <img src="/eureka-logo.png" alt="Eureka Burger" style={{ height: 290, width: 'auto', marginBottom: 28 }} />
        <h1
          className="text-white uppercase leading-none mb-5"
          style={{ fontFamily: BEBAS, fontSize: 'clamp(48px, 8vw, 80px)', letterSpacing: '0.06em' }}
        >
          Tu programa de<br />
          <span style={{ color: ORANGE }}>lealtad digital</span>
        </h1>
        <p className="text-white/50 text-base max-w-xs" style={{ fontFamily: BODY }}>
          Sin app. Sin cartón. Sin complicaciones.
        </p>
        <p className="text-white/20 text-xs mt-10 uppercase tracking-widest" style={{ fontFamily: BODY }}>
          Presiona → para empezar el recorrido
        </p>
      </div>
    </SW>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 2 — El problema                       */
/* ─────────────────────────────────────────── */
function Slide2() {
  return (
    <SW bg={DARK_BLUE}>
      <div className="max-w-3xl w-full flex flex-col md:flex-row items-center gap-12">
        {/* Visual tarjeta de cartón */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          <div
            className="relative"
            style={{
              width: 200,
              height: 110,
              backgroundColor: '#f5f0e8',
              border: '2px solid #ddd',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: 0.6,
            }}
          >
            <p style={{ fontFamily: BODY, fontSize: 10, color: '#333', fontWeight: 'bold' }}>TARJETA FIDELIDAD</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #999', backgroundColor: i < 3 ? '#999' : 'transparent' }} />
              ))}
            </div>
            <p style={{ fontFamily: BODY, fontSize: 8, color: '#999' }}>Junta 10 y gana 1 gratis</p>
            {/* tachón */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '130%', height: 3, backgroundColor: ORANGE, transform: 'rotate(-15deg)', opacity: 0.8 }} />
            </div>
          </div>
          <p className="text-white/30 text-xs" style={{ fontFamily: BODY }}>Tarjeta de cartón</p>
        </div>

        {/* Texto */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3" style={{ fontFamily: BODY }}>El problema</p>
          <h2 className="text-white uppercase leading-none mb-8" style={{ fontFamily: BEBAS, fontSize: 'clamp(36px, 5vw, 58px)', letterSpacing: '0.05em' }}>
            Las tarjetas de cartón<br />
            <span style={{ color: ORANGE }}>te están costando clientes</span>
          </h2>
          <div className="space-y-5">
            {[
              { icon: <IconTrash color={ORANGE} />, text: 'El cliente pierde la tarjeta y empieza de cero — o no regresa' },
              { icon: <IconChart color={ORANGE} />, text: 'No sabes cuántos clientes tienes ni cuántos premios se dieron' },
              { icon: <IconMoney color={ORANGE} />, text: 'Imprimir y reponer tarjetas tiene un costo constante' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: BODY }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SW>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 3 — La solución                       */
/* ─────────────────────────────────────────── */
function Slide3() {
  return (
    <SW>
      <div className="text-center flex flex-col items-center max-w-2xl">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3" style={{ fontFamily: BODY }}>La solución</p>
        <h2 className="text-white uppercase leading-none mb-6" style={{ fontFamily: BEBAS, fontSize: 'clamp(42px, 6vw, 72px)', letterSpacing: '0.06em' }}>
          Una tarjeta digital<br />
          <span style={{ color: ORANGE }}>en el teléfono del cliente</span>
        </h2>
        <p className="text-white/60 text-base mb-12 max-w-md" style={{ fontFamily: BODY }}>
          El cliente se registra una vez, recibe un QR único, y lo muestra en cada visita. Sin app. Sin descarga. Desde el navegador de su teléfono.
        </p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: <IconPhone color={ORANGE} />, label: 'El cliente', desc: 'Se registra y guarda su QR' },
            { icon: <IconCamera color={ORANGE} />, label: 'El staff', desc: 'Escanea el QR en 3 segundos' },
            { icon: <IconGift color={ORANGE} />, label: 'El premio', desc: 'Al 10° sello, burger gratis automático' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: `${ORANGE}15`, border: `1px solid ${ORANGE}40` }}>
                {item.icon}
              </div>
              <p className="text-white font-bold text-sm" style={{ fontFamily: BODY }}>{item.label}</p>
              <p className="text-white/50 text-xs text-center leading-relaxed" style={{ fontFamily: BODY }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SW>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 4 — Registro del cliente              */
/* ─────────────────────────────────────────── */
function Slide4() {
  return (
    <SW bg={DARK_BLUE}>
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl w-full">
        <div className="flex-1">
          <StepLabel n={1} text="Paso 1 — El cliente" />
          <h2 className="text-white uppercase leading-none mb-6" style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 60px)', letterSpacing: '0.06em' }}>
            Se registra en<br />
            <span style={{ color: ORANGE }}>30 segundos</span>
          </h2>
          <div className="space-y-3">
            {[
              'Escanea el QR del restaurante o entra al link',
              'Escribe su nombre y teléfono',
              'Listo — ya tiene su tarjeta digital',
            ].map((t, i) => (
              <div key={t} className="flex items-start gap-3">
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: `${ORANGE}40`, fontFamily: BODY }}>
                  {i + 1}
                </div>
                <p className="text-white/60 text-sm" style={{ fontFamily: BODY }}>{t}</p>
              </div>
            ))}
          </div>
          <Link
            href="/register"
            target="_blank"
            className="inline-block mt-8 px-6 py-3 text-white text-sm uppercase"
            style={{ backgroundColor: ORANGE, fontFamily: BODY, letterSpacing: '0.08em' }}
          >
            Ver formulario en vivo →
          </Link>
        </div>

        {/* Phone mockup — form */}
        <Phone>
          <div className="w-full h-full flex flex-col" style={{ backgroundColor: BLUE, paddingTop: 28 }}>
            <div className="flex justify-center mb-3">
              <img src="/eureka-logo.png" alt="" style={{ height: 48, width: 'auto' }} />
            </div>
            <div style={{ padding: '0 14px' }}>
              <p style={{ fontFamily: BEBAS, color: 'white', fontSize: 18, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase', marginBottom: 4 }}>Únete al club</p>
              <p style={{ fontFamily: BODY, color: GOLD, fontSize: 9, textAlign: 'center', marginBottom: 12 }}>Junta 9 sellos y tu 10ª burger es gratis</p>
              {/* stamp preview mini */}
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{ width: 16, height: 16, border: `1.5px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>⚡</span>
                  </div>
                ))}
                <div style={{ width: 16, height: 16, border: `1.5px solid ${GOLD}`, backgroundColor: `${GOLD}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 8 }}>🍔</span>
                </div>
              </div>
              {['Nombre', 'WhatsApp', 'Email'].map(label => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <p style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.5)', fontSize: 7, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{label}</p>
                  <div style={{ height: 26, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                </div>
              ))}
              <div style={{ height: 32, backgroundColor: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                <p style={{ fontFamily: BEBAS, color: 'white', fontSize: 14, letterSpacing: 2 }}>⚡ QUIERO MI TARJETA</p>
              </div>
            </div>
          </div>
        </Phone>
      </div>
    </SW>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 5 — QR del cliente                    */
/* ─────────────────────────────────────────── */
function Slide5() {
  return (
    <SW>
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl w-full">
        {/* Phone mockup — QR success */}
        <Phone>
          <div className="w-full h-full flex flex-col items-center" style={{ backgroundColor: BLUE, paddingTop: 30 }}>
            <img src="/eureka-logo.png" alt="" style={{ height: 44, width: 'auto', marginBottom: 10 }} />
            <p style={{ fontFamily: BEBAS, color: 'white', fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>¡Listo, María!</p>
            <div style={{ backgroundColor: 'white', padding: 10, marginTop: 8, marginBottom: 10 }}>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=ELY-DEMO1234&color=EC4E20"
                alt="QR demo"
                width={120}
                height={120}
              />
            </div>
            <p style={{ fontFamily: BODY, color: 'white', fontSize: 9, fontWeight: 'bold', textAlign: 'center', padding: '0 20px' }}>¡Ya eres parte del club!</p>
            <p style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.6)', fontSize: 8, textAlign: 'center', padding: '4px 20px' }}>
              Muestra este QR en cada visita para acumular tus sellos.
            </p>
            <p style={{ fontFamily: BODY, color: GOLD, fontSize: 7, marginTop: 6 }}>ID: ELY-DEMO1234</p>
          </div>
        </Phone>

        <div className="flex-1">
          <StepLabel n={2} text="Paso 2 — Su tarjeta digital" />
          <h2 className="text-white uppercase leading-none mb-6" style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 60px)', letterSpacing: '0.06em' }}>
            Un QR único<br />
            <span style={{ color: ORANGE }}>para siempre</span>
          </h2>
          <div className="space-y-5">
            {[
              { icon: <IconScreenshot color={ORANGE} />, text: 'El cliente hace captura de pantalla y lo guarda en su galería' },
              { icon: <IconLock color={ORANGE} />, text: 'El QR es intransferible — está ligado a su nombre y teléfono' },
              { icon: <IconPhone color={ORANGE} />, text: 'No necesita internet ni tener instalada ninguna app para mostrarlo' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: BODY }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SW>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 6 — El staff escanea                  */
/* ─────────────────────────────────────────── */
function Slide6() {
  return (
    <SW bg={DARK_BLUE}>
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl w-full">
        <div className="flex-1">
          <StepLabel n={3} text="Paso 3 — El staff" />
          <h2 className="text-white uppercase leading-none mb-6" style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 60px)', letterSpacing: '0.06em' }}>
            Escanea y da<br />
            <span style={{ color: ORANGE }}>el sello en 3 seg</span>
          </h2>
          <div className="space-y-5 mb-8">
            {[
              { icon: <IconCamera color={ORANGE} />, text: 'El staff abre el scanner en el teléfono o tablet del negocio' },
              { icon: <IconZap color={ORANGE} />, text: 'Apunta la cámara al QR del cliente — detecta automáticamente' },
              { icon: <IconShield color={ORANGE} />, text: 'Anti-fraude: solo un sello por visita cada 4 horas' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: BODY }}>{item.text}</p>
              </div>
            ))}
          </div>
          <Link
            href="/scanner"
            target="_blank"
            className="inline-block px-6 py-3 text-white text-sm uppercase"
            style={{ backgroundColor: ORANGE, fontFamily: BODY, letterSpacing: '0.08em' }}
          >
            Abrir scanner en vivo →
          </Link>
        </div>

        {/* Phone mockup — scanner result */}
        <Phone>
          <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#0D0A8F', padding: 16 }}>
            <p style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.4)', fontSize: 8, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Staff Scanner</p>
            <img src="/eureka-logo.png" alt="" style={{ height: 52, width: 'auto', marginBottom: 14 }} />
            {/* Resultado sello */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, padding: 14, width: '100%', textAlign: 'center' }}>
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><IconZap color={ORANGE} size={22} /></div>
              <p style={{ fontFamily: BODY, color: 'white', fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>María García</p>
              {/* sellos */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginBottom: 8 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `1.5px solid ${i < 4 ? ORANGE : 'rgba(255,255,255,0.2)'}`,
                      backgroundColor: i < 4 ? `${ORANGE}30` : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8,
                      color: i < 4 ? ORANGE : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {i < 4 ? '⚡' : '○'}
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>4/10 sellos · 6 para el premio</p>
            </div>
          </div>
        </Phone>
      </div>
    </SW>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 7 — Premio desbloqueado               */
/* ─────────────────────────────────────────── */
function Slide7() {
  const [stamped, setStamped] = useState(9)

  function addStamp() {
    setStamped(s => Math.min(s + 1, 10))
  }

  return (
    <SW>
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl w-full">
        <div className="flex-1">
          <StepLabel n={4} text="Paso 4 — El premio" />
          <h2 className="text-white uppercase leading-none mb-6" style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 60px)', letterSpacing: '0.06em' }}>
            Al décimo sello<br />
            <span style={{ color: GOLD }}>¡burger gratis!</span>
          </h2>
          <p className="text-white/60 text-sm mb-8" style={{ fontFamily: BODY }}>
            El sistema detecta automáticamente cuando se alcanza el premio y avisa al staff en pantalla. Sin errores, sin contar a mano.
          </p>
          {stamped < 10 ? (
            <button
              onClick={addStamp}
              className="flex items-center gap-2 px-6 py-3 text-white text-sm uppercase transition-all active:scale-95"
              style={{ backgroundColor: ORANGE, fontFamily: BODY, letterSpacing: '0.08em' }}
            >
              <IconZap color="white" size={18} /> Simular sello ({stamped}/10)
            </button>
          ) : (
            <div>
              <div className="mb-3"><IconStar color={GOLD} /></div>
              <p className="font-bold text-lg mb-1" style={{ color: GOLD, fontFamily: BODY }}>¡Premio desbloqueado!</p>
              <p className="text-white/60 text-sm" style={{ fontFamily: BODY }}>Así ve el staff la pantalla cuando el cliente gana.</p>
              <button onClick={() => setStamped(9)} className="mt-4 text-xs text-white/30 underline" style={{ fontFamily: BODY }}>
                Reiniciar demo
              </button>
            </div>
          )}
        </div>

        {/* Stamps interactivos */}
        <div className="flex-shrink-0">
          <Phone>
            <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#0D0A8F', padding: 14 }}>
              {stamped < 10 ? (
                <>
                  <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><IconZap color={ORANGE} size={26} /></div>
                  <p style={{ fontFamily: BODY, color: 'white', fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>María García</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 10 }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: `2px solid ${i < stamped ? ORANGE : 'rgba(255,255,255,0.2)'}`,
                          backgroundColor: i < stamped ? `${ORANGE}30` : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10,
                          color: i < stamped ? ORANGE : 'rgba(255,255,255,0.2)',
                          transition: 'all 0.3s',
                        }}
                      >
                        {i < stamped ? '⚡' : '○'}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.5)', fontSize: 9, textAlign: 'center' }}>
                    {stamped}/10 sellos · {10 - stamped} para el premio
                  </p>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><IconStar color={GOLD} /></div>
                  <p style={{ fontFamily: BODY, color: GOLD, fontSize: 14, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>
                    ¡Premio desbloqueado!
                  </p>
                  <p style={{ fontFamily: BODY, color: 'white', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>María García</p>
                  <p style={{ fontFamily: BODY, color: GOLD, fontSize: 9, textAlign: 'center', padding: '0 16px' }}>
                    Burger gratis en su próxima visita
                  </p>
                </>
              )}
            </div>
          </Phone>
        </div>
      </div>
    </SW>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 8 — Panel Admin                       */
/* ─────────────────────────────────────────── */
function Slide8() {
  return (
    <SW bg={DARK_BLUE}>
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl w-full">
        <div className="flex-1">
          <StepLabel n={5} text="Para el dueño" />
          <h2 className="text-white uppercase leading-none mb-6" style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 60px)', letterSpacing: '0.06em' }}>
            Tú ves todo<br />
            <span style={{ color: GOLD }}>en tiempo real</span>
          </h2>
          <div className="space-y-4 mb-8">
            {[
              { icon: <IconChart color={ORANGE} />, text: 'Cuántos clientes tienes registrados' },
              { icon: <IconZap color={ORANGE} />, text: 'Cuántos sellos se han dado en total' },
              { icon: <IconGift color={ORANGE} />, text: 'Cuántos premios se han entregado' },
              { icon: <IconUser color={ORANGE} />, text: 'Nombre, fecha de registro y último sello por cliente' },
              { icon: <IconLock color={ORANGE} />, text: 'Acceso protegido con contraseña' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0">{item.icon}</div>
                <p className="text-white/60 text-sm" style={{ fontFamily: BODY }}>{item.text}</p>
              </div>
            ))}
          </div>
          <Link
            href="/admin"
            target="_blank"
            className="inline-block px-6 py-3 text-sm uppercase"
            style={{ backgroundColor: `${GOLD}20`, border: `1px solid ${GOLD}60`, color: GOLD, fontFamily: BODY, letterSpacing: '0.08em' }}
          >
            Ver panel admin en vivo →
          </Link>
        </div>

        {/* Mock admin UI */}
        <Phone>
          <div className="w-full h-full" style={{ backgroundColor: '#0D0A8F', padding: 12, paddingTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <img src="/eureka-logo.png" alt="" style={{ height: 22, width: 'auto' }} />
              <p style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.4)', fontSize: 8 }}>Admin</p>
            </div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 12 }}>
              {[
                { v: '24', l: 'Clientes', c: BLUE },
                { v: '87', l: 'Sellos', c: ORANGE },
                { v: '6', l: 'Premios', c: GOLD },
              ].map(k => (
                <div key={k.l} style={{ backgroundColor: `${k.c}20`, border: `1px solid ${k.c}40`, padding: '6px 4px', textAlign: 'center' }}>
                  <p style={{ fontFamily: BODY, color: k.c, fontSize: 14, fontWeight: 'bold' }}>{k.v}</p>
                  <p style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.5)', fontSize: 7 }}>{k.l}</p>
                </div>
              ))}
            </div>
            {/* Customer list */}
            <p style={{ fontFamily: BODY, color: 'white', fontSize: 8, fontWeight: 'bold', marginBottom: 6 }}>Clientes recientes</p>
            {[
              { name: 'María García', stamps: 4 },
              { name: 'Carlos Ramírez', stamps: 10 },
              { name: 'Sofía López', stamps: 2 },
            ].map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: BODY, color: 'white', fontSize: 9, fontWeight: 'bold' }}>{c.name}</p>
                <p style={{ fontFamily: BODY, color: ORANGE, fontSize: 9, fontWeight: 'bold' }}>{c.stamps} sellos</p>
              </div>
            ))}
          </div>
        </Phone>
      </div>
    </SW>
  )
}

/* ─────────────────────────────────────────── */
/* SLIDE 9 — Cierre                            */
/* ─────────────────────────────────────────── */
function Slide9() {
  return (
    <SW>
      <div className="text-center flex flex-col items-center max-w-lg">
        <img src="/eureka-logo.png" alt="Eureka Burger" style={{ height: 140, width: 'auto', marginBottom: 28 }} />
        <h2 className="text-white uppercase leading-none mb-5" style={{ fontFamily: BEBAS, fontSize: 'clamp(42px, 6vw, 68px)', letterSpacing: '0.07em' }}>
          Listo para<br />
          <span style={{ color: ORANGE }}>arrancar hoy</span>
        </h2>
        <p className="text-white/50 text-base mb-10 max-w-sm" style={{ fontFamily: BODY }}>
          El sistema ya está funcionando. Solo falta activarlo para tus clientes.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/register"
            target="_blank"
            className="block w-full py-5 text-white text-center text-2xl uppercase"
            style={{ backgroundColor: ORANGE, fontFamily: BEBAS, letterSpacing: '0.15em' }}
          >
            Probar el registro
          </Link>
          <Link
            href="/admin"
            target="_blank"
            className="block w-full py-4 text-center text-sm uppercase"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontFamily: BODY, letterSpacing: '0.1em' }}
          >
            Ver panel admin
          </Link>
        </div>
      </div>
    </SW>
  )
}
