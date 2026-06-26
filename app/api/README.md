# EcomfyCalls API routes

All app APIs live under `app/api` and are private by default.

Rules:

- Do not create public endpoints here.
- Every route should call `requireApiAuth()` from `app/api/_utils/require-api-auth`.
- Use `requireApiAuth({ activeOnly: true })` when the endpoint should only run for active accounts.
- Use `requireApiAuth({ roles: ["admin"] })` or `requireApiAuth({ roles: ["agent"] })` for role-specific endpoints.
- The proxy also returns `401` JSON for unauthenticated `/api/*` requests.

Example:

```ts
import { requireApiAuth } from "@/app/api/_utils/require-api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireApiAuth({ activeOnly: true });

  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ ok: true, user: auth.user });
}
```
