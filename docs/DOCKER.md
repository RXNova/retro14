<p align="center">
  <img src="../public/logo.png" width="72" alt="Retro14" /><br>
  <b>Retro14</b> &nbsp;·&nbsp; Collaborative retrospective tool for agile teams<br>
  <a href="../README.md">Overview</a> &nbsp;·&nbsp;
  <a href="FRONTEND.md">Frontend</a> &nbsp;·&nbsp;
  <a href="BACKEND.md">Backend</a> &nbsp;·&nbsp;
  <a href="DEPLOYMENT.md">Deployment</a> &nbsp;·&nbsp;
  <a href="DOCKER.md">Docker</a> &nbsp;·&nbsp;
  <a href="K8S.md">K8s</a> &nbsp;·&nbsp;
  <a href="DOCKER.md">Docker</a>
</p>

---

# Docker

The full stack runs in Docker — frontend (Nginx), Postgres, GoTrue (auth), PostgREST, Realtime, and Kong (API gateway). No Supabase Cloud account needed.

## Services

| Container | Image | Role |
|---|---|---|
| `db` | `supabase/postgres` | Postgres with Supabase extensions + schema init |
| `auth` | `supabase/gotrue` | Auth API (sign up, sign in, JWT) |
| `rest` | `postgrest/postgrest` | Auto-generated REST API from Postgres schema |
| `realtime` | `supabase/realtime` | WebSocket engine for live board updates |
| `kong` | `kong` | API gateway — routes `/auth/v1`, `/rest/v1`, `/realtime/v1` |
| `app` | local build | Frontend — Nginx serving the built Vite app |

## Quick start

```bash
# 1. Copy the env file
cp .env.docker.example .env.docker

# 2. Edit .env.docker — at minimum set POSTGRES_PASSWORD
#    The default JWT keys work as-is for local dev

# 3. Start everything
docker compose --env-file .env.docker up --build

# App:      http://localhost:3000
# API:      http://localhost:8000
# Postgres: localhost:5432
```

Schema files in `supabase/schema/` are mounted as Postgres init scripts and applied automatically on first run.

## Dev mode (hot reload)

```bash
docker compose --env-file .env.docker \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up --build
```

This swaps the Nginx container for the Vite dev server. Source is mounted into the container so edits reflect instantly without rebuilding.

App runs at `http://localhost:5173`.

## Production JWT keys

The default keys in `.env.docker.example` and `kong/kong.yml` are the official Supabase local dev defaults — **do not use them in production**.

To generate fresh keys:

```bash
# Install jwt-cli or use any JWT library
# JWT_SECRET should be at least 32 characters

# Generate anon key
jwt encode --secret "your-jwt-secret" '{"role":"anon","iss":"supabase","iat":1700000000,"exp":2000000000}'

# Generate service_role key  
jwt encode --secret "your-jwt-secret" '{"role":"service_role","iss":"supabase","iat":1700000000,"exp":2000000000}'
```

Then:
1. Update `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY` in `.env.docker`
2. Update the `keyauth_credentials` keys in `kong/kong.yml` to match `ANON_KEY` and `SERVICE_ROLE_KEY`
3. Rebuild: `docker compose --env-file .env.docker up --build`

## Email in Docker

By default `MAILER_AUTOCONFIRM=true` — signups work without email confirmation, good for local dev.

To enable real email delivery, set the SMTP vars in `.env.docker` (Brevo or any SMTP provider) and set `MAILER_AUTOCONFIRM=false`.

## Resetting the database

```bash
# Stop everything and wipe the volume
docker compose --env-file .env.docker down -v

# Start fresh — schema is re-applied automatically
docker compose --env-file .env.docker up --build
```
