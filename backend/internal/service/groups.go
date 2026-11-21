package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"trygiraffes/backend/internal/domain"
	"trygiraffes/backend/internal/store"
)

type GroupService struct {
	store *store.Store
	auth  *AuthService
}

func NewGroupService(st *store.Store, auth *AuthService) *GroupService {
	return &GroupService{store: st, auth: auth}
}

type GroupSummaryView struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	MemberCount  int      `json:"member_count"`
	MemberLabels []string `json:"member_labels"`
}

type GroupMemberView struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

type GroupDetailView struct {
	ID      string            `json:"id"`
	Name    string            `json:"name"`
	Members []GroupMemberView `json:"members"`
}

func (s *GroupService) List(ctx context.Context, rawToken string) ([]GroupSummaryView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return nil, err
	}
	items, err := s.store.ListGroups(ctx, user.AMCID)
	if err != nil {
		return nil, err
	}
	out := make([]GroupSummaryView, 0, len(items))
	for _, item := range items {
		out = append(out, GroupSummaryView{
			ID:           item.ID.String(),
			Name:         item.Name,
			MemberCount:  item.MemberCount,
			MemberLabels: item.MemberLabels,
		})
	}
	return out, nil
}

func (s *GroupService) Get(ctx context.Context, rawToken, groupID string) (GroupDetailView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return GroupDetailView{}, err
	}
	id, err := uuid.Parse(groupID)
	if err != nil {
		return GroupDetailView{}, fmt.Errorf("%w: invalid group id", ErrValidation)
	}
	item, err := s.store.GetGroup(ctx, user.AMCID, id)
	if err == store.ErrNotFound {
		return GroupDetailView{}, store.ErrNotFound
	}
	if err != nil {
		return GroupDetailView{}, err
	}
	return toGroupDetailView(item), nil
}

func (s *GroupService) Create(ctx context.Context, rawToken, name string, memberIDs []string) (GroupDetailView, error) {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return GroupDetailView{}, err
	}
	name = strings.TrimSpace(name)
	if name == "" {
		return GroupDetailView{}, fmt.Errorf("%w: name is required", ErrValidation)
	}
	ids := make([]uuid.UUID, 0, len(memberIDs))
	for _, raw := range memberIDs {
		id, err := uuid.Parse(strings.TrimSpace(raw))
		if err != nil {
			return GroupDetailView{}, fmt.Errorf("%w: invalid member id", ErrValidation)
		}
		ok, err := s.store.UserBelongsToAMC(ctx, id, user.AMCID)
		if err != nil {
			return GroupDetailView{}, err
		}
		if !ok {
			return GroupDetailView{}, fmt.Errorf("%w: member was not found", ErrValidation)
		}
		ids = append(ids, id)
	}
	item, err := s.store.CreateGroup(ctx, user.AMCID, user.ID, name, ids)
	if err == store.ErrConflict {
		return GroupDetailView{}, fmt.Errorf("%w: a group with this name already exists", ErrValidation)
	}
	if err != nil {
		return GroupDetailView{}, err
	}
	return toGroupDetailView(item), nil
}

func (s *GroupService) Delete(ctx context.Context, rawToken, groupID string) error {
	user, err := s.auth.Authenticate(ctx, rawToken)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(groupID)
	if err != nil {
		return fmt.Errorf("%w: invalid group id", ErrValidation)
	}
	err = s.store.DeleteGroup(ctx, user.AMCID, id)
	if err == store.ErrNotFound {
		return store.ErrNotFound
	}
	return err
}

func toGroupDetailView(item domain.GroupDetail) GroupDetailView {
	out := GroupDetailView{
		ID:      item.ID.String(),
		Name:    item.Name,
		Members: make([]GroupMemberView, 0, len(item.Members)),
	}
	for _, member := range item.Members {
		out.Members = append(out.Members, GroupMemberView{
			ID:       member.ID.String(),
			Email:    member.Email,
			FullName: member.FullName,
		})
	}
	return out
}
