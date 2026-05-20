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

# Frontend

React 18 SPA, TypeScript, Vite. Routing via React Router v7. Icons from Lucide. PDF export via html2pdf.js. Linting with oxlint.

## Project layout

```
retro14/
├── index.tsx               # entry — wraps App in BrowserRouter
├── App.tsx                 # route tree + session management
├── types.ts                # shared types, start here if you're lost
├── pages/
│   ├── LandingPage.tsx     # public marketing/hero page
│   ├── RetroPage.tsx       # the actual board shell
│   └── Terms.tsx
├── components/
│   ├── Auth.tsx            # login + signup form
│   ├── SprintSelection.tsx # dashboard after login — create or join a sprint
│   ├── Board.tsx           # renders the column grid
│   ├── Sidebar.tsx         # action items, team panel, history
│   ├── board/              # card-level components
│   │   ├── BoardColumn.tsx
│   │   ├── RetroCard.tsx
│   │   ├── GroupCard.tsx   # collapsed/expanded group container
│   │   ├── MiniCard.tsx    # compact card inside a group
│   │   ├── VoteControl.tsx
│   │   ├── SkeletonCard.tsx
│   │   └── EmptyState.tsx
│   └── ...modals/dialogs (IssueDetailModal, BoardSettingsModal, etc.)
├── hooks/
│   └── useRetroBoard.ts    # all board state lives here
├── services/
│   └── dataService.ts      # every Supabase call goes through this
├── lib/
│   └── supabaseClient.ts   # creates the client (or null if env vars missing)
└── utils/
    ├── breakpoints.ts
    ├── exportUtils.ts      # PDF + clipboard
    ├── theme.ts
    └── mockData.ts         # seed data for demo/offline mode
```

## Routing

Four routes, all defined in `App.tsx`:

- `/` — shows `LandingPage` when signed out, `SprintSelection` when signed in
- `/auth/*` — `Auth` component (login/signup). Redirects away if already signed in, preserving the URL you were trying to reach.
- `/:code` — the board. Guarded by `RequireAuth` which stashes `location` in state so you land back on the right board after login.
- `/terms` — no auth needed

`BoardRoute` (inside `App.tsx`) handles the `:code` param — validates the format, calls `dataService.joinSprint()`, registers the user as a participant, then renders `RetroPage`.

## Session + auth flow

`App.tsx` owns session state. On mount it calls `supabase.auth.getSession()` and then listens via `onAuthStateChange`. When a session exists it fetches the user's `retro_users` profile from the DB; if the profile doesn't exist yet (first login) it creates one automatically using the name from Supabase `user_metadata`.

There's also a `postgres_changes` subscription on `retro_users` filtered to the current user's ID — so if you update your profile in another tab, the UI updates everywhere without a page reload.

## Board state — `useRetroBoard`

Everything inside a retro session is managed by `hooks/useRetroBoard.ts`. `RetroPage` consumes it and passes slices down to components. Nothing else reaches into global state.

The main things it tracks:

- `columns` / `items` — the board content, synced via Supabase Realtime
- `participants` — who's currently in the room
- `votingConfig` — undefined when voting is off, populated object when active
- `timer` — shared countdown, synced across all participants
- `permissions` — facilitator-controlled rules (can you move/edit/delete others' cards?)
- `viewConfig` and `hiddenColumnIds` — local only, not persisted

When a card mutation comes in through the realtime channel, `useRetroBoard` merges it into local state. All writes go through `dataService` first; the realtime event drives the state update, so all participants stay consistent.

## dataService

`services/dataService.ts` is the only place that imports `supabase`. Everything else goes through it. It covers sprints, users, cards, groups, votes, reactions, comments, and action items.

One thing worth knowing: `votes`, `reactions`, `comments`, and `actionItems` are JSONB columns on `retro_items`, not separate tables. So updates to those fields are read-modify-write — fetch the column, mutate the array in JS, write it back. It's simple but means two concurrent writers can clobber each other on reactions/comments under load (acceptable trade-off for this scale).

When `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are not set, `supabaseClient.ts` exports `null` and every `dataService` method falls back to an in-memory `mockData` array. The full UI works this way — handy for local dev without a Supabase project.
