import { requireApiAuth } from "@/app/api/_utils/require-api-auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireApiAuth({ activeOnly: true, roles: ["agent"] });

  if ("response" in auth) {
    return auth.response;
  }

  const supabase = await createClient();
  const { data: sipCredentials } = await supabase
    .from("user_profiles")
    .select("sip_password")
    .eq("id", auth.user.id)
    .maybeSingle<{ sip_password: string | null }>();

  const sipPassword = sipCredentials?.sip_password || undefined;

  const connectionConfig = {
    wssUrl: process.env.ASTERISK_WSS_URL,
    sipDomain: process.env.ASTERISK_SIP_DOMAIN,
    extension:
      auth.profile?.buyer_id === null || auth.profile?.buyer_id === undefined
        ? undefined
        : String(auth.profile.buyer_id),
    password: sipPassword,
    stunUrl: process.env.ASTERISK_STUN_URL,
    turnUrl: process.env.ASTERISK_TURN_URL,
    turnUsername: process.env.ASTERISK_TURN_USERNAME,
    turnCredential: process.env.ASTERISK_TURN_CREDENTIAL,
  };

  const missing = Object.entries(connectionConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        configured: false,
        missing,
      },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  return NextResponse.json(
    {
      configured: true,
      wssUrl: connectionConfig.wssUrl,
      sipDomain: connectionConfig.sipDomain,
      extension: connectionConfig.extension,
      password: connectionConfig.password,
      iceServers: [
        { urls: connectionConfig.stunUrl },
        {
          urls: connectionConfig.turnUrl,
          username: connectionConfig.turnUsername,
          credential: connectionConfig.turnCredential,
        },
      ],
    },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
