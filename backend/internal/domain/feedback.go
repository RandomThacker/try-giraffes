package domain

import (
	"time"

	"github.com/google/uuid"
)

type FeedbackQuestionType string

const (
	FeedbackParagraph   FeedbackQuestionType = "paragraph"
	FeedbackMCQ         FeedbackQuestionType = "mcq"
	FeedbackLinearScale FeedbackQuestionType = "linear_scale"
	FeedbackCheckbox    FeedbackQuestionType = "checkbox"
)

type FeedbackQuestion struct {
	ID           uuid.UUID
	AMCID        uuid.UUID
	CreatedBy    uuid.UUID
	Prompt       string
	QuestionType FeedbackQuestionType
	Options      []string
	ScaleMin     *int
	ScaleMax     *int
	Position     int
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type GroupSummary struct {
	ID           uuid.UUID
	Name         string
	MemberCount  int
	MemberLabels []string
}

type GroupMember struct {
	ID       uuid.UUID
	Email    string
	FullName string
}

type GroupDetail struct {
	ID      uuid.UUID
	Name    string
	Members []GroupMember
}
