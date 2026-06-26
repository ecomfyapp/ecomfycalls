"use client";

import { PhoneCall, PhoneOff, Radio, ShieldAlert, Wifi } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SoftphoneConfig =
  | {
      configured: false;
      missing: string[];
    }
  | {
      configured: true;
      wssUrl: string;
      sipDomain: string;
      extension: string;
      password: string;
    };

type JsSIPModule = typeof import("jssip");

type SipSession = {
  connection?: RTCPeerConnection;
  answer: (options: {
    mediaConstraints: { audio: boolean; video: boolean };
  }) => void;
  terminate: () => void;
  on: (event: string, handler: () => void) => void;
};

type NewRtcSessionEvent = {
  originator: "local" | "remote";
  session: SipSession;
};

type UserAgent = {
  start: () => void;
  stop: () => void;
  on: (event: string, handler: (data: NewRtcSessionEvent) => void) => void;
};


function statusColor(status: string) {
  if (status === "Online") return "text-[#047857]";
  if (status.includes("Error")) return "text-[#b91c1c]";
  return "text-[#647084]";
}

export function AgentSoftphone() {
  const [status, setStatus] = useState("Disconnected");
  const [configError, setConfigError] = useState("");
  const [incomingCall, setIncomingCall] = useState<SipSession | null>(null);
  const [activeCall, setActiveCall] = useState<SipSession | null>(null);
  const uaRef = useRef<UserAgent | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
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

    [0, 0.62].forEach((offset) => {
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
    if (ringIntervalRef.current !== null) {
      window.clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  }, []);

  const cleanupSession = useCallback(() => {
    stopRinging();
    setIncomingCall(null);
    setActiveCall(null);
  }, [stopRinging]);

  useEffect(() => {
    function unlockOnInteraction() {
      void unlockAudio();
      window.removeEventListener("pointerdown", unlockOnInteraction);
      window.removeEventListener("keydown", unlockOnInteraction);
    }

    window.addEventListener("pointerdown", unlockOnInteraction);
    window.addEventListener("keydown", unlockOnInteraction);

    return () => {
      window.removeEventListener("pointerdown", unlockOnInteraction);
      window.removeEventListener("keydown", unlockOnInteraction);
      stopRinging();
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [stopRinging, unlockAudio]);

  useEffect(() => {
    if (!incomingCall) {
      stopRinging();
      return;
    }

    void playRingOnce();
    ringIntervalRef.current = window.setInterval(() => {
      void playRingOnce();
    }, 3000);

    return stopRinging;
  }, [incomingCall, playRingOnce, stopRinging]);

  useEffect(() => {
    let isMounted = true;

    async function startSoftphone() {
      const [configResponse, JsSIP] = await Promise.all([
        fetch("/api/softphone/config"),
        import("jssip") as Promise<JsSIPModule>,
      ]);
      const config = (await configResponse.json()) as SoftphoneConfig;

      if (!isMounted) {
        return;
      }

      if (!config.configured) {
        setConfigError(
          `Missing Asterisk config: ${config.missing.join(", ")}`,
        );
        setStatus("Not configured");
        return;
      }

      const socket = new JsSIP.WebSocketInterface(config.wssUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ua = new JsSIP.UA({
        sockets: [socket],
        uri: `sip:${config.extension}@${config.sipDomain}`,
        password: config.password,
        session_timers: false,
        pcConfig: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      } as any) as UserAgent;

      uaRef.current = ua;

      ua.on("connected", () => setStatus("Connected to Asterisk"));
      ua.on("registered", () => setStatus("Online"));
      ua.on("registrationFailed", () => setStatus("Registration Error"));
      ua.on("disconnected", () => setStatus("Disconnected"));

      ua.on("newRTCSession", (data: NewRtcSessionEvent) => {
        const session = data.session;

        if (data.originator !== "remote") {
          return;
        }

        setIncomingCall(session);

        session.on("peerconnection", () => {
          const peerConnection = session.connection;

          peerConnection?.addEventListener("track", (event: RTCTrackEvent) => {
            if (remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = event.streams[0];
            }
          });
        });

        session.on("ended", cleanupSession);
        session.on("failed", cleanupSession);
      });

      ua.start();
    }

    startSoftphone().catch((error: unknown) => {
      setStatus("Softphone Error");
      setConfigError(error instanceof Error ? error.message : "Unknown error");
    });

    return () => {
      isMounted = false;
      uaRef.current?.stop();
      uaRef.current = null;
    };
  }, [cleanupSession]);

  function answerCall() {
    if (!incomingCall) {
      return;
    }

    incomingCall.answer({
      mediaConstraints: {
        audio: true,
        video: false,
      },
    });
    setActiveCall(incomingCall);
    setIncomingCall(null);
  }

  function hangupCall() {
    activeCall?.terminate();
    incomingCall?.terminate();
    cleanupSession();
  }

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay />

      <section className="rounded-[8px] border border-[#d8e2f0] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#173785]">
              <Radio className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-[#0b1020]">
                WebRTC softphone
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#647084]">
              Browser registration for receiving Asterisk calls.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#647084]">Status</p>
            <p className={`mt-1 text-sm font-semibold ${statusColor(status)}`}>
              {status}
            </p>
          </div>
        </div>

        {configError ? (
          <div className="mt-4 flex gap-3 rounded-[8px] border border-[#ffd3d3] bg-[#fff8f8] p-3 text-sm text-[#b91c1c]">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{configError}</span>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#647084]">
            <Wifi className="h-4 w-4 text-[#173785]" />
            SIP over secure WebSocket
          </div>
          {activeCall ? (
            <button
              type="button"
              onClick={hangupCall}
              className="flex h-9 items-center gap-2 rounded-md bg-[#ef4444] px-3 text-sm font-semibold text-white hover:bg-[#dc2626]"
            >
              <PhoneOff className="h-4 w-4" />
              Hang up
            </button>
          ) : null}
        </div>
      </section>

      {incomingCall ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[8px] border border-[#d8e2f0] bg-white p-6 text-center shadow-2xl shadow-black/50">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#173785] text-white">
              <PhoneCall className="h-9 w-9" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold">Incoming call</h2>
            <p className="mt-2 text-[#647084]">Asterisk is sending a call.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={hangupCall}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#ef4444] text-sm font-semibold text-white hover:bg-[#dc2626]"
              >
                <PhoneOff className="h-4 w-4" />
                Decline
              </button>
              <button
                type="button"
                onClick={answerCall}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#10b981] text-sm font-semibold text-white hover:bg-[#059669]"
              >
                <PhoneCall className="h-4 w-4" />
                Answer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
