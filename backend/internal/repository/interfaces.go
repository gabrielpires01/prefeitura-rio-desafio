package repository

import "github.com/prefeiturario/painel-social/internal/domain"

type ChildRepositorier interface {
	List(params domain.ChildListParams) (*domain.ChildListResult, error)
	GetByID(id string) (*domain.Child, error)
	MarkReviewed(id, reviewer string) error
	Summary() (*domain.Summary, error)
}

type UserRepositorier interface {
	FindByEmail(email string) (*domain.User, error)
	Create(user *domain.User) error
	List() ([]domain.User, error)
	GetByID(id string) (*domain.User, error)
	Update(user *domain.User) error
	Delete(id string) error
}
