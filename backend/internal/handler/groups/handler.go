package groups

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/httpx"
	"trygiraffes/backend/internal/service"
	"trygiraffes/backend/internal/sessioncookie"
	"trygiraffes/backend/internal/store"
)

type Handler struct {
	groups *service.GroupService
	config config.Config
}

func New(groupService *service.GroupService, cfg config.Config) *Handler {
	return &Handler{groups: groupService, config: cfg}
}

func Register(rg *gin.RouterGroup, h *Handler) {
	rg.GET("/groups", h.list)
	rg.POST("/groups", h.create)
	rg.GET("/groups/:id", h.get)
	rg.DELETE("/groups/:id", h.delete)
}

type createRequest struct {
	Name      string   `json:"name"`
	MemberIDs []string `json:"member_ids"`
}

func (h *Handler) list(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	items, err := h.groups.List(c.Request.Context(), token)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"groups": items})
}

func (h *Handler) get(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	item, err := h.groups.Get(c.Request.Context(), token, c.Param("id"))
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"group": item})
}

func (h *Handler) create(c *gin.Context) {
	var req createRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	item, err := h.groups.Create(c.Request.Context(), token, req.Name, req.MemberIDs)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusCreated, gin.H{"group": item})
}

func (h *Handler) delete(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	if err := h.groups.Delete(c.Request.Context(), token, c.Param("id")); err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"ok": true})
}

func writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrValidation):
		httpx.ValidationError(c, strings.TrimSpace(strings.TrimPrefix(err.Error(), "validation: ")))
	case errors.Is(err, service.ErrUnauthorized):
		httpx.Unauthorized(c, "Authentication is required.")
	case errors.Is(err, store.ErrNotFound):
		httpx.NotFound(c)
	default:
		httpx.InternalError(c)
	}
}
