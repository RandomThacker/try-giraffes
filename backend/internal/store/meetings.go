package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"trygiraffes/backend/internal/domain"
)

type MeetingListFilter struct {
	AMCID       uuid.UUID
	Tab         string // today | upcoming | all
	MeetingType string // one_to_one | one_to_many | empty
	Now         time.Time
}

type CreateMeetingInput struct {
	CreatedBy    uuid.UUID
	AMCID        uuid.UUID
	Title        string
	Description  string
	ARN          string
	Mode         domain.MeetingMode
	MeetingType  domain.MeetingType
	Purpose      domain.MeetingPurpose
	Status       domain.MeetingStatus
	Location     *string
	LocationKind *domain.LocationKind
	StartsAt     time.Time
	EndsAt       *time.Time
	ThumbnailURL *string
	Participants []TargetRef
	Broadcasts   []TargetRef
}

type TargetRef struct {
	Type domain.TargetType
	ID   uuid.UUID
}

type RescheduleInput struct {
	MeetingID    uuid.UUID
	ByUserID     uuid.UUID
	Message      string
	StartsAt     time.Time
	Location     *string
	LocationKind *domain.LocationKind
}

type FeedbackInput struct {
	MeetingID          uuid.UUID
	SubmittedBy        uuid.UUID
	AboutProduct       *string
	AboutBrand         *string
	AboutPricing       *string
	AnyConcern         *string
	LookingForSpecific *string
	TalkedAbout        *string
	Skipped            bool
}

