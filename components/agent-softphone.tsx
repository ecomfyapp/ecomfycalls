"use client";

import { createClient } from "@/lib/supabase/client";
import { Phone, PhoneCall, PhoneOff, ShieldCheck, Volume2, X } from "lucide-react";
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
      iceServers: RTCIceServer[];
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

type IncomingCallData = {
  call_id: string;
  caller_number: string;
  caller_name: string;
  vertical: string;
  metadata: Record<string, unknown>;
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

export function AgentSoftphone() {
  const [incomingCall, setIncomingCall] = useState<SipSession | null>(null);
  const [activeCall, setActiveCall] = useState<SipSession | null>(null);
  const [callData, setCallData] = useState<IncomingCallData | null>(null);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remoteAudioStatus, setRemoteAudioStatus] = useState<
    "waiting" | "receiving" | "blocked"
  >("waiting");
  const uaRef = useRef<UserAgent | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);
  const audioStatsIntervalRef = useRef<number | null>(null);
  const attachedAudioTrackIdsRef = useRef("");
  const incomingCallRef = useRef<SipSession | null>(null);
  const activeCallRef = useRef<SipSession | null>(null);

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

  const stopAudioDiagnostics = useCallback(() => {
    if (audioStatsIntervalRef.current !== null) {
      window.clearInterval(audioStatsIntervalRef.current);
      audioStatsIntervalRef.current = null;
    }
  }, []);

  const showIncomingCallSystemNotification = useCallback(async () => {
    if (
      window.ecomfyDesktop?.isDesktop ||
      document.visibilityState === "visible" ||
      window.localStorage.getItem("ecomfy-push-subscribed") === "true" ||
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const worker =
        navigator.serviceWorker.controller ||
        registration.active ||
        registration.waiting;

      worker?.postMessage({
        type: "INCOMING_CALL",
        payload: {
          url: "/dashboard",
        },
      });
    } catch (error) {
      console.warn("[Softphone] System notification could not be shown.", error);
    }
  }, []);

  const cleanupSession = useCallback(() => {
    stopRinging();
    incomingCallRef.current = null;
    activeCallRef.current = null;
    setIncomingCall(null);
    setActiveCall(null);
    setCallData(null);
    setCallStartedAt(null);
    setElapsedSeconds(0);
    setRemoteAudioStatus("waiting");
    attachedAudioTrackIdsRef.current = "";
    stopAudioDiagnostics();
    window.ecomfyDesktop?.callEnded();
  }, [stopAudioDiagnostics, stopRinging]);

  const attachRemoteAudio = useCallback((stream: MediaStream) => {
    const remoteAudio = remoteAudioRef.current;

    if (!remoteAudio) {
      console.warn("[Softphone] Remote audio element is unavailable.");
      return;
    }

    const audioTrackIds = stream
      .getAudioTracks()
      .map((track) => track.id)
      .sort()
      .join(",");

    if (audioTrackIds && audioTrackIds === attachedAudioTrackIdsRef.current) {
      console.info("[Softphone] Remote audio stream already attached.");
      return;
    }

    console.info("[Softphone] Attaching remote audio stream.", {
      audioTracks: stream.getAudioTracks().length,
      videoTracks: stream.getVideoTracks().length,
    });
    attachedAudioTrackIdsRef.current = audioTrackIds;
    remoteAudio.srcObject = stream;
    remoteAudio.muted = false;
    remoteAudio.volume = 1;
    setRemoteAudioStatus("receiving");

    void remoteAudio
      .play()
      .then(() => console.info("[Softphone] Remote audio playback started."))
      .catch((error: unknown) => {
        setRemoteAudioStatus("blocked");
        console.warn("[Softphone] Browser blocked remote audio playback.", error);
      });
  }, []);

  useEffect(() => {
    if (!callStartedAt) {
      return;
    }

    const updateElapsedTime = () => {
      setElapsedSeconds(Math.floor((Date.now() - callStartedAt) / 1000));
    };

    updateElapsedTime();
    const interval = window.setInterval(updateElapsedTime, 1000);

    return () => window.clearInterval(interval);
  }, [callStartedAt]);

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
      stopAudioDiagnostics();
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [stopAudioDiagnostics, stopRinging, unlockAudio]);

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

      if (!isMounted || !config.configured) {
        if (!config.configured) {
          console.warn("Softphone is not configured:", config.missing.join(", "));
        }
        return;
      }

      const socket = new JsSIP.WebSocketInterface(config.wssUrl);
      const ua = new JsSIP.UA({
        sockets: [socket],
        uri: `sip:${config.extension}@${config.sipDomain}`,
        password: config.password,
        session_timers: false,
        pcConfig: {
          iceServers: config.iceServers,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any) as UserAgent;

      uaRef.current = ua;
      console.info("[Softphone] Starting SIP registration.");

      ua.on("connected", () => console.info("[Softphone] Connected to Asterisk."));
      ua.on("registered", () => console.info("[Softphone] SIP extension registered."));
      ua.on("registrationFailed", () => {
        console.warn("[Softphone] SIP registration failed.");
      });
      ua.on("disconnected", () => console.warn("[Softphone] Disconnected from Asterisk."));

      ua.on("newRTCSession", (data: NewRtcSessionEvent) => {
        const session = data.session;

        if (data.originator !== "remote") {
          return;
        }

        console.info("[Softphone] Incoming SIP session received.");
        incomingCallRef.current = session;
        setIncomingCall(session);
        void showIncomingCallSystemNotification();

        session.on("peerconnection", () => {
          const peerConnection = session.connection;

          if (!peerConnection) {
            console.warn("[Softphone] SIP session did not provide a peer connection.");
            return;
          }

          console.info("[Softphone] Peer connection created.", {
            connectionState: peerConnection.connectionState,
            iceConnectionState: peerConnection.iceConnectionState,
          });

          peerConnection.addEventListener("icecandidate", (event) => {
            if (!event.candidate) {
              console.info("[Softphone] ICE candidate gathering completed.");
              return;
            }

            console.info("[Softphone] ICE candidate gathered.", {
              type: event.candidate.type,
              protocol: event.candidate.protocol,
            });
          });

          peerConnection.addEventListener("iceconnectionstatechange", () => {
            console.info("[Softphone] ICE connection state changed.", {
              state: peerConnection.iceConnectionState,
            });
          });

          const logInboundAudioStats = async () => {
            try {
              const stats = await peerConnection.getStats();

              stats.forEach((report) => {
                const isInboundAudio =
                  report.type === "inbound-rtp" &&
                  (report.kind === "audio" || report.mediaType === "audio");

                if (isInboundAudio) {
                  console.info("[Softphone] Inbound audio RTP stats.", {
                    bytesReceived: report.bytesReceived ?? 0,
                    packetsReceived: report.packetsReceived ?? 0,
                    packetsLost: report.packetsLost ?? 0,
                    jitter: report.jitter ?? 0,
                    audioLevel: report.audioLevel ?? "not reported",
                  });
                }
              });
            } catch (error) {
              console.warn("[Softphone] Could not read inbound audio stats.", error);
            }
          };

          stopAudioDiagnostics();
          void logInboundAudioStats();
          audioStatsIntervalRef.current = window.setInterval(() => {
            void logInboundAudioStats();
          }, 3000);

          const attachExistingAudioTracks = () => {
            const tracks = peerConnection
              .getReceivers()
              .map((receiver) => receiver.track)
              .filter((track): track is MediaStreamTrack => track?.kind === "audio");

            if (tracks.length > 0) {
              console.info("[Softphone] Found existing remote audio tracks.", {
                count: tracks.length,
              });
              attachRemoteAudio(new MediaStream(tracks));
            } else {
              console.info("[Softphone] Waiting for remote audio tracks.");
            }
          };

          peerConnection.addEventListener("track", (event: RTCTrackEvent) => {
            console.info("[Softphone] Remote track received.", {
              kind: event.track.kind,
              streamCount: event.streams.length,
            });
            if (event.track.kind !== "audio") {
              return;
            }

            attachRemoteAudio(
              event.streams[0] ?? new MediaStream([event.track]),
            );
          });

          peerConnection.addEventListener("addstream", (event: Event) => {
            const stream = (event as Event & { stream?: MediaStream }).stream;

            if (stream?.getAudioTracks().length) {
              console.info("[Softphone] Legacy remote stream received.", {
                audioTracks: stream.getAudioTracks().length,
              });
              attachRemoteAudio(stream);
            }
          });

          attachExistingAudioTracks();
        });

        session.on("getusermediafailed", () => {
          console.error("[Softphone] Microphone access denied or unavailable.");
        });

        session.on("ended", () => {
          console.info("[Softphone] SIP session ended.");
          cleanupSession();
        });
        session.on("failed", () => {
          console.warn("[Softphone] SIP session failed.");
          cleanupSession();
        });
      });

      ua.start();
    }

    startSoftphone().catch((error: unknown) => {
      console.error("Unable to start the WebRTC softphone.", error);
    });

    return () => {
      isMounted = false;
      uaRef.current?.stop();
      uaRef.current = null;
    };
  }, [
    attachRemoteAudio,
    cleanupSession,
    showIncomingCallSystemNotification,
    stopAudioDiagnostics,
  ]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("calls:ringall")
      .on(
        "broadcast",
        { event: "incoming_call" },
        (message: { payload: IncomingCallData }) => setCallData(message.payload),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!incomingCall || !window.ecomfyDesktop) return;

    window.ecomfyDesktop.showIncomingCall({
      callId: callData?.call_id,
      callerName: callData?.caller_name,
      callerNumber: callData?.caller_number,
      vertical: callData?.vertical,
    });
  }, [callData, incomingCall]);

  const answerCall = useCallback(() => {
    const session = incomingCallRef.current;

    if (!session) {
      return;
    }

    stopRinging();
    console.info("[Softphone] Answering incoming SIP call.");
    session.answer({
      mediaConstraints: {
        audio: true,
        video: false,
      },
    });
    activeCallRef.current = session;
    incomingCallRef.current = null;
    setActiveCall(session);
    setIncomingCall(null);
    setCallStartedAt(Date.now());
    window.ecomfyDesktop?.callAnswered();

    // The track event fires before the agent clicks Answer (JsSIP sets remote description
    // from the INVITE before answer() is called), so the initial .play() call has no user
    // gesture and Chrome blocks it. Retry here while we are inside the click handler.
    const remoteAudio = remoteAudioRef.current;
    if (remoteAudio) {
      console.info("[Softphone] Retrying audio playback after answer.", {
        hasSrcObject: !!remoteAudio.srcObject,
        paused: remoteAudio.paused,
        muted: remoteAudio.muted,
        volume: remoteAudio.volume,
      });
      remoteAudio.muted = false;
      remoteAudio.volume = 1;
      void remoteAudio
        .play()
        .then(() => {
          console.info("[Softphone] Remote audio playback confirmed after answer.");
          setRemoteAudioStatus("receiving");
        })
        .catch((err: unknown) => {
          console.warn("[Softphone] Browser blocked audio playback after answer.", err);
          setRemoteAudioStatus("blocked");
        });
    } else {
      setRemoteAudioStatus("waiting");
    }
  }, [stopRinging]);

  const hangupCall = useCallback(() => {
    stopRinging();
    console.info("[Softphone] Ending SIP call.");
    activeCallRef.current?.terminate();
    incomingCallRef.current?.terminate();
    cleanupSession();
  }, [cleanupSession, stopRinging]);

  useEffect(() => {
    const desktop = window.ecomfyDesktop;
    if (!desktop) return;

    return desktop.onCallAction((action) => {
      if (action === "answer") {
        answerCall();
        return;
      }

      hangupCall();
    });
  }, [answerCall, hangupCall]);

  const caller = callData?.caller_name || callData?.caller_number || "Incoming caller";
  const callDuration = new Date(elapsedSeconds * 1000)
    .toISOString()
    .slice(11, 19);

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay />

      {incomingCall ? (
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
                  aria-label="Decline incoming call"
                  onClick={hangupCall}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#647084] hover:bg-[#f1f5fb] hover:text-[#173785]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 flex justify-center">
                <div className="relative">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#10b981]/20" />
                  <CallerInitials name={caller} />
                </div>
              </div>

              <h2 className="mt-6 text-3xl font-semibold">{caller}</h2>
              <p className="mt-2 text-[#647084]">
                {callData?.caller_number || "High-intent insurance caller"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
                <div className="rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3">
                  <p className="text-[#647084]">Vertical</p>
                  <p className="mt-1 font-semibold">{callData?.vertical || "Insurance"}</p>
                </div>
                <div className="rounded-[8px] border border-[#d8e2f0] bg-[#f8fbff] p-3">
                  <p className="text-[#647084]">Call ID</p>
                  <p className="mt-1 truncate font-mono text-xs font-semibold">
                    {callData?.call_id || "Pending"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={hangupCall}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#ef4444] text-sm font-semibold text-white shadow-sm hover:bg-[#dc2626]"
                >
                  <PhoneOff className="h-4 w-4" />
                  Decline
                </button>
                <button
                  type="button"
                  onClick={answerCall}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#10b981] text-sm font-semibold text-white shadow-sm hover:bg-[#059669]"
                >
                  <PhoneCall className="h-4 w-4" />
                  Answer
                </button>
              </div>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#647084]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#047857]" />
                Live call from Asterisk
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {activeCall ? (
        <section className="fixed bottom-5 right-5 z-40 w-[min(360px,calc(100vw-2.5rem))] rounded-[8px] border border-[#d8e2f0] bg-white p-4 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9fff6] text-[#047857]">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{caller}</p>
                <p className="mt-0.5 text-xs text-[#647084]">
                  {remoteAudioStatus === "receiving"
                    ? "Audio connected"
                    : remoteAudioStatus === "blocked"
                      ? "Audio playback blocked"
                      : "Connecting audio"}
                </p>
              </div>
            </div>
            <time className="shrink-0 font-mono text-sm font-semibold text-[#173785]">
              {callDuration}
            </time>
          </div>
          <button
            type="button"
            onClick={hangupCall}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#ef4444] text-sm font-semibold text-white hover:bg-[#dc2626]"
          >
            <PhoneOff className="h-4 w-4" />
            Hang up
          </button>
        </section>
      ) : null}
    </>
  );
}
