package service

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/prefeiturario/painel-social/internal/domain"
)

type AuthServicer interface {
	Login(email, password string) (string, error)
	ValidateToken(tokenStr string) (jwt.MapClaims, error)
}

type ChildServicer interface {
	List(params domain.ChildListParams) (*domain.ChildListResult, error)
	GetByID(id string) (*domain.Child, error)
	MarkReviewed(id, reviewer string) error
	Summary() (*domain.Summary, error)
}
