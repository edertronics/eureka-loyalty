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
  /* Cada plugin va con guarda propia: si uno falta, la sección que lo usa
     degrada sola en vez de tumbar todo el sistema de movimiento. */
  if (typeof DrawSVGPlugin !== 'undefined') gsap.registerPlugin(DrawSVGPlugin)
  if (typeof CustomEase !== 'undefined') gsap.registerPlugin(CustomEase)
  if (typeof CustomBounce !== 'undefined') {
    gsap.registerPlugin(CustomBounce)
    /* rebote del sello al caer en su casilla: firme pero corto, para que
       diez seguidos no se sientan como gelatina */
    CustomBounce.create('selloIn', { strength: 0.58, squash: 1.4, squashID: 'selloIn-squash' })
  }

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
  /* SIN `anchors: true`. Lenis traía su propio manejador de anclas y
     competía con el nuestro: los dos respondían al mismo clic y ganaba
     el suyo, que lleva al borde de la sección. Las anclas las gobierna
     anchorsToPinned() más abajo, que es el único que sabe que una
     sección anclada no se ve completa en su borde. */
  var lenis = new Lenis({ duration: 1.1 })
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

    /* El titular se parte en letras cuando la tipografía ya midió bien.
       Pero `document.fonts.ready` espera a las SIETE variantes de HK
       Grotesk —435 KB entre todas—, y basta con que llegue la del
       titular para poder medirlo. Peor: si una sola no llega nunca, la
       promesa no resuelve y el hero no se construye jamás.
       Así que se corre una carrera contra un segundo y medio. Si las
       fuentes ganan, se mide con ellas; si no, se mide con la de
       reserva y el titular entra igual — un titular con la tipografía
       equivocada durante un instante es mucho menos grave que un hero
       que no aparece. */
    var fontsReady = (document.fonts && document.fonts.ready)
      ? Promise.race([
          document.fonts.ready,
          new Promise(function (r) { setTimeout(r, 1500) })
        ])
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

      /* El contenedor solo se destapa, rápido: quien hace el número son
         los teléfonos. Antes escalaba en 1.2s y retenía la caída, que
         es justo lo que tiene que verse. */
      if (mark) tl.to(mark, { autoAlpha: 1, scale: 1, duration: MO.dur.s, ease: MO.ease.out }, 0.1)
      /* La caída se encaja aquí para que aterricen mientras el titular
         termina de entrar: los dos momentos se apoyan en vez de
         turnarse. */
      if (phonesEnter) tl.add(phonesEnter(), 0.15)
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
     Fábrica del teléfono — compartida por el hero y el viaje del premio
     Vive aquí arriba y no dentro de una sección porque el mismo aparato
     se usa en dos lugares con comportamientos distintos: en el hero
     sigue al mouse, en el viaje lo maneja el scroll. Si el marcado se
     duplicara, cualquier ajuste al aparato habría que hacerlo dos veces.
     ══════════════════════════════════════════════════════════════ */
  var PH = (function () {
    var check = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>'
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

    var statusBar =
      '<div class="ph-status"><span>9:41</span><div class="ph-sig">' +
      '<i><svg viewBox="0 0 24 16"><rect x="0" y="10" width="4" height="6" rx="1"/>' +
      '<rect x="6" y="7" width="4" height="9" rx="1"/><rect x="12" y="4" width="4" height="12" rx="1"/>' +
      '<rect x="18" y="0" width="4" height="16" rx="1"/></svg></i>' +
      '<i><svg viewBox="0 0 24 18"><path d="M12 15.6l3.1-3.7a4.8 4.8 0 0 0-6.2 0zM12 8.3c2.1 0 4 .8 5.5 2.1l2.2-2.6A11.8 11.8 0 0 0 12 4.8c-3 0-5.8 1.1-7.9 3l2.2 2.6A8.4 8.4 0 0 1 12 8.3z"/></svg></i>' +
      '<i class="b"><svg viewBox="0 0 28 14"><rect x=".6" y=".6" width="23" height="12.8" rx="3.6" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>' +
      '<rect x="2.4" y="2.4" width="17" height="9.2" rx="2.2"/>' +
      '<path d="M25.4 5.1v3.8a2.3 2.3 0 0 0 0-3.8z" fill-opacity=".45"/></svg></i>' +
      '</div></div>'

    /* Seis placas iguales a distinta Z = el canto del aparato. */
    var plates = ''
    for (var p = 6; p >= 1; p--) plates += '<div class="ph-plate ph-p' + p + '"></div>'

    /* Un pase. `done` es el estado inicial; el viaje del premio arranca
       en 0 y va encendiendo sellos con el scroll. */
    function pass (o) {
      var st = ''
      for (var i = 0; i < o.total; i++) {
        st += i < o.done
          ? '<div class="ph-stamp on">' + check + '</div>'
          : '<div class="ph-stamp off">' + (o.drawable ? check : '') + '</div>'
      }
      return '<div class="ph-pass">' +
        '<div class="ph-pass-top">' +
        '<span class="lk-mark" aria-hidden="true"></span>' +
        '<span class="ph-pass-name">' + o.name + '</span>' +
        '</div>' +
        '<div class="ph-pass-body">' +
        '<div class="ph-pass-lbl">Tus sellos</div>' +
        /* la retícula se adapta al total para no dejar una fila coja:
           10 sellos caen en 2×5, 8 en 2×4 */
        '<div class="ph-stamps" style="--cols:' + (o.total % 5 ? 4 : 5) + '">' + st + '</div>' +
        '<div class="ph-pass-foot">' +
        '<div class="ph-count"><b>' + o.done + '</b><small>de ' + o.total + ' sellos</small></div>' +
        '<div class="ph-qr">' + qr + '</div>' +
        '</div></div></div>'
    }

    function phone (o) {
      return '<div class="ph-float ' + (o.pos || '') + '"><div class="ph-in"><div class="ph">' +
        plates +
        '<div class="ph-face"><div class="ph-screen">' +
        '<div class="ph-island"></div>' +
        statusBar +
        '<div class="ph-ui ' + o.tone + '">' +
        '<div class="ph-app">' + o.app + '</div>' +
        pass(o) +
        '<div class="ph-note">' + (o.note || 'Sin instalar ninguna app') + '</div>' +
        '</div>' +
        '<div class="ph-glass"></div><div class="ph-spec"></div>' +
        '</div></div>' +
        '<div class="ph-shadow"></div>' +
        '</div></div>' +
        '<div class="ph-burst" aria-hidden="true"></div>' +
        '</div>'
    }

    /* Silueta squircle: las esquinas de un teléfono real no son un
       arco de círculo, son una superelipse (curvatura continua). Es
       de los detalles que más delatan a un mockup falso, y con un
       border-radius no se puede expresar. Se calcula en píxeles
       porque en % las esquinas se estirarían con el alto. */
    function squircle (w, h) {
      var r = w * 0.17, n = 5, steps = 14, pts = []
      function corner (cx, cy, sx, sy, rev) {
        for (var i = 0; i <= steps; i++) {
          var t = (rev ? steps - i : i) / steps * Math.PI / 2
          pts.push(
            (cx + sx * r * Math.pow(Math.cos(t), 2 / n)).toFixed(1) + 'px ' +
            (cy + sy * r * Math.pow(Math.sin(t), 2 / n)).toFixed(1) + 'px')
        }
      }
      corner(r, r, -1, -1, false)          // sup-izq: del canto izquierdo al techo
      corner(w - r, r, 1, -1, true)        // sup-der
      corner(w - r, h - r, 1, 1, false)    // inf-der
      corner(r, h - r, -1, 1, true)        // inf-izq
      return 'polygon(' + pts.join(',') + ')'
    }

    /* Recorta todas las placas de `root` y se re-suscribe al resize.
       Se mide el .ph de cada aparato por separado: en el viaje el
       teléfono es mucho más grande que los del hero. */
    function reshape (root) {
      root.querySelectorAll('.ph').forEach(function (ph) {
        var w = ph.offsetWidth, h = ph.offsetHeight
        if (!w || !h) return
        var clip = squircle(w, h)
        ph.querySelectorAll('.ph-plate,.ph-face').forEach(function (el) {
          el.style.clipPath = clip
        })
      })
    }
    function autoReshape (root) {
      reshape(root)
      window.addEventListener('resize', function () { reshape(root) }, { passive: true })
    }

    return { check: check, pass: pass, phone: phone, reshape: autoReshape }
  })()

  /* ══════════════════════════════════════════════════════════════
     FASE 4c — Los dos teléfonos (protagonistas del hero)
     Dos aparatos construidos íntegramente en DOM, cada uno con un
     pase distinto en pantalla: así se ve que la tarjeta se
     personaliza por negocio, que es el argumento de venta.

     Se inclinan siguiendo el mouse, pero NO por igual: el de
     adelante responde completo y el de atrás un 58%, además de
     estar más lejos en Z. Esa diferencia es lo que produce el
     parallax —si los dos giraran igual se leerían como una sola
     lámina— y es lo que da la sensación de profundidad entre ellos.

     Reemplaza al isotipo estático; sin JS o con movimiento reducido
     el isotipo original permanece.
     ══════════════════════════════════════════════════════════════ */
  function buildPhones () {
    var heroRight = document.querySelector('.hero-right')
    var hero = document.querySelector('.hero')
    if (!heroRight || !hero) return

    var oldMark = heroRight.querySelector('.hero-mark-wrap')
    if (oldMark) oldMark.style.display = 'none'
    /* La etiqueta "Apple · Google Wallet" acompañaba al isotipo; con los
       teléfonos encima se solapa, y además sobra: los dos wallets ya se
       anuncian dentro de las pantallas y en la píldora del hero. */
    var oldMeta = heroRight.querySelector('.hero-mark-meta')
    if (oldMeta) oldMeta.style.display = 'none'

    var stage = document.createElement('div')
    stage.className = 'ph-stage'
    stage.innerHTML =
      /* drawable: los sellos que faltan llevan su palomita ya puesta pero
         sin trazar, para poder dibujarla cuando el visitante baje */
      PH.phone({ pos: 'ph-a', tone: 'pass-warm', app: 'Apple Wallet',
                 name: 'Café Aurora', total: 10, done: 7, drawable: true }) +
      PH.phone({ pos: 'ph-b', tone: 'pass-cool', app: 'Google Wallet',
                 name: 'Barbería Norte', total: 8, done: 4, drawable: true })
    heroRight.appendChild(stage)
    PH.reshape(stage)

    /* El de adelante manda; el de atrás responde menos y va más lejos.
       `delay` desfasa la materialización: si los dos aparecieran a la
       vez se leerían como una sola pieza partida en dos. */
    /* Una sola pregunta —¿escritorio o teléfono?— gobierna la entrada
       y qué adornos continuos se encienden. Se resuelve aquí arriba,
       una vez, y no vuelve a consultarse: no es un efecto que deba
       cambiar si giras el aparato a media animación.
       EN EL TELÉFONO NO HAY ENTRADA, y es una decisión tomada después
       de tres intentos de abaratarla: viaje desde el fondo con `z` y
       giros en tres ejes; lo mismo en 2D con escala y giro en el plano
       (-31% de rasterizado, medido); y solo desplazamiento y opacidad
       en 0,8 s. Las tres se seguían trabando en un iPhone real. El
       motivo de fondo es que el hero móvil pide, en el mismo segundo y
       medio, dos teléfonos de ~40 elementos cada uno bajo un contexto
       3D, dieciocho manchas de color de media pantalla, el titular
       partido en letras y una cortina de pantalla completa
       levantándose. Cada pieza se defiende sola; juntas no caben.
       Así que en el teléfono los aparatos YA ESTÁN cuando se levanta la
       cortina. La flotación en reposo se queda —un translate en 2D
       sobre dos elementos, no cuesta nada— y con ella el hero sigue
       vivo. Si algún día se quiere recuperar algo aquí, se mide en un
       teléfono ANTES de escribirlo. */
    var conBlur = window.matchMedia('(min-width: 921px)').matches

    var units = [
      { sel: '.ph-a', baseY: -10, baseZ: -4, depth: 1.00, z: 0,   dur: 3.4, delay: 0 },
      { sel: '.ph-b', baseY: 12,  baseZ: 5,  depth: 0.58, z: -50, dur: 4.1, delay: 0.18 }
    ]

    units.forEach(function (u, idx) {
      var float = stage.querySelector(u.sel)
      var inner = float.querySelector('.ph-in')
      var ph = float.querySelector('.ph')
      var spec = float.querySelector('.ph-spec')
      u.inner = inner
      u.float = float
      u.ph = ph

      gsap.set(float, { rotationZ: u.baseZ, z: u.z })
      gsap.set(ph, { rotationY: u.baseY })
      /* El estado de partida de la materialización (oculto, un pelo más
         grande y desenfocado) se fija más abajo, junto con el halo, para
         que los dos pedazos de la entrada vivan en el mismo sitio. */

      /* Flotación idle desfasada: en sincronía se verían pegados. */
      gsap.to(float, {
        y: idx ? -16 : -11, duration: u.dur, ease: 'sine.inOut',
        yoyo: true, repeat: -1, delay: idx * 0.9
      })

      /* Barrido de luz periódico, para que no se congele sin mouse.
         Solo en escritorio: en el teléfono no hay cursor al que
         responder, el reflejo apenas se distingue a ese tamaño, y
         cuesta un repintado dentro de la máscara squircle cada cuadro
         de los 2,6 s que dura, para siempre. Es batería regalada. */
      if (conBlur) {
        gsap.fromTo(spec, { xPercent: -55 }, {
          xPercent: 55, duration: 2.6, ease: 'power2.inOut',
          repeat: -1, repeatDelay: 4.4, delay: 2 + idx * 1.4
        })
      }

      u.toRX = gsap.quickTo(ph, 'rotationX', { duration: 0.5, ease: 'power3.out' })
      u.toRY = gsap.quickTo(ph, 'rotationY', { duration: 0.5, ease: 'power3.out' })
      u.toX  = gsap.quickTo(float, 'x', { duration: 0.7, ease: 'power3.out' })
      /* El especular se corre en px sobre el barrido periódico, que
         usa xPercent: son canales distintos y se suman sin pelearse. */
      u.toSpec = gsap.quickTo(spec, 'x', { duration: 0.5, ease: 'power3.out' })
    })

    /* ── EL PARALLAJE NO PUEDE MEDIR EN CADA EVENTO ──────────────
       Esto medía el hero con getBoundingClientRect dentro del propio
       mousemove. Un trackpad entrega más de cien eventos por segundo y
       GSAP está escribiendo estilos en cada cuadro, así que cada una de
       esas medidas obligaba al navegador a recalcular el layout EN EL
       ACTO, antes de poder responder. Medido: 4,1 lecturas forzadas por
       movimiento del ratón. Eso es exactamente lo que se siente como un
       cursor torpe, aunque el punto se dibuje en el propio evento — el
       manejador del hero corre ANTES (el evento burbujea desde la foto
       hacia arriba) y le mete un layout por delante.
       Ahora el evento solo apunta dónde está el ratón, y el trabajo se
       hace como mucho una vez por cuadro. La caja del hero se guarda y
       solo se vuelve a medir si la ventana cambió de tamaño o si hubo
       scroll — que es cuando de verdad se movió. */
    var hcaja = null
    var pedido = false
    var pmx = 0, pmy = 0
    var invalidar = function () { hcaja = null }
    window.addEventListener('resize', invalidar, { passive: true })
    window.addEventListener('scroll', invalidar, { passive: true })

    function aplicarParallax () {
      pedido = false
      if (!hcaja) hcaja = hero.getBoundingClientRect()
      if (!hcaja.width || !hcaja.height) return
      var nx = (pmx - hcaja.left) / hcaja.width - 0.5
      var ny = (pmy - hcaja.top) / hcaja.height - 0.5
      units.forEach(function (u) {
        u.toRY(u.baseY + nx * 26 * u.depth)
        u.toRX(ny * -17 * u.depth)
        u.toX(nx * 26 * u.depth)              // desplazamiento = parallax
        u.toSpec(nx * -90 * u.depth)          // la luz corre al contrario
      })
    }

    hero.addEventListener('mousemove', function (e) {
      pmx = e.clientX; pmy = e.clientY
      if (!pedido) { pedido = true; requestAnimationFrame(aplicarParallax) }
    }, { passive: true })

    hero.addEventListener('mouseleave', function () {
      units.forEach(function (u) {
        u.toRX(0); u.toRY(u.baseY); u.toX(0); u.toSpec(0)
      })
    })

    /* ── LA ENTRADA: caen desde el fondo ──────────────────────────
       Se entrega como línea de tiempo para que el hero la encaje en su
       secuencia; así aterrizan JUNTO con el titular y no como un
       número aparte. La desaceleración es expo: casi todo el recorrido
       ocurre en el primer tercio del tiempo y el último tramo es un
       frenado largo — es lo que hace que se sienta que pesan y no que
       simplemente se deslizan. */
    /* Dos entradas según la máquina, y la razón es de rendimiento, no
       estética: animar `filter: blur()` obliga al navegador a RASTERIZAR
       DE NUEVO el teléfono completo —seis placas, máscara squircle,
       sombra— en cada cuadro. En un escritorio se absorbe; en un celular
       la página se queda pasmada varios segundos.
       Mover y girar, en cambio, lo resuelve la tarjeta gráfica sin
       repintar nada. Así que el móvil recibe la caída desde el fondo,
       que es puro transform, y el escritorio conserva la
       materialización. `conBlur` se resolvió al principio del bloque. */

    units.forEach(function (u) {
      if (conBlur) {
        gsap.set(u.inner, { autoAlpha: 0, scale: 1.07 })
        var halo = document.createElement('div')
        halo.className = 'ph-halo'
        u.float.insertBefore(halo, u.float.firstChild)
        u.halo = halo
      }
      /* En el teléfono NO se prepara nada: los aparatos se quedan
         visibles desde el primer pintado. Ver la nota de la entrada. */
    })

    var entered = false
    phonesEnter = function () {
      var tl = gsap.timeline()

      units.forEach(function (u) {
        var sh = u.float.querySelector('.ph-shadow')

        if (conBlur) {
          /* El halo entra primero y se apaga cuando el aparato ya es
             nítido: la luz "deja" el teléfono, no al revés. */
          tl.fromTo(u.halo, { opacity: 0, scale: 0.55 },
            { opacity: 1, scale: 1.15, duration: 0.55, ease: 'power2.out' }, u.delay)
            .to(u.halo, { opacity: 0, scale: 1.5, duration: 1.2, ease: 'power2.in' }, u.delay + 0.6)
          tl.fromTo(u.inner,
            { autoAlpha: 0, scale: 1.07, filter: 'blur(30px) brightness(1.5)' },
            { autoAlpha: 1, scale: 1, filter: 'blur(0px) brightness(1)',
              duration: 1.5, ease: 'power2.out' }, u.delay + 0.15)
          tl.fromTo(sh, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, u.delay + 0.85)
        }
        /* En el teléfono este bucle no hace nada: no hay entrada. */
      })
      /* En el teléfono el fondo vivo se suelta pasado el momento
         crítico —cortina levantándose y titular entrando letra a
         letra—, no antes. */
      if (!conBlur) tl.call(soltarAurora, null, 1.4)
      entered = true
      return tl
    }

    /* Red de seguridad. Al arrancar invisibles, los teléfonos dependen
       de que la secuencia del hero llegue a construirse — y esa espera
       a document.fonts.ready. Si esa promesa no resuelve (una fuente
       que nunca llega, una pestaña en segundo plano), el hero se
       quedaría sin su elemento principal para siempre. Antes esto no
       podía pasar: los teléfonos se veían desde el primer momento.
       A los 5 s se destapan sin animación y ya. */
    setTimeout(function () {
      if (entered) return
      units.forEach(function (u) {
        gsap.set(u.inner, { autoAlpha: 1, y: 0, rotation: 0, scale: 1,
                            filter: 'none' })
        var sh = u.float.querySelector('.ph-shadow')
        if (sh) gsap.set(sh, { autoAlpha: 1, scaleX: 1 })
      })
      soltarAurora()      // si la entrada nunca corrió, el fondo no se queda congelado
    }, 5000)

    /* ── LA SALIDA: se despiden mientras el hero sube ─────────────
       Sin anclar: la página nunca se detiene. Los sellos que faltan se
       completan durante ese recorrido y cada tarjeta que llega a su
       meta suelta un puñado de chispas.
       El alejamiento va sobre .ph-stage —el contenedor— y no sobre los
       teléfonos: sus tres capas ya están ocupadas por la entrada, la
       flotación y el cursor. */
    var toneColor = { 'ph-a': '#F8CDA3', 'ph-b': '#7E9BF2' }
    var hasDraw = typeof DrawSVGPlugin !== 'undefined'
    var bounce = (typeof CustomBounce !== 'undefined') ? 'selloIn' : 'back.out(2.4)'

    var out = gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.55,
        /* Las chispas se materializan al empezar a salir del hero, no
           antes. Se enciende y no se apaga: para cuando esto ocurre la
           entrada ya terminó y volver a quitarlas no ahorra nada. */
        onUpdate: function (self) {
          if (self.progress > 0.02) stage.classList.add('chispas')
        }
      }
    })

    units.forEach(function (u) {
      var key = u.sel.slice(1)
      var color = toneColor[key]
      var pending = u.float.querySelectorAll('.ph-stamp.off')
      var countN = u.float.querySelector('.ph-count b')
      var done0 = u.float.querySelectorAll('.ph-stamp.on').length
      var marks = u.float.querySelectorAll('.ph-stamp.off polyline')
      if (hasDraw) gsap.set(marks, { drawSVG: '0%' })
      else gsap.set(marks, { autoAlpha: 0 })

      /* Se reparten en el primer 65% del recorrido para que el último
         sello caiga con el hero todavía a la vista. */
      var span = 0.65 / Math.max(pending.length, 1)
      pending.forEach(function (st, i) {
        var at = 0.05 + i * span
        out.to(st, { backgroundColor: color, borderColor: color, duration: span * 0.5 }, at)
          .fromTo(st, { scale: 0.5 }, { scale: 1, duration: span * 0.9, ease: bounce }, at)
        var mark = st.querySelector('polyline')
        if (hasDraw) out.to(mark, { drawSVG: '100%', duration: span * 0.6 }, at + span * 0.15)
        else out.to(mark, { autoAlpha: 1, duration: span * 0.4 }, at + span * 0.15)
        out.set(countN, { textContent: done0 + i + 1 }, at + span * 0.2)
      })

      /* Chispas al completar la tarjeta */
      var burst = u.float.querySelector('.ph-burst')
      var sparks = []
      for (var s = 0; s < 16; s++) {
        var el = document.createElement('span')
        el.className = 'ph-spark'
        el.style.background = color
        burst.appendChild(el)
        sparks.push(el)
      }
      var tBurst = 0.05 + pending.length * span
      sparks.forEach(function (sp, i) {
        var ang = (i / sparks.length) * Math.PI * 2
        var dist = 70 + (i % 4) * 34
        out.fromTo(sp,
          { x: 0, y: 0, scale: 0.5, autoAlpha: 1 },
          { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 26,
            scale: 0, autoAlpha: 0, duration: 0.26, ease: 'power2.out' },
          tBurst + (i % 3) * 0.012)
      })
    })

    /* El conjunto se aleja al final, ya con las tarjetas completas */
    out.to(stage, { y: -70, scale: 0.9, rotationZ: -3, autoAlpha: 0.5,
                    duration: 0.28, ease: 'power2.in' }, 0.74)
  }
  var phonesEnter = null
  buildPhones()
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

    /* LA CORTINA DURA MENOS EN EL TELÉFONO. Medido: la página no se veía
       hasta los 2.115 ms, y en el teléfono eso es la mitad de la
       sensación de lentitud al abrir — no había nada que mirar.
       En escritorio la cortina se gana su tiempo: tapa mientras se
       cargan las siete tipografías y se construye la materialización de
       los dos aparatos. En el teléfono ya no hay materialización que
       tapar, así que la ceremonia sobra: contador más corto y
       levantada más rápida dejan la página a la vista sobre los
       1.200 ms. En escritorio no se toca nada, que ahí ya gusta. */
    var corto = !window.matchMedia('(min-width: 921px)').matches
    var dCuenta = quick ? 0.45 : (corto ? 0.62 : 1.05)
    var dSube    = corto ? 0.55 : 0.85

    var counter = { v: 0 }
    var tl = gsap.timeline({
      onComplete: function () { el.remove(); lenis.start() }
    })
    tl.to(counter, {
      v: 100,
      duration: dCuenta,
      ease: 'power2.inOut',
      onUpdate: function () { num.textContent = Math.round(counter.v) }
    })
      .to(num, { autoAlpha: 0, y: -40, duration: 0.28, ease: 'power2.in' },
          Math.max(dCuenta - 0.13, 0.2))
      .add('lift')
      .add(function () { el.classList.add('lifting') }, 'lift')
      .to(el, { yPercent: -100, duration: dSube, ease: 'expo.inOut' }, 'lift')
      .add(function () { playHero() }, 'lift+=' + (corto ? 0.18 : 0.3))
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

  /* ── EL FONDO CEDE EL PASO A LA ENTRADA ──────────────────────────
     Medido con el trazado del navegador, en la ventana de la entrada
     del hero (CPU frenada a 6×): quitar los campos de aurora baja el
     trabajo del hilo principal de 2.475 ms a 1.632 ms, un 34%, y el
     recálculo de estilos y el armado de capas caen en la misma
     proporción. Dieciocho manchas con cuatro animaciones infinitas cada
     una son setenta y dos tweens compitiendo justo cuando los teléfonos
     tienen que volar.
     En el teléfono, entonces, el fondo se queda quieto —VISIBLE, que es
     lo que aporta: el color de la página son estas manchas— hasta que
     los aparatos aterrizan. Y una vez suelto, la mancha ya no cambia de
     escala: escalar una forma con 100 px de desenfoque obliga a
     redibujarla en cada cuadro. Se mueve y respira con opacidad, que no
     cuesta nada. En escritorio no cambia nada. */
  var ESMOVIL = !window.matchMedia('(min-width: 921px)').matches
  var auroraSuelta = !ESMOVIL
  var auroraFrenos = []
  function soltarAurora () {
    if (auroraSuelta) return
    auroraSuelta = true
    auroraFrenos.forEach(function (f) { f() })
  }

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
            de la órbita para que nunca coincidan los dos ciclos.
            Solo en escritorio: es la única animación de las cuatro que
            cambia el TAMAÑO de una mancha desenfocada, y eso obliga a
            rasterizar el desenfoque otra vez en cada cuadro. */
      if (!ESMOVIL) {
        tweens.push(gsap.to(blob, {
          scale: 'random(0.5, 1.75)',
          duration: 'random(7, 13)', ease: 'sine.inOut',
          repeat: -1, yoyo: true, repeatRefresh: true
        }))
      }
      tweens.push(gsap.to(blob, {
        opacity: 'random(0.58, 1)',
        duration: 'random(9, 16)', ease: 'sine.inOut',
        repeat: -1, yoyo: true, repeatRefresh: true
      }))
    })

    /* Un fondo que no se ve no merece frames. onRefresh además del
       toggle: si solo se escuchara el toggle, un campo que arranca
       fuera de pantalla podría quedarse pausado para siempre. */
    var enPantalla = false
    function setRunning (on) {
      var v = on && auroraSuelta
      tweens.forEach(function (t) { v ? t.play() : t.pause() })
    }
    ScrollTrigger.create({
      trigger: host, start: 'top bottom', end: 'bottom top',
      onToggle:  function (self) { enPantalla = self.isActive; setRunning(enPantalla) },
      onRefresh: function (self) { enPantalla = self.isActive; setRunning(enPantalla) }
    })
    /* Cuando se levante el freno, cada campo retoma solo si le tocaba. */
    auroraFrenos.push(function () { setRunning(enPantalla) })
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

  /* ══════════════════════════════════════════════════════════════
     Enlaces del menú hacia secciones ancladas
     Una sección anclada con scrub reparte su contenido a lo largo de
     un tramo de scroll: al principio del tramo está vacía. Un enlace
     normal deja al visitante justo ahí —vio el titular y nada más, y
     tiene que ponerse a hacer scroll para que aparezca lo que venía a
     leer—. Aquí el enlace apunta al final del tramo, donde la sección
     ya está completa. Sigue pudiendo subir para ver cómo se arma.
     ══════════════════════════════════════════════════════════════ */
  function anchorsToPinned () {
    /* Devuelve el anclaje VIVO de una sección. Si gsap.matchMedia
       reconstruye la sección al cruzar los 920px, el bueno es el ÚLTIMO
       creado — el de mayor recorrido sería un criterio arbitrario que
       podría quedarse con uno viejo. */
    function pinDe (target) {
      var vivos = ScrollTrigger.getAll().filter(function (t) {
        return t.pin && t.trigger === target && t.end > t.start
      })
      return vivos.length ? vivos[vivos.length - 1] : null
    }

    var nav = document.getElementById('nav')

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null
      if (!a) return
      var href = a.getAttribute('href')
      var target = href.length > 1 ? document.getElementById(href.slice(1)) : null

      /* Se corta la propagación además de prevenir el salto: así ningún
         otro manejador de anclas puede volver a mover la página después
         de nosotros. */
      e.preventDefault()
      e.stopPropagation()

      if (!target) { lenis.scrollTo(0, { duration: 1.1 }); return }

      var st = pinDe(target)
      if (st) {
        /* Una sección anclada reparte su contenido por un tramo de
           scroll: en su borde está vacía. Se aterriza casi al final del
           tramo, ya montada. 0.97 y no 1 porque en el final exacto el
           anclaje se suelta y la sección arranca hacia arriba. */
        lenis.scrollTo(st.start + (st.end - st.start) * 0.97, { duration: 1.2 })
      } else {
        lenis.scrollTo(target, {
          duration: 1.1,
          offset: nav ? -nav.offsetHeight : 0   // que el nav fijo no tape el titular
        })
      }
    }, true)   // fase de captura: antes que cualquier otro manejador
  }
  anchorsToPinned()

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
