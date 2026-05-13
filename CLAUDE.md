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

**Dominio producción:** `easyloyalty.io`
**Vercel team:** `edertronics-projects` | **Project:** `loyalty-app`
**Supabase:** `udcvtwjumcunbgcqnvpn.supabase.co`

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
| `public/eureka-qr.html` | Tarjeta imprimible Eureka Burgers con QR |
| `public/eureka-manual.html` | Manual de uso para Eureka Burgers |
| `public/mariabonita-qr.html` | Tarjeta imprimible María Bonita (2 programas) |
| `public/landing-page.html` | Landing page de Easy Loyalty |

---

## Negocios activos en Supabase

| Negocio | Slug | Sellos | Premio |
|---|---|---|---|
| **Eureka Burgers** | `eureka-burgers` | 9 | ¡Tu burger es gratis! |
| María Bonita Uñitas | `mariabonita-unas` | 6 | Próximo servicio gratis |
| María Bonita Cafecito | `mariabonita-cafe` | 8 | Próximo café gratis |

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
- **Class ID:** `3388000000023114743.easyloyalty_loyalty_class` — estado: `approved`
- **Service account:** `easy-loyalty-wallet@easy-loyalty-493322.iam.gserviceaccount.com`
- **Proyecto GCP:** `easy-loyalty-493322`
- Credenciales en Vercel como env var: `GOOGLE_SERVICE_ACCOUNT_JSON` (JSON completo en una línea)
- Flujo: POST `/api/business/[slug]/wallet/google` → crea/actualiza objeto → retorna JWT URL
- La clase se auto-actualiza a `UNDER_REVIEW`/`approved` si está en `draft` al primer uso
- Debug endpoint: `/api/business/[slug]/wallet/google/debug`

## Email (Resend)
- **Proveedor:** Resend (`resend` npm package)
- **From:** `Easy Loyalty <noreply@easyloyalty.io>`
- **API Key:** env var `RESEND_API_KEY` (en Vercel: eureka-loyalty + loyalty-app)
- **Dominio verificado:** `easyloyalty.io` — DNS agregado en Namecheap 2026-05-12, verificación pendiente
- **Módulo:** `src/lib/email.ts`
- **Emails implementados:**
  - Bienvenida al registrarse (si el cliente da email)
  - Premio ganado al completar la tarjeta

## Lógica de sellos
- Cooldown de **4 horas** por cliente (anti-fraude, automático)
- Al completar la meta → `stamps` vuelve a 0, `rewards_redeemed` +1
- Se loguea en `stamp_events` y `reward_events`

## Auth
- Admin del negocio: cookie `admin_auth_[slug]` (8h), contraseña en `businesses.admin_password`
- Scanner/staff: cookie `staff_auth_[slug]` (24h), misma contraseña
- Super admin: contraseña en env `SUPER_ADMIN_PASSWORD`
- Negocios legacy (sin `admin_password`): usan env `ADMIN_PASSWORD` como fallback

---

## Comandos dev

```bash
npm run dev    # Desarrollo local (localhost:3000)
npm run build  # Build de producción
npm run lint   # ESLint
```
