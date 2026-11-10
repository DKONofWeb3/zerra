import { useCallback, useEffect, useState } from "react";
import { addSeedAccounts, decideCandidate, deleteSeedAccount, getCandidates, getSeedAccounts, type Candidate, type SeedAccount } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";

// The curated high-signal Crypto Twitter list that Smart Readiness scores against.
export default function AdminReadinessPage() {
  usePageTitle("Admin · Readiness seed list");
  const [seeds, setSeeds] = useState<SeedAccount[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [cands, setCands] = useState<Candidate[]>([]);
  const [candsLoaded, setCandsLoaded] = useState(false);
  const [shownCount, setShownCount] = useState(50);
  const [candQuery, setCandQuery] = useState("");
  const [tab, setTab] = useState<"discovered" | "emerging" | "under_review">("discovered");

  const loadCands = useCallback(async () => {
    try {
      setCands((await getCandidates()).candidates);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCandsLoaded(true);
    }
  }, []);
  useEffect(() => { loadCands(); }, [loadCands]);

  const decide = async (c: Candidate, decision: "approved" | "rejected" | "under_review") => {
    setCands((list) => decision === "under_review"
      ? list.map((x) => (x.handle === c.handle ? { ...x, status: "under_review" } : x))
      : list.filter((x) => x.handle !== c.handle));
    try {
      await decideCandidate(c, decision);
      if (decision === "approved") await load();
    } catch (e: any) {
      setError(e.message);
      loadCands();
    }
  };
  const q = candQuery.trim().toLowerCase().replace(/^@/, "");
  const inTab = cands.filter((c) => c.status === tab);
  const counts = { discovered: 0, emerging: 0, under_review: 0 };
  for (const c of cands) counts[c.status]++;
  const matched = q ? inTab.filter((c) => c.handle.includes(q) || (c.name ?? "").toLowerCase().includes(q)) : inTab;
  const fmt = (n: number | null) => n === null ? "n/a" : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);

  const load = useCallback(async () => {
    try {
      setSeeds((await getSeedAccounts()).seeds);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const handles = input.split(/[\s,]+/).filter(Boolean);
    if (handles.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await addSeedAccounts(handles);
      setInput("");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteSeedAccount(id);
      setSeeds((s) => s.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const shown = seeds.filter((s) => s.handle.includes(filter.trim().toLowerCase().replace(/^@/, "")));

  return (
    <div className="max-w-[760px]">
      <p className="text-[14px] text-fg-secondary mb-5">
        Accounts we treat as high-signal. A creator's followers on this list always count toward their Smart Readiness score.
        Paste one or many handles, separated by spaces, commas or new lines.
      </p>

      <h2 className="text-[16px] font-medium text-fg-primary mb-1">Suggested accounts</h2>
      <p className="text-[12.5px] text-fg-tertiary mb-3">
        Ranked by discovery score from the last 30 days of CT posts (reach, engagement quality, niche and authenticity). Recognition by credible accounts isn't measured yet, so treat the score as a first filter, not a verdict. Approve the ones that are credible; rejected ones won't show up again. {seeds.length} approved so far (about 100 needed to switch the score over).
      </p>
      <div className="flex gap-2 mb-3 flex-wrap">
        {([["discovered", "Discovered"], ["emerging", "Emerging"], ["under_review", "Under review"]] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setTab(key); setShownCount(50); }}
            className={"h-8 px-4 rounded-full text-[12.5px] border " + (tab === key ? "text-white border-transparent" : "text-fg-secondary border-white/[0.12] hover:text-fg-primary")}
            style={tab === key ? { background: "rgb(74 125 255)" } : undefined}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>
      <input
        value={candQuery}
        onChange={(e) => { setCandQuery(e.target.value); setShownCount(50); }}
        placeholder="Search suggestions by name or @handle"
        className="glass h-10 px-4 w-full rounded-full text-[13px] text-fg-primary placeholder:text-fg-tertiary focus:outline-none mb-3"
      />
      <ul className="glass rounded-2xl divide-y divide-white/[0.05] mb-8 max-h-[460px] overflow-y-auto">
        {matched.slice(0, shownCount).map((c) => (
          <li key={c.handle} className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/[0.06] shrink-0">
              {c.avatar && <img src={c.avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <a href={`https://x.com/${c.handle}`} target="_blank" rel="noreferrer" className="text-[14px] text-fg-primary hover:underline block truncate">
                {c.name ?? `@${c.handle}`} <span className="text-fg-tertiary">@{c.handle}</span>
              </a>
              <span className="text-[12px] text-fg-tertiary block">
                {fmt(c.followers)} followers · median {fmt(c.median_views)} views · ER {c.median_er === null ? "n/a" : `${c.median_er}%`} · {c.active_days} active day{c.active_days === 1 ? "" : "s"} · {c.originals} post{c.originals === 1 ? "" : "s"}{c.quotes ? ` + ${c.quotes} quote${c.quotes === 1 ? "" : "s"}` : ""}
              </span>
              <span className="text-[11.5px] text-fg-tertiary block">
                {c.niche_primary ?? "No niche yet"}{c.niche_secondary ? ` / ${c.niche_secondary}` : ""} · authenticity {c.authenticity ?? "n/a"} · data confidence {c.data_confidence ?? "n/a"}
              </span>
            </div>
            <div className="text-right shrink-0 mr-1" title={`Discovery score out of 100. Only ${Math.round(c.coverage * 100)}% of the score can be measured so far (recognition and network quality aren't collected yet).`}>
              <div className="text-[16px] text-fg-primary">{c.discovery_score}</div>
              <div className="text-[10.5px] text-fg-tertiary">{Math.round(c.coverage * 100)}% coverage</div>
            </div>
            <button type="button" onClick={() => decide(c, "rejected")} className="h-8 px-3 rounded-full text-[12.5px] text-fg-secondary border border-white/[0.12] hover:text-red-400">Reject</button>
            {c.status !== "under_review" && (
              <button type="button" onClick={() => decide(c, "under_review")} className="h-8 px-3 rounded-full text-[12.5px] text-fg-secondary border border-white/[0.12] hover:text-fg-primary">Review later</button>
            )}
            <button type="button" onClick={() => decide(c, "approved")} className="h-8 px-4 rounded-full text-[12.5px] font-medium text-white" style={{ background: "rgb(74 125 255)" }}>Approve</button>
          </li>
        ))}
        {matched.length === 0 && <li className="px-4 py-6 text-[13px] text-fg-tertiary">{candsLoaded ? (q ? "No suggestions match that search." : "No suggestions right now. They appear as the CT collector finds more accounts.") : "Loading…"}</li>}
        {matched.length > shownCount && <li className="px-4 py-3"><button type="button" onClick={() => setShownCount((n) => n + 50)} className="text-[13px] text-fg-secondary hover:text-fg-primary">Show more ({matched.length - shownCount} left)</button></li>}
      </ul>

      <h2 className="text-[16px] font-medium text-fg-primary mb-1">Add handles yourself</h2>
      <div className="glass rounded-2xl p-4 mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="@vitalikbuterin, @cobie, …"
          className="w-full bg-transparent text-[14px] text-fg-primary placeholder:text-fg-tertiary focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[12px] text-fg-tertiary">{seeds.length} on the list</span>
          <button
            type="button"
            onClick={add}
            disabled={busy || !input.trim()}
            className="h-9 px-5 rounded-full text-[13px] font-medium text-white disabled:opacity-40"
            style={{ background: "rgb(74 125 255)" }}
          >
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {error && <p className="text-[13px] text-red-400 mb-4">{error}</p>}

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter list"
        className="glass h-10 px-4 w-full rounded-full text-[13px] text-fg-primary placeholder:text-fg-tertiary focus:outline-none mb-3"
      />

      <ul className="divide-y divide-white/[0.05]">
        {shown.map((s) => (
          <li key={s.id} className="flex items-center justify-between py-2.5">
            <a href={`https://x.com/${s.handle}`} target="_blank" rel="noreferrer" className="text-[14px] text-fg-primary hover:underline">
              @{s.handle}
            </a>
            <button type="button" onClick={() => remove(s.id)} className="text-[12px] text-fg-tertiary hover:text-red-400">Remove</button>
          </li>
        ))}
        {shown.length === 0 && <li className="py-6 text-[13px] text-fg-tertiary">{seeds.length ? "No matches." : "The list is empty. Add the first handles above."}</li>}
      </ul>
    </div>
  );
}
