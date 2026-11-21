package config

import (
	"bufio"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config is the process configuration loaded from the environment.
// Defaults keep a local server runnable without an env file.
type Config struct {
	Env                   string
	HTTPAddr              string
	LogLevel              string
	LogFormat             string
	CORSAllowedOrigins    []string
	DatabaseURL           string
	DatabaseURLUnpooled   string
	SessionCookieName     string
	SessionTTL            time.Duration
	CookieSecure          bool
}

func Load() Config {
	loadDotEnvFiles()

	envName := getenv("APP_ENV", "development")
	logFormat := os.Getenv("LOG_FORMAT")
	if logFormat == "" {
		if envName == "production" {
			logFormat = "json"
		} else {
			logFormat = "text"
		}
	}

	databaseURL := getenv("DATABASE_URL", "postgres://trygiraffes:trygiraffes@localhost:5433/trygiraffes?sslmode=disable")
	return Config{
		Env:                 envName,
		HTTPAddr:            getenv("HTTP_ADDR", ":8080"),
		LogLevel:            getenv("LOG_LEVEL", "info"),
		LogFormat:           logFormat,
		CORSAllowedOrigins:  splitCSV(getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),
		DatabaseURL:         databaseURL,
		DatabaseURLUnpooled: getenv("DATABASE_URL_UNPOOLED", databaseURL),
		SessionCookieName:   getenv("SESSION_COOKIE_NAME", "tg_session"),
		SessionTTL:          durationHours(getenv("SESSION_TTL_HOURS", "24"), 24*time.Hour),
		CookieSecure:        getenv("COOKIE_SECURE", "false") == "true" || envName == "production",
	}
}

// loadDotEnvFiles loads Neon/local env files without overriding real process env.
func loadDotEnvFiles() {
	for _, path := range []string{".env.local", ".env", "../.env.local", "../.env"} {
		_ = loadDotEnvFile(path)
	}
}

func loadDotEnvFile(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); exists {
			continue
		}
		value = strings.TrimSpace(value)
		if len(value) >= 2 {
			if (value[0] == '"' && value[len(value)-1] == '"') || (value[0] == '\'' && value[len(value)-1] == '\'') {
				value = value[1 : len(value)-1]
			}
		}
		_ = os.Setenv(key, value)
	}
	return scanner.Err()
}

func getenv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}

func durationHours(value string, fallback time.Duration) time.Duration {
	hours, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil || hours <= 0 {
		return fallback
	}
	return time.Duration(hours) * time.Hour
}
