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

var (
	ErrNotFound     = errors.New("not found")
	ErrConflict     = errors.New("conflict")
	ErrInvalidInput = errors.New("invalid input")
)

type Store struct {
	db *sql.DB
}

func New(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) ListAMCs(ctx context.Context) ([]domain.AMC, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, code, created_at FROM amcs ORDER BY code`)
	if err != nil {
		return nil, fmt.Errorf("list amcs: %w", err)
	}
	defer rows.Close()

	out := make([]domain.AMC, 0)
	for rows.Next() {
		var item domain.AMC
		if err := rows.Scan(&item.ID, &item.Code, &item.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan amc: %w", err)
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) FindAMCByCode(ctx context.Context, code string) (domain.AMC, error) {
	var item domain.AMC
	err := s.db.QueryRowContext(ctx,
		`SELECT id, code, created_at FROM amcs WHERE code = $1`,
		code,
	).Scan(&item.ID, &item.Code, &item.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.AMC{}, ErrNotFound
	}
	if err != nil {
		return domain.AMC{}, fmt.Errorf("find amc: %w", err)
	}
	return item, nil
}

func (s *Store) CreateUser(ctx context.Context, email, passwordHash string, amcID uuid.UUID) (domain.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	var user domain.User
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO users (email, password_hash, amc_id)
		VALUES ($1, $2, $3)
		RETURNING id, email, COALESCE(full_name, ''), password_hash, pin_hash, amc_id, created_at, updated_at
	`, email, passwordHash, amcID).Scan(
		&user.ID, &user.Email, &user.FullName, &user.PasswordHash, &user.PinHash, &user.AMCID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.User{}, ErrConflict
		}
		return domain.User{}, fmt.Errorf("create user: %w", err)
	}
	return user, nil
}

func (s *Store) FindUserByEmailAndAMC(ctx context.Context, email, amcCode string) (domain.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	var user domain.User
	err := s.db.QueryRowContext(ctx, `
		SELECT u.id, u.email, COALESCE(u.full_name, ''), u.password_hash, u.pin_hash, u.amc_id, a.code, u.created_at, u.updated_at
		FROM users u
		INNER JOIN amcs a ON a.id = u.amc_id
		WHERE u.email = $1 AND a.code = $2
	`, email, amcCode).Scan(
		&user.ID, &user.Email, &user.FullName, &user.PasswordHash, &user.PinHash, &user.AMCID, &user.AMCCode, &user.CreatedAt, &user.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.User{}, ErrNotFound
	}
	if err != nil {
		return domain.User{}, fmt.Errorf("find user: %w", err)
	}
	return user, nil
}

func (s *Store) FindUserByID(ctx context.Context, id uuid.UUID) (domain.User, error) {
	var user domain.User
	err := s.db.QueryRowContext(ctx, `
		SELECT u.id, u.email, COALESCE(u.full_name, ''), u.password_hash, u.pin_hash, u.amc_id, a.code, u.created_at, u.updated_at
		FROM users u
		INNER JOIN amcs a ON a.id = u.amc_id
		WHERE u.id = $1
	`, id).Scan(
		&user.ID, &user.Email, &user.FullName, &user.PasswordHash, &user.PinHash, &user.AMCID, &user.AMCCode, &user.CreatedAt, &user.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.User{}, ErrNotFound
	}
	if err != nil {
		return domain.User{}, fmt.Errorf("find user by id: %w", err)
	}
	return user, nil
}

func (s *Store) SetUserPIN(ctx context.Context, userID uuid.UUID, pinHash string) error {
	result, err := s.db.ExecContext(ctx, `
		UPDATE users
		SET pin_hash = $2, updated_at = now()
		WHERE id = $1
	`, userID, pinHash)
	if err != nil {
		return fmt.Errorf("set pin: %w", err)
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

func (s *Store) CreateSession(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) (domain.Session, error) {
	var session domain.Session
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO sessions (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id, user_id, token_hash, expires_at, created_at, revoked_at
	`, userID, tokenHash, expiresAt).Scan(
		&session.ID, &session.UserID, &session.TokenHash, &session.ExpiresAt, &session.CreatedAt, &session.RevokedAt,
	)
	if err != nil {
		return domain.Session{}, fmt.Errorf("create session: %w", err)
	}
	return session, nil
}

func (s *Store) FindValidSessionByTokenHash(ctx context.Context, tokenHash string, now time.Time) (domain.Session, error) {
	var session domain.Session
	err := s.db.QueryRowContext(ctx, `
		SELECT id, user_id, token_hash, expires_at, created_at, revoked_at
		FROM sessions
		WHERE token_hash = $1
		  AND revoked_at IS NULL
		  AND expires_at > $2
	`, tokenHash, now).Scan(
		&session.ID, &session.UserID, &session.TokenHash, &session.ExpiresAt, &session.CreatedAt, &session.RevokedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Session{}, ErrNotFound
	}
	if err != nil {
		return domain.Session{}, fmt.Errorf("find session: %w", err)
	}
	return session, nil
}

func (s *Store) RevokeSession(ctx context.Context, tokenHash string, now time.Time) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE sessions
		SET revoked_at = $2
		WHERE token_hash = $1 AND revoked_at IS NULL
	`, tokenHash, now)
	if err != nil {
		return fmt.Errorf("revoke session: %w", err)
	}
	return nil
}

func (s *Store) UpsertAttendance(ctx context.Context, userID uuid.UUID, day time.Time, status domain.AttendanceStatus) (domain.Attendance, error) {
	var item domain.Attendance
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO attendance (user_id, day, status)
		VALUES ($1, $2::date, $3)
		ON CONFLICT (user_id, day)
		DO UPDATE SET status = EXCLUDED.status
		RETURNING id, user_id, day, status, created_at
	`, userID, day.Format("2006-01-02"), string(status)).Scan(
		&item.ID, &item.UserID, &item.Day, &item.Status, &item.CreatedAt,
	)
	if err != nil {
		return domain.Attendance{}, fmt.Errorf("upsert attendance: %w", err)
	}
	return item, nil
}

func (s *Store) FindAttendanceForDay(ctx context.Context, userID uuid.UUID, day time.Time) (domain.Attendance, error) {
	var item domain.Attendance
	err := s.db.QueryRowContext(ctx, `
		SELECT id, user_id, day, status, created_at
		FROM attendance
		WHERE user_id = $1 AND day = $2::date
	`, userID, day.Format("2006-01-02")).Scan(
		&item.ID, &item.UserID, &item.Day, &item.Status, &item.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Attendance{}, ErrNotFound
	}
	if err != nil {
		return domain.Attendance{}, fmt.Errorf("find attendance: %w", err)
	}
	return item, nil
}

func isUniqueViolation(err error) bool {
	return strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint")
}
