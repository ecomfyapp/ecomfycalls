import { LogoutButton } from "@/components/logout-button";
import { getCurrentUserProfile } from "@/lib/user-profile";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AccountContent() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-[#f6f9ff] px-5 py-10 text-[#0b1020]">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">Account</h1>
        <p className="mt-2 text-[#647084]">
          Basic account information for your EcomfyCalls profile.
        </p>

        <section className="mt-8 rounded-[8px] border border-[#d8e2f0] bg-white p-6 shadow-sm">
          <dl className="grid gap-5 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[#647084]">Email</dt>
              <dd className="mt-1 font-medium">{profile?.email ?? user.email}</dd>
            </div>
            <div>
              <dt className="text-[#647084]">Full name</dt>
              <dd className="mt-1 font-medium">{profile?.full_name ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-[#647084]">Role</dt>
              <dd className="mt-1 font-medium capitalize">
                {profile?.role ?? "agent"}
              </dd>
            </div>
            <div>
              <dt className="text-[#647084]">Status</dt>
              <dd className="mt-1 font-medium capitalize">
                {profile?.status ?? "pending"}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <LogoutButton />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f6f9ff] px-5 py-10 text-[#647084]">
          <div className="mx-auto max-w-3xl rounded-[8px] border border-[#d8e2f0] bg-white p-6">
            Loading account...
          </div>
        </main>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
