import { createServiceClient } from "@/lib/supabase/service";
import { sendIncomingCallPush } from "@/lib/push/send-incoming-call-push";
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

  if (!payload.call_id) {
    return NextResponse.json(
      { error: "call_id is required." },
      { status: 400 },
    );
  }

  // Broadcast to shared channel — all active agents subscribed to calls:ringall
  // receive the caller info simultaneously. Asterisk handles the actual SIP
  // ring-all natively; this is only for the rich UI popup.
  const supabase = createServiceClient();
  const channel = supabase.channel("calls:ringall");
  const callData = {
    call_id: payload.call_id,
    caller_number: payload.caller_number ?? "",
    caller_name: payload.caller_name ?? "",
    vertical: payload.vertical ?? "",
    metadata: payload.metadata ?? {},
  };

  await channel.send({
    type: "broadcast",
    event: "incoming_call",
    payload: callData,
  });

  await supabase.removeChannel(channel);
  const push = await sendIncomingCallPush({
    callId: payload.call_id,
    callerName: callData.caller_name,
    callerNumber: callData.caller_number,
    vertical: callData.vertical,
  });

  return NextResponse.json({
    ok: true,
    received: { call_id: payload.call_id },
    push,
  });
}
