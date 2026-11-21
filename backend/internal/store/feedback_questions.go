package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"trygiraffes/backend/internal/domain"
)

type FeedbackAnswerInput struct {
	QuestionID    uuid.UUID
	AnswerText    *string
	AnswerOptions []string
	AnswerScale   *int
}

type FeedbackSubmissionInput struct {
	MeetingID   uuid.UUID
	SubmittedBy uuid.UUID
	Skipped     bool
	Answers     []FeedbackAnswerInput
}

func (s *Store) ListFeedbackQuestions(ctx context.Context, amcID uuid.UUID) ([]domain.FeedbackQuestion, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, amc_id, created_by, prompt, question_type, options, scale_min, scale_max, position, created_at, updated_at
		FROM feedback_questions
		WHERE amc_id = $1
		ORDER BY position ASC, created_at ASC
	`, amcID)
	if err != nil {
		return nil, fmt.Errorf("list feedback questions: %w", err)
	}
	defer rows.Close()

	out := make([]domain.FeedbackQuestion, 0)
	for rows.Next() {
		item, err := scanFeedbackQuestion(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) ReplaceFeedbackQuestions(ctx context.Context, amcID, createdBy uuid.UUID, questions []domain.FeedbackQuestion) ([]domain.FeedbackQuestion, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, `DELETE FROM feedback_questions WHERE amc_id = $1`, amcID); err != nil {
		return nil, fmt.Errorf("clear feedback questions: %w", err)
	}

	for i, question := range questions {
		options, err := json.Marshal(question.Options)
		if err != nil {
			return nil, err
		}
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO feedback_questions (
				amc_id, created_by, prompt, question_type, options, scale_min, scale_max, position
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		`, amcID, createdBy, question.Prompt, string(question.QuestionType), options, question.ScaleMin, question.ScaleMax, i+1); err != nil {
			return nil, fmt.Errorf("insert feedback question: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return s.ListFeedbackQuestions(ctx, amcID)
}

func (s *Store) SubmitDynamicMeetingFeedback(ctx context.Context, input FeedbackSubmissionInput) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	var submissionID uuid.UUID
	err = tx.QueryRowContext(ctx, `
		INSERT INTO meeting_feedback_submissions (meeting_id, submitted_by, skipped)
		VALUES ($1, $2, $3)
		ON CONFLICT (meeting_id) DO UPDATE
		SET submitted_by = EXCLUDED.submitted_by,
		    skipped = EXCLUDED.skipped,
		    submitted_at = now()
		RETURNING id
	`, input.MeetingID, input.SubmittedBy, input.Skipped).Scan(&submissionID)
	if err != nil {
		return fmt.Errorf("upsert feedback submission: %w", err)
	}

	if _, err := tx.ExecContext(ctx, `DELETE FROM meeting_feedback_answers WHERE submission_id = $1`, submissionID); err != nil {
		return fmt.Errorf("clear feedback answers: %w", err)
	}

	for _, answer := range input.Answers {
		options, err := json.Marshal(answer.AnswerOptions)
		if err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO meeting_feedback_answers (
				submission_id, question_id, answer_text, answer_options, answer_scale
			) VALUES ($1,$2,$3,$4,$5)
		`, submissionID, answer.QuestionID, answer.AnswerText, options, answer.AnswerScale); err != nil {
			return fmt.Errorf("insert feedback answer: %w", err)
		}
	}

	return tx.Commit()
}

func scanFeedbackQuestion(row scannable) (domain.FeedbackQuestion, error) {
	var item domain.FeedbackQuestion
	var options []byte
	err := row.Scan(
		&item.ID, &item.AMCID, &item.CreatedBy, &item.Prompt, &item.QuestionType,
		&options, &item.ScaleMin, &item.ScaleMax, &item.Position, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return domain.FeedbackQuestion{}, err
	}
	item.Options = []string{}
	if len(options) > 0 {
		if err := json.Unmarshal(options, &item.Options); err != nil {
			return domain.FeedbackQuestion{}, fmt.Errorf("decode question options: %w", err)
		}
	}
	return item, nil
}

func (s *Store) FindFeedbackQuestion(ctx context.Context, amcID, questionID uuid.UUID) (domain.FeedbackQuestion, error) {
	row := s.db.QueryRowContext(ctx, `
		SELECT id, amc_id, created_by, prompt, question_type, options, scale_min, scale_max, position, created_at, updated_at
		FROM feedback_questions
		WHERE id = $1 AND amc_id = $2
	`, questionID, amcID)
	item, err := scanFeedbackQuestion(row)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.FeedbackQuestion{}, ErrNotFound
	}
	if err != nil {
		return domain.FeedbackQuestion{}, err
	}
	return item, nil
}
