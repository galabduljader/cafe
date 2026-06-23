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

- 🔐 **Email + password accounts** (Supabase Auth) — register or sign in, and
  every grimoire is private to its owner.
- ✨ Create, edit, and banish (delete) tasks — title, description, status,
  priority, and a deadline.
- 🔮 **"Ask the oracle"** estimates how long a task will take, via an OpenRouter
  Supabase Edge Function (`estimate-duration`); the estimate is saved per task.
- 📎 **Attach an image or file** to any task (up to 25 MB), stored in a public
  Supabase Storage bucket (`todo-attach`).
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

A single `public.tasks` table, secured **per user**: each row carries a
`user_id` (defaulting to `auth.uid()`), and RLS policies restrict read/insert/
update/delete to the owner. Schema, indexes, an `updated_at` trigger, realtime,
and the estimate/attachment columns were provisioned via Supabase migrations:

- `create_tasks_table`
- `enable_realtime_tasks`
- `add_estimated_duration_to_tasks`
- `user_auth_per_user_rls` — adds `user_id` + per-user RLS

## Edge Function & Storage

- **`estimate-duration`** edge function calls OpenRouter to suggest a duration.
  Set the secret in Supabase → Edge Functions → Secrets:
  `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`, default
  `openai/gpt-4o-mini`). Deployed with `verify_jwt = false`.
- **`todo-attach`** public Storage bucket holds task attachments.

## Project structure

```
app/
  layout.tsx        fonts + metadata
  page.tsx          renders <AuthGate/>
  globals.css       paper/magical theme
components/
  AuthGate.tsx      session gate — login screen vs. board
  AuthForm.tsx      email + password login / register
  TaskBoard.tsx     state, Supabase data + realtime, filtering/sorting
  TaskCard.tsx      a single enchanted parchment card
  TaskForm.tsx      create/edit modal, oracle estimate + attachment
  Filters.tsx       status / priority / deadline filter bar
lib/
  supabaseClient.ts browser Supabase client
  ai.ts             calls the estimate-duration edge function
  storage.ts        uploads to the todo-attach bucket
  types.ts          Task types
  magic.ts          the status/priority → magical-label mappings
  dates.ts          deadline helpers
supabase/
  functions/estimate-duration/index.ts   OpenRouter edge function
  migrations/0003_user_auth.sql           per-user auth + RLS
```

## Next steps (when you're ready)

- Drag-and-drop columns, recurring spells, or a "today" focus view.
- Tighten the `todo-attach` bucket to per-user folders if attachments
  should be private rather than public.
```
