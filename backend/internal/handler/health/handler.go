package health

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/httpx"
)

type status struct {
	Status string `json:"status"`
}

func Register(rg *gin.RouterGroup) {
	rg.GET("/health", get)
}

func get(c *gin.Context) {
	httpx.JSON(c, http.StatusOK, status{Status: "ok"})
}
