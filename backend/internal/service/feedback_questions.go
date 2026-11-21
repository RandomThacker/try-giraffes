package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"trygiraffes/backend/internal/domain"
	"trygiraffes/backend/internal/store"
)

type FeedbackQuestionService struct {
	store *store.Store
	auth  *AuthService
}

func NewFeedbackQuestionService(st *store.Store, auth *AuthService) *FeedbackQuestionService {
	return &FeedbackQuestionService{store: st, auth: auth}
}

type FeedbackQuestionView struct {
	ID           string   `json:"id"`
	Prompt       string   `json:"prompt"`
	QuestionType string   `json:"question_type"`
	Options      []string `json:"options"`
	ScaleMin     *int     `json:"scale_min"`
	ScaleMax     *int     `json:"scale_max"`
	Position     int      `json:"position"`
}

type FeedbackQuestionInput struct {
	Prompt       string   `json:"prompt"`
	QuestionType string   `json:"question_type"`
	Options      []string `json:"options"`
	ScaleMin     *int     `json:"scale_min"`
	ScaleMax     *int     `json:"scale_max"`
}

type DynamicFeedbackAnswerInput struct {
	QuestionID    string   `json:"question_id"`
	AnswerText    *string  `json:"answer_text"`
	AnswerOptions []string `json:"answer_options"`
	AnswerScale   *int     `json:"answer_scale"`
}

func (s *FeedbackQuestionService) List(ctx context.Context, rawToken string) ([]FeedbackQuestionView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	items, err := s.store.ListFeedbackQuestions(ctx, user.AMCID)
	if err != nil {
		return nil, err
	}
	return toFeedbackQuestionViews(items), nil
}

func (s *FeedbackQuestionService) Replace(ctx context.Context, rawToken string, inputs []FeedbackQuestionInput) ([]FeedbackQuestionView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	if len(inputs) == 0 {
		return nil, fmt.Errorf("%w: at least one question is required", ErrValidation)
	}
	questions := make([]domain.FeedbackQuestion, 0, len(inputs))
	for _, input := range inputs {
		prompt := strings.TrimSpace(input.Prompt)
		if prompt == "" {
			return nil, fmt.Errorf("%w: question prompt is required", ErrValidation)
		}
		qType := domain.FeedbackQuestionType(strings.TrimSpace(strings.ToLower(input.QuestionType)))
		if !validFeedbackType(qType) {
			return nil, fmt.Errorf("%w: question_type must be paragraph, mcq, linear_scale, or checkbox", ErrValidation)
		}
		options := input.Options
		if options == nil {
			options = []string{}
		}
		if (qType == domain.FeedbackMCQ || qType == domain.FeedbackCheckbox) && len(options) == 0 {
			return nil, fmt.Errorf("%w: options are required for mcq and checkbox questions", ErrValidation)
		}
		var scaleMin, scaleMax *int
		if qType == domain.FeedbackLinearScale {
			min := 1
			max := 10
			if input.ScaleMin != nil {
				min = *input.ScaleMin
			}
			if input.ScaleMax != nil {
				max = *input.ScaleMax
			}
			if min >= max {
				return nil, fmt.Errorf("%w: scale_min must be less than scale_max", ErrValidation)
			}
			scaleMin = &min
			scaleMax = &max
		}
		questions = append(questions, domain.FeedbackQuestion{
			Prompt:       prompt,
			QuestionType: qType,
			Options:      options,
			ScaleMin:     scaleMin,
			ScaleMax:     scaleMax,
		})
	}

	items, err := s.store.ReplaceFeedbackQuestions(ctx, user.AMCID, user.ID, questions)
	if err != nil {
		return nil, err
	}
	return toFeedbackQuestionViews(items), nil
}

func (s *MeetingService) SubmitDynamicFeedback(ctx context.Context, rawToken, meetingID string, skipped bool, answers []DynamicFeedbackAnswerInput) error {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(meetingID)
	if err != nil {
		return fmt.Errorf("%w: invalid meeting id", ErrValidation)
	}
	existing, err := s.store.FindMeetingByID(ctx, id)
	if err == store.ErrNotFound {
		return store.ErrNotFound
	}
	if err != nil {
		return err
	}
	if existing.AMCID != user.AMCID {
		return store.ErrNotFound
	}
	if existing.Status == domain.MeetingStatusCancelled {
		return fmt.Errorf("%w: cannot submit feedback for a cancelled meeting", ErrValidation)
	}

	parsed := make([]store.FeedbackAnswerInput, 0, len(answers))
	for _, answer := range answers {
		qid, err := uuid.Parse(strings.TrimSpace(answer.QuestionID))
		if err != nil {
			return fmt.Errorf("%w: invalid question id", ErrValidation)
		}
		if _, err := s.store.FindFeedbackQuestion(ctx, user.AMCID, qid); err != nil {
			if err == store.ErrNotFound {
				return fmt.Errorf("%w: feedback question was not found", ErrValidation)
			}
			return err
		}
		options := answer.AnswerOptions
		if options == nil {
			options = []string{}
		}
		parsed = append(parsed, store.FeedbackAnswerInput{
			QuestionID:    qid,
			AnswerText:    trimPtr(answer.AnswerText),
			AnswerOptions: options,
			AnswerScale:   answer.AnswerScale,
		})
	}

	return s.store.SubmitDynamicMeetingFeedback(ctx, store.FeedbackSubmissionInput{
		MeetingID:   id,
		SubmittedBy: user.ID,
		Skipped:     skipped,
		Answers:     parsed,
	})
}

func validFeedbackType(value domain.FeedbackQuestionType) bool {
	switch value {
	case domain.FeedbackParagraph, domain.FeedbackMCQ, domain.FeedbackLinearScale, domain.FeedbackCheckbox:
		return true
	default:
		return false
	}
}

func toFeedbackQuestionViews(items []domain.FeedbackQuestion) []FeedbackQuestionView {
	out := make([]FeedbackQuestionView, 0, len(items))
	for _, item := range items {
		out = append(out, FeedbackQuestionView{
			ID:           item.ID.String(),
			Prompt:       item.Prompt,
			QuestionType: string(item.QuestionType),
			Options:      item.Options,
			ScaleMin:     item.ScaleMin,
			ScaleMax:     item.ScaleMax,
			Position:     item.Position,
		})
	}
	return out
}
