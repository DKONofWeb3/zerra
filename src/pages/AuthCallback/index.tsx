import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/api/supabase";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getPostLoginRedirect } from "../../lib/redirectAfterLogin";

export default function AuthCallback() {
  usePageTitle("Signing in to Zerra");
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    async function handleCallback() {
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const accessToken  = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error || !data.session) {
            console.error("Session error:", error);
            setStatus("error");
          } else {
            const redirectTo = await getPostLoginRedirect(data.session.user.id);
            navigate(redirectTo, { replace: true });
          }
          return;
        }
      }

      // No hash — check if session already exists (Google OAuth etc.)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const redirectTo = await getPostLoginRedirect(data.session.user.id);
        navigate(redirectTo, { replace: true });
        return;
      }

      // Listen for auth state change as final fallback
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
          const redirectTo = await getPostLoginRedirect(session.user.id);
          navigate(redirectTo, { replace: true });
        }
      });

      setTimeout(() => setStatus("error"), 5000);
      return () => subscription.unsubscribe();
    }

    handleCallback();
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
      <p className="text-fg-secondary text-[14px]">Signing you in...</p>
    </div>
  );
}