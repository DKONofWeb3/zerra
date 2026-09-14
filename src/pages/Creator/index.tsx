import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCreatorProfile, getMe } from "@/lib/api";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { useBadges } from "@/hooks/useBadges";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { CreatorProfileResponse, TikTokPost } from "@/lib/types";

// Design tokens taken from the real Figma node (nAllTZdIEQt2sfhrTgtcAQ,
// 394:776) — DM Sans throughout, with the exact greys/blues the design uses.
const F = '"DM Sans", ui-sans-serif, system-ui, sans-serif';
const C = {
  textPrimary: "#f7f6f4",
  textMuted: "#94a3b8",
  textDim: "#b7b7b7",
  textLoc: "#d2d2d2",
  tabIdle: "#4c505c",
  green: "#4ee4b1",
  blue: "#509dff",
  border: "#1f2430",
  panel: "#06080e",
  scoreTrack: "#111e3b",
  rankChip: "#22426b",
};
const GRAD = {
  scoreCard: "linear-gradient(180deg, #070c18 27%, #253f7e 142%)",
  highlights: "linear-gradient(180deg, #253f7e 65%, #070c18 84%)",
  statsCard: "linear-gradient(179deg, #070c18 1%, #253f7e 149%)",
  scoreFill: "linear-gradient(90deg, #305e99, #509dff)",
  scoreText: "linear-gradient(125deg, #ffffff 26%, #999999 98%)",
};

const ICON = {
  verify: "/creator-profile/verify-badge.svg",
  location: "/creator-profile/location-icon.svg",
  ranking: "/creator-profile/ranking-icon.svg",
  arrowRight: "/creator-profile/arrow-right.svg",
  chevron: "/creator-profile/chevron-icon.svg",
  instagram: "/creator-profile/instagram-fill.svg",
  youtube: "/creator-profile/youtube-icon.svg",
  tiktok: "/creator-profile/tiktok-icon.svg",
  twitter: "/creator-profile/twitter-x.svg",
} as const;

// Per-platform card treatment from the design: brand-tinted radial glow
// fading to near-black, with a matching 1px border.
const PLATFORM: Record<string, { label: string; icon: string; border: string; bg: string; handleKey: string }> = {
  instagram: {
    label: "Instagram", icon: ICON.instagram, border: "rgba(203,58,173,0.55)",
    bg: "radial-gradient(130% 130% at 12% 0%, rgba(203,58,173,0.45) 0%, rgba(106,34,95,0.35) 35%, rgba(8,10,16,1) 72%)",
    handleKey: "instagram",
  },
  youtube: {
    label: "Youtube", icon: ICON.youtube, border: "#ff0b0b",
    bg: "radial-gradient(130% 130% at 12% 0%, rgba(255,18,18,0.45) 0%, rgba(132,14,17,0.35) 35%, rgba(8,10,16,1) 72%)",
    handleKey: "youtube",
  },
  tiktok: {
    label: "TikTok", icon: ICON.tiktok, border: "#0bfdf5",
    bg: "radial-gradient(130% 130% at 12% 0%, rgba(7,249,241,0.35) 0%, rgba(8,130,129,0.3) 35%, rgba(8,10,16,1) 72%)",
    handleKey: "tiktok",
  },
  twitter: {
    label: "X(Twitter)", icon: ICON.twitter, border: "#acacac",
    bg: "radial-gradient(130% 130% at 12% 0%, rgba(255,255,255,0.3) 0%, rgba(101,102,106,0.25) 35%, rgba(8,10,16,1) 72%)",
    handleKey: "twitter",
  },
};
const PLATFORM_ORDER = ["instagram", "youtube", "tiktok", "twitter"] as const;

