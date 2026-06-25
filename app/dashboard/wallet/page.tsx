import { CopyIdButton } from "@/components/copy-id-button";
import { getCurrentUserProfile } from "@/lib/user-profile";
import { CircleDollarSign, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const history = [
  {
    date: "May 27, 11:18 AM",
    amount: -18.5,
    movement: "Buying Lead",
    id: "pay_7983a1321086",
  },
  {
    date: "May 27, 10:42 AM",
    amount: 150,
    movement: "Recarga",
    id: "topup_202605271042",
  },
  {
    date: "May 27, 10:31 AM",
    amount: -32,
    movement: "Buying Call",
    id: "call_2f91b7ac2031",
  },
  {
    date: "May 27, 09:58 AM",
    amount: 18.5,
    movement: "Reembolso",
    id: "refund_7ca4caab8b19",
  },
  {
    date: "May 26, 09:30 AM",
    amount: 300,
    movement: "Recarga",
    id: "topup_202605260930",
  },
];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

async function WalletContent() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (profile?.status === "pending") {
    redirect("/dashboard/pending");
  }

  if (profile?.status !== "active") {
    redirect("/dashboard/access-restricted");
  }

  if (profile.role !== "agent") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden">
      <div className="shrink-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8d8] bg-[#effdf7] px-3 py-1 text-sm font-medium text-[#047857]">
          <Wallet className="h-4 w-4" />
          Wallet
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
          Balance
        </h1>
        <p className="mt-2 max-w-3xl text-[#647084]">
          Track available funds and billing movements for calls and campaigns.
        </p>

        <section className="mt-6 flex items-center justify-between rounded-[8px] border border-[#d8e2f0] bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-[#647084]">Current balance</p>
            <p className="mt-2 text-4xl font-semibold">
              {formatUsd(profile?.balance ?? 0)}
            </p>
          </div>
          <button
            type="button"
            disabled
            title="Recharge will be available soon"
            className="rounded-md bg-[#0b1020] px-5 py-2.5 text-sm font-semibold text-white opacity-45"
          >
            Recargar
          </button>
        </section>
      </div>

      <section className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[#d8e2f0] bg-white shadow-sm">
        <div className="shrink-0 border-b border-[#d8e2f0] px-5 py-4">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-[#173785]" />
            <h2 className="text-xl font-semibold">Billing history</h2>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
            <colgroup>
              <col style={{ width: "36%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "24%" }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#f8fbff] text-xs uppercase text-[#647084]">
              <tr>
                {["Fecha", "Monto", "Movimiento", "ID"].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-[#d8e2f0] px-3 py-2"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const isCredit = item.amount > 0;

                return (
                  <tr
                    key={item.id}
                    className={isCredit ? "bg-[#effdf7]" : "bg-[#fff7f7]"}
                  >
                    <td className="border-b border-[#eef2f7] px-3 py-2">
                      {item.date}
                    </td>
                    <td
                      className={`border-b border-[#eef2f7] px-3 py-2 font-semibold ${
                        isCredit ? "text-[#047857]" : "text-[#dc2626]"
                      }`}
                    >
                      {isCredit ? "+" : ""}
                      {formatUsd(item.amount)}
                    </td>
                    <td className="border-b border-[#eef2f7] px-3 py-2 font-medium">
                      {item.movement}
                    </td>
                    <td className="border-b border-[#eef2f7] px-3 py-2">
                      <CopyIdButton value={item.id} previewLength={6} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={<WalletSkeleton />}
    >
      <WalletContent />
    </Suspense>
  );
}

function WalletSkeleton() {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden">
      <div className="shrink-0">
        <div className="h-7 w-24 animate-pulse rounded-full bg-[#d8e2f0]" />
        <div className="mt-4 h-10 w-36 animate-pulse rounded-md bg-[#d8e2f0]" />
        <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded-md bg-[#d8e2f0]" />

        <section className="mt-6 flex items-center justify-between rounded-[8px] border border-[#d8e2f0] bg-white p-5 shadow-sm">
          <div>
            <div className="h-4 w-28 animate-pulse rounded bg-[#d8e2f0]" />
            <div className="mt-3 h-10 w-32 animate-pulse rounded bg-[#d8e2f0]" />
          </div>
          <div className="h-10 w-24 animate-pulse rounded-md bg-[#d8e2f0]" />
        </section>
      </div>

      <section className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[#d8e2f0] bg-white shadow-sm">
        <div className="shrink-0 border-b border-[#d8e2f0] px-5 py-4">
          <div className="h-6 w-40 animate-pulse rounded bg-[#d8e2f0]" />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="grid grid-cols-4 gap-3 border-b border-[#d8e2f0] bg-[#f8fbff] px-3 py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-4 animate-pulse rounded bg-[#d8e2f0]"
              />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-4 gap-3 border-b border-[#eef2f7] px-3 py-2"
            >
              {Array.from({ length: 4 }).map((__, column) => (
                <div
                  key={column}
                  className="h-8 animate-pulse rounded bg-[#eef2f7]"
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
