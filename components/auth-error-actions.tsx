"use client";

import { Button } from "@/components/ui/button";
import { getAuthCallbackUrl } from "@/lib/auth-url";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function AuthErrorActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueWithGoogle() {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl("/dashboard"),
      },
    });

    if (oauthError) {
      setError("Google sign-in could not be started. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-7 space-y-3">
      <Button
        asChild
        className="h-11 w-full bg-[#173785] text-white hover:bg-[#0f2a6c]"
      >
        <Link href="/auth/login">
          <ArrowLeft className="h-4 w-4" />
          Try signing in again
        </Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={continueWithGoogle}
        disabled={isLoading}
        className="h-11 w-full border-[#d8e2f0] bg-white text-[#0b1020] hover:bg-[#f7faff]"
      >
        <Image
          src="/images/Google_Favicon_2025.svg.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
        />
        {isLoading ? "Connecting..." : "Continue with Google"}
      </Button>

      <Link
        href="/"
        className="flex h-10 items-center justify-center gap-2 text-sm font-medium text-[#647084] hover:text-[#173785]"
      >
        <Home className="h-4 w-4" />
        Back to home
      </Link>

      {error ? (
        <p role="alert" className="text-center text-sm text-[#dc2626]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
