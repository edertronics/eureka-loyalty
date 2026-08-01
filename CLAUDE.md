@AGENTS.md

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->

---

## Proyecto: Easy Loyalty

Plataforma de lealtad digital multi-tenant. Negocios se registran, obtienen un slug propio y sus clientes acumulan sellos sin app.

**Dominio producción:** `easyloyalty.io` (landing) | `app.easyloyalty.io` (app)
**Vercel team:** `edertronics-projects` | **Project real:** `eureka-loyalty` (ignorar `loyalty-app`)
**Supabase:** `udcvtwjumcunbgcqnvpn.supabase.co`

## Arquitectura de dominios
- `easyloyalty.io` → rewrite en middleware a `public/landing-page.html`
- `app.easyloyalty.io` → la app Next.js (registro, tarjetas, admin, scanner)
- Editar siempre `public/landing-page.html` para cambios del sitio público
- Nunca decirle al usuario que navegue a `/landing-page.html` — la URL es `easyloyalty.io`

---

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Home — acceso admin por slug + CTA registro |
| `/registro` | Onboarding 3 pasos para nuevos negocios |
| `/[slug]` | Tarjeta del cliente (branded por negocio) |
| `/[slug]/admin` | Dashboard del negocio (stats, clientes, config) |
| `/[slug]/scanner` | Scanner QR para staff (requiere PIN) |
| `/super-admin` | Panel maestro — todos los negocios |
| `/pitch` | Presentación/pitch de Easy Loyalty |

## Archivos públicos imprimibles

| Archivo | Descripción |
|---|---|
| `public/mariabonita-qr.html` | Tarjeta imprimible María Bonita (2 programas) |
| `public/landing-page.html` | Landing page de Easy Loyalty (ver sección abajo) |

*(2026-07-31: se borraron `eureka-qr.html` y `eureka-manual.html`. Llevaban meses marcados como obsoletos pero seguían sirviéndose públicamente, y el manual decía "9 sellos" cuando la meta real de Eureka es 6 — información equivocada de un cliente vivo, accesible desde internet. Están en el historial de git si hicieran falta.)*

**Manual y QR reales de Eureka Burgers no viven en `public/`** — son documentos generados aparte (Chrome headless → PDF) y entregados directo al cliente:
- Fuente editable del manual: `eureka-burgers-loyalty/manual-fuente-html/manual_final.html` (fuera del repo de código, en la carpeta del proyecto)
- PDFs finales (manual, accesos, QR): `eureka-burgers-loyalty/*.pdf` y copia en `~/Downloads`
- Detalle completo en la memoria `eureka-burgers` (fuera de este repo)

---

## Negocios activos en Supabase

| Negocio | Slug | Sellos | Premio | Estado |
|---|---|---|---|---|
| Eureka Burgers | `eureka-burgers` | 6 | Hamburguesa sencilla o malteada (a elegir) | Activo |
| María Bonita Uñitas | `mariabonita-unas` | 6 | Próximo servicio gratis | Activo |
| María Bonita Cafecito | `mariabonita-cafe` | 8 | Próximo café gratis | Activo |
| cafe-ricolino | `cafe-ricolino` | — | — | Prueba (sin email) |
| cafe-nuevo | `cafe-nuevo` | — | — | Prueba (sin email) |

**Meta de sellos de Eureka Burgers bajó de 10 a 6 el 2026-07-24** (pedido del cliente). Solo fue un `UPDATE` de `stamp_goal` en Supabase — se lee en vivo en toda la app (stamp, redeem, wallets, dashboard), no hay hardcodes. La vigencia de 30 días de premios pendientes no cambió. Al momento del cambio el negocio tenía 0 clientes registrados, así que no hubo caso de retroactividad que resolver. También se actualizó el texto y la captura de pantalla del manual real (`eureka-burgers-loyalty/manual-fuente-html/manual_final.html`, PDF regenerado con Chrome headless) de 10→6 sellos. El póster QR impreso ("Eureka Burgers - QR para imprimir.pdf") se eliminó del proyecto y de `~/Downloads` — Eureka Burgers ya tiene su propia área de Diseño y hará su propio póster; el QR en sí (que apunta a `easyloyalty.io/eureka-burgers`) no cambió.

