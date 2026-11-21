package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"trygiraffes/backend/internal/domain"
	"trygiraffes/backend/internal/store"
)

type MeetingService struct {
	store *store.Store
	auth  *AuthService
}

func NewMeetingService(st *store.Store, auth *AuthService) *MeetingService {
	return &MeetingService{store: st, auth: auth}
}

type MeetingTargetView struct {
	Type  string `json:"type"`
	ID    string `json:"id"`
	Label string `json:"label"`
}

type MeetingView struct {
	ID           string              `json:"id"`
	Title        string              `json:"title"`
	Description  string              `json:"description"`
	ARN          string              `json:"arn"`
	Mode         string              `json:"mode"`
	MeetingType  string              `json:"meeting_type"`
	Purpose      string              `json:"purpose"`
	Status       string              `json:"status"`
	Location     *string             `json:"location"`
	LocationKind *string             `json:"location_kind"`
	StartsAt     string              `json:"starts_at"`
	EndsAt       *string             `json:"ends_at"`
	ThumbnailURL *string             `json:"thumbnail_url"`
	CancelledAt  *string             `json:"cancelled_at"`
	Participants []MeetingTargetView `json:"participants"`
	Broadcasts   []MeetingTargetView `json:"broadcasts"`
}

type DirectoryView struct {
	Users  []DirectoryUserView  `json:"users"`
	Groups []DirectoryGroupView `json:"groups"`
}

type DirectoryUserView struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

type DirectoryGroupView struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	MemberCount int    `json:"member_count"`
}

type CreateMeetingRequest struct {
	Mode         string
	Title        string
	Description  string
	ARN          string
	MeetingType  string
	Purpose      string
	Location     *string
	LocationKind *string
	StartsAt     *time.Time
	EndsAt       *time.Time
	ThumbnailURL *string
	Participants []TargetInput
	Broadcasts   []TargetInput
}

type TargetInput struct {
	Type string `json:"type"`
	ID   string `json:"id"`
}

type FeedbackRequest struct {
	AboutProduct       *string
	AboutBrand         *string
	AboutPricing       *string
	AnyConcern         *string
	LookingForSpecific *string
	TalkedAbout        *string
	Skipped            bool
}

type RescheduleRequest struct {
	Message      string
	StartsAt     time.Time
	Location     *string
	LocationKind *string
}

func (s *MeetingService) Directory(ctx context.Context, rawToken string) (DirectoryView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return DirectoryView{}, err
	}

	users, err := s.store.ListDirectoryUsers(ctx, user.AMCID)
	if err != nil {
		return DirectoryView{}, err
	}
	groups, err := s.store.ListDirectoryGroups(ctx, user.AMCID)
	if err != nil {
		return DirectoryView{}, err
	}

	out := DirectoryView{
		Users:  make([]DirectoryUserView, 0, len(users)),
		Groups: make([]DirectoryGroupView, 0, len(groups)),
	}
	for _, item := range users {
		name := item.FullName
		if name == "" {
			name = item.Email
		}
		out.Users = append(out.Users, DirectoryUserView{
			ID:       item.ID.String(),
			Email:    item.Email,
			FullName: name,
		})
	}
	for _, item := range groups {
		out.Groups = append(out.Groups, DirectoryGroupView{
			ID:          item.ID.String(),
			Name:        item.Name,
			MemberCount: item.MemberCount,
		})
	}
	return out, nil
}

func (s *MeetingService) List(ctx context.Context, rawToken, tab, meetingType string) ([]MeetingView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	tab = strings.TrimSpace(strings.ToLower(tab))
	if tab == "" {
		tab = "today"
	}
	if tab != "today" && tab != "upcoming" && tab != "all" {
		return nil, fmt.Errorf("%w: tab must be today, upcoming, or all", ErrValidation)
	}
	meetingType = strings.TrimSpace(strings.ToLower(meetingType))
	if meetingType != "" && meetingType != string(domain.MeetingTypeOneToOne) && meetingType != string(domain.MeetingTypeOneToMany) {
		return nil, fmt.Errorf("%w: meeting_type must be one_to_one or one_to_many", ErrValidation)
	}

	items, err := s.store.ListMeetings(ctx, store.MeetingListFilter{
		AMCID:       user.AMCID,
		Tab:         tab,
		MeetingType: meetingType,
		Now:         s.auth.now(),
	})
	if err != nil {
		return nil, err
	}
	out := make([]MeetingView, 0, len(items))
	for _, item := range items {
		out = append(out, toMeetingView(item))
	}
	return out, nil
}

