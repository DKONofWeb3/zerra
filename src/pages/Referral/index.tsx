// src/pages/Referral/index.tsx
// Handles zerra.pro/ref/:code — stores the referral code in localStorage
// and redirects to signup. The code is applied after the user completes
// signup and logs in for the first time via useReferral() hook.

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ReferralRedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate  = useNavigate();

  useEffect(() => {
    if (code) {
      // Store in localStorage so it survives the email confirmation redirect
      localStorage.setItem("zerra:referral_code", code);
    }
    // Send them straight to signup
    navigate("/login?mode=signup", { replace: true });
  }, [code, navigate]);

  return null; // instant redirect, nothing to render
}