"use client";

import { useEffect } from "react";

export function InviteHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const hashParams = new URLSearchParams(hash.slice(1));
    const type = hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (type === "invite" && accessToken && refreshToken) {
      window.location.replace(`/auth/update-password${hash}`);
    }
  }, []);

  return null;
}
