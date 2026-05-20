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

# Deployment

**Hosting:** Cloudflare Pages  
**CI:** GitHub Actions + Cloudflare Pages CI  
**Backend:** Supabase  
**Email:** Brevo (SMTP relay for Supabase auth emails)

## Cloudflare Pages

The repo is connected to Cloudflare Pages via the GitHub integration. Every push to `main` triggers a production deploy automatically — no `wrangler deploy` needed.

Settings in the Cloudflare dashboard:

- Build command: `yarn build`
- Output directory: `dist`
- Production branch: `main`
- Node version: `25` (matches `volta.node` in `package.json`)

The `wrangler.jsonc` at the root is minimal — it just tells Cloudflare to serve `dist/` and handle unknown paths as SPA (so `/:code` board routes don't 404):

```jsonc
{
  "name": "retro14",
  "compatibility_date": "2026-02-03",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

**Environment variables** — set these in the Cloudflare dashboard under Settings → Environment variables, for both Production and Preview:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Vite bakes these in at build time (anything prefixed `VITE_` gets inlined). The anon key is meant to be public — RLS handles access control on the Supabase side.

## GitHub Actions

No `.github/workflows` directory exists yet. Add this to get lint + type-check + build on every PR:

`.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: yarn install --immutable

      - name: Type check
        run: yarn tsc --noEmit

      - name: Lint
        run: yarn lint

      - name: Build
        run: yarn build
    env:
      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as secrets under Settings → Secrets and variables → Actions. Cloudflare Pages deploys on its own — this workflow is just a gate.

## Supabase

Create a new project and run the schema files in order via the SQL Editor:

```
supabase/schema/01_sprints.sql
supabase/schema/02_retro_users.sql
supabase/schema/03_retro_items.sql
supabase/schema/04_sprint_participants.sql
supabase/schema/05_realtime.sql
```

Grab the Project URL and anon key from Settings → API.

**Auth settings** (Authentication → Providers → Email):
- Enable email + password auth
- "Confirm email" is optional — disable it locally, enable it in production

**Email templates** live under Authentication → Email Templates. The templates are what users see; the actual sending goes through Brevo via SMTP (below).

## Brevo

Brevo is only used as an SMTP relay — there's no Brevo SDK in the app. Supabase handles the trigger (sign-up confirmation, password reset, etc.) and hands off to Brevo for delivery.

First, verify your sender domain in Brevo (add the SPF and DKIM records they give you to your DNS). Then generate an SMTP key under SMTP & API → SMTP keys.

Wire it up in Supabase under Authentication → SMTP Settings:

| Field | Value |
|---|---|
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | your Brevo account email |
| Password | the SMTP key you just generated |
| Sender name | Retro14 |
| Sender email | your verified sender address |

After saving, use the "Send test email" button in the Supabase dashboard to confirm it's working before you go live.

## Local dev

```bash
# create a .env file
echo "VITE_SUPABASE_URL=https://<project-ref>.supabase.co" >> .env
echo "VITE_SUPABASE_ANON_KEY=<anon-key>" >> .env

yarn install
yarn start
```

If you skip the env file entirely, the app runs in demo mode with a local in-memory backend — useful if you just want to poke at the UI.

## Infrastructure cost

The entire production stack runs on free tiers — $0/month to self-host.

| Service | Free tier |
|---|---|
| Cloudflare Pages | Unlimited bandwidth, 500 builds/month |
| Supabase | 500 MB database, 50k monthly active users, 2 GB egress |
| GitHub Actions | 2,000 CI minutes/month (private repo) / unlimited (public) |
| Brevo | 300 emails/day |

All limits are well beyond what a typical team retro needs. Upgrade only if you're running this at org scale.

## Checklist for a fresh production setup

- [ ] Supabase schema files applied in order (01 → 05)
- [ ] Brevo sender domain verified (SPF + DKIM in DNS)
- [ ] Supabase SMTP configured to use Brevo, test email confirmed
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Cloudflare Pages (Production + Preview environments)
- [ ] Same two secrets added to GitHub Actions
- [ ] Cloudflare Pages connected to the GitHub repo, build settings confirmed
- [ ] Run through a full sign-up → email confirmation → create board → join from another browser flow
