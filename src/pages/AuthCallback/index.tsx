import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/api/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-base">
      <p className="text-fg-secondary text-sm">Signing you in...</p>
    </div>
  );
}