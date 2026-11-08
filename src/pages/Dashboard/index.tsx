import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useBadges } from "@/hooks/useBadges";
import { connectTwitter, getCreatorProfile, getReadiness, type ReadinessResponse } from "@/lib/api";
import { Tag } from "lucide-react";
import { COMPONENTS, TIERS, biggestGaps, tierFor, tip } from "@/lib/readiness";
import { BadgeGlyph } from "@/components/icons/BadgeIcon";
import { HeaderActions } from "@/components/layout/HeaderActions";
import "./dashboard.css";

// The dashboard follows the Bloom design (Figma 541:1370 desktop / 541:1628
// mobile). Followers, influence, readiness score, name, avatar and badge are real. The
// % change chips have no data
// source yet, so they render as placeholders instead of invented numbers.

function fmt(n: number): string {
  if (n >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(2))}M`;
  if (n >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}K`;
  return String(Math.round(n));
}

function Glows() {
  return (
    <div className="dash-glows" aria-hidden>
      <div className="dash-glow-a" />
      <div className="dash-glow-b" />
    </div>
  );
}

function GlowBlob({ src, left, top, opacity }: { src: string; left: number; top: number; opacity: number }) {
  return (
    <>
      {[0, 1].map((i) => (
        <div key={i} className="dash-glowblob" style={{ left, top, width: 213.374, height: 100.855, opacity }}>
          <img src={src} alt="" />
        </div>
      ))}
    </>
  );
}

function StatCard({ label, icon, value, note, to, children }: {
  label: string; icon: string; value: string; note?: string; to?: string; children?: React.ReactNode;
}) {
  const body = (
    <>
      {children}
      <div className="dash-card__label">
        <span className="dash-card__icon"><img src={icon} alt="" /></span>
        {label}
      </div>
      <div className={value === "—" ? "dash-card__value is-empty" : "dash-card__value"}>
        {value}
        {note && <span className="dash-card__soon">{note}</span>}
      </div>
    </>
  );
  return to ? <Link to={to} className="dash-card">{body}</Link> : <div className="dash-card">{body}</div>;
}

const centred = (cx: string | number, cy: string | number, size: number, rotate: string): React.CSSProperties => ({
  left: cx, top: cy, width: size, height: size, transform: `translate(-50%, -50%) rotate(${rotate})`,
});

function BearArt() {
  const earImg: React.CSSProperties = { left: "-11.49%", top: "-5.74%", width: "122.98%", height: "122.97%" };
  return (
    <div className="dash-art">
      <div className="dash-bear" style={centred("85.94%", "81.27%", 99, "-14.73deg")}>
        <img src="/dash/bear-1.svg" alt="" style={{ inset: 0, width: "100%", height: "100%" }} />
      </div>
      <div className="dash-bear" style={centred("90.28%", "57.52%", 34.8, "-42.51deg")}>
        <img src="/dash/bear-2.svg" alt="" style={earImg} />
      </div>
      <div className="dash-bear" style={{ ...centred("77.1%", "65.99%", 34.8, "42.51deg"), transform: "translate(-50%, -50%) rotate(42.51deg) scaleX(-1)" }}>
        <img src="/dash/bear-3.svg" alt="" style={earImg} />
      </div>
    </div>
  );
}

function StarsArt() {
  const fill: React.CSSProperties = { inset: 0, width: "100%", height: "100%" };
  return (
    <div className="dash-art">
      <div className="dash-star" style={centred(279.7, 164.7, 141, "-19.16deg")}>
        <img src="/dash/star-1.svg" alt="" style={fill} />
      </div>
      <div className="dash-star" style={centred(293, 124, 69.2, "-19.16deg")}>
        <img src="/dash/star-2.svg" alt="" style={{ left: "-12.81%", top: "-2.7%", width: "112.81%", height: "105.4%" }} />
      </div>
      <div className="dash-star" style={centred(234, 161, 69.2, "-19.16deg")}>
        <img src="/dash/star-3.svg" alt="" style={{ left: 0, top: 0, width: "112.81%", height: "108.48%" }} />
      </div>
    </div>
  );
}

