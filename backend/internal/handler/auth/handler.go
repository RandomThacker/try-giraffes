package auth

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/httpx"
	"trygiraffes/backend/internal/service"
	"trygiraffes/backend/internal/sessioncookie"
)

type Handler struct {
	auth   *service.AuthService
	config config.Config
}

func New(authService *service.AuthService, cfg config.Config) *Handler {
	return &Handler{auth: authService, config: cfg}
}

func Register(rg *gin.RouterGroup, h *Handler) {
	rg.GET("/amcs", h.listAMCs)
	rg.POST("/auth/signup", h.signup)
	rg.POST("/auth/login", h.login)
	rg.POST("/auth/logout", h.logout)
	rg.GET("/auth/me", h.me)
	rg.POST("/auth/pin", h.setPIN)
}

type credentialsRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	AMCCode  string `json:"amc_code"`
}

type pinRequest struct {
	PIN        string `json:"pin"`
	ConfirmPIN string `json:"confirm_pin"`
}

type authResponse struct {
	User service.UserView `json:"user"`
	Next string           `json:"next"`
}

type amcResponse struct {
	Code string `json:"code"`
}

func (h *Handler) listAMCs(c *gin.Context) {
	items, err := h.auth.ListAMCs(c.Request.Context())
	if err != nil {
		httpx.InternalError(c)
		return
	}
	out := make([]amcResponse, 0, len(items))
	for _, item := range items {
		out = append(out, amcResponse{Code: item.Code})
	}
	httpx.JSON(c, http.StatusOK, gin.H{"amcs": out})
}

func (h *Handler) signup(c *gin.Context) {
	var req credentialsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}

	result, err := h.auth.Signup(c.Request.Context(), req.Email, req.Password, req.AMCCode)
	if err != nil {
		writeAuthError(c, err)
		return
	}
	sessioncookie.Set(c, h.config, result.Token)
	httpx.JSON(c, http.StatusCreated, authResponse{
		User: service.ToUserView(result.User),
		Next: result.Next,
	})
}

func (h *Handler) login(c *gin.Context) {
	var req credentialsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}

	result, err := h.auth.Login(c.Request.Context(), req.Email, req.Password, req.AMCCode)
	if err != nil {
		writeAuthError(c, err)
		return
	}
	sessioncookie.Set(c, h.config, result.Token)
	httpx.JSON(c, http.StatusOK, authResponse{
		User: service.ToUserView(result.User),
		Next: result.Next,
	})
}

func (h *Handler) logout(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	_ = h.auth.Logout(c.Request.Context(), token)
	sessioncookie.Clear(c, h.config)
	httpx.JSON(c, http.StatusOK, gin.H{"ok": true})
}

func (h *Handler) me(c *gin.Context) {
	token := sessioncookie.Read(c, h.config)
	user, next, err := h.auth.CurrentUser(c.Request.Context(), token)
	if err != nil {
		writeAuthError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, authResponse{
		User: service.ToUserView(user),
		Next: next,
	})
}

func (h *Handler) setPIN(c *gin.Context) {
	var req pinRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.ValidationError(c, "Request body is invalid.")
		return
	}
	token := sessioncookie.Read(c, h.config)
	result, err := h.auth.SetPIN(c.Request.Context(), token, req.PIN, req.ConfirmPIN)
	if err != nil {
		writeAuthError(c, err)
		return
	}
	httpx.JSON(c, http.StatusOK, authResponse{
		User: service.ToUserView(result.User),
		Next: result.Next,
	})
}

func writeAuthError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrValidation):
		httpx.ValidationError(c, trimErrorPrefix(err.Error(), "validation: "))
	case errors.Is(err, service.ErrEmailTaken):
		httpx.Conflict(c, "An account with this email already exists.")
	case errors.Is(err, service.ErrAMCNotFound):
		httpx.ValidationError(c, "The selected AMC was not found.")
	case errors.Is(err, service.ErrInvalidCredentials):
		httpx.Unauthorized(c, "Email, password, or AMC is incorrect.")
	case errors.Is(err, service.ErrUnauthorized):
		httpx.Unauthorized(c, "Authentication is required.")
	default:
		httpx.InternalError(c)
	}
}

func trimErrorPrefix(message, prefix string) string {
	return strings.TrimSpace(strings.TrimPrefix(message, prefix))
}
