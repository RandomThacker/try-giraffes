package domain

import (
	"time"

	"github.com/google/uuid"
)

type Task struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	AMCID     uuid.UUID
	Title     string
	DueDate   time.Time
	Done      bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Reminder struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	AMCID     uuid.UUID
	Title     string
	Note      string
	RemindAt  time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}
