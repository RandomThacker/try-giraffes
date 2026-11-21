package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"trygiraffes/backend/internal/store"
)

type TaskService struct {
	store *store.Store
	auth  *AuthService
}

func NewTaskService(st *store.Store, auth *AuthService) *TaskService {
	return &TaskService{store: st, auth: auth}
}

type TaskView struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	DueDate string `json:"due_date"`
	Done    bool   `json:"done"`
}

type ReminderView struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Note     string `json:"note"`
	RemindAt string `json:"remind_at"`
}

func (s *TaskService) ListTasks(ctx context.Context, rawToken string) ([]TaskView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	items, err := s.store.ListTasks(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	out := make([]TaskView, 0, len(items))
	for _, item := range items {
		out = append(out, TaskView{
			ID:      item.ID.String(),
			Title:   item.Title,
			DueDate: item.DueDate.Format("2006-01-02"),
			Done:    item.Done,
		})
	}
	return out, nil
}

func (s *TaskService) CreateTask(ctx context.Context, rawToken, title, dueDate string) (TaskView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return TaskView{}, err
	}
	title = strings.TrimSpace(title)
	if title == "" {
		return TaskView{}, fmt.Errorf("%w: title is required", ErrValidation)
	}
	parsedDue, err := time.Parse("2006-01-02", strings.TrimSpace(dueDate))
	if err != nil {
		return TaskView{}, fmt.Errorf("%w: due_date must be YYYY-MM-DD", ErrValidation)
	}
	item, err := s.store.CreateTask(ctx, user.ID, user.AMCID, title, parsedDue)
	if err != nil {
		return TaskView{}, err
	}
	return TaskView{
		ID:      item.ID.String(),
		Title:   item.Title,
		DueDate: item.DueDate.Format("2006-01-02"),
		Done:    item.Done,
	}, nil
}

func (s *TaskService) UpdateTask(ctx context.Context, rawToken, taskID, title, dueDate string, done bool) (TaskView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return TaskView{}, err
	}
	id, err := uuid.Parse(taskID)
	if err != nil {
		return TaskView{}, fmt.Errorf("%w: invalid task id", ErrValidation)
	}
	title = strings.TrimSpace(title)
	if title == "" {
		return TaskView{}, fmt.Errorf("%w: title is required", ErrValidation)
	}
	parsedDue, err := time.Parse("2006-01-02", strings.TrimSpace(dueDate))
	if err != nil {
		return TaskView{}, fmt.Errorf("%w: due_date must be YYYY-MM-DD", ErrValidation)
	}
	item, err := s.store.UpdateTask(ctx, user.ID, id, title, parsedDue, done)
	if err == store.ErrNotFound {
		return TaskView{}, store.ErrNotFound
	}
	if err != nil {
		return TaskView{}, err
	}
	return TaskView{
		ID:      item.ID.String(),
		Title:   item.Title,
		DueDate: item.DueDate.Format("2006-01-02"),
		Done:    item.Done,
	}, nil
}

func (s *TaskService) DeleteTask(ctx context.Context, rawToken, taskID string) error {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(taskID)
	if err != nil {
		return fmt.Errorf("%w: invalid task id", ErrValidation)
	}
	err = s.store.DeleteTask(ctx, user.ID, id)
	if err == store.ErrNotFound {
		return store.ErrNotFound
	}
	return err
}

func (s *TaskService) ListReminders(ctx context.Context, rawToken string) ([]ReminderView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	items, err := s.store.ListReminders(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	out := make([]ReminderView, 0, len(items))
	for _, item := range items {
		out = append(out, ReminderView{
			ID:       item.ID.String(),
			Title:    item.Title,
			Note:     item.Note,
			RemindAt: item.RemindAt.UTC().Format(time.RFC3339),
		})
	}
	return out, nil
}

func (s *TaskService) CreateReminder(ctx context.Context, rawToken, title, note, remindAt string) (ReminderView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return ReminderView{}, err
	}
	title = strings.TrimSpace(title)
	if title == "" {
		return ReminderView{}, fmt.Errorf("%w: title is required", ErrValidation)
	}
	parsedAt, err := time.Parse(time.RFC3339, strings.TrimSpace(remindAt))
	if err != nil {
		return ReminderView{}, fmt.Errorf("%w: remind_at must be an ISO-8601 timestamp", ErrValidation)
	}
	item, err := s.store.CreateReminder(ctx, user.ID, user.AMCID, title, strings.TrimSpace(note), parsedAt.UTC())
	if err != nil {
		return ReminderView{}, err
	}
	return ReminderView{
		ID:       item.ID.String(),
		Title:    item.Title,
		Note:     item.Note,
		RemindAt: item.RemindAt.UTC().Format(time.RFC3339),
	}, nil
}

func (s *TaskService) UpdateReminder(ctx context.Context, rawToken, reminderID, title, note, remindAt string) (ReminderView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return ReminderView{}, err
	}
	id, err := uuid.Parse(reminderID)
	if err != nil {
		return ReminderView{}, fmt.Errorf("%w: invalid reminder id", ErrValidation)
	}
	title = strings.TrimSpace(title)
	if title == "" {
		return ReminderView{}, fmt.Errorf("%w: title is required", ErrValidation)
	}
	parsedAt, err := time.Parse(time.RFC3339, strings.TrimSpace(remindAt))
	if err != nil {
		return ReminderView{}, fmt.Errorf("%w: remind_at must be an ISO-8601 timestamp", ErrValidation)
	}
	item, err := s.store.UpdateReminder(ctx, user.ID, id, title, strings.TrimSpace(note), parsedAt.UTC())
	if err == store.ErrNotFound {
		return ReminderView{}, store.ErrNotFound
	}
	if err != nil {
		return ReminderView{}, err
	}
	return ReminderView{
		ID:       item.ID.String(),
		Title:    item.Title,
		Note:     item.Note,
		RemindAt: item.RemindAt.UTC().Format(time.RFC3339),
	}, nil
}

func (s *TaskService) DeleteReminder(ctx context.Context, rawToken, reminderID string) error {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(reminderID)
	if err != nil {
		return fmt.Errorf("%w: invalid reminder id", ErrValidation)
	}
	err = s.store.DeleteReminder(ctx, user.ID, id)
	if err == store.ErrNotFound {
		return store.ErrNotFound
	}
	return err
}
