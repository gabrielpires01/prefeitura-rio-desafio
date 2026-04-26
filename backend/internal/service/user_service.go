package service

import (
	"github.com/prefeiturario/painel-social/internal/domain"
	"github.com/prefeiturario/painel-social/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo repository.UserRepositorier
}

func NewUserService(repo repository.UserRepositorier) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) CreateUser(fullName, email, password string) (*domain.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user := &domain.User{
		FullName:     fullName,
		Email:        email,
		PasswordHash: string(hash),
	}
	if err := s.repo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) ListUsers() ([]domain.User, error) {
	return s.repo.List()
}

func (s *UserService) GetUser(id string) (*domain.User, error) {
	return s.repo.GetByID(id)
}

func (s *UserService) UpdateUser(id, fullName, email string) (*domain.User, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	user.FullName = fullName
	user.Email = email
	if err := s.repo.Update(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) ChangePassword(id, newPassword string) error {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.PasswordHash = string(hash)
	return s.repo.Update(user)
}

func (s *UserService) DeleteUser(id string) error {
	return s.repo.Delete(id)
}
