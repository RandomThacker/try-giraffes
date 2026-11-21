.PHONY: backend frontend test db

db:
	docker compose up -d db

backend:
	cd backend && DATABASE_URL=$${DATABASE_URL:-postgres://trygiraffes:trygiraffes@localhost:5433/trygiraffes?sslmode=disable} go run ./cmd/server

frontend:
	cd frontend && npm run dev

test:
	cd backend && go test ./...
