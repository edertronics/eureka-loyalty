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

  /* ══════════════════════════════════════════════════════════════
     FASE 2 — Hero orquestado
     Secuencia de entrada: líneas de fondo → tag → wordmark (letra
     por letra, enmascarado) → isotipo → subtítulo → CTAs → trust.
     GSAP toma el control del hero (.gsap-on apaga el sistema .rv
     solo ahí); si GSAP no carga, el hero vuelve al flujo viejo.
     ══════════════════════════════════════════════════════════════ */
  function heroIntro () {
    var hero = document.querySelector('.hero')
    if (!hero) return

    var tag      = hero.querySelector('.hero-tag')
    var wordmark = hero.querySelector('.hero-wordmark')
    var mark     = hero.querySelector('.hero-right')
    var sub      = hero.querySelector('.hero-sub')
    var btns     = hero.querySelectorAll('.hero-btns a')
    var trust    = hero.querySelector('.hero-trust')
    var vls      = hero.querySelectorAll('.vl')
    var hhls     = hero.querySelectorAll('.hhl')
    var navEl    = document.getElementById('nav')

    /* Estados iniciales ocultos ANTES de apagar el CSS viejo — sin flash */
    var textbits = [tag, sub, trust].filter(Boolean)
    gsap.set(textbits, { autoAlpha: 0, y: MO.rise * 0.75 })
    gsap.set(btns,     { autoAlpha: 0, y: MO.rise * 0.75 })
    if (wordmark) gsap.set(wordmark, { autoAlpha: 0 })
    if (mark)     gsap.set(mark, { autoAlpha: 0, scale: 0.94, transformOrigin: '50% 50%' })
    gsap.set(vls,  { scaleY: 0, transformOrigin: '50% 0%' })
    gsap.set(hhls, { scaleX: 0, transformOrigin: '0% 50%' })
    if (navEl)    gsap.set(navEl, { autoAlpha: 0, y: -14 })
    hero.classList.add('gsap-on')

    /* El wordmark se parte en letras cuando la fuente ya midió bien */
    var fontsReady = (document.fonts && document.fonts.ready)
      ? document.fonts.ready
      : Promise.resolve()

    fontsReady.then(function () {
      /* Se construye pausado: lo dispara el preloader al abrir la cortina */
      var tl = gsap.timeline({ paused: true, defaults: { ease: MO.ease.out } })

      tl.to(hhls, { scaleX: 1, duration: MO.dur.l, ease: MO.ease.inOut, stagger: 0.08 }, 0)
        .to(vls,  { scaleY: 1, duration: MO.dur.l, ease: MO.ease.inOut, stagger: 0.06 }, 0)

      if (tag) tl.to(tag, { autoAlpha: 1, y: 0, duration: MO.dur.s }, 0.15)

      if (wordmark && typeof SplitText !== 'undefined') {
        /* words+chars: las palabras conservan sus espacios al hacer wrap */
        var split = SplitText.create(wordmark, { type: 'words,chars', mask: 'chars' })
        gsap.set(wordmark, { autoAlpha: 1 })
        tl.from(split.chars, {
          yPercent: 120,
          duration: MO.dur.m,
          ease: MO.ease.hero,
          stagger: 0.03
        }, 0.3)
      } else if (wordmark) {
        tl.to(wordmark, { autoAlpha: 1, y: 0, duration: MO.dur.m, ease: MO.ease.hero }, 0.3)
      }

      if (mark)  tl.to(mark,  { autoAlpha: 1, scale: 1, duration: MO.dur.l, ease: MO.ease.hero }, 0.45)
      if (sub)   tl.to(sub,   { autoAlpha: 1, y: 0, duration: MO.dur.m }, 0.75)
      if (btns.length) tl.to(btns, { autoAlpha: 1, y: 0, duration: MO.dur.m, stagger: 0.08 }, 0.9)
      if (trust) tl.to(trust, { autoAlpha: 1, y: 0, duration: MO.dur.s }, 1.15)
      if (navEl) tl.to(navEl, { autoAlpha: 1, y: 0, duration: MO.dur.m }, 0.35)

      heroTl = tl
      if (heroPlayRequested) tl.play()
    })
  }
  var heroTl = null
  var heroPlayRequested = false
  function playHero () { if (heroTl) heroTl.play(); else heroPlayRequested = true }
  heroIntro()

  /* ══════════════════════════════════════════════════════════════
     FASE 4a — Preloader con cortina
     Contador 0→100 sobre panel verde profundo; el panel se levanta
     con curva y la entrada del hero arranca a media cortina — la
     intro deja de ser "perdible". Repite visita en la misma sesión:
     versión rápida. Solo existe con motion activo (inyectado por JS).
     ══════════════════════════════════════════════════════════════ */
  function preloader () {
    try { history.scrollRestoration = 'manual' } catch (e) {}
    window.scrollTo(0, 0)
    lenis.stop()

    var el = document.createElement('div')
    el.id = 'elp'
    el.innerHTML =
      '<span class="elp-brand">Easy Loyalty</span>' +
      '<span class="elp-tag">Programa de lealtad digital</span>' +
      '<div class="elp-num" aria-hidden="true">0</div>'
    document.body.appendChild(el)
    var num = el.querySelector('.elp-num')

    var quick = false
    try {
      quick = sessionStorage.getItem('elp') === '1'
      sessionStorage.setItem('elp', '1')
    } catch (e) {}

    var counter = { v: 0 }
    var tl = gsap.timeline({
      onComplete: function () { el.remove(); lenis.start() }
    })
    tl.to(counter, {
      v: 100,
      duration: quick ? 0.45 : 1.05,
      ease: 'power2.inOut',
      onUpdate: function () { num.textContent = Math.round(counter.v) }
    })
      .to(num, { autoAlpha: 0, y: -40, duration: 0.28, ease: 'power2.in' }, quick ? 0.3 : 0.92)
      .add('lift')
      .add(function () { el.classList.add('lifting') }, 'lift')
      .to(el, { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, 'lift')
      .add(function () { playHero() }, 'lift+=0.3')
  }
  preloader()

  /* ══════════════════════════════════════════════════════════════
     FASE 4b — Fondo vivo
     Aurora: 3 manchas de luz en los verdes del brand, desenfocadas,
     derivando en loops lentos re-aleatorizados (repeatRefresh) —
     el hero respira. Grano fílmico fijo sobre toda la página.
     ══════════════════════════════════════════════════════════════ */
  function livingBackground () {
    var hero = document.querySelector('.hero')
    if (hero) {
      var wrap = document.createElement('div')
      wrap.className = 'el-aurora'
      wrap.setAttribute('aria-hidden', 'true')
      wrap.innerHTML = '<div class="el-blob b1"></div><div class="el-blob b2"></div><div class="el-blob b3"></div>'
      hero.insertBefore(wrap, hero.firstChild)
      wrap.querySelectorAll('.el-blob').forEach(function (b) {
        gsap.to(b, {
          xPercent: 'random(-20, 20)',
          yPercent: 'random(-16, 16)',
          scale: 'random(0.85, 1.2)',
          duration: 'random(14, 24)',
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          repeatRefresh: true
        })
      })
    }
    var grain = document.createElement('div')
    grain.className = 'el-grain'
    grain.setAttribute('aria-hidden', 'true')
    document.body.appendChild(grain)
  }
  livingBackground()

  /* ══════════════════════════════════════════════════════════════
     FASE 3 — "Cómo funciona" pinned
     Desktop: la sección se fija en pantalla y el scroll del usuario
     conduce la coreografía (scrub): título en barrido → paso 01 →
     02 → 03, con barra de progreso ligada 1:1 al recorrido.
     Móvil (≤920px, pasos apilados): reveals escalonados sin pin.
     ══════════════════════════════════════════════════════════════ */
  function howPinned () {
    var how = document.querySelector('.how')
    if (!how) return

    var eye   = how.querySelector('.eye')
    var wis   = how.querySelectorAll('h2 .wl .wi')
    var steps = how.querySelectorAll('.step')
    var nums  = how.querySelectorAll('.step-n')
    var bar   = how.querySelector('.how-progress')

    var mm = gsap.matchMedia()

    /* ── Desktop: pin + scrub ── */
    mm.add('(min-width: 921px)', function () {
      how.classList.add('gsap-on')

      gsap.set(eye,   { autoAlpha: 0, y: 24 })
      /* x:0 limpia el translateX(-104%) del CSS base (GSAP lo captura en px
         en el canal `x`, distinto de xPercent — si no, se suman los dos) */
      gsap.set(wis,   { x: 0, xPercent: -102 })
      gsap.set(steps, { autoAlpha: 0, y: 72 })
      gsap.set(nums,  { yPercent: 45 })
      if (bar) gsap.set(bar, { scaleX: 0 })

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: how,
          start: 'center center',
          end: '+=220%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1
        }
      })

      /* Título en barrido (0 → 12%) */
      tl.to(eye, { autoAlpha: 1, y: 0, duration: 0.06, ease: MO.ease.out }, 0)
        .to(wis, { xPercent: 0, duration: 0.1, ease: MO.ease.inOut, stagger: 0.035 }, 0.02)

      /* Pasos: cada uno conduce su tramo del scroll */
      steps.forEach(function (step, i) {
        var at = 0.2 + i * 0.2
        tl.to(step, { autoAlpha: 1, y: 0, duration: 0.13, ease: MO.ease.out }, at)
        if (nums[i]) tl.to(nums[i], { yPercent: 0, duration: 0.15, ease: MO.ease.out }, at + 0.015)
      })

      /* Barra de progreso: 1:1 con el scroll hasta que aterriza el paso 03 */
      if (bar) tl.to(bar, { scaleX: 1, duration: 0.76, ease: MO.ease.none }, 0)

      /* Respiro final antes de despinear */
      tl.to({}, { duration: 0.18 })

      return function () { how.classList.remove('gsap-on') }
    })

    /* ── Móvil: reveals escalonados, sin pin ── */
    mm.add('(max-width: 920px)', function () {
      how.classList.add('gsap-on')
      gsap.set(eye,   { autoAlpha: 0, y: 24 })
      gsap.set(wis,   { x: 0, xPercent: -102 })
      gsap.set(steps, { autoAlpha: 0, y: 48 })

      ScrollTrigger.create({
        trigger: how, start: 'top 75%', once: true,
        onEnter: function () {
          gsap.to(eye, { autoAlpha: 1, y: 0, duration: MO.dur.s, ease: MO.ease.out })
          gsap.to(wis, { xPercent: 0, duration: MO.dur.m, ease: MO.ease.inOut, stagger: 0.12 })
        }
      })
      ScrollTrigger.batch(steps, {
        start: 'top 85%', once: true,
        onEnter: function (els) {
          gsap.to(els, { autoAlpha: 1, y: 0, duration: MO.dur.m, ease: MO.ease.out, stagger: MO.stagger, overwrite: true })
        }
      })

      return function () { how.classList.remove('gsap-on') }
    })
  }
  howPinned()

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
