"use client";

import type { Priority, Status } from "@/lib/types";
import { PRIORITIES, PRIORITY_ORDER, STATUSES, STATUS_ORDER } from "@/lib/magic";

export type DeadlineFilter =
  | "any"
  | "overdue"
  | "today"
  | "week"
  | "has"
  | "none";

export type SortKey = "deadline" | "priority" | "created";

export interface FilterState {
  status: Status | "all";
  priority: Priority | "all";
  deadline: DeadlineFilter;
  sort: SortKey;
}

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  counts: { total: number; shown: number };
}

const DEADLINE_OPTIONS: { value: DeadlineFilter; label: string; emoji: string }[] =
  [
    { value: "any", label: "Any time", emoji: "🌌" },
    { value: "overdue", label: "Past due", emoji: "⏳" },
    { value: "today", label: "Today", emoji: "☀️" },
    { value: "week", label: "This week", emoji: "🗓️" },
    { value: "has", label: "Has deadline", emoji: "📜" },
    { value: "none", label: "Timeless", emoji: "✦" },
  ];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "deadline", label: "Soonest deadline" },
  { value: "priority", label: "Loudest priority" },
  { value: "created", label: "Newest first" },
];

function Pill({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip transition ${
        active
          ? `${className} ring-2 ring-blush-200`
          : "border-parchment-200 bg-white/60 text-blush-400 hover:text-blush-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function Filters({ value, onChange, counts }: Props) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="paper p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-blush-600">
          ✧ Sift the spells
        </h2>
        <span className="text-xs font-semibold text-blush-400">
          {counts.shown} of {counts.total} shown
        </span>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div>
          <p className="mb-1.5 font-script text-lg text-blush-400">by status</p>
          <div className="flex flex-wrap gap-2">
            <Pill
              active={value.status === "all"}
              onClick={() => set({ status: "all" })}
              className="bg-blush-100 border-blush-300 text-blush-600"
            >
              ✶ All
            </Pill>
            {STATUS_ORDER.map((s) => {
              const m = STATUSES[s];
              return (
                <Pill
                  key={s}
                  active={value.status === s}
                  onClick={() => set({ status: s })}
                  className={`${m.bg} ${m.border} ${m.text}`}
                >
                  <span aria-hidden>{m.emoji}</span>
                  {m.label}
                </Pill>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <p className="mb-1.5 font-script text-lg text-blush-400">
            by priority
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill
              active={value.priority === "all"}
              onClick={() => set({ priority: "all" })}
              className="bg-blush-100 border-blush-300 text-blush-600"
            >
              ✶ All
            </Pill>
            {PRIORITY_ORDER.map((p) => {
              const m = PRIORITIES[p];
              return (
                <Pill
                  key={p}
                  active={value.priority === p}
                  onClick={() => set({ priority: p })}
                  className={`${m.bg} ${m.border} ${m.text}`}
                >
                  <span aria-hidden>{m.emoji}</span>
                  {m.label}
                </Pill>
              );
            })}
          </div>
        </div>

        {/* Deadline */}
        <div>
          <p className="mb-1.5 font-script text-lg text-blush-400">
            by deadline
          </p>
          <div className="flex flex-wrap gap-2">
            {DEADLINE_OPTIONS.map((o) => (
              <Pill
                key={o.value}
                active={value.deadline === o.value}
                onClick={() => set({ deadline: o.value })}
                className="bg-lavender-100 border-lavender-200 text-lavender-500"
              >
                <span aria-hidden>{o.emoji}</span>
                {o.label}
              </Pill>
            ))}
          </div>
        </div>

        {/* Sort + reset */}
        <div className="flex flex-wrap items-center gap-3 border-t border-parchment-200 pt-4">
          <label className="font-script text-lg text-blush-400">sort by</label>
          <select
            className="input-magic max-w-[12rem]"
            value={value.sort}
            onChange={(e) => set({ sort: e.target.value as SortKey })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            className="btn-ghost ml-auto text-xs"
            onClick={() =>
              onChange({
                status: "all",
                priority: "all",
                deadline: "any",
                sort: "deadline",
              })
            }
          >
            ↺ Clear charms
          </button>
        </div>
      </div>
    </div>
  );
}