---

## Apple Wallet
- **Pass Type ID:** `pass.com.easyloyalty.loyalty`
- **Team ID:** `YPD8C8783D`
- Certificados en Vercel como env vars: `APPLE_CERTIFICATE_PEM`, `APPLE_KEY_PEM`, `APPLE_WWDR_PEM`
- Push updates via APNs al dar sello (`src/lib/apns.ts`)

## Google Wallet (Android)
- **API aprobada:** 2026-05-11 (correo de Google Wallet Support Team)
- **Merchant ID (consola):** `BCR2DN5T435IRLLM`
- **Issuer ID (API):** `3388000000023114743`
- **Clase por negocio:** `ISSUER_ID.loyalty_{slug_con_guiones_bajos}` — se crea automáticamente al primer uso de cada negocio
- **Service account:** `easy-loyalty-wallet@easy-loyalty-493322.iam.gserviceaccount.com`
- **Proyecto GCP:** `easy-loyalty-493322`
- Credenciales en Vercel como env var: `GOOGLE_SERVICE_ACCOUNT_JSON` (JSON completo en una línea)
- Flujo: POST `/api/business/[slug]/wallet/google` → crea/actualiza clase + objeto → retorna JWT URL
- Clase lleva: `programName` (nombre negocio), `programLogo` (logo_url), `hexBackgroundColor` (primary_color), `heroImage` (strip_image_url)
- Lifecycle: 404 → crear con UNDER_REVIEW; draft → PUT UNDER_REVIEW; activa → PATCH para sincronizar branding
- **NUNCA usar la clase global legacy** `3388000000023114743.easyloyalty_loyalty_class` — ya no se usa
- **PROBADO en Android físico el 2026-07-19** — funciona, sin letrero de "Solo pruebas". El QR del objeto lleva el `qr_code` del cliente, así que el scanner lo lee igual que Apple.
- **Actualización del pase al dar sello/canjear:** `src/lib/googleWallet.ts` → `updateGoogleWalletPass()` hace PATCH del objeto (contador + texto de premio dinámico). Conectado en `stamp/route.ts` y `redeem/route.ts`. Antes el pase de Google se quedaba congelado. Nunca rompe el flujo si Google falla.
- **Banner reencuadrado solo para eureka-burgers:** `strip-google.png` en Storage (sujetos centrados, proporción ~3:1) porque las esquinas redondeadas de la plantilla de Google cortaban el logo. Ver `heroUrl` en `wallet/google/route.ts`.
- **Limitaciones fijas de la plantilla de Google** (NO se pueden cambiar): logo del emisor chico arriba, tamaño de letra no configurable, el nombre del cliente no se muestra al frente (sí va en `accountName` dentro del pase). Apple sí permite diseño libre.

## Email (Resend)
- **Proveedor:** Resend (`resend` npm package)
- **From:** `Easy Loyalty <noreply@easyloyalty.io>`
- **API Key:** env var `RESEND_API_KEY` (en Vercel: eureka-loyalty)
- **Dominio verificado:** `easyloyalty.io` — verificado en Resend el 2026-06-06. Emails funcionan en producción.
- **Módulo:** `src/lib/email.ts` — todas las funciones lanzan error si Resend rechaza (fix 2026-05-15)
- **`CARD_URL` vs `APP_URL` (fix 2026-07-24):** el botón "Ver mi tarjeta" en los 5 correos usaba `APP_URL` (= `NEXT_PUBLIC_APP_URL`, que en producción es `app.easyloyalty.io`), y ese subdominio redirige `/{slug}` a `/{slug}/admin` — el cliente terminaba en el login del negocio. Vivió así desde el 2026-05-12 (creación del archivo), afectando a todos los negocios con clientes reales. Se separó `CARD_URL` (fuerza dominio raíz `easyloyalty.io` salvo en local dev) de `APP_URL` (que sigue siendo correcto para `adminUrl`/`scannerUrl` en `sendOnboardingEmail`). Mismo bug y mismo fix en el generador de QR/póster de `src/app/registro/page.tsx` (el QR descargable para negocios nuevos apuntaba a `app.easyloyalty.io/{slug}`); no afectó a ningún negocio real porque María Bonita y Eureka Burgers usan pósters hechos aparte.
- **Emails implementados:**
  - `sendWelcomeEmail` — bienvenida al cliente al registrarse (si da email)
  - `sendRewardEmail` — premio ganado al completar la tarjeta
  - `sendOnboardingEmail` — links del programa al dueño del negocio tras registrarse
  - `sendRewardReminderEmail` — recordatorio a los 14 días de ganar un premio pendiente (todos los negocios, vía cron)
  - `sendRewardExpiringEmail` — aviso urgente en la última semana antes de que caduque un premio pendiente (todos los negocios, vía cron)

