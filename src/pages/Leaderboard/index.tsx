import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api";
import { tierFor } from "@/lib/readiness";
import "./leaderboard.css";

// Zerra creators ranked by their latest Smart Readiness score.

function fmt(n: number): string {
  if (n >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}K`;
  return String(Math.round(n));
}

export default function LeaderboardPage() {
  usePageTitle("Zerra · Leaderboard");
  const [data, setData] = useState<{ total: number; entries: LeaderboardEntry[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getLeaderboard()
      .then((d) => { if (live) setData(d); })
      .catch((e) => { if (live) setError(e.message ?? "Couldn't load the leaderboard"); });
    return () => { live = false; };
  }, []);

  return (
    <div className="lb">
      <div className="lb-glows" aria-hidden><div className="lb-glow-a" /><div className="lb-glow-b" /></div>

      <header className="lb-head">
        <h1>Leaderboard</h1>
        <p>Top creators on Zerra, ranked by Smart Readiness score{data ? ` · ${data.total} scored` : ""}</p>
      </header>

      {error && !data && <p className="lb-empty">{error}</p>}
      {!data && !error && <p className="lb-empty">Loading…</p>}

      {data && (
        <div className="lb-table">
          <div className="lb-row lb-row--head">
            <span>#</span><span>Creator</span><span>Tag</span><span>Followers</span><span>Score</span>
          </div>
          {data.entries.length === 0 && (
            <div className="lb-row lb-row--empty">
              No scores yet. Connect X and open Smart Readiness to get on the board.
            </div>
          )}
          {data.entries.map((e) => (
            <div className={e.rank <= 3 ? `lb-row lb-row--top lb-row--${e.rank}` : "lb-row"} key={`${e.rank}-${e.handle ?? e.name}`}>
              <span className="lb-rank">{e.rank}</span>
              <div className="lb-who">
                <div className="lb-avatar">
                  {e.avatar
                    ? <img src={e.avatar} alt="" referrerPolicy="no-referrer" />
                    : <span>{(e.name ?? e.handle ?? "?").charAt(0).toUpperCase()}</span>}
                </div>
                <div className="lb-who__text">
                  <b>{e.name ?? (e.handle ? `@${e.handle}` : "Creator")}</b>
                  <small>{e.handle ? `@${e.handle}` : ""}<span className="lb-mob-only">{e.handle ? " · " : ""}{fmt(e.followers)}</span></small>
                  <span className="lb-tag lb-tag--mob">{tierFor(e.score).name}</span>
                </div>
              </div>
              <span className="lb-tag">{tierFor(e.score).name}</span>
              <span>{fmt(e.followers)}</span>
              <span className="lb-score">{e.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
