"use client";

import { useState } from "react";

type SheetTabsProps = {
  userProfiles: React.ReactNode;
  pendingProfiles: React.ReactNode;
  userCount: number;
  pendingCount: number;
};

export function SheetTabs({
  userProfiles,
  pendingProfiles,
  userCount,
  pendingCount,
}: SheetTabsProps) {
  const [activeSheet, setActiveSheet] = useState<"users" | "pending">("users");

  return (
    <section className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[#d8e2f0] bg-white shadow-sm">
      <div className="shrink-0 border-b border-[#d8e2f0] px-5 py-4">
        <h2 className="text-xl font-semibold">User profiles</h2>
        <p className="mt-1 text-sm text-[#647084]">
          Authenticated users and imported pending profiles. Identity fields are
          read-only; admins can edit operational access fields.
        </p>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSheet("users")}
            className={`rounded-t-md border px-4 py-2 text-sm font-semibold ${
              activeSheet === "users"
                ? "border-[#d8e2f0] border-b-white bg-white text-[#173785]"
                : "border-transparent bg-[#f1f5fb] text-[#647084] hover:text-[#173785]"
            }`}
          >
            User profiles
            <span className="ml-2 rounded-full bg-[#e8eef8] px-2 py-0.5 text-xs">
              {userCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet("pending")}
            className={`rounded-t-md border px-4 py-2 text-sm font-semibold ${
              activeSheet === "pending"
                ? "border-[#d8e2f0] border-b-white bg-white text-[#173785]"
                : "border-transparent bg-[#f1f5fb] text-[#647084] hover:text-[#173785]"
            }`}
          >
            Pending profiles
            <span className="ml-2 rounded-full bg-[#e8eef8] px-2 py-0.5 text-xs">
              {pendingCount}
            </span>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {activeSheet === "users" ? userProfiles : pendingProfiles}
      </div>
    </section>
  );
}
