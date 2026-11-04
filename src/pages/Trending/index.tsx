import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getTrending, type TrendingPost, type TrendingResponse } from "@/lib/api";
import "./trending.css";

// Bloom "Trending" (Figma 553:1379). Everything shown is real: TikTok posts with
// their views / engagement rate, the three best by engagement, and the niches
// the views come from. Duration isn't stored for synced posts, so the thumbnail
// carries no time label.

function fmt(n: number): string {
  if (n >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}K`;
  return String(Math.round(n));
}

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const updatedFmt = (iso: string) => {
  const d = new Date(iso);
  const t = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(" ", "");
  return `${t} ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

const SORTS = [
  { key: "engagement", label: "Engagement" },
  { key: "views", label: "Views" },
  { key: "recent", label: "Most recent" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

function TikTokIcon() {
  return (
    <svg width="9" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z" />
    </svg>
  );
}

function Peak({ color }: { color: string }) {
  return (
    <svg className="tr-peak" viewBox="0 0 120 150" preserveAspectRatio="none" aria-hidden>
      <path d="M-10 160 L25 150 C 40 140 48 60 60 14 C 72 60 80 140 95 150 L130 160" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function TopCard({ post, tone }: { post: TrendingPost; tone: "green" | "red" }) {
  const img = post.creator_avatar || post.cover_image_url;
  const who = post.creator_name || (post.handle ? `@${post.handle}` : "Creator");
  return (
    <div className={`tr-top tr-top--${tone}`}>
      <div className="tr-top__glow" aria-hidden />
      <div className="tr-top__lines" aria-hidden><i /><i /><i /><i /></div>
      <Peak color={tone === "green" ? "#52ff7c" : "#ff6e6e"} />
      <div className="tr-top__thumb">
        {img ? <img src={img} alt="" referrerPolicy="no-referrer" /> : <span>{who.charAt(0).toUpperCase()}</span>}
      </div>
      <div className="tr-top__text">
        <div className="tr-top__who">{who}</div>
        <div className="tr-top__title">{post.title || "Untitled post"}</div>
        <span className="tr-chip">Top 100</span>
      </div>
    </div>
  );
}

function Select<T extends string>({ value, onChange, options, prefix }: {
  value: T; onChange: (v: T) => void; options: { key: T; label: string }[]; prefix?: string;
}) {
  return (
    <label className="tr-select">
      {prefix && <span className="tr-select__prefix">{prefix}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
      <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden><path d="M1 1l3 3 3-3" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" /></svg>
    </label>
  );
}

export default function TrendingPage() {
  usePageTitle("Zerra · Trending");
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState<SortKey>("engagement");

  useEffect(() => {
    let live = true;
    getTrending()
      .then((d) => { if (live) setData(d); })
      .catch((e) => { if (live) setError(e.message ?? "Couldn't load trending"); });
    return () => { live = false; };
  }, []);

  const rows = useMemo(() => {
    const list = (data?.posts ?? []).filter((p) => platform === "all" || p.platform === platform);
    const by: Record<SortKey, (a: TrendingPost, b: TrendingPost) => number> = {
      engagement: (a, b) => b.engagement_rate - a.engagement_rate,
      views: (a, b) => b.views - a.views,
      recent: (a, b) => +new Date(b.posted_at) - +new Date(a.posted_at),
    };
    return [...list].sort(by[sort]).slice(0, 20);
  }, [data, platform, sort]);

  return (
    <div className="tr">
      <div className="tr-glows" aria-hidden>
        <div className="tr-glow-a" />
        <div className="tr-glow-b" />
      </div>

      <header className="tr-head">
        <h1>Trending</h1>
        {data?.updated_at && <p>Last Update: {updatedFmt(data.updated_at)}</p>}
      </header>

      {error && !data && <p className="tr-empty">{error}</p>}
      {!data && !error && <p className="tr-empty">Loading…</p>}

      {data && (
        <>
          <h2 className="tr-h2">Top Contents</h2>
          {data.top.length === 0 ? (
            <p className="tr-empty">Nothing is trending yet. Posts appear once creators connect and sync TikTok.</p>
          ) : (
            <div className="tr-tops">
              {data.top.map((p, i) => <TopCard key={p.id} post={p} tone={i === 0 ? "green" : "red"} />)}
            </div>
          )}

          <div className="tr-main">
            <section className="tr-posts">
              <div className="tr-posts__head">
                <h2 className="tr-h2">Trending Posts</h2>
                <div className="tr-filters">
                  <Select value={platform} onChange={setPlatform} options={[{ key: "all", label: "All Platform" }, { key: "tiktok", label: "TikTok" }]} />
                  <Select value={sort} onChange={setSort} options={[...SORTS]} prefix="Sort by:" />
                </div>
              </div>

              <div className="tr-table">
                <div className="tr-row tr-row--head">
                  <span>Content</span><span>Platform</span><span>Views</span><span>Eng. Rate</span><span>Date</span>
                </div>
                {rows.length === 0 && <div className="tr-row tr-row--empty">No posts to show.</div>}
                {rows.map((p) => (
                  <div className="tr-row" key={p.id}>
                    <div className="tr-cell-content">
                      <div className="tr-thumb">
                        {p.cover_image_url && <img src={p.cover_image_url} alt="" referrerPolicy="no-referrer" />}
                        <span className="tr-play" aria-hidden><svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" fill="#fff" /></svg></span>
                      </div>
                      <div className="tr-cell-text">
                        <b>{p.title || "Untitled post"}</b>
                        <small>{p.handle ? `@${p.handle}` : p.creator_name ?? ""}</small>
                      </div>
                    </div>
                    <span className="tr-plat"><i><TikTokIcon /></i>TikTok</span>
                    <span>{fmt(p.views)}</span>
                    <span className="tr-eng">{p.engagement_rate.toFixed(1)}%</span>
                    <span className="tr-date">{dateFmt(p.posted_at)}</span>
                  </div>
                ))}
              </div>
            </section>

            <aside className="tr-perf">
              <div className="tr-perf__head">
                <h3>Top Performing Content</h3>
                <Link to="/influence/top-performing">View more</Link>
              </div>
              {data.niches.length === 0 ? (
                <p className="tr-perf__empty">No niche data yet. Creators pick a niche in Settings.</p>
              ) : (
                <ul>
                  {data.niches.map((n) => (
                    <li key={n.niche}>
                      <span className="ic"><Tag size={10} /></span>
                      <span className="tx">
                        <span>{n.niche}</span>
                        <span className="track"><i style={{ width: `${n.share}%` }} /></span>
                      </span>
                      <span className="pc">{n.share}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