func (s *MeetingService) Get(ctx context.Context, rawToken, meetingID string) (MeetingView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return MeetingView{}, err
	}
	id, err := uuid.Parse(meetingID)
	if err != nil {
		return MeetingView{}, fmt.Errorf("%w: invalid meeting id", ErrValidation)
	}
	item, err := s.store.FindMeetingByID(ctx, id)
	if err == store.ErrNotFound {
		return MeetingView{}, store.ErrNotFound
	}
	if err != nil {
		return MeetingView{}, err
	}
	if item.AMCID != user.AMCID {
		return MeetingView{}, store.ErrNotFound
	}
	return toMeetingView(item), nil
}

func (s *MeetingService) Create(ctx context.Context, rawToken string, req CreateMeetingRequest) (MeetingView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return MeetingView{}, err
	}

	mode := domain.MeetingMode(strings.TrimSpace(strings.ToLower(req.Mode)))
	meetingType := domain.MeetingType(strings.TrimSpace(strings.ToLower(req.MeetingType)))
	purpose := domain.MeetingPurpose(strings.TrimSpace(strings.ToLower(req.Purpose)))
	title := strings.TrimSpace(req.Title)
	if title == "" {
		return MeetingView{}, fmt.Errorf("%w: title is required", ErrValidation)
	}
	if mode != domain.MeetingModeInstant && mode != domain.MeetingModeScheduled {
		return MeetingView{}, fmt.Errorf("%w: mode must be instant or scheduled", ErrValidation)
	}
	if meetingType != domain.MeetingTypeOneToOne && meetingType != domain.MeetingTypeOneToMany {
		return MeetingView{}, fmt.Errorf("%w: meeting_type must be one_to_one or one_to_many", ErrValidation)
	}
	if !validPurpose(purpose) {
		return MeetingView{}, fmt.Errorf("%w: purpose is invalid", ErrValidation)
	}
	if len(req.Participants) == 0 {
		return MeetingView{}, fmt.Errorf("%w: at least one participant is required", ErrValidation)
	}

	now := s.auth.now().UTC()
	status := domain.MeetingStatusScheduled
	startsAt := now
	if mode == domain.MeetingModeInstant {
		status = domain.MeetingStatusStarted
		startsAt = now
	} else {
		if req.StartsAt == nil {
			return MeetingView{}, fmt.Errorf("%w: starts_at is required for scheduled meetings", ErrValidation)
		}
		startsAt = req.StartsAt.UTC()
	}

	var locationKind *domain.LocationKind
	if req.LocationKind != nil && strings.TrimSpace(*req.LocationKind) != "" {
		kind := domain.LocationKind(strings.ToLower(strings.TrimSpace(*req.LocationKind)))
		if kind != domain.LocationPhysical && kind != domain.LocationVirtual {
			return MeetingView{}, fmt.Errorf("%w: location_kind must be physical or virtual", ErrValidation)
		}
		locationKind = &kind
	}
	if mode == domain.MeetingModeScheduled && locationKind == nil {
		return MeetingView{}, fmt.Errorf("%w: location_kind is required for scheduled meetings", ErrValidation)
	}

	participants, err := s.parseTargets(ctx, user.AMCID, req.Participants)
	if err != nil {
		return MeetingView{}, err
	}
	broadcasts, err := s.parseTargets(ctx, user.AMCID, req.Broadcasts)
	if err != nil {
		return MeetingView{}, err
	}
	if meetingType == domain.MeetingTypeOneToOne && len(participants) != 1 {
		return MeetingView{}, fmt.Errorf("%w: one_to_one meetings require exactly one participant", ErrValidation)
	}
	if meetingType != domain.MeetingTypeOneToMany && len(broadcasts) > 0 {
		return MeetingView{}, fmt.Errorf("%w: broadcasts are only allowed for one_to_many meetings", ErrValidation)
	}

	item, err := s.store.CreateMeeting(ctx, store.CreateMeetingInput{
		CreatedBy:    user.ID,
		AMCID:        user.AMCID,
		Title:        title,
		Description:  strings.TrimSpace(req.Description),
		ARN:          strings.TrimSpace(req.ARN),
		Mode:         mode,
		MeetingType:  meetingType,
		Purpose:      purpose,
		Status:       status,
		Location:     trimPtr(req.Location),
		LocationKind: locationKind,
		StartsAt:     startsAt,
		EndsAt:       req.EndsAt,
		ThumbnailURL: trimPtr(req.ThumbnailURL),
		Participants: participants,
		Broadcasts:   broadcasts,
	})
	if err != nil {
		return MeetingView{}, err
	}
	return toMeetingView(item), nil
}

