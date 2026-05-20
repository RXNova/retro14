<p align="center">
  <img src="../public/logo.png" width="72" alt="Retro14" /><br>
  <b>Retro14</b> &nbsp;·&nbsp; Collaborative retrospective tool for agile teams<br>
  <a href="../README.md">Overview</a> &nbsp;·&nbsp;
  <a href="FRONTEND.md">Frontend</a> &nbsp;·&nbsp;
  <a href="BACKEND.md">Backend</a> &nbsp;·&nbsp;
  <a href="DEPLOYMENT.md">Deployment</a> &nbsp;·&nbsp;
  <a href="DOCKER.md">Docker</a> &nbsp;·&nbsp;
  <a href="K8S.md">K8s</a>
</p>

---

# Backend

There's no custom server. Backend is Supabase — Postgres with Row Level Security, built-in auth, and a Realtime engine over WebSockets. The frontend talks to it directly via the Supabase JS client.

## Auth

Email + password via Supabase Auth. JWT is stored in localStorage and sent automatically on every request. `auth.uid()` is available inside RLS policies, which is how per-user access control works without any server code.

After sign-in, `App.tsx` fetches the user's row from `retro_users`. If it doesn't exist (first login ever), it auto-creates one from the Supabase `user_metadata`. This sidesteps needing a trigger or edge function just to bootstrap a profile.

## Database

Schema is in `supabase/schema/` — 5 SQL files, run them in order on a fresh project.

### sprints

```sql
CREATE TABLE public.sprints (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code          TEXT UNIQUE NOT NULL,
    name          TEXT,
    configuration JSONB DEFAULT '{}',
    created_by    UUID REFERENCES auth.users(id),
    created_at    TIMESTAMPTZ DEFAULT now()
);
```

`code` is the human-readable join code (e.g. `ab3x-k7mp-r9qz`). Generated client-side in `dataService.ts` using a charset that strips visually ambiguous characters (no `0`, `O`, `1`, `l`).

`configuration` is a single JSONB blob holding the entire `SprintConfig`: column definitions, voting settings, timer state, permission flags. No separate config tables — it all lives here. Simple to work with, just remember every update is a full column replacement.

RLS on this table is wide open (any authed user can read/write). Access scoping for "is this user in this sprint" is handled by `sprint_participants` at the app layer.

### retro_users

```sql
CREATE TABLE public.retro_users (
    id             UUID PRIMARY KEY,  -- same as auth.users.id, not auto-generated
    name           TEXT NOT NULL,
    color          TEXT NOT NULL,
    role           TEXT,
    is_hand_raised BOOLEAN DEFAULT false,
    hand_raised_at TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT now()
);
```

`id` matches the Supabase auth user ID — it's set explicitly on insert, not generated. `is_hand_raised` and `hand_raised_at` get toggled live during retros; `hand_raised_at` is what determines sort order in the team panel.

RLS: everyone can SELECT (you need to see teammates), but INSERT/UPDATE is locked to your own row (`auth.uid() = id`).

### retro_items

```sql
CREATE TABLE public.retro_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content      TEXT NOT NULL,
    column_id    TEXT NOT NULL,
    sprint_id    UUID REFERENCES sprints(id) ON DELETE CASCADE,
    parent_id    UUID REFERENCES retro_items(id) ON DELETE CASCADE,
    user_id      UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    is_staged    BOOLEAN DEFAULT false,
    type         TEXT DEFAULT 'card',  -- 'card' | 'group'
    created_at   TIMESTAMPTZ DEFAULT now(),
    author_name  TEXT,
    author_role  TEXT,
    author_color TEXT,
    votes        JSONB DEFAULT '{}',        -- { userId: voteCount }
    reactions    JSONB DEFAULT '[]',        -- Reaction[]
    comments     JSONB DEFAULT '[]',        -- Comment[]
    "actionItems" JSONB DEFAULT '[]'        -- ActionItem[]
);
```

A few things worth understanding here:

**Draft system** (`is_staged`): cards start as `is_staged = true` — private to the author, invisible to everyone else. The author publishes manually (or via "publish all"), which flips it to `false`. RLS enforces this: SELECT allows `is_staged = false` OR `user_id = auth.uid()`.

**Grouping** (`parent_id` + `type`): a `type = 'group'` row is the container; individual cards with `parent_id` set are its children. When a group is reduced to one child, we delete the group row and orphan the last card back to top-level. No fancy tree structure — just a single-level parent/child relationship.

**JSONB fields**: `votes`, `reactions`, `comments`, `actionItems` are stored directly on the card row. Updates are read-modify-write in `dataService.ts`. Works fine for this scale; just be aware two concurrent comment additions could theoretically clobber each other.

DELETE RLS is permissive (any authed user) — the "can you delete other people's cards" check is a frontend concern, controlled by `PermissionSettings` in the sprint config.

### sprint_participants

```sql
CREATE TABLE public.sprint_participants (
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    user_id   UUID REFERENCES retro_users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (sprint_id, user_id)
);
```

Upserted whenever a user creates or joins a sprint. Used for the participant list and for scoping history ("show me sprints I was in").

The RLS here needed a security-definer function (`check_is_sprint_participant`) to avoid infinite recursion — if the SELECT policy queries `sprint_participants` to check membership, and that query itself triggers the SELECT policy, you get a loop. The function bypasses RLS when checking, breaking the cycle.

## Realtime

All live sync uses Supabase Realtime's `postgres_changes`. Every relevant table has `REPLICA IDENTITY FULL` (so UPDATE events include the old row values) and is added to the `supabase_realtime` publication. This is all set up by `05_realtime.sql`.

Two channels are active during a session:

**`sprint:<sprintId>`** (in `useRetroBoard`): listens for any change on `retro_items` for the current sprint, plus UPDATE events on the `sprints` row itself. The `sprints` listener is what picks up config changes — column renames, timer updates, voting start/stop — so they propagate to all participants immediately.

**`user:<userId>`** (in `App.tsx`): listens for changes to the current user's `retro_users` row. Keeps the local `dbUser` state in sync if you update your profile in another tab.

## dataService

`services/dataService.ts` is the only file (besides `App.tsx` for auth) that imports the Supabase client directly. Everything else goes through it. If you're adding a new feature that needs a DB call, it goes in here.

When the Supabase env vars aren't set, `supabaseClient.ts` exports `null` and `dataService` falls back to an in-memory array. The whole app works without a real backend this way — good for quick local work.
