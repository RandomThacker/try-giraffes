# Try Giraffes

Frontend and backend for Try Giraffes, with landing, signup, login, PIN setup, daily attendance, and a placeholder dashboard.

## Screens

| Route | Screen |
| --- | --- |
| `/` | Landing page with Sign up and Log in |
| `/signup` | Create an account |
| `/login` | Sign in |
| `/set-pin` | Set a 4-digit PIN after signup |
| `/mark-present` | Mark present or absent for today |
| `/dashboard` | Placeholder signed-in home |

## Flow

1. Sign up creates the account and starts a 24-hour session, then opens PIN setup.
2. After the PIN is saved, the daily attendance page opens.
3. Log in starts a 24-hour session. Users without a PIN go to PIN setup first. Otherwise they go to attendance, or the dashboard if today is already marked.
4. Yes / No on attendance saves the day and opens the dashboard.

Sessions are stored as hashed tokens in PostgreSQL and issued as an HttpOnly cookie named `tg_session`.

## Stack

- Frontend: Next.js, TypeScript, App Router, Tailwind CSS
- Backend: Go, Gin
- Database: PostgreSQL 16
- Local orchestration: Docker Compose

## Layout

```text
frontend/     Next.js application
backend/      Go HTTP API and SQL migrations
docs/         Architecture notes
```

## Local development

Requirements: Node.js 22+, Go 1.27+, Docker, and npm.

Start Postgres:

```bash
docker compose up -d db
```

Start the API:

```bash
cd backend
export DATABASE_URL=postgres://trygiraffes:trygiraffes@localhost:5433/trygiraffes?sslmode=disable
go run ./cmd/server
```

The API listens on `http://localhost:8080` and applies migrations on startup.

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

Or use the root Makefile: `make backend`, `make frontend`, and `make test`.

## Docker

From the repository root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Postgres: `localhost:5433`

## Configuration

Copy `.env.example` if you want a local env file.

| Variable | Default | Used by |
| --- | --- | --- |
| `APP_ENV` | `development` | Backend |
| `HTTP_ADDR` | `:8080` | Backend listen address |
| `LOG_LEVEL` | `info` | Backend log level |
| `LOG_FORMAT` | `text` / `json` | Backend log format |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Browser origins |
| `DATABASE_URL` | local Postgres on port `5433` | Backend |
| `SESSION_COOKIE_NAME` | `tg_session` | Auth cookie |
| `SESSION_TTL_HOURS` | `24` | Session lifetime |
| `COOKIE_SECURE` | `false` locally | Secure cookie flag |
| `API_INTERNAL_URL` | `http://localhost:8080` | Frontend proxy target |

## Database

Tables:

- `amcs` — seeded with `100003738`
- `users` — email, password hash, optional PIN hash, AMC
- `sessions` — hashed auth token, 24-hour expiry
- `attendance` — one status per user per day (`present` or `absent`)

Migrations live in `backend/internal/platform/db/migrations` and run automatically when the API starts.

## API

Successful responses use a `data` envelope. Failures use an `error` envelope.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Process health check |
| `GET` | `/api/v1/amcs` | AMC dropdown values |
| `POST` | `/api/v1/auth/signup` | Create account and session |
| `POST` | `/api/v1/auth/login` | Sign in and create session |
| `POST` | `/api/v1/auth/logout` | Revoke session |
| `GET` | `/api/v1/auth/me` | Current user and next step |
| `POST` | `/api/v1/auth/pin` | Save PIN |
| `POST` | `/api/v1/attendance` | Mark today present or absent |
| `GET` | `/api/v1/attendance/today` | Today's attendance, if any |

The frontend proxies `/api/*` to the Go server and forwards the session cookie.

## Not implemented yet

- Remember Me and Forgot Password behavior
- Rich dashboard content beyond the placeholder