function ConnectXGate({ name }: { name: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const code = new URLSearchParams(window.location.search).get("error");
  const failedMessage = code === "twitter_already_linked"
    ? "That X account is already connected to a different Zerra account."
    : code?.startsWith("twitter_") ? "X connection failed. Please try again." : null;

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      await connectTwitter();
    } catch (e: any) {
      setError(e.message ?? "Couldn't start the connection. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="dash">
      <Glows />
      <div className="dash-mhead"><h1>Dashboard</h1><HeaderActions size={32} /></div>
      <section className="dash-gate">
        <h1>Welcome, {name}</h1>
        <p>Connect your X account to unlock your dashboard: your Smart Readiness score, where your voice is strongest, and how you stack up.</p>
        <button type="button" onClick={connect} disabled={busy} className="dash-gate__btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M18.9 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
          </svg>
          {busy ? "Opening…" : "Connect"}
        </button>
        {(error || failedMessage) && <p className="dash-gate__error">{error ?? failedMessage}</p>}
        <small>We only read public data from your account. Only you see your score.</small>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  usePageTitle("Zerra · Dashboard");
  const { session } = useAuth();
  const { user } = useCurrentUser();
  const { accounts, loading: accountsLoading, error: accountsError } = useSocialAccounts();
  const followers = accounts.reduce((s, a) => s + (a.follower_count ?? 0), 0);
  const tiktokFollowers = accounts.find((a) => a.platform === "tiktok")?.follower_count ?? null;
  const { badges } = useBadges(tiktokFollowers);

  const [influence, setInfluence] = useState<number | null>(null);
  useEffect(() => {
    if (!user?.username) return;
    let live = true;
    getCreatorProfile(user.username)
      .then((p) => { if (live) setInfluence(p.scorecard?.influence_score ?? null); })
      .catch(() => { /* leave as unknown */ });
    return () => { live = false; };
  }, [user?.username]);

  // Top Voices: the creator niches they are strongest in, from their Smart Readiness data.
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  useEffect(() => {
    let live = true;
    getReadiness().then((r) => { if (live) setReadiness(r); }).catch(() => { /* card keeps its empty state */ });
    return () => { live = false; };
  }, []);

  const now = new Date();
  const lastLogin = session?.user?.last_sign_in_at
    ? new Date(session.user.last_sign_in_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  // /me can come back without a name (profile never filled in), so fall back to what Supabase knows from sign-in.
  const meta = (session?.user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const emailName = (user?.email ?? session?.user?.email)?.split("@")[0];
  const name = user?.name?.trim() || user?.username || meta.full_name || meta.name || meta.user_name || emailName || "Creator";
  const avatar = user?.avatar || meta.avatar_url || meta.picture || null;
  const firstName = name.split(" ")[0];
  const attained = badges.filter((b) => b.attained);
  const role = attained[0]?.id === "early-creator" ? "Early Creator" : attained[0]?.shortLabel ?? "Creator";
  const followersValue = accounts.length === 0 && accountsLoading ? "—" : fmt(followers);

  // Smart Readiness score (replaces the old XP placeholders).
  const latest = readiness?.latest;
  const score = latest?.components ? latest.score : null;
  const tier = score != null ? tierFor(score) : null;
  const nextTier = score != null ? TIERS.find((t) => t.min > score) : null;
  // The bar fills across the current tier (e.g. 50 to 70), so it matches the "points to go" text and the target shown.
  const barPct = score == null ? 0 : nextTier ? ((score - (tier?.min ?? 0)) / (nextTier.min - (tier?.min ?? 0))) * 100 : 100;
  // The one area costing the most points, with what to do about it.
  const topGap = latest?.components ? biggestGaps(latest.components, 1)[0] : undefined;
  const focus = topGap && latest?.metrics
    ? { label: COMPONENTS.find((c) => c.key === topGap.key)!.label, tip: tip(topGap.key, latest.metrics) }
    : null;
  const ringR = 52;
  const ringC = 2 * Math.PI * ringR;
  const scoreNote = score != null ? tier!.name
    : !readiness ? undefined
    : !readiness.available ? "Coming soon"
    : readiness.connected ? "Open to calculate" : undefined;

  // Nothing on the dashboard until an X account is connected. A request that is
  // still running, or that failed, must never read as "not connected": only a
  // finished, successful check with no X account shows the gate.
  const xConnected = accounts.some((a) => a.platform === "twitter");
  if (!xConnected && accountsLoading) return <div className="dash"><Glows /></div>;
  if (!xConnected && !accountsError) return <ConnectXGate name={firstName} />;

  return (
    <div className="dash">
      <Glows />

      {/* Mobile header — desktop uses the top nav */}
      <div className="dash-mhead">
        <h1>Dashboard</h1>
        <HeaderActions size={32} />
      </div>

      <div className="dash-top">
        <div className="dash-top__left">
          <div className="dash-date">
            <div className="dash-date__day">{now.getDate()}</div>
            <div className="dash-date__text">
              {now.toLocaleDateString("en-US", { weekday: "short" })},<br />
              {now.toLocaleDateString("en-US", { month: "long" })}
            </div>
          </div>
          <Link to="/tasks" className="dash-tasks">
            Show my Tasks <img src="/dash/arrow-right.svg" alt="" />
          </Link>
        </div>
        <div className="dash-welcome">
          <h2>Welcome Back, {firstName}</h2>
          {lastLogin && <p>Just Logged in: {lastLogin}</p>}
        </div>
      </div>

      <div className="dash-grid">
        {/* Profile + readiness progress */}
        <section className="dash-profile">
          <div className="dash-profile__id">
            <div className="dash-profile__avatar">
              {avatar
                ? <img src={avatar} alt="" referrerPolicy="no-referrer" />
                : name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="dash-profile__name">
                <span>{name}</span>
                {attained.slice(0, 1).map((b) => <BadgeGlyph key={b.id} theme={b.theme} size={32} glow={false} />)}
              </div>
              <div className="dash-profile__role">{role}</div>
            </div>
          </div>
          {score != null && (
            <Link to="/readiness" className="dash-ring" aria-label={`Readiness score ${score}, ${tier!.name}`}>
              <svg viewBox="0 0 120 120" aria-hidden>
                <circle cx="60" cy="60" r={ringR} className="dash-ring__bg" />
                <circle cx="60" cy="60" r={ringR} className="dash-ring__fg" strokeDasharray={ringC} strokeDashoffset={ringC * (1 - score / 100)} />
              </svg>
              <span className="dash-ring__num"><b>{score}</b><small>/ 100</small></span>
              <span className="dash-ring__tier">{tier!.name}</span>
            </Link>
          )}
          <div>
            <div className="dash-profile__meta">
              <span>
                {score == null ? "Your Smart Readiness score will show here"
                  : nextTier ? <>Earn {(nextTier.min - score).toFixed(1)} more points to reach <em>{nextTier.name}</em></>
                  : <>You're at the <em>top tier</em></>}
              </span>
              <b>{score == null ? "—" : nextTier ? `${score} / ${nextTier.min}` : `${score} / 100`}</b>
            </div>
            <div className="dash-bar" aria-hidden>
              <div className="dash-bar__fill" style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }} />
            </div>
            {focus && (
              <p className="dash-focus">
                <b>Focus: {focus.label}.</b> {focus.tip} <Link to="/readiness">See full breakdown</Link>
              </p>
            )}
          </div>
        </section>

        <div className="dash-stats">
          <StatCard label="Total Followers" icon="/dash/ic-followers.svg" value={followersValue}>
            <div className="dash-card__art">
              <GlowBlob src="/dash/card-glow-green.svg" left={111.95} top={177.72} opacity={0.48} />
              <BearArt />
            </div>
          </StatCard>

          <StatCard label="Readiness Score" icon="/dash/ic-star.svg" value={score == null ? "—" : String(score)} note={scoreNote} to="/readiness">
            <div className="dash-card__art">
              <GlowBlob src="/dash/card-glow-green.svg" left={56.66} top={188.29} opacity={0.48} />
              <StarsArt />
            </div>
          </StatCard>

          <StatCard label="Influence Point" icon="/dash/ic-influence.svg" value={influence == null ? "—" : fmt(influence)}>
            <div className="dash-card__art">
              <GlowBlob src="/dash/card-glow-red.svg" left={52} top={189} opacity={0.73} />
            </div>
          </StatCard>

          <section className="dash-interest">
            <div className="dash-interest__head">
              <h3>Top Voices</h3>
              <Link to="/readiness">Details</Link>
            </div>
            {readiness && readiness.available && readiness.connected && readiness.voices.length > 0 ? (
              <ul>
                {readiness.voices.slice(0, 5).map((v) => (
                  <li key={v.niche}>
                    <span className="ic"><Tag size={9} /></span>
                    <span className="tx">
                      <span>{v.niche}</span>
                      <span className="track"><i style={{ width: `${v.score}%` }} /></span>
                    </span>
                    <span className="pc">{v.top_percent != null ? `Top ${v.top_percent}%` : v.score}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dash-interest__empty">
                {!readiness ? "Loading…"
                  : !readiness.available ? "Top voices are coming soon."
                  : !readiness.connected ? <>Connect your X account to see where your voice is strongest. <Link to="/settings">Connect X</Link></>
                  : "Post at least twice about a topic (DeFi, AI, NFTs and more) to see where your voice is strongest."}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
