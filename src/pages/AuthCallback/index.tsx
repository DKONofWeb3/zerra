import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/api/supabase";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AuthCallback() {
  usePageTitle("Signing in to Zerra");
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    // onAuthStateChange catches the SIGNED_IN event that fires when
    // Supabase processes the email confirmation token in the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard", { replace: true });
      } else if (event === "USER_UPDATED" && session) {
        // email_confirmed fires this — also send to dashboard
        navigate("/dashboard", { replace: true });
      }
    });

    // Also check immediately in case session already exists
    // (user clicked the link in the same browser where they signed up)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/dashboard", { replace: true });
      } else {
        // Give onAuthStateChange 4 seconds to fire before giving up
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
          <a
            href="/login"
            className="px-6 py-2.5 rounded-xl text-[13.5px] font-semibold text-white"
            style={{ background: "rgb(74 125 255)" }}
          >
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