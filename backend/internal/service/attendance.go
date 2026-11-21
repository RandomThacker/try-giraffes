package service

import (
	"context"
	"fmt"

	"trygiraffes/backend/internal/domain"
	"trygiraffes/backend/internal/store"
)

type AttendanceService struct {
	store *store.Store
	auth  *AuthService
}

func NewAttendanceService(st *store.Store, auth *AuthService) *AttendanceService {
	return &AttendanceService{store: st, auth: auth}
}

func (s *AttendanceService) MarkToday(ctx context.Context, rawToken string, status domain.AttendanceStatus) (domain.Attendance, string, error) {
	if status != domain.AttendancePresent && status != domain.AttendanceAbsent {
		return domain.Attendance{}, "", fmt.Errorf("%w: status must be present or absent", ErrValidation)
	}

	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return domain.Attendance{}, "", err
	}
	if !user.HasPIN() {
		return domain.Attendance{}, "", fmt.Errorf("%w: pin must be set before marking attendance", ErrValidation)
	}

	item, err := s.store.UpsertAttendance(ctx, user.ID, startOfDay(s.auth.now()), status)
	if err != nil {
		return domain.Attendance{}, "", err
	}
	return item, domain.NextDashboard, nil
}

func (s *AttendanceService) Today(ctx context.Context, rawToken string) (*domain.Attendance, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	item, err := s.store.FindAttendanceForDay(ctx, user.ID, startOfDay(s.auth.now()))
	if err == store.ErrNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}
