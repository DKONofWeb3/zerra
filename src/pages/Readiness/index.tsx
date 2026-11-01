import { useCallback, useEffect, useMemo, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { computeReadiness, TIERS } from "@/lib/readiness";
import { connectTwitter, getReadiness, refreshReadiness, type ReadinessResponse } from "@/lib/api";
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

  // First visit with X connected and no snapshot yet: compute it now instead of making the user wait for the daily job.
  const needsFirstRun = !!data && data.available && data.connected && !data.latest;
  useEffect(() => { if (needsFirstRun) refresh(); }, [needsFirstRun]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const s = data?.latest;
    return s ? computeReadiness({ qualityFollowers: s.quality_followers, engagementPerPost: s.engagement_per_post, posts: s.posts_30d }) : null;
  }, [data]);

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
            We look at the public followers and posts of the X account you connect, then show your readiness score, what's holding it back and how it trends. Only you see your score.
          </p>
          <button type="button" className="rd-btn" onClick={() => connectTwitter()}>Connect X</button>
        </section>
      </Shell>
    );
  }

  if (!data.latest || !r) {
    return (
      <Shell>
        <section className="rd-card">
          <h3>@{data.username}</h3>
          <p className="rd-lead">{busy ? "Calculating your score. This takes a few seconds." : note ?? "Your first score is being prepared."}</p>
          {!busy && <button type="button" className="rd-btn" onClick={refresh}>Try again</button>}
        </section>
      </Shell>
    );
  }

  const s = data.latest;
  const w = r.weakest;
  return (
    <Shell>
      <div className="rd-grid">
        <section className="rd-card rd-score">
          <div className="rd-ringwrap">
            <Ring score={r.score} />
            <div className="rd-ringtext"><b>{r.score}</b><span>/ 100</span></div>
          </div>
          <div>
            <div className="rd-tier">{r.tier.name}</div>
            <p className="rd-advice">{r.tier.advice}</p>
            {r.partial && <p className="rd-note">Engagement per post isn't measured yet, so this score uses the other signals.</p>}
          </div>
        </section>

        <section className="rd-card">
          <h3>Signals (last 30 days)</h3>
          <ul className="rd-signals">
            {r.signals.map((x) => (
              <li key={x.key}>
                <div className="rd-signals__row">
                  <span>{x.label}</span>
                  <span>{x.value == null ? "Not measured yet" : `${x.value} / ${x.target}`}</span>
                </div>
                <div className="rd-track"><i style={{ width: `${x.score ?? 0}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rd-card">
          <h3>What's holding you back</h3>
          {w ? (
            <>
              <p className="rd-lead">Your biggest gap is <b>{w.label.toLowerCase()}</b>: {w.value} of {w.target}.</p>
              <ul className="rd-next">
                {r.signals.filter((x) => x.score != null && x.score < 100).map((x) => (
                  <li key={x.key}>{x.label}: reach {x.target} (you're at {x.value}).</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rd-lead">You've hit every target. Keep your cadence up.</p>
          )}
        </section>

        <section className="rd-card">
          <h3>Trend</h3>
          <Trend data={data.trend.map((t) => t.score)} />
          <div className="rd-tiers">
            {TIERS.map((t) => (
              <span key={t.name} className={t.name === r.tier.name ? "is-on" : ""}>{t.name} · {t.min}+</span>
            ))}
          </div>
        </section>
      </div>

      <div className="rd-actions">
        <button type="button" className="rd-btn rd-btn--ghost" onClick={refresh} disabled={busy}>{busy ? "Refreshing…" : "Refresh"}</button>
        {note && <span className="rd-note">{note}</span>}
      </div>

      <p className="rd-foot">
        Based on a sample of {s.sampled.toLocaleString()} of your {s.followers_total.toLocaleString()} followers for @{data.username}; quality follower count is an estimate.
        {s.seed_followers > 0 && <> {s.seed_followers} of the sampled followers are on our curated high-signal list.</>}
        {" "}This is Zerra's own readiness estimate. It is not an official Kaito score and does not guarantee Smart Account classification.
      </p>
    </Shell>
  );
}
