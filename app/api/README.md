# EcomfyCalls API routes

All app APIs live under `app/api` and are private by default.

Rules:

- Do not create public endpoints here.
- Every route should call `requireApiAuth()` from `app/api/_utils/require-api-auth`.
- Use `requireApiAuth({ activeOnly: true })` when the endpoint should only run for active accounts.
- Use `requireApiAuth({ roles: ["admin"] })` or `requireApiAuth({ roles: ["agent"] })` for role-specific endpoints.
- The proxy also returns `401` JSON for unauthenticated `/api/*` requests.
- Machine-to-machine webhooks, such as `/api/asterisk/*`, must validate their
  own shared secret and must not expose user data.

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

## Asterisk incoming-call webhook

Endpoint:

```txt
POST /api/asterisk/incoming-call
Authorization: Bearer <ASTERISK_WEBHOOK_SECRET>
Content-Type: application/json
```

Payload:

```json
{
  "call_id": "abc-123",
  "agent_extension": "1001",
  "caller_number": "+15550000000",
  "caller_name": "Customer",
  "vertical": "Medicare",
  "metadata": {}
}
```

The webhook is only a notification. Audio still arrives through SIP/WebRTC when
the agent browser is registered as the SIP extension.
