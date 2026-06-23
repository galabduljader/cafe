"use client";

import { useEffect, useRef, useState } from "react";
import type { Task, TaskInput, Status, Priority } from "@/lib/types";
import {
  PRIORITIES,
  PRIORITY_ORDER,
  STATUSES,
  STATUS_ORDER,
} from "@/lib/magic";
import {
  uploadAttachment,
  removeAttachment,
  isImage,
  type UploadedAttachment,
} from "@/lib/storage";
import { estimateDuration } from "@/lib/ai";

interface Props {
  open: boolean;
  initial?: Task | null;
  onClose: () => void;
  onSave: (input: TaskInput, id?: string) => Promise<void>;
}

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

function prettyBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function TaskForm({ open, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("upcoming");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [oracleNote, setOracleNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // attachment state
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [existing, setExisting] = useState<UploadedAttachment | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // hydrate form when opening
  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setStatus(initial?.status ?? "upcoming");
    setPriority(initial?.priority ?? "medium");
    setDueDate(initial?.due_date ?? "");
    setEstimatedDuration(initial?.estimated_duration ?? "");
    setOracleNote(null);
    setEstimating(false);
    setError(null);
    setFile(null);
    setLocalPreview(null);
    setClearExisting(false);
    setExisting(
      initial?.attachment_url
        ? {
            url: initial.attachment_url,
            path: initial.attachment_path ?? "",
            name: initial.attachment_name ?? "attachment",
            type: initial.attachment_type ?? "application/octet-stream",
          }
        : null
    );
  }, [open, initial]);

  // build/revoke a local object-URL preview for newly picked images
  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setLocalPreview(null);
  }, [file]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function pickFile(f: File | null) {
    setError(null);
    if (f && f.size > MAX_BYTES) {
      setError("That charm is too heavy — please keep files under 25 MB ✦");
      return;
    }
    setFile(f);
    if (f) setClearExisting(false);
  }

  function dropExisting() {
    setExisting(null);
    setClearExisting(true);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function askOracle() {
    if (!title.trim()) {
      setError("Name your wish first, then consult the oracle ✦");
      return;
    }
    setEstimating(true);
    setOracleNote(null);
    setError(null);
    try {
      const res = await estimateDuration({
        title: title.trim(),
        description: description.trim() || null,
        priority,
      });
      setEstimatedDuration(res.estimate);
      if (res.rationale) setOracleNote(res.rationale);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The oracle is silent.");
    } finally {
      setEstimating(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Every spell needs a name ✦");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // resolve the attachment fields
      let attachment = {
        attachment_url: existing?.url ?? null,
        attachment_path: existing?.path ?? null,
        attachment_name: existing?.name ?? null,
        attachment_type: existing?.type ?? null,
      };

      if (file) {
        const uploaded = await uploadAttachment(file);
        attachment = {
          attachment_url: uploaded.url,
          attachment_path: uploaded.path,
          attachment_name: uploaded.name,
          attachment_type: uploaded.type,
        };
        // remove the old file we're replacing
        if (initial?.attachment_path && initial.attachment_path !== uploaded.path) {
          removeAttachment(initial.attachment_path);
        }
      } else if (clearExisting && initial?.attachment_path) {
        removeAttachment(initial.attachment_path);
        attachment = {
          attachment_url: null,
          attachment_path: null,
          attachment_name: null,
          attachment_type: null,
        };
      }

      await onSave(
        {
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          due_date: dueDate || null,
          estimated_duration: estimatedDuration.trim() || null,
          ...attachment,
        },
        initial?.id
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something broke the spell.");
    } finally {
      setSaving(false);
    }
  };

  const showImagePreview =
    localPreview || (existing && isImage(existing.type) ? existing.url : null);
  const attachmentName = file?.name ?? existing?.name ?? null;
  const attachmentSize = file ? prettyBytes(file.size) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* dreamy backdrop */}
      <div
        className="absolute inset-0 bg-lavender-300/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="paper animate-floatUp relative z-10 w-full max-w-lg overflow-hidden p-7 max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-5 text-center">
          <p className="font-script text-2xl text-blush-400">
            {initial ? "Re-enchant" : "Pen a new"}
          </p>
          <h2 className="font-display text-4xl font-semibold gilt-text">
            {initial ? "this wish" : "wish"}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-magic" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="input-magic"
              placeholder="e.g. Brew a moonlit potion ✨"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={200}
            />
          </div>

          <div>
            <label className="label-magic" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="input-magic min-h-[88px] resize-y"
              placeholder="Whisper the details of your enchantment…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-magic">Status</label>
              <div className="flex flex-col gap-2">
                {STATUS_ORDER.map((s) => {
                  const m = STATUSES[s];
                  const active = status === s;
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`chip justify-start py-2 transition ${
                        active
                          ? `${m.bg} ${m.border} ${m.text} ring-2 ring-blush-200`
                          : "border-parchment-200 bg-white/60 text-blush-400"
                      }`}
                    >
                      <span aria-hidden>{m.emoji}</span>
                      {m.label}
                      <span className="ml-auto text-[10px] opacity-60">
                        {m.plain}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label-magic">Priority</label>
              <div className="flex flex-col gap-2">
                {PRIORITY_ORDER.map((p) => {
                  const m = PRIORITIES[p];
                  const active = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`chip justify-start py-2 transition ${
                        active
                          ? `${m.bg} ${m.border} ${m.text} ring-2 ring-blush-200`
                          : "border-parchment-200 bg-white/60 text-blush-400"
                      }`}
                    >
                      <span aria-hidden>{m.emoji}</span>
                      {m.label}
                      <span className="ml-auto text-[10px] opacity-60">
                        {m.plain}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="label-magic" htmlFor="due">
              Deadline
            </label>
            <input
              id="due"
              type="date"
              className="input-magic"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* ✦ Estimated duration (OpenRouter oracle) ✦ */}
          <div>
            <label className="label-magic" htmlFor="duration">
              Estimated duration
            </label>
            <div className="flex gap-2">
              <input
                id="duration"
                className="input-magic"
                placeholder="e.g. about 2 hours"
                value={estimatedDuration}
                onChange={(e) => {
                  setEstimatedDuration(e.target.value);
                  setOracleNote(null);
                }}
              />
              <button
                type="button"
                onClick={askOracle}
                disabled={estimating}
                className="btn-ghost shrink-0 whitespace-nowrap"
                title="Let OpenRouter estimate how long this will take"
              >
                {estimating ? "Gazing…" : "✨ Ask the oracle"}
              </button>
            </div>
            {oracleNote && (
              <p className="mt-1.5 flex items-start gap-1 text-xs italic text-lavender-500">
                <span aria-hidden>🔮</span>
                {oracleNote}
              </p>
            )}
          </div>

          {/* ✦ Attachment ✦ */}
          <div>
            <label className="label-magic">Enchanted attachment</label>

            {attachmentName ? (
              <div className="flex items-center gap-3 rounded-xl border border-parchment-200 bg-white/70 p-3">
                {showImagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={showImagePreview}
                    alt={attachmentName}
                    className="h-14 w-14 rounded-lg object-cover shadow-paper"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-lavender-100 text-2xl">
                    📎
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-blush-700">
                    {attachmentName}
                  </p>
                  <p className="text-xs text-blush-400">
                    {file ? `New • ${attachmentSize}` : "Currently attached"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dropExisting}
                  className="rounded-full p-2 text-blush-400 transition hover:bg-blush-50 hover:text-blush-600"
                  aria-label="Remove attachment"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-blush-200 bg-white/50 px-4 py-6 text-center transition hover:border-blush-400 hover:bg-blush-50/50"
              >
                <span className="text-2xl">🖼️</span>
                <span className="text-sm font-semibold text-blush-600">
                  Add an image or file
                </span>
                <span className="text-xs text-blush-400">
                  Tap to choose • up to 25 MB
                </span>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-blush-100 px-4 py-2 text-sm text-blush-700">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Dismiss
          </button>
          <button type="submit" className="btn-magic" disabled={saving}>
            {saving
              ? file
                ? "Conjuring…"
                : "Casting…"
              : initial
              ? "Save spell ✦"
              : "Cast it ✦"}
          </button>
        </div>
      </form>
    </div>
  );
}
