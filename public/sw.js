const APP_URL = "/dashboard";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function incomingCallOptions(data = {}) {
  const caller = data.callerName || data.callerNumber || "Cliente interesado";

  return {
    body: `${caller} está esperando para hablar contigo.`,
    icon: "/images/ecomfy-lead-icon-512.png",
    badge: "/images/ecomfy-lead-icon-512.png",
    tag: data.callId ? `incoming-call-${data.callId}` : "incoming-call",
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [300, 120, 300, 120, 500],
    timestamp: Date.now(),
    data: {
      url: data.url || APP_URL,
      callId: data.callId || null,
    },
    actions: [{ action: "open", title: "Abrir llamada" }],
  };
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "INCOMING_CALL") {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(
      "Llamada entrante en EcomfyCalls",
      incomingCallOptions(event.data.payload),
    ),
  );
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data?.json() || {};
  } catch {
    data = { body: event.data?.text() || "" };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Llamada entrante en EcomfyCalls",
      {
        ...incomingCallOptions(data),
        body: data.body || incomingCallOptions(data).body,
      },
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = event.notification.data?.url || APP_URL;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      (windowClients) => {
        const appClient = windowClients.find((client) => {
          const clientUrl = new URL(client.url);
          return clientUrl.origin === self.location.origin;
        });

        if (appClient) {
          const appUrl = new URL(appClient.url);

          if (appUrl.pathname.startsWith("/dashboard")) {
            return appClient.focus();
          }

          return appClient.navigate(destination).then((navigatedClient) => {
            return navigatedClient?.focus();
          });
        }

        return self.clients.openWindow(destination);
      },
    ),
  );
});
