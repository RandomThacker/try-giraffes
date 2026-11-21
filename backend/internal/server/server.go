package server

import (
	"database/sql"
	"log/slog"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"

	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/handler/attendance"
	"trygiraffes/backend/internal/handler/auth"
	"trygiraffes/backend/internal/handler/feedbackquestions"
	"trygiraffes/backend/internal/handler/groups"
	"trygiraffes/backend/internal/handler/health"
	"trygiraffes/backend/internal/handler/meetings"
	"trygiraffes/backend/internal/handler/tasks"
	"trygiraffes/backend/internal/handler/uploads"
	"trygiraffes/backend/internal/httpx"
	"trygiraffes/backend/internal/middleware"
	"trygiraffes/backend/internal/service"
	"trygiraffes/backend/internal/store"
)

type Dependencies struct {
	Config config.Config
	Log    *slog.Logger
	DB     *sql.DB
}

func New(deps Dependencies) *gin.Engine {
	cfg := deps.Config
	log := deps.Log

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	engine := gin.New()
	engine.HandleMethodNotAllowed = true
	_ = engine.SetTrustedProxies(nil)
	engine.Use(middleware.RequestID())
	engine.Use(middleware.AccessLog(log))
	engine.Use(middleware.Recovery(log))
	engine.Use(middleware.CORS(cfg.CORSAllowedOrigins))

	engine.NoRoute(httpx.NotFound)
	engine.NoMethod(httpx.MethodNotAllowed)

	uploadDir := filepath.Join("uploads")
	_ = os.MkdirAll(uploadDir, 0o755)
	engine.Static("/uploads", uploadDir)

	st := store.New(deps.DB)
	authService := service.NewAuthService(st, cfg)
	attendanceService := service.NewAttendanceService(st, authService)
	meetingService := service.NewMeetingService(st, authService)
	groupService := service.NewGroupService(st, authService)
	feedbackQuestionService := service.NewFeedbackQuestionService(st, authService)
	taskService := service.NewTaskService(st, authService)

	v1 := engine.Group("/api/v1")
	health.Register(v1)
	auth.Register(v1, auth.New(authService, cfg))
	attendance.Register(v1, attendance.New(attendanceService, cfg))
	meetings.Register(v1, meetings.New(meetingService, cfg))
	groups.Register(v1, groups.New(groupService, cfg))
	feedbackquestions.Register(v1, feedbackquestions.New(feedbackQuestionService, cfg))
	tasks.Register(v1, tasks.New(taskService, cfg))
	uploads.Register(v1, uploads.New(authService, cfg, uploadDir))

	return engine
}
