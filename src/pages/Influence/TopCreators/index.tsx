import { useEffect, useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiGetPublic } from "@/lib/api/client";
import { rankGeneral, avgEngagementPerPost } from "@/lib/generalScore";
import { sameNiche } from "@/lib/niches";
// Type-only: the 579-row data file itself is loaded on demand below so it stays
// out of the main bundle.
import type { FeaturedCreator } from "@/data/featuredCreators";

/** A real Zerra creator, from GET /analytics/top-creators. */
interface Creator {
  user_id: string;
  name: string | null;
  avatar: string | null;
  /** TikTok handle */
  username: string | null;
  /** Zerra username; the only handle some creators have (no TikTok connected). */
  zerra_username?: string | null;
  /** Niche picked in Settings (one of lib/niches.ts, or older free text). */
  niche?: string | null;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  post_count: number;
  avg_engagement_rate: number;
  /** Real, summed across connected platforms. */
  followers?: number | null;
  avg_engagement_per_post?: number | null;
}

interface Featured {
  niches: string[];
  creators: FeaturedCreator[];
}

// "All" lists ~580 creators; render them in pages rather than all at once.
const PAGE_SIZE = 60;

// unavatar.io fetches TikTok profile pics by username — no expiry, cached CDN
function tikAvatar(username: string) {
  return `https://unavatar.io/tiktok/${username}`;
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Avatar({ src, label }: { src: string | null; label: string }) {
  const [failed, setFailed] = useState(false);
  const initial = label.charAt(0).toUpperCase() || "?";

  if (!src || failed) {
    return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-bg-elevated border border-white/[0.06] flex items-center justify-center text-[12px] md:text-[14px] font-semibold text-fg-secondary shrink-0">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shrink-0 border border-white/[0.06]"
      onError={() => setFailed(true)}
    />
  );
}

/** A real Zerra creator, with real metrics. */
function CreatorRow({ creator, rank }: { creator: Creator; rank: number }) {
  const handle = creator.zerra_username ?? creator.username;
  return (
    <div className="flex items-center gap-3 md:gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] md:text-[13px] text-fg-muted tabular-nums w-5 md:w-6 text-center shrink-0">{rank}</span>
      <Avatar src={creator.avatar} label={creator.name ?? handle ?? "?"} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] md:text-[13.5px] font-medium text-fg-primary truncate">
          {creator.name ?? handle ?? "Unknown"}
        </p>
        {handle && (
          <p className="text-[11px] md:text-[12px] text-fg-tertiary truncate">@{handle}</p>
        )}
      </div>
      <div className="text-right shrink-0 w-16 md:w-20">
        <p className="text-[12px] md:text-[13px] font-semibold text-fg-primary tabular-nums">
          {creator.avg_engagement_rate.toFixed(1)}%
        </p>
        <p className="text-[10px] md:text-[11px] text-fg-tertiary">Engagement</p>
      </div>
      <div className="hidden sm:block text-right shrink-0 w-16 md:w-20">
        <p className="text-[12px] md:text-[13px] text-fg-secondary tabular-nums">
          {creator.followers != null ? fmt(creator.followers) : "—"}
        </p>
        <p className="text-[10px] md:text-[11px] text-fg-tertiary">Followers</p>
      </div>
      <div className="hidden md:block text-right shrink-0 w-16 md:w-20">
        <p className="text-[13px] text-fg-secondary tabular-nums">
          {avgEngagementPerPost(creator) != null ? fmt(avgEngagementPerPost(creator) as number) : "—"}
        </p>
        <p className="text-[11px] text-fg-tertiary">Avg / post</p>
      </div>
      <div className="hidden lg:block text-right shrink-0 w-16 md:w-20">
        <p className="text-[13px] text-fg-secondary tabular-nums">{fmt(creator.total_views)}</p>
        <p className="text-[11px] text-fg-tertiary">Views</p>
      </div>
    </div>
  );
}

