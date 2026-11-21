package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"trygiraffes/backend/internal/domain"
)

func (s *Store) ListGroups(ctx context.Context, amcID uuid.UUID) ([]domain.GroupSummary, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT g.id, g.name, COUNT(gm.user_id)::int
		FROM groups g
		LEFT JOIN group_members gm ON gm.group_id = g.id
		WHERE g.amc_id = $1
		GROUP BY g.id, g.name
		ORDER BY g.name
	`, amcID)
	if err != nil {
		return nil, fmt.Errorf("list groups: %w", err)
	}
	defer rows.Close()

	out := make([]domain.GroupSummary, 0)
	ids := make([]uuid.UUID, 0)
	for rows.Next() {
		var item domain.GroupSummary
		if err := rows.Scan(&item.ID, &item.Name, &item.MemberCount); err != nil {
			return nil, fmt.Errorf("scan group: %w", err)
		}
		item.MemberLabels = []string{}
		out = append(out, item)
		ids = append(ids, item.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	labels, err := s.groupMemberLabels(ctx, ids)
	if err != nil {
		return nil, err
	}
	for i := range out {
		if names, ok := labels[out[i].ID]; ok {
			out[i].MemberLabels = names
		}
	}
	return out, nil
}

func (s *Store) GetGroup(ctx context.Context, amcID, groupID uuid.UUID) (domain.GroupDetail, error) {
	var item domain.GroupDetail
	err := s.db.QueryRowContext(ctx, `
		SELECT id, name FROM groups WHERE id = $1 AND amc_id = $2
	`, groupID, amcID).Scan(&item.ID, &item.Name)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.GroupDetail{}, ErrNotFound
	}
	if err != nil {
		return domain.GroupDetail{}, fmt.Errorf("get group: %w", err)
	}

	rows, err := s.db.QueryContext(ctx, `
		SELECT u.id, u.email, COALESCE(NULLIF(u.full_name, ''), u.email)
		FROM group_members gm
		INNER JOIN users u ON u.id = gm.user_id
		WHERE gm.group_id = $1
		ORDER BY COALESCE(NULLIF(u.full_name, ''), u.email)
	`, groupID)
	if err != nil {
		return domain.GroupDetail{}, fmt.Errorf("list group members: %w", err)
	}
	defer rows.Close()

	item.Members = make([]domain.GroupMember, 0)
	for rows.Next() {
		var member domain.GroupMember
		if err := rows.Scan(&member.ID, &member.Email, &member.FullName); err != nil {
			return domain.GroupDetail{}, fmt.Errorf("scan group member: %w", err)
		}
		item.Members = append(item.Members, member)
	}
	return item, rows.Err()
}

func (s *Store) CreateGroup(ctx context.Context, amcID, createdBy uuid.UUID, name string, memberIDs []uuid.UUID) (domain.GroupDetail, error) {
	name = strings.TrimSpace(name)
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.GroupDetail{}, err
	}
	defer func() { _ = tx.Rollback() }()

	var groupID uuid.UUID
	err = tx.QueryRowContext(ctx, `
		INSERT INTO groups (amc_id, name, created_by)
		VALUES ($1, $2, $3)
		RETURNING id
	`, amcID, name, createdBy).Scan(&groupID)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.GroupDetail{}, ErrConflict
		}
		return domain.GroupDetail{}, fmt.Errorf("create group: %w", err)
	}

	for _, memberID := range memberIDs {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO group_members (group_id, user_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, groupID, memberID); err != nil {
			return domain.GroupDetail{}, fmt.Errorf("add group member: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return domain.GroupDetail{}, err
	}
	return s.GetGroup(ctx, amcID, groupID)
}

func (s *Store) DeleteGroup(ctx context.Context, amcID, groupID uuid.UUID) error {
	result, err := s.db.ExecContext(ctx, `
		DELETE FROM groups WHERE id = $1 AND amc_id = $2
	`, groupID, amcID)
	if err != nil {
		return fmt.Errorf("delete group: %w", err)
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

func (s *Store) groupMemberLabels(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID][]string, error) {
	out := make(map[uuid.UUID][]string, len(ids))
	if len(ids) == 0 {
		return out, nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}
	rows, err := s.db.QueryContext(ctx, fmt.Sprintf(`
		SELECT gm.group_id, COALESCE(NULLIF(u.full_name, ''), u.email)
		FROM group_members gm
		INNER JOIN users u ON u.id = gm.user_id
		WHERE gm.group_id IN (%s)
		ORDER BY gm.created_at ASC
	`, strings.Join(placeholders, ",")), args...)
	if err != nil {
		return nil, fmt.Errorf("group member labels: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var groupID uuid.UUID
		var label string
		if err := rows.Scan(&groupID, &label); err != nil {
			return nil, err
		}
		list := out[groupID]
		if len(list) < 4 {
			out[groupID] = append(list, label)
		}
	}
	return out, rows.Err()
}
