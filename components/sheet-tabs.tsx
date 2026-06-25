"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

type SheetTabsProps = {
  userProfiles: React.ReactNode;
  pendingProfiles: React.ReactNode;
  userCount: number;
  pendingCount: number;
  emailQuery?: string;
};

export function SheetTabs({
  userProfiles,
  pendingProfiles,
  userCount,
  pendingCount,
  emailQuery = "",
}: SheetTabsProps) {
  const [activeSheet, setActiveSheet] = useState<"users" | "pending">("users");
  const [searchValue, setSearchValue] = useState(emailQuery);
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const updateEmailSearch = useCallback((value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    const normalized = value.trim();

    if (normalized) {
      params.set("email", normalized);
    } else {
      params.delete("email");
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [currentSearchParams, pathname, router]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateEmailSearch(searchValue);
  }

  useEffect(() => {
    setSearchValue(emailQuery);
  }, [emailQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      updateEmailSearch(searchValue);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchValue, updateEmailSearch]);

  return (
    <section className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[#d8e2f0] bg-white shadow-sm">
      <div className="shrink-0 border-b border-[#d8e2f0] px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Usuarios en Ecomfycalls</h2>
            <p className="mt-1 text-sm text-[#647084]">
              Authenticated users and imported pending profiles. Identity fields
              are read-only; admins can edit operational access fields.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="search"
              name="email"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar por correo"
              className="h-9 w-full rounded-md border border-[#d8e2f0] bg-white px-3 text-sm outline-none focus:border-[#173785] sm:w-64"
            />
            <button
              type="submit"
              aria-label="Buscar por correo"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d8e2f0] bg-white text-[#173785] hover:bg-[#f1f5fb]"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet("pending")}
              className="h-9 rounded-md bg-[#173785] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0f2a6c]"
            >
              Invitar usuario
            </button>
          </form>
        </div>

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
            Active Users
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
            Pending Users
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