## Modelo de negocio (decisiones tomadas)
- **Trial:** 3 meses gratis
- **Precios publicados en la landing (2026-07-31):** $35 / $79 / $199 USD
  al mes. Se fijaron por debajo de loyalzclub.com ($39/$89/$249). Son una
  propuesta del equipo, no una decisión validada contra márgenes.
- **Cobro:** Stripe — **NO EXISTE NINGUNA LÍNEA DE CÓDIGO todavía.** No hay
  SDK, ni ruta de checkout, ni estado de suscripción en `businesses`, ni
  webhooks. La landing ya anuncia precios y trial: ese hueco es la ruta
  crítica del producto.
- **Restricción que impone la landing:** promete "3 meses gratis, sin
  tarjeta de crédito". Eso descarta el trial nativo de Stripe con tarjeta
  por adelantado y obliga a un diseño distinto (cobrar al final del trial
  pidiendo el método de pago entonces).
- **Flujo onboarding ideal:** Registro → Visual Card Builder → Pósters/QR → Dashboard (después: Stripe)

## Onboarding (registro/page.tsx) — 3 pasos
- **Paso 1:** Nombre + slug + slogan + **email** (requerido) + contraseña de admin
- **Paso 2:** Personalización visual — colores (swatches + hex + picker), logo, banner, sellos, premio, preview en tiempo real
- **Paso 3:** Material de marketing — 3 formatos de póster en un PDF (3 páginas tamaño carta, sin márgenes):
  - **Carta completa** (8.5"×11"): barra accent top, logo, QR 220px centrado, barra primary bottom "Powered by Easy Loyalty"
  - **Media carta** (5.5"×8.5" centrada en carta): guía de corte punteada, QR 160px
  - **Tent card**: hoja carta doblada horizontalmente — frente y reverso con mismo diseño landscape (QR izquierda, info derecha), línea "doblar aquí ✂"
  - También: QR PNG 1024px descargable, QR SVG vectorial descargable
