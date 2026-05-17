import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

/**
 * Supabase may redirect to Site URL (/) with ?code= instead of /auth/callback.
 * Forward OAuth returns to the callback route so the session can be exchanged.
 */
export function OAuthReturnHandler() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/auth/callback") return;

    const search = window.location.search;
    const hash = window.location.hash;
    const hasCode = new URLSearchParams(search).has("code");
    const hasHashSession =
      hash.includes("access_token=") && hash.includes("refresh_token=");

    if (!hasCode && !hasHashSession) return;

    const target = `/auth/callback${search}${hash}`;
    window.location.replace(target);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
