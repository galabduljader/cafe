"use client";

import type { Task, Status } from "@/lib/types";
import { PRIORITIES, STATUSES, STATUS_ORDER } from "@/lib/magic";
import { deadlinePhrase, deadlineTone } from "@/lib/dates";
import { isImage } from "@/lib/storage";

interface Props {
  task: Task;
  onAdvance: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const toneStyles: Record<string, string> = {
  overdue: "text-blush-700 bg-blush-100 border-blush-300",
  soon: "text-gold-600 bg-gold-200/60 border-gold-300",
  later: "text-lavender-500 bg-lavender-100 border-lavender-200",
  none: "text-blush-400 bg-white/70 border-parchment-200",
  done: "text-gold-600 bg-gold-200/50 border-gold-300",
};

export default function TaskCard({
  task,
  onAdvance,
  onEdit,
  onDelete,
}: Props) {
  const status = STATUSES[task.status];
  const priority = PRIORITIES[task.priority];
  const isDone = task.status === "done";
  const tone = deadlineTone(task.due_date, isDone);

  // next stage in the wish → spell → star journey
  const idx = STATUS_ORDER.indexOf(task.status);
  const nextStatus: Status | null =
    idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;
  const nextMeta = nextStatus ? STATUSES[nextStatus] : null;

  return (
    <article
      className={`paper group animate-floatUp p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-paper-lg ${
        isDone ? "opacity-75" : ""
      }`}
    >
      {/* wax-seal style priority corner */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className={`chip ${priority.bg} ${priority.border} ${priority.text}`}>
          <span aria-hidden>{priority.emoji}</span>
          {priority.label}
        </span>
        <span className={`chip ${status.bg} ${status.border} ${status.text}`}>
          <span aria-hidden>{status.emoji}</span>
          {status.label}
        </span>
      </div>

      <h3
        className={`font-display text-2xl font-semibold leading-tight text-blush-700 ${
          isDone ? "line-through decoration-gold-400/70" : ""
        }`}
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1.5 text-sm leading-relaxed text-blush-600/80">
          {task.description}
        </p>
      )}

      {/* ✦ Attachment ✦ */}
      {task.attachment_url &&
        (isImage(task.attachment_type) ? (
          <a
            href={task.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block overflow-hidden rounded-xl border border-parchment-200 shadow-paper"
            title={task.attachment_name ?? "Open attachment"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={task.attachment_url}
              alt={task.attachment_name ?? "attachment"}
              className="max-h-44 w-full object-cover transition duration-300 hover:scale-[1.03]"
            />
          </a>
        ) : (
          <a
            href={task.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 rounded-xl border border-parchment-200 bg-white/70 px-3 py-2 text-sm text-blush-600 transition hover:border-blush-300 hover:bg-blush-50"
            title={task.attachment_name ?? "Open attachment"}
          >
            <span aria-hidden>📎</span>
            <span className="truncate font-medium">
              {task.attachment_name ?? "Attachment"}
            </span>
            <span className="ml-auto text-xs text-blush-300">open ↗</span>
          </a>
        ))}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneStyles[tone]}`}
        >
          <span aria-hidden>{tone === "overdue" ? "⏳" : "📜"}</span>
          {deadlinePhrase(task.due_date)}
        </div>
        {task.estimated_duration && (
          <div
            className="inline-flex items-center gap-1.5 rounded-full border border-lavender-200 bg-lavender-100 px-3 py-1 text-xs font-semibold text-lavender-500"
            title="Estimated duration (suggested by the OpenRouter oracle)"
          >
            <span aria-hidden>⏳✨</span>
            {task.estimated_duration}
          </div>
        )}
      </div>

      {/* actions — appear on hover, but always reachable */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-parchment-200 pt-4">
        {nextMeta ? (
          <button
            className="btn-ghost text-xs"
            onClick={() => onAdvance(task)}
            title={`Move to ${nextMeta.plain}`}
          >
            <span aria-hidden>{nextMeta.emoji}</span>
            Cast to {nextMeta.label}
          </button>
        ) : (
          <span className="chip border-gold-300 bg-gold-200/50 text-gold-600">
            ✓ Wish granted
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            className="rounded-full p-2 text-blush-400 transition hover:bg-blush-50 hover:text-blush-600"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            title="Edit"
          >
            ✎
          </button>
          <button
            className="rounded-full p-2 text-blush-300 transition hover:bg-blush-50 hover:text-blush-600"
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            title="Banish"
          >
            ✕
          </button>
        </div>
      </div>
    </article>
  );
}
