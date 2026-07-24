/* ══════════════════════════════════════════════════════════════════
   Easy Loyalty — Sistema de movimiento (Fase 1: infraestructura)
   GSAP 3.15 + ScrollTrigger + SplitText + Lenis 1.3
   ══════════════════════════════════════════════════════════════════ */
;(function () {
  'use strict'

  /* ── Accesibilidad: sin movimiento si el usuario lo pide ── */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    document.documentElement.classList.add('no-motion')
    window.ELMotion = { ready: true, reduced: true }
    return
  }

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
    console.warn('[ELMotion] librerías no cargadas — la página funciona sin animaciones GSAP')
    window.ELMotion = { ready: false, reduced: false }
    return
  }

  gsap.registerPlugin(ScrollTrigger)
  if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText)

  /* ── Tokens del lenguaje de movimiento ──
     La disciplina vive aquí: TODA animación de la página usa estos
     valores. Nada de duraciones o easings inventados por sección. */
  var MO = {
    dur:  { xs: 0.35, s: 0.6, m: 0.85, l: 1.2 },
    ease: {
      out:   'power3.out',    // entradas estándar (reveals, rises)
      inOut: 'power2.inOut',  // wipes y máscaras
      hero:  'expo.out',      // momentos protagonistas
      none:  'none'           // scrub/parallax ligados a scroll
    },
    rise:    32,   // px de desplazamiento en reveals
    stagger: 0.09  // s entre elementos de un grupo
  }

  /* ── Lenis: scroll suave sincronizado con el ticker de GSAP ──
     Patrón oficial: Lenis actualiza ScrollTrigger, GSAP maneja el raf.
     En touch (celulares) Lenis deja el scroll nativo — mejor perf. */
  var lenis = new Lenis({
    duration: 1.1,
    anchors: true // los links #seccion del nav siguen funcionando, suavizados
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(function (time) { lenis.raf(time * 1000) })
  gsap.ticker.lagSmoothing(0)

  /* ── Utilidades para las fases siguientes ── */

  /* Reveal genérico: elementos [data-mo] entran al cruzar el viewport.
     Variantes: rise (sube), fade, scale. Grupos con [data-mo-group]
     escalonan a sus hijos [data-mo]. Se usarán a partir de la Fase 2. */
  function initReveals (root) {
    var scope = root || document
    var singles = scope.querySelectorAll('[data-mo]:not([data-mo-group] [data-mo])')
    if (singles.length) {
      gsap.set(singles, { autoAlpha: 0, y: function (i, el) {
        return el.getAttribute('data-mo') === 'fade' ? 0 : MO.rise
      } })
      ScrollTrigger.batch(singles, {
        start: 'top 85%',
        once: true,
        onEnter: function (els) {
          gsap.to(els, { autoAlpha: 1, y: 0, duration: MO.dur.m, ease: MO.ease.out, stagger: MO.stagger, overwrite: true })
        }
      })
    }
    scope.querySelectorAll('[data-mo-group]').forEach(function (group) {
      var items = group.querySelectorAll('[data-mo]')
      if (!items.length) return
      gsap.set(items, { autoAlpha: 0, y: MO.rise })
      ScrollTrigger.create({
        trigger: group,
        start: 'top 82%',
        once: true,
        onEnter: function () {
          gsap.to(items, { autoAlpha: 1, y: 0, duration: MO.dur.m, ease: MO.ease.out, stagger: MO.stagger, overwrite: true })
        }
      })
    })
  }
  initReveals()

  /* API para las fases 2-5 y para depurar desde consola */
  window.ELMotion = {
    ready: true,
    reduced: false,
    lenis: lenis,
    MO: MO,
    initReveals: initReveals,
    version: { gsap: gsap.version, lenis: '1.3.25' }
  }
})()
