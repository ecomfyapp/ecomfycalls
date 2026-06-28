const PRODUCTION_SITE_URL = "https://www.ecomfycalls.com";

export function getSiteUrl() {
  if (typeof window !== "undefined") {
    const isLocalhost = ["localhost", "127.0.0.1"].includes(
      window.location.hostname,
    );

    if (isLocalhost) {
      return window.location.origin;
    }
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    PRODUCTION_SITE_URL
  );
}

export function getAuthCallbackUrl(next = "/dashboard") {
  const callbackUrl = new URL("/auth/confirm", getSiteUrl());
  callbackUrl.searchParams.set("next", next);
  return callbackUrl.toString();
}

export function getAuthUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}
