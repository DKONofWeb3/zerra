import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCreatorProfile, getMe, getTopCreators, getZerraLeaderboard } from "@/lib/api";
import { rankGeneral } from "@/lib/generalScore";
import { BadgeClaimModal } from "@/components/dashboard/BadgeClaimModal";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { LockedCard } from "@/components/dashboard/LockedCard";
import { BadgeGlyph } from "@/components/icons/BadgeIcon";
import { useBadges } from "@/hooks/useBadges";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { CreatorProfileResponse, TikTokPost, BadgeState } from "@/lib/types";

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
  // Creator Highlights row icons, exported from the design
  hlContent: "/creator-profile/hl-content.svg",
  hlNiche: "/creator-profile/hl-niche.svg",
  hlChampion: "/creator-profile/hl-champion.svg",
  ellipsis: "/creator-profile/ellipsis.svg",
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

// The two frames genuinely have different tab rows, so each breakpoint gets
// the set its own design specifies.
const DESKTOP_TABS = ["Overview", "Content", "Analytics", "Leaderboard", "Campaigns", "About"] as const;
const MOBILE_TABS = ["Overview", "Audience", "Content", "Engagement", "Earnings", "Leaderboard", "Campaigns", "Comparison"] as const;
type Tab = (typeof DESKTOP_TABS)[number] | (typeof MOBILE_TABS)[number];

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
function Panel({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────
function ProfileHeader({
  creator, isVerified, otherBadges, ownProfile, stats, accounts,
}: {
  creator: CreatorProfileResponse["creator"];
  isVerified: boolean;
  otherBadges: { id: string; theme: "ember" | "violet" }[];
  ownProfile: boolean;
  stats: { totalFollowers: number; impressions: number; engagement: string; score: number | null };
  accounts: CreatorProfileResponse["socialAccounts"];
}) {
  // Name / badge / TikTok handle moved here off the sidebar, which used to
  // duplicate all three above the nav.
  const tiktokHandle = accounts.find((a) => a.platform === "tiktok")?.username ?? null;
  const badgeRow = (
    <span className="flex items-center gap-1 shrink-0">
      {isVerified && <img src={ICON.verify} alt="Verified" style={{ width: 24, height: 24 }} />}
      {otherBadges.map((b) => <BadgeGlyph key={b.id} theme={b.theme} size={18} glow={false} />)}
    </span>
  );
  const statItems = [
    { value: fmt(stats.totalFollowers), label: "Total Followers" },
    { value: fmt(stats.impressions), label: "Recent Impressions" },
    { value: `${stats.engagement}%`, label: "Engagement Rate" },
    { value: stats.score != null ? String(stats.score) : "—", label: "Creator Score" },
  ];

  const actions = ownProfile ? (
    <Link
      to="/settings"
      style={{
        border: "1px solid #e0e0e0", color: "#e0e0e0", borderRadius: 100,
        padding: "8px 16px", fontSize: 14, fontWeight: 500, letterSpacing: "-0.56px",
        textDecoration: "none", whiteSpace: "nowrap",
      }}
    >
      Edit Profile
    </Link>
  ) : (
    <>
      {/* Follow / Message are in the design but there's no follow or messaging
          system in the app — rendered disabled rather than faked as working. */}
      <button disabled style={{ border: "1px solid #e0e0e0", color: "#e0e0e0", borderRadius: 100, padding: "8px 16px", fontSize: 14, fontWeight: 500, letterSpacing: "-0.56px", opacity: 0.5, cursor: "not-allowed", background: "transparent", whiteSpace: "nowrap" }}>
        Follow
      </button>
      <button disabled style={{ background: C.blue, color: "#e0e0e0", border: "none", borderRadius: 100, padding: "8px 16px", fontSize: 14, fontWeight: 500, letterSpacing: "-0.56px", opacity: 0.5, cursor: "not-allowed", whiteSpace: "nowrap" }}>
        Message
      </button>
      <img src={ICON.ellipsis} alt="" style={{ width: 24, height: 24, opacity: 0.5, flexShrink: 0 }} />
    </>
  );

  return (
    <div style={{ fontFamily: F }}>
      {/* ── MOBILE header (matches Figma 394:776) ──────────────────────────
          56px avatar, NAME as the heading with @handle beneath it, bio, then
          the location row with the actions right-aligned on the same line. */}
      <div className="md:hidden">
        <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", background: "#0d1322", display: "grid", placeItems: "center" }}>
          {creator.avatar
            ? <img src={creator.avatar} alt={creator.name ?? ""} className="w-full h-full object-cover" />
            : <span style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>{(creator.name ?? "?").charAt(0).toUpperCase()}</span>}
        </div>

        <div className="flex items-center gap-1.5" style={{ marginTop: 14 }}>
          <span style={{ fontSize: 20, fontWeight: 500, color: "#fff", letterSpacing: "-0.8px" }}>{creator.name}</span>
          {badgeRow}
        </div>
        {tiktokHandle && (
          <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: "2px 0 0" }}>
            TikTok: <span style={{ color: C.green }}>@{tiktokHandle}</span>
          </p>
        )}
        <p style={{ fontSize: 16, fontWeight: 500, color: C.textMuted, letterSpacing: "-0.64px", margin: "2px 0 0" }}>
          @{creator.username}
        </p>

        {creator.bio && (
          <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: "14px 0 0", maxWidth: 260 }}>
            {creator.bio}
          </p>
        )}
        {creator.niche && (
          <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: 0, maxWidth: 260 }}>
            {creator.niche}
          </p>
        )}

        <div className="flex items-end justify-between gap-3" style={{ marginTop: 14 }}>
          {creator.location ? (
            <div className="flex items-end gap-1.5 min-w-0">
              <img src={ICON.location} alt="" style={{ width: 16, height: 16, opacity: 0.8, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 300, color: C.textLoc, letterSpacing: "-0.56px" }} className="truncate">
                {creator.location}
              </span>
            </div>
          ) : <span />}
          <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
        </div>

        {/* Stats: 2x2 inside the gradient card, per the mobile design */}
        <div
          className="grid grid-cols-2"
          style={{ background: GRAD.statsCard, borderRadius: 16, padding: "26px 16px 25px 24px", gap: 24, marginTop: 24 }}
        >
          {statItems.map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: 24, fontWeight: 600, color: C.textPrimary, letterSpacing: "-0.96px", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 15, color: C.textDim, letterSpacing: "-0.6px", margin: "5px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP header ─────────────────────────────────────────────────
          Large avatar, @handle as the heading with the name beneath. */}
      <div className="hidden md:block">
        <div className="flex items-start gap-10">
          <div
            className="shrink-0 rounded-full overflow-hidden grid place-items-center"
            style={{
              width: 168, height: 168, background: "#0d1322",
              boxShadow: "0 0 60px rgba(80,157,255,0.18)", border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {creator.avatar
              ? <img src={creator.avatar} alt={creator.name ?? ""} className="w-full h-full object-cover" />
              : <span style={{ fontSize: 56, fontWeight: 600, color: "#fff" }}>{(creator.name ?? "?").charAt(0).toUpperCase()}</span>}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-1.2px", color: "#fff", margin: 0 }}>
                {creator.name}
              </h1>
              {badgeRow}
              <div className="flex items-center gap-3 ml-3">{actions}</div>
            </div>

            {tiktokHandle && (
              <p style={{ fontSize: 14, color: C.textMuted, letterSpacing: "-0.56px", margin: "8px 0 0" }}>
                TikTok: <span style={{ color: C.green }}>@{tiktokHandle}</span>
              </p>
            )}
            <p style={{ fontSize: 16, fontWeight: 500, color: C.textMuted, letterSpacing: "-0.64px", margin: "2px 0 0" }}>
              @{creator.username}
            </p>

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

        {/* Stats: plain 4-across row on desktop */}
        <div className="grid grid-cols-4 gap-4" style={{ marginTop: 32 }}>
          {statItems.map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: 26, fontWeight: 600, color: C.textPrimary, letterSpacing: "-1.04px", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 14, color: C.textDim, letterSpacing: "-0.56px", margin: "4px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-platform follower cards — horizontal scroll on mobile (design),
          4-across grid on desktop. */}
      <div
        className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0"
        style={{ marginTop: 24, scrollbarWidth: "none" }}
      >
        {PLATFORM_ORDER.map((key) => {
          const p = PLATFORM[key];
          const acct = accounts.find((a) => a.platform === key);
          const comingSoon = key === "youtube"; // no YouTube integration exists
          return (
            <div
              key={key}
              className="flex items-center gap-3 shrink-0 md:shrink"
              style={{
                background: p.bg, border: `1px solid ${p.border}`, borderRadius: 8,
                padding: "7px 8px", opacity: comingSoon || !acct ? 0.45 : 1, minWidth: 168,
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
function TabRow({ items, active, onChange, className, gap }: {
  items: readonly Tab[]; active: Tab; onChange: (t: Tab) => void; className?: string; gap: number;
}) {
  return (
    <div
      className={`flex overflow-x-auto ${className ?? ""}`}
      style={{ fontFamily: F, borderBottom: "1px solid rgba(255,255,255,0.05)", gap, scrollbarWidth: "none" }}
    >
      {items.map((t) => {
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

/** The mobile design's tab row differs from desktop's — both are rendered and
 *  swapped by breakpoint so each matches its own frame. */
function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <>
      <TabRow items={MOBILE_TABS} active={active} onChange={onChange} className="md:hidden -mx-4 px-4" gap={31} />
      <TabRow items={DESKTOP_TABS} active={active} onChange={onChange} className="hidden md:flex" gap={32} />
    </>
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
          icon={ICON.hlContent}
          title="Most Engaging Content"
          sub={highlights.mostEngagingContent
            ? `${highlights.mostEngagingContent.title || "Untitled"} · ${highlights.mostEngagingContent.engagementRate}% ER`
            : "Not enough data yet"}
        />
        <HighlightRow
          icon={top ? PLATFORM[top]?.icon ?? ICON.hlChampion : ICON.hlChampion}
          title="Top Performing Platform"
          sub={top ? PLATFORM[top]?.label ?? top : "Not enough data yet"}
        />
        <HighlightRow
          icon={ICON.hlNiche}
          title="Best Performing Niche"
          sub={niche && highlights.mostEngagingContent
            ? `${niche} · ${highlights.mostEngagingContent.engagementRate}% ER`
            : "Set a niche in Settings"}
        />
        <HighlightRow
          icon={ICON.hlChampion}
          title="Recent Campaigns"
          sub={`${highlights.recentCampaigns.count} completed · $${highlights.recentCampaigns.totalEarnedUsdc.toLocaleString()} earned`}
        />
      </div>
    </div>
  );
}

/** Somewhere to actually claim earned badges — this had no home after the old
 *  dashboard Overview was replaced. Own profile only; eligibility and claiming
 *  both go through the real /me/badges endpoints via useBadges. */
function BadgesCard({
  badges, claimingId, onClaim,
}: {
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}) {
  return (
    <div style={{ background: "#070c18", borderRadius: 24, padding: "16px 19px 18px", fontFamily: F }}>
      <p style={{ fontSize: 20, fontWeight: 500, color: C.textPrimary, letterSpacing: "-0.8px", margin: "0 0 20px" }}>
        Badges
      </p>
      <div className="flex flex-col gap-4">
        {badges.map((b) => {
          const claiming = claimingId === b.id;
          return (
            <div key={b.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span style={{ opacity: b.attained ? 1 : 0.35, flexShrink: 0, display: "grid", placeItems: "center" }}>
                  <BadgeGlyph theme={b.theme} size={34} glow={b.attained} />
                </span>
                <div className="min-w-0">
                  <p style={{ fontSize: 15, fontWeight: 500, color: C.textPrimary, letterSpacing: "-0.6px", margin: 0 }}>
                    {b.shortLabel}
                  </p>
                  <p style={{ fontSize: 13, color: C.textMuted, letterSpacing: "-0.52px", margin: 0 }}>
                    {b.attained ? (b.attainedDescription ?? b.description) : b.description}
                  </p>
                </div>
              </div>

              {b.attained ? (
                <span style={{ fontSize: 13, color: C.green, whiteSpace: "nowrap" }}>Claimed</span>
              ) : b.eligible ? (
                <button
                  onClick={() => onClaim(b.id)}
                  disabled={claiming}
                  style={{
                    background: C.blue, color: "#fff", border: "none", borderRadius: 100,
                    padding: "7px 16px", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
                    cursor: claiming ? "default" : "pointer", opacity: claiming ? 0.6 : 1,
                  }}
                >
                  {claiming ? "Claiming..." : "Claim"}
                </button>
              ) : (
                <span style={{ fontSize: 13, color: C.tabIdle, whiteSpace: "nowrap" }}>Locked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface GeneralRow {
  user_id: string;
  name: string | null;
  avatar: string | null;
  username: string | null;
  zerra_username: string | null;
  followers: number | null;
  total_views: number;
  avg_engagement_rate: number;
  avg_engagement_per_post: number | null;
}

interface ZerraRow {
  creator_id: string;
  name: string | null;
  avatar: string | null;
  username: string | null;
  total_score: number;
  campaigns_count: number;
}

type Board = "general" | "zerra";

// The two boards deliberately rank on different things — say which, on screen.
const BOARDS: { key: Board; label: string; blurb: string }[] = [
  { key: "general", label: "General", blurb: "Ranked by followers, engagement rate and average engagement per post." },
  { key: "zerra",   label: "Zerra",   blurb: "Ranked by points accumulated across Zerra campaigns." },
];

interface BoardRow {
  key: string;
  highlight: boolean;
  name: string | null;
  avatar: string | null;
  handle: string | null;
  cells: React.ReactNode[];
}

function BoardTable({ headers, rows }: { headers: string[]; rows: BoardRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, minWidth: 480 }}>
        <thead>
          <tr style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            {headers.map((h, i) => (
              <th key={h} style={{
                textAlign: i < 2 ? "left" : "right", padding: "10px 24px",
                fontSize: 12, fontWeight: 500, color: C.textMuted, letterSpacing: "-0.48px", whiteSpace: "nowrap",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.key} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: r.highlight ? "rgba(80,157,255,0.10)" : "transparent" }}>
              <td style={{ padding: "12px 24px", fontSize: 14, color: i < 3 ? C.blue : C.textMuted, fontWeight: i < 3 ? 600 : 400 }}>{i + 1}</td>
              <td style={{ padding: "12px 24px" }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0 rounded-full overflow-hidden grid place-items-center" style={{ width: 28, height: 28, background: "#0d1322" }}>
                    {r.avatar
                      ? <img src={r.avatar} alt="" className="w-full h-full object-cover" />
                      : <span style={{ fontSize: 12, color: "#fff" }}>{(r.name ?? "?").charAt(0).toUpperCase()}</span>}
                  </span>
                  <div className="min-w-0">
                    <p style={{ fontSize: 14, color: "#fff", margin: 0 }} className="truncate">{r.name ?? "Unnamed"}</p>
                    {r.handle && <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }} className="truncate">@{r.handle}</p>}
                  </div>
                </div>
              </td>
              {r.cells.map((cell, j) => (
                <td key={j} style={{ padding: "12px 24px", textAlign: "right", fontSize: 14, color: "#fff", whiteSpace: "nowrap" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** General board (real reach + engagement) and Zerra board (points), one toggle. */
function LeaderboardPanel({ highlightId }: { highlightId: string | null }) {
  const [board, setBoard] = useState<Board>("general");
  const [general, setGeneral] = useState<GeneralRow[] | null>(null);
  const [zerra, setZerra] = useState<ZerraRow[] | null>(null);
  const [failed, setFailed] = useState<Record<Board, boolean>>({ general: false, zerra: false });

  useEffect(() => {
    if (board === "general" && general === null && !failed.general) {
      getTopCreators()
        .then((d) => setGeneral((d.creators ?? []) as GeneralRow[]))
        .catch(() => setFailed((f) => ({ ...f, general: true })));
    }
    if (board === "zerra" && zerra === null && !failed.zerra) {
      getZerraLeaderboard()
        .then((d) => setZerra((d.leaderboard ?? []) as ZerraRow[]))
        .catch(() => setFailed((f) => ({ ...f, zerra: true })));
    }
  }, [board, general, zerra, failed]);

  const rankedGeneral = useMemo(() => (general ? rankGeneral(general) : null), [general]);

  const active = BOARDS.find((b) => b.key === board)!;
  const data = board === "general" ? rankedGeneral : zerra;
  const note = { fontSize: 14, color: C.textMuted, margin: 0, padding: "20px 24px" } as const;

  let body: React.ReactNode;
  if (failed[board]) {
    body = <p style={note}>Couldn't load this leaderboard. Try again shortly.</p>;
  } else if (!data) {
    body = <p style={note}>Loading leaderboard...</p>;
  } else if (data.length === 0) {
    body = (
      <p style={note}>
        {board === "zerra"
          ? "No points yet — creators show up here once their campaign content is verified and scored."
          : "No ranked creators yet — this fills in as creators sync content."}
      </p>
    );
  } else if (board === "general") {
    body = (
      <BoardTable
        headers={["#", "Creator", "Followers", "Eng. rate", "Avg / post", "Views"]}
        rows={(rankedGeneral as GeneralRow[]).map((c) => ({
          key: c.user_id,
          highlight: c.user_id === highlightId,
          name: c.name,
          avatar: c.avatar,
          handle: c.zerra_username ?? c.username,
          cells: [
            c.followers != null ? fmt(c.followers) : "—",
            `${c.avg_engagement_rate}%`,
            c.avg_engagement_per_post != null ? fmt(c.avg_engagement_per_post) : "—",
            fmt(c.total_views),
          ],
        }))}
      />
    );
  } else {
    body = (
      <BoardTable
        headers={["#", "Creator", "Campaigns", "Points"]}
        rows={(zerra as ZerraRow[]).map((c) => ({
          key: c.creator_id,
          highlight: c.creator_id === highlightId,
          name: c.name,
          avatar: c.avatar,
          handle: c.username,
          cells: [String(c.campaigns_count), c.total_score.toLocaleString()],
        }))}
      />
    );
  }

  return (
    <Panel style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 14px" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p style={{ fontSize: 20, fontWeight: 500, color: "#fff", letterSpacing: "-0.8px", margin: 0 }}>Leaderboard</p>
          <div className="flex gap-1.5">
            {BOARDS.map((b) => (
              <button
                key={b.key}
                onClick={() => setBoard(b.key)}
                style={{
                  padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  border: `1px solid ${board === b.key ? C.blue : C.border}`,
                  background: board === b.key ? C.blue : "transparent",
                  color: board === b.key ? "#fff" : C.textMuted,
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "8px 0 0" }}>{active.blurb}</p>
      </div>
      {body}
    </Panel>
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
  const { badges, claim, claimingId } = useBadges(tiktokFollowers);
  const [claimModalId, setClaimModalId] = useState<string | null>(null);
  const handleClaim = async (id: string) => {
    await claim(id);
    setClaimModalId(id);
  };
  const isVerified = ownProfile && badges.some((b) => b.id === "verified-influencer" && b.attained);
  // Any other earned badges render as their own glyph next to the name, so
  // "verified" isn't shown twice (tick + glyph) for the same badge.
  const otherBadges = ownProfile
    ? badges.filter((b) => b.attained && b.id !== "verified-influencer").map((b) => ({ id: b.id, theme: b.theme }))
    : [];

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
        otherBadges={otherBadges}
        ownProfile={ownProfile}
        stats={{ totalFollowers, impressions, engagement, score: scorecard?.overall_score ?? null }}
        accounts={socialAccounts}
      />

      <div style={{ marginTop: 32 }}>
        <TabBar active={tab} onChange={setTab} />
      </div>

      <div style={{ marginTop: 24 }}>
        {tab === "Overview" && (
          // Mobile stacks in the order the mobile frame uses — Score and
          // Highlights come straight after the tabs, then the chart, content
          // and platforms. `display: contents` lets the column wrappers
          // collapse on mobile so `order` can do that, while desktop keeps the
          // real two-column split.
          <div className="flex flex-col xl:grid xl:grid-cols-[1fr_340px] gap-6">
            <div className="contents xl:flex xl:flex-col xl:gap-6 min-w-0">
              <div className="order-3 xl:order-none">
                <PerformancePanel posts={recentContent} />
              </div>
              <Panel className="order-4 xl:order-none" style={{ background: "linear-gradient(180deg, #06080e 30%, rgba(61,114,255,0.12) 220%)" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 26, fontWeight: 500, color: "#fff", letterSpacing: "-0.96px", margin: 0 }}>Recent Content</p>
                  <button onClick={() => setTab("Content")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.textMuted }}>
                    View All
                  </button>
                </div>
                <ContentGrid posts={recentContent} limit={4} />
              </Panel>
            </div>

            <div className="contents xl:flex xl:flex-col xl:gap-6">
              <div className="order-1 xl:order-none">
                <ScoreCard scorecard={scorecard} niche={creator.niche} />
              </div>
              <div className="order-2 xl:order-none">
                <HighlightsCard highlights={highlights} niche={creator.niche} />
              </div>
              <div className="order-5 xl:order-none">
                <VerifiedPlatformsCard accounts={socialAccounts} ownProfile={ownProfile} username={creator.username} />
              </div>
              {ownProfile && (
                <div className="order-6 xl:order-none">
                  <BadgesCard badges={badges} claimingId={claimingId} onClaim={handleClaim} />
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Leaderboard" && <LeaderboardPanel highlightId={creator.id} />}

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

        {/* Mobile-only tabs from that frame. There's no demographics, watch-time
            or cross-platform comparison data source in the product, so these
            say so rather than showing invented charts. */}
        {(tab === "Audience" || tab === "Engagement" || tab === "Earnings" || tab === "Comparison") && (
          <LockedCard
            title={tab}
            note={
              tab === "Earnings"
                ? `$${highlights.recentCampaigns.totalEarnedUsdc.toLocaleString()} earned so far — a full earnings breakdown isn't built yet.`
                : "Coming soon — we don't collect this data from the platform APIs yet."
            }
          />
        )}
      </div>

      {ownProfile && (
        <BadgeClaimModal
          badge={badges.find((b) => b.id === claimModalId) ?? null}
          onClose={() => setClaimModalId(null)}
        />
      )}
    </div>
  );
}
