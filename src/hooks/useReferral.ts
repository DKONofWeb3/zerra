// src/hooks/useReferral.ts
// Called once after a new user's first login. Reads the stored referral
// code from localStorage, sends it to the backend, then clears it.
// Import and call this in AuthCallback or wherever you handle post-login.

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiPost } from "@/lib/api/client";

const STORAGE_KEY = "zerra:referral_code";

export function useReferral() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    const code = localStorage.getItem(STORAGE_KEY);
    if (!code) return;

    // Apply the referral — idempotent, safe to call multiple times
    apiPost("/auth/referral/apply", { referralCode: code })
      .then(() => {
        localStorage.removeItem(STORAGE_KEY);
        console.log("Referral applied:", code);
      })
      .catch((err) => {
        // If it fails (invalid code, already applied etc.) still clear it
        // so we don't keep retrying on every login
        console.warn("Referral apply failed:", err.message);
        localStorage.removeItem(STORAGE_KEY);
      });
  }, [session]);
}