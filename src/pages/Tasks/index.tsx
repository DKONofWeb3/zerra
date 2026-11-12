import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { HeaderActions } from "@/components/layout/HeaderActions";
import {
  addPlan, addTask, deletePlan, deleteTask, getTaskActivity, getTasks, toggleTask, type PlanKind, type TaskPlan, type TasksState,
} from "@/lib/api";
import "./tasks.css";

// Bloom "Creator Tasks" (Figma 572:1469 desktop / 572:1802 mobile): a personal
// daily checklist. A day counts toward the streak and the activity grid when at
// least one task was ticked that day. Days are the user's local calendar days.

const KIND_LABEL: Record<PlanKind, string> = { post: "Posts", reply: "Replies", thread: "Threads", article: "Articles" };
const planEnd = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function PlanCard({ plan, onRemove }: { plan: TaskPlan; onRemove: () => void }) {
  const pct = Math.min(100, (plan.this_week / plan.per_week) * 100);
  const met = plan.this_week >= plan.per_week;
  return (
    <div className="tk-plan">
      <div className="tk-plan__top">
        <b>{KIND_LABEL[plan.kind]} · {plan.per_week} per week</b>
        <button type="button" className="tk-trash" aria-label="Remove plan" onClick={onRemove}><Trash2 size={15} /></button>
      </div>
      <div className="tk-plan__bar"><i className={met ? "is-met" : ""} style={{ width: `${pct}%` }} /></div>
      <p>
        {plan.ended
          ? `Finished · ${plan.weeks_met} of ${plan.total_weeks} weeks hit`
          : `${plan.this_week} of ${plan.per_week} this week · week ${plan.week_index} of ${plan.total_weeks} · ends ${planEnd(plan.end_date)}`}
      </p>
    </div>
  );
}
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

  // Depend on the date strings, not the Date objects: `end` is a fresh object every render on
  // Sundays (and when paging back), which re-ran this effect forever and flooded the API.
  const fromStr = ymd(start);
  const toStr = ymd(end);
  useEffect(() => {
    let live = true;
    getTaskActivity(fromStr, toStr)
      .then((r) => { if (live) setActive(new Set(r.days)); })
      .catch(() => { if (live) setActive(new Set()); });
    return () => { live = false; };
  }, [fromStr, toStr]);

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
  const [kind, setKind] = useState<PlanKind>("post");
  const [perWeek, setPerWeek] = useState(5);
  const [unit, setUnit] = useState<"weeks" | "months">("weeks");
  const [duration, setDuration] = useState(4);
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

  // While the server is reading your X account, check back until it has finished.
  useEffect(() => {
    if (!state?.syncing) return;
    const t = setTimeout(() => { load().then(() => setHeatKey((k) => k + 1)); }, 6000);
    return () => clearTimeout(t);
  }, [state, load]);

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

  const onStartPlan = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await addPlan({ kind, per_week: perWeek, unit, duration, today });
      await refreshAll();
    } catch (e: any) {
      setError(e.message ?? "Couldn't start that plan");
    } finally {
      setBusy(false);
    }
  };

  const onRemovePlan = async (id: string) => {
    try {
      await deletePlan(id);
      await refreshAll();
    } catch (e: any) {
      setError(e.message ?? "Couldn't remove that plan");
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
            <p>{state && state.streak > 0 ? `You’re doing really great${firstName ? `, ${firstName}` : ""}` : "Set a task today to activate streak"}</p>
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

        <aside className="tk-builder">
          <h3>Plan your week</h3>
          <div className="tk-builder__body">
            <label>What do you want to do?
              <select value={kind} onChange={(e) => setKind(e.target.value as PlanKind)}>
                {(Object.keys(KIND_LABEL) as PlanKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
              </select>
            </label>
            <label>How many each week?
              <select value={perWeek} onChange={(e) => setPerWeek(Number(e.target.value))}>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} per week</option>)}
              </select>
            </label>
            <div className="tk-builder__row">
              <label>For how long?
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  {Array.from({ length: unit === "weeks" ? 12 : 6 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>&nbsp;
                <select value={unit} onChange={(e) => { const u = e.target.value as "weeks" | "months"; setUnit(u); setDuration((d) => Math.min(d, u === "weeks" ? 12 : 6)); }}>
                  <option value="weeks">weeks</option>
                  <option value="months">months</option>
                </select>
              </label>
            </div>
            <button type="button" className="tk-builder__go" disabled={busy} onClick={onStartPlan}>{busy ? "Starting…" : "Start plan"}</button>
            <small>We read your connected X account and light up your streak when you do the work.</small>
          </div>
        </aside>

        <div className="tk-list">
          {state && state.plans.length > 0 && (
            <div className="tk-plans">
              {state.syncing && <p className="tk-sync">Checking your X account…</p>}
              {state.plans.map((p) => <PlanCard key={p.id} plan={p} onRemove={() => onRemovePlan(p.id)} />)}
            </div>
          )}
          {state && state.tasks.length === 0 && <p className="tk-empty">No personal tasks yet. Add one below, or start a weekly plan.</p>}
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
