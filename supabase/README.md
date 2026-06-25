# Supabase Context

Esta carpeta guarda el contexto de Supabase para el proyecto.

## Como la usaremos

- `schemas/`: aqui guardaremos schemas, tablas, policies, functions y vistas que traigas desde Supabase.
- `sql/`: aqui guardaremos SQL listo para ejecutar en Supabase.
- `notes.md`: notas de estado, decisiones y pendientes de la base de datos.

## Reglas

- No guardar credenciales, passwords, service role keys, JWT secrets ni URLs privadas de Postgres.
- Si un SQL ya fue ejecutado, anotarlo en `notes.md`.
- Mantener cada cambio de base de datos en un archivo separado dentro de `sql/`.