func (s *MeetingService) Cancel(ctx context.Context, rawToken, meetingID, reason string) (MeetingView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return MeetingView{}, err
	}
	reason = strings.TrimSpace(reason)
	if reason == "" {
		return MeetingView{}, fmt.Errorf("%w: reason is required", ErrValidation)
	}
	id, err := uuid.Parse(meetingID)
	if err != nil {
		return MeetingView{}, fmt.Errorf("%w: invalid meeting id", ErrValidation)
	}
	existing, err := s.store.FindMeetingByID(ctx, id)
	if err == store.ErrNotFound {
		return MeetingView{}, store.ErrNotFound
	}
	if err != nil {
		return MeetingView{}, err
	}
	if existing.AMCID != user.AMCID {
		return MeetingView{}, store.ErrNotFound
	}
	if existing.Status == domain.MeetingStatusCancelled {
		return MeetingView{}, fmt.Errorf("%w: meeting is already cancelled", ErrValidation)
	}

	item, err := s.store.CancelMeeting(ctx, id, user.ID, reason, s.auth.now().UTC())
	if err != nil {
		return MeetingView{}, err
	}
	return toMeetingView(item), nil
}

func (s *MeetingService) Reschedule(ctx context.Context, rawToken, meetingID string, req RescheduleRequest) (MeetingView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return MeetingView{}, err
	}
	id, err := uuid.Parse(meetingID)
	if err != nil {
		return MeetingView{}, fmt.Errorf("%w: invalid meeting id", ErrValidation)
	}
	if req.StartsAt.IsZero() {
		return MeetingView{}, fmt.Errorf("%w: starts_at is required", ErrValidation)
	}
	existing, err := s.store.FindMeetingByID(ctx, id)
	if err == store.ErrNotFound {
		return MeetingView{}, store.ErrNotFound
	}
	if err != nil {
		return MeetingView{}, err
	}
	if existing.AMCID != user.AMCID {
		return MeetingView{}, store.ErrNotFound
	}

	var locationKind *domain.LocationKind
	if req.LocationKind != nil && strings.TrimSpace(*req.LocationKind) != "" {
		kind := domain.LocationKind(strings.ToLower(strings.TrimSpace(*req.LocationKind)))
		if kind != domain.LocationPhysical && kind != domain.LocationVirtual {
			return MeetingView{}, fmt.Errorf("%w: location_kind must be physical or virtual", ErrValidation)
		}
		locationKind = &kind
	} else {
		locationKind = existing.LocationKind
	}
	location := trimPtr(req.Location)
	if location == nil {
		location = existing.Location
	}

	item, err := s.store.RescheduleMeeting(ctx, store.RescheduleInput{
		MeetingID:    id,
		ByUserID:     user.ID,
		Message:      strings.TrimSpace(req.Message),
		StartsAt:     req.StartsAt.UTC(),
		Location:     location,
		LocationKind: locationKind,
	})
	if err == store.ErrConflict {
		return MeetingView{}, fmt.Errorf("%w: cancelled meetings cannot be rescheduled", ErrValidation)
	}
	if err != nil {
		return MeetingView{}, err
	}
	return toMeetingView(item), nil
}

