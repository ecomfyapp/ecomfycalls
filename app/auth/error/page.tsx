import { AuthErrorActions } from "@/components/auth-error-actions";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

type AuthErrorReason =
  | "pkce_missing"
  | "expired_link"
  | "invalid_link"
  | "auth_failed";

const errorContent: Record<
  AuthErrorReason,
  { title: string; message: string; code: string }
> = {
  pkce_missing: {
    title: "We couldn't complete your sign-in",
    message:
      "The sign-in process expired or continued in a different browser. Start again here, or use Google with the same email address.",
    code: "AUTH-PKCE-01",
  },
  expired_link: {
    title: "This link has expired",
    message:
      "Invitation and verification links are time-sensitive. Ask your administrator for a new invitation, or use Google with the same email address.",
    code: "AUTH-LINK-02",
  },
  invalid_link: {
    title: "This sign-in link isn't valid",
    message:
      "The link may be incomplete or may have already been used. Return to sign in and start a new secure session.",
    code: "AUTH-LINK-03",
  },
  auth_failed: {
    title: "We couldn't sign you in",
    message:
      "Something interrupted the secure sign-in process. Please try again, or continue with Google if you prefer.",
    code: "AUTH-LOGIN-04",
  },
};

function normalizeReason(reason?: string, legacyError?: string): AuthErrorReason {
  if (reason && reason in errorContent) {
    return reason as AuthErrorReason;
  }

  const message = legacyError?.toLowerCase() ?? "";
  if (message.includes("code verifier") || message.includes("pkce")) {
    return "pkce_missing";
  }
  if (message.includes("expired")) {
    return "expired_link";
  }
  if (message.includes("token") || message.includes("invalid")) {
    return "invalid_link";
  }

  return "auth_failed";
}

async function AuthErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; error?: string }>;
}) {
  const params = await searchParams;
  const content = errorContent[normalizeReason(params.reason, params.error)];

  return (
    <section className="mt-8 rounded-[8px] border border-[#d8e2f0] bg-white p-7 shadow-xl shadow-slate-950/10 sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4e5] text-[#c56a08]">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h1 className="mt-5 text-2xl font-semibold">{content.title}</h1>
      <p className="mt-3 text-sm leading-6 text-[#647084]">
        {content.message}
      </p>

      <AuthErrorActions />

      <details className="mt-5 border-t border-[#e5ebf4] pt-4 text-xs text-[#7b8799]">
        <summary className="cursor-pointer select-none font-medium">
          Technical details
        </summary>
        <p className="mt-2 font-mono">Error code: {content.code}</p>
      </details>
    </section>
  );
}

function AuthErrorFallback() {
  return (
    <div className="mt-8 h-[430px] animate-pulse rounded-[8px] border border-[#d8e2f0] bg-white shadow-xl shadow-slate-950/10" />
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; error?: string }>;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#eef5ff] px-4 py-10 text-[#0b1020] sm:px-6">
      <div className="w-full max-w-[460px]">
        <Link href="/" className="mx-auto block w-fit">
          <Image
            src="/images/Ecomfy-Lead-Logo.png"
            alt="Ecomfy Lead"
            width={300}
            height={72}
            priority
            className="h-auto w-[220px]"
          />
        </Link>

        <Suspense fallback={<AuthErrorFallback />}>
          <AuthErrorContent searchParams={searchParams} />
        </Suspense>

        <p className="mt-6 text-center text-sm text-[#647084]">
          Need help? Contact your EcomfyCalls administrator.
        </p>
      </div>
    </main>
  );
}
