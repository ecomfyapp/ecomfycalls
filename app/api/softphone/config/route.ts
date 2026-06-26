import { requireApiAuth } from "@/app/api/_utils/require-api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireApiAuth({ activeOnly: true, roles: ["agent"] });

  if ("response" in auth) {
    return auth.response;
  }

  const extension =
    process.env.ASTERISK_SIP_EXTENSION_PREFIX &&
    process.env.ASTERISK_SIP_EXTENSION_PREFIX.trim()
      ? `${process.env.ASTERISK_SIP_EXTENSION_PREFIX}${auth.user.id.slice(0, 6)}`
      : process.env.ASTERISK_SIP_EXTENSION;

  const config = {
    wssUrl: process.env.ASTERISK_WSS_URL,
    sipDomain: process.env.ASTERISK_SIP_DOMAIN,
    extension,
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
