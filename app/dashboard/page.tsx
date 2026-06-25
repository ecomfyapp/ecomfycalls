import { getCurrentUserProfile } from "@/lib/user-profile";
import { BadgeCheck, PhoneCall, TrendingUp, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const metrics = [
  { label: "Available calls", value: "0", icon: PhoneCall },
  { label: "Active campaigns", value: "0", icon: TrendingUp },
  { label: "Team members", value: "1", icon: Users },
];

async function DashboardContent() {
  const { user, profile, error } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (!profile) {
    redirect("/dashboard/pending");
  }

  if (profile.status === "pending") {
    redirect("/dashboard/pending");
  }

  if (profile.status !== "active") {
    redirect("/dashboard/access-restricted");
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8d8] bg-[#effdf7] px-3 py-1 text-sm font-medium text-[#047857]">
            <BadgeCheck className="h-4 w-4" />
            Active account
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
            Welcome to your dashboard
          </h1>
          <p className="mt-2 text-[#647084]">
            Your account is approved. Campaign tools and call buying flows will
            live here.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-[8px] border border-[#d8e2f0] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#647084]">
                  {metric.label}
                </p>
                <Icon className="h-5 w-5 text-[#173785]" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-[8px] border border-[#d8e2f0] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Account context</h2>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-[#647084]">UID</dt>
            <dd className="mt-1 break-all font-mono text-xs">{profile.id}</dd>
          </div>
          <div>
            <dt className="text-[#647084]">Role</dt>
            <dd className="mt-1 font-semibold">{profile.role}</dd>
          </div>
          <div>
            <dt className="text-[#647084]">Status</dt>
            <dd className="mt-1 font-semibold">{profile.status}</dd>
          </div>
        </dl>
        {error ? (
          <p className="mt-4 text-sm text-red-600">
            Profile warning: {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[8px] border border-[#d8e2f0] bg-white p-6 text-[#647084]">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
