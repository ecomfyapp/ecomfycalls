import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  children: ReactNode;
};

export function AuthShell({ title, children }: AuthShellProps) {
  return (
    <main className="min-h-svh bg-white text-[#0b1020]">
      <div className="grid min-h-svh lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#f5f9ff] px-12 py-14 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:76px_76px]" />
          <div className="absolute left-[-140px] top-[-160px] h-[420px] w-[420px] rounded-full bg-[#9df7d6]/35 blur-3xl" />
          <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-[#173785]/15 blur-3xl" />
          <div className="relative max-w-md">
            <p className="text-4xl font-semibold leading-tight text-[#173785]">
              High-intent calls for modern insurance teams.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-[8px] border border-[#173785]/10 bg-white p-8 shadow-2xl shadow-slate-950/10">
              <p className="text-xl font-semibold">Live caller marketplace</p>
              <p className="mt-5 text-base leading-7 text-[#4b5567]">
                EcomfyCalls helps licensed agents connect with customers who
                are actively calling to buy insurance, not cold leads waiting in
                a spreadsheet.
              </p>
              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#173785] text-sm font-bold text-white">
                  EC
                </div>
                <div>
                  <p className="font-semibold">Qualified inbound calls</p>
                  <p className="text-sm text-[#647084]">
                    Medicare, ACA, life, auto and more
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative text-sm font-medium text-[#173785]">
            Trusted by insurance operators building predictable pipeline
          </div>
        </section>

        <section className="flex min-h-svh items-center justify-center bg-[#eef5ff] px-4 py-10 sm:px-6">
          <div className="w-full max-w-[440px]">
            <Link href="/" className="mx-auto block w-fit">
              <Image
                src="/images/Ecomfy-Lead-Logo.png"
                alt="Ecomfy Lead"
                width={300}
                height={72}
                priority
                className="h-auto w-[230px]"
              />
            </Link>
            <h1 className="mt-8 text-center text-3xl font-semibold">
              {title}
            </h1>
            <div className="mt-7">{children}</div>
            <p className="mx-auto mt-28 max-w-xs text-center text-sm leading-6 text-[#647084] lg:mt-36">
              By creating an account, you accept our{" "}
              <Link href="/privacy-policy" className="font-medium text-[#173785]">
                Privacy Policy
              </Link>{" "}
              and data practices.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
