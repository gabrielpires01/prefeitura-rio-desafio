package repository

import "github.com/prefeiturario/painel-social/internal/domain"

type ChildRepositorier interface {
	List(params domain.ChildListParams) (*domain.ChildListResult, error)
	GetByID(id string) (*domain.Child, error)
	MarkReviewed(id, reviewer string) error
	Summary() (*domain.Summary, error)
}
