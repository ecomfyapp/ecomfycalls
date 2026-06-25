# Supabase Notes

## Estado

- Proyecto conectado a Supabase mediante la integracion de Vercel.
- Variables publicas esperadas por la app:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Pendientes

- Ejecutar `supabase/sql/001-user-profiles.sql` en Supabase.
- Si aparece recursion de RLS, ejecutar `supabase/sql/002-fix-user-profile-rls-admin-policies.sql`.
- Para manejar pending externos y match por email, revisar/ejecutar `supabase/sql/004-pending-profiles-admin-and-email-match.sql`.
- Pending profiles ahora usa `full_name`; ver `supabase/sql/005-pending-profiles-full-name.sql`.
- Traer schema actual de Supabase despues de ejecutar el SQL.
- Definir primeras tablas de negocio.
- Crear UI administrativa para aprobar usuarios.

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
