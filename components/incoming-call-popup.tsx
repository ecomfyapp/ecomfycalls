"use client";

import { createClient } from "@/lib/supabase/client";
import { Phone, PhoneCall, PhoneOff, ShieldCheck, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type IncomingCallData = {
  call_id: string;
  caller_number: string;
  caller_name: string;
  vertical: string;
  metadata: Record<string, unknown>;
};

type IncomingCallPopupProps = {
  agentExtension?: string;
  enabled?: boolean;
  preview?: boolean;
  demoEveryMs?: number;
};

function CallerInitials({ name }: { name: string }) {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#173785] text-2xl font-semibold text-white shadow-lg shadow-[#173785]/25">
      <span>{name.slice(0, 1).toUpperCase()}</span>
      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981] ring-4 ring-white">
        <Phone className="h-3.5 w-3.5 text-white" />
      </span>
    </div>
  );
}

export function IncomingCallPopup({
  agentExtension,
  enabled = true,
  preview = true,
  demoEveryMs,
}: IncomingCallPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [callData, setCallData] = useState<IncomingCallData | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);

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

  const unlockAudio = useCallback(async () => {
    const audioContext = getAudioContext();

    if (audioContext?.state === "suspended") {
      await audioContext.resume();
    }
  }, [getAudioContext]);

  const playRingOnce = useCallback(async () => {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    await unlockAudio();

    if (audioContext.state !== "running") {
      return;
    }

    const now = audioContext.currentTime;
    const ringStarts = [0, 0.62];

    ringStarts.forEach((offset) => {
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.2, now + offset + 0.02);
      gain.gain.setValueAtTime(0.2, now + offset + 0.42);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.5);
      gain.connect(audioContext.destination);

      [440, 480].forEach((frequency) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now + offset);
        oscillator.connect(gain);
        oscillator.start(now + offset);
        oscillator.stop(now + offset + 0.52);
      });
    });
  }, [getAudioContext, unlockAudio]);

  const stopRinging = useCallback(() => {
    if (ringIntervalRef.current) {
      window.clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  }, []);

  const closePopup = useCallback(() => {
    stopRinging();
    setIsOpen(false);
  }, [stopRinging]);

  function openPreview() {
    setCallData(null);
    setIsOpen(true);
  }

  useEffect(() => {
    if (!enabled || !isOpen) {
      stopRinging();
      return;
    }

    void playRingOnce();
    ringIntervalRef.current = window.setInterval(() => {
      void playRingOnce();
    }, 3000);

    return stopRinging;
  }, [enabled, isOpen, playRingOnce, stopRinging]);

  useEffect(() => {
    function handleFirstInteraction() {
      void unlockAudio();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    }

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      stopRinging();
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [stopRinging, unlockAudio]);

  useEffect(() => {
    if (!enabled || !demoEveryMs) {
      return;
    }

    const interval = window.setInterval(() => {
      setIsOpen(true);
    }, demoEveryMs);

    return () => window.clearInterval(interval);
  }, [demoEveryMs, enabled]);

  useEffect(() => {
    if (!enabled || !agentExtension) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`calls:agent:${agentExtension}`)
      .on(
        "broadcast",
        { event: "incoming_call" },
        (msg: { payload: IncomingCallData }) => {
          setCallData(msg.payload);
          setIsOpen(true);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [agentExtension, enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      {preview ? (
        <button
          type="button"
          onClick={openPreview}
          className="fixed bottom-5 right-5 z-40 flex h-11 items-center gap-2 rounded-full bg-[#173785] px-4 text-sm font-semibold text-white shadow-lg shadow-[#173785]/25 hover:bg-[#0f2a6c]"
        >
          <PhoneCall className="h-4 w-4" />
          Preview call
        </button>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 px-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md overflow-hidden rounded-[8px] border border-[#d8e2f0] bg-white shadow-2xl shadow-black/50">
            <div className="absolute inset-x-0 top-0 h-1 bg-[#10b981]" />
            <div className="p-6 text-center">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8d8] bg-[#effdf7] px-3 py-1 text-sm font-medium text-[#047857]">
                  <Volume2 className="h-4 w-4" />
                  Incoming call
                </div>
                <button
                  type="button"
                  aria-label="Close incoming call"
                  onClick={closePopup}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#647084] hover:bg-[#f1f5fb] hover:text-[#173785]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 flex justify-center">
                <div className="relative">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#10b981]/20" />
                  <CallerInitials
                    name={callData?.caller_name || callData?.caller_number || "?"}
                  />
                </div>
              </div>

              <h2 className="mt-6 text-3xl font-semibold">
                {callData?.caller_name || callData?.caller_number || "Unknown caller"}
              </h2>
              <p className="mt-2 text-[#647084]">
                {callData ? callData.caller_number : "High-intent insurance caller"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
                <div className="rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3">
                  <p className="text-[#647084]">Vertical</p>
                  <p className="mt-1 font-semibold">
                    {callData?.vertical || "Medicare"}
                  </p>
                </div>
                <div className="rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3">
                  <p className="text-[#647084]">Call ID</p>
                  <p className="mt-1 truncate font-mono text-xs font-semibold">
                    {callData?.call_id || "—"}
                  </p>
                </div>
                <div className="rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3">
                  <p className="text-[#647084]">Number</p>
                  <p className="mt-1 font-semibold">
                    {callData?.caller_number || "—"}
                  </p>
                </div>
                <div className="rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3">
                  <p className="text-[#647084]">Source</p>
                  <p className="mt-1 font-semibold">Inbound</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closePopup}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#ef4444] text-sm font-semibold text-white shadow-sm hover:bg-[#dc2626]"
                >
                  <PhoneOff className="h-4 w-4" />
                  Decline
                </button>
                <button
                  type="button"
                  onClick={closePopup}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#10b981] text-sm font-semibold text-white shadow-sm hover:bg-[#059669]"
                >
                  <PhoneCall className="h-4 w-4" />
                  Answer
                </button>
              </div>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#647084]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#047857]" />
                Exclusive call reserved for this agent
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
