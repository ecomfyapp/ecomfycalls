import { requireApiAuth } from "@/app/api/_utils/require-api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireApiAuth({ activeOnly: true, roles: ["agent"] });

  if ("response" in auth) {
    return auth.response;
  }

  const config = {
    wssUrl: process.env.ASTERISK_WSS_URL,
    sipDomain: process.env.ASTERISK_SIP_DOMAIN,
    extension:
      auth.profile?.buyer_id === null || auth.profile?.buyer_id === undefined
        ? undefined
        : String(auth.profile.buyer_id),
    password: process.env.ASTERISK_SIP_PASSWORD,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        configured: false,
        missing,
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    configured: true,
    ...config,
  });
}
