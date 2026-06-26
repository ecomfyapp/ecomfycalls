import { requireApiAuth } from "@/app/api/_utils/require-api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireApiAuth();

  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({
    user: auth.user,
    profile: auth.profile,
  });
}
