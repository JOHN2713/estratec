# Estratec.org — Sitio web, CMS y CRM interno (Fase 1)

Implementación del `Estratec_Web_Brief_v2.md`: sitio comercial en español para Latinoamérica, formulario de solicitud de asesoría, WhatsApp contextual por servicio, panel `/admin` con CMS, CRM interno, plantillas, SEO/GEO/AEO, usuarios y auditoría.

**Stack:** Next.js 15 (App Router, ISR) · TypeScript · Tailwind CSS · Prisma 6 + PostgreSQL (Supabase) · Resend · Argon2id · Zod. Despliegue: Vercel.

## Desarrollo local

```bash
npm install
npm run db:local          # Postgres embebido en :54330 (déjalo corriendo en otra terminal)
npx prisma migrate deploy # crea las tablas
npm run db:seed           # 8 servicios + FAQs del brief (idempotente)
npm run admin:create      # usa ADMIN_EMAIL / ADMIN_PASSWORD de .env
npm run dev               # http://localhost:3000  ·  panel: /admin
```

Sin `RESEND_API_KEY`, en desarrollo los correos se imprimen en la consola.

## Despliegue (Vercel + Supabase)

1. **Supabase:** crea el proyecto (región cercana, p. ej. `sa-east-1`). En *Project Settings › Database* copia:
   - `DATABASE_URL` → conexión *Transaction pooler* (puerto 6543) + `?pgbouncer=true&connection_limit=1`
   - `DIRECT_URL` → conexión directa (puerto 5432), usada por las migraciones.
   - Habilita copias de seguridad (PITR en plan Pro) y prueba una restauración antes del lanzamiento.
2. **Resend:** agrega y verifica el dominio `estratec.org` (registros DNS SPF/DKIM), crea una API key.
3. **Vercel:** importa el repositorio y define las variables de `.env.example` en *Production* (y otras distintas en *Preview*):
   `DATABASE_URL`, `DIRECT_URL`, `SITE_URL=https://estratec.org`, `AUTH_SECRET` (`openssl rand -base64 48`), `RESEND_API_KEY`, `MAIL_FROM`.
4. Ejecuta una vez contra producción: `npx prisma migrate deploy`, `npm run db:seed` y `npm run admin:create` (con `ADMIN_*` solo en tu terminal, nunca en Vercel).
5. Apunta el dominio a Vercel. HSTS se activa automáticamente en producción.

En entornos *Preview* de Vercel el `robots.txt` bloquea la indexación.

## Estructura

| Ruta | Contenido |
|---|---|
| `src/app/(site)` | Sitio público: inicio, `/servicios/[slug]`, `/proyectos`, `/recursos`, `/contacto`, legales |
| `src/app/api/leads` | Recepción del formulario (validación, anti-spam, rate limit, correos) |
| `src/app/admin` | Panel: login/recuperación, dashboard, CRM, contenidos, SEO, configuración, usuarios, auditoría |
| `src/lib` | Auth/sesiones, settings, contenidos, SEO, correo, rate limit, auditoría |
| `prisma/` | Esquema, migración inicial y contenido semilla |
| `public/assets/brand` | `Estratec.svg` original (sin modificar), variante blanca y mascota a color |

## Roles

- **Administrador:** todo (CRM/prospectos, configuración, usuarios, auditoría, exportación CSV).
- **Editor:** contenidos (inicio, servicios, FAQs, proyectos, recursos, legales), SEO global y redirecciones.

Los permisos se validan en el servidor en cada página y acción.

## Seguridad implementada

Argon2id · sesiones con token aleatorio guardado como hash, cookie `__Host-` `HttpOnly`/`Secure`/`SameSite=Lax`, rotación al iniciar sesión, expiración por inactividad (12 h) y absoluta (7 días), invalidación al cambiar contraseña · bloqueo progresivo por intentos fallidos + rate limit por IP y correo · mensajes genéricos (sin enumeración de cuentas) · recuperación con token de un solo uso (1 h) · Zod en todas las entradas, Prisma parametrizado · Markdown sin HTML crudo (sin XSS) · JSON-LD escapado · CSV protegido contra inyección de fórmulas · CSP, `nosniff`, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, HSTS · `/admin` y `/api` con `no-store` y `noindex` · honeypot + token firmado con tiempo mínimo de llenado + verificación de origen en el formulario · auditoría de accesos, roles, configuración, exportaciones y citas · analítica solo con consentimiento y sin datos personales.

**Pendiente recomendado:** MFA para Administradores, CAPTCHA adaptativo (p. ej. Cloudflare Turnstile) si aparece spam, monitoreo de errores (Sentry) y análisis de dependencias en CI (`npm audit`).

## Pendientes de contenido antes de publicar (sección 12 del brief)

- **Logo:** el `Estratec.svg` recibido es un trazado incompleto (solo partes oscuras de la mascota). Se necesita el vector completo a color y, idealmente, una versión horizontal y una blanca.
- Aprobar la **política de privacidad** (está como borrador en *Páginas legales*; cambia la versión al aprobarla).
- Razón social, horario de atención, orden comercial de servicios, decisión sobre precios.
- GA4 / GTM / Search Console (se configuran en *SEO › Analítica*).
- Portafolio de GitHub (Fase 2): la sección está preparada y oculta hasta publicar casos.
