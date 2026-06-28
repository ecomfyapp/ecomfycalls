type EcomfyDesktopCallAction = "answer" | "decline" | "hangup";

type EcomfyDesktopCallData = {
  callId?: string;
  callerName?: string;
  callerNumber?: string;
  vertical?: string;
};

interface Window {
  ecomfyDesktop?: {
    isDesktop: true;
    showIncomingCall: (data: EcomfyDesktopCallData) => void;
    callAnswered: () => void;
    callEnded: () => void;
    onCallAction: (
      callback: (action: EcomfyDesktopCallAction) => void,
    ) => () => void;
  };
}
