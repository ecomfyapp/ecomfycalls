# Supabase Notes

## Estado

- Proyecto conectado a Supabase mediante la integracion de Vercel.
- Variables publicas esperadas por la app:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Pendientes

- Ejecutar `supabase/sql/001-user-profiles.sql` en Supabase.
- Traer schema actual de Supabase despues de ejecutar el SQL.
- Definir primeras tablas de negocio.
- Crear policies RLS administrativas para aprobar usuarios.

## Modelo de acceso inicial

- Tabla: `public.user_profiles`
- UID: `user_profiles.id` referencia `auth.users.id`
- Rol flexible: `role text`, default `agent`
- Status flexible: `status text`, default `pending`
- Status iniciales previstos:
  - `pending`
  - `active`
  - `inactive`
  - `banned`

Los usuarios nuevos quedan en `pending`. Solo usuarios con `status = 'active'`
pueden usar el dashboard principal.
