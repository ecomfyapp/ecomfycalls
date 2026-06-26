import { NextRequest, NextResponse } from "next/server";

type IncomingCallPayload = {
  call_id?: string;
  caller_number?: string;
  caller_name?: string;
  agent_extension?: string;
  vertical?: string;
  metadata?: Record<string, unknown>;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.ASTERISK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "ASTERISK_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (token !== webhookSecret) {
    return unauthorized();
  }

  let payload: IncomingCallPayload;

  try {
    payload = (await request.json()) as IncomingCallPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.call_id || !payload.agent_extension) {
    return NextResponse.json(
      { error: "call_id and agent_extension are required." },
      { status: 400 },
    );
  }

  // This webhook confirms the event. The actual call audio still arrives by
  // SIP/WebRTC when the browser is registered as the agent extension.
  return NextResponse.json({
    ok: true,
    received: {
      call_id: payload.call_id,
      agent_extension: payload.agent_extension,
    },
  });
}
