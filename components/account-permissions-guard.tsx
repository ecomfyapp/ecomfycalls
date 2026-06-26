"use client";

import { Bell, Mic, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PermissionStateValue = "granted" | "denied" | "prompt" | "unknown";

type PermissionStatusMap = {
  notifications: PermissionStateValue;
  microphone: PermissionStateValue;
};

const initialStatus: PermissionStatusMap = {
  notifications: "unknown",
  microphone: "unknown",
};

function statusLabel(status: PermissionStateValue) {
  if (status === "granted") return "Activo";
  if (status === "denied") return "Bloqueado";
  return "Pendiente";
}

function normalizeNotificationPermission(
  permission: NotificationPermission,
): PermissionStateValue {
  return permission === "default" ? "prompt" : permission;
}

function PermissionRow({
  icon: Icon,
  title,
  text,
  status,
  actionLabel,
  onAction,
}: {
  icon: typeof Bell;
  title: string;
  text: string;
  status: PermissionStateValue;
  actionLabel: string;
  onAction: () => void;
}) {
  const granted = status === "granted";

  return (
    <div className="flex items-start gap-3 rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
          granted ? "bg-[#e9fff6] text-[#047857]" : "bg-[#eef5ff] text-[#173785]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">{title}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              granted
                ? "bg-[#dcfce7] text-[#047857]"
                : status === "denied"
                  ? "bg-[#fee2e2] text-[#b91c1c]"
                  : "bg-[#e8eef8] text-[#173785]"
            }`}
          >
            {statusLabel(status)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-5 text-[#647084]">{text}</p>
        {!granted ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 rounded-md bg-[#173785] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#0f2a6c]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AccountPermissionsGuard() {
  const [status, setStatus] = useState<PermissionStatusMap>(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [lastDismissedAt, setLastDismissedAt] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const missingCount = useMemo(
    () => Object.values(status).filter((current) => current !== "granted").length,
    [status],
  );

  async function refreshPermissionStatus() {
    const nextStatus: PermissionStatusMap = {
      notifications:
        typeof window !== "undefined" && "Notification" in window
          ? normalizeNotificationPermission(Notification.permission)
          : "denied",
      microphone: "unknown",
    };

    if ("permissions" in navigator) {
      try {
        const microphonePermission = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        nextStatus.microphone =
          microphonePermission.state as PermissionStateValue;
      } catch {
        nextStatus.microphone = "prompt";
      }
    } else {
      nextStatus.microphone = "prompt";
    }

    setStatus(nextStatus);
  }

  async function requestNotifications() {
    if (!("Notification" in window)) {
      setStatus((current) => ({ ...current, notifications: "denied" }));
      return;
    }

    const permission = await Notification.requestPermission();
    setStatus((current) => ({
      ...current,
      notifications: normalizeNotificationPermission(permission),
    }));
  }

  async function requestMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus((current) => ({ ...current, microphone: "denied" }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setStatus((current) => ({ ...current, microphone: "granted" }));
    } catch {
      setStatus((current) => ({ ...current, microphone: "denied" }));
    }
  }

  async function requestRequiredBrowserPrompts() {
    if (status.notifications !== "granted") {
      await requestNotifications();
    }

    if (status.microphone !== "granted") {
      await requestMicrophone();
    }

    await refreshPermissionStatus();
  }

  const getAudioContext = useCallback(() => {
    const audioWindow = window as Window &
      typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
      };
    const AudioContextClass =
      audioWindow.AudioContext || audioWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    return audioContextRef.current;
  }, []);

  const unlockReminderSound = useCallback(async () => {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
  }, [getAudioContext]);

  const playReminderSound = useCallback(async () => {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    await unlockReminderSound();

    if (audioContext.state !== "running") {
      return;
    }

    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
    gain.connect(audioContext.destination);

    [523.25, 783.99].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.12);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.12);
      oscillator.stop(now + 0.78);
    });
  }, [getAudioContext, unlockReminderSound]);

  useEffect(() => {
    refreshPermissionStatus();
  }, []);

  useEffect(() => {
    if (missingCount > 0 && lastDismissedAt === null) {
      setIsOpen(true);
    }
  }, [lastDismissedAt, missingCount]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshPermissionStatus();

      if (missingCount > 0) {
        const elapsed = lastDismissedAt ? Date.now() - lastDismissedAt : 10000;
        if (elapsed >= 10000) {
          setIsOpen(true);
        }
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [lastDismissedAt, missingCount]);

  useEffect(() => {
    if (isOpen && missingCount > 0) {
      void playReminderSound();
    }
  }, [isOpen, missingCount, playReminderSound]);

  useEffect(() => {
    function handleFirstInteraction() {
      void unlockReminderSound();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    }

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [unlockReminderSound]);

  if (missingCount === 0 || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-[8px] border border-[#d8e2f0] bg-white p-5 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8d8] bg-[#effdf7] px-3 py-1 text-sm font-medium text-[#047857]">
              <ShieldCheck className="h-4 w-4" />
              Requisitos de cuenta
            </div>
            <h2 className="mt-4 text-2xl font-semibold">
              Activa los permisos para trabajar llamadas
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#647084]">
              EcomfyCalls necesita notificaciones y microfono para que los
              vendedores puedan recibir alertas y atender llamadas
              correctamente.
            </p>
            <button
              type="button"
              onClick={requestRequiredBrowserPrompts}
              className="mt-4 rounded-md bg-[#173785] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0f2a6c]"
            >
              Activar permisos ahora
            </button>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => {
              setIsOpen(false);
              setLastDismissedAt(Date.now());
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#647084] hover:bg-[#f1f5fb] hover:text-[#173785]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <PermissionRow
            icon={Bell}
            title="Notificaciones"
            text="Permite recibir alertas aunque estes trabajando en otra pestana."
            status={status.notifications}
            actionLabel="Activar notificaciones"
            onAction={requestNotifications}
          />
          <PermissionRow
            icon={Mic}
            title="Microfono"
            text="Permite validar audio para futuras funciones de llamadas dentro del panel."
            status={status.microphone}
            actionLabel="Activar microfono"
            onAction={requestMicrophone}
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-[#647084]">
          Si un permiso aparece bloqueado, activalo desde los ajustes del
          navegador para este sitio. Este aviso volvera cada 10 segundos hasta
          que todo este activo.
        </p>
      </div>
    </div>
  );
}
