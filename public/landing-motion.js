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
    var lockMark = hero.querySelector('.hero-logo .lk-mark')
    var h1       = hero.querySelector('.hero-h1')
    var textbits = [tag, sub, trust].filter(Boolean)
    gsap.set(textbits, { autoAlpha: 0, y: MO.rise * 0.75 })
    gsap.set(btns,     { autoAlpha: 0, y: MO.rise * 0.75 })
    if (wordmark) gsap.set(wordmark, { autoAlpha: 0 })
    if (h1)       gsap.set(h1, { autoAlpha: 0 })
    if (lockMark) gsap.set(lockMark, { autoAlpha: 0, scale: 0.72, transformOrigin: '50% 50%' })
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

      /* el lockup entra primero, como firma: isotipo y wordmark juntos */
      if (lockMark) tl.to(lockMark, { autoAlpha: 1, scale: 1, duration: MO.dur.m, ease: MO.ease.hero }, 0.12)
      if (wordmark) tl.to(wordmark, { autoAlpha: 1, duration: MO.dur.s }, 0.18)

      /* La entrada letra por letra se reserva para el TITULAR, que es
         el mensaje. Antes vestía al wordmark — mucha coreografía para
         decir el nombre de la marca. */
      if (h1 && typeof SplitText !== 'undefined') {
        /* words+chars: las palabras conservan sus espacios al hacer wrap */
        var split = SplitText.create(h1, { type: 'words,chars', mask: 'chars' })
        gsap.set(h1, { autoAlpha: 1 })
        tl.from(split.chars, {
          yPercent: 120,
          duration: MO.dur.m,
          ease: MO.ease.hero,
          stagger: 0.02,
          /* La máscara de cada carácter mide el ANCHO DE AVANCE del
             glifo, pero la tinta se sale de ahí: la "o" por su
             curvatura y la "y" por la diagonal del descendente. Si
             la máscara sobrevive a la animación, deja esas letras
             recortadas para siempre. Al terminar se deshace el split
             y el titular vuelve a ser texto normal, sin recortes. */
          onComplete: function () { split.revert() }
        }, 0.3)
      } else if (h1) {
        tl.to(h1, { autoAlpha: 1, y: 0, duration: MO.dur.m, ease: MO.ease.hero }, 0.3)
      }

      if (mark)  tl.to(mark,  { autoAlpha: 1, scale: 1, duration: MO.dur.l, ease: MO.ease.hero }, 0.45)
      var card3d = document.getElementById('elCard')
      if (card3d) tl.from(card3d, { rotationY: -26, rotationX: 10, y: 44, duration: 1.6, ease: MO.ease.hero }, 0.5)
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

  /* ══════════════════════════════════════════════════════════════
     FASE 4c — La Tarjeta Viva (protagonista del hero)
     Tarjeta de lealtad 3D construida en DOM: banner del brand,
     sellos (6/10), QR. Flota en loop, se inclina siguiendo el
     mouse (quickTo a 60fps) y recibe un barrido de luz periódico
     como tarjeta física premium. Reemplaza al isotipo estático;
     sin JS o con reduced-motion el isotipo original permanece.
     ══════════════════════════════════════════════════════════════ */
  function buildCard () {
    var heroRight = document.querySelector('.hero-right')
    var hero = document.querySelector('.hero')
    if (!heroRight || !hero) return

    var oldMark = heroRight.querySelector('.hero-mark-wrap')
    if (oldMark) oldMark.style.display = 'none'

    var check = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>'
    var stamps = ''
    for (var i = 0; i < 10; i++) {
      stamps += i < 6
        ? '<div class="el-stamp on">' + check + '</div>'
        : '<div class="el-stamp off"></div>'
    }
    var qr =
      '<svg viewBox="0 0 21 21" fill="#10214F">' +
      '<rect x="0" y="0" width="7" height="7"/><rect x="2" y="2" width="3" height="3" fill="#fff"/>' +
      '<rect x="14" y="0" width="7" height="7"/><rect x="16" y="2" width="3" height="3" fill="#fff"/>' +
      '<rect x="0" y="14" width="7" height="7"/><rect x="2" y="16" width="3" height="3" fill="#fff"/>' +
      '<rect x="9" y="1" width="2" height="2"/><rect x="9" y="5" width="2" height="2"/>' +
      '<rect x="1" y="9" width="2" height="2"/><rect x="5" y="10" width="2" height="2"/>' +
      '<rect x="9" y="9" width="3" height="3"/><rect x="14" y="9" width="2" height="2"/>' +
      '<rect x="18" y="10" width="2" height="2"/><rect x="9" y="14" width="2" height="2"/>' +
      '<rect x="13" y="14" width="3" height="2"/><rect x="17" y="15" width="2" height="2"/>' +
      '<rect x="9" y="18" width="3" height="2"/><rect x="15" y="18" width="2" height="2"/>' +
      '</svg>'

    var stage = document.createElement('div')
    stage.className = 'el-card-stage'
    stage.innerHTML =
      '<div class="el-card-float"><div class="el-card" id="elCard"><div class="el-card-face">' +
      '<div class="el-card-banner"><img src="img/logo-mark.png" alt=""><span>Easy Loyalty</span></div>' +
      '<div class="el-card-body">' +
      '<div class="el-card-label">Tus sellos</div>' +
      '<div class="el-stamps">' + stamps + '</div>' +
      '<div class="el-card-foot">' +
      '<div class="el-card-count"><b>6</b>/10<small>Sellos</small></div>' +
      '<div class="el-qr">' + qr + '</div>' +
      '</div></div>' +
      '<div class="el-card-glare"></div>' +
      '</div></div></div>'
    heroRight.appendChild(stage)

    var float = stage.querySelector('.el-card-float')
    var card  = stage.querySelector('.el-card')
    var glare = stage.querySelector('.el-card-glare')

    /* Flotación idle */
    gsap.to(float, { y: -12, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })

    /* Barrido de luz periódico */
    gsap.fromTo(glare, { xPercent: -130 }, {
      xPercent: 260, duration: 2.4, ease: 'power2.inOut',
      repeat: -1, repeatDelay: 3.8, delay: 2.2
    })

    /* Tilt 3D siguiendo el mouse (60fps via quickTo) */
    var toRX = gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power3.out' })
    var toRY = gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power3.out' })
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect()
      var nx = (e.clientX - r.left) / r.width - 0.5
      var ny = (e.clientY - r.top) / r.height - 0.5
      toRY(nx * 26)
      toRX(ny * -17)
    }, { passive: true })
    hero.addEventListener('mouseleave', function () { toRX(0); toRY(0) })
  }
  buildCard()
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
  /* Manchas de color que orbitan el fondo, para siempre.
     Cada mancha cuelga de un orbitador (punto sin tamaño) que gira
     360° sin fin: al estar la mancha desplazada del centro por --r,
     describe una órbita real alrededor de ese punto. Periodos y
     sentidos distintos por mancha → el conjunto nunca se ve repetir.
     Rendimiento: el blur es fijo y solo se animan transforms, así
     el compositor reutiliza la textura desenfocada. */
  /* Tres ejes a la vez, porque la sensación de profundidad no sale
     de la velocidad sola:
       · r  = radio de órbita → el viaje por el espacio (~150-200 px/s)
       · sc = escala 0.45↔1.8 → acercarse y alejarse
       · op = opacidad         → refuerza esa lejanía
     Los periodos de órbita, escala y opacidad son distintos entre sí
     y entre manchas, así que las trayectorias nunca se sincronizan y
     las manchas se cruzan y se tapan unas a otras. El blur queda fijo
     por mancha (animarlo obliga a re-rasterizar y hunde los FPS); al
     escalar una textura ya desenfocada el desenfoque crece con ella,
     que es justo la pista visual de "esto está más cerca". */
  var AURORA = [
    { sel: '.hero', blobs: [
      { c: 'rgba(0,200,150,.85)',   w: '42vw', x: '30%', y: '20%', r: '28vw', t: 15, d:  1, bl: '80px' },
      { c: 'rgba(126,155,242,.95)', w: '44vw', x: '74%', y: '14%', r: '31vw', t: 19, d: -1, bl: '92px' },
      { c: 'rgba(185,163,236,.92)', w: '40vw', x: '58%', y: '58%', r: '26vw', t: 13, d:  1, bl: '74px' },
      { c: 'rgba(240,175,198,.88)', w: '42vw', x: '40%', y: '80%', r: '29vw', t: 17, d: -1, bl: '86px' },
      { c: 'rgba(248,205,163,.85)', w: '38vw', x: '14%', y: '72%', r: '24vw', t: 12, d:  1, bl: '70px' },
      { c: 'rgba(48,76,226,.90)',   w: '42vw', x: '88%', y: '60%', r: '27vw', t: 21, d: -1, bl: '98px' }
    ]},
    { sel: '.cprev', blobs: [
      { c: 'rgba(0,200,150,.62)',   w: '40vw', x: '26%', y: '26%', r: '26vw', t: 16, d: -1, bl: '80px' },
      { c: 'rgba(58,88,232,.72)',   w: '38vw', x: '86%', y: '18%', r: '23vw', t: 13, d:  1, bl: '74px' },
      { c: 'rgba(240,175,198,.88)', w: '42vw', x: '68%', y: '76%', r: '29vw', t: 18, d: -1, bl: '88px' },
      { c: 'rgba(248,205,163,.88)', w: '36vw', x: '12%', y: '84%', r: '22vw', t: 14, d:  1, bl: '70px' },
      { c: 'rgba(185,163,236,.78)', w: '40vw', x: '48%', y: '48%', r: '31vw', t: 20, d:  1, bl: '84px' }
    ]},
    { sel: '.cfinal', blobs: [
      { c: 'rgba(58,88,232,.85)',   w: '46vw', x: '50%', y: '2%',   r: '28vw', t: 17, d:  1, bl: '96px' },
      { c: 'rgba(0,200,150,.60)',   w: '38vw', x: '22%', y: '96%',  r: '25vw', t: 13, d: -1, bl: '80px' },
      { c: 'rgba(240,175,198,.52)', w: '40vw', x: '78%', y: '92%',  r: '27vw', t: 19, d:  1, bl: '88px' }
    ]},
    { sel: '.how', blobs: [
      { c: 'rgba(58,88,232,.62)',   w: '42vw', x: '78%', y: '26%', r: '28vw', t: 20, d: -1, bl: '100px' },
      { c: 'rgba(0,200,150,.38)',   w: '38vw', x: '18%', y: '78%', r: '25vw', t: 16, d:  1, bl: '88px' }
    ]},
    { sel: '.pricing', blobs: [
      { c: 'rgba(185,163,236,.50)', w: '40vw', x: '20%', y: '22%', r: '26vw', t: 18, d:  1, bl: '96px' },
      { c: 'rgba(58,88,232,.62)',   w: '42vw', x: '82%', y: '74%', r: '29vw', t: 15, d: -1, bl: '100px' }
    ]}
  ]

  function auroraField (cfg) {
    var host = document.querySelector(cfg.sel)
    if (!host) return

    var field = document.createElement('div')
    field.className = 'af'
    field.setAttribute('aria-hidden', 'true')
    field.innerHTML = cfg.blobs.map(function (b) {
      return '<div class="af-orb" style="left:' + b.x + ';top:' + b.y + '">' +
             '<div class="af-b" style="--w:' + b.w + ';--c:' + b.c +
             ';--r:' + b.r + ';--bl:' + (b.bl || '80px') + '"></div></div>'
    }).join('')
    host.insertBefore(field, host.firstChild)
    host.classList.add('af-on')

    var orbs = field.querySelectorAll('.af-orb')
    var tweens = []
    cfg.blobs.forEach(function (b, i) {
      var orb = orbs[i]
      var blob = orb.firstChild

      /* fase inicial al azar: si no, todas arrancan alineadas */
      gsap.set(orb, { rotation: Math.random() * 360 })
      gsap.set(blob, { scale: 0.65 + Math.random() * 0.95, opacity: 0.7 + Math.random() * 0.3 })

      /* 1. viaje: la órbita alrededor de su punto */
      tweens.push(gsap.to(orb, {
        rotation: b.d > 0 ? '+=360' : '-=360',
        duration: b.t, ease: MO.ease.none, repeat: -1
      }))

      /* 2. deriva del centro de órbita: sin esto el recorrido sería
            un carrusel fijo y se leería el patrón a los pocos giros */
      tweens.push(gsap.to(orb, {
        x: 'random(-140, 140)', y: 'random(-110, 110)',
        duration: 'random(11, 19)', ease: 'sine.inOut',
        repeat: -1, yoyo: true, repeatRefresh: true
      }))

      /* 3. profundidad: acercarse/alejarse. Periodos distintos a los
            de la órbita para que nunca coincidan los dos ciclos */
      tweens.push(gsap.to(blob, {
        scale: 'random(0.5, 1.75)',
        duration: 'random(7, 13)', ease: 'sine.inOut',
        repeat: -1, yoyo: true, repeatRefresh: true
      }))
      tweens.push(gsap.to(blob, {
        opacity: 'random(0.58, 1)',
        duration: 'random(9, 16)', ease: 'sine.inOut',
        repeat: -1, yoyo: true, repeatRefresh: true
      }))
    })

    /* Un fondo que no se ve no merece frames. onRefresh además del
       toggle: si solo se escuchara el toggle, un campo que arranca
       fuera de pantalla podría quedarse pausado para siempre. */
    function setRunning (on) {
      tweens.forEach(function (t) { on ? t.play() : t.pause() })
    }
    ScrollTrigger.create({
      trigger: host, start: 'top bottom', end: 'bottom top',
      onToggle:  function (self) { setRunning(self.isActive) },
      onRefresh: function (self) { setRunning(self.isActive) }
    })
  }

  function livingBackground () {
    AURORA.forEach(auroraField)
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

    /* ── Desktop: pin + scrub, pero comprimido ──
       El efecto (cada paso conducido por el scroll) se conserva; lo
       que estaba mal era la escala: +=220% de ventana obligaba a
       recorrer casi 2000px para ver salir tres textos. Ahora el
       recorrido es +=65% (~585px, medio golpe de rueda) y los pasos
       arrancan antes y más juntos dentro de él, así que los tres
       aterrizan en el primer 60% del tramo y el resto es el respiro
       antes de soltar el pin. */
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
          end: '+=65%',
          pin: true,
          scrub: 0.45,
          anticipatePin: 1
        }
      })

      /* Título: entra casi de inmediato para no gastar recorrido */
      tl.to(eye, { autoAlpha: 1, y: 0, duration: 0.05, ease: MO.ease.out }, 0)
        .to(wis, { xPercent: 0, duration: 0.09, ease: MO.ease.inOut, stagger: 0.025 }, 0.01)

      /* Pasos: 0.13 de separación en vez de 0.2, y arrancan en 0.14
         en vez de 0.2 — los tres quedan puestos en 0.58 */
      steps.forEach(function (step, i) {
        var at = 0.14 + i * 0.13
        tl.to(step, { autoAlpha: 1, y: 0, duration: 0.16, ease: MO.ease.out }, at)
        if (nums[i]) tl.to(nums[i], { yPercent: 0, duration: 0.18, ease: MO.ease.out }, at + 0.01)
      })

      if (bar) tl.to(bar, { scaleX: 1, duration: 0.58, ease: MO.ease.none }, 0)

      /* Respiro corto antes de despinear */
      tl.to({}, { duration: 0.12 })

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

  /* ══════════════════════════════════════════════════════════════
     FASE 5 — La historia de los sellos (cprev pinned)
     La tarjeta "Ana García" empieza en 0/9. Desktop: la sección se
     fija y cada tramo de scroll estampa un sello (pop back.out +
     contador vivo); al noveno, la tarjeta pulsa, estalla una lluvia
     de partículas del brand y aparece el premio. Scrollear hacia
     atrás rebobina todo (los sellos se despegan, las partículas se
     retraen). Móvil: la secuencia se auto-reproduce al entrar.
     ══════════════════════════════════════════════════════════════ */
  function cardStory () {
    var sec = document.querySelector('.cprev')
    if (!sec) return
    var card    = sec.querySelector('.ccard')
    var stampsW = sec.querySelector('.cc-stamps')
    var prog    = sec.querySelector('.cc-prog')
    var reward  = sec.querySelector('.cc-reward')
    var eye     = sec.querySelector('.eye')
    var wis     = sec.querySelectorAll('h2 .wl .wi')
    var para    = sec.querySelector('.cprev-grid p')
    var cta     = sec.querySelector('.cprev-grid .btn-dark')
    var cardCell = card ? card.parentElement : null
    if (!card || !stampsW || !prog || !reward) return

    var TOTAL = 9
    var check = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10214F" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'
    var html = ''
    for (var i = 0; i < TOTAL; i++) html += '<div class="cs e">' + check + '</div>'
    stampsW.innerHTML = html
    var stamps = stampsW.querySelectorAll('.cs')

    /* Capa de partículas (fuera del overflow:hidden de la tarjeta) */
    var burstColors = ['#00C896', '#7E9BF2', '#B9A3EC', '#F0AFC6', '#F8CDA3']
    var partbox = null
    if (cardCell) {
      cardCell.style.position = 'relative'
      partbox = document.createElement('div')
      partbox.className = 'el-partbox'
      partbox.setAttribute('aria-hidden', 'true')
      for (var p = 0; p < 16; p++) {
        var d = document.createElement('div')
        d.className = 'el-part'
        d.style.background = burstColors[p % burstColors.length]
        d.style.left = '50%'
        d.style.top = '30%'
        partbox.appendChild(d)
      }
      cardCell.appendChild(partbox)
    }

    function setCount (n) { prog.textContent = n + ' / ' + TOTAL + ' sellos acumulados' }

    /* Construye el timeline de la historia (compartido desktop/móvil) */
    function buildStory (tl, compact) {
      var step = compact ? 0.16 : 0.075
      var t0 = compact ? 0 : 0.16

      stamps.forEach(function (s, i) {
        var svg = s.querySelector('svg')
        gsap.set(svg, { scale: 0, rotation: -20, transformOrigin: '50% 50%' })
        var at = t0 + i * step
        tl.to(s, {
          backgroundColor: '#00C896', borderColor: 'rgba(0,200,150,0)',
          duration: step * 0.5, ease: 'power1.in',
          onStart: function () { setCount(i + 1) },
          onReverseComplete: function () { setCount(i) }
        }, at)
        tl.to(svg, { scale: 1, rotation: 0, duration: step * 0.9, ease: 'back.out(2.2)' }, at)
      })

      var fin = t0 + TOTAL * step + (compact ? 0.1 : 0.05)
      tl.to(card, { scale: 1.045, duration: 0.07, ease: 'power2.out' }, fin)
        .to(card, { scale: 1, duration: 0.12, ease: 'power2.inOut' }, fin + 0.07)
        .to(reward, { autoAlpha: 1, scale: 1, duration: 0.14, ease: 'back.out(1.8)' }, fin + 0.04)
      if (partbox) {
        partbox.querySelectorAll('.el-part').forEach(function (d, i) {
          var ang = (i / 16) * Math.PI * 2
          var dist = 90 + (i % 4) * 45
          tl.fromTo(d, { x: 0, y: 0, autoAlpha: 0, scale: 0.4 }, {
            x: Math.cos(ang) * dist,
            y: Math.sin(ang) * dist - 40,
            autoAlpha: 1, scale: 1,
            duration: 0.14, ease: 'power2.out'
          }, fin + 0.05)
          tl.to(d, { autoAlpha: 0, scale: 0.2, duration: 0.08 }, fin + 0.19)
        })
      }
      return fin
    }

    var mm = gsap.matchMedia()

    /* ── Desktop: pinned, el scroll estampa ── */
    mm.add('(min-width: 921px)', function () {
      sec.classList.add('gsap-on')
      gsap.set(eye,  { autoAlpha: 0, y: 20 })
      gsap.set(wis,  { x: 0, xPercent: -102 })
      gsap.set([para, cta], { autoAlpha: 0, y: 26 })
      gsap.set(card, { autoAlpha: 0, y: 60, rotationY: -14, transformOrigin: '50% 50%' })
      gsap.set(reward, { autoAlpha: 0, scale: 0.5 })
      setCount(0)

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'center center',
          end: '+=260%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1
        }
      })
      tl.to(eye, { autoAlpha: 1, y: 0, duration: 0.05, ease: MO.ease.out }, 0)
        .to(wis, { xPercent: 0, duration: 0.09, ease: MO.ease.inOut, stagger: 0.03 }, 0.01)
        .to([para, cta], { autoAlpha: 1, y: 0, duration: 0.08, ease: MO.ease.out, stagger: 0.03 }, 0.05)
        .to(card, { autoAlpha: 1, y: 0, rotationY: 0, duration: 0.12, ease: MO.ease.out }, 0.04)

      var fin = buildStory(tl, false)
      tl.to({}, { duration: 0.14 })                       /* respiro final */

      return function () { sec.classList.remove('gsap-on'); setCount(6) }
    })

    /* ── Móvil: auto-secuencia al entrar la tarjeta ── */
    mm.add('(max-width: 920px)', function () {
      sec.classList.add('gsap-on')
      gsap.set(reward, { autoAlpha: 0, scale: 0.5 })
      setCount(0)

      var tl = gsap.timeline({ paused: true })
      buildStory(tl, true)

      ScrollTrigger.create({
        trigger: card, start: 'top 70%', once: true,
        onEnter: function () { tl.play() }
      })

      return function () { sec.classList.remove('gsap-on'); setCount(6) }
    })
  }
  cardStory()

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
