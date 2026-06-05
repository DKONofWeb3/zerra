import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../../lib/api/auth";
import { supabase } from "../../lib/api/supabase";

const CARDS = [
  {
    src: "/creator-cards/card-1.png",
    style: { top: "8%", left: "52%", width: 210, transform: "rotate(-1.5deg)", zIndex: 5 },
  },
  {
    src: "/creator-cards/card-2.png",
    style: { top: "28%", left: "30%", width: 185, transform: "rotate(1deg)", zIndex: 4 },
  },
  {
    src: "/creator-cards/card-3.png",
    style: { top: "53%", left: "24%", width: 195, transform: "rotate(-1deg)", zIndex: 5 },
  },
  {
    src: "/creator-cards/card-4.png",
    style: { top: "50%", left: "53%", width: 200, transform: "rotate(1.5deg)", zIndex: 4 },
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
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
    setLoading(true); setError(null); setSuccess(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
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

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#000",
      fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
      WebkitFontSmoothing: "antialiased",
      overflow: "hidden",
    }}>
      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div style={{
        flex: "0 0 55%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "48px",
        background: "#000",
      }}>
        <img src="/login-bg/rect-blue.png" alt="" aria-hidden draggable={false}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
        />
        <img src="/login-bg/rect-overlay.png" alt="" aria-hidden draggable={false}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill", mixBlendMode: "overlay", opacity: 0.5, pointerEvents: "none", userSelect: "none" }}
        />
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, width: "60%", height: "35%", background: "radial-gradient(ellipse 80% 80% at 0% 100%, rgb(40 70 160 / 0.4) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

        {CARDS.map((card, i) => (
          <img key={i} src={card.src} alt={`Creator card ${i + 1}`} draggable={false}
            style={{ position: "absolute", borderRadius: 16, boxShadow: "0 24px 64px rgb(0 0 0 / 0.55), 0 4px 12px rgb(0 0 0 / 0.4)", objectFit: "cover", userSelect: "none", ...card.style }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ))}

        <div style={{ position: "relative", zIndex: 10, maxWidth: 460 }}>
          <h1 style={{ margin: "0 0 14px", fontSize: 42, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px", color: "rgb(245 245 247)" }}>
            Turn your content{" "}
            <span style={{ background: "linear-gradient(90deg, rgb(74 125 255), rgb(140 100 255))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              into a
            </span>
            {" "}financial asset
          </h1>
          <p style={{ margin: "0 0 28px", fontSize: 14, color: "rgb(110 115 128)", lineHeight: 1.6, maxWidth: 380 }}>
            Join thousands of creators earning more, growing faster, and building their brand with Zerra.
          </p>
          <button onClick={() => setMode("signup")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgb(12 14 20 / 0.75)", border: "1px solid rgb(44 50 65)", borderRadius: 9999, padding: "10px 20px", fontSize: 13.5, fontWeight: 500, color: "rgb(245 245 247)", cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
            Sign up
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <div style={{ flex: "0 0 45%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "rgb(8 9 14)", borderLeft: "1px solid rgb(18 20 28)", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", bottom: "-10%", left: "-10%", right: "-10%", height: "55%", background: "radial-gradient(ellipse 90% 80% at 40% 100%, rgb(40 70 180 / 0.2) 0%, rgb(70 30 160 / 0.1) 45%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, padding: "0 44px" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 34, fontWeight: 700, color: "rgb(245 245 247)", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
            {mode === "signup" ? "Create an account" : "Welcome back"}
          </h2>
          <p style={{ margin: "0 0 32px", fontSize: 13, color: "rgb(100 104 116)", lineHeight: 1.65 }}>
            {mode === "signup"
              ? "Access your earnings, points, rewards and projects anytime, anywhere and keep everything flowing in one place."
              : "Sign in to your Zerra account to continue."}
          </p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgb(232 80 80 / 0.08)", border: "1px solid rgb(232 80 80 / 0.18)", borderRadius: 10, fontSize: 13, color: "rgb(232 80 80)" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgb(61 214 140 / 0.08)", border: "1px solid rgb(61 214 140 / 0.18)", borderRadius: 10, fontSize: 13, color: "rgb(61 214 140)" }}>
              {success}
            </div>
          )}

          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: "rgb(158 162 175)" }}>Your Email</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="adamcaptain@icreatorfi.com"
            style={{ display: "block", width: "100%", marginBottom: 16, padding: "13px 15px", background: "rgb(5 6 10)", border: "1px solid rgb(22 25 36)", borderRadius: 10, fontSize: 13.5, color: "rgb(245 245 247)", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(74,125,255,0.45)")}
            onBlur={(e) => (e.target.style.borderColor = "rgb(22 25 36)")}
          />

          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: "rgb(158 162 175)" }}>
            {mode === "signup" ? "Create Password" : "Password"}
          </p>
          <div style={{ position: "relative", marginBottom: 28 }}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••••••" onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ display: "block", width: "100%", padding: "13px 42px 13px 15px", background: "rgb(5 6 10)", border: "1px solid rgb(22 25 36)", borderRadius: 10, fontSize: 13.5, color: "rgb(245 245 247)", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(74,125,255,0.45)")}
              onBlur={(e) => (e.target.style.borderColor = "rgb(22 25 36)")}
            />
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
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "rgb(22 25 36)" }} />
            <span style={{ fontSize: 11.5, color: "rgb(55 58 70)", whiteSpace: "nowrap" }}>or continue with</span>
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
              Google
            </button>

            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 6px", background: "rgb(8 9 14)", border: "1px solid rgb(22 25 36)", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "rgb(220 222 228)", cursor: "pointer", fontFamily: "inherit", opacity: 0.4 }} title="Coming soon">
              <svg width="13" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z"/>
              </svg>
              TikTok
            </button>

            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 6px", background: "rgb(8 9 14)", border: "1px solid rgb(22 25 36)", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: "rgb(220 222 228)", cursor: "pointer", fontFamily: "inherit", opacity: 0.4 }} title="Coming soon">
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
  );
}