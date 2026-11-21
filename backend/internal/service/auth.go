package service

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"strings"
	"time"

	"trygiraffes/backend/internal/authcrypto"
	"trygiraffes/backend/internal/config"
	"trygiraffes/backend/internal/domain"
	"trygiraffes/backend/internal/store"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailTaken         = errors.New("email taken")
	ErrAMCNotFound        = errors.New("amc not found")
	ErrValidation         = errors.New("validation")
	ErrUnauthorized       = errors.New("unauthorized")
)

var pinPattern = regexp.MustCompile(`^\d{4}$`)

type AuthService struct {
	store  *store.Store
	config config.Config
	now    func() time.Time
}

type AuthResult struct {
	User  domain.User
	Token string
	Next  string
}

type UserView struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	AMCCode string `json:"amc_code"`
	HasPIN  bool   `json:"has_pin"`
}

func NewAuthService(st *store.Store, cfg config.Config) *AuthService {
	return &AuthService{
		store:  st,
		config: cfg,
		now:    time.Now,
	}
}

func (s *AuthService) ListAMCs(ctx context.Context) ([]domain.AMC, error) {
	return s.store.ListAMCs(ctx)
}

func (s *AuthService) Signup(ctx context.Context, email, password, amcCode string) (AuthResult, error) {
	email, password, amcCode, err := normalizeCredentials(email, password, amcCode)
	if err != nil {
		return AuthResult{}, err
	}
	if len(password) < 8 {
		return AuthResult{}, fmt.Errorf("%w: password must be at least 8 characters", ErrValidation)
	}

	amc, err := s.store.FindAMCByCode(ctx, amcCode)
	if errors.Is(err, store.ErrNotFound) {
		return AuthResult{}, ErrAMCNotFound
	}
	if err != nil {
		return AuthResult{}, err
	}

	passwordHash, err := authcrypto.HashPassword(password)
	if err != nil {
		return AuthResult{}, err
	}

	user, err := s.store.CreateUser(ctx, email, passwordHash, amc.ID)
	if errors.Is(err, store.ErrConflict) {
		return AuthResult{}, ErrEmailTaken
	}
	if err != nil {
		return AuthResult{}, err
	}
	user.AMCCode = amc.Code

	return s.issueSession(ctx, user)
}

func (s *AuthService) Login(ctx context.Context, email, password, amcCode string) (AuthResult, error) {
	email, password, amcCode, err := normalizeCredentials(email, password, amcCode)
	if err != nil {
		return AuthResult{}, err
	}

	user, err := s.store.FindUserByEmailAndAMC(ctx, email, amcCode)
	if errors.Is(err, store.ErrNotFound) {
		return AuthResult{}, ErrInvalidCredentials
	}
	if err != nil {
		return AuthResult{}, err
	}
	if !authcrypto.CheckPassword(user.PasswordHash, password) {
		return AuthResult{}, ErrInvalidCredentials
	}

	return s.issueSession(ctx, user)
}

func (s *AuthService) Logout(ctx context.Context, rawToken string) error {
	if rawToken == "" {
		return nil
	}
	return s.store.RevokeSession(ctx, authcrypto.HashToken(rawToken), s.now().UTC())
}

func (s *AuthService) CurrentUser(ctx context.Context, rawToken string) (domain.User, string, error) {
	user, _, err := s.authenticate(ctx, rawToken)
	if err != nil {
		return domain.User{}, "", err
	}
	next, err := s.nextStep(ctx, user)
	if err != nil {
		return domain.User{}, "", err
	}
	return user, next, nil
}

func (s *AuthService) SetPIN(ctx context.Context, rawToken, pin, confirmPIN string) (AuthResult, error) {
	user, _, err := s.authenticate(ctx, rawToken)
	if err != nil {
		return AuthResult{}, err
	}
	if !pinPattern.MatchString(pin) {
		return AuthResult{}, fmt.Errorf("%w: pin must be exactly 4 digits", ErrValidation)
	}
	if pin != confirmPIN {
		return AuthResult{}, fmt.Errorf("%w: pin confirmation does not match", ErrValidation)
	}

	pinHash, err := authcrypto.HashPIN(pin)
	if err != nil {
		return AuthResult{}, err
	}
	if err := s.store.SetUserPIN(ctx, user.ID, pinHash); err != nil {
		return AuthResult{}, err
	}
	user.PinHash = &pinHash
	next, err := s.nextStep(ctx, user)
	if err != nil {
		return AuthResult{}, err
	}
	return AuthResult{User: user, Next: next}, nil
}

func (s *AuthService) Authenticate(ctx context.Context, rawToken string) (domain.User, error) {
	user, _, err := s.authenticate(ctx, rawToken)
	return user, err
}

func (s *AuthService) issueSession(ctx context.Context, user domain.User) (AuthResult, error) {
	raw, hash, err := authcrypto.NewSessionToken()
	if err != nil {
		return AuthResult{}, err
	}
	expiresAt := s.now().UTC().Add(s.config.SessionTTL)
	if _, err := s.store.CreateSession(ctx, user.ID, hash, expiresAt); err != nil {
		return AuthResult{}, err
	}
	next, err := s.nextStep(ctx, user)
	if err != nil {
		return AuthResult{}, err
	}
	return AuthResult{User: user, Token: raw, Next: next}, nil
}

func (s *AuthService) authenticate(ctx context.Context, rawToken string) (domain.User, domain.Session, error) {
	if rawToken == "" {
		return domain.User{}, domain.Session{}, ErrUnauthorized
	}
	session, err := s.store.FindValidSessionByTokenHash(ctx, authcrypto.HashToken(rawToken), s.now().UTC())
	if errors.Is(err, store.ErrNotFound) {
		return domain.User{}, domain.Session{}, ErrUnauthorized
	}
	if err != nil {
		return domain.User{}, domain.Session{}, err
	}
	user, err := s.store.FindUserByID(ctx, session.UserID)
	if errors.Is(err, store.ErrNotFound) {
		return domain.User{}, domain.Session{}, ErrUnauthorized
	}
	if err != nil {
		return domain.User{}, domain.Session{}, err
	}
	return user, session, nil
}

func (s *AuthService) nextStep(ctx context.Context, user domain.User) (string, error) {
	if !user.HasPIN() {
		return domain.NextSetPIN, nil
	}
	_, err := s.store.FindAttendanceForDay(ctx, user.ID, startOfDay(s.now()))
	if errors.Is(err, store.ErrNotFound) {
		return domain.NextMarkPresent, nil
	}
	if err != nil {
		return "", err
	}
	return domain.NextDashboard, nil
}

func ToUserView(user domain.User) UserView {
	return UserView{
		ID:      user.ID.String(),
		Email:   user.Email,
		AMCCode: user.AMCCode,
		HasPIN:  user.HasPIN(),
	}
}

func normalizeCredentials(email, password, amcCode string) (string, string, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	password = strings.TrimSpace(password)
	amcCode = strings.TrimSpace(amcCode)
	if email == "" || password == "" || amcCode == "" {
		return "", "", "", fmt.Errorf("%w: email, password, and amc are required", ErrValidation)
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return "", "", "", fmt.Errorf("%w: email is invalid", ErrValidation)
	}
	return email, password, amcCode, nil
}

func startOfDay(t time.Time) time.Time {
	local := t.In(time.Local)
	return time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, time.Local)
}
