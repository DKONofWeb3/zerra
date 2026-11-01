import { useCallback, useEffect, useState } from "react";
import { addSeedAccounts, deleteSeedAccount, getSeedAccounts, type SeedAccount } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";

// The curated high-signal Crypto Twitter list that Smart Readiness scores against.
export default function AdminReadinessPage() {
  usePageTitle("Admin · Readiness seed list");
  const [seeds, setSeeds] = useState<SeedAccount[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

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
