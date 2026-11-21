package tasks

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
	tasks  *service.TaskService
	config config.Config
}

func New(taskService *service.TaskService, cfg config.Config) *Handler {
	return &Handler{tasks: taskService, config: cfg}
}

func Register(rg *gin.RouterGroup, h *Handler) {
	rg.GET("/tasks", h.listTasks)
	rg.POST("/tasks", h.createTask)
	rg.PUT("/tasks/:id", h.updateTask)
	rg.DELETE("/tasks/:id", h.deleteTask)

	rg.GET("/reminders", h.listReminders)
	rg.POST("/reminders", h.createReminder)
	rg.PUT("/reminders/:id", h.updateReminder)
	rg.DELETE("/reminders/:id", h.deleteReminder)
}

type taskRequest struct {
	Title   string `json:"title"`
	DueDate string `json:"due_date"`
	Done    bool   `json:"done"`
}

type reminderRequest struct {
	Title    string `json:"title"`
	Note     string `json:"note"`
	RemindAt string `json:"remind_at"`
}

func (h *Handler) listTasks(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	items, err := h.tasks.ListTasks(c.Request.Context(), token)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"tasks": items})
}

func (h *Handler) createTask(c *gin.Context) {
	var req taskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	item, err := h.tasks.CreateTask(c.Request.Context(), token, req.Title, req.DueDate)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusCreated, gin.H{"task": item})
}

func (h *Handler) updateTask(c *gin.Context) {
	var req taskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	item, err := h.tasks.UpdateTask(c.Request.Context(), token, c.Param("id"), req.Title, req.DueDate, req.Done)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"task": item})
}

func (h *Handler) deleteTask(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	if err := h.tasks.DeleteTask(c.Request.Context(), token, c.Param("id")); err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"ok": true})
}

func (h *Handler) listReminders(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	items, err := h.tasks.ListReminders(c.Request.Context(), token)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"reminders": items})
}

func (h *Handler) createReminder(c *gin.Context) {
	var req reminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	item, err := h.tasks.CreateReminder(c.Request.Context(), token, req.Title, req.Note, req.RemindAt)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusCreated, gin.H{"reminder": item})
}

func (h *Handler) updateReminder(c *gin.Context) {
	var req reminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	item, err := h.tasks.UpdateReminder(c.Request.Context(), token, c.Param("id"), req.Title, req.Note, req.RemindAt)
	if err != nil {
		writeError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, gin.H{"reminder": item})
}

func (h *Handler) deleteReminder(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	if err := h.tasks.DeleteReminder(c.Request.Context(), token, c.Param("id")); err != nil {
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
