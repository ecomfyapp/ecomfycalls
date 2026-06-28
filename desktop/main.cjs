const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  powerSaveBlocker,
  screen,
  session,
  Tray,
} = require("electron");
const path = require("node:path");

const APP_URL =
  process.env.ECOMFY_APP_URL || "https://www.ecomfycalls.com/dashboard";
const APP_ORIGIN = new URL(APP_URL).origin;
const PARTITION = "persist:ecomfycalls";

let mainWindow = null;
let callWindow = null;
let tray = null;
let isQuitting = false;
let suspensionBlockerId = null;
let currentCall = null;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

function isTrustedAppSender(event) {
  if (!mainWindow || event.sender !== mainWindow.webContents) return false;

  try {
    return new URL(event.sender.getURL()).origin === APP_ORIGIN;
  } catch {
    return false;
  }
}

function sanitizeCallData(value) {
  const data = value && typeof value === "object" ? value : {};
  const clean = (input, max = 120) =>
    typeof input === "string" ? input.slice(0, max) : "";

  return {
    callId: clean(data.callId, 200),
    callerName: clean(data.callerName),
    callerNumber: clean(data.callerNumber, 40),
    vertical: clean(data.vertical, 80),
  };
}

function createMainWindow(show = true) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: "#f6f9ff",
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
      partition: PARTITION,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(APP_URL);

  mainWindow.once("ready-to-show", () => {
    if (show) mainWindow.show();
  });

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function positionCallWindow() {
  if (!callWindow) return;
  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const [width, height] = callWindow.getSize();
  callWindow.setPosition(
    workArea.x + workArea.width - width - 24,
    workArea.y + workArea.height - height - 24,
  );
}

function createCallWindow() {
  callWindow = new BrowserWindow({
    width: 410,
    height: 520,
    minWidth: 410,
    minHeight: 520,
    maxWidth: 410,
    maxHeight: 520,
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    show: false,
    skipTaskbar: false,
    backgroundColor: "#ffffff",
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });

  callWindow.setAlwaysOnTop(true, "pop-up-menu");
  callWindow.loadFile(path.join(__dirname, "popup", "index.html"));
  callWindow.once("ready-to-show", () => {
    positionCallWindow();
    callWindow.show();
    callWindow.focus();
    if (currentCall) callWindow.webContents.send("desktop:call-data", currentCall);
  });
  callWindow.on("closed", () => {
    callWindow = null;
  });
}

function showIncomingCall(data) {
  currentCall = sanitizeCallData(data);

  if (!callWindow || callWindow.isDestroyed()) {
    createCallWindow();
  } else {
    callWindow.webContents.send("desktop:call-data", currentCall);
    positionCallWindow();
    callWindow.show();
    callWindow.focus();
  }

  if (Notification.isSupported()) {
    new Notification({
      title: "Llamada entrante en EcomfyCalls",
      body: currentCall.callerName || "Un cliente está esperando.",
      silent: false,
    }).show();
  }
}

function closeCallWindow() {
  currentCall = null;
  if (callWindow && !callWindow.isDestroyed()) callWindow.close();
}

function createTray() {
  const trayImage = nativeImage
    .createFromPath(path.join(__dirname, "assets", "icon.png"))
    .resize({ width: 20, height: 20 });
  tray = new Tray(trayImage);
  tray.setToolTip("EcomfyCalls");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Abrir EcomfyCalls",
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
      { type: "separator" },
      {
        label: "Salir",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]),
  );
  tray.on("double-click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function configurePermissions() {
  const persistentSession = session.fromPartition(PARTITION);
  persistentSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      let trusted = false;
      try {
        trusted = new URL(webContents.getURL()).origin === APP_ORIGIN;
      } catch {}

      callback(trusted && ["media", "notifications"].includes(permission));
    },
  );
}

ipcMain.on("softphone:incoming-call", (event, data) => {
  if (isTrustedAppSender(event)) showIncomingCall(data);
});

ipcMain.on("softphone:call-answered", (event) => {
  if (!isTrustedAppSender(event) || !callWindow) return;
  callWindow.webContents.send("desktop:call-state", "active");
});

ipcMain.on("softphone:call-ended", (event) => {
  if (isTrustedAppSender(event)) closeCallWindow();
});

ipcMain.on("call-popup:action", (event, action) => {
  if (!callWindow || event.sender !== callWindow.webContents) return;
  if (!["answer", "decline", "hangup"].includes(action)) return;
  mainWindow?.webContents.send("desktop:call-action", action);
});

app.whenReady().then(() => {
  app.setAppUserModelId("com.ecomfycalls.desktop");
  configurePermissions();
  createMainWindow(!process.argv.includes("--hidden"));
  createTray();
  suspensionBlockerId = powerSaveBlocker.start("prevent-app-suspension");

  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: true,
      args: ["--hidden"],
    });
  }
});

app.on("second-instance", () => {
  mainWindow?.show();
  mainWindow?.focus();
});

app.on("before-quit", () => {
  isQuitting = true;
  if (suspensionBlockerId !== null) powerSaveBlocker.stop(suspensionBlockerId);
});

app.on("window-all-closed", () => {
  // Keep the tray process and JsSIP renderer alive until the user selects Exit.
});
