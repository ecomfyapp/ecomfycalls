"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PUSH_SUBSCRIBED_KEY = "ecomfy-push-subscribed";
const NOTIFICATION_PERMISSION_EVENT =
  "ecomfy:notification-permission-granted";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

function keysMatch(current: ArrayBuffer | null, expected: Uint8Array) {
  if (!current) return false;
  const currentBytes = new Uint8Array(current);
  return (
    currentBytes.length === expected.length &&
    currentBytes.every((value, index) => value === expected[index])
  );
}

async function saveSubscription(subscription: PushSubscription) {
  const response = await fetch("/api/push/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });

  if (!response.ok) {
    throw new Error(`Push subscription API returned ${response.status}.`);
  }

  window.localStorage.setItem(PUSH_SUBSCRIBED_KEY, "true");
  console.info("[PWA] Web Push subscription is active.");
}

async function syncPushSubscription(registration: ServiceWorkerRegistration) {
  if (
    !("PushManager" in window) ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    window.localStorage.removeItem(PUSH_SUBSCRIBED_KEY);
    return;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.warn("[PWA] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured.");
    return;
  }

  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  let subscription = await registration.pushManager.getSubscription();

  if (
    subscription &&
    !keysMatch(subscription.options.applicationServerKey, applicationServerKey)
  ) {
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  await saveSubscription(subscription);
}

export function PwaRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.ecomfyDesktop?.isDesktop || !("serviceWorker" in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    async function registerAndSync() {
      registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      if (pathname.startsWith("/dashboard")) {
        await syncPushSubscription(registration);
      }
    }

    function handlePermissionGranted() {
      if (registration && pathname.startsWith("/dashboard")) {
        void syncPushSubscription(registration).catch((error: unknown) => {
          console.warn("[PWA] Push subscription failed.", error);
        });
      }
    }

    window.addEventListener(
      NOTIFICATION_PERMISSION_EVENT,
      handlePermissionGranted,
    );

    void registerAndSync().catch((error: unknown) => {
      window.localStorage.removeItem(PUSH_SUBSCRIBED_KEY);
      console.warn("[PWA] Service worker or push registration failed.", error);
    });

    return () => {
      window.removeEventListener(
        NOTIFICATION_PERMISSION_EVENT,
        handlePermissionGranted,
      );
    };
  }, [pathname]);

  return null;
}