- **Pantalla de éxito:** Links copiables + confirmación de email + PDF de links
- Los colores tienen: swatches rápidos + `<input type="color">` (picker nativo) + campo hex (#rrggbb)

## Tarjeta del cliente ([slug]/page.tsx)
- **Nombre, WhatsApp y correo son obligatorios los 3** (cambió el 2026-07-14 — antes solo nombre era obligatorio)
- Deduplicación por email: si ya existe → `already_exists: true` en respuesta
- **UX returning customer**: cuando `already_exists=true` → "¡Hola de nuevo, {nombre}! Ya tienes tarjeta — aquí está tu QR" (distinto al flujo nuevo registro)
- Botón de envío requiere los 3 campos + email con formato válido (`canSubmit`)

## Páginas eliminadas (zombis legacy — hardcodeadas a Eureka Burgers)
- ~~`src/app/register/page.tsx`~~ — hardcodeada a slug `eureka-burgers`
- ~~`src/app/scanner/page.tsx`~~ — sin PIN de staff, colores hardcodeados Eureka
- ~~`src/app/admin/page.tsx`~~ — usaba env `ADMIN_PASSWORD` global
- ~~`src/app/api/admin/login/route.ts`~~ — creaba cookie global
- ~~`src/app/api/admin/stats/route.ts`~~ — hardcodeada a `businessSlug = 'eureka-burgers'`

*(Nota 2026-07-24: esta sección decía "eliminadas" desde antes, pero los 5 archivos seguían vivos en el repo y `/register` era accesible en producción con datos de sellos desactualizados. Se detectó al auditar el cambio de meta de sellos y se borraron de verdad — build de producción verificado sin ellas.)*

## Lógica de sellos
- Cooldown de **4 horas** por cliente (anti-fraude, automático)
- Al completar la meta → `stamps` vuelve a 0 (siempre, todos los negocios)
- `rewards_redeemed` NO se incrementa al completar la meta — se guarda como premio pendiente y se incrementa hasta que se canjea (ver abajo)

## Premios pendientes con vigencia (todos los negocios, universal desde 2026-07-24)
Nació como mecánica especial de Eureka Burgers (2026-07-18): el premio ganado no se canjea automático, se guarda como "disponible" hasta 1 mes, y pueden acumularse varios en paralelo. El 2026-07-24 se quitó el scoping `slug === 'eureka-burgers'` de los 5 archivos que lo tenían (stamp, scanner, admin dashboard, Apple Wallet, Google Wallet) y ahora aplica a **todo negocio nuevo o existente** — no hay forma de volver al canje automático inmediato, se retiró esa ruta de código por completo.
- **Tabla:** `pending_rewards` (RLS habilitado, solo accesible con `SUPABASE_SERVICE_ROLE_KEY`) — columnas: `customer_id`, `business_id`, `status` (`available`/`redeemed`/`expired`), `earned_at`, `expires_at` (+30 días de `earned_at`), `redeemed_at`, `staff_id`, `reminder_14d_sent_at`, `reminder_final_sent_at`
- **Ganar premio:** `src/app/api/stamp/route.ts` — al llegar a la meta, siempre inserta fila en `pending_rewards` (nunca incrementa `rewards_redeemed` directamente)
- **Canjear:** `POST /api/business/[slug]/redeem` — busca el disponible más próximo a vencer (FIFO), lo marca `redeemed`, ahí sí incrementa `rewards_redeemed` y loguea en `reward_events`. Ya era genérico desde el inicio, sin scoping.
- **Scanner:** selector "Dar sello" / "Canjear premio" visible en todos los negocios (`src/app/[slug]/scanner/page.tsx`)
- **Pase de Apple Wallet y Google Wallet:** campo de premio dinámico (`auxiliaryFields`/`textModulesData`) en todos los negocios — muestra cuántos premios disponibles tiene el cliente o cuántos sellos le faltan; Apple dispara aviso visible en pantalla de bloqueo vía `changeMessage: '%@'` cada vez que cambia
- **Cron diario** (`vercel.json`, `0 16 * * *` UTC) → `GET /api/cron/pending-rewards`: procesa TODOS los negocios — caduca los vencidos, manda `sendRewardReminderEmail` a los 14 días de ganado, manda `sendRewardExpiringEmail` en la última semana antes de caducar
- **Dashboard:** sección "Notificaciones — premios pendientes" visible en todos los negocios, con por-caducar-en-7-días, disponibles sin canjear, caducados histórico, y desglose por cliente

## Auth
- Admin del negocio: cookie `admin_auth_[slug]` (8h), contraseña en `businesses.admin_password`
- Scanner/staff: cookie `staff_auth_[slug]` (24h), misma contraseña
- Super admin: contraseña en env `SUPER_ADMIN_PASSWORD`
- Negocios legacy (sin `admin_password`): usan env `ADMIN_PASSWORD` como fallback
- **IMPORTANTE (fix 2026-07-19):** todo endpoint de admin (`update`, `upload-logo`, `upload-strip`, `stats`, `customers`, `customer/[id]`) DEBE validar `cookie.value === admin_password`, no solo que la cookie exista. Antes `update`/`upload-*` solo checaban existencia → cualquiera con una cookie inventada modificaba el negocio. Y `stats` nunca debe devolver `admin_password` en el JSON.

## Dashboard admin — notas (2026-07-19)
- **Lista de clientes:** búsqueda + paginación server-side vía `GET /api/business/[slug]/customers?search=&sort=activity|registered&page=` (páginas de 20). El front hace debounce de 350ms. Muestra "🎁 N por canjear" por cliente y el modal de detalle lista premios disponibles con días para caducar.
- **"Personalizar mi programa" oculto para eureka-burgers** (`slug !== 'eureka-burgers'`): editar ahí SÍ afecta tarjetas reales (meta de sellos y premio se leen en vivo; colores/logo se propagan en la siguiente actualización del pase). Escondido durante el piloto para que el staff no rompa nada. Código intacto, solo gated. **Pendiente: esconderlo también para María Bonita.**
- Botones que apuntan a la tarjeta pública deben usar el dominio raíz `https://easyloyalty.io/${slug}` — en `app.` el middleware redirige `/${slug}` a `/admin` (por eso "+ Registrar cliente" se arregló y "Ver tarjeta" se quitó).

---

## Comandos dev

```bash
npm run dev    # Desarrollo local (localhost:3000)
npm run build  # Build de producción
npm run lint   # ESLint
```

---

## Landing page (`public/landing-page.html`)

Un solo archivo: markup, todo el CSS en línea y el JS de apoyo. El
movimiento vive aparte en `public/landing-motion.js` (GSAP + Lenis).
Para cambios del sitio público **siempre se edita este archivo**, nunca
nada de `src/`.

**Sistema visual "Aurora"** (2026-07-31, a partir de una referencia
gráfica del usuario): tinta navy `#10214F`, azul eléctrico `#2B4BE0`
como único acento tipográfico, papel cálido `#F1F0EC`, y todo el color
concentrado en un degradado iridiscente. Tipografía por contraste de
peso: display black ultra-apretado / labels Light con tracking amplio /
micro-labels bold en azul.

- **Fondo vivo:** manchas desenfocadas orbitan en cinco secciones
  (`AURORA` en landing-motion.js). El blur es fijo y solo se animan
  transforms — animar el blur obliga a re-rasterizar cada frame.
  ScrollTrigger las pausa fuera de pantalla. El radio de órbita es el
  parámetro que decide si el efecto se percibe: por debajo de ~15vw el
  movimiento es invisible.
- **Logotipo:** el isotipo va SIEMPRE a la izquierda del wordmark, a la
  altura de mayúscula real de HK Grotesk (`.697em`). Se pinta con
  máscara CSS sobre `currentColor` desde `img/logo-mark-tight.png`, no
  como `<img>`, para tomar el color de cada contexto.
- **Los pesos del wordmark no se eligen a ojo.** "Easy" va en Regular
  (400) y "Loyalty" en Bold (700), ambos con `letter-spacing:-0.03em`.
  No es criterio: está medido contra `public/img/logo.png`, el archivo
  original de la marca, comparando letra a letra a igual altura de
  mayúscula (IoU 0.88 y 0.91; el ancho de tinta de "Loyalty" cae a 3 px
  de los 1515 del original). Hasta 2026-07-31 decía 900 / -0.05em, dos
  pesos más pesado que la marca, y el usuario —diseñador— lo detectó a
  simple vista. Si hay que retocarlo, se vuelve a medir contra el PNG.
  `fitBigName()` espera esos dos pesos con `document.fonts.load` antes
  de medir la banda: si se cambian aquí, hay que cambiarlos allá.
- **Recortes de tinta:** los envoltorios de barrido usan `clip-path`
  con insets negativos, no `overflow:hidden`. Con `line-height:.98` la
  caja de línea queda más baja que la tinta y cortaba descendentes. Y
  las máscaras de SplitText se revierten al terminar la animación, si
  no recortan la "o" y la "y" para siempre.

**Los dos teléfonos del hero** (2026-07-31) son el número principal de
la página y están construidos íntegramente en DOM: seis placas a
distinta Z para el canto metálico, silueta squircle calculada en JS
(una superelipse real — `border-radius` no sabe expresar curvatura
continua), isla dinámica, barra de estado y un pase de lealtad vivo por
pantalla, personalizado por negocio.

- **Tres capas de transform por aparato, una por tipo de movimiento:**
  `.ph-float` (flotación en reposo, parallax del mouse, giro base),
  `.ph-in` (la entrada) y `.ph` (inclinación que sigue al cursor). No se
  mezclan: GSAP no puede animar la misma propiedad desde dos sitios.
- **La entrada cambia según la máquina, por rendimiento:** escritorio
  recibe la "materialización" (halo de luz, desenfoque → nítido) y móvil
  una llegada en 2D. Animar `filter: blur()` obliga a re-rasterizar el
  teléfono entero en cada cuadro y en un celular deja la página pasmada
  varios segundos. Se decide una vez al construir con `matchMedia`, no
  con un contexto de `gsap.matchMedia`, porque el efecto no debe cambiar
  a media entrada.
- **EN EL TELÉFONO NO HAY ENTRADA: los aparatos ya están ahí**, flotando,
  desde el primer pintado. Es una decisión del usuario tras tres
  intentos fallidos de abaratarla, todos medidos: viaje desde el fondo
  con `z:-2700` girando en X/Y; lo mismo en 2D con escala y giro en el
  plano (-31% de `RasterTask`); y solo `y` + opacidad en 0,8 s. Las tres
  se seguían trabando en un iPhone real, porque el hero móvil pide en el
  mismo segundo y medio dos teléfonos de ~40 elementos bajo un contexto
  3D, 18 manchas de media pantalla, el titular partido en letras y una
  cortina de pantalla completa. Sin entrada, `Layerize` en esa ventana
  cae de ~400 a ~186 ms y no queda nada que pueda dar tirones. **No
  reintroducir una entrada en móvil sin medirla en un teléfono real.**
  La flotación en reposo sí se queda: es un translate 2D sobre dos
  elementos. El barrido especular periódico solo corre en escritorio.
- **Lo que de verdad pesa en el hero móvil no son los teléfonos.**
  Medido en la ventana de entrada con la CPU frenada a 6×: quitar los
  teléfonos enteros baja el hilo principal a 1.969 ms; quitar los
  campos de aurora, a 1.650. Las manchas cuestan el doble que los
  aparatos, y no por animarse —eso ya está pausado hasta que aterrizan—
  sino por existir: son 18 capas de casi media pantalla. **El radio del
  desenfoque no influye** (22/38/58 px dan lo mismo, ya se probó). La
  única palanca que queda ahí es reducir el NÚMERO de manchas, que es
  decisión de diseño.
- **Arrancan invisibles**, así que dependen de que la secuencia del hero
  llegue a construirse (espera a `document.fonts.ready`). Hay una red de
  seguridad a los 5 s que los destapa sin animación.
- Plugins en `public/vendor/` a 3.15.0: DrawSVG, CustomEase,
  CustomBounce. Todos gratis desde que Webflow compró GreenSock (abril
  2025) — sin membresía ni token. **El repo ya trae ocho skills de GSAP
  en `.claude/skills/`**: no correr `npx skills add` para ellas, sustituye
  el archivo rastreado por un symlink y duplica el árbol en `.agents/`.

**La cortina del preloader dura menos en el teléfono** (0,62 s de
contador + 0,55 s de subida frente a 1,05 + 0,85). Medido, la página
pasa de verse a los 2.122 ms a verse a los 1.386. En escritorio la
cortina se gana su tiempo —tapa la carga de las siete tipografías y el
armado de la materialización—; en móvil ya no hay materialización que
tapar, así que la ceremonia sobraba. **En escritorio no se toca: el
usuario dijo explícitamente que así le gusta.**

**`document.fonts.ready` va con carrera contra 1,5 s.** Espera a las
siete variantes (435 KB) cuando al titular le basta la suya, y si una
sola no llega nunca la promesa no resuelve y el hero no se construye
jamás. Un titular con la tipografía de reserva un instante es mucho
menos grave que un hero que no aparece.

**El video del cierre — la regla de Safari y tres intentos fallidos.**
`escena-cafe.mp4` pesaba **3 MB para 5,5 s a 540p** (4.586 kbps, seis
veces lo razonable) y traía una pista de audio que nunca suena. Ahora
pesa **747 KB y no tiene audio** — re-codificado a 1.100 kbps con
AVAssetWriter desde Swift, porque `avconvert` solo tiene presets y los
suyos o no re-codifican o bajan a 480×272. El script quedó en el
scratchpad de la sesión; la diferencia de imagen contra el original es
del 1% (2,47/255 de media). **Un vídeo sin pista de audio no está sujeto
a la política de autoarranque de iOS**, que era media batalla.

La lógica se rompió tres veces, y las tres por adivinar en vez de mirar:
1. esperaba `canplay` — evento de flanco que ya había ocurrido durante
   el precalentado y no se repetía;
2. preguntaba por `paused`, que en iOS pasa a `false` en cuanto se pide
   reproducir aunque el clip se quede sin datos;
3. le puso `autoplay` al elemento y lo reproducía fuera de pantalla.
   **Safari en iOS no arranca vídeos que no se ven, y cuando bloquea un
   `autoplay` dibuja encima su propio botón de play** — que es el botón
   que el usuario reportó. Nunca poner `autoplay` en este elemento.

**La regla que lo resuelve todo: WebKit deja autoarrancar sin permiso a
un vídeo CUYO ARCHIVO NO TIENE PISTA DE AUDIO, y lo hace cuando el
elemento está en pantalla.** O sea que "que empiece solo al llegar
bajando" es el comportamiento nativo, gratis — lo que fallaba era el JS
estorbando. Estructura final, tres momentos y ninguno adivina:
- **lejos** → nada, ni un byte (`preload="none"`, `src` en el marcado);
- **cerca** (IntersectionObserver a `200%`) → `preload = 'auto'`, que
  descarga sin reproducir y sin despertar ninguna política;
- **en pantalla** (otro observer a `0px`) → se pone `autoplay` y se pide
  reproducir, ya con el elemento donde Safari lo acepta.
Más un vigilante cada 600 ms, activo solo mientras la banda se ve, que
comprueba **si `currentTime` avanza** y vuelve a pedirlo si no.
Verificado bajando la página poco a poco: a 1.400 px empieza a
descargar, a 770 px ya está corriendo, y al llegar va por el segundo 1,5
en bucle.
**NUNCA poner `autoplay` en el marcado**: evaluado con la banda a diez
pantallas, Safari lo da por bloqueado y dibuja encima su propio botón de
play — que es lo que el usuario tuvo que tocar.

**El aire entre secciones se reduce a 64 px en el teléfono** (los 120 px
de escritorio son 240 px de vacío en cada frontera sobre una pantalla de
844 px). La regla vive **al final de la hoja de estilos** a propósito:
puesta con el resto de reglas móviles, `.scenes` y `.faq` la ignoraban
porque declaran su padding más abajo, en el bloque Aurora, y a igual
especificidad gana la última. Documento móvil: 12.883 → 12.107 px.

**La banda de escenas se empuja con la mano** (2026-07-31). Sigue siendo
el mismo marcado de siempre —dos copias idénticas de las cinco escenas y
un salto invisible en la mitad— pero el bucle ya no es `@keyframes` sino
un rAF en el script en línea de landing-page.html: una animación de CSS
no se puede posicionar a mano a mitad de camino. Se agarra con ratón o
dedo, y al soltar el impulso decae hasta la velocidad de crucero (una
copia cada 34 s, la de antes). Dos detalles que no se pueden quitar:
`touch-action:pan-y` en `.scene-marquee`, sin el cual o se pierde el
arrastre horizontal o se pierde el scroll vertical de la página; y que
`track.style.animation='none'` se ejecuta **al final** del bloque, para
que si algo fallara la banda siguiera girando con CSS. Con movimiento
reducido no se monta nada: ahí ya es un carrusel de scroll nativo.

**Anclas del menú:** las gobierna `anchorsToPinned()` en
landing-motion.js, y Lenis va **sin** `anchors: true` — los dos
manejadores respondían al mismo clic y ganaba el de Lenis. Una sección
anclada con scrub está vacía en su borde, así que el enlace aterriza al
97% del tramo, ya montada. El logotipo del nav apunta a `#`, no a `/`:
siendo una sola página el inicio es el principio del scroll, y con `/`
un visor incrustado se cae a una página en blanco.

**Rendimiento — causas reales encontradas y corregidas:** el cursor
personalizado se movía con `left`/`top` (layout en cada evento del
ratón), el chequeo de sección oscura medía cuatro `getBoundingClientRect`
por evento, y `.el-grain` era una capa de nueve pantallas con
`mix-blend-mode`. Ver la nota de rendimiento en memoria antes de tocar
bucles de puntero o capas de fusión.

**Ningún manejador de `mousemove` puede medir el layout.** Es la causa
que más veces ha reaparecido en esta página, y siempre se siente igual:
"el cursor va torpe". Un trackpad entrega más de cien eventos por
segundo y GSAP escribe estilos en cada cuadro, así que cada
`getBoundingClientRect` dentro de un `mousemove` fuerza un recálculo
sincrónico. En 2026-07-31 se midieron **4,1 lecturas forzadas por
movimiento** y se dejaron en 0,01, en tres sitios:
1. el parallax de los teléfonos medía el hero en cada evento → ahora la
   caja se guarda y solo se re-mide en `resize`/`scroll`, y el trabajo
   se agrupa en un `requestAnimationFrame`;
2. `checkDark()` medía las cuatro secciones oscuras cada vez → ahora se
   cachean por posición de scroll (mover el ratón no las mueve);
3. **el efecto de agua del isotipo del hero seguía vivo aunque el
   isotipo esté oculto** desde que los teléfonos ocupan ese sitio: un
   rAF perpetuo escribiendo atributos de un filtro SVG y un `mousemove`
   sobre el hero midiendo. Se apaga con una comprobación en
   `DOMContentLoaded` —no antes, porque quien lo oculta es
   landing-motion.js, que va con `defer`—. **Ese bloque y su `<svg>` de
   filtro son código muerto y se pueden borrar enteros.**
Si vuelve la queja del cursor, lo primero es contar lecturas forzadas
envolviendo `Element.prototype.getBoundingClientRect`.

**Precios publicados:** $35 / $79 / $199 USD al mes, más 3 meses gratis
sin pedir tarjeta. Se fijaron por debajo de loyalzclub.com ($39/$89/$249)
cruzando barreras psicológicas. ⚠️ **La página ya los anuncia pero no
existe ningún sistema de cobro** — ver "Modelo de negocio".

**Reglas de contenido que no se rompen:**
- Nada de testimonios ni cifras que no se puedan respaldar. En
  2026-07-31 se retiraron tres testimonios inventados atribuidos a
  personas con nombre (uno de ellos en Eureka Burgers, cliente real) y
  las métricas "+40% retención" y "2× más visitas".
- No se anuncian funciones que no estén en el código. Se quitaron "API
  pública" y "Automatizaciones con IA" del plan alto por no existir.
- El push es **solo transaccional** (al sellar, al canjear y los
  recordatorios del cron). No hay campañas ni segmentación: no se
  redacta como si las hubiera.
- Las fotos de las escenas son generadas con IA e ilustrativas. Los
  pies dicen el giro ("Cafetería", "Barbería"), nunca el nombre de un
  negocio real, para no aparentar que son fotos de un cliente.
- Falta un aviso de privacidad real: el enlace del pie sigue muerto.
- Las marcas de Apple y Google en la píldora del hero son **dibujos
  propios aproximados**, no el arte oficial. Apple (badge "Add to Apple
  Wallet") y Google publican sus piezas con geometría, tamaños mínimos y
  espacio libre especificados. Sustituirlas antes de publicar.
