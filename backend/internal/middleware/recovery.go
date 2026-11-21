package middleware

import (
	"log/slog"
	"runtime/debug"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/httpx"
)

func Recovery(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Error("panic recovered",
					"error", rec,
					"request_id", c.GetString("request_id"),
					"stack", string(debug.Stack()),
				)
				if !c.Writer.Written() {
					httpx.InternalError(c)
				}
			}
		}()
		c.Next()
	}
}
