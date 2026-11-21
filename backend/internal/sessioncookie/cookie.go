package sessioncookie

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/config"
)

func Set(c *gin.Context, cfg config.Config, token string) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     cfg.SessionCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   int(cfg.SessionTTL.Seconds()),
		HttpOnly: true,
		Secure:   cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().UTC().Add(cfg.SessionTTL),
	})
}

func Clear(c *gin.Context, cfg config.Config) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     cfg.SessionCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Unix(0, 0).UTC(),
	})
}

func Read(c *gin.Context, cfg config.Config) string {
	cookie, err := c.Request.Cookie(cfg.SessionCookieName)
	if err != nil {
		return ""
	}
	return cookie.Value
}
