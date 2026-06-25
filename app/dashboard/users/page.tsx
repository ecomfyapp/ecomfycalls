import { getCurrentUserProfile, type UserProfile } from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  deletePendingProfile,
  invitePendingProfile,
  updateUserProfile,
} from "./actions";
import {
  CheckCircle2,
  Clock3,
  Database,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { CopyIdButton } from "@/components/copy-id-button";
import { SheetTabs } from "@/components/sheet-tabs";
import { ProfileSelect } from "@/components/profile-select";
import { SaveRowButton } from "@/components/save-row-button";

type PendingProfile = {
  id: number;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  email: string;
  buyer_id: number;
  account_status: string | null;
};

function normalizeEmailQuery(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value ?? "").trim().toLowerCase();
}

function emailMatches(email: string | null, query: string) {
  return !query || String(email ?? "").toLowerCase().includes(query);
}

async function UsersContent({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const params = await searchParams;
  const emailQuery = normalizeEmailQuery(params.email);
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (profile?.status === "pending") {
    redirect("/dashboard/pending");
  }

  if (profile?.role !== "admin" || profile.status !== "active") {
    redirect("/dashboard/access-restricted");
  }

  const supabase = await createClient();
  const [{ data: userProfiles, error: userError }, { data: pendingProfiles, error: pendingError }] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select(
          "id,email,full_name,first_name,last_name,buyer_id,balance,ppc_status,role,status,created_at,updated_at",
        )
        .order("created_at", { ascending: false })
        .returns<UserProfile[]>(),
      supabase
        .from("pending_profiles")
        .select(
          "id,created_at,updated_at,full_name,email,buyer_id,account_status",
        )
        .order("created_at", { ascending: false })
        .returns<PendingProfile[]>(),
    ]);

  const activeCount =
    userProfiles?.filter((current) => current.status === "active").length ?? 0;
  const pendingCount =
    userProfiles?.filter((current) => current.status === "pending").length ?? 0;
  const filteredUserProfiles = (userProfiles ?? []).filter((current) =>
    emailMatches(current.email, emailQuery),
  );
  const filteredPendingProfiles = (pendingProfiles ?? []).filter((current) =>
    emailMatches(current.email, emailQuery),
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden">
      <div className="shrink-0">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8d8] bg-[#effdf7] px-3 py-1 text-sm font-medium text-[#047857]">
            <CheckCircle2 className="h-4 w-4" />
            Admin only
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
            Users
          </h1>
          <p className="mt-2 max-w-3xl text-[#647084]">
            Manage authenticated user profiles, roles, approval status, balance
            and imported pending profiles from external systems.
          </p>
        </div>
      </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Active users"
            value={String(activeCount)}
            icon={CheckCircle2}
          />
          <SummaryCard
            label="Pending app users"
            value={String(pendingCount)}
            icon={Clock3}
          />
          <SummaryCard
            label="Pending external profiles"
            value={String(pendingProfiles?.length ?? 0)}
            icon={Database}
          />
        </div>

        {userError ? <ErrorBanner message={userError.message} /> : null}
        {pendingError ? <ErrorBanner message={pendingError.message} /> : null}
      </div>

      <SheetTabs
        userCount={filteredUserProfiles.length}
        pendingCount={filteredPendingProfiles.length}
        emailQuery={emailQuery}
        userProfiles={
          <div className="h-full overflow-auto">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-[#f8fbff] text-xs uppercase text-[#647084]">
                <tr>
                  {[
                    "User ID",
                    "Email",
                    "Name",
                    "Role",
                    "Status",
                    "Buyer ID",
                    "Balance",
                    "PPC",
                    "Action",
                    "Created at",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="truncate border-b border-[#d8e2f0] px-3 py-2"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUserProfiles.map((current) => (
                  <tr key={current.id} className="align-middle">
                    <UserProfileRow profile={current} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
        pendingProfiles={
          <div className="h-full overflow-auto">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "7%" }} />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-[#f8fbff] text-xs uppercase text-[#647084]">
                <tr>
                  {[
                    "ID",
                    "Email",
                    "Full name",
                    "Buyer ID",
                    "Account status",
                    "Created",
                    "Invite",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="truncate border-b border-[#d8e2f0] px-3 py-2"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPendingProfiles.map((pending) => (
                  <tr key={pending.id} className="align-middle">
                    <PendingProfileRow profile={pending} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CheckCircle2;
}) {
  return (
    <div className="rounded-[8px] border border-[#d8e2f0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#647084]">{label}</p>
        <Icon className="h-5 w-5 text-[#173785]" />
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-[8px] border border-[#ffd3d3] bg-[#fff8f8] p-4 text-sm text-[#b91c1c]">
      <ShieldAlert className="h-5 w-5" />
      {message}
    </div>
  );
}

function TableInput({
  name,
  defaultValue,
  type = "text",
  className = "w-full",
  form,
}: {
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  className?: string;
  form?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue ?? ""}
      form={form}
      className={`${className} h-8 rounded-md border border-[#d8e2f0] bg-white px-2 text-sm outline-none focus:border-[#173785]`}
    />
  );
}

function UserProfileRow({ profile }: { profile: UserProfile }) {
  return (
    <>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <form action={updateUserProfile} id={`user-${profile.id}`}>
          <input type="hidden" name="id" value={profile.id} />
        </form>
        <CopyIdButton value={profile.id} />
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <span className="block truncate text-[#0b1020]">
          {profile.email ?? "-"}
        </span>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <div className="flex min-w-0 flex-col justify-center">
          <span className="block truncate font-medium">
            {profile.full_name ||
              [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
              "-"}
          </span>
          {profile.first_name || profile.last_name ? (
            <span className="mt-1 block truncate text-xs text-[#647084]">
              {[profile.first_name, profile.last_name].filter(Boolean).join(" ")}
            </span>
          ) : null}
        </div>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <ProfileSelect
          name="role"
          defaultValue={profile.role}
          form={`user-${profile.id}`}
          options={["agent", "admin"]}
          variant="role"
        />
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <ProfileSelect
          name="status"
          defaultValue={profile.status}
          form={`user-${profile.id}`}
          options={["pending", "active", "banned"]}
          variant="status"
        />
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        {profile.role === "admin" ? (
          <>
            <input
              type="hidden"
              name="buyer_id"
              value={profile.buyer_id ?? ""}
              form={`user-${profile.id}`}
            />
            <input
              type="text"
              defaultValue={profile.buyer_id ?? ""}
              disabled
              className="h-8 w-full rounded-md border border-[#d8e2f0] bg-[#f1f5fb] px-2 text-sm text-[#94a3b8]"
            />
          </>
        ) : (
          <TableInput
            name="buyer_id"
            type="number"
            defaultValue={profile.buyer_id}
            className="w-full"
            form={`user-${profile.id}`}
          />
        )}
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <span className="block truncate font-semibold text-[#0b1020]">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(profile.balance)}
        </span>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            name="ppc_status"
            type="checkbox"
            defaultChecked={profile.ppc_status}
            form={`user-${profile.id}`}
            className="peer sr-only"
          />
          <span className="h-6 w-10 rounded-full bg-[#cfd5dc] transition-colors peer-checked:bg-[#0f9f74]" />
          <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
        </label>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <SaveRowButton form={`user-${profile.id}`} />
      </td>
      <td className="whitespace-nowrap border-b border-[#eef2f7] px-3 py-2 text-xs text-[#647084]">
        <span className="block">
          {formatNewYorkDateTime(profile.created_at)}
        </span>
      </td>
    </>
  );
}

function formatNewYorkDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function PendingProfileRow({ profile }: { profile: PendingProfile }) {
  return (
    <>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <span className="font-mono text-xs text-[#647084]">{profile.id}</span>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <span className="block truncate">{profile.email}</span>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <span className="block truncate font-medium">
          {profile.full_name ?? "-"}
        </span>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <span className="block truncate">{profile.buyer_id}</span>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <span className="block truncate">{profile.account_status ?? "-"}</span>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2 text-xs text-[#647084]">
        {new Date(profile.created_at).toLocaleDateString()}
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <form action={invitePendingProfile}>
          <input type="hidden" name="id" value={profile.id} />
          <button
            type="submit"
            className="rounded-md bg-[#173785] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#0f2a6c]"
          >
            Invite
          </button>
        </form>
      </td>
      <td className="border-b border-[#eef2f7] px-3 py-2">
        <form action={deletePendingProfile}>
            <input type="hidden" name="id" value={profile.id} />
            <button
              type="submit"
              aria-label="Delete pending user"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#ffd3d3] bg-white text-[#b91c1c] hover:bg-[#fff8f8]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
        </form>
      </td>
    </>
  );
}

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={<UsersSkeleton />}
    >
      <UsersContent searchParams={searchParams} />
    </Suspense>
  );
}

function UsersSkeleton() {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden">
      <div className="shrink-0">
        <div className="h-7 w-28 animate-pulse rounded-full bg-[#d8e2f0]" />
        <div className="mt-4 h-10 w-40 animate-pulse rounded-md bg-[#d8e2f0]" />
        <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded-md bg-[#d8e2f0]" />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-[8px] border border-[#d8e2f0] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 animate-pulse rounded bg-[#d8e2f0]" />
                <div className="h-5 w-5 animate-pulse rounded bg-[#d8e2f0]" />
              </div>
              <div className="mt-4 h-8 w-12 animate-pulse rounded bg-[#d8e2f0]" />
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[#d8e2f0] bg-white shadow-sm">
        <div className="shrink-0 border-b border-[#d8e2f0] px-5 py-4">
          <div className="h-6 w-36 animate-pulse rounded bg-[#d8e2f0]" />
          <div className="mt-2 h-4 w-full max-w-xl animate-pulse rounded bg-[#d8e2f0]" />
          <div className="mt-4 flex gap-2">
            <div className="h-9 w-36 animate-pulse rounded-t-md bg-[#d8e2f0]" />
            <div className="h-9 w-40 animate-pulse rounded-t-md bg-[#eef2f7]" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-8 gap-3 border-b border-[#d8e2f0] bg-[#f8fbff] px-3 py-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-4 animate-pulse rounded bg-[#d8e2f0]"
                />
              ))}
            </div>
            {Array.from({ length: 10 }).map((_, row) => (
              <div
                key={row}
                className="grid grid-cols-8 gap-3 border-b border-[#eef2f7] px-3 py-2"
              >
                {Array.from({ length: 8 }).map((__, column) => (
                  <div
                    key={column}
                    className="h-8 animate-pulse rounded bg-[#eef2f7]"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
