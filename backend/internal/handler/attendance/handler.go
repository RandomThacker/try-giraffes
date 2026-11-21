package attendance

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/domain"
	"trygiraffes/backend/internal/httpx"
	"trygiraffes/backend/internal/service"
	"trygiraffes/backend/internal/sessioncookie"
)

type Handler struct {
	attendance *service.AttendanceService
	config     config.Config
}

func New(attendanceService *service.AttendanceService, cfg config.Config) *Handler {
	return &Handler{attendance: attendanceService, config: cfg}
}

func Register(rg *gin.RouterGroup, h *Handler) {
	rg.POST("/attendance", h.mark)
	rg.GET("/attendance/today", h.today)
}

type markRequest struct {
	Status string `json:"status"`
}

func (h *Handler) mark(c *gin.Context) {
	var req markRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}

	token := sessioncookie.Read(c, h.config)
	item, next, err := h.attendance.MarkToday(c.Request.Context(), token, domain.AttendanceStatus(req.Status))
	if err != nil {
		writeError(c, err)
		return
	}

	httpx.JSON(c, http.StatusOK, gin.H{
		"attendance": gin.H{
			"day":    item.Day.Format("2006-01-02"),
			"status": item.Status,
		},
		"next": next,
	})
}

func (h *Handler) today(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	item, err := h.attendance.Today(c.Request.Context(), token)
	if err != nil {
		writeError(c, err)
		return
	}
	if item == nil {
		httpx.JSON(c, http.StatusOK, gin.H{"attendance": nil})
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{
		"attendance": gin.H{
			"day":    item.Day.Format("2006-01-02"),
			"status": item.Status,
		},
	})
}

func writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrValidation):
		httpx.ValidationError(c, strings.TrimSpace(strings.TrimPrefix(err.Error(), "validation: ")))
	case errors.Is(err, service.ErrUnauthorized):
		httpx.Unauthorized(c, "Authentication is required.")
	default:
		httpx.InternalError(c)
	}
}
