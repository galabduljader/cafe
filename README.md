# ✦ Enchanted Tasks

A classy, girly-cute, paper-themed task **grimoire** where every wish becomes a
spell, and every spell becomes a star. Built with **Next.js** + **Supabase**.

## The magical vocabulary

**Status — the journey of a wish**

| Real value     | Magical name   | Meaning      |
| -------------- | -------------- | ------------ |
| `upcoming`     | 🌙 Wishing     | Upcoming     |
| `in_progress`  | 🪄 Enchanting  | In progress  |
| `done`         | 🌟 Granted     | Done         |

**Priority — how loudly it calls**

| Real value | Magical name     | Meaning |
| ---------- | ---------------- | ------- |
| `low`      | 🕊️ Whisper       | Low     |
| `medium`   | 🌸 Petal         | Medium  |
| `high`     | 💎 Charm         | High    |
| `urgent`   | 👑 Royal Decree  | Urgent  |

## Features

- ✨ Create, edit, and banish (delete) tasks — title, description, status,
  priority, and a deadline.
- 🪄 One-click "Cast to …" to advance a task through Wishing → Enchanting → Granted.
- ✧ Filter by **status**, **priority**, and **deadline** (past due, today, this
  week, has deadline, timeless), plus sort by soonest deadline, loudest priority,
  or newest.
- 📜 Live updates via Supabase Realtime — changes appear across tabs instantly.
- 🎀 Paper-grain textures, gilt shimmer titles, blush/lavender/gold palette, and
  elegant Cormorant Garamond + Dancing Script + Quicksand typography.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Environment

Copy `.env.local.example` → `.env.local` and fill in your Supabase project
values (already configured for this project):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Database

A single `public.tasks` table (no auth for now — one shared list). Schema,
indexes, an `updated_at` trigger, public RLS policies, and realtime were
provisioned via Supabase migrations:

- `create_tasks_table`
- `enable_realtime_tasks`

## Project structure

```
app/
  layout.tsx        fonts + metadata
  page.tsx          renders <TaskBoard/>
  globals.css       paper/magical theme
components/
  TaskBoard.tsx     state, Supabase data + realtime, filtering/sorting
  TaskCard.tsx      a single enchanted parchment card
  TaskForm.tsx      create/edit modal
  Filters.tsx       status / priority / deadline filter bar
lib/
  supabaseClient.ts browser Supabase client
  types.ts          Task types
  magic.ts          the status/priority → magical-label mappings
  dates.ts          deadline helpers
```

## Next steps (when you're ready)

- Add email/password login so each person gets a private list (tighten RLS to
  `auth.uid()`).
- Drag-and-drop columns, recurring spells, or a "today" focus view.
```