func (s *MeetingService) Feedback(ctx context.Context, rawToken, meetingID string, req FeedbackRequest) error {
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

	return s.store.SubmitMeetingFeedback(ctx, store.FeedbackInput{
		MeetingID:          id,
		SubmittedBy:        user.ID,
		AboutProduct:       trimPtr(req.AboutProduct),
		AboutBrand:         trimPtr(req.AboutBrand),
		AboutPricing:       trimPtr(req.AboutPricing),
		AnyConcern:         trimPtr(req.AnyConcern),
		LookingForSpecific: trimPtr(req.LookingForSpecific),
		TalkedAbout:        trimPtr(req.TalkedAbout),
		Skipped:            req.Skipped,
	})
}

func (s *MeetingService) parseTargets(ctx context.Context, amcID uuid.UUID, items []TargetInput) ([]store.TargetRef, error) {
	out := make([]store.TargetRef, 0, len(items))
	seen := map[string]struct{}{}
	for _, item := range items {
		typ := domain.TargetType(strings.ToLower(strings.TrimSpace(item.Type)))
		id, err := uuid.Parse(strings.TrimSpace(item.ID))
		if err != nil {
			return nil, fmt.Errorf("%w: invalid target id", ErrValidation)
		}
		key := string(typ) + ":" + id.String()
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}

		switch typ {
		case domain.TargetTypeUser:
			ok, err := s.store.UserBelongsToAMC(ctx, id, amcID)
			if err != nil {
				return nil, err
			}
			if !ok {
				return nil, fmt.Errorf("%w: participant user was not found", ErrValidation)
			}
		case domain.TargetTypeGroup:
			ok, err := s.store.GroupBelongsToAMC(ctx, id, amcID)
			if err != nil {
				return nil, err
			}
			if !ok {
				return nil, fmt.Errorf("%w: participant group was not found", ErrValidation)
			}
		default:
			return nil, fmt.Errorf("%w: target type must be user or group", ErrValidation)
		}
		out = append(out, store.TargetRef{Type: typ, ID: id})
	}
	return out, nil
}

func validPurpose(purpose domain.MeetingPurpose) bool {
	switch purpose {
	case domain.PurposeCourtesyMeet,
		domain.PurposeProduct,
		domain.PurposeIssueRaised,
		domain.PurposeIntroductory,
		domain.PurposeFundManager,
		domain.PurposeMarketOutlook,
		domain.PurposeAnyOther,
		domain.PurposeNFO,
		domain.PurposeBusinessHead:
		return true
	default:
		return false
	}
}

func toMeetingView(item domain.Meeting) MeetingView {
	view := MeetingView{
		ID:           item.ID.String(),
		Title:        item.Title,
		Description:  item.Description,
		ARN:          item.ARN,
		Mode:         string(item.Mode),
		MeetingType:  string(item.MeetingType),
		Purpose:      string(item.Purpose),
		Status:       string(item.Status),
		Location:     item.Location,
		ThumbnailURL: item.ThumbnailURL,
		StartsAt:     item.StartsAt.UTC().Format(time.RFC3339),
		Participants: make([]MeetingTargetView, 0),
		Broadcasts:   make([]MeetingTargetView, 0),
	}
	if item.LocationKind != nil {
		kind := string(*item.LocationKind)
		view.LocationKind = &kind
	}
	if item.EndsAt != nil {
		value := item.EndsAt.UTC().Format(time.RFC3339)
		view.EndsAt = &value
	}
	if item.CancelledAt != nil {
		value := item.CancelledAt.UTC().Format(time.RFC3339)
		view.CancelledAt = &value
	}
	for _, target := range item.Targets {
		entry := MeetingTargetView{
			Type:  string(target.TargetType),
			Label: target.Label,
		}
		if target.TargetType == domain.TargetTypeUser && target.UserID != nil {
			entry.ID = target.UserID.String()
		}
		if target.TargetType == domain.TargetTypeGroup && target.GroupID != nil {
			entry.ID = target.GroupID.String()
		}
		if target.Role == domain.TargetRoleBroadcast {
			view.Broadcasts = append(view.Broadcasts, entry)
		} else {
			view.Participants = append(view.Participants, entry)
		}
	}
	return view
}

func trimPtr(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
