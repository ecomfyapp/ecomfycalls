const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "ecomfyDesktop",
  Object.freeze({
    isDesktop: true,
    showIncomingCall: (data) =>
      ipcRenderer.send("softphone:incoming-call", data),
    callAnswered: () => ipcRenderer.send("softphone:call-answered"),
    callEnded: () => ipcRenderer.send("softphone:call-ended"),
    onCallAction: (callback) => {
      const listener = (_event, action) => callback(action);
      ipcRenderer.on("desktop:call-action", listener);
      return () => ipcRenderer.removeListener("desktop:call-action", listener);
    },
    onCallData: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on("desktop:call-data", listener);
      return () => ipcRenderer.removeListener("desktop:call-data", listener);
    },
    onCallState: (callback) => {
      const listener = (_event, state) => callback(state);
      ipcRenderer.on("desktop:call-state", listener);
      return () => ipcRenderer.removeListener("desktop:call-state", listener);
    },
    sendCallAction: (action) =>
      ipcRenderer.send("call-popup:action", action),
  }),
);
