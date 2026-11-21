package main

import (
	"os"

	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/platform/db"
	"trygiraffes/backend/internal/platform/logger"
	"trygiraffes/backend/internal/server"
)

func main() {
	cfg := config.Load()
	log := logger.New(cfg)

	// Migrations need a direct (unpooled) Neon connection; app traffic uses the pooled URL.
	migrateURL := cfg.DatabaseURLUnpooled
	if migrateURL == "" {
		migrateURL = cfg.DatabaseURL
	}
	migratePool, err := db.Open(migrateURL)
	if err != nil {
		log.Error("database unavailable", "error", err)
		os.Exit(1)
	}
	if err := db.Migrate(migratePool); err != nil {
		_ = migratePool.Close()
		log.Error("database migration failed", "error", err)
		os.Exit(1)
	}
	_ = migratePool.Close()

	pool, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Error("database unavailable", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	engine := server.New(server.Dependencies{
		Config: cfg,
		Log:    log,
		DB:     pool,
	})
	log.Info("server starting", "addr", cfg.HTTPAddr, "env", cfg.Env)

	if err := engine.Run(cfg.HTTPAddr); err != nil {
		log.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
