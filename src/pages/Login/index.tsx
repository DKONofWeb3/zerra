import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInWithGoogle } from "../../lib/api/auth";
import { supabase } from "../../lib/api/supabase";
import { getPostLoginRedirect } from "../../lib/redirectAfterLogin";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signin" ? "signin" : "signup";
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = mode === "signup" ? "Join Zerra" : "Welcome back to Zerra";
  }, [mode]);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true); setError(null); setSuccess(null);

    try {
      if (mode === "signup") {
        const { data: signInCheck } = await supabase.auth.signInWithPassword({ email, password: "___check___" });
        if (signInCheck?.session) {
          setError("An account with this email already exists. Try logging in instead.");
          setLoading(false);
          return;
        }

        // Explicit emailRedirectTo matters now: "/" itself redirects to the
        // external Framer homepage (see vercel.json), so without this the
        // confirmation link would land there instead of processing the
        // session and never reach the dashboard.
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });

        if (signUpError) {
          if (
            signUpError.message.toLowerCase().includes("already registered") ||
            signUpError.message.toLowerCase().includes("already exists") ||
            signUpError.message.toLowerCase().includes("user already")
          ) {
            setError("An account with this email already exists. Try logging in instead.");
          } else {
            throw signUpError;
          }
          return;
        }

        if (data?.user && data.user.identities?.length === 0) {
          setError("An account with this email already exists. Try logging in instead.");
          return;
        }

        setSuccess("Check your email to confirm your account.");
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          if (signInError.message.toLowerCase().includes("invalid login")) {
            setError("Incorrect email or password. Please try again.");
          } else if (signInError.message.toLowerCase().includes("email not confirmed")) {
            setError("Please confirm your email first. Check your inbox for the confirmation link.");
          } else {
            throw signInError;
          }
          return;
        }
        // Role-based redirect — admins go to /admin, projects go to /project, creators go to /dashboard
        const redirectTo = await getPostLoginRedirect(signInData.user!.id);
        navigate(redirectTo, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true); setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    display: "block", width: "100%",
    padding: "13px 15px",
    background: "rgb(5 6 10)",
    border: "1px solid rgb(22 25 36)",
    borderRadius: 10, fontSize: 13.5,
    color: "rgb(245 245 247)",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .login-page   { padding: 0 !important; gap: 0 !important; }
          .login-left   { display: none !important; }
          .login-right  { flex: 1 !important; border-radius: 0 !important; background: #010d1e !important; }
          .login-ambient-glow { display: none !important; }
          .login-mobile-glow  { display: block !important; }
          .login-form   { padding: 0 24px !important; max-width: 100% !important; }
          .login-intro  { text-align: center !important; }
          .mobile-logo  { color: rgb(0 0 0) !important; }
          .desktop-or-text { display: none !important; }
          .mobile-or-text  { display: inline !important; }
        }
      `}</style>

      <div className="login-page" style={{
        display: "flex", minHeight: "100vh", background: "rgb(6 8 14)",
        padding: 24, gap: 40, boxSizing: "border-box",
        fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
        WebkitFontSmoothing: "antialiased",
      }}>

        {/* LEFT PANEL — exact Figma-rendered card (logo, badge, mini-cards, headline
            and copy are all baked into this image, pulled straight from the design
            file at nodes 358:44/358:138 — hand-recreating the gradient+glass-card
            composition in CSS didn't match, so this uses the real pixels instead).
            Two source images only because the mini-card text ("Welcome" vs
            "Welcome Back") is the one thing that differs by mode. */}
        <div className="login-left" style={{
          flex: "1 1 51%", position: "relative", overflow: "hidden", borderRadius: 24,
        }}>
          <img
            src={mode === "signup" ? "/login-bg/card-signup.png" : "/login-bg/card-login.png"}
            alt="Zerra — turn your content into a financial asset"
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right" style={{
          flex: "1 1 49%", position: "relative", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgb(6 8 14)", overflow: "hidden",
        }}>
          <div aria-hidden className="login-ambient-glow" style={{ position: "absolute", bottom: "-10%", left: "-10%", right: "-10%", height: "55%", background: "radial-gradient(ellipse 90% 80% at 40% 100%, rgb(40 70 180 / 0.2) 0%, rgb(70 30 160 / 0.1) 45%, transparent 70%)", pointerEvents: "none" }} />

          {/* Mobile-only glow — the real Figma gradient assets (nodes 359:1261-1263 from
              358:230), positioned as percentages of the 430×932 reference frame so the
              layered plus-lighter blend reproduces the actual glow shape, not a guessed
              CSS gradient. Hidden on desktop (the card image already has its own glow). */}
          <div aria-hidden className="login-mobile-glow" style={{ display: "none", position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: "-79.82%", top: "-72.42%", width: "259.51%", height: "113.99%" }}>
              <div style={{ position: "absolute", inset: "-15.71% -14.95%" }}>
                <img src="/login-bg/mobile-glow-1.svg" alt="" style={{ display: "block", width: "100%", height: "100%" }} />
              </div>
            </div>
            <div style={{ position: "absolute", left: "-57.67%", top: "-69.96%", width: "215.50%", height: "94.63%", mixBlendMode: "plus-lighter" }}>
              <div style={{ position: "absolute", inset: "-15.71% -14.95%" }}>
                <img src="/login-bg/mobile-glow-2.svg" alt="" style={{ display: "block", width: "100%", height: "100%" }} />
              </div>
            </div>
            <div style={{ position: "absolute", left: "-57.91%", top: "-77.90%", width: "215.50%", height: "94.63%", mixBlendMode: "plus-lighter" }}>
              <div style={{ position: "absolute", inset: "-15.71% -14.95%" }}>
                <img src="/login-bg/mobile-glow-2.svg" alt="" style={{ display: "block", width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", top: 24, left: 0, right: 0, zIndex: 1, display: "flex", justifyContent: "center" }}>
            <style>{`@media (min-width: 768px) { .mobile-logo { display: none !important; } }`}</style>
            <span className="mobile-logo" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgb(74 125 255)" }}>
              <img src="/login-bg/z-logo.png" alt="" style={{ width: 20, height: 16 }} />
              <span style={{ fontSize: 18, fontWeight: 500 }}>Zerra</span>
            </span>
          </div>

          <div className="login-form" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, padding: "0 44px" }}>
            <div className="login-intro">
              <h2 style={{ margin: "0 0 10px", fontSize: 34, fontWeight: 700, color: "rgb(245 245 247)", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                {mode === "signup" ? "Sign Up Account" : "Welcome Back"}
              </h2>
              <p style={{ margin: "0 0 32px", fontSize: 13, color: "rgb(100 104 116)", lineHeight: 1.65 }}>
                Access your earnings, points, rewards and projects anytime, anywhere and keep everything flowing in one place.
              </p>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgb(232 80 80 / 0.08)", border: "1px solid rgb(232 80 80 / 0.18)", borderRadius: 10, fontSize: 13, color: "rgb(232 80 80)", lineHeight: 1.5 }}>
                {error}
                {error.includes("already exists") && (
                  <button onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
                    style={{ display: "block", marginTop: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "rgb(74 125 255)", fontFamily: "inherit", padding: 0 }}>
                    Switch to Login →
                  </button>
                )}
              </div>
            )}
            {success && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgb(61 214 140 / 0.08)", border: "1px solid rgb(61 214 140 / 0.18)", borderRadius: 10, fontSize: 13, color: "rgb(61 214 140)" }}>
                {success}
              </div>
            )}

            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: "rgb(158 162 175)" }}>Your Email</p>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="adamcaptain@icreatorfi.com"
              style={{ ...inputStyle, marginBottom: 16 }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(74,125,255,0.45)")}
              onBlur={(e)  => (e.target.style.borderColor = "rgb(22 25 36)")} />

            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: "rgb(158 162 175)" }}>
              {mode === "signup" ? "Create Password" : "Password"}
            </p>
            <div style={{ position: "relative", marginBottom: 28 }}>
              <input type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(74,125,255,0.45)")}
                onBlur={(e)  => (e.target.style.borderColor = "rgb(22 25 36)")} />
              <button onClick={() => setShowPassword((p) => !p)}
                style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgb(60 64 78)", padding: 0, display: "flex", alignItems: "center" }}>
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              style={{ display: "block", width: "100%", padding: "13px", marginBottom: 24, background: "rgb(11 13 20)", border: "1px solid rgb(36 40 55)", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: loading ? "rgb(60 64 78)" : "rgb(230 230 235)", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: "0.1px", boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.04), 0 1px 3px rgb(0 0 0 / 0.4)", transition: "background 0.15s" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "rgb(16 19 28)"); }}
              onMouseLeave={(e) => { (e.currentTarget.style.background = "rgb(11 13 20)"); }}>
              {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Login"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "rgb(22 25 36)" }} />
              <span style={{ fontSize: 11.5, color: "rgb(55 58 70)", whiteSpace: "nowrap" }}>
                <span className="desktop-or-text">or continue with</span>
                <span className="mobile-or-text" style={{ display: "none" }}>Or</span>
              </span>
              <div style={{ flex: 1, height: 1, background: "rgb(22 25 36)" }} />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              <button onClick={handleGoogle} disabled={googleLoading}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 6px", background: "rgb(8 9 14)", border: "1px solid rgb(22 25 36)", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "rgb(220 222 228)", cursor: googleLoading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "border-color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgb(36 40 55)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgb(22 25 36)")}>
                <svg width="15" height="15" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? "..." : "Google"}
              </button>

              <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 6px", background: "rgb(8 9 14)", border: "1px solid rgb(22 25 36)", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "rgb(220 222 228)", cursor: "not-allowed", fontFamily: "inherit" }} title="Coming soon">
                <svg width="13" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z"/>
                </svg>
                TikTok
              </button>

              <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 6px", background: "rgb(8 9 14)", border: "1px solid rgb(22 25 36)", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "rgb(220 222 228)", cursor: "not-allowed", fontFamily: "inherit" }} title="Coming soon">
                <svg width="16" height="11" viewBox="0 0 24 17" fill="none">
                  <path d="M23.5 2.5s-.3-1.8-1-2.6c-1-.9-2-.9-2.5-1C17 .7 12 .7 12 .7s-5 0-8 .2C3.5.9 2.4.9 1.5 1.9c-.7.8-1 2.6-1 2.6S.2 4.6.2 6.7v2C.2 10.8.5 12.6.5 12.6s.3 1.8 1 2.6c1 .9 2.2.9 2.8 1C6.2 16.4 12 16.4 12 16.4s5 0 8-.2c.5-.1 1.5-.1 2.5-1 .7-.8 1-2.6 1-2.6s.3-1.8.3-3.9v-2C23.8 4.6 23.5 2.5 23.5 2.5zM9.7 11.5v-6l6.6 3-6.6 3z" fill="#FF0000"/>
                </svg>
                YouTube
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: 13, color: "rgb(70 74 86)", margin: 0 }}>
              {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); setSuccess(null); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "rgb(74 125 255)", fontFamily: "inherit", padding: 0 }}>
                {mode === "signup" ? "Login" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}