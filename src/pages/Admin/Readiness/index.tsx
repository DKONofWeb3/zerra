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

  const decide = async (c: Candidate, decision: "approved" | "rejected") => {
    setCands((list) => list.filter((x) => x.handle !== c.handle));
    try {
      await decideCandidate(c, decision);
      if (decision === "approved") await load();
    } catch (e: any) {
      setError(e.message);
      loadCands();
    }
  };
  const q = candQuery.trim().toLowerCase().replace(/^@/, "");
  const matched = q ? cands.filter((c) => c.handle.includes(q) || (c.name ?? "").toLowerCase().includes(q)) : cands;
  const fmt = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);

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
        Accounts that keep landing among the most-viewed CT posts over the last 30 days, most consistent first. Approve the ones that are credible; rejected ones won't show up again. {seeds.length} approved so far (about 100 needed to switch the score over).
      </p>
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
              <span className="text-[12px] text-fg-tertiary">{fmt(c.followers)} followers · {c.days} active day{c.days === 1 ? "" : "s"} · {c.posts} top post{c.posts === 1 ? "" : "s"} · {fmt(c.views)} views</span>
            </div>
            <button type="button" onClick={() => decide(c, "rejected")} className="h-8 px-4 rounded-full text-[12.5px] text-fg-secondary border border-white/[0.12] hover:text-red-400">Reject</button>
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
