package server_test

import (
	"database/sql"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/server"
)

func TestHealth(t *testing.T) {
	response := perform(t, http.MethodGet, "/api/v1/health", nil)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}

	var body struct {
		Data struct {
			Status string `json:"status"`
		} `json:"data"`
	}
	decode(t, response.Body, &body)
	if body.Data.Status != "ok" {
		t.Fatalf("status payload = %q, want ok", body.Data.Status)
	}
	if response.Header().Get("X-Request-ID") == "" {
		t.Fatal("expected X-Request-ID response header")
	}
}

func TestNotFoundEnvelope(t *testing.T) {
	response := perform(t, http.MethodGet, "/api/v1/missing", nil)
	if response.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNotFound)
	}
	assertErrorCode(t, response.Body, "NOT_FOUND")
}

func TestMethodNotAllowed(t *testing.T) {
	response := perform(t, http.MethodPost, "/api/v1/health", nil)
	if response.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusMethodNotAllowed)
	}
	assertErrorCode(t, response.Body, "METHOD_NOT_ALLOWED")
}

func TestCORSPreflight(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/api/v1/health", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	req.Header.Set("Access-Control-Request-Method", "GET")
	response := httptest.NewRecorder()
	newEngine().ServeHTTP(response, req)

	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNoContent)
	}
	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Fatalf("allow-origin = %q", got)
	}
}

func newEngine() http.Handler {
	gin.SetMode(gin.TestMode)
	ginLog := slog.New(slog.NewTextHandler(io.Discard, nil))
	return server.New(server.Dependencies{
		Config: config.Config{
			Env:                "test",
			HTTPAddr:           ":0",
			LogLevel:           "error",
			LogFormat:          "text",
			CORSAllowedOrigins: []string{"http://localhost:3000"},
			SessionCookieName:  "tg_session",
			SessionTTL:         0,
		},
		Log: ginLog,
		DB:  &sql.DB{},
	})
}

func perform(t *testing.T, method, path string, body io.Reader) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(method, path, body)
	response := httptest.NewRecorder()
	newEngine().ServeHTTP(response, req)
	return response
}

func decode(t *testing.T, body io.Reader, dest any) {
	t.Helper()
	if err := json.NewDecoder(body).Decode(dest); err != nil {
		t.Fatalf("decode response: %v", err)
	}
}

func assertErrorCode(t *testing.T, body io.Reader, code string) {
	t.Helper()
	var payload struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	decode(t, body, &payload)
	if payload.Error.Code != code {
		t.Fatalf("error code = %q, want %q", payload.Error.Code, code)
	}
}
