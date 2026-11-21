package meetings

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/httpx"
	"trygiraffes/backend/internal/service"
	"trygiraffes/backend/internal/sessioncookie"
	"trygiraffes/backend/internal/store"
)

type Handler struct {
	meetings *service.MeetingService
	config   config.Config
}

func New(meetingService *service.MeetingService, cfg config.Config) *Handler {
	return &Handler{meetings: meetingService, config: cfg}
}

func Register(rg *gin.RouterGroup, h *Handler) {
	rg.GET("/meetings/directory", h.directory)
	rg.GET("/meetings", h.list)
	rg.POST("/meetings", h.create)
	rg.GET("/meetings/:id", h.get)
	rg.POST("/meetings/:id/feedback", h.feedback)
	rg.POST("/meetings/:id/cancel", h.cancel)
	rg.POST("/meetings/:id/reschedule", h.reschedule)
}

type createRequest struct {
	Mode         string                `json:"mode"`
	Title        string                `json:"title"`
	Description  string                `json:"description"`
	ARN          string                `json:"arn"`
	MeetingType  string                `json:"meeting_type"`
	Purpose      string                `json:"purpose"`
	Location     *string               `json:"location"`
	LocationKind *string               `json:"location_kind"`
	StartsAt     *string               `json:"starts_at"`
	EndsAt       *string               `json:"ends_at"`
	ThumbnailURL *string               `json:"thumbnail_url"`
	Participants []service.TargetInput `json:"participants"`
	Broadcasts   []service.TargetInput `json:"broadcasts"`
}

type feedbackRequest struct {
	Skipped bool                                  `json:"skipped"`
	Answers []service.DynamicFeedbackAnswerInput `json:"answers"`
}

type cancelRequest struct {
	Reason string `json:"reason"`
}

type rescheduleRequest struct {
	Message      string  `json:"message"`
	StartsAt     string  `json:"starts_at"`
	Location     *string `json:"location"`
	LocationKind *string `json:"location_kind"`
}

func (h *Handler) directory(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	out, err := h.meetings.Directory(c.Request.Context(), token)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, out)
}

func (h *Handler) list(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	items, err := h.meetings.List(
		c.Request.Context(),
		token,
		c.Query("tab"),
		c.Query("meeting_type"),
	)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"meetings": items})
}

func (h *Handler) get(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	item, err := h.meetings.Get(c.Request.Context(), token, c.Param("id"))
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"meeting": item})
}

func (h *Handler) create(c *gin.Context) {
	var req createRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}

	var startsAt *time.Time
	if req.StartsAt != nil && strings.TrimSpace(*req.StartsAt) != "" {
		parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(*req.StartsAt))
		if err != nil {
			httpx.ValidationError(c, "starts_at must be an ISO-8601 timestamp.")
			return
		}
		startsAt = &parsed
	}
	var endsAt *time.Time
	if req.EndsAt != nil && strings.TrimSpace(*req.EndsAt) != "" {
		parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(*req.EndsAt))
		if err != nil {
			httpx.ValidationError(c, "ends_at must be an ISO-8601 timestamp.")
			return
		}
		endsAt = &parsed
	}

	token := sessioncookie.Read(c, h.config)
	item, err := h.meetings.Create(c.Request.Context(), token, service.CreateMeetingRequest{
		Mode:         req.Mode,
		Title:        req.Title,
		Description:  req.Description,
		ARN:          req.ARN,
		MeetingType:  req.MeetingType,
		Purpose:      req.Purpose,
		Location:     req.Location,
		LocationKind: req.LocationKind,
		StartsAt:     startsAt,
		EndsAt:       endsAt,
		ThumbnailURL: req.ThumbnailURL,
		Participants: req.Participants,
		Broadcasts:   req.Broadcasts,
	})
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusCreated, gin.H{"meeting": item})
}

func (h *Handler) feedback(c *gin.Context) {
	var req feedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	err := h.meetings.SubmitDynamicFeedback(c.Request.Context(), token, c.Param("id"), req.Skipped, req.Answers)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"ok": true})
}

func (h *Handler) cancel(c *gin.Context) {
	var req cancelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	item, err := h.meetings.Cancel(c.Request.Context(), token, c.Param("id"), req.Reason)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"meeting": item})
}

func (h *Handler) reschedule(c *gin.Context) {
	var req rescheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	startsAt, err := time.Parse(time.RFC3339, strings.TrimSpace(req.StartsAt))
	if err != nil {
		httpx.ValidationError(c, "starts_at must be an ISO-8601 timestamp.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	item, err := h.meetings.Reschedule(c.Request.Context(), token, c.Param("id"), service.RescheduleRequest{
		Message:      req.Message,
		StartsAt:     startsAt,
		Location:     req.Location,
		LocationKind: req.LocationKind,
	})
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"meeting": item})
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
