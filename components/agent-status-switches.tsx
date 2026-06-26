"use client";

import { updateAgentDeliveryStatus } from "@/app/dashboard/actions";
import { useState, useTransition } from "react";

type AgentStatusSwitchesProps = {
  callsEnabled: boolean;
  leadsEnabled: boolean;
};

function StatusToggle({
  label,
  enabled,
  disabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  disabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-wait disabled:opacity-70 ${
          enabled ? "bg-[#10b981]" : "bg-white/25"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export function AgentStatusSwitches({
  callsEnabled,
  leadsEnabled,
}: AgentStatusSwitchesProps) {
  const [status, setStatus] = useState({
    calls: callsEnabled,
    leads: leadsEnabled,
  });
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateStatus(field: "ppc_status" | "lead_status", enabled: boolean) {
    const key = field === "ppc_status" ? "calls" : "leads";
    const previous = status;

    setStatus((current) => ({
      ...current,
      [key]: enabled,
    }));
    setMessage("");

    startTransition(async () => {
      const formData = new FormData();
      formData.set("field", field);
      formData.set("enabled", String(enabled));

      const result = await updateAgentDeliveryStatus(formData);

      if (!result.ok) {
        setStatus(previous);
        setMessage(result.message);
        return;
      }

      setMessage(result.message);
    });
  }

  return (
    <div className="mt-6 border-t border-white/15 pt-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Status</p>
        <span className="text-xs text-white/55">
          {isPending ? "Saving..." : "Live controls"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <StatusToggle
          label="Leads"
          enabled={status.leads}
          disabled={isPending}
          onChange={(enabled) => updateStatus("lead_status", enabled)}
        />
        <StatusToggle
          label="Calls"
          enabled={status.calls}
          disabled={isPending}
          onChange={(enabled) => updateStatus("ppc_status", enabled)}
        />
      </div>

      {message ? <p className="mt-3 text-xs text-white/70">{message}</p> : null}
    </div>
  );
}
