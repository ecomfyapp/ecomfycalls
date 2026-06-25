import type { UserProfile } from "@/lib/user-profile";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

function displayName(profile: UserProfile | null) {
  const name =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.email ||
    "Account";

  return name.split(" ").filter(Boolean).slice(0, 2).join(" ");
}

function avatarColor(value: string) {
  const colors = [
    "bg-[#173785]",
    "bg-[#047857]",
    "bg-[#7c3aed]",
    "bg-[#b45309]",
    "bg-[#be123c]",
  ];
  const index = value
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return colors[index % colors.length];
}

export function SidebarAccountCard({
  profile,
}: {
  profile: UserProfile | null;
}) {
  const name = displayName(profile);
  const role = profile?.role === "admin" ? "Admin" : "Agent";
  const initial = name.charAt(0).toUpperCase() || "A";

  return (
    <div className="flex items-center gap-2 rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3 transition-colors hover:bg-[#eef5ff]">
      <Link href="/account" className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor(name)}`}
        >
          {initial}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[#0b1020]">
            {name}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-[#647084]">
            {role}
          </span>
        </span>
      </Link>
      <LogoutButton iconOnly />
    </div>
  );
}
