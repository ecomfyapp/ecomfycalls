import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

type CallbackError = {
  code?: string;
  message: string;
};

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function classifyAuthError(error: CallbackError) {
  const message = error.message.toLowerCase();

  if (message.includes("code verifier") || message.includes("pkce")) {
    return "pkce_missing";
  }

  if (
    error.code === "otp_expired" ||
    message.includes("expired") ||
    message.includes("already been used")
  ) {
    return "expired_link";
  }

  if (
    error.code === "bad_code_verifier" ||
    message.includes("invalid") ||
    message.includes("token")
  ) {
    return "invalid_link";
  }

  return "auth_failed";
}

function authErrorPath(error: CallbackError) {
  console.error("[Auth callback] Authentication failed.", {
    code: error.code ?? "unknown",
    reason: classifyAuthError(error),
  });

  return `/auth/error?reason=${classifyAuthError(error)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(next);
    }

    redirect(authErrorPath(error));
  }

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    } else {
      redirect(authErrorPath(error));
    }
  }

  redirect("/auth/error?reason=invalid_link");
}
