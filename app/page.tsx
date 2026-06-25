import { Button } from "@/components/ui/button";
import { InviteHashRedirect } from "@/components/invite-hash-redirect";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowRight, BadgeCheck, Clock3, PhoneCall, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

const callTypes = [
  "Medicare",
  "Final expense",
  "ACA",
  "Auto",
  "Home",
  "Life",
];

const liveCalls = [
  {
    name: "Patricia M.",
    intent: "Final expense",
    location: "Tampa, FL",
    score: "94",
    wait: "00:18",
  },
  {
    name: "Daniel R.",
    intent: "Medicare Advantage",
    location: "Phoenix, AZ",
    score: "91",
    wait: "00:31",
  },
  {
    name: "Angela C.",
    intent: "Auto insurance",
    location: "Dallas, TX",
    score: "88",
    wait: "00:44",
  },
];

const stats = [
  { value: "Live", label: "Inbound callers" },
  { value: "1:1", label: "Exclusive transfers" },
  { value: "24/7", label: "Campaign visibility" },
];

const steps = [
  {
    icon: ShieldCheck,
    title: "Choose your insurance vertical",
    text: "Pick the call type, states, hours and daily volume that match your license and team.",
  },
  {
    icon: PhoneCall,
    title: "Receive ready-to-buy calls",
    text: "Customers call with intent, get qualified, then connect directly to your sales line.",
  },
  {
    icon: TrendingUp,
    title: "Scale what converts",
    text: "Track performance, control spend and increase volume when a campaign is working.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0b1020] dark:bg-[#05070d] dark:text-white">
      <InviteHashRedirect />
      <div className="border-b border-white/10 bg-[#080719] px-4 py-2 text-center text-sm text-white">
        <span className="font-medium">New:</span>{" "}
        High-intent insurance calls for licensed agents and teams.
        <Link
          href="/auth/sign-up"
          className="ml-2 inline-flex items-center gap-1 font-semibold text-[#9df7d6]"
        >
          Get access <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#05070d]/85">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b1020] text-sm font-bold text-white dark:bg-white dark:text-[#0b1020]">
              EC
            </span>
            <span className="text-lg">EcomfyCalls</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-[#4b5567] dark:text-white/70 md:flex">
            <a href="#how-it-works" className="hover:text-[#0b1020] dark:hover:text-white">
              How it works
            </a>
            <a href="#verticals" className="hover:text-[#0b1020] dark:hover:text-white">
              Verticals
            </a>
            <a href="#quality" className="hover:text-[#0b1020] dark:hover:text-white">
              Quality
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-[#0b1020] text-white hover:bg-[#20283d] dark:bg-white dark:text-[#0b1020] dark:hover:bg-white/90">
              <Link href="/auth/sign-up">Start buying calls</Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
        <div className="relative mx-auto grid min-h-[760px] w-full max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1fr_0.9fr] lg:py-24">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-medium text-[#4b5567] shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              <Sparkles className="h-4 w-4 text-[#00a878]" />
              Exclusive insurance calls, delivered live
            </div>

            <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal text-[#0b1020] dark:text-white md:text-7xl">
              Buy live calls from customers ready to purchase insurance.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#4b5567] dark:text-white/70 lg:mx-0">
              EcomfyCalls connects licensed agents with qualified inbound callers
              across insurance verticals, so your team spends less time chasing
              leads and more time closing real conversations.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="h-12 rounded-md bg-[#0b1020] px-6 text-white hover:bg-[#20283d] dark:bg-white dark:text-[#0b1020] dark:hover:bg-white/90">
                <Link href="/auth/sign-up">
                  Create account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-md border-black/10 px-6">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-black/10 pt-6 dark:border-white/10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="mt-1 text-sm text-[#647084] dark:text-white/55">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-[#090d18] dark:shadow-black/40">
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10">
                <div>
                  <div className="text-sm font-semibold">Live call desk</div>
                  <div className="mt-1 text-xs text-[#647084] dark:text-white/50">
                    Qualified inbound demand
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#e9fff6] px-3 py-1 text-xs font-semibold text-[#047857] dark:bg-[#073f31] dark:text-[#7ff5c8]">
                  <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                  Receiving
                </div>
              </div>

              <div className="space-y-3 p-4">
                {liveCalls.map((call) => (
                  <div
                    key={call.name}
                    className="rounded-[8px] border border-black/8 bg-[#fbfcff] p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#0b1020] text-sm font-semibold text-white dark:bg-white dark:text-[#0b1020]">
                          {call.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-semibold">{call.name}</div>
                          <div className="text-sm text-[#647084] dark:text-white/55">
                            {call.intent} · {call.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#647084] dark:text-white/50">
                          Intent score
                        </div>
                        <div className="text-lg font-semibold text-[#059669]">
                          {call.score}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm dark:bg-black/20">
                      <div className="flex items-center gap-2 text-[#4b5567] dark:text-white/65">
                        <Clock3 className="h-4 w-4" />
                        Waiting {call.wait}
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        <PhoneCall className="h-4 w-4 text-[#00a878]" />
                        Transfer ready
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 bg-[#f7f9fc] px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#647084] dark:text-white/55">
                    Today&apos;s available volume
                  </span>
                  <span className="font-semibold">128 calls</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-[#00a878]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="verticals" className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[#00a878]">
              Insurance verticals
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
              One marketplace for the calls your agency already wants.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-[#647084] dark:text-white/60">
            Start narrow, test quality, then increase volume across the
            products and geographies that perform.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {callTypes.map((type) => (
            <div
              key={type}
              className="flex items-center justify-between rounded-[8px] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span className="font-medium">{type}</span>
              <BadgeCheck className="h-5 w-5 text-[#00a878]" />
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-black/5 bg-[#f7f9fc] dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-[#00a878]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
              From campaign setup to live phone calls.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-[8px] border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#090d18]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e9fff6] text-[#047857] dark:bg-[#073f31] dark:text-[#7ff5c8]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#647084] dark:text-white/60">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="quality" className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[#00a878]">
              Quality controls
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
              Built for agents who care about answer rates and intent.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Inbound callers only",
              "Exclusive live transfers",
              "State and schedule controls",
              "Campaign-level reporting",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-[8px] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e9fff6] text-[#047857] dark:bg-[#073f31] dark:text-[#7ff5c8]">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 px-5 py-8 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-[#647084] dark:text-white/55 md:flex-row md:items-center md:justify-between">
          <div className="font-medium text-[#0b1020] dark:text-white">
            EcomfyCalls
          </div>
          <div className="flex gap-5">
            <Link href="/auth/login" className="hover:text-[#0b1020] dark:hover:text-white">
              Sign in
            </Link>
            <Link href="/auth/sign-up" className="hover:text-[#0b1020] dark:hover:text-white">
              Create account
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#0b1020] dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#0b1020] dark:hover:text-white">
              Terms
            </Link>
            <Link href="/user-data-deletion" className="hover:text-[#0b1020] dark:hover:text-white">
              Data Deletion
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
