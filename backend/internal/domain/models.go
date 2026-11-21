package domain

import (
	"time"

	"github.com/google/uuid"
)

type AMC struct {
	ID        uuid.UUID
	Code      string
	CreatedAt time.Time
}

type User struct {
	ID           uuid.UUID
	Email        string
	FullName     string
	PasswordHash string
	PinHash      *string
	AMCID        uuid.UUID
	AMCCode      string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (u User) HasPIN() bool {
	return u.PinHash != nil && *u.PinHash != ""
}

type Session struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	TokenHash string
	ExpiresAt time.Time
	CreatedAt time.Time
	RevokedAt *time.Time
}

type AttendanceStatus string

const (
	AttendancePresent AttendanceStatus = "present"
	AttendanceAbsent  AttendanceStatus = "absent"
)

type Attendance struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Day       time.Time
	Status    AttendanceStatus
	CreatedAt time.Time
}

const (
	NextSetPIN      = "set_pin"
	NextMarkPresent = "mark_present"
	NextDashboard   = "dashboard"
)