/** A featured (curated) creator. The source list has no metrics, so none are shown. */
function FeaturedRow({ creator, showNiche }: { creator: FeaturedCreator; showNiche: boolean }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] md:text-[13px] text-fg-muted tabular-nums w-5 md:w-6 text-center shrink-0">{creator.rank}</span>
      <Avatar src={tikAvatar(creator.handle)} label={creator.name} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] md:text-[13.5px] font-medium text-fg-primary truncate">{creator.name}</p>
        <p className="text-[11px] md:text-[12px] text-fg-tertiary truncate">
          @{creator.handle}
          {/* Rank is per-niche, so on small screens (where the niche column is hidden) say which niche it's for */}
          {showNiche && <span className="md:hidden"> · {creator.niche}</span>}
        </p>
      </div>
      {showNiche && (
        <span className="hidden md:block text-[12px] text-fg-secondary text-right shrink-0 w-44 truncate">{creator.niche}</span>
      )}
      <span className="hidden sm:block text-[12px] text-fg-tertiary text-right shrink-0 w-28 md:w-32 truncate">{creator.country}</span>
    </div>
  );
}

function ListCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-6 py-2"
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      {children}
    </div>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 md:h-16 rounded-2xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
      ))}
    </div>
  );
}

function SectionHeading({ title, caption }: { title: string; caption: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-[15px] font-medium text-fg-primary">{title}</h3>
      <p className="text-[12px] text-fg-tertiary mt-1 max-w-2xl">{caption}</p>
    </div>
  );
}

