# Vends Hoy

Plataforma para vender webs de negocio automáticas, con la plantilla de Martin Tattoo adaptada a cada oficio.

```bash
npm install
npm run dev
```

Abre http://localhost:3000

Pega las claves en `.env.local` (el archivo ya está creado, vacío salvo `APP_SECRET`).

## Claves

Obligatorias para producción:

- `OPENAI_API_KEY` — GPT-4o mini (crear y editar por prompt)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID` — precio de 150 €/mes
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `BLOB_READ_WRITE_TOKEN` — fotos
- `NEXT_PUBLIC_APP_URL` — dominio público (p. ej. https://tudominio.vercel.app)
- `APP_SECRET` — firma de cookies (cámbiala en producción)

Opcionales:

- `GOOGLE_PLACES_API_KEY` — reseñas reales al pegar Maps
- `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`
- `GITHUB_TOKEN`

Schema de Supabase: `supabase/schema.sql` (pegar en el SQL Editor).

Sin claves la app funciona en local con un JSON en `data/vends-hoy.json`.
