"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    handleOAuthSignUp("facebook");
  };

  const handleGoogleSignUp = async () => {
    handleOAuthSignUp("google");
  };

  const handleOAuthSignUp = async (provider: "facebook" | "google") => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/confirm?next=/protected`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-[8px] border-[#173785]/10 bg-white text-[#0b1020] shadow-2xl shadow-slate-950/10">
        <CardContent className="p-7">
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[#0b1020]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-[#d8e2f0] bg-white text-[#0b1020] placeholder:text-[#8a94a6] focus-visible:ring-[#173785]"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-[#0b1020]">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-[#d8e2f0] bg-white text-[#0b1020] placeholder:text-[#8a94a6] focus-visible:ring-[#173785]"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password" className="text-[#0b1020]">
                    Repeat Password
                  </Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="h-11 border-[#d8e2f0] bg-white text-[#0b1020] placeholder:text-[#8a94a6] focus-visible:ring-[#173785]"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="h-11 w-full bg-[#173785] text-white hover:bg-[#0f2a6c]"
                disabled={isLoading}
              >
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[#d8e2f0]" />
                <span className="text-sm text-[#647084]">or</span>
                <span className="h-px flex-1 bg-[#d8e2f0]" />
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  aria-label="Continue with Google"
                  variant="outline"
                  className="h-14 w-14 rounded-full border-[#d8e2f0] bg-white p-0 shadow-sm hover:bg-[#f7faff]"
                  disabled={isLoading}
                  onClick={handleGoogleSignUp}
                >
                  <Image
                    src="/images/Google_Favicon_2025.svg.png"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7"
                  />
                </Button>
                <Button
                  type="button"
                  aria-label="Continue with Facebook"
                  variant="outline"
                  className="h-14 w-14 rounded-full border-[#d8e2f0] bg-white p-0 shadow-sm hover:bg-[#f7faff]"
                  disabled={isLoading}
                  onClick={handleFacebookSignUp}
                >
                  <Image
                    src="/images/facebook-f-logo.png"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7"
                  />
                </Button>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-[#647084]">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#173785] hover:underline"
              >
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
