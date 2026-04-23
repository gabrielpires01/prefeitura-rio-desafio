package service

import (
	"database/sql"
	"errors"

	"gorm.io/gorm"

	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/repository"
)

var ErrNotFound = errors.New("não encontrado")

type ChildService struct {
	repo *repository.ChildRepository
}

func NewChildService(repo *repository.ChildRepository) *ChildService {
	return &ChildService{repo: repo}
}

func (s *ChildService) List(params domain.ChildListParams) (*domain.ChildListResult, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 || params.PageSize > 100 {
		params.PageSize = 20
	}
	return s.repo.List(params)
}

func (s *ChildService) GetByID(id string) (*domain.Child, error) {
	c, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, ErrNotFound
	}
	return c, nil
}

func (s *ChildService) MarkReviewed(id, reviewer string) error {
	err := s.repo.MarkReviewed(id, reviewer)
	if errors.Is(err, sql.ErrNoRows) || errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	return err
}

func (s *ChildService) Summary() (*domain.Summary, error) {
	return s.repo.Summary()
}
