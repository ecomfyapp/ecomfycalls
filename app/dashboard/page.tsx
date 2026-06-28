import { getCurrentUserProfile, type UserProfile } from "@/lib/user-profile";
import { AgentStatusSwitches } from "@/components/agent-status-switches";
import {
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const agentMetrics = [
  { label: "Available calls", value: "0", icon: PhoneCall },
  { label: "Active campaigns", value: "0", icon: TrendingUp },
  { label: "Account balance", value: "$0", icon: CircleDollarSign },
];

const agentSteps = [
  {
    title: "Complete your buying profile",
    text: "Tell us which insurance verticals, states, hours and daily volume you want.",
    icon: ClipboardCheck,
  },
  {
    title: "Fund your account",
    text: "Add budget before launching campaigns. Billing controls will live here.",
    icon: CircleDollarSign,
  },
  {
    title: "Receive live transfers",
    text: "Once campaigns are active, calls will connect to the phone numbers you configure.",
    icon: PhoneCall,
  },
];

const betaAgentSteps = [
  {
    title: "Activa los accesos",
    text: "Habilita los permisos de micrófono, sonido y notificaciones para recibir y atender cada llamada sin interrupciones.",
    icon: ShieldCheck,
  },
  {
    title: "Enfócate en los beneficios del cliente",
    text: "Explica el valor de la oferta y evita perder tiempo solicitando nombre, teléfono y otros datos. Recibirás una notificación con esa información.",
    icon: BadgeCheck,
  },
  {
    title: "Mantén saldo en tu cuenta",
    text: "Conserva al menos $300 de saldo disponible para continuar recibiendo llamadas entrantes.",
    icon: CircleDollarSign,
  },
  {
    title: "Desactiva las llamadas cuando no estés disponible",
    text: "Desactiva tu estado de Calls cuando no quieras recibir llamadas o cuando estés en una presentación.",
    icon: PhoneOff,
  },
];

function getShortName(fullName: string | null) {
  const nameParts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  return nameParts.slice(0, 2).join(" ") || "Agente";
}

function getSpanishGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "America/New_York",
    }).format(new Date()),
  );

  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

const adminMetrics = [
  { label: "Pending approvals", value: "0", icon: Users },
  { label: "Active agents", value: "0", icon: ShieldCheck },
  { label: "Live campaigns", value: "0", icon: TrendingUp },
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

  if (profile.role === "admin") {
    return <AdminDashboard profile={profile} error={error} />;
  }

  return <AgentDashboard profile={profile} error={error} />;
}

function AgentDashboard({
  profile,
  error,
}: {
  profile: UserProfile;
  error: string | null;
}) {
  const usesBetaAgentDashboard = profile.release_channel !== "production";
  const visibleAgentSteps = usesBetaAgentDashboard
    ? betaAgentSteps
    : agentSteps;

  return (
    <div
      className={`mx-auto w-full ${
        usesBetaAgentDashboard
          ? "h-full max-w-[1400px] overflow-y-auto pb-6 pr-1"
          : "max-w-6xl"
      }`}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="rounded-[8px] border border-[#d8e2f0] bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8d8] bg-[#effdf7] px-3 py-1 text-sm font-medium text-[#047857]">
            <BadgeCheck className="h-4 w-4" />
            Agent account active
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-normal md:text-4xl">
            {usesBetaAgentDashboard
              ? `${getSpanishGreeting()}, ${getShortName(profile.full_name)}`
              : "Buy high-intent insurance calls"}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#647084]">
            {usesBetaAgentDashboard
              ? "Formas parte de un grupo exclusivo que disfruta el beneficio de recibir llamadas de clientes interesados. EcomfyCalls te conecta con personas listas para conversar sobre su seguro."
              : "Your agent workspace is ready. The next step is configuring where, when and what type of calls you want EcomfyCalls to deliver."}
          </p>
        </section>

        <aside className="rounded-[8px] border border-[#d8e2f0] bg-[#173785] p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-white/70">Account status</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-semibold capitalize">
                {profile.status}
              </p>
              <p className="text-sm text-white/65">Role: {profile.role}</p>
            </div>
          </div>
          <AgentStatusSwitches
            callsEnabled={profile.ppc_status}
            leadsEnabled={profile.lead_status}
          />
        </aside>
      </div>

      {!usesBetaAgentDashboard ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {agentMetrics.map((metric) => {
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
      ) : null}

      <div
        className={`mt-6 grid gap-5 ${
          usesBetaAgentDashboard
            ? "grid-cols-1"
            : "lg:grid-cols-[1fr_360px]"
        }`}
      >
        <section className="rounded-[8px] border border-[#d8e2f0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {usesBetaAgentDashboard
                  ? "Checklist de llamadas"
                  : "Launch checklist"}
              </h2>
              <p className="mt-1 text-sm text-[#647084]">
                {usesBetaAgentDashboard
                  ? "Más llamadas, más cierres. Sigue estos pasos para aprovechar mejor las llamadas entrantes."
                  : "These are the pieces we need before calls can start flowing."}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {visibleAgentSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#eef5ff] text-[#173785]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#647084]">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {!usesBetaAgentDashboard ? (
          <section className="rounded-[8px] border border-[#d8e2f0] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#173785]">
              <CalendarClock className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-[#0b1020]">
                Call schedule
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#647084]">
              No campaign schedule has been configured yet. This panel will show
              delivery hours, states and daily caps for the agent.
            </p>
            <div className="mt-5 rounded-md border border-dashed border-[#b9c8dd] bg-[#f8fbff] p-4 text-sm text-[#647084]">
              Waiting for campaign setup
            </div>
          </section>
        ) : null}
      </div>

      {!usesBetaAgentDashboard ? (
        <ProfileDebug profile={profile} error={error} />
      ) : null}
    </div>
  );
}

function AdminDashboard({
  profile,
  error,
}: {
  profile: UserProfile;
  error: string | null;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8d8] bg-[#effdf7] px-3 py-1 text-sm font-medium text-[#047857]">
            <BadgeCheck className="h-4 w-4" />
            Admin account active
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
            Admin workspace
          </h1>
          <p className="mt-2 text-[#647084]">
            Review pending agents, manage roles and prepare campaign operations.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {adminMetrics.map((metric) => {
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

      <ProfileDebug profile={profile} error={error} />
    </div>
  );
}

function ProfileDebug({
  profile,
  error,
}: {
  profile: UserProfile;
  error: string | null;
}) {
  return (
    <div className="mt-6 rounded-[8px] border border-[#d8e2f0] bg-white p-6 shadow-sm">
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
        <p className="mt-4 text-sm text-red-600">Profile warning: {error}</p>
      ) : null}
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
