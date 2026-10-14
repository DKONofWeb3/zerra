import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/api/supabase";
import { getPostLoginRedirect } from "../../lib/redirectAfterLogin";
import HeroPanel from "../Login/HeroPanel";
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon } from "../Login/AuthIcons";
import "../Login/auth.css";

// Reached from the password-reset email via /auth/callback, which has already
// established a (recovery) session. Without one there is nothing to update.
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<"checking" | "ok" | "none">("checking");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Set a new password";
    supabase.auth.getSession().then(({ data }) => setReady(data.session ? "ok" : "none"));
  }, []);

  const submit = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      const redirectTo = await getPostLoginRedirect(data.user.id);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__frame">
        <HeroPanel />
        <main className="pane">
          <a className="pane__mobile-brand" href="/">
            <img src="/login-bg/z-logo.png" alt="" />
            Zerra
          </a>
          <form className="card" noValidate onSubmit={(e) => { e.preventDefault(); if (ready === "ok") submit(); }}>
            {ready === "none" ? (
              <>
                <h1 className="card__title">Link expired</h1>
                <p className="card__sub">This reset link is no longer valid. Request a new one from the login page.</p>
                <a className="btn-primary" href="/login?mode=signin" style={{ textDecoration: "none" }}>
                  Back to Log In <ArrowRightIcon />
                </a>
              </>
            ) : (
              <>
                <h1 className="card__title">Set a new password</h1>
                <p className="card__sub">Choose a password with at least 8 characters.</p>
                <div aria-live="polite">
                  {error && <div className="msg msg--err" role="alert">{error}</div>}
                </div>
                <label className="field">
                  <span className="field__label">New password</span>
                  <span className="field__box">
                    <span className="field__icon"><LockIcon /></span>
                    <input
                      className="field__input field__input--pw" type={show ? "text" : "password"}
                      autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                    <button type="button" className="field__eye" aria-label={show ? "Hide password" : "Show password"}
                      aria-pressed={show} onClick={() => setShow((s) => !s)}>
                      {show ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </span>
                </label>
                <div style={{ height: 6 }} />
                <button className="btn-primary" type="submit" disabled={loading || ready !== "ok"}>
                  {loading ? "Please wait..." : (<>Update password <ArrowRightIcon /></>)}
                </button>
              </>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
