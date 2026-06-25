import { getCurrentUserProfile } from "@/lib/user-profile";
import { Clock3, MailCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function PendingApprovalContent() {
  const { user, profile, error } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (profile?.status === "active") {
    redirect("/dashboard");
  }

  if (profile && profile.status !== "pending") {
    redirect("/dashboard/access-restricted");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center">
      <div className="w-full rounded-[8px] border border-[#d8e2f0] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5ff] text-[#173785]">
          <Clock3 className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Waiting for approval</h1>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-[#647084]">
          Your account was created successfully. An administrator needs to
          approve your profile and assign the correct role before you can access
          EcomfyCalls campaigns.
        </p>

        <div className="mt-8 rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-5 text-left">
          <div className="flex items-center gap-2 font-semibold text-[#173785]">
            <MailCheck className="h-5 w-5" />
            Account details
          </div>
          <dl className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-[#647084]">UID</dt>
              <dd className="mt-1 break-all font-mono text-xs">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-[#647084]">Role</dt>
              <dd className="mt-1 font-semibold">
                {profile?.role ?? "agent"}
              </dd>
            </div>
            <div>
              <dt className="text-[#647084]">Status</dt>
              <dd className="mt-1 font-semibold">
                {profile?.status ?? "pending"}
              </dd>
            </div>
          </dl>
          {error ? (
            <p className="mt-4 text-sm text-red-600">
              Profile setup warning: {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[8px] border border-[#d8e2f0] bg-white p-6 text-[#647084]">
          Loading account status...
        </div>
      }
    >
      <PendingApprovalContent />
    </Suspense>
  );
}
