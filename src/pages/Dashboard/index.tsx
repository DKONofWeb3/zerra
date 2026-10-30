import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useBadges } from "@/hooks/useBadges";
import { getCreatorProfile } from "@/lib/api";
import { BadgeGlyph } from "@/components/icons/BadgeIcon";
import { HeaderActions } from "@/components/layout/HeaderActions";
import "./dashboard.css";

// The dashboard follows the Bloom design (Figma 541:1370 desktop / 541:1628
// mobile). Followers, influence, name, avatar and badge are real. XP, the
// XP-to-next-badge goal, the % change chips and Top Interest have no data
// source yet, so they render as placeholders instead of invented numbers.

function fmt(n: number): string {
  if (n >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(2))}M`;
  if (n >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}K`;
  return String(Math.round(n));
}

const INTERESTS = [
  { label: "Technology",       icon: "/dash/int-laptop.svg" },
  { label: "Entrepreneurship", icon: "/dash/int-bag.svg" },
  { label: "Investing",        icon: "/dash/int-invest.svg" },
  { label: "Crypto",           icon: "/dash/int-crypto.svg" },
  { label: "Fitness",          icon: "/dash/int-fitness.svg" },
];

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

function StatCard({ label, icon, value, soon, children }: {
  label: string; icon: string; value: string; soon?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="dash-card">
      {children}
      <div className="dash-card__label">
        <span className="dash-card__icon"><img src={icon} alt="" /></span>
        {label}
      </div>
      <div className={value === "—" ? "dash-card__value is-empty" : "dash-card__value"}>
        {value}
        {soon && <span className="dash-card__soon">Coming soon</span>}
      </div>
    </div>
  );
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

export default function DashboardPage() {
  usePageTitle("Zerra · Dashboard");
  const { session } = useAuth();
  const { user } = useCurrentUser();
  const { accounts, loading: accountsLoading } = useSocialAccounts();
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

  const now = new Date();
  const lastLogin = session?.user?.last_sign_in_at
    ? new Date(session.user.last_sign_in_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const name = user?.name?.trim() || user?.username || "Creator";
  const firstName = name.split(" ")[0];
  const attained = badges.filter((b) => b.attained);
  const role = attained[0]?.id === "early-creator" ? "Early Creator" : attained[0]?.shortLabel ?? "Creator";
  const followersValue = accounts.length === 0 && accountsLoading ? "—" : fmt(followers);

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
          <Link to="/explore" className="dash-tasks">
            Show my Tasks <img src="/dash/arrow-right.svg" alt="" />
          </Link>
        </div>
        <div className="dash-welcome">
          <h2>Welcome Back, {firstName}</h2>
          {lastLogin && <p>Just Logged in: {lastLogin}</p>}
        </div>
      </div>

      <div className="dash-grid">
        {/* Profile + XP */}
        <section className="dash-profile">
          <div className="dash-profile__id">
            <div className="dash-profile__avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="" referrerPolicy="no-referrer" />
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
          <div>
            <div className="dash-profile__meta">
              <span>XP rewards are <em>coming soon</em></span>
              <b>— XP</b>
            </div>
            <div className="dash-bar" aria-hidden>
              <div className="dash-bar__fill" style={{ width: 0 }} />
            </div>
          </div>
        </section>

        <div className="dash-stats">
          <StatCard label="Total Followers" icon="/dash/ic-followers.svg" value={followersValue}>
            <div className="dash-card__art">
              <GlowBlob src="/dash/card-glow-green.svg" left={111.95} top={177.72} opacity={0.48} />
              <BearArt />
            </div>
          </StatCard>

          <StatCard label="XP Point" icon="/dash/ic-star.svg" value="—" soon>
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
            <h3>Top Interest</h3>
            <ul>
              {INTERESTS.map((i) => (
                <li key={i.label}>
                  <span className="ic"><img src={i.icon} alt="" /></span>
                  <span className="tx">
                    <span>{i.label}</span>
                    <span className="track"><i style={{ width: 0 }} /></span>
                  </span>
                  <span className="pc">—</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