export default function TopCreatorsPage() {
  usePageTitle("Zerra · Top Creators");
  const [dbCreators, setDbCreators] = useState<Creator[]>([]);
  const [dbLoading,  setDbLoading]  = useState(true);
  const [featured,   setFeatured]   = useState<Featured | null>(null);
  const [niche,      setNiche]      = useState("All");
  const [open,       setOpen]       = useState(false);
  const [query,      setQuery]      = useState("");
  const [visible,    setVisible]    = useState(PAGE_SIZE);

  useEffect(() => {
    const handler = (e: Event) => setQuery((e as CustomEvent).detail.query ?? "");
    window.addEventListener("zerra:search", handler);
    return () => window.removeEventListener("zerra:search", handler);
  }, []);

  useEffect(() => {
    apiGetPublic<{ creators: Creator[] }>("/analytics/top-creators")
      .then((d) => setDbCreators(d.creators ?? []))
      .catch(console.error)
      .finally(() => setDbLoading(false));
  }, []);

  // The featured list is its own chunk; it doesn't wait on the API (which can be
  // slow on a cold start), so the page has content straight away.
  useEffect(() => {
    import("@/data/featuredCreators")
      .then((m) => setFeatured({ niches: m.FEATURED_NICHES, creators: m.FEATURED_CREATORS }))
      .catch((err) => { console.error(err); setFeatured({ niches: [], creators: [] }); });
  }, []);

  // A new filter starts back at the first page.
  useEffect(() => { setVisible(PAGE_SIZE); }, [niche, query]);

  const q = query.trim().toLowerCase();
  const matches = (name: string | null, handle: string | null) =>
    !q || (name ?? "").toLowerCase().includes(q) || (handle ?? "").toLowerCase().includes(q);

  // Real Zerra creators are filtered by the niche they picked in Settings. Ranked on followers + engagement rate + avg engagement per post (+ views), not
  // engagement rate alone - see lib/generalScore.ts for why.
  const live = rankGeneral(
    dbCreators
      .filter((c) => niche === "All" || sameNiche(c.niche, niche))
      .filter((c) => matches(c.name, c.username) || matches(null, c.zerra_username ?? null))
  );
  // Under a niche filter, only show the section if someone is actually in it (no skeleton flash).
  const showLive = live.length > 0 || (niche === "All" && dbLoading);

  let featuredList: FeaturedCreator[] = [];
  if (featured) {
    const pool = niche === "All" ? featured.creators : featured.creators.filter((c) => c.niche === niche);
    featuredList = pool.filter((c) => matches(c.name, c.handle));

    if (niche === "All") {
      // Several niches can list the same creator; show each once, under the niche
      // where they rank highest. Best rank first, then niche order.
      const nicheIdx = new Map(featured.niches.map((n, i) => [n, i]));
      const best = new Map<string, FeaturedCreator>();
      for (const c of featuredList) {
        const key = c.handle.toLowerCase();
        const cur = best.get(key);
        if (!cur || c.rank < cur.rank || (c.rank === cur.rank && nicheIdx.get(c.niche)! < nicheIdx.get(cur.niche)!)) {
          best.set(key, c);
        }
      }
      featuredList = [...best.values()].sort(
        (a, b) => a.rank - b.rank || nicheIdx.get(a.niche)! - nicheIdx.get(b.niche)!
      );
    }
  }

  const shown = featuredList.slice(0, visible);
  const nicheOptions = ["All", ...(featured?.niches ?? [])];
  const totalCount = live.length + featuredList.length;

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <Star className="w-3.5 h-3.5" />
          <span className="text-[12.5px]">Creators by niche</span>
        </div>
        <div className="flex items-end justify-between gap-4 mt-4">
          <h2 className={cn(
            "font-display font-medium tracking-[-0.03em]",
            "text-[48px] md:text-[64px] leading-[0.95]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}>
            Top Creators
          </h2>
          <div className="relative mb-2 shrink-0">
            <button onClick={() => setOpen((p) => !p)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-white/[0.08] bg-bg-elevated text-[12px] md:text-[13px] font-medium text-fg-primary hover:border-white/[0.15] transition-colors max-w-[200px]">
              <span className="truncate">{niche}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-fg-tertiary shrink-0 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-60 max-h-80 overflow-y-auto rounded-xl border border-white/[0.08] z-20"
                  style={{ background: "rgb(8 10 16)" }}>
                  {nicheOptions.map((n) => (
                    <button key={n} onClick={() => { setNiche(n); setOpen(false); }}
                      className={cn("w-full px-4 py-2.5 text-left text-[13px] transition-colors",
                        niche === n ? "bg-brand/10 text-brand font-medium" : "text-fg-secondary hover:bg-white/[0.03] hover:text-fg-primary")}>
                      {n}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {(niche !== "All" || query) && (
        <div className="flex flex-wrap items-center gap-2">
          {niche !== "All" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand/20 bg-brand/5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="text-[12px] text-brand">{niche}</span>
            </div>
          )}
          {query && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand/20 bg-brand/5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="text-[12px] text-brand">"{query}"</span>
            </div>
          )}
          <span className="text-[12px] text-fg-tertiary">{totalCount} creators</span>
        </div>
      )}

      {showLive && (
        <section>
          <SectionHeading
            title="On Zerra"
            caption={`${niche === "All" ? "Creators on Zerra" : `Creators on Zerra in ${niche}`}, ranked by followers, engagement rate and average engagement per post.`}
          />
          {dbLoading ? <SkeletonRows count={2} /> : (
            <ListCard>
              {live.map((c, i) => <CreatorRow key={c.user_id} creator={c} rank={i + 1} />)}
            </ListCard>
          )}
        </section>
      )}

      <section>
        <SectionHeading
          title={niche === "All" ? "Featured creators" : `Top ${niche} creators`}
          caption={
            niche === "All"
              ? "Curated from public creator rankings, September 2026. Each creator is shown once, ranked within the niche they rank highest in. Follower and engagement figures aren't shown for this list."
              : "Curated from public creator rankings, September 2026. Follower and engagement figures aren't shown for this list."
          }
        />
        {!featured ? (
          <SkeletonRows count={5} />
        ) : featuredList.length > 0 ? (
          <>
            <ListCard>
              {shown.map((c) => (
                <FeaturedRow key={`${c.niche}:${c.handle}`} creator={c} showNiche={niche === "All"} />
              ))}
            </ListCard>
            {featuredList.length > visible && (
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="mt-4 mx-auto block px-5 py-2.5 rounded-xl border border-white/[0.08] bg-bg-elevated text-[13px] font-medium text-fg-primary hover:border-white/[0.15] transition-colors">
                Show more ({featuredList.length - visible} more)
              </button>
            )}
          </>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] min-h-[200px] flex flex-col items-center justify-center gap-4"
            style={{ background: "rgb(var(--bg-card))" }}>
            <p className="text-[14px] text-fg-tertiary">No creators found{query ? ` for "${query}"` : ""}.</p>
          </div>
        )}
      </section>
    </div>
  );
}
