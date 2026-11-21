package uploads

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/httpx"
	"trygiraffes/backend/internal/service"
	"trygiraffes/backend/internal/sessioncookie"
)

type Handler struct {
	auth     *service.AuthService
	config   config.Config
	uploadDir string
}

func New(authService *service.AuthService, cfg config.Config, uploadDir string) *Handler {
	return &Handler{auth: authService, config: cfg, uploadDir: uploadDir}
}

func Register(rg *gin.RouterGroup, h *Handler) {
	rg.POST("/uploads", h.upload)
}

func (h *Handler) upload(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	if _, err := h.auth.Authenticate(c.Request.Context(), token); err != nil {
		httpx.Unauthorized(c, "Authentication is required.")
		return
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		httpx.ValidationError(c, "file is required.")
		return
	}
	if fileHeader.Size > 5*1024*1024 {
		httpx.ValidationError(c, "file must be 5MB or smaller.")
		return
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	switch ext {
	case ".png", ".jpg", ".jpeg", ".gif", ".svg":
	default:
		httpx.ValidationError(c, "file must be SVG, PNG, JPG, or GIF.")
		return
	}

	if err := os.MkdirAll(h.uploadDir, 0o755); err != nil {
		httpx.InternalError(c)
		return
	}

	name := fmt.Sprintf("%d-%s%s", time.Now().Unix(), uuid.NewString(), ext)
	dest := filepath.Join(h.uploadDir, name)
	if err := c.SaveUploadedFile(fileHeader, dest); err != nil {
		httpx.InternalError(c)
		return
	}

	httpx.JSON(c, http.StatusCreated, gin.H{
		"url": "/uploads/" + name,
	})
}
