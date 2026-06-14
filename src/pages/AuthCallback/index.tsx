import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/api/supabase";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AuthCallback() {
  usePageTitle("Signing in to Zerra");
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    // Supabase puts the token in the URL hash: #access_token=...&type=signup
    // We need to explicitly exchange it
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken  = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    // const type = params.get("type"); // unused

    if (accessToken && refreshToken) {
      // Exchange the tokens from the URL hash into a real session
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          if (error || !data.session) {
            setStatus("error");
          } else {
            navigate("/dashboard", { replace: true });
          }
        });
      return;
    }

    // Fallback: listen for auth state change (Google OAuth, magic link etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        navigate("/dashboard", { replace: true });
      }
    });

    // Also check if session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/dashboard", { replace: true });
      } else {
        setTimeout(() => setStatus("error"), 4000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base gap-4 px-4">
        <div className="text-center">
          <p className="text-fg-primary text-[16px] font-medium mb-2">Confirmation link expired</p>
          <p className="text-fg-tertiary text-[13px] mb-6">
            Email confirmation links expire after 24 hours. Please sign up again.
          </p>
          <a href="/login" className="px-6 py-2.5 rounded-xl text-[13.5px] font-semibold text-white"
            style={{ background: "rgb(74 125 255)" }}>
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
      <p className="text-fg-secondary text-[14px]">Confirming your email...</p>
    </div>
  );
}