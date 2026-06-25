import { getCurrentUserProfile } from "@/lib/user-profile";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AccessRestrictedContent() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (profile?.status === "active") {
    redirect("/dashboard");
  }

  if (profile?.status === "pending") {
    redirect("/dashboard/pending");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center">
      <div className="w-full rounded-[8px] border border-[#ffd3d3] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1f1] text-[#dc2626]">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Access restricted</h1>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-[#647084]">
          This account is not currently allowed to access the dashboard. Contact
          an administrator if you believe this is a mistake.
        </p>
        <div className="mt-6 inline-flex rounded-full border border-[#ffd3d3] bg-[#fff8f8] px-4 py-2 text-sm font-semibold text-[#b91c1c]">
          Status: {profile?.status ?? "unknown"}
        </div>
      </div>
    </div>
  );
}

export default function AccessRestrictedPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[8px] border border-[#d8e2f0] bg-white p-6 text-[#647084]">
          Loading account status...
        </div>
      }
    >
      <AccessRestrictedContent />
    </Suspense>
  );
}
