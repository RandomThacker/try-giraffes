package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"trygiraffes/backend/internal/domain"
)

func (s *Store) ListTasks(ctx context.Context, userID uuid.UUID) ([]domain.Task, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, user_id, amc_id, title, due_date, done, created_at, updated_at
		FROM tasks
		WHERE user_id = $1
		ORDER BY due_date ASC, created_at ASC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("list tasks: %w", err)
	}
	defer rows.Close()

	out := make([]domain.Task, 0)
	for rows.Next() {
		item, err := scanTask(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) CreateTask(ctx context.Context, userID, amcID uuid.UUID, title string, dueDate time.Time) (domain.Task, error) {
	row := s.db.QueryRowContext(ctx, `
		INSERT INTO tasks (user_id, amc_id, title, due_date)
		VALUES ($1, $2, $3, $4::date)
		RETURNING id, user_id, amc_id, title, due_date, done, created_at, updated_at
	`, userID, amcID, title, dueDate.Format("2006-01-02"))
	return scanTask(row)
}

func (s *Store) UpdateTask(ctx context.Context, userID, taskID uuid.UUID, title string, dueDate time.Time, done bool) (domain.Task, error) {
	row := s.db.QueryRowContext(ctx, `
		UPDATE tasks
		SET title = $3, due_date = $4::date, done = $5, updated_at = now()
		WHERE id = $1 AND user_id = $2
		RETURNING id, user_id, amc_id, title, due_date, done, created_at, updated_at
	`, taskID, userID, title, dueDate.Format("2006-01-02"), done)
	item, err := scanTask(row)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Task{}, ErrNotFound
	}
	return item, err
}

func (s *Store) DeleteTask(ctx context.Context, userID, taskID uuid.UUID) error {
	result, err := s.db.ExecContext(ctx, `
		DELETE FROM tasks WHERE id = $1 AND user_id = $2
	`, taskID, userID)
	if err != nil {
		return fmt.Errorf("delete task: %w", err)
	}
	n, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) ListReminders(ctx context.Context, userID uuid.UUID) ([]domain.Reminder, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, user_id, amc_id, title, note, remind_at, created_at, updated_at
		FROM reminders
		WHERE user_id = $1
		ORDER BY remind_at ASC, created_at ASC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("list reminders: %w", err)
	}
	defer rows.Close()

	out := make([]domain.Reminder, 0)
	for rows.Next() {
		item, err := scanReminder(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) CreateReminder(ctx context.Context, userID, amcID uuid.UUID, title, note string, remindAt time.Time) (domain.Reminder, error) {
	row := s.db.QueryRowContext(ctx, `
		INSERT INTO reminders (user_id, amc_id, title, note, remind_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, amc_id, title, note, remind_at, created_at, updated_at
	`, userID, amcID, title, note, remindAt)
	return scanReminder(row)
}

func (s *Store) UpdateReminder(ctx context.Context, userID, reminderID uuid.UUID, title, note string, remindAt time.Time) (domain.Reminder, error) {
	row := s.db.QueryRowContext(ctx, `
		UPDATE reminders
		SET title = $3, note = $4, remind_at = $5, updated_at = now()
		WHERE id = $1 AND user_id = $2
		RETURNING id, user_id, amc_id, title, note, remind_at, created_at, updated_at
	`, reminderID, userID, title, note, remindAt)
	item, err := scanReminder(row)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Reminder{}, ErrNotFound
	}
	return item, err
}

func (s *Store) DeleteReminder(ctx context.Context, userID, reminderID uuid.UUID) error {
	result, err := s.db.ExecContext(ctx, `
		DELETE FROM reminders WHERE id = $1 AND user_id = $2
	`, reminderID, userID)
	if err != nil {
		return fmt.Errorf("delete reminder: %w", err)
	}
	n, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func scanTask(row scannable) (domain.Task, error) {
	var item domain.Task
	err := row.Scan(&item.ID, &item.UserID, &item.AMCID, &item.Title, &item.DueDate, &item.Done, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return domain.Task{}, err
	}
	return item, nil
}

func scanReminder(row scannable) (domain.Reminder, error) {
	var item domain.Reminder
	err := row.Scan(&item.ID, &item.UserID, &item.AMCID, &item.Title, &item.Note, &item.RemindAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return domain.Reminder{}, err
	}
	return item, nil
}
