# Architecture

Try Giraffes is a monorepo with a Next.js UI, a Go HTTP API, and PostgreSQL.

## Request path

```text
Browser
  -> Next.js page (React UI)
  -> /api/* on the Next.js server
  -> Go Gin API
  -> PostgreSQL
```

`frontend/src/app/api/[...path]/route.ts` forwards `/api/*` to `API_INTERNAL_URL` and passes `Set-Cookie` back to the browser. Auth uses an HttpOnly cookie, so browser calls stay same-origin through the proxy.

## Auth flow

```text
Landing
  -> Signup -> session cookie -> Set PIN -> Mark present -> Dashboard
  -> Login  -> session cookie -> Set PIN (if needed) or Mark present -> Dashboard
```

The API returns a `next` value of `set_pin`, `mark_present`, or `dashboard` so the UI can route without inventing extra product rules.

## Backend

```text
cmd/server/main.go
internal/config
internal/platform/db            connection + embedded migrations
internal/platform/logger
internal/domain
internal/store                  SQL access
internal/service                signup, login, PIN, attendance
internal/handler/auth
internal/handler/attendance
internal/handler/health
internal/sessioncookie
internal/authcrypto
internal/middleware
internal/httpx
```

## Frontend

```text
src/app                    routes
src/components/landing
src/components/auth
src/components/presence
src/components/dashboard
src/components/layout
src/components/ui
src/lib/api                HTTP client
```

Protected routes use `RequireSession` to ask `/api/v1/auth/me` and redirect to the correct next step.
