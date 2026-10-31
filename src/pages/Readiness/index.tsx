import { useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { computeReadiness, TIERS, type ReadinessInput } from "@/lib/readiness";
import "./readiness.css";

// TODO(kaito): replace with real data once the Kaito key is in. Smart Follower
// counts and daily gains come from kaito_smart_followers; per-post engagement
// by distinct Smart Followers is not exposed by that tool, so it may stay null.
const SAMPLE: ReadinessInput = { smartFollowers: 650, engagementPerPost: 18, posts: 10 };
const SAMPLE_TREND = [31, 34, 33, 38, 41, 44, 43, 47, 50, 52, 55, 57];

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
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 300},${56 - ((v - min) / (max - min || 1)) * 48}`).join(" ");
  return (
    <svg viewBox="0 0 300 60" className="rd-trend" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="#4a7dff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ReadinessPage() {
  usePageTitle("Zerra · Smart Readiness");
  const r = useMemo(() => computeReadiness(SAMPLE), []);
  const w = r.weakest;

  return (
    <div className="rd">
      <div className="rd-banner">Preview with sample data. Live Kaito data isn't connected yet.</div>

      <header className="rd-head">
        <h1>Your path to Smart Account status</h1>
        <p>Know where you stand. Know what to do next.</p>
      </header>

      <div className="rd-grid">
        <section className="rd-card rd-score">
          <div className="rd-ringwrap">
            <Ring score={r.score} />
            <div className="rd-ringtext"><b>{r.score}</b><span>/ 100</span></div>
          </div>
          <div>
            <div className="rd-tier">{r.tier.name}</div>
            <p className="rd-advice">{r.tier.advice}</p>
            {r.partial && <p className="rd-note">Some signals are unavailable, so this score uses the rest.</p>}
          </div>
        </section>

        <section className="rd-card">
          <h3>Signals (last 30 days)</h3>
          <ul className="rd-signals">
            {r.signals.map((s) => (
              <li key={s.key}>
                <div className="rd-signals__row">
                  <span>{s.label}</span>
                  <span>{s.value == null ? "Not available" : `${s.value} / ${s.target}`}</span>
                </div>
                <div className="rd-track"><i style={{ width: `${s.score ?? 0}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rd-card">
          <h3>What's holding you back</h3>
          {w ? (
            <>
              <p className="rd-lead">
                Your biggest gap is <b>{w.label.toLowerCase()}</b>: {w.value} of {w.target}.
              </p>
              <ul className="rd-next">
                {r.signals.filter((s) => s.score != null && s.score < 100).map((s) => (
                  <li key={s.key}>{s.label}: reach {s.target} (you're at {s.value}).</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rd-lead">You've hit every target. Keep your cadence up.</p>
          )}
        </section>

        <section className="rd-card">
          <h3>30-day trend</h3>
          <Trend data={SAMPLE_TREND} />
          <div className="rd-tiers">
            {TIERS.map((t) => (
              <span key={t.name} className={t.name === r.tier.name ? "is-on" : ""}>{t.name} · {t.min}+</span>
            ))}
          </div>
        </section>
      </div>

      <p className="rd-foot">
        This is Zerra's own readiness estimate. It is not an official Kaito score and does not guarantee Smart Account classification.
      </p>
    </div>
  );
}