func (s *Store) ListDirectoryUsers(ctx context.Context, amcID uuid.UUID) ([]domain.DirectoryUser, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, email, COALESCE(full_name, '')
		FROM users
		WHERE amc_id = $1
		ORDER BY COALESCE(NULLIF(full_name, ''), email)
	`, amcID)
	if err != nil {
		return nil, fmt.Errorf("list directory users: %w", err)
	}
	defer rows.Close()

	out := make([]domain.DirectoryUser, 0)
	for rows.Next() {
		var item domain.DirectoryUser
		if err := rows.Scan(&item.ID, &item.Email, &item.FullName); err != nil {
			return nil, fmt.Errorf("scan directory user: %w", err)
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) ListDirectoryGroups(ctx context.Context, amcID uuid.UUID) ([]domain.DirectoryGroup, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT g.id, g.name, COUNT(gm.user_id)::int
		FROM groups g
		LEFT JOIN group_members gm ON gm.group_id = g.id
		WHERE g.amc_id = $1
		GROUP BY g.id, g.name
		ORDER BY g.name
	`, amcID)
	if err != nil {
		return nil, fmt.Errorf("list directory groups: %w", err)
	}
	defer rows.Close()

	out := make([]domain.DirectoryGroup, 0)
	for rows.Next() {
		var item domain.DirectoryGroup
		if err := rows.Scan(&item.ID, &item.Name, &item.MemberCount); err != nil {
			return nil, fmt.Errorf("scan directory group: %w", err)
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) ListMeetings(ctx context.Context, filter MeetingListFilter) ([]domain.Meeting, error) {
	args := []any{filter.AMCID}
	var b strings.Builder
	b.WriteString(`
		SELECT id, created_by, amc_id, title, description, arn, mode, meeting_type, purpose, status,
		       location, location_kind, starts_at, ends_at, thumbnail_url, cancelled_at, created_at, updated_at
		FROM meetings
		WHERE amc_id = $1
	`)

	day := filter.Now.In(time.Local)
	start := time.Date(day.Year(), day.Month(), day.Day(), 0, 0, 0, 0, time.Local)
	end := start.Add(24 * time.Hour)

	switch filter.Tab {
	case "today":
		// Include same-day slots and any in-progress/instant meetings.
		args = append(args, start, end)
		fmt.Fprintf(
			&b,
			` AND ((starts_at >= $%d AND starts_at < $%d) OR status = 'started' OR mode = 'instant')`,
			len(args)-1,
			len(args),
		)
	case "upcoming":
		args = append(args, end)
		fmt.Fprintf(&b, ` AND starts_at >= $%d AND status <> 'started' AND mode <> 'instant'`, len(args))
	}

	if filter.MeetingType == string(domain.MeetingTypeOneToOne) || filter.MeetingType == string(domain.MeetingTypeOneToMany) {
		args = append(args, filter.MeetingType)
		fmt.Fprintf(&b, ` AND meeting_type = $%d`, len(args))
	}

	b.WriteString(` ORDER BY starts_at ASC, created_at ASC`)

	rows, err := s.db.QueryContext(ctx, b.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("list meetings: %w", err)
	}
	defer rows.Close()

	meetings := make([]domain.Meeting, 0)
	ids := make([]uuid.UUID, 0)
	for rows.Next() {
		item, err := scanMeeting(rows)
		if err != nil {
			return nil, err
		}
		meetings = append(meetings, item)
		ids = append(ids, item.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	targetsByMeeting, err := s.listTargetsForMeetings(ctx, ids)
	if err != nil {
		return nil, err
	}
	for i := range meetings {
		meetings[i].Targets = targetsByMeeting[meetings[i].ID]
	}
	return meetings, nil
}

func (s *Store) FindMeetingByID(ctx context.Context, id uuid.UUID) (domain.Meeting, error) {
	row := s.db.QueryRowContext(ctx, `
		SELECT id, created_by, amc_id, title, description, arn, mode, meeting_type, purpose, status,
		       location, location_kind, starts_at, ends_at, thumbnail_url, cancelled_at, created_at, updated_at
		FROM meetings
		WHERE id = $1
	`, id)
	item, err := scanMeeting(row)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Meeting{}, ErrNotFound
	}
	if err != nil {
		return domain.Meeting{}, fmt.Errorf("find meeting: %w", err)
	}
	targets, err := s.listTargetsForMeetings(ctx, []uuid.UUID{id})
	if err != nil {
		return domain.Meeting{}, err
	}
	item.Targets = targets[id]
	return item, nil
}

func (s *Store) CreateMeeting(ctx context.Context, input CreateMeetingInput) (domain.Meeting, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.Meeting{}, fmt.Errorf("begin create meeting: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	var item domain.Meeting
	err = tx.QueryRowContext(ctx, `
		INSERT INTO meetings (
			created_by, amc_id, title, description, arn, mode, meeting_type, purpose, status,
			location, location_kind, starts_at, ends_at, thumbnail_url
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
		RETURNING id, created_by, amc_id, title, description, arn, mode, meeting_type, purpose, status,
		          location, location_kind, starts_at, ends_at, thumbnail_url, cancelled_at, created_at, updated_at
	`,
		input.CreatedBy, input.AMCID, input.Title, input.Description, input.ARN,
		string(input.Mode), string(input.MeetingType), string(input.Purpose), string(input.Status),
		input.Location, locationKindPtr(input.LocationKind), input.StartsAt, input.EndsAt, input.ThumbnailURL,
	).Scan(
		&item.ID, &item.CreatedBy, &item.AMCID, &item.Title, &item.Description, &item.ARN,
		&item.Mode, &item.MeetingType, &item.Purpose, &item.Status,
		&item.Location, &item.LocationKind, &item.StartsAt, &item.EndsAt, &item.ThumbnailURL,
		&item.CancelledAt, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return domain.Meeting{}, fmt.Errorf("insert meeting: %w", err)
	}

	all := make([]struct {
		role domain.TargetRole
		ref  TargetRef
	}, 0, len(input.Participants)+len(input.Broadcasts))
	for _, ref := range input.Participants {
		all = append(all, struct {
			role domain.TargetRole
			ref  TargetRef
		}{role: domain.TargetRoleParticipant, ref: ref})
	}
	for _, ref := range input.Broadcasts {
		all = append(all, struct {
			role domain.TargetRole
			ref  TargetRef
		}{role: domain.TargetRoleBroadcast, ref: ref})
	}

	for _, entry := range all {
		var userID, groupID any
		switch entry.ref.Type {
		case domain.TargetTypeUser:
			userID = entry.ref.ID
			groupID = nil
		case domain.TargetTypeGroup:
			userID = nil
			groupID = entry.ref.ID
		default:
			return domain.Meeting{}, ErrInvalidInput
		}
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO meeting_targets (meeting_id, role, target_type, user_id, group_id)
			VALUES ($1, $2, $3, $4, $5)
		`, item.ID, string(entry.role), string(entry.ref.Type), userID, groupID); err != nil {
			return domain.Meeting{}, fmt.Errorf("insert meeting target: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return domain.Meeting{}, fmt.Errorf("commit create meeting: %w", err)
	}
	return s.FindMeetingByID(ctx, item.ID)
}

func (s *Store) CancelMeeting(ctx context.Context, meetingID, byUserID uuid.UUID, reason string, now time.Time) (domain.Meeting, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.Meeting{}, fmt.Errorf("begin cancel meeting: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	result, err := tx.ExecContext(ctx, `
		UPDATE meetings
		SET status = 'cancelled', cancelled_at = $2, updated_at = $2
		WHERE id = $1 AND status <> 'cancelled'
	`, meetingID, now)
	if err != nil {
		return domain.Meeting{}, fmt.Errorf("cancel meeting: %w", err)
	}
	n, err := result.RowsAffected()
	if err != nil {
		return domain.Meeting{}, err
	}
	if n == 0 {
		return domain.Meeting{}, ErrNotFound
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO meeting_cancellations (meeting_id, cancelled_by, reason)
		VALUES ($1, $2, $3)
		ON CONFLICT (meeting_id) DO UPDATE
		SET cancelled_by = EXCLUDED.cancelled_by, reason = EXCLUDED.reason, created_at = now()
	`, meetingID, byUserID, reason); err != nil {
		return domain.Meeting{}, fmt.Errorf("insert cancellation: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return domain.Meeting{}, fmt.Errorf("commit cancel meeting: %w", err)
	}
	return s.FindMeetingByID(ctx, meetingID)
}

func (s *Store) RescheduleMeeting(ctx context.Context, input RescheduleInput) (domain.Meeting, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.Meeting{}, fmt.Errorf("begin reschedule: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	var current domain.Meeting
	err = tx.QueryRowContext(ctx, `
		SELECT id, starts_at, location, location_kind, status
		FROM meetings
		WHERE id = $1
		FOR UPDATE
	`, input.MeetingID).Scan(&current.ID, &current.StartsAt, &current.Location, &current.LocationKind, &current.Status)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Meeting{}, ErrNotFound
	}
	if err != nil {
		return domain.Meeting{}, fmt.Errorf("load meeting for reschedule: %w", err)
	}
	if current.Status == domain.MeetingStatusCancelled {
		return domain.Meeting{}, ErrConflict
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO meeting_reschedules (
			meeting_id, rescheduled_by, message,
			previous_starts_at, new_starts_at,
			previous_location, new_location,
			previous_location_kind, new_location_kind
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
	`,
		input.MeetingID, input.ByUserID, input.Message,
		current.StartsAt, input.StartsAt,
		current.Location, input.Location,
		locationKindPtr(current.LocationKind), locationKindPtr(input.LocationKind),
	); err != nil {
		return domain.Meeting{}, fmt.Errorf("insert reschedule: %w", err)
	}

	if _, err := tx.ExecContext(ctx, `
		UPDATE meetings
		SET starts_at = $2, location = $3, location_kind = $4, updated_at = now()
		WHERE id = $1
	`, input.MeetingID, input.StartsAt, input.Location, locationKindPtr(input.LocationKind)); err != nil {
		return domain.Meeting{}, fmt.Errorf("update meeting reschedule: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return domain.Meeting{}, fmt.Errorf("commit reschedule: %w", err)
	}
	return s.FindMeetingByID(ctx, input.MeetingID)
}

func (s *Store) SubmitMeetingFeedback(ctx context.Context, input FeedbackInput) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO meeting_feedback (
			meeting_id, submitted_by, about_product, about_brand, about_pricing,
			any_concern, looking_for_specific, talked_about, skipped
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		ON CONFLICT (meeting_id) DO UPDATE SET
			submitted_by = EXCLUDED.submitted_by,
			about_product = EXCLUDED.about_product,
			about_brand = EXCLUDED.about_brand,
			about_pricing = EXCLUDED.about_pricing,
			any_concern = EXCLUDED.any_concern,
			looking_for_specific = EXCLUDED.looking_for_specific,
			talked_about = EXCLUDED.talked_about,
			skipped = EXCLUDED.skipped,
			submitted_at = now()
	`,
		input.MeetingID, input.SubmittedBy, input.AboutProduct, input.AboutBrand, input.AboutPricing,
		input.AnyConcern, input.LookingForSpecific, input.TalkedAbout, input.Skipped,
	)
	if err != nil {
		return fmt.Errorf("submit feedback: %w", err)
	}
	return nil
}

func (s *Store) UserBelongsToAMC(ctx context.Context, userID, amcID uuid.UUID) (bool, error) {
	var exists bool
	err := s.db.QueryRowContext(ctx, `
		SELECT EXISTS(SELECT 1 FROM users WHERE id = $1 AND amc_id = $2)
	`, userID, amcID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("user belongs to amc: %w", err)
	}
	return exists, nil
}

func (s *Store) GroupBelongsToAMC(ctx context.Context, groupID, amcID uuid.UUID) (bool, error) {
	var exists bool
	err := s.db.QueryRowContext(ctx, `
		SELECT EXISTS(SELECT 1 FROM groups WHERE id = $1 AND amc_id = $2)
	`, groupID, amcID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("group belongs to amc: %w", err)
	}
	return exists, nil
}

type scannable interface {
	Scan(dest ...any) error
}

func scanMeeting(row scannable) (domain.Meeting, error) {
	var item domain.Meeting
	var locationKind sql.NullString
	err := row.Scan(
		&item.ID, &item.CreatedBy, &item.AMCID, &item.Title, &item.Description, &item.ARN,
		&item.Mode, &item.MeetingType, &item.Purpose, &item.Status,
		&item.Location, &locationKind, &item.StartsAt, &item.EndsAt, &item.ThumbnailURL,
		&item.CancelledAt, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return domain.Meeting{}, err
	}
	if locationKind.Valid {
		kind := domain.LocationKind(locationKind.String)
		item.LocationKind = &kind
	}
	return item, nil
}

func (s *Store) listTargetsForMeetings(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID][]domain.MeetingTarget, error) {
	out := make(map[uuid.UUID][]domain.MeetingTarget, len(ids))
	if len(ids) == 0 {
		return out, nil
	}

	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(`
		SELECT mt.id, mt.meeting_id, mt.role, mt.target_type, mt.user_id, mt.group_id, mt.created_at,
		       COALESCE(NULLIF(u.full_name, ''), u.email, g.name, '')
		FROM meeting_targets mt
		LEFT JOIN users u ON u.id = mt.user_id
		LEFT JOIN groups g ON g.id = mt.group_id
		WHERE mt.meeting_id IN (%s)
		ORDER BY mt.created_at ASC
	`, strings.Join(placeholders, ","))

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list meeting targets: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item domain.MeetingTarget
		if err := rows.Scan(
			&item.ID, &item.MeetingID, &item.Role, &item.TargetType, &item.UserID, &item.GroupID, &item.CreatedAt, &item.Label,
		); err != nil {
			return nil, fmt.Errorf("scan meeting target: %w", err)
		}
		out[item.MeetingID] = append(out[item.MeetingID], item)
	}
	return out, rows.Err()
}

func locationKindPtr(kind *domain.LocationKind) any {
	if kind == nil {
		return nil
	}
	return string(*kind)
}
