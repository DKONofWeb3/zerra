import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { HeaderActions } from "@/components/layout/HeaderActions";
import {
  addTask, deleteTask, getTaskActivity, getTasks, toggleTask, type TasksState,
} from "@/lib/api";
import "./tasks.css";

// Bloom "Creator Tasks" (Figma 572:1469 desktop / 572:1802 mobile): a personal
// daily checklist. A day counts toward the streak and the activity grid when at
// least one task was ticked that day. Days are the user's local calendar days.

const PRESETS = ["Post 1 short/ reel", "Reply to 20 comments", "Pitch to 2 Devs"];
const DAY_LABEL = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
const ROW_LABEL = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKS = 20;

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
/** Monday of the week containing d. */
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const rangeFmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function Heatmap() {
  const today = useMemo(() => new Date(), []);
  const [offset, setOffset] = useState(0); // 0 = the 20 weeks ending this week
  const [active, setActive] = useState<Set<string>>(new Set());

  const start = useMemo(() => addDays(mondayOf(today), -(WEEKS - 1 + offset * WEEKS) * 7), [today, offset]);
  const lastSunday = addDays(start, WEEKS * 7 - 1);
  const end = lastSunday > today ? today : lastSunday;

  useEffect(() => {
    let live = true;
    getTaskActivity(ymd(start), ymd(end))
      .then((r) => { if (live) setActive(new Set(r.days)); })
      .catch(() => { if (live) setActive(new Set()); });
    return () => { live = false; };
  }, [start, end]);

  const todayStr = ymd(today);
  return (
    <section className="tk-activity">
      <div className="tk-activity__nav">
        <button type="button" aria-label="Earlier" onClick={() => setOffset((o) => o + 1)}><ArrowLeft size={22} /></button>
        <h3>{rangeFmt(start)} - {rangeFmt(end)}</h3>
        <button type="button" aria-label="Later" disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - 1))}><ArrowRight size={22} /></button>
      </div>
      <div className="tk-grid">
        <div className="tk-grid__rows">{ROW_LABEL.map((l, i) => <span key={i}>{l}</span>)}</div>
        <div className="tk-grid__cells" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
          {Array.from({ length: WEEKS * 7 }, (_, i) => {
            const col = Math.floor(i / 7), row = i % 7;
            const day = ymd(addDays(start, col * 7 + row));
            const on = active.has(day);
            return <i key={i} className={on ? "is-on" : day > todayStr ? "is-future" : ""} title={day} />;
          })}
        </div>
      </div>
    </section>
  );
}

export default function TasksPage() {
  usePageTitle("Zerra · Tasks");
  const { user } = useCurrentUser();
  const today = ymd(new Date());
  const [state, setState] = useState<TasksState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [heatKey, setHeatKey] = useState(0); // remount the grid after a change so it refetches

  const load = useCallback(async () => {
    try {
      setState(await getTasks(today));
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Couldn't load your tasks");
    }
  }, [today]);
  useEffect(() => { load(); }, [load]);

  const refreshAll = async () => { await load(); setHeatKey((k) => k + 1); };

  const onToggle = async (id: string) => {
    if (!state) return;
    // Optimistic: flip the tick and the counter now, then reconcile with the server.
    setState({
      ...state,
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      done: state.done + (state.tasks.find((t) => t.id === id)?.done ? -1 : 1),
    });
    try {
      await toggleTask(id, today);
      await refreshAll();
    } catch (e: any) {
      setError(e.message ?? "Couldn't update that task");
      await load();
    }
  };

  const onAdd = async (title: string) => {
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await addTask(t);
      setText("");
      await refreshAll();
    } catch (e: any) {
      setError(e.message ?? "Couldn't add that task");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteTask(id);
      await refreshAll();
    } catch (e: any) {
      setError(e.message ?? "Couldn't delete that task");
    }
  };

  const firstName = (user?.name ?? user?.username ?? "").split(" ")[0];
  const have = new Set((state?.tasks ?? []).map((t) => t.title.trim().toLowerCase()));

  return (
    <div className="tk">
      <div className="tk-glows" aria-hidden><div className="tk-glow-a" /><div className="tk-glow-b" /></div>

      <div className="tk-mhead"><h1>Task</h1><HeaderActions size={34} /></div>
      <h1 className="tk-title">Creator Tasks</h1>

      {error && <p className="tk-error">{error}</p>}

      <div className="tk-top">
        <section className="tk-today">
          <div className="tk-today__head">
            <span className="tk-check"><Check size={14} /></span>
            <b>Today</b>
          </div>
          <div className="tk-today__count">{state ? `${state.done}/${state.total}` : "–"}</div>
          <small>Tasks done</small>
        </section>

        <section className="tk-streak">
          <img className="tk-streak__bolt" src="/tasks/bolt.svg" alt="" />
          <div className="tk-streak__text">
            <h2>{state ? `${state.streak} Day${state.streak === 1 ? "" : "s"} Streak` : "Streak"}</h2>
            <p>{state && state.streak > 0 ? `You’re doing really great${firstName ? `, ${firstName}` : ""}` : "Tick a task today to start your streak"}</p>
          </div>
          <div className="tk-week">
            {(state?.week ?? Array.from({ length: 7 }, (_, i) => ({ date: String(i), active: false, future: false, today: false }))).map((d, i) => (
              <div key={d.date}>
                {d.active
                  ? <img src="/tasks/day-done.svg" alt="" />
                  : d.today
                    ? <img src="/tasks/fire.svg" alt="" className="is-fire" />
                    : <img src="/tasks/day-empty.svg" alt="" />}
                <span>{DAY_LABEL[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="tk-presets">
          <h3>Creator Habits &amp; Presets</h3>
          <ul>
            {PRESETS.map((p) => (
              <li key={p}>
                <span className="ic"><img src="/dash/ic-followers.svg" alt="" /></span>
                <span className="tx">{p}</span>
                <button type="button" aria-label={`Add ${p}`} disabled={have.has(p.toLowerCase()) || busy} onClick={() => onAdd(p)}><Plus size={18} /></button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="tk-list">
          {state && state.tasks.length === 0 && <p className="tk-empty">No tasks yet. Add one below, or pick a preset.</p>}
          {state?.tasks.map((t) => (
            <div className={t.done ? "tk-task is-done" : "tk-task"} key={t.id}>
              <button type="button" className="tk-box" aria-label={t.done ? "Mark not done" : "Mark done"} onClick={() => onToggle(t.id)}>
                {t.done && <Check size={16} />}
              </button>
              <span className="tk-task__text">{t.title}</span>
              <button type="button" className="tk-trash" aria-label="Delete task" onClick={() => onDelete(t.id)}><Trash2 size={15} /></button>
            </div>
          ))}

          <form className="tk-add" onSubmit={(e) => { e.preventDefault(); onAdd(text); }}>
            <Plus size={18} />
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={120}
              placeholder="Quick add a new daily task (e.g. 'Engage with 10 creator accounts')..." />
            <button type="submit" disabled={busy || !text.trim()}>Add</button>
          </form>
        </div>
      </div>

      <h2 className="tk-h2">Activity</h2>
      <Heatmap key={heatKey} />
    </div>
  );
}
