package feedbackquestions

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
	questions *service.FeedbackQuestionService
	config    config.Config
}

func New(questionService *service.FeedbackQuestionService, cfg config.Config) *Handler {
	return &Handler{questions: questionService, config: cfg}
}

func Register(rg *gin.RouterGroup, h *Handler) {
	rg.GET("/feedback-questions", h.list)
	rg.PUT("/feedback-questions", h.replace)
}

type replaceRequest struct {
	Questions []service.FeedbackQuestionInput `json:"questions"`
}

func (h *Handler) list(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	items, err := h.questions.List(c.Request.Context(), token)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"questions": items})
}

func (h *Handler) replace(c *gin.Context) {
	var req replaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	items, err := h.questions.Replace(c.Request.Context(), token, req.Questions)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"questions": items})
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
