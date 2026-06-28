import { createServiceClient } from "@/lib/supabase/service";
import webpush, { type PushSubscription } from "web-push";

type IncomingCallPushPayload = {
  callId: string;
  callerName: string;
  callerNumber: string;
  vertical: string;
};

type SubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  expiration_time: number | null;
};

type PushError = {
  statusCode?: number;
};

export type IncomingCallPushResult = {
  attempted: number;
  delivered: number;
  expired: number;
  skipped?: "not_configured" | "no_eligible_agents" | "no_subscriptions";
};

function isExpiredSubscription(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const statusCode = (error as PushError).statusCode;
  return statusCode === 404 || statusCode === 410;
}

export async function sendIncomingCallPush(
  payload: IncomingCallPushPayload,
): Promise<IncomingCallPushResult> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT || "mailto:support@ecomfycalls.com";

  if (!publicKey || !privateKey) {
    console.warn("[Push] VAPID keys are not configured.");
    return { attempted: 0, delivered: 0, expired: 0, skipped: "not_configured" };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const supabase = createServiceClient();
  const { data: agents, error: agentsError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("role", "agent")
    .eq("status", "active")
    .eq("ppc_status", true);

  if (agentsError) {
    console.error("[Push] Eligible agents could not be loaded.", {
      code: agentsError.code,
    });
    return { attempted: 0, delivered: 0, expired: 0 };
  }

  const agentIds = (agents ?? []).map((agent) => agent.id as string);
  if (agentIds.length === 0) {
    return {
      attempted: 0,
      delivered: 0,
      expired: 0,
      skipped: "no_eligible_agents",
    };
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("push_subscriptions")
    .select("endpoint,p256dh,auth,expiration_time")
    .in("user_id", agentIds)
    .returns<SubscriptionRow[]>();

  if (subscriptionsError) {
    console.error("[Push] Subscriptions could not be loaded.", {
      code: subscriptionsError.code,
    });
    return { attempted: 0, delivered: 0, expired: 0 };
  }

  if (!subscriptions?.length) {
    return {
      attempted: 0,
      delivered: 0,
      expired: 0,
      skipped: "no_subscriptions",
    };
  }

  const notificationPayload = JSON.stringify({
    title: "Llamada entrante en EcomfyCalls",
    body: payload.callerName
      ? `${payload.callerName} está esperando para hablar contigo.`
      : "Un cliente interesado está esperando para hablar contigo.",
    callId: payload.callId,
    callerName: payload.callerName,
    callerNumber: payload.callerNumber,
    vertical: payload.vertical,
    url: "/dashboard",
  });

  const expiredEndpoints: string[] = [];
  let delivered = 0;

  await Promise.all(
    subscriptions.map(async (row) => {
      const subscription: PushSubscription = {
        endpoint: row.endpoint,
        expirationTime: row.expiration_time,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth,
        },
      };

      try {
        await webpush.sendNotification(subscription, notificationPayload, {
          TTL: 45,
          urgency: "high",
        });
        delivered += 1;
      } catch (error) {
        if (isExpiredSubscription(error)) {
          expiredEndpoints.push(row.endpoint);
          return;
        }

        console.warn("[Push] Notification delivery failed.", {
          statusCode:
            error && typeof error === "object"
              ? (error as PushError).statusCode
              : undefined,
        });
      }
    }),
  );

  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return {
    attempted: subscriptions.length,
    delivered,
    expired: expiredEndpoints.length,
  };
}
