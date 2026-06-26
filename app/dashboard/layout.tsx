import { AccountPermissionsGuard } from "@/components/account-permissions-guard";
import { AgentSoftphone } from "@/components/agent-softphone";
import { SidebarAccountCard } from "@/components/sidebar-account-card";
import { getCurrentUserProfile } from "@/lib/user-profile";
import {
  Clock3,
  LayoutDashboard,
  Phone,
  Settings,
  Users,
  UserRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calls", href: "/dashboard/calls", icon: Phone },
  { label: "Leads", href: "/dashboard/leads", icon: UserRound },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet, agentOnly: true },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Settings", href: "/dashboard", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen overflow-hidden bg-[#f6f9ff] text-[#0b1020]">
      <div className="grid h-full lg:grid-cols-[280px_1fr]">
        <aside className="relative flex border-b border-[#d8e2f0] bg-white px-4 py-4 lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Link href="/dashboard" className="block">
              <Image
                src="/images/Ecomfy-Lead-Logo.png"
                alt="Ecomfy Lead"
                width={210}
                height={50}
                priority
                className="h-auto w-[170px]"
              />
            </Link>
            <div className="lg:hidden">
              <Suspense fallback={<SidebarAccountSkeleton />}>
                <SidebarAccount />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<SidebarNavSkeleton />}>
            <SidebarNav />
          </Suspense>

          <div className="mt-8 hidden rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-4 lg:block">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#173785]">
              <Clock3 className="h-4 w-4" />
              Approval required
            </div>
            <p className="mt-2 text-sm leading-6 text-[#647084]">
              New accounts need approval before accessing live call campaigns.
            </p>
          </div>

          <div className="mt-auto hidden lg:block">
            <Suspense fallback={<SidebarAccountSkeleton />}>
              <SidebarAccount />
            </Suspense>
          </div>
        </aside>

        <section className="min-h-0 min-w-0 overflow-hidden px-5 py-6 lg:h-screen lg:px-8 lg:py-8">
          {children}
        </section>
      </div>
      <AccountPermissionsGuard />
      <Suspense fallback={null}>
        <AgentSoftphoneRuntime />
      </Suspense>
    </main>
  );
}

async function SidebarAccount() {
  const { profile } = await getCurrentUserProfile();

  return <SidebarAccountCard profile={profile} />;
}

async function SidebarNav() {
  const { profile } = await getCurrentUserProfile();
  const visibleItems = navItems.filter(
    (item) => !item.agentOnly || profile?.role === "agent",
  );

  return (
    <nav className="mt-8 hidden space-y-1 lg:block">
      {visibleItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#4b5567] hover:bg-[#eef5ff] hover:text-[#173785]"
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

async function AgentSoftphoneRuntime() {
  const { profile } = await getCurrentUserProfile();

  if (profile?.role !== "agent" || profile.status !== "active") {
    return null;
  }

  return <AgentSoftphone />;
}

function SidebarAccountSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3">
      <div className="h-10 w-10 animate-pulse rounded-full bg-[#d8e2f0]" />
      <div className="min-w-0 flex-1">
        <div className="h-4 w-24 animate-pulse rounded bg-[#d8e2f0]" />
        <div className="mt-2 h-3 w-14 animate-pulse rounded bg-[#e8eef8]" />
      </div>
    </div>
  );
}

function SidebarNavSkeleton() {
  return (
    <nav className="mt-8 hidden space-y-2 lg:block">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-9 animate-pulse rounded-md bg-[#eef2f7]" />
      ))}
    </nav>
  );
}
