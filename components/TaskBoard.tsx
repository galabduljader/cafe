"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Task, TaskInput, Status } from "@/lib/types";
import { PRIORITIES, STATUSES, STATUS_ORDER } from "@/lib/magic";
import { daysUntil } from "@/lib/dates";
import { removeAttachment } from "@/lib/storage";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import Filters, { FilterState } from "./Filters";

const DEFAULT_FILTERS: FilterState = {
  status: "all",
  priority: "all",
  deadline: "any",
  sort: "deadline",
};

interface TaskBoardProps {
  userEmail: string;
  onSignOut: () => void;
}

export default function TaskBoard({ userEmail, onSignOut }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  // ---- data ----
  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else {
      setTasks(data as Task[]);
      setError(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // live updates across tabs / sessions
    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- mutations (optimistic-ish: just reload) ----
  async function saveTask(input: TaskInput, id?: string) {
    if (id) {
      const { error } = await supabase.from("tasks").update(input).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("tasks").insert(input);
      if (error) throw error;
    }
    await load();
  }

  async function advance(task: Task) {
    const idx = STATUS_ORDER.indexOf(task.status);
    if (idx >= STATUS_ORDER.length - 1) return;
    const next = STATUS_ORDER[idx + 1] as Status;
    // optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: next } : t))
    );
    const { error } = await supabase
      .from("tasks")
      .update({ status: next })
      .eq("id", task.id);
    if (error) {
      setError(error.message);
      load();
    }
  }

  async function remove(task: Task) {
    if (!confirm(`Banish "${task.title}" forever?`)) return;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      setError(error.message);
      load();
    } else {
      // tidy up the stored file too
      removeAttachment(task.attachment_path);
    }
  }

  // ---- filtering + sorting ----
  const filtered = useMemo(() => {
    let out = tasks.slice();

    if (filters.status !== "all")
      out = out.filter((t) => t.status === filters.status);
    if (filters.priority !== "all")
      out = out.filter((t) => t.priority === filters.priority);

    out = out.filter((t) => {
      const n = daysUntil(t.due_date);
      switch (filters.deadline) {
        case "overdue":
          return n !== null && n < 0 && t.status !== "done";
        case "today":
          return n === 0;
        case "week":
          return n !== null && n >= 0 && n <= 7;
        case "has":
          return t.due_date !== null;
        case "none":
          return t.due_date === null;
        default:
          return true;
      }
    });

    const farFuture = Number.POSITIVE_INFINITY;
    out.sort((a, b) => {
      if (filters.sort === "priority") {
        return PRIORITIES[b.priority].rank - PRIORITIES[a.priority].rank;
      }
      if (filters.sort === "created") {
        return b.created_at.localeCompare(a.created_at);
      }
      // deadline: soonest first, nulls last
      const da = a.due_date ? daysUntil(a.due_date)! : farFuture;
      const db = b.due_date ? daysUntil(b.due_date)! : farFuture;
      return da - db;
    });

    return out;
  }, [tasks, filters]);

  // counts per status for the header tally
  const tally = useMemo(() => {
    const t = { upcoming: 0, in_progress: 0, done: 0 } as Record<Status, number>;
    for (const task of tasks) t[task.status]++;
    return t;
  }, [tasks]);

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
      {/* ✦ Account bar ✦ */}
      <div className="mb-4 flex items-center justify-end gap-3">
        <span className="chip border-parchment-200 bg-white/60 text-blush-500">
          <span aria-hidden>🔮</span>
          {userEmail}
        </span>
        <button className="btn-ghost text-xs" onClick={onSignOut}>
          ✦ Sign out
        </button>
      </div>

      {/* ✦ Header ✦ */}
      <header className="mb-8 text-center">
        <p className="font-script text-3xl text-blush-400">welcome to your</p>
        <h1 className="font-display text-6xl font-bold leading-none gilt-text sm:text-7xl">
          Enchanted Tasks
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-blush-500/80">
          A grimoire where every wish becomes a spell, and every spell
          becomes a star. ✨
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {STATUS_ORDER.map((s) => {
            const m = STATUSES[s];
            return (
              <span
                key={s}
                className={`chip ${m.bg} ${m.border} ${m.text}`}
                title={m.plain}
              >
                <span aria-hidden>{m.emoji}</span>
                {tally[s]} {m.label}
              </span>
            );
          })}
        </div>

        <button
          className="btn-magic mt-6 text-base"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          ✦ Pen a new wish
        </button>
      </header>

      <Filters
        value={filters}
        onChange={setFilters}
        counts={{ total: tasks.length, shown: filtered.length }}
      />

      {/* ✦ Tasks ✦ */}
      <section className="mt-8">
        {error && (
          <div className="paper mb-6 border-blush-300 p-4 text-center text-blush-700">
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center font-script text-2xl text-blush-300 animate-twinkle">
            ✦ summoning your spells ✦
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasTasks={tasks.length > 0} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAdvance={advance}
                onEdit={(t) => {
                  setEditing(t);
                  setFormOpen(true);
                }}
                onDelete={remove}
              />
            ))}
          </div>
        )}
      </section>

      <TaskForm
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSave={saveTask}
      />

      <footer className="mt-16 text-center text-xs text-blush-300">
        spun with ✦ love, lace & a little Supabase magic
      </footer>
    </div>
  );
}

function EmptyState({ hasTasks }: { hasTasks: boolean }) {
  return (
    <div className="paper animate-floatUp px-6 py-16 text-center">
      <div className="mb-3 text-5xl animate-twinkle">🪄</div>
      <h3 className="font-display text-3xl font-semibold text-blush-600">
        {hasTasks ? "No spells match your charms" : "Your grimoire is blank"}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-blush-400">
        {hasTasks
          ? "Try clearing a filter to reveal more wishes."
          : "Pen your very first wish and watch the magic begin."}
      </p>
    </div>
  );
}
