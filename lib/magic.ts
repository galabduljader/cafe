import type { Priority, Status } from "./types";

// ✨ The enchanted vocabulary — the real db values map to whimsical labels.

export interface StatusMeta {
  value: Status;
  label: string; // magical name
  plain: string; // human meaning
  emoji: string;
  // tailwind class fragments
  text: string;
  bg: string;
  border: string;
  dot: string;
}

export const STATUSES: Record<Status, StatusMeta> = {
  upcoming: {
    value: "upcoming",
    label: "Wishing",
    plain: "Upcoming",
    emoji: "🌙",
    text: "text-lavender-500",
    bg: "bg-lavender-100",
    border: "border-lavender-200",
    dot: "bg-lavender-400",
  },
  in_progress: {
    value: "in_progress",
    label: "Enchanting",
    plain: "In progress",
    emoji: "🪄",
    text: "text-blush-600",
    bg: "bg-blush-100",
    border: "border-blush-200",
    dot: "bg-blush-400",
  },
  done: {
    value: "done",
    label: "Granted",
    plain: "Done",
    emoji: "🌟",
    text: "text-gold-600",
    bg: "bg-gold-200/60",
    border: "border-gold-300",
    dot: "bg-gold-400",
  },
};

export interface PriorityMeta {
  value: Priority;
  label: string; // magical name
  plain: string;
  emoji: string;
  rank: number; // for sorting (higher = more urgent)
  text: string;
  bg: string;
  border: string;
}

export const PRIORITIES: Record<Priority, PriorityMeta> = {
  low: {
    value: "low",
    label: "Whisper",
    plain: "Low",
    emoji: "🕊️",
    rank: 1,
    text: "text-lavender-500",
    bg: "bg-lavender-100",
    border: "border-lavender-200",
  },
  medium: {
    value: "medium",
    label: "Petal",
    plain: "Medium",
    emoji: "🌸",
    rank: 2,
    text: "text-blush-500",
    bg: "bg-blush-50",
    border: "border-blush-200",
  },
  high: {
    value: "high",
    label: "Charm",
    plain: "High",
    emoji: "💎",
    rank: 3,
    text: "text-blush-700",
    bg: "bg-blush-100",
    border: "border-blush-300",
  },
  urgent: {
    value: "urgent",
    label: "Royal Decree",
    plain: "Urgent",
    emoji: "👑",
    rank: 4,
    text: "text-gold-600",
    bg: "bg-gradient-to-r from-gold-200 to-blush-100",
    border: "border-gold-400",
  },
};

export const STATUS_ORDER: Status[] = ["upcoming", "in_progress", "done"];
export const PRIORITY_ORDER: Priority[] = ["urgent", "high", "medium", "low"];
