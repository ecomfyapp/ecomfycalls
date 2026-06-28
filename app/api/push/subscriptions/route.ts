import { requireApiAuth } from "@/app/api/_utils/require-api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

type PushSubscriptionPayload = {
  endpoint?: unknown;
  expirationTime?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

function validString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function validEndpoint(value: unknown) {
  if (!validString(value, 4096)) return false;

  try {
    return new URL(value as string).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth({ activeOnly: true });

  if ("response" in auth) return auth.response;

  let subscription: PushSubscriptionPayload;

  try {
    subscription = (await request.json()) as PushSubscriptionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !validEndpoint(subscription.endpoint) ||
    !validString(subscription.keys?.p256dh, 1024) ||
    !validString(subscription.keys?.auth, 512)
  ) {
    return NextResponse.json(
      { error: "Invalid push subscription." },
      { status: 400 },
    );
  }

  const expirationTime =
    typeof subscription.expirationTime === "number"
      ? subscription.expirationTime
      : null;
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("push_subscriptions")
    .select("user_id")
    .eq("endpoint", subscription.endpoint as string)
    .maybeSingle<{ user_id: string }>();

  if (existing && existing.user_id !== auth.user.id) {
    return NextResponse.json(
      { error: "This push subscription belongs to another account." },
      { status: 409 },
    );
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: auth.user.id,
      endpoint: subscription.endpoint as string,
      p256dh: subscription.keys?.p256dh as string,
      auth: subscription.keys?.auth as string,
      expiration_time: expirationTime,
      user_agent: request.headers.get("user-agent"),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    console.error("[Push] Subscription could not be saved.", {
      code: error.code,
    });
    return NextResponse.json(
      { error: "Push subscription could not be saved." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiAuth({ activeOnly: true });

  if ("response" in auth) return auth.response;

  let body: { endpoint?: unknown };

  try {
    body = (await request.json()) as { endpoint?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!validEndpoint(body.endpoint)) {
    return NextResponse.json({ error: "Invalid endpoint." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("endpoint", body.endpoint as string);

  if (error) {
    return NextResponse.json(
      { error: "Push subscription could not be removed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
