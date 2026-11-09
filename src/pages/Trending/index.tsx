import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tag } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getTrending, type TrendingPost, type TrendingResponse, type TrendingTopic } from "@/lib/api";
import "./trending.css";

// Bloom "Trending" (Figma 553:1379). Everything shown is real: the most-viewed
// original posts and quotes on Crypto Twitter (collected every few hours by the
// backend). /trending lists the trending topics; /trending/:topic shows the posts
// under one topic.

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
  { key: "views", label: "Impressions" },
  { key: "engagement", label: "Engagement" },
  { key: "recent", label: "Most recent" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

const topicPath = (topic: string) => `/trending/${encodeURIComponent(topic)}`;

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.9 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
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
    <a className={`tr-top tr-top--${tone}`} href={post.url ?? undefined} target="_blank" rel="noreferrer">
      <div className="tr-top__glow" aria-hidden />
      <div className="tr-top__lines" aria-hidden><i /><i /><i /><i /></div>
      <Peak color={tone === "green" ? "#52ff7c" : "#ff6e6e"} />
      <div className="tr-top__thumb">
        {img ? <img src={img} alt="" referrerPolicy="no-referrer" /> : <span>{who.charAt(0).toUpperCase()}</span>}
      </div>
      <div className="tr-top__text">
        <div className="tr-top__who">{who}</div>
        <div className="tr-top__title">{post.title || "Untitled post"}</div>
        <span className="tr-chip">{fmt(post.views)} views</span>
      </div>
    </a>
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

/** The list of trending topics: the first thing people see. */
function TopicsView({ topics }: { topics: TrendingTopic[] }) {
  if (topics.length === 0) {
    return <p className="tr-empty">Nothing to show yet. We pull the top posts on Crypto Twitter every few hours, so check back soon.</p>;
  }
  const maxViews = Math.max(...topics.map((t) => t.views), 1);
  return (
    <>
      <h2 className="tr-h2">Trending Topics</h2>
      <div className="tr-topics">
        {topics.map((t, i) => (
          <Link to={topicPath(t.topic)} className="tr-topic" key={t.topic}>
            <div className="tr-topic__top">
              <span className="tr-topic__rank">{i + 1}</span>
              <b>{t.topic}</b>
              <span className="tr-topic__go" aria-hidden>→</span>
            </div>
            <div className="tr-topic__stats">
              <span>{fmt(t.views)} impressions</span>
              <span>{t.posts} post{t.posts === 1 ? "" : "s"}</span>
            </div>
            <div className="tr-topic__bar"><i style={{ width: `${Math.max(6, (t.views / maxViews) * 100)}%` }} /></div>
            {t.sample?.title && (
              <p className="tr-topic__sample">“{t.sample.title}” <small>@{t.sample.handle}</small></p>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}

/** The posts under one topic. */
function TopicView({ topic, data }: { topic: string; data: TrendingResponse }) {
  const [sort, setSort] = useState<SortKey>("views");

  const inTopic = useMemo(() => data.posts.filter((p) => p.topics.includes(topic)), [data, topic]);
  const rows = useMemo(() => {
    const by: Record<SortKey, (a: TrendingPost, b: TrendingPost) => number> = {
      engagement: (a, b) => b.engagement_rate - a.engagement_rate,
      views: (a, b) => b.views - a.views,
      recent: (a, b) => +new Date(b.posted_at) - +new Date(a.posted_at),
    };
    return [...inTopic].sort(by[sort]).slice(0, 30);
  }, [inTopic, sort]);
  const top3 = useMemo(() => [...inTopic].sort((a, b) => b.views - a.views).slice(0, 3), [inTopic]);
  const others = data.topics.filter((t) => t.topic !== topic);

  if (inTopic.length === 0) {
    return (
      <>
        <p className="tr-empty">No posts under “{topic}” right now.</p>
        <Link to="/trending" className="tr-back">← All topics</Link>
      </>
    );
  }

  return (
    <>
      <Link to="/trending" className="tr-back">← All topics</Link>

      <h2 className="tr-h2">Top Contents</h2>
      <div className="tr-tops">
        {top3.map((p, i) => <TopCard key={p.id} post={p} tone={i === 0 ? "green" : "red"} />)}
      </div>

      <div className="tr-main">
        <section className="tr-posts">
          <div className="tr-posts__head">
            <h2 className="tr-h2">Posts</h2>
            <div className="tr-filters">
              <Select value={sort} onChange={setSort} options={[...SORTS]} prefix="Sort by:" />
            </div>
          </div>

          <div className="tr-table">
            <div className="tr-row tr-row--head">
              <span>Content</span><span>Platform</span><span>Impressions</span><span>Eng. Rate</span><span>Date</span>
            </div>
            {rows.map((p) => (
              <a className="tr-row" key={p.id} href={p.url ?? undefined} target="_blank" rel="noreferrer">
                <div className="tr-cell-content">
                  <div className="tr-thumb">
                    {p.creator_avatar
                      ? <img src={p.creator_avatar} alt="" referrerPolicy="no-referrer" />
                      : <span className="tr-thumb__ph"><XIcon /></span>}
                  </div>
                  <div className="tr-cell-text">
                    <b>{p.title || "Untitled post"}</b>
                    <small>{p.handle ? `@${p.handle}` : p.creator_name ?? ""}</small>
                  </div>
                </div>
                <span className="tr-plat"><i><XIcon /></i>X</span>
                <span>{fmt(p.views)}</span>
                <span className="tr-eng">{p.engagement_rate.toFixed(1)}%</span>
                <span className="tr-date">{dateFmt(p.posted_at)}</span>
              </a>
            ))}
          </div>
        </section>

        <aside className="tr-perf">
          <div className="tr-perf__head"><h3>Other Topics</h3></div>
          {others.length === 0 ? (
            <p className="tr-perf__empty">No other topics yet.</p>
          ) : (
            <ul>
              {others.slice(0, 8).map((t) => (
                <li key={t.topic}>
                  <span className="ic"><Tag size={10} /></span>
                  <Link to={topicPath(t.topic)} className="tx tr-perf__link"><span>{t.topic}</span></Link>
                  <span className="pc">{fmt(t.views)}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}

export default function TrendingPage() {
  const { topic: topicParam } = useParams<{ topic?: string }>();
  const topic = topicParam ? decodeURIComponent(topicParam) : null;
  usePageTitle(topic ? `Zerra · ${topic} on CT` : "Zerra · Trending");

  const [data, setData] = useState<TrendingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getTrending()
      .then((d) => { if (live) setData(d); })
      .catch((e) => { if (live) setError(e.message ?? "Couldn't load trending"); });
    return () => { live = false; };
  }, []);

  return (
    <div className="tr">
      <div className="tr-glows" aria-hidden>
        <div className="tr-glow-a" />
        <div className="tr-glow-b" />
      </div>

      <header className="tr-head">
        <h1>{topic ?? "Trending"}</h1>
        {data?.updated_at && <p>{topic ? "Trending on CT" : "What CT is talking about"} · Last update: {updatedFmt(data.updated_at)}</p>}
      </header>

      {error && !data && <p className="tr-empty">{error}</p>}
      {!data && !error && <p className="tr-empty">Loading…</p>}

      {data && (topic ? <TopicView topic={topic} data={data} /> : <TopicsView topics={data.topics ?? []} />)}
    </div>
  );
}
