import { AccountProfileForm } from "@/components/account-profile-form";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUserProfile } from "@/lib/user-profile";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AccountContent() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  const fullName = profile?.full_name || "";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-3xl font-semibold">Account</h1>
      <p className="mt-2 text-[#647084]">
        Basic account information for your EcomfyCalls profile.
      </p>

      <section className="mt-8 rounded-[8px] border border-[#d8e2f0] bg-white p-6 shadow-sm">
        <AccountProfileForm
          email={profile?.email ?? user.email ?? ""}
          fullName={fullName}
          role={profile?.role ?? "agent"}
          profileStatus={profile?.status ?? "pending"}
        />

        <div className="mt-8">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}

export default function DashboardAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl rounded-[8px] border border-[#d8e2f0] bg-white p-6 text-[#647084]">
          Loading account...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
