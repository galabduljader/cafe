// Helpers for the "deadline" / due-date magic.

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Days until the due date. Negative = overdue. null if no due date. */
export function daysUntil(due: string | null): number | null {
  if (!due) return null;
  const d = new Date(due + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
}

/** A whimsical, human phrase for a deadline. */
export function deadlinePhrase(due: string | null): string {
  const n = daysUntil(due);
  if (n === null) return "No deadline — timeless ✦";
  if (n < 0) return `${Math.abs(n)} day${Math.abs(n) === 1 ? "" : "s"} past due`;
  if (n === 0) return "Due today ✦";
  if (n === 1) return "Due tomorrow";
  if (n <= 7) return `Due in ${n} days`;
  return new Date(due + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function prettyDate(due: string | null): string {
  if (!due) return "—";
  return new Date(due + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type DeadlineTone = "none" | "overdue" | "soon" | "later" | "done";

export function deadlineTone(
  due: string | null,
  isDone: boolean
): DeadlineTone {
  if (isDone) return "done";
  const n = daysUntil(due);
  if (n === null) return "none";
  if (n < 0) return "overdue";
  if (n <= 3) return "soon";
  return "later";
}
