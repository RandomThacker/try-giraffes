package domain

import (
	"time"

	"github.com/google/uuid"
)

type MeetingMode string

const (
	MeetingModeInstant   MeetingMode = "instant"
	MeetingModeScheduled MeetingMode = "scheduled"
)

type MeetingType string

const (
	MeetingTypeOneToOne  MeetingType = "one_to_one"
	MeetingTypeOneToMany MeetingType = "one_to_many"
)

type LocationKind string

const (
	LocationPhysical LocationKind = "physical"
	LocationVirtual  LocationKind = "virtual"
)

type MeetingStatus string

const (
	MeetingStatusScheduled MeetingStatus = "scheduled"
	MeetingStatusStarted   MeetingStatus = "started"
	MeetingStatusCompleted MeetingStatus = "completed"
	MeetingStatusCancelled MeetingStatus = "cancelled"
)

type MeetingPurpose string

const (
	PurposeCourtesyMeet  MeetingPurpose = "courtesy_meet"
	PurposeProduct       MeetingPurpose = "product"
	PurposeIssueRaised   MeetingPurpose = "issue_raised"
	PurposeIntroductory  MeetingPurpose = "introductory"
	PurposeFundManager   MeetingPurpose = "fund_manager"
	PurposeMarketOutlook MeetingPurpose = "market_outlook"
	PurposeAnyOther      MeetingPurpose = "any_other"
	PurposeNFO           MeetingPurpose = "nfo"
	PurposeBusinessHead  MeetingPurpose = "business_head"
)

type TargetRole string

const (
	TargetRoleParticipant TargetRole = "participant"
	TargetRoleBroadcast   TargetRole = "broadcast"
)

type TargetType string

const (
	TargetTypeUser  TargetType = "user"
	TargetTypeGroup TargetType = "group"
)

type Group struct {
	ID        uuid.UUID
	AMCID     uuid.UUID
	Name      string
	CreatedBy uuid.UUID
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Meeting struct {
	ID           uuid.UUID
	CreatedBy    uuid.UUID
	AMCID        uuid.UUID
	Title        string
	Description  string
	ARN          string
	Mode         MeetingMode
	MeetingType  MeetingType
	Purpose      MeetingPurpose
	Status       MeetingStatus
	Location     *string
	LocationKind *LocationKind
	StartsAt     time.Time
	EndsAt       *time.Time
	ThumbnailURL *string
	CancelledAt  *time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Targets      []MeetingTarget
}

type MeetingTarget struct {
	ID         uuid.UUID
	MeetingID  uuid.UUID
	Role       TargetRole
	TargetType TargetType
	UserID     *uuid.UUID
	GroupID    *uuid.UUID
	Label      string
	CreatedAt  time.Time
}

type MeetingFeedback struct {
	ID                 uuid.UUID
	MeetingID          uuid.UUID
	SubmittedBy        uuid.UUID
	AboutProduct       *string
	AboutBrand         *string
	AboutPricing       *string
	AnyConcern         *string
	LookingForSpecific *string
	TalkedAbout        *string
	Skipped            bool
	SubmittedAt        time.Time
}

type MeetingCancellation struct {
	ID          uuid.UUID
	MeetingID   uuid.UUID
	CancelledBy uuid.UUID
	Reason      string
	CreatedAt   time.Time
}

type MeetingReschedule struct {
	ID                   uuid.UUID
	MeetingID            uuid.UUID
	RescheduledBy        uuid.UUID
	Message              string
	PreviousStartsAt     time.Time
	NewStartsAt          time.Time
	PreviousLocation     *string
	NewLocation          *string
	PreviousLocationKind *LocationKind
	NewLocationKind      *LocationKind
	CreatedAt            time.Time
}

type DirectoryUser struct {
	ID       uuid.UUID
	Email    string
	FullName string
}

type DirectoryGroup struct {
	ID          uuid.UUID
	Name        string
	MemberCount int
}
