package httpx

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	CodeNotFound         = "NOT_FOUND"
	CodeMethodNotAllowed = "METHOD_NOT_ALLOWED"
	CodeInternal         = "INTERNAL_ERROR"
	CodeValidation       = "VALIDATION_ERROR"
	CodeUnauthorized     = "UNAUTHORIZED"
	CodeConflict         = "CONFLICT"
	CodeForbidden        = "FORBIDDEN"
)

type dataEnvelope struct {
	Data any `json:"data"`
}

type errorEnvelope struct {
	Error errorBody `json:"error"`
}

type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func JSON(c *gin.Context, status int, data any) {
	c.JSON(status, dataEnvelope{Data: data})
}

func Error(c *gin.Context, status int, code, message string) {
	c.AbortWithStatusJSON(status, errorEnvelope{
		Error: errorBody{Code: code, Message: message},
	})
}

func NotFound(c *gin.Context) {
	Error(c, http.StatusNotFound, CodeNotFound, "The requested resource was not found.")
}

func MethodNotAllowed(c *gin.Context) {
	Error(c, http.StatusMethodNotAllowed, CodeMethodNotAllowed, "The method is not allowed for this resource.")
}

func InternalError(c *gin.Context) {
	Error(c, http.StatusInternalServerError, CodeInternal, "Something went wrong.")
}

func ValidationError(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, CodeValidation, message)
}

func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Authentication is required."
	}
	Error(c, http.StatusUnauthorized, CodeUnauthorized, message)
}

func Conflict(c *gin.Context, message string) {
	Error(c, http.StatusConflict, CodeConflict, message)
}

func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, CodeForbidden, message)
}