const TABS = ["Overview", "Content", "Analytics", "Campaigns", "About"] as const;
type Tab = (typeof TABS)[number];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function dateLabel(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Rounded panel matching the design's chart/content cards. */
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────
function ProfileHeader({
  creator, isVerified, ownProfile, stats, accounts,
}: {
  creator: CreatorProfileResponse["creator"];
  isVerified: boolean;
  ownProfile: boolean;
  stats: { totalFollowers: number; impressions: number; engagement: string; score: number | null };
  accounts: CreatorProfileResponse["socialAccounts"];
}) {
  const statItems = [
    { value: fmt(stats.totalFollowers), label: "Total Followers" },
    { value: fmt(stats.impressions), label: "Recent Impressions" },
    { value: `${stats.engagement}%`, label: "Engagement Rate" },
    { value: stats.score != null ? String(stats.score) : "—", label: "Creator Score" },
  ];

  return (
    <div style={{ fontFamily: F }}>
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
        {/* Avatar */}
        <div
          className="shrink-0 rounded-full overflow-hidden grid place-items-center mx-auto md:mx-0"
          style={{
            width: 168, height: 168, background: "#0d1322",
            boxShadow: "0 0 60px rgba(80,157,255,0.18)", border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {creator.avatar
            ? <img src={creator.avatar} alt={creator.name ?? ""} className="w-full h-full object-cover" />
            : <span style={{ fontSize: 56, fontWeight: 600, color: "#fff" }}>{(creator.name ?? "?").charAt(0).toUpperCase()}</span>}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-1.2px", color: "#fff", margin: 0 }}>
              @{creator.username}
            </h1>
            {isVerified && <img src={ICON.verify} alt="Verified" style={{ width: 24, height: 24 }} />}

            <div className="flex items-center gap-3 md:ml-3">
              {ownProfile ? (
                <Link
                  to="/settings"
                  style={{
                    border: "1px solid #e0e0e0", color: "#e0e0e0", borderRadius: 100,
                    padding: "8px 16px", fontSize: 14, fontWeight: 500, letterSpacing: "-0.56px", textDecoration: "none",
                  }}
                >
                  Edit Profile
                </Link>
              ) : (
                <>
                  {/* Follow / Message are in the design but there's no follow or
                      messaging system in the app — rendered disabled rather than
                      faked as working. */}
                  <button disabled style={{ border: "1px solid #e0e0e0", color: "#e0e0e0", borderRadius: 100, padding: "8px 16px", fontSize: 14, fontWeight: 500, letterSpacing: "-0.56px", opacity: 0.5, cursor: "not-allowed", background: "transparent" }}>
                    Follow
                  </button>
                  <button disabled style={{ background: C.blue, color: "#e0e0e0", border: "none", borderRadius: 100, padding: "8px 16px", fontSize: 14, fontWeight: 500, letterSpacing: "-0.56px", opacity: 0.5, cursor: "not-allowed" }}>
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {creator.name && (
            <p style={{ fontSize: 18, fontWeight: 500, color: "#fff", letterSpacing: "-0.72px", margin: "10px 0 0" }}>
              {creator.name}
            </p>
          )}

          {creator.bio && (
            <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: "6px 0 0", maxWidth: 420 }}>
              {creator.bio}
            </p>
          )}
          {creator.niche && (
            <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: "2px 0 0" }}>
              {creator.niche}
            </p>
          )}

          {creator.location && (
            <div className="flex items-center gap-1.5" style={{ marginTop: 10 }}>
              <img src={ICON.location} alt="" style={{ width: 16, height: 16, opacity: 0.8 }} />
              <span style={{ fontSize: 14, fontWeight: 300, color: C.textLoc, letterSpacing: "-0.56px" }}>{creator.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats row — 4 across on desktop, exactly as laid out in the design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4" style={{ marginTop: 32 }}>
        {statItems.map((s) => (
          <div key={s.label}>
            <p style={{ fontSize: 26, fontWeight: 600, color: C.textPrimary, letterSpacing: "-1.04px", margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 14, color: C.textDim, letterSpacing: "-0.56px", margin: "4px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-platform follower cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginTop: 24 }}>
        {PLATFORM_ORDER.map((key) => {
          const p = PLATFORM[key];
          const acct = accounts.find((a) => a.platform === key);
          const comingSoon = key === "youtube"; // no YouTube integration exists
          return (
            <div
              key={key}
              className="flex items-center gap-3"
              style={{
                background: p.bg, border: `1px solid ${p.border}`, borderRadius: 8,
                padding: "7px 8px", opacity: comingSoon || !acct ? 0.45 : 1,
              }}
            >
              <img src={p.icon} alt="" style={{ width: 40, height: 40, flexShrink: 0, objectFit: "contain" }} />
              <div className="min-w-0">
                <p style={{ fontSize: 22, fontWeight: 600, color: C.textPrimary, letterSpacing: "-0.88px", margin: 0, lineHeight: 1.15 }}>
                  {comingSoon ? "—" : acct ? fmt(acct.follower_count ?? 0) : "—"}
                </p>
                <p style={{ fontSize: 13, color: C.textDim, letterSpacing: "-0.52px", margin: 0 }}>
                  {comingSoon ? "Coming soon" : acct ? "Total Followers" : "Not connected"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────
function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex gap-6 md:gap-8 overflow-x-auto" style={{ fontFamily: F, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
      {TABS.map((t) => {
        const on = t === active;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "0 0 12px",
              fontSize: 20, fontWeight: 500, letterSpacing: "-1px", whiteSpace: "nowrap",
              color: on ? "#fff" : C.tabIdle,
              borderBottom: on ? `2px solid ${C.blue}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

// ── Performance chart (inline SVG, matching the design's treatment) ───────
function PerformancePanel({ posts }: { posts: TikTokPost[] }) {
  const series = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const p of posts) {
      const key = dateLabel(p.created_time ?? p.fetched_at);
      byDate.set(key, (byDate.get(key) ?? 0) + Number(p.view_count ?? 0));
    }
    return Array.from(byDate.entries()).map(([label, value]) => ({ label, value }));
  }, [posts]);

  const total = posts.reduce((s, p) => s + Number(p.view_count || 0), 0);

  const W = 700, H = 200;
  const path = useMemo(() => {
    if (series.length < 2) return null;
    const max = Math.max(...series.map((d) => d.value)) || 1;
    const pts = series.map((d, i) => [
      (i / (series.length - 1)) * W,
      H - (d.value / max) * (H - 20) - 10,
    ]);
    // smooth-ish curve through the points
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return { line: d, area: `${d} L ${W},${H} L 0,${H} Z` };
  }, [series]);

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: C.textMuted, margin: 0 }}>Your Performance</p>
          <div className="flex items-baseline gap-3" style={{ marginTop: 4 }}>
            <span style={{ fontFamily: F, fontSize: 46, fontWeight: 700, color: "#fff", letterSpacing: "-0.92px", lineHeight: 1.1 }}>
              {fmt(total)}
            </span>
          </div>
          <p style={{ fontFamily: F, fontSize: 13, color: C.textMuted, margin: "2px 0 0" }}>Total Impressions</p>
        </div>
        <div
          className="flex items-center gap-2 shrink-0"
          style={{ background: "#050505", border: `1px solid ${C.border}`, borderRadius: 4, padding: "7px 12px" }}
        >
          <span style={{ fontFamily: F, fontSize: 13, color: "#fff" }}>Recent posts</span>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {path ? (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 200, display: "block" }}>
              <defs>
                <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.blue} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" x2={W} y1={(H / 3) * i} y2={(H / 3) * i} stroke={C.border} strokeWidth="1" opacity="0.5" />
              ))}
              <path d={path.area} fill="url(#perfFill)" />
              <path d={path.line} fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
              {series.map((d, i) => (
                <span key={i} style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: C.textMuted }}>{d.label}</span>
              ))}
            </div>
          </>
        ) : (
          <p style={{ fontFamily: F, fontSize: 13, color: C.textMuted, textAlign: "center", padding: "56px 0" }}>
            Not enough synced content yet to chart performance.
          </p>
        )}
      </div>
    </Panel>
  );
}

// ── Recent content: a GRID of thumbnail cards, as in the design ───────────
function ContentGrid({ posts, limit }: { posts: TikTokPost[]; limit?: number }) {
  const shown = limit ? posts.slice(0, limit) : posts;
  if (shown.length === 0) {
    return <p style={{ fontFamily: F, fontSize: 13, color: C.textMuted }}>No content synced yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {shown.map((p) => (
        <div key={p.post_id}>
          <div style={{ height: 195, borderRadius: 8, overflow: "hidden", background: "#11141c", border: `1px solid ${C.border}` }}>
            {p.cover_image_url
              ? <img src={p.cover_image_url} alt="" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <div className="w-full h-full grid place-items-center" style={{ fontFamily: F, fontSize: 12, color: C.tabIdle }}>No preview</div>}
          </div>
          <p style={{ fontFamily: F, fontSize: 14, fontWeight: 500, color: "#fff", letterSpacing: "-1px", margin: "8px 0 0" }} className="truncate">
            {p.title || "Untitled post"}
          </p>
          <p style={{ fontFamily: F, fontSize: 11.5, fontWeight: 500, color: C.textMuted, margin: "2px 0 0" }}>
            {dateLabel(p.created_time ?? p.fetched_at)} · {fmt(Number(p.view_count))} views
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Right column ──────────────────────────────────────────────────────────
function ScoreCard({ scorecard, niche }: { scorecard: CreatorProfileResponse["scorecard"]; niche: string | null }) {
  // Conversion is deliberately absent from the data model — there is no
  // click-through / attribution tracking anywhere in the product, so it shows
  // as "—" rather than a fabricated number like the mock does.
  const rows: { label: string; value: number | null }[] = [
    { label: "Influence",       value: scorecard?.influence_score ?? null },
    { label: "Content Quality", value: scorecard?.content_quality_score ?? null },
    { label: "Engagement",      value: scorecard?.engagement_score ?? null },
    { label: "Conversion",      value: null },
    { label: "Reliability",     value: scorecard?.reliability_score ?? null },
  ];

  return (
    <div style={{ background: GRAD.scoreCard, borderRadius: 24, padding: "18px 16px", fontFamily: F }}>
      {scorecard?.niche_percentile != null && niche && (
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div className="flex items-end gap-2">
            <span className="grid place-items-center shrink-0" style={{ width: 40, height: 40, borderRadius: 100, background: C.rankChip }}>
              <img src={ICON.ranking} alt="" style={{ width: 24, height: 24 }} />
            </span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 500, color: "#fff", letterSpacing: "-0.64px", margin: 0 }}>
                Top {Math.max(1, 100 - scorecard.niche_percentile)}%
              </p>
              <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: 0 }}>in {niche}</p>
            </div>
          </div>
          <img src={ICON.chevron} alt="" style={{ width: 24, height: 24, transform: "rotate(180deg)", opacity: 0.7 }} />
        </div>
      )}

      <p style={{ fontSize: 16, color: C.textMuted, letterSpacing: "-0.64px", margin: 0 }}>Creator Score</p>
      <div className="flex items-end gap-1" style={{ marginTop: 4 }}>
        <span style={{
          fontSize: 28, letterSpacing: "-1.12px", lineHeight: 1.1,
          backgroundImage: GRAD.scoreText, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          {scorecard ? `${scorecard.overall_score}%` : "—"}
        </span>
      </div>

      <div style={{ height: 12, borderRadius: 100, background: C.scoreTrack, overflow: "hidden", marginTop: 16 }}>
        <div style={{ height: "100%", width: `${scorecard?.overall_score ?? 0}%`, borderRadius: 100, background: GRAD.scoreFill }} />
      </div>

      <div style={{ marginTop: 20 }}>
        {rows.map((r) => (
          <div key={r.label}>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
            <div className="flex items-center justify-between" style={{ padding: "9px 0" }}>
              <span style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px" }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: r.value == null ? C.tabIdle : "#fff", letterSpacing: "-0.56px" }}>
                {r.value == null ? "—" : r.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      {!scorecard && (
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
          Connect a social account to get your Creator Score.
        </p>
      )}
    </div>
  );
}

function HighlightRow({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <img src={icon} alt="" style={{ width: 36, height: 36, flexShrink: 0, objectFit: "contain" }} />
      <div className="min-w-0">
        <p style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary, letterSpacing: "-0.64px", margin: 0 }}>{title}</p>
        <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: "2px 0 0" }}>{sub}</p>
      </div>
    </div>
  );
}

function HighlightsCard({ highlights, niche }: { highlights: CreatorProfileResponse["highlights"]; niche: string | null }) {
  const top = highlights.topPerformingPlatform;
  return (
    <div style={{ background: GRAD.highlights, borderRadius: 24, padding: "23px 23px 16px", fontFamily: F }}>
      <p style={{ fontSize: 20, fontWeight: 500, color: C.textPrimary, letterSpacing: "-0.8px", margin: "0 0 28px" }}>
        Creator Highlights
      </p>
      <div className="flex flex-col gap-4">
        <HighlightRow
          icon={ICON.ranking}
          title="Most Engaging Content"
          sub={highlights.mostEngagingContent
            ? `${highlights.mostEngagingContent.title || "Untitled"} · ${highlights.mostEngagingContent.engagementRate}% ER`
            : "Not enough data yet"}
        />
        <HighlightRow
          icon={top ? PLATFORM[top]?.icon ?? ICON.ranking : ICON.ranking}
          title="Top Performing Platform"
          sub={top ? PLATFORM[top]?.label ?? top : "Not enough data yet"}
        />
        <HighlightRow
          icon={ICON.ranking}
          title="Best Performing Niche"
          sub={niche && highlights.mostEngagingContent
            ? `${niche} · ${highlights.mostEngagingContent.engagementRate}% ER`
            : "Set a niche in Settings"}
        />
        <HighlightRow
          icon={ICON.ranking}
          title="Recent Campaigns"
          sub={`${highlights.recentCampaigns.count} completed · $${highlights.recentCampaigns.totalEarnedUsdc.toLocaleString()} earned`}
        />
      </div>
    </div>
  );
}

function VerifiedPlatformsCard({
  accounts, ownProfile, username,
}: {
  accounts: CreatorProfileResponse["socialAccounts"];
  ownProfile: boolean;
  username: string | null;
}) {
  return (
    <div style={{ background: "#070c18", borderRadius: 24, padding: "16px 19px 14px", fontFamily: F }}>
      <p style={{ fontSize: 20, fontWeight: 500, color: C.textPrimary, letterSpacing: "-0.8px", margin: "0 0 24px" }}>
        Verified Platforms
      </p>
      <div className="flex flex-col gap-5">
        {PLATFORM_ORDER.map((key) => {
          const p = PLATFORM[key];
          const acct = accounts.find((a) => a.platform === key);
          const comingSoon = key === "youtube";
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-1.5 min-w-0">
                <img src={p.icon} alt="" style={{ width: 36, height: 36, flexShrink: 0, objectFit: "contain", opacity: comingSoon ? 0.5 : 1 }} />
                <div className="min-w-0">
                  <p style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary, letterSpacing: "-0.64px", margin: 0 }}>{p.label}</p>
                  {acct?.username && (
                    <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: 0 }}>@{acct.username}</p>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 14, letterSpacing: "-0.56px", color: comingSoon ? C.tabIdle : acct ? C.green : C.tabIdle, whiteSpace: "nowrap" }}>
                {comingSoon ? "Coming soon" : acct ? "Connected" : "Not connected"}
              </span>
            </div>
          );
        })}
      </div>

      {ownProfile && username && (
        <Link
          to={`/creator/${username}`}
          className="flex items-center justify-center gap-3"
          style={{
            marginTop: 24, background: "#000", borderRadius: 100, padding: "10px 16px",
            fontSize: 16, color: "#fff", letterSpacing: "-0.64px", textDecoration: "none",
          }}
        >
          View Full Profile
          <img src={ICON.arrowRight} alt="" style={{ width: 20, height: 20 }} />
        </Link>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
interface CreatorProfilePageProps {
  /** Render the logged-in user's own profile (Dashboard) instead of :username. */
  ownProfile?: boolean;
}

export default function CreatorProfilePage({ ownProfile = false }: CreatorProfilePageProps) {
  const { username: routeUsername } = useParams<{ username: string }>();
  const [ownUsername, setOwnUsername] = useState<string | null>(null);
  const username = ownProfile ? ownUsername : routeUsername;

  const { accounts: ownAccounts } = useSocialAccounts();
  const tiktokFollowers = ownAccounts.find((a) => a.platform === "tiktok")?.follower_count ?? null;
  const { badges } = useBadges(tiktokFollowers);
  const isVerified = ownProfile && badges.some((b) => b.id === "verified-influencer" && b.attained);

  usePageTitle(username ? `Zerra · @${username}` : ownProfile ? "Zerra · Dashboard" : "Zerra · Creator");

  const [profile, setProfile] = useState<CreatorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [noUsername, setNoUsername] = useState(false);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (!ownProfile) return;
    getMe()
      .then((d) => {
        const u = d.user?.username ?? null;
        setOwnUsername(u);
        if (!u) { setNoUsername(true); setLoading(false); }
      })
      .catch(() => { setOwnUsername(null); setNoUsername(true); setLoading(false); });
  }, [ownProfile]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);
    getCreatorProfile(username)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading || (ownProfile && !username && !noUsername)) {
    return <div style={{ fontFamily: F }} className="pt-12 text-center text-[13px] text-fg-tertiary">Loading profile...</div>;
  }

  if (ownProfile && noUsername) {
    return (
      <div className="pt-12 text-center" style={{ fontFamily: F }}>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#fff", margin: "0 0 6px" }}>Set a username to see your profile</p>
        <p style={{ fontSize: 14, color: C.textMuted, margin: "0 0 18px" }}>Your dashboard profile needs a username first.</p>
        <Link to="/settings" style={{ background: C.blue, color: "#fff", borderRadius: 100, padding: "10px 20px", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          Go to Settings
        </Link>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="pt-12 text-center" style={{ fontFamily: F }}>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#fff", margin: "0 0 6px" }}>
          {ownProfile ? "Couldn't load your profile" : "Creator not found"}
        </p>
        <p style={{ fontSize: 14, color: C.textMuted }}>
          {ownProfile ? "Try refreshing the page." : "No creator with that username exists."}
        </p>
      </div>
    );
  }

  const { creator, socialAccounts, scorecard, recentContent, highlights } = profile;
  const totalFollowers = socialAccounts.reduce((s, a) => s + (a.follower_count ?? 0), 0);
  const impressions = recentContent.reduce((s, p) => s + Number(p.view_count || 0), 0);
  const engagement = recentContent.length
    ? (recentContent.reduce((s, p) => s + Number(p.engagement_rate || 0), 0) / recentContent.length).toFixed(1)
    : "0";

  return (
    <div className="pb-12" style={{ fontFamily: F }}>
      <ProfileHeader
        creator={creator}
        isVerified={isVerified}
        ownProfile={ownProfile}
        stats={{ totalFollowers, impressions, engagement, score: scorecard?.overall_score ?? null }}
        accounts={socialAccounts}
      />

      <div style={{ marginTop: 32 }}>
        <TabBar active={tab} onChange={setTab} />
      </div>

      <div style={{ marginTop: 24 }}>
        {tab === "Overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
            <div className="flex flex-col gap-6 min-w-0">
              <PerformancePanel posts={recentContent} />
              <Panel style={{ background: "linear-gradient(180deg, #06080e 30%, rgba(61,114,255,0.12) 220%)" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 26, fontWeight: 500, color: "#fff", letterSpacing: "-0.96px", margin: 0 }}>Recent Content</p>
                  <button onClick={() => setTab("Content")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.textMuted }}>
                    View All
                  </button>
                </div>
                <ContentGrid posts={recentContent} limit={4} />
              </Panel>
            </div>

            <div className="flex flex-col gap-6">
              <ScoreCard scorecard={scorecard} niche={creator.niche} />
              <HighlightsCard highlights={highlights} niche={creator.niche} />
              <VerifiedPlatformsCard accounts={socialAccounts} ownProfile={ownProfile} username={creator.username} />
            </div>
          </div>
        )}

        {tab === "Content" && (
          <Panel>
            <p style={{ fontSize: 20, fontWeight: 500, color: "#fff", margin: "0 0 20px" }}>All Content</p>
            <ContentGrid posts={recentContent} />
          </Panel>
        )}

        {/* Analytics keeps the existing, already-built analytics view — it moved
            in here now that the dashboard's top-bar tabs are gone. */}
        {tab === "Analytics" && <AnalyticsOverview />}

        {tab === "Campaigns" && (
          <Panel>
            <p style={{ fontSize: 20, fontWeight: 500, color: "#fff", margin: "0 0 8px" }}>Campaigns</p>
            <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>
              {highlights.recentCampaigns.count > 0
                ? `${highlights.recentCampaigns.count} completed · $${highlights.recentCampaigns.totalEarnedUsdc.toLocaleString()} earned. A detailed per-campaign breakdown isn't built yet.`
                : "No campaigns claimed yet. Browse Explore to find live campaigns."}
            </p>
          </Panel>
        )}

        {tab === "About" && (
          <Panel>
            <p style={{ fontSize: 20, fontWeight: 500, color: "#fff", margin: "0 0 16px" }}>About</p>
            <div className="flex flex-col gap-3" style={{ fontSize: 14 }}>
              <div><span style={{ color: C.textMuted }}>Name</span><p style={{ color: "#fff", margin: "2px 0 0" }}>{creator.name || "—"}</p></div>
              <div><span style={{ color: C.textMuted }}>Bio</span><p style={{ color: "#fff", margin: "2px 0 0" }}>{creator.bio || "—"}</p></div>
              <div><span style={{ color: C.textMuted }}>Niche</span><p style={{ color: "#fff", margin: "2px 0 0" }}>{creator.niche || "—"}</p></div>
              <div><span style={{ color: C.textMuted }}>Location</span><p style={{ color: "#fff", margin: "2px 0 0" }}>{creator.location || "—"}</p></div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
