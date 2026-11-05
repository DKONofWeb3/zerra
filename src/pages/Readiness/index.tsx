import { useCallback, useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { COMPONENTS, TIERS, biggestGaps, detail, tierFor, tip } from "@/lib/readiness";
import { connectTwitter, getReadiness, refreshReadiness, type ReadinessResponse, type ReadinessVoice } from "@/lib/api";
import "./readiness.css";

function Ring({ score }: { score: number }) {
  const r = 70, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 180 180" className="rd-ring" aria-hidden>
      <circle cx="90" cy="90" r={r} className="rd-ring__bg" />
      <circle cx="90" cy="90" r={r} className="rd-ring__fg" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
    </svg>
  );
}

function Trend({ data }: { data: number[] }) {
  if (data.length < 2) {
    return <p className="rd-lead">Your trend appears after a second daily check.</p>;
  }
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 300},${56 - ((v - min) / (max - min || 1)) * 48}`).join(" ");
  return (
    <svg viewBox="0 0 300 60" className="rd-trend" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="#4a7dff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rd">
      <header className="rd-head">
        <h1>Your path to Smart Account status</h1>
        <p>Know where you stand. Know what to do next.</p>
      </header>
      {children}
    </div>
  );
}

function standing(v: ReadinessVoice): string {
  if (v.top_percent != null) return `Top ${v.top_percent}% of Zerra creators`;
  return v.cohort <= 1 ? "First on Zerra with this topic" : `#${v.rank} of ${v.cohort} on Zerra`;
}

export default function ReadinessPage() {
  usePageTitle("Zerra · Smart Readiness");
  const [data, setData] = useState<ReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await getReadiness());
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Couldn't load your readiness");
    }
  }, []);

  const refresh = useCallback(async () => {
    setBusy(true);
    setNote(null);
    try {
      await refreshReadiness();
      await load();
    } catch (e: any) {
      // A cooldown or provider hiccup is not a failure of the page itself.
      setNote(e.message ?? "Couldn't refresh right now");
    } finally {
      setBusy(false);
    }
  }, [load]);

  useEffect(() => { load(); }, [load]);

  // No score yet, or one from the old scoring model: calculate now instead of waiting for the daily job.
  const needsRun = !!data && data.available && data.connected && (!data.latest || !data.latest.components);
  useEffect(() => { if (needsRun) refresh(); }, [needsRun]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error && !data) return <Shell><p className="rd-lead">{error}</p></Shell>;
  if (!data) return <Shell><p className="rd-lead">Loading…</p></Shell>;

  if (!data.available) {
    return (
      <Shell>
        <section className="rd-card">
          <h3>Coming soon</h3>
          <p className="rd-lead">Smart Readiness isn't switched on yet. Check back soon.</p>
        </section>
      </Shell>
    );
  }

  if (!data.connected) {
    return (
      <Shell>
        <section className="rd-card">
          <h3>Connect your X account</h3>
          <p className="rd-lead">
            We look at the public followers and posts of the X account you connect, then show your readiness score, what's holding it back, where your voice is strongest and how it trends. Only you see your score.
          </p>
          <button type="button" className="rd-btn" onClick={() => connectTwitter()}>Connect X</button>
        </section>
      </Shell>
    );
  }

  const s = data.latest;
  if (!s || !s.components || !s.metrics) {
    return (
      <Shell>
        <section className="rd-card">
          <h3>@{data.username}</h3>
          <p className="rd-lead">{busy ? "Calculating your score. This can take up to half a minute." : note ?? "Your score is being prepared."}</p>
          {!busy && <button type="button" className="rd-btn" onClick={refresh}>Try again</button>}
        </section>
      </Shell>
    );
  }

  const tier = tierFor(s.score);
  const m = s.metrics;
  const gaps = biggestGaps(s.components);
  const penalty = Math.round((1 - m.gate) * 100);

  return (
    <Shell>
      <div className="rd-grid">
        <section className="rd-card rd-score">
          <div className="rd-ringwrap">
            <Ring score={s.score} />
            <div className="rd-ringtext"><b>{s.score}</b><span>/ 100</span></div>
          </div>
          <div>
            <div className="rd-tier">{tier.name}</div>
            <p className="rd-advice">{tier.advice}</p>
            {penalty > 0 && (
              <p className="rd-note">
                {m.daysSinceLastPost == null ? "No posts in the last 60 days" : `Last post ${m.daysSinceLastPost} days ago`}: inactivity is lowering your score by {penalty}%.
              </p>
            )}
          </div>
        </section>

        <section className="rd-card">
          <h3>Score breakdown</h3>
          <ul className="rd-signals">
            {COMPONENTS.map((c) => {
              const v = s.components![c.key];
              return (
                <li key={c.key}>
                  <div className="rd-signals__row">
                    <span>{c.label}</span>
                    <span>{v == null ? "Not enough data yet" : Math.round(v)}</span>
                  </div>
                  <div className="rd-track"><i style={{ width: `${v ?? 0}%` }} /></div>
                  <small className="rd-detail">{detail(c.key, m)}</small>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rd-card">
          <h3>Where your voice is strongest</h3>
          {data.voices.length === 0 ? (
            <p className="rd-lead">Post at least twice about a topic (DeFi, AI, NFTs, Bitcoin and more) in the last 60 days and your strongest topics show up here.</p>
          ) : (
            <ul className="rd-voices">
              {data.voices.map((v) => (
                <li key={v.niche}>
                  <div className="rd-voices__top">
                    <b>{v.niche}</b>
                    <span className="rd-pill">{v.label}</span>
                  </div>
                  <div className="rd-track"><i style={{ width: `${v.score}%` }} /></div>
                  <small className="rd-detail">{standing(v)} · {v.posts} post{v.posts === 1 ? "" : "s"}</small>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rd-card">
          <h3>What's holding you back</h3>
          {gaps.length === 0 ? (
            <p className="rd-lead">Nothing major. Keep your cadence and engagement up.</p>
          ) : (
            <ul className="rd-next">
              {gaps.map((g) => (
                <li key={g.key}>
                  <b>{COMPONENTS.find((c) => c.key === g.key)!.label}:</b> {tip(g.key, m)}
                </li>
              ))}
            </ul>
          )}
          <h3 className="rd-sub">Trend</h3>
          <Trend data={data.trend.map((t) => t.score)} />
          <div className="rd-tiers">
            {TIERS.map((t) => (
              <span key={t.name} className={t.name === tier.name ? "is-on" : ""}>{t.name} · {t.min}+</span>
            ))}
          </div>
        </section>
      </div>

      <div className="rd-actions">
        <button type="button" className="rd-btn rd-btn--ghost" onClick={refresh} disabled={busy}>{busy ? "Refreshing…" : "Refresh"}</button>
        {note && <span className="rd-note">{note}</span>}
      </div>

      <p className="rd-foot">
        Based on a sample of {s.sampled.toLocaleString()} of your {s.followers_total.toLocaleString()} followers for @{data.username}; follower quality is estimated from that sample.
        {s.seed_followers > 0 && <> {s.seed_followers} of them are on our curated high-signal list.</>}
      </p>
    </Shell>
  );
}
