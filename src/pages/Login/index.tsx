import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signInWithGoogle } from "../../lib/api/auth";
import { supabase } from "../../lib/api/supabase";
import { setRememberMe } from "../../lib/api/rememberStorage";
import { getPostLoginRedirect } from "../../lib/redirectAfterLogin";
import HeroPanel from "./HeroPanel";
import {
  AppleIcon, ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon, GoogleIcon, LockIcon, MailIcon,
} from "./AuthIcons";
import "./auth.css";

type Mode = "signup" | "signin" | "forgot";

const TITLES: Record<Mode, string> = {
  signup: "Join Zerra",
  signin: "Welcome back to Zerra",
  forgot: "Reset your password",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode: Mode = searchParams.get("mode") === "signin" ? "signin" : "signup";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = TITLES[mode];
  }, [mode]);

  const go = (next: Mode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
  };

  const handleForgot = async () => {
    if (!email) { setError("Enter the email you signed up with."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (resetError) throw resetError;
      // Same message whether or not the address has an account (no account enumeration).
      setSuccess("If an account exists for that email, a reset link is on its way.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === "forgot") return handleForgot();
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
        // Decide where the session is stored *before* it is created.
        setRememberMe(remember);
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
      setRememberMe(remember);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  const title =
    mode === "signup" ? "Create your account" : mode === "signin" ? "Welcome back" : "Forgot password?";
  const sub =
    mode === "signup"
      ? "Start turning your content into income. It takes less than a minute."
      : mode === "signin"
        ? "Log in to see your earnings, rewards and projects."
        : "Enter your email and we'll send you a link to set a new password.";
  const submitLabel = mode === "signup" ? "Sign Up" : mode === "signin" ? "Log In" : "Send reset link";

  return (
    <div className="auth">
      <div className="auth__frame">
        <HeroPanel />

        <main className="pane">
          <a className="pane__mobile-brand" href="/">
            <img src="/login-bg/z-logo.png" alt="" />
            Zerra
          </a>

          <div className="pane__top">
            <div className="switch-pill">
              <span>{mode === "signup" ? "Already have an account?" : "Don't have an account?"}</span>
              <button type="button" onClick={() => go(mode === "signup" ? "signin" : "signup")}>
                {mode === "signup" ? "Log In" : "Sign Up"}
              </button>
            </div>
          </div>

          <form
            className="card"
            noValidate
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          >
            <h1 className="card__title">{title}</h1>
            <p className="card__sub">{sub}</p>

            <div aria-live="polite">
              {error && (
                <div className="msg msg--err" role="alert">
                  {error}
                  {error.includes("already exists") && (
                    <button type="button" className="link" onClick={() => go("signin")}>
                      Switch to Login →
                    </button>
                  )}
                </div>
              )}
              {success && <div className="msg msg--ok">{success}</div>}
            </div>

            <label className="field">
              <span className="field__label">Email</span>
              <span className="field__box">
                <span className="field__icon"><MailIcon /></span>
                <input
                  className="field__input" type="email" autoComplete="email" inputMode="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </span>
            </label>

            {mode !== "forgot" && (
              <label className="field">
                <span className="field__label">{mode === "signup" ? "Create password" : "Password"}</span>
                <span className="field__box">
                  <span className="field__icon"><LockIcon /></span>
                  <input
                    className="field__input field__input--pw"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                  />
                  <button
                    type="button" className="field__eye"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </span>
              </label>
            )}

            {mode === "signin" && (
              <div className="row">
                <label className="check">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span className="check__box"><CheckIcon /></span>
                  Remember me
                </label>
                <button type="button" className="link" onClick={() => go("forgot")}>Forgot password?</button>
              </div>
            )}
            {mode !== "signin" && <div style={{ height: 6 }} />}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Please wait..." : (<>{submitLabel} <ArrowRightIcon /></>)}
            </button>

            {mode === "forgot" ? (
              <p className="legal">
                <button type="button" className="link" onClick={() => go("signin")}>← Back to Log In</button>
              </p>
            ) : (
              <>
                <div className="divider">or continue with</div>
                <div className="social">
                  <button type="button" className="btn-social" onClick={handleGoogle} disabled={googleLoading}>
                    <GoogleIcon size={18} />
                    {googleLoading ? "..." : "Continue with Google"}
                  </button>
                  <button type="button" className="btn-social" disabled title="Coming soon">
                    <AppleIcon size={18} />
                    <span>Apple <small>(soon)</small></span>
                  </button>
                </div>
                <p className="legal">
                  By continuing, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
                </p>
              </>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
